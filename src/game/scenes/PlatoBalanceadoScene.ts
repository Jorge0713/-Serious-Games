import * as Phaser from 'phaser';
import { createDebugSkipButton } from '../systems/DebugSkipButton';

// ─── Paleta Bosque Cálido ────────────────────────────────────────────────────
const PALETTE = {
    verdePrincipal: 0x58B15B,
    verdePrincipalHex: '#58B15B',
    marronClaro: 0x8D6E63,
    marronClaroHex: '#8D6E63',
    marronOscuro: 0x5D4037,
    marronOscuroHex: '#5D4037',
    crema: 0xF5FBF2,
    cremaHex: '#F5FBF2',
    terracota: 0xD2691E,
    terracotaHex: '#D2691E',
};

const SCENE_FONT = '"Pixelify Sans", Arial, sans-serif';

// ─── Tipado ──────────────────────────────────────────────────────────────────
type Grupo = 'verduras_frutas' | 'cereal' | 'leguminosa_aoa';

interface FoodDef {
    key: string;
    path: string;
    label: string;
    grupo: Grupo;
}

interface DraggableFood extends Phaser.GameObjects.Image {
    grupo: Grupo;
    label: string;
    localHomeX: number;
    localHomeY: number;
    fromBar: boolean;
    placed: boolean;
    labelText?: Phaser.GameObjects.Text;
}

interface SectionTab {
    id: Grupo;
    label: string;
}

interface SafeArea {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}

// ─── Catálogo de alimentos (solo sprites confirmados) ────────────────────────
const FOODS: FoodDef[] = [
    // VERDURAS Y FRUTAS
    { key: 'pb_carrot',     path: '/iconsFood/verduras/carrot.png',     label: 'Zanahoria', grupo: 'verduras_frutas' },
    { key: 'pb_broccoli',   path: '/iconsFood/verduras/broccoli.png',   label: 'Brócoli',   grupo: 'verduras_frutas' },
    { key: 'pb_cabbage',    path: '/iconsFood/verduras/cabbage.png',    label: 'Col',       grupo: 'verduras_frutas' },
    { key: 'pb_onion',      path: '/iconsFood/verduras/onion.png',      label: 'Cebolla',   grupo: 'verduras_frutas' },
    { key: 'pb_gourd',      path: '/iconsFood/verduras/gourd.png',      label: 'Calabaza',  grupo: 'verduras_frutas' },
    { key: 'pb_lettuce',    path: '/iconsFood/verduras/lettuce.png',    label: 'Lechuga',   grupo: 'verduras_frutas' },
    { key: 'pb_tomato',     path: '/iconsFood/verduras/tomato.png',     label: 'Tomate',    grupo: 'verduras_frutas' },
    { key: 'pb_pepper',     path: '/iconsFood/verduras/green-bell-pepper.png', label: 'Pimiento', grupo: 'verduras_frutas' },
    { key: 'pb_apple',      path: '/iconsFood/frutas/apple.png',        label: 'Manzana',   grupo: 'verduras_frutas' },
    { key: 'pb_pear',       path: '/iconsFood/frutas/pear.png',         label: 'Pera',      grupo: 'verduras_frutas' },
    { key: 'pb_grapes',     path: '/iconsFood/frutas/grapes.png',       label: 'Uvas',      grupo: 'verduras_frutas' },
    { key: 'pb_orange',     path: '/iconsFood/frutas/orange.png',       label: 'Naranja',   grupo: 'verduras_frutas' },
    { key: 'pb_strawberry', path: '/iconsFood/frutas/strawberry.png',   label: 'Fresa',     grupo: 'verduras_frutas' },
    { key: 'pb_banana',     path: '/iconsFood/frutas/bananas.png',      label: 'Plátano',   grupo: 'verduras_frutas' },
    { key: 'pb_raspberry',  path: '/iconsFood/frutas/raspberry.png',    label: 'Frambuesa', grupo: 'verduras_frutas' },
    { key: 'pb_watermelon', path: '/iconsFood/frutas/watermelon.png',   label: 'Sandía',    grupo: 'verduras_frutas' },

    // CEREALES
    { key: 'pb_rice',     path: '/iconsFood/cereales/rice.png',          label: 'Arroz',    grupo: 'cereal' },
    { key: 'pb_bread',    path: '/iconsFood/cereales/bread.png',         label: 'Pan',      grupo: 'cereal' },
    { key: 'pb_corn',     path: '/iconsFood/cereales/corn.png',          label: 'Maíz',     grupo: 'cereal' },
    { key: 'pb_oat',      path: '/iconsFood/cereales/oat.png',           label: 'Avena',    grupo: 'cereal' },
    { key: 'pb_potato',   path: '/iconsFood/cereales/potato.png',        label: 'Papa',     grupo: 'cereal' },
    { key: 'pb_rebanada', path: '/iconsFood/cereales/rebanada-pan.png',  label: 'Rebanada', grupo: 'cereal' },
    { key: 'pb_tortilla', path: '/iconsFood/cereales/corn_yellow.png',   label: 'Tortilla', grupo: 'cereal' },
    { key: 'pb_galleta',  path: '/iconsFood/comidaExtra/cockie.png',     label: 'Galleta',  grupo: 'cereal' },

    // LEGUMINOSAS / A.O.A.
    { key: 'pb_beans',     path: '/iconsFood/leguminosas/beans.png',        label: 'Frijoles',  grupo: 'leguminosa_aoa' },
    { key: 'pb_lentil',    path: '/iconsFood/leguminosas/lentil.png',       label: 'Lentejas',  grupo: 'leguminosa_aoa' },
    { key: 'pb_chickpea',  path: '/iconsFood/leguminosas/chickpea.png',     label: 'Garbanzos', grupo: 'leguminosa_aoa' },
    { key: 'pb_soy',       path: '/iconsFood/leguminosas/soy.png',          label: 'Soja',      grupo: 'leguminosa_aoa' },
    { key: 'pb_peas',      path: '/iconsFood/leguminosas/green_peas.png',   label: 'Guisantes', grupo: 'leguminosa_aoa' },
    { key: 'pb_egg',       path: '/iconsFood/animal/egg.png',               label: 'Huevo',     grupo: 'leguminosa_aoa' },
    { key: 'pb_chicken',   path: '/iconsFood/animal/chicken.png',           label: 'Pollo',     grupo: 'leguminosa_aoa' },
    { key: 'pb_cheese',    path: '/iconsFood/animal/cheese.png',            label: 'Queso',     grupo: 'leguminosa_aoa' },
    { key: 'pb_milk',      path: '/iconsFood/animal/milk-carton.png',       label: 'Leche',     grupo: 'leguminosa_aoa' },
    { key: 'pb_fish',      path: '/iconsFood/animal/fish.png',              label: 'Pescado',   grupo: 'leguminosa_aoa' },
];

