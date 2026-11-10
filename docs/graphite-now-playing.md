# graphite-now-playing

What runs on the most important media device, in the pattern of the label tiles: cover or app
image on the left (a calm monogram without one), the device as label (13px), the title as value
(20px / 300), a line with details and the running time, a progress bar for media with
a duration and the source icon as watermark top right. The sources are checked in order and the
first one that runs is shown, so the order sets the priority (e.g. a game before a console home
screen before the TV). Without a running source the card hides itself. Display only, no actions.

```yaml
type: custom:graphite-now-playing
sources:
  - entity: media_player.game_console         # a game, with title and cover from the console
    name: Console
    icon: mdi:controller
  - entity: media_player.game_console         # the console menu: shown with a fixed text
    name: Console
    icon: mdi:controller
    states: [idle]
    fallback_title: Startseite
  - entity: media_player.tv
    name: TV
    icon: mdi:television
    titles: { Home: Startbildschirm }
```

## Source options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Media player, binary sensor or any entity whose state says that it runs. |
| `name` | string | friendly name | Label above the title (the device, e.g. "XBOX"). |
| `icon` | icon | entity icon | Watermark top right. |
| `states` | list | `on`, `playing`, `paused`, `buffering` | States that count as running, e.g. `[idle]` for a console menu. |
| `requires` | entity id or list | – | Entities that must run too (e.g. the console next to a profile sensor). |
| `title_entity` | entity id | – | Entity whose state is the title (e.g. the game a profile plays); otherwise `media_title`, then `app_name`. |
| `image_entity` | entity id | – | `image.*` entity, or a helper whose state is an image path. Used after the media player's own cover. |
| `images` | map | – | Image per title or app name, e.g. `{ Netflix: /local/apps/netflix.png }`. |
| `subtitle` | text | – | Second line from attributes of the title entity, e.g. `"{progress} abgeschlossen ({gamerscore})"`; left out while a placeholder has no value. |
| `titles` | map | – | Readable names for raw titles or app names, e.g. `{ Home: Startbildschirm }`. A title listed here is shown even if it is ignored otherwise. |
| `ignore_titles` | list | `off`, `standby`, `home`, `screensaver`, `unknown`, `unavailable` | Titles that do not count. |
| `fallback_title` | text | – | Title when the source runs without a usable one (e.g. "Startseite" for a console home screen). Without it such a source is skipped. |
| `fallback_subtitle` | text | – | Second line next to the fallback title, e.g. "Startseite". |
| `backdrop` | boolean | `true` | Cover as blurred, dimmed background of the card. |

## Behaviour

- **Second line:** details (subtitle, artist, series or a readable app name) and "seit 12 Min." /
  "seit 1:05 h", or "noch 23 Min." / "pausiert" for media with a duration.
- **Running time** from the history: short unavailable gaps (under 10 minutes, e.g. a console losing
  its online service) do not reset it.
- **Technical names** such as `org.droidtv.playtv` are never shown as title or details.
- The card is 88px high (`--graphite-tile-height-media`), the cover 64px, the watermark sits like
  the meter and stopwatch icons (8px from the top, 9px from the right).

## Editor

The sources are a list with a dialog per entry; the maps `titles` and `images` are lists in a
second dialog.
