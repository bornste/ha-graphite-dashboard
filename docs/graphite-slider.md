# graphite-slider

One slider for a `number` or `input_number` entity, or for a light: brightness, white temperature,
color (hue) or saturation. The knob jumps from step to step, ticks below the track show the steps
(or the quarters), round values get a longer tick. The value is set when the knob is released.

| Layout | Look | Good for |
|---|---|---|
| `inline` (default) | No surface: label left and value right above the track (42px + 4px). | Below effect tiles, inside a panel with other sliders. |
| `row` | A card of its own, 72px: icon centered on the left, name and value in the first line, the track below the name. | Standalone settings next to status and switch rows. |

```yaml
type: custom:graphite-slider
entity: input_number.play_time_weekend
layout: row
value_format: state
```

```yaml
type: custom:graphite-slider
entity: light.floor_lamp
attribute: color_temp
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | `number`, `input_number` or `light`. |
| `layout` | `inline` \| `row` | `inline` | Look, see above. |
| `name` | string | see description | Label. Default: lights what is controlled ("Helligkeit", "Weisston", "Farbe", "Sättigung"), otherwise the friendly name. |
| `icon` | icon | – | Icon on the left; `row` shows the entity icon when none is set. For lights the icon turns accent while the light is on. |
| `attribute` | `brightness` \| `color_temp` \| `hue` \| `saturation` | `brightness` | Lights only: what the slider controls. |
| `allow_off` | boolean | `false` | Light brightness only: the leftmost position (0 %) turns the light off; otherwise the range starts at 1 %. |
| `min` / `max` | number | entity range | Range; lights: 1 (0 with `allow_off`) – 100 %, the white temperature range of the lamp, 0–360° and 0–100 %. |
| `step` | number | entity step, 1 | Values are whole multiples of the step (step 5: 5, 10, 15 %). White temperature: 50 K. |
| `value_format` | `percent` \| `state` | `percent` | Numbers only: value in percent of the range or as the formatted state ("120 min"). Lights always show %, K or °. |
| `ticks` | `auto` \| `steps` \| `quarters` \| `none` | `auto` | Ticks below the track. `auto`: every step while they are at least 12px apart, otherwise the quarters. |
| `tick_every` | number | – | Ticks at multiples of this value instead of the steps (e.g. 10 on a 1 % slider); the knob still snaps to the steps. Long ticks every fifth unless `major_every` is set. |
| `major_every` | number | round value | Values with a longer tick. Default: 60 for minutes, otherwise the smallest round multiple of the step with at most 10 intervals (10 for 0–100 %). Both ends are always long. |

## Behaviour

- **Snapping:** while dragging and with the arrow keys the knob jumps to the next possible value;
  it never rests between two steps.
- **White temperature:** color track cold (left) to warm (right) like the Bubble slider; color: rainbow
  track; saturation: white to the current color. Hue is a circle: the knob keeps its end when the lamp
  reports 0° after 360°.
- **Unavailable**, or a lamp without the controlled capability: dimmed (50 %) and locked. A light that
  is off shows a quiet fill (`--graphite-text-muted`).
- Gestures on the slider never reach a parent card (e.g. tap to toggle on a light tile).

## Styling

| Variable | Default | Use |
|---|---|---|
| `--graphite-slider-fill` | `--graphite-accent` | Fill up to the knob. |
| `--graphite-slider-track` | ink 16 % over the card surface | Track. |
| `--graphite-slider-text` | `--graphite-text-secondary` | Label and value of `inline`. |
| `--graphite-slider-tick`, `--graphite-slider-tick-major` | `--graphite-text-muted`, `--graphite-text-secondary` | Ticks. |

## Editor

Entity, layout, name and icon; lights get «Steuert» (brightness, white temperature, color, saturation)
and «Ganz links schaltet aus», numbers the value display; range, step, ticks and long ticks for all.
