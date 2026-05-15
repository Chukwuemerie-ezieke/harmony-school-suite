export default function handler(req: any, res: any) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    ok: true,
    hasDb: !!process.env.DATABASE_URL,
    dbHost: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || null,
    hasSecret: !!process.env.SESSION_SECRET,
    node: process.version,
    region: process.env.VERCEL_REGION,
  }));
}
