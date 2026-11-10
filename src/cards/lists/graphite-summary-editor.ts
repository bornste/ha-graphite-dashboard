// Visual editor of graphite-summary: clock, greeting and texts; the items as a list with a dialog
// per entry. To keep that dialog short, "show", "alert" and "pickup" are objects with a second
// dialog each, and the levels a list in a second dialog.
import { GraphiteFormEditor, conditionFromForm, conditionToForm } from "../../core/form-editor";
import { pickupOf } from "../../core/pickup";

// text shown in the row of an object field; only in the form, never stored
const rowLabel = "row_label";

export class GraphiteSummaryEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "summary.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { clock: true, greeting: false };
  }

  // item as shown in the dialog: show and alert as objects (true / false become a switch and a
  // mode), pickup always in the form {calendars, days, ...}
  private itemToForm(entry: Record<string, any>): Record<string, any> {
    const { days, drop_after: dropAfter, names, when, ...data } = entry;
    const pickup = pickupOf(entry);
    if (pickup) data.pickup = { ...pickup, [rowLabel]: pickup.calendars.join(", ") };
    else Object.assign(data, { days, drop_after: dropAfter, names, when });
    if (data.show === true) data.show = { always: true, [rowLabel]: this.localText("conditionLabel.always") };
    else if (data.show && typeof data.show === "object") {
      data.show = { ...conditionToForm(data.show), [rowLabel]: this.conditionLabel(data.show) };
    }
    if (typeof data.alert === "boolean") {
      data.alert = { mode: data.alert ? "always" : "never", [rowLabel]: this.localText(`conditionLabel.${data.alert ? "always" : "never"}`) };
    } else if (data.alert && typeof data.alert === "object") {
      data.alert = { ...conditionToForm(data.alert), mode: "condition", [rowLabel]: this.conditionLabel(data.alert) };
    }
    return data;
  }

  private itemFromForm(entry: Record<string, any>): Record<string, any> {
    const data = { ...entry };
    if (data.show && typeof data.show === "object") {
      const { always, [rowLabel]: _label, ...condition } = data.show;
      data.show = always === true ? true : conditionFromForm(condition);
    }
    if (data.alert && typeof data.alert === "object") {
      const { mode, [rowLabel]: _label, ...condition } = data.alert;
      data.alert = mode === "always" ? true : mode === "never" ? false : conditionFromForm(condition);
    }
    if (data.pickup && typeof data.pickup === "object") {
      const { [rowLabel]: _label, ...pickup } = data.pickup;
      data.pickup = Array.isArray(pickup.calendars) && pickup.calendars.length ? pickup : undefined;
    }
    return data;
  }

  protected schema(): unknown[] {
    const text = { text: {} };
    const numberBox = { number: { mode: "box", step: "any" } };
    const stateList = { select: { multiple: true, custom_value: true, options: [] } };
    const conditionFields = [
      { name: "above", selector: numberBox },
      { name: "below", selector: numberBox },
      { name: "state", selector: stateList },
    ];
    const alertModes = ["condition", "always", "never"].map((value) => ({ value, label: this.optionLabel(`alertModes.${value}`) }));
    return [
      this.grid(
        { name: "clock", selector: { boolean: {} } },
        { name: "greeting", selector: { boolean: {} } },
      ),
      this.grid(
        { name: "calm_text", selector: text },
        { name: "and_word", selector: text },
      ),
      this.listSection("items", [
        { name: "name", selector: text },
        { name: "entity", selector: { entity: {} } },
        { name: "text", selector: text },
        { name: "text_one", selector: text },
        { name: "show", object: {
          fields: [{ name: "always", selector: { boolean: {} } }, ...conditionFields],
          options: { labelField: rowLabel },
        } },
        { name: "alert", object: {
          fields: [
            { name: "mode", default: "condition", selector: { select: { mode: "dropdown", options: alertModes } } },
            ...conditionFields,
          ],
          options: { labelField: rowLabel },
        } },
        { name: "alert_text", selector: text },
        { name: "alert_text_one", selector: text },
        // a level is a condition with its own text; alert is on unless switched off
        { name: "levels", list: {
          fields: [
            ...conditionFields,
            { name: "text", required: true, selector: text },
            { name: "alert", default: true, selector: { boolean: {} } },
          ],
          options: {
            labelField: "text",
            keepFalse: ["alert"],
            itemToForm: (level) => ({ ...conditionToForm(level), alert: level.alert !== false }),
            itemFromForm: (level) => {
              const { alert, ...stored } = conditionFromForm(level) ?? {};
              return alert === false ? { ...stored, alert } : stored;
            },
          },
        } },
        { name: "pickup", object: {
          fields: [
            { name: "calendars", required: true, selector: { entity: { multiple: true, domain: "calendar" } } },
            { name: "days", selector: { number: { mode: "box", min: 0, max: 14 } } },
            { name: "drop_after", selector: text },
            { name: "names", list: {
              fields: [
                { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
                { name: "name", required: true, selector: text },
              ],
              options: { labelField: "name", descriptionField: "entity", map: { key: "entity", value: "name" } },
            } },
            { name: "when", list: {
              fields: [
                { name: "days", required: true, selector: { number: { mode: "box", min: 0, max: 14 } } },
                { name: "word", required: true, selector: text },
              ],
              options: { labelField: "word", descriptionField: "days", map: { key: "days", value: "word", numericKey: true } },
            } },
          ],
          options: { labelField: rowLabel },
        } },
        { name: "icon", selector: { icon: {} } },
        { name: "color", selector: text },
        { name: "line", selector: { number: { mode: "box", min: 1, max: 9 } } },
        { name: "navigation_path", selector: { navigation: {} } },
        { name: "more_info", selector: { boolean: {} } },
        { name: "tap_action", selector: { ui_action: {} } },
      ], {
        labelField: "name",
        descriptionField: "entity",
        keepFalse: ["alert"],
        itemToForm: (entry) => this.itemToForm(entry),
        itemFromForm: (entry) => this.itemFromForm(entry),
      }, { expanded: true }),
      { name: "hold_action", selector: { ui_action: {} } },
    ];
  }
}
