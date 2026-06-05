# Professor, Please!

HTML5 quiz game built with Phaser and Vite.

## Run locally

Do **not** open `index.html` directly in the browser. Use the Vite dev server:

```bash
npm install
npm start
```

Then open http://localhost:5173/

Production-like preview:

```bash
npm run preview
```

Then open http://localhost:4173/

## GitHub Pages

The live site must serve the **built** bundle (not raw `src/`).

1. Push to `main` — GitHub Actions builds and commits the bundle to the `docs/` folder.
2. In repo **Settings → Pages**:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/docs`
   - **Custom domain:** leave empty
3. Open https://sinsonic.github.io/ProfessorPlease/

## CrazyGames build

```bash
npm run build
```

Upload the contents of `dist/` (relative `./` asset paths).
