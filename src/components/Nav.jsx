import styles from "./Nav.module.css";

export default function Nav({ activeTab, setActiveTab }) {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.brand}>
          <div className={styles.logo}>AR</div>
          <div className={styles.title}>
            <strong>Antônio Rafael</strong>
            <span>Portfólio</span>
          </div>
        </div>

        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "about" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("about")}
          >
            Sobre Mim
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "projects" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("projects")}
          >
            Projetos
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "contact" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("contact")}
          >
            Entre em Contato
          </button>
        </nav>
      </div>
      {/* friso angular estilizado (sem copiar o do exemplo) */}
      <div className={styles.ribbon} />
    </header>
  );
}
