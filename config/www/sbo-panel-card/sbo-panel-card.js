// SBO Panel Card - groups any cards in one panel with an optional title and info line.
// Styling comes from the SBO Graphite theme tokens; children become tiles via context tokens.
// Header rule: title and status (info) on the left, values (chips) and buttons on the right.
//
// chips: values shown as pills on the right side of the header, in list order (left to right)
//   - entity: sensor.temperature   # required
//     label: CO₂                   # optional, muted text before the value
//     unit: °C                     # optional, default: unit_of_measurement of the entity
//     decimals: 1                  # optional, default: display precision of the entity
//     muted: true                  # optional, value in the secondary text color
//     alert: {above, below, state} # optional, accent chip while the condition is met
//     tap_action: none             # optional, default: more-info of the entity
const cardVersion = "0.7.1";

const panelStyles = `
  :host {
    display: block;
  }
  /* context tokens for child cards (read by the sbo_graphite Bubble module);
     a frameless panel is only a layout container and passes no tokens */
  :host(:not([frameless])) {
    --sbo-card-surface: var(--sbo-panel-child-surface, var(--sbo-surface-tile));
    --sbo-card-inner-surface: var(--sbo-panel-child-inner-surface, var(--sbo-surface-tile-active));
    --sbo-card-radius: var(--sbo-panel-child-radius, var(--sbo-radius-tile));
  }
  ha-card {
    background: var(--sbo-panel-surface, var(--sbo-surface-panel));
    border-radius: var(--sbo-panel-radius, var(--sbo-radius-panel));
    border: none;
    box-shadow: none;
    padding: var(--sbo-panel-padding, var(--sbo-padding-panel, 16px));
    box-sizing: border-box;
    height: 100%;
    /* only colors animate; the theme applies after the first render and would animate the radius */
    transition: background-color 0.3s ease;
  }
  /* without title and info the header takes no space */
  .header[hidden] { display: none; }
  /* title and info in one line, separated by a thin line (same as the dialog headers and room cards);
     the right side of a header is reserved for buttons */
  .header {
    display: flex;
    justify-content: flex-start;
    /* title and info share one baseline */
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
  }
  /* same title style as the room cards (theme tokens) */
  .title {
    flex: none;
    font-size: var(--sbo-title-size, 18px);
    font-weight: var(--sbo-title-weight, 400);
    line-height: 1.2;
    color: var(--sbo-title-color, var(--primary-text-color));
  }
  .info {
    min-width: 0;
    padding-left: 12px;
    position: relative;
    /* 2px more room on top for the separator line (it reads too short at cap height);
       the negative margin keeps the text on the shared baseline */
    padding-top: 2px;
    margin-top: -2px;
    font-size: 13px;
    line-height: 16px;
    color: var(--sbo-text-secondary, var(--secondary-text-color));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* separator line from the title's cap height down to the shared baseline
     (13px text in a 16px line: the baseline sits 3.5px above the bottom) */
  .info::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 3.5px;
    width: 1px;
    background: var(--sbo-separator, color-mix(in srgb, var(--sbo-ink, #f3f3f4) 24%, var(--sbo-ground, #0a0a0b)));
  }
  .info:empty { display: none; }
  /* values as pills on the right; the negative margin keeps the header at title height */
  .chips {
    display: flex;
    gap: 6px;
    flex: none;
    margin-left: auto;
    align-self: center;
    margin-block: -2px;
  }
  .chips:empty { display: none; }
  .chip {
    display: inline-flex;
    align-items: baseline;
    gap: 3px;
    padding: 4px 10px;
    border: none;
    border-radius: var(--sbo-radius-pill, 999px);
    background: var(--sbo-surface-tile, rgba(255, 255, 255, 0.08));
    font: inherit;
    font-size: 13px;
    line-height: 16px;
    font-variant-numeric: tabular-nums;
    color: var(--sbo-text-primary, var(--primary-text-color));
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .chip.static { cursor: default; }
  .chip .label { margin-right: 3px; }
  .chip .label,
  .chip .unit { color: var(--sbo-text-muted, var(--secondary-text-color)); font-size: 12px; }
  .chip.muted .value { color: var(--sbo-text-secondary, var(--secondary-text-color)); }
  /* alert condition met: accent text on a tinted pill */
  .chip.alert { background: color-mix(in srgb, var(--sbo-accent, #f5c48a) 18%, var(--sbo-surface-panel, #1c1c1d)); }
  .chip.alert .value,
  .chip.alert .label,
  .chip.alert .unit { color: var(--sbo-accent, var(--accent-color)); }
  /* info_alert condition met: info in accent color */
  .info.alert {
    color: var(--sbo-accent, var(--accent-color));
    font-weight: 500;
  }
  .content {
    /* defaults for standard Home Assistant cards inside the panel */
    --ha-card-background: var(--sbo-card-surface);
    --ha-card-border-radius: var(--sbo-card-radius);
    --ha-card-border-width: 0px;
    --ha-card-box-shadow: none;
    gap: var(--sbo-panel-gap, var(--sbo-gap-tile, 8px));
  }
  .content.vertical { display: flex; flex-direction: column; }
  .content.horizontal { display: flex; flex-direction: row; }
  .content.horizontal > * { flex: 1 1 0; min-width: 0; }
  .content.grid { display: grid; grid-template-columns: repeat(var(--sbo-panel-columns, 2), minmax(0, 1fr)); }
  /* responsive grid: as many columns of at least min_column_width as fit, one column on narrow screens */
  .content.grid.responsive { grid-template-columns: repeat(auto-fit, minmax(min(var(--sbo-panel-min-column-width), 100%), 1fr)); align-items: start; }
  .content > [hidden],
  .content > [collapsed] { display: none !important; }
  /* frameless: no surface, no padding, no header space (layout container only) */
  :host([frameless]) ha-card { background: none; padding: 0; border-radius: 0; }
`;

class SboPanelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.childCards = [];
    this.infoText = "";
    this.infoUnsubscribe = null;
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.cards)) {
      throw new Error("sbo-panel-card: 'cards' must be a list of cards");
    }
    const layout = config.layout || "vertical";
    if (!["vertical", "horizontal", "grid"].includes(layout)) {
      throw new Error("sbo-panel-card: 'layout' must be vertical, horizontal or grid");
    }
    this.config = { ...config, layout };
    this.unsubscribeInfo();
    this.render();
    this.buildCards();
    if (this.isConnected) this.subscribeInfo();
  }

  render() {
    const config = this.config;
    this.shadowRoot.innerHTML = `
      <style>${panelStyles}</style>
      <ha-card>
        <div class="header" ${config.title || config.info || this.chipConfigs().length ? "" : "hidden"}>
          <span class="title"></span>
          <span class="info"></span>
          <span class="chips"></span>
        </div>
        <div class="content ${config.layout}"></div>
      </ha-card>`;
    this.shadowRoot.querySelector(".title").textContent = config.title || "";
    this.updateInfo(this.isTemplate(config.info) ? this.infoText : config.info || "");
    this.buildChips();
    const card = this.shadowRoot.querySelector("ha-card");
    const content = this.shadowRoot.querySelector(".content");
    // columns, min_column_width, gap and padding apply to this panel only: they are set as properties,
    // not as variables, so nested panels keep their own defaults (variables would be inherited)
    if (config.min_column_width) {
      content.classList.add("responsive");
      content.style.gridTemplateColumns = `repeat(auto-fit, minmax(min(${config.min_column_width}, 100%), 1fr))`;
    } else if (config.columns) {
      content.style.gridTemplateColumns = `repeat(${Number(config.columns)}, minmax(0, 1fr))`;
    }
    this.toggleAttribute("frameless", config.frame === false);
    if (config.gap) content.style.gap = String(config.gap);
    if (config.padding && config.frame !== false) card.style.padding = String(config.padding);
    // custom variables apply to the panel and are inherited by all child cards
    for (const [name, value] of Object.entries(config.variables || {})) {
      const property = name.startsWith("--") ? name : `--${name}`;
      this.style.setProperty(property, String(value));
    }
  }

  // a child card that hides itself (card-visibility-changed) collapses its slot, so no gap remains
  watchVisibility(element) {
    // capture phase: hui-card stops this event on the inner card element
    element.addEventListener("card-visibility-changed", (event) => {
      element.toggleAttribute("collapsed", event.detail?.value === false);
    }, true);
  }

  async buildCards() {
    const content = this.shadowRoot.querySelector(".content");
    const buildId = (this.buildId = (this.buildId || 0) + 1);
    const helpers = customElements.get("hui-card") ? null : await window.loadCardHelpers?.();
    if (buildId !== this.buildId) return;
    this.childCards = this.config.cards.map((cardConfig) => {
      let element;
      if (!helpers) {
        // hui-card handles visibility conditions and loading like the built-in stacks
        element = document.createElement("hui-card");
        this.watchVisibility(element);
        element.config = cardConfig;
        element.preview = false;
        if (this.hass) element.hass = this.hass;
        element.load();
      } else {
        element = helpers.createCardElement(cardConfig);
        this.watchVisibility(element);
        if (this.hass) element.hass = this.hass;
      }
      return element;
    });
    content.replaceChildren(...this.childCards);
  }

  set hass(hass) {
    this.hassObject = hass;
    for (const element of this.childCards) element.hass = hass;
    if (this.isConnected && !this.infoUnsubscribe) this.subscribeInfo();
    this.updateInfoAlert();
    this.updateChips();
  }

  chipConfigs() {
    return Array.isArray(this.config?.chips) ? this.config.chips.filter((chip) => chip?.entity) : [];
  }

  buildChips() {
    const chipsElement = this.shadowRoot.querySelector(".chips");
    this.chipElements = this.chipConfigs().map((chipConfig) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.innerHTML = `<span class="label"></span><span class="value"></span><span class="unit"></span>`;
      chip.querySelector(".label").textContent = chipConfig.label || "";
      if (!chipConfig.label) chip.querySelector(".label").remove();
      chip.classList.toggle("muted", chipConfig.muted === true);
      const action = chipConfig.tap_action?.action ?? chipConfig.tap_action ?? "more-info";
      chip.classList.toggle("static", action === "none");
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
        if (action === "none") return;
        this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: chipConfig.entity }, bubbles: true, composed: true }));
      });
      return chip;
    });
    chipsElement.replaceChildren(...this.chipElements);
    this.updateChips();
  }

  updateChips() {
    const states = this.hassObject?.states;
    if (!states || !this.chipElements) return;
    this.chipConfigs().forEach((chipConfig, index) => {
      const chip = this.chipElements[index];
      const stateObject = states[chipConfig.entity];
      const state = stateObject?.state;
      const isValid = state !== undefined && state !== "unavailable" && state !== "unknown";
      let value = isValid ? state : "–";
      const number = Number(state);
      if (isValid && state !== "" && !Number.isNaN(number)) {
        const decimals = chipConfig.decimals ?? this.hassObject.entities?.[chipConfig.entity]?.display_precision;
        if (decimals !== undefined && decimals !== null) value = number.toFixed(Number(decimals));
      }
      const unit = chipConfig.unit ?? stateObject?.attributes?.unit_of_measurement ?? "";
      chip.querySelector(".value").textContent = value;
      chip.querySelector(".unit").textContent = unit;
      chip.classList.toggle("alert", this.matchesCondition(chipConfig.alert, state));
    });
  }

  // condition {above, below, state} against a state value; no condition or an invalid state never matches
  matchesCondition(condition, state) {
    if (!condition || state === undefined || state === "unavailable" || state === "unknown") return false;
    const number = Number(state);
    if (condition.above !== undefined && !(number > Number(condition.above))) return false;
    if (condition.below !== undefined && !(number < Number(condition.below))) return false;
    if (condition.state !== undefined && ![].concat(condition.state).map(String).includes(String(state))) return false;
    return true;
  }

  // info_alert: {entity, above, below, state} highlights the info line while the condition is met
  updateInfoAlert() {
    const condition = this.config?.info_alert;
    const infoElement = this.shadowRoot.querySelector(".info");
    if (!infoElement) return;
    const state = condition?.entity ? this.hassObject?.states?.[condition.entity]?.state : undefined;
    infoElement.classList.toggle("alert", this.matchesCondition(condition, state));
  }

  get hass() {
    return this.hassObject;
  }

  connectedCallback() {
    this.subscribeInfo();
  }

  disconnectedCallback() {
    this.unsubscribeInfo();
  }

  isTemplate(text) {
    return typeof text === "string" && (text.includes("{{") || text.includes("{%"));
  }

  updateInfo(text) {
    const infoElement = this.shadowRoot.querySelector(".info");
    if (!infoElement || infoElement.textContent === text) return;
    infoElement.textContent = text;
  }

  async subscribeInfo() {
    const info = this.config?.info;
    if (!this.isTemplate(info) || !this.hassObject?.connection || this.infoUnsubscribe) return;
    this.infoUnsubscribe = "pending";
    try {
      this.infoUnsubscribe = await this.hassObject.connection.subscribeMessage(
        (message) => {
          this.infoText = message.result != null ? String(message.result) : "";
          this.updateInfo(this.infoText);
        },
        { type: "render_template", template: info }
      );
    } catch (error) {
      this.infoUnsubscribe = null;
      console.warn("sbo-panel-card: info template failed", error);
    }
  }

  unsubscribeInfo() {
    if (typeof this.infoUnsubscribe === "function") this.infoUnsubscribe();
    this.infoUnsubscribe = null;
  }

  getCardSize() {
    return 1 + this.childCards.length;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 3 };
  }

  static getStubConfig() {
    return { title: "Panel", layout: "vertical", cards: [] };
  }

  static async getConfigElement() {
    // load Home Assistant's stack card editor, it is reused for the child cards
    if (!customElements.get("hui-stack-card-editor")) {
      const helpers = await window.loadCardHelpers();
      const stackCard = await helpers.createCardElement({ type: "vertical-stack", cards: [] });
      await stackCard.constructor.getConfigElement();
    }
    return document.createElement("sbo-panel-card-editor");
  }
}

