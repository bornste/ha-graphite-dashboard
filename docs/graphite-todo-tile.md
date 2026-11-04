# graphite-todo-tile

The open items of a todo list (e.g. the shopping list) as a tile in the label layout: the number of
open items as value, optionally the first item names on the right. An empty list shows a word as
value instead ("keine Artikel"). Tapping usually opens the list, e.g. a pop-up.

```yaml
type: custom:graphite-todo-tile
entity: todo.shopping
name: Shopping
icon: mdi:cart-outline
empty_text: nothing to buy
preview: true
tap_action:
  action: navigate
  navigation_path: "#shopping"
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | Todo list (`todo.*`); its state is the number of open items. |
| `name` | string | friendly name | Name on top. |
| `icon` | icon | entity icon | Watermark icon top right. |
| `unit` | string | "Artikel" / "items" | Unit after the number. |
| `unit_one` | string | `unit`, else "Artikel" / "item" | Unit when exactly one item is open. |
| `empty_text` | string | "Leer" / "Empty" | Value of an empty list. |
| `color` | CSS color | – | Short color stripe on top (the tile is then 80px instead of 72px). |
| `preview` | boolean | `false` | Shows the names of the open items on the right (loaded when the list changes). |
| `tap_action` | action | `more-info` | Action on tap. |
| `hold_action` | action | `more-info` | Action on hold (500 ms). |
| `double_tap_action` | action | `none` | Action on double tap. |

## Behaviour

- **Open items:** the name turns primary, the number is shown with its unit.
- **Empty list:** the `empty_text` is the value (in the slightly smaller word size).
