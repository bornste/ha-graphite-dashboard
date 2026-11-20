// Showcase: renders the graphite-cards with sample data outside of Home Assistant.
// Provides a small stand-in for hass, ha-card and the card helpers; all entities are fictional.
import { stringify } from "yaml";
import { calendarDays, calendarEvents, examples, sampleStates, templateResults, timelineHistory, todoItems, type ShowcaseSection } from "./examples";

type Config = Record<string, any>;

// --- stand-ins for Home Assistant parts the cards rely on ---------------------------------

// ha-card is a plain block container in Home Assistant; like there, the block display comes from its
// own shadow styles, so a card can still make it a grid or flex box
if (!customElements.get("ha-card")) {
  customElements.define("ha-card", class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = "<style>:host { display: block; }</style><slot></slot>";
    }
  });
}

// ha-ripple lies over its parent without taking space (hover and press are left out here)
if (!customElements.get("ha-ripple")) {
  customElements.define("ha-ripple", class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }).innerHTML = "<style>:host { position: absolute; inset: 0; pointer-events: none; }</style>";
    }
  });
}

// icons: the mdi and ic icons the cards and examples name, embedded by the build (SHOWCASE_ICONS);
// ha-state-icon picks a default icon per domain and device class like Home Assistant does
declare const SHOWCASE_ICONS: Record<string, { body: string; width: number; height: number }>;

const deviceClassIcons: Record<string, [string, string]> = {
  window: ["mdi:window-open", "mdi:window-closed"],
  door: ["mdi:door-open", "mdi:door-closed"],
  motion: ["mdi:motion-sensor", "mdi:motion-sensor-off"],
  connectivity: ["mdi:check-network-outline", "mdi:close-network-outline"],
  temperature: ["mdi:thermometer", "mdi:thermometer"],
  humidity: ["mdi:water-percent", "mdi:water-percent"],
  battery: ["mdi:battery", "mdi:battery"],
  power: ["mdi:flash", "mdi:flash"],
};

const domainIcons: Record<string, [string, string]> = {
  light: ["mdi:lightbulb", "mdi:lightbulb-outline"],
  switch: ["mdi:toggle-switch-variant", "mdi:toggle-switch-variant-off"],
  input_boolean: ["mdi:toggle-switch-variant", "mdi:toggle-switch-variant-off"],
  binary_sensor: ["mdi:checkbox-marked-circle", "mdi:radiobox-blank"],
  media_player: ["mdi:cast-connected", "mdi:cast"],
  vacuum: ["mdi:robot-vacuum", "mdi:robot-vacuum"],
  calendar: ["mdi:calendar", "mdi:calendar"],
  todo: ["mdi:clipboard-list", "mdi:clipboard-list"],
  scene: ["mdi:palette", "mdi:palette"],
  script: ["mdi:script-text", "mdi:script-text"],
  automation: ["mdi:robot", "mdi:robot-off"],
  sensor: ["mdi:eye", "mdi:eye"],
};

function stateIcon(stateObj: any): string {
  if (!stateObj) return "";
  if (stateObj.attributes?.icon) return stateObj.attributes.icon;
  const active = !["off", "closed", "unavailable", "unknown", "idle", "docked"].includes(stateObj.state);
  const icons = deviceClassIcons[stateObj.attributes?.device_class] ?? domainIcons[String(stateObj.entity_id).split(".")[0]];
  return icons ? icons[active ? 0 : 1] : "";
}

// the icon goes into its own shadow root, like in Home Assistant: in the light DOM the SVG would be
// added while Lit clones a card template (the icon attribute upgrades the element), and the extra
// nodes would shift the positions Lit fills in, so text ends up in the wrong place
class ShowcaseIcon extends HTMLElement {
  static observedAttributes = ["icon"];
  private iconName = "";
  private stateObject?: any;
  private root = this.attachShadow({ mode: "open" });

  set icon(icon: string | undefined) {
    this.iconName = icon ?? "";
    this.render();
  }

  get icon(): string {
    return this.iconName;
  }

  set stateObj(stateObj: any) {
    this.stateObject = stateObj;
    this.render();
  }

  set hass(_hass: unknown) {}

  attributeChangedCallback(_name: string, _old: string | null, value: string | null) {
    this.icon = value ?? "";
  }

  connectedCallback() {
    this.style.cssText = "display: inline-flex; width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px)";
    this.render();
  }

