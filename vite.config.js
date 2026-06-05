import { defineConfig } from "vite";

// pages mode: GitHub Pages at https://sinsonic.github.io/ProfessorPlease/
// default mode: local dev, preview, and CrazyGames (relative "./" paths)
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/ProfessorPlease/" : "./",
  build: {
    rollupOptions: {
      input: "index.source.html",
    },
  },
  plugins: [
    {
      name: "dev-html-entry",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url?.split("?")[0];
          if (url === "/" || url === "/index.html") {
            req.url = "/index.source.html";
          }
          next();
        });
      },
    },
  ],
}));
