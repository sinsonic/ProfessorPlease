import bundledLevel from "../../public/data/hiddenObjectLevel.json";
import { publicAssetUrl } from "./assetUrl";

let cachedLevel = null;

function normalizeLevel(data) {
  const targets = data?.targets;
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error("Invalid hiddenObjectLevel.json: expected { targets: [...] }");
  }

  const normalized = targets
    .filter((target) => (
      typeof target?.id === "string"
      && typeof target?.label === "string"
      && Number.isFinite(Number(target?.x))
      && Number.isFinite(Number(target?.y))
    ))
    .map((target) => ({
      id: target.id,
      label: target.label,
      x: Number(target.x),
      y: Number(target.y),
      hint: typeof target.hint === "string" ? target.hint : "",
    }));

  if (normalized.length === 0) {
    throw new Error("Invalid hiddenObjectLevel.json: no valid targets found");
  }

  return {
    title: typeof data?.title === "string" ? data.title : "Hidden Desk",
    subtitle: typeof data?.subtitle === "string" ? data.subtitle : "Find all items.",
    targets: normalized,
  };
}

async function fetchLevelFromDisk() {
  const response = await fetch(publicAssetUrl("data/hiddenObjectLevel.json"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load hiddenObjectLevel.json: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (!contentType.includes("json") && raw.trimStart().startsWith("<")) {
    throw new Error("hiddenObjectLevel.json returned HTML instead of JSON");
  }

  return normalizeLevel(JSON.parse(raw));
}

export async function loadHiddenObjectLevel() {
  if (cachedLevel && import.meta.env.PROD) return cachedLevel;

  try {
    cachedLevel = await fetchLevelFromDisk();
    return cachedLevel;
  } catch (error) {
    console.warn("Using bundled hiddenObjectLevel.json fallback:", error.message);
    cachedLevel = normalizeLevel(bundledLevel);
    return cachedLevel;
  }
}
