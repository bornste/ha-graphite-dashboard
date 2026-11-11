// graphite-calendar: events of one or more calendar entities, grouped by day ("Heute", "Morgen",
// "Fr 6. Nov."). Color and icon per calendar, optionally overridden by keyword rules on the title;
// highlighted events (e.g. exams) get a tint and "in n Tagen". Tapping an event opens its details,
// holding opens the more-info dialog of its calendar.
//
// Three layouts: "list" (rows with icon, second line and time column), "compact" (one block per
// day, one line per event, made for school calendars with many all-day entries) and "tiles" (two
// tiles: the events of today, from day_switch on of the next day, and when the next highlighted
// event is, e.g. the next exam). With range "week"
// the card shows a fixed calendar week (current or next) that can switch to the following week
// before the weekend (week_rollover), with its own header ("Diese Woche | 9.–13. November").
import { html, nothing } from "lit";
import { attachActionHandler, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { addDays, calendarEvents, daysBetween, startOfDay, type CalendarEvent } from "../../core/calendar";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
import { calendarStyles } from "./calendar-styles";
import { GraphiteCalendarEditor } from "./graphite-calendar-editor";
import "./graphite-calendar-event";

export interface CalendarSource {
  entity: string;
  name?: string;
  color?: string;
  icon?: string;
  highlight?: boolean;
}

export interface CalendarRule {
  // only a label for the list in the editor, not used by the card
  name?: string;
  starts_with?: string;
  contains?: string;
  // the title contains at least one of these words / all of them
  contains_any?: string[];
  contains_all?: string[];
  color?: string;
  icon?: string;
  highlight?: boolean;
}

export type CalendarRange = "today" | "this_week" | "this_and_next_week" | "days" | "week";
export type CalendarSecondary = "calendar_location" | "calendar" | "location" | "description" | "none";
export type CalendarLayout = "list" | "compact" | "tiles";

export interface CalendarConfig extends GraphiteCardConfig {
  calendars: Array<string | CalendarSource>;
  layout?: CalendarLayout;
  range?: CalendarRange;
  days?: number;
  // range "week": which week, and when the following week takes over (e.g. "sat 00:00")
  week?: "current" | "next";
  week_rollover?: string;
  // compact layout: Monday to Friday are always shown, the weekend only with events
  weekdays?: boolean;
  title?: string;
  // tiles layout: watermark of the day tile, name of the highlight tile and the time from which the
  // day tile shows the next day ("15:00")
  icon?: string;
  highlight_name?: string;
  day_switch?: string;
  max_items?: number;
  show_past_today?: boolean;
  rules?: CalendarRule[];
  highlight_days?: number;
  secondary?: CalendarSecondary;
  empty_text?: string;
  hide_empty?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

interface ShownEvent extends CalendarEvent {
  day: Date;
  color: string;
  icon: string;
  calendarName: string;
  past: boolean;
  running: boolean;
  highlight: boolean;
  multiDay: boolean;
  // color set by a keyword rule (compact: the title takes the color)
  ruled: boolean;
  // color set by a rule or the calendar (compact: colored dot, otherwise a muted one)
  colored: boolean;
}

// shown time span: start and end (exclusive) and, for range "week", the week shown
interface Period {
  start: Date;
  end: Date;
  week?: { monday: Date; rolled: boolean; next: boolean };
}

const refreshInterval = 60 * 1000;
const defaultIcon = "mdi:calendar-blank-outline";
const lineBreak = String.fromCharCode(10);
const weekdayNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export class GraphiteCalendar extends GraphiteCard<CalendarConfig> {
  static styles = calendarStyles;

  private detachActions?: () => void;
  private refreshTimer?: number;
  private pressedIndex = -1;
  private pointerUsed = false;
  private shown: ShownEvent[] = [];

  protected normalizeConfig(config: CalendarConfig): CalendarConfig {
    const calendars = config.calendars ?? (config.entity ? [config.entity] : []);
    if (!Array.isArray(calendars) || calendars.length === 0) throw new Error(`${this.localName}: 'calendars' is required`);
    return { layout: "list", range: "this_and_next_week", show_past_today: true, secondary: "calendar_location", highlight_days: 7,
      tap_action: { action: "more-info" }, hold_action: { action: "more-info" }, ...config, calendars };
  }

  private sources(): CalendarSource[] {
    return this.config!.calendars.map((source) => (typeof source === "string" ? { entity: source } : source))
      .filter((source) => !!source?.entity);
  }

  protected watchedEntities(): string[] {
    return this.sources().map((source) => source.entity);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // the event row under the pointer, read when the gesture is recognized
    this.addEventListener("pointerdown", this.rememberRow, true);
    this.detachActions = attachActionHandler(this, {
      hasHold: () => (this.isTiles || this.pressedIndex >= 0) && hasAction(this.config?.hold_action),
      hasDoubleTap: () => false,
    }, (action: ActionKind) => this.handleAction(action));
    // past / running events, the day change and the week rollover happen without state changes
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), refreshInterval);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("pointerdown", this.rememberRow, true);
    this.detachActions?.();
    this.detachActions = undefined;
    window.clearInterval(this.refreshTimer);
  }

  private rememberRow = (event: PointerEvent) => {
    const row = event.composedPath().find((element) => element instanceof HTMLElement && element.dataset.index !== undefined);
    this.pressedIndex = row instanceof HTMLElement ? Number(row.dataset.index) : -1;
    this.pointerUsed = true;
  };

  private handleAction(action: ActionKind): void {
    const config = this.config;
    let index = this.pressedIndex;
    // keyboard: the focused row
    const focused = this.shadowRoot?.activeElement;
    if (!this.pointerUsed && focused instanceof HTMLElement && focused.dataset.index !== undefined) index = Number(focused.dataset.index);
    const event = this.shown[index];
    this.pressedIndex = -1;
    this.pointerUsed = false;
    if (config && this.isTiles) {
      // both tiles are one button: actions run on the first calendar
      fireAction(this, { ...config, entity: this.sources()[0]?.entity }, action);
      return;
    }
    if (!config || !event) return;
    const actionConfig = config[`${action}_action`] as ActionConfig | undefined;
    if (!hasAction(actionConfig)) return;
    // more-info on an event shows its details; other actions run as configured, on the event's calendar
    if (action === "tap" && actionConfig!.action === "more-info") {
      this.openDetails(event);
      return;
    }
    fireAction(this, { ...config, entity: event.entityId }, action);
  }

  private get isTiles(): boolean {
    return this.config?.layout === "tiles";
  }

  // details in a graphite-dialog above everything (also above a dialog the calendar sits in)
  private openDetails(event: ShownEvent): void {
    const lastDay = this.lastDay(event);
    let when: string;
    if (event.allDay) {
      when = event.multiDay ? `${this.longDate(event.start)} – ${this.longDate(lastDay)}` : `${this.longDate(event.start)}, ${this.localize("calendar.allDay")}`;
    } else if (event.multiDay) {
      when = `${this.longDate(event.start)} ${this.time(event.start)} – ${this.longDate(event.end)} ${this.time(event.end)}`;
    } else {
      when = `${this.longDate(event.start)}, ${this.time(event.start)}–${this.time(event.end)}`;
    }
    window.graphiteDialogLayer?.openDetached({
      type: "custom:graphite-dialog",
      hash: "#calendar-event",
      title: event.summary,
      width: "420px",
      cards: [{
        type: "custom:graphite-calendar-event",
        details: { when, calendar: event.calendarName, icon: event.icon, color: event.color, location: event.location, description: event.description },
      }],
    });
  }

  // end (exclusive) of the ranges that start today
  private rangeEnd(today: Date): Date {
    const config = this.config!;
    // days to the next Monday (weeks start on Monday)
    const toMonday = ((8 - today.getDay()) % 7) || 7;
    if (config.range === "today") return addDays(today, 1);
    if (config.range === "this_week") return addDays(today, toMonday);
    if (config.range === "days") return addDays(today, Math.max(1, Math.round(Number(config.days) || 14)));
    return addDays(today, toMonday + 7);
  }

  // moment of the configured rollover in the week of this Monday ("sat 00:00" = night to Saturday)
  private rolloverMoment(monday: Date): Date | undefined {
    const value = String(this.config!.week_rollover ?? "").trim().toLowerCase();
    if (!value || value === "none") return undefined;
    const [dayPart, timePart = "00:00"] = value.split(" ").filter(Boolean);
    const dayIndex = weekdayNames.indexOf(dayPart.slice(0, 3));
    if (dayIndex < 0) return undefined;
    const [hours, minutes] = timePart.split(":").map(Number);
    const moment = addDays(monday, dayIndex);
    moment.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0);
    return moment;
  }

  private period(now: Date): Period {
    const config = this.config!;
    const today = startOfDay(now);
    // tiles: today, the next (school) days and the highlight horizon
    if (config.layout === "tiles") return { start: today, end: addDays(today, Math.max(8, this.highlightDays() + 1)) };
    if (config.range !== "week") return { start: today, end: this.rangeEnd(today) };
    let monday = addDays(today, -((today.getDay() + 6) % 7));
    const rollover = this.rolloverMoment(monday);
    const rolled = !!rollover && now.getTime() >= rollover.getTime();
    if (rolled) monday = addDays(monday, 7);
    const next = config.week === "next";
    if (next) monday = addDays(monday, 7);
    return { start: monday, end: addDays(monday, 7), week: { monday, rolled, next } };
  }

  private highlightDays(): number {
    const days = Number(this.config!.highlight_days);
    return Number.isFinite(days) ? days : 7;
  }

  // a rule matches when every criterion it sets matches (case-insensitive, no regular expressions)
  private matchRule(summary: string): CalendarRule | undefined {
    const title = summary.toLocaleLowerCase();
    const includes = (word: unknown) => title.includes(String(word).toLocaleLowerCase());
    const asList = (value: unknown) => (Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]);
    return (this.config!.rules ?? []).find((rule) => {
      const anyWords = asList(rule.contains_any);
      const allWords = asList(rule.contains_all);
      const checks = [
        rule.starts_with ? title.startsWith(String(rule.starts_with).toLocaleLowerCase()) : undefined,
        rule.contains ? includes(rule.contains) : undefined,
        anyWords.length ? anyWords.some(includes) : undefined,
        allWords.length ? allWords.every(includes) : undefined,
      ].filter((check): check is boolean => check !== undefined);
      return checks.length > 0 && checks.every(Boolean);
    });
  }

  // all events of the period, decorated and sorted; undefined while nothing is loaded yet
  private collect(start: Date, end: Date, today: Date): ShownEvent[] | undefined {
    const config = this.config!;
    const now = new Date();
    const highlightDays = this.highlightDays();
    let loaded = false;
    const events: ShownEvent[] = [];
    for (const source of this.sources()) {
      const list = this.hass ? calendarEvents(this.hass, source.entity, start, end, () => this.requestUpdate()) : undefined;
      if (!list) continue;
      loaded = true;
      const stateObj = this.hass?.states[source.entity];
      const calendarName = source.name ?? stateObj?.attributes?.friendly_name ?? source.entity;
      for (const event of list) {
        if (event.end.getTime() <= start.getTime() || event.start.getTime() >= end.getTime()) continue;
        const day = event.start.getTime() < start.getTime() ? start : startOfDay(event.start);
        const past = event.end.getTime() <= now.getTime();
        // show_past_today only drops today's finished events; earlier days of a week stay (dimmed)
        if (past && !config.show_past_today && day.getTime() >= today.getTime()) continue;
        const rule = this.matchRule(event.summary);
        const daysAhead = daysBetween(today, day);
        const lastDay = event.allDay ? addDays(event.end, -1) : event.end;
        events.push({
          ...event,
          day,
          color: rule?.color ?? source.color ?? "var(--graphite-accent)",
          icon: rule?.icon ?? source.icon ?? stateObj?.attributes?.icon ?? defaultIcon,
          calendarName,
          past,
          running: !past && !event.allDay && event.start.getTime() <= now.getTime(),
          highlight: !past && !!(rule?.highlight ?? source.highlight) && daysAhead <= highlightDays,
          multiDay: daysBetween(event.start, lastDay) > 0,
          ruled: !!rule?.color,
          colored: !!(rule?.color ?? source.color),
        });
      }
    }
    if (!loaded) return undefined;
    // per day: timed events by time, then all-day events
    return events.sort((first, second) => first.day.getTime() - second.day.getTime()
      || Number(first.allDay) - Number(second.allDay)
      || first.start.getTime() - second.start.getTime()
      || first.summary.localeCompare(second.summary));
  }

  private time(date: Date): string {
    return date.toLocaleTimeString(this.language, { hour: "2-digit", minute: "2-digit" });
  }

  private weekday(date: Date): string {
    return date.toLocaleDateString(this.language, { weekday: "short" }).replace(".", "");
  }

  private date(date: Date): string {
    return date.toLocaleDateString(this.language, { day: "numeric", month: "short" });
  }

  // "Fr 13. Nov."
  private longDate(date: Date): string {
    return `${this.weekday(date)} ${this.date(date)}`;
  }

  // "9.–13. November", "30. November – 4. Dezember"
  private dateRange(from: Date, to: Date): string {
    const format = new Intl.DateTimeFormat(this.language, { day: "numeric", month: "long" }) as Intl.DateTimeFormat
      & { formatRange?: (startDate: Date, endDate: Date) => string };
    if (from.getTime() === to.getTime()) return format.format(from);
    return format.formatRange ? format.formatRange(from, to) : `${format.format(from)} – ${format.format(to)}`;
  }

  private lastDay(event: CalendarEvent): Date {
    return event.allDay ? addDays(event.end, -1) : event.end;
  }

  // header like the panel header: title | date range; automatic for range "week"
  private renderHeader(period: Period, events: ShownEvent[]) {
    const config = this.config!;
    const week = period.week;
    if (!week && !config.title) return nothing;
    let title = config.title ?? "";
    let info = "";
    if (week) {
      if (!config.title) {
        const key = week.rolled ? (week.next ? "inTwoWeeks" : "fromMonday") : (week.next ? "nextWeekTitle" : "thisWeek");
        title = this.localize(`calendar.${key}`);
      }
      // Monday to Friday, longer when the weekend has events
      const lastEventDay = events.reduce((last, event) => Math.max(last, event.day.getTime()), 0);
      const friday = addDays(week.monday, 4);
      info = this.dateRange(week.monday, lastEventDay > friday.getTime() ? new Date(lastEventDay) : friday);
    }
    return html`<div class="header"><span class="title">${title}</span><span class="info">${info}</span></div>`;
  }

  private renderDayHeader(day: Date, today: Date, nextMonday: Date, isFirst: boolean, marksNextWeek: boolean) {
    const offset = daysBetween(today, day);
    // day headers spell weekday and month out ("Dienstag 10. November")
    const weekday = day.toLocaleDateString(this.language, { weekday: "long" });
    const date = day.toLocaleDateString(this.language, { day: "numeric", month: "long" });
    const label = offset === 0 ? this.localize("calendar.today") : offset === 1 ? this.localize("calendar.tomorrow") : weekday;
    const rest = offset === 0 || offset === 1 ? `${weekday} ${date}` : date;
    const nextWeek = marksNextWeek && day.getTime() >= nextMonday.getTime();
    return html`<div class=${["day", isFirst ? "first" : "", offset === 0 ? "today" : ""].filter(Boolean).join(" ")}><b>${label}</b>
      ${rest}${nextWeek ? html`<span>· ${this.localize("calendar.nextWeek")}</span>` : nothing}</div>`;
  }

  private secondaryText(event: ShownEvent): string {
    const mode = this.config!.secondary;
    const parts: string[] = [];
    if (mode === "calendar" || mode === "calendar_location") parts.push(event.calendarName);
    if ((mode === "location" || mode === "calendar_location") && event.location) parts.push(event.location);
    if (mode === "description" && event.description) parts.push(event.description.split(lineBreak)[0]);
    if (mode !== "none" && event.multiDay) parts.push(this.localize("calendar.until", { date: this.longDate(this.lastDay(event)) }));
    return parts.join(" · ");
  }

  private renderWhen(event: ShownEvent, today: Date) {
    let hint = "";
    if (event.past) hint = this.localize("calendar.past");
    else if (event.highlight) {
      const days = daysBetween(today, event.day);
      if (days === 1) hint = this.localize("calendar.inOneDay");
      else if (days > 1) hint = this.localize("calendar.inDays", { days });
    }
    let main;
    if (event.multiDay) {
      main = this.localize("calendar.days", { days: daysBetween(event.start, this.lastDay(event)) + 1 });
    } else if (event.allDay) {
      main = this.localize("calendar.allDay");
    } else {
      // start and end when there is room (no hint below), otherwise the start only
      const range = !hint && event.end.getTime() > event.start.getTime() ? `${this.time(event.start)}–${this.time(event.end)}` : this.time(event.start);
      main = html`<span class="time">${range}</span>`;
    }
    return html`<div class="when">${main}${hint ? html`<span class="hint">${hint}</span>` : nothing}</div>`;
  }

  // events react to tap or hold only when an action is set (tap_action and hold_action "none": static rows)
  private get interactive(): boolean {
    return hasAction(this.config?.tap_action) || hasAction(this.config?.hold_action);
  }

  // small note icon for events with a description
  private noteIcon(event: CalendarEvent) {
    return event.description?.trim() ? html`<ha-icon class="note" icon="mdi:text-box"></ha-icon>` : nothing;
  }

  private renderEvent(event: ShownEvent, index: number, today: Date) {
    const secondary = this.secondaryText(event);
    const interactive = this.interactive;
    const classes = ["event", event.past ? "past" : "", event.running ? "running" : "", event.highlight ? "highlight" : "",
      interactive ? "" : "static"].filter(Boolean).join(" ");
    return html`<div class=${classes} style=${`--event-color: ${event.color}`} data-index=${index} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing} aria-label=${event.summary}><div class="icon"><ha-icon .icon=${event.icon}></ha-icon></div><div class="text"><div
      class="nameRow"><span class="name">${event.summary}</span>${this.noteIcon(event)}</div>${secondary ? html`<div class="sub">${secondary}</div>` : nothing}</div>${this.renderWhen(event, today)}</div>`;
  }

  private renderList(today: Date) {
    const nextMonday = addDays(today, ((8 - today.getDay()) % 7) || 7);
    const marksNextWeek = this.shown.some((event) => event.day.getTime() < nextMonday.getTime());
    const groups: Array<{ day: Date; items: Array<{ event: ShownEvent; index: number }> }> = [];
    this.shown.forEach((event, index) => {
      const last = groups[groups.length - 1];
      if (last && last.day.getTime() === event.day.getTime()) last.items.push({ event, index });
      else groups.push({ day: event.day, items: [{ event, index }] });
    });
    let markedNextWeek = false;
    return groups.map((group, groupIndex) => {
      const marks = marksNextWeek && !markedNextWeek && group.day.getTime() >= nextMonday.getTime();
      if (marks) markedNextWeek = true;
      return html`${this.renderDayHeader(group.day, today, nextMonday, groupIndex === 0, marks)}<div class="list">${group.items
        .map((item) => this.renderEvent(item.event, item.index, today))}</div>`;
    });
  }

  // compact: one line per event; the time only for timed events, rule-colored titles first
  private renderCompactItem(event: ShownEvent, index: number) {
    const interactive = this.interactive;
    const classes = ["item", event.ruled || event.highlight ? "ruled" : "", event.past ? "past" : "", interactive ? "" : "static"]
      .filter(Boolean).join(" ");
    const style = event.colored || event.highlight ? `--event-color: ${event.color}` : "";
    const until = event.multiDay ? this.localize("calendar.until", { date: this.weekday(this.lastDay(event)) }) : "";
    return html`<div class=${classes} style=${style} data-index=${index} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing}>${event.allDay
      ? nothing : html`<span class="time">${this.time(event.start)}</span>`}${event.summary}${this.noteIcon(event)}${until
      ? html`<span class="until">· ${until}</span>` : nothing}</div>`;
  }

  private renderCompact(period: Period, today: Date) {
    const byDay = new Map<number, Array<{ event: ShownEvent; index: number }>>();
    this.shown.forEach((event, index) => {
      const key = event.day.getTime();
      byDay.set(key, [...(byDay.get(key) ?? []), { event, index }]);
    });
    const days: Date[] = [];
    for (let day = period.start; day.getTime() < period.end.getTime(); day = addDays(day, 1)) {
      const weekend = day.getDay() === 0 || day.getDay() === 6;
      if (byDay.has(day.getTime()) || (this.config!.weekdays && !weekend)) days.push(day);
    }
    return html`<div class="days">${days.map((day) => {
      const items = [...(byDay.get(day.getTime()) ?? [])]
        .sort((first, second) => Number(second.event.ruled) - Number(first.event.ruled) || first.index - second.index);
      const offset = daysBetween(today, day);
      const classes = ["compactDay", offset === 0 ? "today" : "", offset < 0 ? "past" : ""].filter(Boolean).join(" ");
      return html`<div class=${classes}><div class="date"><span>${day.getDate()}</span><b>${this.weekday(day)}</b></div><div class="items">${items.length
        ? items.map((item) => this.renderCompactItem(item.event, item.index))
        : html`<div class="none">–</div>`}</div></div>`;
    })}</div>`;
  }

  // minutes after midnight of "hh:mm"; undefined without a valid time
  private daySwitchMinutes(): number | undefined {
    const value = String(this.config!.day_switch ?? "").trim();
    if (!value) return undefined;
    const [hours, minutes = 0] = value.split(":").map(Number);
    return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : undefined;
  }

  // next day after this one; with weekdays the weekend is skipped (Friday: Monday)
  private followingDay(day: Date): Date {
    let next = addDays(day, 1);
    const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    for (let step = 0; step < 7 && this.config!.weekdays && weekend(next); step++) next = addDays(next, 1);
    return next;
  }

  // "Heute", "Morgen" or the weekday
  private dayName(day: Date, today: Date): string {
    const offset = daysBetween(today, day);
    if (offset === 0) return this.localize("calendar.today");
    if (offset === 1) return this.localize("calendar.tomorrow");
    return day.toLocaleDateString(this.language, { weekday: "long" });
  }

  // subject of an event: the first word of the title ("MU: LZK Instrumentenkunde" -> "MU")
  private subject(title: string): string {
    return title.split(":")[0].trim().split(" ")[0];
  }

  // tiles: the day tile (events of today, from day_switch on of the next day) and the highlight tile
  // (when the next highlighted event is; tinted when it is today or tomorrow)
  private renderTiles(now: Date, today: Date) {
    const config = this.config!;
    const events = this.shown;
    const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const switchMinutes = this.daySwitchMinutes();
    const switched = switchMinutes !== undefined && now.getHours() * 60 + now.getMinutes() >= switchMinutes;
    // the day shown: today, after the switch (or on a free weekend day) the next (school) day
    let day = today;
    const count = (date: Date) => events.filter((event) => event.day.getTime() === date.getTime()).length;
    if (switched || (config.weekdays && weekend(today) && count(today) === 0)) day = this.followingDay(today);
    const following = this.followingDay(day);
    const dayCount = count(day);
    const followingCount = count(following);
    const followingName = daysBetween(today, following) === 1
      ? this.localize("calendar.tomorrow").toLocaleLowerCase(this.language)
      : following.toLocaleDateString(this.language, { weekday: "short" }).replace(".", "");

    const upcoming = events.find((event) => event.highlight && event.day.getTime() >= today.getTime());
    let highlightValue = this.localize("calendar.noneValue");
    let highlightSecondary = this.localize("calendar.daysShort", { days: this.highlightDays() });
    let alert = false;
    if (upcoming) {
      const days = daysBetween(today, upcoming.day);
      highlightValue = days <= 0 ? this.localize("calendar.whenToday") : days === 1 ? this.localize("calendar.whenTomorrow")
        : this.localize("calendar.inDays", { days });
      highlightSecondary = this.subject(upcoming.summary);
      alert = days <= 1;
    }

    const interactive = this.interactive;
    const icon = config.icon ?? this.hass?.states[this.sources()[0]?.entity ?? ""]?.attributes?.icon ?? defaultIcon;
    const tileClass = (extra: string) => ["tile", extra, interactive ? "interactive" : ""].filter(Boolean).join(" ");
    const tile = (classes: string, style: string, content: unknown) => html`<div class=${classes} style=${style}
      role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}>${interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${content}</div>`;
    return html`<div class="tiles">${tile(tileClass(""), "", html`<div class="tileName">${this.dayName(day, today)}</div><ha-icon
      class="tileIcon" .icon=${icon}></ha-icon><div class="tileRow"><div class="tileValue">${dayCount}<span
      class="tileUnit">${this.localize(dayCount === 1 ? "calendar.eventOne" : "calendar.eventMany")}</span></div><div
      class="tileSecondary">${followingName} ${followingCount}</div></div>`)}${tile(tileClass(alert ? "alert" : ""),
      upcoming ? `--event-color: ${upcoming.color}` : "", html`<div class="tileName">${config.highlight_name
      ?? this.localize("calendar.highlightName")}</div><div class="tileRow"><div class="tileValue word">${highlightValue}</div><div
      class="tileSecondary">${highlightSecondary}</div></div>`)}</div>`;
  }

  protected render() {
    const config = this.config!;
    const now = new Date();
    const today = startOfDay(now);
    const period = this.period(now);
    const lastRangeDay = this.longDate(addDays(period.end, -1));
    const events = this.collect(period.start, period.end, today);
    const limit = Number(config.max_items) > 0 && config.layout !== "tiles" ? Math.round(Number(config.max_items)) : Infinity;
    this.shown = (events ?? []).slice(0, limit);
    const hiddenCount = (events?.length ?? 0) - this.shown.length;
    const compact = config.layout === "compact";
    // the compact layout with weekdays always has days to show
    const isEmpty = !!events && events.length === 0 && !(compact && config.weekdays) && !this.isTiles;
    this.toggleAttribute("hidden-empty", isEmpty && !!config.hide_empty);
    if (!events) return html`${this.renderHeader(period, [])}`;
    if (this.isTiles) return html`${this.renderTiles(now, today)}`;
    const header = this.renderHeader(period, events);
    if (isEmpty) {
      const text = config.empty_text ?? this.localize("calendar.empty", { date: lastRangeDay });
      return html`${header}<div class="empty"><div class="icon"><ha-icon icon="mdi:check-circle"></ha-icon></div>${text}</div>`;
    }
    return html`${header}${compact ? this.renderCompact(period, today) : this.renderList(today)}${hiddenCount > 0
      ? html`<div class="more">${this.localize("calendar.more", { count: hiddenCount, date: lastRangeDay })}</div>`
      : nothing}`;
  }

  getCardSize(): number {
    return this.isTiles ? 2 : Math.max(2, this.shown.length + 1);
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const calendars = Object.keys(hass?.states ?? {}).filter((id) => id.startsWith("calendar.")).slice(0, 1);
    return { calendars, range: "this_and_next_week", max_items: 10 };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-calendar-editor");
  }
}

registerElement("graphite-calendar-editor", GraphiteCalendarEditor);
registerCard("graphite-calendar", GraphiteCalendar, {
  name: "Graphite Calendar",
  description: "Events of one or more calendars, grouped by day, as a list or compact week, with color and icon per calendar or keyword.",
});
