import * as Phaser from 'phaser';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { FONT_DISPLAY, FONT_MONO } from '../../config/gameFonts';
import { PlayerService } from '../../services/PlayerService';

const WIDTH = 1920;
const HEIGHT = 1080;
const COLORS = {
    bg: 0xf2eadb,
    paper: 0xfffbf0,
    paperAlt: 0xfff7e8,
    card: 0xf9f5e9,
    cardDim: 0xf0eadf,
    white: 0xffffff,
    ink: 0x2e3142,
    mutedInk: 0x6b6f7f,
    gray: 0xb7b1a7,
    grayDark: 0x77736d,
    green: 0x77d39d,
    coral: 0xff907f,
    legume: 0xe7a59b,
    cereal: 0xf7ce63,
    animal: 0xf4a36f,
    junk: 0x5b4638,
    yellow: 0xffcf55,
    route: 0x75c995,
    progressTrack: 0xe7e0d3,
};

const HEX = {
    ink: '#2E3142',
    mutedInk: '#6B6F7F',
    grayDark: '#77736D',
    paper: '#FFFBF0',
    white: '#FFFFFF',
};

const LOCKED_MESSAGE = 'Completa la sección anterior para desbloquear esta sección.';

type SectionIndex = 1 | 2 | 3;

interface SectionConfig {
    index: SectionIndex;
    sectionLabel: string;
    topic: string;
    description: string;
    leftCategory: string;
    rightCategory: string;
    leftColor: number;
    rightColor: number;
    leftAssetKey: string;
    rightAssetKey: string;
    leftAssetPath: string;
    rightAssetPath: string;
    progressText: string;
    progressValue: number;
    unlocked: boolean;
    sceneKey: string;
}

const SECTIONS: SectionConfig[] = [
    {
        index: 1,
        sectionLabel: 'SECCIÓN 1',
        topic: 'Verduras vs Frutas',
        description: 'Aprende y clasifica entre verduras y frutas.',
        leftCategory: 'Verduras',
        rightCategory: 'Frutas',
        leftColor: COLORS.green,
        rightColor: COLORS.coral,
        leftAssetKey: 'roadmap_vegetables',
        rightAssetKey: 'roadmap_fruits',
        leftAssetPath: '/iconsFood/verduras/broccoli.png',
        rightAssetPath: '/iconsFood/frutas/apple.png',
        progressText: '1/8',
        progressValue: 1 / 8,
        unlocked: true,
        sceneKey: 'Nivel1Scene',
    },
    {
        index: 2,
        sectionLabel: 'SECCIÓN 2',
        topic: 'Leguminosas vs Cereales',
        description: 'Diferencia entre proteína vegetal y fuentes de energía.',
        leftCategory: 'Leguminosas',
        rightCategory: 'Cereales',
        leftColor: COLORS.legume,
        rightColor: COLORS.cereal,
        leftAssetKey: 'roadmap_legumes',
        rightAssetKey: 'roadmap_cereals',
        leftAssetPath: '/iconsFood/leguminosas/beans.png',
        rightAssetPath: '/iconsFood/cereales/corn.png',
        progressText: '0/8',
        progressValue: 0,
        unlocked: false,
        sceneKey: 'Nivel2Scene',
    },
    {
        index: 3,
        sectionLabel: 'SECCIÓN 3 - FINAL',
        topic: 'Origen animal vs Comida chatarra',
        description: 'Reto final: Detecta las trampas y elige lo mejor.',
        leftCategory: 'Origen animal',
        rightCategory: 'Comida chatarra',
        leftColor: COLORS.animal,
        rightColor: COLORS.junk,
        leftAssetKey: 'roadmap_animal',
        rightAssetKey: 'roadmap_junk',
        leftAssetPath: '/iconsFood/animal/egg.png',
        rightAssetPath: '/iconsFood/comidaExtra/burger.png',
        progressText: '0/8',
        progressValue: 0,
        unlocked: false,
        sceneKey: 'Nivel3Scene',
    },
];

