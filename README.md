# Buy Me a Cotton Candy

A satirical, SEO-first static website that parodies creator support pages with fake checkout humor.

## Highlights

- Astro-powered static output for GitHub Pages
- Crawlable pages for `/`, `/tiers/`, `/faq/`, and `/flavors/`
- Canonical, Open Graph, Twitter Card, and JSON-LD metadata
- Shareable URL state using query params:
  - `tier=mini-puff|blue-whirl|galaxy-fluff`
  - `flavor=<flavor-slug>`
  - `theme=sky|sunset|carnival`
  - `receipt=<receipt-code>`
- Theme presets + custom tagline persisted in `localStorage`
- Daily absurd flavor generated from a date seed

## Project structure

- `src/pages/` - Astro routes and page content
- `src/layouts/BaseLayout.astro` - shared SEO/meta layout
- `src/styles/site.css` - global styles and theme variables
- `src/scripts/site-app.ts` - client interactions and share flows
- `src/lib/` - typed content, URL state, and daily flavor logic
- `tests/` - unit and integration tests
- `public/` - static assets (`CNAME`, images, `robots.txt`, `sitemap.xml`)
- `scripts/validate-dist-seo.mjs` - build artifact SEO validation

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:4321](http://localhost:4321).

## Build and test

```bash
npm run build
npm run test
npm run test:seo
```

## Image assets in use

- `public/assets/cotton-candy.png` is the primary brand image and default social share preview.

## GitHub Pages deployment

The workflow at `.github/workflows/pages.yml`:

1. Installs dependencies
2. Builds Astro output to `dist/`
3. Validates SEO artifacts (canonical/meta/JSON-LD + sitemap + robots)
4. Deploys `dist/` to GitHub Pages

## Satire note

This project is parody and UI experimentation only. It does not process real payments or collect payment credentials.
