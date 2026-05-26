import * as Phaser from 'phaser';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { PlayerService } from '../../services/PlayerService';
import type { Sexo } from '../../types/player-types';

const WIDTH = 1920;
const HEIGHT = 1080;
const MENU_KITCHEN_BACKGROUND_ALPHA = 1;
const MENU_SCRIM_CENTER_ALPHA = 0.48;
const MENU_SCRIM_EDGE_ALPHA = 0.70;

const COLORS = {
    bg: 0xfffbf0,
    bgCard: 0xffffff,
    ink: 0x2e3142,
    inkHex: '#2E3142',
    ink2Hex: '#4F5266',
    inkMuteHex: '#9094A4',
    frutas: 0x7ad3a0,
    frutasTint: 0xe4f4ea,
    cereales: 0xf9cd55,
    cerealesTint: 0xfcefc9,
    cerealesDimHex: '#A6811A',
    legumin: 0xff9580,
    accent: 0x8a95e0,
    accentTint: 0xe6e9f6,
};

const FONT_DISPLAY = '"Pixelify Sans", Arial, sans-serif';
const FONT_MONO = '"VT323", "Courier New", monospace';

type ModalButtonConfig = {
    label: string;
    onClick: () => void;
};

type ModalButtonLayoutConfig = ModalButtonConfig & {
    isCancel: boolean;
    width: number;
};

type FormButtonVariant = 'save' | 'continue' | 'cancel';

const FOOD_FLOATS = [
    { key: 'menu_apple', path: '/iconsFood/frutas/apple.png', x: 154, y: 130, angle: -12, scale: 1.35 },
    { key: 'menu_broccoli', path: '/iconsFood/verduras/broccoli.png', x: 1786, y: 260, angle: 14, scale: 1.35 },
    { key: 'menu_banana', path: '/iconsFood/frutas/banana.png', x: 96, y: 670, angle: 18, scale: 1.3 },
    { key: 'menu_chicken', path: '/iconsFood/animal/chicken.png', x: 1786, y: 735, angle: -8, scale: 1.35 },
    { key: 'menu_tortilla', path: '/iconsFood/cereales/tortilla.png', x: 1497, y: 110, angle: 6, scale: 1.25 },
    { key: 'menu_beans', path: '/iconsFood/leguminosas/beans.png', x: 422, y: 758, angle: -10, scale: 1.2 },
    { key: 'menu_tomato', path: '/iconsFood/frutas/tomato.png', x: 269, y: 346, angle: 22, scale: 1.15 },
    { key: 'menu_egg', path: '/iconsFood/animal/egg.png', x: 1632, y: 432, angle: -16, scale: 1.15 },
    { key: 'menu_corn', path: '/iconsFood/cereales/corn.png', x: 355, y: 202, angle: -8, scale: 1.2 },
    { key: 'menu_strawberry', path: '/iconsFood/frutas/strawberry.png', x: 282, y: 565, angle: 10, scale: 1.1 },
    { key: 'menu_carrot', path: '/iconsFood/verduras/carrot.png', x: 118, y: 906, angle: -18, scale: 1.25 },
    { key: 'menu_rice', path: '/iconsFood/cereales/rice.png', x: 1540, y: 905, angle: 12, scale: 1.1 },
    { key: 'menu_milk', path: '/iconsFood/animal/milk-carton.png', x: 1732, y: 940, angle: -8, scale: 1.1 },
    { key: 'menu_watermelon', path: '/iconsFood/frutas/watermelon.png', x: 188, y: 822, angle: 9, scale: 1 },
    { key: 'menu_peas', path: '/iconsFood/leguminosas/green_peas.png', x: 1648, y: 178, angle: -12, scale: 1 },
    { key: 'menu_pepper', path: '/iconsFood/verduras/bell-pepper.png', x: 1812, y: 534, angle: 16, scale: 1 },
    { key: 'menu_oat', path: '/iconsFood/cereales/oat.png', x: 1260, y: 128, angle: -6, scale: 0.95 },
    { key: 'menu_fish', path: '/iconsFood/animal/fish.png', x: 508, y: 934, angle: 14, scale: 1.05 },
    { key: 'menu_blueberry', path: '/iconsFood/frutas/blueberry.png', x: 106, y: 420, angle: -4, scale: 0.95 },
    { key: 'menu_lentil', path: '/iconsFood/leguminosas/lentil.png', x: 1376, y: 790, angle: 8, scale: 0.95 },
];

