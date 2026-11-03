// SBO Toast - dashboard notifications at the bottom center, triggered from automations.
// Loaded as a dashboard resource; mounts its own layer once and listens to a text helper.
// The helper holds a small JSON payload written by script.dashboard_toast:
//   {"m": "[Besuchermodus] aktiviert", "d": "detail line", "i": "ic:twotone-...", "c": "success", "t": 4,
//    "u": ["Tablet"], "p": ["home-dashboard"], "n": 1792580000.12}
// m = message ([brackets] = keyword), d = optional detail, i = icon, c = color (accent | success | danger | CSS),
// t = seconds, u = only for these users, p = only on these dashboard paths, n = nonce (repeats the same text).
const toastVersion = "0.2.0";
const toastEntity = "input_text.dashboard_toast";
const toastColors = { accent: "#f5c48a", success: "#a8d5a2", danger: "#e8908a" };
// theme tokens copied from the dashboard (the layer lives outside of it and would not inherit them)
const toastTokens = ["--sbo-surface-tile-active", "--sbo-text-primary", "--sbo-text-secondary", "--sbo-accent", "--sbo-success", "--sbo-danger"];

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
    background: color-mix(in srgb, var(--sbo-text-primary, #f3f3f4) 8%, var(--sbo-surface-tile-active, #2b2b2c));
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    color: var(--sbo-text-primary, #f3f3f4);
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
    color: var(--toastColor, var(--sbo-text-primary, #f3f3f4));
  }
  .lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .message b {
    font-weight: 500;
    color: var(--toastColor, var(--sbo-text-primary, #f3f3f4));
  }
  .detail {
    font-size: 13px;
    font-weight: 400;
    color: var(--sbo-text-secondary, #b4b4b8);
  }
  .detail:empty { display: none; }
  /* remaining time */
  .bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: var(--toastColor, var(--sbo-text-primary, #f3f3f4));
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

class SboToastLayer {
  constructor() {
    this.queue = [];
    this.busy = false;
    this.lastNonce = null;
    this.startedAt = Date.now();
    this.host = document.createElement("sbo-toast-layer");
    this.root = this.host.attachShadow({ mode: "open" });
    this.root.innerHTML = `<style>${toastStyles}</style><div class="toast" role="status" aria-live="polite"></div>`;
    document.body.appendChild(this.host);
    this.connect();
  }

  get hass() {
    return document.querySelector("home-assistant")?.hass;
  }

  // waits for the HA connection, then subscribes to the helper (works for non-admin users)
  connect() {
    const hass = this.hass;
    if (!hass?.connection) {
      setTimeout(() => this.connect(), 1000);
      return;
    }
    hass.connection.subscribeMessage((message) => this.handleEntities(message), { type: "subscribe_entities", entity_ids: [toastEntity] });
  }

  handleEntities(message) {
    const entry = message.a?.[toastEntity] || message.c?.[toastEntity]?.["+"];
    const state = entry?.s;
    if (state === undefined) return;
    let payload;
    try {
      payload = JSON.parse(state);
    } catch (error) {
      return;
    }
    if (!payload || !payload.m) return;
    const nonce = String(payload.n ?? state);
    // the first state after loading is the last toast: only remember it
    if (this.lastNonce === null) {
      this.lastNonce = nonce;
      if (!payload.n || Date.now() / 1000 - Number(payload.n) > 10) return;
    } else if (nonce === this.lastNonce) {
      return;
    }
    this.lastNonce = nonce;
    if (!this.isForMe(payload)) return;
    this.queue.push(payload);
    if (!this.busy) this.next();
  }

  // optional targets: user names and dashboard paths
  isForMe(payload) {
    const users = [].concat(payload.u || []).map((name) => String(name).toLowerCase());
    if (users.length && !users.includes(String(this.hass?.user?.name || "").toLowerCase())) return false;
    const paths = [].concat(payload.p || []);
    if (paths.length && !paths.some((path) => window.location.pathname.split("/")[1] === String(path).replace(/^\//, ""))) return false;
    return true;
  }

  // copies the Graphite tokens from the open dashboard onto the layer
  applyTokens() {
    const source = this.findDeep(document.querySelector("home-assistant"), "hui-root", 0);
    if (!source) return;
    const style = getComputedStyle(source);
    for (const token of toastTokens) {
      const value = style.getPropertyValue(token).trim();
      if (value) this.host.style.setProperty(token, value);
    }
  }

  // first element with this tag name, searching through shadow roots
  findDeep(node, tagName, depth) {
    if (!node || depth > 12) return null;
    const root = node.shadowRoot || node;
    const direct = root.querySelector(tagName);
    if (direct) return direct;
    for (const child of root.querySelectorAll("*")) {
      if (!child.shadowRoot) continue;
      const found = this.findDeep(child, tagName, depth + 1);
      if (found) return found;
    }
    return null;
  }

  escape(text) {
    return String(text ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  // [brackets] become the colored keyword
  messageHtml(text) {
    let html = "";
    let rest = this.escape(text);
    for (let guard = 0; guard < 10; guard++) {
      const start = rest.indexOf("["), end = rest.indexOf("]", start);
      if (start < 0 || end < 0) break;
      html += `${rest.slice(0, start)}<b>${rest.slice(start + 1, end)}</b>`;
      rest = rest.slice(end + 1);
    }
    return html + rest;
  }

  next() {
    const payload = this.queue.shift();
    if (!payload) {
      this.busy = false;
      return;
    }
    this.busy = true;
    this.applyTokens();
    const toast = this.root.querySelector(".toast");
    const color = payload.c ? (toastColors[payload.c] ? `var(--sbo-${payload.c}, ${toastColors[payload.c]})` : payload.c) : "";
    if (color) toast.style.setProperty("--toastColor", color);
    else toast.style.removeProperty("--toastColor");
    const duration = Math.min(30, Math.max(1, Number(payload.t) || 4)) * 1000;
    toast.innerHTML = (payload.i ? `<ha-icon icon="${this.escape(payload.i)}"></ha-icon>` : "")
      + `<div class="lines"><span class="message">${this.messageHtml(payload.m)}</span><span class="detail">${this.escape(payload.d || "")}</span></div>`
      + `<div class="bar"></div>`;
    toast.querySelector(".bar").animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration, easing: "linear", fill: "forwards" });
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => this.next(), 300);
    }, duration);
  }
}

if (!window.sboToastLayer) {
  const start = () => { window.sboToastLayer = window.sboToastLayer || new SboToastLayer(); };
  if (document.body) start();
  else window.addEventListener("DOMContentLoaded", start);
  console.info(`%c SBO-TOAST %c ${toastVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
}
