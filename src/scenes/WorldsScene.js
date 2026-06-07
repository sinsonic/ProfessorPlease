import Phaser from "phaser";
import { drawClassroom, playStudentApproach } from "../game/classroomVisuals";
import { loadRandomStudent } from "../game/dbLoader";
import { createCareerHud, updateCareerHud } from "../game/careerHud";
import { activatePendingBoosters, loadCareer, STUDENTS_PER_DAY } from "../game/careerStore";
import { createHiddenObjectButton } from "../game/hiddenObjectAccess";
import { createShopIcon } from "../game/shopAccess";
import {
  loadProgress,
} from "../game/progressStore";

export class WorldsScene extends Phaser.Scene {
  constructor() {
    super("WorldsScene");
    this.progress = loadProgress();
  }

  create() {
    this.cameras.main.setBackgroundColor("#e9dcc8");
    this.render();
  }

  render() {
    this.children.removeAll();
    this.progress = loadProgress();
    this.career = loadCareer();
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.careerHud = createCareerHud(this, { depth: 30, top: 0 });
    updateCareerHud(this.careerHud, this.career);
    this.classroom = drawClassroom(this, { depth: 0, paperCount: 3 });

    // Centered vertical stack
    const logoH = 190;
    const panelH = 250;
    const buttonH = 150;
    const gapA = 44;
    const gapB = 56;
    const totalH = logoH + gapA + panelH + gapB + buttonH;
    const topY = cy - totalH / 2;

    const logoY = topY + logoH / 2 - 36;
    this.add.text(cx, logoY - 8, "PROFESSOR,\nPLEASE!", {
      fontFamily: "Arial",
      fontSize: "72px",
      fontStyle: "bold",
      color: "#1e2b57",
      align: "center",
    }).setOrigin(0.5);

    const panelY = logoY + logoH / 2 + gapA + panelH / 2;
    this.createRoundedPanel(cx, panelY, 820, panelH);

    this.add.text(cx, panelY - 62, "Professor career", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#64748b",
    }).setOrigin(0.5);
    this.add.text(cx, panelY - 8, `Reputation: ${this.career.reputation}`, {
      fontFamily: "Arial",
      fontSize: "42px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);
    this.add.text(cx, panelY + 44, `Savings: $${this.career.money}`, {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#2b9f89",
      fontStyle: "bold",
    }).setOrigin(0.5);

    const buttonY = panelY + panelH / 2 + gapB + buttonH / 2;
    const startLabel = this.career.studentsGradedToday > 0
      ? `CONTINUE DAY (${this.career.studentsGradedToday}/${STUDENTS_PER_DAY})`
      : "START WORK DAY";
    const startButton = this.createMainButton(cx, buttonY, startLabel, () => {
      this.startExam();
    });
    startButton.bg.setDepth(10);
    startButton.label.setDepth(11);

    createHiddenObjectButton(this, { depth: 60 });
    createShopIcon(this, { depth: 60 });
  }

  async startExam() {
    if (this.startingExam) return;
    this.startingExam = true;

    if (this.career.studentsGradedToday >= STUDENTS_PER_DAY) {
      this.scene.start("DayEndScene");
      return;
    }

    try {
      activatePendingBoosters();
      this.career = loadCareer();
      updateCareerHud(this.careerHud, this.career);

      const student = await loadRandomStudent();
      this.children.list.forEach((child) => {
        if (child !== this.classroom?.root) child.setVisible(false);
      });

      playStudentApproach(this, {
        studentName: student.name,
        major: student.major,
        avatarKey: student.avatarKey,
        depth: 30,
        onComplete: () => {
          this.scene.start("QuizScene", { student });
        },
      });
    } catch (error) {
      this.startingExam = false;
      this.add.text(540, 1700, `Could not load student: ${error.message}`, {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#dc2626",
        align: "center",
        wordWrap: { width: 900 },
      }).setOrigin(0.5).setDepth(40);
    }
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

  createMainButton(x, y, label, onClick) {
    // Rounded CTA with subtle shadow
    this.add.graphics()
      .fillStyle(0x000000, 0.08)
      .fillRoundedRect(x - 620 / 2 + 6, y - 150 / 2 + 10, 620, 150, 26);
    const bg = this.add.rectangle(x, y, 620, 150, 0x2b9f89, 1)
      .setStrokeStyle(0, 0, 0)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5);
    bg.on("pointerdown", onClick);
    return { bg, label: text };
  }
}
