# graphite-light

A lamp as a tile: the head is a switch row (icon, name, "since" line, toggle on the right), below it
sliders for brightness and white temperature (or color and saturation), aligned with the name.
Tapping the tile outside the sliders toggles the lamp, holding opens more-info. The sliders are the
same as in [graphite-slider](graphite-slider.md).

```yaml
type: custom:graphite-light
entity: light.floor_lamp
```

```yaml
# lamp on a wall switch
type: custom:graphite-light
entity: light.ceiling_lamp
wall_switch: true
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Light. |
| `name` | string | friendly name | Name in the head. |
| `icon` | icon | entity icon | Icon on the left. |
| `show_sliders` | boolean | `true` | `false`: only the head, no sliders. |
| `sliders` | list | brightness, white temperature if supported | Which sliders: `brightness`, `color_temp`, `hue`, `saturation`. Always shown in this order; an empty list means the default. |
| `allow_off` | boolean | `false` | The brightness slider turns the lamp off at the leftmost position (0 %). |
| `unavailable_sliders` | `show` \| `hide` | `show` | Lamp unreachable or off at the wall: keep the sliders locked in place (the layout stays) or hide them. |
| `wall_switch` | boolean | `false` | Lamp on a wall switch: a quiet wall switch icon instead of the toggle, unavailable counts as "aus am Wandschalter", tapping does nothing by default. |
| `wall_switch_icon` | icon | `ic:twotone-electrical-services` | Icon of the wall switch. |
| `since_line` | boolean | `true` | "<state> seit <time>" below the name; `false` hides it in every state. |
| `tap_action` | action | `toggle` (`none` with `wall_switch`) | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **On:** soft accent tint (`--graphite-light-tint`, 10 %), name in medium weight, accent icon, toggle on.
- **Off:** the sliders stay usable; moving the brightness turns the lamp on (Home Assistant sets a
  brightness with `light.turn_on`). The fill is quiet (`--graphite-text-muted`).
- **Unavailable:** dimmed head with an offline badge, sliders locked. With `wall_switch` no badge and no
  dimming: the line says "aus am Wandschalter seit …".
- **Ticks:** only the brightness slider shows ticks, every 10 % (long at 0, 50 and 100 %); the color tracks have none.
- Gestures on the sliders never toggle the lamp.

## Geometry

12px padding, 36px head (icon box 42px at 8/9, name at 60px), sliders 42px each from 58px with 12px
between them, toggle and wall switch icon 14px from the right edge: 112px with one slider, 166px with two.

## Editor

Entity, name and icon first; the sections *Sliders* (show sliders, which sliders, behaviour while
unavailable, off at 0), *Display* ("since" line, wall switch) and *Actions*.
