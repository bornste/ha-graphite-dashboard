// @ts-nocheck -- 1:1 port of the former vacuum card (plain custom element with string templates);
// the move to Lit with typed state follows in a separate step.
// graphite-vacuum: robot vacuum (Dreame integration) as dashboard tile and as panel content.
// layout: tile  -> animated robot, state, progress, maintenance pill; tap opens the panel (navigation_path)
// layout: panel -> left: quick picks, mode, suction, rooms, start; right: station state, maintenance, station actions
import { languageOf, translate } from "../../core/i18n";
import { registerCard, registerElement } from "../../core/register";
import { GraphiteVacuumEditor } from "./graphite-vacuum-editor";

// names come from the translations (vacuum.modes.*, vacuum.suction.*, ...) unless the config sets one
const defaultModes = [
  { value: "sweeping", icon: "mdi:vacuum-outline" },
  { value: "mopping_after_sweeping", icon: "mdi:water-sync" },
  { value: "sweeping_and_mopping", icon: "mdi:water-plus-outline" },
];
const knownModes = ["sweeping", "mopping", "sweeping_and_mopping", "mopping_after_sweeping"];
const vacuumModeKeys = { "Sweeping": "sweeping", "Mopping": "mopping", "Sweeping and mopping": "sweeping_and_mopping", "Mopping after sweeping": "mopping_after_sweeping" };
const defaultSuctionLevels = [{ value: "quiet" }, { value: "standard" }, { value: "strong" }, { value: "turbo" }];
// station states as translation keys (vacuum.station.*)
const stationStates = { "installed": "ok", "not installed": "missing", "full": "full", "low": "low", "check": "check", "enabled": "ok" };

// own robot artwork (top view, front = up); state classes on the wrapper animate the parts
const robotSvg = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g class="dock"><rect x="10" y="48" width="44" height="12" rx="4" fill="var(--vacDock)" style="fill-opacity: var(--vacTone)" stroke="var(--vacDock)" stroke-width="1.4"/><rect x="18" y="55.5" width="28" height="2.5" rx="1.25" fill="var(--vacDock)"/></g>
  <g class="robot">
    <g class="pads">
      <g transform="translate(25 44)"><g class="pad"><circle r="7" fill="var(--vacWater)" style="fill-opacity: var(--vacTone)" stroke="var(--vacWater)" stroke-width="1.4"/><path d="M-4 0 H4 M0 -4 V4" stroke="var(--vacWater)" stroke-width="1.2" opacity=".8"/></g></g>
      <g transform="translate(39 44)"><g class="pad"><circle r="7" fill="var(--vacWater)" style="fill-opacity: var(--vacTone)" stroke="var(--vacWater)" stroke-width="1.4"/><path d="M-4 0 H4 M0 -4 V4" stroke="var(--vacWater)" stroke-width="1.2" opacity=".8"/></g></g>
    </g>
    <g transform="translate(20 17)"><g class="brush"><path d="M0 0 L-8 -3 M0 0 L1 -8 M0 0 L-5 6" stroke="var(--vacLine)" stroke-width="1.4" stroke-linecap="round"/></g></g>
    <circle cx="32" cy="30" r="19" fill="var(--vacBody)"/>
    <circle cx="32" cy="30" r="19" fill="var(--vacLine)" style="fill-opacity: var(--vacTone)" stroke="var(--vacLine)" stroke-width="1.6"/>
    <path d="M16.5 30 A15.5 15.5 0 0 1 47.5 30" fill="none" stroke="var(--vacLine)" stroke-width="1.4"/>
    <path d="M14 29 L16.5 30 L16.5 33 M50 29 L47.5 30 L47.5 33" fill="none" stroke="var(--vacLine)" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M19 22 H26 M38 22 H45" stroke="var(--vacLine)" stroke-width="1.2"/>
    <circle cx="32" cy="22" r="5.5" fill="none" stroke="var(--vacLine)" stroke-width="1.4"/>
    <rect class="eye" x="30.8" y="37" width="2.4" height="5" rx="1.2" fill="var(--vacAccent)"/>
  </g>
  <g class="drops"><path class="drop" d="M12 42 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/><path class="drop" d="M52 42 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/><path class="drop" d="M8 34 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/></g>
  <g class="heat" fill="none" stroke="var(--vacAccent)" stroke-width="1.8" stroke-linecap="round"><path class="wave" d="M24 8 q2 -3 0 -6"/><path class="wave" d="M32 8 q2 -3 0 -6"/><path class="wave" d="M40 8 q2 -3 0 -6"/></g>
  <path class="bolt" d="M51 2 l-5 9 h4 l-2 7 l6 -10 h-4 l2 -6z" fill="var(--vacAccent)"/>
