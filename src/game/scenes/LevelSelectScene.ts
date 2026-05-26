import * as Phaser from 'phaser';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { FONT_DISPLAY, FONT_MONO } from '../../config/gameFonts';
import { PlayerService } from '../../services/PlayerService';
import { FlowProgressService } from '../../services/FlowProgressService';

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

const BALANCED_PLATE_LOCKED_MESSAGE = 'Completa todos los tutoriales y el crucigrama para desbloquear este nivel.';

type SectionIndex = 1 | 2 | 3 | 4;

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
    flow: 'foodGrid' | 'concepts';
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
        progressText: '0/1',
        progressValue: 0 / 1,
        unlocked: true,
        sceneKey: 'Nivel1Scene',
        flow: 'foodGrid',
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
        progressText: '0/1',
        progressValue: 0/1,
        unlocked: false,
        sceneKey: 'Nivel2Scene',
        flow: 'foodGrid',
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
        flow: 'foodGrid',
    },
    {
        index: 4,
        sectionLabel: 'CONCEPTOS',
        topic: 'PreTutorial + Crucigrama',
        description: 'Repasa las ideas clave y resuelve el crucigrama.',
        leftCategory: 'Conceptos',
        rightCategory: 'Crucigrama',
        leftColor: COLORS.green,
        rightColor: COLORS.cereal,
        leftAssetKey: 'roadmap_concepts',
        rightAssetKey: 'roadmap_crossword',
        leftAssetPath: '/iconsFood/comidaExtra/water.png',
        rightAssetPath: '/iconsFood/cereales/oat.png',
        progressText: '0/2',
        progressValue: 0,
        unlocked: true,
        sceneKey: 'PreTutorialConceptosScene',
        flow: 'concepts',
    },
];

export class LevelSelectScene extends Phaser.Scene {
    private clickSound?: Phaser.Sound.BaseSound;
    private hoverSound?: Phaser.Sound.BaseSound;
    private toast?: Phaser.GameObjects.Container;
    private cardsContainer?: Phaser.GameObjects.Container;
    private cardsScrollX = 0;
    private cardsMinScrollX = 0;
    private cardsMaxScrollX = 0;
    private cardsScrollTrack?: Phaser.GameObjects.Rectangle;
    private cardsScrollThumb?: Phaser.GameObjects.Rectangle;

    constructor() {
        super('LevelSelectScene');
    }

    private getProgressState() {
        const jugador = PlayerService.obtenerJugadorActivo();
        const flowProgress = FlowProgressService.getProgress();
        let nivel1Done = Boolean(this.registry.get('nivel1Completado'));
        let nivel2Done = Boolean(this.registry.get('nivel2Completado'));
        let nivel3Done = Boolean(this.registry.get('nivel3Completado'));

        if (jugador) {
            const completados = jugador.progreso.nivelesCompletados || [];
            nivel1Done = nivel1Done || completados.includes(1);
            nivel2Done = nivel2Done || completados.includes(2);
            nivel3Done = nivel3Done || completados.includes(3);
        }

        const tutorialFrutasDone = flowProgress.tutorialFrutasCompleted || nivel1Done;
        const tutorialCerealesDone = flowProgress.tutorialCerealesCompleted || nivel2Done;
        const tutorialAnimalDone = flowProgress.tutorialAnimalCompleted || nivel3Done;
        const fullFlowProgress = {
            tutorialFrutasCompleted: tutorialFrutasDone,
            tutorialCerealesCompleted: tutorialCerealesDone,
            tutorialAnimalCompleted: tutorialAnimalDone,
            preTutorialConceptosCompleted: flowProgress.preTutorialConceptosCompleted,
            crucigramaCompleted: flowProgress.crucigramaCompleted,
        };

        return {
            nivel1Done,
            nivel2Done,
            nivel3Done,
            tutorialFrutasDone,
            tutorialCerealesDone,
            tutorialAnimalDone,
            preTutorialConceptosDone: flowProgress.preTutorialConceptosCompleted,
            crucigramaDone: flowProgress.crucigramaCompleted,
            canPlayBalancedPlate: FlowProgressService.isMainLevelUnlocked(fullFlowProgress),
        };
    }

