import Phaser from "phaser";
import { drawClassroom, playStudentApproach } from "../game/classroomVisuals";
import { loadRandomStudent } from "../game/dbLoader";
import { createCareerHud, updateCareerHud } from "../game/careerHud";
import { activatePendingBoosters, loadCareer, STUDENTS_PER_DAY } from "../game/careerStore";
import { playHomeEntrance, shouldPlayHomeEntrance } from "../game/homeEntrance";
import { createShopIcon } from "../game/shopAccess";
import {
  loadProgress,
} from "../game/progressStore";

export class WorldsScene extends Phaser.Scene {
  constructor() {
    super("WorldsScene");
    this.progress = loadProgress();
  }

  init() {
    this.startingExam = false;
  }

  create() {
    this.cameras.main.setBackgroundColor("#e9dcc8");
    this.startingExam = false;
    this.render();
  }

  onShopClosed() {
    this.startingExam = false;
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

    const logoH = 190;
    const panelH = 250;
    const buttonH = 150;
    const gapA = 44;
    const gapB = 56;
    const totalH = logoH + gapA + panelH + gapB + buttonH;
    const topY = cy - totalH / 2;

    const logoY = topY + logoH / 2 - 36;
    const logo = this.add.text(cx, logoY - 8, "PROFESSOR,\nPLEASE!", {
      fontFamily: "Arial",
      fontSize: "72px",
      fontStyle: "bold",
      color: "#1e2b57",
      align: "center",
    }).setOrigin(0.5);

    const panelY = logoY + logoH / 2 + gapA + panelH / 2;
    const careerPanel = this.add.container(cx, panelY);
    this.buildCareerPanel(careerPanel, panelH);

    const buttonY = panelY + panelH / 2 + gapB + buttonH / 2;
    const startLabel = this.career.studentsGradedToday > 0
      ? `CONTINUE DAY (${this.career.studentsGradedToday}/${STUDENTS_PER_DAY})`
      : "START WORK DAY";
    const startButton = this.createMainButton(0, 0, startLabel, () => {
      this.startExam();
    });
    const startButtonGroup = this.add.container(cx, buttonY);
    startButtonGroup.add([startButton.shadow, startButton.bg, startButton.label]);
    startButton.bg.setDepth(10);
    startButton.label.setDepth(11);

    const shopButton = createShopIcon(this, { depth: 60 });

    if (shouldPlayHomeEntrance()) {
      playHomeEntrance(this, {
        classroom: this.classroom,
        careerHud: this.careerHud,
        logo,
        careerPanel,
        startButton: startButtonGroup,
        shopButton,
      });
    }
  }

  buildCareerPanel(panel, panelH) {
    const panelW = 820;
    const shadow = this.add.graphics()
      .fillStyle(0x000000, 0.06)
      .fillRoundedRect(-panelW / 2 + 8, -panelH / 2 + 12, panelW, panelH, 24);
    const bg = this.add.graphics()
      .lineStyle(2, 0x0f172a, 0.06)
      .fillStyle(0xfffdf7, 1)
      .fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 24)
      .strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 24);

    const title = this.add.text(0, -62, "Professor career", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#64748b",
    }).setOrigin(0.5);

    const reputation = this.add.text(0, -8, `Reputation: ${this.career.reputation}`, {
      fontFamily: "Arial",
      fontSize: "42px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);

    const savings = this.add.text(0, 44, `Savings: $${this.career.money}`, {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#2b9f89",
      fontStyle: "bold",
    }).setOrigin(0.5);

    panel.add([shadow, bg, title, reputation, savings]);
  }

  async startExam() {
    if (this.startingExam) return;
    this.startingExam = true;

    if (this.career.studentsGradedToday >= STUDENTS_PER_DAY) {
      this.startingExam = false;
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

  createMainButton(x, y, label, onClick) {
    const shadow = this.add.graphics()
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
    return { shadow, bg, label: text };
  }
}
