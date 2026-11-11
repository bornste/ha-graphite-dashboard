// graphite-vacuum: robot vacuum of the Dreame integration in two layouts.
// layout: tile  -> animated robot, state, progress, hint chip or quick control; tap opens the panel (navigation_path)
// layout: panel -> left: quick picks, mode, suction, rooms, start; right: robot and station state,
//                  maintenance with reset and station actions
// The other entities of the integration are found from the prefix of the vacuum entity.
import { html, nothing, type CSSResultGroup, type PropertyValues, type TemplateResult } from "lit";
import { GraphiteCard } from "../../core/graphite-card";
import { registerCard, registerElement } from "../../core/register";
import type { GraphiteCardConfig, HassEntity } from "../../core/types";
import { GraphiteVacuumEditor } from "./graphite-vacuum-editor";
import { artStyles, robotArt } from "./vacuum-art";
import { panelStyles, tileStyles } from "./vacuum-styles";

export interface VacuumMode {
  value: string;
  name?: string;
  icon?: string;
}

export interface VacuumSuctionLevel {
  value: string;
  name?: string;
}

export interface VacuumMaintenance {
  // matches the attributes <key>_left (%) and <key>_time_left (h)
  key: string;
  name?: string;
  due?: string;
  reset?: string;
}

export interface VacuumAction {
  key?: string;
  name?: string;
  icon?: string;
  entity: string;
}

export interface VacuumRoom {
  id: number | string;
  name?: string;
  icon?: string;
}

export interface VacuumPreset {
  name: string;
  icon?: string;
  // rooms by segment id or by name
  rooms?: Array<number | string>;
  mode?: string;
  suction?: string;
}

export interface VacuumConfig extends GraphiteCardConfig {
  entity: string;
  layout?: "tile" | "panel";
  name?: string | false;
  navigation_path?: string;
  prefix?: string;
  rooms?: Array<VacuumRoom | number>;
  presets?: VacuumPreset[];
  modes?: Array<VacuumMode | string>;
  suction_levels?: Array<VacuumSuctionLevel | string>;
  boost?: boolean;
  boost_name?: string;
  maintenance?: VacuumMaintenance[];
  maintenance_threshold?: number;
  actions?: VacuumAction[];
  panels?: boolean;
  cleaning_title?: string;
  presets_title?: string;
  station_title?: string;
  mode_entity?: string;
  suction_entity?: string;
  boost_entity?: string;
  history_entity?: string;
  error_entity?: string;
  drying_left_entity?: string;
}

interface MapRoom {
  id: number;
  name: string;
  icon?: string;
}

interface ShownRoom {
  id: number;
  name: string;
  icon: string;
}

interface RoomIssue {
  id: number;
  name: string;
  text: string;
  newId?: number;
}

interface WearItem {
  key: string;
  reset?: string;
  name: string;
  left: number;
  hours: number | null;
  due: boolean;
  dueText: string;
}

type StatusKey = "offline" | "error" | "returning" | "washing" | "paused" | "cleaning" | "drying" | "charging" | "ready";

interface VacuumStatus {
  key: StatusKey;
  // classes of the artwork (animation)
  art: string;
  title: string;
  subtitle: string;
  active: boolean;
  control?: "pause" | "resume";
  progress?: number | null;
  hint?: string;
}

interface VacuumEntities {
  mode: string;
  suction: string;
  boost: string;
  history: string;
  error: string;
  dryingLeft: string;
}

// names come from the translations (vacuum.modes.*, vacuum.suctionLevels.*, ...) unless the config sets one
const defaultModes: VacuumMode[] = [
  { value: "sweeping", icon: "mdi:vacuum-outline" },
  { value: "mopping_after_sweeping", icon: "mdi:water-sync" },
  { value: "sweeping_and_mopping", icon: "mdi:water-plus-outline" },
];
const knownModes = ["sweeping", "mopping", "sweeping_and_mopping", "mopping_after_sweeping"];
// cleaning_mode attribute of the vacuum entity -> option of the mode select
const vacuumModeKeys: Record<string, string> = {
  "Sweeping": "sweeping",
  "Mopping": "mopping",
  "Sweeping and mopping": "sweeping_and_mopping",
  "Mopping after sweeping": "mopping_after_sweeping",
};
const defaultSuctionLevels: VacuumSuctionLevel[] = [{ value: "quiet" }, { value: "standard" }, { value: "strong" }, { value: "turbo" }];
// station states as translation keys (vacuum.station.*)
const stationStates: Record<string, string> = {
  "installed": "ok",
  "not installed": "missing",
  "full": "full",
  "low": "low",
  "check": "check",
  "enabled": "ok",
};
const hintStates: StatusKey[] = ["ready", "charging", "drying", "error"];
const confirmMilliseconds = 4000;
const pressedMilliseconds = 2500;

