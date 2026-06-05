import { TABLE } from "./classroomConstants";
import { drawOwnedDecorations } from "./classroomDecorations";

export { TABLE };

function drawPaper(scene, x, y, rotation = 0, alpha = 1, parent = null) {
  const paper = scene.add.container(x, y);
  const sheet = scene.add.rectangle(0, 0, 88, 110, 0xfffdf7, alpha)
    .setStrokeStyle(2, 0xcbd5e1, alpha);
  const lineA = scene.add.rectangle(0, -28, 54, 3, 0x94a3b8, alpha * 0.5);
  const lineB = scene.add.rectangle(0, -8, 62, 3, 0x94a3b8, alpha * 0.4);
  const lineC = scene.add.rectangle(0, 12, 48, 3, 0x94a3b8, alpha * 0.35);
  paper.add([sheet, lineA, lineB, lineC]);
  paper.setRotation(rotation);
  if (parent) parent.add(paper);
  return paper;
}

export function drawClassroom(scene, { depth = 0, paperCount = 3 } = {}) {
  const root = scene.add.container(0, 0);
  root.setDepth(depth);

  const wall = scene.add.rectangle(540, 760, 1080, 1520, 0xe9dcc8);
  const floor = scene.add.rectangle(540, 1760, 1080, 320, 0xc9a66b);
  const floorLine = scene.add.rectangle(540, 1600, 1080, 6, 0x9a7348, 0.35);

  const board = scene.add.rectangle(540, 280, 760, 220, 0x1f4d3a)
    .setStrokeStyle(8, 0x8b7355);
  const chalkTray = scene.add.rectangle(540, 402, 220, 16, 0x8b7355);
  const boardText = scene.add.text(540, 280, "EXAM HALL", {
    fontFamily: "Arial",
    fontSize: "54px",
    fontStyle: "bold",
    color: "#d1fae5",
  }).setOrigin(0.5);

  const windowL = scene.add.rectangle(180, 520, 140, 180, 0xbfe7ff, 0.55)
    .setStrokeStyle(6, 0xffffff, 0.8);
  const windowR = scene.add.rectangle(900, 520, 140, 180, 0xbfe7ff, 0.55)
    .setStrokeStyle(6, 0xffffff, 0.8);

  const deskShadow = scene.add.ellipse(TABLE.x, TABLE.y + 70, TABLE.width + 40, 48, 0x000000, 0.12);
  const deskTop = scene.add.rectangle(TABLE.x, TABLE.y, TABLE.width, TABLE.height, 0x8b5e3c)
    .setStrokeStyle(4, 0x6b4423);
  const deskFront = scene.add.rectangle(TABLE.x, TABLE.y + 58, TABLE.width - 80, 70, 0x6b4423);

  const papers = [];
  const offsets = [
    { x: -90, y: -18, r: -0.08 },
    { x: 0, y: -24, r: 0.04 },
    { x: 90, y: -16, r: 0.1 },
    { x: -45, y: -30, r: -0.02 },
    { x: 45, y: -28, r: 0.06 },
  ];
  for (let i = 0; i < paperCount; i += 1) {
    const o = offsets[i % offsets.length];
    papers.push(drawPaper(scene, TABLE.x + o.x, TABLE.y + o.y, o.r));
  }

  const chair = scene.add.rectangle(TABLE.x, TABLE.y + 170, 180, 46, 0x4b5563, 0.25);

  root.add([
    wall,
    floor,
    floorLine,
    board,
    boardText,
    chalkTray,
    windowL,
    windowR,
    deskShadow,
    deskTop,
    deskFront,
    chair,
    ...papers,
  ]);

  const decorLayer = scene.add.container(0, 0).setDepth(depth + 1);
  drawOwnedDecorations(scene, decorLayer);

  return { root, decorLayer, table: TABLE, papers };
}

export function replaceClassroom(scene, previous, options) {
  previous?.root?.destroy();
  previous?.decorLayer?.destroy();
  return drawClassroom(scene, options);
}

