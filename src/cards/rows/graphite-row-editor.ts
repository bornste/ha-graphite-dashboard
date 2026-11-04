// Visual editor of graphite-status and graphite-switch (one form: wall_switch only for the status,
// the layout choice only for the switch; the "since" options only in the row layout).
import { GraphiteFormEditor } from "../../core/form-editor";
import { layoutField, layoutOf } from "../../core/layout";

export class GraphiteRowEditor extends GraphiteFormEditor {
  rowKind: "status" | "switch" = "status";

  protected labelPrefix(): string {
    return "rows.editor";
  }

  protected schemaKey(): string {
    return layoutOf(this.config, "row");
  }

  protected schema(): unknown[] {
    const isRow = this.rowKind === "status" || layoutOf(this.config, "row") === "row";
    return [
      ...(this.rowKind === "switch" ? [layoutField()] : []),
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
      ...(isRow ? [
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
      ] : []),
      { name: "online_entity", selector: { entity: {} } },
      ...(this.rowKind === "status" ? [{ name: "wall_switch", selector: { boolean: {} } }] : []),
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "detail_entities") return !Array.isArray(value) || value.length === 0;
    if (key === "wall_switch") return value !== true;
    if (key === "layout") return value === "row";
    return false;
  }
}
