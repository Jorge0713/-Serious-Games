import * as Phaser from "phaser";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";

export class TutorialScene extends Phaser.Scene {
  private dialog!: DialogueSystem;
  private step = 0;

  private platon!: Phaser.GameObjects.Sprite;
  private plato!: Phaser.GameObjects.Image;
  private fondo_cocina!: Phaser.GameObjects.Image;

  constructor() {
    super("TutorialScene");
  }

  preload() {
    this.load.spritesheet("platon", "/assets/platon.png", {
      frameWidth: 291,
      frameHeight: 256
    });

    this.load.image("plato", "/assets/plato.png");
    this.load.image("Fondo-cocina", "/assets/Fondo_Cocina.png")
  }

  create() {
    const { width, height } = this.scale;
    // 🎨 Fondo
    this.fondo_cocina = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "Fondo-cocina"
    ).setScale(0.5).setDisplaySize(width, height);
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

    // Animación (solo ejemplo: saludo)
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
      y: this.scale.height - 200,
      width: this.scale.width - 850,

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
      "¡Hola aventurero! Soy Platón🍽️, tu guía en esta misión saludable. Frente a ti está el Plato del Bien Comer, una herramienta creada para enseñarnos cómo combinar los alimentos de manera correcta y mantener una alimentación equilibrada.",
      "Este plato nos ayuda a comer de mejor manera y poder mantener una vida saludable!🫂",
      "El Plato del Bien Comer divide los alimentos en tres grupos principales: verduras y frutas, cereales, y leguminosas con alimentos de origen animal. Cada uno aporta nutrientes distintos que tu cuerpo necesita todos los días. ",
      "La idea principal no es comer solo un grupo, sino combinar los tres en proporciones adecuadas. Así obtienes energía, vitaminas, proteínas y minerales para crecer fuerte y mantenerte activo. ",
      "El plato tiene tres secciones y- comenzaremos con las verduaras. Prepárate para descubrir cómo funciona una comida balanceada.😉"
    ];

    if (this.step < steps.length) {
      this.dialog.show(steps[this.step], 500);
    } else {
      this.scene.start("Nivel1Scene");
    }
  }
}