// graphite-battery: all battery sensors grouped by urgency, one panel per group: empty or offline,
// critical, replace soon and a collapsible "in order" panel. The list is built from every sensor with
// device_class battery (minus an exclude label), so new devices appear by themselves. Tapping a
// battery opens more-info.
import { html, nothing, type TemplateResult } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HassEntity } from "../../core/types";
import { batteryStyles } from "./battery-styles";
import { GraphiteBatteryEditor } from "./graphite-battery-editor";

export interface BatteryConfig extends GraphiteCardConfig {
  // below this level a battery is critical (accent)
  critical?: number;
  // below this level a battery should be replaced soon
  low?: number;
  // label id; sensors with this label are left out
  exclude_label?: string;
  exclude?: string[];
  // display names per sensor (default: device name)
  names?: Record<string, string>;
  // "in order" starts collapsed
  collapsed?: boolean;
}

interface Battery {
  entityId: string;
  name: string;
  area: string;
  level: number | null;
  offline: boolean;
  changed: string;
}

type BatteryKind = "offline" | "critical" | "low";

const offlineStates = ["unavailable", "unknown"];
const nameSuffixes = [" batterie", " battery", " batteriestand"];
const refreshMilliseconds = 60000;

// registry entries of the frontend (only what the card reads)
interface Registries {
  entities?: Record<string, { device_id?: string; area_id?: string; labels?: string[]; hidden?: boolean }>;
  devices?: Record<string, { name?: string; name_by_user?: string; area_id?: string }>;
  areas?: Record<string, { name?: string }>;
}

export class GraphiteBattery extends GraphiteCard<BatteryConfig> {
  static properties = {
    ...GraphiteCard.properties,
    expanded: { state: true },
  };

  static styles = batteryStyles;

  declare expanded?: boolean;

  private refreshTimer?: number;

  protected normalizeConfig(config: BatteryConfig): BatteryConfig {
    if (this.expanded === undefined) this.expanded = config.collapsed === false;
    return config;
  }

