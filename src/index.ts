// graphite-cards: entry point. Every card module registers itself on import.
import { version } from "./core/version";

window.graphiteCards = { version };

console.info(
  `%c GRAPHITE-CARDS %c ${version} `,
  "background:#232327;color:#f3f3f4",
  "background:#f5c48a;color:#3a2410",
);
