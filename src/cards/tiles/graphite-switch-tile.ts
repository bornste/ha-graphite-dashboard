// graphite-switch-tile: tile with a toggle top left, name bottom left and the icon as watermark;
// tapping the tile switches the entity. Optional online_entity shows whether the device behind
// the switch is reachable.
import { html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { isUnavailable } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteSwitchTileEditor } from "./graphite-switch-tile-editor";
import { tileStyles } from "./tile-styles";

export interface SwitchTileConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  online_entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const onlineStates = ["home", "on", "online", "connected"];

export class GraphiteSwitchTile extends GraphiteCard<SwitchTileConfig> {
  static styles = tileStyles;

  private detachActions?: () => void;

  protected normalizeConfig(config: SwitchTileConfig): SwitchTileConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "toggle" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config!;
    return config.online_entity ? [config.entity, config.online_entity] : [config.entity];
  }

  connectedCallback(): void {
    super.connectedCallback();
    // gestures on the host (survives re-renders and the reconnect after closing a dialog)
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

  private get stateObj(): HassEntity | undefined {
    return this.hass?.states[this.config!.entity];
  }

  // an offline device cannot be switched: tap and double tap do nothing, holding still opens more-info
  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    if (action !== "hold" && isUnavailable(this.stateObj)) return;
    fireAction(this, config, action);
  }

  private isInteractive(unavailable: boolean): boolean {
    const config = this.config!;
    return !unavailable && (hasAction(config.tap_action) || hasAction(config.double_tap_action));
  }

  private tileClasses(stateObj: HassEntity | undefined, unavailable: boolean, interactive: boolean): string {
    const config = this.config!;
    const classes = ["tile"];
    if (interactive) classes.push("interactive");
    if (unavailable) classes.push("unavailable");
    else if (stateObj?.state === "on") {
      classes.push("on");
      if (config.online_entity) {
        const online = onlineStates.includes(String(this.hass?.states[config.online_entity]?.state || "").toLowerCase());
        classes.push(online ? "online" : "connecting");
      }
    }
    return classes.join(" ");
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const icon = this.config!.icon;
    if (icon || !customElements.get("ha-state-icon")) {
      return html`<ha-icon .icon=${icon || stateObj?.attributes?.icon || "mdi:toggle-switch-outline"}></ha-icon>`;
    }
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.stateObj;
    const unavailable = isUnavailable(stateObj);
    const interactive = this.isInteractive(unavailable);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    return html`<div class=${this.tileClasses(stateObj, unavailable, interactive)} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div
      class="watermark">${this.renderIcon(stateObj)}</div><div class="toggle"></div><div class="name">${name}</div><div
      class="offline"><ha-icon icon="mdi:wifi-off"></ha-icon><span>${this.localize("rows.offline")}</span></div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 3, rows: 2, min_columns: 2 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("switch.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-switch-tile-editor");
  }
}

registerElement("graphite-switch-tile-editor", GraphiteSwitchTileEditor);
registerCard("graphite-switch-tile", GraphiteSwitchTile, {
  name: "Graphite Switch Tile",
  description: "Tile with toggle, name and watermark icon; tapping the tile switches. Optional online status.",
});
