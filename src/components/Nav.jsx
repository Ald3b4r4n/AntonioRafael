import { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.css";

export default function Nav({ activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  // Atualiza --nav-h com a altura real do header (impacta o crachá)
  useEffect(() => {
    const update = () => {
      const h = headerRef.current?.offsetHeight || 72;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    update();

    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect?.();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSelect = (tab) => {
    setActiveTab(tab);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={styles.bar}>
          <div className={styles.brand}>
            <div className={styles.logo}>AR</div>
            <div className={styles.title}>
              <strong>Antônio Rafael</strong>
              <span>Portfólio</span>
            </div>
          </div>

          {/* Tabs (desktop/tablet) */}
          <nav className={styles.tabs} aria-label="Seções">
            <button
              className={`${styles.tab} ${
                activeTab === "about" ? styles.active : ""
              }`}
              onClick={() => onSelect("about")}
            >
              Sobre Mim
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "projects" ? styles.active : ""
              }`}
              onClick={() => onSelect("projects")}
            >
              Projetos
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "contact" ? styles.active : ""
              }`}
              onClick={() => onSelect("contact")}
            >
              Entre em Contato
            </button>
          </nav>

          {/* Botão hambúrguer (mobile) */}
          <button
            className={styles.menuBtn}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        {/* Fita decorativa com “início da corda” para o crachá “sair do header” */}
        <div className={styles.ribbon} />
      </header>

      {/* Backdrop (mobile) */}
      <button
        className={`${styles.backdrop} ${open ? styles.show : ""}`}
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />

      {/* Painel móvel (mobile) */}
      <nav
        id="mobile-menu"
        className={`${styles.mobilePanel} ${open ? styles.open : ""}`}
        aria-label="Menu"
      >
        <button
          className={`${styles.mobileItem} ${
            activeTab === "about" ? styles.active : ""
          }`}
          onClick={() => onSelect("about")}
        >
          Sobre Mim
        </button>
        <button
          className={`${styles.mobileItem} ${
            activeTab === "projects" ? styles.active : ""
          }`}
          onClick={() => onSelect("projects")}
        >
          Projetos
        </button>
        <button
          className={`${styles.mobileItem} ${
            activeTab === "contact" ? styles.active : ""
          }`}
          onClick={() => onSelect("contact")}
        >
          Entre em Contato
        </button>
      </nav>
    </>
  );
}
