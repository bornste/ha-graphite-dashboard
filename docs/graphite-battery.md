# graphite-battery

All battery sensors of the house grouped by urgency, one panel per group, e.g. for a pop-up:

- **Empty or offline** – no report or 0 %, with the time since the last report.
- **Critical** – below `critical` (accent).
- **Replace soon** – below `low`.
- **In order** – compact tiles with level bar, collapsible (with the count and the lowest level).

The list is built from every `sensor.*` with `device_class: battery`, so new devices appear by
themselves; hidden sensors and sensors with the exclude label are left out. Names come from the
device (without vendor details in brackets), otherwise from the entity. Tapping a battery opens
more-info.

```yaml
type: custom:graphite-battery
critical: 20
low: 40
names:
  sensor.balcony_door_battery: Balcony door
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `critical` | number | `20` | Below this level (%) a battery is critical. |
| `low` | number | `40` | Below this level (%) a battery should be replaced soon. |
| `exclude_label` | label id | `exclude` | Sensors with this label are left out. |
| `exclude` | list | – | Further sensors to leave out. |
| `names` | map | device name | Display names per sensor. |
| `collapsed` | boolean | `true` | "In order" starts collapsed. |
