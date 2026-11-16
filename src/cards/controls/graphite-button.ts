// graphite-button: a plain button for any action (start a script, reload the themes, navigate,
// toggle something), as a tile, a row or a compact icon button like the panel header buttons.
// Optional: "active" fills it in the accent while a condition is met (a lamp in its own colour),
// "busy" shows a spinner while the entity is on (e.g. a running script).
import { css, html, nothing, type CSSResultGroup } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { matchesCondition, type ValueCondition } from "../../core/conditions";
import { isUnavailable } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { lampColor, lampTextColor } from "../../core/lamp-color";
import { offlineDot } from "../../core/offline-dot";
import { registerCard, registerElement } from "../../core/register";
import { spinnerStyles } from "../../core/spinner";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { rowStyles } from "../rows/row-styles";
import { tileStyles } from "../tiles/tile-styles";
import { GraphiteButtonEditor } from "./graphite-button-editor";

export type ButtonLayout = "tile" | "row" | "icon";

export interface ButtonConfig extends GraphiteCardConfig {
  layout?: ButtonLayout;
  entity?: string;
  name?: string;
  icon?: string;
  active?: ValueCondition;
  busy?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const layouts: ButtonLayout[] = ["tile", "row", "icon"];

// domains that are started rather than switched: the service the button calls by default
const startServices: Record<string, string> = {
  script: "script.turn_on",
  scene: "scene.turn_on",
  button: "button.press",
  input_button: "input_button.press",
  automation: "automation.trigger",
};
const toggleDomains = ["light", "switch", "input_boolean", "fan", "siren", "humidifier", "media_player", "cover", "climate"];

export function buttonLayoutOf(config: { layout?: string } | undefined): ButtonLayout {
  return layouts.includes(config?.layout as ButtonLayout) ? config!.layout as ButtonLayout : "tile";
}

// default tap: start scripts, scenes, buttons and automations, toggle what can be switched,
// otherwise more-info; without an entity nothing
export function defaultButtonAction(entity?: string): ActionConfig {
  if (!entity) return { action: "none" };
  const domain = entity.split(".")[0];
  const service = startServices[domain];
  if (service) return { action: "perform-action", perform_action: service, target: { entity_id: entity } };
  return toggleDomains.includes(domain) ? { action: "toggle" } : { action: "more-info" };
}

const buttonTileStyles = css`
  /* icon top left, where a switch tile has its toggle; name bottom left */
  .icon {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: var(--graphite-padding-tile, 12px);
    display: flex;
    color: var(--graphite-text-secondary);
    pointer-events: none;
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .tile.on .icon {
    color: var(--graphite-state-text, var(--graphite-accent));
  }
  /* long names wrap to a second line (like the labels of graphite-image and graphite-effect),
     longer ones end with an ellipsis */
  .name {
    white-space: normal;
    line-height: 1.15;
    overflow-wrap: break-word;
    hyphens: auto;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  .tile.busy {
    background: color-mix(in srgb, var(--graphite-accent) 12%, var(--graphite-surface-tile-active));
  }
  .tile.unavailable .icon {
    opacity: 0.4;
  }
  .spinner {
    top: 12px;
    right: 12px;
  }
  ha-ripple {
    z-index: 1;
  }
`;

const buttonRowStyles = css`
  .row.busy {
    background: color-mix(in srgb, var(--graphite-accent) 12%, var(--graphite-surface-tile-active));
  }
  .spinner {
    position: relative;
    flex: none;
    margin: 0 18px 0 12px;
  }
`;

// compact icon button, the same as the header buttons of graphite-panel (44 x 36)
const iconButtonStyles = css`
  :host {
    display: block;
  }
  .button {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 36px;
    border-radius: var(--graphite-radius-tile, 12px);
    background: var(--graphite-surface-tile);
    color: var(--graphite-text-secondary);
    -webkit-tap-highlight-color: transparent;
    outline: none;
    --mdc-icon-size: 18px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .button.interactive {
    cursor: pointer;
  }
  .button.interactive:focus-visible {
    outline: 2px solid var(--graphite-accent);
    outline-offset: 2px;
  }
  .button.on {
    background: var(--graphite-state-color, var(--graphite-accent));
    color: var(--graphite-state-ink, var(--graphite-accent-ink));
  }
  .button.unavailable {
    opacity: 0.4;
  }
  .spinner {
    position: relative;
  }
`;

const tileLayout = [tileStyles, spinnerStyles, buttonTileStyles];
const rowLayout = [rowStyles, spinnerStyles, buttonRowStyles];
const iconLayout = [spinnerStyles, iconButtonStyles];

export class GraphiteButton extends GraphiteCard<ButtonConfig> {
  static styles: CSSResultGroup = [];

