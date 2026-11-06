// Visual editor of graphite-light.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteLightEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "light.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { since_line: true, unavailable_sliders: "show", show_sliders: true };
  }

  protected schemaKey(): string {
    return String(this.config.show_sliders !== false);
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "light" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        ],
      },
      { name: "show_sliders", selector: { boolean: {} } },
      ...(this.config.show_sliders === false ? [] : [
        { name: "sliders", selector: { select: { multiple: true, mode: "list", options: ["brightness", "color_temp", "hue", "saturation"]
          .map((value) => ({ value, label: this.optionLabel(`attributes.${value}`) })) } } },
        { name: "unavailable_sliders", selector: { select: { mode: "dropdown", options: ["show", "hide"]
          .map((value) => ({ value, label: this.optionLabel(`unavailableSliders.${value}`) })) } } },
      ]),
      {
        type: "grid",
        name: "",
        schema: [
          { name: "allow_off", selector: { boolean: {} } },
          { name: "wall_switch", selector: { boolean: {} } },
        ],
      },
      { name: "since_line", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }
}
