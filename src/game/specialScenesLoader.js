import bundledScenes from "../../public/data/specialScenes.json";
import { publicAssetUrl } from "./assetUrl";
import { gradeFromCorrectCount } from "./grades";

const VALID_GRADES = new Set(["A", "B", "C", "D", "F"]);
const VALID_COLORS = new Set(["accept", "reject", "neutral"]);
const VALID_TEMPLATES = new Set(["confrontation"]);
const VALID_ANIMATIONS = new Set(["none", "accept_bribe", "kick_out", "student_leaves", "accept_gift"]);
const VALID_PROPS = new Set(["envelope", "gift"]);

let cachedScenes = null;

function isValidEffectValue(value) {
  return value == null || Number.isFinite(Number(value));
}

function normalizeEffectValue(value) {
  return Number(value) || 0;
}

function assertValidScene(scene) {
  if (!scene || typeof scene !== "object") return false;
  if (typeof scene.id !== "string" || !scene.id.trim()) return false;
  if (typeof scene.title !== "string" || !scene.title.trim()) return false;
  if (typeof scene.description !== "string" || !scene.description.trim()) return false;
  if (!Array.isArray(scene.grades) || scene.grades.length === 0) return false;
  if (!scene.grades.every((grade) => VALID_GRADES.has(grade))) return false;

  const chance = Number(scene.chance);
  if (!Number.isFinite(chance) || chance < 0 || chance > 100) return false;

  if (!VALID_TEMPLATES.has(scene.template)) return false;
  if (typeof scene.banner !== "string" || !scene.banner.trim()) return false;
  if (scene.prop != null && scene.prop !== "" && !VALID_PROPS.has(scene.prop)) return false;
  if (!isValidEffectValue(scene.reputationChange)) return false;
  if (!isValidEffectValue(scene.moneyChange)) return false;

  const dialogue = scene.dialogue;
  if (!dialogue || typeof dialogue !== "object") return false;
  if (typeof dialogue.studentOffer !== "string" || !dialogue.studentOffer.trim()) return false;
  if (typeof dialogue.professorPrompt !== "string" || !dialogue.professorPrompt.trim()) return false;

  if (!Array.isArray(scene.choices) || scene.choices.length < 2) return false;
  for (const choice of scene.choices) {
    if (!choice || typeof choice !== "object") return false;
    if (typeof choice.id !== "string" || !choice.id.trim()) return false;
    if (typeof choice.label !== "string" || !choice.label.trim()) return false;
    if (!VALID_COLORS.has(choice.color)) return false;
    if (typeof choice.outcome !== "string" || !choice.outcome.trim()) return false;
    if (choice.animation && !VALID_ANIMATIONS.has(choice.animation)) return false;
    if (!isValidEffectValue(choice.reputationChange)) return false;
    if (!isValidEffectValue(choice.moneyChange)) return false;
  }

  return true;
}

function normalizeScenes(data) {
  const scenes = data?.scenes;
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("Invalid specialScenes.json: expected { scenes: [...] }");
  }

  const normalized = scenes
    .filter(assertValidScene)
    .map((scene) => ({
      ...scene,
      chance: Number(scene.chance),
      reputationChange: normalizeEffectValue(scene.reputationChange),
      moneyChange: normalizeEffectValue(scene.moneyChange),
      choices: scene.choices.map((choice) => ({
        ...choice,
        reputationChange: normalizeEffectValue(choice.reputationChange),
        moneyChange: normalizeEffectValue(choice.moneyChange),
      })),
    }));

  if (normalized.length === 0) {
    throw new Error("Invalid specialScenes.json: no valid scenes found");
  }

  return normalized;
}

async function fetchScenesFromDisk() {
  const response = await fetch(publicAssetUrl("data/specialScenes.json"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load specialScenes.json: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (!contentType.includes("json") && raw.trimStart().startsWith("<")) {
    throw new Error("specialScenes.json returned HTML instead of JSON");
  }

  return normalizeScenes(JSON.parse(raw));
}

export async function loadSpecialScenes() {
  if (cachedScenes && import.meta.env.PROD) return cachedScenes;

  try {
    cachedScenes = await fetchScenesFromDisk();
    return cachedScenes;
  } catch (error) {
    console.warn("Using bundled specialScenes.json fallback:", error.message);
    cachedScenes = normalizeScenes(bundledScenes);
    return cachedScenes;
  }
}

export function sceneRollPasses(chance) {
  const value = Number(chance);
  if (!Number.isFinite(value) || value <= 0) return false;
  if (value >= 100) return true;
  return Math.random() * 100 < value;
}

export function pickSpecialScene(scenes, grade) {
  if (!grade || !Array.isArray(scenes) || scenes.length === 0) return null;

  const eligible = scenes.filter((scene) => scene.grades.includes(grade));
  if (eligible.length === 0) return null;

  const triggered = eligible.filter((scene) => sceneRollPasses(scene.chance));
  if (triggered.length === 0) return null;

  const totalWeight = triggered.reduce((sum, scene) => sum + scene.chance, 0);
  let roll = Math.random() * totalWeight;
  for (const scene of triggered) {
    roll -= scene.chance;
    if (roll <= 0) return scene;
  }

  return triggered[triggered.length - 1];
}

export async function pickSpecialSceneForResult(correctCount) {
  const grade = gradeFromCorrectCount(Number(correctCount));
  const scenes = await loadSpecialScenes();
  const picked = pickSpecialScene(scenes, grade);

  if (import.meta.env.DEV) {
    const eligible = scenes.filter((scene) => scene.grades.includes(grade));
    console.info("[specialScenes]", {
      grade,
      correctCount,
      eligible: eligible.map((scene) => `${scene.id}@${scene.chance}%`),
      picked: picked?.id || null,
    });
  }

  return picked;
}

export function interpolateSceneText(template, context) {
  if (typeof template !== "string") return "";
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = context[key];
    return value == null ? "" : String(value);
  });
}

export function getChoiceEffects(scene, choice) {
  return {
    reputationChange: normalizeEffectValue(scene?.reputationChange) + normalizeEffectValue(choice?.reputationChange),
    moneyChange: normalizeEffectValue(scene?.moneyChange) + normalizeEffectValue(choice?.moneyChange),
  };
}

export function formatEffectSummary({ reputationChange = 0, moneyChange = 0 } = {}) {
  const parts = [];
  if (reputationChange !== 0) {
    parts.push(`Reputation ${reputationChange > 0 ? "+" : ""}${reputationChange}`);
  }
  if (moneyChange !== 0) {
    const sign = moneyChange > 0 ? "+" : "-";
    parts.push(`Money ${sign}$${Math.abs(moneyChange)}`);
  }
  return parts.join(" | ");
}

export function buildSceneContext({
  studentName = "Student",
  studentMajor = "",
  correctCount = 0,
  total = 5,
}) {
  const grade = gradeFromCorrectCount(Number(correctCount));
  const majorSuffix = studentMajor ? ` (${studentMajor})` : "";
  return {
    studentName,
    studentMajor,
    majorSuffix,
    grade,
    correctCount,
    total,
    result: `${correctCount}/${total}`,
  };
}
