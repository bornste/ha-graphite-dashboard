// The colour a lamp that is on shows in rows, tiles and sliders: its own rgb_color (Home Assistant
// also reports it for white temperatures), --graphite-light-color for lamps without a colour.
// Lamps keep their colour in every theme; the accent is not used for them.
import type { HassEntity } from "./types";

export function lampColor(stateObj: HassEntity | undefined): string | undefined {
  if (!stateObj || stateObj.state !== "on" || stateObj.entity_id.split(".")[0] !== "light") return undefined;
  const rgb = stateObj.attributes?.rgb_color;
  return Array.isArray(rgb) && rgb.length === 3 ? `rgb(${rgb.join(", ")})` : "var(--graphite-light-color, #f5c48a)";
}
