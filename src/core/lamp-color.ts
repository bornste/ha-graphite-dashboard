// The colour a lamp that is on shows in rows, tiles and sliders: its own rgb_color (Home Assistant
// also reports it for white temperatures), --graphite-light-color for lamps without a colour.
// Lamps keep their colour in every theme; the accent is not used for them.
import type { HassEntity } from "./types";

// For icons and values in the lamp's colour: mixed towards the primary text by
// --graphite-lamp-text-strength (100 % on dark themes; light themes lower it so a warm white stays
// readable on a light tile).
export function lampTextColor(color: string): string {
  return `color-mix(in srgb, ${color} var(--graphite-lamp-text-strength, 100%), var(--graphite-text-primary))`;
}

export function lampColor(stateObj: HassEntity | undefined): string | undefined {
  if (!stateObj || stateObj.state !== "on" || stateObj.entity_id.split(".")[0] !== "light") return undefined;
  const rgb = stateObj.attributes?.rgb_color;
  return Array.isArray(rgb) && rgb.length === 3 ? `rgb(${rgb.join(", ")})` : "var(--graphite-light-color, #f5c48a)";
}
