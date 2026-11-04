# graphite-stopwatch

The elapsed time of a [Stopwatch Plus](https://github.com/bornste/ha-stopwatch-plus) sensor as a tile:
name on top, the time (`h:mm h`) at the bottom, on the right the status or – with a daily limit – the
remaining or extra time. The tile ticks on its own while the stopwatch runs.

```yaml
type: custom:graphite-stopwatch
entity: sensor.player_two_playing_time
name: Player two
icon: mdi:controller
picture_entity: image.player_two_picture
limit:
  weekday: input_number.player_two_limit_weekday   # minutes, adjustable as a helper
  weekend: 120
hold_action:
  action: perform-action
  perform_action: stopwatch_plus.reset
  target:
    entity_id: sensor.player_two_playing_time
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Stopwatch Plus sensor (uses `status`, `accumulated_seconds`, `running_since`). |
| `name` | string | friendly name | Name on top. |
| `icon` | icon | entity icon | Watermark icon top right, or the icon on the left (`icon_position: left`). |
| `icon_position` | `watermark` \| `left` | `watermark` | `left`: the icon sits on the left like in the rows, the text moves to 60px. |
| `picture_entity` | entity id | – | Entity with an `entity_picture` (e.g. a gamer picture): round picture on the left, the watermark icon stays. |
| `color` | CSS color | – | Short color stripe on top (the tile is then 80px instead of 72px). |
| `limit` | number, entity or map | – | Daily limit: minutes (`90`), an entity (`input_number.limit`, its unit `h` is converted, otherwise minutes) or per day: `weekday`, `weekend`, `mon` … `sun` with numbers or entities (a single day wins over `weekday`/`weekend`). |
| `warn_before` | number | `10` | Minutes before the limit from which the remaining time is emphasized (while running). |
| `day_start` | `HH:MM` | `03:00` | Start of the day for the per-day limit (a late Saturday evening still counts as Saturday). |
| `tap_action` | action | `none` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms), e.g. reset or pause the stopwatch. |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **Running:** accent tint, name in primary, the status ("läuft") or the remaining time in accent.
  Paused or stopped tiles stay neutral ("pausiert" or nothing).
- **With a limit:** only "noch 12 Min." or "+38 Min." on the right; close to the limit (`warn_before`)
  it is emphasized, over the limit the time is in accent too and a running tile gets a stronger tint.

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height-compact` / `--graphite-tile-height` | `72px` / `80px` | Height without / with the color stripe. |
| `--graphite-tint-active` | `18%` | Tint while running. |
| `--graphite-tint-alert` | `28%` | Tint while running over the limit. |
| `--graphite-watermark-size` | `34px` | Watermark icon. |
