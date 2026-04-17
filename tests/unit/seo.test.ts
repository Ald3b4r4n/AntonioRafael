/**
 * T048 — TDD Red: unit tests for src/utils/seo.ts (not yet implemented).
 *
 * These tests define the public contract for the SEO schema builder
 * functions extracted from the current inline implementation in SEO.jsx.
 * All tests MUST fail until T049 creates the implementation.
 *
 * Reference:
 *   - data-model.md §SEOProps
 *   - plan.md §7 (SEO Implementation Design)
 *   - Existing SEO.jsx (lines 139–168) for current inline schemas
 *   - Schema.org specifications: Person, WebSite, BreadcrumbList
 */

import {
  buildPersonSchema,
  buildWebsiteSchema,
  buildCanonicalUrl,
  buildFullTitle,
} from "../../src/utils/seo.ts";

// ---------------------------------------------------------------------------
// buildPersonSchema
// ---------------------------------------------------------------------------
describe("buildPersonSchema", () => {
  const baseUrl = "https://example.com";

  it("returns a valid Schema.org Person object", () => {
    const schema = buildPersonSchema({ baseUrl });
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
  });

  it("includes @id anchored to baseUrl", () => {
    const schema = buildPersonSchema({ baseUrl });
    expect(schema["@id"]).toBe(`${baseUrl}/#person`);
  });

  it("includes name, jobTitle, and url", () => {
    const schema = buildPersonSchema({ baseUrl });
    expect(schema.name).toEqual(expect.any(String));
    expect((schema.name as string).length).toBeGreaterThan(0);
    expect(schema.jobTitle).toEqual(expect.any(String));
    expect(schema.url).toBe(baseUrl);
  });

  it("includes sameAs array with at least GitHub and LinkedIn", () => {
    const schema = buildPersonSchema({ baseUrl });
    expect(Array.isArray(schema.sameAs)).toBe(true);
    const links = schema.sameAs as string[];
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links.some((l: string) => l.includes("github.com"))).toBe(true);
    expect(links.some((l: string) => l.includes("linkedin.com"))).toBe(true);
  });

  it("returns deterministic output for the same input", () => {
    const a = buildPersonSchema({ baseUrl });
    const b = buildPersonSchema({ baseUrl });
    expect(a).toEqual(b);
  });

  it("strips trailing slash from baseUrl", () => {
    const schema = buildPersonSchema({ baseUrl: "https://example.com/" });
    expect(schema.url).toBe("https://example.com");
    expect(schema["@id"]).toBe("https://example.com/#person");
  });

  it("produces valid JSON when stringified", () => {
    const schema = buildPersonSchema({ baseUrl });
    const json = JSON.stringify(schema);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// buildWebsiteSchema
// ---------------------------------------------------------------------------
describe("buildWebsiteSchema", () => {
  const baseUrl = "https://example.com";

  it("returns a valid Schema.org WebSite object", () => {
    const schema = buildWebsiteSchema({ baseUrl });
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
  });

  it("includes url matching baseUrl", () => {
    const schema = buildWebsiteSchema({ baseUrl });
    expect(schema.url).toBe(baseUrl);
  });

  it("includes name and inLanguage", () => {
    const schema = buildWebsiteSchema({ baseUrl });
    expect(schema.name).toEqual(expect.any(String));
    expect(schema.inLanguage).toBe("pt-BR");
  });

  it("references the Person @id via publisher", () => {
    const schema = buildWebsiteSchema({ baseUrl });
    expect(schema.publisher).toBeDefined();
    expect(schema.publisher["@id"]).toBe(`${baseUrl}/#person`);
  });

  it("accepts an optional siteName override", () => {
    const custom = "My Custom Site";
    const schema = buildWebsiteSchema({ baseUrl, siteName: custom });
    expect(schema.name).toBe(custom);
  });

  it("strips trailing slash from baseUrl", () => {
    const schema = buildWebsiteSchema({ baseUrl: "https://example.com/" });
    expect(schema.url).toBe("https://example.com");
  });

  it("returns deterministic output", () => {
    const a = buildWebsiteSchema({ baseUrl });
    const b = buildWebsiteSchema({ baseUrl });
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// buildCanonicalUrl
// ---------------------------------------------------------------------------
describe("buildCanonicalUrl", () => {
  it("joins baseUrl and path with single slash", () => {
    expect(buildCanonicalUrl("https://example.com", "/about")).toBe(
      "https://example.com/about"
    );
  });

  it("normalizes double slashes between base and path", () => {
    expect(buildCanonicalUrl("https://example.com/", "/about")).toBe(
      "https://example.com/about"
    );
  });

  it("adds leading slash to path if missing", () => {
    expect(buildCanonicalUrl("https://example.com", "about")).toBe(
      "https://example.com/about"
    );
  });

  it("returns baseUrl alone for root path", () => {
    expect(buildCanonicalUrl("https://example.com", "/")).toBe(
      "https://example.com/"
    );
  });

  it("strips trailing slash from baseUrl", () => {
    expect(buildCanonicalUrl("https://example.com/", "contact")).toBe(
      "https://example.com/contact"
    );
  });

  it("handles empty path as root", () => {
    expect(buildCanonicalUrl("https://example.com", "")).toBe(
      "https://example.com/"
    );
  });
});

// ---------------------------------------------------------------------------
// buildFullTitle
// ---------------------------------------------------------------------------
describe("buildFullTitle", () => {
  it("appends site owner name to page title", () => {
    const result = buildFullTitle("Projetos");
    expect(result).toContain("Projetos");
    // Should include the owner name as suffix
    expect(result).toContain("Antônio Rafael");
  });

  it("returns a default title when given empty string", () => {
    const result = buildFullTitle("");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("Antônio Rafael");
  });

  it("returns a default title when given undefined", () => {
    const result = buildFullTitle(undefined as unknown as string);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("Antônio Rafael");
  });

  it("does not double the separator when title already ends with it", () => {
    const result = buildFullTitle("Test —");
    // Should not contain "— —"
    expect(result).not.toMatch(/—\s*—/);
  });

  it("trims whitespace from the page title", () => {
    const result = buildFullTitle("  Contato  ");
    expect(result).toContain("Contato");
    // Should not start with spaces
    expect(result).not.toMatch(/^\s/);
  });
});
