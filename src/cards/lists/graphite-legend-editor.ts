// Visual editor of graphite-legend: scales and swatch items as lists with a dialog per entry; the
// stops of a scale are a list in a second dialog.
import { GraphiteFormEditor } from "../../core/form-editor";

const opacity = { number: { mode: "box", min: 0, max: 1, step: 0.05 } };
const numberBox = { number: { mode: "box", step: "any" } };

export class GraphiteLegendEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "legend.editor";
  }

  protected schema(): unknown[] {
    return [
      this.listSection("scales", [
        { name: "name", selector: { text: {} } },
        { name: "unit", selector: { text: {} } },
        { name: "stops", required: true, list: {
          fields: [
            { name: "value", required: true, selector: numberBox },
            { name: "color", required: true, selector: { text: {} } },
          ],
          options: { labelField: "value", descriptionField: "color" },
        } },
        { name: "min", selector: numberBox },
        { name: "max", selector: numberBox },
        { name: "ticks", selector: { text: { multiple: true } } },
        { name: "opacity", selector: opacity },
      ], {
        labelField: "name",
        descriptionField: "unit",
        // ticks are numbers in the YAML and texts in the form
        itemToForm: (entry) => (Array.isArray(entry.ticks) ? { ...entry, ticks: entry.ticks.map(String) } : entry),
        itemFromForm: (entry) => (Array.isArray(entry.ticks)
          ? { ...entry, ticks: entry.ticks.map(Number).filter((tick: number) => !Number.isNaN(tick)) }
          : entry),
      }, { expanded: true }),
      this.listSection("items", [
        { name: "name", required: true, selector: { text: {} } },
        { name: "color", selector: { text: {} } },
        { name: "opacity", selector: opacity },
      ], { labelField: "name", descriptionField: "color" }, { expanded: true }),
    ];
  }
}
