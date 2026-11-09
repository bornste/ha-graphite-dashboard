// graphite-legend: chart legend in the Graphite look – color scales (gradient bar with tick labels)
// and simple swatch items. Draws no frame of its own, so it sits directly in a graphite-panel.
// Static: the legend does not depend on any entity.
import { css, html, nothing, type TemplateResult } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HomeAssistant } from "../../core/types";
import { GraphiteLegendEditor } from "./graphite-legend-editor";

export interface LegendStop {
  value: number;
  color: string;
}

export interface LegendScale {
  name?: string;
  unit?: string;
  // ends of the bar (default: first and last stop)
  min?: number;
  max?: number;
  // same values as the chart's color_thresholds
  stops: LegendStop[];
  // labels under the bar (default: the stop values)
  ticks?: number[];
  // opacity of the whole bar
  opacity?: number;
}

export interface LegendItem {
  name?: string;
  color?: string;
  opacity?: number;
}

export interface LegendConfig extends GraphiteCardConfig {
  scales?: LegendScale[];
  items?: LegendItem[];
}

const legendStyles = css`
  :host {
    display: block;
  }
  .legend {
    display: flex;
    flex-direction: column;
    gap: var(--graphite-gap-panel, 16px);
  }
  /* scales side by side on wide panels, stacked on narrow ones */
  .scales {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--graphite-gap-panel, 16px) 40px;
  }
  .scaleHead {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 16px;
    color: var(--graphite-text-secondary, var(--secondary-text-color));
  }
  .unit {
    color: var(--graphite-text-muted, var(--secondary-text-color));
  }
  .bar {
    height: 8px;
    margin: 8px 0 6px;
    border-radius: var(--graphite-radius-pill, 999px);
  }
  .ticks {
    position: relative;
    height: 14px;
    font-size: 11px;
    line-height: 14px;
    color: var(--graphite-text-muted, var(--secondary-text-color));
    font-variant-numeric: tabular-nums;
  }
  .ticks span {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  /* the outermost labels stay inside the bar */
  .ticks span.start {
    transform: none;
  }
  .ticks span.end {
    transform: translateX(-100%);
  }
  .items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--graphite-gap-tile, 8px) 24px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 16px;
    color: var(--graphite-text-secondary, var(--secondary-text-color));
  }
  .item {
    display: inline-flex;
    align-items: center;
    gap: var(--graphite-gap-tile, 8px);
  }
  .swatch {
    width: 18px;
    height: 10px;
    border-radius: 3px;
    flex: none;
  }
`;

export class GraphiteLegend extends GraphiteCard<LegendConfig> {
  static styles = legendStyles;

  protected normalizeConfig(config: LegendConfig): LegendConfig {
    const scales = config.scales ?? [];
    const items = config.items ?? [];
    if (!Array.isArray(scales) || !Array.isArray(items)) throw new Error("scales and items must be lists");
    if (scales.some((scale) => !Array.isArray(scale.stops) || scale.stops.length === 0))
      throw new Error("every scale needs stops with value and color");
    return { ...config, scales, items };
  }

  // static legend: no re-render on state changes
  protected watchedEntities(): string[] {
    return [];
  }

  protected hassChanged(_hass: HomeAssistant | undefined): void {}

  private renderScale(scale: LegendScale): TemplateResult {
    const stops = [...scale.stops].sort((first, second) => first.value - second.value);
    const min = Number(scale.min ?? stops[0].value);
    const max = Number(scale.max ?? stops[stops.length - 1].value);
    const range = max - min || 1;
    const percentOf = (value: number) => Math.min(100, Math.max(0, ((value - min) / range) * 100));
    // colors interpolate between the stops like the chart's threshold gradient;
    // outside the first and last stop the edge colors continue
    const gradient = stops.map((stop) => `${stop.color} ${percentOf(stop.value).toFixed(2)}%`).join(", ");
    const opacity = scale.opacity !== undefined ? `; opacity: ${scale.opacity}` : "";
    const ticks = scale.ticks ?? [...new Set(stops.map((stop) => stop.value))];
    return html`
      <div class="scale">
        <div class="scaleHead"><span class="name">${scale.name ?? ""}</span><span class="unit">${scale.unit ?? ""}</span></div>
        <div class="bar" style="background: linear-gradient(to right, ${gradient})${opacity}"></div>
        <div class="ticks">
          ${ticks.map((value) => {
            const percent = percentOf(value);
            const edge = percent <= 2 ? "start" : percent >= 98 ? "end" : "";
            return html`<span class=${edge} style="left: ${percent}%">${value}</span>`;
          })}
        </div>
      </div>
    `;
  }

  private renderItem(item: LegendItem): TemplateResult {
    const color = item.color || "var(--graphite-accent, #f5c48a)";
    return html`
      <span class="item">
        <span class="swatch" style="background: ${color}; opacity: ${item.opacity ?? 1}"></span>
        <span class="name">${item.name ?? ""}</span>
      </span>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;
    const scales = this.config.scales ?? [];
    const items = this.config.items ?? [];
    return html`
      <div class="legend">
        ${scales.length ? html`<div class="scales">${scales.map((scale) => this.renderScale(scale))}</div>` : nothing}
        ${items.length ? html`<div class="items">${items.map((item) => this.renderItem(item))}</div>` : nothing}
      </div>
    `;
  }

  getCardSize(): number {
    return 2;
  }

  static getStubConfig(): Record<string, unknown> {
    return {
      scales: [{ name: "Temperature", unit: "°C", stops: [{ value: 15, color: "#5b9bd5" }, { value: 20, color: "#6fbf5a" }, { value: 28, color: "#f0a33c" }] }],
      items: [{ name: "Window open", color: "#f5c48a", opacity: 0.2 }],
    };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-legend-editor");
  }
}

registerElement("graphite-legend-editor", GraphiteLegendEditor);
registerCard("graphite-legend", GraphiteLegend, {
  name: "Graphite Legend",
  description: "Chart legend with color scales and swatch items in the Graphite look.",
});
