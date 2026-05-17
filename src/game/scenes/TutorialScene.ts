import * as Phaser from "phaser";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";
import { hoverScale } from "../../componentes/HoverScale";

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
  private btnVolver!: Phaser.GameObjects.Image;

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
    // Si tienes "btn-Volver" como un spritesheet de 2 frames, debes cargarlo así (reemplaza los valores de frameWidth y frameHeight):
    // this.load.spritesheet("btn-Volver", "/assets/Buttons/volver.webp", { frameWidth: 100, frameHeight: 50 });
    this.load.image("btn-Volver", "/assets/Buttons/BtnVolverCafe.webp");

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
    // Evitar error de TypeScript - variable asignada
    void this.fondo_cocina;
    // 🍽️ Plato (centrado)
    this.plato = this.add.image(
      width * 0.65,
      height / 2,
      "plato"
    ).setScale(0.3);

    // Evitar error de TypeScript - variable asignada
    void this.plato;

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

    this.btnVolver = this.add.sprite(width * 0.10, height * 0.15, 'btn-Volver')
      .setInteractive()
      .setScale(0.4)
      .setAlpha(1);

    hoverScale(this, this.btnVolver, {
      scaleOver: 0.45,
      duration: 150,
      hoverSound: this.hoverSound
    });

    this.btnVolver.on("pointerdown", () => {
      this.clickSound.play();
    });

    this.btnVolver.on("pointerup", () => {
      // Lógica de navegación:
      if (this.isExpanded || this.activeSection) {
        this.restorePlate();
      } else {
        this.scene.start('MainMenu');
      }
    });
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
      { id: "verduras", ox: -pw / 4, oy: -ph / 2.9, w: pw / 2.2, h: ph / 2, frame: 0, msg: "¡Aprende sobre frutas y verduras!", color: 0x00ff00 },
      { id: "frutas", ox: pw / 4, oy: -ph / 3, w: pw / 1.9, h: ph / 2, frame: 1, msg: "¡Aprende sobre frutas y verduras!", color: 0xff0000 },

      // Bottom half (3 columnas)
      { id: "cereales", ox: -pw / 5, oy: ph / 6, w: pw / 3, h: ph / 2, frame: 3, msg: "¡Conoce los cereales y tubérculos!", color: 0xffff00 },
      { id: "leguminosas", ox: 20, oy: ph / 6, w: pw / 13, h: ph / 2, frame: 4, msg: "¡Descubre las leguminosas!", color: 0xff8800 },
      { id: "animal", ox: pw / 4.5, oy: ph / 6, w: pw / 3, h: ph / 2, frame: 5, msg: "¡Conoce los alimentos de origen animal!", color: 0x0000ff }
    ];

    // Añadir gráficos para debug visual
    // const debugGraphics = this.add.graphics();
    // NOTA: Para ocultarlos cuando ya no los necesites, simplemente comenta la línea de fillRect o limpia los gráficos.

    zonesConfig.forEach(z => {
      const zone = this.add.zone(px + z.ox, py + z.oy, z.w, z.h)
        .setInteractive({ useHandCursor: true });

      // DIBUJAR AREA DE DEBUG
      //debugGraphics.fillStyle(z.color, 0.4); // Color con 40% de opacidad
      //debugGraphics.fillRect(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height);

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
  private expandSection(sectionId: string, _frameId: number) {
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
      const verduraSprite = this.add.sprite(-200, centerY, "partes_plato", 0).setScale(0.8).setInteractive({ useHandCursor: true });
      // Frutas a la derecha
      const frutaSprite = this.add.sprite(width + 200, centerY, "partes_plato", 1).setScale(0.8).setInteractive({ useHandCursor: true });

      this.expandedSprites.push(verduraSprite, frutaSprite);

      // Animación de entrada
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

      verduraSprite.on('pointerover', () => {
        this.hoverSound
      })

      verduraSprite.on('pointerout', () => {
        this.hoverSound
      })

      verduraSprite.on('pointerdown', () => {
        this.hoverSound
        // Llamar al callback global para mostrar el tutorial de React
        const showTutorial = (window as any).showTutorial
        if (showTutorial) {
          showTutorial(['vegetable', 'fruit'])
        } else {
          // Si no está disponible, ir a la escena de tutorial existente
          this.scene.start('TutorialScene')
        }
      })

      frutaSprite.on('pointerover', () => {
        this.hoverSound
      })

      frutaSprite.on('pointerout', () => {
        this.hoverSound
      })

      frutaSprite.on('pointerdown', () => {
        this.hoverSound
        // Llamar al callback global para mostrar el tutorial de React
        const showTutorial = (window as any).showTutorial
        if (showTutorial) {
          showTutorial(['fruit', 'vegetable'])
        } else {
          // Si no está disponible, ir a la escena de tutorial existente
          this.scene.start('TutorialScene')
        }
      })
    }
    // Caso Cereales, Leguminosas, Animal
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

      cerealSprite.on('pointerover', () => {
        this.hoverSound
      })

      cerealSprite.on('pointerout', () => {
        this.hoverSound
      })

      cerealSprite.on('pointerdown', () => {
        this.hoverSound
        // Llamar al callback global para mostrar el tutorial de React
        const showTutorial = (window as any).showTutorial
        if (showTutorial) {
          showTutorial('cereal')
        } else {
          // Si no está disponible, ir a la escena de tutorial existente
          this.scene.start('TutorialScene')
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

      animalSprite.on('pointerover', () => {
        this.hoverSound
      })

      animalSprite.on('pointerout', () => {
        this.hoverSound
      })

      animalSprite.on('pointerdown', () => {
        this.hoverSound
        // Llamar al callback global para mostrar el tutorial de React
        const showTutorial = (window as any).showTutorial
        if (showTutorial) {
          showTutorial('animal')
        } else {
          // Si no está disponible, ir a la escena de tutorial existente
          this.scene.start('TutorialScene')
        }
      })
    }

    else {
      // Mostrar módulo centrado
      const legumeSprite = this.add.sprite(width * 0.65, centerY, "partes_plato", 4).setScale(0.8).setInteractive({ useHandCursor: true });

      this.expandedSprites.push(legumeSprite);

      this.tweens.add({
        targets: legumeSprite,
        scale: 0.9,
        alpha: 1,
        duration: 500,
        ease: "Back.easeOut"
      });

      legumeSprite.on('pointerover', () => {
        this.hoverSound
      })

      legumeSprite.on('pointerout', () => {
        this.hoverSound
      })

      legumeSprite.on('pointerdown', () => {
        this.hoverSound
        // Llamar al callback global para mostrar el tutorial de React
        const showTutorial = (window as any).showTutorial
        if (showTutorial) {
          showTutorial('legume')
        } else {
          // Si no está disponible, ir a la escena de tutorial existente
          this.scene.start('TutorialScene')
        }
      })
    }

    // Mostrar botón de volver
    this.tweens.add({
      targets: this.btnVolver,
      alpha: 1,
      duration: 300,
      ease: "Back.easeOut"
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
      alpha: 1,
      duration: 300,
      ease: "Power2"
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
