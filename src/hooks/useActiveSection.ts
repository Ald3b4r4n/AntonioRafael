/**
 * useActiveSection (T050)
 *
 * Manages which navigation section is currently active. In the current
 * tab-based architecture, the hook holds a simple state + setter; the
 * typed API ensures only known section IDs are accepted.
 *
 * Extracted from inline `useState("about")` in App.jsx so the state
 * management is testable, typed, and reusable.
 *
 * Reference: data-model.md §NavigationSection
 */

import { useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Describes a navigable section of the site. */
export interface NavigationSection {
  /** Matches the DOM element's id attribute. */
  id: string;
  /** Display label in nav. */
  label: string;
  /** Anchor href, e.g. "#about". */
  href: string;
}

/** Union of known section IDs. */
export type SectionId = "about" | "projects" | "contact";

/** Return type of the useActiveSection hook. */
export interface UseActiveSectionReturn {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Static section config — source of truth for navigation items. */
export const SECTIONS: readonly NavigationSection[] = [
  { id: "about", label: "Sobre Mim", href: "#about" },
  { id: "projects", label: "Projetos", href: "#projects" },
  { id: "contact", label: "Entre em Contato", href: "#contact" },
] as const;

/** Default active section when the app first loads. */
const DEFAULT_SECTION: SectionId = "about";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook that manages the currently active navigation section.
 *
 * @param initialSection - Section ID to start with (defaults to "about").
 * @returns Object with `activeSection` (current ID) and `setActiveSection`.
 */
export function useActiveSection(
  initialSection: SectionId = DEFAULT_SECTION,
): UseActiveSectionReturn {
  const [activeSection, setActive] = useState<SectionId>(initialSection);

  // Wrapped in useCallback so the reference is stable across renders,
  // which avoids unnecessary re-renders in child components that receive
  // setActiveSection as a prop.
  const setActiveSection = useCallback((id: SectionId) => {
    setActive(id);
  }, []);

  return { activeSection, setActiveSection };
}
