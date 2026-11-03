// SBO Shopping Card - shopping list (todo entity, e.g. Bring) with quick pick chips and variants.
// Left: free input and the open items (scrolls on its own), right: quick pick groups.
// Removing an item marks it as completed (Bring keeps it under "recently used").
// Touch sizes: list items 52px, chips and variants 44px, text 15px (tablet friendly).
// Products with a fixed description ({name: Zwiebeln, description: gelb}) are products of their own:
// "Zwiebeln · gelb" and "Zwiebeln · rot" can be on the list at the same time (Bring keeps both).
const cardVersion = "0.8.2";

const cardStyles = `
  :host {
    display: block;
    container-type: inline-size;
    --shopTile: var(--sbo-surface-tile, #1f1f20);
    --shopTileHi: var(--sbo-surface-tile-active, #2b2b2c);
    --shopText: var(--sbo-text-primary, #f3f3f4);
    --shopText2: var(--sbo-text-secondary, #b4b4b8);
    --shopText3: var(--sbo-text-muted, #8f8f92);
    --shopAccent: var(--sbo-accent, #f5c48a);
    --shopAccentInk: var(--sbo-accent-ink, #3a2410);
    --shopDanger: var(--sbo-danger, #e8908a);
    --shopRadius: var(--sbo-radius-tile, 12px);
  }
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }
  /* panel look per column (same tokens as sbo-panel-card); tiles inside use the tile surface */
  :host([panels]) .listColumn,
  :host([panels]) .quickColumn {
    background: var(--sbo-panel-surface, var(--sbo-surface-panel, #161617));
    border-radius: var(--sbo-panel-radius, var(--sbo-radius-panel, 20px));
    padding: var(--sbo-panel-padding, var(--sbo-padding-panel, 16px));
  }
  .panelTitle {
    font-size: var(--sbo-title-size, 18px);
    font-weight: var(--sbo-title-weight, 400);
    line-height: 1.2;
    color: var(--sbo-title-color, var(--shopText));
    margin-bottom: 12px;
  }
  .panelTitle[hidden] { display: none; }
  /* title and sync state in one line on one baseline, separated by a thin line
     (same as panel card, room cards and dialog headers) */
  .panelHeader {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
  }
  .panelHeader .panelTitle { flex: none; margin-bottom: 0; }
  /* sync state of the todo integration: saved / saving (n) / error;
     a block with inline content, so its baseline is the one of the text */
  .syncStatus {
    min-width: 0;
    padding-left: 12px;
    position: relative;
    /* 2px more room on top for the separator line (it reads too short at cap height);
       the negative margin keeps the text on the shared baseline */
    padding-top: 2px;
    margin-top: -2px;
    font-size: 13px;
    line-height: 16px;
    color: var(--shopText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    --mdc-icon-size: 14px;
  }
  /* separator line from the title's cap height down to the shared baseline
     (13px text in a 16px line: the baseline sits 3.5px above the bottom) */
  .syncStatus::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 3.5px;
    width: 1px;
    background: var(--sbo-separator, color-mix(in srgb, var(--sbo-ink, #f3f3f4) 24%, var(--sbo-ground, #0a0a0b)));
  }
  .syncStatus:empty { display: none; }
  .syncStatus.saving { color: var(--shopAccent); }
  .syncStatus.error { color: var(--shopDanger); }
  /* icon and spinner share one fixed 14px slot, so the text never moves; centered on the lowercase letters */
  .syncStatus ha-icon,
  .syncStatus .syncSpinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 5px;
    vertical-align: -2px;
  }
  /* overflow hidden: the icon's baseline is its bottom edge like the spinner's (not the inner svg's),
     line-height 0 keeps the svg at the top of its slot */
  .syncStatus ha-icon {
    overflow: hidden;
    line-height: 0;
  }
  .syncSpinner {
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1.5px solid color-mix(in srgb, var(--shopAccent) 30%, transparent);
    border-top-color: var(--shopAccent);
    animation: shopSpin 0.9s linear infinite;
  }
  @keyframes shopSpin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .syncSpinner { animation-duration: 3s; } }
  .inputRow {
    display: flex;
    gap: 8px;
  }
  input {
    flex: 1;
    min-width: 0;
    height: 48px;
    border: none;
    outline: none;
    border-radius: var(--shopRadius);
    background: var(--shopTile);
    color: var(--shopText);
    font: inherit;
    font-size: 15px;
    padding: 0 14px;
  }
  input::placeholder { color: var(--shopText3); }
  input:focus-visible { box-shadow: inset 0 0 0 1.5px var(--shopAccent); }
  button {
    border: none;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .addButton {
    width: 52px;
    height: 48px;
    border-radius: var(--shopRadius);
    background: var(--shopAccent);
    color: var(--shopAccentInk);
    display: grid;
    place-items: center;
    --mdc-icon-size: 22px;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  .emptyList {
    font-size: 15px;
    color: var(--shopText3);
    padding: 10px 2px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 12px 0 6px;
    border-radius: var(--shopRadius);
    background: var(--shopTile);
  }
  .item.editable { cursor: pointer; }
  /* on its way to the todo integration */
  .item.pending .name { color: var(--shopText2); }
  .remove {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: none;
    color: var(--shopText3);
    display: grid;
    place-items: center;
    flex: none;
    --mdc-icon-size: 20px;
  }
  .remove:hover, .remove:focus-visible { color: var(--shopDanger); background: color-mix(in srgb, var(--shopDanger) 14%, var(--shopTile)); }
  .name {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    color: var(--shopText);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .detail {
    font-size: 13px;
    color: var(--shopAccent);
    background: color-mix(in srgb, var(--shopAccent) 14%, var(--shopTile));
    padding: 3px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .detail.empty {
    color: var(--shopText3);
    background: none;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--shopText) 14%, transparent);
  }
  .groups {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    column-gap: 16px;
  }
  .group.wide { grid-column: 1 / -1; }
  /* group titles like tile names (13px, 500, secondary text) */
  .groupLabel {
    font-size: 14px;
    font-weight: 500;
    color: var(--shopText);
    margin: 18px 2px 10px;
  }
  .group:first-child .groupLabel { margin-top: 0; }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    height: 44px;
    padding: 0 16px;
    border-radius: 999px;
    background: var(--shopTile);
    color: var(--shopText2);
    font-size: 15px;
    display: inline-flex;
    /* name and detail share one baseline, the line is centered in the chip height
       (align-content needs a wrapping flex container) */
    flex-wrap: wrap;
    align-content: center;
    align-items: baseline;
    gap: 6px;
    user-select: none;
  }
  .chip .more { font-size: 12px; color: var(--shopText3); }
  /* fixed description of a product (config): a quiet detail after the name, not a choice */
  .chip .fixedDetail { font-size: 13px; color: var(--shopText3); }
  .chip.on .fixedDetail { color: var(--shopText2); }
  .item .fixedDetail { margin-left: 6px; font-size: 13px; color: var(--shopText2); }
  /* marks chips with a variant choice */
  .chip .moreIcon { --mdc-icon-size: 18px; display: inline-flex; align-self: center; margin: 0 -4px 0 -2px; color: var(--shopText2); }
  .chip.on .moreIcon { color: var(--shopAccent); }
  .chip.on { background: color-mix(in srgb, var(--shopAccent) 20%, var(--shopTileHi)); color: var(--shopText); }
  .chip.on .more { color: var(--shopAccent); }
  /* variant chooser floats below the chips (overlay), so the dialog keeps its height and position */
  .chipArea {
    position: relative;
  }
  .variants {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 6px);
    z-index: 3;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
    background: var(--shopTileHi);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55), inset 0 0 0 1px color-mix(in srgb, var(--shopText) 8%, transparent);
  }
  .hint {
    width: 100%;
    font-size: 13px;
    color: var(--shopText2);
    margin: 0 2px 2px;
  }
  .variant {
    height: 44px;
    min-width: 52px;
    padding: 0 16px;
    border-radius: 12px;
    background: var(--shopTile);
    color: var(--shopText);
    font-size: 15px;
  }
  .variant.selected { background: var(--shopAccent); color: var(--shopAccentInk); font-weight: 500; }
  .variant.removeVariant { margin-left: auto; background: none; color: var(--shopDanger); }
  .variant.close { margin-left: auto; background: none; color: var(--shopText2); }
  .variant.removeVariant + .variant.close { margin-left: 0; }
  /* two columns once the card is wide enough (tablet dialog); after the base rules so it wins */
  @container (min-width: 640px) {
    .columns { grid-template-columns: 360px minmax(0, 1fr); }
    :host([panels]) .columns { gap: var(--sbo-gap-panel, 12px); }
    .listColumn { max-height: var(--sbo-shopping-list-height, 600px); overflow-y: auto; scrollbar-width: thin; }
    .groups { grid-template-columns: 1fr 1fr; }
    .group:first-child:not(.wide) + .group:not(.wide) .groupLabel { margin-top: 0; }
  }
  .chip:focus-visible, .variant:focus-visible, .addButton:focus-visible, .item:focus-visible {
    outline: 2px solid var(--shopAccent);
    outline-offset: 1px;
  }
`;

class SboShoppingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.items = [];
    this.pending = new Map();
    this.openVariants = null;
  }

  setConfig(config) {
    if (!config || !config.entity) throw new Error("sbo-shopping-card: 'entity' (todo list) is required");
    this.config = config;
    this.groups = (config.groups || []).map((group) => ({
      name: group.name,
      wide: !!group.wide,
      items: (group.items || []).map((item) => {
        if (typeof item === "string")
          return { name: item, description: "", variants: null };
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
    this.fixedKeys = new Set();
    for (const group of this.groups)
      for (const item of group.items)
        if (item.description) this.fixedKeys.add(this.productKey(item.name, item.description));
    this.shadowRoot.innerHTML = `
      <style>${cardStyles}</style>
      <div class="columns">
        <div class="listColumn">
          <div class="panelHeader">
            <div class="panelTitle" data-title="list" hidden></div>
            <div class="syncStatus" role="status" aria-live="polite"></div>
          </div>
          <form class="inputRow">
            <input type="text" enterkeyhint="done" autocomplete="off" aria-label="Artikel hinzufügen">
            <button class="addButton" type="submit" aria-label="Hinzufügen"><ha-icon icon="mdi:plus"></ha-icon></button>
          </form>
          <div class="list" role="list"></div>
        </div>
        <div class="quickColumn">
          <div class="panelTitle" data-title="quick" hidden></div>
          <div class="groups"></div>
        </div>
      </div>`;
    // panels: both columns get the panel surface (like sbo-panel-card), optional titles
    this.toggleAttribute("panels", config.panels !== false);
    // titles (default German texts, empty string hides a title)
    for (const [key, title] of [["list", config.list_title ?? "Einkaufsliste"], ["quick", config.quick_title ?? "Schnellwahl"]]) {
      const titleElement = this.shadowRoot.querySelector(`[data-title="${key}"]`);
      titleElement.textContent = title || "";
      titleElement.hidden = !title;
    }
    this.shadowRoot.querySelector("input").placeholder = config.placeholder || "Anderer Artikel …";
    this.shadowRoot.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = this.shadowRoot.querySelector("input");
      const name = input.value.trim();
      // free text: identified by its name only
      if (name) this.setItem(this.nameKey(name), name, "");
      input.value = "";
      this.render();
    });
    this.shadowRoot.addEventListener("click", (event) => this.handleClick(event));
    this.render();
    this.subscribe();
  }

  set hass(hass) {
    const first = !this.hassObject;
    this.hassObject = hass;
    if (first) this.subscribe();
  }

  get hass() {
    return this.hassObject;
  }

  connectedCallback() {
    this.subscribe();
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe.then((unsubscribe) => unsubscribe()).catch(() => {});
      this.unsubscribe = null;
    }
  }

  // live item list of the todo entity
  subscribe() {
    if (this.unsubscribe || !this.hassObject || !this.config || !this.isConnected) return;
    this.unsubscribe = this.hassObject.connection.subscribeMessage((message) => {
      this.items = message.items || [];
      this.syncPending();
      if (this.pending.size === 0) this.syncError = null;
      this.render();
    }, { type: "todo/item/subscribe", entity_id: this.config.entity });
    this.unsubscribe.catch(() => { this.unsubscribe = null; });
  }

  nameKey(name) {
    return String(name).trim().toLowerCase();
  }

  productKey(name, description) {
    return description ? `${this.nameKey(name)}|${this.nameKey(description)}` : this.nameKey(name);
  }

  // key of a list item: name and description for products with a fixed description,
  // otherwise only the name (a variant or free text description belongs to the same product)
  itemKey(item) {
    const fixedKey = this.productKey(item.summary, item.description || "");
    return this.fixedKeys.has(fixedKey) ? fixedKey : this.nameKey(item.summary);
  }

  isFixedKey(key) {
    return this.fixedKeys.has(key);
  }

  findItem(key, status) {
    return this.items.find((item) => this.itemKey(item) === key && (!status || item.status === status));
  }

  // The todo integration (Bring) needs a few seconds until a change shows up in the list.
  // Pending changes are kept locally (shown right away) and finished once the item arrives,
  // so a quick "add, then pick a variant" never creates a second item.
  syncPending() {
    const now = Date.now();
    for (const [key, change] of this.pending) {
      const open = this.findItem(key, "needs_action");
      if (change.removed) {
        // complete it once it is on the list, done when the list no longer shows it
        if (open && !change.removeSent) {
          change.removeSent = true;
          this.callTodo("update_item", { item: open.uid, status: "completed" });
        }
        if ((!open && change.removeSent) || now - change.since > 30000) this.pending.delete(key);
        continue;
      }
      if (!open) {
        if (now - change.since > 30000) this.pending.delete(key);
        continue;
      }
      if ((open.description || "") === change.description) {
        this.pending.delete(key);
      } else if (!change.updateSent) {
        change.updateSent = true;
        this.callTodo("update_item", { item: open.uid, description: change.description });
      } else if (now - change.since > 30000) {
        this.pending.delete(key);
      }
    }
  }

  // open items as shown: list items with pending changes applied, plus items still on their way
  openItems() {
    const shown = [];
    const seen = new Set();
    for (const item of this.items) {
      if (item.status !== "needs_action") continue;
      const key = this.itemKey(item);
      const change = seen.has(key) ? null : this.pending.get(key);
      seen.add(key);
      if (change && change.removed) continue;
      shown.push({ ...item, key, description: change ? change.description : item.description });
    }
    for (const [key, change] of this.pending)
      if (!seen.has(key) && !change.removed) shown.push({ uid: "", key, summary: change.name, description: change.description, pending: true });
    return shown;
  }

  isOnList(key) {
    const change = this.pending.get(key);
    if (change) return !change.removed;
    return !!this.findItem(key, "needs_action");
  }

  shownDescription(key) {
    const change = this.pending.get(key);
    if (change) return change.description;
    return this.findItem(key, "needs_action")?.description || "";
  }

  variantsOf(name) {
    const key = this.nameKey(name);
    for (const group of this.groups)
      for (const item of group.items)
        if (!item.description && this.nameKey(item.name) === key) return item.variants;
    return null;
  }

  callTodo(service, data) {
    return this.hassObject.callService("todo", service, data, { entity_id: this.config.entity })
      .catch((error) => {
        this.syncError = error?.message || "Fehler";
        this.render();
      });
  }

  // status line in the list header; re-checks itself while changes are open (timeouts)
  renderSyncStatus() {
    const status = this.shadowRoot.querySelector(".syncStatus");
    if (!status) return;
    const openChanges = this.pending.size;
    if (openChanges === 0 && this.syncError) {
      status.className = "syncStatus error";
      status.innerHTML = `<ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>nicht gespeichert</span>`;
      status.title = this.syncError;
    } else if (openChanges > 0) {
      status.className = "syncStatus saving";
      status.innerHTML = `<span class="syncSpinner"></span><span>speichert${openChanges > 1 ? ` (${openChanges})` : ""} …</span>`;
      status.title = "";
    } else {
      status.className = "syncStatus";
      status.innerHTML = `<ha-icon icon="mdi:check"></ha-icon><span>synchronisiert</span>`;
      status.title = "";
    }
    clearTimeout(this.syncTimer);
    if (openChanges > 0)
      this.syncTimer = setTimeout(() => { this.syncPending(); this.render(); }, 5000);
  }

  // add an item or change its description; reactivates a completed item of the same product
  setItem(key, name, description) {
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
    this.pending.set(key, { name: open ? open.summary : name, description, since: Date.now(), updateSent: !!open });
    if (open) {
      if ((open.description || "") !== description) this.callTodo("update_item", { item: open.uid, description });
      else this.pending.delete(key);
      return;
    }
    const completed = this.findItem(key, "completed");
    if (completed) this.callTodo("update_item", { item: completed.uid, status: "needs_action", description });
    else this.callTodo("add_item", description ? { item: name, description } : { item: name });
    this.pending.get(key).updateSent = true;
  }

  // removing = marking as completed (Bring keeps it under "recently used")
  removeItem(key, name) {
    // kept as a pending change until the list confirms it (sync status), or completed on arrival
    const description = this.isFixedKey(key) ? this.shownDescription(key) : "";
    this.pending.set(key, { name, description, since: Date.now(), removed: true, removeSent: false });
    this.syncPending();
  }

  handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action, name, variant } = target.dataset;
    const key = target.dataset.key || (name ? this.nameKey(name) : "");
    const fixedDescription = target.dataset.description || "";
    const openKey = this.openVariants ? this.nameKey(this.openVariants) : null;
    if (action === "remove") {
      event.stopPropagation();
      this.removeItem(key, name);
      if (openKey && openKey === key) this.openVariants = null;
      this.render();
      return;
    }
    if (action === "edit") {
      if (this.variantsOf(name)) this.openVariants = this.openVariants === name ? null : name;
    } else if (action === "chip") {
      const isOn = this.isOnList(key);
      if (!fixedDescription && this.variantsOf(name)) {
        // add right away (without variant), choosing a variant is optional
        if (!isOn) this.setItem(key, name, "");
        this.openVariants = this.openVariants === name ? null : name;
      } else if (isOn) {
        this.removeItem(key, name);
      } else {
        this.setItem(key, name, fixedDescription);
      }
    } else if (action === "variant") {
      this.setItem(openKey, this.openVariants, variant || "");
      this.openVariants = null;
    } else if (action === "removeOpen") {
      this.removeItem(openKey, this.openVariants);
      this.openVariants = null;
    } else if (action === "close") {
      this.openVariants = null;
    }
    this.render();
  }

  escape(text) {
    return String(text ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  render() {
    if (!this.config || !this.shadowRoot.querySelector(".list")) return;
    const openItems = this.openItems();
    this.renderSyncStatus();

    // list (left)
    const list = this.shadowRoot.querySelector(".list");
    if (openItems.length === 0) {
      list.innerHTML = `<div class="emptyList">${this.escape(this.config.empty_text || "Noch nichts auf der Liste.")}</div>`;
    } else {
      list.innerHTML = openItems.map((item) => {
        // fixed description: quiet detail after the name; otherwise variant / free description as pill
        const isFixed = this.isFixedKey(item.key);
        const variants = isFixed ? null : this.variantsOf(item.summary);
        const fixedDetail = isFixed ? `<span class="fixedDetail">${this.escape(item.description)}</span>` : "";
        const pill = isFixed ? "" : (item.description
          ? `<span class="detail">${this.escape(item.description)}</span>`
          : (variants ? `<span class="detail empty">+ Sorte</span>` : ""));
        const editable = variants ? ` editable" tabindex="0" data-action="edit" data-name="${this.escape(item.summary)}` : "";
        const label = isFixed ? `${item.summary} ${item.description}` : item.summary;
        return `<div class="item${item.pending ? " pending" : ""}${editable}" role="listitem">`
          + `<button class="remove" data-action="remove" data-key="${this.escape(item.key)}" data-name="${this.escape(item.summary)}" aria-label="${this.escape(label)} entfernen"><ha-icon icon="mdi:close"></ha-icon></button>`
          + `<div class="name">${this.escape(item.summary)}${fixedDetail}</div>${pill}</div>`;
      }).join("");
    }

    // quick pick groups (right)
    const groups = this.shadowRoot.querySelector(".groups");
    groups.innerHTML = this.groups.map((group) => {
      const chips = group.items.map((item) => {
        const key = this.productKey(item.name, item.description);
        const open = this.isOnList(key);
        const description = open && item.variants ? this.shownDescription(key) : "";
        const more = item.description
          ? `<span class="fixedDetail">${this.escape(item.description)}</span>`
          : (item.variants
            ? (description ? `<span class="more">${this.escape(description)}</span>` : `<ha-icon class="moreIcon" icon="mdi:chevron-down"></ha-icon>`)
            : "");
        return `<button class="chip${open ? " on" : ""}" data-action="chip" data-key="${this.escape(key)}" data-name="${this.escape(item.name)}" data-description="${this.escape(item.description)}" aria-pressed="${open ? "true" : "false"}">${this.escape(item.name)}${more}</button>`;
      }).join("");
      let variantsHtml = "";
      if (this.openVariants && group.items.some((item) => !item.description && item.name === this.openVariants)) {
        const current = this.shownDescription(this.nameKey(this.openVariants));
        variantsHtml = `<div class="variants"><div class="hint">${this.escape(this.openVariants)} – Sorte oder Menge (optional)</div>`
          + `<button class="variant${current === "" ? " selected" : ""}" data-action="variant" data-variant="">ohne</button>`
          + this.variantsOf(this.openVariants).map((variant) => `<button class="variant${current === variant ? " selected" : ""}" data-action="variant" data-variant="${this.escape(variant)}">${this.escape(variant)}</button>`).join("")
          + (this.isOnList(this.nameKey(this.openVariants)) ? `<button class="variant removeVariant" data-action="removeOpen">entfernen</button>` : "")
          + `<button class="variant close" data-action="close">fertig</button></div>`;
      }
      return `<div class="group${group.wide ? " wide" : ""}"><div class="groupLabel">${this.escape(group.name)}</div><div class="chipArea"><div class="chips">${chips}</div>${variantsHtml}</div></div>`;
    }).join("");
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }

  static getStubConfig() {
    return { entity: "todo.shopping_list", groups: [{ name: "Basics", items: ["Brot", { name: "Eier", variants: ["6", "10", "12"] }, { name: "Zwiebeln", description: "gelb" }, { name: "Zwiebeln", description: "rot" }] }] };
  }
}

customElements.define("sbo-shopping-card", SboShoppingCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "sbo-shopping-card",
  name: "SBO Shopping Card",
  description: "Shopping list with quick pick groups, variants and products with a fixed description (todo entity, e.g. Bring).",
});
console.info(`%c SBO-SHOPPING-CARD %c ${cardVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
