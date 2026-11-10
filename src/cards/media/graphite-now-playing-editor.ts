// Visual editor of graphite-now-playing: the sources as a list with a dialog per entry; the maps
// "titles" and "images" are lists in a second dialog.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteNowPlayingEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "nowPlaying.editor";
  }

  protected defaults(): Record<string, unknown> {
    return { backdrop: true };
  }

  protected schema(): unknown[] {
    return [
      this.listSection("sources", [
        { name: "entity", required: true, selector: { entity: {} } },
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
        { name: "states", selector: { text: { multiple: true } } },
        { name: "requires", selector: { entity: { multiple: true } } },
        { name: "title_entity", selector: { entity: {} } },
        { name: "image_entity", selector: { entity: {} } },
        { name: "subtitle", selector: { text: {} } },
        { name: "fallback_title", selector: { text: {} } },
        { name: "fallback_subtitle", selector: { text: {} } },
        { name: "ignore_titles", selector: { text: { multiple: true } } },
        // maps "raw title: shown title" and "title: image" in the YAML, edited in a second dialog
        { name: "titles", list: {
          fields: [
            { name: "title", required: true, selector: { text: {} } },
            { name: "shown", required: true, selector: { text: {} } },
          ],
          options: { labelField: "title", descriptionField: "shown", map: { key: "title", value: "shown" } },
        } },
        { name: "images", list: {
          fields: [
            { name: "title", required: true, selector: { text: {} } },
            { name: "image", required: true, selector: { text: {} } },
          ],
          options: { labelField: "title", descriptionField: "image", map: { key: "title", value: "image" } },
        } },
      ], { labelField: "name", descriptionField: "entity", listFields: ["requires"] }, { expanded: true }),
      { name: "backdrop", selector: { boolean: {} } },
    ];
  }
}
