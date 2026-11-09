// Visual editor of graphite-legend: scales and items are lists of objects, edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteLegendEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "legend.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "scales", selector: { object: {} } },
      { name: "items", selector: { object: {} } },
    ];
  }
}
