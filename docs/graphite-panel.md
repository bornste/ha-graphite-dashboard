# graphite-panel

Groups any cards in one panel: a surface with an optional header and the child cards in a
vertical, horizontal or grid layout. Child cards automatically get the tile surface and radius
(context tokens), so standard Home Assistant cards and Graphite cards look like tiles inside it.

```yaml
type: custom:graphite-panel
title: Living room
info: 2 lights on
layout: grid
columns: 3
cards:
  - type: tile
    entity: light.living_room
  - type: tile
    entity: light.reading_lamp
```

## Header

Header rule of the Graphite style: **title and status on the left, values (chips) and buttons
on the right**. Without `title`, `info`, `chips` and `buttons` the header takes no space. With buttons
the header is as high as the buttons (36px); title and status stay centered on one baseline.

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Title on the left (theme title style). |
| `info` | string | – | Status after the title, separated by a thin line. Plain text or a Jinja template (`{{ }}` / `{% %}`), rendered live in Home Assistant. An empty result hides the status and its line. |
| `info_alert` | condition | – | Shows the status in the accent color while the condition is met (see *Conditions*). Needs `entity`. |
| `chips` | list | – | Values as pills on the right, in list order (left to right), see below. |
| `buttons` | list | – | Buttons at the far right (44 × 36px), e.g. "lights off" and settings of a room, see below. |

### Chips

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Entity whose state is shown. |
| `label` | string | – | Muted text before the value, e.g. `CO₂`. |
| `unit` | string | unit of the entity | Unit after the value; `""` hides it. |
| `decimals` | number | display precision of the entity | Decimal places for numeric states. |
| `muted` | boolean | `false` | Value in the secondary text color (for less important values). |
| `alert` | condition | – | Accent pill while the condition is met (see *Conditions*; `entity` is not needed). |
| `tap_action` | action / `none` | `more-info` | Action on tap. `none` makes the chip display-only (no hand cursor). Any Home Assistant action works. |

Unavailable or unknown states show `–`. Chips do not make the header taller.

```yaml
chips:
  - entity: sensor.living_room_humidity
    muted: true
    decimals: 0
  - entity: sensor.living_room_temperature
    decimals: 1
  - entity: sensor.living_room_co2
    label: CO₂
    alert:
      above: 1000
```

### Buttons

| Option | Type | Default | Description |
|---|---|---|---|
| `icon` | icon | entity icon | Icon of the button. |
| `entity` | entity id | – | A scene is activated on tap, other entities open more-info (unless `tap_action` is set). |
| `name` | string | friendly name | Tooltip and label for screen readers. |
| `active` | condition | – | Highlights the button (accent surface) while the condition is met, e.g. while lights are on. |
| `tap_action` | action | see `entity` | Action on tap. |

A room with scene tiles ([graphite-scene](graphite-scene.md)):

```yaml
type: custom:graphite-panel
title: Wohnen
info: "{% from 'graphite.jinja' import lightStatus %}{{ lightStatus('sensor.living_room_lights_on') }}"
info_alert: { entity: sensor.living_room_lights_on, above: 0 }
buttons:
  - entity: scene.living_room_off
    name: Licht aus
    active: { entity: sensor.living_room_lights_on, above: 0 }
  - icon: mdi:tune-variant
    name: Einstellungen
    tap_action: { action: navigate, navigation_path: "#living-room" }
layout: grid
columns: 4
cards:
  - type: custom:graphite-scene
    entity: scene.living_room_default
    name: Standard
    colors: ["#f5c48a", "#e89a5c", "#c9733f"]
    active: { entity: input_select.living_room_scenes, state: Standard }
```

### Conditions

Used by `info_alert`, the chip `alert` and the button `active`. All given parts must match; an unavailable or
unknown state never matches.

| Key | Description |
|---|---|
| `entity` | Entity to check (`info_alert` only; a chip checks its own entity). |
| `above` | Numeric state greater than this value. |
| `below` | Numeric state less than this value. |
| `state` | State equals this value, or one of a list of values. |

```yaml
info_alert:
  entity: binary_sensor.console_in_game
  state: "on"
```

## Layout

| Option | Type | Default | Description |
|---|---|---|---|
| `cards` | list | required | Child cards (any card type, visibility conditions work). |
| `layout` | `vertical` / `horizontal` / `grid` | `vertical` | Arrangement of the child cards. `horizontal` shares the width equally. |
| `columns` | number | `2` | Number of columns (`grid` only). |
| `min_column_width` | CSS length | – | Responsive grid: as many columns of at least this width as fit, one column on narrow screens (`grid` only, overrides `columns`). |
| `gap` | CSS length | `8px` (theme `--graphite-gap-tile`) | Space between the child cards. |
| `padding` | CSS length | `16px` (theme `--graphite-padding-panel`) | Inner padding of the panel. |
| `frame` | boolean | `true` | `false`: no surface, no padding, no rounded corners – the panel is only a layout container and passes no tile tokens to its children (useful for grids of panels). |

`columns`, `min_column_width`, `gap` and `padding` apply to this panel only; nested panels keep
their own defaults.

A child card that hides itself (visibility conditions, cards that hide without content) collapses
its slot, so no empty gap remains.

## Styling

Theme variables used: `--graphite-surface-panel`, `--graphite-radius-panel`,
`--graphite-padding-panel`, `--graphite-gap-tile`, `--graphite-surface-tile`,
`--graphite-surface-tile-active`, `--graphite-radius-tile`, `--graphite-title-*`,
`--graphite-text-*`, `--graphite-separator`, `--graphite-accent`, `--graphite-radius-pill`,
`--graphite-gap-header`, `--graphite-font-label-size`, `--graphite-font-caption-size`, `--graphite-chip-padding`,
`--graphite-chip-gap` (see [theme.md](theme.md)).

Context tokens passed to the child cards (not in frameless panels): `--graphite-card-surface`,
`--graphite-card-inner-surface`, `--graphite-card-radius`, and the standard `--ha-card-*`
variables. During the migration the panel also passes the old names `--sbo-card-*` for the
Bubble module and cards that are not moved yet.

## Editor

The visual editor groups the panel options in two expansion panels, *Header* and *Layout*; hints
are shown as helper texts below the fields. `info_alert` has its own fields (entity, above,
below, state), `chips` and `buttons` are edited as lists with a dialog per entry, including the chip
`alert` and the button `active`; no option needs YAML. `columns` and `min_column_width` are only
shown for the grid layout. The child cards are edited with Home Assistant's own stack editor
(tabs, card picker, card editors). Empty optional values are not stored; `frame` is only stored
when `false`. The labels are translated (see *Language* in the [overview](README.md)).

## Grid size

In a sections view the panel takes the full width by default (`columns: 12`, `rows: auto`,
at least 3 columns).