export class LevelSelectScene extends Phaser.Scene {
    private clickSound?: Phaser.Sound.BaseSound;
    private hoverSound?: Phaser.Sound.BaseSound;
    private toast?: Phaser.GameObjects.Container;

    constructor() {
        super('LevelSelectScene');
    }

    private getProgressState() {
        const jugador = PlayerService.obtenerJugadorActivo();
        if (jugador) {
            const completados = jugador.progreso.nivelesCompletados || [];
            return {
                nivel1Done: completados.includes(1),
                nivel2Done: completados.includes(2),
                nivel3Done: completados.includes(3),
            };
        }
        
        return {
            nivel1Done: Boolean(this.registry.get('nivel1Completado')),
            nivel2Done: Boolean(this.registry.get('nivel2Completado')),
            nivel3Done: Boolean(this.registry.get('nivel3Completado')),
        };
    }

    private getActiveSection(): SectionIndex {
        const { nivel1Done, nivel2Done } = this.getProgressState();
        if (!nivel1Done) return 1;
        if (!nivel2Done) return 2;
        return 3;
    }

    preload(): void {
        PrefabButtons.preload(this);

        this.load.audio('roadmap_click', '/Sound/Click.mp3');
        this.load.audio('roadmap_hover', '/Sound/hoverSound.mp3');

        SECTIONS.forEach(section => {
            this.load.image(section.leftAssetKey, section.leftAssetPath);
            this.load.image(section.rightAssetKey, section.rightAssetPath);
        });
    }

    create(): void {
        this.cameras.main.setBackgroundColor('#F2EADB');
        this.createGeneratedTextures();
        this.createBackground();

        this.clickSound = this.sound.add('roadmap_click', { volume: 0.14, loop: false });
        this.hoverSound = this.sound.add('roadmap_hover', { volume: 0.08, loop: false });

        if (document.fonts) {
            void Promise.all([
                document.fonts.load('700 54px "Pixelify Sans"'),
                document.fonts.load('28px "VT323"'),
            ]).finally(() => this.createContent());
            return;
        }

        this.createContent();
    }

    private createContent(): void {
        this.createHeader();
        this.createCards();
        this.createBottomHud();
        this.createExtraButtons();
        this.createCrtOverlay();
        this.refreshTextAfterFontsLoad();
    }

    private createGeneratedTextures(): void {
        this.createDotTexture();
        this.createCrtTexture();
    }

    private createDotTexture(): void {
        const key = 'roadmap_dot_tile';
        if (this.textures.exists(key)) return;

        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.fillStyle = 'rgba(46, 49, 66, 0.06)';
        context.fillRect(13, 13, 2, 2);
        context.fillStyle = 'rgba(255, 255, 255, 0.28)';
        context.fillRect(0, 0, 28, 1);
        context.fillRect(0, 0, 1, 28);
        this.textures.addCanvas(key, canvas);
    }

    private createCrtTexture(): void {
        const key = 'roadmap_crt_tile';
        if (this.textures.exists(key)) return;

        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 4;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.fillStyle = 'rgba(46, 49, 66, 0.05)';
        context.fillRect(0, 0, 4, 1);
        this.textures.addCanvas(key, canvas);
    }

