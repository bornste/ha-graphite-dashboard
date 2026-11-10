// Visual editor of graphite-vacuum: entity, layout and the main options first; rooms, presets,
// modes, suction levels, station actions and maintenance items as lists with a dialog per entry,
// the panel headings and the entity overrides in sections.
import { GraphiteFormEditor } from "../../core/form-editor";

const entityOverrides = ["mode_entity", "suction_entity", "boost_entity", "history_entity", "error_entity", "drying_left_entity"];

export class GraphiteVacuumEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "vacuum.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { layout: "tile", boost: true, panels: true, maintenance_threshold: 10 };
  }

  protected schemaKey(): string {
    return this.config.layout === "panel" ? "panel" : "tile";
  }

  protected schema(): unknown[] {
    const panel = this.config.layout === "panel";
    const text = { text: {} };
    const tileFields = [
      { name: "navigation_path", selector: { navigation: {} } },
    ];
    const panelFields = [
      { name: "panels", selector: { boolean: {} } },
      this.listSection("rooms", [
        { name: "id", required: true, selector: { number: { mode: "box", min: 0 } } },
        { name: "name", selector: text },
        { name: "icon", selector: { icon: {} } },
      ], { labelField: "name", descriptionField: "id", stringField: "id" }),
      this.listSection("presets", [
        { name: "name", required: true, selector: text },
        { name: "icon", selector: { icon: {} } },
        { name: "rooms", selector: { text: { multiple: true } } },
        { name: "mode", selector: text },
        { name: "suction", selector: text },
      ], { labelField: "name", descriptionField: "mode" }),
      this.listSection("modes", [
        { name: "value", required: true, selector: text },
        { name: "name", selector: text },
        { name: "icon", selector: { icon: {} } },
      ], { labelField: "value", descriptionField: "name", stringField: "value" }),
      this.section("suction", [
        this.grid(
          { name: "boost", selector: { boolean: {} } },
          { name: "boost_name", selector: text },
        ),
        this.listField("suction_levels", [
          { name: "value", required: true, selector: text },
          { name: "name", selector: text },
        ], { labelField: "value", descriptionField: "name", stringField: "value" }),
      ]),
      this.listSection("actions", [
        { name: "entity", required: true, selector: { entity: {} } },
        { name: "name", selector: text },
        { name: "icon", selector: { icon: {} } },
      ], { labelField: "name", descriptionField: "entity" }),
      this.section("titles", [
        this.grid(
          { name: "cleaning_title", selector: text },
          { name: "presets_title", selector: text },
          { name: "station_title", selector: text },
        ),
      ]),
    ];
    return [
      { name: "entity", required: true, selector: { entity: { domain: "vacuum" } } },
      this.selectField("layout", "layouts", ["tile", "panel"], "list"),
      this.grid(
        { name: "name", selector: text },
        { name: "prefix", selector: text },
      ),
      ...(panel ? panelFields : tileFields),
      this.section("wear", [
        { name: "maintenance_threshold", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
        this.listField("maintenance", [
          { name: "key", required: true, selector: text },
          { name: "name", selector: text },
          { name: "due", selector: text },
          { name: "reset", selector: { entity: {} } },
        ], { labelField: "key", descriptionField: "name" }),
      ]),
      this.section("entities", entityOverrides.map((name) => ({ name, selector: { entity: {} } }))),
    ];
  }
}
