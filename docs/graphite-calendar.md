# graphite-calendar

Events of one or more calendar entities as a list, grouped by day ("Heute", "Morgen", "Freitag 6. November").
Every calendar has its own color and icon; keyword rules on the title can override them. Highlighted
events (e.g. exams) get a tint in their color and "in n Tagen". Made for a school calendar with
homework, exams and events, but works with any calendar. Usually placed inside a
[graphite-panel](graphite-panel.md), which gives it the title.

Two layouts: `list` (rows with icon, second line and time) and `compact` (one block per day, one line
per event), for calendars with many all-day entries such as homework. With `range: week` the card shows
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

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `calendars` | list | required | Calendar entities, each an entity id or `{entity, name, color, icon, highlight}`. `name` is shown in the second line (default: friendly name), `color` colors stripe and icon (default: accent), `icon` defaults to the entity icon. |
| `layout` | `list` \| `compact` | `list` | `list`: rows with icon, second line and time column. `compact`: one block per day, one line per event (see below). |
| `range` | `today` \| `this_week` \| `this_and_next_week` \| `days` \| `week` | `this_and_next_week` | Time range from today 00:00; `week` is a whole calendar week from Monday (see `week`). Weeks start on Monday and end on Sunday. |
| `days` | number | `14` | Number of days with `range: days`. |
| `week` | `current` \| `next` | `current` | Week shown with `range: week`. |
| `week_rollover` | string | – | With `range: week`: from this moment the following week counts as the current one, as `<day> <hh:mm>` with the day as `mon` … `sun`. `sat 00:00` switches in the night to Saturday. Without it the week changes on Monday 00:00. |
| `weekdays` | boolean | `false` | Compact layout: Monday to Friday are always shown (empty days with "–"), the weekend only with events. |
| `title` | string | – | Header of the card with a date range on the right. With `range: week` the header is automatic ("Diese Woche", "Nächste Woche"; after the rollover "Ab Montag", "In zwei Wochen"); `title` replaces the text. |
| `max_items` | number | – | Shows at most this many events; the rest appears as "+ n weitere bis …". |
| `show_past_today` | boolean | `true` | Keeps today's events that are over until midnight (dimmed, struck through, "vorbei"). With `false` they disappear as soon as they end. Earlier days of a `range: week` always stay (dimmed). |
| `rules` | list | – | Keyword rules `{starts_with \| contains, color, icon, highlight}`; the first rule whose text the title starts with or contains (case-insensitive, no regular expressions) overrides color, icon and highlight of the calendar. |
| `highlight_days` | number | `7` | Highlighted events get the tint only up to this many days ahead. |
| `secondary` | `calendar_location` \| `calendar` \| `location` \| `description` \| `none` | `calendar_location` | Content of the second line. Multi-day events add "bis Fr 13. Nov." unless `none`. |
| `empty_text` | string | "Keine Einträge bis …" | Text without events. |
| `hide_empty` | boolean | `false` | Hides the card without events. |
| `tap_action` | action | `more-info` | `more-info` opens the details of the event (title, time, calendar, location, description); other actions run on the event's calendar entity. |
| `hold_action` | action | `more-info` | Runs on the event's calendar entity (more-info of the calendar). With `tap_action` and `hold_action` both `none` the events are plain text (no pointer, not focusable). |

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

- **Days:** one block per day, weekday and date on the left; today in the accent color, earlier days
  of the week dimmed.
- **Events:** one line each, long titles wrap to two lines. No second line and no "ganztags"; timed
  events show their start time in front of the title, multi-day events "· bis Mi".
- **Colors:** a dot in the calendar or rule color (muted without a color). Titles colored by a rule
  (or highlighted) take that color and come first within the day, so exams stand out even when they
  are in the wrong calendar.
- **Header** (`range: week` or `title`): title and date range on one baseline with the separator line,
  same as the panel header ("Diese Woche | 9.–13. November"). The range runs Monday to Friday, to the
  weekend when it has events.

## Styling

List rows use the geometry of the status rows (`--graphite-row-height`, `--graphite-row-icon-size`,
`--graphite-font-name-size`, `--graphite-font-caption-size`), day headers `--graphite-font-label-size`.
The tint of highlighted events is 16 % of the event color. Compact day blocks are
`--graphite-row-height` high at least, with `--graphite-card-surface` and `--graphite-card-radius`; the
header uses `--graphite-title-size`, `--graphite-gap-header` and `--graphite-separator`.

## Editor

Layout, range, number of days (only with `range: days`), week and rollover (only with `range: week`),
title, max. events, second line and highlight days (list layout), weekdays (compact layout), past
events, empty text and actions as fields; `calendars` and `rules` are lists of objects and edited as
YAML.
