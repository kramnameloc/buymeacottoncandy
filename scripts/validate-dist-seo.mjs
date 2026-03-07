import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");

const requiredArtifacts = [
  "index.html",
  "tiers/index.html",
  "faq/index.html",
  "flavors/index.html",
  "robots.txt",
  "sitemap.xml"
];

for (const artifact of requiredArtifacts) {
  const fullPath = join(distDir, artifact);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing build artifact: ${artifact}`);
  }
}

const seoChecks = [
  {
    file: "index.html",
    patterns: [
      'rel="canonical" href="https://buymeacottoncandy.com/"',
      'property="og:title"',
      'name="twitter:card"',
      'application/ld+json'
    ]
  },
  {
    file: "tiers/index.html",
    patterns: [
      'rel="canonical" href="https://buymeacottoncandy.com/tiers/"',
      'property="og:title"',
      'application/ld+json'
    ]
  },
  {
    file: "faq/index.html",
    patterns: [
      'rel="canonical" href="https://buymeacottoncandy.com/faq/"',
      'property="og:title"',
      'application/ld+json'
    ]
  },
  {
    file: "flavors/index.html",
    patterns: [
      'rel="canonical" href="https://buymeacottoncandy.com/flavors/"',
      'property="og:title"',
      'application/ld+json'
    ]
  }
];

for (const check of seoChecks) {
  const html = readFileSync(join(distDir, check.file), "utf8");

  for (const pattern of check.patterns) {
    if (!html.includes(pattern)) {
      throw new Error(`Missing SEO marker \"${pattern}\" in ${check.file}`);
    }
  }
}

const robots = readFileSync(join(distDir, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://buymeacottoncandy.com/sitemap.xml")) {
  throw new Error("robots.txt missing sitemap directive");
}

const sitemap = readFileSync(join(distDir, "sitemap.xml"), "utf8");
for (const path of ["/", "/tiers/", "/faq/", "/flavors/"]) {
  const canonical = `https://buymeacottoncandy.com${path}`;
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    throw new Error(`sitemap.xml missing ${canonical}`);
  }
}

console.log("SEO artifact validation passed.");
