import { NavLink, Link } from "react-router-dom";
import styles from "./Nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.row}>
        <Link to="/" className={styles.brand} aria-label="Início">
          <span className={styles.brandLogo}>AR</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Antônio Rafael</span>
            <span className={styles.brandDivider} aria-hidden="true">
              {" "}
            </span>
            <span className={styles.brandSuffix}>Portfólio</span>
          </span>
        </Link>

        <div className={styles.tabs} role="navigation" aria-label="Seções">
          {/* NavLink adiciona automaticamente aria-current="page" quando ativo */}
          <NavLink to="/" end className={styles.tab}>
            Sobre Mim
          </NavLink>
          <NavLink to="/projetos" className={styles.tab}>
            Projetos
          </NavLink>
          <NavLink to="/contato" className={styles.tab}>
            Entre em Contato
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
