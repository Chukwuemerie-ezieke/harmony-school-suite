// Pre-bundle server/app.ts into a single CJS file for Vercel serverless.
// Runs at Vercel build time (before vite build).
import { build } from "esbuild";
import { readFile } from "fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf-8"));
// Externalize all node_modules so Vercel's installer can resolve them at runtime;
// only our own source code (server/, shared/) gets bundled.
const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

await build({
  entryPoints: ["server/app.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "api/_app.cjs",
  external: externals,
  logLevel: "info",
});

console.log("✓ api/_app.cjs built");