const TABS: SectionTab[] = [
    { id: 'verduras_frutas', label: 'Verduras y Frutas' },
    { id: 'cereal',          label: 'Cereales' },
    { id: 'leguminosa_aoa',  label: 'Leguminosas / A.O.A.' },
];

const IDEAL: Record<Grupo, number> = {
    verduras_frutas: 50,
    cereal: 25,
    leguminosa_aoa: 25,
};

const GRUPO_COLOR_HEX: Record<Grupo, string> = {
    verduras_frutas: PALETTE.verdePrincipalHex,
    cereal: PALETTE.terracotaHex,
    leguminosa_aoa: PALETTE.marronClaroHex,
};

// ─── Constantes de layout sidebar ────────────────────────────────────────────
const TAB_HEIGHT = 56;
const TAB_GAP = 8;
const ITEM_SIZE = 96;
const ITEM_COLS = 2;
const ITEM_GAP_X = 28;
const ITEM_ROW_H = ITEM_SIZE + 52;
const SCROLL_STEP = ITEM_ROW_H;

export class PlatoBalanceadoScene extends Phaser.Scene {
    // Estado
    private activeTab: Grupo = 'verduras_frutas';
    private placedCounts: Record<Grupo, number> = {
        verduras_frutas: 0,
        cereal: 0,
        leguminosa_aoa: 0,
    };
    private placedFoods: DraggableFood[] = [];

    // Layout
    private sidebarViewportY = 0;
    private sidebarViewportH = 0;
    private foodListContainer!: Phaser.GameObjects.Container;
    private sidebarMaskGfx!: Phaser.GameObjects.Graphics;
    private minScrollY = 0;
    private maxScrollY = 0;
    private safeArea: SafeArea = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
    private sidebarX = 0;
    private sidebarW = 0;
    private sidebarTop = 0;
    private sidebarBottom = 0;
    private contentX = 0;
    private contentW = 0;
    private proportionBarW = 0;

    // Plato
    private platoCenterX = 0;
    private platoCenterY = 0;
    private platoRadius = 0;
    private platoDropZone!: Phaser.GameObjects.Zone;

    // UI dinámica
    private progressText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private starText!: Phaser.GameObjects.Text;
    private barFills: Record<Grupo, Phaser.GameObjects.Rectangle> = {} as never;
    private barPercents: Record<Grupo, Phaser.GameObjects.Text> = {} as never;
    private feedbackText!: Phaser.GameObjects.Text;
    private tabButtons: { id: Grupo; bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }[] = [];

    constructor() {
        super('PlatoBalanceadoScene');
    }

    preload() {
        FOODS.forEach((f) => this.load.image(f.key, f.path));
        this.load.audio('pb_click', '/Sound/Click.mp3');
        this.load.audio('pb_correct', '/Sound/ObjectWIN.mp3');
        this.load.audio('pb_error', '/Sound/incorrecto.mp3');
    }

