/** Resolve public-folder paths for both dev (/) and production with base: "./". */
export function publicAssetUrl(path) {
  const normalized = String(path).replace(/^\//, "");
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? `${base}${normalized}` : `${base}/${normalized}`;
}
