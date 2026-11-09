// graphite-effect: a light effect (or scene) as a tile filled with its color gradient, the name
// bottom left and the colors as small dots top right. The gradient is slightly desaturated and darkened
// so it sits calmly on the dark surface; the dots keep the true colors.
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
import { GraphiteEffectEditor } from "./graphite-effect-editor";
import { tileStyles } from "./tile-styles";

export interface EffectConfig extends GraphiteCardConfig {
  entity?: string;
  name?: string;
  colors: string[];
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const effectStyles = css`
  /* the tile grows with a long name, at least the compact tile height */
  .tile {
    display: flex;
    align-items: flex-end;
    height: auto;
    min-height: var(--graphite-tile-height-compact, 72px);
  }
  .gradient {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%),
      var(--effect-gradient);
    filter: saturate(var(--graphite-effect-saturation, 0.85)) brightness(var(--graphite-effect-brightness, 0.88));
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }
  /* name bottom left on the gradient, wraps instead of being cut off */
  .name {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    margin: var(--graphite-padding-tile, 12px) 14px 9px var(--graphite-padding-tile, 12px);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.1;
    color: #fff;
    white-space: normal;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  .dots {
    position: absolute;
    top: 9px;
    right: 9px;
    display: flex;
    pointer-events: none;
  }
  .dots span {
    width: 13px;
    height: 13px;
    margin-left: -2px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  }
`;

export class GraphiteEffect extends GraphiteCard<EffectConfig> {
  static styles = [tileStyles, effectStyles];

  private detachActions?: () => void;

  protected normalizeConfig(config: EffectConfig): EffectConfig {
    if (!Array.isArray(config.colors) || config.colors.length === 0) {
      throw new Error(`${this.localName}: 'colors' (list of colors) is required`);
    }
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = undefined;
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    fireAction(this, config, action);
  }

  protected render() {
    const config = this.config!;
    const colors = config.colors.map((color) => String(color).trim()).filter(Boolean);
    const name = config.name ?? "";
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    return html`<div class=${interactive ? "tile interactive" : "tile"} style=${`--effect-gradient: linear-gradient(90deg, ${colors
      .join(", ")})`} role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}
      aria-label=${name}><div class="gradient"></div>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div
      class="dots">${colors.map((color) => html`<span style=${`background: ${color}`}></span>`)}</div><div
      class="name">${name}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 3, rows: "auto", min_columns: 2 };
  }

  static getStubConfig(): Record<string, unknown> {
    return { name: "Sunset", colors: ["#ffb25c", "#ff7a3d", "#c2408f"] };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-effect-editor");
  }
}

registerElement("graphite-effect-editor", GraphiteEffectEditor);
registerCard("graphite-effect", GraphiteEffect, {
  name: "Graphite Effect",
  description: "Light effect or scene as a tile with its color gradient and color dots.",
});
