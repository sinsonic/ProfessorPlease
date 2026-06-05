import { TABLE } from "./classroomConstants";
import { loadCareer } from "./careerStore";

function drawDeskPlant(scene, root) {
  const pot = scene.add.rectangle(880, TABLE.y - 40, 48, 36, 0xb45309);
  const soil = scene.add.rectangle(880, TABLE.y - 58, 44, 10, 0x78350f);
  const leafA = scene.add.ellipse(868, TABLE.y - 78, 28, 18, 0x22c55e);
  const leafB = scene.add.ellipse(892, TABLE.y - 82, 24, 16, 0x16a34a);
  const leafC = scene.add.ellipse(880, TABLE.y - 96, 20, 26, 0x15803d);
  root.add([pot, soil, leafA, leafB, leafC]);
}

function drawWallDiploma(scene, root) {
  const frame = scene.add.rectangle(760, 520, 120, 90, 0xfffdf7).setStrokeStyle(4, 0xd97706);
  const inner = scene.add.rectangle(760, 520, 96, 66, 0xfef3c7);
  const text = scene.add.text(760, 520, "PhD", {
    fontFamily: "Arial",
    fontSize: "22px",
    fontStyle: "bold",
    color: "#92400e",
  }).setOrigin(0.5);
  root.add([frame, inner, text]);
}

function drawDeskLamp(scene, root) {
  const base = scene.add.rectangle(220, TABLE.y - 30, 36, 16, 0xb45309);
  const arm = scene.add.rectangle(236, TABLE.y - 58, 8, 48, 0x78716c).setRotation(0.2);
  const shade = scene.add.triangle(248, TABLE.y - 88, -22, 16, 22, 16, 0, -18, 0xfbbf24);
  const glow = scene.add.circle(250, TABLE.y - 70, 18, 0xfef08a, 0.25);
  root.add([base, arm, shade, glow]);
}

function drawFloorRug(scene, root) {
  const rug = scene.add.ellipse(540, 1680, 420, 120, 0x991b1b, 0.75).setStrokeStyle(6, 0xfbbf24);
  const pattern = scene.add.ellipse(540, 1680, 280, 70, 0xb91c1c, 0.5);
  root.add([rug, pattern]);
}

function drawGoldTrophy(scene, root) {
  const cup = scene.add.rectangle(TABLE.x - 260, TABLE.y - 50, 40, 36, 0xfbbf24).setStrokeStyle(2, 0xd97706);
  const handles = scene.add.rectangle(TABLE.x - 282, TABLE.y - 50, 10, 24, 0xfbbf24);
  const handlesR = scene.add.rectangle(TABLE.x - 238, TABLE.y - 50, 10, 24, 0xfbbf24);
  const stem = scene.add.rectangle(TABLE.x - 260, TABLE.y - 22, 12, 20, 0xd97706);
  const base = scene.add.rectangle(TABLE.x - 260, TABLE.y - 8, 36, 10, 0x92400e);
  root.add([cup, handles, handlesR, stem, base]);
}

function drawMotivationalPoster(scene, root) {
  const poster = scene.add.rectangle(300, 640, 140, 180, 0x3b82f6).setStrokeStyle(3, 0x1e3a8a);
  const text = scene.add.text(300, 640, "READ\nMORE\nBOOKS", {
    fontFamily: "Arial",
    fontSize: "20px",
    fontStyle: "bold",
    color: "#ffffff",
    align: "center",
  }).setOrigin(0.5);
  root.add([poster, text]);
}

const DECORATION_DRAWERS = {
  desk_plant: drawDeskPlant,
  wall_diploma: drawWallDiploma,
  desk_lamp: drawDeskLamp,
  floor_rug: drawFloorRug,
  gold_trophy: drawGoldTrophy,
  motivational_poster: drawMotivationalPoster,
};

export function drawOwnedDecorations(scene, root, ownedDecorations = null) {
  const owned = ownedDecorations || loadCareer().ownedDecorations || [];
  owned.forEach((key) => {
    const draw = DECORATION_DRAWERS[key];
    if (draw) draw(scene, root);
  });
}
