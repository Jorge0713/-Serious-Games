import * as Phaser from "phaser";

export class TestScene extends Phaser.Scene {
  private platon!: Phaser.GameObjects.Sprite;

  constructor() {
    super("TestScene");
  }

  preload() {
    // 🔥 Ajusta frameWidth/frameHeight a tu sprite real
    this.load.spritesheet("platon", "/assets/platon.png", {
      frameWidth: 291,
      frameHeight: 256
    });
  }

  create() {
    // Fondo simple
    this.add.rectangle(0, 0, 0, 0, 0x222222).setOrigin(0);

    // Crear sprite
    this.platon = this.add.sprite(180, 420, "platon");

    // 🔥 IMPORTANTE para pixel art
    this.textures.get("platon").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Crear animación (saludo)
    this.anims.create({
      key: "wave",
      frames: this.anims.generateFrameNumbers("platon", {
        start: 0,   // 👈 ajusta según tu spritesheet
        end: 15
      }),
      frameRate: 12,
      repeat: -1
    });

    // Reproducir animación
    this.platon.play("wave");

    // Escala (usa enteros)
    this.platon.setScale(1);
  }
}