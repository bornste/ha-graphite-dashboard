// Hover of the small buttons (panel header buttons, the dialog's close button, graphite-button as
// icon button): the button itself takes the hover colour of the theme instead of Home Assistant's
// ripple layer. The ripple layer lies over the button and its edge, which is drawn a fraction of a
// pixel apart, shows as a thin light or dark border on a small button. The press effect of the
// ripple stays. Only on devices with a real hover (no sticky hover after a tap).
import { css, unsafeCSS, type CSSResult } from "lit";

export function solidHoverStyles(selector: string, hovered: string = selector): CSSResult {
  const button = unsafeCSS(selector);
  const hover = unsafeCSS(hovered);
  return css`
    ${button} ha-ripple {
      --ha-ripple-hover-opacity: 0;
    }
    @media (hover: hover) {
      ${hover}:hover {
        background: color-mix(in srgb, var(--ha-ripple-hover-color, var(--secondary-text-color, #8f8f92))
          calc(var(--ha-ripple-hover-opacity, 0.08) * 100%), var(--graphite-surface-tile));
      }
    }
  `;
}
