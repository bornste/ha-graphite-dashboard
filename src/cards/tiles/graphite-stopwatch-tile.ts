// graphite-stopwatch-tile: elapsed time of a Stopwatch Plus sensor in the label layout, optional
// daily limit. The tint always means "running" (also over the limit); paused or stopped tiles stay
// neutral. Close to the limit the secondary text is emphasized; over the limit time and secondary
// text are in accent and a running tile gets a stronger tint.
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteStopwatchTileEditor } from "./graphite-stopwatch-tile-editor";
import { labelStyles } from "./label-styles";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

// a limit is a number of minutes or an entity (e.g. an input_number) with minutes or hours
type LimitValue = number | string;
type LimitMap = Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" | "weekday" | "weekend", LimitValue>>;

export interface StopwatchTileConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  icon_position?: "watermark" | "left";
  picture_entity?: string;
  color?: string;
  limit?: LimitValue | LimitMap;
  warn_before?: number;
  day_start?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const tickInterval = 15000;

const stopwatchStyles = css`
  /* running: accent tint, name in primary, secondary text in accent */
  .tile.running {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.running.over {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-alert, 28%), var(--graphite-surface-tile-active));
  }
  .tile.running .name {
    color: var(--graphite-text-primary);
  }
  .tile.running .secondary {
    color: var(--graphite-accent);
  }
  /* the muted unit is too weak on tinted tiles */
  .tile.running .unit {
    color: var(--graphite-text-secondary);
  }
  .tile.running .meter-icon {
    opacity: 0.3;
  }
  .tile.warn .secondary,
  .tile.over .secondary {
    color: var(--graphite-accent);
    font-weight: 500;
  }
  .tile.over .value {
    color: var(--graphite-accent);
  }
  /* round picture left of the text, 12px from the edge and 12px to the text at 60px (like the rows);
     the watermark icon stays top right */
  .picture {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: 50%;
    width: 36px;
    height: 36px;
    transform: translateY(-50%);
    border-radius: 50%;
    background: var(--graphite-surface-track) center / cover no-repeat;
    pointer-events: none;
  }
  /* icon left: the same 42px box as the row icons, at 9px */
  .left-icon {
    position: absolute;
    left: 9px;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    transform: translateY(-50%);
    color: var(--graphite-text-secondary);
    pointer-events: none;
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .tile.running .left-icon {
    color: var(--graphite-accent);
  }
  .tile.inset .name,
  .tile.inset .value-row {
    left: 60px;
  }
`;

export class GraphiteStopwatchTile extends GraphiteCard<StopwatchTileConfig> {
  static styles = [tileStyles, meterStyles, labelStyles, stopwatchStyles];

  private detachActions?: () => void;
  private tickTimer?: number;

