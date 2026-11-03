# Graphite theme

`config/themes/graphite/graphite.yaml` defines the theme **Graphite**. All graphite-cards read
these variables (`--graphite-*`); every card has the same values as fallback, so a missing token
never breaks a card. A variant only overrides the base inputs, everything else follows.

## 1. Base inputs

| Token | Default | Use |
|---|---|---|
| `graphite-ground` | `#0a0a0b` | Darkest color, page background |
| `graphite-ink` | `#f3f3f4` | Lightest color, primary text; all surfaces mix ground and ink |
| `graphite-ink-rgb` | `243, 243, 244` | Ink as RGB triple (for Home Assistant's `rgb-primary-text-color`) |
| `graphite-accent` / `graphite-accent-ink` | `#f5c48a` / `#3a2410` | Highlights (on, alert) and text on accent |
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
| `graphite-separator` | Line between title and status (opaque) |
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
| `graphite-font-label-size` | `13px` | Tile names, status after titles, chips |
| `graphite-font-caption-size` | `12px` | Secondary lines ("seit 12 Min."), units in chips |

The status line after a title is tuned for a 13px font in a 16px line (position of the separator
line). Other sizes work, the separator may then need a small adjustment.

### Sizes and inner spacing

| Token | Default | Use |
|---|---|---|
| `graphite-padding-tile` | `12px` | Inset of the content inside tiles (left, right, toggle top) |
| `graphite-gap-header` | `12px` | Between title and status, and below a header |
| `graphite-tile-height` | `80px` | Standard tiles |
| `graphite-tile-height-compact` | `72px` | Compact tiles (stopwatch, todo, image, effect) |
| `graphite-tile-height-scene` | `64px` | Scene buttons |
| `graphite-tile-height-media` | `88px` | Tiles with a 64px picture (now playing, vacuum) |
| `graphite-row-height` | `60px` | Rows (status and switch rows) |
| `graphite-chip-padding` / `graphite-chip-gap` | `4px 10px` / `6px` | Chips in headers |
| `graphite-row-icon-size` | `24px` | Icons in rows |
| `graphite-watermark-size` | `34px` | Watermark icons in tiles |
| `graphite-tint-active` | `18%` | Strength of the accent tint of active tiles and rows |

## 4. Home Assistant and Bubble Card

The theme maps Home Assistant variables (`primary-background-color`, `card-background-color`,
`ha-card-*`, text colors, sections gaps) and the Bubble Card variables to the tokens above.

## 5. Legacy aliases

During the migration from the Bubble module the old names `--sbo-*` point to the new tokens.
They will be removed once nothing uses them. The theme is also published as **SBO Graphite**
with the same values until no view uses that name.
