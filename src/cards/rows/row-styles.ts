// Shared styles of the status and switch rows: full-width row, icon left, name with a "since" line,
// value or toggle on the right. Geometry follows the former Bubble rows (icon box 42px, text at 60px).
import { css } from "lit";

export const rowStyles = css`
  :host {
    display: block;
  }
  .row {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: var(--graphite-row-height, 60px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    transition: background-color 0.3s ease;
  }
  .row.interactive {
    cursor: pointer;
  }
  .row.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  /* active (on, open, ...): soft accent tint, not for measured values */
  .row.active {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  /* 42px icon box like the rows of the Home Assistant style; at 9px (not 8px) the 20px visible glyph
     sits exactly between the edge and the text (20/20) */
  .icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin-left: 9px;
    margin-right: 9px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: var(--graphite-icon-size, 24px);
  }
  .row.active .icon {
    color: var(--graphite-accent);
  }
  .text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }
  .name {
    font-size: var(--graphite-font-name, 15px);
    font-weight: 400;
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row.active .name {
    font-weight: 500;
  }
  .since {
    font-size: var(--graphite-font-caption, 12px);
    line-height: 15px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    flex: none;
    margin-left: auto;
    padding: 0 14px 0 12px;
    font-size: var(--graphite-font-name, 15px);
    color: var(--graphite-text-secondary);
    white-space: nowrap;
  }
  .row.active .value {
    font-weight: 500;
    color: var(--graphite-accent);
  }
  /* toggle (switch row): pure display, the row itself switches */
  .toggle {
    flex: none;
    position: relative;
    width: 36px;
    height: 20px;
    margin: 0 14px 0 12px;
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
  .row.on .toggle {
    background: var(--graphite-accent);
  }
  .row.on .toggle::after {
    left: 19px;
    background: var(--graphite-accent-ink);
  }
  /* offline badge in place of the value or toggle */
  .offline {
    display: none;
    flex: none;
    align-items: center;
    gap: 4px;
    height: 20px;
    margin: 0 14px 0 auto;
    padding: 0 8px 0 6px;
    border-radius: var(--graphite-radius-pill, 999px);
    background: color-mix(in srgb, var(--graphite-danger) 14%, var(--graphite-surface-tile));
    color: var(--graphite-danger);
    font-size: 11px;
    font-weight: 500;
    line-height: 20px;
    --mdc-icon-size: 12px;
  }
  .offline ha-icon {
    display: flex;
  }
  /* unavailable: dimmed row, badge instead of value and toggle */
  .row.unavailable {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .row.unavailable :is(.text, .icon) {
    opacity: 0.4;
  }
  .row.unavailable :is(.value, .toggle) {
    display: none;
  }
  .row.unavailable .offline {
    display: flex;
  }
  /* online_entity: the icon pulses until the device is reachable, then lights up */
  .row.connecting .icon {
    animation: graphite-connecting 1.6s ease-in-out infinite;
  }
  .row.online .icon {
    color: var(--graphite-accent);
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
    .row.connecting .icon {
      animation: none;
      opacity: 0.6;
    }
  }
`;
