// graphite-panel: groups any cards in one panel with an optional header.
// Header rule: title and status (info) on the left, values (chips) and buttons on the right.
// Child cards become tiles through context tokens (--graphite-card-surface, ...).
import { css, html, nothing, type PropertyValues } from "lit";
import { GraphiteCard } from "../core/graphite-card";
import { fireAction } from "../core/actions";
import { matchesCondition, type ValueCondition } from "../core/conditions";
import { isTemplate, subscribeTemplate } from "../core/template";
import { registerCard, registerElement } from "../core/register";
import type { ActionConfig, GraphiteCardConfig, HomeAssistant } from "../core/types";
import { GraphitePanelEditor } from "./graphite-panel-editor";

export interface PanelChipConfig {
  entity: string;
  label?: string;
  unit?: string;
  decimals?: number;
  muted?: boolean;
  alert?: ValueCondition;
  tap_action?: ActionConfig | "none";
}

// one part of the status line: shown while its condition is met (default: value above 0)
export interface PanelSummaryPart {
  entity: string;
  text?: string;
  text_one?: string;
  color?: string;
  show?: ValueCondition;
}

// round button on the right of the header (e.g. "lights off", settings); highlighted while active
export interface PanelButtonConfig {
  icon?: string;
  entity?: string;
  name?: string;
  active?: ValueCondition;
  tap_action?: ActionConfig;
}

export interface PanelConfig extends GraphiteCardConfig {
  title?: string;
  info?: string;
  info_alert?: ValueCondition;
  summary?: PanelSummaryPart[];
  summary_empty?: string;
  chips?: PanelChipConfig[];
  buttons?: PanelButtonConfig[];
  layout: "vertical" | "horizontal" | "grid";
  columns?: number;
  min_column_width?: string;
  gap?: string;
  padding?: string;
  frame?: boolean;
  cards: Record<string, unknown>[];
}

const layouts = ["vertical", "horizontal", "grid"];

// Home Assistant's stack card editor is reused for the child cards (panel and dialog): load it first
export async function loadStackCardEditor(): Promise<void> {
  if (customElements.get("hui-stack-card-editor")) return;
  const helpers = await window.loadCardHelpers!();
  const stackCard = helpers.createCardElement({ type: "vertical-stack", cards: [] });
  // the stack card class may still be loading: wait for its definition before asking for the editor
  await customElements.whenDefined(stackCard.localName);
  await (customElements.get(stackCard.localName) as any).getConfigElement();
}
const summaryColors: Record<string, string> = {
  accent: "var(--graphite-accent)",
  success: "var(--graphite-success)",
  danger: "var(--graphite-danger)",
  secondary: "var(--graphite-text-secondary)",
};

