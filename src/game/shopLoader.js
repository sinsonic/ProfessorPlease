import bundledShop from "../../public/data/shop.json";
import { publicAssetUrl } from "./assetUrl";

const VALID_TYPES = new Set(["decoration", "booster"]);
const VALID_BOOSTER_EFFECTS = new Set([
  "rep_bonus",
  "salary_multiplier",
  "mistake_shield",
  "day_start_money",
]);

let cachedShop = null;

function assertValidItem(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.id !== "string" || !item.id.trim()) return false;
  if (typeof item.name !== "string" || !item.name.trim()) return false;
  if (typeof item.description !== "string" || !item.description.trim()) return false;
  if (!VALID_TYPES.has(item.type)) return false;
  const price = Number(item.price);
  if (!Number.isFinite(price) || price < 0) return false;

  if (item.type === "decoration") {
    return typeof item.decorationKey === "string" && item.decorationKey.trim();
  }

  return VALID_BOOSTER_EFFECTS.has(item.boosterEffect)
    && Number.isFinite(Number(item.boosterValue));
}

function normalizeShop(data) {
  const items = data?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid shop.json: expected { items: [...] }");
  }

  const normalized = items.filter(assertValidItem).map((item) => ({
    ...item,
    price: Number(item.price),
    boosterValue: Number(item.boosterValue) || 0,
  }));

  if (normalized.length === 0) {
    throw new Error("Invalid shop.json: no valid items found");
  }

  return {
    currency: data?.currency || "$",
    items: normalized,
  };
}

async function fetchShopFromDisk() {
  const response = await fetch(publicAssetUrl("data/shop.json"), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load shop.json: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (!contentType.includes("json") && raw.trimStart().startsWith("<")) {
    throw new Error("shop.json returned HTML instead of JSON");
  }

  return normalizeShop(JSON.parse(raw));
}

export async function loadShopCatalog() {
  if (cachedShop && import.meta.env.PROD) return cachedShop;

  try {
    cachedShop = await fetchShopFromDisk();
    return cachedShop;
  } catch (error) {
    console.warn("Using bundled shop.json fallback:", error.message);
    cachedShop = normalizeShop(bundledShop);
    return cachedShop;
  }
}
