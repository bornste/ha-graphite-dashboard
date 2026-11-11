// Dialog layer: opens graphite-dialog cards on a hash (#lights), from every view of the dashboard.
// Home Assistant only builds the current view, so a dialog card in another view (e.g. a subview
// "dialogs") does not exist in the page. The layer therefore reads the dashboard config that the
// frontend already holds (hui-root.lovelace.config), finds the dialog with this hash and creates a
// copy of it above the current view.
//
// The layer is mounted inside the view container of hui-root: actions of the cards in the dialog
// (more-info, toggle, navigate ...) bubble up to Home Assistant like from any card, and Home
// Assistant's own dialogs (more-info) open above it.
//
// History: a dialog opened by navigation (tap on a link to #lights) is closed with history.back(),
// so the back button and the close button do the same. A dialog opened by loading a URL with the
// hash is closed by removing the hash (no foreign history entry is touched).
// Hashes no graphite-dialog knows (e.g. Bubble Card pop-ups) are ignored.
import { normalizeHash, type GraphiteDialog, type DialogConfig } from "../cards/graphite-dialog";

interface HomeAssistantElement extends HTMLElement {
  hass?: Record<string, unknown>;
}

interface OpenLayer {
  host: HTMLElement;
  dialog: GraphiteDialog;
  sheet: boolean;
}

interface LovelaceRoot extends HTMLElement {
  lovelace?: { config?: Record<string, unknown> };
}

const layerStyles = `
  :host {
    /* the dashboard stays visible behind, blurred and dimmed */
    background: color-mix(in srgb, var(--graphite-ground, #0a0a0b) 40%, transparent);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  graphite-dialog {
    display: flex;
    justify-content: center;
    width: 100%;
    max-height: 100%;
  }
`;

// open: zoom in with a decelerating curve; close: the same backwards, faster and accelerating.
// Small screens get a bottom sheet that slides in from below and can be dragged down.
const emphasized = "cubic-bezier(0.2, 0, 0, 1)";
const accelerate = "cubic-bezier(0.3, 0, 0.8, 0.15)";
const sheetQuery = "(max-width: 600px)";
// a drag only starts after a few pixels, so taps on header buttons and chips stay taps
const dragThreshold = 6;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// first element with this tag name, searching through shadow roots
function findDeep(node: Element | ShadowRoot | null, tagName: string, depth = 0): Element | null {
  if (!node || depth > 12) return null;
  const root: ParentNode = (node as Element).shadowRoot ?? node;
  const direct = root.querySelector(tagName);
  if (direct) return direct;
  for (const child of root.querySelectorAll("*")) {
    if (!child.shadowRoot) continue;
    const found = findDeep(child, tagName, depth + 1);
    if (found) return found;
  }
  return null;
}

// the dialog card with this hash anywhere in the dashboard config (views, sections, nested cards)
function findDialog(node: unknown, hash: string, depth = 0): DialogConfig | undefined {
  if (!node || typeof node !== "object" || depth > 20) return undefined;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findDialog(item, hash, depth + 1);
      if (found) return found;
    }
    return undefined;
  }
  const record = node as Record<string, unknown>;
  if (record.type === "custom:graphite-dialog" && normalizeHash(record.hash) === hash) return record as unknown as DialogConfig;
  for (const key of ["views", "sections", "cards", "card"]) {
    const found = findDialog(record[key], hash, depth + 1);
    if (found) return found;
  }
  return undefined;
}

class GraphiteDialogLayer {
  private host?: HTMLElement;
  private dialog?: GraphiteDialog;
  private openHash = "";
  private openedByNavigation = false;
  private lastPath = window.location.pathname;
  private hassFrame?: number;
  private lastHass?: unknown;
  private retryTimer?: number;
  private scrollRestore?: string;
  private sheet = false;
  private detached?: OpenLayer;
  private scrollLocked = false;
  private dragEndedAt = 0;

