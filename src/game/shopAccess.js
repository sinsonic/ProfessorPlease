import { replaceClassroom } from "./classroomVisuals";

const CLASSROOM_OPTIONS = {
  WorldsScene: { depth: 0, paperCount: 3 },
  QuizScene: { depth: 0, paperCount: 2 },
  QuizSummaryScene: { depth: 0, paperCount: 4 },
  SpecialScene: { depth: 0, paperCount: 5 },
  DayEndScene: { depth: 0, paperCount: 2 },
};

export function refreshSceneClassroom(sceneInstance) {
  const options = CLASSROOM_OPTIONS[sceneInstance.scene.key];
  if (!options) return;

  sceneInstance.classroom = replaceClassroom(
    sceneInstance,
    sceneInstance.classroom,
    options,
  );
}

export function openShop(scene) {
  const parentScene = scene.scene.key;
  if (scene.scene.isActive("ShopScene")) return;

  scene.scene.launch("ShopScene", { parentScene });
  scene.scene.pause(parentScene);
}

export function createShopIcon(scene, { depth = 55, x = 980, y = 1840 } = {}) {
  const container = scene.add.container(x, y).setDepth(depth);

  const shadow = scene.add.ellipse(4, 6, 108, 108, 0x000000, 0.12);
  const bg = scene.add.circle(0, 0, 54, 0x2b9f89, 1)
    .setStrokeStyle(4, 0xffffff, 1)
    .setInteractive({ useHandCursor: true });

  const bag = scene.add.text(0, -6, "$", {
    fontFamily: "Arial",
    fontSize: "42px",
    fontStyle: "bold",
    color: "#ffffff",
  }).setOrigin(0.5);

  const label = scene.add.text(0, 40, "SHOP", {
    fontFamily: "Arial",
    fontSize: "20px",
    fontStyle: "bold",
    color: "#1e2b57",
    backgroundColor: "#fffdf7",
    padding: { x: 8, y: 2 },
  }).setOrigin(0.5);

  bg.on("pointerdown", () => openShop(scene));
  container.add([shadow, bg, bag, label]);
  return container;
}

export function exitShop(scene, parentScene) {
  scene.scene.stop("ShopScene");
  if (parentScene && scene.scene.isPaused(parentScene)) {
    scene.scene.resume(parentScene);
    const parent = scene.scene.get(parentScene);
    if (parent) refreshSceneClassroom(parent);
    return;
  }
  scene.scene.start("WorldsScene");
}
