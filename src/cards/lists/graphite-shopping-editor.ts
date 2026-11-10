// Visual editor of graphite-shopping: todo entity, titles and texts; the quick pick groups as a
// list with a dialog per entry, the products of a group in a second dialog.
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
      { name: "panels", selector: { boolean: {} } },
      this.listSection("groups", [
        { name: "name", required: true, selector: { text: {} } },
        { name: "wide", selector: { boolean: {} } },
        // a product is a name or {name, variants, description} in the YAML
        { name: "items", required: true, list: {
          fields: [
            { name: "name", required: true, selector: { text: {} } },
            { name: "variants", selector: { text: { multiple: true } } },
            { name: "description", selector: { text: {} } },
          ],
          options: {
            labelField: "name",
            descriptionField: "description",
            stringField: "name",
            // variants may be numbers in the YAML and are texts in the form
            itemToForm: (entry) => (Array.isArray(entry.variants) ? { ...entry, variants: entry.variants.map(String) } : entry),
          },
        } },
      ], { labelField: "name" }, { expanded: true }),
      this.section("texts", [
        this.grid(
          { name: "list_title", selector: { text: {} } },
          { name: "quick_title", selector: { text: {} } },
          { name: "placeholder", selector: { text: {} } },
          { name: "empty_text", selector: { text: {} } },
        ),
      ]),
    ];
  }
}
