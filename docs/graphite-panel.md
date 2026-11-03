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
on the right**. Without `title`, `info` and `chips` the header takes no space.

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | – | Title on the left (theme title style). |
| `info` | string | – | Status after the title, separated by a thin line. Plain text or a Jinja template (`{{ }}` / `{% %}`), rendered live in Home Assistant. An empty result hides the status and its line. |
| `info_alert` | condition | – | Shows the status in the accent color while the condition is met (see *Conditions*). Needs `entity`. |
| `chips` | list | – | Values as pills on the right, in list order (left to right), see below. |

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

### Conditions

Used by `info_alert` and the chip `alert`. All given parts must match; an unavailable or
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
| `variables` | map | – | CSS variables set on the panel and inherited by all child cards, e.g. `graphite-panel-child-surface: transparent`. The leading `--` is optional. |

`columns`, `min_column_width`, `gap` and `padding` apply to this panel only; nested panels keep
their own defaults.

A child card that hides itself (visibility conditions, cards that hide without content) collapses
its slot, so no empty gap remains.

## Styling

Theme variables used: `--graphite-surface-panel`, `--graphite-radius-panel`,
`--graphite-padding-panel`, `--graphite-gap-tile`, `--graphite-surface-tile`,
`--graphite-surface-tile-active`, `--graphite-radius-tile`, `--graphite-title-*`,
`--graphite-text-*`, `--graphite-separator`, `--graphite-accent`, `--graphite-radius-pill`.

Overrides (set via `variables` or on a parent):

| Variable | Effect |
|---|---|
| `--graphite-panel-surface` | Panel background |
| `--graphite-panel-radius` | Panel corner radius |
| `--graphite-panel-padding` | Panel padding |
| `--graphite-panel-gap` | Gap between child cards |
| `--graphite-panel-child-surface` | Tile surface passed to the children |
| `--graphite-panel-child-inner-surface` | Raised surface inside the children |
| `--graphite-panel-child-radius` | Tile radius passed to the children |

Context tokens passed to the child cards (not in frameless panels): `--graphite-card-surface`,
`--graphite-card-inner-surface`, `--graphite-card-radius`, and the standard `--ha-card-*`
variables. During the migration the panel also passes the old names `--sbo-card-*` for the
Bubble module and cards that are not moved yet.

## Editor

The visual editor edits the panel options in a form (conditions, chips and variables as YAML
fields) and the child cards with Home Assistant's own stack editor (tabs, card picker, card
editors). Empty optional values are not stored; `frame` is only stored when `false`.
The labels are translated (see *Language* in the [overview](README.md)).

## Grid size

In a sections view the panel takes the full width by default (`columns: 12`, `rows: auto`,
at least 3 columns).
