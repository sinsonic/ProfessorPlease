import Phaser from "phaser";
import { drawClassroom, playStudentApproach } from "../game/classroomVisuals";
import { loadRandomStudent } from "../game/dbLoader";
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
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.classroom = drawClassroom(this, { depth: 0, paperCount: 3 });

    // Centered vertical stack
    const logoH = 190;
    const panelH = 210;
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

    this.add.text(cx, panelY - 62, "Your records", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#64748b",
    }).setOrigin(0.5);
    this.add.text(cx, panelY + 10, `Best: ${this.progress.bestStreak || 0}`, {
      fontFamily: "Arial",
      fontSize: "56px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);

    const buttonY = panelY + panelH / 2 + gapB + buttonH / 2;
    const startButton = this.createMainButton(cx, buttonY, "START EXAM", () => {
      this.startExam();
    });
    startButton.bg.setDepth(10);
    startButton.label.setDepth(11);

    // Minimal start screen.
  }

  async startExam() {
    if (this.startingExam) return;
    this.startingExam = true;

    try {
      const student = await loadRandomStudent();
      this.children.list.forEach((child) => {
        if (child !== this.classroom?.root) child.setVisible(false);
      });

      playStudentApproach(this, {
        studentName: student.name,
        major: student.major,
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
