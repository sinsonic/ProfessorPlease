import bundledMatrix from "../../public/data/salaryMatrix.json";
import { publicAssetUrl } from "./assetUrl";

let cachedMatrix = null;

function normalizeMatrix(data) {
  const tiers = data?.tiers;
  if (!Array.isArray(tiers) || tiers.length === 0) {
    throw new Error("Invalid salaryMatrix.json: expected { tiers: [...] }");
  }

  const normalized = tiers
    .map((tier) => ({
      minReputation: Number(tier.minReputation),
      maxReputation: Number(tier.maxReputation),
      title: String(tier.title || "Professor"),
      dailySalary: Number(tier.dailySalary),
    }))
    .filter((tier) => (
      Number.isFinite(tier.minReputation)
      && Number.isFinite(tier.maxReputation)
      && Number.isFinite(tier.dailySalary)
      && tier.dailySalary >= 0
    ));

  if (normalized.length === 0) {
    throw new Error("Invalid salaryMatrix.json: no valid tiers found");
  }

  return {
    currency: data?.currency || "$",
    tiers: normalized,
  };
}

async function fetchMatrixFromDisk() {
  const response = await fetch(publicAssetUrl("data/salaryMatrix.json"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load salaryMatrix.json: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (!contentType.includes("json") && raw.trimStart().startsWith("<")) {
    throw new Error("salaryMatrix.json returned HTML instead of JSON");
  }

  return normalizeMatrix(JSON.parse(raw));
}

export async function loadSalaryMatrix() {
  if (cachedMatrix && import.meta.env.PROD) return cachedMatrix;

  try {
    cachedMatrix = await fetchMatrixFromDisk();
    return cachedMatrix;
  } catch (error) {
    console.warn("Using bundled salaryMatrix.json fallback:", error.message);
    cachedMatrix = normalizeMatrix(bundledMatrix);
    return cachedMatrix;
  }
}

export function getSalaryTier(matrix, reputation) {
  const value = Number(reputation);
  const tier = matrix.tiers.find(
    (entry) => value >= entry.minReputation && value <= entry.maxReputation,
  );
  return tier || matrix.tiers[matrix.tiers.length - 1];
}

export async function getDailySalaryForReputation(reputation) {
  const matrix = await loadSalaryMatrix();
  const tier = getSalaryTier(matrix, reputation);
  return {
    salary: tier.dailySalary,
    title: tier.title,
    currency: matrix.currency,
    tier,
  };
}
