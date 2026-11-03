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
  ];
}
