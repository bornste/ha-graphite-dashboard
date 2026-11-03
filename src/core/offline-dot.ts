// Small ring with a soft fill, used in the "offline" badges instead of an icon
// (12px box like the former wifi-off icon, ring of 7.5/24 radius with a 2/24 stroke).
import { html } from "lit";

export const offlineDot = html`<svg class="offline-dot" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><circle
  cx="12" cy="12" r="7.5" fill="currentColor" opacity="0.3"></circle><circle cx="12" cy="12" r="7.5" fill="none"
  stroke="currentColor" stroke-width="2"></circle></svg>`;