  constructor() {
    window.addEventListener("location-changed", () => this.sync(true));
    window.addEventListener("popstate", () => this.sync(true));
    window.addEventListener("hashchange", () => this.sync(true));
    document.addEventListener("keydown", (event) => this.handleKey(event));
    this.sync(false);
  }

  private get homeAssistant(): HomeAssistantElement | null {
    return document.querySelector("home-assistant") as HomeAssistantElement | null;
  }

  private get lovelaceRoot(): LovelaceRoot | null {
    return findDeep(this.homeAssistant, "hui-root") as LovelaceRoot | null;
  }

  // compares the URL with the open dialog: open, switch or close
  private sync(byNavigation: boolean, attempt = 0): void {
    window.clearTimeout(this.retryTimer);
    const samePage = window.location.pathname === this.lastPath;
    this.lastPath = window.location.pathname;
    let hash = "";
    try {
      hash = normalizeHash(decodeURIComponent(window.location.hash));
    } catch {
      hash = normalizeHash(window.location.hash);
    }
    if (!hash || hash === "#") {
      this.remove();
      return;
    }
    if (hash === this.openHash) return;
    const root = this.lovelaceRoot;
    const config = root?.lovelace?.config ? findDialog(root.lovelace.config, hash) : undefined;
    if (!config) {
      // right after loading, the dashboard may not be there yet: try again for a few seconds
      if (!root?.lovelace?.config && attempt < 20) {
        this.retryTimer = window.setTimeout(() => this.sync(byNavigation, attempt + 1), 300);
      } else {
        this.remove();
      }
      return;
    }
    this.show(config, hash, byNavigation && samePage);
  }

  private get mountPoint(): ParentNode | null {
    const root = this.lovelaceRoot;
    // inside the view container, so card actions reach Home Assistant; hui-root as fallback;
    // outside a dashboard (e.g. the showcase) the page itself
    return root?.shadowRoot?.querySelector("#view") ?? root?.shadowRoot ?? document.body;
  }

  private show(config: DialogConfig, hash: string, openedByNavigation: boolean): void {
    const mount = this.mountPoint;
    if (!mount) return;
    this.remove(false);
    this.openHash = hash;
    this.openedByNavigation = openedByNavigation;
    const layer = this.createLayer(config, mount, 8, () => this.close());
    this.host = layer.host;
    this.dialog = layer.dialog;
    this.sheet = layer.sheet;
    this.lockScroll();
    this.followHass();
    this.animateIn(layer);
  }

  // A dialog opened by a card itself (e.g. the details of a calendar event), not by a hash.
  // It lies above an open hash dialog and closes with X, backdrop, Escape or a drag; the history
  // and the URL stay as they are.
  openDetached(config: DialogConfig): void {
    const mount = this.mountPoint;
    if (!mount) return;
    this.closeDetached(false);
    const layer = this.createLayer(config, mount, 9, () => this.closeDetached());
    this.detached = layer;
    if (!this.host) this.lockScroll();
    this.animateIn(layer);
  }

  closeDetached(animated = true): void {
    const layer = this.detached;
    if (!layer) return;
    this.detached = undefined;
    if (!this.host) this.unlockScroll();
    this.animateOut(layer, animated);
  }

