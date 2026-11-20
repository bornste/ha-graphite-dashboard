// Shared look of panels: graphite-panel and the cards that draw panels of their own (several in one
// card: battery groups, shopping list and quick picks, vacuum columns, calendar weeks) use the same
// surface and the same header, so a change here applies everywhere.
import { css, unsafeCSS, type CSSResult } from "lit";

// surface of a panel a card draws itself; same tokens as the ha-card of graphite-panel
export function panelSurfaceStyles(selector: string): CSSResult {
  const panel = unsafeCSS(selector);
  return css`
    ${panel} {
      background: var(--graphite-panel-fill, var(--graphite-surface-panel));
      border-radius: var(--graphite-radius-panel, 20px);
      padding: var(--graphite-padding-panel, 16px);
      box-shadow: var(--graphite-panel-shadow, none);
    }
  `;
}

// header: title and status on one baseline, no separator (they differ in size and colour).
// Markup: <div class="header"><span class="title">…</span><span class="info">…</span></div>;
// a card adds its own parts (chips, buttons, a dot, a chevron) next to them.
export const panelHeaderStyles = css`
  .header {
    display: flex;
    align-items: baseline;
    gap: var(--graphite-gap-header, 12px);
    min-width: 0;
    margin-bottom: var(--graphite-gap-header, 12px);
  }
  .header .title {
    flex: none;
    font-size: var(--graphite-title-size, 18px);
    font-weight: var(--graphite-title-weight, 400);
    line-height: 1.2;
    color: var(--graphite-title-color, var(--graphite-text-primary, var(--primary-text-color)));
  }
  .header .info {
    min-width: 0;
    font-size: var(--graphite-font-label-size, 13px);
    line-height: 16px;
    color: var(--graphite-text-secondary, var(--secondary-text-color));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .header .title:empty,
  .header .info:empty {
    display: none;
  }
`;
