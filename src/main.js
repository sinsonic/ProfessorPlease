import Phaser from "phaser";
import "./styles.css";
import { DayEndScene } from "./scenes/DayEndScene";
import { ShopScene } from "./scenes/ShopScene";
import { SpecialScene } from "./scenes/SpecialScene";
import { QuizScene } from "./scenes/QuizScene";
import { QuizSummaryScene } from "./scenes/QuizSummaryScene";
import { HiddenObjectScene } from "./scenes/HiddenObjectScene";
import { WorldsScene } from "./scenes/WorldsScene";
import { initCrazyGames } from "./game/crazyGamesSdk";

const gameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 1080,
  height: 1920,
  backgroundColor: "#0f172a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [WorldsScene, QuizScene, QuizSummaryScene, SpecialScene, DayEndScene, ShopScene, HiddenObjectScene],
};

initCrazyGames();
new Phaser.Game(gameConfig);
