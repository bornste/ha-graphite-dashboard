// Visual editor of graphite-stopwatch-tile.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteStopwatchTileEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "stopwatch.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon_position", selector: { select: { mode: "dropdown", options: ["watermark", "left"] } } },
          { name: "color", selector: { text: {} } },
        ],
      },
      { name: "picture_entity", selector: { entity: {} } },
      { name: "limit", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "warn_before", selector: { number: { mode: "box", min: 0 } } },
          { name: "day_start", selector: { text: {} } },
        ],
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "limit") return value === null || (typeof value === "object" && Object.keys(value as object).length === 0);
    if (key === "icon_position") return value === "watermark";
    return false;
  }
}
