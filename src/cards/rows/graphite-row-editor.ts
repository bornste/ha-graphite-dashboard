// Visual editor of graphite-status-row and graphite-switch-row (one form, wall_switch only for status rows).
import { languageOf, translate } from "../../core/i18n";
import type { HomeAssistant } from "../../core/types";

function editorSchema(rowKind: "status" | "switch") {
  return [
    { name: "entity", required: true, selector: { entity: {} } },
    {
      type: "grid",
      name: "",
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ],
    },
    { name: "tap_action", selector: { ui_action: {} } },
    { name: "hold_action", selector: { ui_action: {} } },
    { name: "double_tap_action", selector: { ui_action: {} } },
    { name: "since_line", selector: { boolean: {} } },
    {
      type: "grid",
      name: "",
      schema: [
        { name: "since_attribute", selector: { text: {} } },
        { name: "since_attribute_label", selector: { text: {} } },
      ],
    },
    { name: "detail_entities", selector: { object: {} } },
    { name: "online_entity", selector: { entity: {} } },
    ...(rowKind === "status" ? [{ name: "wall_switch", selector: { boolean: {} } }] : []),
  ];
}

export class GraphiteRowEditor extends HTMLElement {
  rowKind: "status" | "switch" = "status";
  private config: Record<string, any> = {};
  private hassObject?: HomeAssistant;
  private form?: any;
  private formLanguage?: string;

  setConfig(config: Record<string, any>): void {
    this.config = config;
    this.render();
  }

  set hass(hass: HomeAssistant) {
    this.hassObject = hass;
    if (this.form) this.form.hass = hass;
    else this.render();
  }

  private render(): void {
    if (!this.form) {
      this.form = document.createElement("ha-form");
      this.form.addEventListener("value-changed", (event: CustomEvent) => {
        event.stopPropagation();
        this.fireConfig({ ...this.config, ...event.detail.value });
      });
      this.replaceChildren(this.form);
    }
    const language = languageOf(this.isConnected ? this : undefined, this.hassObject);
    if (this.formLanguage !== language) {
      this.formLanguage = language;
      this.form.schema = editorSchema(this.rowKind);
      this.form.computeLabel = (schema: { name: string }) => {
        if (!schema.name) return "";
        const key = `rows.editor.${schema.name}`;
        const label = translate(language, key);
        return label === key ? schema.name : label;
      };
    }
    if (this.hassObject) this.form.hass = this.hassObject;
    this.form.data = this.config;
  }

  private fireConfig(config: Record<string, any>): void {
    // empty optional values are not stored, so the YAML stays clean
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) => {
        if (value === "" || value === undefined || value === null) return false;
        if (key === "detail_entities" && (!Array.isArray(value) || value.length === 0)) return false;
        if (key === "wall_switch" && value !== true) return false;
        return true;
      }),
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
}
