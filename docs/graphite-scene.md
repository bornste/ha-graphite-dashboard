# graphite-scene

A scene or a light effect as a tile (64px, `--graphite-tile-height-scene`): a stripe in the colors top
left (42px), the name bottom left and the icon as watermark. While the scene is active (e.g. an
`input_select` names it), the whole tile is filled with the color gradient; name and icon turn dark on
bright colors and white on dark ones. Long names wrap to a second line, the tile keeps its height, so
it stays as high as its neighbours. Several scene tiles in a [graphite-panel](graphite-panel.md) with
`layout: grid` and `columns: 4` make a room.

```yaml
type: custom:graphite-scene
entity: scene.living_room_relax
name: Relax
colors: ["#ff9a3c", "#ff6f61", "#b8478a"]
active:
  entity: input_select.living_room_scenes
  state: Relax
```

A light effect: no watermark, the lamp only for holding, tapping starts the effect. `active` marks the
running effect, if the lamp (or a helper) reports it.

```yaml
type: custom:graphite-scene
name: Sunset
icon: none
colors: ["#ffb25c", "#ff7a3d", "#c2408f"]
entity: light.floor_lamp
tap_action:
  action: perform-action
  perform_action: light.turn_on
  target:
    entity_id: light.floor_lamp
  data:
    effect: sunset
active:
  entity: sensor.floor_lamp_effect
  state: sunset
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | – | A scene (tapping activates it) or another entity (tapping opens more-info). Optional: without one, tapping only does what `tap_action` says. |
| `name` | string | friendly name | Name bottom left, up to two lines. |
| `icon` | icon / `none` | entity icon | Watermark bottom right; `none` shows none (also without an entity). |
| `colors` | list | accent | Colors of the stripe and the gradient, left to right (hex colors decide the text color of the filled tile). |
| `active` | condition | – | Filled while the condition is met (`entity` plus `state`, `above` or `below`, see the panel conditions). Without `entity` the card's own entity is checked. |
| `tap_action` | action | by entity | `scene.turn_on` for a scene, more-info for another entity, nothing without an entity. |
| `hold_action` | action | `more-info` with `entity`, else `none` | Action on hold. |
| `double_tap_action` | action | `none` | Action on double tap. |

## Styling

Same tokens as the other tiles: `--graphite-tile-height-scene` (64px), `--graphite-padding-tile` (12px),
`--graphite-font-tile-name-size` (15px, the name size), `--graphite-watermark-size` (34px). The stripe is
4px high like the meter bar, 42px wide (`--graphite-scene-stripe-width`).
