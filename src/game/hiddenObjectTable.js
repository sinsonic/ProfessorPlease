import { addClassroomBackground, hasClassroomBackground } from "./classroomBackground";
import { addProfessorBehindDesk } from "./professorAvatar";

const CLUTTER = [
  { type: "book_stack", x: 260, y: 520, color: 0x7c3aed, rotation: -0.12 },
  { type: "book_stack", x: 780, y: 480, color: 0x2563eb, rotation: 0.08 },
  { type: "book_stack", x: 140, y: 920, color: 0xb45309, rotation: 0.15 },
  { type: "paper_stack", x: 620, y: 720, rotation: 0.04 },
  { type: "paper_stack", x: 340, y: 1040, rotation: -0.06 },
  { type: "paper_stack", x: 860, y: 1380, rotation: 0.1 },
  { type: "paper_stack", x: 120, y: 1380, rotation: -0.14 },
  { type: "laptop", x: 540, y: 980 },
  { type: "stapler", x: 680, y: 560 },
  { type: "stapler", x: 200, y: 1320 },
  { type: "tape_dispenser", x: 960, y: 820 },
  { type: "highlighter", x: 400, y: 640, color: 0xfacc15 },
  { type: "highlighter", x: 760, y: 1180, color: 0x4ade80 },
  { type: "highlighter", x: 500, y: 1760, color: 0xf472b6 },
  { type: "sticky_notes", x: 300, y: 580 },
  { type: "sticky_notes", x: 900, y: 1480 },
  { type: "envelope", x: 640, y: 520 },
  { type: "envelope", x: 100, y: 1080 },
  { type: "calculator", x: 820, y: 920 },
  { type: "ruler", x: 460, y: 880, rotation: 0.35 },
  { type: "ruler", x: 180, y: 1720, rotation: -0.5 },
  { type: "phone", x: 980, y: 560 },
  { type: "folder", x: 700, y: 1680, color: 0xdc2626 },
  { type: "folder", x: 60, y: 680, color: 0x059669 },
  { type: "apple", x: 1000, y: 1280 },
  { type: "eraser", x: 560, y: 1720 },
  { type: "scissors", x: 380, y: 1480 },
  { type: "plant_pot", x: 40, y: 420 },
  { type: "coaster", x: 940, y: 720 },
  { type: "binder_clip", x: 600, y: 1620 },
  { type: "binder_clip", x: 240, y: 1120 },
  { type: "pencil", x: 500, y: 600, color: 0xfbbf24 },
  { type: "pencil", x: 860, y: 1620, color: 0x78716c },
  { type: "notebook", x: 720, y: 760 },
  { type: "notebook", x: 160, y: 1620 },
  { type: "chalk", x: 420, y: 1240 },
  { type: "chalk", x: 800, y: 400 },
  { type: "usb_drive", x: 640, y: 1240 },
  { type: "badge", x: 280, y: 720 },
  { type: "crumpled_paper", x: 960, y: 1720 },
  { type: "crumpled_paper", x: 80, y: 1520 },
  { type: "ink_bottle", x: 360, y: 400 },
  { type: "bookmark", x: 580, y: 440 },
  { type: "paper_tray", x: 140, y: 1820 },
  { type: "desk_lamp_base", x: 980, y: 1820 },
];

function drawBookStack(scene, x, y, color, rotation = 0) {
  const group = scene.add.container(x, y).setRotation(rotation);
  const books = [
    { ox: 0, oy: 0, w: 90, h: 24, c: color },
    { ox: 4, oy: -18, w: 86, h: 22, c: Phaser.Display.Color.ValueToColor(color).lighten(10).color },
    { ox: -3, oy: -36, w: 92, h: 20, c: Phaser.Display.Color.ValueToColor(color).darken(8).color },
  ];
  books.forEach((book) => {
    group.add(scene.add.rectangle(book.ox, book.oy, book.w, book.h, book.c).setStrokeStyle(1, 0x1e293b, 0.2));
  });
  return group;
}

function drawPaperStack(scene, x, y, rotation = 0) {
  const group = scene.add.container(x, y).setRotation(rotation);
  for (let i = 0; i < 5; i += 1) {
    const sheet = scene.add.rectangle(i * 3 - 6, -i * 4, 110, 140, 0xfffdf7)
      .setStrokeStyle(1, 0xcbd5e1, 0.8);
    const line = scene.add.rectangle(i * 3 - 6, -i * 4 - 20, 70, 3, 0x94a3b8, 0.35);
    group.add([sheet, line]);
  }
  return group;
}

