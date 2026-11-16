// Base class of all Graphite cards: config handling, hass updates limited to the watched entities.
import { adoptStyles, LitElement, type CSSResultGroup, type PropertyValues } from "lit";
import type { GraphiteCardConfig, HomeAssistant } from "./types";
import { rememberHass } from "./hass-store";
import { languageOf, themeLanguageOf, translate } from "./i18n";

// checks for the theme language of a card that was built before the view theme applied
// (80 x 250 ms = 20 s; Home Assistant may build the view late when the page loads with a dialog hash,
// and a hidden page slows the timers down)
const languageChecks = 80;
const languageCheckDelay = 250;

export abstract class GraphiteCard<TConfig extends GraphiteCardConfig = GraphiteCardConfig> extends LitElement {
  static properties = {
    config: { state: true },
  };

  declare config?: TConfig;

  private hassObject?: HomeAssistant;

  // hass is set by Home Assistant on every state change anywhere; shouldUpdate filters it
  get hass(): HomeAssistant | undefined {
    return this.hassObject;
  }

  set hass(hass: HomeAssistant | undefined) {
    const previous = this.hassObject;
    this.hassObject = hass;
    rememberHass(hass);
    if (previous?.locale?.language !== hass?.locale?.language) this.languageCache = undefined;
    this.hassChanged(hass);
    this.requestUpdate("hass", previous);
  }

  // called on every hass update, also when the card does not re-render (e.g. to pass hass on to child cards)
  protected hassChanged(_hass: HomeAssistant | undefined): void {}

  private languageCache?: string;
  // the language the texts were last made in (also while the card was not in the page yet)
  private usedLanguage?: string;
  private languageCheck?: number;
  private languageChecksLeft = languageChecks;

  // language of the texts: theme variable --graphite-language, else the Home Assistant language
  // (cached once the card is in the page, because the theme variable needs the computed style).
  // A card built before the view theme applied (e.g. a dialog opened with the URL) does not see the
  // variable yet: it then checks again for a few seconds and renders again once the theme is there.
  protected get language(): string {
    if (this.languageCache) return this.languageCache;
    const language = languageOf(this.isConnected ? this : undefined, this.hass);
    this.usedLanguage = language;
    if (!this.isConnected) return language;
    if (themeLanguageOf(this) || this.languageChecksLeft <= 0) this.languageCache = language;
    else this.scheduleLanguageCheck();
    return language;
  }

  private scheduleLanguageCheck(): void {
    if (this.languageCheck !== undefined) return;
    this.languageCheck = window.setTimeout(() => {
      this.languageCheck = undefined;
      this.languageChecksLeft--;
      if (!this.isConnected) return;
      if (themeLanguageOf(this)) {
        this.languageCache = undefined;
        this.refreshLanguage();
      } else {
        // still no theme language: look again (the getter caches the fallback after the last check)
        void this.language;
      }
    }, languageCheckDelay);
  }

  // texts made in another language than the one that applies now: render again
  private refreshLanguage(): void {
    if (this.usedLanguage === undefined || this.usedLanguage === languageOf(this, this.hass)) return;
    this.requestUpdate();
    this.languageChanged();
  }

  // called when the language of the texts changed after the first render (e.g. labels set outside render)
  protected languageChanged(): void {}

  // translated text, e.g. this.localize("time.sinceMinutes", { minutes: 5 })
  protected localize(key: string, params: Record<string, string | number> = {}): string {
    return translate(this.language, key, params);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.languageCache = undefined;
    this.languageChecksLeft = languageChecks;
    // texts made before the card was in the page (or before the theme applied): check them now,
    // and keep looking for the theme language while it is missing
    if (themeLanguageOf(this)) this.refreshLanguage();
    else this.scheduleLanguageCheck();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.languageCheck);
    this.languageCheck = undefined;
  }

  // called by Home Assistant with the YAML / editor config; throw to show a config error
  setConfig(config: TConfig): void {
    if (!config) throw new Error("Invalid configuration");
    this.config = this.normalizeConfig(config);
  }

  // defaults and validation of a card; returns the config the card works with
  protected normalizeConfig(config: TConfig): TConfig {
    return config;
  }

  // styles that depend on the config (e.g. the layout); undefined = the static styles only
  protected stylesForConfig(): CSSResultGroup | undefined {
    return undefined;
  }

  private appliedStyles?: CSSResultGroup;

  // the shadow root gets the styles of the current layout before rendering
  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const styles = this.stylesForConfig();
    if (styles && styles !== this.appliedStyles && this.renderRoot instanceof ShadowRoot) {
      adoptStyles(this.renderRoot, (this.constructor as typeof LitElement).finalizeStyles(styles));
      this.appliedStyles = styles;
    }
  }

  // entities whose changes trigger a re-render (default: the card entity)
  protected watchedEntities(): string[] {
    return this.config?.entity ? [this.config.entity] : [];
  }

  // re-render on hass changes only when a watched entity or the language changed
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!this.config) return false;
    if (changed.size !== 1 || !changed.has("hass")) return true;
    const previous = changed.get("hass") as HomeAssistant | undefined;
    if (!previous || !this.hass) return true;
    if (previous.locale?.language !== this.hass.locale?.language) return true;
    return this.watchedEntities().some((entityId) => previous.states[entityId] !== this.hass!.states[entityId]);
  }

  getCardSize(): number {
    return 1;
  }
}
