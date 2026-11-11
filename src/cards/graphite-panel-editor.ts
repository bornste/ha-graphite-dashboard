// Visual editor of graphite-panel: panel options in an ha-form (sections "header" and "layout"
// as expansion panels, hints as helper texts below the fields), child cards in Home Assistant's
// own stack editor (tabs, card picker, card editors).
// graphite-dialog uses the same editor in "dialog" mode: a section "dialog" (hash, width) first,
// no panel surface and padding (a dialog has its own surface).
import type { HomeAssistant } from "../core/types";
import { languageOf, translate } from "../core/i18n";

const prefix = "panel.editor";

// name of the nested section that holds the condition {entity, above, below, state}
const conditionName = "info_alert";

// sections that only group fields; their data stays on the top level of the config
const chipsSection = "chipsSection";
const buttonsSection = "buttonsSection";
const summarySection = "summarySection";

export type PanelEditorMode = "panel" | "dialog";

// lists whose name the section header already shows
const listNames = ["chips", "buttons", "summary"];

// translated text or undefined when the key has no translation (e.g. a field without helper)
function optionalText(language: string, key: string): string | undefined {
  const fullKey = `${prefix}.${key}`;
  const text = translate(language, fullKey);
  return text === fullKey ? undefined : text;
}

// schema with translated labels; the grid options are only shown for the grid layout
function editorSchema(language: string, layout: string, mode: PanelEditorMode) {
  const text = (key: string) => translate(language, `${prefix}.${key}`);
  // field of a list entry (chip, button): label and helper come from "item" / "helper.item"
  const itemField = (name: string, selector: unknown, required = false) => [name, {
    selector,
    required,
    label: text(`item.${name}`),
    description: optionalText(language, `helper.item.${name}`),
  }];
  const numberBox = { number: { mode: "box", step: "any" } };
  // free texts as a list: a condition matches one of several states
  const stateList = { select: { multiple: true, custom_value: true, options: [] } };
  // named colors of the theme, or any CSS color typed in
  const colorSelect = {
    select: {
      mode: "dropdown",
      custom_value: true,
      options: ["accent", "success", "danger", "secondary"].map((color) => ({ value: color, label: text(`color.${color}`) })),
    },
  };

  const dialogSection = mode === "dialog" ? [{
    type: "expandable",
    name: "dialogSection",
    icon: "mdi:dock-window",
    flatten: true,
    expanded: true,
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
          { name: "hash", required: true, selector: { text: {} } },
          { name: "width", selector: { text: {} } },
        ],
      },
    ],
  }] : [];

  return [
    ...dialogSection,
    {
      type: "expandable",
      name: "header",
      icon: "mdi:page-layout-header",
      flatten: true,
      expanded: true,
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "info", selector: { text: {} } },
        {
          // not flattened: the fields are stored below "info_alert"
          type: "expandable",
          name: conditionName,
          schema: [
            { name: "entity", selector: { entity: {} } },
            {
              type: "grid",
              name: "",
              schema: [
                { name: "above", selector: numberBox },
                { name: "below", selector: numberBox },
              ],
            },
            { name: "state", selector: stateList },
          ],
        },
        {
          type: "expandable",
          name: summarySection,
          flatten: true,
          schema: [
            {
              name: "summary",
              selector: {
                object: {
                  multiple: true,
                  label_field: "text",
                  description_field: "entity",
                  fields: Object.fromEntries([
                    itemField("entity", { entity: {} }, true),
                    itemField("text", { text: {} }),
                    itemField("text_one", { text: {} }),
                    itemField("color", colorSelect),
                    itemField("show_above", numberBox),
                    itemField("show_below", numberBox),
                    itemField("show_state", stateList),
                  ]),
                },
              },
            },
            { name: "summary_empty", selector: { text: {} } },
          ],
        },
        {
          type: "expandable",
          name: chipsSection,
          flatten: true,
          schema: [{
            name: "chips",
            selector: {
              object: {
                multiple: true,
                label_field: "entity",
                description_field: "label",
                fields: Object.fromEntries([
                  itemField("entity", { entity: {} }, true),
                  itemField("label", { text: {} }),
                  itemField("unit", { text: {} }),
                  itemField("decimals", { number: { min: 0, max: 4, mode: "box" } }),
                  itemField("muted", { boolean: {} }),
                  itemField("tap_action", { ui_action: {} }),
                  itemField("alert_above", numberBox),
                  itemField("alert_below", numberBox),
                  itemField("alert_state", stateList),
                ]),
              },
            },
          }],
        },
        {
          type: "expandable",
          name: buttonsSection,
          flatten: true,
          schema: [{
            name: "buttons",
            selector: {
              object: {
                multiple: true,
                label_field: "name",
                description_field: "entity",
                fields: Object.fromEntries([
                  itemField("name", { text: {} }),
                  itemField("icon", { icon: {} }),
                  itemField("entity", { entity: {} }),
                  itemField("tap_action", { ui_action: {} }),
                  itemField("active_entity", { entity: {} }),
                  itemField("active_above", numberBox),
                  itemField("active_below", numberBox),
                  itemField("active_state", stateList),
                ]),
              },
            },
          }],
        },
      ],
    },
    {
      type: "expandable",
      name: "layoutSection",
      icon: "mdi:view-dashboard-outline",
      flatten: true,
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
        ...(layout === "grid" ? [{
          type: "grid",
          name: "",
          schema: [
            { name: "columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
            { name: "min_column_width", selector: { text: {} } },
          ],
        }] : []),
        ...(mode === "dialog" ? [{ name: "gap", selector: { text: {} } }] : [
          {
            type: "grid",
            name: "",
            schema: [
              { name: "gap", selector: { text: {} } },
              { name: "padding", selector: { text: {} } },
            ],
          },
          { name: "frame", selector: { boolean: {} } },
        ]),
      ],
    },
  ];
}

