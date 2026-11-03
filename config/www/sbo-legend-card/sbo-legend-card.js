/*
 * sbo-legend-card
 * Chart legend in the Graphite style: color scales (gradient bar with tick labels) and
 * simple swatch items. Draws no frame of its own, so it sits directly on an sbo-panel-card.
 *
 * Config:
 *   type: custom:sbo-legend-card
 *   scales:
 *     - name: Temperatur
 *       unit: °C
 *       min: -5            # left end of the bar (default: first stop)
 *       max: 35            # right end of the bar (default: last stop)
 *       stops:             # same values as the chart's color_thresholds
 *         - { value: 0, color: "#9b7bd4" }
 *         - { value: 15, color: "#5b9bd5" }
 *       ticks: [0, 15]     # labels under the bar (default: the stop values)
 *       opacity: 0.6       # optional, opacity of the whole color bar (default 1)
 *   items:
 *     - name: Fenster / Tür offen
 *       color: "#f5c48a"
 *       opacity: 0.2       # optional, swatch opacity (default 1)
 */
const sboLegendCardVersion = "0.1.1";

const legendStyles = `
  :host { display: block; }
  .legend {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  /* scales side by side on wide panels, stacked on narrow ones */
  .scales {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px 40px;
  }
  .scales:empty { display: none; }
  .scaleHead {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    line-height: 16px;
    color: var(--sbo-text-secondary, var(--secondary-text-color));
  }
  .unit { color: var(--sbo-text-muted, var(--secondary-text-color)); }
  .bar {
    height: 8px;
    margin: 8px 0 6px;
    border-radius: 999px;
  }
  .ticks {
    position: relative;
    height: 14px;
    font-size: 11px;
    line-height: 14px;
    color: var(--sbo-text-muted, var(--secondary-text-color));
    font-variant-numeric: tabular-nums;
  }
  .ticks span {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  /* the outermost labels stay inside the bar */
  .ticks span.start { transform: none; }
  .ticks span.end { transform: translateX(-100%); }
  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    font-size: 13px;
    line-height: 16px;
    color: var(--sbo-text-secondary, var(--secondary-text-color));
  }
  .items:empty { display: none; }
  .item { display: inline-flex; align-items: center; gap: 8px; }
  .swatch {
    width: 18px;
    height: 10px;
    border-radius: 3px;
    flex: none;
  }
`;

class SboLegendCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    const scales = config?.scales || [];
    const items = config?.items || [];
    if (!Array.isArray(scales) || !Array.isArray(items)) {
      throw new Error("sbo-legend-card: 'scales' and 'items' must be lists");
    }
    for (const scale of scales) {
      if (!Array.isArray(scale.stops) || scale.stops.length === 0) {
        throw new Error("sbo-legend-card: every scale needs 'stops' with value and color");
      }
    }
    this.config = { ...config, scales, items };
    this.render();
  }

  // hass is not needed: the legend is static
  set hass(hass) {}

  render() {
    this.shadowRoot.innerHTML = `
      <style>${legendStyles}</style>
      <div class="legend">
        <div class="scales"></div>
        <div class="items"></div>
      </div>`;
    const scalesElement = this.shadowRoot.querySelector(".scales");
    for (const scale of this.config.scales) scalesElement.append(this.buildScale(scale));
    const itemsElement = this.shadowRoot.querySelector(".items");
    for (const item of this.config.items) itemsElement.append(this.buildItem(item));
  }

  buildScale(scale) {
    const stops = [...scale.stops].sort((first, second) => first.value - second.value);
    const min = Number(scale.min ?? stops[0].value);
    const max = Number(scale.max ?? stops[stops.length - 1].value);
    const range = max - min || 1;
    const percentOf = (value) => Math.min(100, Math.max(0, ((value - min) / range) * 100));

    const element = document.createElement("div");
    element.className = "scale";
    element.innerHTML = `
      <div class="scaleHead"><span class="name"></span><span class="unit"></span></div>
      <div class="bar"></div>
      <div class="ticks"></div>`;
    element.querySelector(".name").textContent = scale.name || "";
    element.querySelector(".unit").textContent = scale.unit || "";

    // colors interpolate between the stops, like the chart's threshold gradient;
    // outside the first and last stop the edge colors continue
    const gradientStops = stops.map((stop) => `${stop.color} ${percentOf(stop.value).toFixed(2)}%`);
    const bar = element.querySelector(".bar");
    bar.style.background = `linear-gradient(to right, ${gradientStops.join(", ")})`;
    // the opacity applies to the whole bar, not to single stops
    if (scale.opacity !== undefined) bar.style.opacity = String(scale.opacity);

    const tickValues = scale.ticks || [...new Set(stops.map((stop) => stop.value))];
    const ticksElement = element.querySelector(".ticks");
    for (const value of tickValues) {
      const percent = percentOf(value);
      const tick = document.createElement("span");
      tick.textContent = String(value);
      tick.style.left = `${percent}%`;
      if (percent <= 2) tick.classList.add("start");
      if (percent >= 98) tick.classList.add("end");
      ticksElement.append(tick);
    }
    return element;
  }

  buildItem(item) {
    const element = document.createElement("span");
    element.className = "item";
    element.innerHTML = `<span class="swatch"></span><span class="name"></span>`;
    const swatch = element.querySelector(".swatch");
    swatch.style.background = item.color || "var(--sbo-accent, #f5c48a)";
    swatch.style.opacity = String(item.opacity ?? 1);
    element.querySelector(".name").textContent = item.name || "";
    return element;
  }

  getCardSize() {
    return 2;
  }

  static getStubConfig() {
    return {
      scales: [{ name: "Temperatur", unit: "°C", stops: [{ value: 15, color: "#5b9bd5" }, { value: 20, color: "#6fbf5a" }, { value: 28, color: "#f0a33c" }] }],
      items: [{ name: "Fenster offen", color: "#f5c48a", opacity: 0.2 }],
    };
  }
}

if (!customElements.get("sbo-legend-card")) customElements.define("sbo-legend-card", SboLegendCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "sbo-legend-card")) {
  window.customCards.push({
    type: "sbo-legend-card",
    name: "SBO Legend Card",
    description: "Chart legend with color scales and swatch items in the Graphite style.",
  });
}
console.info(`%c SBO-LEGEND-CARD %c ${sboLegendCardVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
