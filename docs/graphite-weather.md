# graphite-weather

The [Weather Forecast Card](https://github.com/troinine/ha-weather-forecast-card) (MIT) in the
Graphite look. graphite-weather derives from the original card and only adds styles, so all of its
options, condition effects, the visual editor and its updates stay available.

**Requirement:** the Weather Forecast Card must be installed (HACS) and loaded as a dashboard
resource. graphite-weather registers itself once the original card is defined; without it the
card type simply does not exist.

What changes compared to the original:

- condition and temperature in the size, weight and color of the panel titles;
- location and min/max hidden (option `show_secondary_info`);
- current weather row with a small inset (`--graphite-gap-tile`) and the icon closer to the text;
- calmer condition effects (layer at 90 %, clouds at 35 %);
- forecast day labels quieter (caption size, secondary text);
- hourly forecast keeps the interval hours (option `sun_time_labels`).

```yaml
type: custom:graphite-weather
entity: weather.home
show_current: true
show_forecast: true
forecast:
  mode: chart
  show_sun_times: true
```

## Extra options

All options of the Weather Forecast Card work as documented there. In addition:

| Option | Type | Default | Description |
|---|---|---|---|
| `show_secondary_info` | boolean | `false` | Shows location and min/max of the current weather again. |
| `sun_time_labels` | boolean | `false` | Hourly slots containing sunrise or sunset show that time instead of the interval hour. |

`forecast.show_sun_times: true` is needed for the night detection (moon, night sky, night icons);
the interval labels stay anyway unless `sun_time_labels` is set.

## Theme variables

| Variable | Default | Description |
|---|---|---|
| `--graphite-weather-effects-opacity` | `90%` | Opacity of the whole effect layer. |
| `--graphite-weather-cloud-opacity` | `35%` | Opacity of the animated clouds. |
| `--graphite-weather-space-above` | `0` | Extra space above the current weather. |

The styles target internal classes (`.wfc-*`) of the original card. If a future version renames
them, the Graphite look falls back to the original look until graphite-weather is adjusted.