export function createStudentFigure(scene, x, y) {
  const student = scene.add.container(x, y);

  const shadow = scene.add.ellipse(0, 92, 110, 28, 0x000000, 0.18);
  const legs = scene.add.rectangle(0, 62, 56, 58, 0x334155);
  const body = scene.add.rectangle(0, 8, 74, 92, 0x3b82f6);
  const armL = scene.add.rectangle(-44, 18, 22, 64, 0x2563eb).setRotation(0.25);
  const armR = scene.add.rectangle(44, 18, 22, 64, 0x2563eb).setRotation(-0.25);
  const head = scene.add.circle(0, -58, 34, 0xfcd9b6).setStrokeStyle(3, 0xd4a574);
  const hair = scene.add.rectangle(0, -78, 58, 28, 0x4b2e19);
  const eyeL = scene.add.circle(-12, -60, 4, 0x1e293b);
  const eyeR = scene.add.circle(12, -60, 4, 0x1e293b);
  const backpack = scene.add.rectangle(-34, 4, 34, 70, 0x7c2d12, 0.9);

  const heldPapers = scene.add.container(36, 24);
  drawPaper(scene, -10, 0, -0.12, 1, heldPapers);
  drawPaper(scene, 8, -6, 0.08, 1, heldPapers);
  drawPaper(scene, 22, 2, 0.16, 1, heldPapers);

  student.add([shadow, legs, backpack, body, armL, armR, head, hair, eyeL, eyeR, heldPapers]);
  student.heldPapers = heldPapers;
  return student;
}

export function playStudentApproach(scene, {
  studentName = "Student",
  major = "",
  onComplete,
  depth = 50,
} = {}) {
  const layer = scene.add.container(0, 0).setDepth(depth);
  let finished = false;
  const timers = [];
  const deliveredPapers = [];

  const schedule = (fn, delayMs) => {
    const id = window.setTimeout(fn, delayMs);
    timers.push(id);
  };

  const status = scene.add.text(540, 1180, "A student is approaching...", {
    fontFamily: "Arial",
    fontSize: "34px",
    fontStyle: "bold",
    color: "#1e2b57",
    align: "center",
    backgroundColor: "#fffdf7",
    padding: { x: 20, y: 10 },
  }).setOrigin(0.5);
  layer.add(status);

  const nameTag = scene.add.text(540, 1260, "", {
    fontFamily: "Arial",
    fontSize: "30px",
    color: "#64748b",
    align: "center",
  }).setOrigin(0.5).setAlpha(0);
  layer.add(nameTag);

  const student = createStudentFigure(scene, 0, 0);
  student.setPosition(1120, TABLE.y + 20);
  layer.add(student);

  const paperTargets = [
    { x: TABLE.x - 80, y: TABLE.y - 22, r: -0.08 },
    { x: TABLE.x - 10, y: TABLE.y - 30, r: 0.04 },
    { x: TABLE.x + 60, y: TABLE.y - 18, r: 0.1 },
    { x: TABLE.x + 20, y: TABLE.y - 34, r: 0.06 },
    { x: TABLE.x - 45, y: TABLE.y - 12, r: -0.02 },
  ];

  const cleanup = () => {
    timers.forEach((id) => window.clearTimeout(id));
    scene.tweens.killTweensOf([student, student.heldPapers, nameTag, status, ...deliveredPapers]);
    layer.destroy();
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup();
    onComplete?.();
  };

  const dropPapers = () => {
    status.setText("Placing exam papers...");
    student.heldPapers.setAlpha(0);

    paperTargets.forEach((target, index) => {
      schedule(() => {
        if (finished) return;
        const startX = student.x + 30;
        const startY = student.y - 40;
        const paper = drawPaper(scene, 0, 0, 0);
        paper.setPosition(startX, startY);
        layer.add(paper);
        deliveredPapers.push(paper);
        scene.tweens.add({
          targets: paper,
          x: target.x,
          y: target.y,
          rotation: target.r,
          duration: 380,
          ease: "Back.easeOut",
        });
      }, index * 140);
    });
  };

  scene.tweens.add({
    targets: student,
    x: TABLE.x + 200,
    duration: 1400,
    ease: "Sine.easeInOut",
    onComplete: () => {
      dropPapers();
      schedule(() => {
        if (finished) return;
        const subtitle = major ? ` (${major})` : "";
        nameTag.setText(`${studentName}${subtitle}`);
        nameTag.setAlpha(1);
        status.setText("Papers delivered!");
      }, 900);

      schedule(() => {
        if (finished) return;
        scene.tweens.add({
          targets: student,
          x: -160,
          alpha: 0.5,
          duration: 1000,
          ease: "Sine.easeIn",
          onComplete: finish,
        });
      }, 1800);
    },
  });

  schedule(finish, 6000);

  return { layer, student, finish };
}

