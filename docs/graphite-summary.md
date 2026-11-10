# graphite-summary

Clock with date and a short summary of the home written as prose, e.g. "1 window is open. 2 lights
are on." Every item adds a phrase while its condition is met. Alerts form the first sentence (accent
color), the other phrases a second sentence. Parts in `[brackets]` are highlighted and, with a
target, tappable; `{icon}` inserts the item's icon. Without an alert and with at most one other
phrase the first line starts with a calm text ("All quiet.").

```yaml
type: custom:graphite-summary
hold_action:
  action: perform-action
  perform_action: switch.toggle
  target: { entity_id: switch.kiosk_mode }
items:
  - entity: sensor.open_windows
    alert: { above: 0 }
    alert_text: "[{value} windows] are open"
    alert_text_one: "[1 window] is open"
    navigation_path: "#windows"
  - entity: sensor.living_room_co2
    levels:
      - { above: 1499, text: "[open a window], CO₂ is at {value}" }
      - { above: 999, text: "time to [air out]" }
  - pickup:
      calendars: [calendar.paper_collection, calendar.cardboard_collection]
  - entity: sensor.lights_on
    show: { above: 0 }
    text: "[{value} lights] are on"
    text_one: "[1 light] is on"
    navigation_path: "#lights"
  - entity: input_boolean.guest_mode
    alert: { state: "on" }
    alert_text: "[{icon} guest mode] on"
    icon: mdi:account-circle-outline
    color: success
    line: 2
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | list | required | The phrases, see below. |
| `clock` | boolean | `true` | Time and date above the text. |
| `greeting` | boolean | `false` | Greeting by time of day between clock and text. |
| `calm_text` | string or `false` | translated ("All quiet.") | Start of the first line without an alert; `false` leaves it out. |
| `and_word` | string | translated ("and") | Word before the last phrase of a sentence. |
| `hold_action` | action | – | Action when holding the card (not a highlight), e.g. to toggle a kiosk mode. |

## Item options

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | string | – | Only a label for the list in the editor, not used by the card. |
| `entity` | entity id | – | Entity whose state decides and fills `{value}` (numbers rounded). |
| `show` | condition | always | Shown while `{above, below, state}` matches. |
| `alert` | condition | – | Alert while it matches: first sentence, highlighted in the accent (or `color`). An item with `alert` and without `show` is only shown as alert. |
| `text`, `text_one` | string | – | Phrase; `text_one` when the value is 1. |
| `alert_text`, `alert_text_one` | string | `text` | Phrase while alerting. |
| `levels` | list | – | `{above, below, state, text, alert}`; the first matching level wins (alert unless `alert: false`). |
| `pickup` | object | – | Waste collections: "[Paper] is collected tomorrow", see *Pickup options*. |
| `line` | number | `1` | Items with `line: 2`, `3`, … start on their own line. |
| `color` | `accent`, `success`, `danger` or CSS | – | Color of the highlights. |
| `icon` | icon | entity icon | Icon for `{icon}`; `{icon:mdi:name}` inserts any icon. |
| `navigation_path` | string | – | Tapping a highlight navigates (e.g. to a pop-up `#windows`). |
| `tap_action` | action | – | Any action on tapping a highlight. |
| `more_info` | boolean | `false` | Tapping a highlight opens more-info of the entity. |

## Pickup options

| Option | Type | Default | Description |
|---|---|---|---|
| `calendars` | list | required | Calendar entities of the waste collections. |
| `days` | number | `1` | Days ahead that count (1 = today and tomorrow). |
| `drop_after` | `HH:MM` | `12:00` | A collection of today counts as done after this time. |
| `names` | map | message of the event | Names per calendar. |
| `when` | map | translated | Words per day, e.g. `{ 0: today, 1: tomorrow }`. |

The older form still works: `pickup` as a list of calendars with `days`, `drop_after`, `names`
and `when` on the item itself. The editor stores the form above.

Texts of the card (calm text, "and", pickup, greeting) follow the language
(`--graphite-language`, otherwise the Home Assistant language).

## Editor

Clock, greeting and texts as fields; the items are a list with a dialog per entry. To keep that
dialog short, `show`, `alert` and `pickup` open a second dialog each ("always show" stands for
`show: true`, the alert mode *always* / *never* for `alert: true` / `false`), and so do the `levels`;
`names` and `when` of a pickup open a third one. `name` is only a label for the list in the editor.
