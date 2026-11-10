// Visual editor of graphite-calendar: calendars and keyword rules as lists with a dialog per
// entry, the options of the chosen layout and range in sections.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteCalendarEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "calendar.editor";
  }

  // fields show the defaults of the card (also the switch "show past events", which is on by default);
  // a value equal to its default is not stored
  protected defaults(): Record<string, unknown> {
    return { layout: "list", range: "this_and_next_week", week: "current", secondary: "calendar_location", highlight_days: 7,
      show_past_today: true };
  }

  protected schemaKey(): string {
    return `${this.config.layout ?? "list"}|${this.config.range ?? "this_and_next_week"}`;
  }

  protected schema(): unknown[] {
    const range = this.config.range ?? "this_and_next_week";
    const compact = this.config.layout === "compact";
    const tiles = this.config.layout === "tiles";
    const highlightDays = { name: "highlight_days", selector: { number: { mode: "box", min: 0, max: 60 } } };
    return [
      this.listSection("calendars", [
        { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
        { name: "name", selector: { text: {} } },
        { name: "color", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "highlight", selector: { boolean: {} } },
      ], { labelField: "entity", descriptionField: "name", stringField: "entity" }, { expanded: true }),
      this.grid(
        this.selectField("layout", "layouts", ["list", "compact", "tiles"]),
        ...(tiles ? [] : [this.selectField("range", "ranges", ["today", "this_week", "this_and_next_week", "days", "week"])]),
      ),
      ...(range === "days" && !tiles ? [{ name: "days", selector: { number: { mode: "box", min: 1, max: 120 } } }] : []),
      ...(range === "week" && !tiles ? [this.grid(
        this.selectField("week", "weeks", ["current", "next"]),
        { name: "week_rollover", selector: { text: {} } },
      )] : []),
      ...(tiles ? [this.section("tiles", [
        this.grid(
          { name: "icon", selector: { icon: {} } },
          { name: "highlight_name", selector: { text: {} } },
        ),
        this.grid(highlightDays, { name: "day_switch", selector: { text: {} } }),
        { name: "weekdays", selector: { boolean: {} } },
      ], { expanded: true })] : []),
      this.section("display", [
        ...(tiles ? [] : [this.grid(
          { name: "title", selector: { text: {} } },
          { name: "max_items", selector: { number: { mode: "box", min: 1, max: 100 } } },
        )]),
        ...(tiles ? [] : compact ? [{ name: "weekdays", selector: { boolean: {} } }] : [this.grid(
          this.selectField("secondary", "secondaries", ["calendar_location", "calendar", "location", "description", "none"]),
          highlightDays,
        )]),
        { name: "show_past_today", selector: { boolean: {} } },
        this.grid(
          { name: "empty_text", selector: { text: {} } },
          { name: "hide_empty", selector: { boolean: {} } },
        ),
      ]),
      // a rule's "highlight: false" overrides the highlight of its calendar
      this.listSection("rules", [
        { name: "name", selector: { text: {} } },
        { name: "starts_with", selector: { text: {} } },
        { name: "contains", selector: { text: {} } },
        { name: "contains_any", selector: { text: { multiple: true } } },
        { name: "contains_all", selector: { text: { multiple: true } } },
        { name: "color", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "highlight", selector: { boolean: {} } },
      ], { labelField: "name", descriptionField: "starts_with", keepFalse: ["highlight"] }),
      this.actionsSection(["tap_action", "hold_action"]),
    ];
  }
}
