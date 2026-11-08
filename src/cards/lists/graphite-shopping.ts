// graphite-shopping: shopping list of a todo entity (e.g. Bring) with quick pick chips and variants.
// Left: free input and the open items, right: quick pick groups. Removing an item marks it as
// completed (Bring keeps it under "recently used"). Products with a fixed description
// ({name: Onions, description: red}) are products of their own and can be on the list next to
// "Onions · yellow". Touch sizes: list items 52px, chips and variants 44px, text 15px.
import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HomeAssistant } from "../../core/types";
import { GraphiteShoppingEditor } from "./graphite-shopping-editor";
import { shoppingStyles } from "./shopping-styles";

export interface ShoppingProductConfig {
  name: string;
  // fixed description: a product of its own (excludes variants)
  description?: string;
  // optional choice after adding (kind or amount), stored as description
  variants?: Array<string | number>;
}

export interface ShoppingGroupConfig {
  name: string;
  wide?: boolean;
  items: Array<string | ShoppingProductConfig>;
}

export interface ShoppingConfig extends GraphiteCardConfig {
  entity: string;
  groups?: ShoppingGroupConfig[];
  panels?: boolean;
  list_title?: string;
  quick_title?: string;
  placeholder?: string;
  empty_text?: string;
}

interface Product {
  name: string;
  description: string;
  variants: string[] | null;
}

interface Group {
  name: string;
  wide: boolean;
  items: Product[];
}

interface TodoItem {
  uid: string;
  summary: string;
  status: "needs_action" | "completed";
  description?: string | null;
}

// a change on its way to the todo integration
interface PendingChange {
  name: string;
  description: string;
  since: number;
  updateSent?: boolean;
  removed?: boolean;
  removeSent?: boolean;
}

interface ShownItem {
  uid: string;
  key: string;
  summary: string;
  description: string;
  pending?: boolean;
}

const pendingTimeout = 30000;
const syncRecheck = 5000;

export class GraphiteShopping extends GraphiteCard<ShoppingConfig> {
  static properties = {
    ...GraphiteCard.properties,
    items: { state: true },
    openVariants: { state: true },
    syncError: { state: true },
  };

  static styles = shoppingStyles;

  declare items: TodoItem[];
  // product name whose variant chooser is open
  declare openVariants?: string;
  declare syncError?: string;

  private groups: Group[] = [];
  private fixedKeys = new Set<string>();
  private pending = new Map<string, PendingChange>();
  private unsubscribe?: Promise<() => void>;
  private syncTimer?: number;

  constructor() {
    super();
    this.items = [];
  }

  protected normalizeConfig(config: ShoppingConfig): ShoppingConfig {
    if (!config.entity) throw new Error("entity (todo list) is required");
    this.groups = (config.groups ?? []).map((group) => ({
      name: group.name,
      wide: !!group.wide,
      items: (group.items ?? []).map((item): Product => {
        if (typeof item === "string") return { name: item, description: "", variants: null };
        const description = item.description != null ? String(item.description).trim() : "";
        return {
          name: item.name,
          description,
          // a fixed description and a variant choice exclude each other
          variants: !description && Array.isArray(item.variants) ? item.variants.map(String) : null,
        };
      }),
    }));
    // products with a fixed description are identified by name and description
    this.fixedKeys = new Set(this.groups.flatMap((group) => group.items)
      .filter((item) => item.description).map((item) => this.productKey(item.name, item.description)));
    if (this.unsubscribe && this.config?.entity !== config.entity) this.stopSubscription();
    return config;
  }

