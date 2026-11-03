// Registers a card under its graphite-* tag, optional old tags (aliases during the migration)
// and in the card picker of the dashboard editor.
import { version } from "./version";

export interface CardInfo {
  name: string;
  description: string;
  aliases?: string[];
  preview?: boolean;
}

const documentationBase = "https://github.com/bornste/ha-graphite-dashboard/blob/main/docs";

export function registerCard(tag: string, element: CustomElementConstructor, info: CardInfo): void {
  if (!customElements.get(tag)) customElements.define(tag, element);
  // an alias needs its own constructor: the same class cannot be defined twice
  for (const alias of info.aliases ?? []) {
    if (!customElements.get(alias)) customElements.define(alias, class extends (element as new () => HTMLElement) {});
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
