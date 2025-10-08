import styles from "./About.module.css";
import LanyardBadge from "../components/LanyardBadge";
import SEO from "../components/SEO";

export default function About() {
  return (
    <section className="section">
      <SEO
        title="Início"
        description="Bem-vindo ao meu portfólio. Desenvolvedor Full Stack com foco em React e JavaScript."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Antônio Rafael Souza Cruz de Noronha",
          jobTitle: "Full Stack Developer",
          url: "https://seu-dominio.com/",
          sameAs: [
            "https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/",
            "https://github.com/Ald3b4r4n",
            "https://wa.me/5561982887294",
          ],
        }}
      />
      <div className="container">
        <div className={styles.hero}>
          <div className={styles.left}>
            <div className={styles.pill}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.pillText}>
                O trabalho duro supera o talento, quando o talento não trabalha
                duro!
              </span>
            </div>

            <h1 className={styles.title}>
              BEM-VINDO AO MEU <span>PORTFÓLIO</span>
            </h1>
            <h2 className={styles.subtitle}>Desenvolvedor Full Stack</h2>

            <p className={styles.lead}>
              Olá! Sou Antônio Rafael Souza Cruz de Noronha, estudante de
              Engenharia de Software, conhecimento consolidado em
              desenvolvimento web, com ênfase em React, JavaScript e CSS e suas
              variações (Sass, Styled Components, Tailwind CSS), além de
              trabalhar com bancos de dados relacionais (SQL, Supabase, Neon) e
              não relacionais (Firebase, MongoDB). Trago de minha jornada
              valores como disciplina, responsabilidade e trabalho em equipe.
              Sou casado e pai, sempre em busca de evolução pessoal e
              profissional.
            </p>

            <div className={styles.chips}>
              <span>React</span>
              <span>JavaScript</span>
              <span>Node.js</span>
              <span>SQL</span>
              <span>MongoDB</span>
              <span>Supabase</span>
            </div>

            <div className={styles.social}>
              <a
                href="https://github.com/Ald3b4r4n"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://wa.me/5561982887294"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className={styles.right}>
            <LanyardBadge />
          </div>
        </div>
      </div>
    </section>
  );
}
