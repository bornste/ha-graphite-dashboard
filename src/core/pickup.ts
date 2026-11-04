// Waste collection: the next collection day of a calendar entity. Events come from the calendar API
// (shared cache, refreshed every 30 minutes); until they are loaded, the start_time attribute of the
// entity is used.
import type { HomeAssistant } from "./types";

export interface NextPickup {
  date: Date;
  days: number;
}

interface CacheEntry {
  days?: Date[];
  day?: number;
  fetchedAt: number;
  pending?: Promise<void>;
}

const cache: Record<string, CacheEntry> = {};
const refreshMs = 30 * 60 * 1000;
const dayMs = 86400000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayFromDateString(value: string): Date | null {
  const parts = String(value).substring(0, 10).split("-").map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
}

function eventDay(start: any): Date | null {
  if (!start) return null;
  if (start.date) return dayFromDateString(start.date);
  const time = new Date(start.dateTime ?? start);
  return Number.isNaN(time.getTime()) ? null : startOfDay(time);
}

// loads the collection days (once per entity and 30 minutes); onLoaded is called when fresh days arrive
function loadDays(hass: HomeAssistant, entityId: string, lookaheadDays: number, onLoaded: () => void): Date[] | undefined {
  const today = startOfDay(new Date());
  const entry = cache[entityId];
  const isFresh = entry && entry.day === today.getTime() && Date.now() - entry.fetchedAt < refreshMs;
  const api: any = hass;
  if (entry?.pending) {
    entry.pending.then(onLoaded);
  } else if (!isFresh && api.callApi) {
    const end = new Date(today.getTime() + lookaheadDays * dayMs);
    const pending: Promise<void> = api
      .callApi("GET", `calendars/${entityId}?start=${encodeURIComponent(today.toISOString())}&end=${encodeURIComponent(end.toISOString())}`)
      .then((events: Array<{ start: unknown }>) => {
        const days = (Array.isArray(events) ? events : []).map((event) => eventDay(event.start)).filter((day): day is Date => !!day);
        cache[entityId] = { days, day: today.getTime(), fetchedAt: Date.now() };
      })
      .catch(() => {
        cache[entityId] = { days: entry?.days, day: today.getTime(), fetchedAt: Date.now() };
      });
    cache[entityId] = { days: entry?.days, day: entry?.day, fetchedAt: entry?.fetchedAt ?? 0, pending };
    pending.then(onLoaded);
  }
  return cache[entityId]?.days;
}

// the next collection or null; a collection of today counts as done after dropAfter (HH:MM, default 12:00)
export function nextPickup(hass: HomeAssistant, entityId: string, lookaheadDays: number, dropAfter: string | undefined,
  onLoaded: () => void): NextPickup | null {
  const now = new Date();
  const today = startOfDay(now);
  const [dropHours, dropMinutes] = String(dropAfter ?? "12:00").split(":").map(Number);
  const dropTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), dropHours || 0, dropMinutes || 0);
  let candidates = loadDays(hass, entityId, lookaheadDays, onLoaded);
  if (!candidates) {
    const start = hass.states[entityId]?.attributes?.start_time;
    const startDay = start ? dayFromDateString(start) : null;
    candidates = startDay ? [startDay] : [];
  }
  let next: NextPickup | null = null;
  for (const date of candidates) {
    const days = Math.round((date.getTime() - today.getTime()) / dayMs);
    if (days < 0 || (days === 0 && now >= dropTime)) continue;
    if (!next || days < next.days) next = { date, days };
  }
  return next;
}
