import { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.css";
import { SECTIONS, type SectionId } from "../hooks/useActiveSection.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavProps {
  activeTab: SectionId;
  setActiveTab: (id: SectionId) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Nav({ activeTab, setActiveTab }: NavProps) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Atualiza --nav-h com a altura real do header (impacta seções que usam var(--nav-h))
  useEffect(() => {
    const update = () => {
      const h = headerRef.current?.offsetHeight ?? 72;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    update();

    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Expõe estado do menu no :root para coordenação de camadas/pointer-events
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.setAttribute("data-menu-open", "true");
      // eleva o crachá acima do menu e desabilita interação do cartão
      root.style.setProperty("--lanyard-z", "9999");
      root.style.setProperty("--lanyard-pe", "none");
      root.style.setProperty("--lanyard-opacity", "0");
    } else {
      root.removeAttribute("data-menu-open");
      // restaura valores padrão
      root.style.removeProperty("--lanyard-z");
      root.style.removeProperty("--lanyard-pe");
      root.style.removeProperty("--lanyard-opacity");
    }
    return () => root.removeAttribute("data-menu-open");
  }, [open]);

  // Easter-egg no console
  useEffect(() => {
    console.log("hey what are you looking for???😜");
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSelect = (tab: SectionId) => {
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
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`${styles.tab} ${
                  activeTab === section.id ? styles.active : ""
                }`}
                {...(section.id === "projects"
                  ? { "data-lanyard-anchor": "projects" }
                  : {})}
                onClick={() => onSelect(section.id as SectionId)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          {/* Botão "Menu" (mobile) */}
          <button
            className={styles.menuBtn}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            Menu
          </button>
        </div>

        {/* Ribbon decorativa */}
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
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`${styles.mobileItem} ${
              activeTab === section.id ? styles.active : ""
            }`}
            onClick={() => onSelect(section.id as SectionId)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </>
  );
}
