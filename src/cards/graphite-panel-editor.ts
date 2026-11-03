// Visual editor of graphite-panel: panel options in an ha-form, child cards in Home Assistant's
// own stack editor (tabs, card picker, card editors).
import type { HomeAssistant } from "../core/types";
import { languageOf, translate } from "../core/i18n";

// schema with translated labels of the layout options
function editorSchema(language: string) {
  const text = (key: string) => translate(language, `panel.editor.${key}`);
  return [
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
                { value: "vertical", label: text("layoutVertical") },
                { value: "horizontal", label: text("layoutHorizontal") },
                { value: "grid", label: text("layoutGrid") },
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
    { name: "info_alert", selector: { object: {} } },
    { name: "chips", selector: { object: {} } },
  ];
}

// optional keys that are not stored when empty, so the YAML stays clean
const objectKeys = ["info_alert"];

export class GraphitePanelEditor extends HTMLElement {
  private config: Record<string, any> = {};
  private hassObject?: HomeAssistant;
  private lovelaceObject?: unknown;
  private form?: any;
  private stackEditor?: any;
  private formLanguage?: string;

  setConfig(config: Record<string, any>): void {
    this.config = config;
    this.render();
  }

  set hass(hass: HomeAssistant) {
    this.hassObject = hass;
    if (this.form) this.form.hass = hass;
    if (this.stackEditor) this.stackEditor.hass = hass;
  }

  set lovelace(lovelace: unknown) {
    this.lovelaceObject = lovelace;
    if (this.stackEditor) this.stackEditor.lovelace = lovelace;
  }

  private render(): void {
    if (!this.form) {
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.gap = "16px";

      this.form = document.createElement("ha-form");
      this.form.addEventListener("value-changed", (event: CustomEvent) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, ...event.detail.value });
      });

      this.stackEditor = document.createElement("hui-stack-card-editor");
      this.stackEditor.addEventListener("config-changed", (event: CustomEvent) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, cards: event.detail.config.cards || [] });
      });

      wrapper.append(this.form, this.stackEditor);
      this.replaceChildren(wrapper);
    }
    const language = languageOf(this.isConnected ? this : undefined, this.hassObject);
    if (this.formLanguage !== language) {
      this.formLanguage = language;
      this.form.schema = editorSchema(language);
      this.form.computeLabel = (schema: { name: string }) => {
        if (!schema.name) return "";
        const key = `panel.editor.${schema.name}`;
        const label = translate(language, key);
        return label === key ? schema.name : label;
      };
    }
    if (this.hassObject) {
      this.form.hass = this.hassObject;
      this.stackEditor.hass = this.hassObject;
    }
    if (this.lovelaceObject) this.stackEditor.lovelace = this.lovelaceObject;

    const { title, info, info_alert, chips, layout, columns, gap, padding, min_column_width, frame } = this.config;
    this.form.data = {
      title, info, info_alert, chips, layout: layout || "vertical", columns, gap, padding, min_column_width,
      frame: frame !== false,
    };
    this.stackEditor.setConfig({ type: "vertical-stack", cards: this.config.cards || [] });
    this.hideStackTitle();
  }

  // the stack editor has its own "title" field, which the panel does not use (it has "title" above)
  private async hideStackTitle(): Promise<void> {
    await this.stackEditor.updateComplete;
    for (const form of this.stackEditor.shadowRoot?.querySelectorAll("ha-form") || []) {
      if (Array.isArray(form.schema) && form.schema.some((field: { name: string }) => field.name === "title")) {
        form.style.display = "none";
      }
    }
  }

  private fireConfig(config: Record<string, any>): void {
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) => {
        if (value === "" || value === undefined || value === null) return false;
        if (objectKeys.includes(key) && (typeof value !== "object" || Object.keys(value).length === 0)) return false;
        if (key === "chips" && (!Array.isArray(value) || value.length === 0)) return false;
        // frame defaults to true, only "false" is stored
        if (key === "frame" && value !== false) return false;
        return true;
      }),
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
}
