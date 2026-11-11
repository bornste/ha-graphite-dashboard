// Visual editor of graphite-dialog: the panel editor in "dialog" mode (hash and width first,
// header and layout like a panel, the cards in Home Assistant's stack editor).
import { GraphitePanelEditor, type PanelEditorMode } from "./graphite-panel-editor";

export class GraphiteDialogEditor extends GraphitePanelEditor {
  protected mode: PanelEditorMode = "dialog";
}