    private createBackground(): void {
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.bg, 1).setDepth(0);
        this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'roadmap_dot_tile')
            .setAlpha(0.9)
            .setDepth(1);
        this.add.rectangle(WIDTH / 2, 900, WIDTH, 10, COLORS.ink, 0.12).setDepth(2);
    }

    private createHeader(): void {


        this.add.text(WIDTH / 2 + 4, 92 + 5, 'Introducción - Compara alimentos', {
            fontFamily: FONT_DISPLAY,
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#77D39D',
            stroke: HEX.ink,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(18);

        this.add.text(WIDTH / 2, 92, 'Introducción - Compara alimentos', {
            fontFamily: FONT_DISPLAY,
            fontSize: '56px',
            fontStyle: 'bold',
            color: HEX.white,
            stroke: HEX.ink,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(19);

        this.createActiveSectionPanel();
    }

    private createActiveSectionPanel(): void {
        const activeIdx = this.getActiveSection();
        const SECTION_TOPICS = ['Verduras vs Frutas', 'Cereales y Leguminosas', 'Origen animal vs Chatarra'];

        const panel = this.add.container(1758, 75).setDepth(20);

        const shadow = this.add.rectangle(8, 8, 260, 110, COLORS.ink, 1);

        const bg = this.add.rectangle(0, 0, 260, 110, COLORS.paper, 1).setStrokeStyle(4, COLORS.ink);

        const title = this.add.text(0, -38, 'SECCIÓN ACTIVA', {
            fontFamily: FONT_MONO,
            fontSize: '22px',
            color: HEX.ink,
        }).setOrigin(0.5);

        panel.add([shadow, bg, title]);

        [1, 2, 3].forEach((value, index) => {
            const active = value === activeIdx;
            const x = -64 + index * 64;
            const chip = this.add.rectangle(x, -7, 46, 38, active ? COLORS.green : COLORS.white, 1)
                .setStrokeStyle(3, active ? COLORS.ink : COLORS.gray);
            const chipText = this.add.text(x, -7, String(value), {
                fontFamily: FONT_DISPLAY,
                fontSize: '24px',
                fontStyle: 'bold',
                color: active ? HEX.ink : HEX.grayDark,
            }).setOrigin(0.5);
            panel.add([chip, chipText]);
        });

        const topic = this.add.text(0, 34, SECTION_TOPICS[activeIdx - 1], {
            fontFamily: FONT_MONO,
            fontSize: '18px',
            color: HEX.ink,
        }).setOrigin(0.5);
        panel.add(topic);
    }

    private createCards(): void {
        const { nivel1Done, nivel2Done, nivel3Done } = this.getProgressState();
        const cardWidth = 588;
        const cardHeight = 720;
        const top = 158;
        const gap = 54;
        const left = 24;

        SECTIONS.forEach((section, index) => {
            const x = left + index * (cardWidth + gap);
            // El usuario requirió que TODOS los niveles estén bloqueados por defecto 
            // hasta que sean completados. Sólo se puede acceder al nivel activo a través del botón Continuar.
            const isUnlocked = section.index === 1 ? nivel1Done
                : section.index === 2 ? nivel2Done
                : nivel3Done;
            this.createSectionCard({ ...section, unlocked: isUnlocked }, x, top, cardWidth, cardHeight);
        });
    }

    private createSectionCard(section: SectionConfig, x: number, y: number, width: number, height: number): void {
        const card = this.add.container(x, y).setDepth(10);
        const active = section.unlocked;
        const borderColor = active ? COLORS.ink : COLORS.grayDark;
        const bgColor = active ? COLORS.card : COLORS.cardDim;

        const shadow = this.add.rectangle(width / 2 + 10, height / 2 + 10, width, height, COLORS.ink, active ? 1 : 0.55);
        const bg = this.add.rectangle(width / 2, height / 2, width, height, bgColor, 1)
            .setStrokeStyle(active ? 6 : 4, borderColor);
        const hit = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            this.hoverSound?.play();
            bg.setStrokeStyle(active ? 8 : 5, active ? COLORS.route : COLORS.grayDark);
        });
        hit.on('pointerout', () => {
            bg.setStrokeStyle(active ? 6 : 4, borderColor);
        });
        hit.on('pointerdown', () => {
            this.clickSound?.play();
            this.handleSectionSelection(section);
        });

        card.add([shadow, bg, hit]);
        this.createSectionTag(card, section.sectionLabel, active);
        this.createCategoryRow(card, section, active, width);
        this.createRoutePanel(card, section, active, width);
        this.createProgressBlock(card, section, active, width, height);
    }

    private createSectionTag(parent: Phaser.GameObjects.Container, label: string, active: boolean): void {
        const fill = active ? COLORS.ink : COLORS.grayDark;
        const tag = this.add.rectangle(78, 0, 136, 34, fill, 1).setStrokeStyle(3, COLORS.ink);
        const text = this.add.text(78, 0, label, {
            fontFamily: FONT_MONO,
            fontSize: label.length > 11 ? '18px' : '20px',
            color: HEX.white,
        }).setOrigin(0.5);

        parent.add([tag, text]);

        if (!active) {
            const lockedBg = this.add.rectangle(504, 8, 118, 30, COLORS.paperAlt, 1)
                .setStrokeStyle(3, COLORS.grayDark);
            const lockedText = this.add.text(504, 8, 'Bloqueado🔒', {
                fontFamily: FONT_MONO,
                fontSize: '20px',
                color: HEX.grayDark,
            }).setOrigin(0.5);
            parent.add([lockedBg, lockedText]);
        }
    }

    private createCategoryRow(
        parent: Phaser.GameObjects.Container,
        section: SectionConfig,
        active: boolean,
        width: number
    ): void {
        const y = 74;
        const leftX = 138;
        const rightX = width - 138;

        this.createCategoryBlock(parent, leftX, y, section.leftCategory, section.leftColor, section.leftAssetKey, active);
        this.createVsBlock(parent, width / 2, y);
        this.createCategoryBlock(parent, rightX, y, section.rightCategory, section.rightColor, section.rightAssetKey, active);

        const description = this.add.text(width / 2, 140, section.description, {
            fontFamily: FONT_MONO,
            fontSize: '22px',
            color: active ? HEX.ink : HEX.grayDark,
            align: 'center',
            wordWrap: { width: width - 72 },
        }).setOrigin(0.5);
        parent.add(description);
    }

    private createCategoryBlock(
        parent: Phaser.GameObjects.Container,
        x: number,
        y: number,
        label: string,
        fill: number,
        assetKey: string,
        active: boolean
    ): void {
        const bg = this.add.rectangle(x, y, 226, 86, active ? fill : COLORS.paperAlt, 1)
            .setStrokeStyle(4, active ? COLORS.ink : COLORS.grayDark);
        const icon = this.add.image(x, y - 18, assetKey)
            .setDisplaySize(34, 34)
            .setAlpha(active ? 1 : 0.58);
        const text = this.add.text(x, y + 22, label, {
            fontFamily: FONT_DISPLAY,
            fontSize: label.length > 13 ? '18px' : '21px',
            fontStyle: 'bold',
            color: active ? HEX.ink : HEX.grayDark,
        }).setOrigin(0.5);

        parent.add([bg, icon, text]);
    }

    private createVsBlock(parent: Phaser.GameObjects.Container, x: number, y: number): void {
        const shadow = this.add.rectangle(x + 4, y + 4, 52, 40, COLORS.ink, 1);
        const bg = this.add.rectangle(x, y, 52, 40, COLORS.white, 1).setStrokeStyle(4, COLORS.ink);
        const text = this.add.text(x, y, 'VS', {
            fontFamily: FONT_DISPLAY,
            fontSize: '23px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0.5);

        parent.add([shadow, bg, text]);
    }

    private createRoutePanel(
        parent: Phaser.GameObjects.Container,
        section: SectionConfig,
        active: boolean,
        width: number
    ): void {
        const panelX = width / 2;
        const panelY = 370;
        const panelWidth = width - 56;
        const panelHeight = 400;
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, active ? COLORS.paper : COLORS.paperAlt, 1)
            .setStrokeStyle(3, active ? COLORS.ink : COLORS.grayDark);

        const route = this.add.graphics();
        const left = { x: panelX - 150, y: panelY + 78 };
        const peak = { x: panelX, y: panelY - 12 };
        const right = { x: panelX + 150, y: panelY + 78 };

        if (active) {
            this.drawCurve(route, left, peak, right, COLORS.route, 10, false);
        } else {
            this.drawCurve(route, left, peak, right, COLORS.gray, 8, true);
        }

        const footer = this.add.text(panelX, panelY + 176, 'CONOCER  --->  CLASIFICAR', {
            fontFamily: FONT_MONO,
            fontSize: '18px',
            color: active ? HEX.mutedInk : HEX.grayDark,
        }).setOrigin(0.5);

        parent.add([panel, route]);
        this.createMarker(parent, left.x, left.y, 1, section.leftCategory, section.leftColor, active);
        this.createMarker(parent, right.x, right.y, 2, section.rightCategory, section.rightColor, active);
        parent.add(footer);
    }

    private drawCurve(
        graphics: Phaser.GameObjects.Graphics,
        start: { x: number; y: number },
        control: { x: number; y: number },
        end: { x: number; y: number },
        color: number,
        thickness: number,
        dashed: boolean
    ): void {
        graphics.lineStyle(thickness, color, dashed ? 0.85 : 1);

        let previous = start;
        for (let step = 1; step <= 46; step += 1) {
            const t = step / 46;
            const current = this.quadraticPoint(start, control, end, t);
            const shouldDraw = !dashed || Math.floor(step / 4) % 2 === 0;

            if (shouldDraw) {
                graphics.beginPath();
                graphics.moveTo(previous.x, previous.y);
                graphics.lineTo(current.x, current.y);
                graphics.strokePath();
            }

            previous = current;
        }
    }

    private quadraticPoint(
        start: { x: number; y: number },
        control: { x: number; y: number },
        end: { x: number; y: number },
        t: number
    ): { x: number; y: number } {
        const inverse = 1 - t;

        return {
            x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
            y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
        };
    }

    private createMarker(
        parent: Phaser.GameObjects.Container,
        x: number,
        y: number,
        number: number,
        label: string,
        fill: number,
        active: boolean
    ): void {
        const markerFill = active ? COLORS.white : COLORS.paperAlt;
        const stroke = active ? COLORS.ink : COLORS.grayDark;
        const outer = this.add.circle(x, y, 42, markerFill, 1).setStrokeStyle(5, stroke);
        const inner = this.add.circle(x, y, 22, active ? fill : COLORS.white, active ? 0.95 : 0.65)
            .setStrokeStyle(3, active ? COLORS.ink : COLORS.gray);
        const numberBg = this.add.rectangle(x - 38, y - 38, 34, 30, active ? COLORS.ink : COLORS.grayDark, 1);
        const numberText = this.add.text(x - 38, y - 38, String(number), {
            fontFamily: FONT_DISPLAY,
            fontSize: '20px',
            fontStyle: 'bold',
            color: HEX.white,
        }).setOrigin(0.5);
        const iconText = this.add.text(x, y + 1, active ? '!' : '-', {
            fontFamily: FONT_DISPLAY,
            fontSize: '25px',
            fontStyle: 'bold',
            color: active ? HEX.ink : HEX.grayDark,
        }).setOrigin(0.5);
        const labelBg = this.add.rectangle(x, y + 76, 142, 40, COLORS.paper, 1)
            .setStrokeStyle(3, stroke);
        const labelText = this.add.text(x, y + 76, label, {
            fontFamily: FONT_MONO,
            fontSize: label.length > 13 ? '18px' : '21px',
            color: active ? HEX.ink : HEX.grayDark,
        }).setOrigin(0.5);

        parent.add([outer, inner, numberBg, numberText, iconText, labelBg, labelText]);
    }

    private createProgressBlock(
        parent: Phaser.GameObjects.Container,
        section: SectionConfig,
        active: boolean,
        width: number,
        height: number
    ): void {

        const y = height - 58;

        const panel = this.add.rectangle(width / 2, y, width - 56, 52, COLORS.paper, 1)
            .setStrokeStyle(3, active ? COLORS.ink : COLORS.grayDark);

        const label = this.add.text(42, y - 10, 'PROGRESO', {
            fontFamily: FONT_MONO,
            fontSize: '18px',
            color: active ? HEX.mutedInk : HEX.grayDark,
        }).setOrigin(0, 0.5);


        const value = this.add.text(width - 72, y - 10, section.progressText, {
            fontFamily: FONT_MONO,
            fontSize: '22px',
            color: active ? HEX.ink : HEX.grayDark,
        }).setOrigin(1, 0.5);

        const trackWidth = width - 144;

        const trackX = 42;

        const trackY = y + 14;

        const track = this.add.rectangle(trackX, trackY, trackWidth, 8, COLORS.progressTrack, 1)
            .setOrigin(0, 0.5)
            .setStrokeStyle(1, active ? COLORS.ink : COLORS.grayDark);

        const fillWidth = Math.max(0, trackWidth * section.progressValue);

        const fill = this.add.rectangle(trackX, trackY, fillWidth, 8, active ? COLORS.route : COLORS.gray, 1)
            .setOrigin(0, 0.5);

        parent.add([panel, label, value, track, fill]);
    }

    private createBottomHud(): void {
        const hud = this.add.container(WIDTH / 2, 1000).setDepth(30);

        const shadow = this.add.rectangle(10, 10, 1870, 124, COLORS.ink, 1);

        const bg = this.add.rectangle(0, 0, 1870, 124, COLORS.paper, 1).setStrokeStyle(5, COLORS.ink);

        const levelCircle = this.add.circle(-880, 0, 34, COLORS.white, 1).setStrokeStyle(5, COLORS.ink);

        const levelInner = this.add.circle(-880, 0, 24, COLORS.yellow, 0.35).setStrokeStyle(3, COLORS.yellow);

        const levelText = this.add.text(-880, 0, '1', {
            fontFamily: FONT_DISPLAY,
            fontSize: '30px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0.5);

        const kicker = this.add.text(-820, -27, 'NIVEL ACTUAL', {
            fontFamily: FONT_DISPLAY,
            fontSize: '30px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0, 0.5);
        const current = this.add.text(-820, -3, 'Clasificar', {
            fontFamily: FONT_DISPLAY,
            fontSize: '30px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0, 0.5);
        const detail = this.add.text(-820, 27, 'Reto final: 20 alimentos', {
            fontFamily: FONT_DISPLAY,
            fontSize: '30px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0, 0.5);

        const continueButton = PrefabButtons.continuar(this, 760, 0, () => {
            const { nivel1Done, nivel2Done, nivel3Done } = this.getProgressState();
            if (!nivel1Done) {
                window.showTutorial?.(['vegetable', 'fruit'], {
                    nextScene: 'Nivel1Scene',
                    title: 'Verduras y Frutas',
                    finishLabel: 'Empezar Nivel 1',
                });
            } else if (!nivel2Done) {
                window.showTutorial?.(['legume', 'cereal'], {
                    nextScene: 'Nivel2Scene',
                    title: 'Leguminosas y Cereales',
                    finishLabel: 'Empezar Nivel 2',
                });
            } else if (!nivel3Done) {
                window.showTutorial?.(['animal'], {
                    nextScene: 'Nivel3Scene',
                    title: 'Origen Animal',
                    finishLabel: 'Empezar Nivel 3',
                });
            } else {
                this.scene.start('PlatoBalanceadoScene');
            }
        }, {
            text: 'CONTINUAR >',
            width: 300,
            height: 76,
            fontSize: '30px',
            hoverScale: 1.03,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
        });

        this.tweens.add({
            targets: continueButton,
            x: 758,
            y: -2,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });


        PrefabButtons.secundario(this, 200, 90, () => this.scene.start('TutorialScene'), {
            text: '< Presentacion',
            width: 340,
            fontSize: 30,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 10,
        });

        hud.add([shadow, bg, levelCircle, levelInner, levelText, kicker, current, detail, continueButton]);
    }

    private createExtraButtons(): void {
        const yTop = 840;
        const yBot = 920;
        
        const progress = this.getProgressState();
        if (progress.nivel3Done) {
            PrefabButtons.continuar(this, WIDTH / 2 + 650, yTop, () => {
                this.scene.start('CrucigramaSaludableScene');
            }, {
                text: 'Jugar Crucigrama',
                width: 380,
                height: 60,
                fontSize: '22px'
            });
        }

        PrefabButtons.continuar(this, WIDTH / 2 + 650, yBot, () => {
            this.scene.start('PlatoBalanceadoScene');
        }, {
            text: 'Jugar Plato Balanceado',
            width: 380,
            height: 60,
            fontSize: '22px'
        });

        PrefabButtons.secundario(this, WIDTH / 2 - 250, yBot, () => {
            window.showTutorial?.(['vegetable', 'fruit'], {
                nextScene: 'LevelSelectScene',
                title: 'Verduras y Frutas',
                finishLabel: 'Volver al mapa',
            });
        }, { text: 'Tut. Frutas', width: 200, height: 60, fontSize: '20px' });

        PrefabButtons.secundario(this, WIDTH / 2, yBot, () => {
            window.showTutorial?.(['legume', 'cereal'], {
                nextScene: 'LevelSelectScene',
                title: 'Leguminosas y Cereales',
                finishLabel: 'Volver al mapa',
            });
        }, { text: 'Tut. Cereales', width: 220, height: 60, fontSize: '20px' });

        PrefabButtons.secundario(this, WIDTH / 2 + 250, yBot, () => {
            window.showTutorial?.(['animal'], {
                nextScene: 'LevelSelectScene',
                title: 'Origen Animal',
                finishLabel: 'Volver al mapa',
            });
        }, { text: 'Tut. Animal', width: 200, height: 60, fontSize: '20px' });
    }

    private handleSectionSelection(section: SectionConfig): void {
        if (!section.unlocked) {
            this.showToast(LOCKED_MESSAGE);
            return;
        }

        const progress = this.getProgressState();
        const done = section.index === 1 ? progress.nivel1Done
                   : section.index === 2 ? progress.nivel2Done
                   : progress.nivel3Done;

        if (!done) {
            if (section.index === 1) {
                window.showTutorial?.(['vegetable', 'fruit'], {
                    nextScene: 'Nivel1Scene',
                    title: 'Verduras y Frutas',
                    finishLabel: 'Empezar Nivel 1',
                });
            } else if (section.index === 2) {
                window.showTutorial?.(['legume', 'cereal'], {
                    nextScene: 'Nivel2Scene',
                    title: 'Leguminosas y Cereales',
                    finishLabel: 'Empezar Nivel 2',
                });
            } else if (section.index === 3) {
                window.showTutorial?.(['animal'], {
                    nextScene: 'Nivel3Scene',
                    title: 'Origen Animal',
                    finishLabel: 'Empezar Nivel 3',
                });
            }
        } else {
            this.scene.start(section.sceneKey);
        }
    }

    private showToast(message: string): void {
        this.toast?.destroy(true);

        const toast = this.add.container(WIDTH / 2, 903).setDepth(100).setAlpha(0);
        const shadow = this.add.rectangle(6, 6, 820, 52, COLORS.ink, 1);
        const bg = this.add.rectangle(0, 0, 820, 52, COLORS.paper, 1).setStrokeStyle(4, COLORS.ink);
        const text = this.add.text(0, 0, message, {
            fontFamily: FONT_MONO,
            fontSize: '27px',
            color: HEX.ink,
            align: 'center',
        }).setOrigin(0.5);

        toast.add([shadow, bg, text]);
        this.toast = toast;

        this.tweens.add({
            targets: toast,
            alpha: 1,
            y: 890,
            duration: 160,
            ease: 'Sine.easeOut',
        });

        this.time.delayedCall(2200, () => {
            if (!this.toast || this.toast !== toast) return;

            this.tweens.add({
                targets: toast,
                alpha: 0,
                y: 878,
                duration: 240,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    toast.destroy(true);
                    if (this.toast === toast) {
                        this.toast = undefined;
                    }
                },
            });
        });
    }

    private createCrtOverlay(): void {
        this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'roadmap_crt_tile')
            .setAlpha(0.24)
            .setDepth(200);
    }

    private refreshTextAfterFontsLoad(): void {
        if (!document.fonts) return;

        void Promise.all([
            document.fonts.load('700 54px "Pixelify Sans"'),
            document.fonts.load('28px "VT323"'),
        ]).then(() => {
            this.children.list.forEach(child => {
                if (child instanceof Phaser.GameObjects.Text) {
                    child.updateText();
                }
            });
        });
    }
}