  protected normalizeConfig(config: StopwatchTileConfig): StopwatchTileConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config!;
    const limitEntities = typeof config.limit === "object" && config.limit !== null
      ? Object.values(config.limit).filter((value): value is string => typeof value === "string")
      : typeof config.limit === "string" ? [config.limit] : [];
    return [config.entity, config.picture_entity, ...limitEntities].filter((id): id is string => !!id);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
    // the elapsed time moves on between sensor updates while the stopwatch runs
    this.tickTimer = window.setInterval(() => {
      if (this.stateObj?.attributes?.status === "running") this.requestUpdate();
    }, tickInterval);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = undefined;
    window.clearInterval(this.tickTimer);
  }

  private get stateObj(): HassEntity | undefined {
    return this.hass?.states[this.config!.entity];
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    fireAction(this, config, action);
  }

  // the "day" starts at day_start (default 03:00, like the nightly reset), so a late
  // Saturday evening still counts as Saturday
  private limitMinutes(): number | null {
    const config = this.config!;
    let limit: LimitValue | undefined;
    if (config.limit !== null && typeof config.limit === "object") {
      const [hours, minutes] = String(config.day_start ?? "03:00").split(":").map(Number);
      const dayStartMs = ((hours || 0) * 60 + (minutes || 0)) * 60000;
      const dayIndex = new Date(Date.now() - dayStartMs).getDay();
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      limit = config.limit[weekdayKeys[dayIndex]] ?? (isWeekend ? config.limit.weekend : config.limit.weekday);
    } else {
      limit = config.limit;
    }
    const value = this.limitValue(limit);
    return value !== null && value > 0 ? value : null;
  }

  // minutes of a limit: a number, or the state of an entity (unit "h" is converted, otherwise minutes)
  private limitValue(limit: LimitValue | undefined): number | null {
    if (typeof limit === "number") return limit;
    if (typeof limit !== "string" || !limit) return null;
    const stateObj = this.hass?.states[limit];
    const value = parseFloat(stateObj?.state ?? "");
    if (!Number.isFinite(value)) return null;
    const unit = String(stateObj?.attributes?.unit_of_measurement ?? "").trim().toLowerCase();
    return ["h", "hour", "hours", "std", "std."].includes(unit) ? value * 60 : value;
  }

  private durationText(minutes: number): string {
    return minutes >= 60
      ? this.localize("stopwatch.hours", { hours: Math.floor(minutes / 60), minutes: String(minutes % 60).padStart(2, "0") })
      : this.localize("stopwatch.minutes", { minutes });
  }

  private renderIcon(stateObj: HassEntity | undefined, left: boolean) {
    const icon = this.config!.icon
      ? html`<ha-icon .icon=${this.config!.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class=${left ? "left-icon" : "meter-icon"}>${icon}</div>`;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.stateObj;
    const attributes = stateObj?.attributes ?? {};
    const isRunning = attributes.status === "running";
    const isPaused = attributes.status === "paused";
    // live elapsed time from the attributes, so the tile ticks between sensor updates
    let elapsedSeconds = parseFloat(stateObj?.state ?? "") || 0;
    if (isRunning && attributes.running_since) {
      elapsedSeconds = (Number(attributes.accumulated_seconds) || 0)
        + Math.max(0, (Date.now() - new Date(attributes.running_since).getTime()) / 1000);
    }
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    // one text node: split text nodes are kerned differently (a fraction of a pixel)
    const elapsedText = `${Math.floor(elapsedMinutes / 60)}:${String(elapsedMinutes % 60).padStart(2, "0")}`;
    const limit = this.limitMinutes();
    const isOver = limit !== null && elapsedMinutes >= limit;
    const isWarn = limit !== null && !isOver && isRunning && elapsedMinutes >= limit - (config.warn_before ?? 10);

    // without a limit the status is shown; with a limit only the remaining or extra time
    // ("noch 12 Min.", "+38 Min."), the tint already tells whether it is running
    let secondary = isRunning ? this.localize("stopwatch.running") : isPaused ? this.localize("stopwatch.paused") : "";
    if (limit !== null) {
      const difference = this.durationText(Math.abs(limit - elapsedMinutes));
      secondary = isOver ? `+${difference}` : this.localize("stopwatch.remaining", { time: difference });
    }

    const pictureUrl = config.picture_entity ? this.hass?.states[config.picture_entity]?.attributes?.entity_picture : undefined;
    const iconLeft = !pictureUrl && config.icon_position === "left";
    const name = config.name ?? attributes.friendly_name ?? config.entity;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", config.color ? "" : "no-stripe", isRunning ? "running" : "", isWarn ? "warn" : "",
      isOver ? "over" : "", pictureUrl || iconLeft ? "inset" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : nothing}
      role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${pictureUrl ? html`<div class="picture" style=${`background-image: url("${pictureUrl}")`}></div>`
      : nothing}${this.renderIcon(stateObj, iconLeft)}${config.color ? html`<div class="stripe"></div>` : nothing}<div
      class="name">${name}</div><div class="value-row"><div class="value">${elapsedText}<span class="unit">h</span></div>${secondary ? html`<div class="secondary">${secondary}</div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("sensor.") && hass.states[id].attributes?.status !== undefined
      && hass.states[id].attributes?.accumulated_seconds !== undefined) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-stopwatch-tile-editor");
  }
}

registerElement("graphite-stopwatch-tile-editor", GraphiteStopwatchTileEditor);
registerCard("graphite-stopwatch-tile", GraphiteStopwatchTile, {
  name: "Graphite Stopwatch Tile",
  description: "Elapsed time of a Stopwatch Plus sensor, optional daily limit, picture or icon on the left.",
});
