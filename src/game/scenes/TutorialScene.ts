import * as Phaser from "phaser";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";
import { hoverScale } from "../../componentes/HoverScale";

export class TutorialScene extends Phaser.Scene {
  private dialog!: DialogueSystem;
  private step = 0;

  private platon!: Phaser.GameObjects.Sprite;
  private plato!: Phaser.GameObjects.Image;
  private fondo_cocina!: Phaser.GameObjects.Image;

  private isExpanded = false;
  private activeSection: string | null = null;
private expandedSprites: Phaser.GameObjects.Sprite[] = [];
  private btnVolver!: Phaser.GameObjects.Image;

  private hoverSound!: Phaser.Sound.BaseSound;
  private clickSound!: Phaser.Sound.BaseSound;

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
    this.load.image("btn-Volver", "/assets/Buttons/BotonVolver.png");
    this.load.spritesheet("partes_plato", "/Partes_plato.png", {
      frameWidth: 512,
      frameHeight: 512
    });

    this.load.audio("Hover", "/Sound/hiverSound.mp3");
    this.load.audio("Click", "/Sound/Click.mp3");
  }

  create() {
    const { width, height } = this.scale;

    this.hoverSound = this.sound.add("Hover", { volume: 0.2 });
    this.clickSound = this.sound.add("Click", { volume: 0.3 });

    this.fondo_cocina = this.add.image(
      width / 2,
      height / 2,
      "Fondo-cocina"
    ).setScale(0.5).setDisplaySize(width, height);
    void this.fondo_cocina;

    this.plato = this.add.image(
      width * 0.65,
      height / 2,
      "plato"
    ).setScale(0.3);
    void this.plato;

    this.platon = this.add.sprite(
      width * 0.15,
      height * 0.65,
      "platon"
    ).setScale(1.3);

    this.anims.create({
      key: "wave",
      frames: this.anims.generateFrameNumbers("platon", { start: 0, end: 15 }),
      frameRate: 12,
      repeat: -1
    });
    this.platon.play("wave");

    this.dialog = new DialogueSystem({
      scene: this,
      x: 50,
      y: height - 200,
      width: width - 850,
    });

    this.showStep();

    this.input.on("pointerdown", () => {
      if (this.isExpanded || this.step >= 5) return;

      this.dialog.next(() => {
        this.step++;
        this.showStep();
      });
    });

    this.createInteractiveZones();

    this.btnVolver = this.add.image(width * 0.15, height * 0.25, 'btn-Volver')
      .setInteractive()
      .setScale(1.3)
      .setAlpha(0)

    hoverScale(this, this.btnVolver, {
      scaleOver: 1.2,
      duration: 150,
      hoverSound: this.hoverSound
    })

    this.btnVolver.on("pointerdown", () => {
      this.clickSound.play();
      this.scene.start("MainMenu");
    });

    this.add.text(width - 50, 50, "Menú Principal", {
      fontSize: "32px",
      fontFamily: "Arial",
      color: "#ffffff",
      backgroundColor: "#4CAF50",
      padding: { x: 20, y: 10 }
    })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(100)
      .on("pointerover", function (this: Phaser.GameObjects.Text) { this.setTint(0xdddddd); })
      .on("pointerout", function (this: Phaser.GameObjects.Text) { this.clearTint(); })
      .on("pointerdown", () => {
        this.clickSound.play();
        this.scene.start("MainMenu");
      });
  }

  private createInteractiveZones() {
    const px = this.plato.x;
    const py = this.plato.y;

    const pw = 2963 * 0.3;
    const ph = 1828 * 0.3;

    const zonesConfig = [
      { id: "verduras", ox: -pw / 4, oy: -ph / 4, w: pw / 2, h: ph / 2, frame: 0, msg: "¡Aprende sobre frutas y verduras!" },
      { id: "frutas", ox: pw / 4, oy: -ph / 4, w: pw / 2, h: ph / 2, frame: 1, msg: "¡Aprende sobre frutas y verduras!" },
      { id: "cereales", ox: -pw / 3, oy: ph / 4, w: pw / 3, h: ph / 2, frame: 3, msg: "¡Conoce los cereales y tubérculos!" },
      { id: "leguminosas", ox: 0, oy: ph / 4, w: pw / 3, h: ph / 2, frame: 4, msg: "¡Descubre las leguminosas!" },
      { id: "animal", ox: pw / 3, oy: ph / 4, w: pw / 3, h: ph / 2, frame: 5, msg: "¡Conoce los alimentos de origen animal!" }
    ];

    zonesConfig.forEach(z => {
      const zone = this.add.zone(px + z.ox, py + z.oy, z.w, z.h)
        .setInteractive({ useHandCursor: true });

      zone.on("pointerover", () => {
        if (this.isExpanded) return;

        this.activeSection = z.id;
        this.hoverSound.play();

        this.plato.setTint(0xddffdd);
        this.tweens.add({
          targets: this.plato,
          scale: 0.33,
          duration: 150,
          ease: "Power1"
        });

        this.dialog.show(z.msg, 0);
      });

      zone.on("pointerout", () => {
        if (this.isExpanded) return;
        if (this.activeSection === z.id) {
          this.activeSection = null;
        }

        this.plato.clearTint();
        this.tweens.add({
          targets: this.plato,
          scale: 0.3,
          duration: 150,
          ease: "Power1"
        });

        this.dialog.show("Haz clic en una sección del plato para explorarla más a fondo.", 0);
      });

      zone.on("pointerdown", () => {
        if (this.isExpanded) return;
        this.clickSound.play();
        this.expandSection(z.id, z.frame);
      });
    });
  }

  private expandSection(sectionId: string, _frameId: number) {
    this.isExpanded = true;

    this.tweens.add({
      targets: this.plato,
      alpha: 0,
      scale: 0,
      duration: 300,
      ease: "Power2"
    });

    const { width, height } = this.scale;
    const centerY = height / 2;

    if (sectionId === "verduras" || sectionId === "frutas") {
      const verduraSprite = this.add.sprite(-200, centerY, "partes_plato", 0).setScale(0.8).setInteractive({ useHandCursor: true });
      const frutaSprite = this.add.sprite(width + 200, centerY, "partes_plato", 1).setScale(0.8).setInteractive({ useHandCursor: true });

      this.expandedSprites.push(verduraSprite, frutaSprite);

      this.tweens.add({
        targets: verduraSprite,
        x: width * 0.62,
        duration: 500,
        ease: "Back.easeOut"
      });

      this.tweens.add({
        targets: frutaSprite,
        x: width * 0.78,
        duration: 500,
        ease: "Back.easeOut"
      });

      verduraSprite.on('pointerdown', () => {
        const showTutorial = (window as any).showTutorial;
        if (showTutorial) {
          showTutorial(['vegetable', 'fruit'])
        }
      })

      frutaSprite.on('pointerdown', () => {
        const showTutorial = (window as any).showTutorial;
        if (showTutorial) {
          showTutorial(['fruit', 'vegetable'])
        }
      })
    }
    else if (sectionId === "cereales") {
      const cerealSprite = this.add.sprite(width * 0.65, centerY, "partes_plato", 3).setScale(0.8).setInteractive({ useHandCursor: true });

      this.expandedSprites.push(cerealSprite);

      this.tweens.add({
        targets: cerealSprite,
        scale: 0.9,
        alpha: 1,
        duration: 500,
        ease: "Back.easeOut"
      });

      cerealSprite.on('pointerdown', () => {
        const showTutorial = (window as any).showTutorial;
        if (showTutorial) {
          showTutorial('cereal')
        }
      })
    }
    else if (sectionId === "animal") {
      const animalSprite = this.add.sprite(width * 0.65, centerY, "partes_plato", 5).setScale(0.8).setInteractive({ useHandCursor: true });

      this.expandedSprites.push(animalSprite);

      this.tweens.add({
        targets: animalSprite,
        scale: 0.9,
        alpha: 1,
        duration: 500,
        ease: "Back.easeOut"
      });

      animalSprite.on('pointerdown', () => {
        const showTutorial = (window as any).showTutorial;
        if (showTutorial) {
          showTutorial('animal')
        }
      })
    }
    else {
      const legumeSprite = this.add.sprite(width * 0.65, centerY, "partes_plato", 4).setScale(0.8).setInteractive({ useHandCursor: true });

      this.expandedSprites.push(legumeSprite);

      this.tweens.add({
        targets: legumeSprite,
        scale: 0.9,
        alpha: 1,
        duration: 500,
        ease: "Back.easeOut"
      });

      legumeSprite.on('pointerdown', () => {
        const showTutorial = (window as any).showTutorial;
        if (showTutorial) {
          showTutorial('legume')
        }
      })
    }

    this.tweens.add({
      targets: this.btnVolver,
      alpha: 1,
      duration: 300
    });
  }

  

  private showStep() {
    const steps = [
      "¡Hola aventurero! Soy Platón🍽️, tu guía en esta misión saludable. Frente a ti está el Plato del Bien Comer.",
      "Este plato nos ayuda a comer de mejor manera y poder mantener una vida saludable!🫂",
      "El Plato del Bien Comer divide los alimentos en tres grupos principales: verduras y frutas, cereales, y leguminosas con alimentos de origen animal.",
      "La idea principal no es comer solo un grupo, sino combinar los tres en proporciones adecuadas.",
      "¡Ahora es tu turno! Pasa el mouse sobre el plato para explorarlo e interactuar con sus secciones.😉"
    ];

    if (this.step < steps.length) {
      this.dialog.show(steps[this.step], 500);
    }
  }
}