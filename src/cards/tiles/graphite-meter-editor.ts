// Visual editor of graphite-meter.
import { GraphiteFormEditor } from "../../core/form-editor";
import { layoutOf } from "../../core/layout";

export class GraphiteMeterEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "meter.editor";
  }

  protected schemaKey(): string {
    return `${layoutOf(this.config, "tile")}|${this.config.style ?? "level"}`;
  }

  protected schema(): unknown[] {
    // the icon is a watermark of the tile; the row has none
    const isTile = layoutOf(this.config, "tile") === "tile";
    const isChange = this.config.style === "change";
    const decimals = { number: { mode: "box", min: 0, max: 4 } };
    return [
      this.layoutField(),
      { name: "entity", required: true, selector: { entity: {} } },
      this.grid(
        { name: "name", selector: { text: {} } },
        this.selectField("style", "styles", ["gradient", "level", "change"]),
      ),
      ...(isTile ? [this.grid(
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        { name: "show_icon", selector: { boolean: {} } },
      )] : []),
      ...(isChange ? [
        this.section("reference_change", [
          this.grid(
            { name: "reference", selector: { text: {} } },
            { name: "reference_name", selector: { text: {} } },
          ),
          { name: "change_attribute", selector: { text: {} } },
          this.grid(
            this.selectField("change_mode", "changeModes", ["percent", "absolute"]),
            { name: "scale", selector: { number: { mode: "box", min: 1, max: 1000 } } },
          ),
          { name: "invert", selector: { boolean: {} } },
        ], { expanded: true }),
        this.section("value_display", [
          this.grid(
            { name: "decimals", selector: decimals },
            { name: "change_decimals", selector: decimals },
            { name: "unit", selector: { text: {} } },
          ),
        ]),
      ] : [
        this.section("value_display", [
          this.grid(
            { name: "min", selector: { number: { mode: "box" } } },
            { name: "max", selector: { number: { mode: "box" } } },
          ),
          this.grid(
            { name: "decimals", selector: decimals },
            { name: "unit", selector: { text: {} } },
          ),
          { name: "low", selector: { number: { mode: "box" } } },
        ]),
        this.section("bar_colors", [
          { name: "color", selector: { text: {} } },
          // a map "value: color" in the YAML
          this.listField("colors", [
            { name: "value", required: true, selector: { number: { mode: "box", step: "any" } } },
            { name: "color", required: true, selector: { text: {} } },
          ], { labelField: "value", descriptionField: "color", map: { key: "value", value: "color", numericKey: true } }),
        ]),
        this.section("secondary", [
          { name: "secondary_entity", selector: { entity: {} } },
          this.grid(
            { name: "secondary_decimals", selector: decimals },
            { name: "secondary_unit", selector: { text: {} } },
            { name: "secondary_icon", selector: { icon: {} } },
          ),
        ]),
      ]),
      this.actionsSection(),
    ];
  }

  // selects and radios show their default as selected; a value equal to it is not stored
  protected defaults(): Record<string, unknown> {
    return { layout: "tile", style: "level" };
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "show_icon") return value !== true;
    if (key === "colors") return !value || typeof value !== "object" || Object.keys(value as object).length === 0;
    return false;
  }
}
