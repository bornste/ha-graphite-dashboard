// Styles of the meter tile: name on top, value (and secondary value) above a 4px instrument bar
// in the footer, optional watermark icon top right. Geometry follows the former Bubble meter tile.
import { css } from "lit";

export const meterStyles = css`
  /* name on top (overrides the name at the bottom of the switch tile) */
  .name {
    position: absolute;
    left: 12px;
    right: 12px;
    top: 10px;
    bottom: auto;
    font-size: var(--graphite-font-label, 13px);
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
    left: 12px;
    right: 12px;
    bottom: 19px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
  }
  .value {
    font-size: var(--graphite-font-value, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    line-height: 1.1;
    white-space: nowrap;
    color: var(--graphite-text-primary);
  }
  /* unit and secondary value share the name size for a calm type scale */
  .unit {
    font-size: var(--graphite-font-label, 13px);
    font-weight: 400;
    margin-left: 3px;
    color: var(--graphite-text-muted);
  }
  .secondary {
    display: flex;
    align-items: baseline;
    gap: 3px;
    font-size: var(--graphite-font-label, 13px);
    font-weight: 400;
    line-height: 1.6;
    white-space: nowrap;
    color: var(--graphite-text-muted);
    --mdc-icon-size: 13px;
  }
  /* icon sits on the text baseline like a glyph */
  .secondary ha-icon {
    display: inline-flex;
    width: 13px;
    height: 13px;
    align-self: baseline;
    transform: translateY(1px);
  }
  .bar {
    position: absolute;
    left: 12px;
    right: 12px;
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
`;
