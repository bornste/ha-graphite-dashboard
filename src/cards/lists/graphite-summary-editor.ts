// Visual editor of graphite-summary: clock, greeting and texts; the items are a list of objects
// and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteSummaryEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "summary.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { clock: true, greeting: false };
  }

  protected schema(): unknown[] {
    return [
      {
        type: "grid",
        name: "",
        schema: [
          { name: "clock", selector: { boolean: {} } },
          { name: "greeting", selector: { boolean: {} } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "calm_text", selector: { text: {} } },
          { name: "and_word", selector: { text: {} } },
        ],
      },
      { name: "items", required: true, selector: { object: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
    ];
  }
}
