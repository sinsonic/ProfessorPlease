import Phaser from "phaser";
import { createCareerHud, updateCareerHud } from "../game/careerHud";
import {
  hasPendingOrActiveBooster,
  loadCareer,
  ownsDecoration,
  purchaseShopItem,
} from "../game/careerStore";
import { exitShop } from "../game/shopAccess";
import { drawClassroom, replaceClassroom } from "../game/classroomVisuals";
import { loadShopCatalog } from "../game/shopLoader";

export class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");
  }

  init(data) {
    this.parentScene = data?.parentScene || null;
  }

  create() {
    this.cameras.main.setBackgroundColor("#e9dcc8");
    this.classroom = drawClassroom(this, { depth: 0, paperCount: 1 });
    this.careerHud = createCareerHud(this, { depth: 30, top: 0 });
    updateCareerHud(this.careerHud);

    this.add.text(540, 150, "Faculty Shop", {
      fontFamily: "Arial",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0.5).setDepth(20);

    this.statusText = this.add.text(540, 210, "Loading catalog...", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#64748b",
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(20);

    this.itemContainer = this.add.container(0, 0).setDepth(20);
    this.activeTab = "decoration";
    this.shop = null;

    this.createExitButton();
    this.loadCatalog();
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
    bg.on("pointerdown", () => exitShop(this, this.parentScene));
  }

  async loadCatalog() {
    try {
      this.shop = await loadShopCatalog();
      this.statusText.setText("Spend your salary on decorations and next-day boosters.");
      this.renderTabs();
      this.renderItems();
    } catch (error) {
      this.statusText.setText(`Shop unavailable: ${error.message}`);
    }
  }

  renderTabs() {
    this.tabButtons?.forEach(({ bg, label }) => {
      bg.destroy();
      label.destroy();
    });
    this.tabButtons = [];
    const tabs = [
      { id: "decoration", label: "DECORATIONS" },
      { id: "booster", label: "BOOSTERS" },
    ];

    tabs.forEach((tab, index) => {
      const x = index === 0 ? 300 : 780;
      const bg = this.add.rectangle(x, 280, 420, 72, this.activeTab === tab.id ? 0x2b9f89 : 0xe2e8f0)
        .setStrokeStyle(0, 0, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(21);
      const label = this.add.text(x, 280, tab.label, {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: this.activeTab === tab.id ? "#ffffff" : "#1e2b57",
      }).setOrigin(0.5).setDepth(22);
      bg.on("pointerdown", () => {
        this.activeTab = tab.id;
        this.renderTabs();
        this.renderItems();
      });
      this.tabButtons.push({ bg, label, id: tab.id });
    });
  }

  renderItems() {
    this.itemContainer.removeAll(true);
    if (!this.shop) return;

    const items = this.shop.items.filter((item) => item.type === this.activeTab);
    const startY = 380;
    const gap = 155;

    items.forEach((item, index) => {
      const y = startY + index * gap;
      this.createItemCard(540, y, item);
    });
  }

  createItemCard(x, y, item) {
    const career = loadCareer();
    const owned = item.type === "decoration"
      ? ownsDecoration(item.decorationKey, career)
      : hasPendingOrActiveBooster(item.id, career);
    const canAfford = career.money >= item.price;
    const currency = this.shop.currency || "$";

    const card = this.add.container(x, y);
    this.itemContainer.add(card);

    const panel = this.add.graphics();
    panel.fillStyle(0xfffdf7, 1);
    panel.lineStyle(2, 0xcbd5e1, 0.8);
    panel.fillRoundedRect(-400, -60, 800, 120, 18);
    panel.strokeRoundedRect(-400, -60, 800, 120, 18);

    const title = this.add.text(-360, -30, item.name, {
      fontFamily: "Arial",
      fontSize: "30px",
      fontStyle: "bold",
      color: "#1e2b57",
    }).setOrigin(0, 0.5);

    const desc = this.add.text(-360, 8, item.description, {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#64748b",
      wordWrap: { width: 480 },
    }).setOrigin(0, 0.5);

    const priceText = this.add.text(120, -10, `${currency}${item.price}`, {
      fontFamily: "Arial",
      fontSize: "28px",
      fontStyle: "bold",
      color: canAfford ? "#2b9f89" : "#dc2626",
    }).setOrigin(0.5);

    let buttonLabel = "BUY";
    let buttonColor = 0x2b9f89;
    if (owned) {
      buttonLabel = item.type === "decoration" ? "OWNED" : "READY";
      buttonColor = 0x94a3b8;
    } else if (!canAfford) {
      buttonLabel = "TOO POOR";
      buttonColor = 0x94a3b8;
    }

    const buyBg = this.add.rectangle(300, 20, 170, 64, buttonColor)
      .setStrokeStyle(0, 0, 0);
    const buyLabel = this.add.text(300, 20, buttonLabel, {
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5);

    if (!owned && canAfford) {
      buyBg.setInteractive({ useHandCursor: true });
      buyBg.on("pointerdown", () => this.handlePurchase(item));
    }

    card.add([panel, title, desc, priceText, buyBg, buyLabel]);
  }

  handlePurchase(item) {
    const result = purchaseShopItem(item);
    updateCareerHud(this.careerHud, result.career);

    if (result.ok) {
      this.statusText.setText(`Purchased ${item.name}!`);
      this.renderItems();
      if (item.type === "decoration") {
        this.classroom = replaceClassroom(this, this.classroom, { depth: 0, paperCount: 1 });
      }
    } else {
      this.statusText.setText(result.reason);
    }
  }
}
