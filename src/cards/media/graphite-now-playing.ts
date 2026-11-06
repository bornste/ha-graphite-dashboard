// graphite-now-playing: what is running on the most important media device. Sources are checked in
// order and the first active one is shown (e.g. a game on the console before the console's home screen
// before the TV); without an active source the card hides itself. Cover or app image on the left
// (monogram without one), title, a subtitle with details and the running time, a progress bar for
// media with a duration and the source icon as watermark. Display only, no actions.
import { css, html, nothing } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteNowPlayingEditor } from "./graphite-now-playing-editor";

export interface NowPlayingSource {
  entity: string;
  name?: string;
  icon?: string;
  // states that count as running (default: on, playing, paused, buffering), e.g. [idle] for a console menu
  states?: string[];
  // extra entities that must be active too (e.g. the console next to a profile sensor)
  requires?: string | string[];
  title_entity?: string;
  image_entity?: string;
  // subtitle from attributes of the title entity, e.g. "{progress} abgeschlossen"
  subtitle?: string;
  // shown when the device runs without a usable title (e.g. the console's home screen);
  // without it such a source is skipped
  fallback_title?: string;
  // second line while the fallback title is shown, e.g. "Startseite"
  fallback_subtitle?: string;
  // readable names for raw titles or app names, e.g. { Home: Startbildschirm }; a title listed here
  // is shown even if it is ignored otherwise
  titles?: Record<string, string>;
  ignore_titles?: string[];
  images?: Record<string, string>;
  backdrop?: boolean;
}

export interface NowPlayingConfig extends GraphiteCardConfig {
  sources: NowPlayingSource[];
}

interface ActiveSource {
  source: NowPlayingSource;
  stateObj: HassEntity;
  titleState?: HassEntity;
  title: string;
  rawTitle: string;
  fallback: boolean;
}

const activeStates = ["on", "playing", "paused", "buffering"];
const defaultIgnoredTitles = ["off", "standby", "home", "screensaver", "unknown", "unavailable", ""];
const maxGapMinutes = 10;
// start time per entity and state from the history, and load results per image, shared by all cards
const startTimeCache = new Map<string, { lastChanged: number; start: number | null }>();
const imageLoadCache = new Map<string, "loading" | "ok" | "failed">();

// a package or component name ("org.droidtv.playtv") is no title for people
function isTechnicalName(text: string): boolean {
  return text.includes(".") && !text.includes(" ");
}

export class GraphiteNowPlaying extends GraphiteCard<NowPlayingConfig> {
  static styles = css`
    :host {
      display: block;
    }
    :host([inactive]) {
      display: none;
    }
    /* 88px like the media tiles: 12px padding, 64px cover */
    .card {
      position: relative;
      display: grid;
      grid-template-columns: var(--graphite-tile-height-scene, 64px) minmax(0, 1fr);
      gap: var(--graphite-gap-header, 12px);
      align-items: center;
      box-sizing: border-box;
      min-height: var(--graphite-tile-height-media, 88px);
      padding: var(--graphite-padding-tile, 12px) 14px var(--graphite-padding-tile, 12px) var(--graphite-padding-tile, 12px);
      border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
      background: color-mix(in srgb, var(--graphite-accent) var(--graphite-light-tint, 10%), var(--graphite-surface-tile-active));
      overflow: hidden;
      isolation: isolate;
    }
    /* cover as blurred, dimmed backdrop over the whole card */
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
    .card.has-backdrop {
      background: var(--graphite-surface-tile-active);
    }
    .card.has-backdrop .backdrop {
      opacity: 1;
    }
    .card.has-backdrop .subtitle {
      color: rgba(255, 255, 255, 0.72);
    }
    @media (prefers-reduced-motion: reduce) {
      .backdrop {
        transition: none;
      }
    }
    .art {
      width: var(--graphite-tile-height-scene, 64px);
      height: var(--graphite-tile-height-scene, 64px);
      border-radius: var(--graphite-radius-tile, 12px);
      background: var(--art-color, var(--graphite-surface-tile)) center / cover no-repeat;
      display: grid;
      place-items: center;
      font-size: var(--graphite-font-value-size, 22px);
      font-weight: 400;
      color: rgba(255, 255, 255, 0.88);
      overflow: hidden;
    }
    .art.has-image {
      color: transparent;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }
    /* source as watermark top right, at the same place as the meter and stopwatch icons */
    .watermark {
      position: absolute;
      top: 8px;
      right: 6px;
      display: flex;
      width: var(--graphite-watermark-size, 34px);
      height: var(--graphite-watermark-size, 34px);
      color: var(--graphite-text-primary);
      opacity: 0.16;
      pointer-events: none;
      --mdc-icon-size: var(--graphite-watermark-size, 34px);
    }
    .text {
      min-width: 0;
      padding-right: 32px;
    }
    .title {
      font-size: var(--graphite-font-name-size, 15px);
      font-weight: 500;
      line-height: 18px;
      color: var(--graphite-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .subtitle {
      margin-top: 2px;
      font-size: var(--graphite-font-caption-size, 12px);
      line-height: 15px;
      color: var(--graphite-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .progress {
      margin-top: 8px;
      height: 4px;
      border-radius: 2px;
      background: var(--graphite-surface-tile);
      overflow: hidden;
    }
    .progress > div {
      height: 100%;
      border-radius: 2px;
      background: var(--graphite-accent);
    }
  `;

