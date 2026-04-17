import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useReducedMotion from "../../src/hooks/useReducedMotion.js";

/**
 * T037 — unit tests for the useReducedMotion hook.
 *
 * We fully stub `window.matchMedia` so each test can drive its own
 * `matches` value and `change` event stream. JSDOM doesn't implement
 * matchMedia, so this stub is the source of truth.
 */

type Handler = (e: { matches: boolean }) => void;

interface FakeMQL {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener?: ReturnType<typeof vi.fn>;
  removeListener?: ReturnType<typeof vi.fn>;
  _fire: (matches: boolean) => void;
}

function installMatchMedia(options: {
  initial: boolean;
  modern?: boolean;
}): FakeMQL {
  const { initial, modern = true } = options;
  let handler: Handler | null = null;

  const mql: FakeMQL = {
    matches: initial,
    addEventListener: vi.fn((_evt: string, h: Handler) => {
      handler = h;
    }),
    removeEventListener: vi.fn(() => {
      handler = null;
    }),
    _fire: (matches: boolean) => {
      mql.matches = matches;
      handler?.({ matches });
    },
  };

  if (!modern) {
    // Legacy-only MediaQueryList (Safari ≤ 13)
    // @ts-expect-error intentional: drop modern API to exercise fallback
    delete mql.addEventListener;
    // @ts-expect-error same as above
    delete mql.removeEventListener;
    mql.addListener = vi.fn((h: Handler) => {
      handler = h;
    });
    mql.removeListener = vi.fn(() => {
      handler = null;
    });
  }

  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return mql;
}

describe("useReducedMotion", () => {
  const originalMM = window.matchMedia;

  beforeEach(() => {
    // Reset between tests so nothing leaks.
    // @ts-expect-error override with undefined to simulate missing API
    window.matchMedia = undefined;
  });

  afterEach(() => {
    window.matchMedia = originalMM;
  });

  it("returns false when matchMedia is unavailable (SSR-like env)", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when the user prefers reduced motion on mount", () => {
    installMatchMedia({ initial: true });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false when the user does not prefer reduced motion", () => {
    installMatchMedia({ initial: false });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("updates reactively when the preference changes", () => {
    const mql = installMatchMedia({ initial: false });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => mql._fire(true));
    expect(result.current).toBe(true);

    act(() => mql._fire(false));
    expect(result.current).toBe(false);
  });

  it("cleans up the modern event listener on unmount", () => {
    const mql = installMatchMedia({ initial: false });
    const { unmount } = renderHook(() => useReducedMotion());
    expect(mql.addEventListener).toHaveBeenCalledTimes(1);
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("uses and cleans up the legacy addListener API when addEventListener is missing", () => {
    const mql = installMatchMedia({ initial: true, modern: false });
    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    expect(mql.addListener).toHaveBeenCalledTimes(1);

    act(() => mql._fire(false));
    expect(result.current).toBe(false);

    unmount();
    expect(mql.removeListener).toHaveBeenCalledTimes(1);
  });
});
