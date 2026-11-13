// graphite-slider: one slider without a surface of its own, e.g. the effect speed below the effect
// tiles of a panel. Works with number and input_number entities (their value) and lights: brightness
// (optionally down to off), white temperature, hue or saturation. The value snaps to whole steps
// (multiples of step), so a step of 5 gives 5, 10, 15 %.
import { css, html, nothing } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import "../../core/graphite-range";
import type { RangeTick, TickMode } from "../../core/graphite-range";
import { isUnavailable } from "../../core/format";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteSliderEditor } from "./graphite-slider-editor";
import { tileEdgeStyles } from "../../core/edge";

export type LightAttribute = "brightness" | "color_temp" | "hue" | "saturation";

export interface SliderConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  attribute?: LightAttribute;
  allow_off?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value_format?: "percent" | "state";
  // inline: label row above the slider, no surface (below effect tiles, in a light tile);
  // row: a card of its own (72px like the compact tiles), icon, name and value above the slider
  layout?: "inline" | "row";
  icon?: string;
  // ticks below the track: every step (auto while not too dense, else quarters), quarters or none
  ticks?: TickMode;
  // round values with a longer tick (default: a "nice" multiple of the step, 60 for minutes)
  major_every?: number;
  // ticks at multiples of this value instead of the steps (e.g. 10 on a 1 % slider); long every fifth
  tick_every?: number;
}

interface SliderModel {
  min: number;
  max: number;
  step: number;
  value: number;
  // the track runs from max to min (white temperature: cold left, warm right)
  reversed: boolean;
  mode: "fill" | "color";
  track: string;
  supported: boolean;
}

const colorModes = ["hs", "xy", "rgb", "rgbw", "rgbww"];
const hueTrack = "linear-gradient(90deg, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00)";
// the white temperature track of the Bubble slider (cold left, warm right)
const whiteTrack = "linear-gradient(90deg, rgb(210, 231, 255), rgb(243, 247, 255) 35%, rgb(255, 241, 224) 65%, rgb(255, 181, 107))";

export class GraphiteSlider extends GraphiteCard<SliderConfig> {
  static styles = css`
    :host {
      display: block;
    }
    .inline {
      display: flex;
      align-items: center;
      padding-top: 4px;
    }
    .inline graphite-range {
      flex: 1;
      min-width: 0;
    }
    /* row: 72px like the compact tiles; icon centered on the left, name and value in the first line,
       the slider below the name (text and slider at 60px) */
    .row {
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      grid-template-rows: 24px 20px;
      row-gap: 4px;
      column-gap: 10px;
      padding: 12px 14px 12px 8px;
      border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
      background: var(--graphite-card-surface, var(--graphite-surface-tile));
    }
    .head {
      display: contents;
    }
    /* icon box like the rows: 42px */
    .icon {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      color: var(--graphite-text-secondary);
      --mdc-icon-size: var(--graphite-row-icon-size, 24px);
    }
    .inline .icon {
      margin-right: 6px;
    }
    .row .icon {
      grid-row: 1 / 3;
      grid-column: 1;
      align-self: center;
    }
    :host([on]) .icon {
      color: var(--graphite-accent);
    }
    .name {
      min-width: 0;
      align-self: center;
      font-size: var(--graphite-font-name-size, 15px);
      line-height: 18px;
      color: var(--graphite-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row .name {
      grid-row: 1;
      grid-column: 2;
    }
    .value {
      align-self: center;
      margin-left: 12px;
      font-size: var(--graphite-font-name-size, 15px);
      line-height: 18px;
      color: var(--graphite-text-secondary);
      white-space: nowrap;
    }
    .row .value {
      grid-row: 1;
      grid-column: 3;
    }
    .row graphite-range {
      grid-row: 2;
      grid-column: 2 / 4;
    }
    :host([inactive]) graphite-range,
    :host([inactive]) .value {
      opacity: 0.5;
    }
    ${tileEdgeStyles(".row")}
  `;

