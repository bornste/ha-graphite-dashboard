// graphite-light: a lamp as a tile. The head is a switch row (icon, name, "since" line, toggle on the
// right), below it sliders for brightness and white temperature (or color, saturation), aligned with
// the name. Tapping the tile outside the sliders toggles the lamp, holding opens more-info. With
// wall_switch the lamp is switched at the wall: a quiet wall switch icon replaces the toggle, an
// unavailable lamp counts as "off at the wall" and tapping does nothing by default.
// Geometry of the former Bubble light tile: 12px padding, 36px head (icon 42px at 8/9, name at 60px),
// sliders 42px each from 58px with 12px between, toggle / icon 14px from the right edge.
import { css, html, nothing, type CSSResultGroup } from "lit";
import { defaultHoldAction } from "../../core/actions";
import { isUnavailable } from "../../core/format";
import { offlineDot } from "../../core/offline-dot";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, HassEntity } from "../../core/types";
import { GraphiteRow, type RowConfig } from "../rows/graphite-row";
import { rowStyles } from "../rows/row-styles";
import "./graphite-slider";
import type { LightAttribute } from "./graphite-slider";
import { GraphiteLightEditor } from "./graphite-light-editor";

export interface LightConfig extends RowConfig {
  sliders?: LightAttribute[];
  allow_off?: boolean;
  wall_switch_icon?: string;
  // unreachable lamp or off at the wall: keep the sliders (locked, the layout stays) or hide them
  unavailable_sliders?: "show" | "hide";
  // false: only the head, no sliders at all
  show_sliders?: boolean;
}

const sliderOrder: LightAttribute[] = ["brightness", "color_temp", "hue", "saturation"];

const lightStyles = css`
  .row.light {
    display: block;
    height: auto;
    padding: 12px;
  }
  /* on: soft accent tint, weaker than the switch tile (the sliders carry more surface) */
  .row.light.active {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-light-tint, 10%), var(--graphite-surface-tile-active));
  }
  .head {
    position: relative;
    display: flex;
    align-items: center;
    height: 36px;
  }
  .row.light .icon {
    margin: -3px 10px -3px -4px;
  }
  .row.light .toggle {
    margin: 0 2px 0 12px;
  }
  .row.light .offline {
    margin: 0 2px 0 auto;
  }
  /* wall switch: an icon in the toggle's place, no surface (it is no button) */
  .wall-switch {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin: 0 2px 0 12px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: 24px;
  }
  .row.light:not(.on) .wall-switch {
    opacity: 0.5;
  }
  /* sliders aligned with the name (60px) and the toggle (14px from the right) */
  .sliders {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 6px 2px 0 48px;
  }
  .row.light.unavailable .sliders {
    pointer-events: none;
  }
`;

export class GraphiteLight extends GraphiteRow {
  static styles: CSSResultGroup = [rowStyles, lightStyles];

  private get lightConfig(): LightConfig {
    return this.config as LightConfig;
  }

  protected defaultActions(entity: string): { tap_action: ActionConfig; hold_action: ActionConfig } {
    return { tap_action: { action: "toggle" }, hold_action: defaultHoldAction(entity) };
  }

  protected normalizeConfig(config: RowConfig): RowConfig {
    const normalized = super.normalizeConfig(config);
    // a wall switch lamp is switched at the wall: tapping does nothing unless configured
    if (config.wall_switch && !config.tap_action) normalized.tap_action = { action: "none" };
    return normalized;
  }

  protected rowClasses(stateObj: HassEntity | undefined): string[] {
    const classes = super.rowClasses(stateObj);
    classes.splice(1, 0, "light");
    if (classes.includes("on") && !classes.includes("unavailable")) classes.push("active");
    return classes;
  }

  // brightness, and the white temperature when the lamp supports it. While the lamp is unreachable
  // (or off at the wall) the sliders stay locked in place, or are hidden with unavailable_sliders: hide
  private sliderAttributes(stateObj: HassEntity | undefined): LightAttribute[] {
    if (this.lightConfig.show_sliders === false) return [];
    if (isUnavailable(stateObj) && this.lightConfig.unavailable_sliders === "hide") return [];
    const configured = this.lightConfig.sliders;
    // an empty list means the default, like a missing one
    // always in the same order, whatever order they were picked in
    if (Array.isArray(configured) && configured.length > 0) return sliderOrder.filter((attribute) => configured.includes(attribute));
    const modes: string[] = stateObj?.attributes?.supported_color_modes ?? [];
    const sliders: LightAttribute[] = [];
    if (!modes.length || modes.some((mode) => mode !== "onoff")) sliders.push("brightness");
    if (modes.includes("color_temp")) sliders.push("color_temp");
    return sliders;
  }

  protected renderEnd(stateObj: HassEntity | undefined) {
    if (this.config!.wall_switch) {
      return html`<div class="wall-switch"><ha-icon .icon=${this.lightConfig.wall_switch_icon
        ?? "ic:twotone-electrical-services"}></ha-icon></div>`;
    }
    return stateObj ? html`<div class="toggle"></div>` : nothing;
  }

  protected render() {
    const config = this.lightConfig;
    const stateObj = this.hass?.states[config.entity];
    const unavailable = this.unavailable(stateObj);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const since = this.sinceLine(stateObj);
    const interactive = this.isInteractive(stateObj);
    const sliders = this.sliderAttributes(stateObj);
    return html`<div class=${this.rowClasses(stateObj).join(" ")} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div
      class="head"><div class="icon">${this.renderIcon(stateObj)}</div><div class="text"><div class="name">${name}</div>${since
      ? html`<div class="since">${since}</div>` : nothing}</div>${this.renderEnd(stateObj)}<div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>${sliders.length
      ? html`<div class="sliders">${sliders.map((attribute) => html`<graphite-slider .hass=${this.hass}
        .config=${{ type: "custom:graphite-slider", entity: config.entity, attribute,
          ...(attribute === "brightness" && config.allow_off ? { allow_off: true } : {}),
          // ticks only for the brightness; the color tracks speak for themselves
          ...(attribute === "brightness" ? {} : { ticks: "none" }) }}></graphite-slider>`)}</div>`
      : nothing}</div>`;
  }

  getCardSize(): number {
    return 1 + this.sliderAttributes(this.hass?.states[this.config!.entity]).length;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("light.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-light-editor");
  }
}

registerElement("graphite-light-editor", GraphiteLightEditor);
registerCard("graphite-light", GraphiteLight, {
  name: "Graphite Light",
  description: "Lamp as a tile: switch row head (toggle or wall switch) with brightness and white temperature sliders.",
});
