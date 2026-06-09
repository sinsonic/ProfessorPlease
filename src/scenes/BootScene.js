import Phaser from "phaser";
import { preloadClassroomBackground } from "../game/classroomBackground";
import { preloadProfessorAvatar } from "../game/professorAvatar";
import { preloadIntroCutsceneAssets } from "../game/introCutsceneAssets";
import { preloadStudentAvatars } from "../game/studentAvatars";
import { startGameAfterBoot } from "../game/storyFlow";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    preloadClassroomBackground(this);
    preloadProfessorAvatar(this);
    preloadStudentAvatars(this);
    preloadIntroCutsceneAssets(this);

    this.load.on("loaderror", (file) => {
      console.error("Failed to load asset:", file?.key, file?.src);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor("#0f172a");
    this.add.text(540, 960, "Loading...", {
      fontFamily: "Arial",
      fontSize: "36px",
      color: "#e2e8f0",
    }).setOrigin(0.5);

    startGameAfterBoot(this);
  }
}
