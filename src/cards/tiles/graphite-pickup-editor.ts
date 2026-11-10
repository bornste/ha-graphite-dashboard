// Visual editor of graphite-pickup.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphitePickupEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "pickup.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      { name: "color", selector: { text: {} } },
      this.section("dates", [
        this.grid(
          { name: "drop_after", selector: { text: {} } },
          { name: "lookahead_days", selector: { number: { mode: "box", min: 7, max: 120 } } },
        ),
      ]),
      this.actionsSection(),
    ];
  }
}
