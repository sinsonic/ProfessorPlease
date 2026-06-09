import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { DayEndScene } from "./scenes/DayEndScene";
import { ShopScene } from "./scenes/ShopScene";
import { SpecialScene } from "./scenes/SpecialScene";
import { QuizScene } from "./scenes/QuizScene";
import { QuizSummaryScene } from "./scenes/QuizSummaryScene";
import { IntroCutsceneScene } from "./scenes/IntroCutsceneScene";
import { StoryScene } from "./scenes/StoryScene";
import { WorldsScene } from "./scenes/WorldsScene";
import { initCrazyGames } from "./game/crazyGamesSdk";

const gameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 1080,
  height: 1920,
  backgroundColor: "#e9dcc8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, IntroCutsceneScene, StoryScene, WorldsScene, QuizScene, QuizSummaryScene, SpecialScene, DayEndScene, ShopScene],
};

initCrazyGames();
new Phaser.Game(gameConfig);