  // a known icon as SVG, otherwise a neutral glyph
  private render() {
    const icon = SHOWCASE_ICONS[this.iconName || stateIcon(this.stateObject)];
    this.root.innerHTML = icon
      ? `<svg viewBox="0 0 ${icon.width} ${icon.height}" width="100%" height="100%">${icon.body}</svg>`
      : `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="7.5" fill="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  }
}
for (const tag of ["ha-icon", "ha-state-icon"]) {
  if (!customElements.get(tag)) customElements.define(tag, class extends ShowcaseIcon {});
}

// placeholder for built-in cards (tile, entities, ...): name and state on a tile surface
class ShowcaseTile extends HTMLElement {
  private config: Config = {};
  private hassObject?: any;

  setConfig(config: Config) {
    this.config = config;
    this.render();
  }

  set hass(hass: any) {
    this.hassObject = hass;
    this.render();
  }

  private render() {
    const stateObj = this.hassObject?.states[this.config.entity];
    const name = this.config.name ?? stateObj?.attributes.friendly_name ?? this.config.entity ?? "Card";
    const value = stateObj ? this.hassObject.formatEntityState(stateObj) : "";
    this.style.cssText = [
      "display: flex", "flex-direction: column", "justify-content: space-between", "box-sizing: border-box",
      "height: 72px", "padding: 10px 12px", "border-radius: var(--graphite-card-radius, 12px)",
      "background: var(--graphite-card-surface, var(--graphite-surface-tile))", "font-size: 13px",
    ].join("; ");
    this.innerHTML = "";
    const nameElement = document.createElement("span");
    nameElement.style.color = "var(--graphite-text-secondary)";
    nameElement.textContent = name;
    const valueElement = document.createElement("span");
    valueElement.style.fontSize = "20px";
    valueElement.style.fontWeight = "300";
    valueElement.textContent = value;
    this.append(nameElement, valueElement);
  }
}
customElements.define("showcase-tile", ShowcaseTile);

// card helpers: graphite cards are created directly, everything else becomes a placeholder tile
(window as any).loadCardHelpers = async () => ({
  createCardElement(config: Config) {
    const type = String(config.type || "");
    const tag = type.startsWith("custom:") ? type.slice(7) : "showcase-tile";
    const element: any = document.createElement(customElements.get(tag) ? tag : "showcase-tile");
    element.setConfig(config);
    return element;
  },
});

// themes of graphite.yaml (name, slug and variables), injected by the build
declare const SHOWCASE_THEMES: Array<{ name: string; slug: string; variables: Record<string, string> }>;
const showcaseThemes = Object.fromEntries(SHOWCASE_THEMES.map((theme) => [theme.name, theme.variables]));

// a minimal hass object: states, number formatting and canned template results
// states of the page; toggling replaces an entity object (like Home Assistant), so the cards re-render
let states: Record<string, any> = { ...sampleStates };

// todo lists: a small live store, so adding, changing and removing on the shopping list works;
// like the Bring integration, a change arrives in the list after a moment
interface ShowcaseTodoItem {
  uid: string;
  summary: string;
  status: string;
  description?: string;
}

const todoLists: Record<string, ShowcaseTodoItem[]> = Object.fromEntries(Object.entries(todoItems)
  .map(([entityId, items]) => [entityId, items.map((item, index) => ({ uid: `${entityId}-${index}`, ...item }))]));
const todoListeners = new Map<string, Set<(message: Record<string, unknown>) => void>>();
const todoDelay = 700;
let todoCounter = 0;

function todoMessage(entityId: string): Record<string, unknown> {
  return { items: (todoLists[entityId] ?? []).map((item) => ({ ...item })) };
}

function changeTodo(entityId: string, service: string, data: Record<string, unknown> = {}): void {
  const items = todoLists[entityId] ?? (todoLists[entityId] = []);
  window.setTimeout(() => {
    const index = items.findIndex((item) => item.uid === data.item || item.summary === data.item);
    if (service === "add_item") {
      items.push({ uid: `${entityId}-new${todoCounter++}`, summary: String(data.item), status: "needs_action",
        ...(data.description ? { description: String(data.description) } : {}) });
    } else if (service === "update_item" && index >= 0) {
      const item = items[index];
      if (typeof data.status === "string") item.status = data.status;
      if (data.description !== undefined) item.description = String(data.description);
      if (typeof data.rename === "string") item.summary = data.rename;
    } else if (service === "remove_item" && index >= 0) {
      items.splice(index, 1);
    }
    for (const listener of todoListeners.get(entityId) ?? []) listener(todoMessage(entityId));
    // the entity state is the number of open items, as in Home Assistant
    setState(entityId, String(items.filter((item) => item.status === "needs_action").length));
  }, todoDelay);
}

function createHass(language: string): any {
  return {
    states,
    entities: Object.fromEntries(Object.entries(sampleStates).map(([id, state]: [string, any]) => [id, { display_precision: state.attributes.display_precision }])),
    language,
    locale: { language },
    formatEntityState(stateObj: any) {
      // translated states like Home Assistant shows them (only the ones the examples use)
      const words: Record<string, Record<string, string>> = {
        de: { on: "An", off: "Aus", open: "Offen", closed: "Geschlossen", unavailable: "Nicht verfügbar" },
        en: { on: "On", off: "Off", open: "Open", closed: "Closed", unavailable: "Unavailable" },
      };
      const dictionary = words[language] ?? words.en;
      if (stateObj.attributes.device_class === "window" && ["on", "off"].includes(stateObj.state)) {
        return dictionary[stateObj.state === "on" ? "open" : "closed"];
      }
      if (dictionary[stateObj.state]) return dictionary[stateObj.state];
      const unit = stateObj.attributes.unit_of_measurement;
      const number = Number(stateObj.state);
      const precision = stateObj.attributes.display_precision;
      const value = !Number.isNaN(number) && precision !== undefined
        ? number.toLocaleString(language, { minimumFractionDigits: precision, maximumFractionDigits: precision })
        : stateObj.state;
      return unit ? `${value} ${unit}` : value;
    },
    connection: {
      async subscribeMessage(callback: (message: Record<string, unknown>) => void, message: Config) {
        // live todo list of the shopping card, otherwise a template result
        if (message.type === "todo/item/subscribe") {
          const entityId = message.entity_id as string;
          if (!todoListeners.has(entityId)) todoListeners.set(entityId, new Set());
          todoListeners.get(entityId)!.add(callback);
          callback(todoMessage(entityId));
          return () => todoListeners.get(entityId)?.delete(callback);
        }
        callback({ result: templateResults[message.template] ?? "" });
        return () => undefined;
      },
    },
    // themes of graphite.yaml, as Home Assistant hands them to the cards
    themes: { themes: showcaseThemes },
    async callService(domain: string, service: string, data?: Record<string, unknown>, target?: Record<string, unknown>) {
      // todo services change the sample list, select_option of input_select / select the sample state;
      // everything else does nothing
      const entityId = target?.entity_id as string | undefined;
      if (domain === "todo" && entityId) changeTodo(entityId, service, data);
      if (service === "select_option" && entityId && typeof data?.option === "string") setState(entityId, data.option);
      return undefined;
    },
    async callApi(method: string, path: string) {
      // history/period/<start>?filter_entity_id=a,b: the sample timeline, one list per entity
      if (path.startsWith("history/period/")) {
        const ids = (path.split("filter_entity_id=")[1] ?? "").split("&")[0].split(",");
        return ids.filter((id) => timelineHistory[id]).map((id) => timelineHistory[id].map(([minutes, state], index) => ({
          ...(index === 0 ? { entity_id: id } : {}),
          state,
          last_changed: new Date(Date.now() - minutes * 60000).toISOString(),
        })));
      }
      // calendars/<entity>?start=...: all-day events on the sample days
      const entityId = path.split("?")[0].replace("calendars/", "");
      const today = new Date();
      const pad = (value: number) => String(value).padStart(2, "0");
      const dateOf = (offset: number) => {
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
      };
      const moment = (offset: number, time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hours, minutes).toISOString();
      };
      if (calendarEvents[entityId]) {
        return calendarEvents[entityId].map((event) => ({
          summary: event.summary,
          location: event.location,
          description: event.description,
          start: event.start ? { dateTime: moment(event.offset, event.start) } : { date: dateOf(event.offset) },
          end: event.start ? { dateTime: moment(event.offset, event.end ?? event.start) } : { date: dateOf(event.offset + (event.days ?? 1)) },
        }));
      }
      return (calendarDays[entityId] ?? []).map((offset) => {
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        return { summary: entityId, start: { date } };
      });
    },
    async callWS(message: Config) {
      if (message.type === "todo/item/list") return todoMessage(message.entity_id);
      throw new Error(`not available in the showcase: ${message.type}`);
    },
  };
}

// --- page ----------------------------------------------------------------------------------

const toast = document.getElementById("toast")!;
let toastTimer: number | undefined;

function showToast(text: string): void {
  toast.textContent = text;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1800);
}

// cards of the page, they get a new hass object after every state change
let renderedCards: any[] = [];

function setState(entityId: string, state: string): void {
  const current = states[entityId];
  if (!current) return;
  const now = new Date().toISOString();
  states = { ...states, [entityId]: { ...current, state, last_changed: now, last_updated: now } };
  const hass = createHass(languageSelect.value);
  for (const card of renderedCards) card.hass = hass;
}

// toggle: on/off flips, an online entity follows a moment later (shows the "connecting" pulse)
function toggle(entityId: string, onlineEntity?: string): void {
  const current = states[entityId];
  if (!current || !["on", "off"].includes(current.state)) {
    showToast(`${entityId}: ${current?.state ?? "unknown"}`);
    return;
  }
  const turnOn = current.state === "off";
  setState(entityId, turnOn ? "on" : "off");
  if (onlineEntity) {
    setState(onlineEntity, "off");
    if (turnOn) {
      window.setTimeout(() => {
        if (states[entityId]?.state === "on") setState(onlineEntity, "on");
      }, 2500);
    }
  }
}

// more-info: a small dialog with state, last change and attributes
const dialog = document.getElementById("more-info") as HTMLDialogElement;
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

function showMoreInfo(entityId: string): void {
  const stateObj = states[entityId];
  if (!stateObj) return;
  const hass = createHass(languageSelect.value);
  const name = stateObj.attributes.friendly_name ?? entityId;
  const rows = Object.entries(stateObj.attributes)
    .filter(([key]) => key !== "friendly_name")
    .map(([key, value]) => `<dt>${key}</dt><dd>${String(value)}</dd>`)
    .join("");
  const changed = new Date(stateObj.last_changed).toLocaleString(languageSelect.value);
  dialog.innerHTML = `<form method="dialog"><header><h2>${name}</h2><button aria-label="close">✕</button></header>
    <p class="state">${hass.formatEntityState(stateObj)}</p><p class="entity">${entityId} · ${changed}</p>
    ${rows ? `<dl>${rows}</dl>` : ""}</form>`;
  dialog.showModal();
}

// actions: toggle and more-info act on the sample data, everything else is shown as a toast
document.addEventListener("hass-action", (event: Event) => {
  const { config, action } = (event as CustomEvent).detail;
  const actionConfig = config[`${action}_action`] ?? { action: "more-info" };
  const entityId = actionConfig.entity ?? config.entity;
  if (actionConfig.action === "toggle" && entityId) {
    toggle(entityId, config.online_entity);
    return;
  }
  if (actionConfig.action === "more-info" && entityId) {
    showMoreInfo(entityId);
    return;
  }
  showToast(`${action}: ${actionConfig.action}${entityId ? ` · ${entityId}` : ""}`);
});

// --- page structure: groups of cards with a table of contents ------------------------------

interface ShowcaseGroup {
  id: string;
  title: string;
  description: string;
  cards: string[];
}

// the cards in groups by what they are for; a card that is in no group lands in "More"
const groups: ShowcaseGroup[] = [
  {
    id: "layout",
    title: "Layout",
    description: "Panels and dialogs hold the other cards; the summary opens a dashboard.",
    cards: ["graphite-panel", "graphite-dialog", "graphite-summary"],
  },
  {
    id: "values",
    title: "States and values",
    description: "Rows and tiles that show what is going on: states, measured values and their history.",
    cards: ["graphite-status", "graphite-value", "graphite-meter", "graphite-timeline", "graphite-legend"],
  },
  {
    id: "controls",
    title: "Controls",
    description: "Switch, trigger and choose.",
    cards: ["graphite-switch", "graphite-button", "graphite-select", "graphite-slider", "graphite-image"],
  },
  {
    id: "light",
    title: "Light",
    description: "Lamps with their own color, scenes and light effects with their gradient.",
    cards: ["graphite-light", "graphite-scene"],
  },
  {
    id: "household",
    title: "Household",
    description: "Calendars, lists and the devices that need attention now and then.",
    cards: ["graphite-calendar", "graphite-pickup", "graphite-todo", "graphite-shopping", "graphite-battery",
      "graphite-ink", "graphite-vacuum"],
  },
  {
    id: "media",
    title: "Media and play time",
    description: "What is playing and for how long.",
    cards: ["graphite-now-playing", "graphite-stopwatch"],
  },
];

// short names for the page ("Panel"); the element name stays visible next to it
const cardNames: Record<string, string> = {
  "graphite-now-playing": "Now playing",
  "graphite-todo": "To-do",
};

function cardName(card: string): string {
  if (cardNames[card]) return cardNames[card];
  const name = card.slice("graphite-".length).split("-").join(" ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const cardAnchor = (card: string) => card.slice("graphite-".length);
const documentation = (card: string) => `https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/${card}.md`;

function renderSection(section: ShowcaseSection, hass: any): HTMLElement {
  const sectionElement = document.createElement("section");
  sectionElement.className = "card-section";
  sectionElement.id = cardAnchor(section.card);
  const head = document.createElement("div");
  head.className = "card-head";
  const heading = document.createElement("h3");
  heading.textContent = cardName(section.card);
  const element = document.createElement("code");
  element.textContent = section.card;
  const link = document.createElement("a");
  link.href = documentation(section.card);
  link.textContent = "Documentation";
  head.append(heading, element, link);
  const intro = document.createElement("p");
  intro.innerHTML = section.description;
  const grid = document.createElement("div");
  grid.className = "examples";
  for (const example of section.examples) {
    const wrapper = document.createElement("div");
    wrapper.className = example.wide ? "example wide" : "example";
    const title = document.createElement("h4");
    title.textContent = example.title;
    const card: any = document.createElement(example.config.type.slice(7));
    card.setConfig(example.config);
    card.hass = hass;
    renderedCards.push(card);
    wrapper.append(title, card);
    if (example.note) {
      const note = document.createElement("p");
      note.className = "note";
      note.textContent = example.note;
      wrapper.append(note);
    }
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "YAML";
    const code = document.createElement("pre");
    code.textContent = stringify(example.config);
    details.append(summary, code);
    wrapper.append(details);
    grid.append(wrapper);
  }
  sectionElement.append(head, intro, grid);
  return sectionElement;
}

function renderGroup(group: ShowcaseGroup, content: HTMLElement[]): HTMLElement {
  const groupElement = document.createElement("section");
  groupElement.className = "group";
  groupElement.id = group.id;
  const heading = document.createElement("h2");
  heading.textContent = group.title;
  const intro = document.createElement("p");
  intro.textContent = group.description;
  groupElement.append(heading, intro, ...content);
  return groupElement;
}

// the theme colors as rows, in the example grid like the cards (one column as wide as a panel)
function renderTokens(): HTMLElement {
  const lists: Array<[string, Array<[string, string]>]> = [
    ["Surfaces", [["surface-page", "text-secondary"], ["surface-panel", "text-secondary"], ["surface-tile", "text-secondary"],
      ["surface-tile-active", "text-secondary"], ["surface-track", "text-secondary"]]],
    ["Colors", [["accent", "accent-ink"], ["success", "success-ink"], ["danger", "ground"]]],
    ["Text", [["text-primary", ""], ["text-secondary", ""], ["text-muted", ""]]],
  ];
  const grid = document.createElement("div");
  grid.className = "examples";
  for (const [title, tokens] of lists) {
    const wrapper = document.createElement("div");
    wrapper.className = "example";
    const heading = document.createElement("h4");
    heading.textContent = title;
    const rows = document.createElement("div");
    rows.className = "swatches";
    // a row like the status rows: color chip on the left, name, variable on the right
    for (const [token] of tokens) {
      const row = document.createElement("div");
      row.className = "swatch";
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.style.background = `var(--graphite-${token})`;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = token;
      const variable = document.createElement("code");
      variable.textContent = `--graphite-${token}`;
      row.append(chip, name, variable);
      rows.append(row);
    }
    wrapper.append(heading, rows);
    grid.append(wrapper);
  }
  return renderGroup({
    // not "theme": that is the id of the theme picker in the header
    id: "theme-colors",
    title: "Theme",
    description: "Three surface levels mixed from ground and ink, text levels and the accent colors of the selected theme.",
    cards: [],
  }, [grid]);
}

// table of contents: groups with their cards; on narrow screens only the groups, as a bar
function renderToc(pageGroups: Array<{ group: ShowcaseGroup; cards: string[] }>): HTMLElement[] {
  const items: HTMLElement[] = [];
  for (const { group, cards } of pageGroups) {
    const groupLink = document.createElement("a");
    groupLink.className = "toc-group";
    groupLink.href = `#${group.id}`;
    groupLink.textContent = group.title;
    groupLink.dataset.target = group.id;
    items.push(groupLink);
    for (const card of cards) {
      const cardLink = document.createElement("a");
      cardLink.className = "toc-card";
      cardLink.href = `#${cardAnchor(card)}`;
      cardLink.textContent = cardName(card);
      cardLink.dataset.target = cardAnchor(card);
      cardLink.dataset.group = group.id;
      items.push(cardLink);
    }
  }
  return items;
}

