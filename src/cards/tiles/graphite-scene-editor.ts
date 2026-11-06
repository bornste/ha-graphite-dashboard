// Visual editor of graphite-scene; colors and the active condition are edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteSceneEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "scene.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
        ],
      },
      { name: "colors", selector: { object: {} } },
      { name: "active", selector: { object: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }
}
