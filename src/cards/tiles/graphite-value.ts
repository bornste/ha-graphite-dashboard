// graphite-value: one value – number or word – where the value is the main thing. Two layouts:
// "tile" (name on top, value with its unit at the bottom, optional second value on the right and a
// watermark icon; the meter tile without its bar) and "row" (the geometry of the status rows with the
// value on the right in the value type). Its counterpart for states is graphite-status, where the
// name is the main thing and the state a small addition.
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { formatNumber, formatState, isUnavailable, sinceText } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { layoutOf } from "../../core/layout";
import { offlineDot } from "../../core/offline-dot";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { rowStyles } from "../rows/row-styles";
import { GraphiteValueEditor } from "./graphite-value-editor";
import { labelStyles } from "./label-styles";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface ValueConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  layout?: "tile" | "row";
  // decimals of a numeric value (default: display precision of the entity, otherwise the state's own)
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

interface ValueText {
  value: string;
  unit: string;
  // a word ("offen", "Netflix") reads larger than a number and is set at 20px
  isWord: boolean;
}

// tile offline: like the switch tile – the value row fades with the name, the watermark gives way to the badge
const valueTileStyles = css`
  .tile.unavailable .value-row {
    opacity: 0.4;
  }
  .tile.unavailable .meter-icon {
    display: none;
  }
`;

// row: the value on the right in the value type of the tiles; words get at most 60 % of the width
const valueRowStyles = css`
  .row .value {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 60%;
    margin-left: auto;
    padding: 0 14px 0 12px;
    font-size: var(--graphite-font-value-size, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    color: var(--graphite-text-primary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row .value.text {
    font-size: var(--graphite-font-value-text-size, 20px);
  }
  .unit {
    margin-left: 3px;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    color: var(--graphite-text-muted);
  }
  .since ha-icon {
    display: inline-flex;
    width: 12px;
    height: 12px;
    margin-right: 3px;
    transform: translateY(1px);
    --mdc-icon-size: 12px;
  }
`;

export class GraphiteValue extends GraphiteCard<ValueConfig> {
  static styles = [tileStyles, meterStyles, labelStyles, valueTileStyles];

  protected stylesForConfig() {
    return layoutOf(this.config, "tile") === "row"
      ? [rowStyles, valueRowStyles]
      : [tileStyles, meterStyles, labelStyles, valueTileStyles];
  }

  private detachActions?: () => void;

  protected normalizeConfig(config: ValueConfig): ValueConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    // display card: tapping does nothing by default, holding opens more-info (like graphite-status)
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
      hasDoubleTap: () => !this.offline && hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = undefined;
  }

  private get stateObj(): HassEntity | undefined {
    return this.hass?.states[this.config!.entity];
  }

  private get offline(): boolean {
    return !!this.config && isUnavailable(this.stateObj);
  }

  // offline: tap and double tap do nothing, holding still opens more-info
  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    if (this.offline && action !== "hold") return;
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

  private secondaryText(): string {
    const config = this.config!;
    if (!config.secondary_entity) return "";
    const text = this.textOf(this.hass?.states[config.secondary_entity], config.secondary_decimals, config.secondary_unit);
    return text.unit ? `${text.value} ${text.unit}` : text.value;
  }

  private renderValue(text: ValueText) {
    return html`<div class=${text.isWord ? "value text" : "value"}>${text.value}${text.unit
      ? html`<span class="unit">${text.unit}</span>` : nothing}</div>`;
  }

  private renderSecondary(text: string) {
    const icon = this.config!.secondary_icon;
    return html`${icon ? html`<ha-icon .icon=${icon}></ha-icon>` : nothing}${text}`;
  }

  protected render() {
    return layoutOf(this.config, "tile") === "row" ? this.renderRow() : this.renderTile();
  }

  // watermark: only with an icon or show_icon
  private renderWatermark(stateObj: HassEntity | undefined) {
    const config = this.config!;
    if (!config.icon && !config.show_icon) return nothing;
    const icon = config.icon
      ? html`<ha-icon .icon=${config.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class="meter-icon">${icon}</div>`;
  }

  private renderTile() {
    const config = this.config!;
    const stateObj = this.stateObj;
    const offline = this.offline;
    const text = this.textOf(stateObj, config.decimals, config.unit);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const secondary = offline ? "" : this.secondaryText();
    const interactive = !offline && (hasAction(config.tap_action) || hasAction(config.double_tap_action));
    const classes = ["tile", "label", "no-stripe", offline ? "unavailable" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}
      aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}${this.renderWatermark(stateObj)}<div
      class="name">${name}</div><div class="value-row">${this.renderValue(text)}${secondary ? html`<div
      class="secondary">${this.renderSecondary(secondary)}</div>` : nothing}</div><div class="offline">${offlineDot}<span>${this
      .localize("rows.offline")}</span></div></div>`;
  }

  // row icon: the configured icon, otherwise the state icon of the entity
  private renderRowIcon(stateObj: HassEntity | undefined) {
    const icon = this.config!.icon;
    if (icon || !customElements.get("ha-state-icon")) {
      return html`<ha-icon .icon=${icon || stateObj?.attributes?.icon || "mdi:help-circle-outline"}></ha-icon>`;
    }
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }

  private renderRow() {
    const config = this.config!;
    const stateObj = this.stateObj;
    const offline = this.offline;
    const text = this.textOf(stateObj, config.decimals, config.unit);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    // line below the name: the second value, offline "keine Meldung seit …"
    const line = offline && stateObj
      ? html`${this.localize("rows.since", { state: this.localize("rows.unavailable"),
        since: sinceText(new Date(stateObj.last_changed), this.language) })}`
      : this.secondaryText() ? this.renderSecondary(this.secondaryText()) : undefined;
    const interactive = !offline && (hasAction(config.tap_action) || hasAction(config.double_tap_action));
    const classes = ["row", offline ? "unavailable" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}
      aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div class="icon">${this.renderRowIcon(stateObj)}</div><div
      class="text"><div class="name">${name}</div>${line ? html`<div class="since">${line}</div>` : nothing}</div>${this.renderValue(text)}<div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>`;
  }

  getCardSize(): number {
    return layoutOf(this.config, "tile") === "row" ? 1 : 2;
  }

  getGridOptions() {
    return layoutOf(this.config, "tile") === "row"
      ? { columns: 12, rows: "auto", min_columns: 3 }
      : { columns: 6, rows: "auto", min_columns: 3 };
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
  description: "One value – number or word – as a tile or a row: name, value with unit, optional second value.",
});
