import * as Phaser from 'phaser';
import { PlayerService } from '../../services/PlayerService';
import type { Jugador } from '../../types/player-types';
import { createDebugSkipButton } from '../systems/DebugSkipButton';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { FONT_DISPLAY, FONT_MONO } from '../../config/gameFonts';
import { nutritionalInfo } from '../../data/nutritionalInfo';
import type { FoodItem } from '../../data/nutritionalInfo';

// ─── Paleta (alineada con el estilo global del juego) ────────────────────────
const P = {
    bg:           0xf2eadb,
    bgHex:        '#F2EADB',
    paper:        0xfffbf0,
    paperHex:     '#FFFBF0',
    paperAlt:     0xfff7e8,
    ink:          0x2e3142,
    inkHex:       '#2E3142',
    muted:        0x6b6f7f,
    mutedHex:     '#6B6F7F',
    grayDark:     0x77736d,
    grayDarkHex:  '#77736D',
    green:        0x77d39d,
    greenHex:     '#77D39D',
    route:        0x75c995,
    routeHex:     '#75C995',
    yellow:       0xffcf55,
    yellowHex:    '#FFCF55',
    coral:        0xff907f,
    coralHex:     '#FF907F',
    legume:       0xe7a59b,
    lumeHex:      '#E7A59B',
    cereal:       0xf7ce63,
    cerealHex:    '#F7CE63',
    animal:       0xf4a36f,
    animalHex:    '#F4A36F',
    white:        0xffffff,
    whiteHex:     '#FFFFFF',
};

const SFT = FONT_DISPLAY;
const MFT = FONT_MONO;

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Grupo = 'verduras_frutas' | 'cereal' | 'leguminosa_aoa';

function mapToGrupo(item: FoodItem): Grupo {
    if (item.officialGroup === 'verduras_frutas') return 'verduras_frutas';
    if (item.officialGroup === 'cereales')         return 'cereal';
    return 'leguminosa_aoa';
}

interface NutritionTotals {
    calories: number; protein: number; carbs: number; fat: number;
    fiber:    number; sugar:   number; sodium: number; scoreSum: number;
}

interface DraggableFood extends Phaser.GameObjects.Image {
    grupo:      Grupo;
    foodItem:   FoodItem;
    localHomeX: number;
    localHomeY: number;
    fromBar:    boolean;
    placed:     boolean;
    labelText?: Phaser.GameObjects.Text;
}

interface SafeArea {
    left: number; right: number; top: number; bottom: number;
    width: number; height: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = [
    { id: 'verduras_frutas' as Grupo, label: 'Verduras y Frutas' },
    { id: 'cereal'          as Grupo, label: 'Cereales'           },
    { id: 'leguminosa_aoa'  as Grupo, label: 'Leguminosas / AOA'  },
];

const IDEAL: Record<Grupo, number>    = { verduras_frutas: 50, cereal: 25, leguminosa_aoa: 25 };
const GRUPO_COLOR: Record<Grupo, number>  = { verduras_frutas: P.green,  cereal: P.cereal,    leguminosa_aoa: P.animal  };
const GRUPO_COLOR_HEX: Record<Grupo, string> = { verduras_frutas: P.greenHex, cereal: P.cerealHex, leguminosa_aoa: P.animalHex };

const ITEM_SIZE   = 68;
const ITEM_COLS   = 2;
const ITEM_GAP_X  = 14;
const CARD_H      = 120;
const IMG_SZ_BAR  = 48;
const ITEM_ROW_H  = CARD_H + 12;    // 132
// SCROLL_STEP eliminado por estar sin uso
const TAB_H       = 50;
const TAB_GAP     = 6;

// ─── Escena ───────────────────────────────────────────────────────────────────
export class PlatoBalanceadoScene extends Phaser.Scene {

    // Estado de juego
    private activeTab:    Grupo = 'verduras_frutas';
    private placedCounts: Record<Grupo, number> = { verduras_frutas: 0, cereal: 0, leguminosa_aoa: 0 };
    private placedFoods:  DraggableFood[] = [];
    private nutritionTotals: NutritionTotals = {
        calories: 0, protein: 0, carbs: 0, fat: 0,
        fiber: 0, sugar: 0, sodium: 0, scoreSum: 0,
    };
    private jugadorActivo: Jugador | null = null;
    private tmb: number = 2000;
    private tipoComida: 'desayuno' | 'comida' | 'cena' = 'comida';

    // Layout
    private safeArea: SafeArea = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
    private sidebarX  = 0;
    private sidebarW  = 0;
    private sidebarTop    = 0;
    private sidebarBottom = 0;
    private statsX    = 0;
    private statsW    = 0;
    private statsTop  = 0;
    private proportionBarW = 0;

    // Plato
    private platoCenterX = 0;
    private platoCenterY = 0;
    private platoSize    = 0;
    private platoDropZone!: Phaser.GameObjects.Zone;

    // Sidebar scroll (camera-based — no Container/GeometryMask)
    private sidebarViewportY  = 0;
    private sidebarViewportH  = 0;
    private listCam!:         Phaser.Cameras.Scene2D.Camera;
    private listBaseScrollX   = 0;
    private listScrollY       = 0;
    private listMaxScrollY    = 0;
    private listAllItems:     Phaser.GameObjects.GameObject[] = [];

    // UI dinámica
    private progressText!:  Phaser.GameObjects.Text;
    private nutritionText!: Phaser.GameObjects.Text;
    private scoreText!:     Phaser.GameObjects.Text;
    private barFills:    Record<Grupo, Phaser.GameObjects.Rectangle> = {} as never;
    private barPercents: Record<Grupo, Phaser.GameObjects.Text>      = {} as never;
    private feedbackText!: Phaser.GameObjects.Text;
    private feedbackBg!:   Phaser.GameObjects.Rectangle;
    private tabButtons: { id: Grupo; bg: Phaser.GameObjects.Rectangle; lbl: Phaser.GameObjects.Text }[] = [];

    constructor() { super('PlatoBalanceadoScene'); }

