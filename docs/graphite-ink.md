# graphite-ink

A printer with its cartridges: the name top left, the status bottom left and one small tank per
cartridge on the right that fills from the bottom. The tank track keeps a tint of the ink color, so
an empty cartridge still shows which color it is.

```yaml
type: custom:graphite-ink
entity: sensor.office_printer
name: Printer
cartridges:
  - sensor.office_printer_black
  - sensor.office_printer_cyan
  - sensor.office_printer_magenta
  - sensor.office_printer_yellow
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | – | Printer status entity: its state is shown while all cartridges are fine, unavailable means offline. |
| `name` | string | friendly name, else "Drucker" / "Printer" | Name top left. |
| `cartridges` | list | required | Level sensors in % (entity ids or `{entity, color}`). Colors are guessed from the entity id (cyan, magenta, yellow, gray, else light for black). |
| `low_level` | number | `20` | Below this level a cartridge counts as soon empty. |
| `tap_action` | action | `none` | Action on tap. |
| `hold_action` | action | `more-info` with `entity`, else `none` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

| State | Value | Look |
|---|---|---|
| All fine | Printer state ("Bereit", "Druckt", "Gestoppt", else the Home Assistant state) | neutral |
| Soon empty | Number of cartridges + "bald leer" | unit in accent |
| Empty | Number of empty cartridges + "leer" | accent tint, name primary, unit in accent |
| Offline | "offline" (printer unavailable or no cartridge reports a level) | faded surface and content |

Hovering a tank shows the cartridge name and its level.
