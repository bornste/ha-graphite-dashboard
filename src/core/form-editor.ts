// Base of the visual editors: one ha-form with translated labels and helper texts below the
// fields. Building blocks for the schema: sections (expansion panels), the actions section,
// condition sections and lists with a dialog per entry. Empty optional values are not stored,
// so the YAML stays clean.
//
// Translation keys below the prefix of the card (fallback: the shared texts in "editor"):
//   <name>                      label of a field
//   helper.<name>               helper text of a field
//   sections.<name>             title of a section (lists: the label of the list)
//   helper.sections.<name>      description of a section
//   condition.<name>            fields of a condition section
//   <list>_item.<name>          fields of a list entry (fallback "editor.item.<name>")
import { languageOf, translate } from "./i18n";
import type { HomeAssistant } from "./types";

export interface ListField {
  name: string;
  // selector of the field; left out for a field that is a list itself (see "list")
  selector?: unknown;
  required?: boolean;
  // value of the field in a new entry (e.g. a switch that is on by default)
  default?: unknown;
  // the field is a list (or map) of its own, edited in a second dialog
  list?: { fields: ListField[]; options: ListOptions };
  // the field is one object with its own fields, edited in a second dialog
  object?: { fields: ListField[]; options: ListOptions };
}

export interface ListOptions {
  // fields shown as title and second line of an entry in the list
  labelField: string;
  descriptionField?: string;
  // entries may be plain texts in the YAML (e.g. an entity id): the field that holds the text
  stringField?: string;
  // the option is a map in the YAML ({key: value}): the two fields of an entry
  map?: { key: string; value: string; numericKey?: boolean };
  // switches whose "off" is meaningful and stays stored
  keepFalse?: string[];
  // fields that take one value or a list in the YAML and are edited as a list
  listFields?: string[];
  // extra conversion of an entry (e.g. a condition shown as several fields): itemToForm gets the
  // stored entry before its lists are converted, itemFromForm the entry with its lists in the
  // stored shape and returns the stored entry; empty fields are removed afterwards
  itemToForm?: (entry: Record<string, any>) => Record<string, any>;
  itemFromForm?: (entry: Record<string, any>) => Record<string, any>;
  // options of the fields that are lists or objects themselves (filled by listField)
  children?: Record<string, ListOptions>;
  objects?: Record<string, ListOptions>;
}

const sectionSuffix = "_section";
const sharedPrefix = "editor";

function isEmpty(value: unknown): boolean {
  return value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0);
}

// condition {entity, above, below, state} as shown in the form: "state" always as a list of texts
export function conditionToForm(condition: unknown): Record<string, unknown> {
  if (!condition || typeof condition !== "object") return {};
  const data: Record<string, unknown> = { ...condition };
  if (!isEmpty(data.state)) data.state = ([] as unknown[]).concat(data.state).map(String);
  return data;
}

