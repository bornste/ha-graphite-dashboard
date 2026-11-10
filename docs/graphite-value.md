# graphite-value

One value – a number or a word – where the value is the main thing, as a tile or a row. The tile
shows the name on top, the value with its unit at the bottom, an optional second value on the right
and a watermark icon; it is the [graphite-meter](graphite-meter.md) tile without its bar. The row has
the geometry of the status rows with the value on the right in the same value type.

**Value or status?** Use graphite-value when the value matters (temperatures, counters, prices, the
running app), [graphite-status](graphite-status.md) for states where the name matters and the state is
a small addition (windows, lamps, presence).

```yaml
type: custom:graphite-value
layout: tile             # or row
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
| `name` | string | friendly name | Name. |
| `layout` | `tile` \| `row` | `tile` | Tile or row, see above. |
| `decimals` | number | display precision | Decimals of a numeric value (up to 4). Without it the display precision of the entity is used, otherwise the decimals of the state. |
| `unit` | string | entity unit | Unit after the value; `""` hides it. |
| `icon` | icon | entity icon (row) | Tile: watermark top right. Row: icon on the left. |
| `show_icon` | boolean | `false` | Tile: shows the entity icon as watermark when no `icon` is set. |
| `secondary_entity` | entity id | – | Second value: tile on the right of the value, row as small line below the name. |
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
- **Row:** the value on the right takes at most 60 % of the width; long words end with "…", the
  name gives way first.
- **Offline** (unavailable, unknown): like the switch tile and the status row – the surface fades,
  name and value at 40 %, an "offline" badge (tile top right, row on the right) and in the row
  "keine Meldung seit …". Tap actions are ignored, holding still opens more-info.
- Tile height 72px (`--graphite-tile-height-compact`), the same as the stopwatch and todo tiles;
  row height `--graphite-row-height` (60px).

## Styling

Label tile geometry: name 13px top left, value `--graphite-font-value-size` / `--graphite-font-value-weight`
at the bottom, unit and second value `--graphite-font-label-size`, watermark `--graphite-watermark-size`.

## Editor

Layout first; the watermark switch only with `layout: tile`. Sections: *Value*, *Second value* and
*Actions*.
