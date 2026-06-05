import Phaser from "phaser";
import { loadRandomStudent } from "../game/dbLoader";
import { drawClassroom } from "../game/classroomVisuals";
import { gameplayStart, gameplayStop } from "../game/crazyGamesSdk";

const STATEMENTS_PER_STUDENT = 5;

export class QuizScene extends Phaser.Scene {
  constructor() {
    super("QuizScene");
    this.student = null;
    this.statements = [];
    this.currentIndex = 0;
    this.correctCount = 0;
  }

  init() {
    this.student = null;
    this.statements = [];
    this.currentIndex = 0;
    this.correctCount = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor("#e9dcc8");
    gameplayStart();

    this.createBackground();
    this.createHud();
    this.statusText.setText("Loading student...");

    loadRandomStudent()
      .then((student) => {
        if (!this.sys?.isActive()) return;
        this.student = student;
        this.statements = student?.statements || [];
        if (!Array.isArray(this.statements) || this.statements.length !== STATEMENTS_PER_STUDENT) {
          this.renderError("No student statements found.");
          return;
        }
        this.showStudentArrivalBanner();
        try {
          this.renderQuestion();
        } catch (error) {
          this.renderError(`Failed to start exam: ${error.message}`);
        }
      })
      .catch((error) => {
        if (!this.sys?.isActive()) return;
        this.renderError(`Failed to load students: ${error.message}`);
      });
  }

  showStudentArrivalBanner() {
    const major = this.student?.major ? ` (${this.student.major})` : "";
    const banner = this.add.text(540, 190, `${this.student.name}${major} brought exam papers`, {
      fontFamily: "Arial",
      fontSize: "34px",
      fontStyle: "bold",
      color: "#1e2b57",
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: 150,
      delay: 900,
      duration: 350,
      onComplete: () => banner.destroy(),
    });
  }

  renderError(message) {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, message, {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#fca5a5",
        align: "center",
        wordWrap: { width: 900 },
      })
      .setOrigin(0.5);

