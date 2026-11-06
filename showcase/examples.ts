// Sample data and examples of the showcase. All entities are fictional.

export interface ShowcaseExample {
  title: string;
  note?: string;
  config: Record<string, any> & { type: string };
}

export interface ShowcaseSection {
  title: string;
  description: string;
  examples: ShowcaseExample[];
}

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

function entity(entityId: string, state: string, attributes: Record<string, any> = {}, changedMinutesAgo = 12) {
  const changed = minutesAgo(changedMinutesAgo);
  return { entity_id: entityId, state, attributes, last_changed: changed, last_updated: changed };
}

export const sampleStates: Record<string, any> = {
  "sensor.living_room_temperature": entity("sensor.living_room_temperature", "21.43", { unit_of_measurement: "°C", friendly_name: "Living room", display_precision: 1 }),
  "sensor.living_room_humidity": entity("sensor.living_room_humidity", "46.2", { unit_of_measurement: "%", friendly_name: "Humidity", display_precision: 0 }),
  "sensor.living_room_co2": entity("sensor.living_room_co2", "1180", { unit_of_measurement: "ppm", friendly_name: "CO₂", display_precision: 0 }),
  "sensor.bedroom_temperature": entity("sensor.bedroom_temperature", "19.8", { unit_of_measurement: "°C", friendly_name: "Bedroom", display_precision: 1 }),
  "sensor.office_temperature": entity("sensor.office_temperature", "22.6", { unit_of_measurement: "°C", friendly_name: "Office", display_precision: 1 }),
  "sensor.kitchen_temperature": entity("sensor.kitchen_temperature", "23.1", { unit_of_measurement: "°C", friendly_name: "Kitchen", display_precision: 1 }),
  "sensor.bathroom_temperature": entity("sensor.bathroom_temperature", "24.0", { unit_of_measurement: "°C", friendly_name: "Bathroom", display_precision: 1 }),
  "sensor.hallway_temperature": entity("sensor.hallway_temperature", "20.4", { unit_of_measurement: "°C", friendly_name: "Hallway", display_precision: 1 }),
  "binary_sensor.console_in_game": entity("binary_sensor.console_in_game", "on", { friendly_name: "In game" }),
  "sensor.power_strip_power": entity("sensor.power_strip_power", "38.5", { unit_of_measurement: "W", friendly_name: "Power", display_precision: 0 }),
  "binary_sensor.bedroom_window": entity("binary_sensor.bedroom_window", "on", { friendly_name: "Bedroom window", device_class: "window" }, 18),
  "binary_sensor.office_window": entity("binary_sensor.office_window", "off", { friendly_name: "Office window", device_class: "window" }, 190),
  "light.floor_lamp": entity("light.floor_lamp", "on", { friendly_name: "Floor lamp", brightness: 158, color_mode: "color_temp",
    supported_color_modes: ["color_temp", "hs"], color_temp_kelvin: 3200, min_color_temp_kelvin: 2000, max_color_temp_kelvin: 6500,
    hs_color: [32, 45] }, 42),
  "scene.living_room_default": entity("scene.living_room_default", "2026-11-06T18:00:00", { friendly_name: "Default", icon: "mdi:lamps-outline" }, 120),
  "scene.living_room_bright": entity("scene.living_room_bright", "2026-11-06T18:00:00", { friendly_name: "Bright", icon: "mdi:white-balance-sunny" }, 120),
  "scene.living_room_relax": entity("scene.living_room_relax", "2026-11-06T18:00:00", { friendly_name: "Relax", icon: "mdi:sofa-outline" }, 120),
  "scene.living_room_tv": entity("scene.living_room_tv", "2026-11-06T18:00:00", { friendly_name: "TV", icon: "mdi:television" }, 120),
  "scene.living_room_off": entity("scene.living_room_off", "2026-11-06T18:00:00", { friendly_name: "Lights off", icon: "mdi:power" }, 120),
  "input_select.living_room_scenes": entity("input_select.living_room_scenes", "Relax", { friendly_name: "Living room scene" }, 30),
  "sensor.living_room_lights_on": entity("sensor.living_room_lights_on", "2", { friendly_name: "Lights on" }, 30),
  "media_player.game_console": entity("media_player.game_console", "playing", { friendly_name: "Game console", media_title: "Star Voyager", media_content_type: "game" }, 75),
  "input_number.play_time_weekend": entity("input_number.play_time_weekend", "120", { friendly_name: "Play time weekend",
    min: 0, max: 240, step: 15, unit_of_measurement: "min", icon: "mdi:timer-outline" }, 600),
  "input_number.play_time_weekday": entity("input_number.play_time_weekday", "60", { friendly_name: "Play time weekday",
    min: 0, max: 240, step: 15, unit_of_measurement: "min", icon: "mdi:timer-outline" }, 600),
  "number.lamp_effect_speed": entity("number.lamp_effect_speed", "0.74", { friendly_name: "Effect speed", min: 0, max: 1, step: 0.02 }, 90),
  "light.ceiling_lamp": entity("light.ceiling_lamp", "unavailable", { friendly_name: "Ceiling lamp" }, 300),
  "sensor.server_power": entity("sensor.server_power", "24.6", { unit_of_measurement: "W", friendly_name: "Server", display_precision: 0 }),
  "sensor.garden_temperature": entity("sensor.garden_temperature", "unavailable", { unit_of_measurement: "°C", friendly_name: "Garden" }, 95),
  "switch.coffee_machine": entity("switch.coffee_machine", "on", { friendly_name: "Coffee machine" }, 7),
  "switch.tv": entity("switch.tv", "on", { friendly_name: "TV" }, 1),
  "binary_sensor.tv_online": entity("binary_sensor.tv_online", "off", { friendly_name: "TV online" }),
  "automation.night_light": entity("automation.night_light", "on", { friendly_name: "Night light", last_triggered: minutesAgo(185) }, 4000),
  "automation.vacation_mode": entity("automation.vacation_mode", "off", { friendly_name: "Vacation mode", last_triggered: null }, 9000),
  "switch.code_server": entity("switch.code_server", "on", { friendly_name: "Code server" }, 600),
  "sensor.code_server_cpu": entity("sensor.code_server_cpu", "0.4", { unit_of_measurement: "%", display_precision: 1 }),
  "sensor.code_server_memory": entity("sensor.code_server_memory", "1.2", { unit_of_measurement: "%", display_precision: 1 }),
  "switch.printer": entity("switch.printer", "unavailable", { friendly_name: "Printer" }, 50),
  "switch.game_console": entity("switch.game_console", "on", { friendly_name: "Game console" }, 25),
  "binary_sensor.game_console_online": entity("binary_sensor.game_console_online", "on", { friendly_name: "Game console online" }),
  "switch.speaker": entity("switch.speaker", "off", { friendly_name: "Speaker" }, 240),
  "sensor.server_cpu": entity("sensor.server_cpu", "34", { unit_of_measurement: "%", friendly_name: "CPU", icon: "mdi:speedometer" }),
  "sensor.server_memory": entity("sensor.server_memory", "58", { unit_of_measurement: "%", friendly_name: "Memory", icon: "mdi:memory" }),
  "sensor.server_disk": entity("sensor.server_disk", "86", { unit_of_measurement: "%", friendly_name: "Disk", icon: "mdi:harddisk" }),
  "script.start_racing_game": entity("script.start_racing_game", "on", { friendly_name: "Racing game" }, 1),
  "script.start_puzzle_game": entity("script.start_puzzle_game", "off", { friendly_name: "Puzzle game" }, 300),
  "script.start_streaming": entity("script.start_streaming", "off", { friendly_name: "Streaming" }, 900),
  "sensor.player_one_playing_time": entity("sensor.player_one_playing_time", "11700", { friendly_name: "Player one", status: "running", accumulated_seconds: 11400, running_since: minutesAgo(5), icon: "mdi:controller" }, 5),
  "sensor.player_two_playing_time": entity("sensor.player_two_playing_time", "6480", { friendly_name: "Player two", status: "running", accumulated_seconds: 6000, running_since: minutesAgo(8), icon: "mdi:controller" }, 8),
  "sensor.tv_watching_time": entity("sensor.tv_watching_time", "4980", { friendly_name: "TV", status: "paused", accumulated_seconds: 4980, icon: "mdi:television" }, 30),
  "image.player_two_picture": entity("image.player_two_picture", "2026-11-01", { friendly_name: "Player two", entity_picture: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'><rect width='36' height='36' fill='%237aa5d6'/><circle cx='18' cy='14' r='7' fill='%23ffffff' opacity='0.85'/><rect x='7' y='24' width='22' height='14' rx='7' fill='%23ffffff' opacity='0.85'/></svg>" }),
  "todo.shopping": entity("todo.shopping", "3", { friendly_name: "Shopping" }, 40),
  "todo.chores": entity("todo.chores", "0", { friendly_name: "Chores" }, 600),
  "sensor.office_printer": entity("sensor.office_printer", "idle", { friendly_name: "Printer" }, 120),
  "sensor.office_printer_black": entity("sensor.office_printer_black", "64", { friendly_name: "Black", unit_of_measurement: "%" }),
  "sensor.office_printer_cyan": entity("sensor.office_printer_cyan", "41", { friendly_name: "Cyan", unit_of_measurement: "%" }),
  "sensor.office_printer_magenta": entity("sensor.office_printer_magenta", "12", { friendly_name: "Magenta", unit_of_measurement: "%" }),
  "sensor.office_printer_yellow": entity("sensor.office_printer_yellow", "78", { friendly_name: "Yellow", unit_of_measurement: "%" }),
  "sensor.photo_printer": entity("sensor.photo_printer", "idle", { friendly_name: "Photo printer" }, 120),
  "sensor.photo_printer_black": entity("sensor.photo_printer_black", "55", { friendly_name: "Black", unit_of_measurement: "%" }),
  "sensor.photo_printer_gray": entity("sensor.photo_printer_gray", "0", { friendly_name: "Gray", unit_of_measurement: "%" }),
  "sensor.photo_printer_cyan": entity("sensor.photo_printer_cyan", "70", { friendly_name: "Cyan", unit_of_measurement: "%" }),
  "sensor.photo_printer_magenta": entity("sensor.photo_printer_magenta", "66", { friendly_name: "Magenta", unit_of_measurement: "%" }),
  "sensor.photo_printer_yellow": entity("sensor.photo_printer_yellow", "90", { friendly_name: "Yellow", unit_of_measurement: "%" }),
  "calendar.paper_collection": entity("calendar.paper_collection", "off", { friendly_name: "Paper", message: "Paper" }),
  "calendar.cardboard_collection": entity("calendar.cardboard_collection", "off", { friendly_name: "Cardboard", message: "Cardboard" }),
  "calendar.school_homework": entity("calendar.school_homework", "off", { friendly_name: "Homework" }),
  "calendar.school_exams": entity("calendar.school_exams", "off", { friendly_name: "Exams" }),
  "calendar.school_events": entity("calendar.school_events", "off", { friendly_name: "Events" }),
  "sensor.office_humidity": entity("sensor.office_humidity", "41", { unit_of_measurement: "%", friendly_name: "Humidity" }),
};

// canned results for the info templates (the showcase has no template engine)
// events of the sample school calendars: day offset from today, times "HH:MM" (none = all day), days for multi-day events
export interface SampleEvent {
  offset: number;
  summary: string;
  start?: string;
  end?: string;
  days?: number;
  location?: string;
  description?: string;
}

export const calendarEvents: Record<string, SampleEvent[]> = {
  "calendar.school_homework": [
    { offset: 0, summary: "Math: worksheet p. 42–43", description: "Exercises 1 to 6, show the steps." },
    { offset: 1, summary: "Reading log chapter 5" },
    { offset: 6, summary: "Vocabulary unit 3, part 2" },
  ],
  "calendar.school_exams": [
    { offset: 1, summary: "Exam science: water cycle", start: "09:55", end: "10:40", location: "Room 12" },
    { offset: 5, summary: "Exam French: vocabulary unit 3", start: "10:50", end: "11:35" },
    { offset: 13, summary: "Exam math: fractions", start: "08:15", end: "09:00" },
  ],
  "calendar.school_events": [
    { offset: 0, summary: "Parent meeting", start: "00:30", end: "01:00", location: "School building" },
    { offset: 2, summary: "School trip", start: "08:00", end: "15:30", location: "Snack and rain jacket" },
    { offset: 5, summary: "Project week", days: 5 },
    { offset: 8, summary: "Sports day", start: "08:00", end: "12:00" },
  ],
};

// collection days of the sample calendars, relative to today (calendar API of the pickup tile)
export const calendarDays: Record<string, number[]> = {
  "calendar.paper_collection": [1, 29],
  "calendar.cardboard_collection": [8, 36],
};

// canned results for todo/item/list (preview of the todo tile)
export const todoItems: Record<string, Array<{ summary: string; status: string }>> = {
  "todo.shopping": [
    { summary: "Milk", status: "needs_action" },
    { summary: "Bread", status: "needs_action" },
    { summary: "Apples", status: "needs_action" },
    { summary: "Coffee", status: "completed" },
  ],
};

export const templateResults: Record<string, string> = {
  "{{ states('sensor.console_game') }}": "playing Starfield",
};

const roomTiles = [
  { type: "tile", entity: "sensor.living_room_temperature" },
  { type: "tile", entity: "sensor.bedroom_temperature" },
  { type: "tile", entity: "sensor.office_temperature" },
  { type: "tile", entity: "sensor.kitchen_temperature" },
  { type: "tile", entity: "sensor.bathroom_temperature" },
  { type: "tile", entity: "sensor.hallway_temperature" },
];

export function examples(language: string): ShowcaseSection[] {
  const german = language === "de";
  return [
    {
      title: "graphite-panel",
      description: `Groups cards in one panel with title, status, chips and a vertical, horizontal or grid layout.
        Child cards get the tile surface. Built-in cards are shown as placeholder tiles here.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-panel.md">Documentation</a>`,
      examples: [
        {
          title: "Header with status and chips",
          note: "CO₂ above 1000 ppm turns its chip into the accent color. Tap a chip to see the action.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Wohnen" : "Living room",
            info: german ? "2 Lichter an" : "2 lights on",
            chips: [
              { entity: "sensor.living_room_humidity", muted: true, decimals: 0 },
              { entity: "sensor.living_room_co2", label: "CO₂", alert: { above: 1000 } },
            ],
            layout: "horizontal",
            cards: roomTiles.slice(0, 2),
          },
        },
        {
          title: "Status from a template, highlighted",
          note: "info_alert shows the status in the accent color while the condition is met.",
          config: {
            type: "custom:graphite-panel",
            title: "Console",
            info: "{{ states('sensor.console_game') }}",
            info_alert: { entity: "binary_sensor.console_in_game", state: "on" },
            cards: [{ type: "tile", entity: "sensor.power_strip_power" }],
          },
        },
        {
          title: "Grid with three columns",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Raumklima" : "Climate",
            layout: "grid",
            columns: 3,
            cards: roomTiles,
          },
        },
        {
          title: "Responsive grid",
          note: "min_column_width: as many columns as fit, one column on narrow screens.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Räume" : "Rooms",
            layout: "grid",
            min_column_width: "160px",
            cards: roomTiles.slice(0, 4),
          },
        },
        {
          title: "Frameless layout container",
          note: "frame: false – no surface and padding, the children keep the tile look of the parent.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Haushalt" : "Household",
            cards: [
              { type: "tile", entity: "sensor.power_strip_power" },
              {
                type: "custom:graphite-panel",
                frame: false,
                layout: "grid",
                columns: 2,
                cards: roomTiles.slice(0, 2),
              },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-status",
      description: `Display row: icon, name with a "since" line and the state on the right. Active states get the accent tint,
        measured values never. <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-status.md">Documentation</a>`,
      examples: [
        {
          title: "Windows, lamps, values",
          note: "The floor lamp opens more-info on tap; holding any row opens more-info.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Status" : "Status",
            cards: [
              { type: "custom:graphite-status", entity: "binary_sensor.bedroom_window" },
              { type: "custom:graphite-status", entity: "binary_sensor.office_window" },
              { type: "custom:graphite-status", entity: "light.floor_lamp", tap_action: { action: "more-info" } },
              { type: "custom:graphite-status", entity: "sensor.server_power" },
            ],
          },
        },
        {
          title: "Unavailable and wall switch",
          note: "wall_switch: an unavailable lamp counts as off (no offline badge).",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Nicht erreichbar" : "Unavailable",
            cards: [
              { type: "custom:graphite-status", entity: "sensor.garden_temperature" },
              { type: "custom:graphite-status", entity: "light.ceiling_lamp", wall_switch: true },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-switch",
      description: `Switch as a row or, with layout: tile, as a tile with the icon as watermark: tapping switches, holding opens more-info.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-switch.md">Documentation</a>`,
      examples: [
        {
          title: "Switches",
          note: "The TV pulses until its online entity reports the device as reachable.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Steckdosen" : "Sockets",
            cards: [
              { type: "custom:graphite-switch", entity: "switch.coffee_machine" },
              { type: "custom:graphite-switch", entity: "switch.tv", online_entity: "binary_sensor.tv_online" },
              { type: "custom:graphite-switch", entity: "switch.printer" },
            ],
          },
        },
        {
          title: "Automations and apps",
          note: "since_attribute shows the last run; detail_entities show values while on.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Automationen" : "Automations",
            cards: [
              { type: "custom:graphite-switch", entity: "automation.night_light", since_attribute: "last_triggered" },
              { type: "custom:graphite-switch", entity: "automation.vacation_mode", since_attribute: "last_triggered" },
              {
                type: "custom:graphite-switch",
                entity: "switch.code_server",
                detail_entities: [
                  { entity: "sensor.code_server_cpu", label: "CPU" },
                  { entity: "sensor.code_server_memory", label: "RAM" },
                ],
              },
            ],
          },
        },
        {
          title: "Tiles (layout: tile)",
          note: "Console online (accent icon), TV connecting (pulsing icon), speaker off, printer offline.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Steckdosen" : "Sockets",
            layout: "horizontal",
            cards: [
              { type: "custom:graphite-switch", layout: "tile", entity: "switch.game_console", icon: "mdi:controller", online_entity: "binary_sensor.game_console_online" },
              { type: "custom:graphite-switch", layout: "tile", entity: "switch.tv", icon: "mdi:television", online_entity: "binary_sensor.tv_online" },
              { type: "custom:graphite-switch", layout: "tile", entity: "switch.speaker", icon: "mdi:speaker" },
              { type: "custom:graphite-switch", layout: "tile", entity: "switch.printer", icon: "mdi:printer" },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-meter",
      description: `Measured value above a thin instrument bar: a color scale with a needle (gradient) or a fill bar (level); as a tile or, with layout: row, as a row with a status line (ink cartridges, batteries).
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-meter.md">Documentation</a>`,
      examples: [
        {
          title: "Room climate (gradient)",
          note: "Temperature on a comfort scale, humidity as second value; the garden sensor has no value.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Raumklima" : "Climate",
            layout: "horizontal",
            cards: [
              { type: "custom:graphite-meter", entity: "sensor.living_room_temperature", name: german ? "Wohnen" : "Living", style: "gradient", min: 16, max: 32, unit: "°C", colors: { 16: "#4f8fd6", 24: "#6fbf5a", 28: "#f0a33c", 32: "#e4644b" }, secondary_entity: "sensor.living_room_humidity" },
              { type: "custom:graphite-meter", entity: "sensor.office_temperature", name: german ? "Büro" : "Office", style: "gradient", min: 16, max: 32, unit: "°C", colors: { 16: "#4f8fd6", 24: "#6fbf5a", 28: "#f0a33c", 32: "#e4644b" }, secondary_entity: "sensor.office_humidity" },
              { type: "custom:graphite-meter", entity: "sensor.garden_temperature", name: german ? "Garten" : "Garden", style: "gradient", min: 16, max: 32, unit: "°C", colors: { 16: "#4f8fd6", 24: "#6fbf5a", 28: "#f0a33c", 32: "#e4644b" } },
            ],
          },
        },
        {
          title: "Server (gradient and level)",
          note: "CPU as scale, memory and disk as fill bars in the color of their band; icons as watermark.",
          config: {
            type: "custom:graphite-panel",
            title: "Server",
            layout: "horizontal",
            cards: [
              { type: "custom:graphite-meter", entity: "sensor.server_cpu", style: "gradient", decimals: 0, show_icon: true, colors: { 40: "#6fbf5a", 60: "#f0a33c", 80: "#e4644b" } },
              { type: "custom:graphite-meter", entity: "sensor.server_memory", style: "level", decimals: 0, show_icon: true, colors: { 0: "#6fbf5a", 50: "#f0a33c", 80: "#e4644b" } },
              { type: "custom:graphite-meter", entity: "sensor.server_disk", style: "level", decimals: 0, show_icon: true, colors: { 0: "#6fbf5a", 50: "#f0a33c", 80: "#e4644b" } },
            ],
          },
        },
        {
          title: "Ink cartridges (layout: row)",
          note: "Magenta is soon empty, gray is empty.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Patronen" : "Cartridges",
            cards: [
              { type: "custom:graphite-meter", layout: "row", decimals: 0, low: 20, entity: "sensor.office_printer_black", name: "Black", color: "#e4e4e6" },
              { type: "custom:graphite-meter", layout: "row", decimals: 0, low: 20, entity: "sensor.office_printer_cyan", name: "Cyan", color: "#2fb4e6" },
              { type: "custom:graphite-meter", layout: "row", decimals: 0, low: 20, entity: "sensor.office_printer_magenta", name: "Magenta", color: "#e0479e" },
              { type: "custom:graphite-meter", layout: "row", decimals: 0, low: 20, entity: "sensor.office_printer_yellow", name: "Yellow", color: "#f0c94a" },
              { type: "custom:graphite-meter", layout: "row", decimals: 0, low: 20, entity: "sensor.photo_printer_gray", name: "Gray", color: "#8e9399" },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-effect",
      description: `Light effect as a tile with its color gradient and the colors as dots; long names wrap.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-effect.md">Documentation</a>`,
      examples: [
        {
          title: "Effects of a lamp",
          note: "Tapping starts the effect (shown as a toast here), holding opens the lamp.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Effekte" : "Effects",
            info: german ? "Stehlampe" : "Floor lamp",
            layout: "grid",
            columns: 3,
            cards: [
              { type: "custom:graphite-effect", name: "Sunset", colors: ["#fffb5c", "#ffd958", "#ffa658", "#ff9150", "#ff7a3d"], entity: "light.floor_lamp", tap_action: { action: "perform-action", perform_action: "light.turn_on", target: { entity_id: "light.floor_lamp" }, data: { effect: "sunset" } } },
              { type: "custom:graphite-effect", name: "Aurora", colors: ["#29ff84", "#55ffc1", "#26eaff", "#0c3aff", "#0a12ff"], entity: "light.floor_lamp", tap_action: { action: "perform-action", perform_action: "light.turn_on", target: { entity_id: "light.floor_lamp" }, data: { effect: "aurora" } } },
              { type: "custom:graphite-effect", name: "Vapor Wave", colors: ["#ff72fb", "#784dff", "#2536ff", "#1135ff", "#0d31ff"], entity: "light.floor_lamp", tap_action: { action: "perform-action", perform_action: "light.turn_on", target: { entity_id: "light.floor_lamp" }, data: { effect: "vapor_wave" } } },
              { type: "custom:graphite-effect", name: "Tropical Twilight", colors: ["#ffa36f", "#ff836d", "#ff99a1", "#6587ff", "#475bff"], entity: "light.floor_lamp", tap_action: { action: "perform-action", perform_action: "light.turn_on", target: { entity_id: "light.floor_lamp" }, data: { effect: "tropical_twilight" } } },
              { type: "custom:graphite-effect", name: "Under The Tree", colors: ["#15ff63", "#02ff1a", "#ff880e", "#ff4d28", "#ff0605"], entity: "light.floor_lamp", tap_action: { action: "perform-action", perform_action: "light.turn_on", target: { entity_id: "light.floor_lamp" }, data: { effect: "under_the_tree" } } },
              { type: "custom:graphite-effect", name: "Winter Beauty", colors: ["#1dccff", "#29ff66", "#90ff43", "#ffd739", "#ff6410"], entity: "light.floor_lamp", tap_action: { action: "perform-action", perform_action: "light.turn_on", target: { entity_id: "light.floor_lamp" }, data: { effect: "winter_beauty" } } },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-image",
      description: `Action tile with a picture (blurred backdrop and thumbnail) or a label; a spinner while the script runs.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-image.md">Documentation</a>`,
      examples: [
        {
          title: "Games and apps",
          note: "The racing game is starting (busy), the streaming tile has no picture and shows its label.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Spiele" : "Games",
            layout: "horizontal",
            cards: [
              { type: "custom:graphite-image", entity: "script.start_racing_game", image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23e4644b'/><stop offset='1' stop-color='%233a1a4f'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='68' cy='38' r='18' fill='%23ffffff' opacity='0.55'/></svg>", busy: true, tap_action: { action: "toggle" } },
              { type: "custom:graphite-image", entity: "script.start_puzzle_game", image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%236fbf5a'/><stop offset='1' stop-color='%231b3f6b'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='68' cy='38' r='18' fill='%23ffffff' opacity='0.55'/></svg>", busy: true, tap_action: { action: "toggle" } },
              { type: "custom:graphite-image", entity: "script.start_streaming", busy: true, tap_action: { action: "toggle" } },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-stopwatch",
      description: `Elapsed time of a Stopwatch Plus sensor, optional daily limit; picture or icon on the left.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-stopwatch.md">Documentation</a>`,
      examples: [
        {
          title: "Playing and watching time",
          note: "Player one runs without a limit, player two is close to the limit (picture on the left), TV is paused (icon on the left).",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Spielzeit" : "Playing time",
            layout: "grid",
            columns: 3,
            cards: [
              { type: "custom:graphite-stopwatch", entity: "sensor.player_one_playing_time", icon: "mdi:controller" },
              { type: "custom:graphite-stopwatch", entity: "sensor.player_two_playing_time", icon: "mdi:controller", picture_entity: "image.player_two_picture", limit: { weekday: 115, weekend: 115 } },
              { type: "custom:graphite-stopwatch", entity: "sensor.tv_watching_time", icon: "mdi:television", icon_position: "left" },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-todo",
      description: `Open items of a todo list, optionally with the first item names; an empty list shows a word as value.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-todo.md">Documentation</a>`,
      examples: [
        {
          title: "Lists",
          note: "Shopping with a preview of the open items, chores empty.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Listen" : "Lists",
            layout: "grid",
            columns: 2,
            cards: [
              { type: "custom:graphite-todo", entity: "todo.shopping", icon: "mdi:cart-outline", preview: true },
              { type: "custom:graphite-todo", entity: "todo.chores", icon: "mdi:broom", empty_text: german ? "alles erledigt" : "all done", unit: german ? "Aufgaben" : "tasks", unit_one: german ? "Aufgabe" : "task" },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-ink",
      description: `Printer with one tank per cartridge; soon empty and empty cartridges are highlighted.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-ink.md">Documentation</a>`,
      examples: [
        {
          title: "Printers",
          note: "Office printer with magenta soon empty, photo printer with an empty gray cartridge. Hover a tank for its level.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Drucker" : "Printers",
            layout: "grid",
            columns: 2,
            cards: [
              { type: "custom:graphite-ink", entity: "sensor.office_printer", cartridges: ["sensor.office_printer_black", "sensor.office_printer_cyan", "sensor.office_printer_magenta", "sensor.office_printer_yellow"] },
              { type: "custom:graphite-ink", entity: "sensor.photo_printer", cartridges: ["sensor.photo_printer_black", "sensor.photo_printer_gray", "sensor.photo_printer_cyan", "sensor.photo_printer_magenta", "sensor.photo_printer_yellow"] },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-pickup",
      description: `Next waste collection of a calendar; today and tomorrow are highlighted.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-pickup.md">Documentation</a>`,
      examples: [
        {
          title: "Collections",
          note: "Paper is collected tomorrow, cardboard in a week.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Abfuhr" : "Collection",
            layout: "grid",
            columns: 2,
            cards: [
              { type: "custom:graphite-pickup", entity: "calendar.paper_collection", icon: "mdi:newspaper-variant-outline", color: "#9aa3ad" },
              { type: "custom:graphite-pickup", entity: "calendar.cardboard_collection", icon: "mdi:package-variant-closed", color: "#b98a5e" },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-calendar",
      description: `Events of one or more calendars, grouped by day: color and icon per calendar or keyword rule, exams highlighted.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-calendar.md">Documentation</a>`,
      examples: [
        {
          title: "School calendar",
          note: "This and next week, at most 10 events; today's past events stay visible. Tap an event for its details.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Schule" : "School",
            cards: [
              {
                type: "custom:graphite-calendar",
                calendars: [
                  { entity: "calendar.school_homework", name: german ? "Hausaufgaben" : "Homework", color: "#8ab8f5", icon: "mdi:pencil-outline" },
                  { entity: "calendar.school_exams", name: german ? "Prüfungen" : "Exams", color: "#e8908a", icon: "mdi:alert-outline", highlight: true },
                  { entity: "calendar.school_events", name: german ? "Termine" : "Events", color: "#a8d5a2", icon: "mdi:calendar-blank-outline" },
                ],
                range: "this_and_next_week",
                max_items: 10,
                show_past_today: true,
              },
            ],
          },
        },
        {
          title: "Exams (keyword rule, compact)",
          note: "The next 14 days without second line; the rule colors every title starting with «Exam».",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Prüfungen" : "Exams",
            cards: [
              {
                type: "custom:graphite-calendar",
                calendars: ["calendar.school_exams"],
                range: "days",
                days: 14,
                secondary: "none",
                highlight_days: 2,
                rules: [{ starts_with: "Exam", color: "#e8908a", icon: "mdi:alert-outline", highlight: true }],
              },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-slider",
      description: `One slider: number, input_number, or brightness, white temperature, color and saturation of a light. Snaps to the steps, ticks below the track.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-slider.md">Documentation</a>`,
      examples: [
        {
          title: "Rows (layout: row)",
          note: "Play time in 15-minute steps with a long tick per hour; a card of its own like the status rows.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Spielzeit" : "Play time",
            cards: [
              { type: "custom:graphite-slider", layout: "row", entity: "input_number.play_time_weekday", name: german ? "Werktags" : "Weekdays", value_format: "state" },
              { type: "custom:graphite-slider", layout: "row", entity: "input_number.play_time_weekend", name: german ? "Wochenende" : "Weekend", value_format: "state" },
            ],
          },
        },
        {
          title: "Light and effect speed (inline)",
          note: "Without a surface: brightness (off at 0), white temperature, color and saturation; the effect speed shows quarters.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Stehlampe" : "Floor lamp",
            cards: [
              { type: "custom:graphite-slider", entity: "light.floor_lamp", allow_off: true, step: 5 },
              { type: "custom:graphite-slider", entity: "light.floor_lamp", attribute: "color_temp" },
              { type: "custom:graphite-slider", entity: "light.floor_lamp", attribute: "hue" },
              { type: "custom:graphite-slider", entity: "light.floor_lamp", attribute: "saturation" },
              { type: "custom:graphite-slider", entity: "number.lamp_effect_speed", name: german ? "Geschwindigkeit" : "Speed" },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-light",
      description: `Lamp as a tile: switch row head with brightness and white temperature sliders; a wall switch lamp shows a quiet icon instead of the toggle.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-light.md">Documentation</a>`,
      examples: [
        {
          title: "Lamps",
          note: "Floor lamp on with brightness and white temperature; the ceiling lamp is off at the wall switch, its sliders stay locked.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Lampen" : "Lamps",
            cards: [
              { type: "custom:graphite-light", entity: "light.floor_lamp" },
              { type: "custom:graphite-light", entity: "light.ceiling_lamp", wall_switch: true },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-scene",
      description: `Scene as a tile; several of them with header buttons in a graphite-panel make a room.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-scene.md">Documentation</a>`,
      examples: [
        {
          title: "Room (panel with buttons and scenes)",
          note: "Relax is active (filled), two lights are on: status and the lights-off button are highlighted.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Wohnen" : "Living room",
            info: german ? "2 Lichter an" : "2 lights on",
            info_alert: { entity: "sensor.living_room_lights_on", above: 0 },
            buttons: [
              { entity: "scene.living_room_off", name: german ? "Licht aus" : "Lights off", active: { entity: "sensor.living_room_lights_on", above: 0 } },
              { icon: "mdi:tune-variant", name: german ? "Einstellungen" : "Settings", tap_action: { action: "none" } },
            ],
            layout: "grid",
            columns: 4,
            cards: [
              { type: "custom:graphite-scene", entity: "scene.living_room_default", name: "Standard", colors: ["#f5c48a", "#e89a5c", "#c9733f"], active: { entity: "input_select.living_room_scenes", state: "Standard" } },
              { type: "custom:graphite-scene", entity: "scene.living_room_bright", name: german ? "Hell" : "Bright", colors: ["#f4a93c", "#ffd166", "#ffe9a8"], active: { entity: "input_select.living_room_scenes", state: "Hell" } },
              { type: "custom:graphite-scene", entity: "scene.living_room_relax", name: "Relax", colors: ["#ff9a3c", "#ff6f61", "#b8478a"], active: { entity: "input_select.living_room_scenes", state: "Relax" } },
              { type: "custom:graphite-scene", entity: "scene.living_room_tv", name: "TV", colors: ["#1e3cff", "#4b6bff", "#9a7bff"], active: { entity: "input_select.living_room_scenes", state: "TV" } },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-now-playing",
      description: `What runs on the most important media device; the order of the sources sets the priority.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-now-playing.md">Documentation</a>`,
      examples: [
        {
          title: "Console with a game",
          note: "Title from the console, monogram without a cover, running time from the history.",
          config: {
            type: "custom:graphite-panel",
            title: "Multimedia",
            cards: [
              { type: "custom:graphite-now-playing", sources: [
                { entity: "media_player.game_console", name: "Console", icon: "mdi:controller" },
                { entity: "media_player.game_console", name: "Console", icon: "mdi:controller", states: ["idle"], fallback_title: "Console", fallback_subtitle: "Startseite" },
              ] },
            ],
          },
        },
      ],
    },
  ];
}
