// Shared styles of the Graphite tiles: tile surface, watermark icon bottom right, name bottom left,
// toggle top left, offline badge top right. Geometry follows the former Bubble switch tile
// (80px high, 12px inset (--graphite-padding-tile), name 13/18px with 9px to the bottom edge, 34px watermark 9px from the right edge, so a full glyph sits on the 12px padding line).
import { css } from "lit";
import { tileEdgeStyles } from "../../core/edge";

export const tileStyles = css`
  :host {
    display: block;
  }
  .tile {
    position: relative;
    box-sizing: border-box;
    height: var(--graphite-tile-height, 80px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    transition: background-color 0.3s ease;
  }
  .tile.interactive {
    cursor: pointer;
  }
  .tile.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  /* on: soft accent tint */
  .tile.on {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  /* icon as watermark bottom right */
  .watermark {
    position: absolute;
    right: var(--graphite-watermark-inset, 9px);
    bottom: 7px;
    display: flex;
    width: var(--graphite-watermark-size, 34px);
    height: var(--graphite-watermark-size, 34px);
    color: var(--graphite-text-primary);
    opacity: 0.16;
    pointer-events: none;
    --mdc-icon-size: var(--graphite-watermark-size, 34px);
  }
  .tile.on .watermark {
    opacity: 0.3;
  }
  .name {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 9px;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile.on .name {
    font-weight: 500;
  }
  /* toggle top left: pure display, the tile itself switches */
  .toggle {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: var(--graphite-padding-tile, 12px);
    width: 36px;
    height: 20px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: var(--graphite-surface-track);
  }
  .toggle::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--graphite-text-secondary);
    transition: left 0.2s ease, background-color 0.2s ease;
  }
  .tile.on .toggle {
    background: var(--graphite-accent);
  }
  .tile.on .toggle::after {
    left: 19px;
    background: var(--graphite-accent-ink);
  }
  /* offline badge top right, only while unavailable */
  .offline {
    display: none;
    position: absolute;
    top: 8px;
    right: 8px;
    align-items: center;
    gap: 4px;
    height: 20px;
    padding: 0 8px 0 6px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: color-mix(in srgb, var(--graphite-danger) 14%, var(--graphite-surface-tile));
    color: var(--graphite-danger);
    font-size: 11px;
    font-weight: 500;
    line-height: 20px;
  }
  .offline-dot {
    flex: none;
    display: block;
  }
  /* unavailable: surface fades into the panel, text and icon faded, only the badge keeps full strength */
  .tile.unavailable {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .tile.unavailable .name {
    opacity: 0.4;
  }
  .tile.unavailable .watermark {
    opacity: 0.08;
  }
  .tile.unavailable .toggle {
    display: none;
  }
  .tile.unavailable .offline {
    display: flex;
  }
  /* online_entity: while switched on, the watermark pulses until the device is reachable,
     then lights up in the accent color */
  .tile.online .watermark {
    color: var(--graphite-accent);
    opacity: 0.9;
  }
  .tile.connecting .watermark {
    animation: graphite-connecting 1.6s ease-in-out infinite;
  }
  @keyframes graphite-connecting {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .toggle::after {
      transition: none;
    }
    .tile.connecting .watermark {
      animation: none;
      opacity: 0.6;
    }
  }
  ${tileEdgeStyles(".tile")}
`;
