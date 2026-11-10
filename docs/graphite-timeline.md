# graphite-timeline

What ran when: one row per entity – e.g. the game someone plays or the app on the TV – with a bar
per state over the chosen period and the total on the right. Short interruptions are bridged, so a
sensor that drops to `unknown` for a moment, or a screensaver between two Plex phases, does not split
the bar. Usually placed inside a [graphite-panel](graphite-panel.md), which gives it the title.

```yaml
type: custom:graphite-panel
title: Verlauf
cards:
  - type: custom:graphite-timeline
    entities:
      - entity: sensor.player_one_game
        name: Spieler 1
      - entity: sensor.player_two_game
        name: Spieler 2
      - entity: sensor.tv_app
        name: TV
        color: var(--graphite-text-secondary)
        ignore_states: [Home, Screensaver]
    default_interval: 4h
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entities` | list | required | Entity ids or `{entity, name, color, state_colors, ignore_states}`. `color` colors the bars of the row (default: accent), `state_colors` single states (`{Plex: "#e5a00d"}`), `ignore_states` further states without a bar for this row. |
| `intervals` | list | `[4h, 8h, 12h, 24h, 3d, 7d]` | Periods of the picker (`h` hours, `d` days). |
| `default_interval` | string | first interval | Period shown first. |
| `show_picker` | boolean | `true` | Shows the period picker. |
| `bridge` | string | `5m` | Interruptions up to this long are bridged (`30s`, `5m`, `1h`; `0m` turns it off). |
| `ignore_states` | list | – | States without a bar for every row, on top of `unknown`, `unavailable`, `off`, `none`, `idle`, `standby` and an empty state. |
| `show_total` | boolean | `true` | Total time of the bars per row on the right. |

## Behaviour

- **Bars:** every state except the inactive ones is a bar, labelled with the state (e.g. the game)
  when it has room. Consecutive equal states form one bar.
- **Bridging:** two bars of the same state with a gap up to `bridge` become one; a short bar of
  another state between them (up to `bridge`, e.g. a screensaver) is absorbed as well. The total
  counts the bridged bars.
- **Details:** hover or tap a bar – the line below the chart shows name, state, time and duration
  ("Spieler 2 · Block World · 18:09–19:46 · 1:37 h"). It clears itself after a few seconds, on leaving
  the chart or on a tap next to the bars; there is nothing to close. Without a selection the line shows
  the period.
- **Data:** the history API (`history/period`, without attributes), fetched again every 5 minutes and
  when an entity changes; the window moves on every minute. Home Assistant keeps 10 days of history by
  default, enough for `7d`.
- **Axis:** whole hours (1, 2, 3 or 6 hours apart) up to 24 hours, weekdays beyond.

## Styling

The picker buttons are 36px high like the panel buttons (`--graphite-radius-tile`, active
`--graphite-surface-tile-active`), the chart sits on `--graphite-card-surface`, bars are 26px high with
half the tile radius, names and the info line use `--graphite-font-caption-size`, totals
`--graphite-font-label-size`.

## Editor

Start period, bridge time and the switches as fields; `entities`, `intervals` and `ignore_states` are
lists and edited as YAML.
