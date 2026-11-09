// graphite-weather: the weather-forecast-card (troinine/ha-weather-forecast-card, MIT, installed via
// HACS) in the Graphite look. It derives from the original card and only adds styles, so all options,
// effects, the editor and upstream updates are kept. The card registers itself only once the original
// card is defined; without it nothing happens.
//
// Extra options:
//   show_secondary_info: true   shows location and min/max again (hidden by default)
//   sun_time_labels: true       hourly slots containing sunrise/sunset show that time
//                               (default: the regular interval hour is shown)
//
// The styles target the internal .wfc-* classes of the original card; if a future version renames
// them, only the styles below need to be adjusted.
import { registerCard } from "../../core/register";

const baseTag = "weather-forecast-card";
const cardTag = "graphite-weather";
const headerItemsTag = "wfc-forecast-header-items";

const graphiteCss = `
  /* condition and temperature like the panel titles */
  .wfc-current-state,
  .wfc-current-temperature {
    font-size: var(--graphite-title-size, 18px) !important;
    font-weight: var(--graphite-title-weight, 400) !important;
    color: var(--graphite-title-color, var(--graphite-text-primary, var(--primary-text-color))) !important;
    line-height: 1.3 !important;
  }
  .wfc-current-temperature {
    font-variant-numeric: tabular-nums;
  }

  /* location and min/max are hidden unless show_secondary_info is set */
  :host(:not([show-secondary-info])) .wfc-secondary {
    display: none !important;
  }

  /* current weather row: small inset, more air above, icon closer to the text */
  .wfc-current-weather {
    padding-inline: var(--graphite-gap-tile, 8px);
    padding-top: var(--graphite-weather-space-above, 0) !important;
    width: calc(100% - 2 * var(--graphite-gap-tile, 8px));
  }
  .wfc-weather-condition-icon-slot.wfc-current-icon {
    margin-right: var(--graphite-gap-tile, 8px) !important;
  }

  /* condition effects: calmer layer so the text stays readable */
  wfc-animation-provider {
    opacity: var(--graphite-weather-effects-opacity, 90%);
  }

  /* forecast day labels: quieter, icons and chart lead */
  .wfc-forecast-slot-time-primary {
    font-size: var(--graphite-font-caption-size, 12px) !important;
    color: var(--graphite-text-secondary, var(--secondary-text-color)) !important;
  }
`;

// styles inside the effect layer (own shadow root of wfc-animation-provider)
const effectsCss = `
  .cloud-track {
    opacity: var(--graphite-weather-cloud-opacity, 35%);
  }
`;

function createSheet(cssText: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  return sheet;
}

interface BaseCard extends HTMLElement {
  renderRoot?: ShadowRoot | HTMLElement;
  setConfig(config: Record<string, unknown>): void;
  updated?(changedProperties: Map<string, unknown>): void;
}

type BaseCardClass = (new () => BaseCard) & { styles?: unknown };

function defineWeatherCard(baseCard: BaseCardClass): void {
  if (customElements.get(cardTag)) return;
  const graphiteSheet = createSheet(graphiteCss);
  const effectsSheet = createSheet(effectsCss);

  class GraphiteWeather extends baseCard {
    // original styles first, Graphite styles last so they win on equal specificity
    static get styles(): unknown[] {
      const baseStyles = (baseCard as { styles?: unknown }).styles;
      return ([] as unknown[]).concat(baseStyles ?? [], graphiteSheet);
    }

    setConfig(config: Record<string, unknown>): void {
      super.setConfig(config);
      this.toggleAttribute("show-secondary-info", config?.show_secondary_info === true);
      this.toggleAttribute("sun-time-labels", config?.sun_time_labels === true);
    }

    // the effect layer is a separate element with its own shadow root:
    // add the effect styles after every render (the layer can be re-created)
    updated(changedProperties: Map<string, unknown>): void {
      super.updated?.(changedProperties);
      this.applyEffectStyles();
    }

    private applyEffectStyles(): void {
      const effectLayer = this.renderRoot?.querySelector("wfc-animation-provider") as
        (HTMLElement & { updateComplete?: Promise<unknown> }) | null | undefined;
      if (!effectLayer) return;
      const effectRoot = effectLayer.shadowRoot;
      if (!effectRoot) {
        // the layer has not rendered yet: try again once it has
        effectLayer.updateComplete?.then(() => this.applyEffectStyles());
        return;
      }
      if (!effectRoot.adoptedStyleSheets.includes(effectsSheet)) {
        effectRoot.adoptedStyleSheets = [...effectRoot.adoptedStyleSheets, effectsSheet];
      }
    }
  }

  registerCard(cardTag, GraphiteWeather, {
    name: "Graphite Weather",
    description: "Weather Forecast Card in the Graphite look (needs the Weather Forecast Card from HACS).",
    preview: true,
  });
}

// hourly slot labels: with show_sun_times the original replaces the interval hour of the slot
// containing sunrise/sunset by that time (e.g. 7:47 instead of 8). Inside this card the interval
// hour is kept and the night detection stays active. Other weather cards are unaffected.
function keepsIntervalLabels(element: Element): boolean {
  let node: Node | undefined = element;
  for (let depth = 0; depth < 10 && node; depth++) {
    const host: Element | undefined = (node.getRootNode() as ShadowRoot).host;
    if (!host) return false;
    if (host.localName === cardTag) return !host.hasAttribute("sun-time-labels");
    node = host;
  }
  return false;
}

function patchHeaderItems(headerItemsClass: CustomElementConstructor | undefined): void {
  const proto = headerItemsClass?.prototype as
    { getDateInfo?: () => unknown; suntimesInfo?: unknown; graphitePatched?: boolean } | undefined;
  if (!proto || typeof proto.getDateInfo !== "function" || proto.graphitePatched) return;
  const originalGetDateInfo = proto.getDateInfo;
  proto.getDateInfo = function (this: Element & { suntimesInfo?: unknown }) {
    if (!keepsIntervalLabels(this)) return originalGetDateInfo.call(this);
    // suntimesInfo is a plain (non reactive) property: hide it for the label only
    const savedSuntimes = this.suntimesInfo;
    this.suntimesInfo = undefined;
    try {
      return originalGetDateInfo.call(this);
    } finally {
      this.suntimesInfo = savedSuntimes;
    }
  };
  proto.graphitePatched = true;
}

// the original card may be loaded after this library
customElements.whenDefined(baseTag).then(() => defineWeatherCard(customElements.get(baseTag) as unknown as BaseCardClass));
customElements.whenDefined(headerItemsTag).then(() => patchHeaderItems(customElements.get(headerItemsTag)));
