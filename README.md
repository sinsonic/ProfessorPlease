# CrazyGames HTML Version

This folder is a separate project for rebuilding the game as an HTML5 web game for CrazyGames.

## Goal

- Keep the original mobile app in `app/` untouched.
- Build a browser-compatible game in this folder.
- Prepare for CrazyGames web deployment.

## Structure

- `index.html` - game entry page
- `src/main.js` - game bootstrap logic
- `src/styles.css` - basic styling

## Run locally

You can open `index.html` directly in a browser for now, or serve it locally:

```bash
cd crazygames-html
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Next migration steps

1. Define core gameplay loop in `src/main.js`.
2. Move quiz/world data into web-friendly JSON.
3. Add input handling for mouse/touch.
4. Integrate CrazyGames SDK events (ads, gameplay start/stop).
