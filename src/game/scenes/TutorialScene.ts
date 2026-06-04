import * as Phaser from "phaser";
import { PrefabButtons } from "../../componentes/PrefabButtons";
import { PlatonSpeechBubble } from "../systems/dialog/PlatonSpeechBubble";;

type PlateZoneId = "verduras" | "frutas" | "cereales" | "leguminosas" | "animal";

type PlateZoneDialog = {
    title: string;
    text: string;
};

const INITIAL_DIALOG = "Hola aventurero. Soy Platon. Frente a ti esta el Plato del Bien Comer. Pasa el cursor sobre cada seccion para conocer sus grupos de alimentos.";
const TUTORIAL_KITCHEN_BACKGROUND_ALPHA = 1;
const TUTORIAL_SCRIM_CENTER_ALPHA = 0.18;
const TUTORIAL_SCRIM_EDGE_ALPHA = 0.45;
const DIALOG_X_MAX = 620;                 // Límite horizontal máximo en píxeles
const DIALOG_X_RATIO = 0.32;              // Proporción del ancho de pantalla
const DIALOG_Y_OFFSET_FROM_BOTTOM = 600;  // Separación vertical desde el borde inferior
const DIALOG_WRAP_WIDTH_MAX = 520;        // Ancho máximo del texto
const DIALOG_WRAP_WIDTH_MIN = 370;        // Ancho mínimo del texto
const DIALOG_WRAP_RATIO = 0.28;           // Proporción del ancho para el ajuste de línea
const DIALOG_DEV_MODE = false;
const DIALOG_NUDGE_STEP = 10;

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
    private speechBubble!: PlatonSpeechBubble;
    private platon!: Phaser.GameObjects.Sprite;
    private plato!: Phaser.GameObjects.Image;
    private activeSection: PlateZoneId | null = null;
    private hoverSound!: Phaser.Sound.BaseSound;
    private clickSound!: Phaser.Sound.BaseSound;
    private initialDialogTimer?: Phaser.Time.TimerEvent;
    private dialogX = 0;
    private dialogY = 0;
    private dialogWrapWidth = DIALOG_WRAP_WIDTH_MAX;
    private currentDialogText: string | null = null;

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

        this.createKitchenBackground();

        this.plato = this.add.image(
            width * 0.65,
            height / 2,
            "plato"
        ).setScale(0.3);

        this.platon = this.add.sprite(
            width * 0.17,
            height * 0.765,
            "platon"
        ).setScale(2);

        this.anims.create({
            key: "wave",
            frames: this.anims.generateFrameNumbers("platon", { start: 0, end: 15 }),
            frameRate: 12,
            repeat: -1
        });
        this.platon.play("wave");

        this.speechBubble = new PlatonSpeechBubble(this);
        this.recomputeDialogLayout();

        this.showInitialDialog();
        this.createInteractiveZones();
        this.createBackButton();
        this.createNextButton();
        this.setupDialogNudge();
    }

    private createKitchenBackground(): void {
        const { width, height } = this.scale;

        // Capa base con rectángulo crema sólido
        this.add.rectangle(width / 2, height / 2, width, height, 0xfffbf0, 1)
            .setDepth(-3);

        // Capa de imagen de cocina con opacidad configurable
        this.add.image(width / 2, height / 2, "Fondo-cocina")
            .setDisplaySize(width, height)
            .setAlpha(TUTORIAL_KITCHEN_BACKGROUND_ALPHA)
            .setDepth(-2);

        // Capa de scrim radial crema con mayor opacidad en los bordes
        this.createScrimTexture();
        this.add.image(width / 2, height / 2, "tutorial_scrim")
            .setDisplaySize(width, height)
            .setDepth(-1);
    }

    private createScrimTexture(): void {
        const key = "tutorial_scrim";
        if (this.textures.exists(key)) {
            this.textures.remove(key);
        }

        const { width, height } = this.scale;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 120,
            width / 2, height / 2, Math.max(width, height) * 0.6,
        );
        gradient.addColorStop(0, `rgba(255, 251, 240, ${TUTORIAL_SCRIM_CENTER_ALPHA})`);
        gradient.addColorStop(1, `rgba(255, 251, 240, ${TUTORIAL_SCRIM_EDGE_ALPHA})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        this.textures.addCanvas(key, canvas);
    }

    private recomputeDialogLayout(): void {
        const { width, height } = this.scale;
        this.dialogX = Math.min(width * DIALOG_X_RATIO, DIALOG_X_MAX);
        this.dialogY = height - DIALOG_Y_OFFSET_FROM_BOTTOM;
        this.dialogWrapWidth = Math.min(
            DIALOG_WRAP_WIDTH_MAX,
            Math.max(DIALOG_WRAP_WIDTH_MIN, width * DIALOG_WRAP_RATIO),
        );
    }

    private setupDialogNudge(): void {
        if (!DIALOG_DEV_MODE) return;

        const nudge = (dx: number, dy: number) => {
            this.dialogX += dx;
            this.dialogY += dy;
            console.log(`[Diálogo] X=${this.dialogX}  Y=${this.dialogY}`);
            if (this.currentDialogText) {
                this.refreshDialogPosition(this.currentDialogText);
            }
        };

        this.input.keyboard?.on("keydown-LEFT", () => nudge(-DIALOG_NUDGE_STEP, 0));
        this.input.keyboard?.on("keydown-RIGHT", () => nudge(DIALOG_NUDGE_STEP, 0));
        this.input.keyboard?.on("keydown-UP", () => nudge(0, -DIALOG_NUDGE_STEP));
        this.input.keyboard?.on("keydown-DOWN", () => nudge(0, DIALOG_NUDGE_STEP));
    }

    private refreshDialogPosition(text: string): void {
        this.speechBubble.show({
            x: this.dialogX,
            y: this.dialogY,
            text,
            wordWrapWidth: this.dialogWrapWidth,
        });
    }

    private showInitialDialog(): void {
        this.showSpeechBubble(INITIAL_DIALOG);
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
        this.showSpeechBubble(`${dialog.title}\n${dialog.text}`);
    }

    private hideDialog(): void {
        this.currentDialogText = null;
        this.speechBubble.hide(150);
    }

    private showSpeechBubble(text: string): void {
        this.currentDialogText = text;
        this.speechBubble.show({
            x: this.dialogX,
            y: this.dialogY,
            text,
            wordWrapWidth: this.dialogWrapWidth,
        });
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
