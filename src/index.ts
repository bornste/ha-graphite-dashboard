// graphite-cards: entry point. Every card module registers itself on import.
import { version } from "./core/version";
import "./cards/graphite-panel";
import "./cards/rows/graphite-status";
import "./cards/rows/graphite-switch";
import "./cards/tiles/graphite-meter";
import "./cards/tiles/graphite-value";
import "./cards/tiles/graphite-effect";
import "./cards/tiles/graphite-image";
import "./cards/tiles/graphite-stopwatch";
import "./cards/tiles/graphite-todo";
import "./cards/tiles/graphite-ink";
import "./cards/tiles/graphite-pickup";
import "./cards/tiles/graphite-scene";
import "./cards/media/graphite-now-playing";
import "./cards/media/graphite-vacuum";
import "./cards/media/graphite-weather";
import "./cards/lists/graphite-calendar";
import "./cards/lists/graphite-summary";
import "./cards/lists/graphite-shopping";
import "./cards/lists/graphite-battery";
import "./cards/lists/graphite-legend";
import "./cards/lists/graphite-timeline";
import "./cards/controls/graphite-slider";
import "./cards/controls/graphite-light";
import "./cards/graphite-dialog";
import "./overlays/graphite-toast";
import "./overlays/graphite-dialog-layer";

window.graphiteCards = { version };

console.info(
  `%c GRAPHITE-CARDS %c ${version} `,
  "background:#232327;color:#f3f3f4",
  "background:#f5c48a;color:#3a2410",
);
