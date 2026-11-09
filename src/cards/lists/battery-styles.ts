// Styles of graphite-battery (1:1 port of the former battery card): one panel per group, large rows
// for batteries that need attention, compact tiles for the batteries in order.
import { css } from "lit";

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
  /* one panel per group, same look as graphite-panel */
  .panel {
    background: var(--graphite-surface-panel, var(--card-background-color));
    border-radius: var(--graphite-radius-panel, 20px);
    padding: var(--graphite-padding-panel, 16px);
  }
  .panel + .panel {
    margin-top: var(--graphite-gap-panel, 16px);
  }
  /* title and info share one baseline; dot and chevron are centered on the line */
  .header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 12px;
  }
  .header i {
    flex: none;
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--labelColor);
  }
  .header .title {
    flex: none;
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--textPrimary));
  }
  /* info right after the title, separated by a thin line (same as panel card, room cards and dialog
     headers); 2px margin + 10px gap = 12px like there. The right side stays for the chevron. */
  .header .info {
    min-width: 0;
    margin-left: 2px;
    padding-left: 12px;
    position: relative;
    /* 2px more room on top for the separator line (it reads too short at cap height);
       the negative margin keeps the text on the shared baseline */
    padding-top: 2px;
    margin-top: -2px;
    font-size: 13px;
    line-height: 16px;
    color: var(--textSecondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* separator line from the title's cap height down to the shared baseline
     (13px text in a 16px line: the baseline sits 3.5px above the bottom) */
  .header .info::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 3.5px;
    width: 1px;
    background: var(--graphite-separator, color-mix(in srgb, var(--graphite-ink, #f3f3f4) 24%, var(--graphite-ground, #0a0a0b)));
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
    background: color-mix(in srgb, var(--danger) 16%, var(--tileRaised));
  }
  .row.critical {
    background: color-mix(in srgb, var(--accent) 14%, var(--tileRaised));
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
`;