    private getActiveSection(): SectionIndex {
        const {
            tutorialFrutasDone,
            tutorialCerealesDone,
            tutorialAnimalDone,
            preTutorialConceptosDone,
            crucigramaDone,
        } = this.getProgressState();
        if (!tutorialFrutasDone) return 1;
        if (!tutorialCerealesDone) return 2;
        if (!tutorialAnimalDone) return 3;
        if (!preTutorialConceptosDone || !crucigramaDone) return 4;
        return 4;
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
        const SECTION_TOPICS = ['Verduras vs Frutas', 'Cereales y Leguminosas', 'Origen animal vs Chatarra', 'Conceptos y Crucigrama'];

        const panel = this.add.container(1758, 75).setDepth(20);

        const shadow = this.add.rectangle(8, 8, 292, 110, COLORS.ink, 1);

        const bg = this.add.rectangle(0, 0, 292, 110, COLORS.paper, 1).setStrokeStyle(4, COLORS.ink);

        const title = this.add.text(0, -38, 'SECCIÓN ACTIVA', {
            fontFamily: FONT_MONO,
            fontSize: '22px',
            color: HEX.ink,
        }).setOrigin(0.5);

        panel.add([shadow, bg, title]);

        [1, 2, 3, 4].forEach((value, index) => {
            const active = value === activeIdx;
            const x = -90 + index * 60;
            const chip = this.add.rectangle(x, -7, 44, 38, active ? COLORS.green : COLORS.white, 1)
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
        const progress = this.getProgressState();
        const cardWidth = 588;
        const cardHeight = 720;
        const top = 158;
        const gap = 54;
        const left = 24;
        const viewportRight = WIDTH - 24;
        const viewportWidth = viewportRight - left;
        const totalWidth = SECTIONS.length * cardWidth + (SECTIONS.length - 1) * gap;

        this.cardsContainer = this.add.container(0, 0).setDepth(10);
        this.cardsMaxScrollX = 0;
        this.cardsMinScrollX = Math.min(0, viewportRight - (left + totalWidth));

        SECTIONS.forEach((section, index) => {
            const x = left + index * (cardWidth + gap);
            const sectionProgress = this.getSectionCardProgress(section, progress);
            this.createSectionCard({
                ...section,
                unlocked: true,
                progressText: sectionProgress.text,
                progressValue: sectionProgress.value,
            }, x, top, cardWidth, cardHeight);
        });

        this.createCardsScrollControls(totalWidth, viewportWidth, top + cardHeight + 24);
        this.setCardsScroll(0);
    }

    private getSectionCardProgress(
        section: SectionConfig,
        progress: ReturnType<LevelSelectScene['getProgressState']>
    ): { text: string; value: number } {
        if (section.index === 4) {
            const completedSteps = [
                progress.preTutorialConceptosDone,
                progress.crucigramaDone,
            ].filter(Boolean).length;

            return {
                text: `${completedSteps}/2`,
                value: completedSteps / 2,
            };
        }

        const completed = section.index === 1 ? progress.tutorialFrutasDone
            : section.index === 2 ? progress.tutorialCerealesDone
            : progress.tutorialAnimalDone;

        return {
            text: completed ? '1/1' : '0/1',
            value: completed ? 1 : 0,
        };
    }

    private createCardsScrollControls(totalWidth: number, viewportWidth: number, y: number): void {
        if (this.cardsMinScrollX === 0) return;

        const trackWidth = 620;
        const trackHeight = 24;
        const thumbWidth = Phaser.Math.Clamp((viewportWidth / totalWidth) * trackWidth, 120, trackWidth);

        this.add.rectangle(WIDTH / 2 + 5, y + 5, trackWidth, trackHeight, COLORS.ink, 0.95).setDepth(22);
        this.cardsScrollTrack = this.add.rectangle(WIDTH / 2, y, trackWidth, trackHeight, COLORS.paper, 1)
            .setStrokeStyle(3, COLORS.ink)
            .setDepth(23)
            .setInteractive({ useHandCursor: true });

        this.cardsScrollThumb = this.add.rectangle(WIDTH / 2, y, thumbWidth, 12, COLORS.route, 1)
            .setStrokeStyle(2, COLORS.ink)
            .setDepth(24)
            .setInteractive({ useHandCursor: true });

        this.input.setDraggable(this.cardsScrollThumb);
        this.cardsScrollTrack.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.setCardsScrollFromTrack(pointer.x);
        });
        this.cardsScrollThumb.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
            this.setCardsScrollFromTrack(dragX);
        });

        this.createCardsScrollArrow(58, 522, '<', () => this.scrollCardsBy(642));
        this.createCardsScrollArrow(WIDTH - 58, 522, '>', () => this.scrollCardsBy(-642));

        this.input.on('wheel', this.handleCardsWheel, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off('wheel', this.handleCardsWheel, this);
        });
    }

    private createCardsScrollArrow(x: number, y: number, label: string, onClick: () => void): void {
        const button = this.add.container(x, y).setDepth(25);
        const shadow = this.add.rectangle(5, 5, 54, 72, COLORS.ink, 0.95);
        const bg = this.add.rectangle(0, 0, 54, 72, COLORS.paper, 1)
            .setStrokeStyle(4, COLORS.ink)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, {
            fontFamily: FONT_DISPLAY,
            fontSize: '34px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0.5);

        bg.on('pointerover', () => {
            this.hoverSound?.play();
            button.setScale(1.04);
        });
        bg.on('pointerout', () => button.setScale(1));
        bg.on('pointerdown', () => {
            this.clickSound?.play();
            onClick();
        });

        button.add([shadow, bg, text]);
    }

    private handleCardsWheel(
        pointer: Phaser.Input.Pointer,
        _gameObjects: Phaser.GameObjects.GameObject[],
        deltaX: number,
        deltaY: number
    ): void {
        if (pointer.y < 140 || pointer.y > 925 || this.cardsMinScrollX === 0) return;

        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
        this.setCardsScroll(this.cardsScrollX - delta * 0.7);
    }

    private scrollCardsBy(amount: number): void {
        this.setCardsScroll(this.cardsScrollX + amount);
    }

    private setCardsScrollFromTrack(pointerX: number): void {
        if (!this.cardsScrollTrack || !this.cardsScrollThumb) return;

        const trackWidth = this.cardsScrollTrack.displayWidth;
        const thumbWidth = this.cardsScrollThumb.displayWidth;
        const left = this.cardsScrollTrack.x - trackWidth / 2 + thumbWidth / 2;
        const right = this.cardsScrollTrack.x + trackWidth / 2 - thumbWidth / 2;
        const progress = Phaser.Math.Clamp((pointerX - left) / (right - left), 0, 1);
        const nextScroll = this.cardsMaxScrollX - progress * (this.cardsMaxScrollX - this.cardsMinScrollX);
        this.setCardsScroll(nextScroll);
    }

    private setCardsScroll(value: number): void {
        this.cardsScrollX = Phaser.Math.Clamp(value, this.cardsMinScrollX, this.cardsMaxScrollX);
        this.cardsContainer?.setX(this.cardsScrollX);
        this.updateCardsScrollThumb();
    }

    private updateCardsScrollThumb(): void {
        if (!this.cardsScrollTrack || !this.cardsScrollThumb) return;

        const range = this.cardsMaxScrollX - this.cardsMinScrollX;
        const progress = range === 0 ? 0 : (this.cardsMaxScrollX - this.cardsScrollX) / range;
        const trackWidth = this.cardsScrollTrack.displayWidth;
        const thumbWidth = this.cardsScrollThumb.displayWidth;
        const left = this.cardsScrollTrack.x - trackWidth / 2 + thumbWidth / 2;
        const right = this.cardsScrollTrack.x + trackWidth / 2 - thumbWidth / 2;

        this.cardsScrollThumb.x = Phaser.Math.Linear(left, right, Phaser.Math.Clamp(progress, 0, 1));
    }

    private createSectionCard(section: SectionConfig, x: number, y: number, width: number, height: number): void {
        const card = this.add.container(x, y).setDepth(10);
        this.cardsContainer?.add(card);
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
        this.createSectionTutorialButton(card, section, width, height);
        this.createProgressBlock(card, section, active, width, height);
    }

    private createSectionTutorialButton(
        parent: Phaser.GameObjects.Container,
        section: SectionConfig,
        width: number,
        height: number
    ): void {
        const completed = section.progressValue >= 1;
        const label = section.index === 1 ? 'Tut. Frutas'
            : section.index === 2 ? 'Tut. Cereales'
            : section.index === 3 ? 'Tut. Animal'
            : 'Conceptos';

        const button = PrefabButtons.continuar(this, width / 2, height - 126, () => {
            this.handleSectionSelection(section);
        }, {
            text: completed ? 'Repasar' : label,
            width: 250,
            height: 62,
            fontSize: '20px',
            hoverScale: 1.03,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
        });

        parent.add(button);
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

        const footer = this.add.text(
            panelX,
            panelY,
            section.flow === 'concepts' ? 'REPASAR  --->  RESOLVER' : 'CONOCER  --->  CLASIFICAR',
            {
            fontFamily: FONT_DISPLAY,
            fontSize: '18px',
            color: HEX.ink
            }
        ).setOrigin(0.5);

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
        const progress = this.getProgressState();
        const completedSteps = [
            progress.tutorialFrutasDone,
            progress.tutorialCerealesDone,
            progress.tutorialAnimalDone,
            progress.preTutorialConceptosDone,
            progress.crucigramaDone,
        ].filter(Boolean).length;

        const levelCircle = this.add.circle(-880, 0, 34, COLORS.white, 1).setStrokeStyle(5, COLORS.ink);
        const levelInner = this.add.circle(-880, 0, 24, progress.canPlayBalancedPlate ? COLORS.green : COLORS.yellow, 0.45)
            .setStrokeStyle(3, progress.canPlayBalancedPlate ? COLORS.green : COLORS.yellow);
        const levelText = this.add.text(-880, 0, `${completedSteps}/5`, {
            fontFamily: FONT_DISPLAY,
            fontSize: '24px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0.5);

        const kicker = this.add.text(-820, -27, 'Ruta principal:', {
            fontFamily: FONT_DISPLAY,
            fontSize: '30px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0, 0.5);

        const current = this.add.text(-592, -27, 'Plato Balanceado', {
            fontFamily: FONT_DISPLAY,
            fontSize: '30px',
            fontStyle: 'bold',
            color: HEX.ink,
        }).setOrigin(0, 0.5);

        const detail = this.add.text(
            -820,
            27,
            progress.canPlayBalancedPlate
                ? 'Nivel principal desbloqueado'
                : 'Completa tutoriales, conceptos y crucigrama',
            {
                fontFamily: FONT_MONO,
                fontSize: '26px',
                color: HEX.ink,
            }
        ).setOrigin(0, 0.5);

        const mainButton = PrefabButtons.continuar(this, 0, 0, () => {
            if (!progress.canPlayBalancedPlate) {
                this.showToast(BALANCED_PLATE_LOCKED_MESSAGE);
                return;
            }

            this.scene.start('PlatoBalanceadoScene');
        }, {
            text: 'Plato Balanceado',
            width: 370,
            height: 76,
            fontSize: '26px',
            hoverScale: 1.03,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
        });

        if (!progress.canPlayBalancedPlate) {
            mainButton.setButtonAlpha(0.48);
        }

        const presentationButton = PrefabButtons.secundario(this, -690,-900, () => {
            this.scene.start('TutorialScene');
        }, {
            text: '< Presentacion',
            width: 275,
            height: 72,
            fontSize: '26px',
            hoverScale: 1.03,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
        });

        hud.add([
            shadow,
            bg,
            levelCircle,
            levelInner,
            levelText,
            kicker,
            current,
            detail,
            presentationButton,
            mainButton,
        ]);
    }

    private createExtraButtons(): void {
        // Tutorial, conceptos y nivel principal viven dentro de sus tarjetas o la barra inferior.
    }

    private handleSectionSelection(section: SectionConfig): void {
        if (section.flow === 'concepts') {
            this.startConceptsFlow();
            return;
        }

        this.startSectionFoodGrid(section.index);
    }

    private startSectionFoodGrid(index: SectionIndex): void {
        if (index === 4) {
            this.startConceptsFlow();
            return;
        }

        if (index === 1) {
            if (!window.showTutorial) {
                this.scene.start('Nivel1Scene');
                return;
            }

            window.showTutorial(['vegetable', 'fruit'], {
                nextScene: 'Nivel1Scene',
                title: 'Verduras y Frutas',
                finishLabel: 'Empezar Nivel 1',
            });
            return;
        }

        if (index === 2) {
            if (!window.showTutorial) {
                this.scene.start('Nivel2Scene');
                return;
            }

            window.showTutorial(['legume', 'cereal'], {
                nextScene: 'Nivel2Scene',
                title: 'Leguminosas y Cereales',
                finishLabel: 'Empezar Nivel 2',
            });
            return;
        }

        if (!window.showTutorial) {
            this.scene.start('Nivel3Scene');
            return;
        }

        window.showTutorial(['animal'], {
            nextScene: 'Nivel3Scene',
            title: 'Origen Animal',
            finishLabel: 'Empezar Nivel 3',
        });
    }

    private startConceptsFlow(): void {
        this.scene.start('PreTutorialConceptosScene', {
            nextLevel: 'CrucigramaSaludableScene',
        });
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
