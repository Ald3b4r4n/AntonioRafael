import styles from "./Nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.row}>
        <a href="/" className={styles.brand} aria-label="Início">
          <span className={styles.brandLogo}>AR</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Antônio Rafael</span>
            <span className={styles.brandDivider} aria-hidden="true">
              {" "}
            </span>
            <span className={styles.brandSuffix}>Portfólio</span>
          </span>
        </a>

        <div className={styles.tabs} role="navigation" aria-label="Seções">
          <a className={styles.tab} href="pages/About.jsx">
            Sobre Mim
          </a>
          <a className={styles.tab} href="pages/Projects.jsx">
            Projetos
          </a>
          <a className={styles.tab} href="pages/Contact.jsx">
            Entre em Contato
          </a>
        </div>
      </div>
    </nav>
  );
}
