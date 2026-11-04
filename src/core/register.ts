// Registers a card under its graphite-* tag, optional old tags (aliases during the migration)
// and in the card picker of the dashboard editor.
import { version } from "./version";

export interface CardAlias {
  tag: string;
  // config defaults the old tag implied (e.g. layout: tile)
  defaults?: Record<string, unknown>;
}

export interface CardInfo {
  name: string;
  description: string;
  aliases?: Array<string | CardAlias>;
  preview?: boolean;
}

const documentationBase = "https://github.com/bornste/ha-graphite-dashboard/blob/main/docs";

export function registerCard(tag: string, element: CustomElementConstructor, info: CardInfo): void {
  if (!customElements.get(tag)) customElements.define(tag, element);
  // an alias needs its own constructor: the same class cannot be defined twice
  for (const alias of info.aliases ?? []) {
    const { tag, defaults } = typeof alias === "string" ? { tag: alias, defaults: undefined } : alias;
    if (customElements.get(tag)) continue;
    customElements.define(tag, class extends (element as new () => HTMLElement & { setConfig(config: unknown): void }) {
      setConfig(config: Record<string, unknown>): void {
        super.setConfig(defaults ? { ...defaults, ...config } : config);
      }
    });
  }
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: tag,
    name: info.name,
    description: info.description,
    preview: info.preview ?? false,
    documentationURL: `${documentationBase}/${tag}.md`,
    version,
  });
}

export function registerElement(tag: string, element: CustomElementConstructor): void {
  if (!customElements.get(tag)) customElements.define(tag, element);
}
