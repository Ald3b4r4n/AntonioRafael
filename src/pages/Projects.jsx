import styles from "./Projects.module.css";
import SEO from "../components/SEO";

const PROJECTS = [
  {
    title: "Doc2Text (D2T)",
    url: "https://react2text.vercel.app/",
    desc: "OCR para agilizar abordagens: converte documentos em texto estruturado.",
  },
  {
    title: "Assinatura Digital",
    url: "https://assinatura-digital-three.vercel.app/",
    desc: "Gerador de assinaturas manuscritas para e-mails e documentos.",
  },
  {
    title: "GuardScale",
    url: "https://guardscale.vercel.app/",
    desc: "Plataforma web para gestão de agentes, turnos e escalas, com relatórios e exportação em PDF. Inclui autenticação JWT, modo escuro, interface responsiva e atualização em tempo real via Socket.IO. Desenvolvido em Node.js, MongoDB e Tailwind CSS.",
  },
  {
    title: "AC4-Manager",
    url: "https://ac4manager.vercel.app/",
    desc: "Gestão de horas extras — utilizado por batalhões da PMGO.",
  },
  {
    title: "Vida-Extra",
    url: "https://vida-extra.vercel.app/",
    desc: "Cálculo de serviços remunerados para policiais militares.",
  },
  {
    title: "OdontoPlus",
    url: "https://odonto-plus-five.vercel.app/",
    desc: "Site profissional para clínicas odontológicas.",
  },
];

export default function Projects() {
  return (
    <section className="section">
      <SEO
        title="Projetos"
        description="Seleção de projetos recentes: React, Node.js, integrações e mais."
        path="/projetos"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: PROJECTS.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: p.url,
            name: p.title,
          })),
        }}
      />
      <div className="container">
        <div className={styles.header}>
          <h1>Projetos</h1>
          <p>Seleção de trabalhos recentes.</p>
        </div>
        <div className={styles.grid}>
          {PROJECTS.map((p) => (
            <a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className={styles.card}
              aria-label={`Abrir projeto ${p.title}`}
            >
              <div className={styles.head}>
                <h3>{p.title}</h3>
                <span className={styles.open}>Abrir ↗</span>
              </div>
              <p>{p.desc}</p>
              <div className={styles.gridOverlay} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