function drawLaptop(scene, x, y) {
  const group = scene.add.container(x, y);
  const base = scene.add.rectangle(0, 20, 200, 130, 0x475569).setStrokeStyle(2, 0x1e293b);
  const screen = scene.add.rectangle(0, -50, 180, 110, 0x1e293b).setStrokeStyle(3, 0x64748b);
  const glow = scene.add.rectangle(0, -50, 150, 80, 0x3b82f6, 0.35);
  group.add([base, screen, glow]);
  return group;
}

function drawStapler(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 70, 28, 0xef4444).setStrokeStyle(1, 0x991b1b));
  group.add(scene.add.rectangle(20, -8, 24, 16, 0x1e293b));
  return group;
}

function drawTapeDispenser(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 60, 40, 0x1e293b));
  group.add(scene.add.circle(0, -4, 18, 0xf8fafc, 0.9).setStrokeStyle(2, 0xcbd5e1));
  return group;
}

function drawHighlighter(scene, x, y, color) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 18, 80, color).setRotation(0.4));
  group.add(scene.add.rectangle(18, -28, 14, 14, 0x1e293b, 0.8).setRotation(0.4));
  return group;
}

function drawStickyNotes(scene, x, y) {
  const group = scene.add.container(x, y);
  const colors = [0xfef08a, 0xfbcfe8, 0xbfdbfe];
  colors.forEach((color, index) => {
    group.add(scene.add.rectangle(index * 8 - 8, -index * 6, 56, 56, color).setStrokeStyle(1, 0xd97706, 0.2));
  });
  return group;
}

function drawEnvelope(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 100, 64, 0xfef3c7).setStrokeStyle(2, 0xd97706));
  group.add(scene.add.triangle(0, -4, -46, 24, 46, 24, 0, -20, 0xeab308, 0.5));
  return group;
}

function drawCalculator(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 80, 110, 0x334155).setStrokeStyle(2, 0x1e293b));
  group.add(scene.add.rectangle(0, -28, 60, 24, 0x86efac, 0.8));
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      group.add(scene.add.rectangle(-20 + col * 20, 8 + row * 18, 14, 12, 0x64748b));
    }
  }
  return group;
}

function drawRuler(scene, x, y, rotation = 0) {
  const group = scene.add.container(x, y).setRotation(rotation);
  group.add(scene.add.rectangle(0, 0, 140, 22, 0xfbbf24).setStrokeStyle(1, 0xd97706));
  for (let i = -60; i <= 60; i += 20) {
    group.add(scene.add.rectangle(i, -4, 2, 10, 0x92400e, 0.6));
  }
  return group;
}

function drawPhone(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 54, 96, 0x1e293b).setStrokeStyle(2, 0x64748b));
  group.add(scene.add.rectangle(0, -4, 42, 72, 0x3b82f6, 0.5));
  return group;
}

function drawFolder(scene, x, y, color) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 10, 110, 80, color).setStrokeStyle(2, 0x1e293b, 0.3));
  group.add(scene.add.rectangle(-20, -24, 50, 20, color).setStrokeStyle(2, 0x1e293b, 0.3));
  return group;
}

function drawApple(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.circle(0, 0, 22, 0xef4444));
  group.add(scene.add.rectangle(0, -24, 4, 12, 0x78350f));
  group.add(scene.add.ellipse(10, -26, 14, 8, 0x22c55e));
  return group;
}

function drawEraser(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 50, 28, 0xf9a8d4).setStrokeStyle(1, 0xdb2777));
  return group;
}

function drawScissors(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(-16, 0, 10, 50, 0x94a3b8).setRotation(0.3));
  group.add(scene.add.rectangle(16, 0, 10, 50, 0x94a3b8).setRotation(-0.3));
  group.add(scene.add.circle(-8, 24, 10, 0x64748b));
  group.add(scene.add.circle(8, 24, 10, 0x64748b));
  return group;
}

function drawPlantPot(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 20, 56, 40, 0xb45309));
  group.add(scene.add.ellipse(-12, -8, 24, 16, 0x22c55e));
  group.add(scene.add.ellipse(12, -12, 20, 18, 0x16a34a));
  group.add(scene.add.ellipse(0, -24, 18, 22, 0x15803d));
  return group;
}

function drawCoaster(scene, x, y) {
  return scene.add.circle(x, y, 28, 0x78716c, 0.8).setStrokeStyle(2, 0x44403c);
}

function drawBinderClip(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 36, 14, 0x1e293b));
  group.add(scene.add.rectangle(0, -10, 28, 8, 0x64748b));
  return group;
}

function drawPencil(scene, x, y, color) {
  const group = scene.add.container(x, y).setRotation(-0.6);
  group.add(scene.add.rectangle(0, 0, 10, 90, color));
  group.add(scene.add.triangle(0, -52, -5, -40, 5, -40, 0, -58, 0xfcd34d));
  return group;
}

