import * as Phaser from "phaser";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";

export class TutorialScene extends Phaser.Scene {
  private dialog!: DialogueSystem;
  private step = 0;

  private platon!: Phaser.GameObjects.Sprite;
  private plato!: Phaser.GameObjects.Image;

  constructor() {
    super("TutorialScene");
  }

  preload() {
    this.load.spritesheet("platon", "/assets/platon.png", {
      frameWidth: 291,
      frameHeight: 256
    });

    this.load.image("plato", "/assets/plato.png");
  }

  create() {
    // 🎨 Fondo
    this.cameras.main.setBackgroundColor("#FCEC62");

    // 🍽️ Plato (centrado)
    this.plato = this.add.image(
      this.scale.width * 0.65,
      this.scale.height / 2,
      "plato"
    ).setScale(0.3);

    // 🧍 Platón (lado izquierdo)
    this.platon = this.add.sprite(
      this.scale.width * 0.15,
      this.scale.height * 0.65,
      "platon"
    ).setScale(1.3);

    // 🔥 Animación (solo ejemplo: saludo)
    this.anims.create({
      key: "wave",
      frames: this.anims.generateFrameNumbers("platon", {
        start: 0,
        end: 15
      }),
      frameRate: 12,
      repeat: -1
    });

    this.platon.play("wave");

    // 💬 Sistema de diálogo
    this.dialog = new DialogueSystem({
      scene: this,
      x: 50,
      y: this.scale.height - 140,
      width: this.scale.width - 850
    });

    // ▶️ Iniciar
    this.showStep();

    // 🖱️ Input
    this.input.on("pointerdown", () => {
      this.dialog.next(() => {
        this.step++;
        this.showStep();
      });
    });
  }

  private showStep() {
    const steps = [
      "Hola, soy Platón 🍽️",
      "Te enseñaré el Plato del Buen Comer",
      "Este plato te ayuda a alimentarte mejor",
      "Primero veremos las verduras 🥦"
    ];

    if (this.step < steps.length) {
      this.dialog.show(steps[this.step], 500);
    } else {
      this.scene.start("Nivel1Scene");
    }
  }
}