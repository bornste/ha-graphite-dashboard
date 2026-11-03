# graphite-cards – documentation

One page per card. Each page lists every option (type, default, example), the behaviour and
the special cases – also for cards with a visual editor.

## Cards

| Card | Page | Status |
|---|---|---|
| – | – | the first cards follow step by step |

## Common behaviour

- **Theme:** all cards use the `--graphite-*` variables of the Graphite theme.
- **Actions:** `tap_action`, `hold_action` and `double_tap_action` work like in the built-in
  cards (`more-info`, `toggle`, `navigate`, `url`, `perform-action`, `assist`, `none`).
  A double tap is only waited for when a `double_tap_action` is configured.
- **Times:** relative times use the Graphite wording, e.g. "seit 12 Min.", "seit gestern 21:40",
  "vor 3 Std.".
