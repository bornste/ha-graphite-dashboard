// Styles of graphite-battery (1:1 port of the former battery card): one panel per group, large rows
// for batteries that need attention, compact tiles for the batteries in order.
import { css } from "lit";
import { tileEdgeStyles } from "../../core/edge";
import { panelHeaderStyles, panelSurfaceStyles } from "../../core/panel-styles";

export const batteryStyles = css`
  :host {
    display: block;
    --tileSurface: var(--graphite-surface-tile, #1f1f21);
    --tileRaised: var(--graphite-surface-tile-active, #2b2b2c);
    --textPrimary: var(--graphite-text-primary, var(--primary-text-color));
    --textSecondary: var(--graphite-text-secondary, var(--secondary-text-color));
    --textMuted: var(--graphite-text-muted, var(--disabled-text-color));
    --accent: var(--graphite-accent, #f5c48a);
    --danger: var(--graphite-danger, #e8908a);
    --success: var(--graphite-success, #a8d5a2);
    --radius: var(--graphite-radius-tile, 12px);
    --gap: var(--graphite-gap-tile, 8px);
  }
  ha-card {
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
  }
  /* one panel per group, surface and header like graphite-panel (core/panel-styles) */
  ${panelSurfaceStyles(".panel")}
  ${panelHeaderStyles}
  .panel + .panel {
    margin-top: var(--graphite-gap-panel, 16px);
  }
  /* the dot before the title, centered on the line; with the 10px gap it sits close to the title */
  .header {
    gap: 10px;
  }
  .header i {
    flex: none;
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--labelColor);
  }
  /* 2px + 10px gap = 12px between title and info, like the other panel headers */
  .header .info {
    margin-left: 2px;
  }
  /* "in order": the whole header toggles the compact tiles */
  button.header {
    position: relative;
    width: 100%;
    /* same gap to the tiles as the other panels when expanded */
    margin: 0 0 12px;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button.header[aria-expanded="false"] {
    margin-bottom: 0;
  }
  button.header ha-icon {
    margin-left: auto;
    align-self: center;
    --mdc-icon-size: 20px;
    color: var(--textSecondary);
    transition: transform 0.2s ease;
  }
  button.header[aria-expanded="true"] ha-icon {
    transform: rotate(180deg);
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  /* large card for batteries that need attention */
  .row {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 12px;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: var(--tileSurface);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .row.offline {
    background: color-mix(in srgb, var(--danger) var(--graphite-tint-alert, 16%), var(--tileRaised));
  }
  .row.critical {
    background: color-mix(in srgb, var(--accent) var(--graphite-tint-alert, 16%), var(--tileRaised));
  }
  .row .name {
    font-size: 15px;
    color: var(--textPrimary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row .sub {
    grid-column: 1;
    font-size: 12px;
    color: var(--textSecondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row .value {
    grid-row: 1 / span 2;
    grid-column: 2;
    font-size: 22px;
    font-weight: 300;
    color: var(--textPrimary);
    font-variant-numeric: tabular-nums;
  }
  /* unit like the graphite-meter tiles */
  .row .value small {
    margin-left: 2px;
    font-size: 13px;
    font-weight: 400;
    color: var(--textMuted);
  }
  .row.offline .value {
    font-size: 15px;
    font-weight: 500;
    color: var(--danger);
  }
  .row.critical .value {
    color: var(--accent);
  }
  .row .track {
    grid-column: 1 / -1;
    height: 4px;
    margin-top: 6px;
  }

  /* level bar, shared by large and compact tiles */
  .track {
    border-radius: 2px;
    background: color-mix(in srgb, var(--textPrimary) 8%, transparent);
  }
  .track span {
    display: block;
    height: 100%;
    width: var(--level);
    border-radius: 2px;
    background: var(--barColor);
  }

  .compact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .compact[hidden] {
    display: none;
  }
  .item {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 8px;
    padding: 8px 12px 10px;
    border-radius: var(--radius);
    background: var(--tileSurface);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .item .name {
    font-size: 13px;
    color: var(--textPrimary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item .value {
    font-size: 13px;
    color: var(--textSecondary);
    font-variant-numeric: tabular-nums;
  }
  .item .track {
    grid-column: 1 / -1;
    height: 3px;
    --barColor: color-mix(in srgb, var(--success) 70%, var(--tileSurface));
  }
  .empty {
    padding: 12px 14px;
    font-size: 14px;
    color: var(--textSecondary);
  }
  /* the ripple covers its row and takes no place in the grid */
  ha-ripple {
    position: absolute;
    inset: 0;
  }
  .row:focus-visible, .item:focus-visible, button.header:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  ${tileEdgeStyles(".row, .item")}
`;