  protected hassChanged(_hass: HomeAssistant | undefined): void {
    this.subscribe();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.subscribe();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopSubscription();
    window.clearTimeout(this.syncTimer);
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("config")) this.subscribe();
    // re-check open changes (timeouts) while there are any
    window.clearTimeout(this.syncTimer);
    if (this.pending.size > 0) {
      this.syncTimer = window.setTimeout(() => {
        this.syncPending();
        this.requestUpdate();
      }, syncRecheck);
    }
  }

  // ---------- todo list ----------

  // live item list of the todo entity
  private subscribe(): void {
    if (this.unsubscribe || !this.hass || !this.config || !this.isConnected) return;
    this.unsubscribe = this.hass.connection.subscribeMessage<{ items?: TodoItem[] }>((message) => {
      this.items = message.items ?? [];
      this.syncPending();
      if (this.pending.size === 0) this.syncError = undefined;
      this.requestUpdate();
    }, { type: "todo/item/subscribe", entity_id: this.config.entity });
    this.unsubscribe.catch(() => { this.unsubscribe = undefined; });
  }

  private stopSubscription(): void {
    this.unsubscribe?.then((unsubscribe) => unsubscribe()).catch(() => undefined);
    this.unsubscribe = undefined;
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.localize(`shopping.${key}`, params);
  }

  private nameKey(name: string): string {
    return String(name).trim().toLowerCase();
  }

  private productKey(name: string, description: string): string {
    return description ? `${this.nameKey(name)}|${this.nameKey(description)}` : this.nameKey(name);
  }

  // key of a list item: name and description for products with a fixed description,
  // otherwise only the name (a variant or free text description belongs to the same product)
  private itemKey(item: TodoItem): string {
    const fixedKey = this.productKey(item.summary, item.description || "");
    return this.fixedKeys.has(fixedKey) ? fixedKey : this.nameKey(item.summary);
  }

  private findItem(key: string, status?: TodoItem["status"]): TodoItem | undefined {
    return this.items.find((item) => this.itemKey(item) === key && (!status || item.status === status));
  }

  // The todo integration (Bring) needs a few seconds until a change shows up in the list.
  // Pending changes are kept locally (shown right away) and finished once the item arrives,
  // so a quick "add, then pick a variant" never creates a second item.
  private syncPending(): void {
    const now = Date.now();
    for (const [key, change] of this.pending) {
      const open = this.findItem(key, "needs_action");
      if (change.removed) {
        // complete it once it is on the list, done when the list no longer shows it
        if (open && !change.removeSent) {
          change.removeSent = true;
          this.callTodo("update_item", { item: open.uid, status: "completed" });
        }
        if ((!open && change.removeSent) || now - change.since > pendingTimeout) this.pending.delete(key);
        continue;
      }
      if (!open) {
        if (now - change.since > pendingTimeout) this.pending.delete(key);
        continue;
      }
      if ((open.description || "") === change.description) {
        this.pending.delete(key);
      } else if (!change.updateSent) {
        change.updateSent = true;
        this.callTodo("update_item", { item: open.uid, description: change.description });
      } else if (now - change.since > pendingTimeout) {
        this.pending.delete(key);
      }
    }
  }

  // open items as shown: list items with pending changes applied, plus items still on their way
  private openItems(): ShownItem[] {
    const shown: ShownItem[] = [];
    const seen = new Set<string>();
    for (const item of this.items) {
      if (item.status !== "needs_action") continue;
      const key = this.itemKey(item);
      const change = seen.has(key) ? undefined : this.pending.get(key);
      seen.add(key);
      if (change?.removed) continue;
      shown.push({ uid: item.uid, key, summary: item.summary, description: change ? change.description : item.description || "" });
    }
    for (const [key, change] of this.pending)
      if (!seen.has(key) && !change.removed) shown.push({ uid: "", key, summary: change.name, description: change.description, pending: true });
    return shown;
  }

  private isOnList(key: string): boolean {
    const change = this.pending.get(key);
    if (change) return !change.removed;
    return !!this.findItem(key, "needs_action");
  }

  private shownDescription(key: string): string {
    const change = this.pending.get(key);
    if (change) return change.description;
    return this.findItem(key, "needs_action")?.description || "";
  }

  private variantsOf(name: string): string[] | null {
    const key = this.nameKey(name);
    for (const group of this.groups)
      for (const item of group.items)
        if (!item.description && this.nameKey(item.name) === key) return item.variants;
    return null;
  }

  private callTodo(service: string, data: Record<string, unknown>): void {
    this.hass?.callService("todo", service, data, { entity_id: this.config!.entity }).catch((error) => {
      this.syncError = (error as { message?: string })?.message || this.t("error");
    });
  }

  // add an item or change its description; reactivates a completed item of the same product
  private setItem(key: string, name: string, description: string): void {
    const change = this.pending.get(key);
    if (change && !change.removed) {
      // still on its way: only remember the new description, syncPending applies it
      change.description = description;
      change.updateSent = false;
      change.since = Date.now();
      this.syncPending();
      return;
    }
    const open = this.findItem(key, "needs_action");
    const newChange: PendingChange = { name: open ? open.summary : name, description, since: Date.now(), updateSent: !!open };
    this.pending.set(key, newChange);
    if (open) {
      if ((open.description || "") !== description) this.callTodo("update_item", { item: open.uid, description });
      else this.pending.delete(key);
      return;
    }
    const completed = this.findItem(key, "completed");
    if (completed) this.callTodo("update_item", { item: completed.uid, status: "needs_action", description });
    else this.callTodo("add_item", description ? { item: name, description } : { item: name });
    newChange.updateSent = true;
  }

  // removing = marking as completed; kept as a pending change until the list confirms it
  private removeItem(key: string, name: string): void {
    const description = this.fixedKeys.has(key) ? this.shownDescription(key) : "";
    this.pending.set(key, { name, description, since: Date.now(), removed: true, removeSent: false });
    this.syncPending();
  }

  // ---------- interaction ----------

  private changed(): void {
    this.requestUpdate();
  }

  private onSubmit(event: Event): void {
    event.preventDefault();
    const input = this.renderRoot.querySelector("input");
    const name = input?.value.trim() ?? "";
    // free text: identified by its name only
    if (name) this.setItem(this.nameKey(name), name, "");
    if (input) input.value = "";
    this.changed();
  }

  private onRemove(event: Event, item: ShownItem): void {
    event.stopPropagation();
    this.removeItem(item.key, item.summary);
    if (this.openVariants && this.nameKey(this.openVariants) === item.key) this.openVariants = undefined;
    this.changed();
  }

  private onEdit(item: ShownItem, event?: KeyboardEvent): void {
    if (event && event.key !== "Enter" && event.key !== " ") return;
    event?.preventDefault();
    this.openVariants = this.openVariants === item.summary ? undefined : item.summary;
  }

  private onChip(product: Product): void {
    const key = this.productKey(product.name, product.description);
    const isOn = this.isOnList(key);
    if (!product.description && product.variants) {
      // add right away (without variant), choosing a variant is optional
      if (!isOn) this.setItem(key, product.name, "");
      this.openVariants = this.openVariants === product.name ? undefined : product.name;
    } else if (isOn) {
      this.removeItem(key, product.name);
    } else {
      this.setItem(key, product.name, product.description);
    }
    this.changed();
  }

  private onVariant(variant: string): void {
    const name = this.openVariants;
    if (name) this.setItem(this.nameKey(name), name, variant);
    this.openVariants = undefined;
    this.changed();
  }

  private onRemoveOpen(): void {
    const name = this.openVariants;
    if (name) this.removeItem(this.nameKey(name), name);
    this.openVariants = undefined;
    this.changed();
  }

  // ---------- rendering ----------

  private renderSyncStatus(): TemplateResult {
    const openChanges = this.pending.size;
    if (openChanges === 0 && this.syncError)
      return html`<div class="syncStatus error" role="status" aria-live="polite" title=${this.syncError}>
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${this.t("notSaved")}</span></div>`;
    if (openChanges > 0)
      return html`<div class="syncStatus saving" role="status" aria-live="polite">
        <span class="syncSpinner"></span><span>${openChanges > 1 ? this.t("savingCount", { count: openChanges }) : this.t("saving")}</span></div>`;
    return html`<div class="syncStatus" role="status" aria-live="polite"><ha-icon icon="mdi:check"></ha-icon><span>${this.t("synced")}</span></div>`;
  }

  private renderItem(item: ShownItem): TemplateResult {
    // fixed description: quiet detail after the name; otherwise variant / free description as pill
    const isFixed = this.fixedKeys.has(item.key);
    const variants = isFixed ? null : this.variantsOf(item.summary);
    const label = isFixed ? `${item.summary} ${item.description}` : item.summary;
    const pill = isFixed
      ? nothing
      : item.description
        ? html`<span class="detail">${item.description}</span>`
        : variants ? html`<span class="detail empty">${this.t("addVariant")}</span>` : nothing;
    const classes = ["item", item.pending ? "pending" : "", variants ? "editable" : ""].filter(Boolean).join(" ");
    return html`
      <div class=${classes} role="listitem" tabindex=${variants ? "0" : nothing}
        @click=${variants ? () => this.onEdit(item) : nothing} @keydown=${variants ? (event: KeyboardEvent) => this.onEdit(item, event) : nothing}>
        ${variants ? html`<ha-ripple></ha-ripple>` : nothing}
        <button class="remove" aria-label=${this.t("remove", { name: label })} @click=${(event: Event) => this.onRemove(event, item)}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
        <div class="name">${item.summary}${isFixed ? html`<span class="fixedDetail">${item.description}</span>` : nothing}</div>
        ${pill}
      </div>
    `;
  }

  private renderChip(product: Product): TemplateResult {
    const key = this.productKey(product.name, product.description);
    const isOn = this.isOnList(key);
    const description = isOn && product.variants ? this.shownDescription(key) : "";
    const more = product.description
      ? html`<span class="fixedDetail">${product.description}</span>`
      : product.variants
        ? (description ? html`<span class="more">${description}</span>` : html`<ha-icon class="moreIcon" icon="mdi:chevron-down"></ha-icon>`)
        : nothing;
    return html`<button class="chip ${isOn ? "on" : ""}" aria-pressed=${isOn ? "true" : "false"} @click=${() => this.onChip(product)}><ha-ripple></ha-ripple>${product.name}${more}</button>`;
  }

  private renderVariants(): TemplateResult {
    const name = this.openVariants!;
    const current = this.shownDescription(this.nameKey(name));
    return html`
      <div class="variants">
        <div class="hint">${this.t("variantHint", { name })}</div>
        <button class="variant ${current === "" ? "selected" : ""}" @click=${() => this.onVariant("")}><ha-ripple></ha-ripple>${this.t("none")}</button>
        ${(this.variantsOf(name) ?? []).map((variant) => html`
          <button class="variant ${current === variant ? "selected" : ""}" @click=${() => this.onVariant(variant)}><ha-ripple></ha-ripple>${variant}</button>`)}
        ${this.isOnList(this.nameKey(name))
          ? html`<button class="variant removeVariant" @click=${this.onRemoveOpen}><ha-ripple></ha-ripple>${this.t("removeVariant")}</button>`
          : nothing}
        <button class="variant close" @click=${() => { this.openVariants = undefined; }}><ha-ripple></ha-ripple>${this.t("done")}</button>
      </div>
    `;
  }

  private renderGroup(group: Group): TemplateResult {
    const showsVariants = !!this.openVariants && group.items.some((item) => !item.description && item.name === this.openVariants);
    return html`
      <div class="group ${group.wide ? "wide" : ""}">
        <div class="groupLabel">${group.name}</div>
        <div class="chipArea">
          <div class="chips">${group.items.map((product) => this.renderChip(product))}</div>
          ${showsVariants ? this.renderVariants() : nothing}
        </div>
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;
    const config = this.config;
    const listTitle = config.list_title ?? this.t("listTitle");
    const quickTitle = config.quick_title ?? this.t("quickTitle");
    const openItems = this.openItems();
    return html`
      <div class="columns ${config.panels === false ? "" : "panels"}">
        <div class="listColumn">
          <div class="panelHeader">
            ${listTitle ? html`<div class="panelTitle">${listTitle}</div>` : nothing}
            ${this.renderSyncStatus()}
          </div>
          <form class="inputRow" @submit=${this.onSubmit}>
            <input type="text" enterkeyhint="done" autocomplete="off" aria-label=${this.t("addItem")}
              placeholder=${config.placeholder || this.t("placeholder")}>
            <button class="addButton" type="submit" aria-label=${this.t("add")}><ha-ripple></ha-ripple><ha-icon icon="mdi:plus"></ha-icon></button>
          </form>
          <div class="list" role="list">
            ${openItems.length
              ? openItems.map((item) => this.renderItem(item))
              : html`<div class="emptyList">${config.empty_text || this.t("empty")}</div>`}
          </div>
        </div>
        <div class="quickColumn">
          ${quickTitle ? html`<div class="panelTitle">${quickTitle}</div>` : nothing}
          <div class="groups">${this.groups.map((group) => this.renderGroup(group))}</div>
        </div>
      </div>
    `;
  }

  getCardSize(): number {
    return 8;
  }

  getGridOptions(): Record<string, unknown> {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig(): Record<string, unknown> {
    return {
      entity: "todo.shopping_list",
      groups: [{ name: "Basics", items: ["Bread", { name: "Eggs", variants: ["6", "10", "12"] }, { name: "Onions", description: "yellow" }, { name: "Onions", description: "red" }] }],
    };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-shopping-editor");
  }
}

registerElement("graphite-shopping-editor", GraphiteShoppingEditor);
registerCard("graphite-shopping", GraphiteShopping, {
  name: "Graphite Shopping",
  description: "Shopping list with quick pick groups, variants and products with a fixed description (todo entity, e.g. Bring).",
});