function drawNotebook(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 90, 120, 0x1d4ed8).setStrokeStyle(2, 0x1e3a8a));
  group.add(scene.add.rectangle(-36, 0, 8, 120, 0xffffff, 0.35));
  for (let i = -40; i <= 40; i += 20) {
    group.add(scene.add.rectangle(8, i, 50, 2, 0xffffff, 0.25));
  }
  return group;
}

function drawChalk(scene, x, y) {
  return scene.add.rectangle(x, y, 50, 12, 0xffffff, 0.9).setRotation(0.2).setStrokeStyle(1, 0xcbd5e1);
}

function drawUsbDrive(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 0, 20, 44, 0x0ea5e9));
  group.add(scene.add.rectangle(0, -20, 14, 10, 0x94a3b8));
  return group;
}

function drawBadge(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.circle(0, 0, 26, 0xf8fafc).setStrokeStyle(3, 0x2563eb));
  group.add(scene.add.text(0, 0, "ID", { fontSize: "16px", color: "#1e40af", fontStyle: "bold" }).setOrigin(0.5));
  return group;
}

function drawCrumpledPaper(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.circle(-6, 4, 22, 0xe2e8f0).setStrokeStyle(1, 0x94a3b8));
  group.add(scene.add.circle(10, -4, 18, 0xf1f5f9).setStrokeStyle(1, 0x94a3b8));
  return group;
}

function drawInkBottle(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 10, 36, 44, 0x1e3a8a));
  group.add(scene.add.rectangle(0, -16, 20, 16, 0x1e293b));
  return group;
}

function drawBookmark(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, -10, 28, 60, 0xdc2626));
  group.add(scene.add.triangle(0, 24, -14, 8, 14, 8, 0, 30, 0xdc2626));
  return group;
}

function drawPaperTray(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.rectangle(0, 20, 140, 24, 0x64748b));
  for (let i = 0; i < 4; i += 1) {
    group.add(scene.add.rectangle(i * 4 - 6, -i * 3, 100, 120, 0xfffdf7).setStrokeStyle(1, 0xcbd5e1));
  }
  return group;
}

function drawDeskLampBase(scene, x, y) {
  const group = scene.add.container(x, y);
  group.add(scene.add.ellipse(0, 16, 80, 24, 0x44403c));
  group.add(scene.add.rectangle(0, -10, 16, 50, 0x78716c));
  group.add(scene.add.circle(0, -40, 22, 0xfbbf24, 0.8));
  return group;
}

const TARGET_DRAWERS = {
  red_pen: (scene, x, y) => {
    const group = scene.add.container(x, y).setRotation(-0.7);
    group.add(scene.add.rectangle(0, 0, 12, 72, 0xdc2626).setStrokeStyle(1, 0x991b1b));
    group.add(scene.add.rectangle(0, -40, 10, 14, 0x1e293b));
    group.add(scene.add.circle(0, 38, 6, 0x1e293b));
    return group;
  },
  coffee_mug: (scene, x, y) => {
    const group = scene.add.container(x, y);
    group.add(scene.add.rectangle(0, 8, 56, 52, 0xf8fafc).setStrokeStyle(3, 0x94a3b8));
    group.add(scene.add.rectangle(30, 0, 18, 28, 0x000000, 0).setStrokeStyle(4, 0x94a3b8));
    group.add(scene.add.ellipse(0, -12, 46, 14, 0x78350f, 0.8));
    group.add(scene.add.text(0, 10, "☕", { fontSize: "22px" }).setOrigin(0.5));
    return group;
  },
  gold_clip: (scene, x, y) => {
    const group = scene.add.container(x, y).setScale(1.4);
    group.add(scene.add.ellipse(0, 0, 18, 36, 0x000000, 0).setStrokeStyle(5, 0xfbbf24));
    group.add(scene.add.rectangle(0, -8, 8, 20, 0xfbbf24));
    return group;
  },
  office_key: (scene, x, y) => {
    const group = scene.add.container(x, y).setRotation(0.5);
    group.add(scene.add.circle(-20, 0, 12, 0xfbbf24).setStrokeStyle(2, 0xd97706));
    group.add(scene.add.rectangle(4, 0, 44, 8, 0xfbbf24).setStrokeStyle(1, 0xd97706));
    group.add(scene.add.rectangle(24, -8, 8, 8, 0xfbbf24));
    group.add(scene.add.rectangle(32, 4, 8, 8, 0xfbbf24));
    return group;
  },
  glasses: (scene, x, y) => {
    const group = scene.add.container(x, y);
    group.add(scene.add.circle(-18, 0, 18, 0x000000, 0).setStrokeStyle(3, 0x1e293b));
    group.add(scene.add.circle(18, 0, 18, 0x000000, 0).setStrokeStyle(3, 0x1e293b));
    group.add(scene.add.rectangle(0, 0, 12, 3, 0x1e293b));
    group.add(scene.add.rectangle(-36, 0, 16, 3, 0x1e293b));
    group.add(scene.add.rectangle(36, 0, 16, 3, 0x1e293b));
    return group;
  },
  rubber_stamp: (scene, x, y) => {
    const group = scene.add.container(x, y);
    group.add(scene.add.rectangle(0, 14, 48, 28, 0x78350f));
    group.add(scene.add.rectangle(0, -8, 56, 32, 0x1e293b));
    group.add(scene.add.text(0, -8, "OK", { fontSize: "16px", color: "#dc2626", fontStyle: "bold" }).setOrigin(0.5));
    return group;
  },
  student_id: (scene, x, y) => {
    const group = scene.add.container(x, y).setRotation(0.15);
    group.add(scene.add.rectangle(0, 0, 90, 58, 0xffffff).setStrokeStyle(2, 0x2563eb));
    group.add(scene.add.rectangle(0, -8, 70, 8, 0x2563eb, 0.3));
    group.add(scene.add.circle(-20, 10, 12, 0xbfdbfe));
    group.add(scene.add.text(16, 12, "STU", { fontSize: "12px", color: "#1e40af", fontStyle: "bold" }).setOrigin(0.5));
    return group;
  },
  lucky_coin: (scene, x, y) => {
    const group = scene.add.container(x, y);
    group.add(scene.add.circle(0, 0, 18, 0xfbbf24).setStrokeStyle(2, 0xd97706));
    group.add(scene.add.text(0, 0, "$", { fontSize: "18px", color: "#92400e", fontStyle: "bold" }).setOrigin(0.5));
    return group;
  },
};

