# graphite-toast

Dashboard notifications at the bottom center of the screen, triggered from automations and scripts.
graphite-toast is no card: the library mounts one notification layer per page as soon as it is loaded
and listens to the text helper `input_text.dashboard_toast`.

A script writes a small JSON payload into the helper (at most 255 characters):

```json
{"m": "[Guest mode] on", "d": "Automations run in guest mode", "i": "mdi:account", "c": "success", "t": 4}
```

| Key | Description |
|---|---|
| `m` | Message; parts in `[brackets]` are the keyword (in the toast color, weight 500). |
| `d` | Optional second line. |
| `i` | Optional icon. |
| `c` | Color: `accent`, `success`, `danger` or any CSS color; empty = neutral. |
| `t` | Seconds, 1–30 (default 4); a bar shows the remaining time. |
| `u` | Optional list of user names: only these users see the toast. |
| `p` | Optional list of dashboard paths (e.g. `home-dashboard`): only there. |
| `n` | Nonce and time (Unix seconds): repeats the same text and drops stale toasts. |

Several toasts in a row are queued. After loading the page only a toast from the last 10 seconds is
shown. A queued toast whose time ended more than 10 seconds ago is dropped (e.g. after the tablet
slept).

## Helper and script

- Helper: `input_text.dashboard_toast`, maximum length 255.
- A script writes the payload with `input_text.set_value`, for example with the fields message,
  detail, icon, color, duration, users and dashboards, and a nonce `now().timestamp()`.

## Timing

Showing and hiding follow wall-clock end times. A hidden page (screen off, other tab) pauses animation
frames but not timers; the toast therefore never fades in after its time is over, and a toast whose
time ended while the page was hidden is closed as soon as the page is visible again.
