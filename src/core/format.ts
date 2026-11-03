// Shared text formatting: state values and relative times (texts from the translations).
import type { HassEntity, HomeAssistant } from "./types";
import { translate } from "./i18n";

export const unavailableStates = ["unavailable", "unknown"];

export function isUnavailable(stateObj?: HassEntity): boolean {
  return !stateObj || unavailableStates.includes(stateObj.state);
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

// "seit 12 Min." / "seit 3 Std." / "seit 14:05" / "seit gestern 21:40" / "seit 12. Okt." (de)
export function sinceText(changed: Date, language: string): string {
  const minutes = Math.max(1, Math.floor((Date.now() - changed.getTime()) / 60000));
  if (minutes < 60) return translate(language, "time.sinceMinutes", { minutes });
  if (minutes < 360) return translate(language, "time.sinceHours", { hours: Math.floor(minutes / 60) });
  const time = changed.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  const today = startOfToday();
  if (changed >= today) return translate(language, "time.sinceTime", { time });
  if (changed >= new Date(today.getTime() - 86400000)) return translate(language, "time.sinceYesterday", { time });
  return translate(language, "time.sinceDate", { date: changed.toLocaleDateString(language, { day: "numeric", month: "short" }) });
}

// point in time relative to now: "vor 5 Min." / "heute 07:56" / "gestern 19:52" / "29. Okt." (de)
export function agoText(moment: Date, language: string): string {
  const minutes = Math.max(1, Math.floor((Date.now() - moment.getTime()) / 60000));
  if (minutes < 60) return translate(language, "time.agoMinutes", { minutes });
  if (minutes < 360) return translate(language, "time.agoHours", { hours: Math.floor(minutes / 60) });
  const time = moment.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  const today = startOfToday();
  if (moment >= today) return translate(language, "time.today", { time });
  if (moment >= new Date(today.getTime() - 86400000)) return translate(language, "time.yesterday", { time });
  return moment.toLocaleDateString(language, { day: "numeric", month: "short" });
}

// minutes as "12 Min." below an hour, otherwise "1:05 h" (de)
export function durationText(minutes: number, language: string): string {
  const whole = Math.max(0, Math.round(minutes));
  if (whole < 60) return translate(language, "time.minutes", { minutes: whole });
  return translate(language, "time.hoursMinutes", { hours: Math.floor(whole / 60), minutes: String(whole % 60).padStart(2, "0") });
}
