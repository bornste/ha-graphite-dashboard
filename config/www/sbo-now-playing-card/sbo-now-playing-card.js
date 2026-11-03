// SBO Now Playing Card - shows what is running on the most important media device.
// Display only, no actions. Sources are checked in order, the first active one is shown;
// without an active source the card hides itself (hui-card visibility).
const cardVersion = "0.7.0";

// start time per entity and title from the history (short unavailable gaps ignored), shared by all cards
const startTimeCache = new Map();
const maxGapMinutes = 10;

// load result per image URL, shared by all card instances
const imageLoadCache = new Map();

const activeStates = ["on", "playing", "paused", "buffering"];
const defaultIgnoredTitles = ["off", "standby", "home", "screensaver", "unknown", "unavailable", ""];

const cardStyles = `
  :host {
    display: block;
  }
  :host([inactive]) {
    display: none;
  }
  ha-card {
    background: color-mix(in srgb, var(--sbo-accent, #f5c48a) 10%, var(--sbo-surface-tile-active, #2b2b2c));
    border-radius: var(--sbo-card-radius, var(--sbo-radius-tile, 12px));
    border: none;
    box-shadow: none;
    padding: 12px 14px 12px 12px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 14px;
    align-items: center;
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }
  /* cover as blurred, dimmed backdrop over the whole card (only when a cover is available) */
  .backdrop {
    position: absolute;
    inset: -24px;
    z-index: -1;
    background: center / cover no-repeat;
    filter: blur(22px) saturate(1.3) brightness(0.42);
    transform: scale(1.1);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  ha-card.has-backdrop .backdrop {
    opacity: 1;
  }
  ha-card.has-backdrop {
    background: var(--sbo-surface-tile-active, #2b2b2c);
  }
  ha-card.has-backdrop .subtitle {
    color: rgba(255, 255, 255, 0.72);
  }
  @media (prefers-reduced-motion: reduce) {
    .backdrop { transition: none; }
  }
  .art {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    background: var(--sbo-art-color, var(--sbo-surface-tile, #1f1f20)) center / cover no-repeat;
    display: grid;
    place-items: center;
    font-size: 24px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.88);
    overflow: hidden;
  }
  .art.has-image {
    color: transparent;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }
  /* source as watermark icon top right, like the icons of the switch tiles */
  .source-icon {
    position: absolute;
    top: 4px;
    right: 6px;
    --mdc-icon-size: 34px;
    color: var(--sbo-text-primary, #f3f3f4);
    opacity: 0.16;
    pointer-events: none;
  }
  .text {
    min-width: 0;
    /* room for the watermark icon top right */
    padding-right: 32px;
  }
  .title {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.25;
    color: var(--sbo-text-primary, #f3f3f4);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress {
    margin-top: 8px;
    height: 3px;
    border-radius: 2px;
    background: var(--sbo-surface-tile, rgba(255, 255, 255, 0.1));
    overflow: hidden;
  }
  .progress[hidden] {
    display: none;
  }
  .progress > div {
    height: 100%;
    width: 0;
    border-radius: 2px;
    background: var(--sbo-accent, #f5c48a);
  }
  .subtitle {
    margin-top: 3px;
    font-size: 12px;
    line-height: 14px;
    color: var(--sbo-text-secondary, #b4b4b8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

class SboNowPlayingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.renderKey = "";
    this.visible = undefined;
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.sources) || config.sources.length === 0) {
      throw new Error("sbo-now-playing-card: 'sources' must be a list of media sources");
    }
    this.config = config;
    this.shadowRoot.innerHTML = `
      <style>${cardStyles}</style>
      <ha-card>
        <ha-icon class="source-icon"></ha-icon>
        <div class="backdrop"></div>
        <div class="art"></div>
        <div class="text">
          <div class="title"></div>
          <div class="subtitle"></div>
          <div class="progress" hidden><div></div></div>
        </div>
      </ha-card>`;
    this.renderKey = "";
    if (this.hassObject) this.update();
  }

  set hass(hass) {
    this.hassObject = hass;
    this.update();
  }

  get hass() {
    return this.hassObject;
  }

  connectedCallback() {
    // the first state may be set before the card is attached; announce it again once connected
    if (this.visible !== undefined) requestAnimationFrame(() => this.announceVisibility());
    // refresh the "since" text once a minute
    this.timer = setInterval(() => {
      this.renderKey = "";
      this.update();
    }, 60000);
  }

  disconnectedCallback() {
    clearInterval(this.timer);
  }

  // first active source with its resolved texts, or null
  findActiveSource() {
    const hass = this.hassObject;
    for (const source of this.config.sources) {
      const stateObj = hass.states[source.entity];
      if (!stateObj || !activeStates.includes(stateObj.state)) continue;
      // optional extra entities that must be active too (e.g. the console next to a profile sensor)
      const requiredEntities = [].concat(source.requires || []);
      if (requiredEntities.some((entityId) => !activeStates.includes(hass.states[entityId]?.state))) continue;
      const titleState = source.title_entity ? hass.states[source.title_entity] : undefined;
      const attributes = stateObj.attributes || {};
      const title = (titleState ? titleState.state : "")
        || attributes.media_title
        || attributes.app_name
        || "";
      const ignoredTitles = (source.ignore_titles || defaultIgnoredTitles).map((text) => String(text).toLowerCase());
      if (ignoredTitles.includes(String(title).toLowerCase())) continue;
      return { source, stateObj, titleState, title };
    }
    return null;
  }

  update() {
    if (!this.config || !this.hassObject) return;
    const active = this.findActiveSource();
    this.setVisible(!!active);
    if (!active) return;

    const { source, stateObj, titleState, title } = active;
    const attributes = stateObj.attributes || {};
    const progress = this.progressInfo(stateObj);
    const appName = attributes.app_name !== title ? attributes.app_name : "";
    const subtitleParts = [this.formatSubtitle(source, titleState)
      || attributes.media_artist || attributes.media_series_title || appName];
    subtitleParts.push(progress ? progress.text : this.sinceText(titleState || stateObj));
    const subtitle = subtitleParts.filter((part) => part).join(" · ");
    const image = this.usableImage(this.imageCandidates(source, title, attributes));

    const renderKey = [source.entity, title, subtitle, image, progress ? progress.percent : ""].join("|");
    if (renderKey === this.renderKey) return;
    this.renderKey = renderKey;

    const root = this.shadowRoot;
    const sourceIcon = root.querySelector(".source-icon");
    sourceIcon.setAttribute("icon", source.icon || attributes.icon || "mdi:play-circle-outline");
    root.querySelector("ha-card").setAttribute("aria-label", `${source.name || attributes.friendly_name || source.entity}: ${title}`);
    root.querySelector(".title").textContent = title;
    root.querySelector(".subtitle").textContent = subtitle;
    const progressBar = root.querySelector(".progress");
    progressBar.hidden = !progress;
    progressBar.firstElementChild.style.width = progress ? `${progress.percent}%` : "0";

    const art = root.querySelector(".art");
    art.classList.toggle("has-image", !!image);
    art.style.backgroundImage = image ? `url("${image}")` : "";
    const backdropEnabled = !!image && source.backdrop !== false;
    root.querySelector("ha-card").classList.toggle("has-backdrop", backdropEnabled);
    root.querySelector(".backdrop").style.backgroundImage = backdropEnabled ? `url("${image}")` : "";
    art.style.setProperty("--sbo-art-color", this.monogramColor(title));
    art.textContent = image ? "" : String(title).trim().charAt(0).toUpperCase();
  }

  // start of the current state: last_changed, corrected from the history so that short
  // unavailable gaps (e.g. Xbox Live dropouts) and restarts do not reset the time
  startTime(stateObj) {
    const lastChanged = new Date(stateObj.last_changed).getTime();
    const key = `${stateObj.entity_id}|${stateObj.state}`;
    const cached = startTimeCache.get(key);
    if (cached && cached.lastChanged === lastChanged) return cached.start ?? lastChanged;
    startTimeCache.set(key, { lastChanged, start: null });
    const since = new Date(Date.now() - 24 * 3600000).toISOString();
    this.hassObject.callApi("GET", `history/period/${since}?filter_entity_id=${stateObj.entity_id}&minimal_response&no_attributes`)
      .then((result) => {
        const history = (result && result[0]) || [];
        let start = lastChanged;
        let gapEnd = null;
        // walk back from the newest entry while the state stays the same (or is briefly unavailable)
        for (let index = history.length - 1; index >= 0; index -= 1) {
          const entry = history[index];
          const changed = new Date(entry.last_changed).getTime();
          if (entry.state === stateObj.state) {
            start = changed;
            gapEnd = null;
          } else if (["unavailable", "unknown"].includes(entry.state)) {
            gapEnd = gapEnd ?? (index + 1 < history.length ? new Date(history[index + 1].last_changed).getTime() : Date.now());
            if (gapEnd - changed > maxGapMinutes * 60000) break;
          } else {
            break;
          }
        }
        startTimeCache.set(key, { lastChanged, start: Math.min(start, lastChanged) });
        this.renderKey = "";
        this.update();
      })
      .catch(() => {});
    return lastChanged;
  }

  // optional subtitle from attributes of the title entity, e.g. "{progress} abgeschlossen"
  formatSubtitle(source, titleState) {
    if (!source.subtitle || !titleState) return "";
    const attributes = titleState.attributes || {};
    let missing = false;
    const text = String(source.subtitle).split("{").map((part, index) => {
      if (index === 0) return part;
      const closing = part.indexOf("}");
      if (closing < 0) return `{${part}`;
      const value = attributes[part.slice(0, closing)];
      if (value === undefined || value === null || value === "") missing = true;
      return `${value ?? ""}${part.slice(closing + 1)}`;
    }).join("");
    return missing ? "" : text.trim();
  }

  // image candidates in priority order: real cover, app image from a helper, card mapping (by title or app name)
  imageCandidates(source, title, attributes) {
    const candidates = [];
    const picture = attributes.entity_picture_local
      || (attributes.entity_picture && attributes.entity_picture.startsWith("/api/") ? attributes.entity_picture : "")
      || (attributes.entity_picture && attributes.entity_picture.startsWith("http") ? attributes.entity_picture : "");
    if (picture) candidates.push(this.hassObject.hassUrl ? this.hassObject.hassUrl(picture) : picture);
    if (source.image_entity) {
      // image entities (e.g. Xbox box art) carry the picture, helpers carry a path as state
      const imageStateObj = this.hassObject.states[source.image_entity];
      const imagePicture = imageStateObj?.attributes?.entity_picture;
      if (imagePicture) candidates.push(this.hassObject.hassUrl ? this.hassObject.hassUrl(imagePicture) : imagePicture);
      else if (imageStateObj?.state && imageStateObj.state.startsWith("/")) candidates.push(imageStateObj.state);
    }
    if (source.images) {
      if (source.images[title]) candidates.push(source.images[title]);
      if (attributes.app_name && source.images[attributes.app_name]) candidates.push(source.images[attributes.app_name]);
    }
    return candidates;
  }

  // first candidate known to load; an unknown candidate is probed first (monogram meanwhile)
  usableImage(candidates) {
    for (const url of candidates) {
      const status = imageLoadCache.get(url);
      if (status === "ok") return url;
      if (status === "failed") continue;
      if (status !== "loading") {
        imageLoadCache.set(url, "loading");
        const probe = new Image();
        probe.onload = () => {
          imageLoadCache.set(url, "ok");
          this.renderKey = "";
          this.update();
        };
        probe.onerror = () => {
          imageLoadCache.set(url, "failed");
          this.renderKey = "";
          this.update();
        };
        probe.src = url;
      }
      return "";
    }
    return "";
  }

  // live position for media with a duration (films, episodes, songs)
  progressInfo(stateObj) {
    const attributes = stateObj.attributes || {};
    const duration = Number(attributes.media_duration);
    if (!duration || attributes.media_position === undefined) return null;
    let position = Number(attributes.media_position) || 0;
    if (stateObj.state === "playing" && attributes.media_position_updated_at) {
      position += (Date.now() - new Date(attributes.media_position_updated_at).getTime()) / 1000;
    }
    position = Math.min(Math.max(position, 0), duration);
    const remainingMinutes = Math.ceil((duration - position) / 60);
    const text = stateObj.state === "paused" ? "pausiert" : `noch ${remainingMinutes} Min.`;
    return { percent: Math.round((position / duration) * 1000) / 10, text };
  }

  // calm, muted hue per title so the monogram tiles differ without getting loud
  monogramColor(title) {
    let seed = 0;
    for (const character of String(title)) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
    return `hsl(${seed % 360} 22% 32%)`;
  }

  sinceText(stateObj) {
    const minutes = Math.max(0, Math.floor((Date.now() - this.startTime(stateObj)) / 60000));
    if (minutes < 1) return "gerade gestartet";
    if (minutes < 60) return `seit ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    return `seit ${hours}:${String(minutes % 60).padStart(2, "0")} h`;
  }

  setVisible(visible) {
    if (this.visible === visible) return;
    this.visible = visible;
    this.toggleAttribute("inactive", !visible);
    this.announceVisibility();
  }

  // lets the panel card collapse the whole slot (no gap)
  announceVisibility() {
    this.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: this.visible }, bubbles: true, composed: true }));
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig() {
    return { sources: [{ entity: "media_player.example", name: "TV" }] };
  }
}

customElements.define("sbo-now-playing-card", SboNowPlayingCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "sbo-now-playing-card",
  name: "SBO Now Playing Card",
  description: "Shows what is running on the most important active media device.",
});
console.info(`%c SBO-NOW-PLAYING-CARD %c ${cardVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
