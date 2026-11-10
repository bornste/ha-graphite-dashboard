// Visual editor of graphite-timeline; the entities are a list of objects and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteTimelineEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "timeline.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { bridge: "5m", show_picker: true, show_total: true };
  }

  protected schema(): unknown[] {
    return [
      { name: "entities", required: true, selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "default_interval", selector: { text: {} } },
          { name: "bridge", selector: { text: {} } },
        ],
      },
      { name: "intervals", selector: { object: {} } },
      { name: "ignore_states", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_picker", selector: { boolean: {} } },
          { name: "show_total", selector: { boolean: {} } },
        ],
      },
    ];
  }
}