    // ─── PRELOAD ─────────────────────────────────────────────────────────────
    preload() {
        nutritionalInfo.forEach(food => this.load.image(food.id, food.image));
        this.load.image('pb_plate', '/assets/Plato/plateSquare.webp');
        this.load.image('pb_bg', '/assets/Backgrounds/Fondo_Cocina.png');
        this.load.audio('pb_click',   '/Sound/Click.mp3');
        this.load.audio('pb_correct', '/Sound/ObjectWIN.mp3');
        this.load.audio('pb_error',   '/Sound/incorrecto.mp3');
        PrefabButtons.precargar(this);
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────
    create() {
        this.jugadorActivo = PlayerService.obtenerJugadorActivo();
        if (this.jugadorActivo) {
            const da = this.jugadorActivo.datosAntropometricos;
            let basal = (10 * da.pesoKg) + (6.25 * da.estaturaCm) - (5 * da.edad);
            basal += (da.sexo === 'masculino') ? 5 : -161;
            this.tmb = Math.round(basal * 1.2);
        }

        const { width, height } = this.scale;
        this.resetState();
        this.setupLayout(width, height);

        this.buildBackground(width, height);
        this.buildHeader();
        this.buildSidebar();
        this.buildPlatZone();
        this.buildStatsPanel();
        this.buildEvaluateButton();
        this.setupDragEvents();

        createDebugSkipButton(this, {
            label: '← Mapa',
            nextScene: 'LevelSelectScene',
            soundKey: 'pb_click',
            x: this.safeArea.left + 8,
            y: this.safeArea.top - 64,
        });

        // CRT overlay cosmético
        this.ensureCrtTexture();
        this.add.tileSprite(width / 2, height / 2, width, height, 'pb_crt')
            .setAlpha(0.18).setDepth(998);

        // Hide all non-list objects from listCam (so they don't render twice in the viewport)
        const listItemSet = new Set(this.listAllItems);
        const listCamId   = this.listCam.id;
        this.children.getAll().forEach(child => {
            if (!listItemSet.has(child as Phaser.GameObjects.GameObject)) {
                (child as Phaser.GameObjects.GameObject).cameraFilter = listCamId;
            }
        });
    }

    // ─── ESTADO ──────────────────────────────────────────────────────────────
    private resetState() {
        this.activeTab    = 'verduras_frutas';
        this.placedCounts = { verduras_frutas: 0, cereal: 0, leguminosa_aoa: 0 };
        this.placedFoods  = [];
        this.tabButtons   = [];
        this.nutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, scoreSum: 0 };
    }

    // ─── LAYOUT ──────────────────────────────────────────────────────────────
    private setupLayout(width: number, height: number) {
        const safe = this.getSafeArea(width, height);
        this.safeArea = safe;

        const gutter = 20;

        // Sidebar izquierdo (selección de alimentos)
        this.sidebarW   = Math.round(Phaser.Math.Clamp(safe.width * 0.195, 310, 350));
        this.sidebarX   = safe.left;
        this.sidebarTop    = safe.top + 100;
        this.sidebarBottom = safe.bottom - 16;

        // Panel de stats (derecho)
        this.statsW = Math.round(Phaser.Math.Clamp(safe.width * 0.215, 340, 390));
        this.statsX = safe.right - this.statsW;
        this.statsTop = safe.top + 100;
        this.proportionBarW = this.statsW - 52;

        // Plato (centro)
        const plateAreaL = this.sidebarX + this.sidebarW + gutter;
        const plateAreaR = this.statsX - gutter;
        const plateAreaW = plateAreaR - plateAreaL;
        const plateAreaH = safe.height - 100 - 80; // minus header and eval btn row
        const rawSize    = Math.min(plateAreaW * 0.84, plateAreaH * 0.82, 590);
        this.platoSize   = Math.round(rawSize);
        this.platoCenterX = Math.round((plateAreaL + plateAreaR) / 2);
        this.platoCenterY = Math.round(safe.top + 100 + plateAreaH * 0.47);
    }

    private getSafeArea(width: number, height: number): SafeArea {
        const vW = typeof window === 'undefined' ? width  : window.innerWidth;
        const vH = typeof window === 'undefined' ? height : window.innerHeight;
        const vAspect = vW / vH;
        const gAspect = width / height;
        let visW = width, visH = height, left = 0, top = 0;
        if (vAspect < gAspect) { visW = height * vAspect; left = (width - visW) / 2; }
        else if (vAspect > gAspect) { visH = width / vAspect; top = (height - visH) / 2; }
        const pad = 72;
        return {
            left: left + pad, right: left + visW - pad, top: top + pad, bottom: top + visH - pad,
            width: Math.max(0, visW - pad * 2), height: Math.max(0, visH - pad * 2),
        };
    }

    // ─── FONDO ───────────────────────────────────────────────────────────────
    private buildBackground(width: number, height: number) {
        this.add.image(width / 2, height / 2, 'pb_bg').setDisplaySize(width, height).setDepth(0);
        this.add.rectangle(width / 2, height / 2, width, height, P.white, 0.7).setDepth(1);
        
        // Dot tile sutil
        this.ensureDotTexture();
        this.add.tileSprite(width / 2, height / 2, width, height, 'pb_dot').setAlpha(0.65).setDepth(1);
    }

