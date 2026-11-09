# graphite-cards – documentation

One page per card. Each page lists every option (type, default, example), the behaviour and
the special cases – also for cards with a visual editor.

## Cards

| Card | Layouts | Page | Status |
|---|---|---|---|
| graphite-panel | – | [graphite-panel.md](graphite-panel.md) | ready |
| graphite-status | row | [graphite-status.md](graphite-status.md) | ready |
| graphite-switch | row, tile | [graphite-switch.md](graphite-switch.md) | ready |
| graphite-meter | tile, row | [graphite-meter.md](graphite-meter.md) | ready (row in test) |
| graphite-effect | tile | [graphite-effect.md](graphite-effect.md) | ready |
| graphite-image | tile | [graphite-image.md](graphite-image.md) | ready |
| graphite-stopwatch | tile | [graphite-stopwatch.md](graphite-stopwatch.md) | ready |
| graphite-todo | tile | [graphite-todo.md](graphite-todo.md) | ready |
| graphite-ink | tile | [graphite-ink.md](graphite-ink.md) | ready |
| graphite-pickup | tile | [graphite-pickup.md](graphite-pickup.md) | ready |
| graphite-calendar | list | [graphite-calendar.md](graphite-calendar.md) | ready |
| graphite-summary | – | [graphite-summary.md](graphite-summary.md) | ready |
| graphite-shopping | – | [graphite-shopping.md](graphite-shopping.md) | ready |
| graphite-battery | – | [graphite-battery.md](graphite-battery.md) | ready |
| graphite-weather | – | [graphite-weather.md](graphite-weather.md) | ready |
| graphite-legend | – | [graphite-legend.md](graphite-legend.md) | ready |
| graphite-slider | inline, row | [graphite-slider.md](graphite-slider.md) | ready |
| graphite-light | tile | [graphite-light.md](graphite-light.md) | ready |
| graphite-scene | tile | [graphite-scene.md](graphite-scene.md) | ready |
| graphite-now-playing | tile | [graphite-now-playing.md](graphite-now-playing.md) | ready |
| graphite-vacuum | tile, panel | [graphite-vacuum.md](graphite-vacuum.md) | ready |

Cards with more than one look have a `layout` option (`row` or `tile`), so you can switch between
them without changing the card type. The editor only shows it where there is a choice. The former
names (`graphite-status-row`, `graphite-switch-row`, `graphite-switch-tile`, `graphite-meter-tile`,
`graphite-effect-tile`, …) still work as aliases and will be removed in a later version.

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
