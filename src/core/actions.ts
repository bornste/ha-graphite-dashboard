// Tap / hold / double tap on an element, executed by Home Assistant like the built-in cards
// (the frontend handles the "hass-action" event: more-info, toggle, navigate, perform-action, ...).
import type { ActionConfig, GraphiteCardConfig } from "./types";

export type ActionKind = "tap" | "hold" | "double_tap";

const holdDelay = 500;
const doubleTapDelay = 250;

export function hasAction(config?: ActionConfig): boolean {
  return !!config && config.action !== "none";
}

// Common default for every Graphite component: holding opens the more-info dialog,
// as long as an entity is attached; without an entity holding does nothing.
export function defaultHoldAction(entity?: string): ActionConfig {
  return entity ? { action: "more-info" } : { action: "none" };
}

export function fireAction(element: HTMLElement, config: GraphiteCardConfig, action: ActionKind): void {
  element.dispatchEvent(new CustomEvent("hass-action", {
    detail: { config, action },
    bubbles: true,
    composed: true,
  }));
}

// Hold indicator like the built-in cards: a translucent circle in the Graphite accent color
// grows under the pointer once the hold time is reached; the hold action fires on release.
let holdIndicator: HTMLDivElement | undefined;

function showHoldIndicator(element: HTMLElement, x: number, y: number, isTouch: boolean): void {
  if (!holdIndicator) {
    holdIndicator = document.createElement("div");
    Object.assign(holdIndicator.style, {
      position: "fixed",
      borderRadius: "50%",
      opacity: "0.2",
      pointerEvents: "none",
      zIndex: "999",
      transform: "translate(-50%, -50%) scale(0)",
      transition: "transform 180ms ease-in-out",
    });
    document.body.appendChild(holdIndicator);
  }
  const size = isTouch ? "100px" : "50px";
  // the view theme is not set on body, so the color is read from the element itself
  const styles = getComputedStyle(element);
  const color = styles.getPropertyValue("--graphite-accent").trim()
    || styles.getPropertyValue("--primary-color").trim() || "currentColor";
  Object.assign(holdIndicator.style, { width: size, height: size, background: color, left: `${x}px`, top: `${y}px` });
  // next frame, so the transition starts from scale 0
  requestAnimationFrame(() => {
    if (holdIndicator) holdIndicator.style.transform = "translate(-50%, -50%) scale(1)";
  });
}

function hideHoldIndicator(): void {
  if (holdIndicator) holdIndicator.style.transform = "translate(-50%, -50%) scale(0)";
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
  let pressed = false;
  let pointerType = "";
  let startX = 0;
  let startY = 0;

  const clearHold = () => {
    window.clearTimeout(holdTimer);
    holdTimer = undefined;
  };

  // pointer left the element or the browser took over (scrolling): nothing fires
  const cancel = () => {
    clearHold();
    if (held) hideHoldIndicator();
    held = false;
    pressed = false;
  };

  const onPointerDown = (event: PointerEvent) => {
    pointerType = event.pointerType;
    // only the primary button starts a gesture (right click is for the context menu / inspector)
    if (event.button !== 0) return;
    pressed = true;
    held = false;
    startX = event.clientX;
    startY = event.clientY;
    if (options.hasHold()) {
      holdTimer = window.setTimeout(() => {
        held = true;
        showHoldIndicator(element, startX, startY, pointerType === "touch");
      }, holdDelay);
    }
  };

  // scrolling or dragging cancels the gesture
  const onPointerMove = (event: PointerEvent) => {
    if (holdTimer && Math.hypot(event.clientX - startX, event.clientY - startY) > 10) clearHold();
  };

  const onPointerUp = (event: PointerEvent) => {
    clearHold();
    if (event.button !== 0 || !pressed) return;
    pressed = false;
    if (held) {
      held = false;
      hideHoldIndicator();
      onAction("hold");
      return;
    }
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

  // no context menu while holding on touch devices; the mouse keeps the browser menu
  const onContextMenu = (event: Event) => {
    if (pointerType === "touch" && options.hasHold()) event.preventDefault();
  };

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", cancel);
  element.addEventListener("pointerleave", cancel);
  element.addEventListener("keydown", onKeyDown);
  element.addEventListener("contextmenu", onContextMenu);

  return () => {
    clearHold();
    window.clearTimeout(tapTimer);
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", onPointerUp);
    element.removeEventListener("pointercancel", cancel);
    element.removeEventListener("pointerleave", cancel);
    element.removeEventListener("keydown", onKeyDown);
    element.removeEventListener("contextmenu", onContextMenu);
  };
}
