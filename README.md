# Buy Me a Cotton Candy

A satirical, single-page parody of a support/tip site with a blue cotton-candy theme.

## What this is

- Static HTML, CSS, and JavaScript (no backend)
- Playful fake purchase flow (no real payments)
- Accessible and responsive single-page UX
- GitHub Pages deployment via GitHub Actions

## Project structure

- `public/index.html` - main page markup
- `public/styles.css` - theme, layout, responsive design, animation
- `public/app.js` - data/content rendering and fake checkout interactions
- `public/assets/` - custom SVG graphics
- `scripts/run-local.sh` - one-command local static server
- `public/CNAME` - custom domain value for GitHub Pages
- `.github/workflows/pages.yml` - publish workflow

## Local preview

From the repository root (recommended):

```bash
./scripts/run-local.sh
```

Then open `http://127.0.0.1:8080`.
The script auto-uses `python3`, `python`, or `npx` (in that order).

Optional overrides:

```bash
HOST=0.0.0.0 PORT=3000 ./scripts/run-local.sh
```

Manual fallback:

```bash
python3 -m http.server 8080 --directory public
```

Then open `http://localhost:8080`.

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In repository settings, open **Pages**.
3. Set source to **GitHub Actions**.
4. Ensure workflow file `.github/workflows/pages.yml` is present on `main`.
5. Push to `main` (or run the workflow manually).

## Custom domain checklist

1. Update `public/CNAME` from `your-domain.example` to your real domain.
2. Configure DNS:
- For subdomain: `CNAME` to `<username>.github.io`.
- For apex/root: `ALIAS/ANAME` (or provider-equivalent) to GitHub Pages targets.
3. In GitHub Pages settings, confirm the custom domain and enable HTTPS.

## Satire and parody note

This project is made for humor and UI experimentation. It is not affiliated with payment brands and does not process real transactions.
