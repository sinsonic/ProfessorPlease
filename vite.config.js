import { defineConfig } from "vite";

// CrazyGames (and many portals) host games under a subpath; relative asset URLs avoid 404s.
export default defineConfig({
  base: "./",
});
