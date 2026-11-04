// Visual editor of graphite-todo.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteTodoEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "todo.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "todo" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "unit", selector: { text: {} } },
          { name: "unit_one", selector: { text: {} } },
          { name: "empty_text", selector: { text: {} } },
          { name: "color", selector: { text: {} } },
        ],
      },
      { name: "preview", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "preview") return value !== true;
    return false;
  }
}
