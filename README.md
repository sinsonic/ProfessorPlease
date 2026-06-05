# Professor, Please!

HTML5 quiz game built with Phaser and Vite.

## Run locally

```bash
npm install
npm run dev
```

Production-like preview:

```bash
npm run build
npm run preview
```

## GitHub Pages

The live site must serve the **built** `dist/` output (not raw `src/`).

1. Push to `main` — the GitHub Action builds and publishes to the `gh-pages` branch.
2. In repo **Settings → Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `(root)`
   - **Custom domain:** leave empty (do not put `sinsonic.github.io/ProfessorPlease/` here)
3. Open https://sinsonic.github.io/ProfessorPlease/

## CrazyGames build

```bash
npm run build
```

Upload the contents of `dist/` (relative `./` asset paths).
