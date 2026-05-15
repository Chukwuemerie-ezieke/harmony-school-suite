// Vercel serverless entry. Reuses the Express app via getApp().
// Cold-starts boot the app once; subsequent invocations on the same
// warm instance reuse the same Express app and Postgres pool.
import { getApp } from "../server/app";

export default async function handler(req: any, res: any) {
  const { app } = await getApp();
  return (app as any)(req, res);
}

export const config = {
  // Increase max duration for heavy seeder route
  maxDuration: 60,
};
