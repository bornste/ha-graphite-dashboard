# graphite-meter-tile

A tile for a measured value: name on top, the value above a thin instrument bar in the footer,
optionally a second value on the right (e.g. humidity next to the temperature) and a watermark
icon top right. Tapping and holding open the more-info dialog.

```yaml
type: custom:graphite-meter-tile
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

## Styles

| Style | Look | Good for |
|---|---|---|
| `gradient` | The whole color scale is visible, dimmed beyond the value; a needle marks the value. | Values with a comfort range (temperature, CPU load). |
| `level` (default) | The bar is filled up to the value in the color of its band, the track is a muted step of that color. | Percentages (memory, disk, battery). |

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Numeric sensor. |
| `name` | string | friendly name | Name on top. |
| `style` | `gradient` \| `level` | `level` | Instrument, see above. |
| `min` / `max` | number | `0` / `min + 100` | Range of the bar. Values outside are clamped. |
| `colors` | map | accent | Color stops `value: color`. The band color is the color of the highest stop at or below the value; `gradient` draws all stops as a scale. |
| `decimals` | number | `1` | Decimals of the value (number format of the Home Assistant user). |
| `unit` | string | entity unit | Unit after the value; `""` hides it. |
| `icon` | icon | – | Watermark icon top right. |
| `show_icon` | boolean | `false` | Shows the entity icon as watermark when no `icon` is set. |
| `secondary_entity` | entity id | – | Second value on the right of the value row. |
| `secondary_decimals` | number | `0` | Decimals of the second value. |
| `secondary_unit` | string | entity unit | Unit of the second value. |
| `secondary_icon` | icon | – | Small icon before the second value. |
| `tap_action` | action | `more-info` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **No value** (unavailable, not numeric): the value shows "–", the bar is empty (`level`) or the
  whole scale is dimmed without a needle (`gradient`).
- The tile has the same height as the switch tile (80px), so both can share a row.

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height` | `80px` | Height of the tile. |
| `--graphite-font-value`, `--graphite-font-value-weight` | `22px`, `300` | Value. |
| `--graphite-font-label` | `13px` | Name, unit and second value. |
| `--graphite-watermark-size` | `34px` | Watermark icon. |
| `--graphite-meter-dim` | `65%` | How strongly the scale is dimmed beyond the value (`gradient`). |
