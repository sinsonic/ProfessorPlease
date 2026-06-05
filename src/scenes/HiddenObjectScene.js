import Phaser from "phaser";
import { drawHiddenObjectDesk } from "../game/hiddenObjectTable";
import { loadHiddenObjectLevel } from "../game/hiddenObjectLoader";

export class HiddenObjectScene extends Phaser.Scene {
  constructor() {
    super("HiddenObjectScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#6b4423");
    this.foundIds = new Set();
    this.checklistRows = new Map();
    this.isComplete = false;

    this.createHud();
    this.createExitButton();
    this.loadLevel();
  }

  createHud() {
    this.hud = this.add.container(0, 0).setDepth(50);

    const headerBg = this.add.rectangle(540, 118, 1080, 236, 0xfffdf7, 0.96);
    const headerLine = this.add.rectangle(540, 236, 1080, 3, 0xcbd5e1, 0.8);

    this.titleText = this.add.text(540, 52, "The Messy Desk", {
      fontFamily: "Arial",
      fontSize: "42px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);

    this.subtitleText = this.add.text(540, 104, "Find every hidden item.", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#64748b",
    }).setOrigin(0.5);

    this.progressText = this.add.text(540, 148, "Found: 0 / 0", {
      fontFamily: "Arial",
      fontSize: "28px",
      fontStyle: "bold",
      color: "#7c3aed",
    }).setOrigin(0.5);

    this.hintText = this.add.text(540, 196, "Tap items on the desk.", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#64748b",
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5);

    this.checklistContainer = this.add.container(860, 360).setDepth(50);
    this.checklistPanel = this.add.rectangle(0, 0, 360, 520, 0xfffdf7, 0.94)
      .setStrokeStyle(2, 0xcbd5e1, 0.9);
    this.checklistTitle = this.add.text(0, -220, "CHECKLIST", {
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);
    this.checklistContainer.add([this.checklistPanel, this.checklistTitle]);

    this.hud.add([headerBg, headerLine, this.titleText, this.subtitleText, this.progressText, this.hintText]);
  }

  createExitButton() {
    const x = 140;
    const y = 1840;
    this.add.graphics()
      .fillStyle(0x000000, 0.08)
      .fillRoundedRect(x - 110 + 4, y - 36 + 6, 220, 72, 18)
      .setDepth(60);
    const bg = this.add.rectangle(x, y, 220, 72, 0x64748b)
      .setStrokeStyle(0, 0, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(60);
    this.add.text(x, y, "EXIT", {
      fontFamily: "Arial",
      fontSize: "32px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(61);
    bg.on("pointerdown", () => this.scene.start("WorldsScene"));
  }

  async loadLevel() {
    this.statusText = this.add.text(540, 960, "Loading desk...", {
      fontFamily: "Arial",
      fontSize: "30px",
      color: "#fffdf7",
    }).setOrigin(0.5).setDepth(40);

    try {
      this.level = await loadHiddenObjectLevel();
      this.statusText.destroy();
      this.renderLevel();
    } catch (error) {
      this.statusText.setText(`Desk unavailable: ${error.message}`);
      this.statusText.setColor("#fca5a5");
    }
  }

  renderLevel() {
    this.titleText.setText(this.level.title);
    this.subtitleText.setText(this.level.subtitle);
    this.updateProgress();

    this.desk = drawHiddenObjectDesk(this, this.level.targets);
    this.desk.root.setDepth(10);
    this.desk.hitZones.forEach((entry) => {
      entry.zone.setDepth(20);
      entry.zone.on("pointerdown", () => this.handleTargetTap(entry));
    });

    this.renderChecklist();
  }

  renderChecklist() {
    const startY = -170;
    const gap = 54;
    this.level.targets.forEach((target, index) => {
      const y = startY + index * gap;
      const row = this.add.text(0, y, `○ ${target.label}`, {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#64748b",
      }).setOrigin(0.5);
      this.checklistContainer.add(row);
      this.checklistRows.set(target.id, row);
    });
  }

  handleTargetTap(entry) {
    if (this.isComplete) return;

    const { target, zone, visual } = entry;
    if (this.foundIds.has(target.id)) return;

    this.foundIds.add(target.id);
    zone.disableInteractive();

    const ring = this.add.circle(target.x, target.y, 48, 0x000000, 0)
      .setStrokeStyle(4, 0x22c55e, 1)
      .setDepth(25);
    this.tweens.add({
      targets: ring,
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: 0,
      duration: 500,
      onComplete: () => ring.destroy(),
    });

    this.tweens.add({
      targets: visual,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 180,
    });

    const row = this.checklistRows.get(target.id);
    if (row) {
      row.setText(`✓ ${target.label}`);
      row.setColor("#15803d");
      row.setFontStyle("bold");
    }

    this.hintText.setText(target.hint || `Found the ${target.label}.`);
    this.updateProgress();

    if (this.foundIds.size >= this.level.targets.length) {
      this.completeLevel();
    }
  }

  updateProgress() {
    const total = this.level?.targets?.length ?? 0;
    this.progressText.setText(`Found: ${this.foundIds.size} / ${total}`);
  }

  completeLevel() {
    if (this.isComplete) return;
    this.isComplete = true;

    const overlay = this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.45).setDepth(70);
    const panel = this.add.rectangle(540, 900, 760, 420, 0xfffdf7).setDepth(71);
    const title = this.add.text(540, 780, "Desk Cleared!", {
      fontFamily: "Arial",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5).setDepth(72);
    const body = this.add.text(540, 880, "You found every hidden object.\nThe audit can wait.", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#64748b",
      align: "center",
    }).setOrigin(0.5).setDepth(72);

    const btn = this.add.rectangle(540, 1000, 360, 90, 0x7c3aed)
      .setInteractive({ useHandCursor: true })
      .setDepth(72);
    const btnLabel = this.add.text(540, 1000, "BACK HOME", {
      fontFamily: "Arial",
      fontSize: "32px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(73);

    btn.on("pointerdown", () => this.scene.start("WorldsScene"));
    this.hintText.setText("All items found. Nice work, Professor.");

    [panel, title, body, btn, btnLabel].forEach((item) => item.setAlpha(0).setScale(0.92));
    this.tweens.add({
      targets: [panel, title, body, btn, btnLabel],
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 280,
      ease: "Back.easeOut",
    });

    overlay.setInteractive();
  }
}