  private dragValue?: number;
  // hue is a circle: 360° and 0° are the same color and the lamp may report either one; the last set
  // hue keeps its side, so the knob does not jump from one end to the other
  private setHue?: number;

  private pinnedHue(hue: number): number {
    if (!Number.isFinite(hue) || this.setHue === undefined) return hue;
    const distance = Math.abs(((hue - this.setHue) % 360 + 540) % 360 - 180);
    if (distance <= 1) return this.setHue;
    this.setHue = undefined;
    return hue;
  }

  protected normalizeConfig(config: SliderConfig): SliderConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return config;
  }

  private isLight(): boolean {
    return this.config!.entity.startsWith("light.");
  }

  private attribute(): LightAttribute {
    return this.config!.attribute ?? "brightness";
  }

  private configNumber(key: "min" | "max" | "step", fallback: number): number {
    const value = Number(this.config![key]);
    return this.config![key] !== undefined && Number.isFinite(value) ? value : fallback;
  }

  private lightModel(stateObj: HassEntity): SliderModel {
    const attributes = stateObj.attributes;
    const isOn = stateObj.state === "on";
    const modes: string[] = attributes.supported_color_modes ?? [];
    const attribute = this.attribute();
    if (attribute === "color_temp") {
      const min = this.configNumber("min", Number(attributes.min_color_temp_kelvin ?? 2000));
      const max = this.configNumber("max", Number(attributes.max_color_temp_kelvin ?? 6500));
      return { min, max, step: this.configNumber("step", 50), value: Number(attributes.color_temp_kelvin ?? NaN),
        reversed: true, mode: "color", track: whiteTrack, supported: modes.includes("color_temp") };
    }
    const hs: number[] | undefined = attributes.hs_color;
    if (attribute === "hue") {
      return { min: 0, max: 360, step: this.configNumber("step", 1), value: this.pinnedHue(Number(hs?.[0] ?? NaN)), reversed: false,
        mode: "color", track: hueTrack, supported: modes.some((mode) => colorModes.includes(mode)) };
    }
    if (attribute === "saturation") {
      const hue = Number(hs?.[0] ?? 0);
      return { min: 0, max: 100, step: this.configNumber("step", 1), value: Number(hs?.[1] ?? NaN), reversed: false,
        mode: "color", track: `linear-gradient(90deg, #fff, hsl(${hue}, 100%, 50%))`,
        supported: modes.some((mode) => colorModes.includes(mode)) };
    }
    const allowOff = !!this.config!.allow_off;
    const brightness = isOn ? Math.round(Number(attributes.brightness ?? 0) / 2.55) : 0;
    return { min: this.configNumber("min", allowOff ? 0 : 1), max: this.configNumber("max", 100), step: this.configNumber("step", 1),
      value: brightness, reversed: false, mode: "fill", track: "", supported: true };
  }

  private model(): SliderModel | null {
    const stateObj = this.hass?.states[this.config!.entity];
    if (!stateObj) return null;
    const model = this.isLight() ? this.lightModel(stateObj) : {
      min: this.configNumber("min", Number(stateObj.attributes.min ?? 0)),
      max: this.configNumber("max", Number(stateObj.attributes.max ?? 100)),
      step: this.configNumber("step", Number(stateObj.attributes.step ?? 1)),
      value: parseFloat(stateObj.state),
      reversed: false,
      mode: "fill" as const,
      track: "",
      supported: true,
    };
    if (!(model.max > model.min)) model.max = model.min + 1;
    if (!(model.step > 0)) model.step = 1;
    return model;
  }

  private decimals(step: number): number {
    const text = String(step);
    return text.includes(".") ? text.split(".")[1].length : 0;
  }

  // value of a share: whole multiples of the step, kept inside min and max
  private valueOf(model: SliderModel, share: number): number {
    const position = model.reversed ? 1 - share : share;
    const raw = model.min + position * (model.max - model.min);
    const stepped = Math.round(raw / model.step) * model.step;
    return Number(Math.min(model.max, Math.max(model.min, stepped)).toFixed(this.decimals(model.step)));
  }

  private shareOf(model: SliderModel, value: number): number {
    if (!Number.isFinite(value)) return 0;
    const share = Math.min(1, Math.max(0, (value - model.min) / (model.max - model.min)));
    return model.reversed ? 1 - share : share;
  }

  private valueText(model: SliderModel, value: number): string {
    if (!Number.isFinite(value)) return "";
    if (this.isLight()) {
      const attribute = this.attribute();
      if (attribute === "color_temp") return `${Math.round(value)} K`;
      if (attribute === "hue") return `${Math.round(value)}°`;
      // brightness and saturation are percentages already
      return `${Math.round(value)} %`;
    }
    if (this.config!.value_format === "state") {
      const stateObj = this.hass!.states[this.config!.entity];
      return this.hass?.formatEntityState?.(stateObj, String(value)) ?? String(value);
    }
    return `${Math.round(((value - model.min) / (model.max - model.min)) * 100)} %`;
  }

  // a round multiple of the step for the longer ticks: 60 for minutes, otherwise the smallest nice
  // number that gives at most 10 intervals
  private majorEvery(model: SliderModel): number {
    const configured = Number(this.config!.major_every);
    if (configured > 0) return configured;
    const isMultiple = (value: number) => Math.abs(value / model.step - Math.round(value / model.step)) < 1e-6;
    const unit = this.hass?.states[this.config!.entity]?.attributes?.unit_of_measurement;
    if (unit === "min" && isMultiple(60)) return 60;
    const span = model.max - model.min;
    for (let magnitude = 1e-3; magnitude <= 1e6; magnitude *= 10) {
      for (const factor of [1, 2, 2.5, 5]) {
        const candidate = Number((factor * magnitude).toPrecision(6));
        if (candidate >= model.step && isMultiple(candidate) && span / candidate <= 10) return candidate;
      }
    }
    return span;
  }

  // one tick per step (whole multiples of the step, like the values) plus both ends
  private stepTicks(model: SliderModel): RangeTick[] {
    const span = model.max - model.min;
    const count = Math.floor(model.max / model.step) - Math.ceil(model.min / model.step) + 1;
    if (count > 400) return [];
    const major = this.majorEvery(model);
    const ticks: RangeTick[] = [{ share: 0, major: true }];
    for (let index = Math.ceil(model.min / model.step); index <= Math.floor(model.max / model.step); index++) {
      const value = index * model.step;
      const share = (value - model.min) / span;
      if (share <= 1e-6 || share >= 1 - 1e-6) continue;
      const ratio = value / major;
      ticks.push({ share: model.reversed ? 1 - share : share, major: Math.abs(ratio - Math.round(ratio)) < 1e-6 });
    }
    ticks.push({ share: 1, major: true });
    return ticks;
  }

  // ticks every tick_every (independent of the step) plus both ends; long ticks every major_every
  // (default: five ticks)
  private markTicks(model: SliderModel): RangeTick[] | undefined {
    const every = Number(this.config!.tick_every);
    if (!(every > 0)) return undefined;
    const span = model.max - model.min;
    if (span / every > 400) return undefined;
    const major = Number(this.config!.major_every) > 0 ? Number(this.config!.major_every) : every * 5;
    const ticks: RangeTick[] = [{ share: 0, major: true }];
    for (let index = Math.ceil(model.min / every); index <= Math.floor(model.max / every); index++) {
      const value = index * every;
      const share = (value - model.min) / span;
      if (share <= 1e-6 || share >= 1 - 1e-6) continue;
      const ratio = value / major;
      ticks.push({ share: model.reversed ? 1 - share : share, major: Math.abs(ratio - Math.round(ratio)) < 1e-6 });
    }
    ticks.push({ share: 1, major: true });
    return ticks;
  }

  private onInput = (event: CustomEvent) => {
    const model = this.model();
    if (!model) return;
    this.dragValue = this.valueOf(model, event.detail.share);
    this.requestUpdate();
  };

  private onChange = (event: CustomEvent) => {
    const model = this.model();
    if (!model || !this.hass) return;
    const value = this.valueOf(model, event.detail.share);
    const entity = this.config!.entity;
    const target = { entity_id: entity };
    if (this.isLight()) {
      const attributes = this.hass.states[entity]?.attributes ?? {};
      const hs: number[] = attributes.hs_color ?? [0, 100];
      const attribute = this.attribute();
      if (attribute === "color_temp") this.hass.callService("light", "turn_on", { color_temp_kelvin: value }, target);
      else if (attribute === "hue") {
        this.setHue = value;
        this.hass.callService("light", "turn_on", { hs_color: [value % 360, hs[1] || 100] }, target);
      }
      else if (attribute === "saturation") this.hass.callService("light", "turn_on", { hs_color: [hs[0] ?? 0, value] }, target);
      else if (value <= 0) this.hass.callService("light", "turn_off", {}, target);
      else this.hass.callService("light", "turn_on", { brightness_pct: value }, target);
    } else {
      const domain = entity.split(".")[0] === "input_number" ? "input_number" : "number";
      this.hass.callService(domain, "set_value", { value }, target);
    }
    this.dragValue = value;
    this.requestUpdate();
  };

  private label(stateObj: HassEntity | undefined): string {
    const config = this.config!;
    if (config.name) return config.name;
    if (this.isLight()) return this.localize(`slider.${this.attribute()}`);
    return stateObj?.attributes?.friendly_name ?? config.entity;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.hass?.states[config.entity];
    const model = this.model();
    const offline = isUnavailable(stateObj);
    const usable = !!model && !offline && model.supported;
    // lights that are off: quiet fill like the light tile
    this.toggleAttribute("inactive", !usable);
    this.style.setProperty("--graphite-slider-fill", this.isLight() && stateObj?.state !== "on" ? "var(--graphite-text-muted)" : "");
    // the dragged value until Home Assistant reports the new state
    if (this.dragValue !== undefined && model && Math.abs(model.value - this.dragValue) < model.step / 2) this.dragValue = undefined;
    const value = this.dragValue ?? model?.value ?? NaN;
    const range = model ? Math.abs(model.max - model.min) : 1;
    const isRow = config.layout === "row";
    const valueText = model && usable ? this.valueText(model, value) : "";
    this.toggleAttribute("on", this.isLight() && stateObj?.state === "on");
    const slider = html`<graphite-range .label=${isRow ? "" : this.label(stateObj)} .valueText=${isRow ? "" : valueText}
      .share=${model ? this.shareOf(model, model.value) : 0} .keyStep=${model ? model.step / range : 0.01}
      .mode=${model?.mode ?? "fill"} .track=${model?.track ?? ""} ?disabled=${!usable} ?compact=${isRow}
      .stepTicks=${model ? this.stepTicks(model) : []} .markTicks=${model ? this.markTicks(model) : undefined}
      .tickMode=${config.ticks ?? "auto"}
      @range-input=${this.onInput} @range-change=${this.onChange}></graphite-range>`;
    // the row shows the entity icon unless an icon is set; inline only a configured icon
    const icon = config.icon
      ? html`<div class="icon"><ha-icon .icon=${config.icon}></ha-icon></div>`
      : isRow ? html`<div class="icon"><ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon></div>` : nothing;
    if (isRow) {
      return html`<div class="row"><div class="head">${icon}<div class="name">${this.label(stateObj)}</div><div
        class="value">${valueText}</div></div>${slider}</div>`;
    }
    return html`<div class="inline">${icon}${slider}</div>`;
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("number.") || id.startsWith("input_number.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-slider-editor");
  }
}

registerElement("graphite-slider-editor", GraphiteSliderEditor);
registerCard("graphite-slider", GraphiteSlider, {
  name: "Graphite Slider",
  description: "A single slider without a surface: number, input_number, or brightness, white temperature, hue or saturation of a light.",
});
