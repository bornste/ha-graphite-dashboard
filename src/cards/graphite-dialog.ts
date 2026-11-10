// graphite-dialog: a dialog (pop-up) that opens on a hash like #lights, from every view of the dashboard.
// The cards live in one place, ideally a subview "dialogs" that holds all dialogs of the dashboard:
// there each dialog shows its content inline, so it can be edited in the dashboard editor.
// The dialog layer (overlays/graphite-dialog-layer) finds the card in the dashboard config and opens
// a copy of it above the current view. Header like graphite-panel: title, status, chips, buttons.
import { css, html, nothing } from "lit";
import { GraphiteCard } from "../core/graphite-card";
import { registerCard } from "../core/register";
import type { GraphiteCardConfig, HomeAssistant } from "../core/types";
import type { ValueCondition } from "../core/conditions";
import type { PanelButtonConfig, PanelChipConfig } from "./graphite-panel";

export interface DialogConfig extends GraphiteCardConfig {
  hash: string;
  title?: string;
  info?: string;
  info_alert?: ValueCondition;
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
    :host([layered]) .dialog {
      width: min(var(--dialogWidth, 520px), 100%);
      max-height: calc(100dvh - 32px);
      overflow-y: auto;
      overscroll-behavior: contain;
      outline: none;
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
    @media (max-width: 600px) {
      :host([layered]) .dialog {
        max-height: calc(100dvh - 16px);
      }
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
      info_alert: config.info_alert,
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
  enableClose(): void {
    this.toggleAttribute("layered", true);
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

  focusDialog(): void {
    (this.renderRoot.querySelector(".dialog") as HTMLElement | null)?.focus({ preventScroll: true });
  }

  protected render() {
    const config = this.config!;
    const layered = this.hasAttribute("layered");
    const style = config.width ? `--dialogWidth: ${config.width}` : "";
    return html`${layered ? nothing : html`<div class="hash">${config.hash}</div>`}<div class="dialog" style=${style}
      role=${layered ? "dialog" : nothing} aria-modal=${layered ? "true" : nothing} aria-label=${config.title ?? nothing}
      tabindex=${layered ? "-1" : nothing}>${this.panel}</div>`;
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
}

registerCard("graphite-dialog", GraphiteDialog, {
  name: "Graphite Dialog",
  description: "Dialog that opens on a hash (e.g. #lights) from every view; header like graphite-panel.",
});
