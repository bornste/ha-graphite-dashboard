// Visual editor of graphite-shopping: todo entity, titles and texts; the quick pick groups are a
// list of objects and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteShoppingEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "shopping.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { panels: true };
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "todo" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "list_title", selector: { text: {} } },
          { name: "quick_title", selector: { text: {} } },
          { name: "placeholder", selector: { text: {} } },
          { name: "empty_text", selector: { text: {} } },
        ],
      },
      { name: "panels", selector: { boolean: {} } },
      { name: "groups", selector: { object: {} } },
    ];
  }
}
