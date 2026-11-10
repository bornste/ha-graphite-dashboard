// Visual editor of graphite-effect.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteEffectEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "effect.editor";
  }

  protected schema(): unknown[] {
    return [
      { name: "name", selector: { text: {} } },
      { name: "colors", required: true, selector: { text: { multiple: true } } },
      { name: "entity", selector: { entity: {} } },
      this.actionsSection(),
    ];
  }

  protected skipValue(key: string, value: unknown): boolean {
    if (key === "colors") return !Array.isArray(value) || value.length === 0;
    return false;
  }
}
