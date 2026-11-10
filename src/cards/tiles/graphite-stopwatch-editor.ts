// Visual editor of graphite-stopwatch. The daily limit is one option in the YAML (minutes, an
// entity or a map per day) and is edited as one field for all days plus a field per day.
import { GraphiteFormEditor } from "../../core/form-editor";

// keys of the limit map; the form fields are named "limit_<key>", all days "limit_all"
const limitKeys = ["weekday", "weekend", "mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// a limit as stored: minutes as a number, anything else is an entity id
function limitValue(value: unknown): number | string | undefined {
  const text = String(value ?? "").trim();
  if (text === "") return undefined;
  return Number.isNaN(Number(text)) ? text : Number(text);
}

export class GraphiteStopwatchEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "stopwatch.editor";
  }

  // the select shows the default as selected; a value equal to it is not stored
  protected defaults(): Record<string, unknown> {
    return { icon_position: "watermark" };
  }

  protected schema(): unknown[] {
    const limitField = (key: string) => ({ name: `limit_${key}`, selector: { text: {} } });
    return [
      { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
      this.grid(
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ),
      this.section("appearance", [
        this.grid(
          this.selectField("icon_position", "iconPositions", ["watermark", "left"]),
          { name: "color", selector: { text: {} } },
        ),
        { name: "picture_entity", selector: { entity: {} } },
      ]),
      this.section("daily_limit", [
        limitField("all"),
        this.section("limit_days", [
          this.grid(limitField("weekday"), limitField("weekend")),
          this.grid(...limitKeys.slice(2).map(limitField)),
        ]),
        this.grid(
          { name: "warn_before", selector: { number: { mode: "box", min: 0 } } },
          { name: "day_start", selector: { text: {} } },
        ),
      ]),
      this.actionsSection(),
    ];
  }

  // limit -> limit_all and limit_<day>: a map whose weekday and weekend are equal counts as
  // "all days" with single days on top
  protected toFormData(data: Record<string, any>): Record<string, any> {
    const { limit, ...formData } = data;
    if (limit !== null && typeof limit === "object") {
      const sameForAll = limit.weekday !== undefined && limit.weekday === limit.weekend;
      if (sameForAll) formData.limit_all = String(limit.weekday);
      for (const key of limitKeys) {
        if (limit[key] !== undefined && !(sameForAll && (key === "weekday" || key === "weekend"))) formData[`limit_${key}`] = String(limit[key]);
      }
    } else if (limit !== undefined && limit !== null && limit !== "") formData.limit_all = String(limit);
    return formData;
  }

  // the fields back to one option: only "all days" is stored as a plain value, otherwise a map
  // (it has no key for all days, so that value is stored as weekday and weekend)
  protected fromFormData(data: Record<string, any>): Record<string, any> {
    const config = { ...data };
    const all = limitValue(config.limit_all);
    delete config.limit_all;
    const days: Record<string, number | string> = {};
    for (const key of limitKeys) {
      const value = limitValue(config[`limit_${key}`]);
      if (value !== undefined) days[key] = value;
      delete config[`limit_${key}`];
    }
    if (Object.keys(days).length === 0) config.limit = all;
    else config.limit = all === undefined ? days : { weekday: all, weekend: all, ...days };
    return config;
  }
}
