# graphite-legend

Legend for charts in the Graphite look: **color scales** (a gradient bar with the values below it)
and simple **swatch items** (a colored patch with a name). The legend draws no frame of its own and
sits directly in a [graphite-panel](graphite-panel.md). It does not depend on any entity.

Use the same stops as the `color_thresholds` of the chart, so legend and line colors match: the bar
interpolates between the stops like the chart gradient; outside the first and last stop the edge
colors continue.

```yaml
type: custom:graphite-legend
scales:
  - name: Temperature
    unit: °C
    min: -5
    max: 35
    opacity: 0.6
    stops:
      - { value: 0, color: "#9b7bd4" }
      - { value: 15, color: "#5b9bd5" }
      - { value: 20, color: "#6fbf5a" }
      - { value: 28, color: "#f0a33c" }
      - { value: 32, color: "#e4644b" }
items:
  - { name: Window open, color: "#f5c48a", opacity: 0.4 }
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `scales` | list | – | Color scales, see below. Side by side on wide panels (from 240px each), otherwise stacked. |
| `items` | list | – | Swatch items `{ name, color, opacity }`; color default is the accent. |

## Scale options

| Key | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Name above the bar. |
| `unit` | string | – | Unit after the name (muted). |
| `stops` | list | required | `{ value, color }`, the same values as the chart's `color_thresholds`. |
| `min`, `max` | number | first / last stop | Ends of the bar. |
| `ticks` | list | the stop values | Values shown below the bar; the outermost labels stay inside the bar. |
| `opacity` | number | `1` | Opacity of the whole bar (e.g. to match a chart fill). |
