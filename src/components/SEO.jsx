import { useEffect } from "react";

function upsertMetaByName(name, content) {
  if (typeof content === "undefined") return;
  let el =
    document.head.querySelector(
      `meta[name="${name}"][data-seo-managed="true"]`
    ) || document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  if (typeof content === "undefined") return;
  let el =
    document.head.querySelector(
      `meta[property="${property}"][data-seo-managed="true"]`
    ) || document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkRel(rel, href) {
  if (!href) return;
  let el =
    document.head.querySelector(
      `link[rel="${rel}"][data-seo-managed="true"]`
    ) || document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function injectJsonLd(id, obj) {
  const prev = document.getElementById(id);
  if (prev) prev.remove();
  if (!obj) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(obj);
  document.head.appendChild(script);
}

export default function SEO({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  jsonLd, // objeto Schema.org opcional
  siteName = "Portfólio — Antônio Rafael",
  baseUrl, // deixa dinâmico por ENV/local
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — Antônio Rafael`
      : "Antônio Rafael — Desenvolvedor Full Stack";

    // Base URL: prioridade ENV > prop > window.location.origin
    const envUrl =
      import.meta && import.meta.env && import.meta.env.VITE_SITE_URL
        ? String(import.meta.env.VITE_SITE_URL)
        : undefined;
    const originUrl =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const base = (baseUrl || envUrl || originUrl || "").replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}${cleanPath}`;

    document.title = fullTitle;

    // Meta name
    upsertMetaByName(
      "description",
      description ||
        "Portfólio de Antônio Rafael Souza Cruz de Noronha — Desenvolvedor Full Stack. Projetos, experiências e formas de contato."
    );
    upsertMetaByName("author", "Antônio Rafael Souza Cruz de Noronha");
    upsertMetaByName("robots", noIndex ? "noindex,nofollow" : "index,follow");
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", fullTitle);
    upsertMetaByName(
      "twitter:description",
      description ||
        "Portfólio de Antônio Rafael Souza Cruz de Noronha — Desenvolvedor Full Stack."
    );
    if (image) upsertMetaByName("twitter:image", image);

    // Open Graph
    upsertMetaByProperty("og:title", fullTitle);
    upsertMetaByProperty(
      "og:description",
      description ||
        "Portfólio de Antônio Rafael Souza Cruz de Noronha — Desenvolvedor Full Stack."
    );
    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:url", url);
    upsertMetaByProperty("og:site_name", siteName);
    upsertMetaByProperty("og:locale", "pt_BR");
    if (image) upsertMetaByProperty("og:image", image);

    // Canonical
    if (base) upsertLinkRel("canonical", url);

    // Alternates (quando futuro domínio existir)
    // Se quiser, defina VITE_ALT_DOMAINS separado por vírgula
    const alt =
      import.meta && import.meta.env && import.meta.env.VITE_ALT_DOMAINS
        ? String(import.meta.env.VITE_ALT_DOMAINS)
        : "";
    if (alt) {
      alt
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
        .forEach((domain) => {
          const altUrl = `${domain.replace(/\/$/, "")}${cleanPath}`;
          upsertLinkRel("alternate", altUrl);
        });
    }

    // JSON-LD
    // WebSite JSON-LD básico (ajuda a amarrar nome do autor ao site)
    const websiteJsonLd = base
      ? {
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: base,
          name: siteName,
          inLanguage: "pt-BR",
          publisher: { "@id": `${base}/#person` },
        }
      : null;

    const personJsonLd = base
      ? {
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${base}/#person`,
          name: "Antônio Rafael Souza Cruz de Noronha",
          jobTitle: "Full Stack Developer",
          url: base,
          sameAs: [
            "https://github.com/Ald3b4r4n",
            "https://www.linkedin.com/in/antonio-rafael-souza-cruz-de-noronha-249539111/",
            "https://wa.me/5561982887294",
          ],
        }
      : null;

    injectJsonLd("person-jsonld", personJsonLd);
    injectJsonLd("website-jsonld", websiteJsonLd);
    injectJsonLd("page-jsonld", jsonLd);
  }, [title, description, path, image, noIndex, jsonLd, siteName, baseUrl]);

  return null;
}
