// Vercel serverless entry. Reuses the Express app via getApp().
import { getApp } from "../server/app";

export default async function handler(req: any, res: any) {
  try {
    const { app } = await getApp();
    return (app as any)(req, res);
  } catch (err: any) {
    console.error("[serverless] fatal:", err?.stack || err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        message: "Serverless init failed",
        error: String(err?.message || err),
        stack: err?.stack?.split("\n").slice(0, 5).join("\n"),
      }));
    }
  }
}

export const config = {
  maxDuration: 60,
};
