// graphite-meter: sensor value with an instrument bar, as a tile (name on top, value above the bar)
// or as a row (name and status line left, value right, bar along the bottom).
// style "gradient": whole color scale, dimmed beyond the value, needle at the value.
// style "level": bar in the band color, filled up to the value.
// low: for consumables (ink, batteries) – soon empty below "low", empty at the minimum.
// style "change": change against a reference (purchase price, a value of 24 hours ago, or a change in
// percent from an attribute) – a needle in the middle marks the reference, the bar runs to the right
// (more, green) or to the left (less, red), the change stands next to the value: in percent, or with
// change_mode absolute as a difference in the unit of the sensor. invert swaps the colors (consumption).
import { html, nothing, type CSSResultGroup } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { formatNumber, isUnavailable, sinceText } from "../../core/format";
import { layoutOf } from "../../core/layout";
import { offlineDot } from "../../core/offline-dot";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteMeterEditor } from "./graphite-meter-editor";
import { meterChangeStyles, meterRowStyles, meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface MeterConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  style?: "gradient" | "level" | "change";
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
  // style change: purchase price (number or entity) or a period ("24h", "7d"); an attribute with the
  // change in percent ("24h_change") takes precedence; half the bar is scale percent
  reference?: number | string;
  reference_name?: string;
  change_attribute?: string;
  scale?: number;
  change_decimals?: number;
  // percent (default) or absolute (difference in the unit, scale in the unit as well)
  change_mode?: "percent" | "absolute";
  // more is bad (consumption, prices to pay): green and red swap
  invert?: boolean;
}

const meterTileStyles = [tileStyles, meterStyles, meterChangeStyles];
const referenceRefreshMilliseconds = 5 * 60 * 1000;

interface ChangeModel {
  percent?: number;
  // value minus reference, in the unit of the sensor
  difference?: number;
  // reference top right: long on wide tiles ("Kauf 0.1697"), short on narrow ones ("Kauf")
  caption: string;
  captionShort: string;
}

interface ColorStop {
  value: number;
  color: string;
}

export class GraphiteMeter extends GraphiteCard<MeterConfig> {
  static styles: CSSResultGroup = [];

  protected stylesForConfig() {
    return layoutOf(this.config, "tile") === "row" ? [meterRowStyles, meterChangeStyles] : meterTileStyles;
  }

  private detachActions?: () => void;
  // value of the entity at the start of the reference period (history API), refreshed every 5 minutes
  private periodValue?: { key: string; value?: number; fetchedAt: number; pending?: boolean };

  protected normalizeConfig(config: MeterConfig): MeterConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config!;
    const reference = typeof config.reference === "string" && config.reference.includes(".") ? [config.reference] : [];
    return [config.entity, ...(config.secondary_entity ? [config.secondary_entity] : []), ...reference];
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

  // "24h" -> 24, "7d" -> 168; undefined for anything else
  private periodHours(text: string): number | undefined {
    const unit = text.slice(-1).toLowerCase();
    const count = Number(text.slice(0, -1));
    if (!Number.isFinite(count) || count <= 0) return undefined;
    if (unit === "h") return count;
    if (unit === "d") return count * 24;
    return undefined;
  }

  private periodText(hours: number): string {
    // up to two days in hours ("24 h"), beyond in days ("7 Tage")
    if (hours <= 48 || hours % 24 !== 0) return this.localize("meter.periodHours", { count: hours });
    return this.localize("meter.periodDays", { count: hours / 24 });
  }

  // value of the entity "hours" ago from the history; undefined until it is loaded
  private valueAgo(hours: number): number | undefined {
    const entityId = this.config!.entity;
    const key = `${entityId}|${hours}`;
    const cached = this.periodValue?.key === key ? this.periodValue : undefined;
    const fresh = cached && Date.now() - cached.fetchedAt < referenceRefreshMilliseconds;
    const api = this.hass as unknown as { callApi?: (method: string, path: string) => Promise<unknown> } | undefined;
    if (!fresh && !cached?.pending && api?.callApi) {
      const start = new Date(Date.now() - hours * 3600000);
      const end = new Date(start.getTime() + 60000);
      const path = `history/period/${encodeURIComponent(start.toISOString())}?filter_entity_id=${entityId}`
        + `&end_time=${encodeURIComponent(end.toISOString())}&minimal_response&no_attributes`;
      this.periodValue = { key, value: cached?.value, fetchedAt: cached?.fetchedAt ?? 0, pending: true };
      api.callApi("GET", path)
        .then((result) => {
          const first = (result as Array<Array<{ state?: string; s?: string }>>)?.[0]?.[0];
          const value = parseFloat(first?.state ?? first?.s ?? "");
          this.periodValue = { key, value: Number.isFinite(value) ? value : undefined, fetchedAt: Date.now() };
          this.requestUpdate();
        })
        .catch(() => {
          this.periodValue = { key, value: undefined, fetchedAt: Date.now() };
        });
    }
    return this.periodValue?.key === key ? this.periodValue.value : undefined;
  }

