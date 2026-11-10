# graphite-vacuum

Robot vacuum of the Dreame integration in two layouts:

- `tile` (default): animated robot artwork, state as value, progress (mode, %, m²) or battery as
  detail line, a pill with the most important hint (water, station, maintenance) and a quick
  control (pause / resume). A tap opens `navigation_path`, e.g. the pop-up with the panel.
- `panel`: content for a pop-up. Left: quick picks, mode, suction (with Max+), rooms and the start
  button; right: battery, station state, last cleaning, maintenance with reset and station actions.

The entities of the integration are found from the prefix of the vacuum entity
(`vacuum.robot` → `select.robot_cleaning_mode`, `button.robot_reset_filter`, …).

```yaml
type: custom:graphite-vacuum
entity: vacuum.robot
navigation_path: "#robot"
```

```yaml
type: custom:graphite-vacuum
entity: vacuum.robot
layout: panel
rooms:
  - { id: 1, name: Kitchen, icon: mdi:chef-hat }
  - { id: 2, name: Living room, icon: mdi:sofa-outline }
  - { id: 3, name: Bathroom, icon: mdi:toilet }
presets:
  - { name: Kitchen, icon: mdi:chef-hat, rooms: [Kitchen], mode: mopping_after_sweeping }
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | `vacuum.*` entity of the Dreame integration. |
| `layout` | `tile` \| `panel` | `tile` | Tile for the overview or panel for the pop-up. |
| `name` | string | from the entity id | Name of the robot. |
| `navigation_path` | string | – | Tile: target of a tap, e.g. `#robot`. |
| `prefix` | string | object id of `entity` | Prefix of the integration's entities. |
| `rooms` | list | – | Panel: `{ id, name, icon }` per room; the ids are the segment ids of the map. Rooms whose id does not match the map are hidden with a notice. |
| `presets` | list | – | Panel: quick picks `{ name, icon, rooms, mode, suction }`; `rooms` by name. |
| `modes` | list | sweeping, mopping after sweeping, sweeping and mopping | Panel: modes as values or `{ value, name, icon }`. |
| `suction_levels` | list | quiet, standard, strong, turbo | Panel: suction levels as values or `{ value, name }`. |
| `panels` | boolean | `true` | Panel: both columns on their own surface; `false` without background. |
| `boost` | boolean | `true` | Panel: show the Max+ button when the switch exists. |
| `boost_name` | string | `Max+` | Label of the boost button. |
| `maintenance` | list | main brush, side brush, filter, sensors | `{ key, name, due, reset }`; `key` matches the attributes `<key>_left` and `<key>_time_left`. |
| `maintenance_threshold` | number | `10` | Remaining life in % from which an item counts as due. |
| `actions` | list | wash mop, dry, clean station, empty bin | Station actions `{ name, icon, entity }` (buttons). |
| `cleaning_title`, `presets_title`, `station_title` | string | translated | Panel headings. |
| `mode_entity`, `suction_entity`, `boost_entity`, `history_entity`, `error_entity`, `drying_left_entity` | entity id | from the prefix | Overrides when an entity has another name. |

Texts follow the language (`--graphite-language`, otherwise the Home Assistant language);
own `name` values in the lists win over the translations.

## Editor

Entity, layout, name and prefix first. Panel layout: rooms, presets, modes, suction (Max+ and the
suction levels), station actions as lists with a dialog per entry, and the headings. Both layouts:
*Maintenance* (threshold and items) and *Entities* (overrides).