const CLUTTER_DRAWERS = {
  book_stack: drawBookStack,
  paper_stack: drawPaperStack,
  laptop: drawLaptop,
  stapler: drawStapler,
  tape_dispenser: drawTapeDispenser,
  highlighter: drawHighlighter,
  sticky_notes: drawStickyNotes,
  envelope: drawEnvelope,
  calculator: drawCalculator,
  ruler: drawRuler,
  phone: drawPhone,
  folder: drawFolder,
  apple: drawApple,
  eraser: drawEraser,
  scissors: drawScissors,
  plant_pot: drawPlantPot,
  coaster: drawCoaster,
  binder_clip: drawBinderClip,
  pencil: drawPencil,
  notebook: drawNotebook,
  chalk: drawChalk,
  usb_drive: drawUsbDrive,
  badge: drawBadge,
  crumpled_paper: drawCrumpledPaper,
  ink_bottle: drawInkBottle,
  bookmark: drawBookmark,
  paper_tray: drawPaperTray,
  desk_lamp_base: drawDeskLampBase,
};

function drawClutterItem(scene, item) {
  const drawer = CLUTTER_DRAWERS[item.type];
  if (!drawer) return null;

  switch (item.type) {
    case "book_stack":
      return drawer(scene, item.x, item.y, item.color, item.rotation);
    case "paper_stack":
    case "ruler":
      return drawer(scene, item.x, item.y, item.rotation);
    case "highlighter":
    case "pencil":
    case "folder":
      return drawer(scene, item.x, item.y, item.color);
    default:
      return drawer(scene, item.x, item.y);
  }
}

export function drawHiddenObjectDesk(scene, targets = []) {
  const root = scene.add.container(0, 0).setDepth(0);

  if (hasClassroomBackground(scene)) {
    addClassroomBackground(scene, root);
    addProfessorBehindDesk(scene, root);
  } else {
    const wood = scene.add.rectangle(540, 960, 1080, 1920, 0x8b5e3c);
    const grainA = scene.add.rectangle(540, 640, 1080, 8, 0x6b4423, 0.15);
    const grainB = scene.add.rectangle(540, 1120, 1080, 6, 0x6b4423, 0.12);
    const grainC = scene.add.rectangle(540, 1540, 1080, 10, 0x6b4423, 0.1);
    const vignette = scene.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.08);
    root.add([wood, grainA, grainB, grainC, vignette]);
  }

  const clutterLayer = scene.add.container(0, 0);
  CLUTTER.forEach((item) => {
    const drawn = drawClutterItem(scene, item);
    if (drawn) clutterLayer.add(drawn);
  });
  root.add(clutterLayer);

  const targetLayer = scene.add.container(0, 0);
  const hitZones = [];

  targets.forEach((target) => {
    const drawer = TARGET_DRAWERS[target.id];
    if (!drawer) return;

    const visual = drawer(scene, target.x, target.y);
    targetLayer.add(visual);

    const zone = scene.add.circle(target.x, target.y, 42, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    hitZones.push({ target, zone, visual });
  });

  root.add(targetLayer);

  return { root, clutterLayer, targetLayer, hitZones };
}