export class GraphitePanel extends GraphiteCard<PanelConfig> {
  static styles = css`
    :host {
      display: block;
    }
    /* context tokens for child cards; a frameless panel is only a layout container and passes none.
       The sbo-* names are read by the Bubble module and the not yet migrated cards. */
    :host(:not([frameless])) {
      --graphite-card-surface: var(--graphite-surface-tile);
      --graphite-card-inner-surface: var(--graphite-surface-tile-active);
      --graphite-card-radius: var(--graphite-radius-tile);
      --sbo-card-surface: var(--graphite-card-surface);
      --sbo-card-inner-surface: var(--graphite-card-inner-surface);
      --sbo-card-radius: var(--graphite-card-radius);
    }
    ha-card {
      background: var(--graphite-surface-panel);
      border-radius: var(--graphite-radius-panel);
      border: none;
      box-shadow: none;
      padding: var(--graphite-padding-panel, 16px);
      box-sizing: border-box;
      height: 100%;
      /* only colors animate; the theme applies after the first render and would animate the radius */
      transition: background-color 0.3s ease;
    }
    /* title and info share one baseline, separated by a thin line (same as dialogs and room cards) */
    .header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: var(--graphite-gap-header, 12px);
      margin-bottom: var(--graphite-header-margin, var(--graphite-gap-header, 12px));
    }
    /* title and info share one baseline; with buttons the row is as high as the buttons */
    .heading {
      flex: 1 1 auto;
      display: flex;
      align-items: baseline;
      gap: var(--graphite-gap-header, 12px);
      min-width: 0;
    }
    .buttons {
      display: flex;
      flex: none;
      gap: var(--graphite-gap-tile, 8px);
    }
    .button {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: var(--graphite-radius-tile, 12px);
      background: var(--graphite-surface-tile);
      color: var(--graphite-text-secondary);
      cursor: pointer;
      font: inherit;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 18px;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .button:focus-visible {
      outline: 2px solid var(--graphite-accent);
      outline-offset: 2px;
    }
    .button.active {
      background: var(--graphite-accent);
      color: var(--graphite-accent-ink);
    }
    .title {
      flex: none;
      font-size: var(--graphite-title-size, 18px);
      font-weight: var(--graphite-title-weight, 400);
      line-height: 1.2;
      padding-left: var(--graphite-title-inset, 0);
      color: var(--graphite-title-color, var(--primary-text-color));
    }
    .title:empty {
      display: none;
    }
    .info {
      min-width: 0;
      padding-left: var(--graphite-gap-header, 12px);
      position: relative;
      /* 2px more room on top for the separator line (it reads too short at cap height);
         the negative margin keeps the text on the shared baseline */
      padding-top: 2px;
      margin-top: -2px;
      font-size: var(--graphite-font-label-size, 13px);
      line-height: 16px;
      color: var(--graphite-text-secondary, var(--secondary-text-color));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* separator from the title's cap height down to the shared baseline
       (13px text in a 16px line: the baseline sits 3.5px above the bottom) */
    .info::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 3.5px;
      width: 1px;
      background: var(--graphite-separator);
    }
    .info:empty {
      display: none;
    }
    /* info_alert condition met: info in accent color */
    .info.alert {
      color: var(--graphite-accent, var(--accent-color));
      font-weight: 500;
    }
    /* colored parts of the summary: same weight as the highlighted status */
    .info b {
      font-weight: 500;
    }
    /* values as pills on the right; the negative margin keeps the header at title height */
    .chips {
      display: flex;
      gap: var(--graphite-chip-gap, 6px);
      flex: none;
      align-self: center;
      margin-block: -2px;
    }
    .chips:empty {
      display: none;
    }
    .chip {
      display: inline-flex;
      align-items: baseline;
      gap: 3px;
      padding: var(--graphite-chip-padding, 4px 10px);
      border: none;
      border-radius: var(--graphite-radius-pill, 999px);
      background: var(--graphite-surface-tile);
      font: inherit;
      font-size: var(--graphite-font-label-size, 13px);
      line-height: 16px;
      font-variant-numeric: tabular-nums;
      color: var(--graphite-text-primary, var(--primary-text-color));
      white-space: nowrap;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .chip.static {
      cursor: default;
    }
    .chip .label {
      margin-right: 3px;
    }
    .chip .label,
    .chip .unit {
      color: var(--graphite-text-muted, var(--secondary-text-color));
      font-size: var(--graphite-font-caption-size, 12px);
    }
    .chip.muted .value {
      color: var(--graphite-text-secondary, var(--secondary-text-color));
    }
    /* alert condition met: accent text on a tinted pill */
    .chip.alert {
      background: color-mix(in srgb, var(--graphite-accent) 18%, var(--graphite-surface-panel));
    }
    .chip.alert .value,
    .chip.alert .label,
    .chip.alert .unit {
      color: var(--graphite-accent, var(--accent-color));
    }
    .content {
      /* defaults for standard Home Assistant cards inside the panel */
      --ha-card-background: var(--graphite-card-surface);
      --ha-card-border-radius: var(--graphite-card-radius);
      --ha-card-border-width: 0px;
      --ha-card-box-shadow: none;
      gap: var(--graphite-gap-tile, 8px);
    }
    .content.vertical {
      display: flex;
      flex-direction: column;
    }
    .content.horizontal {
      display: flex;
      flex-direction: row;
    }
    .content.horizontal > * {
      flex: 1 1 0;
      min-width: 0;
    }
    .content.grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    /* responsive grid: as many columns of min_column_width as fit, one column on narrow screens */
    .content.grid.responsive {
      align-items: start;
    }
    .content > [hidden],
    .content > [collapsed] {
      display: none !important;
    }
    /* frameless: no surface, no padding (layout container only) */
    :host([frameless]) ha-card {
      background: none;
      padding: 0;
      border-radius: 0;
    }
  `;

