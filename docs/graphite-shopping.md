# graphite-shopping

Shopping list of a todo entity (e.g. Bring) for a page or a pop-up: on the left the free input and
the open items, on the right quick pick groups as chips. Tapping a chip puts the product on the list
or removes it again. Removing marks an item as completed (Bring keeps it under "recently used").
From a width of 640px the two columns stand side by side, below that on top of each other.

- **Variants:** a product with `variants` is added at once; a chooser opens below its group for an
  optional kind or amount (stored as description of the item, shown as pill in the list).
- **Fixed description:** `{ name: Onions, description: red }` is a product of its own; "Onions · yellow"
  and "Onions · red" can be on the list at the same time.
- **Sync state** next to the title: saved, saving (with the number of open changes) or not saved.
  Changes show right away and are finished once the todo integration reports them.

```yaml
type: custom:graphite-shopping
entity: todo.shopping
groups:
  - name: Dairy
    wide: true
    items:
      - { name: Milk, variants: ["1", "2", "3"] }
      - Butter
      - Yoghurt
  - name: Vegetables
    wide: true
    items:
      - { name: Onions, description: yellow }
      - { name: Onions, description: red }
      - { name: Potatoes, variants: [waxy, floury] }
      - Tomatoes
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity` | entity id | required | `todo.*` entity of the shopping list. |
| `groups` | list | – | Quick pick groups: `name`, `items` and `wide` (group over the full width; otherwise two groups share a row on wide screens). |
| `panels` | boolean | `true` | Both columns on the panel surface; `false` without background. |
| `list_title` | string | translated ("Shopping list") | Title of the list column; empty hides it. |
| `quick_title` | string | translated ("Quick picks") | Title of the quick pick column; empty hides it. |
| `placeholder` | string | translated | Placeholder of the input. |
| `empty_text` | string | translated | Text while the list is empty. |

## Products

An item of a group is a name (`Butter`) or an object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Name of the product (matched without case). |
| `variants` | list | Choice of kind or amount after adding, e.g. `["6", "10", "12"]`. |
| `description` | string | Fixed description; makes it a product of its own (excludes `variants`). |

The list column scrolls on its own above 600px height (theme variable
`--graphite-shopping-list-height`).
