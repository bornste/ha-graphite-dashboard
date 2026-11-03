// Builds the showcase site into showcase/site/: theme variables as CSS, the card library and
// the showcase script. Usage: npm run build:showcase (once) or npm run showcase (serve locally).
import { build, context } from "esbuild";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = new URL("../", import.meta.url);
const site = new URL("site/", import.meta.url);
const packageInfo = JSON.parse(await readFile(new URL("package.json", root), "utf8"));

await mkdir(site, { recursive: true });

// theme: the dark mode variables of "Graphite" on the page root
const theme = parse(await readFile(new URL("config/themes/graphite/graphite.yaml", root), "utf8"));
const variables = theme.Graphite.modes.dark;
const css = `:root {\n${Object.entries(variables).map(([name, value]) => `  --${name}: ${value};`).join("\n")}\n}\n`;
await writeFile(new URL("theme.css", site), css);
await copyFile(new URL("index.html", import.meta.url), new URL("index.html", site));

// Roboto (latin, OFL) next to the page, so the showcase makes no external requests
const fonts = new URL("fonts/", site);
await mkdir(fonts, { recursive: true });
for (const file of await readdir(new URL("fonts/", import.meta.url))) {
  await copyFile(new URL(`fonts/${file}`, import.meta.url), new URL(file, fonts));
}

const options = {
  entryPoints: {
    "graphite-cards": fileURLToPath(new URL("src/index.ts", root)),
    showcase: fileURLToPath(new URL("showcase.ts", import.meta.url)),
  },
  outdir: fileURLToPath(site),
  bundle: true,
  format: "esm",
  target: "es2021",
  define: { GRAPHITE_VERSION: JSON.stringify(packageInfo.version) },
  nodePaths: process.env.GRAPHITE_NODE_PATH ? [process.env.GRAPHITE_NODE_PATH] : [],
  logLevel: "info",
};

if (process.argv.includes("--serve")) {
  const buildContext = await context(options);
  await buildContext.watch();
  const { port } = await buildContext.serve({ servedir: fileURLToPath(site), port: 8080 });
  console.log(`Showcase: http://localhost:${port}/`);
} else {
  await build(options);
}
