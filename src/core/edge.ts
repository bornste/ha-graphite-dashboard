// Light edge of a surface, set by the theme: a 1px border painted with a gradient (e.g. bright at
// the top left corner, fading along the edges). Graphite sets nothing, so there is no edge.
//   --graphite-edge-show: '""'  turns the edge of tiles on (without it no pseudo element is created)
//   --graphite-tile-edge         gradient of tiles and rows
//   --graphite-panel-edge        gradient of outer panels (graphite-panel)
//   --graphite-dialog-edge       gradient of the dialog
//   --graphite-dialog-shadow     shadow of the dialog (graphite-dialog.ts), none by default
//   --graphite-dialog-backdrop   layer over the dashboard behind a dialog (graphite-dialog-layer.ts)
//   --graphite-tile-shadow       shadow of tiles and rows (e.g. raised light tiles), none by default
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
