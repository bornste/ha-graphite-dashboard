// Styles of graphite-timeline: period picker (like the panel buttons), the chart on a tile surface
// with name, bar track and total per row, the time axis and the info line below.
import { css } from "lit";

export const timelineStyles = css`
  :host {
    display: block;
  }
  .picker {
    display: flex;
    gap: var(--graphite-gap-tile, 8px);
    margin-bottom: var(--graphite-gap-tile, 8px);
  }
  .picker button {
    position: relative;
    overflow: hidden;
    flex: 1 1 0;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: var(--graphite-radius-tile, 12px);
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    color: var(--graphite-text-secondary);
    font: inherit;
    font-size: var(--graphite-font-caption-size, 12px);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .picker button.active {
    background: var(--graphite-surface-tile-active);
    color: var(--graphite-text-primary);
  }
  .picker button:focus-visible {
    outline: 2px solid var(--graphite-accent);
    outline-offset: 2px;
  }
  ha-ripple {
    position: absolute;
    inset: 0;
  }
  .chart {
    padding: 12px 14px 10px;
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
  }
  /* the name column is as wide as the longest name (at most 40% of the chart) */
  .rows {
    display: grid;
    grid-template-columns: fit-content(40%) minmax(0, 1fr);
    align-items: center;
    gap: var(--graphite-gap-tile, 8px) 0;
  }
  .rows.withTotal {
    grid-template-columns: fit-content(40%) minmax(0, 1fr) auto;
  }
  .label {
    padding-right: 12px;
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track {
    position: relative;
    height: 26px;
    border-radius: calc(var(--graphite-radius-tile, 12px) / 2);
    background: color-mix(in srgb, var(--graphite-ink) 4%, transparent);
  }
  .segment {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    min-width: 2px;
    overflow: hidden;
    border-radius: calc(var(--graphite-radius-tile, 12px) / 2);
    background: var(--segment-color, var(--graphite-accent));
    cursor: pointer;
    transition: filter 0.2s ease;
  }
  .segment span {
    padding: 0 8px;
    font-size: 11px;
    color: var(--graphite-ground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* the selected bar stands out a little, the others stay as they are */
  .segment.selected {
    filter: brightness(1.15);
    box-shadow: 0 0 0 2px var(--graphite-text-primary);
    z-index: 1;
  }
  .total {
    padding-left: 12px;
    text-align: right;
    font-size: var(--graphite-font-label-size, 13px);
    color: var(--graphite-text-primary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  /* fine dotted grid lines at the axis labels, behind the bars (like the graphs) */
  .gridLines {
    grid-column: 2;
    position: relative;
    align-self: stretch;
    pointer-events: none;
  }
  .gridLines i {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 1px dotted color-mix(in srgb, var(--graphite-text-primary) 12%, transparent);
  }
  .track {
    z-index: 1;
  }
  .ticks {
    position: relative;
    height: 18px;
    margin-top: -4px;
    font-size: 11px;
    line-height: 14px;
    color: var(--graphite-text-muted);
    font-variant-numeric: tabular-nums;
  }
  /* label with a short tick above it */
  .ticks span {
    position: absolute;
    top: 4px;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  .ticks span::before {
    content: "";
    position: absolute;
    left: 50%;
    top: -4px;
    width: 1px;
    height: 3px;
    background: var(--graphite-text-muted);
  }
  .info {
    margin-top: 8px;
    min-height: 16px;
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 16px;
    color: var(--graphite-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info.selected {
    color: var(--graphite-text-secondary);
  }
  .info b {
    font-weight: 500;
    color: var(--graphite-text-primary);
  }
  .loading {
    grid-column: 1 / -1;
    height: 26px;
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 26px;
    color: var(--graphite-text-muted);
  }
`;
