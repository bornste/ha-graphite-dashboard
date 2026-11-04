# graphite-cards – documentation

One page per card. Each page lists every option (type, default, example), the behaviour and
the special cases – also for cards with a visual editor.

## Cards

| Card | Page | Status |
|---|---|---|
| graphite-panel | [graphite-panel.md](graphite-panel.md) | ready |
| graphite-status-row | [graphite-status-row.md](graphite-status-row.md) | ready |
| graphite-switch-row | [graphite-switch-row.md](graphite-switch-row.md) | ready |
| graphite-switch-tile | [graphite-switch-tile.md](graphite-switch-tile.md) | ready |
| graphite-meter-tile | [graphite-meter-tile.md](graphite-meter-tile.md) | ready |
| graphite-effect-tile | [graphite-effect-tile.md](graphite-effect-tile.md) | ready |
| graphite-image-tile | [graphite-image-tile.md](graphite-image-tile.md) | ready |
| graphite-stopwatch-tile | [graphite-stopwatch-tile.md](graphite-stopwatch-tile.md) | ready |

## Common behaviour

- **Theme:** all cards use the `--graphite-*` variables of the Graphite theme (colors, type scale,
  spacing, sizes), see [theme.md](theme.md).
- **Actions:** `tap_action`, `hold_action` and `double_tap_action` work like in the built-in
  cards (`more-info`, `toggle`, `navigate`, `url`, `perform-action`, `assist`, `none`).
  A double tap is only waited for when a `double_tap_action` is configured.
  Holding opens the more-info dialog by default whenever an entity is attached (set
  `hold_action: none` to disable it); the default tap action depends on the component.
  Only the primary mouse button triggers actions; a right click never does.
- **Times:** relative times use the Graphite wording, e.g. "seit 12 Min.", "seit gestern 21:40",
  "vor 3 Std.".
- **Language:** all texts of the cards (relative times, editor labels, defaults) come from
  `src/translations/<language>.json` – currently `de` and `en`. The language is taken from the
  theme variable `graphite-language` (the Graphite theme sets `de`), otherwise from the Home
  Assistant user language; unknown languages fall back to English. The editors use the same
  rule, but in the edit dialog the view theme does not apply, so they follow the Home Assistant
  language there. New language: add a JSON file with the same keys and register it in
  `src/core/i18n.ts`.
