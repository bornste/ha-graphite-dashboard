// Visual editor of graphite-pickup.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphitePickupEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "pickup.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
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
          { name: "color", selector: { text: {} } },
          { name: "drop_after", selector: { text: {} } },
          { name: "lookahead_days", selector: { number: { mode: "box", min: 7, max: 120 } } },
        ],
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }
}
