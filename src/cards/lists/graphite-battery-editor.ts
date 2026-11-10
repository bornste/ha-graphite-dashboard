// Visual editor of graphite-battery: thresholds, exclusions, the start state of "in order" and
// the display names (a map in the YAML, edited as a list).
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteBatteryEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "battery.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { critical: 20, low: 40, exclude_label: "exclude", collapsed: true };
  }

  protected schema(): unknown[] {
    const battery = { domain: "sensor", device_class: "battery" };
    return [
      this.grid(
        { name: "critical", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
        { name: "low", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
      ),
      { name: "collapsed", selector: { boolean: {} } },
      this.section("excluded", [
        { name: "exclude_label", selector: { label: {} } },
        { name: "exclude", selector: { entity: { multiple: true, filter: battery } } },
      ]),
      this.listSection("names", [
        { name: "entity", required: true, selector: { entity: { filter: battery } } },
        { name: "name", required: true, selector: { text: {} } },
      ], { labelField: "name", descriptionField: "entity", map: { key: "entity", value: "name" } }),
    ];
  }
}
