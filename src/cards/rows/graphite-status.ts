// graphite-status: display row with the state as value on the right (windows, lamps, sensors).
// Only the row layout for now, so the editor shows no layout choice.
import { html } from "lit";
import { defaultHoldAction } from "../../core/actions";
import { formatState } from "../../core/format";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, HassEntity } from "../../core/types";
import { GraphiteRow, isActiveState } from "./graphite-row";
import { GraphiteRowEditor } from "./graphite-row-editor";

export class GraphiteStatus extends GraphiteRow {
  protected defaultActions(entity: string): { tap_action: ActionConfig; hold_action: ActionConfig } {
    // tapping does nothing by default, holding opens more-info
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(entity) };
  }

  protected rowClasses(stateObj: HassEntity | undefined): string[] {
    const classes = super.rowClasses(stateObj);
    // measured values (entity with a unit) are never tinted
    const isMeasurement = !!stateObj?.attributes?.unit_of_measurement;
    if (!isMeasurement && !classes.includes("unavailable") && isActiveState(stateObj?.state)) classes.push("active");
    return classes;
  }

  protected renderEnd(stateObj: HassEntity | undefined) {
    if (!stateObj) return html`<div class="value"></div>`;
    // a wall switch lamp switched off at the wall shows "off" like the other lamps
    const shown = this.config!.wall_switch && ["unavailable", "unknown"].includes(stateObj.state)
      ? { ...stateObj, state: "off" }
      : stateObj;
    return html`<div class="value">${formatState(this.hass, shown)}</div>`;
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("binary_sensor.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    const editor = document.createElement("graphite-row-editor") as GraphiteRowEditor;
    editor.rowKind = "status";
    return editor;
  }
}

registerElement("graphite-row-editor", GraphiteRowEditor);
registerCard("graphite-status", GraphiteStatus, {
  name: "Graphite Status",
  description: "Row with icon, name, \"since\" line and the state on the right.",
  aliases: ["graphite-status-row"],
});
