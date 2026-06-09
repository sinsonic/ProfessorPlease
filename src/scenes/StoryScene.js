import Phaser from "phaser";
import { markStoryDaySeen } from "../game/careerStore";
import { getStoryBeatForDay } from "../game/storyLoader";

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
        this.renderBeat();
      })
      .catch((error) => {
        if (!this.sys?.isActive()) return;
        this.renderError(error.message);
      });
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

  renderBeat() {
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
    this.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: `${fontSize}px`,
      fontStyle: primary ? "bold" : "normal",
      color: "#fafaf9",
    }).setOrigin(0.5);
    bg.on("pointerdown", onClick);
  }

  finish() {
    markStoryDaySeen(this.storyDay);
    this.time.delayedCall(0, () => this.scene.start(this.nextScene));
  }
}
