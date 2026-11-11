# graphite-dialog

A dialog (pop-up) that opens on a hash like `#lights` – from every view of the dashboard. All
dialogs of a dashboard live in one place, ideally a subview "Dialogs" that is not shown in the
navigation: there each dialog shows its content inline, so it can be edited with the dashboard
editor like any other card. The header is the one of [graphite-panel](graphite-panel.md): title,
status, dynamic status, chips and buttons, plus a close button.

```yaml
# a subview that holds the dialogs of the dashboard
title: Dialogs
path: dialogs
subview: true
type: sections
sections:
  - type: grid
    cards:
      - type: custom:graphite-dialog
        hash: "#windows"
        title: Windows & doors
        info: All closed
        summary:
          - entity: sensor.open_windows
            text: "{value} windows open"
            text_one: "1 window open"
            color: accent
        cards:
          - type: custom:graphite-panel
            title: Windows
            cards:
              - type: custom:graphite-status
                entity: binary_sensor.bedroom_window
              - type: custom:graphite-status
                entity: binary_sensor.office_window
```

Any navigation to the hash opens it, from every view:

```yaml
tap_action:
  action: navigate
  navigation_path: "#windows"
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `hash` | string | required | Opens the dialog, e.g. `#windows` (the `#` may be left out). Unique per dashboard. |
| `title` | string | – | Title on the left of the header. |
| `info` | string | – | Status after the title while no part of the dynamic status is shown. Text or Jinja template. |
| `summary` | list | – | Dynamic status from parts, see [graphite-panel](graphite-panel.md#dynamic-status). |
| `summary_mode` | `all` / `first` | `all` | `first`: only the first part that is shown. |
| `chips` | list | – | Values as pills in the header, see [graphite-panel](graphite-panel.md#chips). |
| `buttons` | list | – | Header buttons before the close button, e.g. "lights off", see [graphite-panel](graphite-panel.md#buttons). |
| `width` | string | `520px` | Width on large screens. |
| `layout` | `vertical` / `horizontal` / `grid` | `vertical` | Arrangement of the cards, like graphite-panel. |
| `columns` | number | `2` | Columns of the grid layout. |
| `min_column_width` | string | – | Responsive grid, e.g. `380px`: as many columns as fit, one on narrow screens. |
| `gap` | string | `16px` | Gap between the cards. |
| `cards` | list | required | Content of the dialog, usually graphite-panels (they keep their panel surface). |

Two rooms side by side on wide screens, one below the other on narrow ones:

```yaml
type: custom:graphite-dialog
hash: "#lights"
title: Lights
width: 760px
min_column_width: 320px
summary:
  - entity: sensor.lights_on
    text: "{value} lights on"
    text_one: "1 light on"
    color: accent
cards:
  - type: custom:graphite-panel
    title: Living room
    cards: [...]
  - type: custom:graphite-panel
    title: Bedroom
    cards: [...]
```

## Behaviour

- **Opening:** a navigation to the hash (tap action `navigate`, a link of
  [graphite-summary](graphite-summary.md), the browser address) opens the dialog above the
  current view. Loading a URL with the hash opens it directly. Hashes no graphite-dialog knows are
  ignored, so other pop-up cards keep working next to it.
- **Where the cards live:** Home Assistant only builds the current view. The dialog layer of the
  library therefore reads the dashboard configuration, finds the dialog with the hash anywhere in
  it and opens a copy. A subview is the recommended place; the dialog works from any view of the
  same dashboard.
- **Closing:** close button, a tap on the backdrop, Escape or the back button. A dialog opened by a
  navigation goes one step back in the history, so back button and close button do the same and a
  dialog opened from another dialog returns to it. A dialog loaded with the URL removes the hash.
- **Above the dialog:** Home Assistant's own dialogs (more-info) open above it; Escape closes them
  first. Cards can open their own detached dialogs above it, e.g. the event details of
  [graphite-calendar](graphite-calendar.md).
- **Scrolling:** the header stays, only the content scrolls; a thin line appears under the header
  once content runs below it. The page behind does not scroll.
- **Small screens:** below 600px the dialog is a bottom sheet over the full width that slides in
  from below. Drag it down at the handle or the header to close it (a quarter of its height or a
  fling); otherwise it springs back.
- **Inline:** where the card itself is placed (the dialogs subview) it shows the dialog with a thin
  outline and its hash above, without close button.
- **Motion:** opening zooms in (250 ms), closing zooms out faster (150 ms); the sheet slides. With
  *reduce motion* in the system settings the dialog only fades.

## Styling

The dialog is glass: `--graphite-ground` at 72 % with a blur behind it and a light edge at the top
(`--graphite-ink` at 10 %), no frame. The backdrop dims the dashboard (`--graphite-ground` at 40 %)
and blurs it. Corners `--graphite-radius-panel`, padding 16px, 16px between header and content;
the title has an optical inset of 4px. The close button is a header button (44 × 36px,
`--graphite-surface-tile`). The panels inside keep their surface, so the levels read
ground → panel → tile.

## Editor

The panel editor in dialog mode: the section *Dialog* first (hash, width), then *Header* (title,
status, dynamic status, chips, buttons) and *Layout* like a panel – without panel surface and
padding, a dialog has its own. The cards are edited with Home Assistant's stack editor below.
