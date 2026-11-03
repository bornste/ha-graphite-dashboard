// graphite-switch-row: row with a toggle on the right; tapping the row switches the entity.
import { html } from "lit";
import { defaultHoldAction } from "../../core/actions";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, HassEntity } from "../../core/types";
import { GraphiteRow } from "./graphite-row";
import { GraphiteRowEditor } from "./graphite-row-editor";

export class GraphiteSwitchRow extends GraphiteRow {
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
registerCard("graphite-switch-row", GraphiteSwitchRow, {
  name: "Graphite Switch Row",
  description: "Row with icon, name, \"since\" line and a toggle; tapping the row switches.",
});
