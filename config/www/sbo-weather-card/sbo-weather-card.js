/*
 * sbo-weather-card
 * Graphite variant of the weather-forecast-card (troinine/ha-weather-forecast-card, MIT).
 * It derives from the original card and only appends styles, so all options, effects,
 * the editor and upstream updates (via HACS) are kept. No UIX needed.
 *
 * Extra options:
 *   show_secondary_info: true   shows location and min/max again (hidden by default)
 *   sun_time_labels: true       hourly slots containing sunrise/sunset show that time
 *                               (default: the regular interval hour is shown)
 *
 * Note: forecast.show_sun_times must be true for the night detection (moon, night sky,
 * night icons). This card keeps the interval labels in the hourly forecast anyway.
 *
 * CSS variables (theme or panel variables):
 *   --sbo-weather-effects-opacity   opacity of the whole effect layer (default 90%)
 *   --sbo-weather-cloud-opacity     opacity of the animated clouds (default 35%)
 *
 * The styles target the internal .wfc-* classes of the original card. If a future version
 * renames them, only the styles below need to be adjusted.
 */
const sboWeatherCardVersion = "0.3.0";
const baseTag = "weather-forecast-card";
const cardTag = "sbo-weather-card";

const graphiteCss = `
  /* condition and temperature like the panel titles */
  .wfc-current-state,
  .wfc-current-temperature {
    font-size: var(--sbo-title-size, 18px) !important;
    font-weight: var(--sbo-title-weight, 400) !important;
    color: var(--sbo-title-color, var(--sbo-text-primary, var(--primary-text-color))) !important;
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
    padding-inline: 8px;
    padding-top: var(--sbo-weather-space-above, 0) !important;
    width: calc(100% - 16px);
  }
  .wfc-weather-condition-icon-slot.wfc-current-icon {
    margin-right: 8px !important;
  }

  /* condition effects: calmer layer so the text stays readable */
  wfc-animation-provider {
    opacity: var(--sbo-weather-effects-opacity, 90%);
  }

  /* forecast day labels: quieter, icons and chart lead */
  .wfc-forecast-slot-time-primary {
    font-size: 12px !important;
    color: var(--sbo-text-secondary, var(--secondary-text-color)) !important;
  }
`;

// styles inside the effect layer (own shadow root of wfc-animation-provider)
const effectsCss = `
  .cloud-track {
    opacity: var(--sbo-weather-cloud-opacity, 35%);
  }
`;

const createSheet = (cssText) => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  return sheet;
};

const defineSboWeatherCard = (baseCard) => {
  if (customElements.get(cardTag)) return;
  const graphiteSheet = createSheet(graphiteCss);
  const effectsSheet = createSheet(effectsCss);

  class SboWeatherCard extends baseCard {
    // original styles first, Graphite styles last so they win on equal specificity
    static get styles() {
      const baseStyles = super.styles;
      return [].concat(baseStyles || [], graphiteSheet);
    }

    setConfig(config) {
      super.setConfig(config);
      this.toggleAttribute("show-secondary-info", config?.show_secondary_info === true);
      this.toggleAttribute("sun-time-labels", config?.sun_time_labels === true);
    }

    // the effect layer is a separate element with its own shadow root:
    // add the effect styles after every render (the layer can be re-created)
    updated(changedProperties) {
      if (super.updated) super.updated(changedProperties);
      this.applyEffectStyles();
    }

    applyEffectStyles() {
      const effectLayer = this.renderRoot?.querySelector("wfc-animation-provider");
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

  customElements.define(cardTag, SboWeatherCard);
};

// hourly slot labels: with show_sun_times the original replaces the interval hour of the
// slot containing sunrise/sunset by that time (e.g. 7:47 instead of 8). Inside this card the
// interval hour is kept, the night detection stays active. Other weather cards are unaffected.
const headerItemsTag = "wfc-forecast-header-items";
const isInsideSboWeatherCard = (element) => {
  let node = element;
  for (let depth = 0; depth < 10 && node; depth++) {
    const host = node.getRootNode?.()?.host;
    if (!host) return false;
    if (host.localName === cardTag) return !host.hasAttribute("sun-time-labels");
    node = host;
  }
  return false;
};
const patchHeaderItems = (headerItemsClass) => {
  const proto = headerItemsClass?.prototype;
  if (!proto || typeof proto.getDateInfo !== "function" || proto.sboPatched) return;
  const originalGetDateInfo = proto.getDateInfo;
  proto.getDateInfo = function () {
    if (!isInsideSboWeatherCard(this)) return originalGetDateInfo.call(this);
    // suntimesInfo is a plain (non reactive) property: hide it for the label only
    const savedSuntimes = this.suntimesInfo;
    this.suntimesInfo = undefined;
    try {
      return originalGetDateInfo.call(this);
    } finally {
      this.suntimesInfo = savedSuntimes;
    }
  };
  proto.sboPatched = true;
};

// the original card may be loaded after this resource
customElements.whenDefined(baseTag).then(() => defineSboWeatherCard(customElements.get(baseTag)));
customElements.whenDefined(headerItemsTag).then(() => patchHeaderItems(customElements.get(headerItemsTag)));

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === cardTag)) {
  window.customCards.push({
    type: cardTag,
    name: "SBO Weather Card",
    description: "Weather Forecast Card im SBO-Graphite-Stil (benötigt die Weather Forecast Card aus HACS).",
    preview: true,
  });
}

console.info(`%c SBO-WEATHER-CARD %c ${sboWeatherCardVersion} `, "background:#f5c48a;color:#3a2410;font-weight:600", "");