  // every battery sensor (the offline age is refreshed by the timer)
  protected watchedEntities(): string[] {
    return this.batteries().map((battery) => battery.entityId);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // "no report for …" counts up without state changes
    this.refreshTimer = window.setInterval(() => this.requestUpdate(), refreshMilliseconds);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.refreshTimer);
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.localize(`battery.${key}`, params);
  }

  // every battery sensor that is not excluded, with name, area and level
  private batteries(): Battery[] {
    const hass = this.hass;
    const config = this.config;
    if (!hass || !config) return [];
    const registries = hass as unknown as Registries;
    const excluded = new Set(config.exclude ?? []);
    const excludeLabel = config.exclude_label ?? "exclude";
    return Object.entries(hass.states).flatMap(([entityId, stateObj]): Battery[] => {
      if (!entityId.startsWith("sensor.") || stateObj.attributes.device_class !== "battery") return [];
      if (excluded.has(entityId)) return [];
      const entry = registries.entities?.[entityId];
      if (entry?.hidden) return [];
      if (excludeLabel && (entry?.labels ?? []).includes(excludeLabel)) return [];
      const device = entry?.device_id ? registries.devices?.[entry.device_id] : undefined;
      const areaId = entry?.area_id || device?.area_id;
      const offline = offlineStates.includes(stateObj.state);
      const level = offline ? NaN : Number(stateObj.state);
      return [{
        entityId,
        name: config.names?.[entityId] || this.defaultName(stateObj, device?.name_by_user || device?.name),
        area: areaId ? registries.areas?.[areaId]?.name || "" : "",
        level: Number.isFinite(level) ? Math.round(level) : null,
        offline: offline || level === 0,
        changed: stateObj.last_changed,
      }];
    });
  }

  // device name without vendor details in brackets, otherwise the entity name without "Battery"
  private defaultName(stateObj: HassEntity, deviceName?: string): string {
    if (deviceName) {
      const trimmed = deviceName.trim();
      const bracket = trimmed.endsWith(")") ? trimmed.lastIndexOf("(") : -1;
      return bracket > 0 ? trimmed.slice(0, bracket).trim() : trimmed;
    }
    const name = String(stateObj.attributes.friendly_name || stateObj.entity_id);
    const suffix = nameSuffixes.find((ending) => name.toLowerCase().endsWith(ending));
    return suffix ? name.slice(0, name.length - suffix.length) : name;
  }

  private age(timestamp: string): string {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000));
    if (minutes < 60) return this.t("minutes", { count: minutes });
    const hours = Math.round(minutes / 60);
    if (hours < 48) return this.t("hours", { count: hours });
    return this.t("days", { count: Math.round(hours / 24) });
  }

  private moreInfo(entityId: string, event?: KeyboardEvent): void {
    if (event && event.key !== "Enter" && event.key !== " ") return;
    event?.preventDefault();
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  private renderRow(battery: Battery, kind: BatteryKind): TemplateResult {
    const empty = battery.level === 0;
    const sub = kind === "offline" ? (empty ? this.t("empty") : this.t("noReport", { time: this.age(battery.changed) })) : battery.area;
    const value = kind === "offline"
      ? (empty ? this.t("empty") : this.t("offline"))
      : html`${battery.level}<small>%</small>`;
    const barColor = { offline: "var(--danger)", critical: "var(--accent)", low: "var(--textSecondary)" }[kind];
    return html`
      <div class="row ${kind}" role="button" tabindex="0"
        @click=${() => this.moreInfo(battery.entityId)} @keydown=${(event: KeyboardEvent) => this.moreInfo(battery.entityId, event)}>
        <ha-ripple></ha-ripple>
        <div class="name">${battery.name}</div>
        <div class="sub">${sub}</div>
        <div class="value">${value}</div>
        <div class="track" style="--level: ${battery.level ?? 0}%; --barColor: ${barColor}"><span></span></div>
      </div>
    `;
  }

  private renderPanel(title: string, info: string, color: string, batteries: Battery[], kind: BatteryKind): TemplateResult | typeof nothing {
    if (!batteries.length) return nothing;
    return html`
      <div class="panel">
        <div class="header" style="--labelColor: ${color}"><i></i><span class="title">${title}</span><span class="info">${info}</span></div>
        <div class="rows">${batteries.map((battery) => this.renderRow(battery, kind))}</div>
      </div>
    `;
  }

  private renderOk(batteries: Battery[]): TemplateResult | typeof nothing {
    if (!batteries.length) return nothing;
    const expanded = !!this.expanded;
    return html`
      <div class="panel">
        <button class="header" style="--labelColor: var(--success)" aria-expanded=${expanded ? "true" : "false"}
          @click=${() => { this.expanded = !this.expanded; }}>
          <i></i><span class="title">${this.t("okTitle")}</span>
          <span class="info">${this.t("okInfo", { count: batteries.length, lowest: batteries[0].level ?? 0 })}</span>
          <ha-icon icon="mdi:chevron-down"></ha-icon>
        </button>
        <div class="compact" ?hidden=${!expanded}>
          ${batteries.map((battery) => html`
            <div class="item" role="button" tabindex="0"
              @click=${() => this.moreInfo(battery.entityId)} @keydown=${(event: KeyboardEvent) => this.moreInfo(battery.entityId, event)}>
              <ha-ripple></ha-ripple>
              <div class="name">${battery.name}</div>
              <div class="value">${battery.level} %</div>
              <div class="track" style="--level: ${battery.level}%"><span></span></div>
            </div>`)}
        </div>
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config || !this.hass) return nothing;
    const all = this.batteries();
    const critical = Number(this.config.critical ?? 20);
    const low = Number(this.config.low ?? 40);
    const offline = all.filter((battery) => battery.offline);
    const levelled = all
      .filter((battery) => !battery.offline && battery.level !== null)
      .sort((first, second) => first.level! - second.level! || first.name.localeCompare(second.name));
    const criticalList = levelled.filter((battery) => battery.level! < critical);
    const lowList = levelled.filter((battery) => battery.level! >= critical && battery.level! < low);
    const okList = levelled.filter((battery) => battery.level! >= low);
    return html`
      <ha-card>
        ${all.length
          ? html`
            ${this.renderPanel(this.t("offlineTitle"), String(offline.length), "var(--danger)", offline, "offline")}
            ${this.renderPanel(this.t("criticalTitle"), this.t("below", { level: critical }), "var(--accent)", criticalList, "critical")}
            ${this.renderPanel(this.t("lowTitle"), this.t("below", { level: low }), "var(--textSecondary)", lowList, "low")}
            ${this.renderOk(okList)}`
          : html`<div class="panel empty">${this.t("none")}</div>`}
      </ha-card>
    `;
  }

  getCardSize(): number {
    return 4;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig(): Record<string, unknown> {
    return { critical: 20, low: 40 };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-battery-editor");
  }
}

registerElement("graphite-battery-editor", GraphiteBatteryEditor);
registerCard("graphite-battery", GraphiteBattery, {
  name: "Graphite Battery",
  description: "All battery sensors grouped by urgency: offline, critical, replace soon and a collapsible list of the rest.",
});