    private ensureDotTexture() {
        if (this.textures.exists('pb_dot')) return;
        const cvs = document.createElement('canvas');
        cvs.width = 28; cvs.height = 28;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = 'rgba(46,49,66,0.055)';
        ctx.fillRect(13, 13, 2, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(0, 0, 28, 1);
        ctx.fillRect(0, 0, 1, 28);
        this.textures.addCanvas('pb_dot', cvs);
    }

    private ensureCrtTexture() {
        if (this.textures.exists('pb_crt')) return;
        const cvs = document.createElement('canvas');
        cvs.width = 4; cvs.height = 4;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = 'rgba(46,49,66,0.05)';
        ctx.fillRect(0, 0, 4, 1);
        this.textures.addCanvas('pb_crt', cvs);
    }

    // ─── HEADER ──────────────────────────────────────────────────────────────
    private buildHeader() {
        const safe = this.safeArea;
        const cx   = safe.left + safe.width / 2;
        const cy   = safe.top + 46;
        const w    = safe.width;

        // Sombra del panel
        this.add.rectangle(cx + 8, cy + 8, w, 84, P.ink, 1).setDepth(4);
        // Panel principal
        this.add.rectangle(cx, cy, w, 84, P.paper, 1)
            .setStrokeStyle(4, P.ink).setDepth(5);

        // Badge izquierdo
        const badgeX = safe.left + 52;
        this.add.rectangle(badgeX + 4, cy + 4, 70, 44, P.ink, 1).setDepth(5);
        this.add.rectangle(badgeX, cy, 70, 44, P.green, 1)
            .setStrokeStyle(3, P.ink).setDepth(6);
        this.add.text(badgeX, cy, 'PB', {
            fontFamily: SFT, fontSize: '28px', fontStyle: 'bold', color: P.inkHex,
        }).setOrigin(0.5).setDepth(7);

        // Título
        this.add.text(badgeX + 48, cy - 14, 'Mi Plato Balanceado', {
            fontFamily: SFT, fontSize: '32px', fontStyle: 'bold', color: P.inkHex,
        }).setOrigin(0, 0.5).setDepth(7);
        
        // Botones de Tipo de Comida
        const btnY = cy + 16;
        const tipos = [
            { id: 'desayuno', label: 'Desayuno' },
            { id: 'comida', label: 'Comida' },
            { id: 'cena', label: 'Cena' }
        ];
        
        let curX = badgeX + 48;
        tipos.forEach(t => {
            const isSelected = this.tipoComida === t.id;
            
            PrefabButtons.secundario(this, curX + 55, btnY, () => {
                if (this.tipoComida === t.id) return;
                this.tipoComida = t.id as any;
                try { this.sound.play('pb_click'); } catch {}
                this.scene.restart();
            }, {
                text: t.label,
                width: 110,
                height: 38,
                fontSize: '18px',
                textColor: isSelected ? '#77D39D' : '#2E3142',
                depth: 8
            });
            
            curX += 118;
        });

        // Score (derecha)
        const scoreX = safe.right - 130;
        this.add.rectangle(scoreX + 4, cy + 4, 190, 60, P.ink, 1).setDepth(5);
        this.add.rectangle(scoreX, cy, 190, 60, P.paperAlt, 1)
            .setStrokeStyle(3, P.ink).setDepth(6);
        this.add.text(scoreX, cy - 14, 'PUNTAJE', {
            fontFamily: MFT, fontSize: '18px', color: P.mutedHex,
        }).setOrigin(0.5, 0.5).setDepth(7);
        this.scoreText = this.add.text(scoreX, cy + 12, '★  0', {
            fontFamily: SFT, fontSize: '26px', fontStyle: 'bold', color: P.coralHex,
        }).setOrigin(0.5, 0.5).setDepth(7);

        // Botón reset
        const rstX = safe.right - 30;
        const rstBg = this.add.rectangle(rstX + 3, cy + 3, 44, 44, P.ink, 1).setDepth(5);
        void rstBg;
        const rstBtn = this.add.rectangle(rstX, cy, 44, 44, P.paperAlt, 1)
            .setStrokeStyle(3, P.ink).setInteractive({ useHandCursor: true }).setDepth(6);
        const rstIcon = this.add.text(rstX, cy, '↺', {
            fontFamily: SFT, fontSize: '28px', color: P.inkHex,
        }).setOrigin(0.5).setDepth(7);
        void rstIcon;
        rstBtn.on('pointerover',  () => rstBtn.setFillStyle(P.green));
        rstBtn.on('pointerout',   () => rstBtn.setFillStyle(P.paperAlt));
        rstBtn.on('pointerdown',  () => { try { this.sound.play('pb_click'); } catch { void 0; } this.scene.restart(); });
    }

    // ─── SIDEBAR ─────────────────────────────────────────────────────────────
    private buildSidebar() {
        const sx   = this.sidebarX;
        const sw   = this.sidebarW;
        const st   = this.sidebarTop;
        const sb   = this.sidebarBottom;
        const totalH = sb - st;

        // Panel shadow + bg
        this.add.rectangle(sx + sw / 2 + 8, st + totalH / 2 + 8, sw, totalH, P.ink, 1).setDepth(4);
        this.add.rectangle(sx + sw / 2, st + totalH / 2, sw, totalH, P.paper, 1)
            .setStrokeStyle(4, P.ink).setDepth(5);

        // Título sidebar
        const titleBg = this.add.rectangle(sx + sw / 2, st + 28, sw, 48, P.ink, 1).setDepth(6);
        void titleBg;
        this.add.text(sx + sw / 2, st + 28, '¡ ARRASTRA COMIDA !', {
            fontFamily: MFT, fontSize: '24px', color: P.greenHex,
        }).setOrigin(0.5).setDepth(7);

        // Tabs
        const tabsTop = st + 62;
        const tabW    = (sw - 24 - (TABS.length - 1) * TAB_GAP) / TABS.length;
        TABS.forEach((tab, i) => {
            const tx = sx + 12 + i * (tabW + TAB_GAP) + tabW / 2;
            const ty = tabsTop + TAB_H / 2;

            const shadow = this.add.rectangle(tx + 4, ty + 4, tabW, TAB_H, P.ink, 1).setDepth(6);
            void shadow;
            const bg = this.add.rectangle(tx, ty, tabW, TAB_H, P.paperAlt, 1)
                .setStrokeStyle(3, P.ink).setInteractive({ useHandCursor: true }).setDepth(7);
            const lbl = this.add.text(tx, ty, tab.label, {
                fontFamily: MFT, fontSize: '18px', color: P.inkHex, align: 'center',
                wordWrap: { width: tabW - 8 },
            }).setOrigin(0.5).setDepth(8);

            bg.on('pointerover', () => { if (this.activeTab !== tab.id) bg.setFillStyle(P.green, 0.35); });
            bg.on('pointerout',  () => this.refreshTabStyles());
            bg.on('pointerdown', () => {
                if (this.activeTab === tab.id) return;
                try { this.sound.play('pb_click'); } catch { void 0; }
                this.activeTab = tab.id;
                this.refreshTabStyles();
                this.rebuildFoodList();
            });
            this.tabButtons.push({ id: tab.id, bg, lbl });
        });

        // Zona de lista
        const listTop    = tabsTop + TAB_H + 10;
        const listBottom = sb - 12;
        this.sidebarViewportY = listTop;
        this.sidebarViewportH = listBottom - listTop;

        this.add.rectangle(
            sx + sw / 2, listTop + this.sidebarViewportH / 2,
            sw - 20, this.sidebarViewportH, P.paperAlt, 0.6,
        ).setStrokeStyle(1, P.ink, 0.2).setDepth(5);

        // Dedicated camera: viewport = list area, transparent bg (main cam renders panel behind)
        this.listCam = this.cameras.add(
            Math.round(sx + 10), Math.round(listTop),
            Math.round(sw - 20), Math.round(this.sidebarViewportH),
            false, 'listCam',
        );
        this.listBaseScrollX = sx + 10;
        this.listCam.setScroll(this.listBaseScrollX, listTop);

        this.input.on('wheel', (
            _ptr: Phaser.Input.Pointer,
            _over: Phaser.GameObjects.GameObject[],
            _dx: number, dy: number,
        ) => {
            const ptr = this.input.activePointer;
            if (ptr.x >= sx && ptr.x <= sx + sw && ptr.y >= this.sidebarViewportY && ptr.y <= this.sidebarViewportY + this.sidebarViewportH) {
                this.scrollList(dy);
            }
        });

        this.refreshTabStyles();
        this.rebuildFoodList();
    }

    private refreshTabStyles() {
        this.tabButtons.forEach(({ id, bg, lbl }) => {
            if (id === this.activeTab) {
                bg.setFillStyle(P.green, 1);
                bg.setStrokeStyle(3, P.ink);
                lbl.setColor(P.inkHex);
            } else {
                bg.setFillStyle(P.paperAlt, 1);
                bg.setStrokeStyle(3, P.ink);
                lbl.setColor(P.mutedHex);
            }
        });
    }

    private rebuildFoodList() {
        // Destroy previous items
        this.listAllItems.forEach(item => item.destroy());
        this.listAllItems = [];

        // Reset scroll
        this.listScrollY = 0;
        this.listCam.setScroll(this.listBaseScrollX, this.sidebarViewportY);

        const items  = nutritionalInfo.filter(f => mapToGrupo(f) === this.activeTab);
        const innerW = this.sidebarW - 42;
        const colW   = (innerW - ITEM_GAP_X) / ITEM_COLS;
        const ox     = this.sidebarX + 14;        // world X origin of list
        const oy     = this.sidebarViewportY;     // world Y origin of list
        const MAIN_ID = this.cameras.main.id;

        items.forEach((foodItem, i) => {
            if (!this.textures.exists(foodItem.id)) return;
            const col  = i % ITEM_COLS;
            const row  = Math.floor(i / ITEM_COLS);
            // local offsets (same as before)
            const lx   = col * (colW + ITEM_GAP_X) + colW / 2 + 2;
            const ly   = row * ITEM_ROW_H + CARD_H / 2 + 6;
            const lImgY = ly - CARD_H / 2 + 8 + IMG_SZ_BAR / 2;
            const lLblY = ly - CARD_H / 2 + 8 + IMG_SZ_BAR + 6;
            // world positions
            const wx    = ox + lx;
            const wy    = oy + ly;
            const wImgY = oy + lImgY;
            const wLblY = oy + lLblY;

            const cardShadow = this.add.rectangle(wx + 4, wy + 4, colW, CARD_H, P.ink, 1).setDepth(9);
            const card = this.add.rectangle(wx, wy, colW, CARD_H, P.paper, 1)
                .setStrokeStyle(3, P.ink).setDepth(9);

            const img = this.add.image(wx, wImgY, foodItem.id) as DraggableFood;
            img.setDisplaySize(IMG_SZ_BAR, IMG_SZ_BAR).setDepth(10);
            img.grupo      = mapToGrupo(foodItem);
            img.foodItem   = foodItem;
            img.localHomeX = wx;
            img.localHomeY = wImgY;
            img.fromBar    = true;
            img.placed     = false;
            img.setInteractive({ useHandCursor: true });
            this.input.setDraggable(img);

            const lbl = this.add.text(wx, wLblY, foodItem.nameES, {
                fontFamily: MFT, fontSize: '16px', color: P.inkHex,
                align: 'center', wordWrap: { width: colW - 12 },
            }).setOrigin(0.5, 0).setDepth(10);
            img.labelText = lbl;

            // Hide from main camera — only visible through listCam viewport
            cardShadow.cameraFilter = MAIN_ID;
            card.cameraFilter       = MAIN_ID;
            img.cameraFilter        = MAIN_ID;
            lbl.cameraFilter        = MAIN_ID;

            // Hover: absolute targets — no Y drift if interrupted
            img.on('pointerover', () => {
                if (img.placed) return;
                this.tweens.killTweensOf([img, card, lbl]);
                this.tweens.add({ targets: img,  y: wImgY - 4, duration: 100 });
                this.tweens.add({ targets: card, y: wy    - 4, duration: 100 });
                this.tweens.add({ targets: lbl,  y: wLblY - 4, duration: 100 });
            });
            img.on('pointerout', () => {
                if (img.placed) return;
                this.tweens.killTweensOf([img, card, lbl]);
                this.tweens.add({ targets: img,  y: wImgY, duration: 100 });
                this.tweens.add({ targets: card, y: wy,    duration: 100 });
                this.tweens.add({ targets: lbl,  y: wLblY, duration: 100 });
            });

            this.listAllItems.push(cardShadow, card, img, lbl);
        });

        const rows     = Math.ceil(items.length / ITEM_COLS);
        const contentH = rows * ITEM_ROW_H + 20;
        this.listMaxScrollY = Math.max(0, contentH - this.sidebarViewportH);
    }

    private scrollList(delta: number) {
        const newScrollY = Phaser.Math.Clamp(this.listScrollY + delta, 0, this.listMaxScrollY);
        if (newScrollY === this.listScrollY) return;
        this.listScrollY = newScrollY;
        this.tweens.killTweensOf(this.listCam);
        this.tweens.add({
            targets:  this.listCam,
            scrollY:  this.sidebarViewportY + newScrollY,
            duration: 200,
            ease:     'Cubic.easeOut',
        });
    }

    // ─── PLATO ───────────────────────────────────────────────────────────────
    private buildPlatZone() {
        const cx   = this.platoCenterX;
        const cy   = this.platoCenterY;
        const size = this.platoSize;
        const pad  = 24;

        // Shadow exterior
        this.add.rectangle(cx + 10, cy + 12, size + pad + 10, size + pad + 10, P.ink, 0.30).setDepth(4);

        // Marco del plato (fondo de madera)
        this.add.rectangle(cx, cy, size + pad, size + pad, P.paper, 1)
            .setStrokeStyle(6, P.ink).setDepth(5);

        // Imagen real del plato
        this.add.image(cx, cy, 'pb_plate')
            .setDisplaySize(size, size)
            .setDepth(6);

        // Etiqueta "TU PLATO" encima
        this.add.rectangle(cx + 4, cy - size / 2 - 34 + 4, 180, 38, P.ink, 1).setDepth(6);
        this.add.rectangle(cx, cy - size / 2 - 34, 180, 38, P.green, 1)
            .setStrokeStyle(3, P.ink).setDepth(7);
        this.add.text(cx, cy - size / 2 - 34, 'TU PLATO', {
            fontFamily: SFT, fontSize: '22px', fontStyle: 'bold', color: P.inkHex,
        }).setOrigin(0.5).setDepth(8);

        // Zona drop: cubre el plato completo (forma circular)
        // ======= AJUSTES DEL ÁREA DEL PLATO =======
        // Cambia este número si quieres que la zona donde se suelta la comida
        // sea más pequeña (ejemplo: size / 2.5) o más grande.
        const radioPlato = size / 2; 
        const radioInterno = radioPlato * 0.70; // 70% del radio exterior (círculo gris interior)

        this.platoDropZone = this.add.zone(cx, cy, size, size)
            // Usamos un rectángulo amplio para el detector nativo de Phaser
            // para evitar los bugs del hit area circular desfasada.
            // Nuestra validación matemática en el evento 'drop' filtrará esto 
            // a un círculo perfecto.
            .setRectangleDropZone(size, size)
            .setDepth(9);
        this.platoDropZone.setData('isPlato', true);
        this.platoDropZone.setData('radioPlato', radioPlato);
        this.platoDropZone.setData('radioInterno', radioInterno);

        // El debug visual fue removido a peticion del usuario.
        // ==========================================

        // Texto guía (solo si está vacío)
        this.progressText = this.add.text(cx, cy, '¡Arrastra alimentos\nal plato!', {
            fontFamily: MFT, fontSize: '28px', color: P.mutedHex,
            align: 'center', lineSpacing: 6,
        }).setOrigin(0.5).setDepth(7).setAlpha(0.6);
    }

    // ─── PANEL DE STATS (DERECHO) ─────────────────────────────────────────────
    private buildStatsPanel() {
        const sx = this.statsX;
        const sw = this.statsW;
        const st = this.statsTop;
        const h  = this.sidebarBottom - st;

        // Shadow
        this.add.rectangle(sx + sw / 2 + 8, st + h / 2 + 8, sw, h, P.ink, 1).setDepth(4);
        // BG
        this.add.rectangle(sx + sw / 2, st + h / 2, sw, h, P.paper, 1)
            .setStrokeStyle(4, P.ink).setDepth(5);

        let curY = st + 18;

        // ── SECCIÓN: PROPORCIÓN ──────────────────────────────────────────────
        this.add.rectangle(sx + sw / 2, curY + 18, sw, 42, P.ink, 1).setDepth(6);
        this.add.text(sx + sw / 2, curY + 18, 'PROPORCIÓN IDEAL', {
            fontFamily: MFT, fontSize: '22px', color: P.greenHex,
        }).setOrigin(0.5).setDepth(7);
        curY += 48;

        const gruposInfo: { id: Grupo; label: string }[] = [
            { id: 'verduras_frutas', label: 'Verduras y Frutas  50%' },
            { id: 'cereal',          label: 'Cereales  25%'           },
            { id: 'leguminosa_aoa',  label: 'Leguminosas / AOA  25%'  },
        ];

        gruposInfo.forEach(g => {
            const colorHex = GRUPO_COLOR_HEX[g.id];
            const color    = GRUPO_COLOR[g.id];

            // Etiqueta + porcentaje
            this.add.rectangle(sx + 14, curY + 4, 10, 24, color, 1).setDepth(6);
            this.add.text(sx + 30, curY - 2, g.label, {
                fontFamily: MFT, fontSize: '18px', color: P.inkHex,
            }).setDepth(6);
            this.barPercents[g.id] = this.add.text(sx + sw - 16, curY - 2, '0 %', {
                fontFamily: MFT, fontSize: '18px', color: colorHex,
            }).setOrigin(1, 0).setDepth(7);

            // Barra de progreso
            const barY = curY + 22;
            this.add.rectangle(sx + 14, barY, this.proportionBarW, 12, P.ink, 0.12)
                .setOrigin(0, 0.5)
                .setStrokeStyle(1, P.ink, 0.3).setDepth(6);
            this.barFills[g.id] = this.add.rectangle(sx + 14, barY, 0, 12, color, 1)
                .setOrigin(0, 0.5).setDepth(7);

            curY += 48;
        });

        // Divisor
        this.add.rectangle(sx + sw / 2, curY + 2, sw - 20, 2, P.ink, 0.18).setDepth(6);
        curY += 14;

        // ── SECCIÓN: NUTRICIÓN ───────────────────────────────────────────────
        this.add.rectangle(sx + sw / 2, curY + 16, sw, 36, P.ink, 1).setDepth(6);
        this.add.text(sx + sw / 2, curY + 16, 'NUTRICIÓN', {
            fontFamily: MFT, fontSize: '20px', color: P.yellowHex,
        }).setOrigin(0.5).setDepth(7);
        curY += 42;

        this.nutritionText = this.add.text(sx + 18, curY, '—', {
            fontFamily: MFT, fontSize: '19px', color: P.mutedHex,
            lineSpacing: 4, wordWrap: { width: sw - 36 },
        }).setDepth(6);
        curY += 70;

        // Divisor
        this.add.rectangle(sx + sw / 2, curY + 2, sw - 20, 2, P.ink, 0.18).setDepth(6);
        curY += 14;

        // ── SECCIÓN: FEEDBACK ────────────────────────────────────────────────
        this.add.rectangle(sx + sw / 2, curY + 16, sw, 36, P.ink, 1).setDepth(6);
        this.add.text(sx + sw / 2, curY + 16, 'RESULTADO', {
            fontFamily: MFT, fontSize: '20px', color: P.coralHex,
        }).setOrigin(0.5).setDepth(7);
        curY += 42;

        const feedbackH = this.sidebarBottom - curY - 20;
        this.feedbackBg = this.add.rectangle(sx + sw / 2, curY + feedbackH / 2, sw - 20, feedbackH, P.paperAlt, 1)
            .setStrokeStyle(2, P.ink, 0.3).setDepth(6);
        void this.feedbackBg;
        this.feedbackText = this.add.text(
            sx + 22, curY + 14,
            'Arma tu plato y presiona\n"Evaluar" para ver el resultado.',
            {
                fontFamily: MFT, fontSize: '19px', color: P.mutedHex,
                lineSpacing: 4, wordWrap: { width: sw - 44 },
            },
        ).setDepth(7);
    }

    // ─── BOTÓN EVALUAR ────────────────────────────────────────────────────────
    private buildEvaluateButton() {
        const cx  = this.platoCenterX;
        const cy  = this.platoCenterY + this.platoSize / 2 + 48;

        PrefabButtons.confirmar(this, cx, cy, () => {
            try { this.sound.play('pb_click'); } catch { void 0; }
            this.evaluatePlate();
        }, {
            text: 'EVALUAR PLATO',
            width: 290,
            height: 68,
            fontSize: '28px',
            depth: 10
        });
    }

    // ─── DRAG & DROP ─────────────────────────────────────────────────────────
    private setupDragEvents() {
        this.input.on('dragstart', (_ptr: Phaser.Input.Pointer, obj: DraggableFood) => {
            if (obj.fromBar) {
                // Cálculo de la Y visual exacta en la pantalla al inicio del clic
                const visualY = obj.localHomeY - this.listCam.scrollY + this.sidebarViewportY;
                
                // Guardamos el offset real absoluto entre la punta del mouse y el centro del sprite.
                // Usamos _ptr.x y _ptr.y que son coordenadas nativas de pantalla sin afectación de cámara
                obj.setData('dragOffsetX', obj.x - _ptr.x);
                obj.setData('dragOffsetY', visualY - _ptr.y);

                obj.y = visualY;
                if (obj.labelText) {
                    obj.labelText.y = visualY + IMG_SZ_BAR / 2 + 14;
                    obj.labelText.cameraFilter = this.listCam.id;
                    obj.labelText.setDepth(51);
                }

                obj.cameraFilter = this.listCam.id;
                obj.setDepth(50);
                obj.setTint(0xdddddd);
                obj.setDisplaySize(ITEM_SIZE, ITEM_SIZE);
                obj.setAlpha(0.88);
            } else {
                // Es un PlacedFood ya en el plato. 
                // En este caso su Y global ya es su Y visual porque está en mainCam.
                obj.setData('dragOffsetX', obj.x - _ptr.x);
                obj.setData('dragOffsetY', obj.y - _ptr.y);

                obj.setDepth(50);
                if (obj.labelText) obj.labelText.setDepth(51);
                obj.setTint(0xdddddd);
                obj.setAlpha(0.88);
            }
        });

        this.input.on('drag', (_ptr: Phaser.Input.Pointer, obj: DraggableFood, _dragX: number, _dragY: number) => {
            // IGNORAMOS _dragX y _dragY porque el InputManager de Phaser los corrompe
            // al cambiar el cameraFilter y modificar obj.y en el frame anterior.
            // Forzamos la posición usando el offset real bloqueado en el mouse.
            const newX = _ptr.x + obj.getData('dragOffsetX');
            const newY = _ptr.y + obj.getData('dragOffsetY');
            
            obj.x = newX;
            obj.y = newY;
            if (obj.labelText) {
                obj.labelText.x = newX;
                obj.labelText.y = newY + ITEM_SIZE / 2 + 10;
            }
        });

        this.input.on('drop', (_ptr: Phaser.Input.Pointer, obj: DraggableFood, zone: Phaser.GameObjects.Zone) => {
            const isOriginal = obj.fromBar;
            
            let esUnDropValido = false;
            let distanceToCenter = 0;
            let angulo = 0;
            
            if (zone.getData('isPlato')) { 
                distanceToCenter = Phaser.Math.Distance.Between(_ptr.x, _ptr.y, zone.x, zone.y);
                const radioPlato = zone.getData('radioPlato') || (zone.width / 2);
                angulo = Phaser.Math.Angle.Between(zone.x, zone.y, _ptr.x, _ptr.y);
                
                if (distanceToCenter <= radioPlato) {
                    esUnDropValido = true;
                }
            }

            if (!esUnDropValido) { 
                if (isOriginal) {
                    this.returnToBar(obj); 
                } else {
                    this.removeFoodFromPlate(obj);
                }
                return; 
            }

            // Calculamos si necesita "autodirección" al círculo interior
            const radioInterno = zone.getData('radioInterno') || (zone.width / 2) * 0.7;
            let finalX = obj.x;
            let finalY = obj.y;
            let deslizar = false;

            if (distanceToCenter > radioInterno) {
                // Lo empujamos hacia el borde interior para que no toque el aro oscuro
                const distanciaSegura = radioInterno - (ITEM_SIZE / 3);
                finalX = zone.x + Math.cos(angulo) * distanciaSegura;
                finalY = zone.y + Math.sin(angulo) * distanciaSegura;
                deslizar = true;
            }

            if (isOriginal) {
                // Instanciar clon y agregarlo al plato. Inicialmente en obj.x, obj.y.
                // Si hay autodirección, createPlacedFood lo deslizará.
                this.createPlacedFood(obj, obj.x, obj.y, finalX, finalY, deslizar);
                // Devolver el original silenciosamente a la barra
                this.resetOriginalToBar(obj);
            } else {
                // Ya estaba en el plato, solo se reacomodó
                obj.clearTint();
                obj.setAlpha(1);
                obj.setDepth(12 + this.placedFoods.length);
                if (obj.labelText) obj.labelText.setDepth(12 + this.placedFoods.length);
                
                if (deslizar) {
                    this.tweens.add({ targets: obj, x: finalX, y: finalY, duration: 300, ease: 'Back.easeOut' });
                    if (obj.labelText) {
                        this.tweens.add({ targets: obj.labelText, x: finalX, y: finalY + ITEM_SIZE / 2 + 10, duration: 300, ease: 'Back.easeOut' });
                    }
                }
                
                this.tweens.add({ targets: obj, scale: 1.18, duration: 90, yoyo: true, ease: 'Sine.easeOut' });
                try { this.sound.play('pb_correct'); } catch { void 0; }
            }
        });

        this.input.on('dragend', (_ptr: Phaser.Input.Pointer, obj: DraggableFood, dropped: boolean) => {
            if (!dropped) {
                if (obj.fromBar) {
                    this.returnToBar(obj);
                } else {
                    this.removeFoodFromPlate(obj);
                }
            }
        });
    }

    private createPlacedFood(original: DraggableFood, startX: number, startY: number, finalX: number, finalY: number, deslizar: boolean) {
        const clone = this.add.image(startX, startY, original.foodItem.id) as DraggableFood;
        clone.setDisplaySize(ITEM_SIZE - 8, ITEM_SIZE - 8);
        clone.setDepth(12 + this.placedFoods.length);
        clone.setInteractive({ useHandCursor: true });
        this.input.setDraggable(clone);
        
        clone.grupo = original.grupo;
        clone.foodItem = original.foodItem;
        clone.localHomeX = 0; 
        clone.localHomeY = 0; 
        clone.fromBar = false;
        clone.placed = true;

        if (original.labelText) {
            const txt = this.add.text(startX, startY + ITEM_SIZE / 2 + 10, original.foodItem.nameES, {
                fontFamily: MFT, fontSize: '16px', color: P.inkHex,
                align: 'center', wordWrap: { width: ITEM_SIZE * 1.5 },
                stroke: P.paperHex, strokeThickness: 3
            }).setOrigin(0.5, 0).setDepth(12 + this.placedFoods.length);
            clone.labelText = txt;
        }

        if (deslizar) {
            this.tweens.add({ targets: clone, x: finalX, y: finalY, duration: 300, ease: 'Back.easeOut' });
            if (clone.labelText) {
                this.tweens.add({ targets: clone.labelText, x: finalX, y: finalY + ITEM_SIZE / 2 + 10, duration: 300, ease: 'Back.easeOut' });
            }
        }

        this.placedFoods.push(clone);
        this.placedCounts[clone.grupo]++;

        const fi = clone.foodItem;
        this.nutritionTotals.calories += fi.calories  ?? 0;
        this.nutritionTotals.protein  += fi.protein   ?? 0;
        this.nutritionTotals.carbs    += fi.carbs     ?? 0;
        this.nutritionTotals.fat      += fi.fat       ?? 0;
        this.nutritionTotals.fiber    += fi.fiber     ?? 0;
        this.nutritionTotals.sugar    += fi.sugar     ?? 0;
        this.nutritionTotals.sodium   += fi.sodium    ?? 0;
        this.nutritionTotals.scoreSum += fi.score;

        this.tweens.add({ targets: clone, scale: 1.18, duration: 90, yoyo: true, ease: 'Sine.easeOut' });
        try { this.sound.play('pb_correct'); } catch { void 0; }

        this.updateProgressLive();
    }

    private removeFoodFromPlate(obj: DraggableFood) {
        this.placedFoods = this.placedFoods.filter(f => f !== obj);
        this.placedCounts[obj.grupo] = Math.max(0, this.placedCounts[obj.grupo] - 1);

        const fi = obj.foodItem;
        this.nutritionTotals.calories -= fi.calories  ?? 0;
        this.nutritionTotals.protein  -= fi.protein   ?? 0;
        this.nutritionTotals.carbs    -= fi.carbs     ?? 0;
        this.nutritionTotals.fat      -= fi.fat       ?? 0;
        this.nutritionTotals.fiber    -= fi.fiber     ?? 0;
        this.nutritionTotals.sugar    -= fi.sugar     ?? 0;
        this.nutritionTotals.sodium   -= fi.sodium    ?? 0;
        this.nutritionTotals.scoreSum -= fi.score;

        obj.disableInteractive();
        this.tweens.add({
            targets: obj.labelText ? [obj, obj.labelText] : [obj],
            alpha: 0, scale: 0.5, duration: 200,
            onComplete: () => {
                obj.destroy();
                if (obj.labelText) obj.labelText.destroy();
            }
        });

        try { this.sound.play('pb_error'); } catch { void 0; }
        this.updateProgressLive();
    }

    private resetOriginalToBar(obj: DraggableFood) {
        obj.clearTint();
        obj.setAlpha(1);
        obj.setDepth(10);
        obj.setDisplaySize(IMG_SZ_BAR, IMG_SZ_BAR);
        
        obj.x = obj.localHomeX;
        obj.y = obj.localHomeY;
        obj.cameraFilter = this.cameras.main.id;
        
        if (obj.labelText) {
            obj.labelText.x = obj.localHomeX;
            obj.labelText.y = obj.localHomeY + IMG_SZ_BAR / 2 + 14;
            obj.labelText.setDepth(10);
            obj.labelText.cameraFilter = this.cameras.main.id;
        }
    }

    private returnToBar(obj: DraggableFood) {
        // Bloqueamos interacciones mientras regresa
        obj.disableInteractive();

        obj.clearTint();
        obj.setTint(0xffaaaa); 

        // Posición visual en mainCam a la que debe viajar
        const targetVisualY = obj.localHomeY - this.listCam.scrollY + this.sidebarViewportY;
        const labelVisualY = targetVisualY + (IMG_SZ_BAR / 2) + 14;

        this.tweens.add({
            targets: obj, x: obj.localHomeX, y: targetVisualY,
            duration: 260, ease: 'Back.easeOut',
            onComplete: () => {
                if (!obj || !obj.active) return;
                obj.clearTint();
                obj.setAlpha(1);
                obj.setDepth(10);
                obj.setDisplaySize(IMG_SZ_BAR, IMG_SZ_BAR);
                
                // Regresamos al mundo real y a la cámara de la lista
                obj.y = obj.localHomeY;
                obj.cameraFilter = this.cameras.main.id;
                obj.setInteractive({ useHandCursor: true });
            }
        });

        if (obj.labelText) {
            this.tweens.add({
                targets: obj.labelText, x: obj.localHomeX, y: labelVisualY,
                duration: 260, ease: 'Back.easeOut',
                onComplete: () => {
                    if (!obj.labelText || !obj.labelText.active) return;
                    obj.labelText.y = obj.localHomeY + IMG_SZ_BAR / 2 + 14;
                    obj.labelText.setDepth(10);
                    obj.labelText.cameraFilter = this.cameras.main.id;
                }
            });
        }
    }

    // ─── ACTUALIZACIÓN EN TIEMPO REAL ────────────────────────────────────────
    private updateProgressLive() {
        const total = this.placedFoods.length;
        const nt    = this.nutritionTotals;

        // Ocultar texto guía cuando hay alimentos
        if (this.progressText) this.progressText.setVisible(total === 0);

        if (total === 0) {
            this.nutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, scoreSum: 0 };
            this.nutritionText.setText('—');
        } else {
            this.nutritionText.setText(
                `Kcal: ${Math.round(nt.calories)}\n` +
                `Prot: ${Math.max(0, nt.protein).toFixed(1)}g   Carbs: ${Math.max(0, nt.carbs).toFixed(1)}g\n` +
                `Grasas: ${Math.max(0, nt.fat).toFixed(1)}g   Fibra: ${Math.max(0, nt.fiber).toFixed(1)}g`
            );
        }

        (Object.keys(this.placedCounts) as Grupo[]).forEach(g => {
            const pct = total === 0 ? 0 : Math.round((this.placedCounts[g] / total) * 100);
            this.barPercents[g].setText(`${pct} %`);
            this.tweens.add({
                targets: this.barFills[g],
                width: (pct / 100) * this.proportionBarW,
                duration: 280, ease: 'Cubic.easeOut',
            });
        });
    }

