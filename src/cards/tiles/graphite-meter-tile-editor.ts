// Visual editor of graphite-meter-tile.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteMeterTileEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "meter.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "style", selector: { select: { mode: "dropdown", options: ["gradient", "level"] } } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "unit", selector: { text: {} } },
        ],
      },
      { name: "colors", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
          { name: "show_icon", selector: { boolean: {} } },
        ],
      },
      { name: "secondary_entity", selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "secondary_decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "secondary_unit", selector: { text: {} } },
          { name: "secondary_icon", selector: { icon: {} } },
        ],
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "show_icon") return value !== true;
    if (key === "colors") return typeof value !== "object" || Object.keys(value as object).length === 0;
    return false;
  }
}
