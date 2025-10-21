import { useRef, useEffect, useMemo } from "react";
import { motion as Motion, useAnimation } from "framer-motion";
import styles from "./LanyardBadge.module.css";

export default function LanyardBadge() {
  const controls = useAnimation();
  const isInteractingRef = useRef(false);
  const stageRef = useRef(null);
  const cordRef = useRef(null);
  const loggedRef = useRef(false);
  const sMaxRef = useRef(140);

  // Física (refs para estado contínuo)
  const thetaRef = useRef(0); // rad
  const thetaVelRef = useRef(0); // rad/s
  const stretchRef = useRef(0); // px (>=0)
  const stretchVelRef = useRef(0); // px/s
  const baseLenRef = useRef(140); // px (medido da corda em repouso)
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const wasAnimatingRef = useRef(false);

  // Em dispositivos touch (pointer: coarse), use amplitude menor
  const maxAngle = useMemo(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(pointer: coarse)").matches ? 10 : 16;
    }
    return 16;
  }, []);

  const startIdle = () => {
    if (isInteractingRef.current) return;
    controls.start({
      rotate: [0, 2.6, -2.6, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    });
  };

  useEffect(() => {
    startIdle();
  }, []); // eslint-disable-line

  // Alinha horizontalmente o pivô com o botão "Projetos" no desktop
  useEffect(() => {
    const updateOffset = () => {
      const el = stageRef.current;
      if (!el) return;
      if (window.innerWidth <= 720) {
        el.style.setProperty("--pivot-x", "0px");
        return;
      }
      const stageRect = el.getBoundingClientRect();
      const anchor = document.querySelector('[data-lanyard-anchor="projects"]');
      if (!anchor) {
        el.style.setProperty("--pivot-x", "0px");
        return;
      }
      const a = anchor.getBoundingClientRect();
      const stageCenterX = stageRect.left + stageRect.width / 2;
      const anchorCenterX = a.left + a.width / 2;
      const dx = Math.round(anchorCenterX - stageCenterX);
      el.style.setProperty("--pivot-x", `${dx}px`);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    let rAF;
    const onScroll = () => {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(updateOffset);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mede comprimento base da corda (sem stretch)
    const measureBase = () => {
      try {
        if (cordRef.current) {
          const h = cordRef.current.offsetHeight; // inclui stretch atual
          // Força stretch 0 temporariamente para medir baseline verdadeira
          const prev =
            stageRef.current?.style.getPropertyValue("--stretch") || "0px";
          stageRef.current?.style.setProperty("--stretch", "0px");
          const h0 = cordRef.current.offsetHeight || h;
          baseLenRef.current = Math.max(60, h0);
          stageRef.current?.style.setProperty("--stretch", prev);
        }
      } catch {
        /* ignore */
      }
    };
    measureBase();
    const ro = new ResizeObserver(measureBase);
    if (cordRef.current) ro.observe(cordRef.current);

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rAF);
      ro.disconnect?.();
    };
  }, []);

  const onPanStart = (e) => {
    // Evita que o navegador interprete o gesto como scroll (especialmente mobile)
    try {
      e?.preventDefault?.();
    } catch {
      /* ignore */
    }
    // Eleva z-index durante a interação para garantir que fique acima do conteúdo
    try {
      const root = document.documentElement;
      root.setAttribute("data-lanyard-active", "true");
      // Garante visibilidade durante a interação
      root.style.setProperty("--lanyard-opacity", "1");
    } catch {
      /* ignore */
    }
    // Não ativa overlay ainda — só quando realmente esticar (feito no onPan)
    // Easter egg de console
    try {
      if (!loggedRef.current) {
        // Loga apenas uma vez para não poluir o console
        // Log amigável no console durante a primeira interação
        console.log("hey what are you looking for???😜");
        loggedRef.current = true;
      }
    } catch {
      /* ignore */
    }
    isInteractingRef.current = true;
    controls.stop();
    // interrompe laço de física se estiver rodando
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    wasAnimatingRef.current = false;
  };

  const onPan = (_e, info) => {
    const now = performance.now();
    const dt = Math.min(
      0.05,
      Math.max(0.001, (now - (lastTsRef.current || now)) / 1000)
    );
    lastTsRef.current = now;

    // ângulo (graus) seguindo direção do mouse
    const angleRaw = -info.offset.x * 0.12;
    const angleDeg = Math.max(-maxAngle, Math.min(maxAngle, angleRaw));

    // calcular velocidade angular antes de atualizar o estado
    const prevTheta = thetaRef.current;
    const nextTheta = (angleDeg * Math.PI) / 180;
    const estDt = dt || 1 / 60;
    const angVel = (nextTheta - prevTheta) / estDt;
    thetaRef.current = nextTheta;
    thetaVelRef.current = angVel;

    // alongamento (só para baixo) com limite responsivo
    const viewLimit = Math.max(80, Math.floor(window.innerHeight * 0.35));
    const sMax = Math.min(200, viewLimit);
    sMaxRef.current = sMax;
    const sRaw = Math.max(0, info.offset.y * 0.5);
    const s = Math.min(sMax, sRaw);
    const prevS = stretchRef.current;
    stretchRef.current = s;
    stretchVelRef.current = (s - prevS) / estDt;

    // aplica
    controls.set({ rotate: angleDeg });
    stageRef.current?.style.setProperty("--stretch", `${Math.round(s)}px`);

    // Ativa posição fixa e z-index apenas quando o alongamento passar do limiar
    try {
      const root = document.documentElement;
      const shouldOverlay = s > 24; // px de alongamento antes de sobrepor conteúdo
      if (shouldOverlay) {
        stageRef.current?.setAttribute("data-active", "true");
        root.style.setProperty("--lanyard-z", "99"); // abaixo do header (100)
        root.style.setProperty("--lanyard-opacity", "1");
      } else {
        stageRef.current?.removeAttribute("data-active");
        if (!root.hasAttribute("data-menu-open")) {
          root.style.removeProperty("--lanyard-z");
        }
      }
    } catch {
      /* ignore */
    }
  };

  const onPanEnd = async () => {
    isInteractingRef.current = false;
    // Ao terminar, se o menu não estiver aberto, podemos restaurar o z-index padrão
    try {
      const root = document.documentElement;
      root.removeAttribute("data-lanyard-active");
      if (!root.hasAttribute("data-menu-open")) {
        root.style.removeProperty("--lanyard-z");
        root.style.removeProperty("--lanyard-opacity");
      }
      stageRef.current?.removeAttribute("data-active");
    } catch {
      /* ignore */
    }
    // inicia simulação física livre
    runPhysics();
  };

  // Simulação de física simples (pêndulo + mola do alongamento)
  const runPhysics = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTsRef.current = performance.now();

    const step = () => {
      const now = performance.now();
      let dt = (now - lastTsRef.current) / 1000;
      lastTsRef.current = now;
      dt = Math.max(1 / 240, Math.min(1 / 24, dt));

      const g = 4200; // px/s^2 (ajuste visual)
      const L0 = baseLenRef.current + 20; // px (leve folga)
      const c = 1.4; // amortecimento angular
      const k = 36; // rigidez mola linear
      const d = 7.5; // amortecimento linear
      const sMax = sMaxRef.current || 140;

      let theta = thetaRef.current;
      let thetaVel = thetaVelRef.current;
      let s = stretchRef.current;
      let sVel = stretchVelRef.current;

      // Equações simples
      const L = Math.max(60, L0 + s);
      const accTheta = -(g / L) * Math.sin(theta) - c * thetaVel;
      thetaVel += accTheta * dt;
      // acoplamento por variação do comprimento (aumenta giro ao encurtar)
      thetaVel += -2 * (sVel / L) * thetaVel * dt;
      theta += thetaVel * dt;

      const accS = -k * s - d * sVel; // retorno da mola + amortecimento
      sVel += accS * dt;
      s += sVel * dt;

      // Limites e quique
      if (s < 0) {
        s = 0;
        sVel = -sVel * 0.5; // quique mais perceptível
      } else if (s > sMax) {
        s = sMax;
        sVel = -sVel * 0.45;
      }

      thetaRef.current = theta;
      thetaVelRef.current = thetaVel;
      stretchRef.current = s;
      stretchVelRef.current = sVel;

      // Aplicar ao UI
      const angleDeg = (theta * 180) / Math.PI;
      controls.set({ rotate: angleDeg });
      stageRef.current?.style.setProperty("--stretch", `${Math.round(s)}px`);

      const still =
        !isInteractingRef.current &&
        Math.abs(thetaVel) < 0.02 &&
        Math.abs(theta) < 0.01 &&
        Math.abs(s) < 0.8 &&
        Math.abs(sVel) < 0.6;

      if (isInteractingRef.current) {
        // aborta se usuário voltou a interagir
        rafRef.current = 0;
        return;
      }
      if (still) {
        rafRef.current = 0;
        // volta para idle suave
        controls.set({ rotate: 0 });
        startIdle();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.ceiling} />
      <Motion.div
        className={styles.pivot}
        animate={controls}
        style={{ transformOrigin: "50% 0%" }}
      >
        <div ref={cordRef} className={styles.cord} />
        <div className={styles.ring} />
        <div className={styles.hook} />
        <Motion.div
          className={styles.card}
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          <div className={styles.sideBand} />
          <div className={styles.photoArea}>
            {/* use /profile.jpg quando arquivo está em public/ */}
            <img
              src="/profile.jpg"
              alt="Foto de Antônio Rafael"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={styles.info}>
            <div className={styles.name}>
              ANTÔNIO
              <br />
              RAFAEL
            </div>
            <div className={styles.role}>Full Stack Developer</div>
            <div className={styles.meta}>A&R Software Development</div>
          </div>
          <div className={styles.gloss} />
        </Motion.div>
      </Motion.div>
    </div>
  );
}
