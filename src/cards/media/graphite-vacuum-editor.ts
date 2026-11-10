// Visual editor of graphite-vacuum: entity, layout and the main options; rooms, presets and the
// other lists are edited as YAML (object fields).
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteVacuumEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "vacuum.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { layout: "tile", boost: true, maintenance_threshold: 10 };
  }

  protected schemaKey(): string {
    return this.config.layout === "panel" ? "panel" : "tile";
  }

  protected schema(): unknown[] {
    const panel = this.config.layout === "panel";
    const tileFields = [
      { name: "navigation_path", selector: { navigation: {} } },
    ];
    const panelFields = [
      { name: "rooms", selector: { object: {} } },
      { name: "presets", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "maintenance_threshold", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
          { name: "boost", selector: { boolean: {} } },
        ],
      },
    ];
    return [
      { name: "entity", required: true, selector: { entity: { domain: "vacuum" } } },
      { name: "layout", selector: { select: { mode: "list", options: ["tile", "panel"]
        .map((value) => ({ value, label: this.optionLabel(`layouts.${value}`) })) } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "prefix", selector: { text: {} } },
        ],
      },
      ...(panel ? panelFields : tileFields),
    ];
  }
}
