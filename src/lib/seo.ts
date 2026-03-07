import { BASE_URL, SITE_DESCRIPTION, SITE_NAME, type FaqItem } from "./site-content";

interface WebPageSchemaOptions {
  title: string;
  description: string;
  path: string;
}

export function buildCanonical(path: string): string {
  return new URL(path, BASE_URL).toString();
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    description: SITE_DESCRIPTION
  };
}

export function buildWebPageSchema(options: WebPageSchemaOptions) {
  const canonical = buildCanonical(options.path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    description: options.description,
    url: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL
    }
  };
}

export function buildFaqSchema(faqItems: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a
      }
    }))
  };
}
