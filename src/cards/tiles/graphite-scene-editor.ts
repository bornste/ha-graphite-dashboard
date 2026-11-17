// Visual editor of graphite-scene.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteSceneEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "scene.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", selector: { entity: {} } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      { name: "colors", selector: { text: { multiple: true } } },
      this.selectField("stripe", "stripes", ["short", "full"], "list"),
      this.conditionSection("active"),
      this.actionsSection(),
    ];
  }

  protected defaults(): Record<string, unknown> {
    return { stripe: "short" };
  }
}
