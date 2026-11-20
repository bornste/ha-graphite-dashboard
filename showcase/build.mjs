// Builds the showcase site into showcase/site/: theme variables as CSS, the card library and
// the showcase script. Usage: npm run build:showcase (once) or npm run showcase (serve locally).
import { build, context } from "esbuild";
import { watch } from "node:fs";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const root = new URL("../", import.meta.url);
const site = new URL("site/", import.meta.url);
const packageInfo = JSON.parse(await readFile(new URL("package.json", root), "utf8"));

await mkdir(site, { recursive: true });

// themes: every theme of graphite.yaml as CSS variables. "Graphite" sits on the page root, the others
// on :root[data-theme="…"] for the theme switcher. A theme uses its dark mode, a light theme its light
// mode; the merge keys (<<) of the file are resolved. The wallpaper of a theme (lovelace-background)
// lives in Home Assistant, the showcase keeps the plain ground. The variables also go to the
// page as hass.themes (for the theme preview of graphite-select).
const themes = parse(await readFile(new URL("config/themes/graphite/graphite.yaml", root), "utf8"), { merge: true });
const themeSlug = (name) => name.toLowerCase().split(" ").join("-");
const themeList = Object.entries(themes).map(([name, theme]) => {
  const light = !theme.modes.dark || (theme.modes.light && theme.modes.dark === theme.modes.light);
  return { name, slug: themeSlug(name), light, variables: light ? theme.modes.light : theme.modes.dark };
});
const themeBlock = (selector, variables, light) => `${selector} {\n  color-scheme: ${light ? "light" : "dark"};\n${Object.entries(variables)
  .filter(([name]) => name !== "lovelace-background")
  .map(([name, value]) => `  --${name}: ${value};`).join("\n")}\n}\n`;
const css = themeList.map((theme) => themeBlock(theme.name === "Graphite" ? ":root" : `:root[data-theme="${theme.slug}"]`,
  theme.variables, theme.light)).join("\n");
await writeFile(new URL("theme.css", site), css);
const copyPage = () => copyFile(new URL("index.html", import.meta.url), new URL("index.html", site));
await copyPage();

// Roboto (latin, OFL) next to the page, so the showcase makes no external requests
const fonts = new URL("fonts/", site);
await mkdir(fonts, { recursive: true });
for (const file of await readdir(new URL("fonts/", import.meta.url))) {
  await copyFile(new URL(`fonts/${file}`, import.meta.url), new URL(file, fonts));
}

// icons: only the ones the cards and examples name (mdi:…, ic:…), from the Iconify sets
// @iconify-json/mdi (Material Design Icons) and @iconify-json/ic (Google Material Icons),
// both Apache-2.0; the page stays free of external requests
const iconSets = { mdi: "@iconify-json/mdi/icons.json", ic: "@iconify-json/ic/icons.json" };

async function readIconSet(path) {
  const folders = [process.env.GRAPHITE_NODE_PATH, fileURLToPath(new URL("node_modules", root))].filter(Boolean);
  for (const folder of folders) {
    try {
      return JSON.parse(await readFile(new URL(path, pathToFileURL(`${folder}/`)), "utf8"));
    } catch {
      // try the next folder
    }
  }
  console.warn(`showcase: icon set ${path} not found, icons fall back to a placeholder`);
  return undefined;
}

// icon names in a source text: runs of a-z, 0-9, "-" and ":" that start with a set prefix
function iconNames(text) {
  const names = new Set();
  let token = "";
  const isNameChar = (character) => (character >= "a" && character <= "z") || (character >= "0" && character <= "9")
    || character === "-" || character === ":";
  for (const character of `${text} `) {
    if (isNameChar(character)) {
      token += character;
      continue;
    }
    const prefix = token.split(":")[0];
    if (token.includes(":") && iconSets[prefix] && token.length > prefix.length + 1) names.add(token);
    token = "";
  }
  return names;
}

async function collectIcons() {
  const names = new Set();
  for (const folder of [new URL("src/", root), new URL("./", import.meta.url)]) {
    for (const file of await readdir(folder, { recursive: true })) {
      if (!file.endsWith(".ts") || file.startsWith("site")) continue;
      for (const name of iconNames(await readFile(new URL(file, folder), "utf8"))) names.add(name);
    }
  }
  const sets = {};
  for (const [prefix, path] of Object.entries(iconSets)) sets[prefix] = await readIconSet(path);
  const icons = {};
  for (const name of names) {
    const [prefix, iconName] = name.split(":");
    const set = sets[prefix];
    if (!set) continue;
    // aliases point to another icon of the same set
    const icon = set.icons[iconName] ?? set.icons[set.aliases?.[iconName]?.parent];
    if (icon) icons[name] = { body: icon.body, width: icon.width ?? set.width ?? 24, height: icon.height ?? set.height ?? 24 };
  }
  return icons;
}

const showcaseIcons = await collectIcons();

const options = {
  entryPoints: {
    "graphite-cards": fileURLToPath(new URL("src/index.ts", root)),
    showcase: fileURLToPath(new URL("showcase.ts", import.meta.url)),
  },
  outdir: fileURLToPath(site),
  bundle: true,
  format: "esm",
  target: "es2021",
  define: {
    GRAPHITE_VERSION: JSON.stringify(packageInfo.version),
    SHOWCASE_ICONS: JSON.stringify(showcaseIcons),
    SHOWCASE_THEMES: JSON.stringify(themeList.map(({ name, slug, variables }) => ({ name, slug, variables }))),
  },
  nodePaths: process.env.GRAPHITE_NODE_PATH ? [process.env.GRAPHITE_NODE_PATH] : [],
  logLevel: "info",
};

if (process.argv.includes("--serve")) {
  const buildContext = await context(options);
  await buildContext.watch();
  const { port } = await buildContext.serve({ servedir: fileURLToPath(site), port: 8080 });
  console.log(`Showcase: http://localhost:${port}/`);
  // esbuild only watches the scripts: the page (index.html, its styles) is copied again on change.
  // A change of graphite.yaml needs a restart (the themes are also built into the script).
  let copyTimer;
  watch(fileURLToPath(new URL("index.html", import.meta.url)), () => {
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => copyPage().then(() => console.log("[watch] index.html copied"))
      .catch((error) => console.warn(`showcase: index.html not copied (${error.message})`)), 100);
  });
} else {
  await build(options);
}
