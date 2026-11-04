// Showcase: renders the graphite-cards with sample data outside of Home Assistant.
// Provides a small stand-in for hass, ha-card and the card helpers; all entities are fictional.
import { stringify } from "yaml";
import { examples, sampleStates, templateResults, todoItems, type ShowcaseSection } from "./examples";

type Config = Record<string, any>;

// --- stand-ins for Home Assistant parts the cards rely on ---------------------------------

// ha-card is a plain block container in Home Assistant
if (!customElements.get("ha-card")) {
  customElements.define("ha-card", class extends HTMLElement {
    connectedCallback() {
      this.style.display = "block";
    }
  });
}

// icons: Home Assistant's icon sets are not available here, a neutral glyph stands in
class ShowcaseIcon extends HTMLElement {
  connectedCallback() {
    this.style.cssText = "display: inline-flex; width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px)";
    this.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="7.5" fill="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
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

// a minimal hass object: states, number formatting and canned template results
// states of the page; toggling replaces an entity object (like Home Assistant), so the cards re-render
let states: Record<string, any> = { ...sampleStates };

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
      async subscribeMessage(callback: (message: { result: string }) => void, message: Config) {
        callback({ result: templateResults[message.template] ?? "" });
        return () => undefined;
      },
    },
    async callService() {
      return undefined;
    },
    async callWS(message: Config) {
      if (message.type === "todo/item/list") return { items: todoItems[message.entity_id] ?? [] };
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

function renderSection(section: ShowcaseSection, hass: any): HTMLElement {
  const sectionElement = document.createElement("section");
  sectionElement.className = "card-section";
  const heading = document.createElement("h2");
  heading.textContent = section.title;
  const intro = document.createElement("p");
  intro.innerHTML = section.description;
  const grid = document.createElement("div");
  grid.className = "examples";
  for (const example of section.examples) {
    const wrapper = document.createElement("div");
    wrapper.className = "example";
    const title = document.createElement("h3");
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
  sectionElement.append(heading, intro, grid);
  return sectionElement;
}

function renderTokens(): HTMLElement {
  const section = document.createElement("section");
  section.className = "card-section";
  section.innerHTML = `<h2>Theme</h2><p>Three surface levels mixed from ground and ink, text levels and the accent colors of the Graphite theme.</p>`;
  const swatches = document.createElement("div");
  swatches.className = "swatches";
  const tokens = [
    ["surface-page", "text-secondary"], ["surface-panel", "text-secondary"], ["surface-tile", "text-secondary"],
    ["surface-tile-active", "text-secondary"], ["surface-track", "text-secondary"], ["accent", "accent-ink"],
    ["success", "success-ink"], ["danger", "ground"],
  ];
  for (const [background, foreground] of tokens) {
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = `var(--graphite-${background})`;
    swatch.style.color = `var(--graphite-${foreground})`;
    swatch.innerHTML = `<span>${background}</span><code>--graphite-${background}</code>`;
    swatches.append(swatch);
  }
  section.append(swatches);
  return section;
}

const main = document.getElementById("showcase")!;
const languageSelect = document.getElementById("language") as HTMLSelectElement;

function render(): void {
  const language = languageSelect.value;
  // the cards read their language from this theme variable
  main.style.setProperty("--graphite-language", language);
  document.documentElement.lang = language;
  const hass = createHass(language);
  renderedCards = [];
  main.replaceChildren(renderTokens(), ...examples(language).map((section) => renderSection(section, hass)));
}

languageSelect.addEventListener("change", render);
render();
