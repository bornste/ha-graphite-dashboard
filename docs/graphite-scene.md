# graphite-scene

A scene as a tile (64px, `--graphite-tile-height-scene`): a short stripe in the scene colors top left,
the name bottom left and the icon as watermark. While the scene is active (e.g. an `input_select`
names it), the whole tile is filled with the color gradient; name and icon turn dark on bright
colors and white on dark ones. Tapping activates the scene, holding opens more-info. Several scene
tiles in a [graphite-panel](graphite-panel.md) with `layout: grid` and `columns: 4` make a room.

```yaml
type: custom:graphite-scene
entity: scene.living_room_relax
name: Relax
colors: ["#ff9a3c", "#ff6f61", "#b8478a"]
active:
  entity: input_select.living_room_scenes
  state: Relax
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Scene (or another entity). |
| `name` | string | friendly name | Name bottom left. |
| `icon` | icon | entity icon | Watermark bottom right. |
| `colors` | list | accent | Colors of the stripe and the gradient (hex colors decide the text color). |
| `active` | condition | – | Filled while the condition is met (`entity` plus `state`, `above` or `below`, see the panel conditions). Without `entity` the scene's own state is checked. |
| `tap_action` | action | `scene.turn_on` | Action on tap (other entities: more-info). |
| `hold_action` | action | `more-info` | Action on hold. |
| `double_tap_action` | action | `none` | Action on double tap. |

## Styling

Same tokens as the other tiles: `--graphite-tile-height-scene` (64px), `--graphite-padding-tile` (12px),
`--graphite-font-label-size` (13px), `--graphite-watermark-size` (34px), stripe 28 × 4px like the label tiles.
