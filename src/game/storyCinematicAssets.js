import { publicAssetUrl } from "./assetUrl";

export const STORY_CINEMATIC_KEYS = {
  day1: {
    imageKey: "story-cinematic-day1",
    imagePath: "images/day1.webp",
    dustKey: "story-cinematic-dust",
    dustPath: "images/dust.webp",
  },
};

export function preloadStoryCinematic(scene, cinematicId) {
  const config = STORY_CINEMATIC_KEYS[cinematicId];
  if (!config) return;

  if (!scene.textures.exists(config.imageKey)) {
    scene.load.image(config.imageKey, publicAssetUrl(config.imagePath));
  }
  if (!scene.textures.exists(config.dustKey)) {
    scene.load.image(config.dustKey, publicAssetUrl(config.dustPath));
  }
}

export function hasStoryCinematicAssets(scene, cinematicId) {
  const config = STORY_CINEMATIC_KEYS[cinematicId];
  if (!config) return false;
  return scene.textures.exists(config.imageKey) && scene.textures.exists(config.dustKey);
}

export function getStoryCinematicConfig(cinematicId) {
  return STORY_CINEMATIC_KEYS[cinematicId] || null;
}
