// graphite-dialog: a dialog (pop-up) that opens on a hash like #lights, from every view of the dashboard.
// The cards live in one place, ideally a subview "dialogs" that holds all dialogs of the dashboard:
// there each dialog shows its content inline, so it can be edited in the dashboard editor.
// The dialog layer (overlays/graphite-dialog-layer) finds the card in the dashboard config and opens
// a copy of it above the current view. Header like graphite-panel: title, status, chips, buttons.
import { css, html, nothing } from "lit";
import { GraphiteCard } from "../core/graphite-card";
import { edgeMask } from "../core/edge";
import { registerCard, registerElement } from "../core/register";
import type { GraphiteCardConfig, HomeAssistant } from "../core/types";
import { loadStackCardEditor, type PanelButtonConfig, type PanelChipConfig, type PanelSummaryPart } from "./graphite-panel";
import { GraphiteDialogEditor } from "./graphite-dialog-editor";

export interface DialogConfig extends GraphiteCardConfig {
  hash: string;
  title?: string;
  info?: string;
  summary?: PanelSummaryPart[];
  summary_mode?: "all" | "first";
  chips?: PanelChipConfig[];
  buttons?: PanelButtonConfig[];
  // width on large screens; on small screens the dialog takes the full width
  width?: string;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
  min_column_width?: string;
  gap?: string;
  cards: Record<string, unknown>[];
}

// "#lights", "lights" and " #lights " are the same dialog
export function normalizeHash(hash: unknown): string {
  const text = String(hash ?? "").trim();
  if (!text) return "";
  return text.startsWith("#") ? text : `#${text}`;
}

export class GraphiteDialog extends GraphiteCard<DialogConfig> {
  static styles = css`
    :host {
      display: block;
    }
    /* darker than the panels inside, so the levels read ground → panel → tile */
    .dialog {
      box-sizing: border-box;
      padding: 16px;
      border-radius: var(--graphite-radius-panel, 20px);
      background: var(--graphite-overlay, rgba(10, 10, 11, 0.9));
      color: var(--graphite-text-primary, var(--primary-text-color));
      /* the first panel sits as far below the header buttons as they sit below the dialog edge */
      --graphite-header-margin: 16px;
      /* optical inset: the title alone looks too close to the dialog edge */
      --graphite-title-inset: 4px;
    }
    /* inline in the dialogs view: a thin outline shows the dialog edge on the page ground */
    :host(:not([layered])) .dialog {
      box-shadow: 0 0 0 1px var(--graphite-separator, rgba(255, 255, 255, 0.12));
    }
    .hash {
      margin: 0 0 6px 4px;
      font-size: var(--graphite-font-caption-size, 12px);
      line-height: 16px;
      color: var(--graphite-text-muted, var(--secondary-text-color));
    }
    /* opened: glass surface with a light edge on top; the header stays, only the content scrolls */
    :host([layered]) .dialog {
      display: flex;
      flex-direction: column;
      width: min(var(--dialogWidth, 520px), 100%);
      max-height: calc(100dvh - 32px);
      padding: 0;
      overflow: hidden;
      outline: none;
      position: relative;
      /* theme tokens: surface, the light line on top and an optional gradient edge (.edge) */
      background: var(--graphite-dialog-surface, color-mix(in srgb, var(--graphite-ground, #0a0a0b) 72%, transparent));
      -webkit-backdrop-filter: blur(24px) saturate(1.2);
      backdrop-filter: blur(24px) saturate(1.2);
      box-shadow: var(--graphite-dialog-highlight, inset 0 1px 0 color-mix(in srgb, var(--graphite-ink, #f3f3f4) 10%, transparent));
    }
    .edge {
      position: absolute;
      inset: 0;
      z-index: 2;
      box-sizing: border-box;
      padding: 1px;
      border-radius: inherit;
      background: var(--graphite-dialog-edge, none);
      pointer-events: none;
      ${edgeMask}
    }
    :host([layered]) graphite-panel {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
    :host([layered]) graphite-panel::part(card) {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      height: auto;
    }
    :host([layered]) graphite-panel::part(header) {
      flex: none;
      position: relative;
      z-index: 1;
      margin: 0;
      padding: 16px;
      transition: box-shadow 0.15s ease;
    }
    /* thin line under the header once content scrolls below it */
    :host([layered][scrolled]) graphite-panel::part(header) {
      box-shadow: 0 1px 0 var(--graphite-separator);
    }
    :host([layered]) graphite-panel::part(content) {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 0 16px 16px;
      touch-action: pan-y;
    }
    /* small screens: bottom sheet over the full width, only the top corners round */
    :host([sheet]) .dialog {
      width: 100%;
      max-height: 92dvh;
      border-radius: var(--graphite-radius-panel, 20px) var(--graphite-radius-panel, 20px) 0 0;
      padding-bottom: env(safe-area-inset-bottom);
      touch-action: none;
    }
    :host([sheet]) graphite-panel::part(header) {
      padding-top: 10px;
    }
    .handle {
      flex: none;
      width: 36px;
      height: 4px;
      margin: 8px auto 0;
      border-radius: 2px;
      background: color-mix(in srgb, var(--graphite-ink, #f3f3f4) 28%, transparent);
    }
    /* close button: same as the header buttons of graphite-panel */
    .close {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: var(--graphite-radius-tile, 12px);
      background: var(--graphite-surface-tile);
      color: var(--graphite-text-secondary);
      cursor: pointer;
      font: inherit;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 18px;
    }
    .close:focus-visible {
      outline: 2px solid var(--graphite-accent);
      outline-offset: 2px;
    }
  `;