  private childCards: any[] = [];
  private buildId = 0;
  private infoText = "";
  private infoUnsubscribe?: Promise<() => void>;
  // hass goes to the child cards on every update, even when the panel itself does not re-render
  protected hassChanged(hass: HomeAssistant | undefined): void {
    for (const element of this.childCards) element.hass = hass;
    if (hass && this.isConnected && !this.infoUnsubscribe) this.subscribeInfo();
  }

  protected normalizeConfig(config: PanelConfig): PanelConfig {
    if (!Array.isArray(config.cards)) throw new Error("graphite-panel: 'cards' must be a list of cards");
    const layout = config.layout || "vertical";
    if (!layouts.includes(layout)) throw new Error("graphite-panel: 'layout' must be vertical, horizontal or grid");
    return { ...config, layout };
  }

  setConfig(config: PanelConfig): void {
    super.setConfig(config);
    this.unsubscribeInfo();
    this.infoText = "";
    this.buildCards();
    if (this.isConnected) this.subscribeInfo();
  }

  protected watchedEntities(): string[] {
    const entities = this.chipConfigs().map((chip) => chip.entity);
    for (const button of this.buttonConfigs()) {
      if (button.entity) entities.push(button.entity);
      if (button.active?.entity) entities.push(button.active.entity);
    }
    if (this.config?.info_alert?.entity) entities.push(this.config.info_alert.entity);
    for (const part of this.summaryParts()) entities.push(part.entity);
    return entities;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.subscribeInfo();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeInfo();
  }

  private buttonConfigs(): PanelButtonConfig[] {
    return Array.isArray(this.config?.buttons) ? this.config!.buttons.filter((button) => button && (button.icon || button.entity)) : [];
  }

  // default: a scene is activated, other entities open more-info
  private buttonClick(event: Event, button: PanelButtonConfig): void {
    event.stopPropagation();
    const entity = button.entity;
    const fallback: ActionConfig = entity?.startsWith("scene.")
      ? { action: "perform-action", perform_action: "scene.turn_on", target: { entity_id: entity } }
      : { action: entity ? "more-info" : "none" };
    fireAction(this, { type: "button", entity, tap_action: button.tap_action ?? fallback }, "tap");
  }

