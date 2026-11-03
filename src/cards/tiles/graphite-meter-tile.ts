// graphite-meter-tile: sensor value with an instrument bar.
// style "gradient": whole color scale, dimmed beyond the value, needle at the value.
// style "level": bar in the band color, filled up to the value.
import { html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { formatNumber } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteMeterTileEditor } from "./graphite-meter-tile-editor";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface MeterTileConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  style?: "gradient" | "level";
  min?: number;
  max?: number;
  // color stops: { value: color }, e.g. { 16: "#4f8fd6", 24: "#6fbf5a" }
  colors?: Record<string, string>;
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

interface ColorStop {
  value: number;
  color: string;
}

export class GraphiteMeterTile extends GraphiteCard<MeterTileConfig> {
  static styles = [tileStyles, meterStyles];

  private detachActions?: () => void;

  protected normalizeConfig(config: MeterTileConfig): MeterTileConfig {
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

  protected render() {
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
    let bandColor = "var(--graphite-accent)";
    if (stops.length > 0) {
      bandColor = stops[0].color;
      for (const stop of stops) if (hasValue && value >= stop.value) bandColor = stop.color;
    }
    const scale = stops.length > 0
      ? stops.map((stop) => `${stop.color} ${toShare(stop.value)}%`).join(", ")
      : "var(--graphite-accent) 0%, var(--graphite-accent) 100%";
    const variables = `--meter-share: ${hasValue ? toShare(value) : 0}%; --meter-color: ${bandColor};`
      + (style === "gradient" ? ` --meter-scale: linear-gradient(90deg, ${scale});` : "");

    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", style, hasValue ? "" : "novalue", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    const secondary = this.secondaryText();
    return html`<div class=${classes} style=${variables} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}${this
      .renderIcon(stateObj)}<div class="name">${name}</div><div class="value-row"><div class="value">${hasValue
      ? formatNumber(this.hass, value, config.decimals ?? 1) : "–"}${hasValue && unit ? html`<span class="unit">${unit}</span>`
      : nothing}</div>${secondary ? html`<div class="secondary">${config.secondary_icon
      ? html`<ha-icon .icon=${config.secondary_icon}></ha-icon>` : nothing}${secondary}</div>` : nothing}</div><div
      class="bar"><div class="fill"></div>${style === "gradient" ? html`<div class="needle"></div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 3, rows: 2, min_columns: 2 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("sensor.")
      && hass.states[id].attributes?.unit_of_measurement === "%") ?? "";
    return { entity, style: "level", min: 0, max: 100, decimals: 0 };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-meter-tile-editor");
  }
}

registerElement("graphite-meter-tile-editor", GraphiteMeterTileEditor);
registerCard("graphite-meter-tile", GraphiteMeterTile, {
  name: "Graphite Meter Tile",
  description: "Sensor value with a color scale (gradient with needle) or a level bar, optional secondary value.",
});