export class GraphiteVacuum extends GraphiteCard<VacuumConfig> {
  static properties = {
    ...GraphiteCard.properties,
    selected: { state: true },
    chosenMode: { state: true },
    chosenSuction: { state: true },
    chosenBoost: { state: true },
    confirmReset: { state: true },
    pressedAction: { state: true },
    errorText: { state: true },
  };

  static styles = artStyles;

  // rooms chosen in the panel, in the tap order
  declare selected: number[];
  // mode, suction and boost changed in the panel, applied when the cleaning starts
  declare chosenMode?: string;
  declare chosenSuction?: string;
  declare chosenBoost?: boolean;
  // reset button waiting for the second tap
  declare confirmReset?: string;
  // station action that was just pressed (shows a check)
  declare pressedAction?: string;
  declare errorText: string;

  private entities!: VacuumEntities;
  private modes: VacuumMode[] = [];
  private suctionLevels: VacuumSuctionLevel[] = [];
  private maintenance: VacuumMaintenance[] = [];
  private stationActions: VacuumAction[] = [];
  private confirmTimer?: number;
  private pressedTimer?: number;
  private warnedIssues = 0;

  constructor() {
    super();
    this.selected = [];
    this.errorText = "";
  }

  protected normalizeConfig(config: VacuumConfig): VacuumConfig {
    if (!config.entity) throw new Error("entity is required");
    const prefix = config.prefix || config.entity.split(".")[1];
    this.entities = {
      mode: config.mode_entity || `select.${prefix}_cleaning_mode`,
      suction: config.suction_entity || `select.${prefix}_suction_level`,
      boost: config.boost_entity || `switch.${prefix}_max_suction_power`,
      history: config.history_entity || `sensor.${prefix}_cleaning_history`,
      error: config.error_entity || `sensor.${prefix}_error`,
      dryingLeft: config.drying_left_entity || `sensor.${prefix}_drying_left`,
    };
    this.modes = (config.modes || defaultModes).map((mode) =>
      typeof mode === "string" ? defaultModes.find((item) => item.value === mode) || { value: mode } : mode);
    this.suctionLevels = (config.suction_levels || defaultSuctionLevels).map((level) =>
      typeof level === "string" ? defaultSuctionLevels.find((item) => item.value === level) || { value: level } : level);
    this.maintenance = config.maintenance || [
      { key: "main_brush", reset: `button.${prefix}_reset_main_brush` },
      { key: "side_brush", reset: `button.${prefix}_reset_side_brush` },
      { key: "filter", reset: `button.${prefix}_reset_filter` },
      { key: "sensor_dirty", reset: `button.${prefix}_reset_sensor` },
    ];
    this.stationActions = config.actions || [
      { key: "self_clean", icon: "mdi:water-sync", entity: `button.${prefix}_self_clean` },
      { key: "manual_drying", icon: "mdi:heat-wave", entity: `button.${prefix}_manual_drying` },
      { key: "base_station_cleaning", icon: "mdi:spray-bottle", entity: `button.${prefix}_base_station_cleaning` },
      { key: "start_auto_empty", icon: "mdi:delete-empty-outline", entity: `button.${prefix}_start_auto_empty` },
    ];
    return config;
  }

  // not "isPanel": Home Assistant sets that property on cards in panel views
  private get panelLayout(): boolean {
    return this.config?.layout === "panel";
  }

  protected stylesForConfig(): CSSResultGroup {
    return this.panelLayout ? [artStyles, panelStyles] : [artStyles, tileStyles];
  }

