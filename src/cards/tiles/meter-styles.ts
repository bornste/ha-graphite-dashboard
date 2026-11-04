// Styles of the meter tile: name on top, value (and secondary value) above a 4px instrument bar
// in the footer, optional watermark icon top right. Geometry follows the former Bubble meter tile.
import { css } from "lit";

export const meterStyles = css`
  /* name on top (overrides the name at the bottom of the switch tile) */
  .name {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    top: 10px;
    bottom: auto;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    line-height: 1.6;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* watermark icon top right */
  .meter-icon {
    position: absolute;
    right: 6px;
    top: 8px;
    display: flex;
    width: var(--graphite-watermark-size, 34px);
    height: var(--graphite-watermark-size, 34px);
    color: var(--graphite-text-primary);
    opacity: 0.16;
    pointer-events: none;
    --mdc-icon-size: var(--graphite-watermark-size, 34px);
  }
  .value-row {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 19px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
  }
  .value {
    font-size: var(--graphite-font-value-size, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    line-height: 1.1;
    white-space: nowrap;
    color: var(--graphite-text-primary);
  }
  /* unit and secondary value share the name size for a calm type scale */
  .unit {
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    margin-left: 3px;
    color: var(--graphite-text-muted);
  }
  /* a block (not flex), so a too long text ends with an ellipsis */
  .secondary {
    display: block;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    /* not taller than the value line: a taller line would lift the baseline of the whole row
       (the value then sits 1-2px higher than on tiles without a secondary value) */
    line-height: 1.2;
    white-space: nowrap;
    /* on narrow tiles the secondary value gives way (ellipsis) instead of running out of the tile */
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--graphite-text-muted);
    --mdc-icon-size: 13px;
  }
  /* icon sits on the text baseline like a glyph */
  .secondary ha-icon {
    display: inline-flex;
    width: 13px;
    height: 13px;
    margin-right: 3px;
    transform: translateY(1px);
  }
  .bar {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 9px;
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--graphite-ink) 14%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--meter-share, 0%);
    border-radius: 2px;
    background: var(--meter-color, var(--graphite-accent));
  }
  /* gradient: the whole color scale is visible, dimmed beyond the value,
     a needle marks the value (a needle, not a knob: it must not look like a slider) */
  .tile.gradient .bar {
    background: var(--meter-scale);
  }
  .tile.gradient .fill {
    left: var(--meter-share, 0%);
    right: 0;
    width: auto;
    border-radius: 0 2px 2px 0;
    background: color-mix(in srgb, var(--graphite-card-surface, var(--graphite-surface-tile)) var(--graphite-meter-dim, 65%), transparent);
  }
  .needle {
    position: absolute;
    top: -3px;
    left: var(--meter-share, 0%);
    width: 2px;
    height: 10px;
    margin-left: -1px;
    border-radius: 1px;
    background: var(--graphite-text-primary);
    box-shadow: 0 0 0 1.5px var(--graphite-card-surface, var(--graphite-surface-tile));
  }
  /* level: bar in the band color, track a muted step of it */
  .tile.level .bar {
    background: color-mix(in srgb, var(--meter-color, var(--graphite-accent)) 22%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  /* no value (unavailable, not numeric): empty bar, whole scale dimmed, no needle */
  .tile.novalue.level .fill,
  .tile.novalue .needle {
    display: none;
  }
  .tile.novalue.gradient .fill {
    left: 0;
    border-radius: 2px;
  }
  /* low (consumables): soon empty – status in accent; empty – accent tint as well */
  .tile.low .secondary,
  .tile.empty .secondary {
    color: var(--graphite-accent);
  }
  .tile.empty {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
`;

// Row layout of the meter: name and status line on the left, the value on the right, the bar along
// the bottom (like the battery rows).
export const meterRowStyles = css`
  :host {
    display: block;
  }
  .row {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 12px;
    padding: 12px 14px;
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
  .name {
    font-size: var(--graphite-font-name-size, 15px);
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status {
    grid-column: 1;
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 15px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    grid-row: 1 / span 2;
    grid-column: 2;
    font-size: var(--graphite-font-value-size, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    color: var(--graphite-text-primary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .unit {
    margin-left: 3px;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    color: var(--graphite-text-muted);
  }
  /* bar along the bottom: level fills in the band color, gradient shows the scale with a needle */
  .bar {
    position: relative;
    grid-column: 1 / -1;
    height: 4px;
    margin-top: 6px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--meter-color, var(--graphite-accent)) 22%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--meter-share, 0%);
    border-radius: 2px;
    background: var(--meter-color, var(--graphite-accent));
  }
  .row.gradient .bar {
    background: var(--meter-scale);
  }
  .row.gradient .fill {
    left: var(--meter-share, 0%);
    right: 0;
    width: auto;
    border-radius: 0 2px 2px 0;
    background: color-mix(in srgb, var(--graphite-card-surface, var(--graphite-surface-tile)) var(--graphite-meter-dim, 65%), transparent);
  }
  .needle {
    position: absolute;
    top: -3px;
    left: var(--meter-share, 0%);
    width: 2px;
    height: 10px;
    margin-left: -1px;
    border-radius: 1px;
    background: var(--graphite-text-primary);
    box-shadow: 0 0 0 1.5px var(--graphite-card-surface, var(--graphite-surface-tile));
  }
  .row.novalue.level .fill,
  .row.novalue .needle {
    display: none;
  }
  /* soon empty: value and status in accent; empty: accent tint as well */
  .row.low :is(.value, .status),
  .row.empty :is(.value, .status) {
    color: var(--graphite-accent);
  }
  .row.empty {
    background: color-mix(in srgb, var(--graphite-accent) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  /* offline: dimmed like every other offline row */
  .row.unavailable {
    background: color-mix(in srgb, var(--graphite-surface-tile) 40%, transparent);
  }
  .row.unavailable > * {
    opacity: 0.4;
  }
  .row.unavailable .value {
    font-size: var(--graphite-font-name-size, 15px);
    font-weight: 400;
  }
`;
