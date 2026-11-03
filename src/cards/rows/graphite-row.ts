// Base of graphite-status-row and graphite-switch-row: icon, name, "since" line, actions,
// unavailable and online handling. The subclasses add the value or the toggle on the right.
import { html, nothing, type TemplateResult } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { attachActionHandler, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { agoText, formatState, isUnavailable, sinceText } from "../../core/format";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { offlineDot } from "../../core/offline-dot";
import { rowStyles } from "./row-styles";

export interface DetailEntity {
  entity: string;
  label?: string;
}

export interface RowConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  since_line?: boolean;
  since_attribute?: string;
  since_attribute_label?: string;
  detail_entities?: Array<string | DetailEntity>;
  online_entity?: string;
  wall_switch?: boolean;
}

// states that count as "on" (tint, accent icon); numbers above 0 too, except measured values
const activeStates = ["on", "open", "opening", "closing", "home", "playing", "active", "running", "true"];
const onlineStates = ["home", "on", "online", "connected"];

export function isActiveState(state: string | undefined): boolean {
  if (state === undefined) return false;
  return activeStates.includes(state) || Number(state) > 0;
}

export abstract class GraphiteRow extends GraphiteCard<RowConfig> {
  static styles = rowStyles;

  private detachActions?: () => void;
  private refreshTimer?: number;

  // default actions of the row type
  protected abstract defaultActions(entity: string): { tap_action: ActionConfig; hold_action: ActionConfig };

  // content on the right: value (status row) or toggle (switch row)
  protected abstract renderEnd(stateObj: HassEntity | undefined, unavailable: boolean): TemplateResult | typeof nothing;

  protected normalizeConfig(config: RowConfig): RowConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { ...this.defaultActions(config.entity), ...config };
  }

  protected watchedEntities(): string[] {
    const config = this.config!;
    const entities = [config.entity];
    if (config.online_entity) entities.push(config.online_entity);
    for (const detail of config.detail_entities ?? []) entities.push(typeof detail === "string" ? detail : detail.entity);
    return entities;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // relative times ("seit 12 Min.") move on without state changes
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), 60000);
    // gestures are handled on the host: it survives re-renders and is re-attached whenever the card is
    // moved in the page (Home Assistant disconnects and reconnects cards, e.g. after closing a dialog)
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => hasAction(this.config?.double_tap_action),
    }, (action: ActionKind) => this.handleAction(action));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.refreshTimer);
    this.detachActions?.();
    this.detachActions = undefined;
  }

  // hand cursor, ripple and focus only when tapping does something; holding alone stays invisible.
  // An offline entity cannot be switched, so the row is not interactive then either.
  protected isInteractive(stateObj: HassEntity | undefined): boolean {
    const config = this.config!;
    if (this.unavailable(stateObj)) return false;
    return hasAction(config.tap_action) || hasAction(config.double_tap_action);
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    // offline: tap and double tap do nothing, holding still opens more-info
    if (action !== "hold" && this.unavailable(this.hass?.states[config.entity])) return;
    fireAction(this, config, action);
  }

  // whether the entity counts as unavailable (a wall switch lamp is "off" instead)
  protected unavailable(stateObj: HassEntity | undefined): boolean {
    return isUnavailable(stateObj) && !this.config!.wall_switch;
  }

  // text below the name: details while on, a timestamp attribute, or "<state> seit <time>"
  protected sinceLine(stateObj: HassEntity | undefined): string {
    const config = this.config!;
    if (!stateObj) return "";
    const offline = isUnavailable(stateObj);
    if (!offline && stateObj.state !== "off" && config.detail_entities?.length) {
      const details = config.detail_entities
        .map((detail) => {
          const entityId = typeof detail === "string" ? detail : detail.entity;
          const detailState = this.hass?.states[entityId];
          if (isUnavailable(detailState)) return "";
          const value = formatState(this.hass, detailState);
          return typeof detail !== "string" && detail.label ? `${detail.label} ${value}` : value;
        })
        .filter(Boolean)
        .join(" · ");
      if (details) return details;
    }
    if (config.since_attribute && !offline) {
      const label = config.since_attribute_label || this.localize("rows.triggeredDefault");
      const moment = stateObj.attributes?.[config.since_attribute] ? new Date(stateObj.attributes[config.since_attribute]) : null;
      return moment && !Number.isNaN(moment.getTime())
        ? this.localize("rows.attributeAgo", { label, ago: agoText(moment, this.language) })
        : this.localize("rows.never", { label });
    }
    const isMeasurement = !!stateObj.attributes?.unit_of_measurement;
    const showSince = typeof config.since_line === "boolean" ? config.since_line : !isMeasurement;
    if (!offline && !showSince) return "";
    const stateText = offline
      ? this.localize(config.wall_switch ? "rows.wallSwitchOff" : "rows.unavailable")
      : formatState(this.hass, stateObj).toLowerCase();
    return this.localize("rows.since", { state: stateText, since: sinceText(new Date(stateObj.last_changed), this.language) });
  }

  // classes of the row: active tint, on (toggle), unavailable, online status
  protected rowClasses(stateObj: HassEntity | undefined): string[] {
    const config = this.config!;
    const classes = ["row"];
    if (this.isInteractive(stateObj)) classes.push("interactive");
    if (this.unavailable(stateObj)) classes.push("unavailable");
    if (stateObj?.state === "on") classes.push("on");
    if (config.online_entity && stateObj?.state === "on") {
      const online = onlineStates.includes(String(this.hass?.states[config.online_entity]?.state || "").toLowerCase());
      classes.push(online ? "online" : "connecting");
    }
    return classes;
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const icon = this.config!.icon;
    if (icon || !customElements.get("ha-state-icon")) {
      return html`<ha-icon .icon=${icon || stateObj?.attributes?.icon || "mdi:help-circle-outline"}></ha-icon>`;
    }
    return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.hass?.states[config.entity];
    const unavailable = this.unavailable(stateObj);
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    const since = this.sinceLine(stateObj);
    const interactive = this.isInteractive(stateObj);
    return html`<div class=${this.rowClasses(stateObj).join(" ")} role=${interactive ? "button" : nothing}
      tabindex=${interactive ? "0" : nothing}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div
      class="icon">${this.renderIcon(stateObj)}</div><div class="text"><div class="name">${name}</div>${since
      ? html`<div class="since">${since}</div>` : nothing}</div>${this.renderEnd(stateObj, unavailable)}<div
      class="offline">${offlineDot}<span>${this.localize("rows.offline")}</span></div></div>`;
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }
}