  protected watchedEntities(): string[] {
    if (!this.config) return [];
    return [this.config.entity, ...Object.values(this.entities), ...this.stationActions.map((action) => action.entity)];
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.confirmTimer);
    window.clearTimeout(this.pressedTimer);
  }

  // ---------- texts ----------

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.localize(`vacuum.${key}`, params);
  }

  // name of a configured or default item: own name, else the translation of its key, else the key
  private itemName(item: { name?: string; key?: string; value?: string }, group: string): string {
    if (item.name) return item.name;
    const id = String(item.key ?? item.value ?? "");
    const key = `${group}.${id}`;
    const text = this.t(key);
    return text === `vacuum.${key}` ? id : text;
  }

  private get locale(): string {
    return this.hass?.locale?.language || this.language;
  }

  // ---------- state helpers ----------

  private stateOf(entityId: string): HassEntity | undefined {
    return this.hass?.states[entityId];
  }

  private get vacuumAttributes(): Record<string, any> {
    return this.stateOf(this.config!.entity)?.attributes || {};
  }

  // config name, otherwise the entity id in readable form ("vacuum.robot" -> "Robot")
  private deviceName(): string {
    if (typeof this.config!.name === "string" && this.config!.name) return this.config!.name;
    const objectId = this.config!.entity.split(".")[1] || "";
    return objectId.charAt(0).toUpperCase() + objectId.slice(1).split("_").join(" ");
  }

  // rooms of the selected map as the integration reports them
  private mapRooms(): MapRoom[] {
    const attributes = this.vacuumAttributes;
    const rooms = attributes.rooms || {};
    return rooms[attributes.selected_map] || Object.values(rooms)[0] || [];
  }

  // a room by segment id or by name
  private findRoom<T extends { id: number; name: string }>(rooms: T[], key: number | string): T | undefined {
    return rooms.find((room) => room.id === Number(key))
      || rooms.find((room) => String(room.name).toLowerCase() === String(key).toLowerCase());
  }

  private configuredRooms(): VacuumRoom[] | undefined {
    return this.config!.rooms?.map((entry) => (typeof entry === "object" ? entry : { id: entry }));
  }

  // rooms in config order (rooms that do not fit the map are left out, so a button never cleans
  // the wrong room), otherwise all rooms of the map in the cleaning sequence
  private rooms(): ShownRoom[] {
    const mapRooms = this.mapRooms();
    const configured = this.configuredRooms();
    if (configured) {
      const issueIds = this.roomIssues().map((issue) => issue.id);
      return configured.flatMap((room) => {
        if (issueIds.includes(Number(room.id))) return [];
        const known = this.findRoom(mapRooms, room.id);
        return known ? [{ id: known.id, name: room.name || known.name, icon: room.icon || known.icon || "mdi:floor-plan" }] : [];
      });
    }
    const sequence: number[] = this.vacuumAttributes.cleaning_sequence || [];
    const position = (id: number) => (sequence.indexOf(id) < 0 ? 999 : sequence.indexOf(id));
    return [...mapRooms]
      .sort((first, second) => position(first.id) - position(second.id))
      .map((room) => ({ id: room.id, name: room.name, icon: room.icon || "mdi:floor-plan" }));
  }

  // configured rooms that do not fit the current map: the id is missing, or it belongs to another room
  // whose name differs while the configured name exists on the map under another id (map recreated);
  // a renamed room (own name that is not on the map) is no issue
  private roomIssues(): RoomIssue[] {
    const configured = this.configuredRooms();
    const mapRooms = this.mapRooms();
    if (!configured || !mapRooms.length) return [];
    const sameName = (first: string, second: string) => String(first).toLowerCase() === String(second).toLowerCase();
    return configured.flatMap((room): RoomIssue[] => {
      const id = Number(room.id);
      const known = mapRooms.find((mapRoom) => mapRoom.id === id);
      const byName = room.name ? mapRooms.find((mapRoom) => sameName(mapRoom.name, room.name!)) : undefined;
      if (!known)
        return [{ id, name: room.name || this.t("room", { id }), text: this.t("roomMissing", { id }), newId: byName?.id }];
      if (room.name && !sameName(known.name, room.name) && byName && byName.id !== id)
        return [{ id, name: room.name, text: this.t("roomChanged", { id, name: known.name }), newId: byName.id }];
      return [];
    });
  }

  private roomName(id: number): string {
    return this.findRoom(this.rooms(), id)?.name || "";
  }

  private currentMode(): string {
    if (this.chosenMode) return this.chosenMode;
    const selectState = this.stateOf(this.entities.mode)?.state;
    if (selectState && selectState !== "unavailable") return selectState;
    return vacuumModeKeys[this.vacuumAttributes.cleaning_mode] || "";
  }

  private currentSuction(): string {
    return this.chosenSuction || this.stateOf(this.entities.suction)?.state || "";
  }

  private currentBoost(): boolean {
    if (this.chosenBoost !== undefined) return this.chosenBoost;
    return this.stateOf(this.entities.boost)?.state === "on";
  }

  private modeName(value: string): string {
    const mode = this.modes.find((item) => item.value === value);
    if (mode) return this.itemName(mode, "modes");
    return knownModes.includes(value) ? this.t(`modes.${value}`) : "";
  }

  private formatDuration(minutes: number): string {
    const total = Math.max(0, Math.round(minutes));
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (hours === 0) return this.t("minutes", { minutes: rest });
    return rest ? this.t("hoursMinutes", { hours, minutes: rest }) : this.t("hours", { hours });
  }

  private formatLastCleaning(): string {
    const value = this.stateOf(this.entities.history)?.state;
    const date = value ? new Date(value) : undefined;
    if (!date || isNaN(date.getTime())) return "";
    const time = date.toLocaleTimeString(this.locale, { hour: "2-digit", minute: "2-digit" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.round((today.getTime() - day.getTime()) / 86400000);
    if (days === 0) return this.t("today", { time });
    if (days === 1) return this.t("yesterday", { time });
    if (days < 7) return `${date.toLocaleDateString(this.locale, { weekday: "short" }).split(".").join("")} ${time}`;
    return date.toLocaleDateString(this.locale, { day: "numeric", month: "numeric" });
  }

  private stationValue(raw: unknown): string {
    if (raw === undefined || raw === null || raw === "") return "";
    const key = stationStates[String(raw).toLowerCase()];
    return key ? this.t(`station.${key}`) : String(raw).toLowerCase();
  }

  // maintenance items with remaining life; due at or below the threshold
  private wearItems(): WearItem[] {
    const attributes = this.vacuumAttributes;
    const threshold = Number(this.config!.maintenance_threshold ?? 10);
    return this.maintenance.flatMap((item): WearItem[] => {
      const left = attributes[`${item.key}_left`];
      if (left === undefined) return [];
      const hours = attributes[`${item.key}_time_left`];
      const name = this.itemName(item, "maintenance");
      const dueKey = `maintenanceDue.${item.key}`;
      const ownDue = item.name ? undefined : this.t(dueKey);
      const dueText = item.due || (ownDue && ownDue !== `vacuum.${dueKey}` ? ownDue : this.t("due", { name }));
      return [{ key: item.key, reset: item.reset, name, left: Number(left), hours: hours === undefined ? null : Number(hours), due: Number(left) <= threshold, dueText }];
    });
  }

  // hints for the tile chip (only shown while not cleaning)
  private hints(): string[] {
    const attributes = this.vacuumAttributes;
    const hints: string[] = [];
    if (attributes.low_water) hints.push(this.t("refillWater"));
    const dirty = this.stationValue(attributes.dirty_water_tank_status);
    if (dirty && dirty !== this.t("station.ok")) hints.push(`${this.t("dirtyWater")} ${dirty}`);
    const due = this.wearItems().filter((item) => item.due);
    if (due.length === 1) hints.push(due[0].dueText);
    else if (due.length > 1) hints.push(this.t("maintenanceCount", { count: due.length }));
    return hints;
  }

  // what the robot is doing: text, animation classes and quick control
  private status(): VacuumStatus {
    const entity = this.stateOf(this.config!.entity);
    if (!entity || entity.state === "unavailable" || entity.state === "unknown")
      return { key: "offline", art: "offline sleep", title: this.t("states.offline"), subtitle: "", active: false };
    const attributes = entity.attributes;
    const battery = attributes.battery ?? attributes.battery_level;
    const batteryText = battery !== undefined ? this.t("battery", { battery }) : "";
    const mode = vacuumModeKeys[attributes.cleaning_mode] || this.stateOf(this.entities.mode)?.state || "";
    const mopping = mode !== "" && mode !== "sweeping";
    const progressParts = [this.modeName(mode)];
    if (attributes.cleaning_progress) progressParts.push(`${attributes.cleaning_progress} %`);
    if (attributes.cleaned_area) progressParts.push(`${attributes.cleaned_area} m²`);
    const progressText = progressParts.filter(Boolean).join(" · ");
    const currentRoom = attributes.current_segment ? this.roomName(attributes.current_segment) : "";

    if (attributes.has_error || entity.state === "error") {
      const description = this.stateOf(this.entities.error)?.attributes?.description || attributes.error || "";
      return { key: "error", art: "err", title: this.t("states.error"), subtitle: description, active: false, hint: this.t("states.error") };
    }
    if (attributes.returning_to_wash)
      return { key: "returning", art: "return", title: this.t("states.returningToWash"), subtitle: progressText, active: true, control: "pause" };
    if (attributes.washing || attributes.washing_paused)
      return {
        key: "washing",
        art: "wash docked",
        title: attributes.washing_paused ? this.t("states.washingPaused") : this.t("states.washing"),
        subtitle: attributes.started ? `${this.t("intermediateWash")} · ${progressText}` : batteryText,
        active: true,
        progress: attributes.started ? attributes.cleaning_progress : null,
      };
    if (attributes.returning || entity.state === "returning")
      return { key: "returning", art: "return", title: this.t("states.returning"), subtitle: progressText || batteryText, active: true, control: "pause" };
    if (attributes.paused || entity.state === "paused")
      return {
        key: "paused",
        art: "",
        title: this.t("states.paused"),
        subtitle: [currentRoom, progressText].filter(Boolean).join(" · "),
        active: true,
        control: "resume",
        progress: attributes.cleaning_progress,
      };
    if (attributes.running || entity.state === "cleaning")
      return {
        key: "cleaning",
        art: `run${mopping ? " mopping" : ""}`,
        title: currentRoom || this.t("states.cleaning"),
        subtitle: progressText,
        active: true,
        control: "pause",
        progress: attributes.cleaning_progress,
      };
    if (attributes.drying) {
      const left = Number(this.stateOf(this.entities.dryingLeft)?.state ?? attributes.drying_left);
      return {
        key: "drying",
        art: "dry docked",
        title: this.t("states.drying"),
        subtitle: left > 0 ? this.t("remaining", { duration: this.formatDuration(left) }) : batteryText,
        active: false,
      };
    }
    if (attributes.charging)
      return { key: "charging", art: "charge", title: this.t("states.charging"), subtitle: batteryText, active: false };
    const last = this.formatLastCleaning();
    return {
      key: "ready",
      art: `${attributes.docked ? "docked " : ""}sleep`,
      title: this.t("states.ready"),
      subtitle: [batteryText, last].filter(Boolean).join(" · "),
      active: false,
    };
  }

  // ---------- actions ----------

  private async callService(domain: string, service: string, data: Record<string, unknown>, entityId: string): Promise<void> {
    this.errorText = "";
    try {
      await this.hass!.callService(domain, service, data, { entity_id: entityId });
    } catch (error) {
      this.errorText = (error as { message?: string })?.message || this.t("actionFailed");
      throw error;
    }
  }

  // service call whose error is only shown below the start button
  private run(domain: string, service: string, data: Record<string, unknown>, entityId: string): void {
    this.callService(domain, service, data, entityId).catch(() => undefined);
  }

  private openPanel(): void {
    const path = this.config!.navigation_path;
    if (path) {
      history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } else {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: this.config!.entity }, bubbles: true, composed: true }));
    }
  }

  private onTileKey(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.openPanel();
  }

  private onControl(event: Event, control: "pause" | "resume"): void {
    event.stopPropagation();
    this.run("vacuum", control === "resume" ? "start" : "pause", {}, this.config!.entity);
  }

  // applies mode, suction and boost if they were changed in the panel, then cleans the selected rooms
  private async startCleaning(): Promise<void> {
    if (this.selected.length === 0) return;
    try {
      if (this.chosenMode && this.chosenMode !== this.stateOf(this.entities.mode)?.state)
        await this.callService("select", "select_option", { option: this.chosenMode }, this.entities.mode);
      if (this.chosenSuction && this.chosenSuction !== this.stateOf(this.entities.suction)?.state)
        await this.callService("select", "select_option", { option: this.chosenSuction }, this.entities.suction);
      if (this.chosenBoost !== undefined && this.chosenBoost !== (this.stateOf(this.entities.boost)?.state === "on"))
        await this.callService("switch", this.chosenBoost ? "turn_on" : "turn_off", {}, this.entities.boost);
      await this.callService("dreame_vacuum", "vacuum_clean_segment", { segments: [...this.selected] }, this.config!.entity);
      this.selected = [];
      this.chosenMode = undefined;
      this.chosenSuction = undefined;
      this.chosenBoost = undefined;
    } catch {
      // the message is shown below the start button
    }
  }

  private onStart(status: VacuumStatus): void {
    if (status.control === "pause" && status.key !== "returning") this.run("vacuum", "pause", {}, this.config!.entity);
    else if (status.control === "resume") this.run("vacuum", "start", {}, this.config!.entity);
    else this.startCleaning();
  }

  // preset rooms by id, by shown name or by the name of the integration
  private presetRooms(preset: VacuumPreset): number[] {
    const rooms = this.rooms();
    const mapRooms = this.mapRooms();
    return (preset.rooms || []).flatMap((key) => {
      const room = this.findRoom(rooms, key) || this.findRoom(mapRooms, key);
      return room ? [room.id] : [];
    });
  }

  private presetMatches(preset: VacuumPreset): boolean {
    const rooms = this.presetRooms(preset);
    if (rooms.length !== this.selected.length || !rooms.every((id) => this.selected.includes(id))) return false;
    if (preset.mode && preset.mode !== this.currentMode()) return false;
    if (preset.suction && preset.suction !== this.currentSuction()) return false;
    return true;
  }

  private choosePreset(preset: VacuumPreset): void {
    this.selected = this.presetRooms(preset);
    if (preset.mode) this.chosenMode = preset.mode;
    if (preset.suction) this.chosenSuction = preset.suction;
  }

  private toggleRoom(id: number): void {
    this.selected = this.selected.includes(id) ? this.selected.filter((room) => room !== id) : [...this.selected, id];
  }

  private toggleAllRooms(): void {
    const all = this.rooms().map((room) => room.id);
    this.selected = this.selected.length === all.length ? [] : all;
  }

  // two taps: the first one asks for confirmation
  private onReset(entityId: string): void {
    window.clearTimeout(this.confirmTimer);
    if (this.confirmReset === entityId) {
      this.confirmReset = undefined;
      this.run("button", "press", {}, entityId);
      return;
    }
    this.confirmReset = entityId;
    this.confirmTimer = window.setTimeout(() => { this.confirmReset = undefined; }, confirmMilliseconds);
  }

  private async onPress(entityId: string): Promise<void> {
    try {
      await this.callService("button", "press", {}, entityId);
    } catch {
      return;
    }
    this.pressedAction = entityId;
    window.clearTimeout(this.pressedTimer);
    this.pressedTimer = window.setTimeout(() => { this.pressedAction = undefined; }, pressedMilliseconds);
  }

  // ---------- rendering ----------

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const issues = this.panelLayout && this.hass ? this.roomIssues() : [];
    if (issues.length && issues.length !== this.warnedIssues) console.warn("graphite-vacuum: room ids do not match the map", issues);
    this.warnedIssues = issues.length;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config || !this.hass) return nothing;
    return this.panelLayout ? this.renderPanel() : this.renderTile();
  }

  private renderArt(status: VacuumStatus): TemplateResult {
    return html`<div class="art ${status.art}">${robotArt}</div>`;
  }

  private renderTile(): TemplateResult {
    const status = this.status();
    const hasProgress = status.active && status.progress !== undefined && status.progress !== null;
    const progress = Math.min(100, Math.max(0, Number(status.progress) || 0));
    const hints = hintStates.includes(status.key) ? (status.hint ? [status.hint] : this.hints()) : [];
    return html`
      <ha-card class=${status.active ? "active" : ""} role="button" tabindex="0" @click=${this.openPanel} @keydown=${this.onTileKey}>
        <ha-ripple></ha-ripple>
        ${this.renderArt(status)}
        <div class="text">
          ${this.config!.name === false ? nothing : html`<div class="name">${this.deviceName()}</div>`}
          <div class="title">${status.title}</div>
          <div class="subtitle">${status.subtitle}</div>
          ${hasProgress ? html`<div class="progress"><div style="width: ${progress}%"></div></div>` : nothing}
        </div>
        ${status.control
          ? html`<button class="control" aria-label=${status.control === "resume" ? this.t("resume") : this.t("pause")}
              @click=${(event: Event) => this.onControl(event, status.control!)}>
              <ha-ripple></ha-ripple>
              <ha-icon icon=${status.control === "resume" ? "mdi:play" : "mdi:pause"}></ha-icon>
            </button>`
          : hints.length
            ? html`<span class="pill" title=${hints.join(", ")}>${hints[0]}</span>`
            : nothing}
      </ha-card>
    `;
  }

  private renderPanel(): TemplateResult {
    const status = this.status();
    return html`
      <div class="columns ${this.config!.panels === false ? "plain" : ""}">
        <div class="column">${this.renderCleaning(status)}</div>
        <div class="column">${this.renderStation(status)}</div>
      </div>
    `;
  }

  private renderCleaning(status: VacuumStatus): TemplateResult {
    const config = this.config!;
    const presets = config.presets || [];
    const rooms = this.rooms();
    const mode = this.currentMode();
    const suction = this.currentSuction();
    const boost = this.currentBoost();
    const boostName = config.boost_name || "Max+";
    const boostAvailable = config.boost !== false && !!this.stateOf(this.entities.boost);
    const allSelected = rooms.length > 0 && this.selected.length === rooms.length;
    const issues = this.roomIssues();
    return html`
      <div class="panelTitle">${config.cleaning_title || this.t("cleaningTitle")}</div>
      ${presets.length
        ? html`
          <div class="label">${config.presets_title || this.t("presetsTitle")}</div>
          <div class="presets">
            ${presets.map((preset) => html`
              <button class="preset ${this.presetMatches(preset) ? "selected" : ""}" @click=${() => this.choosePreset(preset)}>
                <ha-ripple></ha-ripple>
                ${preset.icon ? html`<ha-icon icon=${preset.icon}></ha-icon>` : nothing}<span>${preset.name}</span>
              </button>`)}
          </div>`
        : nothing}
      <div class="label">${this.t("mode")}</div>
      <div class="modes">
        ${this.modes.map((item) => html`
          <button class="mode ${item.value === mode ? "selected" : ""}" @click=${() => { this.chosenMode = item.value; }}>
            <ha-ripple></ha-ripple>
            ${item.icon ? html`<ha-icon icon=${item.icon}></ha-icon>` : nothing}<span>${this.itemName(item, "modes")}</span>
          </button>`)}
      </div>
      <div class="label">${this.t("suction")}</div>
      <div class="suctions ${boostAvailable ? "" : "noBoost"}" style="--suctionCount: ${this.suctionLevels.length}">
        ${this.suctionLevels.map((level) => html`
          <button class="suction ${level.value === suction ? "selected" : ""}" @click=${() => { this.chosenSuction = level.value; }}>
            <ha-ripple></ha-ripple>
            ${this.itemName(level, "suctionLevels")}
          </button>`)}
        ${boostAvailable
          ? html`<button class="boost ${boost ? "on" : ""}" aria-pressed=${boost ? "true" : "false"} @click=${() => { this.chosenBoost = !this.currentBoost(); }}><ha-ripple></ha-ripple>${boostName}</button>`
          : nothing}
      </div>
      ${boostAvailable ? html`<div class="hint">${this.t(boost ? "boostActive" : "boostHint", { name: boostName })}</div>` : nothing}
      <div class="label">
        ${this.t("rooms")}
        <button @click=${this.toggleAllRooms}>${allSelected ? this.t("selectNone") : this.t("selectAll")}</button>
      </div>
      ${issues.length ? this.renderRoomIssues(issues) : nothing}
      <div class="rooms">
        ${rooms.map((room) => {
          const order = this.selected.indexOf(room.id);
          return html`
            <button class="room ${order >= 0 ? "selected" : ""}" aria-pressed=${order >= 0 ? "true" : "false"} @click=${() => this.toggleRoom(room.id)}>
              <ha-ripple></ha-ripple>
              <ha-icon icon=${room.icon}></ha-icon><span>${room.name}</span>${order >= 0 ? html`<span class="order">${order + 1}</span>` : nothing}
            </button>`;
        })}
      </div>
      ${this.renderStartRow(status)}
      ${this.errorText ? html`<div class="error">${this.errorText}</div>` : nothing}
    `;
  }

  private renderRoomIssues(issues: RoomIssue[]): TemplateResult {
    return html`
      <div class="roomWarning">
        <ha-icon icon="ic:twotone-warning-amber"></ha-icon>
        <div>
          <strong>${this.t("roomIssuesTitle")}</strong>
          ${issues.map((issue) => html`<span>${issue.name}: ${issue.text}${issue.newId !== undefined ? ` ${this.t("roomNewId", { id: issue.newId })}` : ""}</span>`)}
          <span>${this.t("roomIssuesHint")}</span>
        </div>
      </div>
    `;
  }

  private renderStartRow(status: VacuumStatus): TemplateResult {
    let text: string;
    let idle = false;
    if (status.control === "pause" && status.key !== "returning") text = this.t("pause");
    else if (status.control === "resume") text = this.t("resume");
    else if (this.selected.length) text = this.selected.length === 1 ? this.t("cleanOneRoom") : this.t("cleanRooms", { count: this.selected.length });
    else {
      text = this.t("chooseRooms");
      idle = true;
    }
    return html`
      <div class="startRow">
        <button class="start ${idle ? "idle" : ""}" ?disabled=${idle} @click=${() => this.onStart(status)}>${idle ? nothing : html`<ha-ripple></ha-ripple>`}${text}</button>
        <button class="toStation" aria-label=${this.t("toStation")} title=${this.t("toStation")}
          @click=${() => this.run("vacuum", "return_to_base", {}, this.config!.entity)}>
          <ha-ripple></ha-ripple>
          <ha-icon icon="mdi:home-import-outline"></ha-icon>
        </button>
      </div>
    `;
  }

  // robot state, battery, station (one line when everything is fine, otherwise what needs attention), last cleaning
  private facts(status: VacuumStatus): Array<TemplateResult | string> {
    const attributes = this.vacuumAttributes;
    const battery = attributes.battery ?? attributes.battery_level;
    const facts: Array<TemplateResult | string> = [html`<b>${status.title}</b>`];
    if (status.subtitle && status.key !== "ready") facts.push(status.subtitle);
    if (battery !== undefined) facts.push(this.t("battery", { battery }));
    const ok = this.t("station.ok");
    const stationParts: Array<[string, string]> = [
      [this.t("freshWater"), attributes.low_water ? this.t("station.empty") : this.stationValue(attributes.clean_water_tank_status)],
      [this.t("dirtyWater"), this.stationValue(attributes.dirty_water_tank_status)],
      [this.t("dustBag"), this.stationValue(attributes.dust_bag_status)],
    ];
    const known = stationParts.filter(([, value]) => value);
    const issues = known.filter(([, value]) => value !== ok);
    if (issues.length) facts.push(...issues.map(([name, value]) => html`<span class="warn">${name} ${value}</span>`));
    else if (known.length) facts.push(this.t("stationOk"));
    const last = this.formatLastCleaning();
    if (last) facts.push(this.t("lastCleaning", { time: last }));
    return facts;
  }

  private renderStation(status: VacuumStatus): TemplateResult {
    const actions = this.stationActions.filter((action) => this.stateOf(action.entity));
    return html`
      <div class="panelTitle">${this.config!.station_title || this.t("stationTitle")}</div>
      <div class="robotInfo">
        ${this.renderArt(status)}
        <div class="facts">${this.facts(status).map((fact, index) => html`${index ? html`<br>` : nothing}${fact}`)}</div>
      </div>
      ${this.wearItems().map((item) => this.renderWear(item))}
      ${actions.length
        ? html`<div class="actions">${actions.map((action) => {
          const done = this.pressedAction === action.entity;
          return html`
            <button class="action ${done ? "done" : ""}" ?disabled=${this.stateOf(action.entity)?.state === "unavailable"} @click=${() => this.onPress(action.entity)}>
              <ha-ripple></ha-ripple>
              ${action.icon ? html`<ha-icon icon=${done ? "mdi:check" : action.icon}></ha-icon>` : nothing}
              <span>${this.itemName(action, "actions")}</span>
            </button>`;
        })}</div>`
        : nothing}
    `;
  }

  private renderWear(item: WearItem): TemplateResult {
    const confirming = this.confirmReset === item.reset;
    const value = item.due && item.reset
      ? html`<button class="reset ${confirming ? "confirm" : ""}" @click=${() => this.onReset(item.reset!)}>
          <ha-ripple></ha-ripple>
          ${confirming ? this.t("confirmReset") : this.t("reset")}
        </button>`
      : html`<span class="value">${item.left} %${item.hours !== null ? ` · ${item.hours} h` : ""}</span>`;
    return html`
      <div class="wear ${item.due ? "due" : ""}">
        <div class="name">${item.name}</div>
        ${value}
        <div class="line"><div style="width: ${Math.max(2, Math.min(100, item.left))}%"></div></div>
      </div>
    `;
  }

  getCardSize(): number {
    return this.panelLayout ? 8 : 2;
  }

  getGridOptions(): Record<string, unknown> {
    return this.panelLayout ? { columns: 12, rows: "auto" } : { columns: 12, rows: "auto", min_rows: 2 };
  }

  static getStubConfig(): Record<string, unknown> {
    return { entity: "vacuum.robot" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("graphite-vacuum-editor");
  }
}

registerElement("graphite-vacuum-editor", GraphiteVacuumEditor);
registerCard("graphite-vacuum", GraphiteVacuum, {
  name: "Graphite Vacuum",
  description: "Robot vacuum (Dreame) as animated tile and as panel with quick picks, rooms and maintenance.",
});
