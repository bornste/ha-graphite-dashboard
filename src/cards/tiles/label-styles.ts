// Styles of the label layout (stopwatch, pickup, todo, ink tiles), built on the meter styles:
// an optional short color stripe on top, the name below it, value and secondary value at the bottom.
// Without a stripe the tile only needs room for name and value (compact height).
import { css } from "lit";

export const labelStyles = css`
  .tile.label {
    height: var(--graphite-tile-height, 80px);
  }
  .tile.label.no-stripe {
    height: var(--graphite-tile-height-compact, 72px);
  }
  .stripe {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    top: 10px;
    width: 28px;
    height: 4px;
    border-radius: 2px;
    background: var(--label-color, var(--graphite-accent));
  }
  .tile.label .name {
    top: 20px;
  }
  .tile.label.no-stripe .name {
    top: 10px;
  }
  .tile.label .value-row {
    bottom: 9px;
  }
  /* words as value (e.g. "keine Artikel", "morgen") read larger than numbers: 20px */
  .value.text {
    font-size: var(--graphite-font-value-text-size, 20px);
  }
`;
