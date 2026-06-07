import { publicAssetUrl } from "./assetUrl";

export const PROF_AVATAR_OPEN_KEY = "prof-avatar-open";
export const PROF_AVATAR_CLOSED_KEY = "prof-avatar-closed";
export const PROF_AVATAR_OPEN_PATH = "images/profavatar.png";
export const PROF_AVATAR_CLOSED_PATH = "images/profavatarclosed.png";

/** Tuned for backgroundprof.png desk line (~y=1540). */
export const PROF_AVATAR_LAYOUT = {
  x: 230,
  y: 1750,
  height: 620,
};

export function preloadProfessorAvatar(scene) {
  if (!scene.textures.exists(PROF_AVATAR_OPEN_KEY)) {
    scene.load.image(PROF_AVATAR_OPEN_KEY, publicAssetUrl(PROF_AVATAR_OPEN_PATH));
  }
  if (!scene.textures.exists(PROF_AVATAR_CLOSED_KEY)) {
    scene.load.image(PROF_AVATAR_CLOSED_KEY, publicAssetUrl(PROF_AVATAR_CLOSED_PATH));
  }
}

export function hasProfessorAvatar(scene) {
  return scene.textures.exists(PROF_AVATAR_OPEN_KEY)
    && scene.textures.exists(PROF_AVATAR_CLOSED_KEY);
}

export function createProfessorAvatar(scene, layout = PROF_AVATAR_LAYOUT) {
  if (!hasProfessorAvatar(scene)) return null;

  const { x, y, height } = layout;
  const container = scene.add.container(x, y);
  const sprite = scene.add.image(0, 0, PROF_AVATAR_OPEN_KEY).setOrigin(0.5, 1);
  sprite.setScale(height / sprite.height);
  container.add(sprite);

  const blinkClosedMs = 140;
  let blinkTimer = null;

  const scheduleBlink = () => {
    blinkTimer = scene.time.delayedCall(Phaser.Math.Between(2400, 5200), () => {
      if (!sprite.active || !scene.sys?.isActive()) return;
      sprite.setTexture(PROF_AVATAR_CLOSED_KEY);
      scene.time.delayedCall(blinkClosedMs, () => {
        if (!sprite.active || !scene.sys?.isActive()) return;
        sprite.setTexture(PROF_AVATAR_OPEN_KEY);
        scheduleBlink();
      });
    });
  };

  scheduleBlink();

  container.once("destroy", () => {
    if (blinkTimer) blinkTimer.remove(false);
  });

  return { container, sprite };
}

export function addDeskForegroundOverlay(scene, root) {
  const front = scene.add.rectangle(540, 1844, 1080, 152, 0x5a3d28, 0.96);
  root.add(front);
  return { front };
}

export function addProfessorBehindDesk(scene, root, { withDeskOverlay = true } = {}) {
  const avatar = createProfessorAvatar(scene);
  if (!avatar) return null;

  root.add(avatar.container);

  let deskOverlay = null;
  if (withDeskOverlay && scene.textures.exists("classroom-bg")) {
    deskOverlay = addDeskForegroundOverlay(scene, root);
  }

  return { ...avatar, deskOverlay };
}
