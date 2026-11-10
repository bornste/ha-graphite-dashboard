// Visual editor of graphite-timeline: the entities as a list with a dialog per entry; the colors
// of single states are a list in a second dialog.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteTimelineEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "timeline.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { bridge: "5m", show_picker: true, show_total: true };
  }

  protected schema(): unknown[] {
    return [
      this.listSection("entities", [
        { name: "entity", required: true, selector: { entity: {} } },
        { name: "name", selector: { text: {} } },
        { name: "color", selector: { text: {} } },
        { name: "ignore_states", selector: { text: { multiple: true } } },
        // a map "state: color" in the YAML, edited in a second dialog
        { name: "state_colors", list: {
          fields: [
            { name: "state", required: true, selector: { text: {} } },
            { name: "color", required: true, selector: { text: {} } },
          ],
          options: { labelField: "state", descriptionField: "color", map: { key: "state", value: "color" } },
        } },
      ], { labelField: "entity", descriptionField: "name", stringField: "entity" }, { expanded: true }),
      this.section("period", [
        { name: "intervals", selector: { text: { multiple: true } } },
        { name: "default_interval", selector: { text: {} } },
        { name: "show_picker", selector: { boolean: {} } },
      ]),
      this.section("bars", [
        { name: "bridge", selector: { text: {} } },
        { name: "ignore_states", selector: { text: { multiple: true } } },
        { name: "show_total", selector: { boolean: {} } },
      ]),
    ];
  }
}
