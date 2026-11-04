# graphite-meter

A measured value above a thin instrument bar – as a tile (default) or as a full-width row.
Tapping and holding open the more-info dialog.

| Layout | Look | Good for |
|---|---|---|
| `tile` (default) | Name on top, the value above the bar in the footer, optionally a second value on the right and a watermark icon top right. | Climate, server load; tiles side by side. |
| `row` | Name and a status line on the left, the value on the right, the bar along the bottom. | Levels in a list: ink cartridges, batteries, tanks. |

```yaml
type: custom:graphite-meter
entity: sensor.living_room_temperature
name: Living room
style: gradient
min: 16
max: 32
unit: °C
colors:
  16: "#4f8fd6"
  24: "#6fbf5a"
  28: "#f0a33c"
  32: "#e4644b"
secondary_entity: sensor.living_room_humidity
```

```yaml
type: custom:graphite-meter
layout: row
entity: sensor.office_printer_cyan
name: Cyan
color: "#2fb4e6"
decimals: 0
low: 20
```

## Styles

| Style | Look | Good for |
|---|---|---|
| `gradient` | The whole color scale is visible, dimmed beyond the value; a needle marks the value. | Values with a comfort range (temperature, CPU load). |
| `level` (default) | The bar is filled up to the value in the color of its band, the track is a muted step of that color. | Percentages (memory, disk, battery, ink). |

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Numeric sensor. |
| `layout` | `tile` \| `row` | `tile` | Look, see above. |
| `name` | string | friendly name | Name. |
| `style` | `gradient` \| `level` | `level` | Instrument, see above. |
| `min` / `max` | number | `0` / `min + 100` | Range of the bar. Values outside are clamped. |
| `color` | CSS color | accent | One color for the whole bar (e.g. the ink color). Ignored when `colors` is set. |
| `colors` | map | – | Color stops `value: color`. The band color is the color of the highest stop at or below the value; `gradient` draws all stops as a scale. |
| `low` | number | – | Below this value the meter counts as soon empty, see Behaviour. |
| `decimals` | number | `1` | Decimals of the value (number format of the Home Assistant user). |
| `unit` | string | entity unit | Unit after the value; `""` hides it. |
| `secondary_entity` | entity id | – | Second value: on the right of the value row (tile) or as status line (row). |
| `secondary_decimals` | number | `0` | Decimals of the second value. |
| `secondary_unit` | string | entity unit | Unit of the second value. |
| `secondary_icon` | icon | – | Small icon before the second value. |
| `tap_action` | action | `more-info` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. |

Only in the tile layout:

| Option | Type | Default | Description |
|---|---|---|---|
| `icon` | icon | – | Watermark icon top right. |
| `show_icon` | boolean | `false` | Shows the entity icon as watermark when no `icon` is set. |

## Behaviour

With `low` set, the meter shows a status:

| State | Row: status line | Tile | Look |
|---|---|---|---|
| fine | "OK" | – | neutral |
| soon empty (below `low`) | "bald leer" | "bald leer" on the right | value and status in accent |
| empty (at `min`) | "leer" | "leer" on the right | accent tint, value and status in accent |

- **No value** (unavailable, not numeric): the bar is empty (`level`) or the whole scale is dimmed
  without a needle (`gradient`). The tile shows "–"; the row is dimmed like every offline row, shows
  "offline" as value and "keine Meldung seit …" as status line.
- The tile has the same height as the switch tile (80px), so both can share a row.

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height` | `80px` | Height of the tile. |
| `--graphite-font-value-size`, `--graphite-font-value-weight` | `22px`, `300` | Value. |
| `--graphite-font-label-size` | `13px` | Name (tile), unit and second value. |
| `--graphite-watermark-size` | `34px` | Watermark icon. |
| `--graphite-meter-dim` | `65%` | How strongly the scale is dimmed beyond the value (`gradient`). |

## Editor

Layout first; icon and watermark are only shown with `layout: tile`.

## Former names

`graphite-meter-tile` still works as an alias and will be removed in a later version.
