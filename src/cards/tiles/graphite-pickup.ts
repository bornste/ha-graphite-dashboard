// graphite-pickup: next waste collection of a calendar entity in the label layout: a colored
// stripe, the name, the day as value ("Morgen", "Mi 12.") and a hint on the right. Due (today or
// tomorrow): soft accent tint like an active switch tile.
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { GraphiteCard } from "../../core/graphite-card";
import { nextPickup, type NextPickup } from "../../core/pickup";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphitePickupEditor } from "./graphite-pickup-editor";
import { labelStyles } from "./label-styles";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface PickupConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
  drop_after?: string;
  lookahead_days?: number;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

const refreshInterval = 15 * 60 * 1000;

const pickupStyles = css`
  .tile.due {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.due .name {
    color: var(--graphite-text-primary);
  }
  .tile.due .secondary {
    color: var(--graphite-accent);
  }
  .tile.due .meter-icon {
    opacity: 0.3;
  }
`;

export class GraphitePickup extends GraphiteCard<PickupConfig> {
  static styles = [tileStyles, meterStyles, labelStyles, pickupStyles];

  private detachActions?: () => void;
  private refreshTimer?: number;

  protected normalizeConfig(config: PickupConfig): PickupConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
    // the day moves on without state changes (midnight, the drop time, the 30-minute calendar refresh)
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), refreshInterval);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachActions?.();
    this.detachActions = undefined;
    window.clearInterval(this.refreshTimer);
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    fireAction(this, config, action);
  }

  private next(): NextPickup | null {
    const config = this.config!;
    if (!this.hass) return null;
    const lookahead = Number(config.lookahead_days) > 0 ? Number(config.lookahead_days) : 40;
    return nextPickup(this.hass, config.entity, lookahead, config.drop_after, () => this.requestUpdate());
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const icon = this.config!.icon
      ? html`<ha-icon .icon=${this.config!.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class="meter-icon">${icon}</div>`;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.hass?.states[config.entity];
    const next = this.next();
    let value = "–";
    let secondary = "";
    if (next?.days === 0) {
      value = this.localize("pickup.today");
      secondary = this.localize("pickup.todayHint");
    } else if (next?.days === 1) {
      value = this.localize("pickup.tomorrow");
      secondary = this.localize("pickup.tomorrowHint");
    } else if (next) {
      const weekday = next.date.toLocaleDateString(this.language, { weekday: "short" }).replace(".", "");
      value = this.localize("pickup.date", { weekday, day: next.date.getDate() });
      secondary = this.localize("pickup.inDays", { days: next.days });
    }
    const due = !!next && next.days <= 1;
    const name = config.name ?? stateObj?.attributes?.message ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", config.color ? "" : "no-stripe", due ? "due" : "", interactive ? "interactive" : ""]
      .filter(Boolean).join(" ");
    return html`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : nothing}
      role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${this.renderIcon(stateObj)}${config.color ? html`<div class="stripe"></div>` : nothing}<div
      class="name">${name}</div><div class="value-row"><div class=${next ? "value text" : "value"}>${value}</div>${secondary
      ? html`<div class="secondary">${secondary}</div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("calendar.")) ?? "";
    return { entity, color: "#9aa3ad" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-pickup-editor");
  }
}

registerElement("graphite-pickup-editor", GraphitePickupEditor);
registerCard("graphite-pickup", GraphitePickup, {
  name: "Graphite Pickup",
  description: "Next waste collection of a calendar entity; today and tomorrow are highlighted.",
});
