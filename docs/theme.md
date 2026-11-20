# Graphite theme

`config/themes/graphite/graphite.yaml` defines the theme **Graphite**. All graphite-cards read
these variables (`--graphite-*`); every card has the same values as fallback, so a missing token
never breaks a card. A variant only overrides the base inputs, everything else follows.

The file holds further themes built the same way: **Graphite Glass** (wallpaper, translucent outer
panels), **Graphite Salvia** (bottle green, yellow accent), **Graphite Midnight** (blue black, amber
accent), **Graphite Carbon** (carbon, turquoise accent) and the light themes **Graphite Lavender**
(lavender, berry accent) and **Graphite Sand** (sand, petrol accent). Lamps and scenes keep their own
colors in all of them; the accent only marks switches, states and highlights.

A light theme overrides the derived surfaces as well. Like in the dark themes every level gets lighter
from the ground inwards (what is closer is lighter): ground, panel with white mixed in, tiles almost
white. It defines its light colors for both modes (`light` and `dark`), so it also applies on a device
in dark mode.

| Token | Default | Use |
|---|---|---|
| `graphite-dialog-shadow` | `none` | Shadow of the dialog; the light themes use a light one to set it apart from the page |
| `graphite-dialog-backdrop` | ground at 40 % | Layer over the blurred dashboard behind a dialog; the light themes dim it (Lavender with its ink at 32 %, Sand with its darkened ground at 40 %) |
| `graphite-dialog-surface` | ground at 72 % | Glass of the dialog; the light themes use 85 %, so it stands out against the dimmed backdrop |
| `graphite-tile-shadow` | `none` | Shadow of tiles and rows, e.g. raised tiles of a light theme; a card's own focus ring or outline takes precedence |

## 1. Base inputs

