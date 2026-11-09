// graphite-toast: dashboard notifications at the bottom center, triggered from automations.
// Part of the library (no card): the layer mounts itself once and listens to a text helper.
// The helper holds a small JSON payload written by script.dashboard_toast:
//   {"m": "[Guest mode] on", "d": "detail line", "i": "mdi:account", "c": "success", "t": 4,
//    "u": ["Tablet"], "p": ["home-dashboard"], "n": 1792580000.12}
// m = message ([brackets] = keyword), d = optional detail, i = icon, c = color (accent | success |
// danger | CSS), t = seconds, u = only for these users, p = only on these dashboard paths,
// n = nonce and time of the toast (repeats the same text, drops stale toasts).
//
// Timing is driven by wall-clock end times, not by animation frames: a hidden page (screen off,
// other tab) pauses animation frames but not timers, so the toast could be shown after it was
// already hidden and then stay forever. Every step checks the end time instead, and the toast is
// closed as soon as the page is visible again.
import { html, render, type TemplateResult } from "lit";

const toastEntity = "input_text.dashboard_toast";
const toastColors: Record<string, string> = { accent: "#f5c48a", success: "#a8d5a2", danger: "#e8908a" };
// theme tokens copied from the dashboard (the layer lives outside of it and does not inherit them)
const toastTokens = ["--graphite-surface-tile-active", "--graphite-text-primary", "--graphite-text-secondary",
  "--graphite-accent", "--graphite-success", "--graphite-danger"];
const fadeMilliseconds = 300;
// a toast whose end lies further back than this is not shown any more (e.g. after the tablet slept)
const staleMilliseconds = 10000;

interface ToastPayload {
  m: string;
  d?: string;
  i?: string;
  c?: string;
  t?: number;
  u?: string | string[];
  p?: string | string[];
  n?: number;
}

interface ActiveToast {
  id: number;
  endsAt: number;
}

interface EntityMessage {
  a?: Record<string, { s?: string }>;
  c?: Record<string, { "+"?: { s?: string } }>;
}

interface HassLike {
  connection?: { subscribeMessage(callback: (message: EntityMessage) => void, message: Record<string, unknown>): Promise<() => void> };
  user?: { name?: string };
}

const toastStyles = `
  :host {
    position: fixed;
    left: 0;
    right: 0;
    bottom: var(--toastBottom, 24px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    pointer-events: none;
    font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  }
  .toast {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    min-width: min(360px, calc(100vw - 32px));
    max-width: min(640px, calc(100vw - 32px));
    min-height: 64px;
    padding: 12px 28px 12px 20px;
    box-sizing: border-box;
    border-radius: 32px;
    overflow: hidden;
    /* one step above the tiles, so it stands out on panels */
    background: color-mix(in srgb, var(--graphite-text-primary, #f3f3f4) 8%, var(--graphite-surface-tile-active, #2b2b2c));
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    color: var(--graphite-text-primary, #f3f3f4);
    /* message like the status text: 17/300, keyword 500 */
    font-size: 17px;
    font-weight: 300;
    line-height: 1.35;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  .toast.show {
    opacity: 1;
    transform: none;
  }
  ha-icon {
    --mdc-icon-size: 28px;
    flex: none;
    color: var(--toastColor, var(--graphite-text-primary, #f3f3f4));
  }
  .lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .message b {
    font-weight: 500;
    color: var(--toastColor, var(--graphite-text-primary, #f3f3f4));
  }
  .detail {
    font-size: 13px;
    font-weight: 400;
    color: var(--graphite-text-secondary, #b4b4b8);
  }
  /* remaining time */
  .bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: var(--toastColor, var(--graphite-text-primary, #f3f3f4));
    opacity: 0.35;
    transform-origin: left;
  }
  @media (max-width: 767px) {
    :host { bottom: var(--toastBottomMobile, 96px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast { transition: opacity 0.25s ease; transform: none; }
  }
`;

class GraphiteToastLayer {
  private readonly host: HTMLElement;
  private readonly toast: HTMLElement;
  private queue: ToastPayload[] = [];
  private current?: ActiveToast;
  private counter = 0;
  private lastNonce: string | null = null;
  private hideTimer?: number;
  private nextTimer?: number;
  private subscribed = false;

