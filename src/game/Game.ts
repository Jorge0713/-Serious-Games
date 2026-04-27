import * as Phaser from "phaser";
import { TutorialScene } from "./scenes/TutorialScene";

const config = {
  type: Phaser.AUTO,
  width: 1520,
  height: 720,
  parent: "game-container",
  pixelArt: true,
  backgroundColor: "#FCEC62",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
 },

  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true 
  },

  scene: [TutorialScene]
};

export class Game extends Phaser.Game {
  constructor() {
    super(config);
  }
}