    this.createBackButton();
  }

  renderQuestion() {
    if (this.questionContainer) this.questionContainer.destroy(true);
    this.questionContainer = this.add.container(0, 0).setDepth(15);
    this.isAnswerPending = false;
    this.isReviewState = false;
    this.shouldEndRun = false;

    const item = this.statements[this.currentIndex];
    if (!item || typeof item.statement !== "string") {
      this.renderError("Failed to load question. Please retry.");
      return;
    }
    this.statusText.setText("Choose CORRECT or NOT CORRECT");
    this.updateHud();

    const stackContainer = this.add.container(540, 860);
    const backCardA = this.add
      .rectangle(-14, -12, 860, 1020, 0x0f172a, 0.06)
      .setStrokeStyle(2, 0x0f172a, 0.06)
      .setRotation(-0.06);
    const backCardB = this.add
      .rectangle(12, 10, 860, 1020, 0x0f172a, 0.05)
      .setStrokeStyle(2, 0x0f172a, 0.05)
      .setRotation(0.07);
    stackContainer.add([backCardA, backCardB]);

    const cardContainer = this.add.container(540, 860);
    const cardShadow = this.createCardShadow({
      width: 860,
      height: 1020,
      radius: 26,
    });
    const card = this.createRoundedRectGraphics({
      x: 0,
      y: 0,
      width: 840,
      height: 1000,
      radius: 24,
      fillColor: 0xfffdf7,
      fillAlpha: 1,
      strokeColor: 0x0f172a,
      strokeAlpha: 0.08,
      strokeWidth: 2,
    });
    const resultCard = this.createRoundedRectGraphics({
      x: 0,
      y: 0,
      width: 840,
      height: 1000,
      radius: 24,
      fillColor: 0x111827,
      fillAlpha: 0.98,
      strokeColor: 0x0f172a,
      strokeAlpha: 0.25,
      strokeWidth: 2,
    }).setScale(0, 1);

    const cardTopTint = this.add.rectangle(0, -230, 826, 540, 0xffffff, 0.12);
    const cardInnerShade = this.createRoundedRectGraphics({
      x: 0,
      y: 0,
      width: 812,
      height: 970,
      radius: 22,
      fillColor: 0x0f172a,
      fillAlpha: 0.028,
      strokeColor: 0xffffff,
      strokeAlpha: 0.08,
      strokeWidth: 2,
    });

    const statement = item.statement ?? "";
    const statementLength = statement.length;
    let factFontSize = 34;
    if (statementLength <= 60) factFontSize = 40;
    else if (statementLength >= 130) factFontSize = 28;

    const factText = this.add
      .text(0, -10, statement, {
        fontFamily: "Arial",
        fontSize: `${factFontSize}px`,
        fontStyle: "bold",
        color: "#1e2b57",
        align: "center",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5)
      .setLineSpacing(-4)
      .setLetterSpacing(-1);
    const resultText = this.add
      .text(0, -420, "", {
        fontFamily: "Arial",
        fontSize: "44px",
        fontStyle: "bold",
        color: "#0f172a",
        align: "center",
      })
      .setOrigin(0.5);
    const explanationText = this.add
      .text(0, 40, "", {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#0f172a",
        align: "center",
        wordWrap: { width: 720 },
      })
      .setOrigin(0.5)
      .setScale(0, 1);
    const dragLabel = this.add
      .text(0, -360, "", {
        fontFamily: "Arial",
        fontSize: "54px",
        fontStyle: "bold",
        color: "#f8fafc",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    cardContainer.add([
      cardShadow.container,
      resultCard,
      resultText,
      card,
      cardTopTint,
      cardInnerShade,
      factText,
      dragLabel,
      explanationText,
    ]);
    cardContainer.setSize(860, 1020);
    cardContainer.setInteractive({ draggable: true, useHandCursor: true });
    cardContainer.setScale(1.02);
    this.input.setDraggable(cardContainer, true);
    this.activeCardContainer = cardContainer;
    cardContainer.answerFront = [card, factText];
    cardContainer.answerBack = [resultCard, resultText, explanationText];
    cardContainer.dragLabel = dragLabel;
    cardContainer.shadowLayers = cardShadow.layers;
    this.setupCardSwipe(cardContainer);

    const falseButton = this.createAnswerButton(318, 1485, "NOT CORRECT", 0xdc6c86, false);
    const trueButton = this.createAnswerButton(762, 1485, "CORRECT", 0x2b9f89, true);
    this.answerButtons = [falseButton.bg, trueButton.bg];
    const nextButton = this.createNextButton();
    this.nextButton = nextButton;
    cardContainer.add(nextButton.label);
    const swipeHelper = this.add
      .text(540, 1602, "Swipe left or right", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    this.questionContainer.add([
      stackContainer,
      cardContainer,
      falseButton.bg,
      falseButton.glow,
      falseButton.label,
      falseButton.hint,
      trueButton.bg,
      trueButton.glow,
      trueButton.label,
      trueButton.hint,
      swipeHelper,
    ]);
  }

  createAnswerButton(x, y, label, color, value) {
    const glow = this.add
      .rectangle(x, y, 388, 108, color, 0.12)
      .setStrokeStyle(1, 0xffffff, 0.16);
    const bg = this.add
      .rectangle(x, y, 372, 94, color)
      .setStrokeStyle(1, 0xffffff, 0.52)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Arial",
        fontSize: "50px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    const hintText = this.add
      .text(x, y + 104, "", {})
      .setOrigin(0.5);

    bg.on("pointerdown", () => this.handleButtonAnswer(value));
    return { bg, glow, label: text, hint: hintText };
  }

  handleButtonAnswer(value) {
    if (this.isAnswerPending || this.isReviewState) return;
    this.playAnswerSequence(value, this.activeCardContainer);
  }

  playAnswerSequence(value, cardContainer) {
    if (this.isAnswerPending) return;
    this.isAnswerPending = true;

    const isCorrect = this.applyAnswerOutcome(value);
    if (isCorrect == null) {
      this.isAnswerPending = false;
      return;
    }
    this.updateHud();
    this.setAnswerButtonsEnabled(false);
    this.playAnswerMicroFeedback(isCorrect, cardContainer);

    if (!cardContainer || !cardContainer.active) {
      this.enterReviewState();
      return;
    }

    this.animateSwipe(cardContainer, value, () => {
      this.animateFlip(cardContainer, isCorrect, () => {
        this.animateReturn(cardContainer, () => {
          this.enterReviewState();
        });
      });
    });
  }

  applyAnswerOutcome(value) {
    const current = this.statements[this.currentIndex];
    if (!current) {
      this.renderError("Question data is unavailable. Please retry.");
      return null;
    }

    const isCorrect = value === current.isCorrect;
    if (isCorrect) {
      this.correctCount += 1;
    } else {
      // No lives; grade is computed from correctCount out of 5.
    }
    return isCorrect;
  }

  setupCardSwipe(cardContainer) {
    const swipeThreshold = 150;
    const tapMoveThreshold = 14;

    cardContainer.on("pointerdown", (pointer) => {
      cardContainer._tapStartX = pointer.x;
      cardContainer._tapStartY = pointer.y;
    });
    cardContainer.on("pointerup", (pointer) => {
      if (!this.isReviewState || this.isAnswerPending) return;
      const dx = pointer.x - (cardContainer._tapStartX ?? pointer.x);
      const dy = pointer.y - (cardContainer._tapStartY ?? pointer.y);
      if (Math.hypot(dx, dy) <= tapMoveThreshold) {
        this.advanceToNextQuestion(1);
      }
    });

    cardContainer.on("drag", (pointer, dragX) => {
      if (this.isAnswerPending) return;
      cardContainer.x = Phaser.Math.Clamp(dragX, 540 - 280, 540 + 280);
      const offset = cardContainer.x - 540;
      const tilt = Phaser.Math.Clamp(offset / 980, -0.14, 0.14);
      cardContainer.setRotation(tilt);

      const strength = Phaser.Math.Clamp(Math.abs(offset) / 220, 0, 1);
      this.setCardShadowAlpha(cardContainer, 1 - strength * 0.75);

      if (this.isReviewState) return;
      if (this.dragTint) {
        this.dragTint.setFillStyle(offset >= 0 ? 0x2b9f89 : 0xdc6c86, 0.2 * strength);
      }
      if (cardContainer.dragLabel) {
        cardContainer.dragLabel.setText(offset >= 0 ? "CORRECT" : "NOT CORRECT");
        cardContainer.dragLabel.setColor(offset >= 0 ? "#86efac" : "#fda4af");
        cardContainer.dragLabel.setAlpha(0.2 + strength * 0.8);
      }
    });

    cardContainer.on("dragend", () => {
      if (this.isAnswerPending) return;
      const offset = cardContainer.x - 540;

      if (offset <= -swipeThreshold) {
        if (this.isReviewState) {
          this.advanceToNextQuestion(-1);
        } else {
          this.playAnswerSequence(false, cardContainer);
        }
        return;
      }

      if (offset >= swipeThreshold) {
        if (this.isReviewState) {
          this.advanceToNextQuestion(1);
        } else {
          this.playAnswerSequence(true, cardContainer);
        }
        return;
      }

      // Restore shadow smoothly when swipe cancels.
      this.tweenCardShadowToBase(cardContainer, 320);

      this.tweens.add({
        targets: cardContainer,
        x: 540,
        rotation: 0,
        alpha: 1,
        duration: 160,
        onComplete: () => {
          if (this.dragTint) this.dragTint.setAlpha(0);
          if (cardContainer.dragLabel) cardContainer.dragLabel.setAlpha(0);
        },
      });
    });
  }

  animateSwipe(cardContainer, value, onComplete) {
    if (cardContainer?.shadowLayers?.length) {
      this.tweenCardShadow(cardContainer, 0, 340);
    }
    this.tweens.add({
      targets: cardContainer,
      x: value ? 760 : 320,
      rotation: value ? 0.2 : -0.2,
      alpha: 0.96,
      duration: 150,
      ease: "Sine.easeOut",
      onComplete,
    });
  }

  animateFlip(cardContainer, isCorrect, onComplete) {
    const [frontCard, frontText] = cardContainer.answerFront || [];
    const [backCard, backText, explanationText] = cardContainer.answerBack || [];
    if (!frontCard || !frontText || !backCard || !backText) {
      onComplete();
      return;
    }

    backText.setText(isCorrect ? "CORRECT" : "WRONG");
    backText.setColor("#0f172a");
    if (typeof backCard?.clear === "function") {
      this.redrawRoundedRectGraphics(backCard, {
        width: 840,
        height: 1000,
        radius: 24,
        fillColor: isCorrect ? 0xd1fae5 : 0xffe4e6,
        fillAlpha: 1,
        strokeColor: isCorrect ? 0x6ee7b7 : 0xfda4af,
        strokeAlpha: 0.85,
        strokeWidth: 3,
      });
    } else {
      backCard.setFillStyle(isCorrect ? 0xd1fae5 : 0xffe4e6, 1);
      backCard.setStrokeStyle(3, isCorrect ? 0x6ee7b7 : 0xfda4af, 0.85);
    }
    if (explanationText) {
      const current = this.statements?.[this.currentIndex];
      explanationText.setText(current?.explanation || "");
      explanationText.setColor("#0f172a");
      explanationText.setAlpha(0.98);
    }

    this.tweens.add({
      targets: [frontCard, frontText],
      scaleX: 0,
      duration: 120,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.tweens.add({
          targets: explanationText ? [backCard, backText, explanationText] : [backCard, backText],
          scaleX: 1,
          duration: 130,
          ease: "Sine.easeOut",
          onComplete: () => {
            // Ensure shadow is visible on the flipped state.
            this.tweenCardShadowToBase(cardContainer, 220);
            this.time.delayedCall(260, onComplete);
          },
        });
      },
    });
  }

  animateReturn(cardContainer, onComplete) {
    if (cardContainer?.shadowLayers?.length) {
      this.tweenCardShadowToBase(cardContainer, 360);
    }
    this.tweens.add({
      targets: cardContainer,
      x: 540,
      rotation: 0,
      alpha: 1,
      duration: 170,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (this.dragTint) this.dragTint.setAlpha(0);
        if (cardContainer?.dragLabel) cardContainer.dragLabel.setAlpha(0);
        onComplete();
      },
    });
  }

  enterReviewState() {
    this.isAnswerPending = false;
    this.isReviewState = true;
    if (this.nextButton) {
      this.nextButton.label.setVisible(true);
    }
  }

  advanceToNextQuestion(direction = 1) {
    if (this.isAnswerPending) return;
    const cardContainer = this.activeCardContainer;
    if (!cardContainer || !cardContainer.active) return;

    this.isAnswerPending = true;
    if (this.nextButton) {
      this.nextButton.label.setVisible(false);
    }

    this.tweens.add({
      targets: cardContainer,
      x: direction >= 0 ? 1320 : -240,
      rotation: direction >= 0 ? 0.22 : -0.22,
      alpha: 0.72,
      duration: 170,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.currentIndex += 1;
        if (this.currentIndex >= STATEMENTS_PER_STUDENT) {
          this.showResult();
        } else {
          this.renderQuestion();
        }
      },
    });
  }

  setAnswerButtonsEnabled(enabled) {
    if (!this.answerButtons) return;
    this.answerButtons.forEach((button) => {
      if (enabled) {
        button.setInteractive({ useHandCursor: true });
        button.setAlpha(1);
      } else {
        button.disableInteractive();
        button.setAlpha(0.45);
      }
    });
  }

  createNextButton() {
    const label = this.add
      // Local coordinates (added into cardContainer later)
      .text(388, 468, "Next", {
        fontFamily: "Arial",
        fontSize: "34px",
        fontStyle: "normal",
        color: "#94a3b8",
      })
      .setOrigin(1, 1)
      .setVisible(false);

    label.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.advanceToNextQuestion(1));
    return { label };
  }

  createBackground() {
    drawClassroom(this, { depth: 0, paperCount: 2 });
    this.dragTint = this.add.rectangle(540, 960, 1080, 1920, 0xe35d7a, 0).setDepth(20);
    this.flashTint = this.add.rectangle(540, 960, 1080, 1920, 0x2b9f89, 0).setDepth(20);
  }

  createHud() {
    this.streakText = this.add.text(26, 48, "Exam 1/5", {
      fontFamily: "Arial",
      fontSize: "40px",
      fontStyle: "bold",
      color: "#64748b",
    }).setOrigin(0, 0.5).setDepth(30);

    this.scoreText = this.add.text(1054, 48, "Correct: 0/5", {
      fontFamily: "Arial",
      fontSize: "34px",
      color: "#64748b",
      fontStyle: "bold",
      align: "right",
    }).setOrigin(1, 0.5).setDepth(30);
    this.statusText = this.add
      .text(this.scale.width / 2, 132, "Loading run...", {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#64748b",
        fontStyle: "normal",
      })
      .setOrigin(0.5)
      .setDepth(30);
  }

  createRoundedRectGraphics({
    x,
    y,
    width,
    height,
    radius,
    fillColor,
    fillAlpha = 1,
    strokeColor,
    strokeAlpha = 1,
    strokeWidth = 0,
  }) {
    const g = this.add.graphics();
    if (strokeWidth > 0 && strokeColor != null) {
      g.lineStyle(strokeWidth, strokeColor, strokeAlpha);
    }
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    if (strokeWidth > 0 && strokeColor != null) {
      g.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
    return g;
  }

  redrawRoundedRectGraphics(g, {
    width,
    height,
    radius,
    fillColor,
    fillAlpha = 1,
    strokeColor,
    strokeAlpha = 1,
    strokeWidth = 0,
  }) {
    g.clear();
    if (strokeWidth > 0 && strokeColor != null) {
      g.lineStyle(strokeWidth, strokeColor, strokeAlpha);
    }
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    if (strokeWidth > 0 && strokeColor != null) {
      g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
  }

  createCardShadow({ width, height, radius }) {
    // Layered shadow: darkest bottom-right, lightest top-left.
    const layers = [
      // Lighter + more transparent overall.
      { dx: 9, dy: 16, alpha: 0.07 },
      { dx: 5, dy: 10, alpha: 0.045 },
      { dx: 2, dy: 5, alpha: 0.025 },
    ].map(({ dx, dy, alpha }) => {
      const g = this.createRoundedRectGraphics({
        x: dx,
        y: dy,
        width,
        height,
        radius,
        fillColor: 0x000000,
        fillAlpha: alpha,
      });
      g._baseAlpha = alpha;
      return g;
    });
    const container = this.add.container(0, 0, layers);
    return { container, layers };
  }

  setCardShadowAlpha(cardContainer, multiplier) {
    if (!cardContainer?.shadowLayers?.length) return;
    const m = Phaser.Math.Clamp(multiplier, 0, 1);
    cardContainer.shadowLayers.forEach((layer) => {
      const base = layer._baseAlpha ?? 0.06;
      layer.setAlpha(base * m);
    });
  }

  tweenCardShadow(cardContainer, multiplier, durationMs) {
    if (!cardContainer?.shadowLayers?.length) return;
    const m = Phaser.Math.Clamp(multiplier, 0, 1);
    this.tweens.killTweensOf(cardContainer.shadowLayers);
    cardContainer.shadowLayers.forEach((layer) => {
      const base = layer._baseAlpha ?? 0.06;
      this.tweens.add({
        targets: layer,
        alpha: base * m,
        duration: durationMs,
        ease: "Sine.easeOut",
      });
    });
  }

  tweenCardShadowToBase(cardContainer, durationMs) {
    if (!cardContainer?.shadowLayers?.length) return;
    this.tweens.killTweensOf(cardContainer.shadowLayers);
    cardContainer.shadowLayers.forEach((layer) => {
      const base = layer._baseAlpha ?? 0.06;
      this.tweens.add({
        targets: layer,
        alpha: base,
        duration: durationMs,
        ease: "Sine.easeOut",
      });
    });
  }

  updateHud() {
    const studentName = this.student?.name ? ` • ${this.student.name}` : "";
    this.streakText.setText(`Exam ${this.currentIndex + 1}/${STATEMENTS_PER_STUDENT}${studentName}`);
    if (this.scoreText) {
      this.scoreText.setText(`Correct: ${this.correctCount}/${STATEMENTS_PER_STUDENT}`);
    }
  }

  playAnswerMicroFeedback(isCorrect, cardContainer) {
    if (!cardContainer) return;

    if (isCorrect) {
      this.showStreakPlusOne();
      this.flashScreen(0x2b9f89, 0.18);
      this.tweens.add({
        targets: cardContainer,
        scaleX: 1.055,
        scaleY: 1.055,
        duration: 90,
        yoyo: true,
        ease: "Quad.easeOut",
      });
      this.spawnCorrectBurst(cardContainer.x, cardContainer.y + 60);
      return;
    }

    this.flashScreen(0xdc6c86, 0.18);
    this.tweens.add({
      targets: cardContainer,
      x: cardContainer.x + 12,
      duration: 42,
      yoyo: true,
      repeat: 3,
      ease: "Sine.easeInOut",
    });
  }

  flashScreen(color, maxAlpha) {
    if (!this.flashTint) return;
    this.flashTint.setFillStyle(color, maxAlpha);
    this.flashTint.setAlpha(maxAlpha);
    this.tweens.add({
      targets: this.flashTint,
      alpha: 0,
      duration: 210,
      ease: "Quad.easeOut",
    });
  }

  showStreakPlusOne() {
    const plusOne = this.add.text(290, 84, "+1 🔥", {
      fontFamily: "Arial",
      fontSize: "30px",
      fontStyle: "bold",
      color: "#fde047",
    }).setOrigin(0.5);
    this.tweens.add({
      targets: plusOne,
      y: plusOne.y - 34,
      alpha: 0,
      duration: 420,
      ease: "Quad.easeOut",
      onComplete: () => plusOne.destroy(),
    });
  }

  spawnCorrectBurst(x, y) {
    for (let i = 0; i < 7; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(4, 7), 0x86efac, 0.95);
      const dx = Phaser.Math.Between(-120, 120);
      const dy = Phaser.Math.Between(-140, -30);
      this.tweens.add({
        targets: dot,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        scale: 0.5,
        duration: Phaser.Math.Between(280, 420),
        ease: "Quad.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
  }

  showResult() {
    gameplayStop();
    this.scene.start("QuizSummaryScene", {
      studentName: this.student?.name || "Student",
      correctCount: this.correctCount,
      total: STATEMENTS_PER_STUDENT,
    });
  }

  createBackButton() {
    const backBg = this.add
      .rectangle(540, 1080, 420, 120, 0x1d4ed8)
      .setStrokeStyle(2, 0xbfdbfe)
      .setInteractive({ useHandCursor: true });
    const backLabel = this.add
      .text(540, 1080, "Back to Worlds", {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#eff6ff",
      })
      .setOrigin(0.5);

    backBg.on("pointerdown", () => {
      this.scene.start("WorldsScene");
    });

    return { backBg, backLabel };
  }
}
