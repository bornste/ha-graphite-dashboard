// Visual editor of graphite-now-playing; the sources are a list of objects and edited as YAML.
import { GraphiteFormEditor } from "../../core/form-editor";

export class GraphiteNowPlayingEditor extends GraphiteFormEditor {
  protected labelPrefix(): string {
    return "nowPlaying.editor";
  }

  protected schema(): unknown[] {
    return [{ name: "sources", required: true, selector: { object: {} } }];
  }
}
