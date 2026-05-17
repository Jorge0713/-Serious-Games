

import * as Phaser from 'phaser';

export class MusicManagerScene extends Phaser.Scene {
  private bgMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: "MusicManagerScene" });
  }

  preload() {
    this.load.audio("menuMusic", "/Sound/MusicGame.mp3");
  }

  create() {
    // Evita duplicados
    const existingMusic = this.sound.get("menuMusic");

    if (existingMusic) {
      this.bgMusic = existingMusic;
    } else {
      this.bgMusic = this.sound.add("menuMusic", {
        loop: true,
        volume: 0,
      });

      try { this.bgMusic.play(); } catch { void 0; }
    }
  }
}
