# graphite-select

Picks one option of an `input_select` or `select`. Tapping an option calls `select_option`.
Two layouts:

- `segments` (default): a row of buttons with icon and name, e.g. a mode.
- `tiles`: a grid of tiles with icon top left and name bottom left, like
  [graphite-button](graphite-button.md). With `preview: theme` each tile shows a small preview of the
  Home Assistant theme the option names instead of the icon.

```yaml
type: custom:graphite-select
entity: input_select.theme_mode
options:
  - option: Automatisch
    name: Auto
    icon: mdi:brightness-6
  - option: Hell
    icon: mdi:white-balance-sunny
  - option: Dunkel
    icon: mdi:weather-night
```

A theme picker: the options of the helper are the names of Home Assistant themes.

```yaml
type: custom:graphite-select
entity: input_select.dark_theme
layout: tiles
preview: theme
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | – | Required. An `input_select` or `select`; its options are shown in their order. |
| `layout` | `segments` / `tiles` | `segments` | Look of the options. |
| `columns` | number | segments: all options, tiles: 4 | Options per row. |
| `preview` | `theme` | – | Tiles only: a preview of the theme the option names (ground, panel, a tile with "Aa" and an active tile with an accent dot). "Graphite " in front of a theme name is left out of the shown name. |
| `options` | list | – | Name and icon of single options: `option` (the value of the entity, exactly), `name`, `icon`. Options without an entry show their value and no icon. |

## Behaviour

- **Selected:** the option of the current state gets the accent tint of active tiles
  (`--graphite-tint-active`) and an accent icon; a theme tile also gets a check mark next to its name.
- **Theme preview:** the card reads the theme from `hass.themes` (the themes Home Assistant hands to
  the frontend) and sets its variables on the small preview only, so surfaces mixed from ground and ink
  look as in the theme itself. A theme with light and dark mode uses its dark mode, a light-only theme
  its light mode. An option that names no theme shows an empty frame. After reloading the themes the
  previews follow.
- **Unavailable:** the options are dimmed and do not react.
- **Keyboard:** the options are radio buttons; Enter or Space selects.
- **Hover and press:** Home Assistant's ripple in the tone of the theme, see [theme](theme.md).

## Grid size

Columns 12, rows auto.

## Editor

Entity, layout, columns and preview; the section *Options* holds the names and icons of single options.
