// Visual editor of graphite-switch-tile.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteSwitchTileEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "tiles.editor";
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
      { name: "online_entity", selector: { entity: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }
}
