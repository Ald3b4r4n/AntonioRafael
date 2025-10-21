export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const proto =
    req.headers["x-forwarded-proto"] ||
    req.headers["x-forwarded-protocol"] ||
    "https";
  const base = `${proto}://${host}`.replace(/\/$/, "");

  const urls = [
    { loc: `${base}/`, changefreq: "weekly", priority: 1.0 },
    { loc: `${base}/projetos`, changefreq: "weekly", priority: 0.8 },
    { loc: `${base}/contato`, changefreq: "monthly", priority: 0.6 },
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("") +
    `</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.status(200).send(body);
}
