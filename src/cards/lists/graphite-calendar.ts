// graphite-calendar: events of one or more calendar entities as a list, grouped by day ("Heute",
// "Morgen", "Fr 6. Nov."). Color and icon per calendar, optionally overridden by keyword rules on the
// title; highlighted events (e.g. exams) get a tint and "in n Tagen". Tapping an event opens its
// details, holding opens the more-info dialog of its calendar.
import { html, nothing } from "lit";
import { attachActionHandler, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { addDays, calendarEvents, daysBetween, startOfDay, type CalendarEvent } from "../../core/calendar";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
import { calendarStyles } from "./calendar-styles";
import { GraphiteCalendarEditor } from "./graphite-calendar-editor";

export interface CalendarSource {
  entity: string;
  name?: string;
  color?: string;
  icon?: string;
  highlight?: boolean;
}

export interface CalendarRule {
  starts_with?: string;
  contains?: string;
  color?: string;
  icon?: string;
  highlight?: boolean;
}

export type CalendarRange = "today" | "this_week" | "this_and_next_week" | "days";
export type CalendarSecondary = "calendar_location" | "calendar" | "location" | "description" | "none";

export interface CalendarConfig extends GraphiteCardConfig {
  calendars: Array<string | CalendarSource>;
  range?: CalendarRange;
  days?: number;
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
}

const refreshInterval = 60 * 1000;
const defaultIcon = "mdi:calendar-blank-outline";
const lineBreak = String.fromCharCode(10);

export class GraphiteCalendar extends GraphiteCard<CalendarConfig> {
  static styles = calendarStyles;

  private detachActions?: () => void;
  private refreshTimer?: number;
  private pressedIndex = -1;
  private pointerUsed = false;
  private shown: ShownEvent[] = [];
  private selected?: ShownEvent;

  protected normalizeConfig(config: CalendarConfig): CalendarConfig {
    const calendars = config.calendars ?? (config.entity ? [config.entity] : []);
    if (!Array.isArray(calendars) || calendars.length === 0) throw new Error(`${this.localName}: 'calendars' is required`);
    return { range: "this_and_next_week", show_past_today: true, secondary: "calendar_location", highlight_days: 7,
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
      hasHold: () => this.pressedIndex >= 0 && hasAction(this.config?.hold_action),
      hasDoubleTap: () => false,
    }, (action: ActionKind) => this.handleAction(action));
    // past / running events and the day change without state changes
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

  private openDetails(event: ShownEvent): void {
    this.selected = event;
    this.requestUpdate();
    this.updateComplete.then(() => {
      const dialog = this.shadowRoot?.querySelector("dialog");
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  private closeDetails(): void {
    this.shadowRoot?.querySelector("dialog")?.close();
  }

  // range [today 00:00, end) of the configured period
  private rangeEnd(today: Date): Date {
    const config = this.config!;
    // days to the next Monday (weeks start on Monday)
    const toMonday = ((8 - today.getDay()) % 7) || 7;
    if (config.range === "today") return addDays(today, 1);
    if (config.range === "this_week") return addDays(today, toMonday);
    if (config.range === "days") return addDays(today, Math.max(1, Math.round(Number(config.days) || 14)));
    return addDays(today, toMonday + 7);
  }

  private matchRule(summary: string): CalendarRule | undefined {
    const title = summary.toLocaleLowerCase();
    return (this.config!.rules ?? []).find((rule) => {
      if (rule.starts_with && title.startsWith(String(rule.starts_with).toLocaleLowerCase())) return true;
      return !!rule.contains && title.includes(String(rule.contains).toLocaleLowerCase());
    });
  }

  // all events of the range, decorated and sorted; undefined while nothing is loaded yet
  private collect(today: Date, end: Date): ShownEvent[] | undefined {
    const config = this.config!;
    const now = new Date();
    const highlightDays = Number.isFinite(Number(config.highlight_days)) ? Number(config.highlight_days) : 7;
    let loaded = false;
    const events: ShownEvent[] = [];
    for (const source of this.sources()) {
      const list = this.hass ? calendarEvents(this.hass, source.entity, today, end, () => this.requestUpdate()) : undefined;
      if (!list) continue;
      loaded = true;
      const stateObj = this.hass?.states[source.entity];
      const calendarName = source.name ?? stateObj?.attributes?.friendly_name ?? source.entity;
      for (const event of list) {
        if (event.end.getTime() <= today.getTime() || event.start.getTime() >= end.getTime()) continue;
        const past = event.end.getTime() <= now.getTime();
        if (past && !config.show_past_today) continue;
        const rule = this.matchRule(event.summary);
        const day = event.start.getTime() < today.getTime() ? today : startOfDay(event.start);
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

  private lastDay(event: CalendarEvent): Date {
    return event.allDay ? addDays(event.end, -1) : event.end;
  }

  private renderDayHeader(day: Date, today: Date, nextMonday: Date, isFirst: boolean, marksNextWeek: boolean) {
    const offset = daysBetween(today, day);
    // day headers spell weekday and month out ("Dienstag 10. November")
    const weekday = day.toLocaleDateString(this.language, { weekday: "long" });
    const date = day.toLocaleDateString(this.language, { day: "numeric", month: "long" });
    const label = offset === 0 ? this.localize("calendar.today") : offset === 1 ? this.localize("calendar.tomorrow") : weekday;
    const rest = offset <= 1 ? `${weekday} ${date}` : date;
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

  private renderEvent(event: ShownEvent, index: number, today: Date) {
    const secondary = this.secondaryText(event);
    const classes = ["event", event.past ? "past" : "", event.running ? "running" : "", event.highlight ? "highlight" : ""]
      .filter(Boolean).join(" ");
    return html`<div class=${classes} style=${`--event-color: ${event.color}`} data-index=${index} role="button" tabindex="0"
      aria-label=${event.summary}><div class="icon"><ha-icon .icon=${event.icon}></ha-icon></div><div class="text"><div
      class="name">${event.summary}</div>${secondary ? html`<div class="sub">${secondary}</div>` : nothing}</div>${this.renderWhen(event, today)}</div>`;
  }

  private renderDetails() {
    const event = this.selected;
    if (!event) return html`<dialog></dialog>`;
    const lastDay = this.lastDay(event);
    let when: string;
    if (event.allDay) {
      when = event.multiDay ? `${this.longDate(event.start)} – ${this.longDate(lastDay)}` : `${this.longDate(event.start)}, ${this.localize("calendar.allDay")}`;
    } else if (event.multiDay) {
      when = `${this.longDate(event.start)} ${this.time(event.start)} – ${this.longDate(event.end)} ${this.time(event.end)}`;
    } else {
      when = `${this.longDate(event.start)}, ${this.time(event.start)}–${this.time(event.end)}`;
    }
    return html`<dialog style=${`--event-color: ${event.color}`} @click=${(clickEvent: MouseEvent) => {
      // a click on the backdrop closes the dialog
      if (clickEvent.target === clickEvent.currentTarget) this.closeDetails();
    }} @close=${() => { this.selected = undefined; this.requestUpdate(); }}><div class="dialog-head"><div class="icon"><ha-icon
      .icon=${event.icon}></ha-icon></div><div class="dialog-title">${event.summary}</div><button class="close"
      aria-label=${this.localize("calendar.close")} @click=${() => this.closeDetails()}><ha-icon icon="mdi:close"></ha-icon></button></div><div
      class="details"><ha-icon icon="mdi:clock-outline"></ha-icon><div>${when}</div><ha-icon icon="mdi:calendar-blank-outline"></ha-icon><div>${event.calendarName}</div>${event.location
      ? html`<ha-icon icon="mdi:map-marker-outline"></ha-icon><div>${event.location}</div>` : nothing}${event.description
      ? html`<ha-icon icon="mdi:text"></ha-icon><div class="description">${event.description}</div>` : nothing}</div></dialog>`;
  }

  protected render() {
    const config = this.config!;
    const today = startOfDay(new Date());
    const end = this.rangeEnd(today);
    const lastRangeDay = this.longDate(addDays(end, -1));
    const events = this.collect(today, end);
    const limit = Number(config.max_items) > 0 ? Math.round(Number(config.max_items)) : Infinity;
    this.shown = (events ?? []).slice(0, limit);
    const hiddenCount = (events?.length ?? 0) - this.shown.length;
    const isEmpty = !!events && events.length === 0;
    this.toggleAttribute("hidden-empty", isEmpty && !!config.hide_empty);
    if (!events) return html``;
    if (isEmpty) {
      const text = config.empty_text ?? this.localize("calendar.empty", { date: lastRangeDay });
      return html`<div class="empty"><div class="icon"><ha-icon icon="mdi:check-circle"></ha-icon></div>${text}</div>`;
    }
    const nextMonday = addDays(today, ((8 - today.getDay()) % 7) || 7);
    const marksNextWeek = this.shown.some((event) => event.day.getTime() < nextMonday.getTime());
    const groups: Array<{ day: Date; items: Array<{ event: ShownEvent; index: number }> }> = [];
    this.shown.forEach((event, index) => {
      const last = groups[groups.length - 1];
      if (last && last.day.getTime() === event.day.getTime()) last.items.push({ event, index });
      else groups.push({ day: event.day, items: [{ event, index }] });
    });
    let markedNextWeek = false;
    return html`${groups.map((group, groupIndex) => {
      const marks = marksNextWeek && !markedNextWeek && group.day.getTime() >= nextMonday.getTime();
      if (marks) markedNextWeek = true;
      return html`${this.renderDayHeader(group.day, today, nextMonday, groupIndex === 0, marks)}<div class="list">${group.items
        .map((item) => this.renderEvent(item.event, item.index, today))}</div>`;
    })}${hiddenCount > 0 ? html`<div class="more">${this.localize("calendar.more", { count: hiddenCount, date: lastRangeDay })}</div>`
      : nothing}${this.renderDetails()}`;
  }


  getCardSize(): number {
    return Math.max(2, this.shown.length + 1);
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
  description: "Events of one or more calendars, grouped by day, with color and icon per calendar or keyword.",
});