</svg>`;

const sharedStyles = `
  :host {
    display: block;
    container-type: inline-size;
    --vacTile: var(--graphite-surface-tile, #1f1f20);
    --vacTileHi: var(--graphite-surface-tile-active, #2b2b2c);
    --vacText: var(--graphite-text-primary, #f3f3f4);
    --vacText2: var(--graphite-text-secondary, #b4b4b8);
    --vacText3: var(--graphite-text-muted, #8f8f92);
    --vacAccent: var(--graphite-accent, #f5c48a);
    --vacAccentInk: var(--graphite-accent-ink, #3a2410);
    --vacDanger: var(--graphite-danger, #e8908a);
    --vacWater: #7cc4f0;
    --vacLine: #c4c4c8;
    --vacDock: #6a6a70;
    /* second tone of the two-tone artwork, matches the dimmed icons of the other tiles */
    --vacTone: var(--graphite-vacuum-tone, 0.12);
    --vacRadius: var(--graphite-radius-tile, 12px);
  }
  button {
    border: none;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled { cursor: default; opacity: 0.45; }
  /* robot artwork */
  .art {
    --vacBody: var(--vacArtBg);
    --vacTurret: var(--vacArtBg);
    width: 64px;
    height: 64px;
    border-radius: 10px;
    background: var(--vacArtBg);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex: none;
  }
  .art svg { width: 56px; height: 56px; overflow: visible; }
  .brush, .pad { transform-box: view-box; }
  .run .brush, .return .brush { animation: vacSpin 0.6s linear infinite; }
  .run .robot, .return .robot { animation: vacDrive 3s ease-in-out infinite; }
  .run.mopping .pad, .wash .pad { animation: vacSpin 1s linear infinite; }
  .drops, .heat, .bolt, .dock { opacity: 0; }
  .wash .drops { opacity: 1; }
  .wash .drop { animation: vacFall 1s ease-in infinite; }
  .wash .drop:nth-child(2) { animation-delay: 0.33s; }
  .wash .drop:nth-child(3) { animation-delay: 0.66s; }
  .dry .heat { opacity: 1; }
  .dry .wave { animation: vacRise 1.8s ease-in-out infinite; }
  .dry .wave:nth-child(2) { animation-delay: 0.6s; }
  .dry .wave:nth-child(3) { animation-delay: 1.2s; }
  .charge .bolt { opacity: 1; animation: vacPulse 1.6s ease-in-out infinite; }
  .docked .dock, .charge .dock, .wash .dock, .dry .dock { opacity: 1; }
  .err .eye { fill: var(--vacDanger); }
  .err .robot { animation: vacShake 0.5s ease-in-out 3; }
  .sleep .eye { opacity: 0.35; }
  .offline svg { opacity: 0.4; }
  @keyframes vacSpin { to { transform: rotate(360deg); } }
  @keyframes vacDrive { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(3px, -2px) rotate(8deg); } 75% { transform: translate(-3px, 2px) rotate(-6deg); } }
  @keyframes vacFall { 0% { transform: translateY(-6px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(6px); opacity: 0; } }
  @keyframes vacRise { 0% { transform: translateY(4px); opacity: 0; } 50% { opacity: 0.9; } 100% { transform: translateY(-6px); opacity: 0; } }
  @keyframes vacPulse { 50% { opacity: 0.35; } }
  @keyframes vacShake { 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
  @media (prefers-reduced-motion: reduce) { .art * { animation: none !important; } }
`;

const cardStyles = `
  ha-card {
    --vacArtBg: color-mix(in srgb, var(--vacText) 6%, var(--vacTile));
    background: var(--vacTile);
    border-radius: var(--graphite-card-radius, var(--vacRadius));
    border: none;
    box-shadow: none;
    padding: 12px 14px 12px 12px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  ha-card.active {
    --vacArtBg: var(--vacTile);
    background: color-mix(in srgb, var(--vacAccent) 10%, var(--vacTileHi));
  }
  /* text column as high as the robot: name aligned to its top, details to its bottom,
     the free space sits between name and state */
  .text {
    min-width: 0;
    height: 64px;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  /* device name like the names of the other tiles */
  .name {
    font-size: 13px;
    line-height: 13px;
    color: var(--vacText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name[hidden] { display: none; }
  /* state as text: 20/300 (numbers would be 22/300, words read larger) */
  .title {
    margin-top: auto;
    font-size: var(--graphite-font-value-text-size, 20px);
    font-weight: 300;
    line-height: 1.1;
    color: var(--vacText);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subtitle {
    margin-top: 3px;
    font-size: 12px;
    line-height: 12px;
    color: var(--vacText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* progress as last line, aligned to the bottom of the robot (the text moves up) */
  .progress {
    margin-top: 6px;
    flex: none;
    height: 3px;
    border-radius: 2px;
    background: var(--vacTile);
    overflow: hidden;
  }
  .progress[hidden], .control[hidden], .pill[hidden] { display: none; }
  .progress > div { height: 100%; width: 0; border-radius: 2px; background: var(--vacAccent); }
  .control {
    width: 44px;
    height: 36px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    color: var(--vacText2);
    display: grid;
    place-items: center;
    padding: 0;
    --mdc-icon-size: 18px;
    align-self: end;
  }
  .control:active { transform: scale(0.96); }
  /* maintenance or station hint, takes the place of the control (never both) */
  .pill {
    height: 24px;
    max-width: 150px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: color-mix(in srgb, var(--vacAccent) 16%, var(--vacTile));
    color: var(--vacAccent);
  }
`;

const dialogStyles = `
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }
  .column {
    background: var(--graphite-panel-surface, var(--graphite-surface-panel, #161617));
    border-radius: var(--graphite-panel-radius, var(--graphite-radius-panel, 20px));
    padding: var(--graphite-panel-padding, var(--graphite-padding-panel, 16px));
    min-width: 0;
  }
  :host(:not([panels])) .column { background: none; padding: 0; }
  .panelTitle {
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--vacText));
    margin-bottom: 12px;
  }
  .label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 13px;
    font-weight: 500;
    color: var(--vacText);
    margin: 14px 2px 8px;
  }
  .panelTitle + .label { margin-top: 0; }
  /* configured rooms that do not match the map (e.g. after the map was recreated) */
  .roomWarning {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin: 0 0 8px;
    padding: 10px 12px;
    border-radius: var(--graphite-radius-tile, 12px);
    background: color-mix(in srgb, var(--graphite-accent, #f5c48a) 14%, var(--graphite-surface-tile, #1f1f20));
    color: var(--graphite-accent, #f5c48a);
    font-size: 12px;
    line-height: 16px;
  }
  .roomWarning ha-icon { --mdc-icon-size: 18px; flex: none; margin-top: -1px; }
  .roomWarning strong { display: block; font-size: 13px; font-weight: 500; margin-bottom: 2px; }
  .roomWarning span { display: block; color: var(--vacText2, var(--graphite-text-secondary)); }
  .label button {
    background: none;
    padding: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--vacText3);
  }
  .presets, .modes, .rooms {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }
  .preset, .room {
    height: 52px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    font-size: 13px;
    color: var(--vacText2);
    text-align: left;
    min-width: 0;
    --mdc-icon-size: 18px;
  }
  .preset span, .room span {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .preset ha-icon, .room ha-icon { flex: none; opacity: 0.75; }
  .preset {
    color: var(--vacText);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vacAccent) 30%, var(--vacTile));
  }
  .preset.selected {
    background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi));
    box-shadow: inset 0 0 0 1.5px var(--vacAccent);
  }
  .room.selected {
    background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi));
    color: var(--vacText);
  }
  .room .order { flex: none; font-size: 11px; color: var(--vacAccent); }
  .mode {
    height: 56px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0 6px;
    font-size: 12px;
    line-height: 1.2;
    color: var(--vacText2);
    --mdc-icon-size: 18px;
  }
  .mode.selected { background: var(--vacAccent); color: var(--vacAccentInk); }
  .suctions {
    display: grid;
    grid-template-columns: repeat(var(--suctionCount, 4), minmax(0, 1fr)) 64px;
    gap: 6px;
  }
  .suctions.noBoost { grid-template-columns: repeat(var(--suctionCount, 4), minmax(0, 1fr)); }
  .suction {
    height: 48px;
    border-radius: 10px;
    background: var(--vacTile);
    font-size: 12px;
    color: var(--vacText2);
    padding: 0 4px;
  }
  .suction.selected { background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi)); color: var(--vacText); }
  .boost {
    height: 48px;
    border-radius: 10px;
    background: var(--vacTile);
    font-size: 12px;
    color: var(--vacAccent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vacAccent) 45%, var(--vacTile));
  }
  .boost.on { background: var(--vacAccent); color: var(--vacAccentInk); font-weight: 500; box-shadow: none; }
  .hint { font-size: 11px; color: var(--vacText3); margin: 6px 2px 0; }
  .startRow {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 52px;
    gap: 6px;
    margin-top: 14px;
  }
  .start {
    height: 48px;
    border-radius: var(--vacRadius);
    background: var(--vacAccent);
    color: var(--vacAccentInk);
    font-size: 14px;
    font-weight: 500;
  }
  .start.idle { background: var(--vacTile); color: var(--vacText3); opacity: 1; }
  .toStation {
    height: 48px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    color: var(--vacText2);
    display: grid;
    place-items: center;
    --mdc-icon-size: 20px;
  }
  .robotInfo { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }
  .robotInfo .art { --vacArtBg: var(--vacTile); width: 88px; height: 88px; }
  .robotInfo .art svg { width: 76px; height: 76px; }
  .facts { font-size: 12px; line-height: 1.7; color: var(--vacText2); min-width: 0; }
  .facts b { color: var(--vacText); font-weight: 500; }
  .facts .warn { color: var(--vacAccent); }
  .wear {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  .wear .name { font-size: 13px; color: var(--vacText); }
  .wear .value { font-size: 12px; color: var(--vacText2); }
  .wear .line { grid-column: 1 / -1; height: 4px; border-radius: 2px; background: var(--vacTile); overflow: hidden; }
  .wear .line div { height: 100%; background: var(--vacText2); }
  .wear.due .value { color: var(--vacAccent); }
  .wear.due .line div { background: var(--vacAccent); }
  .reset {
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    color: var(--vacAccent);
    background: color-mix(in srgb, var(--vacAccent) 14%, var(--vacTile));
  }
  .reset.confirm { background: var(--vacAccent); color: var(--vacAccentInk); }
  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 12px; }
  .action {
    height: 52px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    font-size: 12px;
    color: var(--vacText2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    --mdc-icon-size: 18px;
  }
  .action.done { color: var(--vacAccent); }
  .error { font-size: 12px; color: var(--vacDanger); margin-top: 8px; }
  .error:empty { display: none; }
  @container (min-width: 640px) {
    .columns { grid-template-columns: minmax(0, 1fr) 320px; }
  }
  @container (max-width: 380px) {
    .presets, .rooms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

export class GraphiteVacuum extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selected = [];
    this.chosenMode = null;
    this.chosenSuction = null;
    this.chosenBoost = null;
    this.confirmReset = null;
    this.pressedAction = null;
    this.lastSignature = "";
    this.errorText = "";
    this.shadowRoot.addEventListener("click", (event) => this.handleClick(event));
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("entity is required");
    this.config = config;
    // layout: panel (former view: dialog) or tile (former view: card)
    this.view = config.layout === "panel" || config.view === "dialog" ? "dialog" : "card";
    this.entityPrefix = config.prefix || config.entity.split(".")[1];
    // configured items keep their own names; the defaults are named by the translations when rendered
    this.modes = (config.modes || defaultModes).map((mode) => (typeof mode === "string" ? defaultModes.find((item) => item.value === mode) || { value: mode } : mode));
    this.suctionLevels = (config.suction_levels || defaultSuctionLevels).map((level) => (typeof level === "string" ? defaultSuctionLevels.find((item) => item.value === level) || { value: level } : level));
    this.maintenance = config.maintenance || [
      { key: "main_brush", reset: `button.${this.entityPrefix}_reset_main_brush` },
      { key: "side_brush", reset: `button.${this.entityPrefix}_reset_side_brush` },
      { key: "filter", reset: `button.${this.entityPrefix}_reset_filter` },
      { key: "sensor_dirty", reset: `button.${this.entityPrefix}_reset_sensor` },
    ];
    this.stationActions = config.actions || [
      { key: "self_clean", icon: "mdi:water-sync", entity: `button.${this.entityPrefix}_self_clean` },
      { key: "manual_drying", icon: "mdi:heat-wave", entity: `button.${this.entityPrefix}_manual_drying` },
      { key: "base_station_cleaning", icon: "mdi:spray-bottle", entity: `button.${this.entityPrefix}_base_station_cleaning` },
      { key: "start_auto_empty", icon: "mdi:delete-empty-outline", entity: `button.${this.entityPrefix}_start_auto_empty` },
    ];
    this.entities = {
      mode: config.mode_entity || `select.${this.entityPrefix}_cleaning_mode`,
      suction: config.suction_entity || `select.${this.entityPrefix}_suction_level`,
      boost: config.boost_entity || `switch.${this.entityPrefix}_max_suction_power`,
      history: config.history_entity || `sensor.${this.entityPrefix}_cleaning_history`,
      error: config.error_entity || `sensor.${this.entityPrefix}_error`,
      dryingLeft: config.drying_left_entity || `sensor.${this.entityPrefix}_drying_left`,
    };
    this.threshold = Number(config.maintenance_threshold ?? 10);
    if (config.panels === false) this.removeAttribute("panels");
    else this.setAttribute("panels", "");
    this.build();
    this.lastSignature = "";
    this.render();
  }

  set hass(hass) {
    this.hassObject = hass;
    this.render();
  }

  get hass() {
    return this.hassObject;
  }

  disconnectedCallback() {
    clearTimeout(this.confirmTimer);
    clearTimeout(this.pressedTimer);
  }

  build() {
    if (this.view === "card") {
      this.shadowRoot.innerHTML = `<style>${sharedStyles}${cardStyles}</style>
        <ha-card role="button" tabindex="0">
          <div class="art"></div>
          <div class="text"><div class="name"></div><div class="title"></div><div class="subtitle"></div><div class="progress" hidden><div></div></div></div>
          <button class="control" data-action="control" hidden><ha-icon></ha-icon></button>
          <span class="pill" hidden></span>
        </ha-card>`;
      this.shadowRoot.querySelector(".art").innerHTML = robotSvg;
      this.shadowRoot.querySelector("ha-card").addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this.openDialog(); }
      });
    } else {
      this.shadowRoot.innerHTML = `<style>${sharedStyles}${dialogStyles}</style>
        <div class="columns"><div class="column cleaning"></div><div class="column station"></div></div>`;
    }
  }

  // ---------- texts ----------

  // translated text (vacuum.*): theme variable --graphite-language, else the Home Assistant language
  t(key, params = {}) {
    return translate(languageOf(this.isConnected ? this : undefined, this.hassObject), `vacuum.${key}`, params);
  }

  // name of a configured or default item: own name, else the translation of its key, else the key
  itemName(item, group) {
    if (item.name) return item.name;
    const key = `${group}.${item.key ?? item.value}`;
    const text = this.t(key);
    return text === `vacuum.${key}` ? String(item.key ?? item.value) : text;
  }

  locale() {
    return this.hassObject?.locale?.language || "de-CH";
  }

  // ---------- state helpers ----------

  // config name, otherwise the entity id in readable form ("vacuum.dreamie" -> "Dreamie")
  deviceName() {
    if (typeof this.config.name === "string" && this.config.name) return this.config.name;
    const objectId = this.config.entity.split(".")[1] || "";
    return objectId.charAt(0).toUpperCase() + objectId.slice(1).split("_").join(" ");
  }

  stateOf(entityId) {
    return this.hassObject?.states?.[entityId];
  }

  // HTML-safe text for the string templates (no regular expressions in the library)
  escape(text) {
    const entities = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]];
    return entities.reduce((value, [character, entity]) => value.split(character).join(entity), String(text ?? ""));
  }

  // rooms of the current map, in config order (with overrides) or in the cleaning sequence
  mapRooms() {
    const attributes = this.stateOf(this.config.entity)?.attributes || {};
    return attributes.rooms?.[attributes.selected_map] || Object.values(attributes.rooms || {})[0] || [];
  }

  rooms() {
    const attributes = this.stateOf(this.config.entity)?.attributes || {};
    const mapRooms = this.mapRooms();
    if (Array.isArray(this.config.rooms)) {
      // rooms whose id no longer fits the map are left out, so a button never cleans the wrong room
      const issueIds = this.roomIssues().map((issue) => issue.id);
      return this.config.rooms.map((entry) => {
        const room = typeof entry === "object" ? entry : { id: entry };
        if (issueIds.includes(Number(room.id))) return null;
        const known = this.findRoom(mapRooms, room.id);
        return known ? { id: known.id, name: room.name || known.name, icon: room.icon || known.icon || "mdi:floor-plan" } : null;
      }).filter(Boolean);
    }
    const sequence = attributes.cleaning_sequence || [];
    return [...mapRooms]
      .sort((first, second) => {
        const firstIndex = sequence.indexOf(first.id), secondIndex = sequence.indexOf(second.id);
        return (firstIndex < 0 ? 999 : firstIndex) - (secondIndex < 0 ? 999 : secondIndex);
      })
      .map((room) => ({ id: room.id, name: room.name, icon: room.icon || "mdi:floor-plan" }));
  }

  // configured rooms that do not fit the current map: the id is missing, or it belongs to another room
  // whose name differs while the configured name exists on the map under another id (map recreated);
  // a renamed room (own name that is not on the map) is not an issue
  roomIssues() {
    if (!Array.isArray(this.config.rooms)) return [];
    const mapRooms = this.mapRooms();
    if (!mapRooms.length) return [];
    const sameName = (first, second) => String(first).toLowerCase() === String(second).toLowerCase();
    return this.config.rooms.map((entry) => {
      const room = typeof entry === "object" ? entry : { id: entry };
      const id = Number(room.id);
      const known = mapRooms.find((mapRoom) => mapRoom.id === id);
      const byName = room.name ? mapRooms.find((mapRoom) => sameName(mapRoom.name, room.name)) : undefined;
      if (!known) return { id, name: room.name || this.t("room", { id: room.id }), text: this.t("roomMissing", { id: room.id }), newId: byName?.id };
      if (room.name && !sameName(known.name, room.name) && byName && byName.id !== id)
        return { id, name: room.name, text: this.t("roomChanged", { id: room.id, name: known.name }), newId: byName.id };
      return null;
    }).filter(Boolean);
  }

  // a room by segment id or by name
  findRoom(rooms, key) {
    return rooms.find((room) => room.id === Number(key)) || rooms.find((room) => String(room.name).toLowerCase() === String(key).toLowerCase());
  }

  roomName(id) {
    return this.findRoom(this.rooms(), id)?.name || "";
  }

  currentMode() {
    if (this.chosenMode) return this.chosenMode;
    const selectState = this.stateOf(this.entities.mode)?.state;
    if (selectState && selectState !== "unavailable") return selectState;
    return vacuumModeKeys[this.stateOf(this.config.entity)?.attributes?.cleaning_mode] || "";
  }

  currentSuction() {
    return this.chosenSuction || this.stateOf(this.entities.suction)?.state || "";
  }

  currentBoost() {
    if (this.chosenBoost !== null) return this.chosenBoost;
    return this.stateOf(this.entities.boost)?.state === "on";
  }

  modeName(value) {
    const mode = this.modes.find((item) => item.value === value);
    if (mode) return this.itemName(mode, "modes");
    return knownModes.includes(value) ? this.t(`modes.${value}`) : "";
  }

  formatDuration(minutes) {
    const total = Math.max(0, Math.round(Number(minutes)));
    const hours = Math.floor(total / 60), rest = total % 60;
    if (hours === 0) return this.t("minutes", { minutes: rest });
    return rest ? this.t("hoursMinutes", { hours, minutes: rest }) : this.t("hours", { hours });
  }

  formatLastCleaning() {
    const value = this.stateOf(this.entities.history)?.state;
    const date = value ? new Date(value) : null;
    if (!date || isNaN(date)) return "";
    const time = date.toLocaleTimeString(this.locale(), { hour: "2-digit", minute: "2-digit" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((today - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
    if (days === 0) return this.t("today", { time });
    if (days === 1) return this.t("yesterday", { time });
    if (days < 7) return `${date.toLocaleDateString(this.locale(), { weekday: "short" }).split(".").join("")} ${time}`;
    return date.toLocaleDateString(this.locale(), { day: "numeric", month: "numeric" });
  }

  stationValue(raw) {
    if (raw === undefined || raw === null || raw === "") return "";
    const key = stationStates[String(raw).toLowerCase()];
    return key ? this.t(`station.${key}`) : String(raw).toLowerCase();
  }

  // maintenance items with remaining life; due when at or below the threshold
  wearItems() {
    const attributes = this.stateOf(this.config.entity)?.attributes || {};
    return this.maintenance.map((item) => {
      const left = attributes[`${item.key}_left`];
      const hours = attributes[`${item.key}_time_left`];
      const name = this.itemName(item, "maintenance");
      const dueKey = `maintenanceDue.${item.key}`;
      const dueText = item.due || (item.name ? this.t("due", { name }) : this.t(dueKey) === `vacuum.${dueKey}` ? this.t("due", { name }) : this.t(dueKey));
      return { ...item, name, left: left === undefined ? null : Number(left), hours: hours === undefined ? null : Number(hours), due: left !== undefined && Number(left) <= this.threshold, dueText };
    }).filter((item) => item.left !== null);
  }

  // hints for the card pill (only shown while not cleaning)
  hints() {
    const attributes = this.stateOf(this.config.entity)?.attributes || {};
    const hints = [];
    if (attributes.low_water) hints.push(this.t("refillWater"));
    const dirty = this.stationValue(attributes.dirty_water_tank_status);
    if (dirty && dirty !== this.t("station.ok")) hints.push(`${this.t("dirtyWater")} ${dirty}`);
    const due = this.wearItems().filter((item) => item.due);
    if (due.length === 1) hints.push(due[0].dueText);
    else if (due.length > 1) hints.push(this.t("maintenanceCount", { count: due.length }));
    return hints;
  }

  // what the robot is doing: text, animation class and quick control
  status() {
    const entity = this.stateOf(this.config.entity);
    if (!entity || entity.state === "unavailable" || entity.state === "unknown")
      return { key: "offline", art: "offline sleep", title: this.t("states.offline"), subtitle: "", active: false };
    const attributes = entity.attributes;
    const battery = attributes.battery ?? attributes.battery_level;
    const batteryText = battery !== undefined ? this.t("battery", { battery }) : "";
    const mode = vacuumModeKeys[attributes.cleaning_mode] || this.stateOf(this.entities.mode)?.state || "";
    const mopping = mode && mode !== "sweeping";
    const progressParts = [this.modeName(mode)];
    if (attributes.cleaning_progress) progressParts.push(`${attributes.cleaning_progress} %`);
    if (attributes.cleaned_area) progressParts.push(`${attributes.cleaned_area} m²`);
    const progressText = progressParts.filter(Boolean).join(" · ");
    const currentRoom = attributes.current_segment ? this.roomName(attributes.current_segment) : "";

    if (attributes.has_error || entity.state === "error") {
      const description = this.stateOf(this.entities.error)?.attributes?.description || attributes.error || "";
      return { key: "error", art: "err", title: this.t("states.error"), subtitle: description, active: false, hint: this.t("states.error") };
    }
    if (attributes.returning_to_wash)
      return { key: "returning", art: "return", title: this.t("states.returningToWash"), subtitle: progressText, active: true, control: "pause" };
    if (attributes.washing || attributes.washing_paused)
      return { key: "washing", art: "wash docked", title: attributes.washing_paused ? this.t("states.washingPaused") : this.t("states.washing"), subtitle: attributes.started ? `${this.t("intermediateWash")} · ${progressText}` : batteryText, active: true, progress: attributes.started ? attributes.cleaning_progress : null };
    if (attributes.returning || entity.state === "returning")
      return { key: "returning", art: "return", title: this.t("states.returning"), subtitle: progressText || batteryText, active: true, control: "pause" };
    if (attributes.paused || entity.state === "paused")
      return { key: "paused", art: "", title: this.t("states.paused"), subtitle: [currentRoom, progressText].filter(Boolean).join(" · "), active: true, control: "resume", progress: attributes.cleaning_progress };
    if (attributes.running || entity.state === "cleaning")
      return { key: "cleaning", art: `run${mopping ? " mopping" : ""}`, title: currentRoom || this.t("states.cleaning"), subtitle: progressText, active: true, control: "pause", progress: attributes.cleaning_progress };
    if (attributes.drying) {
      const left = Number(this.stateOf(this.entities.dryingLeft)?.state ?? attributes.drying_left);
      return { key: "drying", art: "dry docked", title: this.t("states.drying"), subtitle: left > 0 ? this.t("remaining", { duration: this.formatDuration(left) }) : batteryText, active: false };
    }
    if (attributes.charging)
      return { key: "charging", art: "charge", title: this.t("states.charging"), subtitle: batteryText, active: false };
    const last = this.formatLastCleaning();
    return { key: "ready", art: `${attributes.docked ? "docked " : ""}sleep`, title: this.t("states.ready"), subtitle: [batteryText, last].filter(Boolean).join(" · "), active: false };
  }

  // ---------- actions ----------

  callService(domain, service, data, target) {
    this.errorText = "";
    return this.hassObject.callService(domain, service, data || {}, target).catch((error) => {
      this.errorText = error?.message || this.t("actionFailed");
      this.lastSignature = "";
      this.render();
      throw error;
    });
  }

  openDialog() {
    const path = this.config.navigation_path;
    if (path) {
      history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } else {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: this.config.entity }, bubbles: true, composed: true }));
    }
  }

  // applies mode, suction and boost if they were changed in the dialog, then cleans the selected rooms
  async startCleaning() {
    if (this.selected.length === 0) return;
    const target = { entity_id: this.config.entity };
    try {
      if (this.chosenMode && this.chosenMode !== this.stateOf(this.entities.mode)?.state)
        await this.callService("select", "select_option", { option: this.chosenMode }, { entity_id: this.entities.mode });
      if (this.chosenSuction && this.chosenSuction !== this.stateOf(this.entities.suction)?.state)
        await this.callService("select", "select_option", { option: this.chosenSuction }, { entity_id: this.entities.suction });
      if (this.chosenBoost !== null && this.chosenBoost !== (this.stateOf(this.entities.boost)?.state === "on"))
        await this.callService("switch", this.chosenBoost ? "turn_on" : "turn_off", {}, { entity_id: this.entities.boost });
      await this.callService("dreame_vacuum", "vacuum_clean_segment", { segments: [...this.selected] }, target);
      this.selected = [];
      this.chosenMode = null;
      this.chosenSuction = null;
      this.chosenBoost = null;
    } catch (error) {
      // message is shown below the start button
    }
    this.lastSignature = "";
    this.render();
  }

  presetMatches(preset) {
    const rooms = this.presetRooms(preset);
    if (rooms.length !== this.selected.length || !rooms.every((id) => this.selected.includes(id))) return false;
    if (preset.mode && preset.mode !== this.currentMode()) return false;
    if (preset.suction && preset.suction !== this.currentSuction()) return false;
    return true;
  }

  presetRooms(preset) {
    // preset rooms by id, by shown name or by the name of the integration
    const rooms = this.rooms(), mapRooms = this.mapRooms();
    return (preset.rooms || []).map((key) => (this.findRoom(rooms, key) || this.findRoom(mapRooms, key))?.id).filter((id) => id !== undefined);
  }

  handleClick(event) {
    if (this.view === "card") {
      const control = event.target.closest("[data-action='control']");
      if (control) {
        event.stopPropagation();
        const status = this.status();
        if (status.control === "resume") this.callService("vacuum", "start", {}, { entity_id: this.config.entity }).catch(() => {});
        else if (status.control) this.callService("vacuum", "pause", {}, { entity_id: this.config.entity }).catch(() => {});
        return;
      }
      if (event.target.closest("ha-card")) this.openDialog();
      return;
    }

    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action, value } = target.dataset;
    if (action === "preset") {
      const preset = (this.config.presets || [])[Number(value)];
      if (!preset) return;
      this.selected = this.presetRooms(preset);
      if (preset.mode) this.chosenMode = preset.mode;
      if (preset.suction) this.chosenSuction = preset.suction;
    } else if (action === "mode") {
      this.chosenMode = value;
    } else if (action === "suction") {
      this.chosenSuction = value;
    } else if (action === "boost") {
      this.chosenBoost = !this.currentBoost();
    } else if (action === "room") {
      const id = Number(value);
      const index = this.selected.indexOf(id);
      if (index >= 0) this.selected.splice(index, 1);
      else this.selected.push(id);
    } else if (action === "allRooms") {
      const all = this.rooms().map((room) => room.id);
      this.selected = this.selected.length === all.length ? [] : all;
    } else if (action === "start") {
      const status = this.status();
      if (status.control === "pause" && status.key !== "returning") this.callService("vacuum", "pause", {}, { entity_id: this.config.entity }).catch(() => {});
      else if (status.control === "resume") this.callService("vacuum", "start", {}, { entity_id: this.config.entity }).catch(() => {});
      else this.startCleaning();
      return;
    } else if (action === "dock") {
      this.callService("vacuum", "return_to_base", {}, { entity_id: this.config.entity }).catch(() => {});
      return;
    } else if (action === "reset") {
      // two taps: the first one asks for confirmation (4 s)
      if (this.confirmReset === value) {
        this.confirmReset = null;
        this.callService("button", "press", {}, { entity_id: value }).catch(() => {});
      } else {
        this.confirmReset = value;
        clearTimeout(this.confirmTimer);
        this.confirmTimer = setTimeout(() => { this.confirmReset = null; this.lastSignature = ""; this.render(); }, 4000);
      }
    } else if (action === "press") {
      this.callService("button", "press", {}, { entity_id: value }).then(() => {
        this.pressedAction = value;
        clearTimeout(this.pressedTimer);
        this.pressedTimer = setTimeout(() => { this.pressedAction = null; this.lastSignature = ""; this.render(); }, 2500);
        this.lastSignature = "";
        this.render();
      }).catch(() => {});
      return;
    }
    this.lastSignature = "";
    this.render();
  }

  // ---------- rendering ----------

  // only re-render when one of the used entities changed
  signature() {
    const ids = [this.config.entity, ...Object.values(this.entities), ...this.stationActions.map((action) => action.entity)];
    return ids.map((id) => this.stateOf(id)?.last_updated || "").join("|")
      + `|${this.selected.join(",")}|${this.chosenMode}|${this.chosenSuction}|${this.chosenBoost}|${this.confirmReset}|${this.pressedAction}|${this.errorText}`;
  }

  render() {
    if (!this.config || !this.hassObject) return;
    const signature = this.signature();
    if (signature === this.lastSignature) return;
    this.lastSignature = signature;
    if (this.view === "card") this.renderCard();
    else this.renderDialog();
  }

  renderCard() {
    const root = this.shadowRoot;
    const status = this.status();
    root.querySelector("ha-card").classList.toggle("active", !!status.active);
    root.querySelector(".art").className = `art ${status.art}`;
    const name = root.querySelector(".name");
    name.hidden = this.config.name === false;
    name.textContent = this.deviceName();
    root.querySelector(".title").textContent = status.title;
    root.querySelector(".subtitle").textContent = status.subtitle || "";
    const progress = root.querySelector(".progress");
    const hasProgress = status.progress !== undefined && status.progress !== null && status.active;
    progress.hidden = !hasProgress;
    if (hasProgress) progress.firstElementChild.style.width = `${Math.min(100, Math.max(0, Number(status.progress) || 0))}%`;
    const control = root.querySelector(".control");
    control.hidden = !status.control;
    if (status.control) {
      control.querySelector("ha-icon").setAttribute("icon", status.control === "resume" ? "mdi:play" : "mdi:pause");
      control.setAttribute("aria-label", status.control === "resume" ? this.t("resume") : this.t("pause"));
    }
    // hint pill only while not cleaning (ready, charging, drying, error)
    const pill = root.querySelector(".pill");
    const hints = ["ready", "charging", "drying", "error"].includes(status.key) ? (status.hint ? [status.hint] : this.hints()) : [];
    pill.hidden = status.control || hints.length === 0;
    pill.textContent = hints[0] || "";
    pill.title = hints.join(", ");
  }

  renderDialog() {
    const root = this.shadowRoot;
    const status = this.status();
    const presets = this.config.presets || [];
    const rooms = this.rooms();
    const mode = this.currentMode();
    const suction = this.currentSuction();
    const boost = this.currentBoost();
    const hasBoost = this.config.boost !== false && !!this.stateOf(this.entities.boost);

    // cleaning column
    let html = `<div class="panelTitle">${this.escape(this.config.cleaning_title || this.t("cleaningTitle"))}</div>`;
    if (presets.length) {
      html += `<div class="label">${this.escape(this.config.presets_title || this.t("presetsTitle"))}</div><div class="presets">`
        + presets.map((preset, index) => `<button class="preset${this.presetMatches(preset) ? " selected" : ""}" data-action="preset" data-value="${index}">${preset.icon ? `<ha-icon icon="${this.escape(preset.icon)}"></ha-icon>` : ""}<span>${this.escape(preset.name)}</span></button>`).join("")
        + `</div>`;
    }
    html += `<div class="label">${this.t("mode")}</div><div class="modes">`
      + this.modes.map((item) => `<button class="mode${item.value === mode ? " selected" : ""}" data-action="mode" data-value="${this.escape(item.value)}">${item.icon ? `<ha-icon icon="${this.escape(item.icon)}"></ha-icon>` : ""}<span>${this.escape(this.itemName(item, "modes"))}</span></button>`).join("")
      + `</div>`;
    html += `<div class="label">${this.t("suction")}</div><div class="suctions${hasBoost ? "" : " noBoost"}" style="--suctionCount:${this.suctionLevels.length}">`
      + this.suctionLevels.map((level) => `<button class="suction${level.value === suction ? " selected" : ""}" data-action="suction" data-value="${this.escape(level.value)}">${this.escape(this.itemName(level, "suctionLevels"))}</button>`).join("")
      + (hasBoost ? `<button class="boost${boost ? " on" : ""}" data-action="boost" aria-pressed="${boost}">${this.escape(this.config.boost_name || "Max+")}</button>` : "")
      + `</div>`;
    const boostName = this.config.boost_name || "Max+";
    if (hasBoost) html += `<div class="hint">${this.escape(boost ? this.t("boostActive", { name: boostName }) : this.t("boostHint", { name: boostName }))}</div>`;
    const allSelected = rooms.length > 0 && this.selected.length === rooms.length;
    const issues = this.roomIssues();
    if (issues.length && this.warnedIssues !== issues.length) {
      this.warnedIssues = issues.length;
      console.warn("graphite-vacuum: room ids do not match the map", issues);
    }
    html += `<div class="label">${this.t("rooms")}<button data-action="allRooms">${allSelected ? this.t("selectNone") : this.t("selectAll")}</button></div>`
      + (issues.length
        ? `<div class="roomWarning"><ha-icon icon="ic:twotone-warning-amber"></ha-icon><div><strong>${this.t("roomIssuesTitle")}</strong>`
          + issues.map((issue) => `<span>${this.escape(issue.name)}: ${this.escape(issue.text)}${issue.newId !== undefined ? ` ${this.t("roomNewId", { id: issue.newId })}` : ""}</span>`).join("")
          + `<span>${this.t("roomIssuesHint")}</span></div></div>`
        : "")
      + `<div class="rooms">`
      + rooms.map((room) => {
        const order = this.selected.indexOf(room.id);
        return `<button class="room${order >= 0 ? " selected" : ""}" data-action="room" data-value="${room.id}" aria-pressed="${order >= 0}"><ha-icon icon="${this.escape(room.icon)}"></ha-icon><span>${this.escape(room.name)}</span>${order >= 0 ? `<span class="order">${order + 1}</span>` : ""}</button>`;
      }).join("")
      + `</div>`;
    let startText, startClass = "start", startDisabled = false;
    if (status.control === "pause" && status.key !== "returning") startText = this.t("pause");
    else if (status.control === "resume") startText = this.t("resume");
    else if (this.selected.length) startText = this.selected.length === 1 ? this.t("cleanOneRoom") : this.t("cleanRooms", { count: this.selected.length });
    else { startText = this.t("chooseRooms"); startClass += " idle"; startDisabled = true; }
    html += `<div class="startRow"><button class="${startClass}" data-action="start"${startDisabled ? " disabled" : ""}>${startText}</button>`
      + `<button class="toStation" data-action="dock" aria-label="${this.t("toStation")}" title="${this.t("toStation")}"><ha-icon icon="mdi:home-import-outline"></ha-icon></button></div>`
      + `<div class="error">${this.escape(this.errorText)}</div>`;
    root.querySelector(".cleaning").innerHTML = html;

    // station column
    const attributes = this.stateOf(this.config.entity)?.attributes || {};
    const battery = attributes.battery ?? attributes.battery_level;
    const facts = [`<b>${this.escape(status.title)}</b>`];
    if (status.subtitle && status.key !== "ready") facts.push(this.escape(status.subtitle));
    if (battery !== undefined) facts.push(this.escape(this.t("battery", { battery })));
    // station: one line when everything is fine, otherwise only what needs attention
    const stationParts = [
      [this.t("freshWater"), attributes.low_water ? this.t("station.empty") : this.stationValue(attributes.clean_water_tank_status)],
      [this.t("dirtyWater"), this.stationValue(attributes.dirty_water_tank_status)],
      [this.t("dustBag"), this.stationValue(attributes.dust_bag_status)],
    ].filter(([, value]) => value);
    const stationIssues = stationParts.filter(([, value]) => value !== this.t("station.ok"));
    if (stationParts.length) facts.push(stationIssues.length ? stationIssues.map(([name, value]) => `<span class="warn">${this.escape(name)} ${this.escape(value)}</span>`).join("<br>") : this.escape(this.t("stationOk")));
    const last = this.formatLastCleaning();
    if (last) facts.push(this.escape(this.t("lastCleaning", { time: last })));

    let station = `<div class="panelTitle">${this.escape(this.config.station_title || this.t("stationTitle"))}</div>`
      + `<div class="robotInfo"><div class="art ${status.art}">${robotSvg}</div><div class="facts">${facts.join("<br>")}</div></div>`;
    station += this.wearItems().map((item) => {
      const value = item.due && item.reset
        ? `<button class="reset${this.confirmReset === item.reset ? " confirm" : ""}" data-action="reset" data-value="${this.escape(item.reset)}">${this.confirmReset === item.reset ? this.t("confirmReset") : this.t("reset")}</button>`
        : `<span class="value">${item.left} %${item.hours !== null ? ` · ${item.hours} h` : ""}</span>`;
      return `<div class="wear${item.due ? " due" : ""}"><div class="name">${this.escape(item.name)}</div>${value}<div class="line"><div style="width:${Math.max(2, Math.min(100, item.left))}%"></div></div></div>`;
    }).join("");
    const actions = this.stationActions.filter((action) => this.stateOf(action.entity));
    if (actions.length) {
      station += `<div class="actions">` + actions.map((action) => {
        const unavailable = this.stateOf(action.entity).state === "unavailable";
        const done = this.pressedAction === action.entity;
        return `<button class="action${done ? " done" : ""}" data-action="press" data-value="${this.escape(action.entity)}"${unavailable ? " disabled" : ""}>${action.icon ? `<ha-icon icon="${this.escape(done ? "mdi:check" : action.icon)}"></ha-icon>` : ""}<span>${this.escape(this.itemName(action, "actions"))}</span></button>`;
      }).join("") + `</div>`;
    }
    root.querySelector(".station").innerHTML = station;
  }

  getCardSize() {
    return this.view === "dialog" ? 8 : 2;
  }

  getGridOptions() {
    return this.view === "dialog" ? { columns: 12, rows: "auto" } : { columns: 12, rows: "auto", min_rows: 2 };
  }

  static getStubConfig() {
    return { entity: "vacuum.robot" };
  }

  static async getConfigElement() {
    return document.createElement("graphite-vacuum-editor");
  }
}

registerElement("graphite-vacuum-editor", GraphiteVacuumEditor);
registerCard("graphite-vacuum", GraphiteVacuum, {
  name: "Graphite Vacuum",
  description: "Robot vacuum (Dreame) as animated tile and as panel with quick picks, rooms and maintenance.",
});
