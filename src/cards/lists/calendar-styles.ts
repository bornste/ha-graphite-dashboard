// Styles of graphite-calendar: day headers, event rows (geometry of the status rows: 60px, icon box
// 42px, text at 60px) with a short stripe in the calendar color, the header of the week range, the
// compact layout (one block per day) and the tiles layout.
import { css } from "lit";

export const calendarStyles = css`
  :host {
    display: block;
  }
  :host([hidden-empty]) {
    display: none;
  }
  .day {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin: 14px 0 6px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 18px;
    color: var(--graphite-text-secondary);
  }
  .day.first {
    margin-top: 0;
  }
  .day b {
    font-weight: 500;
    color: var(--graphite-text-primary);
  }
  .day.today b {
    color: var(--graphite-accent);
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--graphite-gap-tile, 8px);
  }
  .event {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    min-height: var(--graphite-row-height, 60px);
    padding: 9px 0;
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    overflow: hidden;
    cursor: pointer;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    --event-color: var(--graphite-accent);
  }
  .event:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  .event::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--event-color);
  }
  .icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin: 0 9px;
    color: var(--event-color);
    --mdc-icon-size: var(--graphite-row-icon-size, 24px);
  }
  .text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .nameRow {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .name {
    min-width: 0;
    font-size: var(--graphite-font-name-size, 15px);
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sub {
    font-size: var(--graphite-font-caption-size, 12px);
    line-height: 15px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .when {
    flex: none;
    margin-left: auto;
    padding: 0 14px 0 12px;
    text-align: right;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 18px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
  }
  .when .time {
    font-size: var(--graphite-font-name-size, 15px);
    color: var(--graphite-text-primary);
  }
  .when .hint {
    display: block;
  }
  .event.highlight {
    background: color-mix(in srgb, var(--event-color) 16%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .event.highlight .when {
    color: var(--event-color);
  }
  .event.running .when .time {
    color: var(--graphite-accent);
  }
  .event.past {
    opacity: 0.45;
  }
  .event.past .name {
    text-decoration: line-through;
    text-decoration-color: color-mix(in srgb, var(--graphite-ink) 50%, transparent);
  }
  .more {
    margin-top: 10px;
    text-align: center;
    font-size: var(--graphite-font-caption-size, 12px);
    color: var(--graphite-text-muted);
  }
  .empty {
    display: flex;
    align-items: center;
    min-height: var(--graphite-row-height, 60px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    font-size: 14px;
    color: var(--graphite-text-secondary);
  }
  .empty .icon {
    color: var(--graphite-success);
  }
  /* header like the panel header: title and info on one baseline, separated by a thin line */
  .header {
    display: flex;
    align-items: baseline;
    gap: var(--graphite-gap-header, 12px);
    margin-bottom: var(--graphite-gap-header, 12px);
    min-width: 0;
  }
  .header .title {
    flex: none;
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--graphite-text-primary));
  }
  .header .title:empty {
    display: none;
  }
  .header .info {
    position: relative;
    min-width: 0;
    padding-left: var(--graphite-gap-header, 12px);
    /* 2px more room on top for the separator line; the negative margin keeps the baseline */
    padding-top: 2px;
    margin-top: -2px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 16px;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* separator from the title's cap height down to the shared baseline */
  .header .info::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 3.5px;
    width: 1px;
    background: var(--graphite-separator);
  }
  .header .info:empty {
    display: none;
  }
  /* compact layout: one block per day, date on the left, one line per event */
  .days {
    display: flex;
    flex-direction: column;
    gap: var(--graphite-gap-tile, 8px);
  }
  .compactDay {
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
    min-height: var(--graphite-row-height, 60px);
    padding: 9px 14px 9px 0;
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
  }
  .compactDay.past {
    opacity: 0.45;
  }
  /* small calendar sheet, 42px like the row icon box and 9px from the edge. The weekday is the
     large part: in a school week "Mittwoch" matters more than the date */
  .date {
    flex: none;
    display: flex;
    flex-direction: column;
    width: 42px;
    height: 42px;
    margin: 0 12px 0 9px;
    border-radius: var(--graphite-radius-tile, 12px);
    overflow: hidden;
    background: color-mix(in srgb, var(--graphite-text-primary) 6%, var(--graphite-card-surface, var(--graphite-surface-tile)));
  }
  .date span {
    height: 15px;
    font-size: 10px;
    font-weight: 500;
    line-height: 15px;
    text-align: center;
    color: var(--graphite-text-secondary);
    background: color-mix(in srgb, var(--graphite-text-primary) 8%, transparent);
  }
  .date b {
    flex: 1;
    display: grid;
    place-items: center;
    font-size: var(--graphite-title-size, 18px);
    font-weight: 400;
    text-transform: uppercase;
    color: var(--graphite-text-primary);
  }
  .compactDay.today .date span {
    color: var(--graphite-accent);
    background: color-mix(in srgb, var(--graphite-accent) 16%, transparent);
  }
  .compactDay.today .date b {
    color: var(--graphite-accent);
  }
  .items {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    /* room between the events for fingers */
    gap: var(--graphite-gap-tile, 8px);
    /* first line level with the date band */
    padding-top: 1px;
  }
  /* long titles wrap to at most two lines */
  .item {
    position: relative;
    padding-left: 14px;
    font-size: var(--graphite-font-name-size, 15px);
    line-height: 18px;
    color: var(--graphite-text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    cursor: pointer;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
  .item:focus-visible {
    border-radius: 4px;
    box-shadow: 0 0 0 2px var(--graphite-accent);
  }
  .item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--event-color, var(--graphite-text-muted));
  }
  /* events with a description: small note icon behind the title */
  ha-icon.note {
    flex: none;
    margin-left: 6px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: 14px;
    vertical-align: -1px;
  }
  .item ha-icon.note {
    display: inline-flex;
  }
  /* tiles layout: two tiles side by side with the geometry of the label tiles (stopwatch, todo):
     72px, name top left, value and secondary value at the bottom, watermark top right */
  .tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--graphite-gap-tile, 8px);
  }
  .tile {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    height: var(--graphite-tile-height-compact, 72px);
    border-radius: var(--graphite-card-radius, var(--graphite-radius-tile, 12px));
    background: var(--graphite-card-surface, var(--graphite-surface-tile));
    outline: none;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.3s ease;
  }
  .tile.interactive {
    cursor: pointer;
  }
  .tile.interactive:focus-visible {
    box-shadow: inset 0 0 0 2px var(--graphite-accent);
  }
  /* next highlighted event today or tomorrow: tint and value in its color */
  .tile.alert {
    background: color-mix(in srgb, var(--event-color) var(--graphite-tint-active, 18%), var(--graphite-surface-tile-active));
  }
  .tile.alert .tileValue {
    color: var(--event-color);
  }
  .tileName {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: 52px;
    top: 10px;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 18px;
    color: var(--graphite-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tileIcon {
    position: absolute;
    right: var(--graphite-watermark-inset, 9px);
    top: 8px;
    display: flex;
    width: var(--graphite-watermark-size, 34px);
    height: var(--graphite-watermark-size, 34px);
    color: var(--graphite-text-primary);
    opacity: 0.16;
    pointer-events: none;
    --mdc-icon-size: var(--graphite-watermark-size, 34px);
  }
  .tileRow {
    position: absolute;
    left: var(--graphite-padding-tile, 12px);
    right: var(--graphite-padding-tile, 12px);
    bottom: 9px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
  }
  .tileValue {
    font-size: var(--graphite-font-value-size, 22px);
    font-weight: var(--graphite-font-value-weight, 300);
    line-height: 1.1;
    white-space: nowrap;
    color: var(--graphite-text-primary);
  }
  /* words as value ("morgen", "keine") read larger than numbers: 20px */
  .tileValue.word {
    font-size: var(--graphite-font-value-text-size, 20px);
  }
  .tileUnit {
    margin-left: 3px;
    font-size: var(--graphite-font-label-size, 13px);
    font-weight: 400;
    color: var(--graphite-text-muted);
  }
  .tile.alert .tileUnit {
    color: var(--graphite-text-secondary);
  }
  .tileSecondary {
    min-width: 0;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 1.2;
    color: var(--graphite-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ha-ripple {
    position: absolute;
    inset: 0;
  }
  /* without tap and hold action the events are plain text */
  .event.static,
  .item.static {
    cursor: default;
  }
  .item.ruled {
    color: var(--event-color);
  }
  .item.past {
    opacity: 0.45;
  }
  .item .time {
    margin-right: 6px;
    font-size: var(--graphite-font-label-size, 13px);
    color: var(--graphite-text-secondary);
  }
  .item .until {
    margin-left: 6px;
    font-size: var(--graphite-font-label-size, 13px);
    color: var(--graphite-text-secondary);
  }
  .none {
    font-size: var(--graphite-font-name-size, 15px);
    line-height: 18px;
    color: var(--graphite-text-muted);
  }
`;
