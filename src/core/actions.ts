// Tap / hold / double tap on an element, executed by Home Assistant like the built-in cards
// (the frontend handles the "hass-action" event: more-info, toggle, navigate, perform-action, ...).
import type { ActionConfig, GraphiteCardConfig } from "./types";

export type ActionKind = "tap" | "hold" | "double_tap";

const holdDelay = 500;
const doubleTapDelay = 250;

export function hasAction(config?: ActionConfig): boolean {
  return !!config && config.action !== "none";
}

export function fireAction(element: HTMLElement, config: GraphiteCardConfig, action: ActionKind): void {
  element.dispatchEvent(new CustomEvent("hass-action", {
    detail: { config, action },
    bubbles: true,
    composed: true,
  }));
}

// Attaches pointer handling to an element and reports the recognized gesture.
// Double tap is only waited for when the card has a double tap action (otherwise taps fire at once).
export function attachActionHandler(
  element: HTMLElement,
  options: { hasHold: () => boolean; hasDoubleTap: () => boolean },
  onAction: (action: ActionKind) => void,
): () => void {
  let holdTimer: number | undefined;
  let tapTimer: number | undefined;
  let held = false;
  let startX = 0;
  let startY = 0;

  const clearHold = () => {
    window.clearTimeout(holdTimer);
    holdTimer = undefined;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    held = false;
    startX = event.clientX;
    startY = event.clientY;
    if (options.hasHold()) {
      holdTimer = window.setTimeout(() => {
        held = true;
        onAction("hold");
      }, holdDelay);
    }
  };

  // scrolling or dragging cancels the gesture
  const onPointerMove = (event: PointerEvent) => {
    if (holdTimer && Math.hypot(event.clientX - startX, event.clientY - startY) > 10) clearHold();
  };

  const onPointerUp = () => {
    clearHold();
    if (held) return;
    if (!options.hasDoubleTap()) {
      onAction("tap");
      return;
    }
    if (tapTimer) {
      window.clearTimeout(tapTimer);
      tapTimer = undefined;
      onAction("double_tap");
      return;
    }
    tapTimer = window.setTimeout(() => {
      tapTimer = undefined;
      onAction("tap");
    }, doubleTapDelay);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onAction("tap");
    }
  };

  // no context menu while holding on touch devices
  const onContextMenu = (event: Event) => {
    if (options.hasHold()) event.preventDefault();
  };

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", clearHold);
  element.addEventListener("pointerleave", clearHold);
  element.addEventListener("keydown", onKeyDown);
  element.addEventListener("contextmenu", onContextMenu);

  return () => {
    clearHold();
    window.clearTimeout(tapTimer);
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", onPointerUp);
    element.removeEventListener("pointercancel", clearHold);
    element.removeEventListener("pointerleave", clearHold);
    element.removeEventListener("keydown", onKeyDown);
    element.removeEventListener("contextmenu", onContextMenu);
  };
}
