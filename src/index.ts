// graphite-cards: entry point. Every card module registers itself on import.
import { version } from "./core/version";
import "./cards/graphite-panel";
import "./cards/rows/graphite-status-row";
import "./cards/rows/graphite-switch-row";
import "./cards/tiles/graphite-switch-tile";
import "./cards/tiles/graphite-meter-tile";
import "./cards/tiles/graphite-effect-tile";
import "./cards/tiles/graphite-image-tile";
import "./cards/tiles/graphite-stopwatch-tile";

window.graphiteCards = { version };

console.info(
  `%c GRAPHITE-CARDS %c ${version} `,
  "background:#232327;color:#f3f3f4",
  "background:#f5c48a;color:#3a2410",
);
