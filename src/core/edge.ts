// Light edge of a surface, set by the theme: a 1px border painted with a gradient (e.g. bright at
// the top left corner, fading along the edges). Graphite sets nothing, so there is no edge.
//   --graphite-edge-show: '""'  turns the edge of tiles on (without it no pseudo element is created)
//   --graphite-tile-edge         gradient of tiles and rows
//   --graphite-panel-edge        gradient of outer panels (graphite-panel)
//   --graphite-dialog-edge       gradient of the dialog
//   --graphite-dialog-shadow     shadow of the dialog (graphite-dialog.ts), none by default
//   --graphite-dialog-backdrop   layer over the dashboard behind a dialog (graphite-dialog-layer.ts)
//   --graphite-tile-shadow       shadow of tiles and rows (e.g. raised light tiles), none by default
//   --graphite-tile-fill         background of tiles and rows (a colour or a gradient), the tile surface by default
//   --graphite-panel-fill        background of framed panels (a colour or a gradient), the panel surface by default
//   --graphite-panel-shadow      shadow of framed panels (graphite-panel.ts), none by default
// The surface tokens (--graphite-surface-*) stay plain colours: cards mix them (states, hover); the fill
// tokens may be gradients built from them. Edge and shadow may hold several layers (e.g. a light line
// on top over a fine dark frame).
import { css, unsafeCSS, type CSSResult } from "lit";

// mask that keeps only the 1px border of the element (padding box cut out)
export const edgeMask = css`
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
`;

// edge on the given tile roots (comma separated selectors) as ::before or, where that is taken, ::after;
// the roots also get --graphite-tile-shadow, without specificity (:where), so a card's own box-shadow
// (focus ring, outline of a selected button) still wins
export function tileEdgeStyles(selectors: string, pseudo: "before" | "after" = "before"): CSSResult {
  const roots = selectors.split(",").map((selector) => selector.trim()).filter(Boolean);
  const rootList = unsafeCSS(roots.join(", "));
  const pseudoList = unsafeCSS(roots.map((selector) => `${selector}::${pseudo}`).join(", "));
  return css`
    ${rootList} {
      position: relative;
    }
    :where(${rootList}) {
      box-shadow: var(--graphite-tile-shadow, none);
    }
    ${pseudoList} {
      content: var(--graphite-edge-show, none);
      position: absolute;
      inset: 0;
      z-index: 1;
      box-sizing: border-box;
      padding: 1px;
      border-radius: inherit;
      background: var(--graphite-tile-edge, none);
      pointer-events: none;
      ${edgeMask}
    }
  `;
}