const SPARKLE_COLORS = [COLORS.frutas, COLORS.cereales, COLORS.legumin, COLORS.accent];

export class MainMenu extends Phaser.Scene {
    private clickSound?: Phaser.Sound.BaseSound;
    private hoverSound?: Phaser.Sound.BaseSound;
    private modal?: Phaser.GameObjects.Container;
    private playerFormOverlay?: HTMLDivElement;

    constructor() {
        super({ key: 'MainMenu' });
    }

    // ─────────────────────────── Phaser lifecycle ───────────────────────────

    preload(): void {
        this.load.image('menu_kitchen_bg', '/assets/Backgrounds/Fondo_Cocina.png');
        if (!this.textures.exists('MainButton')) {
            this.load.image('MainButton', '/assets/Buttons/MainButton.png');
        }
        if (!this.textures.exists('SecondaryButton')) {
            this.load.image('SecondaryButton', '/assets/Buttons/SecondaryButton.png');
        }
        if (!this.textures.exists('CancelButton')) {
            this.load.image('CancelButton', '/assets/Buttons/Cancel.png');
        }

        FOOD_FLOATS.forEach(food => {
            this.load.image(food.key, food.path);
        });

        this.load.audio('menu_click', '/Sound/Click.mp3');
        this.load.audio('menu_hover', '/Sound/hoverSound.mp3');
    }

    create(): void {
        this.cameras.main.setBackgroundColor('#FFFBF0');
        this.createGeneratedTextures();
        this.createBackground();
        this.scene.launch('MusicManagerScene');
        this.createAudio();
        this.events.once('shutdown', () => this.removePlayerFormOverlay());

        if (document.fonts) {
            void Promise.all([
                document.fonts.load('700 214px "Pixelify Sans"'),
                document.fonts.load('600 30px "Pixelify Sans"'),
                document.fonts.load('24px "VT323"'),
            ]).finally(() => this.createMenuContent());
            return;
        }

        this.createMenuContent();
    }

    private createMenuContent(): void {
        this.createFloatingFoods();
        this.createSparkles();
        this.createHud();
        this.createTitleStack();
        this.createMainActions();
        this.createFooter();
        this.createCrtOverlay();
        this.refreshTextAfterFontsLoad();

        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    }

    // ─────────────────────────── Audio ───────────────────────────

    private createAudio(): void {
        this.clickSound = this.sound.add('menu_click', { volume: 0.14, loop: false });
        this.hoverSound = this.sound.add('menu_hover', { volume: 0.08, loop: false });
    }

    // ─────────────────────── Background & atmosphere ───────────────────────

    private createGeneratedTextures(): void {
        this.createScrimTexture();
        this.createDotTexture();
        this.createCrtTexture();
    }

    private createScrimTexture(): void {
        const key = 'menu_scrim_light';
        if (this.textures.exists(key)) {
            this.textures.remove(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const context = canvas.getContext('2d');
        if (!context) return;

        const gradient = context.createRadialGradient(WIDTH / 2, HEIGHT / 2, 120, WIDTH / 2, HEIGHT / 2, 1140);
        gradient.addColorStop(0, `rgba(255, 251, 240, ${MENU_SCRIM_CENTER_ALPHA})`);
        gradient.addColorStop(1, `rgba(255, 251, 240, ${MENU_SCRIM_EDGE_ALPHA})`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, WIDTH, HEIGHT);
        this.textures.addCanvas(key, canvas);

        
    }

    private createDotTexture(): void {
        const key = 'menu_dot_tile';
        if (this.textures.exists(key)) return;

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.fillStyle = 'rgba(46, 49, 66, 0.08)';
        context.beginPath();
        context.arc(16, 16, 2, 0, Math.PI * 2);
        context.fill();
        this.textures.addCanvas(key, canvas);
    }

    private createCrtTexture(): void {
        const key = 'menu_crt_tile';
        if (this.textures.exists(key)) return;

        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 4;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.fillStyle = 'rgba(27, 32, 24, 0.06)';
        context.fillRect(0, 0, 4, 1);
        this.textures.addCanvas(key, canvas);
    }

    private createBackground(): void {
        this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.bg, 1)
            .setDepth(0);

        this.add.image(WIDTH / 2, HEIGHT / 2, 'menu_kitchen_bg')
            .setDisplaySize(WIDTH, HEIGHT)
            .setAlpha(MENU_KITCHEN_BACKGROUND_ALPHA)
            .setDepth(1);

        this.add.image(WIDTH / 2, HEIGHT / 2, 'menu_scrim_light')
            .setDisplaySize(WIDTH, HEIGHT)
            .setDepth(2);

        this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'menu_dot_tile')
            .setDepth(3);
    }

