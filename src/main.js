import Phaser from "phaser";
import "./styles.css";
import { SpecialScene } from "./scenes/SpecialScene";
import { QuizScene } from "./scenes/QuizScene";
import { QuizSummaryScene } from "./scenes/QuizSummaryScene";
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
  scene: [WorldsScene, QuizScene, QuizSummaryScene, SpecialScene],
};

initCrazyGames();
new Phaser.Game(gameConfig);
