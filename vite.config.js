import { defineConfig } from "vite";

// GitHub Pages project sites are served from /ProfessorPlease/.
// CrazyGames and local preview use relative "./" paths.
const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPages ? "/ProfessorPlease/" : "./",
});
