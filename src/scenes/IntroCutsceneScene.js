import Phaser from "phaser";
import {
  hasIntroCutsceneAssets,
  PROFESSOR_BACK_KEY,
  TRAIN_STATION_KEY,
} from "../game/introCutsceneAssets";
import { markIntroCutsceneSeen } from "../game/careerStore";

const OPENING_LINE = "You accepted a teaching position at Ravenswood University. The pay was terrible. The town seemed normal. The crows disagreed.";
const WELCOME_LINE = "Welcome to Ravenswood.";
const TITLE_LINE = "PROFESSOR,\nPLEASE!";

export class IntroCutsceneScene extends Phaser.Scene {
  constructor() {
    super("IntroCutsceneScene");
  }

  init(data) {
    this.nextScene = data?.nextScene || "StoryScene";
    this.nextSceneData = data?.nextSceneData || { storyDay: 0, nextScene: "WorldsScene" };
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    if (!hasIntroCutsceneAssets(this)) {
      console.warn("Intro cutscene assets missing, skipping to next scene.");
      this.time.delayedCall(0, () => this.finish());
      return;
    }

    this.timers = [];
    this.playCutscene();
  }

  playCutscene() {
    const cx = 540;
    const cy = 960;

    const station = this.add.image(cx, cy, TRAIN_STATION_KEY);
    const coverScale = Math.max(1080 / station.width, 1920 / station.height);
    station.setScale(coverScale).setOrigin(0.5);

    const profHeight = 980;
    const profStartX = -460;
    const profEndX = cx - 220;
    const profFeetY = cy + 360;

    const professor = this.add.image(profStartX, profFeetY, PROFESSOR_BACK_KEY)
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setDepth(8);
    professor.setScale(profHeight / professor.height);

    const vignette = this.add.rectangle(cx, cy, 1080, 1920, 0x000000, 0.22).setDepth(5);

    const openingText = this.add.text(cx, 1520, "", {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "34px",
      color: "#f5f5f4",
      align: "center",
      lineSpacing: 10,
      wordWrap: { width: 900 },
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 8, fill: true },
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    const welcomeText = this.add.text(cx, 1480, WELCOME_LINE, {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "48px",
      fontStyle: "italic",
      color: "#fafaf9",
      align: "center",
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    const fadeOverlay = this.add.rectangle(cx, cy, 1080, 1920, 0x000000, 0)
      .setDepth(20);

    const titleText = this.add.text(cx, cy, TITLE_LINE, {
      fontFamily: "Arial",
      fontSize: "88px",
      fontStyle: "bold",
      color: "#fafaf9",
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    // Slow zoom toward the station sign (upper area).
    this.tweens.add({
      targets: station,
      scale: coverScale * 1.42,
      x: cx + 20,
      y: cy - 180,
      duration: 18000,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: openingText,
      alpha: 1,
      duration: 600,
      delay: 400,
    });

    this.runTypewriter(openingText, OPENING_LINE, 3600, 500);

    this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: professor,
        alpha: 1,
        duration: 1400,
        ease: "Sine.easeOut",
      });
      this.tweens.add({
        targets: professor,
        x: profEndX,
        duration: 5200,
        ease: "Sine.easeInOut",
      });
    });

    this.time.delayedCall(10500, () => {
      this.tweens.add({ targets: openingText, alpha: 0, duration: 700 });
      this.tweens.add({
        targets: welcomeText,
        alpha: 1,
        duration: 900,
        delay: 300,
      });
    });

    this.time.delayedCall(14000, () => {
      this.tweens.add({
        targets: fadeOverlay,
        alpha: 1,
        duration: 1200,
        ease: "Sine.easeIn",
      });
      this.tweens.add({
        targets: [station, professor, openingText, welcomeText, vignette],
        alpha: 0,
        duration: 1200,
      });
    });

    this.time.delayedCall(15500, () => {
      this.tweens.add({
        targets: titleText,
        alpha: 1,
        duration: 900,
        ease: "Sine.easeOut",
      });
    });

    this.time.delayedCall(18000, () => this.finish());
  }

  runTypewriter(textObj, fullText, durationMs, delayMs = 0) {
    const chars = fullText.length;
    if (chars === 0) return;

    const stepMs = durationMs / chars;
    let index = 0;

    const tick = () => {
      index += 1;
      textObj.setText(fullText.slice(0, index));
      if (index < chars) {
        this.timers.push(this.time.delayedCall(stepMs, tick));
      }
    };

    this.timers.push(this.time.delayedCall(delayMs, tick));
  }

  finish() {
    markIntroCutsceneSeen();
    const data = this.nextSceneData || undefined;
    if (this.nextScene === "StoryScene" && !data) {
      this.scene.start("WorldsScene");
      return;
    }
    this.scene.start(this.nextScene, data);
  }

  shutdown() {
    this.timers?.forEach((timer) => timer?.remove?.());
    this.timers = [];
  }
}
