import { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import styles from "./LanyardBadge.module.css";

/**
 * LanyardBadge (swing-only, centrado)
 * - Pivô ancorado na barra (ceiling), sem translate durante interação.
 * - Pan horizontal controla apenas rotação (swing) no pivô.
 * - Hover do card não aplica translate/scale (só brilho), evitando “descentralizar”.
 */
export default function LanyardBadge() {
  const controls = useAnimation();
  const isInteractingRef = useRef(false);

  const startIdle = () => {
    if (isInteractingRef.current) return;
    controls.start({
      rotate: [0, 2.8, -2.8, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    });
  };

  useEffect(() => {
    startIdle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPanStart = () => {
    isInteractingRef.current = true;
    controls.stop();
  };

  const onPan = (_e, info) => {
    // deslocamento horizontal -> ângulo (sem deslocar X/Y)
    const angle = Math.max(-16, Math.min(16, info.offset.x * 0.12));
    controls.set({ rotate: angle });
  };

  const onPanEnd = async () => {
    await controls.start({
      rotate: 0,
      transition: { type: "spring", stiffness: 120, damping: 10 },
    });
    isInteractingRef.current = false;
    startIdle();
  };

  return (
    <div className={styles.stage}>
      {/* Barra fixa (âncora) */}
      <div className={styles.ceiling} />

      {/* Pivô central – só rota, não translada */}
      <motion.div
        className={styles.pivot}
        animate={controls}
        style={{ transformOrigin: "50% 0%" }}
      >
        <div className={styles.cord} />
        <div className={styles.ring} />
        <div className={styles.hook} />

        {/* Pan no cartão controla apenas swing do pivô */}
        <motion.div
          className={styles.card}
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          <div className={styles.sideBand} />
          <div className={styles.photoArea}>
            <img
              src="/profile.jpg"
              alt="Foto"
              loading="lazy"
              decoding="async"
              width="280"
              height="280"
            />
          </div>
          <div className={styles.info}>
            <div className={styles.name}>
              ANTÔNIO
              <br />
              RAFAEL
            </div>
            <div className={styles.role}>Full&nbsp;Stack&nbsp;Developer</div>
            <div className={styles.meta}>PM - Goiás</div>
          </div>
          <div className={styles.gloss} />
        </motion.div>
      </motion.div>
    </div>
  );
}