  private refreshTimer?: number;
  private shownVisible?: boolean;

  protected normalizeConfig(config: NowPlayingConfig): NowPlayingConfig {
    if (!Array.isArray(config.sources) || config.sources.length === 0) {
      throw new Error(`${this.localName}: 'sources' must be a list of media sources`);
    }
    return config;
  }

  protected watchedEntities(): string[] {
    return this.config!.sources.flatMap((source) => [source.entity, source.title_entity, source.image_entity,
      ...([] as string[]).concat(source.requires ?? [])]).filter((entity): entity is string => !!entity);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // the "since" text and the progress move on without state changes
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), 60000);
    if (this.shownVisible !== undefined) requestAnimationFrame(() => this.announceVisibility());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.refreshTimer);
  }

  // first active source with its resolved title, or null
  private activeSource(): ActiveSource | null {
    const hass = this.hass!;
    for (const source of this.config!.sources) {
      const stateObj = hass.states[source.entity];
      const sourceStates = Array.isArray(source.states) && source.states.length ? source.states.map(String) : activeStates;
      if (!stateObj || !sourceStates.includes(stateObj.state)) continue;
      const required = ([] as string[]).concat(source.requires ?? []);
      if (required.some((entityId) => !activeStates.includes(hass.states[entityId]?.state ?? ""))) continue;
      const titleState = source.title_entity ? hass.states[source.title_entity] : undefined;
      const attributes = stateObj.attributes ?? {};
      const candidates = [titleState?.state, attributes.media_title, attributes.app_name]
        .map((text) => String(text ?? "").trim());
      const ignored = (source.ignore_titles ?? defaultIgnoredTitles).map((text) => String(text).toLowerCase());
      // a title with a readable name in titles is always used (also "Home", which is ignored otherwise)
      const rawTitle = candidates.find((text) => text && (source.titles?.[text] !== undefined
        || (!ignored.includes(text.toLowerCase()) && !isTechnicalName(text)))) ?? "";
      const title = rawTitle ? source.titles?.[rawTitle] ?? rawTitle : source.fallback_title ?? "";
      if (!title) continue;
      return { source, stateObj, titleState, title, rawTitle, fallback: !rawTitle };
    }
    return null;
  }

  // start of the current state: last_changed, corrected from the history so that short unavailable
  // gaps (e.g. Xbox Live dropouts) and restarts do not reset the time
  private startTime(stateObj: HassEntity): number {
    const lastChanged = new Date(stateObj.last_changed).getTime();
    const key = `${stateObj.entity_id}|${stateObj.state}`;
    const cached = startTimeCache.get(key);
    if (cached && cached.lastChanged === lastChanged) return cached.start ?? lastChanged;
    startTimeCache.set(key, { lastChanged, start: null });
    const since = new Date(Date.now() - 24 * 3600000).toISOString();
    const api: any = this.hass;
    api?.callApi?.("GET", `history/period/${since}?filter_entity_id=${stateObj.entity_id}&minimal_response&no_attributes`)
      .then((result: Array<Array<{ state: string; last_changed: string }>>) => {
        const history = result?.[0] ?? [];
        let start = lastChanged;
        let gapEnd: number | null = null;
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
        this.requestUpdate();
      })
      .catch(() => undefined);
    return lastChanged;
  }

  private sinceText(stateObj: HassEntity): string {
    const minutes = Math.max(0, Math.floor((Date.now() - this.startTime(stateObj)) / 60000));
    if (minutes < 1) return this.localize("nowPlaying.justStarted");
    if (minutes < 60) return this.localize("nowPlaying.sinceMinutes", { minutes });
    return this.localize("nowPlaying.sinceHours", { hours: Math.floor(minutes / 60), minutes: String(minutes % 60).padStart(2, "0") });
  }

  // subtitle from attributes of the title entity; empty while a placeholder has no value
  private formatSubtitle(source: NowPlayingSource, titleState?: HassEntity): string {
    if (!source.subtitle || !titleState) return "";
    const attributes = titleState.attributes ?? {};
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

  private progressInfo(stateObj: HassEntity): { percent: number; text: string } | null {
    const attributes = stateObj.attributes ?? {};
    const duration = Number(attributes.media_duration);
    if (!duration || attributes.media_position === undefined) return null;
    let position = Number(attributes.media_position) || 0;
    if (stateObj.state === "playing" && attributes.media_position_updated_at) {
      position += (Date.now() - new Date(attributes.media_position_updated_at).getTime()) / 1000;
    }
    position = Math.min(Math.max(position, 0), duration);
    const text = stateObj.state === "paused" ? this.localize("nowPlaying.paused")
      : this.localize("nowPlaying.remaining", { minutes: Math.ceil((duration - position) / 60) });
    return { percent: Math.round((position / duration) * 1000) / 10, text };
  }

  // image candidates: real cover, the image entity or helper, the card mapping (by title or app name)
  private imageCandidates(active: ActiveSource): string[] {
    const { source, stateObj, title, rawTitle } = active;
    const attributes = stateObj.attributes ?? {};
    const hass: any = this.hass;
    const resolve = (url: string) => (hass?.hassUrl ? hass.hassUrl(url) : url);
    const candidates: string[] = [];
    const picture = attributes.entity_picture_local
      || (String(attributes.entity_picture ?? "").startsWith("/api/") || String(attributes.entity_picture ?? "").startsWith("http")
        ? attributes.entity_picture : "");
    if (picture) candidates.push(resolve(picture));
    if (source.image_entity) {
      const imageState = this.hass!.states[source.image_entity];
      const imagePicture = imageState?.attributes?.entity_picture;
      if (imagePicture) candidates.push(resolve(imagePicture));
      else if (imageState?.state?.startsWith("/")) candidates.push(imageState.state);
    }
    for (const key of [title, rawTitle, attributes.app_name]) {
      if (key && source.images?.[key]) candidates.push(source.images[key]);
    }
    return candidates;
  }

  // first candidate known to load; an unknown one is probed first (monogram meanwhile)
  private usableImage(candidates: string[]): string {
    for (const url of candidates) {
      const status = imageLoadCache.get(url);
      if (status === "ok") return url;
      if (status === "failed") continue;
      if (status !== "loading") {
        imageLoadCache.set(url, "loading");
        const probe = new Image();
        probe.onload = () => {
          imageLoadCache.set(url, "ok");
          this.requestUpdate();
        };
        probe.onerror = () => {
          imageLoadCache.set(url, "failed");
          this.requestUpdate();
        };
        probe.src = url;
      }
      return "";
    }
    return "";
  }

  // calm, muted hue per title so the monogram tiles differ without getting loud
  private monogramColor(title: string): string {
    let seed = 0;
    for (const character of title) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
    return `hsl(${seed % 360} 22% 32%)`;
  }

  private setVisible(visible: boolean): void {
    if (this.shownVisible === visible) return;
    this.shownVisible = visible;
    this.toggleAttribute("inactive", !visible);
    this.announceVisibility();
  }

  // lets the panel collapse the whole slot (no gap)
  private announceVisibility(): void {
    this.dispatchEvent(new CustomEvent("card-visibility-changed", { detail: { value: this.shownVisible }, bubbles: true, composed: true }));
  }

  protected render() {
    if (!this.hass) return nothing;
    const active = this.activeSource();
    this.setVisible(!!active);
    if (!active) return nothing;
    const { source, stateObj, titleState, title } = active;
    const attributes = stateObj.attributes ?? {};
    const progress = this.progressInfo(stateObj);
    const appName = String(attributes.app_name ?? "");
    const readableApp = appName && !isTechnicalName(appName) && appName !== active.rawTitle ? source.titles?.[appName] ?? appName : "";
    const details = active.fallback ? source.fallback_subtitle ?? ""
      : this.formatSubtitle(source, titleState) || attributes.media_artist || attributes.media_series_title || readableApp;
    const subtitle = [details, progress ? progress.text : this.sinceText(titleState ?? stateObj)].filter(Boolean).join(" · ");
    const image = this.usableImage(this.imageCandidates(active));
    const backdrop = !!image && source.backdrop !== false;
    const label = `${source.name ?? attributes.friendly_name ?? source.entity}: ${title}`;
    return html`<div class=${backdrop ? "card has-backdrop" : "card"} aria-label=${label}><div class="backdrop"
      style=${backdrop ? `background-image: url("${image}")` : nothing}></div><div class="watermark"><ha-icon
      .icon=${source.icon ?? attributes.icon ?? "mdi:play-circle-outline"}></ha-icon></div><div class=${image ? "art has-image" : "art"}
      style=${`--art-color: ${this.monogramColor(title)};${image ? ` background-image: url("${image}")` : ""}`}>${image ? ""
      : title.charAt(0).toUpperCase()}</div><div class="text"><div class="title">${title}</div><div class="subtitle">${subtitle}</div>${progress
      ? html`<div class="progress"><div style=${`width: ${progress.percent}%`}></div></div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("media_player.")) ?? "media_player.example";
    return { sources: [{ entity }] };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-now-playing-editor");
  }
}

registerElement("graphite-now-playing-editor", GraphiteNowPlayingEditor);
registerCard("graphite-now-playing", GraphiteNowPlaying, {
  name: "Graphite Now Playing",
  description: "What runs on the most important active media device: cover, title, details, running time.",
});