  // change in percent against the reference and the caption naming the reference
  private changeModel(stateObj: HassEntity | undefined, value: number, hasValue: boolean, decimals: number): ChangeModel {
    const config = this.config!;
    const reference = config.reference;
    let percent: number | undefined;
    let caption = "";
    let captionShort = "";
    if (config.change_attribute && stateObj) {
      const attributeValue = Number(stateObj.attributes?.[config.change_attribute]);
      if (Number.isFinite(attributeValue)) percent = attributeValue;
    }
    if (reference !== undefined && reference !== null && reference !== "") {
      const text = String(reference).trim();
      const hours = typeof reference === "string" ? this.periodHours(text) : undefined;
      let base: number | undefined;
      if (hours !== undefined) {
        caption = this.periodText(hours);
        captionShort = caption;
        if (percent === undefined) base = this.valueAgo(hours);
      } else if (typeof reference === "string" && text.includes(".") && this.hass?.states[text]) {
        base = parseFloat(this.hass.states[text].state);
        if (Number.isFinite(base)) {
          caption = this.localize("meter.purchase", { value: formatNumber(this.hass, base, decimals) });
          captionShort = this.localize("meter.purchaseShort");
        }
      } else {
        base = Number(text);
        // the purchase price keeps all of its own decimals (0.07282, not 0.0728)
        const ownDecimals = text.includes(".") ? text.split(".")[1].length : 0;
        if (Number.isFinite(base)) {
          caption = this.localize("meter.purchase", { value: formatNumber(this.hass, base, Math.max(decimals, ownDecimals)) });
          captionShort = this.localize("meter.purchaseShort");
        }
      }
      if (percent === undefined && hasValue && base !== undefined && Number.isFinite(base) && base !== 0) {
        percent = ((value - base) / Math.abs(base)) * 100;
      }
    }
    // the difference follows from the percent (also when the percent comes from an attribute)
    let difference: number | undefined;
    if (percent !== undefined && hasValue && percent !== -100) difference = value - value / (1 + percent / 100);
    return { percent, difference, caption: config.reference_name ?? caption, captionShort: config.reference_name ?? captionShort };
  }

  // "+11.6 %" / "−8.0 %", absolute "+2.0 °C"
  private changeText(amount: number, unit: string, decimals: number): string {
    const rounded = Number(amount.toFixed(decimals));
    const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
    return `${sign}${formatNumber(this.hass, Math.abs(rounded), decimals)}${unit ? ` ${unit}` : ""}`;
  }


  // value, band color and scale shared by both layouts
  private model() {
    const config = this.config!;
    const style = config.style === "gradient" ? "gradient" : config.style === "change" ? "change" : "level";
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
    // decimals: option, otherwise the display precision of the entity, otherwise 1
    const precision = Number((this.hass as unknown as { entities?: Record<string, { display_precision?: number }> })
      ?.entities?.[config.entity]?.display_precision);
    const decimals = config.decimals ?? (Number.isFinite(precision) ? precision : 1);
    const valueText = hasValue ? formatNumber(this.hass, value, decimals) : "–";
    // change: share of half the bar, direction and whether the change runs beyond the scale
    let change: ChangeModel | undefined;
    let changeVariables = "";
    let direction = "";
    let tone = "";
    let beyond = false;
    let changeAmount: number | undefined;
    const absolute = config.change_mode === "absolute";
    if (style === "change") {
      change = this.changeModel(stateObj, value, hasValue, decimals);
      const scale = Number(config.scale) > 0 ? Number(config.scale) : 20;
      changeAmount = absolute ? change.difference : change.percent;
      if (changeAmount !== undefined) {
        direction = changeAmount > 0 ? "up" : changeAmount < 0 ? "down" : "";
        // gain is green, loss red; inverted (consumption) the other way round
        if (direction) tone = (direction === "up") !== !!config.invert ? "gain" : "loss";
        beyond = Math.abs(changeAmount) > scale;
        changeVariables = ` --change-share: ${Math.min(50, (Math.abs(changeAmount) / scale) * 50)}%;`;
      }
    }
    return { style, stateObj, hasValue, unit, name, variables: variables + changeVariables, hasLow, empty, low, interactive,
      valueText, change, direction, tone, beyond, changeAmount, absolute, decimals };
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
    const offline = isUnavailable(model.stateObj);
    const classes = ["tile", model.style, model.hasValue ? "" : "novalue", offline ? "unavailable" : "", model.empty ? "empty" : "",
      model.low ? "low" : "", model.interactive ? "interactive" : ""].filter(Boolean).join(" ");
    // a consumable that runs out says so on the right, otherwise the secondary value
    const status = model.empty || model.low ? this.statusText(model) : "";
    const secondary = status || this.secondaryText();
    if (model.style === "change") return this.renderChangeTile(model, classes);
    return html`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : nothing}
      tabindex=${model.interactive ? "0" : nothing} aria-label=${model.name}>${model.interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${this.renderIcon(model.stateObj)}<div class="name">${model.name}</div><div
      class="value-row"><div class="value">${model.valueText}${model.hasValue && model.unit
      ? html`<span class="unit">${model.unit}</span>` : nothing}</div>${secondary ? html`<div class=${status ? "secondary status"
      : "secondary"}>${!status && config.secondary_icon ? html`<ha-icon .icon=${config.secondary_icon}></ha-icon>` : nothing}${secondary}</div>`
      : nothing}</div><div class="bar"><div class="fill"></div>${model.style === "gradient" ? html`<div class="needle"></div>`
      : nothing}</div><div class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>`;
  }

