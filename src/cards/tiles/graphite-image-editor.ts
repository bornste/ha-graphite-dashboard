// Visual editor of graphite-image.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteImageEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "image.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "name", selector: { text: {} } },
      { name: "image", selector: { text: {} } },
      { name: "busy", selector: { boolean: {} } },
      this.actionsSection(),
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "busy") return value !== true;
    return false;
  }
}