// marks the group and card in view in the table of contents
let tocObserver: IntersectionObserver | undefined;

function followScroll(): void {
  tocObserver?.disconnect();
  const links = [...toc.querySelectorAll<HTMLAnchorElement>("a")];
  tocObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const target = entry.target as HTMLElement;
      const groupId = target.classList.contains("group") ? target.id : target.closest(".group")?.id;
      for (const link of links) {
        const current = link.dataset.target === target.id || (link.classList.contains("toc-group") && link.dataset.target === groupId);
        link.classList.toggle("current", current);
        // narrow screens: the bar of groups follows, so the current group stays visible
        if (current && link.classList.contains("toc-group") && toc.scrollWidth > toc.clientWidth) {
          toc.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
        }
      }
    }
  }, { rootMargin: "-20% 0px -70% 0px" });
  for (const element of main.querySelectorAll(".group, .card-section")) tocObserver.observe(element);
}

const main = document.getElementById("showcase")!;
const toc = document.getElementById("toc")!;
const languageSelect = document.getElementById("language") as HTMLSelectElement;

// theme switcher: the themes of graphite.yaml (theme.css holds their variables); the choice is kept
// in the browser and can be given as ?theme=<slug>
const themeSelect = document.getElementById("theme") as HTMLSelectElement;
const themeKey = "graphite-showcase-theme";

