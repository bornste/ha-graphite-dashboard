// Visual editor of graphite-slider: lights get the attribute (and "off at 0" for the brightness),
// numbers the value display.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteSliderEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "slider.editor";
  }

  private isLight(): boolean {
    return String(this.config.entity ?? "").startsWith("light.");
  }

  protected skipValue(key: string, value: unknown): boolean {
    return key === "layout" && value === "inline";
  }

  protected schemaKey(): string {
    return `${this.isLight()}|${this.config.attribute ?? "brightness"}`;
  }

  protected schema(): unknown[] {
    const attribute = this.config.attribute ?? "brightness";
    const lightFields = [
      { name: "attribute", selector: { select: { mode: "dropdown", options: ["brightness", "color_temp", "hue", "saturation"]
        .map((value) => ({ value, label: this.optionLabel(`attributes.${value}`) })) } } },
      ...(attribute === "brightness" ? [{ name: "allow_off", selector: { boolean: {} } }] : []),
    ];
    const numberFields = [
      { name: "value_format", selector: { select: { mode: "dropdown", options: ["percent", "state"]
        .map((value) => ({ value, label: this.optionLabel(`valueFormat.${value}`) })) } } },
    ];
    return [
      { name: "entity", required: true, selector: { entity: { domain: ["number", "input_number", "light"] } } },
      { name: "layout", selector: { select: { mode: "list", options: ["inline", "row"]
        .map((value) => ({ value, label: this.optionLabel(`layouts.${value}`) })) } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        ],
      },
      ...(this.isLight() ? lightFields : numberFields),
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box", step: "any" } } },
          { name: "max", selector: { number: { mode: "box", step: "any" } } },
          { name: "step", selector: { number: { mode: "box", step: "any" } } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "ticks", selector: { select: { mode: "dropdown", options: ["auto", "steps", "quarters", "none"]
            .map((value) => ({ value, label: this.optionLabel(`tickModes.${value}`) })) } } },
          { name: "tick_every", selector: { number: { mode: "box", step: "any" } } },
          { name: "major_every", selector: { number: { mode: "box", step: "any" } } },
        ],
      },
    ];
  }
}
