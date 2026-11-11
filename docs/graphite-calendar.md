# graphite-calendar

Events of one or more calendar entities as a list, grouped by day ("Heute", "Morgen", "Freitag 6. November").
Every calendar has its own color and icon; keyword rules on the title can override them. Highlighted
events (e.g. exams) get a tint in their color and "in n Tagen". Made for a school calendar with
homework, exams and events, but works with any calendar. Usually placed inside a
[graphite-panel](graphite-panel.md), which gives it the title.

Three layouts: `list` (rows with icon, second line and time), `compact` (one block per day, one line
per event), for calendars with many all-day entries such as homework, and `tiles` (two tiles: the
events of today and when the next highlighted event is, e.g. to open a pop-up).
Events with a description show a small note icon behind the title. With `range: week` the card shows
a fixed calendar week and its own header ("Diese Woche | 9.–13. November").

```yaml
type: custom:graphite-panel
title: Schule
cards:
  - type: custom:graphite-calendar
    calendars:
      - entity: calendar.school_homework
        name: Hausaufgaben
        color: "#8ab8f5"
        icon: mdi:pencil-outline
      - entity: calendar.school_exams
        name: Prüfungen
        color: "#e8908a"
        icon: mdi:alert-outline
        highlight: true
      - calendar.school_events
    range: this_and_next_week
    max_items: 10
```

### Two weeks side by side (compact)

This week on the left, next week on the right; from the night to Saturday both columns move on by one
week ("Ab Montag" and "In zwei Wochen"). Exams are colored by a rule, no matter which calendar the
teacher used.

```yaml
type: custom:graphite-panel
layout: horizontal
frame: false
cards:
  - type: custom:graphite-panel
    cards:
      - type: custom:graphite-calendar
        calendars: [calendar.school_homework, calendar.school_events]
        layout: compact
        range: week
        week: current
        week_rollover: sat 00:00
        weekdays: true
        rules:
          - contains: Test
            color: "#e8908a"
  - type: custom:graphite-panel
    cards:
      - type: custom:graphite-calendar
        calendars: [calendar.school_homework, calendar.school_events]
        layout: compact
        range: week
        week: next
        week_rollover: sat 00:00
        weekdays: true
        rules:
          - contains: Test
            color: "#e8908a"
```

### Tiles: today and the next exam

```yaml
type: custom:graphite-panel
title: Schule
cards:
  - type: custom:graphite-calendar
    calendars: [calendar.school_homework, calendar.school_events]
    layout: tiles
    icon: mdi:school-outline
    weekdays: true
    day_switch: "15:00"
    rules:
      - contains_any: [Test, Prüfung]
        color: "#e8908a"
        highlight: true
    tap_action:
      action: navigate
      navigation_path: "#school"
    hold_action:
      action: none
```

Left "Heute – 3 Einträge – morgen 6", right "Prüfung – morgen – MU" (tinted red when the exam is
today or tomorrow).

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `calendars` | list | required | Calendar entities, each an entity id or `{entity, name, color, icon, highlight}`. `name` is shown in the second line (default: friendly name), `color` colors stripe and icon (default: accent), `icon` defaults to the entity icon. |
| `layout` | `list` \| `compact` \| `tiles` | `list` | `list`: rows with icon, second line and time column. `compact`: one block per day, one line per event. `tiles`: two tiles (see below). |
| `range` | `today` \| `this_week` \| `this_and_next_week` \| `days` \| `week` | `this_and_next_week` | Time range from today 00:00; `week` is a whole calendar week from Monday (see `week`). Weeks start on Monday and end on Sunday. |
| `days` | number | `14` | Number of days with `range: days`. |
| `week` | `current` \| `next` | `current` | Week shown with `range: week`. |
| `week_rollover` | string | – | With `range: week`: from this moment the following week counts as the current one, as `<day> <hh:mm>` with the day as `mon` … `sun`. `sat 00:00` switches in the night to Saturday. Without it the week changes on Monday 00:00. |
| `weekdays` | boolean | `false` | Compact layout: Monday to Friday are always shown (empty days with "–"), the weekend only with events. Tiles layout: the next day is the next weekday (Friday: Monday), and an empty weekend day is skipped. |
| `icon` | icon | calendar icon | Tiles layout: watermark of the day tile. |
| `highlight_name` | string | "Prüfung" | Tiles layout: name of the highlight tile. |
| `day_switch` | string | – | Tiles layout: from this time (`hh:mm`, e.g. `"15:00"`) the day tile shows the next (school) day. |
| `title` | string | – | Header of the card with a date range on the right. With `range: week` the header is automatic ("Diese Woche", "Nächste Woche"; after the rollover "Ab Montag", "In zwei Wochen"); `title` replaces the text. |
| `max_items` | number | – | Shows at most this many events; the rest appears as "+ n weitere bis …". |
| `show_past_today` | boolean | `true` | Keeps today's events that are over until midnight (dimmed, struck through, "vorbei"). With `false` they disappear as soon as they end. Earlier days of a `range: week` always stay (dimmed). |
| `rules` | list | – | Keyword rules `{name, starts_with, contains, contains_any, contains_all, color, icon, highlight}`. `name` is only a label for the list in the editor. `contains_any` and `contains_all` take a list of words (the title contains at least one / all of them). A rule matches when every criterion it sets matches (case-insensitive, no regular expressions); the first matching rule overrides color, icon and highlight of the calendar. |
| `highlight_days` | number | `7` | Highlighted events get the tint only up to this many days ahead. |
| `secondary` | `calendar_location` \| `calendar` \| `location` \| `description` \| `none` | `calendar_location` | Content of the second line. Multi-day events add "bis Fr 13. Nov." unless `none`. |
| `empty_text` | string | "Keine Einträge bis …" | Text without events. |
| `hide_empty` | boolean | `false` | Hides the card without events. |
| `tap_action` | action | `more-info` | `more-info` opens the details of the event (title, time, calendar, location, description) in a [graphite-dialog](graphite-dialog.md), also above a dialog the calendar sits in; other actions run on the event's calendar entity. |
| `hold_action` | action | `more-info` | Runs on the event's calendar entity (more-info of the calendar). With `tap_action` and `hold_action` both `none` the events are plain text (no pointer, not focusable). Events with a description show a note icon either way. |

