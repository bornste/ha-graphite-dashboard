// Styles of graphite-shopping (1:1 port of the former shopping card): list column with input and
// items, quick pick column with chip groups and the variant chooser as overlay.
import { css } from "lit";

export const shoppingStyles = css`
  :host {
    display: block;
    container-type: inline-size;
    --shopTile: var(--graphite-surface-tile, #1f1f20);
    --shopTileHi: var(--graphite-surface-tile-active, #2b2b2c);
    --shopText: var(--graphite-text-primary, #f3f3f4);
    --shopText2: var(--graphite-text-secondary, #b4b4b8);
    --shopText3: var(--graphite-text-muted, #8f8f92);
    --shopAccent: var(--graphite-accent, #f5c48a);
    --shopAccentInk: var(--graphite-accent-ink, #3a2410);
    --shopDanger: var(--graphite-danger, #e8908a);
    --shopRadius: var(--graphite-radius-tile, 12px);
  }
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }
  /* panel look per column (same tokens as graphite-panel); tiles inside use the tile surface */
  .columns.panels .listColumn,
  .columns.panels .quickColumn {
    background: var(--graphite-surface-panel, #161617);
    border-radius: var(--graphite-radius-panel, 20px);
    padding: var(--graphite-padding-panel, 16px);
  }
  .panelTitle {
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--shopText));
    margin-bottom: 12px;
  }
  /* title and sync state in one line on one baseline, separated by a thin line */
  .panelHeader {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
  }
  .panelHeader .panelTitle { flex: none; margin-bottom: 0; }
  /* sync state of the todo integration: saved / saving (n) / error */
  .syncStatus {
    min-width: 0;
    padding-left: 12px;
    position: relative;
    /* 2px more room on top for the separator line; the negative margin keeps the shared baseline */
    padding-top: 2px;
    margin-top: -2px;
    font-size: 13px;
    line-height: 16px;
    color: var(--shopText2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    --mdc-icon-size: 14px;
  }
  /* separator line from the title's cap height down to the shared baseline */
  .syncStatus::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 3.5px;
    width: 1px;
    background: var(--graphite-separator, color-mix(in srgb, var(--graphite-ink, #f3f3f4) 24%, var(--graphite-ground, #0a0a0b)));
  }
  .syncStatus.saving { color: var(--shopAccent); }
  .syncStatus.error { color: var(--shopDanger); }
  /* icon and spinner share one fixed 14px slot, so the text never moves */
  .syncStatus ha-icon,
  .syncStatus .syncSpinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 5px;
    vertical-align: -2px;
  }
  .syncStatus ha-icon {
    overflow: hidden;
    line-height: 0;
  }
  .syncSpinner {
    box-sizing: border-box;
    border-radius: 50%;
    border: 1.5px solid color-mix(in srgb, var(--shopAccent) 30%, transparent);
    border-top-color: var(--shopAccent);
    animation: shopSpin 0.9s linear infinite;
  }
  @keyframes shopSpin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .syncSpinner { animation-duration: 3s; } }
  .inputRow {
    display: flex;
    gap: 8px;
  }
  input {
    flex: 1;
    min-width: 0;
    height: 48px;
    border: none;
    outline: none;
    border-radius: var(--shopRadius);
    background: var(--shopTile);
    color: var(--shopText);
    font: inherit;
    font-size: 15px;
    padding: 0 14px;
  }
  input::placeholder { color: var(--shopText3); }
  input:focus-visible { box-shadow: inset 0 0 0 1.5px var(--shopAccent); }
  button {
    position: relative;
    overflow: hidden;
    border: none;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  /* the ripple covers its button or item and takes no place in the flex row */
  ha-ripple {
    position: absolute;
    inset: 0;
  }
  .addButton {
    width: 52px;
    height: 48px;
    border-radius: var(--shopRadius);
    background: var(--shopAccent);
    color: var(--shopAccentInk);
    display: grid;
    place-items: center;
    --mdc-icon-size: 22px;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  .emptyList {
    font-size: 15px;
    color: var(--shopText3);
    padding: 10px 2px;
  }
  .item {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 12px 0 6px;
    border-radius: var(--shopRadius);
    background: var(--shopTile);
    outline: none;
  }
  .item.editable { cursor: pointer; }
  /* on its way to the todo integration */
  .item.pending .name { color: var(--shopText2); }
  .remove {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: none;
    color: var(--shopText3);
    display: grid;
    place-items: center;
    flex: none;
    --mdc-icon-size: 20px;
  }
  .remove:hover, .remove:focus-visible { color: var(--shopDanger); background: color-mix(in srgb, var(--shopDanger) 14%, var(--shopTile)); }
  .name {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    color: var(--shopText);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .detail {
    font-size: 13px;
    color: var(--shopAccent);
    background: color-mix(in srgb, var(--shopAccent) 14%, var(--shopTile));
    padding: 3px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .detail.empty {
    color: var(--shopText3);
    background: none;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--shopText) 14%, transparent);
  }
  .groups {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    column-gap: 16px;
  }
  .group.wide { grid-column: 1 / -1; }
  .groupLabel {
    font-size: 14px;
    font-weight: 500;
    color: var(--shopText);
    margin: 18px 2px 10px;
  }
  .group:first-child .groupLabel { margin-top: 0; }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    height: 44px;
    padding: 0 16px;
    border-radius: 999px;
    background: var(--shopTile);
    color: var(--shopText2);
    font-size: 15px;
    display: inline-flex;
    /* name and detail share one baseline, the line is centered in the chip height */
    flex-wrap: wrap;
    align-content: center;
    align-items: baseline;
    gap: 6px;
    user-select: none;
  }
  .chip .more { font-size: 12px; color: var(--shopText3); }
  /* fixed description of a product (config): a quiet detail after the name, not a choice */
  .chip .fixedDetail { font-size: 13px; color: var(--shopText3); }
  .chip.on .fixedDetail { color: var(--shopText2); }
  .item .fixedDetail { margin-left: 6px; font-size: 13px; color: var(--shopText2); }
  /* marks chips with a variant choice */
  .chip .moreIcon { --mdc-icon-size: 18px; display: inline-flex; align-self: center; margin: 0 -4px 0 -2px; color: var(--shopText2); }
  .chip.on .moreIcon { color: var(--shopAccent); }
  .chip.on { background: color-mix(in srgb, var(--shopAccent) 20%, var(--shopTileHi)); color: var(--shopText); }
  .chip.on .more { color: var(--shopAccent); }
  /* variant chooser floats below the chips (overlay), so the page keeps its height and position */
  .chipArea {
    position: relative;
  }
  .variants {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 6px);
    z-index: 3;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
    background: var(--shopTileHi);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55), inset 0 0 0 1px color-mix(in srgb, var(--shopText) 8%, transparent);
  }
  .hint {
    width: 100%;
    font-size: 13px;
    color: var(--shopText2);
    margin: 0 2px 2px;
  }
  .variant {
    height: 44px;
    min-width: 52px;
    padding: 0 16px;
    border-radius: 12px;
    background: var(--shopTile);
    color: var(--shopText);
    font-size: 15px;
  }
  .variant.selected { background: var(--shopAccent); color: var(--shopAccentInk); font-weight: 500; }
  .variant.removeVariant { margin-left: auto; background: none; color: var(--shopDanger); }
  .variant.close { margin-left: auto; background: none; color: var(--shopText2); }
  .variant.removeVariant + .variant.close { margin-left: 0; }
  /* two columns once the card is wide enough; after the base rules so it wins */
  @container (min-width: 640px) {
    .columns { grid-template-columns: 360px minmax(0, 1fr); }
    .columns.panels { gap: var(--graphite-gap-panel, 16px); }
    .listColumn { max-height: var(--graphite-shopping-list-height, 600px); overflow-y: auto; scrollbar-width: thin; }
    .groups { grid-template-columns: 1fr 1fr; }
    .group:first-child:not(.wide) + .group:not(.wide) .groupLabel { margin-top: 0; }
  }
  .chip:focus-visible, .variant:focus-visible, .addButton:focus-visible, .item:focus-visible {
    outline: 2px solid var(--shopAccent);
    outline-offset: 1px;
  }
`;