    create() {
        const { width, height } = this.scale;
        this.resetState();
        this.setupLayout(width, height);

        // Fondo crema
        this.add.rectangle(width / 2, height / 2, width, height, PALETTE.crema, 1);
        this.add.rectangle(width / 2, height / 2, width, height, PALETTE.verdePrincipal, 0.04);

        this.buildHeader();
        this.buildInfoPanel();
        this.buildProportionPanel();
        this.buildSidebar();
        this.buildPlato();
        this.buildEvaluateButton();
        this.buildFeedbackPanel();

        this.setupDragEvents();

        createDebugSkipButton(this, {
            label: '← Volver al menú',
            nextScene: 'MainMenu',
            soundKey: 'pb_click',
            x: this.safeArea.left + 8,
            y: this.safeArea.top + 8,
        });
    }

    private resetState() {
        this.activeTab = 'verduras_frutas';
        this.placedCounts = { verduras_frutas: 0, cereal: 0, leguminosa_aoa: 0 };
        this.placedFoods = [];
        this.tabButtons = [];
    }

    private setupLayout(width: number, height: number) {
        const safe = this.getSafeArea(width, height);
        this.safeArea = safe;

        const gutter = 32;
        this.sidebarX = safe.left;
        this.sidebarW = Math.round(Phaser.Math.Clamp(safe.width * 0.23, 360, 410));
        this.sidebarTop = safe.top + 150;
        this.sidebarBottom = safe.bottom - 46;

        this.platoRadius = Math.round(Math.min(340, safe.width * 0.2, safe.height * 0.32));
        this.platoCenterX = Math.round(safe.right - this.platoRadius - 42);
        this.platoCenterY = Math.round(Phaser.Math.Clamp(
            safe.top + safe.height * 0.55,
            safe.top + this.platoRadius + 150,
            safe.bottom - this.platoRadius - 120,
        ));

        const plateLeft = this.platoCenterX - this.platoRadius - 20;
        this.contentX = this.sidebarX + this.sidebarW + gutter;
        this.contentW = Math.round(Phaser.Math.Clamp(
            plateLeft - gutter - this.contentX,
            380,
            520,
        ));
    }

    private getSafeArea(width: number, height: number): SafeArea {
        const viewportW = typeof window === 'undefined' ? width : window.innerWidth;
        const viewportH = typeof window === 'undefined' ? height : window.innerHeight;
        const viewportAspect = viewportW / viewportH;
        const gameAspect = width / height;

        let visibleW = width;
        let visibleH = height;
        let left = 0;
        let top = 0;

        if (viewportAspect < gameAspect) {
            visibleW = height * viewportAspect;
            left = (width - visibleW) / 2;
        } else if (viewportAspect > gameAspect) {
            visibleH = width / viewportAspect;
            top = (height - visibleH) / 2;
        }

        const pad = 36;
        return {
            left: left + pad,
            right: left + visibleW - pad,
            top: top + pad,
            bottom: top + visibleH - pad,
            width: Math.max(0, visibleW - pad * 2),
            height: Math.max(0, visibleH - pad * 2),
        };
    }

