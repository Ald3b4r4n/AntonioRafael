/* global process */
/**
 * Serverless Function (Vercel, ESM) — Contact form handler v2.
 *
 * Middleware stack (per contracts/contact-api.md):
 *   method check → rate limiter → body parse → sanitize → validate → send
 *
 * Env vars: EMAIL_USER, EMAIL_PASS, CLINICA_EMAIL (optional),
 *           EMAIL_PORT (465), EMAIL_SECURE ("true")
 */
import nodemailer from "nodemailer";
import validator from "validator";

const {
  EMAIL_USER,
  EMAIL_PASS,
  CLINICA_EMAIL,
  EMAIL_PORT = "465",
  EMAIL_SECURE = "true",
} = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: Number(EMAIL_PORT),
  secure: String(EMAIL_SECURE) === "true",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  tls: { minVersion: "TLSv1.2" },
});

// ── Rate limiting (in-memory, 5 req / 10 min / IP) ──────────

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  const timestamps = (rateLimitStore.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return true;
}

/** Exported for test teardown only. */
export function _resetRateLimiter() {
  rateLimitStore.clear();
}

// ── Body parsing ─────────────────────────────────────────────

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// ── Sanitization ─────────────────────────────────────────────

function stripHtmlTags(str) {
  return String(str).replace(/<[^>]*>/g, "");
}

function stripCrlf(str) {
  return String(str).replace(/[\r\n]/g, "");
}

function sanitize(value) {
  if (typeof value !== "string") return "";
  return stripCrlf(stripHtmlTags(value)).trim();
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ── Handler ──────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  // Method check
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Only POST requests are accepted.",
    });
  }

  // Rate limiting
  const ip = req.ip || "unknown";
  if (!checkRateLimit(ip)) {
    res.setHeader(
      "Retry-After",
      String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
    );
    return res.status(429).json({
      ok: false,
      error: "RATE_LIMITED",
      message:
        "Too many requests. Please wait a few minutes before trying again.",
    });
  }

  try {
    // Body parsing
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return res.status(422).json({
        ok: false,
        error: "VALIDATION_ERROR",
        message: "One or more fields are invalid.",
        fields: { body: "Invalid JSON payload." },
      });
    }

    // Sanitize inputs
    const name = sanitize(body.name);
    const message = sanitize(body.message);
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";

    // Validate (collect all errors, not fail-fast)
    const fields = {};

    if (!name) {
      fields.name = "Please enter your name.";
    } else if (name.length > 100) {
      fields.name = "Name must be 100 characters or fewer.";
    }

    if (!emailRaw || !validator.isEmail(emailRaw)) {
      fields.email = "Please enter a valid email address.";
    }

    if (!message) {
      fields.message = "Please enter a message.";
    } else if (message.length > 5000) {
      fields.message = "Message must be 5000 characters or fewer.";
    }

    if (Object.keys(fields).length > 0) {
      return res.status(422).json({
        ok: false,
        error: "VALIDATION_ERROR",
        message: "One or more fields are invalid.",
        fields,
      });
    }

    // Normalize email after validation
    const email = validator.normalizeEmail(emailRaw) || emailRaw;

    const to = CLINICA_EMAIL || EMAIL_USER;
    const subject = `Novo contato do portfólio — ${name}`;

    const text = [
      `Nome: ${name}`,
      `Email: ${email}`,
      "",
      "Mensagem:",
      message,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f2030">
        <h2 style="margin:0 0 8px 0;">Novo contato do portfólio</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <hr/>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Portfólio — Contato" <${EMAIL_USER}>`,
      to,
      replyTo: email,
      subject,
      text,
      html,
    });

    return res.status(200).json({
      ok: true,
      message: "Message sent successfully.",
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "email_send_failed",
        code: err?.code,
        message: err?.message,
      }),
    );
    return res.status(500).json({
      ok: false,
      error: "SERVER_ERROR",
      message: "Failed to send your message. Please try again later.",
    });
  }
}
