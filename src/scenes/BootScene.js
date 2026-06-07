import Phaser from "phaser";
import { preloadClassroomBackground } from "../game/classroomBackground";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    preloadClassroomBackground(this);
  }

  create() {
    this.scene.start("WorldsScene");
  }
}