    private createFloatingFoods(): void {
        FOOD_FLOATS.forEach((food, index) => {
            const container = this.add.container(food.x, food.y).setDepth(4);

            const shadow = this.add.image(8, 10, food.key)
                .setScale(food.scale)
                .setAngle(food.angle)
                .setTint(0x2e3142)
                .setAlpha(0.18);

            const sprite = this.add.image(0, 0, food.key)
                .setScale(food.scale)
                .setAngle(food.angle);

            container.add([shadow, sprite]);

            this.tweens.add({
                targets: container,
                y: food.y - 14,
                duration: 4000 + index * 400,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: index * 200,
            });
        });
    }

    private createSparkles(): void {
        const points = [
            [132, 207, 7], [398, 166, 5], [820, 182, 6], [1096, 694, 7],
            [1509, 159, 8], [1642, 442, 6], [1780, 585, 9], [1340, 827, 6],
            [548, 823, 6], [246, 850, 8], [1224, 256, 7], [1511, 878, 5],
            [118, 404, 5], [910, 777, 6],
        ];

        points.forEach(([x, y, size], index) => {
            const square = this.add.rectangle(x, y, size, size, SPARKLE_COLORS[index % SPARKLE_COLORS.length], 1)
                .setStrokeStyle(2, COLORS.ink)
                .setDepth(4);

            this.tweens.add({
                targets: square,
                alpha: 0.25,
                duration: 1600 + index * 90,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: index * 130,
            });
        });
    }