  constructor() {
    this.host = document.createElement("graphite-toast-layer");
    const root = this.host.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${toastStyles}</style><div class="toast" role="status" aria-live="polite"></div>`;
    this.toast = root.querySelector(".toast") as HTMLElement;
    document.body.appendChild(this.host);
    // timers keep running while the page is hidden, animation frames do not: catch up on return
    document.addEventListener("visibilitychange", () => this.checkExpired());
    window.addEventListener("pageshow", () => this.checkExpired());
    this.connect();
  }

  private get hass(): HassLike | undefined {
    return (document.querySelector("home-assistant") as (Element & { hass?: HassLike }) | null)?.hass;
  }

  // waits for the HA connection, then subscribes to the helper (works for non-admin users);
  // the websocket library subscribes again by itself after a reconnect
  private connect(): void {
    const connection = this.hass?.connection;
    if (!connection) {
      window.setTimeout(() => this.connect(), 1000);
      return;
    }
    if (this.subscribed) return;
    this.subscribed = true;
    connection.subscribeMessage((message) => this.handleEntities(message), { type: "subscribe_entities", entity_ids: [toastEntity] })
      .catch(() => {
        this.subscribed = false;
        window.setTimeout(() => this.connect(), 5000);
      });
  }

  private handleEntities(message: EntityMessage): void {
    const state = message.a?.[toastEntity]?.s ?? message.c?.[toastEntity]?.["+"]?.s;
    if (state === undefined) return;
    let payload: ToastPayload;
    try {
      payload = JSON.parse(state);
    } catch {
      return;
    }
    if (!payload?.m) return;
    const nonce = String(payload.n ?? state);
    // the first state after loading is the last toast: only shown if it is brand new
    const first = this.lastNonce === null;
    if (!first && nonce === this.lastNonce) return;
    this.lastNonce = nonce;
    if (first && (!payload.n || Date.now() / 1000 - Number(payload.n) > 10)) return;
    if (!this.isForMe(payload)) return;
    this.queue.push(payload);
    this.next();
  }

  // optional targets: user names and dashboard paths
  private isForMe(payload: ToastPayload): boolean {
    const users = ([] as string[]).concat(payload.u ?? []).map((name) => String(name).toLowerCase());
    if (users.length && !users.includes(String(this.hass?.user?.name ?? "").toLowerCase())) return false;
    const dashboard = window.location.pathname.split("/")[1];
    const paths = ([] as string[]).concat(payload.p ?? []).map((path) => String(path).split("/").filter(Boolean)[0] ?? "");
    return !paths.length || paths.includes(dashboard);
  }

  private durationOf(payload: ToastPayload): number {
    return Math.min(30, Math.max(1, Number(payload.t) || 4)) * 1000;
  }

  // a queued toast whose time has long passed (the page was asleep) is dropped
  private isStale(payload: ToastPayload): boolean {
    if (!payload.n) return false;
    const endsAt = Number(payload.n) * 1000 + this.durationOf(payload);
    return Date.now() - endsAt > staleMilliseconds;
  }

  // copies the Graphite tokens from the open dashboard onto the layer
  private applyTokens(): void {
    const source = this.findDeep(document.querySelector("home-assistant"), "hui-root", 0);
    if (!source) return;
    const style = getComputedStyle(source);
    for (const token of toastTokens) {
      const value = style.getPropertyValue(token).trim();
      if (value) this.host.style.setProperty(token, value);
    }
  }

  // first element with this tag name, searching through shadow roots
  private findDeep(node: Element | null, tagName: string, depth: number): Element | null {
    if (!node || depth > 12) return null;
    const root: ParentNode = node.shadowRoot ?? node;
    const direct = root.querySelector(tagName);
    if (direct) return direct;
    for (const child of root.querySelectorAll("*")) {
      if (!child.shadowRoot) continue;
      const found = this.findDeep(child, tagName, depth + 1);
      if (found) return found;
    }
    return null;
  }

  // [brackets] become the colored keyword
  private message(text: string): Array<TemplateResult | string> {
    const parts: Array<TemplateResult | string> = [];
    let rest = String(text ?? "");
    for (let guard = 0; guard < 10; guard++) {
      const start = rest.indexOf("[");
      const end = start < 0 ? -1 : rest.indexOf("]", start);
      if (start < 0 || end < 0) break;
      parts.push(rest.slice(0, start), html`<b>${rest.slice(start + 1, end)}</b>`);
      rest = rest.slice(end + 1);
    }
    parts.push(rest);
    return parts;
  }

  // shows the next queued toast unless one is showing
  private next(): void {
    if (this.current || this.nextTimer) return;
    let payload = this.queue.shift();
    while (payload && this.isStale(payload)) payload = this.queue.shift();
    if (!payload) return;
    try {
      this.show(payload);
    } catch (error) {
      // never block the queue: drop this toast and continue
      console.warn("graphite-toast: toast could not be shown", error);
      this.current = undefined;
      this.toast.classList.remove("show");
      this.next();
    }
  }

  private show(payload: ToastPayload): void {
    const id = ++this.counter;
    const duration = this.durationOf(payload);
    const endsAt = Date.now() + duration;
    this.current = { id, endsAt };
    this.applyTokens();
    const color = payload.c ? (toastColors[payload.c] ? `var(--graphite-${payload.c}, ${toastColors[payload.c]})` : payload.c) : "";
    if (color) this.toast.style.setProperty("--toastColor", color);
    else this.toast.style.removeProperty("--toastColor");
    render(html`
      ${payload.i ? html`<ha-icon icon=${payload.i}></ha-icon>` : ""}
      <div class="lines">
        <span class="message">${this.message(payload.m)}</span>
        ${payload.d ? html`<span class="detail">${payload.d}</span>` : ""}
      </div>
      <div class="bar"></div>
    `, this.toast);
    this.toast.querySelector(".bar")?.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
      { duration, easing: "linear", fill: "forwards" });
    // fade in on the next frames, but only while this toast is still current and not over
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (this.current?.id === id && Date.now() < endsAt) this.toast.classList.add("show");
    }));
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.hide(id), duration);
  }

  private hide(id: number): void {
    if (this.current?.id !== id) return;
    window.clearTimeout(this.hideTimer);
    this.current = undefined;
    this.toast.classList.remove("show");
    window.clearTimeout(this.nextTimer);
    this.nextTimer = window.setTimeout(() => {
      this.nextTimer = undefined;
      this.next();
    }, fadeMilliseconds);
  }

  // back on a visible page: close a toast whose time is over
  private checkExpired(): void {
    if (document.hidden) return;
    if (this.current && Date.now() >= this.current.endsAt) this.hide(this.current.id);
    else if (!this.current) this.toast.classList.remove("show");
  }
}

declare global {
  interface Window {
    graphiteToastLayer?: GraphiteToastLayer;
  }
}

// one layer per page, also when the library is loaded twice
if (!window.graphiteToastLayer) {
  const start = () => { window.graphiteToastLayer = window.graphiteToastLayer ?? new GraphiteToastLayer(); };
  if (document.body) start();
  else window.addEventListener("DOMContentLoaded", start);
}
