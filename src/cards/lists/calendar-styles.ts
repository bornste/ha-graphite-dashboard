// Styles of graphite-calendar: day headers, event rows (geometry of the status rows: 60px, icon box
// 42px, text at 60px) with a short stripe in the calendar color, and the details dialog.
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
  .name {
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
  /* details of an event: native dialog, so it sits above pop-ups and transformed parents */
  dialog {
    box-sizing: border-box;
    width: min(420px, calc(100vw - 32px));
    padding: 20px;
    border: none;
    border-radius: var(--graphite-radius-panel, 20px);
    background: var(--graphite-surface-panel);
    color: var(--graphite-text-primary);
    font-family: inherit;
    --event-color: var(--graphite-accent);
  }
  dialog::backdrop {
    background: var(--graphite-overlay, rgba(0, 0, 0, 0.6));
    backdrop-filter: blur(10px);
  }
  .dialog-head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .dialog-head .icon {
    margin: 0;
    width: 24px;
    height: 24px;
  }
  .dialog-title {
    flex: 1;
    font-size: var(--graphite-title-size, 18px);
    line-height: 24px;
  }
  .close {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: -6px -6px 0 0;
    border: none;
    border-radius: var(--graphite-radius-tile, 12px);
    background: var(--graphite-surface-tile);
    color: var(--graphite-text-primary);
    cursor: pointer;
    --mdc-icon-size: 20px;
  }
  .details {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 10px 12px;
    margin-top: 16px;
    font-size: 14px;
    line-height: 20px;
    color: var(--graphite-text-secondary);
    --mdc-icon-size: 18px;
  }
  .details ha-icon {
    color: var(--graphite-text-muted);
  }
  .details .description {
    white-space: pre-line;
    color: var(--graphite-text-primary);
  }
`;
