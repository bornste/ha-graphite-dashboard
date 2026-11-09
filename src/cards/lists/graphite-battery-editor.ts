// Visual editor of graphite-battery: thresholds, exclusions and the start state of "in order";
// display names are a map and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteBatteryEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "battery.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { critical: 20, low: 40, exclude_label: "exclude", collapsed: true };
  }

  protected schema(): unknown[] {
    return [
      {
        type: "grid",
        name: "",
        schema: [
          { name: "critical", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
          { name: "low", selector: { number: { mode: "box", min: 0, max: 100, unit_of_measurement: "%" } } },
        ],
      },
      { name: "exclude_label", selector: { label: {} } },
      { name: "exclude", selector: { entity: { multiple: true, filter: { domain: "sensor", device_class: "battery" } } } },
      { name: "collapsed", selector: { boolean: {} } },
      { name: "names", selector: { object: {} } },
    ];
  }
}
