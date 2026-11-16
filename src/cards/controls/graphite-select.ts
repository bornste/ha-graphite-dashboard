// graphite-select: picks one option of an input_select or select. As segments (a row of buttons,
// e.g. a mode) or as tiles in a grid; with preview: theme each tile shows a small preview of the
// Home Assistant theme it names (ground, panel, a tile with "Aa" and an active tile in the accent),
// drawn with the theme's own tokens from hass.themes.
import { css, html, nothing, type CSSResultGroup, type PropertyValues } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { isUnavailable } from "../../core/format";
import { GraphiteCard } from "../../core/graphite-card";
import { solidHoverStyles } from "../../core/hover";
import { tileEdgeStyles } from "../../core/edge";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HomeAssistant } from "../../core/types";
import { GraphiteSelectEditor } from "./graphite-select-editor";

export type SelectLayout = "segments" | "tiles";

// display of one option: shown name and icon (the option itself is the value of the entity)
export interface SelectOptionConfig {
  option: string;
  name?: string;
  icon?: string;
}

export interface SelectConfig extends GraphiteCardConfig {
  entity: string;
  layout?: SelectLayout;
  columns?: number;
  preview?: "theme";
  options?: SelectOptionConfig[];
}

const layouts: SelectLayout[] = ["segments", "tiles"];
const selectDomains = ["input_select", "select"];
const themePrefix = "Graphite ";
// how long a tapped option shows as selected without the entity following (ms)
const pendingTimeout = 4000;

export function selectLayoutOf(config: { layout?: string } | undefined): SelectLayout {
  return layouts.includes(config?.layout as SelectLayout) ? config!.layout as SelectLayout : "segments";
}

// the custom properties of a theme as an inline style; a theme with modes uses its dark mode, else
// its light mode (the Graphite light themes define both the same)
export function themeStyle(hass: HomeAssistant | undefined, name: string): Record<string, string> | undefined {
  const theme = hass?.themes?.themes?.[name];
  if (!theme) return undefined;
  const values = theme.modes ? theme.modes.dark ?? theme.modes.light ?? {} : theme;
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key !== "modes" && (typeof value === "string" || typeof value === "number")) style[`--${key}`] = String(value);
  }
  return style;
}

const check = html`<svg class="check" viewBox="0 0 24 24" aria-hidden="true"><path
  d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"></path></svg>`;

const selectStyles = css`
  :host {
    display: block;
  }
  .options {
    display: grid;
    grid-template-columns: repeat(var(--selectColumns), minmax(0, 1fr));
    gap: var(--graphite-gap-tile, 8px);
  }
  .option {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    min-width: 0;
    border-radius: var(--graphite-radius-tile, 12px);
    background: var(--graphite-surface-tile);
    color: var(--graphite-text-secondary);
    -webkit-tap-highlight-color: transparent;
    outline: none;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .option.interactive {
    cursor: pointer;
  }
  .option.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  /* selected: soft accent tint like an active tile */
  .option.selected {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
    color: var(--graphite-text-primary);
  }
  .options.unavailable .option {
    opacity: 0.4;
  }
  ha-icon {
    display: flex;
    flex: none;
    pointer-events: none;
  }
  .name {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .option.selected .name {
    font-weight: 500;
  }

  /* segments: icon and name centered in one line */
  .segments .option {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 56px;
    padding: 0 12px;
    font-size: var(--graphite-font-name-size, 15px);
    --mdc-icon-size: 20px;
  }
  .segments .option.selected ha-icon {
    color: var(--graphite-accent);
  }

  /* tiles: icon top left, name bottom left (like graphite-button) */
  .tiles .option {
    height: var(--graphite-tile-height, 80px);
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .tiles .option ha-icon {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: var(--graphite-padding-tile, 12px);
  }
  .tiles .option.selected ha-icon {
    color: var(--graphite-accent);
  }
  .tiles .option .label {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 9px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 18px;
    color: var(--graphite-text-primary);
  }

  /* theme preview: the preview fills the tile, the name below it */
  .tiles .option.preview {
    height: auto;
    padding: 6px 6px 8px;
  }
  .tiles .option.preview .label {
    position: static;
    margin: 7px 2px 0;
    color: inherit;
  }
  .check {
    flex: none;
    width: 14px;
    height: 14px;
    margin-left: auto;
    fill: var(--graphite-accent);
  }
  .mini {
    box-sizing: border-box;
    aspect-ratio: 4 / 3;
    padding: 6px;
    border-radius: 8px;
    background: var(--graphite-surface-page, var(--graphite-ground));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--graphite-ink) 10%, transparent);
    pointer-events: none;
  }
  .mini.missing {
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--graphite-divider);
  }
  .miniPanel {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    height: 100%;
    padding: 5px;
    border-radius: 6px;
    background: var(--graphite-surface-panel);
  }
  .miniTile {
    position: relative;
    border-radius: 4px;
    background: var(--graphite-surface-tile);
  }
  .miniTile.on {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .miniText {
    position: absolute;
    left: 4px;
    bottom: 2px;
    font-size: 11px;
    line-height: 14px;
    color: var(--graphite-text-primary);
  }
  .miniDot {
    position: absolute;
    left: 5px;
    top: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--graphite-accent);
  }
  ${solidHoverStyles(".option", ".option.interactive:not(.selected)")}
  ${tileEdgeStyles(".option")}
`;

export class GraphiteSelect extends GraphiteCard<SelectConfig> {
  static styles: CSSResultGroup = selectStyles;

  // option tapped last, shown as selected until the entity follows
  private pendingOption?: string;
  private pendingTimer?: number;

