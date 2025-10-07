import { useState } from "react";
import axios from "axios";
import styles from "./Contact.module.css";
import SEO from "../components/SEO";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE || ""; // '' => mesma origem. Em produção: /api/contact

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/contact`, form, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });
      if (res?.data?.ok) {
        alert("Mensagem enviada com sucesso!");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        alert(res?.data?.message || "Não foi possível enviar a mensagem.");
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Erro ao enviar mensagem."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <SEO
        title="Contato"
        description="Fale comigo: WhatsApp, LinkedIn, ou envie uma mensagem pelo formulário."
        path="/contato"
      />
      <div className="container">
        <div className={styles.header}>
          <h1>Entre em Contato</h1>
          <p>Me chame — respondo o quanto antes.</p>
        </div>

        <div
          className={styles.card}
          role="form"
          aria-label="Formulário de contato"
        >
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <label htmlFor="name" className="sr-only">
              Nome
            </label>
            <input
              id="name"
              name="name"
              placeholder="Nome"
              value={form.name}
              onChange={onChange}
              required
            />

            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />

            <label htmlFor="phone" className="sr-only">
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              placeholder="Telefone"
              value={form.phone}
              onChange={onChange}
            />

            <label htmlFor="message" className="sr-only">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Mensagem"
              value={form.message}
              onChange={onChange}
              required
            />

            <button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>

          <div className={styles.links} aria-label="Outros contatos">
            <a
              href="https://wa.me/5561982887294"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              href="https://linkedin.com/in/seu-perfil"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>

          <div className={styles.cardGrid} />
        </div>
      </div>
    </section>
  );
}