  private detachActions?: () => void;

  protected stylesForConfig() {
    const layout = buttonLayoutOf(this.config);
    return layout === "row" ? rowLayout : layout === "icon" ? iconLayout : tileLayout;
  }

  protected normalizeConfig(config: ButtonConfig): ButtonConfig {
    if (config.layout !== undefined && !layouts.includes(config.layout)) {
      throw new Error(`graphite-button: layout must be one of ${layouts.join(", ")}`);
    }
    return { tap_action: defaultButtonAction(config.entity), hold_action: defaultHoldAction(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config;
    return [config?.entity, config?.active?.entity].filter((entity): entity is string => !!entity);
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

  // active while the condition is met; without its own entity the condition checks the button's entity
  private isActive(stateObj: HassEntity | undefined): boolean {
    const active = this.config?.active;
    if (!active) return false;
    const state = active.entity ? this.hass?.states[active.entity]?.state : stateObj?.state;
    return matchesCondition(active, state);
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const icon = this.config!.icon;
    if (icon || !stateObj || !customElements.get("ha-state-icon")) {
      return html`<ha-icon .icon=${icon || stateObj?.attributes?.icon || "mdi:gesture-tap-button"}></ha-icon>`;
    }
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }

  protected render() {
    const config = this.config!;
    const layout = buttonLayoutOf(config);
    const stateObj = config.entity ? this.hass?.states[config.entity] : undefined;
    const unavailable = !!config.entity && isUnavailable(stateObj);
    const active = !unavailable && this.isActive(stateObj);
    const busy = !!config.busy && stateObj?.state === "on";
    const interactive = !unavailable && (hasAction(config.tap_action) || hasAction(config.double_tap_action));
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity ?? "";
    // an active lamp shows its own colour instead of the accent
    const color = active ? lampColor(stateObj) : undefined;
    // (the icon button is filled with it: its icon then gets a dark shade of the lamp colour)
    const style = color
      ? `--graphite-state-color: ${color}; --graphite-state-text: ${lampTextColor(color)}; --graphite-state-ink: color-mix(in srgb, ${color} 25%, #000000)`
      : "";
    const root = layout === "icon" ? "button" : layout;
    const classes = [root, active ? "on active" : "", busy ? "busy" : "", unavailable ? "unavailable" : "",
      interactive ? "interactive" : ""].filter(Boolean).join(" ");
    const ripple = interactive ? html`<ha-ripple></ha-ripple>` : nothing;
    const spinner = busy ? html`<div class="spinner"></div>` : nothing;
    const offline = html`<div class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div>`;

    if (layout === "icon") {
      return html`<div class=${classes} style=${style} role=${interactive ? "button" : nothing}
        tabindex=${interactive ? "0" : nothing} title=${name} aria-label=${name}>${ripple}${busy
        ? spinner : this.renderIcon(stateObj)}</div>`;
    }
    if (layout === "row") {
      return html`<div class=${classes} style=${style} role=${interactive ? "button" : nothing}
        tabindex=${interactive ? "0" : nothing} aria-label=${name}>${ripple}<div class="icon">${this.renderIcon(stateObj)}</div><div
        class="text"><div class="name">${name}</div></div>${spinner}${offline}</div>`;
    }
    return html`<div class=${classes} style=${style} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing} aria-label=${name}>${ripple}<div class="icon">${this.renderIcon(stateObj)}</div><div
      class="name">${name}</div>${spinner}${offline}</div>`;
  }

  getCardSize(): number {
    return buttonLayoutOf(this.config) === "tile" ? 2 : 1;
  }

  getGridOptions() {
    const layout = buttonLayoutOf(this.config);
    if (layout === "icon") return { columns: 2, rows: 1, min_columns: 1 };
    if (layout === "row") return { columns: 12, rows: "auto", min_columns: 3 };
    return { columns: 3, rows: 2, min_columns: 2 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("script.")) ?? "";
    return entity ? { entity, busy: true } : { name: "Button", icon: "mdi:gesture-tap-button" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-button-editor");
  }
}

registerElement("graphite-button-editor", GraphiteButtonEditor);
registerCard("graphite-button", GraphiteButton, {
  name: "Graphite Button",
  description: "A plain button for any action: tile, row or compact icon button; optional active state and busy spinner.",
});
