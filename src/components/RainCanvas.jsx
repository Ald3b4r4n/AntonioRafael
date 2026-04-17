import { useEffect, useRef } from "react";
import styles from "./RainCanvas.module.css";
import useReducedMotion from "../hooks/useReducedMotion.js";

/**
 * RainCanvas — realistic storm with:
 *   1. Volumetric clouds drifting across the screen
 *   2. Rain drops with depth layers (near + far), wind drift, varying opacity
 *   3. Splash particles on impact
 *   4. Lightning bolts with branching + screen flash
 *   5. Distant mist/fog layer
 *
 * Respects prefers-reduced-motion: unmounts entirely.
 */
export default function RainCanvas() {
  const ref = useRef(null);
  const anim = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });

    const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
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

    // =====================================================================
    // WIND — slowly drifting direction
    // =====================================================================
    let windAngle = -0.06;
    let windTarget = -0.06;
    let windTimer = 0;
    let windStrength = 100; // px/s horizontal component

    // =====================================================================
    // CLOUDS — soft volumetric blobs drifting horizontally
    // =====================================================================
    function spawnCloud() {
      const size = 200 + Math.random() * 400;
      return {
        x: -size + Math.random() * (w + size * 2),
        y: Math.random() * h * 0.45,
        w: size,
        h: size * (0.35 + Math.random() * 0.3),
        speed: 8 + Math.random() * 20,
        alpha: 0.02 + Math.random() * 0.05,
        // Multiple ellipse sub-blobs for organic shape
        blobs: Array.from({ length: 3 + Math.floor(Math.random() * 4) }, () => ({
          ox: (Math.random() - 0.5) * size * 0.6,
          oy: (Math.random() - 0.5) * size * 0.15,
          rx: size * (0.25 + Math.random() * 0.35),
          ry: size * (0.12 + Math.random() * 0.18),
        })),
      };
    }

    const CLOUD_COUNT = Math.min(Math.max(Math.floor(w / 180), 4), 10);
    const clouds = Array.from({ length: CLOUD_COUNT }, spawnCloud);

    // =====================================================================
    // RAIN — two depth layers: far (small, slow, dim) + near (big, fast, bright)
    // =====================================================================
    const NEAR_COUNT = Math.min(Math.floor(w / 7), 180);
    const FAR_COUNT = Math.min(Math.floor(w / 12), 100);

    function spawnDrop(layer) {
      const isFar = layer === "far";
      const speed = isFar
        ? 200 + Math.random() * 250
        : 500 + Math.random() * 450;
      const len = isFar
        ? 6 + Math.random() * 14
        : 14 + Math.random() * 30;
      return {
        x: Math.random() * (w + 200) - 100,
        y: -Math.random() * h * 1.4,
        len,
        speed,
        width: isFar ? 0.4 + Math.random() * 0.6 : 0.7 + Math.random() * 1.3,
        alpha: isFar ? 0.04 + Math.random() * 0.08 : 0.1 + Math.random() * 0.2,
        layer,
      };
    }

    const drops = [
      ...Array.from({ length: FAR_COUNT }, () => spawnDrop("far")),
      ...Array.from({ length: NEAR_COUNT }, () => spawnDrop("near")),
    ];

    // =====================================================================
    // SPLASHES
    // =====================================================================
    const splashes = [];
    const MAX_SPLASHES = 80;

    function spawnSplash(x, y) {
      if (splashes.length >= MAX_SPLASHES) return;
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        splashes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 70,
          vy: -(15 + Math.random() * 45),
          life: 1,
          decay: 2.8 + Math.random() * 2.2,
          size: 0.6 + Math.random() * 1.4,
        });
      }
    }

    // =====================================================================
    // LIGHTNING
    // =====================================================================
    let lightningAlpha = 0;
    let lightningCooldown = 4 + Math.random() * 10;
    let lightningBranches = [];

    function branch(x, y, angle, depth, maxD) {
      if (depth > maxD) return;
      const segLen = 18 + Math.random() * 45;
      const ex = x + Math.cos(angle) * segLen;
      const ey = y + Math.sin(angle) * segLen;
      lightningBranches.push({
        x1: x, y1: y, x2: ex, y2: ey,
        width: Math.max(0.4, 3.5 - depth * 0.55),
        alpha: Math.max(0.15, 1 - depth * 0.18),
      });
      branch(ex, ey, angle + (Math.random() - 0.5) * 0.55, depth + 1, maxD);
      if (Math.random() < 0.4) {
        const side = Math.random() < 0.5 ? -1 : 1;
        branch(
          ex, ey,
          angle + side * (0.35 + Math.random() * 0.55),
          depth + 1,
          Math.min(maxD, depth + 2 + Math.floor(Math.random() * 2))
        );
      }
    }

    function triggerLightning() {
      lightningBranches = [];
      const sx = w * (0.12 + Math.random() * 0.76);
      branch(sx, 0, Math.PI / 2 + (Math.random() - 0.5) * 0.25, 0, 7 + Math.floor(Math.random() * 5));
      lightningAlpha = 1;
      // Sometimes double-flash
      if (Math.random() < 0.3) {
        setTimeout(() => { lightningAlpha = Math.max(lightningAlpha, 0.7); }, 80);
      }
      lightningCooldown = 6 + Math.random() * 14;
    }

    // =====================================================================
    // MAIN LOOP
    // =====================================================================
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);

      // --- Wind ---
      windTimer -= dt;
      if (windTimer <= 0) {
        windTarget = -0.1 + Math.random() * 0.2;
        windStrength = 80 + Math.random() * 80;
        windTimer = 2.5 + Math.random() * 4;
      }
      windAngle += (windTarget - windAngle) * dt * 0.4;
      const windDx = Math.sin(windAngle) * windStrength;

      // --- Clouds (behind everything else) ---
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x += (c.speed + windDx * 0.15) * dt;

        // Wrap around
        if (c.x - c.w > w + 100) {
          c.x = -c.w - Math.random() * 200;
          c.y = Math.random() * h * 0.45;
        }
        if (c.x + c.w < -200) {
          c.x = w + Math.random() * 200;
          c.y = Math.random() * h * 0.45;
        }

        // Draw cloud — composite of soft radial ellipses
        for (const b of c.blobs) {
          const grd = ctx.createRadialGradient(
            c.x + b.ox, c.y + b.oy, 0,
            c.x + b.ox, c.y + b.oy, Math.max(b.rx, b.ry)
          );
          // Lightning illumination boost
          const boost = lightningAlpha > 0.3 ? lightningAlpha * 0.04 : 0;
          grd.addColorStop(0, `rgba(180, 200, 220, ${c.alpha + boost})`);
          grd.addColorStop(0.5, `rgba(140, 165, 190, ${c.alpha * 0.5 + boost * 0.5})`);
          grd.addColorStop(1, "rgba(140, 165, 190, 0)");

          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.ellipse(c.x + b.ox, c.y + b.oy, b.rx, b.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Lightning flash (full-screen glow) ---
      if (lightningAlpha > 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${lightningAlpha * 0.07})`;
        ctx.fillRect(0, 0, w, h);
        lightningAlpha -= dt * 3;
        if (lightningAlpha < 0) lightningAlpha = 0;
      }

      // --- Lightning branches ---
      if (lightningAlpha > 0.04) {
        ctx.save();
        ctx.shadowColor = "rgba(170, 200, 255, 0.9)";
        ctx.shadowBlur = 10;
        for (const b of lightningBranches) {
          ctx.globalAlpha = b.alpha * lightningAlpha;
          ctx.strokeStyle = "#d0e2ff";
          ctx.lineWidth = b.width;
          ctx.beginPath();
          ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(b.x2, b.y2);
          ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // --- Lightning timer ---
      lightningCooldown -= dt;
      if (lightningCooldown <= 0) triggerLightning();

      // --- Far rain layer (drawn first — behind near drops) ---
      ctx.lineCap = "round";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const layerWind = d.layer === "far" ? windDx * 0.5 : windDx;
        d.y += d.speed * dt;
        d.x += layerWind * dt;

        if (d.y > h) {
          if (d.layer === "near" && Math.random() < 0.25) spawnSplash(d.x, h);
          drops[i] = spawnDrop(d.layer);
          drops[i].y = -Math.random() * 60;
          continue;
        }
        if (d.x < -100 || d.x > w + 100) {
          drops[i] = spawnDrop(d.layer);
          drops[i].y = -Math.random() * 60;
          continue;
        }

        // Angle the drop tail opposite to wind
        const windOffset = layerWind * dt * (d.len / Math.max(1, d.speed * dt)) * 0.25;
        const tx = d.x - windOffset;
        const ty = d.y - d.len;

        ctx.globalAlpha = d.alpha;
        ctx.strokeStyle = d.layer === "far" ? "#9ab8d4" : "#c0daf0";
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // --- Splashes ---
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 200 * dt;
        s.life -= s.decay * dt;
        if (s.life <= 0) { splashes.splice(i, 1); continue; }

        ctx.globalAlpha = s.life * 0.35;
        ctx.fillStyle = "#c8ddf0";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- Ground mist (subtle fog at bottom) ---
      const mistGrd = ctx.createLinearGradient(0, h - 80, 0, h);
      mistGrd.addColorStop(0, "rgba(12, 24, 38, 0)");
      mistGrd.addColorStop(1, "rgba(12, 24, 38, 0.15)");
      ctx.fillStyle = mistGrd;
      ctx.fillRect(0, h - 80, w, 80);

      anim.current = requestAnimationFrame(loop);
    };

    anim.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(anim.current);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas className={styles.canvas} ref={ref} aria-hidden="true" />;
}