  // change in percent or in the unit, colored by gain or loss (sign and color are enough, no arrow)
  private renderChange(model: ReturnType<GraphiteMeter["model"]>) {
    const amount = model.changeAmount;
    if (amount === undefined) return html`<span class="delta">–</span>`;
    const config = this.config!;
    const text = model.absolute
      ? this.changeText(amount, model.unit, config.change_decimals ?? model.decimals)
      : this.changeText(amount, "%", config.change_decimals ?? 1);
    return html`<span class="delta">${text}</span>`;
  }

  // change tile: name and reference on top, value and change, bar with the needle in the middle.
  // Narrow tiles keep this order: the reference gets shorter ("Kauf"), very narrow ones drop the unit
  // (container queries), so bought and watched prices stay apart
  private renderChangeTile(model: ReturnType<GraphiteMeter["model"]>, baseClasses: string) {
    const caption = model.change?.caption ?? "";
    const classes = [baseClasses, model.direction, model.tone, model.beyond ? "beyond" : "", caption ? "captioned" : ""]
      .filter(Boolean).join(" ");
    return html`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : nothing}
      tabindex=${model.interactive ? "0" : nothing} aria-label=${model.name}>${model.interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}<div class="name">${model.name}</div>${caption
      ? html`<div class="reference"><span class="long">${caption}</span><span class="short">${model.change?.captionShort
      || caption}</span></div>` : nothing}<div class="value-row"><div class="value">${model.valueText}${model.hasValue
      && model.unit ? html`<span class="unit">${model.unit}</span>` : nothing}</div><div class="secondary">${this.renderChange(model)}</div></div><div
      class="bar"><div class="fill"></div><div class="needle"></div></div><div class="offline">${offlineDot}<span>${this
      .localize("rows.offline")}</span></div></div>`;
  }

  // row: name and status line on the left, the value on the right, the bar along the bottom
  private renderRow() {
    const model = this.model();
    const offline = isUnavailable(model.stateObj);
    let status: unknown = this.statusText(model) || this.secondaryText();
    if (model.style === "change") {
      const caption = model.change?.caption;
      status = html`${this.renderChange(model)}${caption ? html`<span class="caption">· ${caption}</span>` : nothing}`;
    }
    if (offline && model.stateObj) {
      status = this.localize("rows.since", { state: this.localize("rows.unavailable"),
        since: sinceText(new Date(model.stateObj.last_changed), this.language) });
    }
    const classes = ["row", model.style, model.hasValue ? "" : "novalue", offline ? "unavailable" : "", model.empty ? "empty" : "",
      model.low ? "low" : "", model.interactive ? "interactive" : "", model.direction, model.tone, model.beyond ? "beyond" : ""]
      .filter(Boolean).join(" ");
    return html`<div class=${classes} style=${model.variables} role=${model.interactive ? "button" : nothing}
      tabindex=${model.interactive ? "0" : nothing} aria-label=${model.name}>${model.interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}<div class="name">${model.name}</div>${status ? html`<div class="status">${status}</div>`
      : nothing}<div class="value">${offline ? this.localize("rows.offline") : html`${model.valueText}${model.hasValue && model.unit
      ? html`<span class="unit">${model.unit}</span>` : nothing}`}</div><div class="bar"><div class="fill"></div>${model.style === "gradient"
      || model.style === "change" ? html`<div class="needle"></div>` : nothing}</div></div>`;
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
  name: "Graphite Meter",
  description: "Sensor value with a color scale (gradient with needle), a level bar or the change against a reference (prices).",
});
