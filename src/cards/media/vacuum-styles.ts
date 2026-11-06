// Styles of graphite-vacuum: the tile (layout: tile) and the panel (layout: panel). Sizes follow the
// Graphite tokens: tiles and buttons 60px (row height), gaps 8px (tile gap) and 16px (panel gap).
import { css } from "lit";

export const tileStyles = css`
  ha-card {
    --vacArtBg: color-mix(in srgb, var(--vacText) 6%, var(--vacTile));
    background: var(--vacTile);
    border-radius: var(--vacRadius);
    border: none;
    box-shadow: none;
    padding: 12px 14px 12px 12px;
    box-sizing: border-box;
    min-height: var(--graphite-tile-height-media, 88px);
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    position: relative;
    overflow: hidden;
    outline: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  ha-card:focus-visible {
    box-shadow: inset 0 0 0 2px var(--vacAccent);
  }
  ha-card.active {
    --vacArtBg: var(--vacTile);
    background: color-mix(in srgb, var(--vacAccent) 10%, var(--vacTileHi));
  }
  /* text column as high as the robot: name aligned to its top, details to its bottom */
  .text {
    min-width: 0;
    height: 64px;
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: var(--graphite-font-label-size, 13px);
    line-height: var(--graphite-font-label-size, 13px);
    color: var(--vacText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* state as text: 20/300 (numbers would be 22/300, words read larger) */
  .title {
    margin-top: auto;
    font-size: var(--graphite-font-value-text-size, 20px);
    font-weight: 300;
    line-height: 1.1;
    color: var(--vacText);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subtitle {
    margin-top: 3px;
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: var(--graphite-font-caption-size, 12px);
    color: var(--vacText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* progress as last line, 4px like the media tiles */
  .progress {
    margin-top: 6px;
    flex: none;
    height: 4px;
    border-radius: 2px;
    background: var(--vacTile);
    overflow: hidden;
  }
  .progress > div { height: 100%; border-radius: 2px; background: var(--vacAccent); }
  /* quick control like the panel buttons: 44 x 36 */
  .control {
    width: 44px;
    height: 36px;
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    color: var(--vacText2);
    display: grid;
    place-items: center;
    padding: 0;
    --mdc-icon-size: 18px;
    align-self: end;
  }
  .control:active { transform: scale(0.96); }
  /* maintenance or station hint as chip, takes the place of the control (never both) */
  .pill {
    max-width: 150px;
    padding: var(--graphite-chip-padding, 4px 10px);
    border-radius: var(--graphite-radius-pill, 999px);
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: color-mix(in srgb, var(--vacAccent) 16%, var(--vacTile));
    color: var(--vacAccent);
  }
`;

