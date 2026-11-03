# graphite-status-row

A display row in full width: icon on the left, the name with a "since" line below it, the state
as value on the right. Made for lists inside a [graphite-panel](graphite-panel.md) – windows,
lamps, sensors, presence. Its sibling with a toggle is [graphite-switch-row](graphite-switch-row.md).

```yaml
type: custom:graphite-status-row
entity: binary_sensor.bedroom_window
name: Bedroom window
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Entity shown in the row. |
| `name` | string | friendly name | Name of the row. |
| `icon` | icon | entity icon | Icon on the left. Without `icon` the state icon of the entity is used (e.g. open/closed window). |
| `tap_action` | action | `none` | Action on tap. Without a tap or double tap action the row looks display-only: no hand cursor, no touch effect (holding still opens more-info). |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. A tap waits for a possible second tap only when this is set. |
| `since_line` | boolean | `true`, `false` for measured values | Shows "<state> seit <time>" below the name, e.g. "offen seit 12 Min.". Measured values (entities with a unit) change all the time and have no line by default. |
| `since_attribute` | string | – | Timestamp attribute shown instead of the last state change, e.g. `last_triggered` → "ausgelöst vor 3 Std." or "noch nie ausgelöst". |
| `since_attribute_label` | string | "ausgelöst" | Word before the time of `since_attribute`. |
| `detail_entities` | list | – | While the entity is active (not `off`, not unavailable) the line shows these values instead, joined by " · ". Each entry is an entity id or `{entity, label}`, e.g. "CPU 0.4 % · RAM 1.2 %". Unavailable values are left out. |
| `online_entity` | entity id | – | While the entity is `on`, the icon pulses until this entity reports `on`/`home`/`online`/`connected`, then it lights up in the accent color. |
| `wall_switch` | boolean | `false` | Lamp on a wall switch: unavailable counts as off. Instead of the offline badge the value says "Aus" and the line "aus am Wandschalter seit …". |

## Behaviour

- **Active** (`on`, `open`, `opening`, `closing`, `home`, `playing`, `active`, `running`, numbers
  above 0): accent tint, name in medium weight, icon and value in the accent color.
- **Measured values** (entities with `unit_of_measurement`) are never tinted.
- **Unavailable or unknown:** the row is dimmed (surface 40 %, text and icon 40 %), the value is
  replaced by an "offline" badge, the line says "keine Meldung seit …" (not for `wall_switch`).
- The value is the state as Home Assistant formats it (translated, with unit).
- Relative times update every minute.

## Styling

Size and type come from the theme: `--graphite-row-height` (60px), `--graphite-font-name` (15px),
`--graphite-font-caption` (12px), `--graphite-icon-size` (24px). The surface follows the panel
(`--graphite-card-surface`, `--graphite-card-radius`); the active tint is
`--graphite-tint-active` (18 %) of `--graphite-accent`. See [theme.md](theme.md).

The icon sits in a 42px box at 9px from the edge, the text starts at 60px: a 20px glyph is then
centered between edge and text.

## Editor

All options in one form; actions use Home Assistant's action selector, `detail_entities` is a
YAML field. Empty values are not stored; `wall_switch` only when on.
