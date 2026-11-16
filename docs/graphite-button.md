# graphite-button

A plain button for any action: start a script, reload the themes, open a dialog, toggle something.
Three layouts with the same options:

- `tile` (default): a tile like the [switch tile](graphite-switch.md) – icon top left, name bottom left
  (a long name wraps to a second line, e.g. in a panel with three columns).
- `row`: a row like the [status rows](graphite-status.md) – icon, name.
- `icon`: a compact icon button (44 × 36px), the same as the header buttons of
  [graphite-panel](graphite-panel.md), but free to place; the name is its tooltip.

```yaml
type: custom:graphite-button
entity: script.reload_themes
name: Reload themes
icon: ic:twotone-palette
busy: true
```

Without an entity the button only does what its `tap_action` says:

```yaml
type: custom:graphite-button
layout: icon
name: Batteries
icon: ic:twotone-battery-5-bar
tap_action:
  action: navigate
  navigation_path: "#batteries"
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `layout` | `tile` / `row` / `icon` | `tile` | Look of the button. |
| `entity` | entity id | – | Optional. Decides the default tap action, the icon and the name; `busy` and `active` read it. |
| `name` | string | friendly name | Name (tile, row) or tooltip (icon button). |
| `icon` | icon | entity icon | Icon; without an entity `mdi:gesture-tap-button`. |
| `busy` | boolean | `false` | Accent tint and a spinner while the entity is `on` (e.g. a running script); the icon button shows the spinner instead of its icon. |
| `active` | condition | – | Filled in the accent while the condition is met (`entity` plus `state`, `above` or `below`, see the panel conditions). Without `entity` the button's entity is checked. A lamp that is on shows its own color instead of the accent. |
| `tap_action` | action | by entity | `script`, `scene`, `button`, `input_button` and `automation` are started (`turn_on`, `press`, `trigger`); lights, switches, `input_boolean`, fans, covers, media players, climate, sirens and humidifiers are toggled; other entities open more-info; without an entity nothing. |
| `hold_action` | action | `more-info` with `entity`, else `none` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **Active:** tile and row get the accent tint of active tiles (`--graphite-tint-active`) and an
  accent icon, the icon button is filled with the accent like an active header button.
- **Busy:** a small spinner (tile: top right, row: on the right, icon button: in place of the icon)
  and a light accent tint.
- **Unavailable:** with an entity that is unavailable the button is dimmed, shows the offline badge
  (tile, row) and does not react.
- **Hover and press:** Home Assistant's ripple in the tone of the theme, see [theme](theme.md).

## Grid size

| Layout | Columns | Rows |
|---|---|---|
| `tile` | 3 | 2 |
| `row` | 12 | auto |
| `icon` | 2 | 1 |

## Editor

Layout, entity, name and icon first, then the busy switch; *Active when* holds the condition,
*Actions* tap, hold and double tap.
