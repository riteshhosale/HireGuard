import { useEffect } from "react";

const DEFAULT_SITE_URL = "https://job-guardai-musa.vercel.app";
const SITE_NAME = "HireGuard AI";
const DEFAULT_DESCRIPTION = "HireGuard AI investigates job postings for suspicious redirects, unsafe URLs, credential collection and other job-scam signals.";

function upsertMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function upsertJsonLd(data) {
  const id = "jobguard-structured-data";
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noindex = false,
  breadcrumbs = [],
  schema,
}) {
  useEffect(() => {
    const siteUrl = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
    const canonical = `${siteUrl}${path === "/" ? "/" : path}`;
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large");
    upsertMeta("name", "theme-color", "#4f46e5");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:image", `${siteUrl}/og-image.png`);
    upsertMeta("property", "og:image:alt", "HireGuard AI web security dashboard");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", `${siteUrl}/og-image.png`);
    upsertLink("canonical", canonical);

    const baseSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          url: siteUrl,
          name: SITE_NAME,
          description: DEFAULT_DESCRIPTION,
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${siteUrl}/#application`,
          name: SITE_NAME,
          applicationCategory: "SecurityApplication",
          operatingSystem: "Web",
          url: siteUrl,
          description: DEFAULT_DESCRIPTION,
        },
      ],
    };

    if (breadcrumbs.length) {
      baseSchema["@graph"].push({
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: `${siteUrl}${item.to}`,
        })),
      });
    }

    if (schema) baseSchema["@graph"].push(schema);
    upsertJsonLd(baseSchema);
  }, [title, description, path, noindex, breadcrumbs, schema]);

  return null;
}
