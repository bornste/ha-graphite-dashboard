// Calendar events of one or more calendar entities from the calendar API, cached per entity and
// time range (5 minutes), normalized to start/end dates with an all-day flag.
import type { HomeAssistant } from "./types";

export interface CalendarEvent {
  entityId: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  // exclusive end (all-day events: midnight after the last day)
  end: Date;
  allDay: boolean;
}

interface CacheEntry {
  events?: CalendarEvent[];
  fetchedAt: number;
  pending?: Promise<void>;
}

const cache: Record<string, CacheEntry> = {};
const refreshMs = 5 * 60 * 1000;
export const dayMs = 86400000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// whole days between two midnights (robust against daylight saving changes)
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayMs);
}

function parseDate(value: string): Date | null {
  const parts = String(value).substring(0, 10).split("-").map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
}

function parseMoment(value: any): { date: Date; allDay: boolean } | null {
  if (!value) return null;
  if (typeof value === "object" && value.date) {
    const date = parseDate(value.date);
    return date ? { date, allDay: true } : null;
  }
  const raw = typeof value === "object" ? value.dateTime : value;
  // a plain date string without a time is an all-day value as well
  if (typeof raw === "string" && raw.length === 10) {
    const date = parseDate(raw);
    return date ? { date, allDay: true } : null;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : { date, allDay: false };
}

function toEvent(entityId: string, raw: any): CalendarEvent | null {
  const start = parseMoment(raw?.start);
  if (!start) return null;
  const end = parseMoment(raw?.end);
  const fallbackEnd = start.allDay ? addDays(start.date, 1) : start.date;
  const endDate = end && end.date.getTime() > start.date.getTime() ? end.date : fallbackEnd;
  return {
    entityId,
    summary: String(raw.summary ?? ""),
    description: raw.description || undefined,
    location: raw.location || undefined,
    start: start.date,
    end: endDate,
    allDay: start.allDay,
  };
}

// events of an entity between start and end; undefined until the first answer arrives,
// onLoaded is called when fresh events are there
export function calendarEvents(hass: HomeAssistant, entityId: string, start: Date, end: Date,
  onLoaded: () => void): CalendarEvent[] | undefined {
  const key = `${entityId}|${start.getTime()}|${end.getTime()}`;
  const entry = cache[key];
  const api: any = hass;
  const isFresh = entry && Date.now() - entry.fetchedAt < refreshMs;
  if (entry?.pending) {
    entry.pending.then(onLoaded);
  } else if (!isFresh && api.callApi) {
    const path = `calendars/${entityId}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
    const pending: Promise<void> = api.callApi("GET", path)
      .then((events: unknown[]) => {
        const list = (Array.isArray(events) ? events : []).map((event) => toEvent(entityId, event))
          .filter((event): event is CalendarEvent => !!event);
        cache[key] = { events: list, fetchedAt: Date.now() };
      })
      .catch(() => {
        cache[key] = { events: entry?.events ?? [], fetchedAt: Date.now() };
      });
    cache[key] = { events: entry?.events, fetchedAt: entry?.fetchedAt ?? 0, pending };
    pending.then(onLoaded);
  }
  return cache[key]?.events;
}
