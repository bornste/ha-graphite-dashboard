// Visual editor of graphite-select: layout, columns, theme preview and the display of the options
// (a list of option, name and icon).
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteSelectEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "select.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { filter: [{ domain: "input_select" }, { domain: "select" }] } } },
      this.selectField("layout", "layouts", ["segments", "tiles"], "list"),
      this.grid(
        { name: "columns", selector: { number: { mode: "box", min: 1, max: 12 } } },
        this.selectField("preview", "previews", ["theme"]),
      ),
      this.listSection("options", [
        { name: "option", required: true, selector: { text: {} } },
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
      ], { labelField: "option", descriptionField: "name" }),
    ];
  }

  protected defaults(): Record<string, unknown> {
    return { layout: "segments" };
  }
}
