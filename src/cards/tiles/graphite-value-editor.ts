// Visual editor of graphite-value (layout first; the watermark switch only for the tile).
import { GraphiteFormEditor } from "../../core/form-editor";
import { layoutField, layoutOf } from "../../core/layout";

export class GraphiteValueEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "value.editor";
  }

  protected schemaKey(): string {
    return layoutOf(this.config, "tile");
  }

  protected schema(): unknown[] {
    // the watermark switch only applies to the tile; the row always shows an icon
    const isTile = layoutOf(this.config, "tile") === "tile";
    return [
      layoutField(),
      { name: "entity", required: true, selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "unit", selector: { text: {} } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
          ...(isTile ? [{ name: "show_icon", selector: { boolean: {} } }] : []),
        ],
      },
      { name: "secondary_entity", selector: { entity: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "secondary_decimals", selector: { number: { mode: "box", min: 0, max: 4 } } },
          { name: "secondary_unit", selector: { text: {} } },
          { name: "secondary_icon", selector: { icon: {} } },
        ],
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "show_icon") return value !== true;
    if (key === "layout") return value === "tile";
    return false;
  }
}
