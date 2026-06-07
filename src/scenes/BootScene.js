import Phaser from "phaser";
import { preloadClassroomBackground } from "../game/classroomBackground";
import { preloadProfessorAvatar } from "../game/professorAvatar";
import { preloadStudentAvatars } from "../game/studentAvatars";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    preloadClassroomBackground(this);
    preloadProfessorAvatar(this);
    preloadStudentAvatars(this);
  }

  create() {
    this.scene.start("WorldsScene");
  }
}
