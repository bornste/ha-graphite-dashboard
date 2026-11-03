// Minimal Home Assistant types used by the cards (only what the library needs).

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HassConnection {
  subscribeMessage<T>(callback: (message: T) => void, message: Record<string, unknown>): Promise<() => void>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  // entity registry entries of the frontend (display precision etc.)
  entities?: Record<string, { display_precision?: number }>;
  locale?: { language: string };
  language?: string;
  connection: HassConnection;
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  formatEntityAttributeValue?: (stateObj: HassEntity, attribute: string, value?: unknown) => string;
  callService(domain: string, service: string, data?: Record<string, unknown>, target?: Record<string, unknown>): Promise<unknown>;
}

export interface ActionConfig {
  action: "none" | "toggle" | "more-info" | "navigate" | "url" | "perform-action" | "assist" | "fire-dom-event";
  [key: string]: unknown;
}

export interface GraphiteCardConfig {
  type: string;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  [key: string]: unknown;
}

declare global {
  // injected by the build (package.json version)
  const GRAPHITE_VERSION: string;

  interface Window {
    customCards?: Array<Record<string, unknown>>;
    graphiteCards?: { version: string };
    loadCardHelpers?: () => Promise<{ createCardElement(config: Record<string, unknown>): any }>;
  }
}
