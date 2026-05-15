// Vercel serverless entry. Imports the pre-bundled CJS Express app.
// _app.cjs is created at build time by script/build-api.ts.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default async function handler(req: any, res: any) {
  try {
    const { getApp } = require("./_app.cjs");
    const { app } = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error("[serverless] fatal:", err?.stack || err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      message: "Serverless init failed",
      error: String(err?.message || err),
      stack: err?.stack?.split("\n").slice(0, 8).join("\n"),
    }));
  }
}

export const config = {
  maxDuration: 60,
};
