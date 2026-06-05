import Phaser from "phaser";
import { createCareerHud, updateCareerHud } from "../game/careerHud";
import { completeWorkDay, loadCareer } from "../game/careerStore";
import { drawClassroom } from "../game/classroomVisuals";
import { getDailySalaryForReputation } from "../game/salaryLoader";

export class DayEndScene extends Phaser.Scene {
  constructor() {
    super("DayEndScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#e9dcc8");
    drawClassroom(this, { depth: 0, paperCount: 2 });

    const beforePay = loadCareer();
    this.careerHud = createCareerHud(this, { depth: 30, top: 0 });
    updateCareerHud(this.careerHud, beforePay);

    this.renderPayday(beforePay);
  }

  async renderPayday(beforePay) {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.text(cx, cy - 300, "End of Work Day", {
      fontFamily: "Arial",
      fontSize: "58px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5);

    const loading = this.add.text(cx, cy - 180, "Calculating salary...", {
      fontFamily: "Arial",
      fontSize: "30px",
      color: "#64748b",
    }).setOrigin(0.5);

    try {
      const payInfo = await getDailySalaryForReputation(beforePay.reputation);
      loading.destroy();

      const result = completeWorkDay(payInfo.salary);
      updateCareerHud(this.careerHud, result.career);

      this.createRoundedPanel(cx, cy + 20, 860, 720);

      this.add.text(cx, cy - 80, `Day ${result.completedDay} complete`, {
        fontFamily: "Arial",
        fontSize: "44px",
        fontStyle: "bold",
        color: "#1e2b57",
      }).setOrigin(0.5);

      this.add.text(cx, cy + 10, `Rank: ${payInfo.title}`, {
        fontFamily: "Arial",
        fontSize: "34px",
        color: "#64748b",
      }).setOrigin(0.5);

      this.add.text(cx, cy + 80, `Salary earned: ${payInfo.currency}${payInfo.salary}`, {
        fontFamily: "Arial",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#2b9f89",
      }).setOrigin(0.5);

      this.add.text(cx, cy + 160, `Reputation: ${beforePay.reputation}`, {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#1e2b57",
      }).setOrigin(0.5);

      this.add.text(cx, cy + 220, `Total savings: ${payInfo.currency}${result.career.money}`, {
        fontFamily: "Arial",
        fontSize: "38px",
        fontStyle: "bold",
        color: "#1e2b57",
      }).setOrigin(0.5);

      if (result.salaryMultiplier > 1) {
        this.add.text(cx, cy + 270, `Booster bonus applied (${Math.round(result.salaryMultiplier * 100)}%)`, {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#2b9f89",
        }).setOrigin(0.5);
      }

      this.createButton(cx, cy + 340, "VISIT SHOP", () => {
        this.scene.start("ShopScene", { nextDay: result.career.day });
      }, 640, 140, 52, true);
    } catch (error) {
      loading.setText(`Payday error: ${error.message}`);
      loading.setColor("#dc2626");
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
