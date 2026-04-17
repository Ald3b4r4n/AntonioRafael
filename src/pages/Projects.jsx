import styles from "./Projects.module.css";
import SEO from "../components/SEO";

const FEATURED = [
  {
    title: "MounTrack",
    category: "SaaS Product",
    url: "https://mountrack.vercel.app/login",
    desc: "Plataforma mobile-first para acompanhamento de tratamento, peso, rotina alimentar e metas de vida saudável. Dashboard com indicadores, diário alimentar com metas de macros, controle de água, busca nutricional integrada (TBCA + FatSecret).",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Supabase",
      "Firebase",
      "Stripe",
      "PWA",
    ],
  },
  {
    title: "VidaExtra\u00AE",
    category: "SaaS B2C",
    url: "https://vida-extra.vercel.app/",
    desc: "Aplicação SaaS de escala corporativa para inteligência e monetização do controle de horas extras na Segurança Pública. Calculadora AC-4, integração bidirecional com Google Calendar, paywall com Stripe, painel admin com auditoria MongoDB e sincronização debounced zero-latency.",
    tech: [
      "Next.js 14",
      "React 18",
      "Stripe",
      "MongoDB",
      "Firebase",
      "Google Calendar API",
    ],
  },
];

const OTHER_PROJECTS = [
  {
    title: "Magnata CRM & Stock",
    url: "https://magnata-crm-stock-ugo3.vercel.app/dashboard",
    desc: "Sistema de gestão de estoque e CRM com dashboard BI, relatórios PDF e controle financeiro.",
  },
  {
    title: "GuardScale",
    url: "https://guardscale.vercel.app/",
    desc: "Plataforma de gestão de escalas e turnos com atualizações em tempo real via Socket.IO.",
  },
  {
    title: "Doc2Text (D2T)",
    url: "https://react2text.vercel.app/",
    desc: "OCR que converte documentos em texto estruturado para consultas em campo.",
  },
  {
    title: "OdontoPlus",
    url: "https://odonto-plus-five.vercel.app/",
    desc: "Site profissional para clínicas odontológicas com design responsivo.",
  },
];

export default function Projects() {
  return (
    <section className="section" aria-labelledby="projects-title">
      <SEO
        title="Projetos"
        description="Produtos digitais em produção: MounTrack, VidaExtra e mais."
        path="/projetos"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: [
            ...FEATURED.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: p.url,
              name: p.title,
            })),
            ...OTHER_PROJECTS.map((p, i) => ({
              "@type": "ListItem",
              position: FEATURED.length + i + 1,
              url: p.url,
              name: p.title,
            })),
          ],
        }}
      />
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Portfólio</p>
          <h1 id="projects-title" className={styles.heading}>
            Produtos em produção
          </h1>
          <p className={styles.sub}>
            SaaS completos com billing, autenticação e uso real.
          </p>
        </div>

        {/* Featured projects */}
        <ul className={styles.grid} aria-label="Projetos principais">
          {FEATURED.map((p) => (
            <li key={p.title} className={styles.featured}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={styles.card}
                aria-label={`Abrir projeto ${p.title}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.category}>{p.category}</span>
                  <span className={styles.open} aria-hidden="true">
                    &#x2197;
                  </span>
                </div>
                <h2 className={styles.cardTitle}>{p.title}</h2>
                <p className={styles.cardDesc}>{p.desc}</p>
                <div className={styles.techRow}>
                  {p.tech.map((t) => (
                    <span key={t} className={styles.techTag}>
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            </li>
          ))}
        </ul>

        {/* Other projects — compact list */}
        <div className={styles.otherSection}>
          <h2 className={styles.otherHeading}>Outros projetos</h2>
          <ul className={styles.otherGrid} aria-label="Outros projetos">
            {OTHER_PROJECTS.map((p) => (
              <li key={p.title}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.otherCard}
                >
                  <span className={styles.otherTitle}>{p.title}</span>
                  <span className={styles.otherDesc}>{p.desc}</span>
                  <span className={styles.otherArrow} aria-hidden="true">
                    &#x2197;
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
