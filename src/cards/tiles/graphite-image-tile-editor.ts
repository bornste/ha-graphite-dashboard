// Visual editor of graphite-image-tile.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteImageTileEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "image.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "name", selector: { text: {} } },
      { name: "image", selector: { text: {} } },
      { name: "busy", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "busy") return value !== true;
    return false;
  }
}
