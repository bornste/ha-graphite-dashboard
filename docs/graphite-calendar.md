# graphite-calendar

Events of one or more calendar entities as a list, grouped by day ("Heute", "Morgen", "Freitag 6. November").
Every calendar has its own color and icon; keyword rules on the title can override them. Highlighted
events (e.g. exams) get a tint in their color and "in n Tagen". Made for a school calendar with
homework, exams and events, but works with any calendar. Usually placed inside a
[graphite-panel](graphite-panel.md), which gives it the title.

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

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `calendars` | list | required | Calendar entities, each an entity id or `{entity, name, color, icon, highlight}`. `name` is shown in the second line (default: friendly name), `color` colors stripe and icon (default: accent), `icon` defaults to the entity icon. |
| `range` | `today` \| `this_week` \| `this_and_next_week` \| `days` | `this_and_next_week` | Time range from today 00:00. Weeks start on Monday and end on Sunday. |
| `days` | number | `14` | Number of days with `range: days`. |
| `max_items` | number | – | Shows at most this many events; the rest appears as "+ n weitere bis …". |
| `show_past_today` | boolean | `true` | Keeps today's events that are over until midnight (dimmed, struck through, "vorbei"). With `false` they disappear as soon as they end. |
| `rules` | list | – | Keyword rules `{starts_with \| contains, color, icon, highlight}`; the first rule whose text the title starts with or contains (case-insensitive, no regular expressions) overrides color, icon and highlight of the calendar. |
| `highlight_days` | number | `7` | Highlighted events get the tint only up to this many days ahead. |
| `secondary` | `calendar_location` \| `calendar` \| `location` \| `description` \| `none` | `calendar_location` | Content of the second line. Multi-day events add "bis Fr 13. Nov." unless `none`. |
| `empty_text` | string | "Keine Einträge bis …" | Text without events. |
| `hide_empty` | boolean | `false` | Hides the card without events. |
| `tap_action` | action | `more-info` | `more-info` opens the details of the event (title, time, calendar, location, description); other actions run on the event's calendar entity. |
| `hold_action` | action | `more-info` | Runs on the event's calendar entity (more-info of the calendar). |

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

## Styling

Rows use the geometry of the status rows (`--graphite-row-height`, `--graphite-row-icon-size`,
`--graphite-font-name-size`, `--graphite-font-caption-size`), day headers `--graphite-font-label-size`.
The tint of highlighted events is 16 % of the event color.

## Editor

Range, number of days (only with `range: days`), max. events, second line, highlight days, past events,
empty text and actions as fields; `calendars` and `rules` are lists of objects and edited as YAML.
There is only one layout, so the editor shows no layout field.
