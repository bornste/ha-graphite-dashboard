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
| `change` | A needle in the middle marks a reference; the bar runs to the right (more) or to the left (less), the change (green for a gain, red for a loss, with its sign) stands next to the value. | Share and crypto prices, any value against a reference. |

### Prices (`style: change`)

```yaml
# bought: compared with the purchase price
type: custom:graphite-meter
entity: sensor.acme_share
style: change
reference: 128.40
decimals: 2
```

```yaml
# only watched: compared with 24 hours ago
type: custom:graphite-meter
entity: sensor.sample_coin
style: change
reference: 24h
change_attribute: 24h_change   # optional: change in percent from an attribute
decimals: 4
```

- **Reference:** a number or an entity (purchase price, shown as "Kauf 128.40"), or a period `24h`,
  `7d`, … (shown as "24 h", "7 Tage"). For a period the card reads the value of that time ago from the
  history (Home Assistant keeps 10 days by default). With `change_attribute` the percent comes from
  that attribute instead (e.g. Cryptoinfo: `24h_change`, `7d_change`, `30d_change`).
- **Bar:** half the bar is `scale` percent (default 20). Beyond it the bar stays full and its end fades out.
- **Not only prices:** any numeric sensor against a fixed value, an entity or itself some time ago.
  Set `reference_name` (e.g. "Ziel", "Start"), otherwise a fixed reference is called "Kauf".
- **`change_mode: absolute`:** the change as a difference in the unit of the sensor ("+2.0 °C"
  instead of "+10 %"); `scale` is then in that unit as well.
- **`invert: true`:** for values where more is bad (consumption, prices to pay): an increase is red,
  a decrease green. The bar still runs right for more.

```yaml
# electricity today against yesterday: more is bad, difference in kWh
type: custom:graphite-meter
entity: sensor.energy_today
style: change
reference: 24h
change_mode: absolute
scale: 5
invert: true
```
- **Narrow tiles** keep the same order: below 200px the reference gets shorter ("Kauf" instead of
  "Kauf 128.40"), below 150px the unit is left out. Value and change always stay in place, and bought
  and watched prices stay apart.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Numeric sensor. |
| `layout` | `tile` \| `row` | `tile` | Look, see above. |
| `name` | string | friendly name | Name. |
| `style` | `gradient` \| `level` \| `change` | `level` | Instrument, see above. |
| `min` / `max` | number | `0` / `min + 100` | Range of the bar. Values outside are clamped. |
| `color` | CSS color | accent | One color for the whole bar (e.g. the ink color). Ignored when `colors` is set. |
| `colors` | map | – | Color stops `value: color`. The band color is the color of the highest stop at or below the value; `gradient` draws all stops as a scale. |
| `low` | number | – | Below this value the meter counts as soon empty, see Behaviour. |
| `decimals` | number | display precision, else `1` | Decimals of the value, up to 4 (number format of the Home Assistant user). Without it the display precision of the entity is used. |
| `reference` | number \| entity \| period | – | `style: change`: purchase price, an entity holding it, or a period like `24h`, `7d`. |
| `reference_name` | string | "Kauf …" / "24 h" | `style: change`: text for the reference top right. |
| `change_attribute` | string | – | `style: change`: attribute with the change in percent; takes precedence over the computed change. |
| `scale` | number | `20` | `style: change`: percent (or, with `change_mode: absolute`, units) that fill half the bar. |
| `change_mode` | `percent` \| `absolute` | `percent` | `style: change`: change in percent or as a difference in the unit of the sensor. |
| `invert` | boolean | `false` | `style: change`: more is bad – an increase is red, a decrease green. |
| `change_decimals` | number | `1` (absolute: `decimals`) | `style: change`: decimals of the change. |
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

- **No value** (not numeric): the bar is empty (`level`) or the whole scale is dimmed without a
  needle (`gradient`), the value shows "–".
- **Offline** (unavailable, unknown): the tile fades like the switch and value tiles – name, value
  and bar at 40 %, an "offline" badge top right instead of the watermark; the row is dimmed like every
  offline row, shows "offline" as value and "keine Meldung seit …" as status line.
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

Layout first; icon and watermark are only shown with `layout: tile`. Sections: *Value and range*,
*Colors* (single color and the color stops as a list with a dialog per entry), *Second value* and
*Actions*. With `style: change` the section *Reference and change* replaces colors and the second
value.
