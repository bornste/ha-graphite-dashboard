// SBO Battery Card - all battery sensors grouped by urgency, one panel per group:
// empty/offline, critical, low, and a collapsible "in order" panel. The list is built automatically from every sensor
// with device_class battery (minus an exclude label), so new devices appear by themselves.
//
// Options (all optional):
//   critical: 20              below this level a battery is critical (accent)
//   low: 40                   below this level a battery should be replaced soon
//   exclude_label: exclude    label id; sensors with this label are left out
//   exclude: [sensor.x]       further sensors to leave out
//   names: {sensor.x: Name}   display names (default: device name)
//   collapsed: true           "in order" starts collapsed
const cardVersion = "0.3.4";

const offlineStates = ["unavailable", "unknown"];

const batteryStyles = `
  :host {
    display: block;
    --tileSurface: var(--sbo-card-surface, var(--sbo-surface-tile, #1f1f21));
    --tileRaised: var(--sbo-card-inner-surface, var(--sbo-surface-tile-active, #2b2b2c));
    --textPrimary: var(--sbo-text-primary, var(--primary-text-color));
    --textSecondary: var(--sbo-text-secondary, var(--secondary-text-color));
    --textMuted: var(--sbo-text-muted, var(--disabled-text-color));
    --accent: var(--sbo-accent, #f5c48a);
    --danger: var(--sbo-danger, #e8908a);
    --success: var(--sbo-success, #a8d5a2);
    --radius: var(--sbo-radius-tile, 12px);
    --gap: var(--sbo-gap-tile, 8px);
  }
  ha-card {
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
  }
  /* one panel per group, same look as the SBO panel card */
  .panel {
    background: var(--sbo-surface-panel, var(--card-background-color));
    border-radius: var(--sbo-radius-panel, 20px);
    padding: var(--sbo-padding-panel, 16px);
  }
  .panel + .panel {
    margin-top: var(--sbo-gap-panel, 16px);
  }
  /* title and info share one baseline; dot and chevron are centered on the line */
  .header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 12px;
  }
  .header i {
    flex: none;
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--labelColor);
  }
  .header .title {
    flex: none;
    font-size: var(--sbo-title-size, 18px);
    font-weight: var(--sbo-title-weight, 400);
    line-height: 1.2;
    color: var(--sbo-title-color, var(--textPrimary));
  }
  /* info right after the title, separated by a thin line (same as panel card, room cards and dialog
     headers); 2px margin + 10px gap = 12px like there. The right side stays for the chevron. */
  .header .info {
    min-width: 0;
    margin-left: 2px;
    padding-left: 12px;
    position: relative;
    /* 2px more room on top for the separator line (it reads too short at cap height);
       the negative margin keeps the text on the shared baseline */
    padding-top: 2px;
    margin-top: -2px;
    font-size: 13px;
    line-height: 16px;
    color: var(--textSecondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* separator line from the title's cap height down to the shared baseline
     (13px text in a 16px line: the baseline sits 3.5px above the bottom) */
  .header .info::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 3.5px;
    width: 1px;
    background: var(--sbo-separator, color-mix(in srgb, var(--sbo-ink, #f3f3f4) 24%, var(--sbo-ground, #0a0a0b)));
  }
  /* "in order": the whole header toggles the compact tiles */
  button.header {
    width: 100%;
    /* same gap to the tiles as the other panels when expanded */
    margin: 0 0 12px;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button.header[aria-expanded="false"] {
    margin-bottom: 0;
  }
  button.header ha-icon {
    margin-left: auto;
    align-self: center;
    --mdc-icon-size: 20px;
    color: var(--textSecondary);
    transition: transform 0.2s ease;
  }
  button.header[aria-expanded="true"] ha-icon {
    transform: rotate(180deg);
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  /* large card for batteries that need attention */
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 12px;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: var(--tileSurface);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .row.offline {
    background: color-mix(in srgb, var(--danger) 16%, var(--tileRaised));
  }
  .row.critical {
    background: color-mix(in srgb, var(--accent) 14%, var(--tileRaised));
  }
  .row .name {
    font-size: 15px;
    color: var(--textPrimary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row .sub {
    grid-column: 1;
    font-size: 12px;
    color: var(--textSecondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row .value {
    grid-row: 1 / span 2;
    grid-column: 2;
    font-size: 22px;
    font-weight: 300;
    color: var(--textPrimary);
    font-variant-numeric: tabular-nums;
  }
  /* unit like the meter tiles of the sbo_graphite module */
  .row .value small {
    margin-left: 2px;
    font-size: 13px;
    font-weight: 400;
    color: var(--textMuted);
  }
  .row.offline .value {
    font-size: 15px;
    font-weight: 500;
    color: var(--danger);
  }
  .row.critical .value {
    color: var(--accent);
  }
  .row .track {
    grid-column: 1 / -1;
    height: 4px;
    margin-top: 6px;
  }

  /* level bar, shared by large and compact tiles */
  .track {
    border-radius: 2px;
    background: color-mix(in srgb, var(--textPrimary) 8%, transparent);
  }
  .track span {
    display: block;
    height: 100%;
    width: var(--level);
    border-radius: 2px;
    background: var(--barColor);
  }

  .compact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .compact[hidden] {
    display: none;
  }
  .item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 8px;
    padding: 8px 12px 10px;
    border-radius: var(--radius);
    background: var(--tileSurface);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .item .name {
    font-size: 13px;
    color: var(--textPrimary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item .value {
    font-size: 13px;
    color: var(--textSecondary);
    font-variant-numeric: tabular-nums;
  }
  .item .track {
    grid-column: 1 / -1;
    height: 3px;
    --barColor: color-mix(in srgb, var(--success) 70%, var(--tileSurface));
  }
  .empty {
    padding: 12px 14px;
    font-size: 14px;
    color: var(--textSecondary);
  }
`;

class SboBatteryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.expanded = null;
    this.lastSignature = "";
    this.shadowRoot.addEventListener("click", (event) => this.handleClick(event));
  }

  setConfig(config) {
    this.config = {
      critical: 20,
      low: 40,
      exclude_label: "exclude",
      exclude: [],
      names: {},
      collapsed: true,
      ...config,
    };
    if (this.expanded === null) this.expanded = this.config.collapsed === false;
    this.lastSignature = "";
    this.render();
  }

  set hass(hass) {
    this.hassObject = hass;
    this.render();
  }

  escape(text) {
    return String(text ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  // every battery sensor that is not excluded, with name, area and level
  batteries() {
    const hass = this.hassObject;
    const excluded = new Set([].concat(this.config.exclude || []));
    const excludeLabel = this.config.exclude_label;
    const result = [];
    for (const [entityId, stateObject] of Object.entries(hass.states)) {
      if (!entityId.startsWith("sensor.") || stateObject.attributes.device_class !== "battery") continue;
      if (excluded.has(entityId)) continue;
      const entry = hass.entities?.[entityId];
      if (entry?.hidden) continue;
      if (excludeLabel && (entry?.labels || []).includes(excludeLabel)) continue;
      const device = entry?.device_id ? hass.devices?.[entry.device_id] : undefined;
      const areaId = entry?.area_id || device?.area_id;
      const offline = offlineStates.includes(stateObject.state);
      const level = offline ? null : Number(stateObject.state);
      result.push({
        entityId,
        name: this.config.names?.[entityId] || this.defaultName(stateObject, device),
        area: areaId ? hass.areas?.[areaId]?.name || "" : "",
        level: Number.isFinite(level) ? Math.round(level) : null,
        offline: offline || level === 0,
        changed: stateObject.last_changed,
      });
    }
    return result;
  }

  // device name without vendor details in brackets, otherwise the entity name without "Batterie"
  defaultName(stateObject, device) {
    const deviceName = device?.name_by_user || device?.name;
    if (deviceName) return deviceName.replace(/\s*\(.*\)\s*$/, "");
    return String(stateObject.attributes.friendly_name || stateObject.entity_id).replace(/\s+(Batterie|Battery|Batteriestand)$/i, "");
  }

  relativeTime(timestamp) {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000));
    if (minutes < 60) return `${minutes} Min.`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours} Std.`;
    return `${Math.round(hours / 24)} Tagen`;
  }

  rowHtml(battery, kind) {
    const sub = kind === "offline"
      ? (battery.level === 0 ? "leer" : `keine Meldung seit ${this.relativeTime(battery.changed)}`)
      : battery.area;
    const value = kind === "offline" ? (battery.level === 0 ? "leer" : "offline") : `${battery.level}<small>%</small>`;
    const barColor = { offline: "var(--danger)", critical: "var(--accent)", low: "var(--textSecondary)" }[kind];
    return `<div class="row ${kind}" data-entity="${this.escape(battery.entityId)}" role="button" tabindex="0">
      <div class="name">${this.escape(battery.name)}</div>
      <div class="sub">${this.escape(sub)}</div>
      <div class="value">${value}</div>
      <div class="track" style="--level: ${battery.level ?? 0}%; --barColor: ${barColor}"><span></span></div>
    </div>`;
  }

  panelHtml(title, info, color, batteries, kind) {
    if (!batteries.length) return "";
    return `<div class="panel">
      <div class="header" style="--labelColor: ${color}"><i></i><span class="title">${title}</span><span class="info">${info}</span></div>
      <div class="rows">${batteries.map((battery) => this.rowHtml(battery, kind)).join("")}</div>
    </div>`;
  }

  render() {
    if (!this.config || !this.hassObject) return;
    const all = this.batteries();
    const critical = Number(this.config.critical);
    const low = Number(this.config.low);
    const offline = all.filter((battery) => battery.offline);
    const levelled = all.filter((battery) => !battery.offline && battery.level !== null).sort((first, second) => first.level - second.level || first.name.localeCompare(second.name));
    const criticalList = levelled.filter((battery) => battery.level < critical);
    const lowList = levelled.filter((battery) => battery.level >= critical && battery.level < low);
    const okList = levelled.filter((battery) => battery.level >= low);

    // re-render only when something visible changed (offline age in minutes included)
    const signature = JSON.stringify([this.expanded, all.map((battery) => [battery.entityId, battery.name, battery.area, battery.level, battery.offline, battery.offline ? this.relativeTime(battery.changed) : ""])]);
    if (signature === this.lastSignature) return;
    this.lastSignature = signature;

    const okPanel = okList.length ? `<div class="panel">
      <button class="header" style="--labelColor: var(--success)" aria-expanded="${this.expanded}">
        <i></i><span class="title">In Ordnung</span><span class="info">${okList.length} · tiefste ${okList[0].level} %</span><ha-icon icon="mdi:chevron-down"></ha-icon>
      </button>
      <div class="compact"${this.expanded ? "" : " hidden"}>${okList.map((battery) => `<div class="item" data-entity="${this.escape(battery.entityId)}" role="button" tabindex="0">
          <div class="name">${this.escape(battery.name)}</div>
          <div class="value">${battery.level} %</div>
          <div class="track" style="--level: ${battery.level}%"><span></span></div>
        </div>`).join("")}</div>
    </div>` : "";

    const content = this.panelHtml("Leer oder offline", String(offline.length), "var(--danger)", offline, "offline")
      + this.panelHtml("Kritisch", `unter ${critical} %`, "var(--accent)", criticalList, "critical")
      + this.panelHtml("Bald wechseln", `unter ${low} %`, "var(--textSecondary)", lowList, "low")
      + okPanel;
    this.shadowRoot.innerHTML = `<style>${batteryStyles}</style><ha-card>${content || `<div class="panel empty">Keine Batteriesensoren gefunden.</div>`}</ha-card>`;
  }

  handleClick(event) {
    if (event.target.closest("button.header")) {
      this.expanded = !this.expanded;
      this.render();
      return;
    }
    const target = event.target.closest("[data-entity]");
    if (!target) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: target.dataset.entity }, bubbles: true, composed: true }));
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig() {
    return { critical: 20, low: 40 };
  }
}

customElements.define("sbo-battery-card", SboBatteryCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "sbo-battery-card",
  name: "SBO Battery Card",
  description: "All battery sensors grouped by urgency, with a collapsible list of the healthy ones.",
});
console.info(`%c SBO-BATTERY-CARD %c ${cardVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
