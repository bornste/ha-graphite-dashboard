# graphite-switch-tile

A tile for sockets and devices: toggle top left, name bottom left, the icon as a large watermark
bottom right. Tapping the tile switches the entity, holding it opens the more-info dialog.
Inside a [graphite-panel](graphite-panel.md) several tiles sit side by side (`layout: horizontal`).

```yaml
type: custom:graphite-switch-tile
entity: switch.game_console
name: Console
icon: mdi:controller
online_entity: binary_sensor.game_console_online
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Entity to switch (switch, light, input_boolean, …). |
| `name` | string | friendly name | Name bottom left. |
| `icon` | icon | entity icon | Watermark icon bottom right. |
| `online_entity` | entity id | – | Device behind the switch (ping, device tracker, …). While switched on, the watermark pulses until this entity is `on`, `home`, `online` or `connected`, then lights up in the accent color. |
| `tap_action` | action | `toggle` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). `none` disables it. |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **On:** toggle in the accent color, accent tint of the tile, name in medium weight, stronger watermark.
- **Unavailable or unknown:** the tile fades into the panel, an "offline" badge top right instead of
  the toggle. Tapping does nothing; holding still opens more-info.
- The toggle itself is only a display; the whole tile is the switch.

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height` | `80px` | Height of the tile. |
| `--graphite-watermark-size` | `34px` | Size of the watermark icon. |
| `--graphite-font-label` | `13px` | Font size of the name. |
| `--graphite-tint-active` | `18%` | Strength of the accent tint while on. |
| `--graphite-card-surface`, `--graphite-card-radius` | tile surface, `12px` | Set by the panel for its children. |

## Editor

Entity, name, icon, online entity and the three actions.