    // ─── EVALUACIÓN ──────────────────────────────────────────────────────────
    private evaluatePlate() {
        const total = this.placedFoods.length;
        if (total === 0) {
            this.feedbackText.setColor(P.coralHex).setText('Tu plato está vacío.\nArrastra alimentos primero.');
            return;
        }

        const nt = this.nutritionTotals;
        const realPct: Record<Grupo, number> = {
            verduras_frutas: (this.placedCounts.verduras_frutas / total) * 100,
            cereal:          (this.placedCounts.cereal          / total) * 100,
            leguminosa_aoa:  (this.placedCounts.leguminosa_aoa  / total) * 100,
        };

        let desviacion = 0;
        (Object.keys(IDEAL) as Grupo[]).forEach(g => { desviacion += Math.abs(IDEAL[g] - realPct[g]); });
        let score = Math.max(0, Math.round(100 - desviacion / 1.5));

        const gruposPresentes = (Object.keys(this.placedCounts) as Grupo[])
            .filter(g => this.placedCounts[g] > 0).length;
        if (gruposPresentes === 3) score = Math.min(100, score + 10);
        else if (gruposPresentes === 1) score = Math.max(0, score - 15);

        const warnings: string[] = [];
        
        // --- CÁLCULOS METABÓLICOS Y CLÍNICOS ---
        let metaCalorias = 0;
        if (this.tipoComida === 'desayuno') metaCalorias = this.tmb * 0.25;
        else if (this.tipoComida === 'comida') metaCalorias = this.tmb * 0.35;
        else metaCalorias = this.tmb * 0.25;
        
        const diffCalorias = nt.calories - metaCalorias;
        if (Math.abs(diffCalorias) > 150) {
            const penalizacionKcal = Math.floor((Math.abs(diffCalorias) - 50) / 100) * 10;
            score -= penalizacionKcal;
            if (diffCalorias > 0) warnings.push(`Exceso calórico (+${Math.round(diffCalorias)} kcal)`);
            else warnings.push(`Déficit calórico (${Math.round(diffCalorias)} kcal)`);
        }

        // Patologías
        const patologia = this.jugadorActivo?.datosAntropometricos?.patologia || 'ninguna';
        if (patologia === 'diabetico') {
            if (nt.carbs > 60) {
                score -= 20;
                warnings.push('PELIGRO: Exceso de Carbohidratos para diabético (>60g)');
            }
            if (nt.sugar > 15) {
                score -= 20;
                warnings.push('PELIGRO: Exceso de Azúcar para diabético (>15g)');
            }
        } else if (patologia === 'hipertenso') {
            if (nt.sodium > 500) {
                score -= 20;
                warnings.push('PELIGRO: Exceso de Sodio para hipertenso (>500mg)');
            }
        } else {
            // Evaluaciones genéricas (Warnings antiguos pero ajustados a Totales en vez de Averages)
            if (nt.sodium > 800) { score -= 8; warnings.push('Alto en sodio general'); }
            if (nt.sugar > 25) { score -= 6; warnings.push('Alto en azúcar general'); }
        }
        
        score = Math.max(0, score);
        
        const avgFoodScore = nt.scoreSum / total;
        if (avgFoodScore >= 2.5) score = Math.min(100, score + 5);

        this.scoreText.setText(`★  ${score}`);

        const faltantes: string[] = [];
        const excesos:   string[] = [];
        const nombres: Record<Grupo, string> = {
            verduras_frutas: 'Verduras', cereal: 'Cereales', leguminosa_aoa: 'AOA/Leguminosas'
        };

        (Object.keys(IDEAL) as Grupo[]).forEach(g => {
            const diff = realPct[g] - IDEAL[g];
            if (this.placedCounts[g] === 0 || diff < -12) faltantes.push(nombres[g]);
            else if (diff > 12)                            excesos.push(nombres[g]);
        });

        let msg = `Score: ${score}/100`;
        let color = score >= 70 ? P.routeHex : P.coralHex;
        
        const partes: string[] = [];
        partes.push(`Meta Calórica (${this.tipoComida}): ~${Math.round(metaCalorias)} kcal`);
        if (faltantes.length) partes.push(`Faltan: ${faltantes.join(', ')}`);
        if (excesos.length)   partes.push(`Exceso: ${excesos.join(', ')}`);
        if (warnings.length)  partes.push(`\nAVISOS MÉDICOS:\n• ` + warnings.join('\n• '));
        
        if (partes.length === 1 && score === 100) {
            msg += `\n¡Plato perfecto para tu IMC y patologías!`;
            color = P.greenHex;
        } else {
            msg += `\n${partes.join('\n')}`;
        }
        
        msg += `\n\nTu Plato -> Kcal: ${Math.round(nt.calories)} | Sodio: ${Math.round(nt.sodium)}mg | Carbs: ${Math.round(nt.carbs)}g`;

        this.feedbackText.setColor(color).setText(msg);

        // Colorear barras según tolerancia ±10%
        (Object.keys(IDEAL) as Grupo[]).forEach(g => {
            const ok = Math.abs(realPct[g] - IDEAL[g]) <= 10;
            this.barFills[g].setFillStyle(ok ? P.route : P.coral, 1);
        });

        try { this.sound.play(score >= 70 ? 'pb_correct' : 'pb_error'); } catch { void 0; }
    }
}