  private renderButton(button: PanelButtonConfig) {
    const activeState = button.active?.entity ? this.hass?.states[button.active.entity]?.state
      : button.entity ? this.hass?.states[button.entity]?.state : undefined;
    const stateObj = button.entity ? this.hass?.states[button.entity] : undefined;
    const icon = button.icon
      ? html`<ha-icon .icon=${button.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    const label = button.name ?? stateObj?.attributes?.friendly_name ?? "";
    return html`<button class=${matchesCondition(button.active, activeState) ? "button active" : "button"} title=${label}
      aria-label=${label} @click=${(event: Event) => this.buttonClick(event, button)}><ha-ripple></ha-ripple>${icon}</button>`;
  }

  private summaryParts(): PanelSummaryPart[] {
    return Array.isArray(this.config?.summary) ? this.config!.summary.filter((part) => part?.entity) : [];
  }

  // status from parts: "1 offline · 2 kritisch"; parts whose condition is not met are left out
  private renderSummary() {
    const shown = this.summaryParts().flatMap((part) => {
      const state = this.hass?.states[part.entity]?.state;
      if (!matchesCondition(part.show ?? { above: 0 }, state)) return [];
      const number = Number(state);
      const value = state !== "" && Number.isFinite(number) ? String(Math.round(number)) : String(state);
      const template = number === 1 && part.text_one ? part.text_one : part.text ?? "{value}";
      const text = template.split("{value}").join(value);
      const color = part.color ? summaryColors[part.color] ?? part.color : "";
      return [color ? html`<b style=${`color: ${color}`}>${text}</b>` : html`<span>${text}</span>`];
    });
    if (!shown.length) return this.config?.summary_empty ?? "";
    return shown.map((part, index) => (index ? html` · ${part}` : part));
  }

  private chipConfigs(): PanelChipConfig[] {
    return Array.isArray(this.config?.chips) ? this.config!.chips.filter((chip) => chip?.entity) : [];
  }

  // child cards are created once per config (not by the template), so they keep their state
  private async buildCards(): Promise<void> {
    const buildId = ++this.buildId;
    const helpers = customElements.get("hui-card") ? null : await window.loadCardHelpers?.();
    if (buildId !== this.buildId || !this.config) return;
    this.childCards = this.config.cards.map((cardConfig) => {
      let element: any;
      if (!helpers) {
        // hui-card handles visibility conditions and loading like the built-in stacks
        element = document.createElement("hui-card");
        element.config = cardConfig;
        element.preview = false;
        if (this.hass) element.hass = this.hass;
        element.load();
      } else {
        element = helpers.createCardElement(cardConfig);
        if (this.hass) element.hass = this.hass;
      }
      this.watchVisibility(element);
      return element;
    });
    await this.updateComplete;
    if (buildId === this.buildId) this.renderRoot.querySelector(".content")?.replaceChildren(...this.childCards);
  }

  // a child card that hides itself (card-visibility-changed) collapses its slot, so no gap remains
  private watchVisibility(element: HTMLElement): void {
    // capture phase: hui-card stops this event on the inner card element
    element.addEventListener("card-visibility-changed", (event: Event) => {
      element.toggleAttribute("collapsed", (event as CustomEvent).detail?.value === false);
    }, true);
  }

  private async subscribeInfo(): Promise<void> {
    const info = this.config?.info;
    if (!isTemplate(info) || !this.hass?.connection || this.infoUnsubscribe) return;
    this.infoUnsubscribe = subscribeTemplate(this.hass, info, (result) => {
      this.infoText = result;
      this.requestUpdate();
    });
    try {
      await this.infoUnsubscribe;
    } catch (error) {
      this.infoUnsubscribe = undefined;
      console.warn("graphite-panel: info template failed", error);
    }
  }

  private unsubscribeInfo(): void {
    this.infoUnsubscribe?.then((unsubscribe) => unsubscribe()).catch(() => undefined);
    this.infoUnsubscribe = undefined;
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has("config") || !this.config) return;
    this.toggleAttribute("frameless", this.config.frame === false);
    // a re-rendered content element (new config) gets the child cards back
    const content = this.renderRoot.querySelector(".content");
    if (content && this.childCards.length && content.childElementCount === 0) content.replaceChildren(...this.childCards);
  }

  private chipValue(chip: PanelChipConfig): { value: string; unit: string; state?: string } {
    const stateObj = this.hass?.states[chip.entity];
    const state = stateObj?.state;
    const isValid = state !== undefined && state !== "unavailable" && state !== "unknown";
    let value = isValid ? state! : "–";
    const number = Number(state);
    if (isValid && state !== "" && !Number.isNaN(number)) {
      const decimals = chip.decimals ?? this.hass?.entities?.[chip.entity]?.display_precision;
      if (decimals !== undefined && decimals !== null) value = number.toFixed(Number(decimals));
    }
    const unit = chip.unit ?? stateObj?.attributes?.unit_of_measurement ?? "";
    return { value, unit, state };
  }

  private chipClick(event: Event, chip: PanelChipConfig): void {
    event.stopPropagation();
    const tapAction = chip.tap_action === "none" ? { action: "none" as const } : chip.tap_action;
    if (tapAction?.action === "none") return;
    fireAction(this, { type: "chip", entity: chip.entity, tap_action: tapAction ?? { action: "more-info" } }, "tap");
  }

  private renderChip(chip: PanelChipConfig) {
    const { value, unit, state } = this.chipValue(chip);
    const isStatic = chip.tap_action === "none" || (typeof chip.tap_action === "object" && chip.tap_action.action === "none");
    const classes = ["chip", isStatic ? "static" : "", chip.muted ? "muted" : "", matchesCondition(chip.alert, state) ? "alert" : ""]
      .filter(Boolean).join(" ");
    return html`<button class=${classes} @click=${(event: Event) => this.chipClick(event, chip)}>${chip.label
      ? html`<span class="label">${chip.label}</span>` : nothing}<span class="value">${value}</span><span class="unit">${unit}</span></button>`;
  }

  protected render() {
    const config = this.config!;
    const chips = this.chipConfigs();
    // summary replaces info; an empty summary (no part shown, no summary_empty) hides the status
    const info = this.summaryParts().length ? this.renderSummary()
      : isTemplate(config.info) ? this.infoText : config.info || "";
    const alertState = config.info_alert?.entity ? this.hass?.states[config.info_alert.entity]?.state : undefined;
    const infoClass = matchesCondition(config.info_alert, alertState) ? "info alert" : "info";
    const buttons = this.buttonConfigs();
    // a container (e.g. graphite-dialog) can add its own header buttons through the "actions" slot
    const hasActions = !!this.querySelector(":scope > [slot=actions]");
    const showHeader = !!(config.title || config.info || this.summaryParts().length || chips.length || buttons.length || hasActions);
    // columns and min_column_width apply to this panel only (set on this panel only, not inherited)
    let columns = "";
    if (config.min_column_width) columns = `repeat(auto-fit, minmax(min(${config.min_column_width}, 100%), 1fr))`;
    else if (config.columns) columns = `repeat(${Number(config.columns)}, minmax(0, 1fr))`;
    const contentStyle = [
      columns ? `grid-template-columns: ${columns}` : "",
      config.gap ? `gap: ${config.gap}` : "",
    ].filter(Boolean).join("; ");
    const cardStyle = config.padding && config.frame !== false ? `padding: ${config.padding}` : "";
    const contentClass = `content ${config.layout}${config.min_column_width ? " responsive" : ""}`;
    return html`<ha-card part="card" style=${cardStyle}>${showHeader
      ? html`<div class="header" part="header"><div class="heading"><span class="title">${config.title ?? ""}</span><span class=${infoClass}>${info}</span></div><span
        class="chips">${chips.map((chip) => this.renderChip(chip))}</span>${buttons.length || hasActions ? html`<span class="buttons">${buttons
        .map((button) => this.renderButton(button))}${hasActions ? html`<slot name="actions"></slot>` : nothing}</span>` : nothing}</div>`
      : nothing}<div class=${contentClass} part="content" style=${contentStyle}></div></ha-card>`;
  }

  getCardSize(): number {
    return 1 + this.childCards.length;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(): Partial<PanelConfig> {
    return { title: "Panel", layout: "vertical", cards: [] };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    await loadStackCardEditor();
    return document.createElement("graphite-panel-editor");
  }
}

registerElement("graphite-panel-editor", GraphitePanelEditor);
registerCard("graphite-panel", GraphitePanel, {
  name: "Graphite Panel",
  description: "Groups cards in one panel with title, status, chips and a vertical, horizontal or grid layout.",
});