  private panel?: any;
  private closeButton?: HTMLButtonElement;

  protected normalizeConfig(config: DialogConfig): DialogConfig {
    if (!normalizeHash(config.hash)) throw new Error("graphite-dialog: 'hash' is required, e.g. '#lights'");
    if (!Array.isArray(config.cards)) throw new Error("graphite-dialog: 'cards' must be a list of cards");
    return { ...config, hash: normalizeHash(config.hash) };
  }

  setConfig(config: DialogConfig): void {
    super.setConfig(config);
    this.buildPanel();
  }

  protected hassChanged(hass: HomeAssistant | undefined): void {
    if (this.panel && hass) this.panel.hass = hass;
  }

  // the content is a frameless graphite-panel: same header, same layouts, child panels stay panels
  private buildPanel(): void {
    const config = this.config!;
    if (!this.panel) this.panel = document.createElement("graphite-panel");
    this.panel.setConfig({
      type: "custom:graphite-panel",
      title: config.title,
      info: config.info,
      summary: config.summary,
      summary_mode: config.summary_mode,
      chips: config.chips,
      buttons: config.buttons,
      layout: config.layout ?? "vertical",
      columns: config.columns,
      min_column_width: config.min_column_width,
      gap: config.gap ?? "16px",
      frame: false,
      cards: config.cards,
    });
    if (this.hass) this.panel.hass = this.hass;
  }

  // called by the dialog layer: adds the close button to the header
  enableClose(sheet = false): void {
    this.toggleAttribute("layered", true);
    this.toggleAttribute("sheet", sheet);
    this.requestUpdate();
    if (this.closeButton || !this.panel) return;
    const button = document.createElement("button");
    button.className = "close";
    button.slot = "actions";
    const label = this.localize("dialog.close");
    button.title = label;
    button.setAttribute("aria-label", label);
    button.append(document.createElement("ha-ripple"));
    const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
    icon.icon = "mdi:close";
    button.append(icon);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("graphite-dialog-close", { bubbles: true, composed: true }));
    });
    this.closeButton = button;
    this.panel.append(button);
    this.panel.requestUpdate?.();
  }

  // the line under the header follows the scroll position of the content
  async watchScroll(): Promise<void> {
    await this.panel?.updateComplete;
    const content = this.panel?.shadowRoot?.querySelector(".content") as HTMLElement | null;
    content?.addEventListener("scroll", () => this.toggleAttribute("scrolled", content.scrollTop > 0), { passive: true });
  }

  focusDialog(): void {
    (this.renderRoot.querySelector(".dialog") as HTMLElement | null)?.focus({ preventScroll: true });
  }

  protected render() {
    const config = this.config!;
    const layered = this.hasAttribute("layered");
    const style = config.width ? `--dialogWidth: ${config.width}` : "";
    return html`${layered ? nothing : html`<div class="hash">${config.hash}</div>`}<div class="dialog" style=${style}
      role=${layered ? "dialog" : nothing} aria-modal=${layered ? "true" : nothing} aria-label=${config.title ?? nothing}
      tabindex=${layered ? "-1" : nothing}>${layered ? html`<span class="edge"></span>` : nothing}${this.hasAttribute("sheet")
      ? html`<div class="handle"></div>` : nothing}${this.panel}</div>`;
  }

  getCardSize(): number {
    return 1 + (this.config?.cards?.length ?? 0);
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  static getStubConfig(): Partial<DialogConfig> {
    return { hash: "#dialog", title: "Dialog", cards: [] };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await loadStackCardEditor();
    return document.createElement("graphite-dialog-editor");
  }
}

registerElement("graphite-dialog-editor", GraphiteDialogEditor);

registerCard("graphite-dialog", GraphiteDialog, {
  name: "Graphite Dialog",
  description: "Dialog that opens on a hash (e.g. #lights) from every view; header like graphite-panel.",
});
