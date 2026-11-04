# graphite-image-tile

An action tile, e.g. to start a game or an app. With an image, the picture fills the tile as a
blurred, dimmed backdrop and sits as a square thumbnail bottom left; the name is then only read by
screen readers. Without an image, the name is shown as a label. With `busy`, the tile gets an accent
tint and a small spinner top right while the entity is on (e.g. a script that takes a while).

```yaml
type: custom:graphite-image-tile
entity: script.start_racing_game
name: Racing game
image: /local/images/racing-game.jpg
busy: true
tap_action:
  action: perform-action
  perform_action: script.turn_on
  target:
    entity_id: script.start_racing_game
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | – | Entity of the tile (e.g. the script); used for `busy` and for holding (more-info). |
| `name` | string | friendly name | Label without an image; with an image only for screen readers. |
| `image` | string | – | `/local/...`, an `http(s)` URL or `media-source://...` (resolved to a signed URL). |
| `busy` | boolean | `false` | Accent tint and spinner while the entity is `on`. |
| `tap_action` | action | `none` | Action on tap. |
| `hold_action` | action | `more-info` with `entity`, else `none` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height-compact` | `72px` | Height of the tile; the thumbnail is 20px smaller. |
| `--graphite-image-blur` | `8px` | Blur of the backdrop. |
| `--graphite-image-brightness` | `0.6` | Brightness of the backdrop. |
| `--graphite-card-radius` | `12px` | Corner radius (set by the panel). |