    // ─── HEADER ──────────────────────────────────────────────────────────────
    private buildHeader() {
        const safe = this.safeArea;
        const cx = safe.left + safe.width / 2;
        const headerY = safe.top + 46;
        const headerBg = this.add.rectangle(cx, headerY, safe.width, 90, PALETTE.crema, 1)
            .setStrokeStyle(3, PALETTE.marronClaro);
        void headerBg;

        const badgeX = safe.left + 222;
        const titleX = badgeX + 42;
        this.add.circle(badgeX, headerY, 26, PALETTE.verdePrincipal, 1);
        this.add.text(badgeX, headerY, 'PB', {
            fontFamily: SCENE_FONT,
            fontSize: '20px',
            color: PALETTE.cremaHex,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(titleX, headerY - 22, 'Mi Plato Balanceado', {
            fontFamily: SCENE_FONT,
            fontSize: '34px',
            color: PALETTE.marronOscuroHex,
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);

        this.add.text(titleX, headerY + 18, 'Nivel 1: Conoce los grupos', {
            fontFamily: SCENE_FONT,
            fontSize: '24px',
            color: PALETTE.marronClaroHex,
        }).setOrigin(0, 0.5);

        // Puntaje (derecha)
        this.add.text(safe.right - 170, headerY - 20, 'PUNTAJE', {
            fontFamily: SCENE_FONT,
            fontSize: '20px',
            color: PALETTE.marronOscuroHex,
        }).setOrigin(0, 0.5);

        this.starText = this.add.text(safe.right - 170, headerY + 18, '★ 0', {
            fontFamily: SCENE_FONT,
            fontSize: '28px',
            color: PALETTE.terracotaHex,
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        this.scoreText = this.starText;

        // Botón reiniciar
        const resetBtn = this.add.circle(safe.right - 32, headerY, 24, PALETTE.crema, 1)
            .setStrokeStyle(3, PALETTE.marronClaro)
            .setInteractive({ useHandCursor: true });
        const resetIcon = this.add.text(safe.right - 32, headerY, '⟳', {
            fontFamily: SCENE_FONT,
            fontSize: '28px',
            color: PALETTE.marronOscuroHex,
        }).setOrigin(0.5);
        resetBtn.on('pointerover', () => resetBtn.setFillStyle(PALETTE.verdePrincipal, 0.2));
        resetBtn.on('pointerout', () => resetBtn.setFillStyle(PALETTE.crema, 1));
        resetBtn.on('pointerdown', () => {
            try { this.sound.play('pb_click'); } catch { void 0; }
            this.scene.restart();
        });
        void resetIcon;
    }

    // ─── PANEL DE INFORMACIÓN ────────────────────────────────────────────────
    private buildInfoPanel() {
        const panelX = this.contentX;
        const panelY = this.safeArea.top + 142;
        const panelW = this.contentW;
        const panelH = 106;

        this.add.rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, PALETTE.crema, 1)
            .setStrokeStyle(3, PALETTE.marronClaro);

        this.add.circle(panelX + 32, panelY + panelH / 2, 14, PALETTE.marronClaro, 0.2)
            .setStrokeStyle(2, PALETTE.marronClaro);
        this.add.text(panelX + 32, panelY + panelH / 2 - 2, 'i', {
            fontFamily: SCENE_FONT,
            fontSize: '20px',
            color: PALETTE.marronOscuroHex,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(panelX + 60, panelY + 22, 'Progreso', {
            fontFamily: SCENE_FONT,
            fontSize: '20px',
            color: PALETTE.marronOscuroHex,
            fontStyle: 'bold',
        });

        this.progressText = this.add.text(
            panelX + 60,
            panelY + 50,
            '¡Arrastra los alimentos al plato para comenzar!',
            {
                fontFamily: SCENE_FONT,
                fontSize: '19px',
                color: PALETTE.marronClaroHex,
                lineSpacing: 3,
                wordWrap: { width: panelW - 84 },
            },
        );
    }

    // ─── PANEL DE PROPORCIÓN IDEAL ───────────────────────────────────────────
    private buildProportionPanel() {
        const panelX = this.contentX;
        const panelY = this.safeArea.top + 276;
        const panelW = this.contentW;
        const panelH = 248;
        this.proportionBarW = panelW - 48;

        this.add.rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, PALETTE.crema, 1)
            .setStrokeStyle(3, PALETTE.marronClaro);

        this.add.text(panelX + 24, panelY + 16, 'Proporción ideal', {
            fontFamily: SCENE_FONT,
            fontSize: '22px',
            color: PALETTE.marronOscuroHex,
            fontStyle: 'bold',
        });

        const grupos: { id: Grupo; label: string }[] = [
            { id: 'verduras_frutas', label: 'Verduras y Frutas (50%)' },
            { id: 'cereal',          label: 'Cereales (25%)' },
            { id: 'leguminosa_aoa',  label: 'Leguminosas / A.O.A. (25%)' },
        ];

        let cursorY = panelY + 60;
        grupos.forEach((g) => {
            const colorHex = GRUPO_COLOR_HEX[g.id];

            this.add.text(panelX + 24, cursorY, g.label, {
                fontFamily: SCENE_FONT,
                fontSize: '19px',
                color: colorHex,
                fontStyle: 'bold',
                wordWrap: { width: this.proportionBarW - 68 },
            });

            this.barPercents[g.id] = this.add.text(panelX + panelW - 24, cursorY, '0%', {
                fontFamily: SCENE_FONT,
                fontSize: '19px',
                color: PALETTE.marronOscuroHex,
            }).setOrigin(1, 0);

            // Track
            this.add.rectangle(panelX + 24, cursorY + 34, this.proportionBarW, 8, PALETTE.marronClaro, 0.18)
                .setOrigin(0, 0.5);

            // Fill
            this.barFills[g.id] = this.add.rectangle(panelX + 24, cursorY + 34, 0, 8, Phaser.Display.Color.HexStringToColor(colorHex).color, 1)
                .setOrigin(0, 0.5);

            cursorY += 62;
        });
    }

    // ─── SIDEBAR IZQUIERDA CON SCROLL VERTICAL ───────────────────────────────
    private buildSidebar() {
        const totalH = this.sidebarBottom - this.sidebarTop;
        const tabsH = TABS.length * (TAB_HEIGHT + TAB_GAP);

        // Panel de fondo
        this.add.rectangle(this.sidebarX + this.sidebarW / 2, this.sidebarTop + totalH / 2, this.sidebarW, totalH, PALETTE.crema, 1)
            .setStrokeStyle(3, PALETTE.marronClaro);

        // Título
        this.add.text(this.sidebarX + this.sidebarW / 2, this.sidebarTop + 26, '¡Arrastra la comida!', {
            fontFamily: SCENE_FONT,
            fontSize: '24px',
            color: PALETTE.marronOscuroHex,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Tabs
        const tabsTop = this.sidebarTop + 60;
        TABS.forEach((tab, i) => {
            const ty = tabsTop + i * (TAB_HEIGHT + TAB_GAP);
            const bg = this.add.rectangle(this.sidebarX + this.sidebarW / 2, ty + TAB_HEIGHT / 2, this.sidebarW - 32, TAB_HEIGHT, PALETTE.crema, 1)
                .setStrokeStyle(2, PALETTE.marronClaro)
                .setInteractive({ useHandCursor: true });
            const txt = this.add.text(this.sidebarX + this.sidebarW / 2, ty + TAB_HEIGHT / 2, tab.label, {
                fontFamily: SCENE_FONT,
                fontSize: '20px',
                color: PALETTE.marronOscuroHex,
                fontStyle: 'bold',
            }).setOrigin(0.5);

            bg.on('pointerover', () => {
                if (this.activeTab !== tab.id) bg.setFillStyle(PALETTE.verdePrincipal, 0.12);
            });
            bg.on('pointerout', () => this.refreshTabStyles());
            bg.on('pointerdown', () => {
                if (this.activeTab === tab.id) return;
                try { this.sound.play('pb_click'); } catch { void 0; }
                this.activeTab = tab.id;
                this.refreshTabStyles();
                this.rebuildFoodList();
            });

            this.tabButtons.push({ id: tab.id, bg, text: txt });
        });

        // Viewport del listado
        const listTop = tabsTop + tabsH + 12;
        const listBottom = this.sidebarTop + totalH - 16;
        this.sidebarViewportY = listTop;
        this.sidebarViewportH = listBottom - listTop;

        // Track (sombra suave)
        this.add.rectangle(
            this.sidebarX + this.sidebarW / 2,
            listTop + this.sidebarViewportH / 2,
            this.sidebarW - 24,
            this.sidebarViewportH,
            PALETTE.marronClaro,
            0.04,
        ).setStrokeStyle(1, PALETTE.marronClaro, 0.18);

        this.foodListContainer = this.add.container(this.sidebarX + 18, listTop).setDepth(5);

        // Máscara para clipping vertical
        this.sidebarMaskGfx = this.add.graphics();
        this.sidebarMaskGfx.fillStyle(0xffffff, 1);
        this.sidebarMaskGfx.fillRect(
            this.sidebarX + 12,
            listTop,
            this.sidebarW - 24,
            this.sidebarViewportH,
        );
        this.sidebarMaskGfx.setVisible(false);
        const mask = this.sidebarMaskGfx.createGeometryMask();
        this.foodListContainer.setMask(mask);

        // Botones scroll arriba / abajo
        const arrowX = this.sidebarX + this.sidebarW - 22;
        const btnUp = this.add.text(arrowX, listTop + 8, '▲', {
            fontFamily: SCENE_FONT,
            fontSize: '20px',
            color: PALETTE.marronOscuroHex,
            backgroundColor: PALETTE.cremaHex,
            padding: { x: 6, y: 2 },
        }).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true });
        const btnDown = this.add.text(arrowX, listBottom - 8, '▼', {
            fontFamily: SCENE_FONT,
            fontSize: '20px',
            color: PALETTE.marronOscuroHex,
            backgroundColor: PALETTE.cremaHex,
            padding: { x: 6, y: 2 },
        }).setOrigin(1, 1).setDepth(10).setInteractive({ useHandCursor: true });

        btnUp.on('pointerover', () => btnUp.setColor(PALETTE.verdePrincipalHex));
        btnUp.on('pointerout', () => btnUp.setColor(PALETTE.marronOscuroHex));
        btnUp.on('pointerdown', () => this.scrollList(+SCROLL_STEP));
        btnDown.on('pointerover', () => btnDown.setColor(PALETTE.verdePrincipalHex));
        btnDown.on('pointerout', () => btnDown.setColor(PALETTE.marronOscuroHex));
        btnDown.on('pointerdown', () => this.scrollList(-SCROLL_STEP));

        // Rueda del ratón
        this.input.on('wheel', (
            _ptr: Phaser.Input.Pointer,
            _over: Phaser.GameObjects.GameObject[],
            _dx: number,
            dy: number,
        ) => {
            const pointer = this.input.activePointer;
            if (
                pointer.x >= this.sidebarX &&
                pointer.x <= this.sidebarX + this.sidebarW &&
                pointer.y >= this.sidebarViewportY &&
                pointer.y <= this.sidebarViewportY + this.sidebarViewportH
            ) {
                this.scrollList(-dy);
            }
        });

        this.refreshTabStyles();
        this.rebuildFoodList();
    }

    private refreshTabStyles() {
        this.tabButtons.forEach(({ id, bg, text }) => {
            if (id === this.activeTab) {
                bg.setFillStyle(PALETTE.verdePrincipal, 1);
                bg.setStrokeStyle(2, PALETTE.marronOscuro);
                text.setColor(PALETTE.cremaHex);
            } else {
                bg.setFillStyle(PALETTE.crema, 1);
                bg.setStrokeStyle(2, PALETTE.marronClaro);
                text.setColor(PALETTE.marronOscuroHex);
            }
        });
    }

    private rebuildFoodList() {
        // Limpiar contenido previo (sin tocar los placed)
        this.foodListContainer.removeAll(true);
        this.foodListContainer.y = this.sidebarViewportY;

        const items = FOODS.filter((f) => f.grupo === this.activeTab);
        const innerW = this.sidebarW - 54;
        const colW = (innerW - ITEM_GAP_X) / ITEM_COLS;

        items.forEach((cfg, i) => {
            const col = i % ITEM_COLS;
            const row = Math.floor(i / ITEM_COLS);
            const lx = col * (colW + ITEM_GAP_X) + colW / 2 + 4;
            const ly = row * ITEM_ROW_H + ITEM_SIZE / 2 + 8;

            // Tarjeta de fondo
            const card = this.add.rectangle(lx, ly + 10, colW, ITEM_SIZE + 40, PALETTE.crema, 1)
                .setStrokeStyle(2, PALETTE.marronClaro);
            void card;

            if (!this.textures.exists(cfg.key)) return;

            const img = this.add.image(lx, ly, cfg.key) as DraggableFood;
            img.setDisplaySize(ITEM_SIZE - 24, ITEM_SIZE - 24);
            img.grupo = cfg.grupo;
            img.label = cfg.label;
            img.localHomeX = lx;
            img.localHomeY = ly;
            img.fromBar = true;
            img.placed = false;
            img.setInteractive({ useHandCursor: true });
            this.input.setDraggable(img);

            const lbl = this.add.text(lx, ly + ITEM_SIZE / 2 + 8, cfg.label, {
                fontFamily: SCENE_FONT,
                fontSize: '16px',
                color: PALETTE.marronOscuroHex,
                fontStyle: 'bold',
            }).setOrigin(0.5, 0);
            img.labelText = lbl;

            img.on('pointerover', () => {
                if (img.placed) return;
                this.tweens.add({ targets: img, scale: img.scale * 1.08, duration: 110 });
            });
            img.on('pointerout', () => {
                if (img.placed) return;
                this.tweens.killTweensOf(img);
                img.setScale(1);
                img.setDisplaySize(ITEM_SIZE - 24, ITEM_SIZE - 24);
            });

            this.foodListContainer.add([card, img, lbl]);
        });

        // Calcular límites de scroll
        const rows = Math.ceil(items.length / ITEM_COLS);
        const contentH = rows * ITEM_ROW_H + 16;
        this.minScrollY = this.sidebarViewportY;
        this.maxScrollY = this.sidebarViewportY - Math.max(0, contentH - this.sidebarViewportH);
    }

    private scrollList(delta: number) {
        if (!this.foodListContainer) return;
        const newY = Phaser.Math.Clamp(this.foodListContainer.y + delta, this.maxScrollY, this.minScrollY);
        if (newY === this.foodListContainer.y) return;
        this.tweens.add({
            targets: this.foodListContainer,
            y: newY,
            duration: 220,
            ease: 'Cubic.easeOut',
        });
    }

    // ─── PLATO PRINCIPAL ─────────────────────────────────────────────────────
    private buildPlato() {
        const cx = this.platoCenterX;
        const cy = this.platoCenterY;
        const radius = this.platoRadius;
        this.platoCenterX = cx;
        this.platoCenterY = cy;
        this.platoRadius = radius;

        // Sombra
        this.add.circle(cx + 6, cy + 8, radius + 16, PALETTE.marronOscuro, 0.18);

        // Aro exterior
        this.add.circle(cx, cy, radius + 16, PALETTE.verdePrincipal, 0.15)
            .setStrokeStyle(3, PALETTE.verdePrincipal, 0.5);

        // Plato (relleno crema)
        this.add.circle(cx, cy, radius, 0xffffff, 1)
            .setStrokeStyle(4, PALETTE.marronClaro);

        // Líneas guía de las 3 secciones (visual del Plato del Buen Comer)
        const g = this.add.graphics();
        g.lineStyle(2, PALETTE.marronClaro, 0.35);
        // división vertical (mitad izq = verduras y frutas)
        g.beginPath();
        g.moveTo(cx, cy - radius);
        g.lineTo(cx, cy + radius);
        g.strokePath();
        // división horizontal en la mitad derecha (cereales arriba, leguminosas abajo)
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + radius, cy);
        g.strokePath();

        // Etiquetas tenues de cada sección
        const labelStyle = {
            fontFamily: SCENE_FONT,
            fontSize: '18px',
            color: PALETTE.marronClaroHex,
        };
        this.add.text(cx - radius / 2, cy - radius - 18, 'Verduras y Frutas', labelStyle).setOrigin(0.5);
        this.add.text(cx + radius / 2, cy - radius - 18, 'Cereales', labelStyle).setOrigin(0.5);
        this.add.text(cx + radius / 2, cy + radius + 8, 'Leguminosas / A.O.A.', labelStyle).setOrigin(0.5);

        // Pivot central decorativo
        this.add.circle(cx, cy, 8, PALETTE.marronClaro, 0.35);

        // Dropzone circular (lo modelamos como rectángulo, la validación de adentro la hace el círculo)
        this.platoDropZone = this.add.zone(cx, cy, radius * 2, radius * 2)
            .setRectangleDropZone(radius * 2, radius * 2);
        this.platoDropZone.setData('isPlato', true);
    }

    // ─── BOTÓN EVALUAR ───────────────────────────────────────────────────────
    private buildEvaluateButton() {
        const cx = this.platoCenterX;
        const cy = Math.min(this.safeArea.bottom - 52, this.platoCenterY + this.platoRadius + 82);

        const btnBg = this.add.rectangle(cx, cy, 320, 70, PALETTE.verdePrincipal, 1)
            .setStrokeStyle(4, PALETTE.marronOscuro)
            .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(cx, cy, 'Evaluar plato', {
            fontFamily: SCENE_FONT,
            fontSize: '28px',
            color: PALETTE.cremaHex,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(PALETTE.terracota, 1);
            this.tweens.add({ targets: [btnBg, btnText], scale: 1.04, duration: 120 });
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(PALETTE.verdePrincipal, 1);
            this.tweens.add({ targets: [btnBg, btnText], scale: 1, duration: 120 });
        });
        btnBg.on('pointerdown', () => {
            try { this.sound.play('pb_click'); } catch { void 0; }
            this.evaluatePlate();
        });
    }

    // ─── PANEL DE FEEDBACK ───────────────────────────────────────────────────
    private buildFeedbackPanel() {
        const panelW = this.contentW;
        const panelH = 126;
        const cx = this.contentX + panelW / 2;
        const cy = Math.min(
            this.safeArea.bottom - panelH / 2 - 24,
            this.safeArea.top + 612,
        );

        this.add.rectangle(cx, cy, panelW, panelH, PALETTE.crema, 1)
            .setStrokeStyle(3, PALETTE.marronClaro);

        this.feedbackText = this.add.text(cx, cy, 'Arma tu plato y presiona “Evaluar plato” para ver qué tal te quedó.', {
            fontFamily: SCENE_FONT,
            fontSize: '19px',
            color: PALETTE.marronClaroHex,
            align: 'center',
            lineSpacing: 3,
            wordWrap: { width: panelW - 36 },
        }).setOrigin(0.5);
    }

    // ─── DRAG & DROP ─────────────────────────────────────────────────────────
    private setupDragEvents() {
        this.input.on('dragstart', (ptr: Phaser.Input.Pointer, obj: DraggableFood) => {
            if (obj.placed) return;
            if (obj.fromBar) {
                this.foodListContainer.remove(obj, false);
                if (obj.labelText) {
                    this.foodListContainer.remove(obj.labelText, false);
                    obj.labelText.setVisible(false);
                }
                this.add.existing(obj);
                obj.clearMask();
                obj.setDepth(50);
            }
            obj.x = ptr.worldX;
            obj.y = ptr.worldY;
            obj.setAlpha(0.9);
        });

        this.input.on('drag', (ptr: Phaser.Input.Pointer, obj: DraggableFood) => {
            if (obj.placed) return;
            obj.x = ptr.worldX;
            obj.y = ptr.worldY;
        });

        this.input.on('drop', (ptr: Phaser.Input.Pointer, obj: DraggableFood, zone: Phaser.GameObjects.Zone) => {
            if (obj.placed) return;
            if (!zone.getData('isPlato')) {
                this.returnToBar(obj);
                return;
            }

            // Validar que el punto cae dentro del círculo
            const dx = ptr.worldX - this.platoCenterX;
            const dy = ptr.worldY - this.platoCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.platoRadius - 10) {
                this.returnToBar(obj);
                return;
            }

            // Aceptar
            obj.x = ptr.worldX;
            obj.y = ptr.worldY;
            obj.placed = true;
            obj.setAlpha(1);
            obj.setDepth(8);
            obj.disableInteractive();
            this.placedFoods.push(obj);
            this.placedCounts[obj.grupo]++;

            try { this.sound.play('pb_correct'); } catch { void 0; }

            this.updateProgressLive();
        });

        this.input.on('dragend', (_ptr: Phaser.Input.Pointer, obj: DraggableFood, dropped: boolean) => {
            if (obj.placed) return;
            if (!dropped) this.returnToBar(obj);
        });
    }

    private returnToBar(obj: DraggableFood) {
        const targetWorldX = this.sidebarX + 18 + obj.localHomeX;
        const targetWorldY = this.foodListContainer.y + obj.localHomeY;

        this.tweens.add({
            targets: obj,
            x: targetWorldX,
            y: targetWorldY,
            duration: 280,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.children.remove(obj);
                obj.x = obj.localHomeX;
                obj.y = obj.localHomeY;
                obj.setAlpha(1);
                obj.setDepth(5);
                obj.setDisplaySize(ITEM_SIZE - 24, ITEM_SIZE - 24);
                this.foodListContainer.add(obj);
                if (obj.labelText) {
                    obj.labelText.setVisible(true);
                    this.foodListContainer.add(obj.labelText);
                }
                const mask = this.sidebarMaskGfx.createGeometryMask();
                obj.setMask(mask);
            },
        });
    }

    // ─── EVALUACIÓN ──────────────────────────────────────────────────────────
    private updateProgressLive() {
        const total = this.placedFoods.length;
        if (total === 0) {
            this.progressText.setText('¡Arrastra los alimentos al plato para comenzar!');
        } else {
            this.progressText.setText(`Llevas ${total} alimento${total === 1 ? '' : 's'} en el plato. Cuando termines, presiona “Evaluar plato”.`);
        }

        (Object.keys(this.placedCounts) as Grupo[]).forEach((g) => {
            const pct = total === 0 ? 0 : Math.round((this.placedCounts[g] / total) * 100);
            this.barPercents[g].setText(`${pct}%`);
            this.tweens.add({
                targets: this.barFills[g],
                width: (pct / 100) * this.proportionBarW,
                duration: 240,
                ease: 'Cubic.easeOut',
            });
        });
    }

    private evaluatePlate() {
        const total = this.placedFoods.length;
        if (total === 0) {
            this.feedbackText.setColor(PALETTE.terracotaHex)
                .setText('Tu plato está vacío. Arrastra alimentos antes de evaluar.');
            return;
        }

        // Calcular desviaciones contra el ideal
        const realPct: Record<Grupo, number> = {
            verduras_frutas: (this.placedCounts.verduras_frutas / total) * 100,
            cereal: (this.placedCounts.cereal / total) * 100,
            leguminosa_aoa: (this.placedCounts.leguminosa_aoa / total) * 100,
        };

        let desviacion = 0;
        (Object.keys(IDEAL) as Grupo[]).forEach((g) => {
            desviacion += Math.abs(IDEAL[g] - realPct[g]);
        });

        // Score base: 100 - desviación / 2 (la desviación máx es ~150)
        let score = Math.max(0, Math.round(100 - desviacion / 1.5));
        // Bonus si los 3 grupos están presentes
        const gruposPresentes = (Object.keys(this.placedCounts) as Grupo[])
            .filter((g) => this.placedCounts[g] > 0).length;
        if (gruposPresentes === 3) score = Math.min(100, score + 10);
        else if (gruposPresentes === 1) score = Math.max(0, score - 15);

        this.scoreText.setText(`★ ${score}`);

        // Construir feedback textual
        const faltantes: string[] = [];
        const excesos: string[] = [];
        const nombres: Record<Grupo, string> = {
            verduras_frutas: 'verduras y frutas',
            cereal: 'cereales',
            leguminosa_aoa: 'leguminosas o de origen animal',
        };

        (Object.keys(IDEAL) as Grupo[]).forEach((g) => {
            const diff = realPct[g] - IDEAL[g];
            if (this.placedCounts[g] === 0) {
                faltantes.push(nombres[g]);
            } else if (diff < -12) {
                faltantes.push(nombres[g]);
            } else if (diff > 12) {
                excesos.push(nombres[g]);
            }
        });

        let msg = '';
        let color = PALETTE.verdePrincipalHex;
        if (faltantes.length === 0 && excesos.length === 0) {
            msg = `¡Plato equilibrado! Score ${score}/100. Excelente combinación de grupos.`;
            color = PALETTE.verdePrincipalHex;
        } else {
            const partes: string[] = [];
            if (faltantes.length) partes.push(`te faltan ${faltantes.join(', ')}`);
            if (excesos.length) partes.push(`tienes demasiados ${excesos.join(', ')}`);
            msg = `Score ${score}/100 - ${partes.join(' y ')}.`;
            color = score >= 70 ? PALETTE.verdePrincipalHex : PALETTE.terracotaHex;
        }

        this.feedbackText.setColor(color).setText(msg);

        // Colorear barras: verde si dentro de ±10% del ideal, terracota si fuera
        (Object.keys(IDEAL) as Grupo[]).forEach((g) => {
            const diff = Math.abs(realPct[g] - IDEAL[g]);
            const okColor = diff <= 10
                ? Phaser.Display.Color.HexStringToColor(PALETTE.verdePrincipalHex).color
                : Phaser.Display.Color.HexStringToColor(PALETTE.terracotaHex).color;
            this.barFills[g].setFillStyle(okColor, 1);
        });

        try { this.sound.play(score >= 70 ? 'pb_correct' : 'pb_error'); } catch { void 0; }
    }
}
