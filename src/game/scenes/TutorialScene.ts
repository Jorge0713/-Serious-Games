import * as Phaser from "phaser";
import { PrefabButtons } from "../../componentes/PrefabButtons";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";

type PlateZoneId = "verduras" | "frutas" | "cereales" | "leguminosas" | "animal";

type PlateZoneDialog = {
    title: string;
    text: string;
};

const INITIAL_DIALOG = "Hola aventurero. Soy Platon. Frente a ti esta el Plato del Bien Comer. Pasa el cursor sobre cada seccion para conocer sus grupos de alimentos.";

const PLATE_ZONE_DIALOGS: Record<PlateZoneId, PlateZoneDialog> = {
    verduras: {
        title: "Verduras",
        text: "Las verduras aportan vitaminas, minerales y fibra. Ayudan a mantener una alimentacion equilibrada y deben consumirse con frecuencia.",
    },
    frutas: {
        title: "Frutas",
        text: "Las frutas aportan vitaminas, minerales, agua y fibra. Son una buena opcion natural para complementar la alimentacion diaria.",
    },
    cereales: {
        title: "Cereales",
        text: "Los cereales aportan energia principalmente en forma de carbohidratos. Algunos ejemplos son tortilla, arroz, pan, pasta y avena.",
    },
    leguminosas: {
        title: "Leguminosas",
        text: "Las leguminosas aportan proteina vegetal, fibra y energia. Algunos ejemplos son frijoles, lentejas, habas y garbanzos.",
    },
    animal: {
        title: "Alimentos de origen animal",
        text: "Los alimentos de origen animal aportan proteinas y otros nutrimentos importantes. Algunos ejemplos son huevo, leche, pescado, pollo y carne.",
    },
};

export class TutorialScene extends Phaser.Scene {
    private dialog!: DialogueSystem;
    private platon!: Phaser.GameObjects.Sprite;
    private plato!: Phaser.GameObjects.Image;
    private activeSection: PlateZoneId | null = null;
    private hoverSound!: Phaser.Sound.BaseSound;
    private clickSound!: Phaser.Sound.BaseSound;
    private initialDialogTimer?: Phaser.Time.TimerEvent;

    constructor() {
        super("TutorialScene");
    }

    preload() {
        this.load.spritesheet("platon", "/assets/Platon/platon.png", {
            frameWidth: 291,
            frameHeight: 256
        });


        this.load.image("plato", "/assets/Plato/plato.png");
        this.load.image("Fondo-cocina", "/assets/Backgrounds/Fondo_Cocina.png");
        PrefabButtons.preload(this);

        this.load.audio("Hover", "/Sound/hoverSound.mp3");
        this.load.audio("Click", "/Sound/Click.mp3");
    }

    create() {
        const { width, height } = this.scale;

        this.hoverSound = this.sound.add("Hover", { volume: 0.2 });
        this.clickSound = this.sound.add("Click", { volume: 0.3 });

        this.add.image(width / 2, height / 2, "Fondo-cocina")
            .setScale(0.5)
            .setDisplaySize(width, height);

        this.plato = this.add.image(
            width * 0.65,
            height / 2,
            "plato"
        ).setScale(0.3);

        this.platon = this.add.sprite(
            width * 0.17,
            height * 0.75,
            "platon"
        ).setScale(2);

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
            y: 250,
            width: width - 850,
        });

        this.showInitialDialog();
        this.createInteractiveZones();
        this.createBackButton();
        this.createNextButton();
    }

    private showInitialDialog(): void {
        this.dialog.show(INITIAL_DIALOG, 0);
        this.initialDialogTimer = this.time.delayedCall(6000, () => {
            if (!this.activeSection) {
                this.hideDialog();
            }
        });
    }

    private createBackButton(): void {
        PrefabButtons.volver(this, 150, 100, () => {
            this.scene.start("MainMenu");
        }, {
            text: "< Volver",
            width: 200,
            height: 100,
            fontSize: 30,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 20,
        });
    }
    private createNextButton(): void {
        PrefabButtons.continuar(this, 1700, 100, () => {
            this.scene.start("LevelSelectScene");
        }, {
            text: 'Siguiente >',
            width: 200,
            height: 100,
            fontSize: 30,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 20,
        });
    }

    private createInteractiveZones(): void {
        const px = this.plato.x;
        const py = this.plato.y;
        const pw = 2963 * 0.3;
        const ph = 1828 * 0.3;

        const zonesConfig: Array<{
            id: PlateZoneId;
            ox: number;
            oy: number;
            w: number;
            h: number;
        }> = [
                { id: "verduras", ox: -pw / 4, oy: -ph / 2.9, w: pw / 2.2, h: ph / 2 },
                { id: "frutas", ox: pw / 4, oy: -ph / 3, w: pw / 1.9, h: ph / 2 },
                { id: "cereales", ox: -pw / 5, oy: ph / 6, w: pw / 3, h: ph / 2 },
                { id: "leguminosas", ox: 20, oy: ph / 6, w: pw / 13, h: ph / 2 },
                { id: "animal", ox: pw / 4.5, oy: ph / 6, w: pw / 3, h: ph / 2 },
            ];

        zonesConfig.forEach(zoneConfig => {
            const zone = this.add.zone(
                px + zoneConfig.ox,
                py + zoneConfig.oy,
                zoneConfig.w,
                zoneConfig.h
            ).setInteractive({ useHandCursor: true });

            zone.on("pointerover", () => {
                this.activeSection = zoneConfig.id;
                this.initialDialogTimer?.remove(false);
                this.hoverSound.play();
                this.applyPlateHover();
                this.showPlateZoneDialog(zoneConfig.id);
            });

            zone.on("pointerout", () => {
                if (this.activeSection === zoneConfig.id) {
                    this.activeSection = null;
                }

                this.clearPlateHover();
                this.hideDialog();
            });

            zone.on("pointerdown", () => {
                this.clickSound.play();
                this.showPlateZoneDialog(zoneConfig.id);
            });
        });
    }

    private showPlateZoneDialog(zoneId: PlateZoneId): void {
        const dialog = PLATE_ZONE_DIALOGS[zoneId];
        this.dialog.show(`${dialog.title}\n${dialog.text}`, 0);
    }

    private hideDialog(): void {
        this.dialog.hide();
    }

    private applyPlateHover(): void {
        this.plato.setTint(0xddffdd);
        this.tweens.add({
            targets: this.plato,
            scale: 0.33,
            duration: 150,
            ease: "Power1"
        });
    }

    private clearPlateHover(): void {
        this.plato.clearTint();
        this.tweens.add({
            targets: this.plato,
            scale: 0.3,
            duration: 150,
            ease: "Power1"
        });
    }
}