  // backdrop and dialog: centered, or a bottom sheet on small screens
  private createLayer(config: DialogConfig, mount: ParentNode, zIndex: number, close: () => void): OpenLayer {
    const sheet = window.matchMedia(sheetQuery).matches;
    const host = document.createElement("graphite-dialog-layer");
    // layout inline: the view container styles its children (e.g. flex-direction: column) and
    // would override :host rules
    Object.assign(host.style, {
      position: "fixed",
      inset: "0",
      zIndex: String(zIndex),
      display: "flex",
      flexDirection: "row",
      alignItems: sheet ? "flex-end" : "center",
      justifyContent: "center",
      width: "auto",
      height: "auto",
      maxWidth: "none",
      margin: "0",
      padding: sheet ? "0" : "16px",
      boxSizing: "border-box",
    });
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${layerStyles}</style>`;
    this.copyTheme(host, mount);

    const dialog = document.createElement("graphite-dialog") as GraphiteDialog;
    dialog.setConfig(config);
    dialog.hass = this.homeAssistant?.hass as any;
    this.lastHass = this.homeAssistant?.hass;
    dialog.enableClose(sheet);
    dialog.addEventListener("graphite-dialog-close", () => close());
    shadow.append(dialog);
    // a click on the backdrop (outside the dialog box) closes it
    host.addEventListener("click", (event) => {
      const target = event.composedPath()[0];
      // the click that ends a drag of the sheet is not a click on the backdrop
      if (performance.now() - this.dragEndedAt < 300) return;
      if (target === host || target === dialog) close();
    });
    if (sheet) this.attachDrag(host, dialog, close);
    mount.append(host);
    return { host, dialog, sheet };
  }

  private animateIn({ host, dialog, sheet }: OpenLayer): void {
    host.animate([{ opacity: 0 }, { opacity: 1 }], { duration: sheet ? 300 : 200, easing: "ease" });
    if (!reducedMotion()) dialog.animate(sheet
      ? [{ transform: "translateY(100%)" }, { transform: "none" }]
      : [{ transform: "scale(0.94)", opacity: 0 }, { transform: "none", opacity: 1 }],
    { duration: sheet ? 300 : 250, easing: emphasized });
    dialog.updateComplete.then(() => {
      dialog.watchScroll();
      dialog.focusDialog();
    });
  }

  // the dialog zooms out (or slides down as a sheet) before it is removed
  private animateOut({ host, dialog, sheet }: OpenLayer, animated: boolean): void {
    if (!animated || !host.isConnected) {
      host.remove();
      return;
    }
    const from = dialog.style.transform || "none";
    const duration = sheet ? 200 : 150;
    // a closing layer never catches taps; it is removed by a timer, because animations do not run
    // on a hidden page (screen off, other tab) and would never finish there
    host.style.pointerEvents = "none";
    window.setTimeout(() => host.remove(), duration + 50);
    host.animate([{ opacity: Number(host.style.opacity || 1) }, { opacity: 0 }], { duration, easing: "ease", fill: "forwards" });
    if (!reducedMotion()) {
      dialog.animate(sheet
        ? [{ transform: from }, { transform: "translateY(100%)" }]
        : [{ transform: "none", opacity: 1 }, { transform: "scale(0.96)", opacity: 0 }],
      { duration, easing: accelerate, fill: "forwards" });
    }
  }

  // bottom sheet: dragged down at the handle or header; a quarter of its height or a fling closes it
  private attachDrag(host: HTMLElement, dialog: GraphiteDialog, close: () => void): void {
    let drag: { pointerId: number; startY: number; lastY: number; lastTime: number; speed: number; active: boolean } | undefined;
    dialog.addEventListener("pointerdown", (event) => {
      // the content scrolls, the close button closes: neither starts a drag
      const path = event.composedPath();
      if (path.some((node) => node instanceof HTMLElement && (node.getAttribute("part") === "content" || node.classList.contains("close")))) return;
      drag = { pointerId: event.pointerId, startY: event.clientY, lastY: event.clientY, lastTime: performance.now(), speed: 0, active: false };
    });
    dialog.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const offset = Math.max(0, event.clientY - drag.startY);
      if (!drag.active) {
        if (offset < dragThreshold) return;
        drag.active = true;
        dialog.setPointerCapture(event.pointerId);
      }
      const now = performance.now();
      drag.speed = (event.clientY - drag.lastY) / Math.max(1, now - drag.lastTime);
      drag.lastY = event.clientY;
      drag.lastTime = now;
      dialog.style.transform = `translateY(${offset}px)`;
      host.style.opacity = String(1 - Math.min(1, offset / Math.max(1, dialog.offsetHeight)) * 0.6);
    });
    const end = () => {
      if (!drag) return;
      const { active, lastY, startY, speed } = drag;
      drag = undefined;
      if (!active) return;
      this.dragEndedAt = performance.now();
      const offset = Math.max(0, lastY - startY);
      if (offset > dialog.offsetHeight / 4 || speed > 0.6) {
        close();
        return;
      }
      host.style.opacity = "";
      dialog.animate([{ transform: dialog.style.transform }, { transform: "none" }], { duration: 200, easing: emphasized });
      dialog.style.transform = "";
    };
    dialog.addEventListener("pointerup", end);
    dialog.addEventListener("pointercancel", end);
  }

  // the layer is not inside the view: the theme variables of the view are copied onto it
  private copyTheme(host: HTMLElement, mount: ParentNode): void {
    const sources: HTMLElement[] = [];
    if (mount instanceof HTMLElement) sources.push(mount);
    const view = mount.querySelector?.("hui-view") as HTMLElement | null;
    if (view) sources.push(view);
    for (const source of sources) {
      for (let index = 0; index < source.style.length; index++) {
        const name = source.style.item(index);
        if (name.startsWith("--")) host.style.setProperty(name, source.style.getPropertyValue(name));
      }
    }
  }

  // hass changes with every state change: passed on to the dialog while it is open
  // also keeps the layer in the page: right after loading, Home Assistant renders the view
  // container again and removes everything in it, the open dialog included
  private followHass(): void {
    const step = () => {
      if (this.host && !this.host.isConnected) this.remount(this.host);
      const hass = this.homeAssistant?.hass;
      if (this.dialog && hass && hass !== this.lastHass) {
        this.lastHass = hass;
        this.dialog.hass = hass as any;
      }
      this.hassFrame = requestAnimationFrame(step);
    };
    this.hassFrame = requestAnimationFrame(step);
  }

  private remount(host: HTMLElement): void {
    const mount = this.mountPoint;
    if (!mount) return;
    this.copyTheme(host, mount);
    mount.append(host);
  }

  // the page behind does not scroll while any dialog is open (hash or detached, or both)
  private lockScroll(): void {
    if (this.scrollLocked) return;
    this.scrollLocked = true;
    this.scrollRestore = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
  }

  private unlockScroll(): void {
    if (!this.scrollLocked) return;
    this.scrollLocked = false;
    document.documentElement.style.overflow = this.scrollRestore ?? "";
  }

  // close button, backdrop, Escape: back in the history, or the hash is removed
  close(): void {
    if (!this.openHash) return;
    if (this.openedByNavigation) {
      this.openedByNavigation = false;
      window.history.back();
      return;
    }
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: true } }));
    this.remove();
  }

  // animated unless another dialog takes its place; a detached dialog above it closes with it
  private remove(animated = true): void {
    if (this.hassFrame !== undefined) cancelAnimationFrame(this.hassFrame);
    this.hassFrame = undefined;
    const host = this.host;
    const dialog = this.dialog;
    this.host = undefined;
    this.dialog = undefined;
    this.openHash = "";
    this.closeDetached(animated);
    if (!host || !dialog) return;
    this.unlockScroll();
    this.animateOut({ host, dialog, sheet: this.sheet }, animated);
  }

  // Escape closes the topmost dialog, unless it was meant for a dialog above it (e.g. more-info)
  private handleKey(event: KeyboardEvent): void {
    const top = this.detached?.host ?? this.host;
    if (event.key !== "Escape" || !top) return;
    const path = event.composedPath();
    const target = path[0];
    if (!path.includes(top) && target !== document.body && target !== document.documentElement) return;
    if (this.detached) this.closeDetached();
    else this.close();
  }
}

declare global {
  interface Window {
    graphiteDialogLayer?: GraphiteDialogLayer;
  }
}

// one layer per page, also when the library is loaded twice
if (!window.graphiteDialogLayer) {
  const start = () => { window.graphiteDialogLayer = window.graphiteDialogLayer ?? new GraphiteDialogLayer(); };
  if (document.body) start();
  else window.addEventListener("DOMContentLoaded", start);
}
