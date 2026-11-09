// Visual editor of graphite-calendar; calendars and rules are lists of objects and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteCalendarEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "calendar.editor";
  }

  protected skipValue(key: string, value: unknown): boolean {
    return (key === "layout" && value === "list") || (key === "week" && value === "current");
  }

  protected schemaKey(): string {
    return `${this.config.layout ?? "list"}|${this.config.range ?? "this_and_next_week"}`;
  }

  private select(name: string, group: string, values: string[]) {
    return { name, selector: { select: { mode: "dropdown", options: values
      .map((value) => ({ value, label: this.optionLabel(`${group}.${value}`) })) } } };
  }

  protected schema(): unknown[] {
    const range = this.config.range ?? "this_and_next_week";
    const compact = this.config.layout === "compact";
    const summary = this.config.layout === "summary";
    const isWeek = range === "week";
    return [
      { name: "calendars", required: true, selector: { object: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          this.select("layout", "layouts", ["list", "compact", "summary"]),
          ...(summary ? [] : [this.select("range", "ranges", ["today", "this_week", "this_and_next_week", "days", "week"])]),
        ],
      },
      ...(summary ? [{
        type: "grid",
        name: "",
        schema: [
          { name: "icon", selector: { icon: {} } },
          { name: "highlight_text", selector: { text: {} } },
        ],
      }, {
        type: "grid",
        name: "",
        schema: [
          { name: "highlight_days", selector: { number: { mode: "box", min: 0, max: 60 } } },
          { name: "weekdays", selector: { boolean: {} } },
        ],
      }] : []),
      ...(range === "days" && !summary ? [{ name: "days", selector: { number: { mode: "box", min: 1, max: 120 } } }] : []),
      ...(isWeek && !summary ? [{
        type: "grid",
        name: "",
        schema: [
          this.select("week", "weeks", ["current", "next"]),
          { name: "week_rollover", selector: { text: {} } },
        ],
      }] : []),
      ...(summary ? [] : [{
        type: "grid",
        name: "",
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "max_items", selector: { number: { mode: "box", min: 1, max: 100 } } },
        ],
      }]),
      ...(summary ? [] : compact ? [{ name: "weekdays", selector: { boolean: {} } }] : [{
        type: "grid",
        name: "",
        schema: [
          this.select("secondary", "secondaries", ["calendar_location", "calendar", "location", "description", "none"]),
          { name: "highlight_days", selector: { number: { mode: "box", min: 0, max: 60 } } },
        ],
      }]),
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
