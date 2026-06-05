import { defineConfig } from "vite";

// pages mode: GitHub Pages at https://sinsonic.github.io/ProfessorPlease/
// default mode: local dev, preview, and CrazyGames (relative "./" paths)
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/ProfessorPlease/" : "./",
}));
