// Live Jinja templates: renders a template in Home Assistant and calls back on every change.
import type { HomeAssistant } from "./types";

export function isTemplate(value: unknown): value is string {
  return typeof value === "string" && (value.includes("{{") || value.includes("{%"));
}

export async function subscribeTemplate(
  hass: HomeAssistant,
  template: string,
  onResult: (result: string) => void,
  variables: Record<string, unknown> = {},
): Promise<() => void> {
  return hass.connection.subscribeMessage<{ result?: unknown }>(
    (message) => onResult(message.result != null ? String(message.result) : ""),
    { type: "render_template", template, variables },
  );
}
