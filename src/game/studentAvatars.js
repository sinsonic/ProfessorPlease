import { publicAssetUrl } from "./assetUrl";
import { PROF_AVATAR_LAYOUT } from "./professorAvatar";

export const STUDENT_AVATAR_IDS = ["student1", "student2", "student3", "student4"];

const AVATAR_CONFIG = {
  student1: { textureKey: "student-avatar-1", path: "images/student1.png" },
  student2: { textureKey: "student-avatar-2", path: "images/student2.png" },
  student3: { textureKey: "student-avatar-3", path: "images/student3.png" },
  student4: { textureKey: "student-avatar-4", path: "images/student4.png" },
};

export const STUDENT_SPRITE_HEIGHT = 460;

/** Feet anchor — just in front of the desk, slightly below the professor. */
export const STUDENT_FEET_Y = PROF_AVATAR_LAYOUT.y + 50;

export function preloadStudentAvatars(scene) {
  STUDENT_AVATAR_IDS.forEach((avatarKey) => {
    const config = AVATAR_CONFIG[avatarKey];
    if (!scene.textures.exists(config.textureKey)) {
      scene.load.image(config.textureKey, publicAssetUrl(config.path));
    }
  });
}

export function avatarKeyFromStudentId(studentId) {
  const match = String(studentId || "").match(/(\d+)/);
  if (!match) return "student1";
  const index = (parseInt(match[1], 10) - 1) % STUDENT_AVATAR_IDS.length;
  return STUDENT_AVATAR_IDS[index];
}

export function resolveStudentAvatarKey(student) {
  const key = student?.avatarKey;
  if (key && AVATAR_CONFIG[key]) return key;
  return avatarKeyFromStudentId(student?.id);
}

export function hasStudentAvatar(scene, avatarKey) {
  const config = AVATAR_CONFIG[avatarKey];
  return Boolean(config && scene.textures.exists(config.textureKey));
}

export function createStudentSprite(scene, x, y, avatarKey, { height = STUDENT_SPRITE_HEIGHT } = {}) {
  const config = AVATAR_CONFIG[avatarKey] || AVATAR_CONFIG.student1;
  if (!scene.textures.exists(config.textureKey)) return null;

  const container = scene.add.container(x, y);
  const shadow = scene.add.ellipse(0, 6, 110, 28, 0x000000, 0.16);
  const sprite = scene.add.image(0, 0, config.textureKey).setOrigin(0.5, 1);
  sprite.setScale(height / sprite.height);
  container.add([shadow, sprite]);
  container.sprite = sprite;
  container.avatarKey = avatarKey;
  return container;
}

export function getStudentPropOffset(student) {
  if (student?.sprite) {
    return { x: 72, y: -Math.round(STUDENT_SPRITE_HEIGHT * 0.48) };
  }
  return { x: 48, y: 10 };
}
