import { publicAssetUrl } from "./assetUrl";

export const TRAIN_STATION_KEY = "intro-train-station";
export const PROFESSOR_BACK_KEY = "intro-professor-back";
export const TRAIN_STATION_PATH = "images/train_station.png";
export const PROFESSOR_BACK_PATH = "images/professor_back.png";

export function preloadIntroCutsceneAssets(scene) {
  if (!scene.textures.exists(TRAIN_STATION_KEY)) {
    scene.load.image(TRAIN_STATION_KEY, publicAssetUrl(TRAIN_STATION_PATH));
  }
  if (!scene.textures.exists(PROFESSOR_BACK_KEY)) {
    scene.load.image(PROFESSOR_BACK_KEY, publicAssetUrl(PROFESSOR_BACK_PATH));
  }
}

export function hasIntroCutsceneAssets(scene) {
  return scene.textures.exists(TRAIN_STATION_KEY)
    && scene.textures.exists(PROFESSOR_BACK_KEY);
}
