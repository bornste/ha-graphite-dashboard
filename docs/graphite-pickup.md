# graphite-pickup

The next waste collection of a calendar entity: a colored stripe (the bin color), the name, the day
as value and a hint on the right. Today and tomorrow are highlighted with a soft accent tint.

| Next collection | Value | Hint |
|---|---|---|
| today (until `drop_after`) | Heute | Abfuhr |
| tomorrow | Morgen | bereitstellen |
| later | Mi 12. | in 8 Tagen |
| none in the lookahead | – | – |

```yaml
type: custom:graphite-pickup
entity: calendar.paper_collection
name: Paper
icon: mdi:newspaper-variant-outline
color: "#9aa3ad"
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Calendar with the collection dates (`calendar.*`). |
| `name` | string | event title, else friendly name | Name below the stripe. |
| `icon` | icon | entity icon | Watermark icon top right. |
| `color` | CSS color | – | Color of the stripe (the tile is then 80px instead of 72px). |
| `drop_after` | `HH:MM` | `12:00` | From this time on, today's collection counts as done and the next one is shown. |
| `lookahead_days` | number | `40` | How far ahead the calendar is read. |
| `tap_action` | action | `more-info` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- The collection days come from the calendar API and are cached for 30 minutes (shared by all tiles
  of the same calendar); until they are loaded the `start_time` of the calendar entity is used.
- The weekday follows the Graphite language (`--graphite-language`).
