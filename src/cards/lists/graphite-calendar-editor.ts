// Visual editor of graphite-calendar; calendars and rules are lists of objects and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteCalendarEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "calendar.editor";
  }

  protected schemaKey(): string {
    return String(this.config.range ?? "this_and_next_week");
  }

  protected schema(): unknown[] {
    const range = this.config.range ?? "this_and_next_week";
    return [
      { name: "calendars", required: true, selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "range", selector: { select: { mode: "dropdown", options: ["today", "this_week", "this_and_next_week", "days"]
            .map((value) => ({ value, label: this.optionLabel(`range.${value}`) })) } } },
          ...(range === "days" ? [{ name: "days", selector: { number: { mode: "box", min: 1, max: 120 } } }] : []),
          { name: "max_items", selector: { number: { mode: "box", min: 1, max: 100 } } },
        ],
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "secondary", selector: { select: { mode: "dropdown", options: ["calendar_location", "calendar", "location", "description", "none"]
            .map((value) => ({ value, label: this.optionLabel(`secondary.${value}`) })) } } },
          { name: "highlight_days", selector: { number: { mode: "box", min: 0, max: 60 } } },
        ],
      },
      { name: "show_past_today", selector: { boolean: {} } },
      { name: "rules", selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "empty_text", selector: { text: {} } },
          { name: "hide_empty", selector: { boolean: {} } },
        ],
      },
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
    ];
  }
}
