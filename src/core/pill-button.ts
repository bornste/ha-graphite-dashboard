// Header buttons as pills (graphite-panel buttons, the close button of graphite-dialog): the visible
// pill (40 x 24, like the value chips) keeps the header at title height, the button around it stays
// 44 x 36, so it is as easy to hit on a touch screen as before. Markup:
//   <button class="<name>"><span class="pill"><ha-ripple></ha-ripple><ha-icon></ha-icon></span></button>
// The button container takes a negative margin of (36 - title line) / 2, see pillButtonsMargin.
import { css, unsafeCSS, type CSSResult } from "lit";

// half of the difference between the button (36px) and the title line (18px x 1.2): keeps the header
// row at title height
export const pillButtonsMargin = css`calc((var(--graphite-title-size, 18px) * 1.2 - 36px) / 2)`;

export function pillButtonStyles(selector: string): CSSResult {
  const button = unsafeCSS(selector);
  return css`
    ${button} {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 36px;
      padding: 0;
      border: none;
      background: none;
      color: var(--graphite-text-secondary);
      cursor: pointer;
      font: inherit;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      --mdc-icon-size: 16px;
    }
    ${button} .pill {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 24px;
      border-radius: var(--graphite-radius-pill, 999px);
      background: var(--graphite-surface-tile);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    ${button}:focus-visible .pill {
      outline: 2px solid var(--graphite-accent);
      outline-offset: 2px;
    }
    ${button}.active {
      color: var(--graphite-accent-ink);
    }
    ${button}.active .pill {
      background: var(--graphite-accent);
    }
    /* hover in the tone of the theme on the pill itself (see core/hover.ts), the ripple only presses */
    ${button} ha-ripple {
      --ha-ripple-hover-opacity: 0;
    }
    @media (hover: hover) {
      ${button}:not(.active):hover .pill {
        background: color-mix(in srgb, var(--ha-ripple-hover-color, var(--secondary-text-color, #8f8f92))
          calc(var(--ha-ripple-hover-opacity, 0.08) * 100%), var(--graphite-surface-tile));
      }
    }
  `;
}
