// graphite-timeline: what ran when – one row per entity (e.g. the game someone plays, the TV app),
// a bar per state over the chosen period, the total on the right. Short interruptions are bridged:
// a sensor that drops to unknown/unavailable for a moment, or a screensaver between two Plex phases,
// does not split the bar. Hover or tap a bar for its time and duration (no dialog to close).
import { html, nothing, type TemplateResult } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig } from "../../core/types";
import { GraphiteTimelineEditor } from "./graphite-timeline-editor";
import { timelineStyles } from "./timeline-styles";

export interface TimelineEntity {
  entity: string;
  name?: string;
  // bar color (default: accent)
  color?: string;
  // colors of single states
  state_colors?: Record<string, string>;
  // further states that count as "nothing runs" for this entity
  ignore_states?: string[];
}

export interface TimelineConfig extends GraphiteCardConfig {
  entities: Array<string | TimelineEntity>;
  // periods of the picker ("4h", "8h", "24h", "3d", "7d") and the one shown first
  intervals?: string[];
  default_interval?: string;
  show_picker?: boolean;
  // interruptions up to this long are bridged ("5m", "30s", "1h")
  bridge?: string;
  // states that count as "nothing runs" for every entity (on top of unknown, unavailable, off, …)
  ignore_states?: string[];
  show_total?: boolean;
}

interface Segment {
  state: string;
  start: number;
  end: number;
}

interface Row {
  source: TimelineEntity;
  name: string;
  segments: Segment[];
  total: number;
}

interface HistoryEntry {
  state?: string;
  s?: string;
  last_changed?: string;
  lc?: number;
}

const inactiveStates = ["unknown", "unavailable", "off", "none", "idle", "standby", ""];
const defaultIntervals = ["4h", "8h", "12h", "24h", "3d", "7d"];
const refetchMilliseconds = 5 * 60 * 1000;
const tickMilliseconds = 60 * 1000;
const selectionMilliseconds = 6000;
const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;

// "5m" -> ms, "4h", "3d", "30s"; undefined for anything else
function durationOf(text: string | undefined): number | undefined {
  const value = String(text ?? "").trim().toLowerCase();
  const unit = value.slice(-1);
  const count = Number(value.slice(0, -1));
  if (!Number.isFinite(count) || count < 0) return undefined;
  const factors: Record<string, number> = { s: 1000, m: minuteMs, h: hourMs, d: dayMs };
  return factors[unit] !== undefined ? count * factors[unit] : undefined;
}

export class GraphiteTimeline extends GraphiteCard<TimelineConfig> {
  static properties = {
    ...GraphiteCard.properties,
    interval: { state: true },
    selected: { state: true },
  };

  static styles = timelineStyles;

  declare interval?: string;
  declare selected?: { row: number; segment: number };

  private history?: { key: string; data: Record<string, HistoryEntry[]>; fetchedAt: number };
  private pending?: string;
  private tickTimer?: number;
  private selectionTimer?: number;

  protected normalizeConfig(config: TimelineConfig): TimelineConfig {
    const entities = config.entities ?? (config.entity ? [config.entity] : []);
    if (!Array.isArray(entities) || entities.length === 0) throw new Error(`${this.localName}: 'entities' is required`);
    const intervals = (config.intervals ?? defaultIntervals).filter((value) => durationOf(value) !== undefined);
    if (!this.interval || !intervals.includes(this.interval)) {
      this.interval = intervals.includes(String(config.default_interval)) ? String(config.default_interval) : intervals[0] ?? "4h";
    }
    return { show_picker: true, show_total: true, bridge: "5m", ...config, entities, intervals };
  }

  private sources(): TimelineEntity[] {
    return this.config!.entities.map((source) => (typeof source === "string" ? { entity: source } : source))
      .filter((source) => !!source?.entity);
  }

