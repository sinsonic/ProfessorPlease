import { loadCareer, STUDENTS_PER_DAY } from "./careerStore";

export function createCareerHud(scene, { depth = 45, top = 0 } = {}) {
  const hud = scene.add.container(0, top).setDepth(depth);

  const bg = scene.add.rectangle(540, 58, 1080, 116, 0xfffdf7, 0.95);
  const border = scene.add.rectangle(540, 116, 1080, 3, 0xcbd5e1, 0.8);

  const dayText = scene.add.text(24, 22, "", {
    fontFamily: "Arial",
    fontSize: "28px",
    fontStyle: "bold",
    color: "#1e2b57",
  });

  const reputationText = scene.add.text(24, 58, "", {
    fontFamily: "Arial",
    fontSize: "26px",
    color: "#64748b",
  });

  const moneyText = scene.add.text(1056, 40, "", {
    fontFamily: "Arial",
    fontSize: "30px",
    fontStyle: "bold",
    color: "#2b9f89",
    align: "right",
  }).setOrigin(1, 0);

  const barLabel = scene.add.text(540, 88, "", {
    fontFamily: "Arial",
    fontSize: "22px",
    color: "#64748b",
  }).setOrigin(0.5);

  const barTrack = scene.add.rectangle(540, 58, 500, 18, 0xe2e8f0).setStrokeStyle(1, 0xcbd5e1);
  const barFill = scene.add.rectangle(292, 58, 4, 14, 0x2b9f89).setOrigin(0, 0.5);

  hud.add([bg, border, dayText, reputationText, moneyText, barTrack, barFill, barLabel]);

  return {
    root: hud,
    dayText,
    reputationText,
    moneyText,
    barLabel,
    barFill,
    barTrack,
    barMaxWidth: 496,
  };
}

export function updateCareerHud(hud, career = loadCareer()) {
  if (!hud) return career;

  hud.dayText.setText(`Day ${career.day}`);
  hud.reputationText.setText(`Academic reputation: ${career.reputation}`);
  hud.moneyText.setText(`$${career.money}`);

  const completed = Math.max(0, Math.min(STUDENTS_PER_DAY, career.studentsGradedToday));
  const ratio = completed / STUDENTS_PER_DAY;
  hud.barLabel.setText(`Students graded today: ${completed}/${STUDENTS_PER_DAY}`);
  hud.barFill.setSize(Math.max(8, hud.barMaxWidth * ratio), 14);
  hud.barFill.setFillStyle(ratio >= 1 ? 0xf59e0b : 0x2b9f89);

  return career;
}
