// graphite-scene: a scene as a tile (64px, --graphite-tile-height-scene). Inactive: a short stripe in
// the scene colors, the name and the icon as watermark; active (e.g. an input_select names the scene):
// the tile is filled with the color gradient, text and icon turn dark or white depending on the colors.
// Tapping activates the scene, holding opens more-info.
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { matchesCondition, type ValueCondition } from "../../core/conditions";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
// the stripe of the label layout (28 x 4px, 12px from the left, 10px from the top)
import { labelStyles } from "./label-styles";
import { tileStyles } from "./tile-styles";
import { GraphiteSceneEditor } from "./graphite-scene-editor";

export interface SceneConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  colors?: string[];
  active?: ValueCondition;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const sceneStyles = css`
  .tile.scene {
    height: var(--graphite-tile-height-scene, 64px);
  }
  .tile.scene .stripe {
    background: var(--scene-gradient, var(--graphite-accent));
  }
  /* active: the whole tile in the scene colors */
  .tile.scene.active {
    background: var(--scene-gradient, var(--graphite-accent));
  }
  .tile.scene.active .name {
    font-weight: 500;
    color: var(--scene-ink);
  }
  .tile.scene.active .stripe {
    background: color-mix(in srgb, var(--scene-ink) 60%, transparent);
  }
  .tile.scene.active .watermark {
    color: var(--scene-ink);
    opacity: 0.3;
  }
`;

// relative luminance of a hex color (0..1); null for other notations
function luminanceOf(color: string): number | null {
  const hex = color.trim().replace("#", "");
  if (hex.length !== 6) return null;
  const channels = [0, 2, 4].map((start) => parseInt(hex.substring(start, start + 2), 16) / 255);
  if (channels.some((channel) => Number.isNaN(channel))) return null;
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export class GraphiteScene extends GraphiteCard<SceneConfig> {
  static styles = [tileStyles, labelStyles, sceneStyles];

  private detachActions?: () => void;

  protected normalizeConfig(config: SceneConfig): SceneConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    const tapAction: ActionConfig = config.entity.startsWith("scene.")
      ? { action: "perform-action", perform_action: "scene.turn_on", target: { entity_id: config.entity } }
      : { action: "more-info" };
    return { tap_action: tapAction, hold_action: defaultHoldAction(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config!;
    return config.active?.entity ? [config.entity, config.active.entity] : [config.entity];
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
    const stateObj = this.hass?.states[config.entity];
    const colors = (Array.isArray(config.colors) ? config.colors : []).map((color) => String(color).trim()).filter(Boolean);
    const gradient = colors.length > 1 ? `linear-gradient(90deg, ${colors.join(", ")})` : colors[0] ?? "";
    // text on the filled tile: dark on bright colors, white on dark ones
    const luminances = colors.map(luminanceOf).filter((value): value is number => value !== null);
    const average = luminances.length ? luminances.reduce((sum, value) => sum + value, 0) / luminances.length : 0;
    const ink = average > 0.35 ? "#2a1a0c" : "#ffffff";
    const activeState = config.active?.entity ? this.hass?.states[config.active.entity]?.state : stateObj?.state;
    const active = matchesCondition(config.active, activeState);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "scene", active ? "active" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    const style = [gradient ? `--scene-gradient: ${gradient}` : "", `--scene-ink: ${ink}`].filter(Boolean).join("; ");
    const icon = config.icon
      ? html`<ha-icon .icon=${config.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class=${classes} style=${style} role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}
      aria-label=${name} aria-pressed=${active ? "true" : "false"}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div
      class="stripe"></div><div class="watermark">${icon}</div><div class="name">${name}</div></div>`;
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions() {
    return { columns: 3, rows: "auto", min_columns: 2 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("scene.")) ?? "";
    return { entity, colors: ["#f5c48a", "#e89a5c", "#c9733f"] };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-scene-editor");
  }
}

registerElement("graphite-scene-editor", GraphiteSceneEditor);
registerCard("graphite-scene", GraphiteScene, {
  name: "Graphite Scene",
  description: "Scene as a tile: color stripe and watermark, filled with the scene colors while active.",
});
