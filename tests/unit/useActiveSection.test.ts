/**
 * T050 — Unit tests for useActiveSection hook.
 *
 * The hook manages which navigation section is currently active. In the
 * current tab-based architecture, it holds a simple state + setter; the
 * typed API ensures only known section IDs are accepted.
 *
 * Reference: data-model.md §NavigationSection
 */

import { renderHook, act } from "@testing-library/react";
import { useActiveSection, SECTIONS, type SectionId } from "../../src/hooks/useActiveSection.ts";

// ---------------------------------------------------------------------------
// SECTIONS constant
// ---------------------------------------------------------------------------
describe("SECTIONS constant", () => {
  it("exports a non-empty array of NavigationSection objects", () => {
    expect(Array.isArray(SECTIONS)).toBe(true);
    expect(SECTIONS.length).toBeGreaterThanOrEqual(3);
  });

  it("each section has id, label, and href", () => {
    for (const s of SECTIONS) {
      expect(typeof s.id).toBe("string");
      expect(typeof s.label).toBe("string");
      expect(typeof s.href).toBe("string");
      expect(s.href.startsWith("#")).toBe(true);
    }
  });

  it("includes about, projects, and contact sections", () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(ids).toContain("about");
    expect(ids).toContain("projects");
    expect(ids).toContain("contact");
  });
});

// ---------------------------------------------------------------------------
// useActiveSection hook
// ---------------------------------------------------------------------------
describe("useActiveSection", () => {
  it("returns activeSection and setActiveSection", () => {
    const { result } = renderHook(() => useActiveSection());
    expect(result.current).toHaveProperty("activeSection");
    expect(result.current).toHaveProperty("setActiveSection");
    expect(typeof result.current.setActiveSection).toBe("function");
  });

  it("defaults to 'about'", () => {
    const { result } = renderHook(() => useActiveSection());
    expect(result.current.activeSection).toBe("about");
  });

  it("accepts a custom initial section", () => {
    const { result } = renderHook(() => useActiveSection("projects"));
    expect(result.current.activeSection).toBe("projects");
  });

  it("updates active section when setActiveSection is called", () => {
    const { result } = renderHook(() => useActiveSection());
    act(() => {
      result.current.setActiveSection("contact");
    });
    expect(result.current.activeSection).toBe("contact");
  });

  it("can cycle through all known sections", () => {
    const { result } = renderHook(() => useActiveSection());
    const knownIds: SectionId[] = ["about", "projects", "contact"];
    for (const id of knownIds) {
      act(() => {
        result.current.setActiveSection(id);
      });
      expect(result.current.activeSection).toBe(id);
    }
  });

  it("returns a stable setActiveSection reference across renders", () => {
    const { result, rerender } = renderHook(() => useActiveSection());
    const firstRef = result.current.setActiveSection;
    rerender();
    expect(result.current.setActiveSection).toBe(firstRef);
  });

  it("returns the correct section after multiple rapid updates", () => {
    const { result } = renderHook(() => useActiveSection());
    act(() => {
      result.current.setActiveSection("projects");
      result.current.setActiveSection("contact");
      result.current.setActiveSection("about");
    });
    expect(result.current.activeSection).toBe("about");
  });
});
