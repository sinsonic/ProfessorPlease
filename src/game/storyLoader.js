import bundledStory from "../../public/data/story.json";
import { publicAssetUrl } from "./assetUrl";

let cachedStory = null;

function assertValidBeat(beat) {
  if (!beat || typeof beat !== "object") return false;
  if (!Number.isFinite(beat.day) || beat.day < 0) return false;
  if (typeof beat.title !== "string" || !beat.title.trim()) return false;
  if (typeof beat.text !== "string" || !beat.text.trim()) return false;
  if (beat.cinematic != null && typeof beat.cinematic !== "string") return false;
  return true;
}

function normalizeStory(data) {
  const beats = data?.story;
  if (!Array.isArray(beats) || beats.length === 0) {
    throw new Error("Invalid story.json: expected { story: [...] }");
  }

  const normalized = beats.filter(assertValidBeat);
  if (normalized.length === 0) {
    throw new Error("Invalid story.json: no valid story beats");
  }

  return normalized.sort((a, b) => a.day - b.day);
}

function loadBundledStoryBeats() {
  if (!cachedStory) {
    cachedStory = normalizeStory(bundledStory);
  }
  return cachedStory;
}

async function fetchStoryJson() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    return await fetch(publicAssetUrl("data/story.json"), { signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getBundledStoryBeatForDay(day) {
  return loadBundledStoryBeats().find((beat) => beat.day === day) || null;
}

export async function loadStoryBeats() {
  if (cachedStory) return cachedStory;

  try {
    const response = await fetchStoryJson();
    if (response.ok) {
      cachedStory = normalizeStory(await response.json());
      return cachedStory;
    }
  } catch (error) {
    console.warn("Failed to fetch story.json, using bundled copy:", error);
  }

  return loadBundledStoryBeats();
}

export async function getStoryBeatForDay(day) {
  const beats = await loadStoryBeats();
  return beats.find((beat) => beat.day === day) || null;
}
