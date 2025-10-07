import { useEffect, useRef } from "react";
import styles from "./RainCanvas.module.css";

export default function RainCanvas() {
  const ref = useRef(null);
  const anim = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    let w = 0,
      h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: Math.floor(w / 10) }, () => spawn());

    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * -h,
        len: 10 + Math.random() * 20,
        speed: 90 + Math.random() * 160,
        drift: -12 + Math.random() * 24,
        width: 0.8 + Math.random() * 1.4,
        alpha: 0.12 + Math.random() * 0.22,
      };
    }

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);

      // véu de neblina
      ctx.fillStyle = "rgba(210,230,255,.015)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        d.x += d.drift * dt;

        if (d.y - d.len > h || d.x < -60 || d.x > w + 60) {
          drops[i] = spawn();
          drops[i].y = -Math.random() * 120;
          continue;
        }

        ctx.globalAlpha = d.alpha;
        ctx.strokeStyle = "#cfe6ff";
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.drift * 0.12, d.y - d.len);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      anim.current = requestAnimationFrame(loop);
    };

    anim.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(anim.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className={styles.canvas} ref={ref} aria-hidden="true" />;
}
