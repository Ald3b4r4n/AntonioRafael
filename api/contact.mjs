/* eslint-env node */
/**
 * Serverless Function (Vercel, ESM)
 * Envia e-mail via Nodemailer (Gmail + App Password).
 * Variáveis no Vercel:
 * - EMAIL_USER, EMAIL_PASS, CLINICA_EMAIL (opcional)
 * - EMAIL_PORT (465 ou 587), EMAIL_SECURE ("true" ou "false")
 */
import nodemailer from "nodemailer";

const {
  EMAIL_USER,
  EMAIL_PASS,
  CLINICA_EMAIL,
  EMAIL_PORT = "465",
  EMAIL_SECURE = "true",
} = process.env;

// Reaproveitado entre invocações
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: Number(EMAIL_PORT),
  secure: String(EMAIL_SECURE) === "true", // 465=true (SSL) | 587=false (STARTTLS)
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  tls: { minVersion: "TLSv1.2" },
});

// Utilitário para ler JSON do body (Vercel Node não faz parse automático)
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

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(req, res) {
  // CORS não é necessário se front e API estão no mesmo domínio do Vercel.
  // Permite apenas POST (+ OPTIONS para pré-voo se precisar).
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { name, email, phone = "", message } = await readJsonBody(req);

    // Validações simples
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ ok: false, message: "Nome inválido." });
    }
    if (!email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ ok: false, message: "Email inválido." });
    }
    if (!message || String(message).trim().length < 5) {
      return res.status(400).json({ ok: false, message: "Mensagem inválida." });
    }

    const to = CLINICA_EMAIL || EMAIL_USER;
    const subject = `Novo contato do portfólio — ${name}`;

    const text = [
      `Nome: ${name}`,
      `Email: ${email}`,
      phone ? `Telefone: ${phone}` : null,
      "",
      "Mensagem:",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f2030">
        <h2 style="margin:0 0 8px 0;">Novo contato do portfólio</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>` : ""}
        <hr/>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Portfólio — Contato" <${EMAIL_USER}>`,
      to,
      replyTo: email,
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error("Email error:", err?.code, err?.message);
    return res
      .status(500)
      .json({ ok: false, message: "Falha ao enviar o e-mail." });
  }
}
