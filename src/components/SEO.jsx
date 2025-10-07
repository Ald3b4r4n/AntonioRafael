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
  baseUrl = "https://seu-dominio.com",
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — Antônio Rafael`
      : "Antônio Rafael — Desenvolvedor Full Stack";
    const url = `${baseUrl}${path}`;

    document.title = fullTitle;

    // Meta name
    upsertMetaByName(
      "description",
      description || "Portfólio de Antônio Rafael com projetos e contato."
    );
    upsertMetaByName("robots", noIndex ? "noindex,nofollow" : "index,follow");
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", fullTitle);
    upsertMetaByName(
      "twitter:description",
      description || "Portfólio de Antônio Rafael com projetos e contato."
    );
    if (image) upsertMetaByName("twitter:image", image);

    // Open Graph
    upsertMetaByProperty("og:title", fullTitle);
    upsertMetaByProperty(
      "og:description",
      description || "Portfólio de Antônio Rafael com projetos e contato."
    );
    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:url", url);
    upsertMetaByProperty("og:site_name", siteName);
    if (image) upsertMetaByProperty("og:image", image);

    // Canonical
    upsertLinkRel("canonical", url);

    // JSON-LD
    injectJsonLd("page-jsonld", jsonLd);
  }, [title, description, path, image, noIndex, jsonLd, siteName, baseUrl]);

  return null;
}
