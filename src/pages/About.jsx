import styles from "./About.module.css";
import SEO from "../components/SEO";

export default function About() {
  return (
    <section className="section" aria-labelledby="about-title">
      <SEO
        title="Antônio Rafael — CEO & Full Stack Developer"
        description="CEO da A&R Software Development. Engenheiro de Software Full Stack. React, Node.js, TypeScript. Construo produtos digitais que resolvem problemas reais."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Antônio Rafael Souza Cruz de Noronha",
          jobTitle: "CEO & Full Stack Developer",
          url: "https://antoniorafael.dev/",
          sameAs: [
            "https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/",
            "https://github.com/Ald3b4r4n",
            "https://wa.me/5561982887294",
          ],
        }}
      />
      <div className="container">
        <div className={styles.hero}>
          {/* Photo + eyebrow row */}
          <div className={styles.intro}>
            <img
              src="/hero-photo.jpg"
              alt="Antônio Rafael"
              className={styles.avatar}
              width={72}
              height={72}
              loading="eager"
              decoding="async"
            />
            <div className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              CEO — A&amp;R Software Development
            </div>
          </div>

          <h1 id="about-title" className={styles.display}>
            Construo produtos
            <br />
            <span className={styles.gradient}>que importam.</span>
          </h1>

          <p className={styles.lead}>
            Engenheiro de Software com foco em React, React Native, Next.js,
            Node.js e TypeScript. Transformo ideias em aplicações performáticas,
            acessíveis e com design que faz diferença.
          </p>

          {/* Bio pessoal */}
          <div className={styles.bio}>
            <p>
              Sou Antônio Rafael — estudante de Engenharia de Software, policial
              militar, casado e pai. Fundei a A&amp;R Software Development para
              construir produtos digitais que resolvem problemas reais do dia a
              dia. Trago da minha jornada disciplina, responsabilidade e uma
              obsessão por entregar software que funciona.
            </p>
          </div>

          <div className={styles.actions}>
            <a
              href="https://github.com/Ald3b4r4n"
              target="_blank"
              rel="noreferrer"
              className={styles.btnPrimary}
            >
              Ver no GitHub
              <span className={styles.arrow} aria-hidden="true">
                &rarr;
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/"
              target="_blank"
              rel="noreferrer"
              className={styles.btnSecondary}
            >
              LinkedIn
            </a>
            <a
              href="https://wa.me/5561982887294"
              target="_blank"
              rel="noreferrer"
              className={styles.btnSecondary}
            >
              WhatsApp
            </a>
          </div>

          <div className={styles.stack}>
            <span className={styles.stackLabel}>Stack principal</span>
            <div className={styles.chips}>
              <span>Python</span>
              <span>React</span>
              <span>React Native</span>
              <span>Next.js</span>
              <span>TypeScript</span>
              <span>Node.js</span>
              <span>PostgreSQL</span>
              <span>Firebase</span>
              <span>MongoDB</span>
              <span>Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
