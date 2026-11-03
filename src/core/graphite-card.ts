// Base class of all Graphite cards: config handling, hass updates limited to the watched entities.
import { LitElement, type PropertyValues } from "lit";
import type { GraphiteCardConfig, HomeAssistant } from "./types";

export abstract class GraphiteCard<TConfig extends GraphiteCardConfig = GraphiteCardConfig> extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare config?: TConfig;

  // called by Home Assistant with the YAML / editor config; throw to show a config error
  setConfig(config: TConfig): void {
    if (!config) throw new Error("Invalid configuration");
    this.config = this.normalizeConfig(config);
  }

  // defaults and validation of a card; returns the config the card works with
  protected normalizeConfig(config: TConfig): TConfig {
    return config;
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
