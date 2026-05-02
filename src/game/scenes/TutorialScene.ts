import * as Phaser from "phaser";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";

export class TutorialScene extends Phaser.Scene {
  private dialog!: DialogueSystem;
  private step = 0;

  private platon!: Phaser.GameObjects.Sprite;
  private plato!: Phaser.GameObjects.Image;
  private fondo_cocina!: Phaser.GameObjects.Image;

  // Estados interactivos
  private isExpanded = false;
  private activeSection: string | null = null;
  private expandedSprites: Phaser.GameObjects.Sprite[] = [];
  private btnVolver!: Phaser.GameObjects.Text;

  // Audios
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

    // Cargar spritesheet de partes del plato
    this.load.spritesheet("partes_plato", "/Partes_plato.png", {
      frameWidth: 512,
      frameHeight: 512
    });

    // Cargar sonidos
    this.load.audio("Hover", "/Sound/hiverSound.mp3");
    this.load.audio("Click", "/Sound/Click.mp3");
  }

  create() {
    const { width, height } = this.scale;

    // 🔊 Inicializar sonidos
    this.hoverSound = this.sound.add("Hover", { volume: 0.2 });
    this.clickSound = this.sound.add("Click", { volume: 0.3 });

    // 🎨 Fondo
    this.fondo_cocina = this.add.image(
      width / 2,
      height / 2,
      "Fondo-cocina"
    ).setScale(0.5).setDisplaySize(width, height);

    // 🍽️ Plato (centrado a la derecha)
    this.plato = this.add.image(
      width * 0.65,
      height / 2,
      "plato"
    ).setScale(0.3);

    // 🧍 Platón (lado izquierdo)
    this.platon = this.add.sprite(
      width * 0.15,
      height * 0.65,
      "platon"
    ).setScale(1.3);

    // Animación de saludo
    this.anims.create({
      key: "wave",
      frames: this.anims.generateFrameNumbers("platon", { start: 0, end: 15 }),
      frameRate: 12,
      repeat: -1
    });
    this.platon.play("wave");

    // 💬 Sistema de diálogo
    this.dialog = new DialogueSystem({
      scene: this,
      x: 50,
      y: height - 200,
      width: width - 850,
    });

    // ▶️ Iniciar tutorial base
    this.showStep();

    // 🖱️ Input principal para avanzar el diálogo
    // Solo permitimos avanzar el diálogo si NO estamos en el modo expandido interactivo
    this.input.on("pointerdown", () => {
      // Si el tutorial ya terminó sus pasos iniciales, evitamos que avance para poder jugar con el plato
      if (this.isExpanded || this.step >= 5) return;

      this.dialog.next(() => {
        this.step++;
        this.showStep();
      });
    });

    // 🔧 CREAR ZONAS INTERACTIVAS SOBRE EL PLATO
    this.createInteractiveZones();

    // 🔙 BOTÓN REGRESAR (oculto por defecto)
    this.btnVolver = this.add.text(50, 50, "⬅ Volver al Plato", {
      fontSize: "32px",
      fontFamily: "Arial",
      color: "#ffffff",
      backgroundColor: "#d9534f",
      padding: { x: 20, y: 10 }
    })
      .setInteractive({ useHandCursor: true })
      .setAlpha(0)
      .setDepth(100)
      .on("pointerdown", () => this.restorePlate());
  }

  /**
   * Crea zonas geométricas transparentes sobre la imagen del plato.
   */
  private createInteractiveZones() {
    const px = this.plato.x;
    const py = this.plato.y;

    // Dimensiones exactas visuales del plato (ancho original 2963 x escala 0.3)
    const pw = 2963 * 0.3; // ~888.9
    const ph = 1828 * 0.3; // ~548.4

    // Dividimos el plato sin superposiciones (overlap):
    // - Mitad superior: dividida en 2 (Verduras, Frutas)
    // - Mitad inferior: dividida en 3 (Cereales, Leguminosas, Animal)
    // Nota: El frame 2 está vacío, así que Cereales es 3, Leguminosas es 4, Animal es 5.
    const zonesConfig = [
      // Top half (2 columnas)
      { id: "verduras", ox: -pw / 4, oy: -ph / 4, w: pw / 2, h: ph / 2, frame: 0, msg: "¡Aprende sobre frutas y verduras!" },
      { id: "frutas", ox: pw / 4, oy: -ph / 4, w: pw / 2, h: ph / 2, frame: 1, msg: "¡Aprende sobre frutas y verduras!" },
      
      // Bottom half (3 columnas)
      { id: "cereales", ox: -pw / 3, oy: ph / 4, w: pw / 3, h: ph / 2, frame: 3, msg: "¡Conoce los cereales y tubérculos!" },
      { id: "leguminosas", ox: 0, oy: ph / 4, w: pw / 3, h: ph / 2, frame: 4, msg: "¡Descubre las leguminosas!" },
      { id: "animal", ox: pw / 3, oy: ph / 4, w: pw / 3, h: ph / 2, frame: 5, msg: "¡Conoce los alimentos de origen animal!" }
    ];

    zonesConfig.forEach(z => {
      const zone = this.add.zone(px + z.ox, py + z.oy, z.w, z.h)
        .setInteractive({ useHandCursor: true });

      // LÓGICA DE HOVER (ENTER)
      zone.on("pointerover", () => {
        if (this.isExpanded) return;

        this.activeSection = z.id;
        this.hoverSound.play();

        // Efecto visual: Glow (tintado) y escala
        this.plato.setTint(0xddffdd);
        this.tweens.add({
          targets: this.plato,
          scale: 0.33, // Ligeramente mayor que 0.3
          duration: 150,
          ease: "Power1"
        });

        // Actualizar texto del globo dinámicamente
        // Si quieres que el texto aparezca letra por letra, usa show(). 
        // Para inmediatez, usamos show con speed 0 o mostramos el texto completo.
        this.dialog.show(z.msg, 0);
      });

      // LÓGICA DE HOVER (EXIT)
      zone.on("pointerout", () => {
        if (this.isExpanded) return;
        if (this.activeSection === z.id) {
          this.activeSection = null;
        }

        // Restaurar plato
        this.plato.clearTint();
        this.tweens.add({
          targets: this.plato,
          scale: 0.3,
          duration: 150,
          ease: "Power1"
        });

        // Volver a texto por defecto
        this.dialog.show("Haz clic en una sección del plato para explorarla más a fondo.", 0);
      });

      // LÓGICA DE CLICK
      zone.on("pointerdown", () => {
        if (this.isExpanded) return;
        this.clickSound.play();
        this.expandSection(z.id, z.frame);
      });
    });
  }

  /**
   * Expande la sección clickeada mostrando los módulos grandes
   */
  private expandSection(sectionId: string, frameId: number) {
    this.isExpanded = true;

    // Ocultar plato original (fade out y scale down)
    this.tweens.add({
      targets: this.plato,
      alpha: 0,
      scale: 0,
      duration: 300,
      ease: "Power2"
    });

    const { width, height } = this.scale;
    const centerY = height / 2;

    // Caso Verduras / Frutas
    if (sectionId === "verduras" || sectionId === "frutas") {
      // Verduras a la izquierda
      const verduraSprite = this.add.sprite(-200, centerY, "partes_plato", 0).setScale(0.8);
      // Frutas a la derecha
      const frutaSprite = this.add.sprite(width + 200, centerY, "partes_plato", 1).setScale(0.8);

      this.expandedSprites.push(verduraSprite, frutaSprite);

      // Animación de entrada
      this.tweens.add({
        targets: verduraSprite,
        x: width * 0.35,
        duration: 500,
        ease: "Back.easeOut"
      });

      this.tweens.add({
        targets: frutaSprite,
        x: width * 0.75,
        duration: 500,
        ease: "Back.easeOut"
      });
    }
    // Caso Cereales, Leguminosas, Animal
    else {
      // Mostrar módulo centrado
      const sprite = this.add.sprite(width * 0.65, centerY, "partes_plato", frameId)
        .setScale(0)
        .setAlpha(0);

      this.expandedSprites.push(sprite);

      this.tweens.add({
        targets: sprite,
        scale: 0.9,
        alpha: 1,
        duration: 500,
        ease: "Back.easeOut"
      });
    }

    // Mostrar botón de volver
    this.tweens.add({
      targets: this.btnVolver,
      alpha: 1,
      duration: 300
    });
  }

  /**
   * Restaura el plato a su estado inicial
   */
  private restorePlate() {
    this.clickSound.play();

    // Destruir sprites expandidos
    this.expandedSprites.forEach(sprite => {
      this.tweens.add({
        targets: sprite,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => sprite.destroy()
      });
    });
    this.expandedSprites = [];

    // Ocultar botón de volver
    this.tweens.add({
      targets: this.btnVolver,
      alpha: 0,
      duration: 300
    });

    // Restaurar plato principal
    this.plato.clearTint();
    this.tweens.add({
      targets: this.plato,
      alpha: 1,
      scale: 0.3,
      duration: 500,
      ease: "Back.easeOut",
      onComplete: () => {
        this.isExpanded = false;
        this.activeSection = null;
      }
    });

    // Restaurar texto
    this.dialog.show("¡Explora otra sección del plato!", 0);
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
    } else {
      // Cuando termina el tutorial introductorio, dejamos que el usuario interactúe
      // El paso 4 es el último y da la instrucción de interactuar.
    }
  }
}