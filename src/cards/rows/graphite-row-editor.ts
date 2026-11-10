// Visual editor of graphite-status and graphite-switch (one form: wall_switch only for the status,
// the layout choice only for the switch; the "since" options only in the row layout).
import { GraphiteFormEditor } from "../../core/form-editor";
import { layoutOf } from "../../core/layout";

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
      ...(this.rowKind === "switch" ? [this.layoutField()] : []),
      { name: "entity", required: true, selector: { entity: {} } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      ...(isRow ? [
        this.section("since", [
          { name: "since_line", selector: { boolean: {} } },
          this.grid(
            { name: "since_attribute", selector: { text: {} } },
            { name: "since_attribute_label", selector: { text: {} } },
          ),
        ]),
        this.listSection("detail_entities", [
          { name: "entity", required: true, selector: { entity: {} } },
          { name: "label", selector: { text: {} } },
        ], { labelField: "entity", descriptionField: "label", stringField: "entity" }),
      ] : []),
      this.section("availability", [
        { name: "online_entity", selector: { entity: {} } },
        ...(this.rowKind === "status" ? [{ name: "wall_switch", selector: { boolean: {} } }] : []),
      ]),
      this.actionsSection(),
    ];
  }

  // the "since" switch shows what the row does without the option: on, off for measured values
  // (entities with a unit); a value equal to this default is not stored
  protected defaults(): Record<string, unknown> {
    const stateObj = this.config.entity ? this.hassObject?.states[this.config.entity] : undefined;
    return { layout: "row", since_line: !stateObj?.attributes?.unit_of_measurement };
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "detail_entities") return !Array.isArray(value) || value.length === 0;
    if (key === "wall_switch") return value !== true;
    return false;
  }
}
