import { useRef, useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import styles from "./LanyardBadge.module.css";

export default function LanyardBadge() {
  const controls = useAnimation();
  const isInteractingRef = useRef(false);

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

  const onPanStart = () => {
    isInteractingRef.current = true;
    controls.stop();
  };

  const onPan = (_e, info) => {
    const angle = Math.max(-maxAngle, Math.min(maxAngle, info.offset.x * 0.12));
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
      <div className={styles.ceiling} />
      <motion.div
        className={styles.pivot}
        animate={controls}
        style={{ transformOrigin: "50% 0%" }}
      >
        <div className={styles.cord} />
        <div className={styles.ring} />
        <div className={styles.hook} />
        <motion.div
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
        </motion.div>
      </motion.div>
    </div>
  );
}
