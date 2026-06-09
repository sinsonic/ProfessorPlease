import Phaser from "phaser";
import { markStoryDaySeen } from "../game/careerStore";
import { getStoryBeatForDay } from "../game/storyLoader";
import {
  getStoryCinematicConfig,
  hasStoryCinematicAssets,
  preloadStoryCinematic,
} from "../game/storyCinematicAssets";

export class StoryScene extends Phaser.Scene {
  constructor() {
    super("StoryScene");
  }

  init(data) {
    this.storyDay = Number.isFinite(data?.storyDay) ? data.storyDay : 0;
    this.nextScene = data?.nextScene || "WorldsScene";
    this.beat = null;
  }

  create() {
    this.cameras.main.setBackgroundColor("#1a1410");
    this.renderLoading();
    getStoryBeatForDay(this.storyDay)
      .then((beat) => {
        if (!this.sys?.isActive()) return;
        if (!beat) {
          this.time.delayedCall(0, () => this.scene.start(this.nextScene));
          return;
        }
        this.beat = beat;
        if (beat.cinematic) {
          this.preloadCinematicThenRender(beat.cinematic);
          return;
        }
        this.renderTextBeat();
      })
      .catch((error) => {
        if (!this.sys?.isActive()) return;
        this.renderError(error.message);
      });
  }

  preloadCinematicThenRender(cinematicId) {
    const showBeat = () => {
      if (!this.sys?.isActive()) return;
      if (hasStoryCinematicAssets(this, cinematicId)) {
        this.renderCinematicBeat(cinematicId);
      } else {
        this.renderTextBeat();
      }
    };

    if (hasStoryCinematicAssets(this, cinematicId)) {
      showBeat();
      return;
    }

    preloadStoryCinematic(this, cinematicId);
    this.load.once("complete", showBeat);
    this.load.once("loaderror", showBeat);
    this.load.start();
  }

  renderLoading() {
    this.children.removeAll();
    this.add.text(540, 960, "Loading story...", {
      fontFamily: "Arial",
      fontSize: "32px",
      color: "#d6d3d1",
    }).setOrigin(0.5);
  }

  renderError(message) {
    this.children.removeAll();
    this.add.text(540, 900, `Could not load story: ${message}`, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#fca5a5",
      align: "center",
      wordWrap: { width: 860 },
    }).setOrigin(0.5);
    this.createButton(540, 1180, "CONTINUE", () => this.finish());
  }

  renderTextBeat() {
    this.children.removeAll();
    const cx = 540;
    const label = this.storyDay === 0
      ? "Ravenswood University"
      : `After Day ${this.storyDay}`;

    this.add.text(cx, 120, label, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#a8a29e",
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 210, this.beat.title, {
      fontFamily: "Arial",
      fontSize: "64px",
      fontStyle: "bold",
      color: "#fafaf9",
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5);

    this.createStoryPanel(cx, 980, 920, 1180);

    this.add.text(cx, 980, this.beat.text, {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "34px",
      color: "#e7e5e4",
      align: "center",
      lineSpacing: 12,
      wordWrap: { width: 820 },
    }).setOrigin(0.5);

    this.createButton(cx, 1720, "CONTINUE", () => this.finish(), 640, 140, 52, true);
  }

  renderCinematicBeat(cinematicId) {
    const config = getStoryCinematicConfig(cinematicId);
    if (!config || !hasStoryCinematicAssets(this, cinematicId)) {
      this.renderTextBeat();
      return;
    }

    this.children.removeAll();
    const cx = 540;
    const cy = 960;
    const label = `After Day ${this.storyDay}`;

    const sceneImage = this.add.image(cx, cy, config.imageKey).setOrigin(0.5);
    const coverScale = Math.max(1080 / sceneImage.width, 1920 / sceneImage.height);
    sceneImage.setScale(coverScale).setAlpha(0);

    const dust = this.add.image(cx, cy, config.dustKey)
      .setOrigin(0.5)
      .setDisplaySize(1080, 1920)
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.SCREEN);

    const textBackdrop = this.add.graphics();
    textBackdrop.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.82, 0.82);
    textBackdrop.fillRect(0, 1040, 1080, 780);
    textBackdrop.setAlpha(0);

    const labelText = this.add.text(cx, 1100, label, {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#d6d3d1",
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0);

    const titleText = this.add.text(cx, 1170, this.beat.title, {
      fontFamily: "Arial",
      fontSize: "58px",
      fontStyle: "bold",
      color: "#fafaf9",
      align: "center",
      wordWrap: { width: 900 },
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 10, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    const bodyText = this.add.text(cx, 1320, this.beat.text, {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "30px",
      color: "#f5f5f4",
      align: "center",
      lineSpacing: 10,
      wordWrap: { width: 860 },
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 8, fill: true },
    }).setOrigin(0.5, 0).setAlpha(0);

    const continueButton = this.createButton(cx, 1830, "CONTINUE", () => this.finish(), 640, 140, 52, true);
    continueButton.bg.setAlpha(0);
    continueButton.label.setAlpha(0);

    this.tweens.add({
      targets: sceneImage,
      alpha: 1,
      duration: 900,
      ease: "Sine.easeOut",
    });

    this.tweens.add({
      targets: sceneImage,
      scale: coverScale * 1.08,
      x: cx + 12,
      y: cy - 20,
      duration: 12000,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: dust,
      alpha: 0.52,
      duration: 1600,
      delay: 300,
      ease: "Sine.easeOut",
    });

    this.tweens.add({
      targets: dust,
      alpha: 0.68,
      x: cx + 20,
      duration: 5000,
      delay: 1200,
      ease: "Sine.easeInOut",
      yoyo: true,
    });

    this.tweens.add({
      targets: textBackdrop,
      alpha: 1,
      duration: 700,
      delay: 800,
    });

    this.tweens.add({
      targets: labelText,
      alpha: 1,
      duration: 600,
      delay: 1000,
    });

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 800,
      delay: 1300,
    });

    this.tweens.add({
      targets: bodyText,
      alpha: 1,
      duration: 1000,
      delay: 1800,
    });

    this.tweens.add({
      targets: [continueButton.bg, continueButton.label],
      alpha: 1,
      duration: 600,
      delay: 2600,
    });
  }

  createStoryPanel(x, y, width, height) {
    this.add.graphics()
      .fillStyle(0x000000, 0.35)
      .fillRoundedRect(x - width / 2 + 10, y - height / 2 + 14, width, height, 28);
    this.add.graphics()
      .lineStyle(2, 0x78716c, 0.35)
      .fillStyle(0x292524, 0.92)
      .fillRoundedRect(x - width / 2, y - height / 2, width, height, 28)
      .strokeRoundedRect(x - width / 2, y - height / 2, width, height, 28);
  }

  createButton(x, y, label, onClick, width = 420, height = 110, fontSize = 36, primary = false) {
    this.add.graphics()
      .fillStyle(0x000000, 0.25)
      .fillRoundedRect(x - width / 2 + 6, y - height / 2 + 10, width, height, 26);
    const bg = this.add.rectangle(x, y, width, height, primary ? 0x57534e : 0x44403c, primary ? 1 : 0.8)
      .setStrokeStyle(2, 0x78716c, 0.5)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: `${fontSize}px`,
      fontStyle: primary ? "bold" : "normal",
      color: "#fafaf9",
    }).setOrigin(0.5);
    bg.on("pointerdown", onClick);
    return { bg, label: text };
  }

  finish() {
    markStoryDaySeen(this.storyDay);
    this.time.delayedCall(0, () => this.scene.start(this.nextScene));
  }
}