// condition as stored: no empty parts, a single state as plain value
export function conditionFromForm(condition: unknown): Record<string, unknown> | undefined {
  if (!condition || typeof condition !== "object") return undefined;
  const entries = Object.entries(condition)
    .filter(([, value]) => !isEmpty(value))
    .map(([key, value]) => [key, key === "state" && Array.isArray(value) && value.length === 1 ? value[0] : value]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

// list (or map) option as shown in the form: always a list of objects
function listToForm(source: unknown, options: ListOptions): unknown {
  let value: any = source;
  if (options.map && value && typeof value === "object" && !Array.isArray(value)) {
    const { key, value: valueField, numericKey } = options.map;
    value = Object.entries(value).map(([entryKey, entryValue]) => ({
      [key]: numericKey && entryKey !== "" && !Number.isNaN(Number(entryKey)) ? Number(entryKey) : entryKey,
      [valueField]: entryValue,
    }));
  }
  if (!Array.isArray(value)) return value;
  return value.map((item) => {
    if (!options.stringField && (!item || typeof item !== "object")) return item;
    const source = item && typeof item === "object" ? { ...item } : { [options.stringField!]: item };
    const entry = options.itemToForm ? options.itemToForm(source) : source;
    for (const field of options.listFields ?? []) if (!isEmpty(entry[field])) entry[field] = [].concat(entry[field]);
    for (const [field, childOptions] of Object.entries(options.children ?? {})) entry[field] = listToForm(entry[field], childOptions);
    for (const [field, childOptions] of Object.entries(options.objects ?? {})) {
      if (entry[field] && typeof entry[field] === "object") entry[field] = (listToForm([entry[field]], childOptions) as unknown[])[0];
    }
    return entry;
  });
}

// list as stored: entries without their empty fields, short forms and maps restored
function listFromForm(value: any[], options: ListOptions): unknown {
  const items = value.map((item) => {
    if (!item || typeof item !== "object") return item;
    const entry = { ...item };
    for (const [field, childOptions] of Object.entries(options.children ?? {})) {
      if (Array.isArray(entry[field])) entry[field] = listFromForm(entry[field], childOptions);
    }
    for (const [field, childOptions] of Object.entries(options.objects ?? {})) {
      if (!entry[field] || typeof entry[field] !== "object") continue;
      const object = (listFromForm([entry[field]], childOptions) as Record<string, unknown>[])[0];
      entry[field] = Object.keys(object).length ? object : undefined;
    }
    const stored = options.itemFromForm ? options.itemFromForm(entry) : entry;
    const entries = Object.entries(stored).filter(([key, fieldValue]) =>
      !isEmpty(fieldValue) && (fieldValue !== false || !!options.keepFalse?.includes(key)));
    // an entry with only its text field goes back to the short form
    if (options.stringField && !options.map && entries.length === 1 && entries[0][0] === options.stringField) return entries[0][1];
    return Object.fromEntries(entries);
  });
  if (options.map) {
    const { key, value: valueField } = options.map;
    const entries = items
      .filter((item) => item && typeof item === "object" && !isEmpty(item[key]) && !isEmpty(item[valueField]))
      .map((item) => [String(item[key]), item[valueField]]);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return items.length ? items : undefined;
}

export abstract class GraphiteFormEditor extends HTMLElement {
  protected config: Record<string, any> = {};
  protected hassObject?: HomeAssistant;
  private form?: any;
  private formLanguage?: string;
  private formSchemaKey?: string;
  private shownDefaults?: string;
  private language = "en";
  // filled while the schema is built
  private conditionNames = new Set<string>();
  private listOptions = new Map<string, ListOptions>();
  private sectionLists = new Set<string>();

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

  // translated text of the card or of the shared editor texts; undefined without a translation
  private text(key: string): string | undefined {
    for (const prefix of [this.labelPrefix(), sharedPrefix]) {
      const fullKey = `${prefix}.${key}`;
      const text = translate(this.language, fullKey);
      if (text !== fullKey) return text;
    }
    return undefined;
  }

  // translated text of the card or the shared texts with {name} placeholders, for the editors
  protected localText(key: string, params: Record<string, string | number> = {}): string {
    const text = this.text(key) ?? key;
    return Object.entries(params).reduce((result, [name, value]) => result.split(`{${name}}`).join(String(value)), text);
  }

  // short text of a condition for the row of its dialog, e.g. "über 0, Zustand on"
  protected conditionLabel(condition: Record<string, unknown>): string {
    return ["above", "below", "state"]
      .filter((part) => !isEmpty(condition[part]))
      .map((part) => this.localText(`conditionLabel.${part}`, { value: ([] as unknown[]).concat(condition[part]).join(", ") }))
      .join(", ");
  }

  // translated label of a select option, e.g. optionLabel("range.days") -> "<prefix>.range.days"
  // (fallback: the shared texts, e.g. "editor.layouts.row")
  protected optionLabel(key: string): string {
    const language = languageOf(this.isConnected ? this : undefined, this.hassObject);
    for (const prefix of [this.labelPrefix(), sharedPrefix]) {
      const fullKey = `${prefix}.${key}`;
      const label = translate(language, fullKey);
      if (label !== fullKey) return label;
    }
    return key;
  }

  // radio for cards that exist as a row and as a tile (cards with a single layout do not show it)
  protected layoutField(): Record<string, unknown> {
    return this.selectField("layout", "layouts", ["row", "tile"], "list");
  }

  // dropdown (or radio list) with translated options: "<prefix>.<group>.<value>"
  protected selectField(name: string, group: string, values: string[], mode: "dropdown" | "list" = "dropdown"): Record<string, unknown> {
    return { name, selector: { select: { mode, options: values
      .map((value) => ({ value, label: this.optionLabel(`${group}.${value}`) })) } } };
  }

  // fields side by side
  protected grid(...schema: unknown[]): Record<string, unknown> {
    return { type: "grid", name: "", schema };
  }

  // expansion panel that only groups fields; the values stay on the top level of the config
  protected section(name: string, schema: unknown[], options: { expanded?: boolean; icon?: string } = {}): Record<string, unknown> {
    return { type: "expandable", name: `${name}${sectionSuffix}`, flatten: true, ...options, schema };
  }

  // section with the actions of the card
  protected actionsSection(names: string[] = ["tap_action", "hold_action", "double_tap_action"]): Record<string, unknown> {
    return this.section("actions", names.map((name) => ({ name, selector: { ui_action: {} } })), { icon: "mdi:gesture-tap" });
  }

  // section with the fields of a condition, stored as {entity, above, below, state} below the name
  protected conditionSection(name: string): Record<string, unknown> {
    this.conditionNames.add(name);
    const numberBox = { number: { mode: "box", step: "any" } };
    return {
      type: "expandable",
      name,
      schema: [
        { name: "entity", selector: { entity: {} } },
        this.grid({ name: "above", selector: numberBox }, { name: "below", selector: numberBox }),
        { name: "state", selector: { select: { multiple: true, custom_value: true, options: [] } } },
      ],
    };
  }

  // selector of a list of objects (or a map) with a dialog per entry; "name" is the translation
  // group of the fields ("<name>_item.<field>")
  private listSelector(name: string, fields: ListField[], options: ListOptions, multiple = true): Record<string, unknown> {
    return {
      object: {
        multiple,
        label_field: options.labelField,
        description_field: options.descriptionField,
        fields: Object.fromEntries(fields.map((field) => {
          if (field.list) (options.children ??= {})[field.name] = field.list.options;
          if (field.object) (options.objects ??= {})[field.name] = field.object.options;
          return [field.name, {
            selector: field.list ? this.listSelector(field.name, field.list.fields, field.list.options)
              : field.object ? this.listSelector(field.name, field.object.fields, field.object.options, false)
              : field.selector,
            required: field.required ?? false,
            ...(field.default === undefined ? {} : { default: field.default }),
            label: this.text(`${name}_item.${field.name}`) ?? this.text(`item.${field.name}`) ?? field.name,
            description: this.text(`helper.${name}_item.${field.name}`),
          }];
        })),
      },
    };
  }

  // list of objects (or a map) with a dialog per entry
  protected listField(name: string, fields: ListField[], options: ListOptions): Record<string, unknown> {
    this.listOptions.set(name, options);
    return { name, selector: this.listSelector(name, fields, options) };
  }

  // a list in its own section; the section shows the label and the helper of the list
  protected listSection(name: string, fields: ListField[], options: ListOptions, sectionOptions: { expanded?: boolean; icon?: string } = {}): Record<string, unknown> {
    this.sectionLists.add(name);
    return this.section(name, [this.listField(name, fields, options)], sectionOptions);
  }

  private labelOf(schema: { name: string }, path?: string[]): string {
    const name = schema.name;
    if (!name || this.sectionLists.has(name)) return "";
    if (name.endsWith(sectionSuffix)) {
      const base = name.slice(0, -sectionSuffix.length);
      return this.text(`sections.${base}`) ?? this.text(base) ?? base;
    }
    if (path?.some((part) => this.conditionNames.has(part))) return this.text(`condition.${name}`) ?? name;
    return this.text(name) ?? name;
  }

  private helperOf(schema: { name: string }, path?: string[]): string | undefined {
    const name = schema.name;
    if (!name || this.sectionLists.has(name)) return undefined;
    if (name.endsWith(sectionSuffix)) {
      const base = name.slice(0, -sectionSuffix.length);
      return this.text(`helper.sections.${base}`) ?? this.text(`helper.${base}`);
    }
    if (path?.some((part) => this.conditionNames.has(part))) return this.text(`helper.condition.${name}`);
    return this.text(`helper.${name}`);
  }

  // values the editor adds to the form data or takes out again (e.g. one option shown as several
  // fields, one list shown as two); toFormData gets the config with the defaults before lists and
  // conditions are converted, fromFormData the converted values and returns the stored shape
  protected toFormData(data: Record<string, any>): Record<string, any> {
    return data;
  }

  protected fromFormData(data: Record<string, any>): Record<string, any> {
    return data;
  }

  // config as shown in the form: conditions with a state list, maps as lists, plain texts as entries
  private toForm(config: Record<string, any>): Record<string, any> {
    const data = this.toFormData({ ...config });
    for (const name of this.conditionNames) data[name] = conditionToForm(data[name]);
    for (const [name, options] of this.listOptions) data[name] = listToForm(data[name], options);
    return data;
  }

  // form data as stored: the reverse of toForm, entries without their empty fields
  private fromForm(data: Record<string, any>): Record<string, any> {
    const config = { ...data };
    for (const name of this.conditionNames) config[name] = conditionFromForm(config[name]);
    for (const [name, options] of this.listOptions) {
      if (Array.isArray(config[name])) config[name] = listFromForm(config[name], options);
    }
    return this.fromFormData(config);
  }

  private formData(): Record<string, any> {
    return this.toForm({ ...this.defaults(), ...this.config });
  }

  setConfig(config: Record<string, any>): void {
    this.config = config;
    this.render();
  }

  set hass(hass: HomeAssistant) {
    this.hassObject = hass;
    if (this.form) {
      this.form.hass = hass;
      // defaults can depend on the entity state (e.g. measured values): refresh the shown data only
      // when they changed, so typing in a field is not disturbed by state updates
      const defaults = JSON.stringify(this.defaults());
      if (defaults !== this.shownDefaults) {
        this.form.data = this.formData();
        this.shownDefaults = defaults;
      }
    } else this.render();
  }

  private render(): void {
    if (!this.form) {
      this.form = document.createElement("ha-form");
      this.form.addEventListener("value-changed", (event: CustomEvent) => {
        event.stopPropagation();
        this.fireConfig(this.fromForm({ ...this.config, ...event.detail.value }));
      });
      this.replaceChildren(this.form);
    }
    const language = languageOf(this.isConnected ? this : undefined, this.hassObject);
    if (this.formLanguage !== language || this.formSchemaKey !== this.schemaKey()) {
      this.formLanguage = language;
      this.language = language;
      this.formSchemaKey = this.schemaKey();
      this.form.schema = this.schema();
      this.form.computeLabel = (schema: { name: string }, _data: unknown, options?: { path?: string[] }) =>
        this.labelOf(schema, options?.path);
      this.form.computeHelper = (schema: { name: string }, options?: { path?: string[] }) =>
        this.helperOf(schema, options?.path);
    }
    if (this.hassObject) this.form.hass = this.hassObject;
    this.form.data = this.formData();
    this.shownDefaults = JSON.stringify(this.defaults());
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
