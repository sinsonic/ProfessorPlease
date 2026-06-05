import Phaser from "phaser";
import {
  TABLE,
  createBribeEnvelope,
  createProfessorFigure,
  createSpeechBubble,
  createStudentFigure,
  drawClassroom,
  playStudentApproach,
} from "../game/classroomVisuals";
import { loadRandomStudent } from "../game/dbLoader";
import { interpolateSceneText } from "../game/specialScenesLoader";

const CHOICE_COLORS = {
  accept: 0x2b9f89,
  reject: 0xdc2626,
  neutral: 0x64748b,
};

export class SpecialScene extends Phaser.Scene {
  constructor() {
    super("SpecialScene");
  }

  init(data) {
    this.sceneConfig = data?.sceneConfig || null;
    this.sceneContext = data?.sceneContext || {};
    this.studentName = data?.studentName || "Student";
    this.studentMajor = data?.studentMajor || "";
    this.correctCount = Number.isFinite(data?.correctCount) ? data.correctCount : 0;
    this.total = Number.isFinite(data?.total) ? data.total : 5;
    this.resolved = false;
  }

  create() {
    if (!this.sceneConfig || this.sceneConfig.template !== "confrontation") {
      this.scene.start("QuizSummaryScene", {
        studentName: this.studentName,
        studentMajor: this.studentMajor,
        correctCount: this.correctCount,
        total: this.total,
      });
      return;
    }

    this.cameras.main.setBackgroundColor("#e9dcc8");
    this.classroom = drawClassroom(this, { depth: 0, paperCount: 5 });
    this.layer = this.add.container(0, 0).setDepth(20);

    this.professor = createProfessorFigure(this);
    this.professor.setPosition(TABLE.x - 180, TABLE.y - 90);
    this.layer.add(this.professor);

    this.student = createStudentFigure(this);
    this.student.setPosition(1120, TABLE.y + 20);
    this.student.heldPapers.setVisible(false);
    this.layer.add(this.student);

    this.prop = null;
    if (this.sceneConfig.prop === "envelope") {
      this.prop = createBribeEnvelope(this, this.student);
      this.prop.setPosition(48, 10);
      this.prop.setScale(0);
    } else if (this.sceneConfig.prop === "gift") {
      this.prop = this.createGiftProp(this.student);
    }

    const bannerText = this.text(this.sceneConfig.banner);
    const grade = this.sceneContext.grade;
    this.gradeBanner = this.add.text(540, 140, bannerText, {
      fontFamily: "Arial",
      fontSize: "46px",
      fontStyle: "bold",
      color: grade === "F" ? "#dc2626" : grade === "A" ? "#2b9f89" : "#b45309",
      align: "center",
      backgroundColor: "#fffdf7",
      padding: { x: 24, y: 14 },
    }).setOrigin(0.5).setDepth(25);

    this.sceneTitle = this.add.text(540, 220, this.sceneConfig.title, {
      fontFamily: "Arial",
      fontSize: "30px",
      color: "#64748b",
      align: "center",
    }).setOrigin(0.5).setDepth(25);

    this.studentBubble = createSpeechBubble(this, 540, 520, "", { width: 820, tail: "left" });
    this.professorBubble = createSpeechBubble(this, 540, 720, "", { width: 820, tail: "right" });
    this.layer.add([this.studentBubble, this.professorBubble]);

    this.choiceContainer = this.add.container(540, 980).setDepth(30).setAlpha(0);
    this.choiceButtons = [];
    const spacing = this.sceneConfig.choices.length > 2 ? 220 : 340;
    const offsets = this.sceneConfig.choices.map((_choice, index, list) => {
      if (list.length === 1) return 0;
      const start = -((list.length - 1) * spacing) / 2;
      return start + index * spacing;
    });

    this.sceneConfig.choices.forEach((choice, index) => {
      this.createChoiceButton(
        offsets[index],
        choice.label,
        CHOICE_COLORS[choice.color] || CHOICE_COLORS.neutral,
        () => this.resolveChoice(choice),
      );
    });

    this.outcomeText = this.add.text(540, 1120, "", {
      fontFamily: "Arial",
      fontSize: "32px",
      color: "#1e2b57",
      align: "center",
      wordWrap: { width: 900 },
      backgroundColor: "#fffdf7",
      padding: { x: 20, y: 14 },
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    this.playIntro();
  }

  text(template) {
    return interpolateSceneText(template, this.sceneContext);
  }

  createGiftProp(parent) {
    const gift = this.add.container(0, 0);
    const box = this.add.rectangle(0, 0, 56, 56, 0xf59e0b).setStrokeStyle(2, 0xb45309);
    const ribbonV = this.add.rectangle(0, 0, 12, 56, 0xdc2626);
    const ribbonH = this.add.rectangle(0, 0, 56, 12, 0xdc2626);
    const bow = this.add.circle(0, -24, 10, 0xdc2626);
    gift.add([box, ribbonV, ribbonH, bow]);
    gift.setPosition(42, 4);
    gift.setScale(0);
    parent.add(gift);
    return gift;
  }

  playIntro() {
    this.tweens.add({
      targets: this.student,
      x: TABLE.x + 240,
      duration: 1300,
      ease: "Sine.easeInOut",
      onComplete: () => this.showOffer(),
    });
  }

  showOffer() {
    this.setBubbleText(this.studentBubble, this.text(this.sceneConfig.dialogue.studentOffer));
    this.tweens.add({ targets: this.studentBubble, alpha: 1, duration: 250 });

    if (this.prop) {
      this.tweens.add({
        targets: this.prop,
        scaleX: 1,
        scaleY: 1,
        duration: 350,
        ease: "Back.easeOut",
      });
    }

    this.time.delayedCall(1600, () => {
      if (this.resolved) return;
      this.setBubbleText(this.professorBubble, this.text(this.sceneConfig.dialogue.professorPrompt));
      this.tweens.add({ targets: this.professorBubble, alpha: 1, duration: 250 });
      this.tweens.add({ targets: this.choiceContainer, alpha: 1, duration: 250 });
    });
  }

  setBubbleText(bubble, text) {
    bubble.label.setText(text);
  }

  createChoiceButton(offsetX, label, color, onClick) {
    const button = this.add.container(offsetX, 0);
    const bg = this.add.rectangle(0, 0, 300, 110, color)
      .setStrokeStyle(0, 0, 0)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, {
      fontFamily: "Arial",
      fontSize: "30px",
      fontStyle: "bold",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 260 },
    }).setOrigin(0.5);
    bg.on("pointerdown", onClick);
    button.add([bg, text]);
    this.choiceButtons.push(bg);
    this.choiceContainer.add(button);
  }

