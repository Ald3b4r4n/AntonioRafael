import { useRef, useState } from "react";
import styles from "./Contact.module.css";
import SEO from "../components/SEO";

/**
 * Contact page — Editorial Premium.
 *
 * Primary contact: WhatsApp + LinkedIn (always work, no backend needed).
 * Secondary: contact form via Formspree (free tier, no backend).
 *
 * If VITE_FORMSPREE_ID is set, the form posts to Formspree.
 * Otherwise, a visible fallback guides the user to WhatsApp/LinkedIn.
 */

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || "";
const FORM_ACTION = FORMSPREE_ID
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : "";

const CLIENT_RULES = {
  name: (v) => {
    const t = String(v ?? "").trim();
    if (!t) return "Informe seu nome.";
    if (t.length > 100) return "Nome deve ter no máximo 100 caracteres.";
    return null;
  },
  email: (v) => {
    const t = String(v ?? "").trim();
    if (!t) return "Informe um e-mail válido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "E-mail inválido.";
    return null;
  },
  message: (v) => {
    const t = String(v ?? "").trim();
    if (!t) return "Escreva uma mensagem.";
    if (t.length > 5000) return "Mensagem deve ter no máximo 5000 caracteres.";
    return null;
  },
};

const FIELD_ORDER = ["name", "email", "message"];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const refs = {
    name: useRef(null),
    email: useRef(null),
    message: useRef(null),
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateClient = () => {
    const errs = {};
    for (const key of FIELD_ORDER) {
      const msg = CLIENT_RULES[key](form[key]);
      if (msg) errs[key] = msg;
    }
    return errs;
  };

  const focusFirstInvalid = (errs) => {
    for (const key of FIELD_ORDER) {
      if (errs[key] && refs[key]?.current) {
        refs[key].current.focus();
        return;
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const clientErrs = validateClient();
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs);
      setStatus("error");
      focusFirstInvalid(clientErrs);
      return;
    }

    if (!FORM_ACTION) {
      setFormError(
        "Formulário temporariamente indisponível. Use WhatsApp ou LinkedIn acima.",
      );
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    try {
      const res = await fetch(FORM_ACTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
        return;
      }

      const data = await res.json().catch(() => ({}));
      setFormError(
        data?.error || "Não foi possível enviar. Tente WhatsApp ou LinkedIn.",
      );
      setStatus("error");
    } catch {
      setFormError(
        "Falha de conexão. Tente pelo WhatsApp ou LinkedIn acima.",
      );
      setStatus("error");
    }
  };

  const loading = status === "submitting";
  const describedBy = (name) =>
    fieldErrors[name] ? `${name}-error` : undefined;

  return (
    <section className="section" aria-labelledby="contact-title">
      <SEO
        title="Contato"
        description="Fale comigo: WhatsApp, LinkedIn, ou envie uma mensagem pelo formulário."
        path="/contato"
      />
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Contato</p>
          <h1 id="contact-title">Vamos conversar?</h1>
          <p>Escolha o canal que preferir — respondo o quanto antes.</p>
        </div>

        {/* Primary contact — always works */}
        <div className={styles.directContact}>
          <a
            href="https://wa.me/5561982887294"
            target="_blank"
            rel="noreferrer"
            className={styles.contactBtn}
          >
            <span className={styles.contactIcon} aria-hidden="true">
              &#x1F4AC;
            </span>
            <span>
              <strong>WhatsApp</strong>
              <span className={styles.contactHint}>Resposta mais rápida</span>
            </span>
          </a>
          <a
            href="https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/"
            target="_blank"
            rel="noreferrer"
            className={styles.contactBtn}
          >
            <span className={styles.contactIcon} aria-hidden="true">
              &#x1F310;
            </span>
            <span>
              <strong>LinkedIn</strong>
              <span className={styles.contactHint}>Rede profissional</span>
            </span>
          </a>
        </div>

        {/* Form — secondary */}
        <div className={styles.card}>
          <p className={styles.formLabel}>
            Ou envie uma mensagem diretamente:
          </p>
          <form
            className={styles.form}
            onSubmit={onSubmit}
            noValidate
            aria-label="Formulário de contato"
          >
            <div className={styles.fieldGroup}>
              <label htmlFor="name" className={styles.srOnly}>
                Nome
              </label>
              <input
                ref={refs.name}
                id="name"
                name="name"
                placeholder="Nome"
                value={form.name}
                onChange={onChange}
                required
                autoComplete="name"
                aria-required="true"
                aria-invalid={fieldErrors.name ? "true" : undefined}
                aria-describedby={describedBy("name")}
                disabled={loading}
              />
              {fieldErrors.name && (
                <p id="name-error" className={styles.fieldError} role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.srOnly}>
                Email
              </label>
              <input
                ref={refs.email}
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
                inputMode="email"
                aria-required="true"
                aria-invalid={fieldErrors.email ? "true" : undefined}
                aria-describedby={describedBy("email")}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p id="email-error" className={styles.fieldError} role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="message" className={styles.srOnly}>
                Mensagem
              </label>
              <textarea
                ref={refs.message}
                id="message"
                name="message"
                placeholder="Mensagem"
                value={form.message}
                onChange={onChange}
                required
                aria-required="true"
                aria-invalid={fieldErrors.message ? "true" : undefined}
                aria-describedby={describedBy("message")}
                disabled={loading}
              />
              {fieldErrors.message && (
                <p
                  id="message-error"
                  className={styles.fieldError}
                  role="alert"
                >
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading || undefined}
            >
              {loading ? "Enviando..." : "Enviar mensagem"}
            </button>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={
                status === "success"
                  ? `${styles.formStatus} ${styles.success}`
                  : styles.srOnly
              }
            >
              {status === "submitting" && "Enviando sua mensagem..."}
              {status === "success" &&
                "Mensagem enviada com sucesso! Retornarei em breve."}
            </div>

            {status === "error" && formError && (
              <div
                role="alert"
                aria-live="assertive"
                className={`${styles.formStatus} ${styles.error}`}
              >
                {formError}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