function storedTheme(): string | null {
  const fromAddress = new URLSearchParams(location.search).get("theme");
  if (fromAddress) return fromAddress;
  try {
    return localStorage.getItem(themeKey);
  } catch {
    return null;
  }
}

function applyTheme(slug: string): void {
  if (slug === "graphite") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", slug);
  try {
    localStorage.setItem(themeKey, slug);
  } catch {
    // private window or blocked storage: the choice only lasts for this page
  }
}

themeSelect.replaceChildren(...SHOWCASE_THEMES.map((theme) => new Option(theme.name, theme.slug)));
const initialTheme = storedTheme();
themeSelect.value = SHOWCASE_THEMES.some((theme) => theme.slug === initialTheme) ? initialTheme! : "graphite";
applyTheme(themeSelect.value);
themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

function render(): void {
  const language = languageSelect.value;
  // the cards read their language from this theme variable
  main.style.setProperty("--graphite-language", language);
  document.documentElement.lang = language;
  const hass = createHass(language);
  renderedCards = [];
  const sections = new Map(examples(language).map((section) => [section.card, section]));
  const grouped = new Set(groups.flatMap((group) => group.cards));
  const more = [...sections.keys()].filter((card) => !grouped.has(card));
  const pageGroups = [...groups, ...(more.length ? [{ id: "more", title: "More", description: "", cards: more }] : [])]
    .map((group) => ({ group, cards: group.cards.filter((card) => sections.has(card)) }))
    .filter(({ cards }) => cards.length);
  main.replaceChildren(
    ...pageGroups.map(({ group, cards }) => renderGroup(group, cards.map((card) => renderSection(sections.get(card)!, hass)))),
    renderTokens(),
  );
  const theme = { group: { id: "theme-colors", title: "Theme", description: "", cards: [] }, cards: [] };
  toc.replaceChildren(...renderToc([...pageGroups, theme]));
  followScroll();
}

languageSelect.addEventListener("change", render);
render();
