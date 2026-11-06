// Robot artwork of graphite-vacuum (top view, front = up) and its styles; state classes on the
// .art wrapper (run, mopping, return, wash, dry, charge, docked, sleep, err, offline) animate the parts.
import { css, html } from "lit";

export const robotArt = html`
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g class="dock"><rect x="10" y="48" width="44" height="12" rx="4" fill="var(--vacDock)" style="fill-opacity: var(--vacTone)" stroke="var(--vacDock)" stroke-width="1.4"/><rect x="18" y="55.5" width="28" height="2.5" rx="1.25" fill="var(--vacDock)"/></g>
  <g class="robot">
    <g class="pads">
      <g transform="translate(25 44)"><g class="pad"><circle r="7" fill="var(--vacWater)" style="fill-opacity: var(--vacTone)" stroke="var(--vacWater)" stroke-width="1.4"/><path d="M-4 0 H4 M0 -4 V4" stroke="var(--vacWater)" stroke-width="1.2" opacity=".8"/></g></g>
      <g transform="translate(39 44)"><g class="pad"><circle r="7" fill="var(--vacWater)" style="fill-opacity: var(--vacTone)" stroke="var(--vacWater)" stroke-width="1.4"/><path d="M-4 0 H4 M0 -4 V4" stroke="var(--vacWater)" stroke-width="1.2" opacity=".8"/></g></g>
    </g>
    <g transform="translate(20 17)"><g class="brush"><path d="M0 0 L-8 -3 M0 0 L1 -8 M0 0 L-5 6" stroke="var(--vacLine)" stroke-width="1.4" stroke-linecap="round"/></g></g>
    <circle cx="32" cy="30" r="19" fill="var(--vacBody)"/>
    <circle cx="32" cy="30" r="19" fill="var(--vacLine)" style="fill-opacity: var(--vacTone)" stroke="var(--vacLine)" stroke-width="1.6"/>
    <path d="M16.5 30 A15.5 15.5 0 0 1 47.5 30" fill="none" stroke="var(--vacLine)" stroke-width="1.4"/>
    <path d="M14 29 L16.5 30 L16.5 33 M50 29 L47.5 30 L47.5 33" fill="none" stroke="var(--vacLine)" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M19 22 H26 M38 22 H45" stroke="var(--vacLine)" stroke-width="1.2"/>
    <circle cx="32" cy="22" r="5.5" fill="none" stroke="var(--vacLine)" stroke-width="1.4"/>
    <rect class="eye" x="30.8" y="37" width="2.4" height="5" rx="1.2" fill="var(--vacAccent)"/>
  </g>
  <g class="drops"><path class="drop" d="M12 42 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/><path class="drop" d="M52 42 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/><path class="drop" d="M8 34 q3 4 0 6 q-3 -2 0 -6z" fill="var(--vacWater)"/></g>
  <g class="heat" fill="none" stroke="var(--vacAccent)" stroke-width="1.8" stroke-linecap="round"><path class="wave" d="M24 8 q2 -3 0 -6"/><path class="wave" d="M32 8 q2 -3 0 -6"/><path class="wave" d="M40 8 q2 -3 0 -6"/></g>
  <path class="bolt" d="M51 2 l-5 9 h4 l-2 7 l6 -10 h-4 l2 -6z" fill="var(--vacAccent)"/>
</svg>`;

export const artStyles = css`
  :host {
    display: block;
    container-type: inline-size;
    --vacTile: var(--graphite-surface-tile, #1f1f20);
    --vacTileHi: var(--graphite-surface-tile-active, #2b2b2c);
    --vacText: var(--graphite-text-primary, #f3f3f4);
    --vacText2: var(--graphite-text-secondary, #b4b4b8);
    --vacText3: var(--graphite-text-muted, #8f8f92);
    --vacAccent: var(--graphite-accent, #f5c48a);
    --vacAccentInk: var(--graphite-accent-ink, #3a2410);
    --vacDanger: var(--graphite-danger, #e8908a);
    --vacWater: #7cc4f0;
    --vacLine: #c4c4c8;
    --vacDock: #6a6a70;
    /* second tone of the two-tone artwork, matches the dimmed icons of the other tiles */
    --vacTone: var(--graphite-vacuum-tone, 0.12);
    --vacRadius: var(--graphite-radius-tile, 12px);
  }
  /* position and clip for the ripple (hover and press like the other Graphite tiles) */
  button {
    position: relative;
    overflow: hidden;
    border: none;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled { cursor: default; opacity: 0.45; }
  /* robot artwork */
  .art {
    --vacBody: var(--vacArtBg);
    --vacTurret: var(--vacArtBg);
    width: 64px;
    height: 64px;
    border-radius: var(--vacRadius);
    background: var(--vacArtBg);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex: none;
  }
  .art svg { width: 56px; height: 56px; overflow: visible; }
  .brush, .pad { transform-box: view-box; }
  .run .brush, .return .brush { animation: vacSpin 0.6s linear infinite; }
  .run .robot, .return .robot { animation: vacDrive 3s ease-in-out infinite; }
  .run.mopping .pad, .wash .pad { animation: vacSpin 1s linear infinite; }
  .drops, .heat, .bolt, .dock { opacity: 0; }
  .wash .drops { opacity: 1; }
  .wash .drop { animation: vacFall 1s ease-in infinite; }
  .wash .drop:nth-child(2) { animation-delay: 0.33s; }
  .wash .drop:nth-child(3) { animation-delay: 0.66s; }
  .dry .heat { opacity: 1; }
  .dry .wave { animation: vacRise 1.8s ease-in-out infinite; }
  .dry .wave:nth-child(2) { animation-delay: 0.6s; }
  .dry .wave:nth-child(3) { animation-delay: 1.2s; }
  .charge .bolt { opacity: 1; animation: vacPulse 1.6s ease-in-out infinite; }
  .docked .dock, .charge .dock, .wash .dock, .dry .dock { opacity: 1; }
  .err .eye { fill: var(--vacDanger); }
  .err .robot { animation: vacShake 0.5s ease-in-out 3; }
  .sleep .eye { opacity: 0.35; }
  .offline svg { opacity: 0.4; }
  @keyframes vacSpin { to { transform: rotate(360deg); } }
  @keyframes vacDrive { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(3px, -2px) rotate(8deg); } 75% { transform: translate(-3px, 2px) rotate(-6deg); } }
  @keyframes vacFall { 0% { transform: translateY(-6px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(6px); opacity: 0; } }
  @keyframes vacRise { 0% { transform: translateY(4px); opacity: 0; } 50% { opacity: 0.9; } 100% { transform: translateY(-6px); opacity: 0; } }
  @keyframes vacPulse { 50% { opacity: 0.35; } }
  @keyframes vacShake { 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
  @media (prefers-reduced-motion: reduce) { .art * { animation: none !important; } }
`;
