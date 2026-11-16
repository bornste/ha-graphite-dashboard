// The hass object Home Assistant handed to a Graphite card last. The dialog layer compares it with
// the hass of the <home-assistant> element and takes the fresher one: on some kiosk browsers the
// element's hass is not kept current, while the cards of the view still get every update.
import type { HomeAssistant } from "./types";

let newestHass: HomeAssistant | undefined;

export function rememberHass(hass: HomeAssistant | undefined): void {
  if (hass) newestHass = hass;
}

export function currentHass(): HomeAssistant | undefined {
  return newestHass;
}