    private createCrtOverlay(): void {
        this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'menu_crt_tile')
            .setAlpha(0.35)
            .setDepth(13);
    }

    // ─────────────────────────── HUD & title ───────────────────────────

    private createHud(): void {
        this.createTextCard({
            x: WIDTH - 120,
            y: 32,
            width: 112,
            height: 38,
            text: 'ES · MX',
            fontSize: 20,
            fontFamily: FONT_MONO,
            fill: COLORS.frutasTint,
            shadowOffset: 4,
        }).setDepth(12);

        this.createInfoButton();
    }

    private createTitleStack(): void {
        const logo = this.add.container(WIDTH / 2, 482).setDepth(6);
        logo.add([
            this.createLogoLayer(12, 12, 'COLORS.cereales' ),
            this.createLogoLayer(6, 6, '#7AD3A0'),
            this.createLogoLayer(0, 0, '#FFFFFF'),
        ]);

        this.tweens.add({
            targets: logo,
            y: 472,
            duration: 1800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private createLogoLayer(x: number, y: number, color: string): Phaser.GameObjects.Text {
        return this.add.text(x, y, 'PLACHEF', {
            fontFamily: FONT_DISPLAY,
            fontSize: '214px',
            fontStyle: 'bold',
            color,
            stroke: COLORS.inkHex,
            strokeThickness: 4,
        }).setOrigin(0.5);
    }

    // ─────────────────────────── Main actions ───────────────────────────

    private createMainActions(): void {
        this.createPlayButton();
        this.createTutorialButton();
        this.createLevelsButton();
        this.createAchievementsButton();
        this.createSpaceHint();
    }

    private createInfoButton(): void {
        PrefabButtons.icono(this, WIDTH - 36, 32, () => this.showInfoModal(), {
            text: 'ⓘ',
            width: 38,
            height: 38,
            fontSize: 18,
            fill: COLORS.bgCard,
            hoverFill: COLORS.accentTint,
            textColor: COLORS.inkHex,
            strokeColor: COLORS.ink,
            shadowColor: COLORS.ink,
            shadowOffset: 4,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 12,
        });
    }

    private createPlayButton(): void {
        const playButton = PrefabButtons.continuar(this, WIDTH / 2, 750, () => this.startGame(), {
            text: ' JUGAR',
            width: 340,
            height: 100,
            fontSize: '44px',
            hoverScale: 1.03,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 8,
        });

        this.tweens.add({
            targets: playButton,
            x: WIDTH / 2 - 2,
            y: 748,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private createTutorialButton(): void {
        PrefabButtons.secundario(this, 805, 990, () => this.startTutorial(false), {
            text: 'TUTORIAL',
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 10,
        });
    }

    private createLevelsButton(): void {
        PrefabButtons.secundario(this, 960, 990, () => this.showLevelsModal(), {
            text: 'NIVELES',
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 10,
        });
    }

    private createAchievementsButton(): void {
        PrefabButtons.secundario(this, 1115, 990, () => this.showAchievementsModal(), {
            text: 'LOGROS',
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
            depth: 10,
        });
    }

    private createModalButton(button: ModalButtonLayoutConfig, x: number): Phaser.GameObjects.Container {
        const factory = button.isCancel ? PrefabButtons.cerrar : PrefabButtons.continuar;

        return factory(this, x, 104, button.onClick, {
            text: button.label,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
        });
    }

    private createSaveAndPlayButton(): HTMLButtonElement {
        const button = this.createFormButton('GUARDAR Y JUGAR', 'save');
        button.type = 'submit';
        return button;
    }

    private createCloseFormButton(): HTMLButtonElement {
        const button = this.createFormButton('CERRAR', 'cancel');
        button.type = 'button';
        button.addEventListener('click', () => this.removePlayerFormOverlay());
        return button;
    }

    private createContinueSavedPlayerButton(
        select: HTMLSelectElement,
        errorBox: HTMLDivElement
    ): HTMLButtonElement {
        const button = this.createFormButton('CONTINUAR', 'continue');
        button.type = 'button';
        button.addEventListener('click', () => {
            errorBox.textContent = '';

            try {
                PlayerService.establecerJugadorActivo(select.value);
                this.removePlayerFormOverlay();
                this.scene.start('TutorialScene');
            } catch (error) {
                errorBox.textContent = error instanceof Error
                    ? error.message
                    : 'No se pudo seleccionar el jugador.';
            }
        });
        return button;
    }

    private createFormButton(text: string, variant: FormButtonVariant): HTMLButtonElement {
        const style = this.getFormButtonStyle(variant);
        const button = document.createElement('button');
        button.textContent = text;
        button.style.width = style.width;
        button.style.color = style.color;
        button.style.height = style.height;
        button.style.border = '0';
        button.style.backgroundColor = 'transparent';  
        button.style.backgroundImage = `url("${style.backgroundImage}")`;
        button.style.backgroundRepeat = 'no-repeat';
        button.style.backgroundPosition = 'center';
        button.style.backgroundSize = '100% 100%';
        button.style.padding = style.padding;
        button.style.fontFamily = '"Pixelify Sans", Arial, sans-serif';
        button.style.fontSize = '18px';
        button.style.fontWeight = '700';
        button.style.cursor = 'pointer';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.textAlign = 'center';
        button.style.lineHeight = '1';

        return button;
    }

    private getFormButtonStyle(variant: FormButtonVariant): {
        width: string;
        height: string;
        color: string;
        backgroundImage: string;
        padding: string;
    } {
        if (variant === 'cancel') {
            return {
                width: '153px',
                height: '54px',
                color: '#FFFFFF',
                backgroundImage: '/assets/Buttons/Cancel.png',
                padding: '0 12px 4px',
            };
        }

        if (variant === 'continue') {
            return {
                width: '153px',
                height: '54px',
                color: '#2E3142',
                backgroundImage: '/assets/Buttons/MainButton.png',
                padding: '0 18px 4px',
            };
        }

        return {
            width: '153px',
            height: '54px',
            color: '#2E3142',
            backgroundImage: '/assets/Buttons/MainButton.png',
            padding: '0 18px 4px',
        };
    }

    private createSpaceHint(): void {
        const hint = this.add.container(WIDTH / 2, 914).setDepth(9);
        const left = this.add.text(-174, 0, 'O PRESIONA', {
            fontFamily: FONT_MONO,
            fontSize: '22px',
            color: COLORS.ink2Hex,
        }).setOrigin(0.5);

        const kbdShadow = this.add.rectangle(-28, 3, 76, 26, COLORS.ink, 1);
        const kbd = this.add.rectangle(-30, 0, 76, 26, COLORS.bgCard, 1)
            .setStrokeStyle(2, COLORS.ink);
        const kbdText = this.add.text(-30, 0, '[SPACE]', {
            fontFamily: FONT_MONO,
            fontSize: '20px',
            color: COLORS.inkHex,
        }).setOrigin(0.5);

        const right = this.add.text(110, 0, 'PARA EMPEZAR', {
            fontFamily: FONT_MONO,
            fontSize: '22px',
            color: COLORS.ink2Hex,
        }).setOrigin(0.5);

        hint.add([left, kbdShadow, kbd, kbdText, right]);

        this.tweens.add({
            targets: hint,
            alpha: 0.25,
            duration: 1600,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });
    }

    // ─────────────────────────── Footer ───────────────────────────

    private createFooter(): void {
        this.add.text(WIDTH / 2, HEIGHT - 16, '© 2026 PLACHEF · BASADO EN EL PLATO DEL BIEN COMER (NOM-043-SSA2)', {
            fontFamily: FONT_MONO,
            fontSize: '16px',
            color: COLORS.inkMuteHex,
        }).setOrigin(0.5).setDepth(14);
    }

    // ─────────────────────────── Font refresh ───────────────────────────

    private refreshTextAfterFontsLoad(): void {
        if (!document.fonts) return;

        void Promise.all([
            document.fonts.load('700 214px "Pixelify Sans"'),
            document.fonts.load('600 30px "Pixelify Sans"'),
            document.fonts.load('24px "VT323"'),
        ]).then(() => {
            this.children.list.forEach(child => {
                if (child instanceof Phaser.GameObjects.Text) {
                    child.updateText();
                }
            });
        });
    }

    // ─────────────────────────── Reusable builders ───────────────────────────

    private createTextCard(config: {
        x: number;
        y: number;
        width: number;
        height: number;
        text: string;
        fontSize: number;
        fontFamily: string;
        fill: number;
        shadowOffset: number;
        textColor?: string;
    }): Phaser.GameObjects.Container {
        const card = this.add.container(config.x, config.y);
        const shadow = this.add.rectangle(config.shadowOffset, config.shadowOffset, config.width, config.height, COLORS.ink, 1);
        const bg = this.add.rectangle(0, 0, config.width, config.height, config.fill, 1)
            .setStrokeStyle(3, COLORS.ink);
        const text = this.add.text(0, 0, config.text, {
            fontFamily: config.fontFamily,
            fontSize: `${config.fontSize}px`,
            fontStyle: config.fontFamily === FONT_DISPLAY ? 'bold' : undefined,
            color: config.textColor ?? COLORS.inkHex,
        }).setOrigin(0.5);

        card.add([shadow, bg, text]);
        return card;
    }

    // ─────────────────────────── Navigation ───────────────────────────

    private startGame(playSound = true): void {
        if (playSound) {
            this.clickSound?.play();
        }

        this.showPlayerFormOverlay();
    }

    private startTutorial(playSound = true): void {
        if (playSound) {
            this.clickSound?.play();
        }

        this.scene.start('TutorialScene');
    }

    // ─────────────────────── Player form overlay (DOM) ───────────────────────

    private showPlayerFormOverlay(): void {
        if (this.playerFormOverlay) {
            this.playerFormOverlay.querySelector<HTMLInputElement>('input[name="nombre"]')?.focus();
            return;
        }

        const jugadores = PlayerService.obtenerJugadores();
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(46, 49, 66, 0.52)';
        overlay.style.fontFamily = '"Pixelify Sans", Arial, sans-serif';
        overlay.addEventListener('pointerdown', event => event.stopPropagation());
        overlay.addEventListener('keydown', event => event.stopPropagation());
        overlay.addEventListener('keyup', event => event.stopPropagation());

        const panel = document.createElement('div');
        panel.style.width = 'min(520px, calc(100vw - 32px))';
        panel.style.maxHeight = 'calc(100vh - 32px)';
        panel.style.overflow = 'auto';
        panel.style.background = '#fffbf0';
        panel.style.border = '4px solid #2E3142';
        panel.style.boxShadow = '10px 10px 0 #2E3142';
        panel.style.padding = '24px';
        panel.style.color = '#2E3142';

        const title = document.createElement('h2');
        title.textContent = jugadores.length > 0 ? 'SELECCIONAR JUGADOR' : 'CREAR JUGADOR';
        title.style.margin = '0 0 8px';
        title.style.fontSize = '32px';
        title.style.lineHeight = '1';

        const description = document.createElement('p');
        description.textContent = jugadores.length > 0
            ? 'Elige un jugador guardado o crea uno nuevo.'
            : 'Guarda tu avance individual en esta computadora.';
        description.style.margin = '0 0 18px';
        description.style.fontFamily = '"VT323", "Courier New", monospace';
        description.style.fontSize = '24px';

        const errorBox = document.createElement('div');
        errorBox.style.minHeight = '24px';
        errorBox.style.marginBottom = '12px';
        errorBox.style.color = '#9D2A2A';
        errorBox.style.fontFamily = '"VT323", "Courier New", monospace';
        errorBox.style.fontSize = '22px';

        const form = document.createElement('form');
        form.style.display = 'grid';
        form.style.gap = '12px';

        const nombre = this.createFormInput('nombre', 'Nombre o apodo', 'text', 'Luis');
        const edad = this.createFormInput('edad', 'Edad', 'number', '10');
        const peso = this.createFormInput('pesoKg', 'Peso (kg)', 'number', '35');
        const estatura = this.createFormInput('estaturaCm', 'Estatura (cm)', 'number', '135');
        edad.input.min = '2';
        edad.input.max = '99';
        peso.input.min = '5';
        peso.input.max = '300';
        peso.input.step = '0.1';
        estatura.input.min = '50';
        estatura.input.max = '250';
        estatura.input.step = '0.1';

        const sexoLabel = document.createElement('label');
        sexoLabel.textContent = 'Sexo';
        sexoLabel.style.display = 'grid';
        sexoLabel.style.gap = '6px';
        sexoLabel.style.fontSize = '18px';

        const sexo = document.createElement('select');
        sexo.name = 'sexo';
        sexo.required = true;
        sexo.append(
            new Option('Masculino', 'masculino'),
            new Option('Femenino', 'femenino')
        );
        this.applyFieldStyles(sexo);
        sexoLabel.append(sexo);

        const patologiaLabel = document.createElement('label');
        patologiaLabel.textContent = 'Condición Médica';
        patologiaLabel.style.display = 'grid';
        patologiaLabel.style.gap = '6px';
        patologiaLabel.style.fontSize = '18px';

        const patologia = document.createElement('select');
        patologia.name = 'patologia';
        patologia.required = true;
        patologia.append(
            new Option('Ninguna', 'ninguna'),
            new Option('Diabetes', 'diabetico'),
            new Option('Hipertensión', 'hipertenso')
        );
        this.applyFieldStyles(patologia);
        patologiaLabel.append(patologia);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '12px';
        actions.style.marginTop = '8px';
        actions.style.flexWrap = 'wrap';

        let editingPlayerId: string | null = null;
        const submitBtn = this.createSaveAndPlayButton();
        actions.append(
            submitBtn,
            this.createCloseFormButton()
        );

        if (jugadores.length > 0) {
            const existingBlock = this.createExistingPlayersBlock(
                jugadores,
                errorBox,
                {
                    nombre: nombre.input,
                    edad: edad.input,
                    sexo: sexo,
                    patologia: patologia,
                    peso: peso.input,
                    estatura: estatura.input,
                    titleElem: title,
                    submitBtn: submitBtn,
                    setEditingId: (id: string | null) => { editingPlayerId = id; }
                }
            );
            form.append(existingBlock);
        }

        form.append(
            nombre.label,
            edad.label,
            sexoLabel,
            patologiaLabel,
            peso.label,
            estatura.label,
            actions
        );

        form.addEventListener('submit', event => {
            event.preventDefault();
            errorBox.textContent = '';

            try {
                const datos = {
                    nombre: nombre.input.value,
                    edad: Number(edad.input.value),
                    sexo: sexo.value as Sexo,
                    pesoKg: Number(peso.input.value),
                    estaturaCm: Number(estatura.input.value),
                    patologia: patologia.value as any,
                };

                if (editingPlayerId) {
                    PlayerService.actualizarPerfilJugador(editingPlayerId, datos);
                    PlayerService.establecerJugadorActivo(editingPlayerId);
                } else {
                    PlayerService.crearJugador(datos);
                }

                this.removePlayerFormOverlay();
                this.scene.start('LevelSelectScene');
            } catch (error) {
                errorBox.textContent = error instanceof Error
                    ? error.message
                    : 'No se pudo crear el jugador.';
            }
        });

        panel.append(title, description, errorBox, form);
        overlay.append(panel);
        document.body.append(overlay);
        this.playerFormOverlay = overlay;
        nombre.input.focus();
    }

    private createExistingPlayersBlock(
        jugadores: ReturnType<typeof PlayerService.obtenerJugadores>,
        errorBox: HTMLDivElement,
        formRefs: {
            nombre: HTMLInputElement;
            edad: HTMLInputElement;
            sexo: HTMLSelectElement;
            patologia: HTMLSelectElement;
            peso: HTMLInputElement;
            estatura: HTMLInputElement;
            titleElem: HTMLDivElement;
            submitBtn: HTMLButtonElement;
            setEditingId: (id: string | null) => void;
        }
    ): HTMLDivElement {
        const block = document.createElement('div');
        block.style.display = 'grid';
        block.style.gap = '8px';
        block.style.padding = '12px';
        block.style.background = '#ffffff';
        block.style.border = '3px solid #2E3142';

        const title = document.createElement('div');
        title.textContent = 'JUGADOR GUARDADO';
        title.style.fontSize = '18px';

        const select = document.createElement('select');
        jugadores.forEach(jugador => {
            select.append(new Option(jugador.nombre, jugador.id));
        });
        this.applyFieldStyles(select);

        const continueBtn = this.createContinueSavedPlayerButton(select, errorBox);
        const editBtn = this.createFormButton('EDITAR', 'cancel');
        editBtn.type = 'button';
        editBtn.addEventListener('click', () => {
            const id = select.value;
            const jugador = PlayerService.obtenerJugadorPorId(id);
            if (jugador) {
                formRefs.nombre.value = jugador.nombre;
                formRefs.edad.value = jugador.datosAntropometricos.edad.toString();
                formRefs.sexo.value = jugador.datosAntropometricos.sexo;
                formRefs.patologia.value = jugador.datosAntropometricos.patologia || 'ninguna';
                formRefs.peso.value = jugador.datosAntropometricos.pesoKg.toString();
                formRefs.estatura.value = jugador.datosAntropometricos.estaturaCm.toString();
                
                formRefs.titleElem.textContent = 'EDITAR JUGADOR';
                formRefs.submitBtn.textContent = 'GUARDAR CAMBIOS';
                formRefs.setEditingId(id);
            }
        });

        const actionBox = document.createElement('div');
        actionBox.style.display = 'flex';
        actionBox.style.gap = '8px';
        actionBox.append(continueBtn, editBtn);

        block.append(title, select, actionBox);
        return block;
    }

    private createFormInput(
        name: string,
        text: string,
        type: string,
        placeholder: string
    ): { label: HTMLLabelElement; input: HTMLInputElement } {
        const label = document.createElement('label');
        label.textContent = text;
        label.style.display = 'grid';
        label.style.gap = '6px';
        label.style.fontSize = '18px';

        const input = document.createElement('input');
        input.name = name;
        input.type = type;
        input.placeholder = placeholder;
        input.required = true;
        this.applyFieldStyles(input);
        label.append(input);

        return { label, input };
    }

    private applyFieldStyles(field: HTMLInputElement | HTMLSelectElement): void {
        field.style.boxSizing = 'border-box';
        field.style.width = '100%';
        field.style.height = '44px';
        field.style.border = '3px solid #2E3142';
        field.style.background = '#ffffff';
        field.style.color = '#2E3142';
        field.style.padding = '0 10px';
        field.style.fontFamily = '"VT323", "Courier New", monospace';
        field.style.fontSize = '24px';
        field.style.outline = 'none';
    }

    private removePlayerFormOverlay(): void {
        this.playerFormOverlay?.remove();
        this.playerFormOverlay = undefined;
    }

    // ─────────────────────────── Modals ───────────────────────────

    private showLevelsModal(): void {
        this.showModal('Selecciona nivel', [
            'Elige una práctica para continuar tu ruta de nutrición.',
        ], [
            { label: 'NIVEL 1', onClick: () => this.scene.start('Nivel1Scene') },
            { label: 'NIVEL 2', onClick: () => this.scene.start('Nivel2Scene') },
            { label: 'NIVEL 3', onClick: () => this.scene.start('Nivel3Scene') },
        ]);
    }

    private showAchievementsModal(): void {
        this.showModal('Logros', [
            'Sigue jugando para desbloquear insignias saludables.',
            'Próximamente: historial de récords y medallas.',
        ], [
            { label: 'CERRAR', onClick: () => this.closeModal() },
        ]);
    }

    private showInfoModal(): void {
        this.showModal('PLACHEF', [
            'Serious game educativo sobre el Plato del Bien Comer.',
            'Usa alimentos, niveles y retos para practicar decisiones saludables.',
        ], [
            { label: 'CERRAR', onClick: () => this.closeModal() },
        ]);
    }

    private showModal(title: string, lines: string[], buttons: ModalButtonConfig[]): void {
        this.closeModal();

        const modalWidth = 720;
        const modalHeight = 300;
        const bodyMaxWidth = modalWidth - 96;
        const bodyMaxHeight = 120;
        const modal = this.add.container(WIDTH / 2, 610).setDepth(30);
        const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, COLORS.bg, 0.24)
            .setInteractive();
        overlay.setPosition(-WIDTH / 2, -610 + HEIGHT / 2);

        const shadow = this.add.rectangle(10, 10, modalWidth, modalHeight, COLORS.ink, 1);
        const bg = this.add.rectangle(0, 0, modalWidth, modalHeight, COLORS.bgCard, 1)
            .setStrokeStyle(4, COLORS.ink);
        const titleText = this.add.text(0, -102, title.toUpperCase(), {
            fontFamily: FONT_DISPLAY,
            fontSize: '38px',
            fontStyle: 'bold',
            color: COLORS.inkHex,
        }).setOrigin(0.5);

        const bodyText = this.add.text(0, -36, lines.join('\n'), {
            fontFamily: FONT_MONO,
            fontSize: '28px',
            color: COLORS.ink2Hex,
            align: 'center',
            lineSpacing: 6,
            fixedWidth: bodyMaxWidth,
            wordWrap: {
                width: bodyMaxWidth,
                useAdvancedWrap: true,
            },
        }).setOrigin(0.5);
        this.fitTextToBox(bodyText, bodyMaxHeight, 28, 18);

        modal.add([overlay, shadow, bg, titleText, bodyText]);

        const modalButtons: ModalButtonLayoutConfig[] = buttons.map(button => {
            const isCancel = this.isCancelButtonLabel(button.label);
            return {
                ...button,
                isCancel,
                width: isCancel ? 153 : 190,
            };
        });
        const buttonGap = 16;
        const totalWidth = modalButtons.reduce((sum, button) => sum + button.width, 0)
            + (modalButtons.length - 1) * buttonGap;
        let nextButtonX = -totalWidth / 2;

        modalButtons.forEach(button => {
            const x = nextButtonX + button.width / 2;
            nextButtonX += button.width + buttonGap;

            modal.add(this.createModalButton(button, x));
        });

        this.modal = modal;
    }

    private isCancelButtonLabel(label: string): boolean {
        return ['CERRAR', 'CANCELAR', 'REGRESAR', 'VOLVER'].includes(label.trim().toUpperCase());
    }

    private fitTextToBox(
        text: Phaser.GameObjects.Text,
        maxHeight: number,
        maxFontSize: number,
        minFontSize: number
    ): void {
        let fontSize = maxFontSize;
        text.setFontSize(`${fontSize}px`);
        text.updateText();

        while (text.height > maxHeight && fontSize > minFontSize) {
            fontSize -= 1;
            text.setFontSize(`${fontSize}px`);
            text.updateText();
        }
    }

    private closeModal(): void {
        if (!this.modal) return;
        this.modal.destroy(true);
        this.modal = undefined;
    }
}