const editorSchema = [
  { name: "title", selector: { text: {} } },
  { name: "info", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "vertical", label: "Vertikal" },
              { value: "horizontal", label: "Horizontal" },
              { value: "grid", label: "Raster" },
            ],
          },
        },
      },
      { name: "columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
      { name: "gap", selector: { text: {} } },
      { name: "padding", selector: { text: {} } },
      { name: "min_column_width", selector: { text: {} } },
      { name: "frame", selector: { boolean: {} } },
    ],
  },
  // the object selector renders a YAML editor
  { name: "chips", selector: { object: {} } },
  { name: "variables", selector: { object: {} } },
];

const editorLabels = {
  title: "Titel",
  info: "Status nach dem Titel (Text oder Jinja-Template)",
  chips: "Werte rechts als Chips (YAML-Liste: entity, label, unit, decimals, muted, alert, tap_action)",
  layout: "Anordnung",
  columns: "Spalten (nur Raster)",
  gap: "Abstand zwischen Karten (z.B. 8px)",
  padding: "Innenabstand (z.B. 16px)",
  variables: "CSS-Variablen (YAML, werden an die Karten im Panel vererbt)",
  min_column_width: "Mindestbreite pro Spalte (nur Raster, z.B. 380px – bricht auf schmalen Bildschirmen um)",
  frame: "Panel-Fläche anzeigen (aus = nur Layout-Container)",
};

class SboPanelCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this.hassObject = hass;
    if (this.form) this.form.hass = hass;
    if (this.stackEditor) this.stackEditor.hass = hass;
  }

  set lovelace(lovelace) {
    this.lovelaceObject = lovelace;
    if (this.stackEditor) this.stackEditor.lovelace = lovelace;
  }

  render() {
    if (!this.form) {
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.gap = "16px";

      this.form = document.createElement("ha-form");
      this.form.schema = editorSchema;
      this.form.computeLabel = (schema) => editorLabels[schema.name] || schema.name;
      this.form.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, ...event.detail.value });
      });

      // child cards are edited with Home Assistant's own stack editor (tabs, card picker, card editors)
      this.stackEditor = document.createElement("hui-stack-card-editor");
      this.stackEditor.addEventListener("config-changed", (event) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, cards: event.detail.config.cards || [] });
      });

      wrapper.append(this.form, this.stackEditor);
      this.replaceChildren(wrapper);
    }
    if (this.hassObject) {
      this.form.hass = this.hassObject;
      this.stackEditor.hass = this.hassObject;
    }
    if (this.lovelaceObject) this.stackEditor.lovelace = this.lovelaceObject;

    const { title, info, chips, layout, columns, gap, padding, variables, min_column_width, frame } = this.config;
    this.form.data = { title, info, chips, layout: layout || "vertical", columns, gap, padding, variables, min_column_width, frame: frame !== false };
    this.stackEditor.setConfig({ type: "vertical-stack", cards: this.config.cards || [] });
    this.hideStackTitle();
  }

  async hideStackTitle() {
    // the stack editor has its own "title" field, which the panel does not use (it has "title" above)
    await this.stackEditor.updateComplete;
    for (const form of this.stackEditor.shadowRoot?.querySelectorAll("ha-form") || []) {
      if (Array.isArray(form.schema) && form.schema.some((field) => field.name === "title")) {
        form.style.display = "none";
      }
    }
  }

  fireConfig(config) {
    // drop empty optional values so the YAML stays clean
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) => {
        if (value === "" || value === undefined || value === null) return false;
        // an empty variables object is not stored
        if (key === "variables" && (typeof value !== "object" || Object.keys(value).length === 0)) return false;
        // an empty chips list is not stored
        if (key === "chips" && (!Array.isArray(value) || value.length === 0)) return false;
        // frame defaults to true, only "false" is stored
        if (key === "frame" && value !== false) return false;
        return true;
      })
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
}

customElements.define("sbo-panel-card-editor", SboPanelCardEditor);

customElements.define("sbo-panel-card", SboPanelCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "sbo-panel-card",
  name: "SBO Panel Card",
  description: "Groups cards in one panel with title, info and vertical, horizontal or grid layout.",
});
console.info(`%c SBO-PANEL-CARD %c ${cardVersion} `, "background:#232327;color:#f3f3f4", "background:#f5c48a;color:#3a2410");
