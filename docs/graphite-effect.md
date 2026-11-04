# graphite-effect

A light effect or scene as a tile: the tile is filled with the effect's color gradient, the name sits
bottom left in white, the colors are repeated as small dots top right. The gradient is slightly
desaturated and darkened so it sits calmly on the dark surface; the dots keep the true colors.
What a tap does is up to you (`tap_action`), e.g. start the effect.

```yaml
type: custom:graphite-effect
name: Sunset
colors: ["#ffb25c", "#ff7a3d", "#c2408f"]
entity: light.floor_lamp
tap_action:
  action: perform-action
  perform_action: light.turn_on
  target:
    entity_id: light.floor_lamp
  data:
    effect: sunset
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Name bottom left; long names wrap and the tile grows. |
| `colors` | list | required | Colors of the gradient, left to right (any CSS color). |
| `entity` | entity id | – | Only used for holding: more-info of this entity (e.g. the lamp). |
| `tap_action` | action | `none` | Action on tap, e.g. `perform-action` to start the effect. |
| `hold_action` | action | `more-info` with `entity`, else `none` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-tile-height-compact` | `72px` | Minimum height of the tile. |
| `--graphite-padding-tile` | `12px` | Inset of the name on the left. |
| `--graphite-effect-saturation` | `0.85` | Saturation of the gradient. |
| `--graphite-effect-brightness` | `0.88` | Brightness of the gradient. |
| `--graphite-card-radius` | `12px` | Corner radius (set by the panel). |
