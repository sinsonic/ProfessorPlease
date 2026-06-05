export function createHiddenObjectButton(scene, { depth = 55, x = 100, y = 1840 } = {}) {
  const container = scene.add.container(x, y).setDepth(depth);

  const shadow = scene.add.ellipse(4, 6, 108, 108, 0x000000, 0.12);
  const bg = scene.add.circle(0, 0, 54, 0x7c3aed, 1)
    .setStrokeStyle(4, 0xffffff, 1)
    .setInteractive({ useHandCursor: true });

  const icon = scene.add.text(0, -6, "?", {
    fontFamily: "Arial",
    fontSize: "42px",
    fontStyle: "bold",
    color: "#ffffff",
  }).setOrigin(0.5);

  const label = scene.add.text(0, 40, "DESK", {
    fontFamily: "Arial",
    fontSize: "20px",
    fontStyle: "bold",
    color: "#1e2b57",
    backgroundColor: "#fffdf7",
    padding: { x: 8, y: 2 },
  }).setOrigin(0.5);

  bg.on("pointerdown", () => {
    scene.scene.start("HiddenObjectScene");
  });

  container.add([shadow, bg, icon, label]);
  return container;
}
