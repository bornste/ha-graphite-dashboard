// Bundles src/index.ts into one file that Home Assistant loads as a dashboard resource.
// Usage: npm run build (once) or npm run watch (rebuild on every change).
import { build, context } from "esbuild";
import { readFile } from "node:fs/promises";

const packageInfo = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));

const options = {
  entryPoints: ["src/index.ts"],
  outfile: "config/www/graphite-cards/graphite-cards.js",
  bundle: true,
  format: "esm",
  target: "es2021",
  minify: true,
  legalComments: "eof",
  define: { GRAPHITE_VERSION: JSON.stringify(packageInfo.version) },
  // optional extra folder with node_modules (e.g. when the dependencies live outside the repo)
  nodePaths: process.env.GRAPHITE_NODE_PATH ? [process.env.GRAPHITE_NODE_PATH] : [],
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const buildContext = await context(options);
  await buildContext.watch();
} else {
  await build(options);
}