function isEmpty(value: unknown): boolean {
  return value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0);
}

// condition as shown in the form: "state" always as a list of texts (multi select)
function conditionData(condition: unknown): Record<string, unknown> {
  if (!condition || typeof condition !== "object") return {};
  const data: Record<string, unknown> = { ...condition };
  if (!isEmpty(data.state)) data.state = ([] as unknown[]).concat(data.state).map(String);
  return data;
}

// condition as stored: no empty parts, a single state as plain value
function storedCondition(condition: unknown): Record<string, unknown> | undefined {
  if (!condition || typeof condition !== "object") return undefined;
  const entries = Object.entries(condition)
    .filter(([, value]) => !isEmpty(value))
    .map(([key, value]) => [key, key === "state" && Array.isArray(value) && value.length === 1 ? value[0] : value]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

// The dialog of a list entry is a flat form, so the condition of an entry (chip "alert", button
// "active") is shown as fields "<key>_<part>" (e.g. alert_above) and stored as an object again.
const conditionParts = ["entity", "above", "below", "state"];

// list entries as shown in the form
function itemsData(items: unknown, conditionKey: string): unknown {
  if (!Array.isArray(items)) return items;
  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    const { [conditionKey]: condition, ...data } = item as Record<string, unknown>;
    for (const [part, value] of Object.entries(conditionData(condition))) {
      if (conditionParts.includes(part)) data[`${conditionKey}_${part}`] = value;
    }
    // the short form tap_action: none as an action object (action selector)
    if (data.tap_action === "none") data.tap_action = { action: "none" };
    return data;
  });
}

// list entries as stored: unset fields and switched off flags are left out
function storedItems(items: unknown, conditionKey: string): unknown[] | undefined {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    const data: Record<string, unknown> = {};
    const condition: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(item)) {
      const part = key.startsWith(`${conditionKey}_`) ? key.slice(conditionKey.length + 1) : "";
      if (conditionParts.includes(part)) condition[part] = value;
      else if (value !== undefined && value !== null && !(key === "muted" && value === false)) data[key] = value;
    }
    // an entry that was not opened in the form still has its condition object
    const stored = storedCondition({ ...(data[conditionKey] as object | undefined), ...condition });
    if (stored) data[conditionKey] = stored;
    else delete data[conditionKey];
    return data;
  });
}

export class GraphitePanelEditor extends HTMLElement {
  protected mode: PanelEditorMode = "panel";
  private config: Record<string, any> = {};
  private hassObject?: HomeAssistant;
  private lovelaceObject?: unknown;
  private form?: any;
  private stackEditor?: any;
  private formSchemaKey?: string;

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
    const layout = this.config.layout || "vertical";
    const schemaKey = `${language}|${layout}|${this.mode}`;
    if (this.formSchemaKey !== schemaKey) {
      this.formSchemaKey = schemaKey;
      this.form.schema = editorSchema(language, layout, this.mode);
      // fields inside the condition section have their own texts ("condition.entity", ...)
      const textKey = (schema: { name: string }, options?: { path?: string[] }) =>
        (options?.path?.includes(conditionName) ? `condition.${schema.name}` : schema.name);
      this.form.computeLabel = (schema: { name: string }, _data: unknown, options?: { path?: string[] }) => {
        // the list sections already show the name in their header
        if (!schema.name || listNames.includes(schema.name)) return "";
        return optionalText(language, textKey(schema, options)) ?? schema.name;
      };
      this.form.computeHelper = (schema: { name: string }, options?: { path?: string[] }) =>
        (schema.name ? optionalText(language, `helper.${textKey(schema, options)}`) : undefined);
    }
    if (this.hassObject) {
      this.form.hass = this.hassObject;
      this.stackEditor.hass = this.hassObject;
    }
    if (this.lovelaceObject) this.stackEditor.lovelace = this.lovelaceObject;

    const { title, info, info_alert, summary, summary_empty, chips, buttons, columns, gap, padding, min_column_width, frame,
      hash, width } = this.config;
    const data: Record<string, unknown> = {
      title, info, info_alert: conditionData(info_alert), summary: itemsData(summary, "show"), summary_empty,
      chips: itemsData(chips, "alert"), buttons: itemsData(buttons, "active"),
      layout, columns, gap, min_column_width,
    };
    if (this.mode === "dialog") Object.assign(data, { hash, width });
    else Object.assign(data, { padding, frame: frame !== false });
    this.form.data = data;
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

  // empty optional values are not stored, so the YAML stays clean
  private fireConfig(config: Record<string, any>): void {
    const storedConfig: Record<string, any> = {
      ...config,
      info_alert: storedCondition(config.info_alert),
      summary: storedItems(config.summary, "show"),
      chips: storedItems(config.chips, "alert"),
      buttons: storedItems(config.buttons, "active"),
    };
    const cleanConfig = Object.fromEntries(
      Object.entries(storedConfig).filter(([key, value]) => {
        if (value === "" || value === undefined || value === null) return false;
        // frame defaults to true, only "false" is stored; a dialog has no frame
        if (key === "frame" && (value !== false || this.mode === "dialog")) return false;
        // vertical is the default layout of panel and dialog
        if (key === "layout" && value === "vertical") return false;
        return true;
      }),
    );
    this.config = cleanConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cleanConfig }, bubbles: true, composed: true }));
  }
}
