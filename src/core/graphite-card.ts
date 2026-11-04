// Base class of all Graphite cards: config handling, hass updates limited to the watched entities.
import { adoptStyles, LitElement, type CSSResultGroup, type PropertyValues } from "lit";
import type { GraphiteCardConfig, HomeAssistant } from "./types";
import { languageOf, translate } from "./i18n";

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
    if (previous?.locale?.language !== hass?.locale?.language) this.languageCache = undefined;
    this.hassChanged(hass);
    this.requestUpdate("hass", previous);
  }

  // called on every hass update, also when the card does not re-render (e.g. to pass hass on to child cards)
  protected hassChanged(_hass: HomeAssistant | undefined): void {}

  private languageCache?: string;

  // language of the texts: theme variable --graphite-language, else the Home Assistant language
  // (cached once the card is in the page, because the theme variable needs the computed style)
  protected get language(): string {
    if (this.languageCache) return this.languageCache;
    const language = languageOf(this.isConnected ? this : undefined, this.hass);
    if (this.isConnected) this.languageCache = language;
    return language;
  }

  // translated text, e.g. this.localize("time.sinceMinutes", { minutes: 5 })
  protected localize(key: string, params: Record<string, string | number> = {}): string {
    return translate(this.language, key, params);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.languageCache = undefined;
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
