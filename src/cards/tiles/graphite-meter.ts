// graphite-meter: sensor value with an instrument bar, as a tile (name on top, value above the bar)
// or as a row (name and status line left, value right, bar along the bottom).
// style "gradient": whole color scale, dimmed beyond the value, needle at the value.
// style "level": bar in the band color, filled up to the value.
// low: for consumables (ink, batteries) – soon empty below "low", empty at the minimum.
import { html, nothing, type CSSResultGroup } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { formatNumber, isUnavailable, sinceText } from "../../core/format";
import { layoutOf } from "../../core/layout";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteMeterEditor } from "./graphite-meter-editor";
import { meterRowStyles, meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface MeterConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  style?: "gradient" | "level";
  min?: number;
  max?: number;
  // color stops: { value: color }, e.g. { 16: "#4f8fd6", 24: "#6fbf5a" }
  colors?: Record<string, string>;
  // a single color instead of color stops
  color?: string;
  low?: number;
  layout?: "row" | "tile";
  decimals?: number;
  unit?: string;
  icon?: string;
  show_icon?: boolean;
  secondary_entity?: string;
  secondary_decimals?: number;
  secondary_unit?: string;
  secondary_icon?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const meterTileStyles = [tileStyles, meterStyles];

interface ColorStop {
  value: number;
  color: string;
}

export class GraphiteMeter extends GraphiteCard<MeterConfig> {
  static styles: CSSResultGroup = [];

  protected stylesForConfig() {
    return layoutOf(this.config, "tile") === "row" ? meterRowStyles : meterTileStyles;
  }

  private detachActions?: () => void;

  protected normalizeConfig(config: MeterConfig): MeterConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config!;
    return config.secondary_entity ? [config.entity, config.secondary_entity] : [config.entity];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = undefined;
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    fireAction(this, config, action);
  }

  private colorStops(): ColorStop[] {
    return Object.entries(this.config!.colors ?? {})
      .map(([stopValue, color]) => ({ value: Number(stopValue), color: String(color) }))
      .filter((stop) => Number.isFinite(stop.value) && stop.color)
      .sort((first, second) => first.value - second.value);
  }

  private secondaryText(): string {
    const config = this.config!;
    if (!config.secondary_entity) return "";
    const secondaryState = this.hass?.states[config.secondary_entity];
    if (!secondaryState) return "";
    const value = parseFloat(secondaryState.state);
    if (!Number.isFinite(value)) return "–";
    const unit = config.secondary_unit ?? secondaryState.attributes?.unit_of_measurement ?? "";
    return `${formatNumber(this.hass, value, config.secondary_decimals ?? 0)}${unit ? ` ${unit}` : ""}`;
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const config = this.config!;
    if (!config.icon && !config.show_icon) return nothing;
    const icon = config.icon
      ? html`<ha-icon .icon=${config.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class="meter-icon">${icon}</div>`;
  }

  // value, band color and scale shared by both layouts
  private model() {
    const config = this.config!;
    const style = config.style === "gradient" ? "gradient" : "level";
    const stateObj = this.hass?.states[config.entity];
    const value = stateObj ? parseFloat(stateObj.state) : NaN;
    const hasValue = Number.isFinite(value);
    const unit = config.unit ?? stateObj?.attributes?.unit_of_measurement ?? "";
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;

    // scale: min, max and color stops; band color = highest stop at or below the value
    const minValue = Number.isFinite(Number(config.min)) ? Number(config.min) : 0;
    const maxValue = Number.isFinite(Number(config.max)) && Number(config.max) > minValue ? Number(config.max) : minValue + 100;
    const toShare = (number: number) => Math.min(100, Math.max(0, ((number - minValue) / (maxValue - minValue)) * 100));
    const stops = this.colorStops();
    let bandColor = config.color ?? "var(--graphite-accent)";
    if (stops.length > 0) {
      bandColor = stops[0].color;
      for (const stop of stops) if (hasValue && value >= stop.value) bandColor = stop.color;
    }
    const scale = stops.length > 0
      ? stops.map((stop) => `${stop.color} ${toShare(stop.value)}%`).join(", ")
      : `${bandColor} 0%, ${bandColor} 100%`;
    const variables = `--meter-share: ${hasValue ? toShare(value) : 0}%; --meter-color: ${bandColor};`
      + (style === "gradient" ? ` --meter-scale: linear-gradient(90deg, ${scale});` : "");

    // low: consumables (ink, batteries) – soon empty below "low", empty at the minimum
    const hasLow = config.low !== undefined && config.low !== null;
    const empty = hasLow && hasValue && value <= minValue;
    const low = hasLow && hasValue && !empty && value < Number(config.low);
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const valueText = hasValue ? formatNumber(this.hass, value, config.decimals ?? 1) : "–";
    return { style, stateObj, hasValue, unit, name, variables, hasLow, empty, low, interactive, valueText };
  }

  // status of a consumable ("OK", "bald leer", "leer"); empty without "low"
  private statusText(model: ReturnType<GraphiteMeter["model"]>): string {
    if (!model.hasLow || !model.hasValue) return "";
    return this.localize(model.empty ? "level.empty" : model.low ? "level.low" : "level.ok");
  }

  protected render() {
    return layoutOf(this.config, "tile") === "row" ? this.renderRow() : this.renderTile();
  }

  private renderTile() {
    const config = this.config!;
    const model = this.model();
    const classes = ["tile", model.style, model.hasValue ? "" : "novalue", model.empty ? "empty" : "", model.low ? "low" : "",
      model.interactive ? "interactive" : ""].filter(Boolean).join(" ");
    // a consumable that runs out says so on the right, otherwise the secondary value
    const status = model.empty || model.low ? this.statusText(model) : "";
    const secondary = status || this.secondaryText();
    return html`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : nothing}
      tabindex=${model.interactive ? "0" : nothing} aria-label=${model.name}>${model.interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${this.renderIcon(model.stateObj)}<div class="name">${model.name}</div><div
      class="value-row"><div class="value">${model.valueText}${model.hasValue && model.unit
      ? html`<span class="unit">${model.unit}</span>` : nothing}</div>${secondary ? html`<div class=${status ? "secondary status"
      : "secondary"}>${!status && config.secondary_icon ? html`<ha-icon .icon=${config.secondary_icon}></ha-icon>` : nothing}${secondary}</div>`
      : nothing}</div><div class="bar"><div class="fill"></div>${model.style === "gradient" ? html`<div class="needle"></div>`
      : nothing}</div></div>`;
  }

  // row: name and status line on the left, the value on the right, the bar along the bottom
  private renderRow() {
    const model = this.model();
    const offline = isUnavailable(model.stateObj);
    let status = this.statusText(model) || this.secondaryText();
    if (offline && model.stateObj) {
      status = this.localize("rows.since", { state: this.localize("rows.unavailable"),
        since: sinceText(new Date(model.stateObj.last_changed), this.language) });
    }
    const classes = ["row", model.style, model.hasValue ? "" : "novalue", offline ? "unavailable" : "", model.empty ? "empty" : "",
      model.low ? "low" : "", model.interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : nothing}
      tabindex=${model.interactive ? "0" : nothing} aria-label=${model.name}>${model.interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}<div class="name">${model.name}</div>${status ? html`<div class="status">${status}</div>`
      : nothing}<div class="value">${offline ? this.localize("rows.offline") : html`${model.valueText}${model.hasValue && model.unit
      ? html`<span class="unit">${model.unit}</span>` : nothing}`}</div><div class="bar"><div class="fill"></div>${model.style === "gradient"
      ? html`<div class="needle"></div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return layoutOf(this.config, "tile") === "row" ? 1 : 2;
  }

  getGridOptions() {
    return layoutOf(this.config, "tile") === "row"
      ? { columns: 12, rows: "auto", min_columns: 3 }
      : { columns: 3, rows: 2, min_columns: 2 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("sensor.")
      && hass.states[id].attributes?.unit_of_measurement === "%") ?? "";
    return { entity, style: "level", min: 0, max: 100, decimals: 0 };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-meter-editor");
  }
}

registerElement("graphite-meter-editor", GraphiteMeterEditor);
registerCard("graphite-meter", GraphiteMeter, {
  aliases: [{ tag: "graphite-meter-tile", defaults: { layout: "tile" } }],
  name: "Graphite Meter",
  description: "Sensor value with a color scale (gradient with needle) or a level bar, optional secondary value.",
});
