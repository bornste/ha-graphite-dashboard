// graphite-summary: clock with date and a short status summary written as prose. Every item adds a
// phrase while its condition is met; alerts come first (accent), the rest follows in a second
// sentence. Parts in [brackets] are highlighted and tappable, {icon} inserts an icon.
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { attachActionHandler, fireAction, hasAction, type ActionKind } from "../../core/actions";
import { matchesCondition, type ValueCondition } from "../../core/conditions";
import { GraphiteCard } from "../../core/graphite-card";
import { nextPickup, pickupOf, type SummaryPickup } from "../../core/pickup";
import { registerCard, registerElement } from "../../core/register";
import type { ActionConfig, GraphiteCardConfig } from "../../core/types";
import { GraphiteSummaryEditor } from "./graphite-summary-editor";

export interface SummaryLevel extends ValueCondition {
  text: string;
  alert?: boolean;
}

export interface SummaryItem {
  // only a label for the list in the editor, not used by the card
  name?: string;
  entity?: string;
  // shown while the condition is met (default: always, unless the item has an alert)
  show?: ValueCondition | true;
  // alert: first sentence, highlighted in the accent (or the item color)
  alert?: ValueCondition | boolean;
  text?: string;
  text_one?: string;
  alert_text?: string;
  alert_text_one?: string;
  // first matching level wins (e.g. above 1500 before above 1000)
  levels?: SummaryLevel[];
  pickup?: SummaryPickup | string[];
  // older form of the pickup options (with pickup as a list of calendars)
  days?: number;
  drop_after?: string;
  names?: Record<string, string>;
  when?: Record<number, string>;
  // line 2, 3 … start on their own line
  line?: number;
  color?: string;
  icon?: string;
  navigation_path?: string;
  // tappable highlight that opens more-info of the entity
  more_info?: boolean;
  tap_action?: ActionConfig;
}

export interface SummaryConfig extends GraphiteCardConfig {
  items: SummaryItem[];
  clock?: boolean;
  greeting?: boolean;
  calm_text?: string | false;
  and_word?: string;
  hold_action?: ActionConfig;
}

interface Phrase {
  index: number;
  alert: boolean;
  text: string;
}

// shortcuts for the highlight color of an item
const markColors: Record<string, string> = {
  accent: "var(--graphite-accent, #f5c48a)",
  success: "var(--graphite-success, #a8d5a2)",
  danger: "var(--graphite-danger, #e8908a)",
};
const unavailable = ["unavailable", "unknown"];

const summaryStyles = css`
  :host {
    display: block;
    --summaryText: var(--graphite-text-primary, #f3f3f4);
    --summaryText2: var(--graphite-text-secondary, #b4b4b8);
    --summaryText3: var(--graphite-text-muted, #8f8f92);
    --summaryAccent: var(--graphite-accent, #f5c48a);
  }
  ha-card {
    background: none;
    border: none;
    box-shadow: none;
    padding: 0 4px var(--graphite-clock-space-below, 12px);
    user-select: none;
    -webkit-user-select: none;
  }
  /* date next to the time, separated by a thin line: line from cap top to baseline of the digits,
     weekday above the date, the date line on the baseline of the time (all measured) */
  .clock {
    display: flex;
    align-items: stretch;
    gap: 16px;
  }
  .time {
    font-size: var(--graphite-clock-size, 76px);
    font-weight: 300;
    line-height: 1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--summaryText);
  }
  .separator {
    width: 1px;
    margin: var(--capTop, 10px) 0 var(--baseGap, 6px);
    /* same opaque separator as the title | status headers */
    background: var(--graphite-separator, color-mix(in srgb, var(--graphite-ink, #f3f3f4) 18%, var(--graphite-ground, #0a0a0b)));
  }
  .date {
    margin: var(--capTop, 10px) 0 var(--dateBaseGap, 2px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    font-size: 18px;
    line-height: 1.3;
    color: var(--summaryText);
  }
  .date .weekday {
    font-size: 14px;
    color: var(--summaryText2);
  }
  .greeting {
    margin-top: 14px;
    font-size: 13px;
    color: var(--summaryText3);
    letter-spacing: 0.02em;
  }
  .prose {
    margin-top: var(--graphite-summary-gap, 14px);
    font-size: var(--graphite-summary-size, 17px);
    line-height: 1.5;
    font-weight: 300;
    color: var(--summaryText2);
  }
  .greeting + .prose { margin-top: 4px; }
  .prose:empty { display: none; }
  .prose.noClock { margin-top: 0; }
  .mark {
    font-weight: 500;
    color: var(--summaryText);
  }
  .mark.alert { color: var(--markColor, var(--summaryAccent)); }
  .mark.colored { color: var(--markColor); }
  /* inline icon ({icon} / {icon:mdi:name}), sized and aligned like a capital letter */
  .inlineIcon {
    --mdc-icon-size: 1.05em;
    display: inline-flex;
    vertical-align: -0.12em;
    margin-right: 0.15em;
  }
  /* items with line: 2, 3 … start on their own line */
  .line + .line { margin-top: var(--graphite-summary-line-gap, 10px); }
  .mark.link {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    border-radius: 4px;
    outline: none;
  }
  .mark.link:active { opacity: 0.7; }
  .mark.link:focus-visible { box-shadow: 0 0 0 2px var(--summaryAccent); }
`;

