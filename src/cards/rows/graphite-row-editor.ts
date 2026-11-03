// Visual editor of graphite-status-row and graphite-switch-row (one form, wall_switch only for status rows).
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteRowEditor extends GraphiteFormEditor {
  rowKind: "status" | "switch" = "status";

  protected labelPrefix(): string {
    return "rows.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        ],
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
      { name: "since_line", selector: { boolean: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "since_attribute", selector: { text: {} } },
          { name: "since_attribute_label", selector: { text: {} } },
        ],
      },
      { name: "detail_entities", selector: { object: {} } },
      { name: "online_entity", selector: { entity: {} } },
      ...(this.rowKind === "status" ? [{ name: "wall_switch", selector: { boolean: {} } }] : []),
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "detail_entities") return !Array.isArray(value) || value.length === 0;
    if (key === "wall_switch") return value !== true;
    return false;
  }
}
