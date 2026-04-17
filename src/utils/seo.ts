/**
 * SEO schema builder utilities (T049).
 *
 * Pure, deterministic functions that produce Schema.org JSON-LD objects
 * and normalize SEO metadata. Extracted from the inline logic previously
 * living inside SEO.jsx so the schema generation is testable, reusable,
 * and type-safe.
 *
 * Reference:
 *   - data-model.md §SEOProps
 *   - plan.md §7 (SEO Implementation Design)
 *   - Schema.org: Person, WebSite
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PersonSchemaOptions {
  baseUrl: string;
}

export interface WebsiteSchemaOptions {
  baseUrl: string;
  siteName?: string;
}

/** Generic JSON-LD object — all values must be JSON-serializable. */
export type JsonLdObject = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OWNER_NAME = "Antônio Rafael Souza Cruz de Noronha";
const OWNER_JOB_TITLE = "Full Stack Developer";
const DEFAULT_SITE_NAME = "Portfólio — Antônio Rafael";
const TITLE_SEPARATOR = " — ";
const DEFAULT_TITLE = `${OWNER_NAME} — Desenvolvedor Full Stack`;
const SITE_LANGUAGE = "pt-BR";

const SAME_AS_LINKS: readonly string[] = [
  "https://github.com/Ald3b4r4n",
  "https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/",
  "https://wa.me/5561982887294",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip trailing slash(es) from a URL string. */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a Schema.org Person JSON-LD object for the site owner.
 *
 * The `@id` is anchored to `baseUrl/#person` so other schemas (e.g.
 * WebSite.publisher) can reference it without duplicating the full object.
 */
export function buildPersonSchema(opts: PersonSchemaOptions): JsonLdObject {
  const base = stripTrailingSlash(opts.baseUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}/#person`,
    name: OWNER_NAME,
    jobTitle: OWNER_JOB_TITLE,
    url: base,
    sameAs: [...SAME_AS_LINKS],
  };
}

/**
 * Build a Schema.org WebSite JSON-LD object.
 *
 * References the Person schema via `publisher.@id` so Google can
 * associate the site with the Person entity.
 */
export function buildWebsiteSchema(opts: WebsiteSchemaOptions): JsonLdObject {
  const base = stripTrailingSlash(opts.baseUrl);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: base,
    name: opts.siteName ?? DEFAULT_SITE_NAME,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": `${base}/#person` },
  };
}

/**
 * Join a base URL and path into a canonical URL.
 *
 * Normalizes double slashes and ensures consistent formatting:
 * - Strips trailing slash from base
 * - Ensures path starts with `/`
 * - Empty or "/" path produces `baseUrl/`
 */
export function buildCanonicalUrl(baseUrl: string, path: string): string {
  const base = stripTrailingSlash(baseUrl);
  const cleanPath = path === "" || path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Build the full `<title>` string by appending the owner name.
 *
 * - Falsy or empty input returns the default title.
 * - Prevents doubled separators if the title already ends with "—".
 * - Trims whitespace from the page title.
 */
export function buildFullTitle(pageTitle: string): string {
  const trimmed = (pageTitle ?? "").trim();

  if (!trimmed) {
    return DEFAULT_TITLE;
  }

  // If the title already ends with the separator character, just append the name
  if (trimmed.endsWith("—")) {
    return `${trimmed} Antônio Rafael`;
  }

  return `${trimmed}${TITLE_SEPARATOR}Antônio Rafael`;
}
