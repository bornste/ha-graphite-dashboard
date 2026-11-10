// Visual editor of graphite-todo.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteTodoEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "todo.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "todo" } } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      this.section("texts", [
        this.grid(
          { name: "unit", selector: { text: {} } },
          { name: "unit_one", selector: { text: {} } },
        ),
        { name: "empty_text", selector: { text: {} } },
      ]),
      this.section("appearance", [
        { name: "color", selector: { text: {} } },
        { name: "preview", selector: { boolean: {} } },
      ]),
      this.actionsSection(),
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "preview") return value !== true;
    return false;
  }
}
