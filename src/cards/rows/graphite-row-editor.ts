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
      ...(this.rowKind === "status" ? [
        {
          type: "grid",
          name: "",
          schema: [
            { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
            { name: "unit", selector: { text: {} } },
          ],
        },
        { name: "wall_switch", selector: { boolean: {} } },
      ] : []),
    ];
  }

  // the "since" switch shows what the row does without the option: on, off for measured values
  // (entities with a unit); a value equal to this default is not stored
  protected defaults(): Record<string, unknown> {
    const stateObj = this.config.entity ? this.hassObject?.states[this.config.entity] : undefined;
    return { since_line: !stateObj?.attributes?.unit_of_measurement };
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "detail_entities") return !Array.isArray(value) || value.length === 0;
    if (key === "wall_switch") return value !== true;
    if (key === "layout") return value === "row";
    return false;
  }
}
