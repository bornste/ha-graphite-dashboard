// graphite-value: one value as a tile in the label layout – the name on top, the value with its
// unit at the bottom, an optional second value on the right and a watermark icon top right. The
// meter tile without its bar, for values that need no scale (counters, prices, words). The row
// counterpart is graphite-status (value on the right, decimals and unit there as well).
import { html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { formatNumber, formatState, isUnavailable } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteValueEditor } from "./graphite-value-editor";
import { labelStyles } from "./label-styles";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface ValueConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  // decimals of a numeric value (default: display precision of the entity, otherwise as Home Assistant formats it)
  decimals?: number;
  unit?: string;
  icon?: string;
  show_icon?: boolean;
  // stripe in this color above the name (like the todo tile)
  color?: string;
  secondary_entity?: string;
  secondary_decimals?: number;
  secondary_unit?: string;
  secondary_icon?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

interface ValueText {
  value: string;
  unit: string;
  // a word ("offen", "Netflix") reads larger than a number and is set at 20px
  isWord: boolean;
}

export class GraphiteValue extends GraphiteCard<ValueConfig> {
  static styles = [tileStyles, meterStyles, labelStyles];

  private detachActions?: () => void;

  protected normalizeConfig(config: ValueConfig): ValueConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    // display tile: tapping does nothing by default, holding opens more-info (like graphite-status)
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
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

  // display precision set for the entity in Home Assistant
  private precisionOf(entityId: string): number | undefined {
    const precision = Number((this.hass as unknown as { entities?: Record<string, { display_precision?: number }> })
      ?.entities?.[entityId]?.display_precision);
    return Number.isFinite(precision) ? precision : undefined;
  }

  // value and unit of an entity: numbers with the chosen decimals, everything else as Home Assistant formats it
  private textOf(stateObj: HassEntity | undefined, decimals: number | undefined, unitOption: string | undefined): ValueText {
    if (!stateObj || isUnavailable(stateObj)) return { value: "–", unit: "", isWord: false };
    const number = Number(stateObj.state);
    const unit = unitOption ?? stateObj.attributes?.unit_of_measurement ?? "";
    if (stateObj.state !== "" && Number.isFinite(number)) {
      // option, display precision of the entity, otherwise the decimals the state has
      const ownDecimals = (stateObj.state.split(".")[1] ?? "").length;
      const digits = decimals ?? this.precisionOf(stateObj.entity_id) ?? ownDecimals;
      return { value: formatNumber(this.hass, number, digits), unit, isWord: false };
    }
    return { value: formatState(this.hass, stateObj), unit: "", isWord: true };
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const config = this.config!;
    if (!config.icon && !config.show_icon) return nothing;
    const icon = config.icon
      ? html`<ha-icon .icon=${config.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class="meter-icon">${icon}</div>`;
  }

  private secondaryText(): string {
    const config = this.config!;
    if (!config.secondary_entity) return "";
    const text = this.textOf(this.hass?.states[config.secondary_entity], config.secondary_decimals, config.secondary_unit);
    return text.unit ? `${text.value} ${text.unit}` : text.value;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.hass?.states[config.entity];
    const text = this.textOf(stateObj, config.decimals, config.unit);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const secondary = this.secondaryText();
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", config.color ? "" : "no-stripe", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : nothing}
      role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${this.renderIcon(stateObj)}${config.color ? html`<div class="stripe"></div>` : nothing}<div
      class="name">${name}</div><div class="value-row"><div class=${text.isWord ? "value text" : "value"}>${text.value}${text.unit
      ? html`<span class="unit">${text.unit}</span>` : nothing}</div>${secondary ? html`<div class="secondary">${config.secondary_icon
      ? html`<ha-icon .icon=${config.secondary_icon}></ha-icon>` : nothing}${secondary}</div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("sensor.")
      && hass.states[id].attributes?.unit_of_measurement) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-value-editor");
  }
}

registerElement("graphite-value-editor", GraphiteValueEditor);
registerCard("graphite-value", GraphiteValue, {
  name: "Graphite Value",
  description: "One value as a tile: name on top, value with unit, optional second value and watermark icon.",
});
