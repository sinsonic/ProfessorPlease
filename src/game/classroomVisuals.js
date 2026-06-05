const TABLE = { x: 540, y: 1540, width: 720, height: 120 };

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

  return { root, table: TABLE, papers };
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
  const overlay = scene.add.rectangle(540, 960, 1080, 1920, 0x0f172a, 0.45).setDepth(depth);
  const classroom = drawClassroom(scene, { depth: depth + 1, paperCount: 2 });
  const student = createStudentFigure(scene, 1180, TABLE.y + 40).setDepth(depth + 2);

  const nameTag = scene.add.text(540, 1180, "", {
    fontFamily: "Arial",
    fontSize: "42px",
    fontStyle: "bold",
    color: "#1e2b57",
    align: "center",
    backgroundColor: "#fffdf7",
    padding: { x: 24, y: 12 },
  }).setOrigin(0.5).setAlpha(0).setDepth(depth + 3);

  const status = scene.add.text(540, 1260, "A student is approaching...", {
    fontFamily: "Arial",
    fontSize: "30px",
    color: "#64748b",
  }).setOrigin(0.5).setDepth(depth + 3);

  const deliveredPapers = [];
  const paperTargets = [
    { x: TABLE.x - 70, y: TABLE.y - 20, r: -0.06 },
    { x: TABLE.x + 10, y: TABLE.y - 28, r: 0.05 },
    { x: TABLE.x + 80, y: TABLE.y - 18, r: 0.12 },
    { x: TABLE.x - 20, y: TABLE.y - 34, r: 0.02 },
    { x: TABLE.x + 50, y: TABLE.y - 32, r: 0.08 },
  ];

  const cleanup = () => {
    overlay.destroy();
    classroom.root.destroy();
    student.destroy();
    nameTag.destroy();
    status.destroy();
    deliveredPapers.forEach((p) => p.destroy());
  };

  const finish = () => {
    cleanup();
    onComplete?.();
  };

  scene.tweens.add({
    targets: student,
    x: TABLE.x + 180,
    duration: 1100,
    ease: "Sine.easeInOut",
    onComplete: () => {
      status.setText("Placing exam papers...");
      scene.tweens.add({
        targets: student.heldPapers,
        alpha: 0,
        scale: 0.6,
        duration: 280,
        onComplete: () => {
          paperTargets.forEach((target, index) => {
            scene.time.delayedCall(index * 90, () => {
              const paper = drawPaper(scene, student.x + 20, student.y - 20, 0);
              paper.setDepth(depth + 2);
              deliveredPapers.push(paper);
              scene.tweens.add({
                targets: paper,
                x: target.x,
                y: target.y,
                rotation: target.r,
                duration: 320,
                ease: "Back.easeOut",
              });
            });
          });

          scene.time.delayedCall(620, () => {
            const subtitle = major ? `\n${major}` : "";
            nameTag.setText(`${studentName}${subtitle}`);
            scene.tweens.add({ targets: nameTag, alpha: 1, duration: 260 });
            status.setText("Ready for grading.");

            scene.time.delayedCall(900, () => {
              scene.tweens.add({
                targets: student,
                x: -180,
                alpha: 0.6,
                duration: 900,
                ease: "Sine.easeIn",
                onComplete: finish,
              });
            });
          });
        },
      });
    },
  });

  return { overlay, classroom, student, nameTag, status };
}
