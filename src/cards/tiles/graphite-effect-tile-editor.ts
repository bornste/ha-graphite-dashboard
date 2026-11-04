// Visual editor of graphite-effect-tile.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteEffectTileEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "effect.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "name", selector: { text: {} } },
      { name: "colors", required: true, selector: { text: { multiple: true } } },
      { name: "entity", selector: { entity: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "colors") return !Array.isArray(value) || value.length === 0;
    return false;
  }
}
