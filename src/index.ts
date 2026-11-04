// graphite-cards: entry point. Every card module registers itself on import.
import { version } from "./core/version";
import "./cards/graphite-panel";
import "./cards/rows/graphite-status";
import "./cards/rows/graphite-switch";
import "./cards/tiles/graphite-meter";
import "./cards/tiles/graphite-effect";
import "./cards/tiles/graphite-image";
import "./cards/tiles/graphite-stopwatch";
import "./cards/tiles/graphite-todo";
import "./cards/tiles/graphite-ink";
import "./cards/tiles/graphite-pickup";

window.graphiteCards = { version };

console.info(
  `%c GRAPHITE-CARDS %c ${version} `,
  "background:#232327;color:#f3f3f4",
  "background:#f5c48a;color:#3a2410",
);
