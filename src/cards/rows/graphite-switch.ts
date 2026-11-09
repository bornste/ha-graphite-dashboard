// graphite-switch: a switch as a row (toggle on the right, "since" line) or as a tile (toggle top left,
// name bottom left, icon as watermark). Tapping switches the entity in both layouts; an optional
// online_entity shows whether the device behind the switch is reachable.
import { html, nothing, type CSSResultGroup } from "lit";
import { defaultHoldAction } from "../../core/actions";
import { layoutOf } from "../../core/layout";
import { offlineDot } from "../../core/offline-dot";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, HassEntity } from "../../core/types";
import { tileStyles } from "../tiles/tile-styles";
import { GraphiteRow } from "./graphite-row";
import { GraphiteRowEditor } from "./graphite-row-editor";
import { rowStyles } from "./row-styles";

export class GraphiteSwitch extends GraphiteRow {
  static styles: CSSResultGroup = [];

  protected stylesForConfig() {
    return layoutOf(this.config, "row") === "tile" ? tileStyles : rowStyles;
  }

  protected defaultActions(entity: string): { tap_action: ActionConfig; hold_action: ActionConfig } {
    return { tap_action: { action: "toggle" }, hold_action: defaultHoldAction(entity) };
  }

  protected rowClasses(stateObj: HassEntity | undefined): string[] {
    const classes = super.rowClasses(stateObj);
    if (classes.includes("on") && !classes.includes("unavailable")) classes.push("active");
    return classes;
  }

  protected renderEnd() {
    return html`<div class="toggle"></div>`;
  }

  protected render() {
    if (layoutOf(this.config, "row") === "row") return super.render();
    const config = this.config!;
    const stateObj = this.hass?.states[config.entity];
    const interactive = this.isInteractive(stateObj);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const classes = ["tile", ...this.rowClasses(stateObj).slice(1)].join(" ");
    return html`<div class=${classes} role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}
      aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div class="watermark">${this
      .renderIcon(stateObj)}</div><div class="toggle"></div><div class="name">${name}</div><div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>`;
  }

  getCardSize(): number {
    return layoutOf(this.config, "row") === "tile" ? 2 : 1;
  }

  getGridOptions() {
    return layoutOf(this.config, "row") === "tile"
      ? { columns: 3, rows: 2, min_columns: 2 }
      : { columns: 12, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("switch.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    const editor = document.createElement("graphite-row-editor") as GraphiteRowEditor;
    editor.rowKind = "switch";
    return editor;
  }
}

registerElement("graphite-row-editor", GraphiteRowEditor);
registerCard("graphite-switch", GraphiteSwitch, {
  name: "Graphite Switch",
  description: "Switch as a row (toggle on the right) or a tile (toggle, name, watermark icon); tapping switches.",
});
