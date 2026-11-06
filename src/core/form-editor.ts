// Base of the visual editors: one ha-form with translated labels; empty optional values are
// not stored, so the YAML stays clean.
import { languageOf, translate } from "./i18n";
import type { HomeAssistant } from "./types";

export abstract class GraphiteFormEditor extends HTMLElement {
  protected config: Record<string, any> = {};
  private hassObject?: HomeAssistant;
  private form?: any;
  private formLanguage?: string;
  private formSchemaKey?: string;

  // ha-form schema of the card
  protected abstract schema(): unknown[];

  // changes when the schema depends on the config (e.g. the fields of the chosen layout)
  protected schemaKey(): string {
    return "";
  }

  // translation prefix of the labels, e.g. "rows.editor"
  protected abstract labelPrefix(): string;

  // whether a value is left out of the stored config (besides empty values)
  protected skipValue(_key: string, _value: unknown): boolean {
    return false;
  }

  // values the card uses when an option is not set; the form shows them, and a value equal to its
  // default (or an empty list) is not stored, so the card falls back to its default again
  protected defaults(): Record<string, unknown> {
    return {};
  }

  // translated label of a select option, e.g. optionLabel("range.days") -> "<prefix>.range.days"
  protected optionLabel(key: string): string {
    const fullKey = `${this.labelPrefix()}.${key}`;
    const label = translate(languageOf(this.isConnected ? this : undefined, this.hassObject), fullKey);
    return label === fullKey ? key : label;
  }

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
    if (this.formLanguage !== language || this.formSchemaKey !== this.schemaKey()) {
      this.formLanguage = language;
      this.formSchemaKey = this.schemaKey();
      this.form.schema = this.schema();
      this.form.computeLabel = (schema: { name: string }) => {
        if (!schema.name) return "";
        const key = `${this.labelPrefix()}.${schema.name}`;
        const label = translate(language, key);
        return label === key ? schema.name : label;
      };
    }
    if (this.hassObject) this.form.hass = this.hassObject;
    this.form.data = { ...this.defaults(), ...this.config };
  }

  private fireConfig(config: Record<string, any>): void {
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) =>
        value !== "" && value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)
        && this.defaults()[key] !== value && !this.skipValue(key, value)),
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
}