export function createProfessorFigure(scene) {
  const professor = scene.add.container(0, 0);

  const shadow = scene.add.ellipse(0, 88, 120, 30, 0x000000, 0.16);
  const legs = scene.add.rectangle(0, 58, 60, 54, 0x1e293b);
  const body = scene.add.rectangle(0, 4, 82, 96, 0x78350f);
  const tie = scene.add.rectangle(0, 18, 18, 70, 0xb91c1c);
  const armL = scene.add.rectangle(-48, 14, 24, 68, 0x92400e).setRotation(0.15);
  const armR = scene.add.rectangle(48, 14, 24, 68, 0x92400e).setRotation(-0.15);
  const head = scene.add.circle(0, -56, 36, 0xfcd9b6).setStrokeStyle(3, 0xd4a574);
  const hair = scene.add.rectangle(0, -82, 64, 24, 0x9ca3af);
  const glasses = scene.add.rectangle(0, -58, 52, 16, 0x1e293b, 0).setStrokeStyle(3, 0x1e293b);
  const eyeL = scene.add.circle(-14, -58, 4, 0x1e293b);
  const eyeR = scene.add.circle(14, -58, 4, 0x1e293b);

  professor.add([shadow, legs, body, tie, armL, armR, head, hair, glasses, eyeL, eyeR]);
  return professor;
}

export function createBribeEnvelope(scene, parent = null) {
  const envelope = scene.add.container(0, 0);
  const body = scene.add.rectangle(0, 0, 72, 48, 0xd97706).setStrokeStyle(2, 0xb45309);
  const flap = scene.add.triangle(0, -18, -36, 0, 36, 0, 0, -22, 0xfbbf24).setStrokeStyle(2, 0xb45309);
  const mark = scene.add.text(0, 2, "$", {
    fontFamily: "Arial",
    fontSize: "28px",
    fontStyle: "bold",
    color: "#fffbeb",
  }).setOrigin(0.5);
  envelope.add([body, flap, mark]);
  if (parent) parent.add(envelope);
  return envelope;
}

export function createSpeechBubble(scene, x, y, text, { width = 760, tail = "left" } = {}) {
  const bubble = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const h = 140;
  const w = width;
  bg.fillStyle(0xfffdf7, 1);
  bg.lineStyle(3, 0x1e2b57, 0.15);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
  if (tail === "left") {
    bg.fillTriangle(-w / 2 + 40, h / 2, -w / 2 + 90, h / 2, -w / 2 + 30, h / 2 + 36);
  } else {
    bg.fillTriangle(w / 2 - 40, h / 2, w / 2 - 90, h / 2, w / 2 - 30, h / 2 + 36);
  }
  const label = scene.add.text(0, -8, text, {
    fontFamily: "Arial",
    fontSize: "28px",
    color: "#1e2b57",
    align: "center",
    wordWrap: { width: w - 48 },
  }).setOrigin(0.5);
  bubble.add([bg, label]);
  bubble.label = label;
  bubble.setAlpha(0);
  return bubble;
}