  resolveChoice(choice) {
    if (this.resolved) return;
    this.resolved = true;
    this.choiceContainer.setAlpha(0);
    this.choiceButtons.forEach((button) => button.disableInteractive());

    if (choice.studentReply) {
      this.setBubbleText(this.studentBubble, this.text(choice.studentReply));
    }
    if (choice.professorReply) {
      this.setBubbleText(this.professorBubble, this.text(choice.professorReply));
    }

    this.playChoiceAnimation(choice);
    if (choice.gradeDisplay) {
      this.gradeBanner.setText(this.text(choice.gradeDisplay));
      this.gradeBanner.setColor("#2b9f89");
    }

    this.outcomeText.setText(this.text(choice.outcome));
    this.finishOutcome();
  }

  playChoiceAnimation(choice) {
    const animation = choice.animation || "none";
    if (animation === "accept_bribe" && this.prop) {
      this.tweens.add({
        targets: this.prop,
        x: -120,
        y: -30,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 500,
        ease: "Sine.easeInOut",
      });
      return;
    }

    if (animation === "accept_gift" && this.prop) {
      this.tweens.add({
        targets: this.prop,
        x: -150,
        y: -20,
        alpha: 0.4,
        duration: 500,
        ease: "Sine.easeInOut",
      });
      return;
    }

    if (animation === "kick_out" || animation === "student_leaves") {
      if (this.prop) this.prop.setVisible(false);
      this.tweens.add({
        targets: this.student,
        x: animation === "kick_out" ? -220 : 1180,
        alpha: 0.25,
        angle: animation === "kick_out" ? -12 : 0,
        duration: 900,
        ease: animation === "kick_out" ? "Back.easeIn" : "Sine.easeIn",
      });
    }
  }

  finishOutcome() {
    this.tweens.add({ targets: this.outcomeText, alpha: 1, duration: 300 });
    this.time.delayedCall(900, () => this.createContinueButton());
  }

  createContinueButton() {
    const y = 1280;
    this.add.graphics()
      .fillStyle(0x000000, 0.08)
      .fillRoundedRect(540 - 320 + 6, y - 70 + 10, 640, 140, 26)
      .setDepth(35);
    const bg = this.add.rectangle(540, y, 640, 140, 0x2b9f89)
      .setStrokeStyle(0, 0, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(35);
    this.add.text(540, y, "NEXT STUDENT", {
      fontFamily: "Arial",
      fontSize: "56px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(36);
    bg.on("pointerdown", () => this.startNextStudent());
  }

  async startNextStudent() {
    if (this.loadingNext) return;
    this.loadingNext = true;

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
      this.loadingNext = false;
      this.add.text(540, 1700, `Could not load student: ${error.message}`, {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#dc2626",
        align: "center",
        wordWrap: { width: 900 },
      }).setOrigin(0.5).setDepth(40);
    }
  }
}
