// Visual editor of graphite-button.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteButtonEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "button.editor";
  }

  protected schema(): unknown[] {
    return [
      this.selectField("layout", "layouts", ["tile", "row", "icon"], "list"),
      { name: "entity", selector: { entity: {} } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      { name: "busy", selector: { boolean: {} } },
      this.conditionSection("active"),
      this.actionsSection(),
    ];
  }

  protected defaults(): Record<string, unknown> {
    return { layout: "tile" };
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "busy") return value !== true;
    return false;
  }
}