| Token | Default | Use |
|---|---|---|
| `graphite-ground` | `#0a0a0b` | Darkest color, page background |
| `graphite-ink` | `#f3f3f4` | Lightest color, primary text; all surfaces mix ground and ink |
| `graphite-ink-rgb` | `243, 243, 244` | Ink as RGB triple (for Home Assistant's `rgb-primary-text-color`) |
| `graphite-accent` / `graphite-accent-ink` | `#f5c48a` / `#3a2410` | Highlights (on, alert) and text on accent |
| `graphite-accent-rgb` | `245, 196, 138` | Accent as RGB triple (for Home Assistant's `rgb-primary-color`) |
| `graphite-light-color` | `#f5c48a` | Lamps that are on and report no color; a lamp with a color (`rgb_color`, white temperatures included) tints its row or tile in that color, in every theme |
| `graphite-lamp-text-strength` | `100%` | Share of the lamp color in its icon and value (the rest is primary text); light themes use `50%` so a warm white stays readable |
| `graphite-success` / `graphite-success-ink` | `#a8d5a2` / `#17331a` | Second highlight color (e.g. visitor mode) |
| `graphite-danger` | `#e8908a` | Errors |
| `graphite-language` | `de` | Language of the card texts (`de`, `en`); remove to follow the Home Assistant language |

## 2. Derived surfaces and text

| Token | Use |
|---|---|
| `graphite-surface-page` | Page |
| `graphite-surface-panel` | Panels |
| `graphite-surface-tile` | Tiles and rows inside panels |
| `graphite-surface-tile-active` | Raised elements inside tiles |
| `graphite-surface-track` | Tracks, inactive switches and buttons |
| `graphite-text-primary` / `-secondary` / `-muted` | Text levels |
| `graphite-divider` | Thin dividers (translucent, Home Assistant `divider-color`) |
| `graphite-separator` | Thin lines: outline of a dialog, line under a scrolled dialog header, divider in the summary (opaque) |
| `graphite-overlay` | Pop-up background |

## 3. Layout

| Token | Default | Use |
|---|---|---|
| `graphite-radius-panel` | `20px` | Panel corners |
| `graphite-radius-tile` | `12px` | Tile corners |
| `graphite-radius-pill` | `999px` | Chips and pills |
| `graphite-gap-panel` | `16px` | Between panels (also mapped to the sections grid gaps) |
| `graphite-gap-tile` | `8px` | Between tiles in a panel |
| `graphite-padding-panel` | `16px` | Inside a panel |
| `graphite-title-size` / `-weight` / `-color` | `18px` / `400` / primary text | Panel and room card titles |

### Type scale

| Token | Default | Use |
|---|---|---|
| `graphite-font-value-size` / `graphite-font-value-weight` | `22px` / `300` | Measured values in tiles |
| `graphite-font-name-size` | `15px` | Names in rows |
| `graphite-font-tile-name-size` | name size | Names of tiles whose name is their main content (switch, button, scene, select) |
| `graphite-font-label-size` | `13px` | Names of tiles that show a value or a picture (meter, value, todo, …), status after titles, chips |
| `graphite-font-caption-size` | `12px` | Secondary lines ("seit 12 Min."), units in chips |

The size follows the role of a text, not the layout: a name that is the main content is a name (rows
and tiles alike), a name next to a value or a picture is a label.

Panel headers (graphite-panel and the cards that draw their own panels: battery, calendar, shopping,
vacuum) share one style: title and status on one baseline, no separator line.

### Sizes and inner spacing

| Token | Default | Use |
|---|---|---|
| `graphite-padding-tile` | `12px` | Inset of the content inside tiles (left, right, toggle top) |
| `graphite-gap-header` | `12px` | Between title and status, and below a header |
| `graphite-tile-height` | `80px` | Standard tiles |
| `graphite-tile-height-compact` | `72px` | Compact tiles (stopwatch, todo, image) |
| `graphite-tile-height-scene` | `64px` | Scene buttons |
| `graphite-tile-height-media` | `88px` | Tiles with a 64px picture (now playing, vacuum) |
| `graphite-row-height` | `60px` | Rows (status and switch rows) |
| `graphite-chip-padding` / `graphite-chip-gap` | `4px 10px` / `6px` | Chips in headers |
| `graphite-row-icon-size` | `24px` | Icons in rows |
| `graphite-watermark-inset` | `9px` | Watermark icon from the right edge (a full 34px glyph then sits on the 12px padding line) |
| `graphite-watermark-size` | `34px` | Watermark icons in tiles |
| `graphite-tint-active` | `10%` | Strength of the tint of active tiles and rows (accent, or the lamp color), the same in the dark themes; the light themes use 20 % (their active tiles are almost white) |
| `graphite-tint-alert` | `16%` | Stronger tint for warnings: alert chips, empty or offline batteries, highlighted calendar events, play time over the limit; 32 % in the light themes |

## 4. Home Assistant

The theme maps Home Assistant variables (`primary-background-color`, `card-background-color`,
`ha-card-*`, text colors, sections gaps) to the tokens above. Hover and press of tiles and buttons
(`ha-ripple-hover-color`, `ha-ripple-pressed-color`) use the ground with a quarter of ink instead of
grey, so they follow the tone of each theme; the accent stays reserved for active states.

The Home Assistant sidebar follows the theme as well: the selected entry uses the accent
(`sidebar-selected-icon-color`, `sidebar-selected-text-color`), and text on accent surfaces such as the
notification badge uses the accent ink (`text-accent-color`). Home Assistant's primary color (`primary-color`,
`rgb-primary-color` and the `ha-color-primary-05` to `-95` scale) is the accent too, so switches, buttons,
links and selections on the Home Assistant pages match the dashboard.

### Page background

The page (`lovelace-background`) is the ground with a soft glow from the bottom right corner, barely
lighter than the ground, under a fine grain. The grain is a small SVG noise inside the theme (no image
file); it also keeps the flat gradient free of banding. The glow stays in place while the page scrolls.

| Token | Default | Use |
|---|---|---|
| `graphite-glow-color` | ink (Lavender: accent, Sand: white) | Color the glow mixes into the ground |
| `graphite-glow-strength` | `4%` (Lavender and Sand 10 %) | Share of that color at the centre of the glow |
| `graphite-glow-size` | `80% 90%` | Width and height of the glow (ellipse) |
| `graphite-glow-position` | `100% 100%` | Centre of the glow on the screen (x y; `50% 0%` = middle of the top edge) |
| `graphite-noise` | SVG noise, 5 % | Grain layer over the page; `none` turns it off |

Graphite Glass keeps its wallpaper instead.

### Depth: fills, edges and shadows

Graphite is flat by default. A theme can add depth with these tokens; unset they cost nothing and the
cards look as before.

| Token | Default | Use |
|---|---|---|
| `graphite-panel-fill` | panel surface | Background of framed panels; a colour or a gradient (e.g. the top 2 % lighter) |
| `graphite-tile-fill` | tile surface | Background of tiles and rows; a colour or a gradient |
| `graphite-panel-shadow` | `none` | Shadow of framed panels; several layers allowed (an inset light line on top, a fine frame, a soft shadow) |
| `graphite-tile-shadow` | `none` | Shadow of tiles and rows, same idea |
| `graphite-edge-show` | – | `'""'` turns the gradient edge of tiles on (with `graphite-tile-edge`) |
| `graphite-tile-edge` / `graphite-panel-edge` | `none` | 1px edge painted with a gradient (tiles; outer panels), as Graphite Glass uses it |

The surface tokens (`graphite-surface-*`) stay plain colours, because the cards mix them for states and
hover; the fill tokens may be gradients built from them. Active and hovered tiles keep their solid
state colour. The own surfaces of graphite-battery, graphite-shopping and graphite-vacuum do not follow
the fill tokens yet.

Example (light line 10 %, fine dark frame 5 %, fine shadow 12 %, surfaces 2 % lighter at the top):

```yaml
graphite-depth-dark: "color-mix(in srgb, var(--graphite-ground) 55%, #000000)"
graphite-panel-fill: "linear-gradient(180deg, color-mix(in srgb, #ffffff 2%, var(--graphite-surface-panel)), var(--graphite-surface-panel))"
graphite-tile-fill: "linear-gradient(180deg, color-mix(in srgb, #ffffff 2%, var(--graphite-surface-tile)), var(--graphite-surface-tile))"
graphite-panel-shadow: "inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent), 0 0 0 1px color-mix(in srgb, var(--graphite-depth-dark) 5%, transparent), 0 1px 2px color-mix(in srgb, var(--graphite-depth-dark) 12%, transparent)"
graphite-tile-shadow: "inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent), 0 0 0 1px color-mix(in srgb, var(--graphite-depth-dark) 5%, transparent), 0 1px 2px color-mix(in srgb, var(--graphite-depth-dark) 12%, transparent)"
```
