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

  // the layout radio shows the default as selected; a value equal to it is not stored
  protected defaults(): Record<string, unknown> {
    return { layout: "inline", attribute: "brightness" };
  }

  protected schemaKey(): string {
    return `${this.isLight()}|${this.config.attribute ?? "brightness"}`;
  }

  protected schema(): unknown[] {
    const attribute = this.config.attribute ?? "brightness";
    const numberBox = { number: { mode: "box", step: "any" } };
    const lightFields = [
      this.selectField("attribute", "attributes", ["brightness", "color_temp", "hue", "saturation"]),
      ...(attribute === "brightness" ? [{ name: "allow_off", selector: { boolean: {} } }] : []),
    ];
    const numberFields = [this.selectField("value_format", "valueFormat", ["percent", "state"])];
    return [
      { name: "entity", required: true, selector: { entity: { domain: ["number", "input_number", "light"] } } },
      this.selectField("layout", "layouts", ["inline", "row"], "list"),
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      ...(this.isLight() ? lightFields : numberFields),
      this.section("range", [
        this.grid(
          { name: "min", selector: numberBox },
          { name: "max", selector: numberBox },
          { name: "step", selector: numberBox },
        ),
      ]),
      this.section("tick_marks", [
        this.selectField("ticks", "tickModes", ["auto", "steps", "quarters", "none"]),
        this.grid(
          { name: "tick_every", selector: numberBox },
          { name: "major_every", selector: numberBox },
        ),
      ]),
    ];
  }
}
