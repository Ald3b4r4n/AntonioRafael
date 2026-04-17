/* global process */
/**
 * Serverless Function (Vercel, ESM) — Health check endpoint v1.1.
 *
 * Returns structured health status for uptime monitoring and
 * deployment verification per contracts/health-api.md.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Only GET requests are accepted.",
    });
  }

  const emailConfigured =
    Boolean(process.env.EMAIL_USER) && Boolean(process.env.EMAIL_PASS);

  return res.status(200).json({
    status: emailConfigured ? "ok" : "degraded",
    version,
    timestamp: new Date().toISOString(),
    checks: {
      email: emailConfigured ? "configured" : "missing",
    },
  });
}