export const panelStyles = css`
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--graphite-gap-panel, 16px);
    align-items: start;
  }
  .column {
    background: var(--graphite-surface-panel, #161617);
    border-radius: var(--graphite-radius-panel, 20px);
    padding: var(--graphite-padding-panel, 16px);
    min-width: 0;
  }
  .columns.plain .column { background: none; padding: 0; }
  .panelTitle {
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--vacText));
    margin-bottom: var(--graphite-gap-header, 12px);
  }
  .label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 500;
    color: var(--vacText);
    margin: var(--graphite-gap-panel, 16px) 0 var(--graphite-gap-tile, 8px);
  }
  .panelTitle + .label { margin-top: 0; }
  .label button {
    background: none;
    padding: 0;
    font-size: var(--graphite-font-caption-size, 12px);
    font-weight: 400;
    color: var(--vacText3);
  }
  /* configured rooms that do not match the map (e.g. after the map was recreated) */
  .roomWarning {
    display: flex;
    gap: var(--graphite-gap-tile, 8px);
    align-items: flex-start;
    margin: 0 0 var(--graphite-gap-tile, 8px);
    padding: var(--graphite-padding-tile, 12px);
    border-radius: var(--vacRadius);
    background: color-mix(in srgb, var(--vacAccent) 14%, var(--vacTile));
    color: var(--vacAccent);
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 16px;
  }
  .roomWarning ha-icon { --mdc-icon-size: 18px; flex: none; margin-top: -1px; }
  .roomWarning strong { display: block; font-size: var(--graphite-font-label-size, 13px); font-weight: 500; margin-bottom: 2px; }
  .roomWarning span { display: block; color: var(--vacText2); }
  .presets, .modes, .rooms, .suctions, .actions {
    display: grid;
    gap: var(--graphite-gap-tile, 8px);
  }
  .presets, .modes, .rooms { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  /* all tiles and buttons of the panel share the row height */
  .preset, .room, .mode, .suction, .boost, .start, .toStation, .action {
    height: var(--graphite-row-height, 60px);
    border-radius: var(--vacRadius);
    background: var(--vacTile);
    min-width: 0;
  }
  .preset, .room {
    display: flex;
    align-items: center;
    gap: var(--graphite-gap-tile, 8px);
    padding: 0 var(--graphite-padding-tile, 12px);
    font-size: var(--graphite-font-label-size, 13px);
    color: var(--vacText2);
    text-align: left;
    --mdc-icon-size: 18px;
  }
  .preset span, .room span {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .preset ha-icon, .room ha-icon { flex: none; opacity: 0.75; }
  .preset {
    color: var(--vacText);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vacAccent) 30%, var(--vacTile));
  }
  .preset.selected {
    background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi));
    box-shadow: inset 0 0 0 1.5px var(--vacAccent);
  }
  .room.selected {
    background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi));
    color: var(--vacText);
  }
  .room .order { flex: none; font-size: var(--graphite-font-caption-size, 12px); color: var(--vacAccent); }
  .mode {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 var(--graphite-gap-tile, 8px);
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 1.2;
    color: var(--vacText2);
    --mdc-icon-size: 18px;
  }
  .mode.selected { background: var(--vacAccent); color: var(--vacAccentInk); }
  .suctions { grid-template-columns: repeat(var(--suctionCount, 4), minmax(0, 1fr)) 64px; }
  .suctions.noBoost { grid-template-columns: repeat(var(--suctionCount, 4), minmax(0, 1fr)); }
  .suction {
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacText2);
    padding: 0 4px;
  }
  .suction.selected { background: color-mix(in srgb, var(--vacAccent) 20%, var(--vacTileHi)); color: var(--vacText); }
  .boost {
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacAccent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vacAccent) 45%, var(--vacTile));
  }
  .boost.on { background: var(--vacAccent); color: var(--vacAccentInk); font-weight: 500; box-shadow: none; }
  .hint { font-size: var(--graphite-font-caption-size, 12px); color: var(--vacText3); margin-top: var(--graphite-gap-tile, 8px); }
  .startRow {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--graphite-row-height, 60px);
    gap: var(--graphite-gap-tile, 8px);
    margin-top: var(--graphite-gap-panel, 16px);
  }
  .start {
    background: var(--vacAccent);
    color: var(--vacAccentInk);
    font-size: var(--graphite-font-name-size, 15px);
    font-weight: 500;
  }
  .start.idle { background: var(--vacTile); color: var(--vacText3); opacity: 1; }
  .toStation {
    color: var(--vacText2);
    display: grid;
    place-items: center;
    --mdc-icon-size: 18px;
  }
  .robotInfo { display: flex; gap: 14px; align-items: center; margin-bottom: var(--graphite-gap-panel, 16px); }
  .robotInfo .art { --vacArtBg: var(--vacTile); width: 88px; height: 88px; }
  .robotInfo .art svg { width: 76px; height: 76px; }
  .facts { font-size: var(--graphite-font-caption-size, 12px); line-height: 1.7; color: var(--vacText2); min-width: 0; }
  .facts b { color: var(--vacText); font-weight: 500; }
  .facts .warn { color: var(--vacAccent); }
  .wear {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px var(--graphite-gap-tile, 8px);
    align-items: center;
    margin-bottom: var(--graphite-padding-tile, 12px);
  }
  .wear .name { font-size: var(--graphite-font-label-size, 13px); color: var(--vacText); }
  .wear .value { font-size: var(--graphite-font-caption-size, 12px); color: var(--vacText2); }
  .wear .line { grid-column: 1 / -1; height: 4px; border-radius: 2px; background: var(--vacTile); overflow: hidden; }
  .wear .line div { height: 100%; background: var(--vacText2); }
  .wear.due .value { color: var(--vacAccent); }
  .wear.due .line div { background: var(--vacAccent); }
  .reset {
    height: 36px;
    padding: 0 var(--graphite-padding-tile, 12px);
    border-radius: var(--graphite-radius-pill, 999px);
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacAccent);
    background: color-mix(in srgb, var(--vacAccent) 14%, var(--vacTile));
  }
  .reset.confirm { background: var(--vacAccent); color: var(--vacAccentInk); }
  .actions { grid-template-columns: 1fr 1fr; margin-top: var(--graphite-gap-panel, 16px); }
  .action {
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--vacText2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--graphite-gap-tile, 8px);
    --mdc-icon-size: 18px;
  }
  .action.done { color: var(--vacAccent); }
  .error { font-size: var(--graphite-font-caption-size, 12px); color: var(--vacDanger); margin-top: var(--graphite-gap-tile, 8px); }
  @container (min-width: 640px) {
    .columns { grid-template-columns: minmax(0, 1fr) 320px; }
  }
  @container (max-width: 380px) {
    .presets, .rooms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;
