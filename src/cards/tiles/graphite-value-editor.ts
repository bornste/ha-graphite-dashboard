// Visual editor of graphite-value (layout first; the watermark switch only for the tile).
import { GraphiteFormEditor } from "../../core/form-editor";
import { layoutOf } from "../../core/layout";

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
    const decimals = { number: { mode: "box", min: 0, max: 4 } };
    return [
      this.layoutField(),
      { name: "entity", required: true, selector: { entity: {} } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      ...(isTile ? [{ name: "show_icon", selector: { boolean: {} } }] : []),
      this.section("value_display", [
        this.grid(
          { name: "decimals", selector: decimals },
          { name: "unit", selector: { text: {} } },
        ),
      ]),
      this.section("secondary", [
        { name: "secondary_entity", selector: { entity: {} } },
        this.grid(
          { name: "secondary_decimals", selector: decimals },
          { name: "secondary_unit", selector: { text: {} } },
          { name: "secondary_icon", selector: { icon: {} } },
        ),
      ]),
      this.actionsSection(),
    ];
  }

  // the layout radio shows the default as selected; a value equal to it is not stored
  protected defaults(): Record<string, unknown> {
    return { layout: "tile" };
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "show_icon") return value !== true;
    return false;
  }
}
