# Professor, Please!

HTML5 quiz game built with Phaser and Vite.

## Run locally

Use the Vite dev server (entry file: `index.source.html`):

```bash
npm install
npm start
```

Then open http://localhost:5173/

Production-like preview:

```bash
npm run preview
```

## GitHub Pages

Live site: https://sinsonic.github.io/ProfessorPlease/

The repo root contains the **built** bundle (`index.html`, `assets/`, `data/`). GitHub Actions rebuilds these on every push to `main`.

Pages settings: **Deploy from branch** → `main` → `/ (root)`

## CrazyGames build

```bash
npm run build
```

Upload the contents of `dist/` (relative `./` asset paths).