export class GraphiteSummary extends GraphiteCard<SummaryConfig> {
  static properties = {
    ...GraphiteCard.properties,
    now: { state: true },
  };

  static styles = summaryStyles;

  declare now: Date;

  private tickTimer?: number;
  private detachActions?: () => void;

  constructor() {
    super();
    this.now = new Date();
  }

  protected normalizeConfig(config: SummaryConfig): SummaryConfig {
    if (!Array.isArray(config.items)) throw new Error("items is required");
    // the former card took a bare perform_action as hold action
    const hold = config.hold_action;
    if (hold && !hold.action && hold.perform_action) return { ...config, hold_action: { ...hold, action: "perform-action" } };
    return config;
  }

  protected watchedEntities(): string[] {
    return (this.config?.items ?? []).flatMap((item) => [...(item.entity ? [item.entity] : []), ...(pickupOf(item)?.calendars ?? [])]);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // the clock ticks on its own, aligned to the next full minute
    const tick = () => {
      this.now = new Date();
      this.tickTimer = window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    window.clearTimeout(this.tickTimer);
    tick();
    // holding the card (not a highlight), e.g. to toggle the navigation of the kiosk
    this.detachActions = attachActionHandler(this, {
      hasHold: () => hasAction(this.config?.hold_action),
      hasDoubleTap: () => false,
    }, (action: ActionKind) => {
      if (action === "hold" && this.config && hasAction(this.config.hold_action)) fireAction(this, this.config, "hold");
    });
    (document.fonts?.ready ?? Promise.resolve()).then(() => this.alignDate());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.tickTimer);
    this.detachActions?.();
    this.detachActions = undefined;
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("config")) this.alignDate();
  }

  // ---------- texts ----------

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.localize(`summary.${key}`, params);
  }

  private join(parts: string[]): string {
    if (parts.length <= 1) return parts[0] ?? "";
    return `${parts.slice(0, -1).join(", ")} ${this.config!.and_word || this.t("and")} ${parts[parts.length - 1]}`;
  }

  // ---------- phrases ----------

  // "[Karton] wird morgen abgeholt" / "[Karton] und [Papier] werden heute abgeholt"
  private pickupPhrases(item: SummaryItem, pickup: SummaryPickup, index: number): Phrase[] {
    const maxDays = Number(pickup.days ?? 1);
    const byDay = new Map<number, string[]>();
    for (const entityId of pickup.calendars) {
      const next = nextPickup(this.hass!, entityId, 14, pickup.drop_after, () => this.requestUpdate());
      if (!next || next.days > maxDays) continue;
      const attributes = this.hass!.states[entityId]?.attributes ?? {};
      const name = pickup.names?.[entityId] || attributes.message || attributes.friendly_name || entityId;
      byDay.set(next.days, [...(byDay.get(next.days) ?? []), name]);
    }
    return [...byDay.keys()].sort((first, second) => first - second).map((days) => {
      const names = byDay.get(days)!.map((name) => `[${name}]`);
      const template = names.length === 1 ? (item.text_one || this.t("pickupOne")) : (item.text || this.t("pickupMany"));
      const when = pickup.when?.[days] ?? (days <= 2 ? this.t(`when.${days}`) : this.t("inDays", { days }));
      return { index, alert: item.alert !== false, text: template.split("{names}").join(this.join(names)).split("{when}").join(when) };
    });
  }

  private meets(condition: ValueCondition | boolean | undefined, state: string): boolean {
    if (condition === false) return false;
    return condition === true || matchesCondition(condition, state);
  }

  // phrases of all items whose condition is met
  private phrases(): Phrase[] {
    const states = this.hass!.states;
    return this.config!.items.flatMap((item, index): Phrase[] => {
      const pickup = pickupOf(item);
      if (pickup) return this.pickupPhrases(item, pickup, index);
      const state = item.entity ? states[item.entity]?.state : undefined;
      if (state === undefined || unavailable.includes(state)) return [];
      const number = Number(state);
      const value = state !== "" && !isNaN(number) ? String(Math.round(number)) : state;
      if (Array.isArray(item.levels)) {
        const level = item.levels.find((entry) => this.meets(entry, state));
        return level?.text ? [{ index, alert: level.alert !== false, text: level.text.split("{value}").join(value) }] : [];
      }
      const isAlert = this.meets(item.alert, state);
      const isShown = isAlert || (item.show === undefined ? !item.alert : this.meets(item.show, state));
      if (!isShown) return [];
      const one = isAlert && item.alert_text_one ? item.alert_text_one : item.text_one;
      let template = isAlert && item.alert_text ? item.alert_text : item.text;
      if (Number(value) === 1 && one) template = one;
      return template ? [{ index, alert: isAlert, text: template.split("{value}").join(value) }] : [];
    });
  }

  // ---------- rendering of the prose ----------

  private onMark(event: Event, item: SummaryItem): void {
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    const action: ActionConfig = item.tap_action
      || (item.navigation_path ? { action: "navigate", navigation_path: item.navigation_path } : { action: "more-info" });
    fireAction(this, { type: "graphite-summary", entity: item.entity, tap_action: action }, "tap");
  }

  // text with {icon} (the item's or the entity's icon) and {icon:mdi:name} as icons
  private withIcons(text: string, item: SummaryItem): Array<TemplateResult | string> {
    const parts: Array<TemplateResult | string> = [];
    let rest = text;
    for (let guard = 0; guard < 10; guard++) {
      const start = rest.indexOf("{icon");
      const end = start < 0 ? -1 : rest.indexOf("}", start);
      if (start < 0 || end < 0) break;
      const spec = rest.slice(start + 1, end);
      const icon = spec === "icon" ? (item.icon || (item.entity ? this.hass!.states[item.entity]?.attributes?.icon : "") || "") : spec.slice(5);
      if (rest.slice(0, start)) parts.push(rest.slice(0, start));
      if (icon) parts.push(html`<ha-icon class="inlineIcon" icon=${icon}></ha-icon>`);
      rest = rest.slice(end + 1);
    }
    if (rest) parts.push(rest);
    return parts;
  }

  // a phrase with its [highlights]; capitalize marks the first letter of the sentence
  private renderPhrase(phrase: Phrase, capitalize: boolean): TemplateResult {
    const item = this.config!.items[phrase.index];
    const tappable = !!(item.navigation_path || item.tap_action || item.more_info);
    const color = item.color ? markColors[item.color] || item.color : "";
    let text = phrase.text;
    if (capitalize) {
      // first visible letter: skip a leading "[" and icon placeholders
      let position = 0;
      for (let guard = 0; guard < 10; guard++) {
        if (text.charAt(position) === "[") position++;
        else if (text.startsWith("{icon", position) && text.indexOf("}", position) > 0) position = text.indexOf("}", position) + 1;
        else if (text.charAt(position) === " ") position++;
        else break;
      }
      text = text.slice(0, position) + text.charAt(position).toUpperCase() + text.slice(position + 1);
    }
    const parts: Array<TemplateResult | string> = [];
    let rest = text;
    for (let guard = 0; guard < 10; guard++) {
      const start = rest.indexOf("[");
      const end = start < 0 ? -1 : rest.indexOf("]", start);
      if (start < 0 || end < 0) break;
      parts.push(...this.withIcons(rest.slice(0, start), item));
      const classes = ["mark", phrase.alert ? "alert" : "", color ? "colored" : "", tappable ? "link" : ""].filter(Boolean).join(" ");
      const content = this.withIcons(rest.slice(start + 1, end), item);
      parts.push(tappable
        ? html`<span class=${classes} style=${color ? `--markColor: ${color}` : ""} role="link" tabindex="0"
            @pointerdown=${(event: Event) => event.stopPropagation()}
            @click=${(event: Event) => this.onMark(event, item)} @keydown=${(event: Event) => this.onMark(event, item)}>${content}</span>`
        : html`<span class=${classes} style=${color ? `--markColor: ${color}` : ""}>${content}</span>`);
      rest = rest.slice(end + 1);
    }
    parts.push(...this.withIcons(rest, item));
    return html`${parts}`;
  }

  // "a, b und c." – phrases joined like a sentence
  private renderSentence(phrases: Phrase[]): TemplateResult | typeof nothing {
    if (!phrases.length) return nothing;
    const andWord = this.config!.and_word || this.t("and");
    return html`${phrases.map((phrase, index) => {
      const separator = index === 0 ? "" : index === phrases.length - 1 ? ` ${andWord} ` : ", ";
      return html`${separator}${this.renderPhrase(phrase, index === 0)}`;
    })}.`;
  }

  private renderLines(): TemplateResult[] {
    const config = this.config!;
    const phrases = this.phrases();
    const lineOf = (phrase: Phrase) => Number(config.items[phrase.index].line) || 1;
    const lineNumbers = [...new Set([1, ...phrases.map(lineOf)])].sort((first, second) => first - second);
    return lineNumbers.flatMap((lineNumber) => {
      const linePhrases = phrases.filter((phrase) => lineOf(phrase) === lineNumber);
      const alerts = linePhrases.filter((phrase) => phrase.alert);
      const others = linePhrases.filter((phrase) => !phrase.alert);
      // first line: "Alles ruhig." while there is no alert and at most one other phrase
      const calm = lineNumber === 1 && !alerts.length && config.calm_text !== false && others.length <= 1
        ? (config.calm_text || this.t("calm")) : "";
      if (!alerts.length && !others.length && !calm) return [];
      const parts = [
        calm ? html`${calm}` : nothing,
        alerts.length ? html`${calm ? " " : ""}${this.renderSentence(alerts)}` : nothing,
        others.length ? html`${calm || alerts.length ? " " : ""}${this.renderSentence(others)}` : nothing,
      ];
      return [html`<div class="line">${parts}</div>`];
    });
  }

  // ---------- clock ----------

  private greeting(): string {
    const hour = this.now.getHours();
    const key = hour < 5 ? "night" : hour < 11 ? "morning" : hour < 17 ? "day" : hour < 22 ? "evening" : "night";
    return this.t(`greeting.${key}`);
  }

  private renderClock(): TemplateResult {
    const now = this.now;
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return html`
      <div class="clock">
        <div class="time">${time}</div>
        <div class="separator"></div>
        <div class="date">
          <span class="weekday">${now.toLocaleDateString(this.language, { weekday: "long" })}</span>
          <span>${now.toLocaleDateString(this.language, { day: "numeric", month: "long" })}</span>
        </div>
      </div>
      ${this.config!.greeting ? html`<div class="greeting">${this.greeting()}</div>` : nothing}
    `;
  }

  // positions of the separator and the date, measured on the digits with the font actually used
  private alignDate(): void {
    const root = this.renderRoot as ShadowRoot | undefined;
    const time = root?.querySelector<HTMLElement>(".time");
    const date = root?.querySelector<HTMLElement>(".date");
    const card = root?.querySelector<HTMLElement>("ha-card");
    if (!time || !date || !card || !time.isConnected) return;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    const metricsOf = (element: HTMLElement, sample: string) => {
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight) || size * 1.2;
      context.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      const metrics = context.measureText(sample);
      const baseline = (lineHeight - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
      return { metrics, lineHeight, baseline };
    };
    const timeMetrics = metricsOf(time, "2");
    if (!timeMetrics.metrics.fontBoundingBoxAscent) return;
    // digits span from cap top to the baseline of the time box
    const capTop = timeMetrics.baseline - timeMetrics.metrics.actualBoundingBoxAscent;
    const belowBaseline = timeMetrics.lineHeight - timeMetrics.baseline;
    card.style.setProperty("--capTop", `${Math.max(0, capTop).toFixed(1)}px`);
    card.style.setProperty("--baseGap", `${Math.max(0, belowBaseline).toFixed(1)}px`);
    // date: its last line sits on the baseline of the time
    const dateMetrics = metricsOf(date, "D");
    card.style.setProperty("--dateBaseGap", `${(belowBaseline - (dateMetrics.lineHeight - dateMetrics.baseline)).toFixed(1)}px`);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config || !this.hass) return nothing;
    const showClock = this.config.clock !== false;
    return html`
      <ha-card>
        ${showClock ? this.renderClock() : nothing}
        <div class="prose ${showClock ? "" : "noClock"}">${this.renderLines()}</div>
      </ha-card>
    `;
  }

  getCardSize(): number {
    return 3;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig(): Record<string, unknown> {
    return { items: [{ entity: "sensor.lights_on", show: { above: 0 }, text: "[{value} lights] are on", text_one: "[1 light] is on" }] };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-summary-editor");
  }
}

registerElement("graphite-summary-editor", GraphiteSummaryEditor);
registerCard("graphite-summary", GraphiteSummary, {
  name: "Graphite Summary",
  description: "Clock with date and a status summary written as prose with tappable highlights.",
});
