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
  "light.floor_lamp": entity("light.floor_lamp", "on", { friendly_name: "Floor lamp" }, 42),
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
};

// canned results for the info templates (the showcase has no template engine)
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
      title: "graphite-status-row",
      description: `Display row: icon, name with a "since" line and the state on the right. Active states get the accent tint,
        measured values never. <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-status-row.md">Documentation</a>`,
      examples: [
        {
          title: "Windows, lamps, values",
          note: "The floor lamp opens more-info on tap; holding any row opens more-info.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Status" : "Status",
            cards: [
              { type: "custom:graphite-status-row", entity: "binary_sensor.bedroom_window" },
              { type: "custom:graphite-status-row", entity: "binary_sensor.office_window" },
              { type: "custom:graphite-status-row", entity: "light.floor_lamp", tap_action: { action: "more-info" } },
              { type: "custom:graphite-status-row", entity: "sensor.server_power" },
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
              { type: "custom:graphite-status-row", entity: "sensor.garden_temperature" },
              { type: "custom:graphite-status-row", entity: "light.ceiling_lamp", wall_switch: true },
            ],
          },
        },
      ],
    },
    {
      title: "graphite-switch-row",
      description: `Row with a toggle: tapping the row switches, holding opens more-info.
        <a href="https://github.com/bornste/ha-graphite-dashboard/blob/main/docs/graphite-switch-row.md">Documentation</a>`,
      examples: [
        {
          title: "Switches",
          note: "The TV pulses until its online entity reports the device as reachable.",
          config: {
            type: "custom:graphite-panel",
            title: german ? "Steckdosen" : "Sockets",
            cards: [
              { type: "custom:graphite-switch-row", entity: "switch.coffee_machine" },
              { type: "custom:graphite-switch-row", entity: "switch.tv", online_entity: "binary_sensor.tv_online" },
              { type: "custom:graphite-switch-row", entity: "switch.printer" },
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
              { type: "custom:graphite-switch-row", entity: "automation.night_light", since_attribute: "last_triggered" },
              { type: "custom:graphite-switch-row", entity: "automation.vacation_mode", since_attribute: "last_triggered" },
              {
                type: "custom:graphite-switch-row",
                entity: "switch.code_server",
                detail_entities: [
                  { entity: "sensor.code_server_cpu", label: "CPU" },
                  { entity: "sensor.code_server_memory", label: "RAM" },
                ],
              },
            ],
          },
        },
      ],
    },
  ];
}
