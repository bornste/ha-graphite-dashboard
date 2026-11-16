// Small busy spinner in the accent color (e.g. while a started script runs), shared by
// graphite-image and graphite-button. The card places it with its own top / right.
import { css } from "lit";

export const spinnerStyles = css`
  .spinner {
    position: absolute;
    z-index: 3;
    width: 14px;
    height: 14px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--graphite-accent) 28%, transparent);
    border-top-color: var(--graphite-accent);
    pointer-events: none;
    animation: graphite-spin 0.9s linear infinite;
  }
  @keyframes graphite-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 3s;
    }
  }
`;
