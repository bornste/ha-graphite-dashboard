# graphite-switch-row

A row with a toggle on the right: icon, name with a "since" line, and a switch. Tapping the row
switches the entity, holding it opens the more-info dialog. Shares all options and the look of
[graphite-status-row](graphite-status-row.md).

```yaml
type: custom:graphite-switch-row
entity: switch.coffee_machine
name: Coffee machine
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Entity to switch (switch, light, automation, input_boolean, …). |
| `name` | string | friendly name | Name of the row. |
| `icon` | icon | entity icon | Icon on the left. |
| `tap_action` | action | `toggle` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. |
| `since_line` | boolean | `true` | Shows "<state> seit <time>" below the name. |
| `since_attribute` | string | – | Timestamp attribute instead of the last state change, e.g. `last_triggered` of an automation → "ausgelöst vor 3 Std." / "noch nie ausgelöst". |
| `since_attribute_label` | string | "ausgelöst" | Word before the time of `since_attribute`. |
| `detail_entities` | list | – | While on, the line shows these values instead (entity ids or `{entity, label}`), e.g. CPU and memory of an app. |
| `online_entity` | entity id | – | While on, the icon pulses until the device is reachable, then lights up in the accent color. |

## Behaviour

- **On:** toggle in the accent color, accent tint of the row, name in medium weight, icon in accent.
- **Unavailable or unknown:** dimmed row, an "offline" badge instead of the toggle. Tapping does
  nothing (no hand cursor, no touch effect); holding still opens more-info.
- The toggle itself is only a display; the whole row is the switch.

```yaml
# automation with its last run
type: custom:graphite-switch-row
entity: automation.night_light
icon: mdi:weather-night
since_attribute: last_triggered

# app with resource usage while running
type: custom:graphite-switch-row
entity: switch.code_server
detail_entities:
  - entity: sensor.code_server_cpu
    label: CPU
  - entity: sensor.code_server_memory
    label: RAM
```

## Styling and editor

Same as [graphite-status-row](graphite-status-row.md); the toggle uses `--graphite-surface-track`
(off), `--graphite-accent` and `--graphite-accent-ink` (on).
