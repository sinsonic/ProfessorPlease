import { publicAssetUrl } from "./assetUrl";

export const CLASSROOM_BG_KEY = "classroom-bg";
export const CLASSROOM_BG_PATH = "images/backgroundprof.png";

export function preloadClassroomBackground(scene) {
  if (scene.textures.exists(CLASSROOM_BG_KEY)) return;
  scene.load.image(CLASSROOM_BG_KEY, publicAssetUrl(CLASSROOM_BG_PATH));
}

export function hasClassroomBackground(scene) {
  return scene.textures.exists(CLASSROOM_BG_KEY);
}

export function addClassroomBackground(scene, parent, { depth = 0, x = 540, y = 960, width = 1080, height = 1920 } = {}) {
  if (!hasClassroomBackground(scene)) return null;

  const bg = scene.add.image(x, y, CLASSROOM_BG_KEY)
    .setDisplaySize(width, height)
    .setDepth(depth);
  parent.add(bg);
  return bg;
}
