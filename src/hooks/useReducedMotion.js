import { useEffect, useState } from "react";

/**
 * useReducedMotion (T037)
 *
 * Reactive accessor for the CSS media query `prefers-reduced-motion:
 * reduce`. Returns a boolean that stays live-synced with the user's
 * OS/browser accessibility preference — if they flip the setting while
 * the app is open, components rerender.
 *
 * Design choices:
 *   - SSR/hydration-safe: initial state is `false` on both server and
 *     first client render. The subscription runs inside `useEffect`,
 *     which only fires on the client — so we never touch `window` at
 *     import/evaluation time and hydration markup matches.
 *   - Guards: `typeof window` + optional-chained `matchMedia` for
 *     environments (older SSR hosts, JSDOM variants, embedded webviews)
 *     where either is missing.
 *   - Listener compatibility: modern browsers expose `addEventListener`
 *     on `MediaQueryList`; Safari ≤ 13 only exposes the legacy
 *     `addListener`. We try both and clean up the one we attached.
 *   - Cleanup: the effect returns a teardown that removes whichever
 *     listener it registered, so there is no leak on unmount or on
 *     hot-reload.
 *
 * Intended consumers: any component running Framer Motion animations,
 * ambient CSS transitions triggered from JS, or other motion effects
 * that should be suppressed for users requesting reduced motion. The
 * hook replaces the ad-hoc helper added in T034 inside LanyardBadge.
 *
 * @returns {boolean} true when the user prefers reduced motion.
 */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Sync initial value on the client — some browsers load with the
    // preference already set, so we can't assume the default `false`.
    setReduced(mql.matches);

    const handler = (e) => setReduced(e.matches);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    // Legacy Safari fallback
    if (typeof mql.addListener === "function") {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
    return undefined;
  }, []);

  return reduced;
}