  protected watchedEntities(): string[] {
    return this.sources().map((source) => source.entity);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // the window moves on and running bars grow without state changes
    this.tickTimer = window.setInterval(() => this.requestUpdate(), tickMilliseconds);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.tickTimer);
    window.clearTimeout(this.selectionTimer);
  }

  private periodMs(): number {
    return durationOf(this.interval) ?? 4 * hourMs;
  }

  // history of all entities over the period, fetched again every 5 minutes or when an entity changed
  private loadHistory(): void {
    const api = this.hass as unknown as { callApi?: (method: string, path: string) => Promise<unknown> } | undefined;
    if (!api?.callApi) return;
    const ids = this.sources().map((source) => source.entity);
    const key = `${this.interval}|${ids.join(",")}`;
    const changed = this.history && ids.some((id) => {
      const lastChanged = Date.parse(this.hass?.states[id]?.last_changed ?? "");
      return Number.isFinite(lastChanged) && lastChanged > this.history!.fetchedAt;
    });
    const fresh = this.history?.key === key && Date.now() - this.history.fetchedAt < refetchMilliseconds && !changed;
    if (fresh || this.pending === key) return;
    this.pending = key;
    const start = new Date(Date.now() - this.periodMs());
    // without end_time the history API returns only one day after the start
    const path = `history/period/${encodeURIComponent(start.toISOString())}?filter_entity_id=${ids.join(",")}`
      + `&end_time=${encodeURIComponent(new Date().toISOString())}&minimal_response&no_attributes`;
    const fetchedAt = Date.now();
    api.callApi("GET", path)
      .then((result) => {
        const data: Record<string, HistoryEntry[]> = {};
        // one list per entity, in the order of the request; the first entry carries the entity id
        for (const list of (Array.isArray(result) ? result : []) as Array<Array<HistoryEntry & { entity_id?: string }>>) {
          const entityId = list?.[0]?.entity_id;
          if (entityId) data[entityId] = list;
        }
        this.history = { key, data, fetchedAt };
      })
      .catch(() => {
        this.history = { key, data: this.history?.data ?? {}, fetchedAt };
      })
      .finally(() => {
        this.pending = undefined;
        this.requestUpdate();
      });
  }

  private isInactive(source: TimelineEntity, state: string): boolean {
    const extra = [...(this.config!.ignore_states ?? []), ...(source.ignore_states ?? [])];
    return inactiveStates.includes(state.toLowerCase()) || extra.includes(state);
  }

  // bars of one entity: active states merged, short interruptions bridged, clipped to the window
  private segmentsOf(source: TimelineEntity, from: number, to: number): Segment[] {
    const entries = this.history?.data[source.entity] ?? [];
    const changes = entries.map((entry) => ({
      state: String(entry.state ?? entry.s ?? ""),
      time: entry.last_changed ? Date.parse(entry.last_changed) : Number(entry.lc) * 1000,
    })).filter((change) => Number.isFinite(change.time));
    // the current state continues until now (also when the history is a few minutes old)
    const current = this.hass?.states[source.entity];
    if (current) {
      const changedAt = Date.parse(current.last_changed);
      const last = changes[changes.length - 1];
      if (!last || (Number.isFinite(changedAt) && changedAt > last.time)) changes.push({ state: current.state, time: changedAt });
    }
    const raw: Segment[] = [];
    changes.forEach((change, index) => {
      const start = Math.max(change.time, from);
      const end = Math.min(index + 1 < changes.length ? changes[index + 1].time : to, to);
      if (end <= start || this.isInactive(source, change.state)) return;
      const previous = raw[raw.length - 1];
      if (previous && previous.state === change.state && previous.end === start) previous.end = end;
      else raw.push({ state: change.state, start, end });
    });
    return this.bridge(raw);
  }

  // closes gaps up to the bridge time between two bars of the same state, and drops short foreign
  // bars between them (e.g. a screensaver between two Plex phases)
  private bridge(segments: Segment[]): Segment[] {
    const bridgeMs = durationOf(this.config!.bridge) ?? 5 * minuteMs;
    if (bridgeMs <= 0) return segments;
    const result = segments.map((segment) => ({ ...segment }));
    for (let pass = 0; pass < segments.length + 1; pass++) {
      let changed = false;
      for (let index = 0; index + 1 < result.length; index++) {
        const current = result[index];
        const next = result[index + 1];
        if (current.state === next.state && next.start - current.end <= bridgeMs) {
          current.end = next.end;
          result.splice(index + 1, 1);
          changed = true;
          break;
        }
        const after = result[index + 2];
        if (after && after.state === current.state && next.end - next.start <= bridgeMs && after.start - current.end <= 2 * bridgeMs
          && next.start - current.end <= bridgeMs && after.start - next.end <= bridgeMs) {
          current.end = after.end;
          result.splice(index + 1, 2);
          changed = true;
          break;
        }
      }
      if (!changed) break;
    }
    return result;
  }

  private rows(from: number, to: number): Row[] {
    return this.sources().map((source) => {
      const segments = this.segmentsOf(source, from, to);
      const stateObj = this.hass?.states[source.entity];
      return {
        source,
        name: source.name ?? stateObj?.attributes?.friendly_name ?? source.entity,
        segments,
        total: segments.reduce((sum, segment) => sum + segment.end - segment.start, 0),
      };
    });
  }

  // "1:55 h"
  private durationText(milliseconds: number): string {
    const minutes = Math.round(milliseconds / minuteMs);
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")} h`;
  }

  private time(moment: number): string {
    return new Date(moment).toLocaleTimeString(this.language, { hour: "2-digit", minute: "2-digit" });
  }

  // "12:10–14:05", across days with the weekday
  private spanText(start: number, end: number): string {
    const sameDay = new Date(start).toDateString() === new Date(end).toDateString();
    const today = new Date().toDateString() === new Date(start).toDateString();
    const weekday = (moment: number) => new Date(moment).toLocaleDateString(this.language, { weekday: "short" }).replace(".", "");
    if (sameDay) return `${today ? "" : `${weekday(start)} `}${this.time(start)}–${this.time(end)}`;
    return `${weekday(start)} ${this.time(start)} – ${weekday(end)} ${this.time(end)}`;
  }

  private colorOf(source: TimelineEntity, state: string): string {
    return source.state_colors?.[state] ?? source.color ?? "var(--graphite-accent)";
  }

  // axis ticks: whole hours (or days) that fit the period
  private ticks(from: number, to: number): Array<{ position: number; label: string }> {
    const period = to - from;
    const stepHours = period <= 4 * hourMs ? 1 : period <= 8 * hourMs ? 2 : period <= 12 * hourMs ? 3 : period <= 24 * hourMs ? 6 : 24;
    const result: Array<{ position: number; label: string }> = [];
    const first = new Date(from);
    if (stepHours === 24) {
      first.setHours(24, 0, 0, 0);
    } else {
      first.setMinutes(0, 0, 0);
      if (first.getTime() < from) first.setHours(first.getHours() + 1);
      for (let guard = 0; guard < 24 && first.getHours() % stepHours !== 0; guard++) first.setHours(first.getHours() + 1);
    }
    for (let moment = first.getTime(), guard = 0; moment < to && guard < 20; guard++) {
      const label = stepHours === 24
        ? new Date(moment).toLocaleDateString(this.language, { weekday: "short" }).replace(".", "")
        : this.time(moment);
      result.push({ position: ((moment - from) / period) * 100, label });
      const next = new Date(moment);
      if (stepHours === 24) next.setDate(next.getDate() + 1);
      else next.setHours(next.getHours() + stepHours);
      moment = next.getTime();
    }
    return result;
  }

  private select(row: number, segment: number, event?: Event): void {
    event?.stopPropagation();
    // hover and tap both select (a touch also fires mouseenter); it clears itself after a few seconds,
    // on leaving the chart or on a tap next to the bars – nothing to close
    this.selected = { row, segment };
    window.clearTimeout(this.selectionTimer);
    this.selectionTimer = window.setTimeout(() => { this.selected = undefined; }, selectionMilliseconds);
  }

  private unselect(): void {
    window.clearTimeout(this.selectionTimer);
    this.selected = undefined;
  }

  private renderSegment(row: Row, rowIndex: number, segment: Segment, segmentIndex: number, from: number, period: number): TemplateResult {
    const left = ((segment.start - from) / period) * 100;
    const width = Math.max(0.4, ((segment.end - segment.start) / period) * 100);
    const active = this.selected?.row === rowIndex && this.selected?.segment === segmentIndex;
    return html`<div class=${active ? "segment selected" : "segment"} style=${`left: ${left}%; width: ${width}%; --segment-color: ${this.colorOf(row.source, segment.state)}`}
      @mouseenter=${() => this.select(rowIndex, segmentIndex)} @click=${(event: Event) => this.select(rowIndex, segmentIndex, event)}><span>${segment.state}</span></div>`;
  }

  private renderPicker(intervals: string[]): TemplateResult | typeof nothing {
    if (!this.config!.show_picker || intervals.length < 2) return nothing;
    return html`<div class="picker">${intervals.map((value) => html`<button class=${value === this.interval ? "active" : ""}
      @click=${() => { this.interval = value; this.unselect(); }}><ha-ripple></ha-ripple>${value.toUpperCase()}</button>`)}</div>`;
  }

  // info line: the selected bar, otherwise the period
  private renderInfo(rows: Row[], from: number, to: number): TemplateResult {
    const selection = this.selected;
    const row = selection ? rows[selection.row] : undefined;
    const segment = row?.segments[selection!.segment];
    if (row && segment) {
      return html`<div class="info selected"><b>${row.name}</b> · ${segment.state} · ${this.spanText(segment.start, segment.end)} · ${this.durationText(segment.end - segment.start)}</div>`;
    }
    return html`<div class="info">${this.localize("timeline.period", { span: this.spanText(from, to) })}</div>`;
  }

  protected render() {
    if (!this.config) return nothing;
    this.loadHistory();
    const to = Date.now();
    const period = this.periodMs();
    const from = to - period;
    const rows = this.history ? this.rows(from, to) : [];
    const showTotal = this.config.show_total !== false;
    const ticks = this.ticks(from, to);
    // every cell has its place in the grid, so the grid lines can span all rows of the bar column
    // (behind the bars, visible through the empty tracks) and the axis lines up with any name width
    const rowCount = Math.max(1, rows.length);
    const gridLines = html`<div class="gridLines" style=${`grid-row: 1 / ${rowCount + 1}`}>${ticks.map((tick) => html`<i
      style=${`left: ${tick.position}%`}></i>`)}</div>`;
    const place = (row: number, column: number) => `grid-row: ${row}; grid-column: ${column}`;
    return html`${this.renderPicker(this.config.intervals ?? defaultIntervals)}<div class="chart" @mouseleave=${() => this.unselect()}
      @click=${() => this.unselect()}><div class=${showTotal ? "rows withTotal" : "rows"}>${this.history ? html`${gridLines}${rows.map((row,
      rowIndex) => html`<div class="label" style=${place(rowIndex + 1, 1)}>${row.name}</div><div class="track" style=${place(rowIndex + 1,
      2)}>${row.segments.map((segment, segmentIndex) => this.renderSegment(row, rowIndex, segment, segmentIndex, from, period))}</div>${showTotal
      ? html`<div class="total" style=${place(rowIndex + 1, 3)}>${row.total ? this.durationText(row.total) : "–"}</div>` : nothing}`)}`
      : html`<div class="loading">${this.localize("timeline.loading")}</div>`}<div class="ticks" style=${place(rowCount + 1, 2)}>${ticks
      .map((tick) => html`<span style=${`left: ${tick.position}%`}>${tick.label}</span>`)}</div></div>${this.renderInfo(rows, from, to)}</div>`;
  }

  getCardSize(): number {
    return 2 + this.sources().length;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entities = Object.keys(hass?.states ?? {}).filter((id) => id.startsWith("media_player.")).slice(0, 2);
    return { entities };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-timeline-editor");
  }
}

registerElement("graphite-timeline-editor", GraphiteTimelineEditor);
registerCard("graphite-timeline", GraphiteTimeline, {
  name: "Graphite Timeline",
  description: "What ran when: one bar row per entity over a chosen period, short interruptions bridged, totals per row.",
});
