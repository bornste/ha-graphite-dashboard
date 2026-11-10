# graphite-switch

A switch for sockets, lamps, automations and apps – as a full-width row (default) or as a tile.
Tapping switches the entity, holding opens the more-info dialog. Switch between the two looks with
`layout`; all other options stay the same.

| Layout | Look | Good for |
|---|---|---|
| `row` (default) | Icon on the left, the name with a "since" line, the toggle on the right. Same look as [graphite-status](graphite-status.md). | Lists inside a [graphite-panel](graphite-panel.md). |
| `tile` | Toggle top left, name bottom left, the icon as a large watermark bottom right. | Several devices side by side (panel with `layout: horizontal`). |

```yaml
type: custom:graphite-switch
entity: switch.coffee_machine
name: Coffee machine
```

```yaml
type: custom:graphite-switch
layout: tile
entity: switch.game_console
name: Console
icon: mdi:controller
online_entity: binary_sensor.game_console_online
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Entity to switch (switch, light, automation, input_boolean, …). |
| `layout` | `row` \| `tile` | `row` | Look, see above. |
| `name` | string | friendly name | Name of the row or tile. |
| `icon` | icon | entity icon | Icon on the left (row) or watermark bottom right (tile). |
| `online_entity` | entity id | – | Device behind the switch (ping, device tracker, …). While switched on, the icon pulses until this entity is `on`, `home`, `online` or `connected`, then lights up in the accent color. |
| `tap_action` | action | `toggle` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. |

Only in the row layout:

| Option | Type | Default | Description |
|---|---|---|---|
| `since_line` | boolean | `true` | Shows "<state> seit <time>" below the name. |
| `since_attribute` | string | – | Timestamp attribute instead of the last state change, e.g. `last_triggered` of an automation → "ausgelöst vor 3 Std." / "noch nie ausgelöst". |
| `since_attribute_label` | string | "ausgelöst" | Word before the time of `since_attribute`. |
| `detail_entities` | list | – | While on, the line shows these values instead (entity ids or `{entity, label}`), e.g. CPU and memory of an app. |

## Behaviour

- **On:** toggle in the accent color, accent tint, name in medium weight, icon in accent (row) or a
  stronger watermark (tile).
- **Unavailable or unknown:** the row is dimmed, the tile fades into the panel; an "offline" badge
  replaces the toggle. Tapping does nothing (no hand cursor, no touch effect); holding still opens
  more-info.
- The toggle itself is only a display; the whole row or tile is the switch.

```yaml
# automation with its last run
type: custom:graphite-switch
entity: automation.night_light
icon: mdi:weather-night
since_attribute: last_triggered

# app with resource usage while running
type: custom:graphite-switch
entity: switch.code_server
detail_entities:
  - entity: sensor.code_server_cpu
    label: CPU
  - entity: sensor.code_server_memory
    label: RAM
```

## Styling

The row uses the same variables as [graphite-status](graphite-status.md); the toggle uses
`--graphite-surface-track` (off), `--graphite-accent` and `--graphite-accent-ink` (on). The tile:

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height` | `80px` | Height of the tile. |
| `--graphite-watermark-size` | `34px` | Size of the watermark icon. |
| `--graphite-font-label-size` | `13px` | Font size of the name. |
| `--graphite-tint-active` | `18%` | Strength of the accent tint while on. |
| `--graphite-card-surface`, `--graphite-card-radius` | tile surface, `12px` | Set by the panel for its children. |

## Editor

Layout first; the row-only sections (second line, detail values) are only shown with `layout: row`.