  protected normalizeConfig(config: SelectConfig): SelectConfig {
    if (!config.entity) throw new Error("graphite-select: entity is required");
    if (!selectDomains.includes(config.entity.split(".")[0])) {
      throw new Error("graphite-select: entity must be an input_select or select");
    }
    if (config.layout !== undefined && !layouts.includes(config.layout)) {
      throw new Error(`graphite-select: layout must be one of ${layouts.join(", ")}`);
    }
    if (config.preview !== undefined && config.preview !== "theme") {
      throw new Error("graphite-select: preview must be theme");
    }
    if (config.options !== undefined && !Array.isArray(config.options)) {
      throw new Error("graphite-select: options must be a list");
    }
    return config;
  }

  // the theme previews follow changes of the themes (e.g. after reloading them)
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (this.config?.preview === "theme" && changed.has("hass")) {
      const previous = changed.get("hass") as HomeAssistant | undefined;
      if (previous && previous.themes !== this.hass?.themes) return true;
    }
    return super.shouldUpdate(changed);
  }

  private optionConfig(option: string): SelectOptionConfig | undefined {
    return this.config?.options?.find((entry) => entry?.option === option);
  }

  // shown name: from the config, with a theme preview without "Graphite " in front, else the option
  private optionName(option: string): string {
    const name = this.optionConfig(option)?.name;
    if (name) return name;
    if (this.config?.preview === "theme" && option.startsWith(themePrefix) && option.length > themePrefix.length) {
      return option.slice(themePrefix.length);
    }
    return option;
  }

  // the tapped option shows as selected right away, until the entity reports it (or a few seconds
  // passed); the service is called even if the option already looks selected, so a card with an
  // outdated state can still switch back
  private select(option: string): void {
    const config = this.config;
    if (!config || !this.hass) return;
    const stateObj = this.hass.states[config.entity];
    if (!stateObj || isUnavailable(stateObj)) return;
    this.pendingOption = option;
    window.clearTimeout(this.pendingTimer);
    this.pendingTimer = window.setTimeout(() => {
      this.pendingOption = undefined;
      this.requestUpdate();
    }, pendingTimeout);
    this.requestUpdate();
    this.hass.callService(config.entity.split(".")[0], "select_option", { option }, { entity_id: config.entity });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.pendingTimer);
    this.pendingOption = undefined;
  }

  private onKey(event: KeyboardEvent, option: string): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.select(option);
  }

  private renderPreview(option: string) {
    const style = themeStyle(this.hass, option);
    if (!style) return html`<div class="mini missing"></div>`;
    return html`<div class="mini" style=${styleMap(style)}><div class="miniPanel"><div class="miniTile"><span
      class="miniText">Aa</span></div><div class="miniTile on"><span class="miniDot"></span></div></div></div>`;
  }

  private renderOption(option: string, selected: boolean, interactive: boolean) {
    const config = this.config!;
    const layout = selectLayoutOf(config);
    const preview = layout === "tiles" && config.preview === "theme";
    const icon = preview ? undefined : this.optionConfig(option)?.icon;
    const name = this.optionName(option);
    const classes = ["option", selected ? "selected" : "", interactive ? "interactive" : "", preview ? "preview" : ""]
      .filter(Boolean).join(" ");
    const iconPart = icon ? html`<ha-icon .icon=${icon}></ha-icon>` : nothing;
    const ripple = interactive ? html`<ha-ripple></ha-ripple>` : nothing;
    const content = layout === "segments"
      ? html`${iconPart}<span class="name">${name}</span>`
      : html`${preview ? this.renderPreview(option) : iconPart}<div class="label"><span
        class="name">${name}</span>${selected && preview ? check : nothing}</div>`;
    return html`<div class=${classes} role="radio" aria-checked=${selected ? "true" : "false"}
      tabindex=${interactive ? "0" : "-1"} title=${option}
      @click=${interactive ? () => this.select(option) : nothing}
      @keydown=${interactive ? (event: KeyboardEvent) => this.onKey(event, option) : nothing}>${ripple}${content}</div>`;
  }

  protected render() {
    const config = this.config!;
    const layout = selectLayoutOf(config);
    const stateObj = this.hass?.states[config.entity];
    const unavailable = isUnavailable(stateObj);
    const options: string[] = Array.isArray(stateObj?.attributes?.options) ? stateObj!.attributes.options : [];
    const columns = config.columns ?? (layout === "segments" ? Math.max(options.length, 1) : 4);
    const name = stateObj?.attributes?.friendly_name ?? config.entity;
    if (this.pendingOption !== undefined && stateObj?.state === this.pendingOption) {
      this.pendingOption = undefined;
      window.clearTimeout(this.pendingTimer);
    }
    const selected = this.pendingOption ?? stateObj?.state;
    return html`<div class="options ${layout}${unavailable ? " unavailable" : ""}" role="radiogroup" aria-label=${name}
      style="--selectColumns: ${columns}">${options.map((option) =>
        this.renderOption(option, selected === option, !unavailable))}</div>`;
  }

  getCardSize(): number {
    return selectLayoutOf(this.config) === "segments" ? 1 : 2;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("input_select."))
      ?? Object.keys(hass?.states ?? {}).find((id) => id.startsWith("select.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-select-editor");
  }
}

registerElement("graphite-select-editor", GraphiteSelectEditor);
registerCard("graphite-select", GraphiteSelect, {
  name: "Graphite Select",
  description: "Picks one option of an input_select or select, as segments or tiles; optional theme preview.",
});
