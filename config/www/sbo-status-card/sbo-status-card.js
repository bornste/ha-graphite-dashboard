// SBO Status Card - clock with date and a short status summary written as prose.
// Every item contributes a phrase when its condition is met; alerts come first (accent),
// the rest follows in a second sentence. Parts in [brackets] are highlighted and tappable.
const cardVersion = "0.7.3";

// shortcuts for the highlight color of an item
const markColors = { accent: "var(--sbo-accent, #f5c48a)", success: "var(--sbo-success, #a8d5a2)", danger: "var(--sbo-danger, #e8908a)" };

const dayMs = 86400000;
const pickupRefreshMs = 30 * 60000;

const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const cardStyles = `
  :host {
    display: block;
    --statusText: var(--sbo-text-primary, #f3f3f4);
    --statusText2: var(--sbo-text-secondary, #b4b4b8);
    --statusText3: var(--sbo-text-muted, #8f8f92);
    --statusAccent: var(--sbo-accent, #f5c48a);
  }
  ha-card {
    background: none;
    border: none;
    box-shadow: none;
    padding: 0 4px var(--sbo-clock-space-below, 12px);
    user-select: none;
    -webkit-user-select: none;
  }
  /* date next to the time, separated by a thin line: line from cap top to baseline of the digits,
     weekday above the date, the date line on the baseline of the time (all measured) */
  .clock {
    display: flex;
    align-items: stretch;
    gap: 16px;
  }
  .time {
    font-size: var(--sbo-clock-size, 76px);
    font-weight: 300;
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--statusText);
  }
  .separator {
    width: 1px;
    margin: var(--capTop, 10px) 0 var(--baseGap, 6px);
    /* same opaque separator as the title | status headers (theme token) */
    background: var(--sbo-separator, color-mix(in srgb, var(--sbo-ink, #f3f3f4) 18%, var(--sbo-ground, #0a0a0b)));
  }
  .date {
    margin: var(--capTop, 10px) 0 var(--dateBaseGap, 2px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    font-size: 18px;
    line-height: 1.3;
    color: var(--statusText);
  }
  .date .weekday {
    font-size: 14px;
    color: var(--statusText2);
  }
  .greeting {
    margin-top: 14px;
    font-size: 13px;
    color: var(--statusText3);
    letter-spacing: 0.02em;
  }
  .greeting[hidden] { display: none; }
  .prose {
    margin-top: var(--sbo-status-gap, 14px);
    font-size: var(--sbo-status-size, 17px);
    line-height: 1.5;
    font-weight: 300;
    color: var(--statusText2);
  }
  .greeting:not([hidden]) + .prose { margin-top: 4px; }
  .prose:empty { display: none; }
  .mark {
    font-weight: 500;
    color: var(--statusText);
  }
  .mark.alert { color: var(--markColor, var(--statusAccent)); }
  .mark.colored { color: var(--markColor); }
  /* inline icon ({icon} / {icon:mdi:name}), sized and aligned like a capital letter */
  .inlineIcon {
    --mdc-icon-size: 1.05em;
    display: inline-flex;
    vertical-align: -0.12em;
    margin-right: 0.15em;
  }
  /* items with line: 2, 3 … start on their own line */
  .line + .line { margin-top: var(--sbo-status-line-gap, 10px); }
  .mark[data-index] {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    border-radius: 4px;
  }
  .mark[data-index]:active { opacity: 0.7; }
`;

class SboStatusCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.lastProse = null;
    this.lastMinute = "";
    this.pickupCache = {};
    this.shadowRoot.addEventListener("click", (event) => this.handleClick(event));
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.items)) throw new Error("items is required");
    this.config = config;
    this.shadowRoot.innerHTML = `<style>${cardStyles}</style>
      <ha-card>
        <div class="clock"><div class="time"></div><div class="separator"></div><div class="date"></div></div>
        <div class="greeting" hidden></div>
        <div class="prose"></div>
      </ha-card>`;
    this.setupHold();
    this.lastProse = null;
    this.lastMinute = "";
    this.render();
  }

  set hass(hass) {
    this.hassObject = hass;
    this.render();
  }

  connectedCallback() {
    // the clock ticks on its own, aligned to the next full minute
    clearTimeout(this.tickTimer);
    const tick = () => {
      this.renderClock();
      this.tickTimer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    tick();
    // align the date once fonts are ready
    (document.fonts?.ready || Promise.resolve()).then(() => this.alignDate());
  }

  disconnectedCallback() {
    clearTimeout(this.tickTimer);
  }

  // hold on the clock, e.g. to toggle the navigation of the kiosk
  setupHold() {
    const action = this.config.hold_action;
    const card = this.shadowRoot.querySelector("ha-card");
    if (!action || !action.perform_action) return;
    let timer = null;
    const cancel = () => clearTimeout(timer);
    card.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".mark[data-index]")) return;
      timer = setTimeout(() => {
        const [domain, service] = action.perform_action.split(".");
        this.hassObject?.callService(domain, service, action.data || {}, action.target);
      }, 600);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((name) => card.addEventListener(name, cancel));
  }

  // positions of the separator and the date, measured on the digits with the font actually used
  alignDate() {
    const time = this.shadowRoot.querySelector(".time");
    const date = this.shadowRoot.querySelector(".date");
    if (!time || !date || !time.isConnected) return;
    const context = document.createElement("canvas").getContext("2d");
    const capTop = (element, sample) => {
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight) || size * 1.2;
      context.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      const metrics = context.measureText(sample);
      if (!metrics.fontBoundingBoxAscent) return null;
      const contentHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      return (lineHeight - contentHeight) / 2 + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent;
    };
    const timeTop = capTop(time, "2");
    if (timeTop === null) return;
    const card = this.shadowRoot.querySelector("ha-card");
    // digits span from cap top to baseline of the time box
    const timeStyle = getComputedStyle(time);
    const timeSize = parseFloat(timeStyle.fontSize);
    const timeLineHeight = parseFloat(timeStyle.lineHeight) || timeSize;
    context.font = `${timeStyle.fontWeight} ${timeSize}px ${timeStyle.fontFamily}`;
    const timeMetrics = context.measureText("2");
    const baseline = (timeLineHeight - timeMetrics.fontBoundingBoxAscent - timeMetrics.fontBoundingBoxDescent) / 2 + timeMetrics.fontBoundingBoxAscent;
    card.style.setProperty("--capTop", `${Math.max(0, timeTop).toFixed(1)}px`);
    card.style.setProperty("--baseGap", `${Math.max(0, timeLineHeight - baseline).toFixed(1)}px`);
    // date: shift its last line so that its baseline sits on the baseline of the time
    const dateStyle = getComputedStyle(date);
    const dateSize = parseFloat(dateStyle.fontSize);
    const dateLineHeight = parseFloat(dateStyle.lineHeight) || dateSize * 1.2;
    context.font = `${dateStyle.fontWeight} ${dateSize}px ${dateStyle.fontFamily}`;
    const dateMetrics = context.measureText("D");
    const dateBaseline = (dateLineHeight - dateMetrics.fontBoundingBoxAscent - dateMetrics.fontBoundingBoxDescent) / 2 + dateMetrics.fontBoundingBoxAscent;
    const dateBelowBaseline = dateLineHeight - dateBaseline;
    card.style.setProperty("--dateBaseGap", `${((timeLineHeight - baseline) - dateBelowBaseline).toFixed(1)}px`);
  }

  renderClock() {
    if (!this.config) return;
    const now = new Date();
    const minute = `${now.getHours()}:${now.getMinutes()}`;
    if (minute === this.lastMinute) return;
    this.lastMinute = minute;
    this.lastProse = null;
    setTimeout(() => this.render(), 0);
    this.shadowRoot.querySelector(".time").textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    this.shadowRoot.querySelector(".date").innerHTML = `<span class="weekday">${weekdayNames[now.getDay()]}</span><span>${now.getDate()}. ${monthNames[now.getMonth()]}</span>`;
    const greeting = this.shadowRoot.querySelector(".greeting");
    greeting.hidden = !this.config.greeting;
    if (this.config.greeting) {
      const hour = now.getHours();
      greeting.textContent = hour < 5 ? "Gute Nacht" : hour < 11 ? "Guten Morgen" : hour < 17 ? "Guten Tag" : hour < 22 ? "Guten Abend" : "Gute Nacht";
    }
  }

  // ---------- waste collection (calendar entities) ----------

  startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  dayFromString(text) {
    const parts = String(text).substring(0, 10).split("-").map(Number);
    return parts.length === 3 && parts.every(Number.isFinite) ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
  }

  // collection days of a calendar for the next days, loaded via the calendar API and cached
  pickupDays(entityId) {
    const today = this.startOfDay(new Date());
    const entry = this.pickupCache[entityId];
    const isFresh = entry && entry.day === today.getTime() && Date.now() - entry.fetchedAt < pickupRefreshMs;
    if (!isFresh && !(entry && entry.pending) && this.hassObject?.callApi) {
      this.pickupCache[entityId] = { ...(entry || {}), pending: true };
      const end = new Date(today.getTime() + 14 * dayMs);
      this.hassObject.callApi("GET", `calendars/${entityId}?start=${encodeURIComponent(today.toISOString())}&end=${encodeURIComponent(end.toISOString())}`)
        .then((events) => (Array.isArray(events) ? events : []).map((event) => this.dayFromString(typeof event.start === "string" ? event.start : (event.start?.date || event.start?.dateTime || ""))).filter(Boolean))
        .catch(() => entry?.days || null)
        .then((days) => {
          this.pickupCache[entityId] = { days, day: today.getTime(), fetchedAt: Date.now(), pending: false };
          this.lastProse = null;
          this.render();
        });
    }
    if (this.pickupCache[entityId]?.days) return this.pickupCache[entityId].days;
    // until the API answered: next event of the calendar entity
    const start = this.hassObject?.states?.[entityId]?.attributes?.start_time;
    const day = start ? this.dayFromString(start) : null;
    return day ? [day] : [];
  }

  // "[Karton] wird morgen abgeholt" / "[Karton] und [Papier] werden heute abgeholt";
  // a collection of today counts as done after drop_after (default 12:00, collections are in the morning)
  pickupPhrases(item, index) {
    const now = new Date();
    const today = this.startOfDay(now);
    const [dropHour, dropMinute] = String(item.drop_after || "12:00").split(":").map(Number);
    const dropTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), dropHour || 0, dropMinute || 0);
    const maxDays = Number(item.days ?? 1);
    const byDay = new Map();
    for (const entityId of item.pickup) {
      let next = null;
      for (const date of this.pickupDays(entityId)) {
        const days = Math.round((date.getTime() - today.getTime()) / dayMs);
        if (days < 0 || (days === 0 && now >= dropTime) || days > maxDays) continue;
        if (next === null || days < next) next = days;
      }
      if (next === null) continue;
      const attributes = this.hassObject?.states?.[entityId]?.attributes || {};
      const name = item.names?.[entityId] || attributes.message || attributes.friendly_name || entityId;
      if (!byDay.has(next)) byDay.set(next, []);
      byDay.get(next).push(name);
    }
    const whenWords = item.when || { 0: "heute", 1: "morgen", 2: "übermorgen" };
    return [...byDay.keys()].sort((first, second) => first - second).map((days) => {
      const names = byDay.get(days).map((name) => `[${name}]`);
      const nameText = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} ${this.config.and_word || "und"} ${names[names.length - 1]}`;
      const template = names.length === 1 ? (item.text_one || "{names} wird {when} abgeholt") : (item.text || "{names} werden {when} abgeholt");
      const when = whenWords[days] || `in ${days} Tagen`;
      return { index, alert: item.alert !== false, text: template.split("{names}").join(nameText).split("{when}").join(when) };
    });
  }

  escape(text) {
    return String(text ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  // numeric_state-like check: above / below / state (single value or list)
  matches(condition, state) {
    if (!condition) return false;
    if (condition === true) return true;
    const number = Number(state);
    if (condition.above !== undefined && !(number > Number(condition.above))) return false;
    if (condition.below !== undefined && !(number < Number(condition.below))) return false;
    if (condition.state !== undefined && ![].concat(condition.state).map(String).includes(String(state))) return false;
    return true;
  }

  // phrases of all items whose condition is met
  phrases() {
    const states = this.hassObject?.states || {};
    const result = [];
    this.config.items.forEach((item, index) => {
      if (Array.isArray(item.pickup)) {
        result.push(...this.pickupPhrases(item, index));
        return;
      }
      const state = states[item.entity]?.state;
      if (state === undefined || state === "unavailable" || state === "unknown") return;
      const number = Number(state);
      const value = state !== "" && !isNaN(number) ? String(Math.round(number)) : state;
      // levels: the first level whose condition matches wins (e.g. above 1500 before above 1000)
      if (Array.isArray(item.levels)) {
        const level = item.levels.find((entry) => this.matches(entry, state));
        if (level && level.text)
          result.push({ index, alert: level.alert !== false, text: String(level.text).split("{value}").join(value) });
        return;
      }
      const isAlert = this.matches(item.alert, state);
      const isShown = isAlert || (item.show === undefined ? !item.alert : this.matches(item.show, state));
      if (!isShown) return;
      let template = isAlert && item.alert_text ? item.alert_text : item.text;
      if (Number(value) === 1 && (isAlert && item.alert_text_one ? item.alert_text_one : item.text_one))
        template = isAlert && item.alert_text_one ? item.alert_text_one : item.text_one;
      if (!template) return;
      result.push({ index, alert: isAlert, text: String(template).split("{value}").join(value) });
    });
    return result;
  }

  // "a, b und c" with [brackets] turned into tappable highlights, first letter capitalized
  sentence(phrases) {
    if (!phrases.length) return "";
    const parts = phrases.map((phrase) => {
      const item = this.config.items[phrase.index];
      const tappable = item.navigation_path || item.tap_action || item.more_info;
      const colorStyle = item.color ? ` style="--markColor: ${this.escape(markColors[item.color] || item.color)}"` : "";
      let html = "";
      let rest = this.escape(phrase.text);
      for (let guard = 0; guard < 10; guard++) {
        const start = rest.indexOf("["), end = rest.indexOf("]", start);
        if (start < 0 || end < 0) break;
        html += rest.slice(0, start)
          + `<span class="mark${phrase.alert ? " alert" : ""}${item.color ? " colored" : ""}"${colorStyle}${tappable ? ` data-index="${phrase.index}" role="link" tabindex="0"` : ""}>${rest.slice(start + 1, end)}</span>`;
        rest = rest.slice(end + 1);
      }
      return this.insertIcons(html + rest, item);
    });
    let text = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} ${this.config.and_word || "und"} ${parts[parts.length - 1]}`;
    // capitalize the first visible letter (may sit inside a highlight, after an icon)
    let position = 0;
    while (text.charAt(position) === "<" && text.indexOf(">", position) > 0)
      position = text.indexOf(">", position) + 1;
    text = text.slice(0, position) + text.charAt(position).toUpperCase() + text.slice(position + 1);
    return `${text}.`;
  }

  // {icon} = the item's icon (or the entity's icon), {icon:mdi:name} = any icon
  insertIcons(html, item) {
    let result = "";
    let rest = html;
    for (let guard = 0; guard < 10; guard++) {
      const start = rest.indexOf("{icon");
      const end = start < 0 ? -1 : rest.indexOf("}", start);
      if (start < 0 || end < 0) break;
      const spec = rest.slice(start + 1, end);
      const icon = spec === "icon"
        ? (item.icon || this.hassObject?.states?.[item.entity]?.attributes?.icon || "")
        : spec.slice(5);
      result += rest.slice(0, start) + (icon ? `<ha-icon class="inlineIcon" icon="${this.escape(icon)}"></ha-icon>` : "");
      rest = rest.slice(end + 1);
    }
    return result + rest;
  }

  render() {
    if (!this.config || !this.hassObject) return;
    this.renderClock();
    const phrases = this.phrases();
    // one paragraph line per "line" number (default 1); alerts first within each line
    const lineNumbers = [...new Set([1, ...phrases.map((phrase) => Number(this.config.items[phrase.index].line) || 1)])].sort((first, second) => first - second);
    const lines = lineNumbers.map((lineNumber) => {
      const linePhrases = phrases.filter((phrase) => (Number(this.config.items[phrase.index].line) || 1) === lineNumber);
      const alerts = linePhrases.filter((phrase) => phrase.alert);
      const others = linePhrases.filter((phrase) => !phrase.alert);
      let text = [this.sentence(alerts), this.sentence(others)].filter(Boolean).join(" ");
      if (lineNumber === 1 && !alerts.length && this.config.calm_text !== false && others.length <= 1)
        text = `${this.escape(this.config.calm_text || "Alles ruhig.")} ${text}`.trim();
      return text;
    }).filter(Boolean);
    const html = lines.map((text) => `<div class="line">${text}</div>`).join("");
    if (html === this.lastProse) return;
    this.lastProse = html;
    this.shadowRoot.querySelector(".prose").innerHTML = html;
  }

  handleClick(event) {
    const mark = event.target.closest(".mark[data-index]");
    if (!mark) return;
    const item = this.config.items[Number(mark.dataset.index)];
    const action = item.tap_action || (item.navigation_path ? { action: "navigate", navigation_path: item.navigation_path } : { action: "more-info" });
    if (action.action === "navigate" && action.navigation_path) {
      history.pushState(null, "", action.navigation_path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } else if (action.action === "perform-action" && action.perform_action) {
      const [domain, service] = action.perform_action.split(".");
      this.hassObject.callService(domain, service, action.data || {}, action.target);
    } else if (action.action === "more-info") {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: action.entity || item.entity }, bubbles: true, composed: true }));
    }
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig() {
    return { items: [{ entity: "sensor.lights_on", show: { above: 0 }, text: "[{value} Lichter] brennen", text_one: "[1 Licht] brennt" }] };
  }
}

customElements.define("sbo-status-card", SboStatusCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "sbo-status-card",
  name: "SBO Status Card",
  description: "Clock with date and a status summary written as prose with tappable highlights.",
});
console.info(`%c SBO-STATUS-CARD %c ${cardVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
