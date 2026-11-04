// graphite-todo-tile: open items of a todo list (e.g. shopping) in the label layout: the number of
// open items as value, optionally the first item names on the right. An empty list shows a word
// as value ("keine Artikel").
import { css, html, nothing } from "lit";
import { attachActionHandler, defaultHoldAction, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteTodoTileEditor } from "./graphite-todo-tile-editor";
import { labelStyles } from "./label-styles";
import { meterStyles } from "./meter-styles";
import { tileStyles } from "./tile-styles";

export interface TodoTileConfig extends GraphiteCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
  unit?: string;
  unit_one?: string;
  empty_text?: string;
  preview?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// item names are fetched once per list change and shared between tiles of the same list
const previewCache: Record<string, { key: string; text: string; pending?: Promise<string> }> = {};

const todoStyles = css`
  .tile.open .name {
    color: var(--graphite-text-primary);
  }
  .secondary {
    max-width: 62%;
  }
`;

export class GraphiteTodoTile extends GraphiteCard<TodoTileConfig> {
  static styles = [tileStyles, meterStyles, labelStyles, todoStyles];

  static properties = {
    ...GraphiteCard.properties,
    previewText: { state: true },
  };

  declare previewText?: string;

  private detachActions?: () => void;
  private previewKey?: string;

  protected normalizeConfig(config: TodoTileConfig): TodoTileConfig {
    if (!config.entity) throw new Error(`${this.localName}: 'entity' is required`);
    return { tap_action: { action: "more-info" }, hold_action: defaultHoldAction(config.entity), ...config };
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

  private get stateObj(): HassEntity | undefined {
    return this.hass?.states[this.config!.entity];
  }

  private handleAction(action: ActionKind): void {
    const config = this.config;
    if (!config || !hasAction(config[`${action}_action`] as ActionConfig | undefined)) return;
    fireAction(this, config, action);
  }

  // preview: names of the open items, loaded when the list changes
  protected willUpdate(): void {
    const config = this.config;
    const stateObj = this.stateObj;
    if (!config?.preview || !stateObj) return;
    const key = `${config.entity}|${stateObj.last_updated}`;
    if (key === this.previewKey) return;
    this.previewKey = key;
    this.loadPreview(config.entity, key).then((text) => {
      if (this.previewKey === key) this.previewText = text;
    });
  }

  private loadPreview(entityId: string, key: string): Promise<string> {
    const cached = previewCache[entityId];
    if (cached?.key === key) return cached.pending ?? Promise.resolve(cached.text);
    const hass: any = this.hass;
    if (!hass?.callWS) return Promise.resolve("");
    const pending: Promise<string> = hass
      .callWS({ type: "todo/item/list", entity_id: entityId })
      .then((result: { items?: Array<{ summary: string; status: string }> }) => {
        const text = (result?.items ?? []).filter((item) => item.status === "needs_action").map((item) => item.summary).join(", ");
        previewCache[entityId] = { key, text };
        return text;
      })
      .catch(() => {
        previewCache[entityId] = { key, text: "" };
        return "";
      });
    previewCache[entityId] = { key, text: cached?.text ?? "", pending };
    return pending;
  }

  private renderIcon(stateObj: HassEntity | undefined) {
    const icon = this.config!.icon
      ? html`<ha-icon .icon=${this.config!.icon}></ha-icon>`
      : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    return html`<div class="meter-icon">${icon}</div>`;
  }

  protected render() {
    const config = this.config!;
    const stateObj = this.stateObj;
    const openCount = parseInt(stateObj?.state ?? "", 10);
    const hasOpen = Number.isFinite(openCount) && openCount > 0;
    const name = config.name ?? stateObj?.attributes?.friendly_name ?? config.entity;
    // empty list: the status text is the value itself
    const value = hasOpen ? String(openCount) : config.empty_text ?? this.localize("todo.empty");
    const unit = hasOpen
      ? openCount === 1 ? config.unit_one ?? config.unit ?? this.localize("todo.unitOne") : config.unit ?? this.localize("todo.unit")
      : "";
    const secondary = hasOpen && config.preview ? this.previewText ?? "" : "";
    const interactive = hasAction(config.tap_action) || hasAction(config.double_tap_action);
    const classes = ["tile", "label", config.color ? "" : "no-stripe", hasOpen ? "open" : "", interactive ? "interactive" : ""]
      .filter(Boolean).join(" ");
    return html`<div class=${classes} style=${config.color ? `--label-color: ${config.color}` : nothing}
      role=${interactive ? "button" : nothing} tabindex=${interactive ? "0" : nothing} aria-label=${name}>${interactive
      ? html`<ha-ripple></ha-ripple>` : nothing}${this.renderIcon(stateObj)}${config.color ? html`<div class="stripe"></div>` : nothing}<div
      class="name">${name}</div><div class="value-row"><div class=${hasOpen ? "value" : "value text"}>${value}${unit
      ? html`<span class="unit">${unit}</span>` : nothing}</div>${secondary ? html`<div class="secondary">${secondary}</div>` : nothing}</div></div>`;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  static getStubConfig(hass: any): Record<string, unknown> {
    const entity = Object.keys(hass?.states ?? {}).find((id) => id.startsWith("todo.")) ?? "";
    return { entity };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-todo-tile-editor");
  }
}

registerElement("graphite-todo-tile-editor", GraphiteTodoTileEditor);
registerCard("graphite-todo-tile", GraphiteTodoTile, {
  name: "Graphite Todo Tile",
  description: "Open items of a todo list (e.g. shopping), optionally with the first item names.",
});
