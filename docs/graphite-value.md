# graphite-value

One value as a tile: the name on top, the value with its unit at the bottom, an optional second
value on the right and a watermark icon top right. It is the [graphite-meter](graphite-meter.md)
tile without its bar – for values that need no scale: counters, prices, words like "offen". The row
counterpart is [graphite-status](graphite-status.md), which takes `decimals` and `unit` as well.

```yaml
type: custom:graphite-value
entity: sensor.water_today
name: Wasser heute
decimals: 0
icon: mdi:water-outline
secondary_entity: sensor.water_yesterday
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Entity shown in the tile. |
| `name` | string | friendly name | Name on top. |
| `decimals` | number | display precision | Decimals of a numeric value (up to 4). Without it the display precision of the entity is used, otherwise the decimals of the state. |
| `unit` | string | entity unit | Unit after the value; `""` hides it. |
| `icon` | icon | – | Watermark icon top right. |
| `show_icon` | boolean | `false` | Shows the entity icon as watermark when no `icon` is set. |
| `color` | CSS color | – | Short color stripe above the name (like the todo tile); the tile is then 80px instead of 72px. |
| `secondary_entity` | entity id | – | Second value on the right of the value row. |
| `secondary_decimals` | number | display precision | Decimals of the second value. |
| `secondary_unit` | string | entity unit | Unit of the second value. |
| `secondary_icon` | icon | – | Small icon before the second value. |
| `tap_action` | action | `none` | Action on tap. Without a tap or double tap action the tile is display-only (no hand cursor, no touch effect). |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **Numbers** are shown with the chosen decimals in the number format of the Home Assistant user,
  22px / 300 like the other tile values.
- **Words** (any state that is not a number) are shown as Home Assistant formats the state
  (translated), at 20px, without unit – words read larger than numbers.
- **No value** (unavailable, unknown): "–".
- Height 72px (`--graphite-tile-height-compact`), with `color` 80px – the same as the stopwatch and
  todo tiles, so they share a row.

## Styling

Label tile geometry: name 13px top left, value `--graphite-font-value-size` / `--graphite-font-value-weight`
at the bottom, unit and second value `--graphite-font-label-size`, watermark `--graphite-watermark-size`.

## Editor

All options in one form; actions use Home Assistant's action selector.
