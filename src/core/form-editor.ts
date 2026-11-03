// Base of the visual editors: one ha-form with translated labels; empty optional values are
// not stored, so the YAML stays clean.
import { languageOf, translate } from "./i18n";
import type { HomeAssistant } from "./types";

export abstract class GraphiteFormEditor extends HTMLElement {
  protected config: Record<string, any> = {};
  private hassObject?: HomeAssistant;
  private form?: any;
  private formLanguage?: string;

  // ha-form schema of the card
  protected abstract schema(): unknown[];

  // translation prefix of the labels, e.g. "rows.editor"
  protected abstract labelPrefix(): string;

  // whether a value is left out of the stored config (besides empty values)
  protected skipValue(_key: string, _value: unknown): boolean {
    return false;
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
    if (this.formLanguage !== language) {
      this.formLanguage = language;
      this.form.schema = this.schema();
      this.form.computeLabel = (schema: { name: string }) => {
        if (!schema.name) return "";
        const key = `${this.labelPrefix()}.${schema.name}`;
        const label = translate(language, key);
        return label === key ? schema.name : label;
      };
    }
    if (this.hassObject) this.form.hass = this.hassObject;
    this.form.data = this.config;
  }

  private fireConfig(config: Record<string, any>): void {
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([key, value]) =>
        value !== "" && value !== undefined && value !== null && !this.skipValue(key, value)),
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
}
