// Visual editor of graphite-ink-tile.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteInkTileEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "ink.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "name", selector: { text: {} } },
      { name: "cartridges", required: true, selector: { entity: { multiple: true, domain: "sensor" } } },
      { name: "low_level", selector: { number: { mode: "box", min: 1, max: 50 } } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "cartridges") return !Array.isArray(value) || value.length === 0;
    return false;
  }
}
