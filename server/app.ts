// Shared Express app factory — used by both dev server (server/index.ts)
// and Vercel serverless function (api/index.ts).
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

let _appPromise: Promise<{ app: express.Express; httpServer: Server }> | null = null;

export function getApp() {
  if (_appPromise) return _appPromise;
  _appPromise = (async () => {
    const app = express();
    app.set("trust proxy", 1);
    const httpServer = createServer(app);

    app.use(
      express.json({
        verify: (req, _res, buf) => {
          req.rawBody = buf;
        },
      }),
    );
    app.use(express.urlencoded({ extended: false }));

    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let captured: any = undefined;
      const origJson = res.json;
      res.json = function (body, ...args) {
        captured = body;
        return origJson.apply(res, [body, ...args]);
      };
      res.on("finish", () => {
        if (path.startsWith("/api")) {
          const dur = Date.now() - start;
          let line = `${req.method} ${path} ${res.statusCode} in ${dur}ms`;
          if (captured) line += ` :: ${JSON.stringify(captured).slice(0, 200)}`;
          log(line);
        }
      });
      next();
    });

    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });

    return { app, httpServer };
  })();
  return _appPromise;
}
