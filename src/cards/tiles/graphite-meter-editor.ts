// Visual editor of graphite-meter.
import { GraphiteFormEditor } from "../../core/form-editor";
import { layoutField, layoutOf } from "../../core/layout";

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
    return [
      layoutField(),
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "style", selector: { select: { mode: "dropdown", options: ["gradient", "level", "change"] } } },
        ],
      },
      ...(isChange ? [{
        type: "grid",
        name: "",
        schema: [
          { name: "reference", selector: { text: {} } },
          { name: "reference_name", selector: { text: {} } },
          { name: "change_attribute", selector: { text: {} } },
          { name: "scale", selector: { number: { mode: "box", min: 1, max: 1000 } } },
          { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "change_decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "unit", selector: { text: {} } },
          { name: "change_mode", selector: { select: { mode: "dropdown", options: ["percent", "absolute"]
            .map((value) => ({ value, label: this.optionLabel(`changeModes.${value}`) })) } } },
          { name: "invert", selector: { boolean: {} } },
        ],
      }] : [{
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "unit", selector: { text: {} } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "color", selector: { text: {} } },
          { name: "low", selector: { number: { mode: "box" } } },
        ],
      },
      { name: "colors", selector: { object: {} } }]),
      ...(isTile ? [{
        type: "grid",
        name: "",
        schema: [
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
          { name: "show_icon", selector: { boolean: {} } },
        ],
      }] : []),
      ...(isChange ? [] : [{ name: "secondary_entity", selector: { entity: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "secondary_decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
            { name: "secondary_unit", selector: { text: {} } },
            { name: "secondary_icon", selector: { icon: {} } },
          ],
        }]),
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  // selects and radios show their default as selected; a value equal to it is not stored
  protected defaults(): Record<string, unknown> {
    return { layout: "tile", style: "level" };
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "show_icon") return value !== true;
    if (key === "colors") return typeof value !== "object" || Object.keys(value as object).length === 0;
    return false;
  }
}