## Behaviour

- **Days:** days without events are left out. The first day of the next week gets "· nächste Woche"
  when the list also shows days of this week.
- **Order:** per day timed events by start time, then all-day events.
- **Right column:** start and end time ("08:00–15:30"); only the start when a hint is shown below it
  ("vorbei", "in 2 Tagen"); "ganztags" for all-day events; "5 Tage" for multi-day events.
- **Multi-day events** are listed once: on their first day, or under "Heute" while they are running.
- **Running events** show their time in the accent color.
- **Data:** the calendar API (`calendars/<entity>?start=…&end=…`), cached per calendar for 5 minutes;
  the list re-renders every minute (past and running events, day change).

## Compact layout

- **Days:** one block per day with a small calendar sheet on the left: the weekday large ("MI"), the
  date small in the band above ("11"), since in a school week the weekday matters more than the
  date. Today in the accent color, earlier days of the week dimmed. The sheet is 42px like the row
  icons, 9px from the edge, with `--graphite-radius-tile`. Events of a day are `--graphite-gap-tile`
  apart.
- **Events:** one line each, long titles wrap to two lines. No second line and no "ganztags"; timed
  events show their start time in front of the title, multi-day events "· bis Mi".
- **Colors:** a dot in the calendar or rule color (muted without a color). Titles colored by a rule
  (or highlighted) take that color and come first within the day, so exams stand out even when they
  are in the wrong calendar.
- **Header** (`range: week` or `title`): title and date range on one baseline with the separator line,
  same as the panel header ("Diese Woche | 9.–13. November"). The range runs Monday to Friday, to the
  weekend when it has events.

## Tiles layout

- **Day tile:** name "Heute" (from `day_switch` on "Morgen" or the weekday), the number of events
  ("3 Einträge") and on the right the following day ("morgen 6", "Mo 2").
  The watermark is `icon`.
- **Highlight tile:** the next highlighted event within `highlight_days` (`highlight: true` on a
  calendar or rule): "heute", "morgen" or "in 3 Tagen", on the right its subject (first word of the
  title, "MU: LZK Instrumentenkunde" → "MU"). Today or tomorrow the tile is tinted in the event color.
  Without one: "keine" and "7 Tage".
- **Geometry:** the label tiles (stopwatch, todo): `--graphite-tile-height-compact`, name top left,
  value `--graphite-font-value-size` (words `--graphite-font-value-text-size`), watermark top right.
- **Actions:** both tiles are one button; `tap_action` and `hold_action` run on the first calendar
  (e.g. `navigate` to a pop-up).

## Styling

List rows use the geometry of the status rows (`--graphite-row-height`, `--graphite-row-icon-size`,
`--graphite-font-name-size`, `--graphite-font-caption-size`), day headers `--graphite-font-label-size`.
The tint of highlighted events is 16 % of the event color. Compact day blocks are
`--graphite-row-height` high at least, with `--graphite-card-surface` and `--graphite-card-radius`; the
header uses `--graphite-title-size`, `--graphite-gap-header` and `--graphite-separator`.

## Editor

`calendars` and `rules` are lists with a dialog per entry. Layout and range first, with the number of
days (only `range: days`) and week and rollover (only `range: week`); the tile options in the section
*Tiles* (tiles layout), title, max. events, second line, highlight days, weekdays, past events and
empty text in *Display*, the actions in *Actions*.
