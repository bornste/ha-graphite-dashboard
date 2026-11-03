// Shared text formatting: state values and relative times in the Graphite wording (German).
import type { HassEntity, HomeAssistant } from "./types";

export const unavailableStates = ["unavailable", "unknown"];

export function isUnavailable(stateObj?: HassEntity): boolean {
  return !stateObj || unavailableStates.includes(stateObj.state);
}

export function localeOf(hass?: HomeAssistant): string {
  return hass?.locale?.language || hass?.language || "de-CH";
}

// state as Home Assistant formats it (translated, with unit), raw state as fallback
export function formatState(hass: HomeAssistant | undefined, stateObj?: HassEntity): string {
  if (!stateObj) return "";
  return hass?.formatEntityState?.(stateObj) ?? stateObj.state;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// "seit 12 Min." / "seit 3 Std." / "seit 14:05" / "seit gestern 21:40" / "seit 12. Okt."
export function sinceText(changed: Date, locale: string): string {
  const minutes = Math.max(1, Math.floor((Date.now() - changed.getTime()) / 60000));
  if (minutes < 60) return `seit ${minutes} Min.`;
  if (minutes < 360) return `seit ${Math.floor(minutes / 60)} Std.`;
  const time = changed.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const today = startOfToday();
  if (changed >= today) return `seit ${time}`;
  if (changed >= new Date(today.getTime() - 86400000)) return `seit gestern ${time}`;
  return `seit ${changed.toLocaleDateString(locale, { day: "numeric", month: "short" })}`;
}

// point in time relative to now: "vor 5 Min." / "heute 07:56" / "gestern 19:52" / "29. Okt."
export function agoText(moment: Date, locale: string): string {
  const minutes = Math.max(1, Math.floor((Date.now() - moment.getTime()) / 60000));
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (minutes < 360) return `vor ${Math.floor(minutes / 60)} Std.`;
  const time = moment.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const today = startOfToday();
  if (moment >= today) return `heute ${time}`;
  if (moment >= new Date(today.getTime() - 86400000)) return `gestern ${time}`;
  return moment.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

// minutes as "12 Min." below an hour, otherwise "1:05 h"
export function durationText(minutes: number): string {
  const whole = Math.max(0, Math.round(minutes));
  if (whole < 60) return `${whole} Min.`;
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")} h`;
}
