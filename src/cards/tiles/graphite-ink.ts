// graphite-ink: printer with its cartridges in the label layout: name top left, status bottom
// left, one small tank per cartridge on the right that fills from the bottom. The tank track keeps a
// tint of the ink color, so an empty cartridge still shows which color it is. Empty cartridges get the
// accent highlight (like a due waste collection), soon empty ones a calm accent hint.
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { formatState, isUnavailable } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
import { GraphiteInkEditor } from "./graphite-ink-editor";
import { labelStyles } from "./label-styles";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface InkCartridge {
  entity: string;
  color?: string;
}

export interface InkConfig extends GraphiteCardConfig {
  entity?: string;
  name?: string;
  cartridges: Array<string | InkCartridge>;
  low_level?: number;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// printer states with their own wording (others use the Home Assistant translation)
const printerStates = ["idle", "printing", "processing", "stopped"];

const inkStyles = css`
  .tile.label .name {
    top: 10px;
    right: 84px;
  }
  .tile.label .value-row {
    right: 84px;
  }
  .tanks {
    position: absolute;
    right: var(--graphite-padding-tile, 12px);
    top: 12px;
    bottom: 12px;
    display: flex;
    gap: 4px;
  }
  .tanks span {
    position: relative;
    width: 8px;
    border-radius: 3px;
    overflow: hidden;
    background: color-mix(in srgb, var(--ink-color) 28%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .tanks span::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--ink-level, 0%);
    background: var(--ink-color);
  }
  /* soon empty (no empty cartridge): calm hint in the accent color, no tint */
  .tile.low .unit {
    color: var(--graphite-accent);
  }
  /* empty cartridge: accent tint, name primary, unit in accent */
  .tile.alert {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.alert .name {
    color: var(--graphite-text-primary);
  }
  .tile.alert .unit {
    color: var(--graphite-accent);
  }
  /* offline ("offline" itself is the badge class of the tile styles): dimmed like every other offline
     tile, the surface at 40% fades into the panel (no outline), the content is faded */
  .tile.printer-offline {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .tile.printer-offline :is(.name, .value-row, .tanks) {
    opacity: 0.4;
  }
`;

export class GraphiteInk extends GraphiteCard<InkConfig> {
  static styles = [tileStyles, meterStyles, labelStyles, inkStyles];

  private detachActions?: () => void;

  protected normalizeConfig(config: InkConfig): InkConfig {
    if (!Array.isArray(config.cartridges) || config.cartridges.length === 0) {
      throw new Error(`${this.localName}: 'cartridges' (list of level sensors) is required`);
    }
    return { tap_action: { action: "none" }, hold_action: defaultHoldAction(config.entity), ...config };
  }

  private cartridges(): InkCartridge[] {
    return this.config!.cartridges.map((cartridge) => (typeof cartridge === "string" ? { entity: cartridge } : cartridge));
  }

  protected watchedEntities(): string[] {
    const ids = this.cartridges().map((cartridge) => cartridge.entity);
    return this.config!.entity ? [this.config!.entity, ...ids] : ids;
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

  // cartridge color guessed from the entity id; black would vanish on the dark tile,
  // so it is shown light, like on printer displays in dark mode
  private guessColor(entityId: string): string {
    const id = entityId.toLowerCase();
    if (id.includes("cyan")) return "#2fb4e6";
    if (id.includes("magenta")) return "#e0479e";
    if (id.includes("yellow")) return "#f0c94a";
    if (id.includes("gray") || id.includes("grey")) return "#8e9399";
    return "#e4e4e6";
  }

  protected render() {
    const config = this.config!;
    const lowLevel = Number(config.low_level ?? 20);
    let emptyCount = 0;
    let lowCount = 0;
    let knownCount = 0;
    const tanks = this.cartridges().map((cartridge) => {
      const stateObj = this.hass?.states[cartridge.entity];
      const level = parseFloat(stateObj?.state ?? "");
      const known = Number.isFinite(level);
      if (known) knownCount += 1;
      if (known && level <= 0) emptyCount += 1;
      else if (known && level < lowLevel) lowCount += 1;
      const style = `--ink-color: ${cartridge.color ?? this.guessColor(cartridge.entity)}; --ink-level: ${known ? Math.max(0, Math.min(100, level)) : 0}%`;
      const title = `${stateObj?.attributes?.friendly_name ?? cartridge.entity}: ${known ? `${level} %` : "–"}`;
      return html`<span style=${style} title=${title}></span>`;
    });

    // offline: printer unavailable or no cartridge reports a level (never claim "ready")
    const printer = config.entity ? this.hass?.states[config.entity] : undefined;
    const offline = knownCount === 0 || (!!config.entity && isUnavailable(printer));
    let value: string;
    let unit = "";
    if (offline) {
      value = this.localize("rows.offline");
    } else if (emptyCount > 0) {
      value = String(emptyCount);
      unit = this.localize("ink.empty");
    } else if (lowCount > 0) {
      value = String(lowCount);
      unit = this.localize("ink.low");
    } else if (printer) {
      // all cartridges fine: the printer state (ready, printing, stopped)
      value = printerStates.includes(printer.state) ? this.localize(`ink.${printer.state}`) : formatState(this.hass, printer);
    } else {
      value = this.localize("ink.ok");
    }
    const isNumber = !offline && (emptyCount > 0 || lowCount > 0);
    const name = config.name ?? printer?.attributes?.friendly_name ?? this.localize("ink.printer");
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", "no-stripe", offline ? "printer-offline" : "", !offline && emptyCount > 0 ? "alert" : "",
      !offline && emptyCount === 0 && lowCount > 0 ? "low" : "", interactive ? "interactive" : ""].filter(Boolean).join(" ");
    return html`<div class=${classes} role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing}
      aria-label=${name}>${interactive ? html`<ha-ripple></ha-ripple>` : nothing}<div class="name">${name}</div><div
      class="value-row"><div class=${isNumber ? "value" : "value text"}>${value}${unit ? html`<span class="unit">${unit}</span>`
      : nothing}</div></div><div class="tanks">${tanks}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const cartridges = Object.keys(hass?.states ?? {})
      .filter((id) => id.startsWith("sensor.") && ["black", "cyan", "magenta", "yellow"].some((color) => id.includes(color)))
      .slice(0, 4);
    return { cartridges };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-ink-editor");
  }
}

registerElement("graphite-ink-editor", GraphiteInkEditor);
registerCard("graphite-ink", GraphiteInk, {
  aliases: ["graphite-ink-tile"],
  name: "Graphite Ink",
  description: "Printer with one small tank per cartridge; empty and soon empty cartridges are highlighted.",
});
