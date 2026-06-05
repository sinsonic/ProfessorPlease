import Phaser from "phaser";
import { drawClassroom } from "../game/classroomVisuals";
import { happytime } from "../game/crazyGamesSdk";
import { createCareerHud, updateCareerHud } from "../game/careerHud";
import { gradeFromCorrectCount } from "../game/grades";
import { continueAfterStudent, getContinueButtonLabel } from "../game/studentDayFlow";

export class QuizSummaryScene extends Phaser.Scene {
  constructor() {
    super("QuizSummaryScene");
  }

  init(data) {
    this.studentName = data?.studentName || "Student";
    this.studentMajor = data?.studentMajor || "";
    this.correctCount = Number.isFinite(data?.correctCount) ? data.correctCount : 0;
    this.total = Number.isFinite(data?.total) ? data.total : 5;
  }

  create() {
    this.cameras.main.setBackgroundColor("#e9dcc8");
    this.careerHud = createCareerHud(this, { depth: 30, top: 0 });
    updateCareerHud(this.careerHud);
    this.classroom = drawClassroom(this, { depth: 0, paperCount: 4 });
    const grade = gradeFromCorrectCount(this.correctCount);
    if (grade === "A") {
      happytime();
    }
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.createRoundedPanel(cx, cy, 860, 860);

    this.add.text(cx, cy - 220, this.studentName, {
      fontFamily: "Arial",
      fontSize: "54px",
      fontStyle: "bold",
      color: "#1e2b57",
      align: "center",
      wordWrap: { width: 760 },
    }).setOrigin(0.5);

    this.add.text(cx, cy - 90, `Result: ${this.correctCount}/${this.total}`, {
      fontFamily: "Arial",
      fontSize: "62px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);

    this.add.text(cx, cy + 30, `Grade: ${grade}`, {
      fontFamily: "Arial",
      fontSize: "88px",
      fontStyle: "bold",
      color: grade === "A" ? "#2b9f89" : grade === "F" ? "#dc2626" : "#64748b",
    }).setOrigin(0.5);

    this.createButton(cx, cy + 190, getContinueButtonLabel(), () => {
      this.handleContinue();
    }, 640, 140, 56, true);
  }

  async handleContinue() {
    if (this.loadingNext) return;
    this.loadingNext = true;
    await continueAfterStudent(this, { classroom: this.classroom });
    this.loadingNext = false;
  }

  createRoundedPanel(x, y, width, height) {
    this.add.graphics()
      .fillStyle(0x000000, 0.06)
      .fillRoundedRect(x - width / 2 + 8, y - height / 2 + 12, width, height, 24);
    this.add.graphics()
      .lineStyle(2, 0x0f172a, 0.06)
      .fillStyle(0xfffdf7, 1)
      .fillRoundedRect(x - width / 2, y - height / 2, width, height, 24)
      .strokeRoundedRect(x - width / 2, y - height / 2, width, height, 24);
  }

  createButton(x, y, label, onClick, width = 420, height = 110, fontSize = 36, primary = false) {
    this.add.graphics()
      .fillStyle(0x000000, 0.08)
      .fillRoundedRect(x - width / 2 + 6, y - height / 2 + 10, width, height, 26);
    const bg = this.add.rectangle(x, y, width, height, primary ? 0x2b9f89 : 0x94a3b8, primary ? 1 : 0.18)
      .setStrokeStyle(0, 0, 0)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: `${fontSize}px`,
      fontStyle: primary ? "bold" : "normal",
      color: primary ? "#ffffff" : "#1e2b57",
    }).setOrigin(0.5);
    bg.on("pointerdown", onClick);
  }
}
