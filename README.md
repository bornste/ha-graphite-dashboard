# Graphite dashboard for Home Assistant

A calm, dark dashboard style for Home Assistant: the **Graphite** theme and **graphite-cards**,
a library of Lovelace cards built for it (TypeScript + Lit, bundled into one file).

> **Personal project.** Theme and cards are built for my own private dashboard. They only
> cover the options, cards and cases I need there – they are shared as they are, without the
> aim of being a general purpose card collection. Feel free to use or fork them.

> See [docs](docs/README.md) for the available cards.

**Showcase:** all cards with sample data, without Home Assistant –
<https://bornste.github.io/ha-graphite-dashboard/>

## Contents

| Path | What it is |
|---|---|
| `src/` | Source of the card library (TypeScript, Lit) |
| `config/www/graphite-cards/graphite-cards.js` | Built library – the file Home Assistant loads |
| `config/themes/graphite/` | The Graphite theme |
| `docs/` | One page per card: options, behaviour, examples |
| `showcase/` | Showcase page with sample data (published to GitHub Pages) |

## Installation

1. Copy `config/www/graphite-cards/graphite-cards.js` to `/config/www/graphite-cards/` in Home Assistant.
2. Add a dashboard resource (*Settings → Dashboards → ⋮ → Resources*):
   `/local/graphite-cards/graphite-cards.js?v=0.1.0` as *JavaScript module*.
   Raise the `?v=` value with every update, otherwise browsers keep the cached file.
3. Copy `config/themes/graphite/graphite.yaml` to your themes folder and reload themes;
   select the theme **Graphite** for the dashboard or view.

The browser console shows `GRAPHITE-CARDS <version>` once the library is loaded.

## Development

Requires Node.js 22.

```
npm install
npm run build       # builds config/www/graphite-cards/graphite-cards.js
npm run watch       # rebuilds on every change
npm run typecheck
npm run showcase    # showcase on http://localhost:8080 (rebuilds on every change)
```

The version in `package.json` is the library version (0.x while pre-release); raise it with
every change and use the same value in the resource URL.

Conventions: code comments in English, camelCase names, every card has a page in `docs/` and
examples in `showcase/examples.ts` (fictional entities only).

## License

[MIT](LICENSE)
