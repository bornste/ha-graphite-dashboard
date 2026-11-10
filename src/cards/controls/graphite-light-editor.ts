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
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      this.section("slider_options", [
        { name: "show_sliders", selector: { boolean: {} } },
        ...(this.config.show_sliders === false ? [] : [
          { name: "sliders", selector: { select: { multiple: true, mode: "list", options: ["brightness", "color_temp", "hue", "saturation"]
            .map((value) => ({ value, label: this.optionLabel(`attributes.${value}`) })) } } },
          this.selectField("unavailable_sliders", "unavailableSliders", ["show", "hide"]),
          { name: "allow_off", selector: { boolean: {} } },
        ]),
      ]),
      this.section("display", [
        { name: "since_line", selector: { boolean: {} } },
        { name: "wall_switch", selector: { boolean: {} } },
      ]),
      this.actionsSection(),
    ];
  }
}
