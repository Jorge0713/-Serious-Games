import * as Phaser from 'phaser';
import { createDebugSkipButton } from '../systems/DebugSkipButton';
import { showLevelCompleteOverlay } from '../systems/LevelCompleteOverlay';
import { nutritionalInfo } from '../../data/nutritionalInfo';
import type { FoodItem } from '../../data/nutritionalInfo';
import { getErrorMessage } from '../../data/errorMessages';
import { FONT_DISPLAY } from '../../config/gameFonts';
import { LEVEL_SELECT_HEX as HEX } from '../../config/gameColors';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { PlayerService } from '../../services/PlayerService';

const FOOD_ITEM_SIZE       = 70;
const FOOD_ITEM_SPACING    = 125;
const FOOD_LABEL_OFFSET    = 48;
const CEREALES_PER_WAVE    = 4;
const LEGUMINOSAS_PER_WAVE = 4;
const WAVE_SIZE            = 10;
const WAVE_TIME_NORMAL     = 60;
const WAVE_TIME_LAST       = 30;

export class Nivel2Scene extends Phaser.Scene {
    private fondo_cocina!: Phaser.GameObjects.Image;
    private platon!:       Phaser.GameObjects.Image;
    private segmentoCereales!:    Phaser.GameObjects.Image;
    private segmentoLeguminosas!: Phaser.GameObjects.Image;
    private foodContainer!: Phaser.GameObjects.Container;
    private placedFoods: Phaser.GameObjects.Image[] = [];
    private isTutorialActive = false;

    // Wave state
    private waveNumber        = 0;
    private waveCorrectTarget = 0;
    private waveAciertos      = 0;
    private remainingCereales:    FoodItem[] = [];
    private remainingLeguminosas: FoodItem[] = [];
    private seboPool:             FoodItem[] = [];
    private waveInProgress = false;

    // Wave checkpoint for game-over restart
    private waveCheckpoint: {
        waveNumber: number;
        remainingCereales: FoodItem[];
        remainingLeguminosas: FoodItem[];
        seboPool: FoodItem[];
        savedInventory?: { id: string, categoria: string }[];
    } | null = null;

    // Timer
    private timerSeconds = WAVE_TIME_NORMAL;
    private timerEvent?: Phaser.Time.TimerEvent;
    private timerText!:        Phaser.GameObjects.Text;
    private timerWarningText!: Phaser.GameObjects.Text;
    private tickingSound?: Phaser.Sound.BaseSound;
    private urgentMode = false;

    // Lives
    private lives = 2;
    private livesText!: Phaser.GameObjects.Text;

    // Basket drop zones (synced every frame)
    private zonaBordeCereales!:    Phaser.GameObjects.Zone;
    private zonaCereales!:         Phaser.GameObjects.Zone;
    private zcOffY = 0;
    private zonaBordeLeguminosas!: Phaser.GameObjects.Zone;
    private zonaLeguminosas!:      Phaser.GameObjects.Zone;
    private zlOffY = 0;

    // Educational feedback toast
    private toastBg?:    Phaser.GameObjects.Rectangle;
    private toastLabel?: Phaser.GameObjects.Text;
    private toastTxt?:   Phaser.GameObjects.Text;
    private toastTimer?: Phaser.Time.TimerEvent;

    // UI Elements for resizing
    private txtInstruccionesShadow?: Phaser.GameObjects.Text;
    private txtInstrucciones!: Phaser.GameObjects.Text;
    private txtTiempo!: Phaser.GameObjects.Text;
    private txtVidas!: Phaser.GameObjects.Text;
    private lblCereales!: Phaser.GameObjects.Text;
    private lblLeguminosas!: Phaser.GameObjects.Text;
    private foodBarBg!: Phaser.GameObjects.Rectangle;
    private lastWindowWidth = 0;
    private lastWindowHeight = 0;

    constructor() { super('Nivel2Scene'); }

    init() {
        this.toastTimer = undefined;
        this.lastWindowWidth = 0;
        this.lastWindowHeight = 0;
    }

    preload() {
        this.load.image('Fondo-cocina',           '/assets/Backgrounds/Fondo_Cocina.png');
        this.load.image('inventario-cereales',    '/assets/Plato/inventoryCereals.webp');
        this.load.image('inventario-leguminosas', '/assets/Plato/inventoryLegums.webp');
        this.load.image('platon-feliz',  '/assets/Platon/platon_feliz.png');
        this.load.image('platon-triste', '/assets/Platon/platon_triste.png');
        this.load.image('manita',        '/assets/Backgrounds/manita.png');
        this.load.audio('object_win',   '/Sound/ObjectWIN.mp3');
        this.load.audio('sonido-error', '/Sound/incorrecto.mp3');
        this.load.audio('sonido-click', '/Sound/Click.mp3');
        this.load.audio('carta-sonido', '/Sound/CartaSound.mp3');
        this.load.audio('reloj-tic',    '/Sound/Clock.mp3');
        PrefabButtons.preload(this);
        nutritionalInfo.forEach(food => this.load.image(food.id, food.image));
    }

    create() {
        this.placedFoods    = [];
        this.waveNumber     = 0;
        this.waveAciertos   = 0;
        this.waveInProgress = false;
        this.lives          = 2;

        const { width, height } = this.scale;

        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleTop = (height - window.innerHeight / screenScale) / 2;
        const visibleLeft = (width - window.innerWidth / screenScale) / 2;
        const visibleWidth = window.innerWidth / screenScale;
        const visibleBottom = visibleTop + window.innerHeight / screenScale;

        this.fondo_cocina = this.add.image(width / 2, height / 2, 'Fondo-cocina')
            .setScale(0.5).setDisplaySize(width, height);
        void this.fondo_cocina;

        this.txtInstruccionesShadow = this.add.text(width / 2 + 4, visibleTop + 80, 'Arrastra los alimentos a su seccion', {
            fontFamily: FONT_DISPLAY,
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#77D39D',
            stroke: HEX.ink,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(18);

        this.txtInstrucciones = this.add.text(width / 2, visibleTop + 75, 'Arrastra los alimentos a su seccion', {
            fontFamily: FONT_DISPLAY,
            fontSize: '56px',
            fontStyle: 'bold',
            color: HEX.white,
            stroke: HEX.ink,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(19);

        createDebugSkipButton(this, {
            label: 'Saltar a Nivel 3',
            nextScene: 'Nivel3Scene',
            soundKey: 'sonido-click',
            x: visibleLeft + 16,
            y: visibleTop + 150,
        });
        this.createBackButton();

        // CANASTAS
        const escalaCanasta  = 0.60;
        const canastaCentroY = visibleTop + (visibleBottom - visibleTop) * 0.65;

        const segmentoCereales = this.segmentoCereales = this.add.image(
            width / 2 - 300, canastaCentroY, 'inventario-cereales'
        ).setScale(escalaCanasta);

        const zcBordW = segmentoCereales.displayWidth;
        const zcBordH = segmentoCereales.displayHeight;
        this.zonaBordeCereales = this.add.zone(
            segmentoCereales.x, segmentoCereales.y, zcBordW, zcBordH
        ).setRectangleDropZone(zcBordW, zcBordH);
        this.zonaBordeCereales.setData('categoria', 'cereal');

        const zcW = segmentoCereales.displayWidth  * 0.75;
        const zcH = segmentoCereales.displayHeight * 0.75;
        this.zcOffY = segmentoCereales.displayHeight * 0.03;
        this.zonaCereales = this.add.zone(
            segmentoCereales.x, segmentoCereales.y + this.zcOffY, zcW, zcH
        ).setRectangleDropZone(zcW, zcH);
        this.zonaCereales.setData('categoria', 'cereal');
        this.zonaBordeCereales.setData('snapToZone', this.zonaCereales);

        const segmentoLeguminosas = this.segmentoLeguminosas = this.add.image(
            width / 2 + 300, canastaCentroY, 'inventario-leguminosas'
        ).setDisplaySize(segmentoCereales.displayWidth, segmentoCereales.displayHeight);

        const zlBordW = segmentoLeguminosas.displayWidth;
        const zlBordH = segmentoLeguminosas.displayHeight;
        this.zonaBordeLeguminosas = this.add.zone(
            segmentoLeguminosas.x, segmentoLeguminosas.y, zlBordW, zlBordH
        ).setRectangleDropZone(zlBordW, zlBordH);
        this.zonaBordeLeguminosas.setData('categoria', 'leguminosa');

        const zlW = segmentoLeguminosas.displayWidth  * 0.75;
        const zlH = segmentoLeguminosas.displayHeight * 0.75;
        this.zlOffY = segmentoLeguminosas.displayHeight * 0.03;
        this.zonaLeguminosas = this.add.zone(
            segmentoLeguminosas.x, segmentoLeguminosas.y + this.zlOffY, zlW, zlH
        ).setRectangleDropZone(zlW, zlH);
        this.zonaLeguminosas.setData('categoria', 'leguminosa');
        this.zonaBordeLeguminosas.setData('snapToZone', this.zonaLeguminosas);

        // LABELS
        const basketLabelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: FONT_DISPLAY,
            fontSize: '36px',
            fontStyle: 'bold',
            color: HEX.white,
            stroke: HEX.ink,
            strokeThickness: 4,
        };
        this.lblCereales = this.add.text(
            segmentoCereales.x,
            segmentoCereales.y + segmentoCereales.displayHeight / 2 + 12,
            'TU CANASTA DE CEREALES', basketLabelStyle
        ).setOrigin(0.5).setDepth(3);
        this.lblLeguminosas = this.add.text(
            segmentoLeguminosas.x,
            segmentoLeguminosas.y + segmentoLeguminosas.displayHeight / 2 + 12,
            'TU CANASTA DE LEGUMINOSAS', basketLabelStyle
        ).setOrigin(0.5).setDepth(3);

        this.startBasketIdleAnim(this.segmentoCereales,    0);
        this.startBasketIdleAnim(this.segmentoLeguminosas, 450);

        // TIMER
        this.txtTiempo = this.add.text(visibleLeft + visibleWidth - 110, visibleTop + 60, 'TIEMPO', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(20);

        // BOTÓN PAUSA
        PrefabButtons.icono(this, visibleLeft + 60, visibleTop + 60, () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { previousScene: this.scene.key });
        }, {
            text: 'II',
            fontSize: '28px'
        }).setDepth(20);

        this.timerText = this.add.text(visibleLeft + visibleWidth - 110, visibleTop + 90, '60', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20);
        this.timerWarningText = this.add.text(visibleLeft + visibleWidth - 110, visibleTop + 126, '¡Faltan 20 segundos!', {
            fontSize: '13px', color: '#ffaa00', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // VIDAS
        this.txtVidas = this.add.text(visibleLeft + 220, visibleTop + 60, 'VIDAS', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(20);
        this.livesText = this.add.text(visibleLeft + 220, visibleTop + 90, '♥ ♥', {
            fontSize: '30px', color: '#ff4444', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0, 0.5).setDepth(20);

        this.platon = this.add.image(width - 200, visibleBottom - 100, 'platon-feliz')
            .setAlpha(0).setScale(0.8);

        this.buildFoodBarShell(width, visibleTop);
        this.setupDragDrop();

        this.events.once('shutdown', () => this.stopTimer());

        // Check for wave checkpoint (game-over in wave 2+)
        const checkpoint = this.registry.get('nivel2_checkpoint') as {
            waveNumber: number;
            remainingCereales: FoodItem[];
            remainingLeguminosas: FoodItem[];
            seboPool: FoodItem[];
            savedInventory?: { id: string, categoria: string }[];
        } | undefined;

        if (checkpoint) {
            this.registry.remove('nivel2_checkpoint');
            this.remainingCereales    = [...checkpoint.remainingCereales];
            this.remainingLeguminosas = [...checkpoint.remainingLeguminosas];
            this.seboPool             = [...checkpoint.seboPool];
            // startNextWave increments waveNumber, so set to one before the saved wave
            this.waveNumber = checkpoint.waveNumber - 1;

            if (checkpoint.savedInventory) {
                this.restoreInventory(checkpoint.savedInventory);
            }

            this.time.delayedCall(400, () => this.startNextWave());
        } else if (this.registry.get('introCompleted_Nivel2')) {
            this.time.delayedCall(400, () => this.initWavePools());
        } else {
            this.time.delayedCall(400, () => this.showIntroPlaton());
        }
    }

    // ─── WAVE SYSTEM ──────────────────────────────────────────────────────────

    private createBackButton(): void {
        PrefabButtons.volver(this, 110, 90, () => {
            this.returnToFoodGrid();
        }, {
            text: '< Volver',
            width: 150,
            height: 90,
            fontSize: 30,
            clickSoundKey: 'sonido-click',
            depth: 20,
        });
    }

    private returnToFoodGrid(): void {
        this.stopTimer();

        if (window.showTutorial) {
            this.scene.pause();
            window.showTutorial(['legume', 'cereal'], {
                title: 'Leguminosas y cereales',
                nextScene: 'Nivel2Scene',
                finishLabel: 'Volver al Nivel 2',
            });
            return;
        }

        this.scene.start('LevelSelectScene');
    }

    private initWavePools() {
        const allCereales    = nutritionalInfo.filter(f => f.category === 'cereal');
        const allLeguminosas = nutritionalInfo.filter(f => f.category === 'legume');
        const allSebos       = nutritionalInfo.filter(f => f.category !== 'cereal' && f.category !== 'legume');

        this.remainingCereales    = Phaser.Utils.Array.Shuffle([...allCereales])    as FoodItem[];
        this.remainingLeguminosas = Phaser.Utils.Array.Shuffle([...allLeguminosas]) as FoodItem[];
        this.seboPool             = Phaser.Utils.Array.Shuffle([...allSebos])       as FoodItem[];

        // Arroz primero en la oleada 1
        const riceIdx = this.remainingCereales.findIndex(f => f.id === 'rice');
        if (riceIdx > 0) {
            const [rice] = this.remainingCereales.splice(riceIdx, 1);
            this.remainingCereales.unshift(rice);
        }
        this.startNextWave();
    }

    private startNextWave() {
        this.waveNumber++;
        this.waveAciertos   = 0;
        this.waveInProgress = false;

        // Save checkpoint BEFORE splicing the pools
        this.waveCheckpoint = {
            waveNumber:           this.waveNumber,
            remainingCereales:    [...this.remainingCereales],
            remainingLeguminosas: [...this.remainingLeguminosas],
            seboPool:             [...this.seboPool],
            savedInventory:       this.placedFoods.map(f => ({ id: f.texture.key, categoria: f.getData("categoria") as string }))
        };

        // Reset foodContainer scroll position
        if (this.foodContainer) this.foodContainer.x = this.buildFoodBarViewportX();

        // Per-basket full-clear instead of clearing all placed foods each wave
        const cerealesFull    = this.placedFoods.filter(f => f.getData('basket') === this.segmentoCereales).length    >= 12;
        const leguminosasFull = this.placedFoods.filter(f => f.getData('basket') === this.segmentoLeguminosas).length >= 12;

        const proceed = () => {
            const { foods, correctCount } = this.pickWaveFoods();
            this.waveCorrectTarget = correctCount;

            const isLastWave = this.remainingCereales.length === 0 && this.remainingLeguminosas.length === 0;

            this.clearFoodBar();
            this.populateFoodBar(foods);
            this.startTimer(isLastWave ? WAVE_TIME_LAST : WAVE_TIME_NORMAL);
            this.waveInProgress = true;
        };

        if (cerealesFull && leguminosasFull) {
            this.clearBasketFoods(this.segmentoCereales, () => {
                this.clearBasketFoods(this.segmentoLeguminosas, proceed);
            });
        } else if (cerealesFull) {
            this.clearBasketFoods(this.segmentoCereales, proceed);
        } else if (leguminosasFull) {
            this.clearBasketFoods(this.segmentoLeguminosas, proceed);
        } else {
            proceed();
        }
    }

    /** Returns the foodContainer's initial viewport X (mirrors buildFoodBarShell logic). */
    private buildFoodBarViewportX(): number {
        const { width } = this.scale;
        const barWidth   = Math.round(width * 0.82);
        const arrowWidth = 64;
        const barLeft    = (width - barWidth) / 2;
        return barLeft + arrowWidth;
    }

    /**
     * Clears only the placed foods belonging to `panel`.
     * Flashes the basket green, then tweens foods out.
     */
    private clearBasketFoods(panel: Phaser.GameObjects.Image, onDone?: () => void) {
        const foods = this.placedFoods.filter(f => f.getData('basket') === panel);
        if (foods.length === 0) { onDone?.(); return; }

        panel.setTint(0x44ff44);
        this.time.delayedCall(500, () => { panel.clearTint(); });

        foods.forEach(s => { s.setData('basket', undefined); s.setData('slotRelY', undefined); });

        const targets: Phaser.GameObjects.GameObject[] = [];
        foods.forEach(sprite => {
            const texto = sprite.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (texto) targets.push(texto);
            targets.push(sprite);
        });

        this.placedFoods = this.placedFoods.filter(f => !foods.includes(f));

        this.tweens.add({
            targets, alpha: 0, y: '-=40', duration: 350, ease: 'Power2',
            onComplete: () => { targets.forEach(obj => obj.destroy()); onDone?.(); }
        });
    }

    private pickWaveFoods(): { foods: FoodItem[], correctCount: number } {
        const numC = Math.min(CEREALES_PER_WAVE,    this.remainingCereales.length);
        const numL = Math.min(LEGUMINOSAS_PER_WAVE, this.remainingLeguminosas.length);

        const waveC = this.remainingCereales.splice(0, numC);
        const waveL = this.remainingLeguminosas.splice(0, numL);
        const correctCount = numC + numL;

        const sebosNeeded = WAVE_SIZE - correctCount;
        const waveS = (Phaser.Utils.Array.Shuffle([...this.seboPool]) as FoodItem[]).slice(0, sebosNeeded);

        const mixed = [...waveC, ...waveL, ...waveS];

        if (this.waveNumber === 1) {
            const ri = mixed.findIndex(f => f.id === 'rice');
            if (ri > 0) { const [r] = mixed.splice(ri, 1); mixed.unshift(r); }
            return { foods: mixed, correctCount };
        }
        return { foods: Phaser.Utils.Array.Shuffle(mixed) as FoodItem[], correctCount };
    }

    /* private clearPlacedFoods(onDone: () => void) {
        if (this.placedFoods.length === 0) { onDone(); return; }

        this.placedFoods.forEach(s => { s.setData('basket', undefined); s.setData('slotRelY', undefined); });

        const targets: Phaser.GameObjects.GameObject[] = [];
        this.placedFoods.forEach(sprite => {
            const texto = sprite.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (texto) targets.push(texto);
            targets.push(sprite);
        });

        this.tweens.add({
            targets, alpha: 0, y: '-=40', duration: 350, ease: 'Power2',
            onComplete: () => { targets.forEach(o => o.destroy()); this.placedFoods = []; onDone(); }
        });
    } */

    private clearFoodBar() {
        if (!this.foodContainer) return;
        [...this.foodContainer.list].forEach(c => (c as Phaser.GameObjects.GameObject).destroy());
        this.foodContainer.removeAll(false);
    }

    private onWaveComplete() {
        if (!this.waveInProgress) return;
        this.waveInProgress = false;
        this.stopTimer();

        const hasMoreWaves = this.remainingCereales.length > 0 || this.remainingLeguminosas.length > 0;

        if (!hasMoreWaves) {
            this.registry.set('nivel2Completado', true);
            
            const jugador = PlayerService.obtenerJugadorActivo();
            if (jugador) {
                const nuevosNiveles = new Set([...jugador.progreso.nivelesCompletados, 2]);
                PlayerService.actualizarProgreso(jugador.id, {
                    ...jugador.progreso,
                    nivelesCompletados: Array.from(nuevosNiveles)
                });
            }

            this.time.delayedCall(1000, () => showLevelCompleteOverlay(this, {
                title: '¡FELICIDADES!',
                message: 'Completaste cereales y leguminosas. ¡Vuelve al mapa para continuar!',
                buttonLabel: 'Volver al mapa',
                nextScene: 'LevelSelectScene',
                soundKey: 'object_win',
                clickSoundKey: 'sonido-click',
            }));
            return;
        }

        this.showWaveCompleteOverlay(() => this.startNextWave());
    }

    private showWaveCompleteOverlay(onDone: () => void) {
        const { width, height } = this.scale;
        const cx = width / 2, cy = height / 2;

        const overlay   = this.add.rectangle(cx, cy, width, height, 0x000000, 0.72).setDepth(100).setAlpha(0);
        const platonBig = this.add.image(width * 0.78, cy + 30, 'platon-feliz').setScale(0).setDepth(101);
        const titleTxt  = this.add.text(cx - 60, cy - 90, '¡OLEADA\nCOMPLETADA!', {
            fontSize: '52px', color: '#FFD700', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 7, align: 'center',
        }).setOrigin(0.5).setDepth(103).setAlpha(0);
        const msgTxt = this.add.text(cx - 60, cy + 40,
            '¡Ganaste un nuevo conjunto de\nalimentos para armar tu gran plato!', {
                fontSize: '24px', color: '#ffffff', fontFamily: 'Arial',
                fontStyle: 'bold', stroke: '#000000', strokeThickness: 5, align: 'center',
            }
        ).setOrigin(0.5).setDepth(103).setAlpha(0);

        try { this.sound.play('object_win'); } catch { void 0; }
        this.tweens.add({ targets: overlay, alpha: 1, duration: 300 });
        this.tweens.add({ targets: [titleTxt, msgTxt], alpha: 1, duration: 400, delay: 200 });
        this.tweens.add({ targets: platonBig, scaleX: 0.75, scaleY: 0.75, duration: 500, ease: 'Back.easeOut', delay: 150 });

        this.time.delayedCall(3200, () => {
            this.tweens.add({
                targets: [overlay, titleTxt, msgTxt, platonBig], alpha: 0, duration: 400,
                onComplete: () => { overlay.destroy(); titleTxt.destroy(); msgTxt.destroy(); platonBig.destroy(); onDone(); }
            });
        });
    }

    // ─── TIMER ────────────────────────────────────────────────────────────────

    private startTimer(seconds: number) {
        this.timerSeconds = seconds;
        this.updateTimerDisplay();
        if (this.timerEvent) this.timerEvent.destroy();
        this.urgentMode = false;
        if (this.tickingSound) { try { this.tickingSound.stop(); } catch { void 0; } }
        try {
            this.tickingSound = this.sound.add('reloj-tic', { loop: true, volume: 0.45 });
            this.tickingSound.play();
        } catch { void 0; }
        if (this.timerWarningText) this.timerWarningText.setVisible(false);
        this.timerEvent = this.time.addEvent({
            delay: 1000, repeat: seconds - 1,
            callback: () => {
                this.timerSeconds = Math.max(0, this.timerSeconds - 1);
                this.updateTimerDisplay();
                if (this.timerSeconds <= 0) this.onTimerExpire();
            },
        });
    }

    private stopTimer() {
        if (this.timerEvent) { this.timerEvent.destroy(); this.timerEvent = undefined; }
        if (this.tickingSound) { try { this.tickingSound.stop(); } catch { void 0; } this.tickingSound = undefined; }
        if (this.timerWarningText) {
            this.tweens.killTweensOf(this.timerWarningText);
            this.timerWarningText.setVisible(false).setAlpha(1);
        }
        this.urgentMode = false;
    }

    private updateTimerDisplay() {
        if (!this.timerText) return;
        this.timerText.setText(String(this.timerSeconds));
        if (this.timerSeconds <= 10)      this.timerText.setColor('#ff2222');
        else if (this.timerSeconds <= 20) this.timerText.setColor('#ffaa00');
        else                               this.timerText.setColor('#ffffff');

        if (this.timerSeconds <= 20 && !this.urgentMode) {
            this.urgentMode = true;
            try { (this.tickingSound as Phaser.Sound.WebAudioSound).setRate(1.75); } catch { void 0; }
            if (this.timerWarningText) {
                this.timerWarningText.setVisible(true).setAlpha(1);
                this.tweens.add({ targets: this.timerWarningText, alpha: 0, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            }
        }
    }

    private onTimerExpire() {
        if (!this.waveInProgress) return;
        this.waveInProgress = false;
        this.stopTimer();
        this.executeGameOver('¡Se acabó el tiempo!');
    }

    // ─── LIVES ────────────────────────────────────────────────────────────────

    private updateLivesDisplay() {
        if (!this.livesText) return;
        const hearts = Array(Math.max(0, this.lives)).fill('♥').join(' ');
        this.livesText.setText(hearts || '—');
        this.livesText.setColor(this.lives === 1 ? '#ff8800' : '#ff4444');
    }

    private executeGameOver(reason: string) {
        this.isTutorialActive = false;
        try { this.sound.play('sonido-error'); } catch { void 0; }
        this.mostrarPlaton(false);

        // Save checkpoint so wave 2+ restarts from the same wave
        // Use current placedFoods (not wave-start snapshot) so basket persists on restart
        if (this.waveNumber >= 2 && this.waveCheckpoint) {
            this.registry.set('nivel2_checkpoint', {
                ...this.waveCheckpoint,
                savedInventory: this.placedFoods.map(f => ({
                    id: f.texture.key,
                    categoria: f.getData('categoria') as string,
                })),
            });
        }

        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65).setDepth(100);
        this.add.text(width / 2, height / 2 - 65, '¡FALLASTE!', {
            fontSize: '64px', color: '#ff4444', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setDepth(101);
        this.add.text(width / 2, height / 2 + 5, reason, {
            fontSize: '28px', color: '#ffffff', fontFamily: 'Arial',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(101);

        this.time.delayedCall(1000, () => {
            const restartTxt = this.add.text(width / 2, height / 2 + 72,
                'Toca aquí para intentarlo de nuevo', {
                    fontSize: '26px', color: '#ffdd88', fontFamily: 'Arial',
                    fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
                }
            ).setOrigin(0.5).setDepth(101).setAlpha(0);
            this.tweens.add({ targets: restartTxt, alpha: 1, duration: 350 });
            this.tweens.add({ targets: restartTxt, alpha: { from: 1, to: 0.25 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 400 });
            this.input.once('pointerdown', () => this.scene.restart());
        });
    }

    // ─── FOOD BAR ─────────────────────────────────────────────────────────────

    private buildFoodBarShell(width: number, visibleTop: number = 0) {
        const barWidth     = Math.round(width * 0.82);
        const arrowWidth   = 64;
        const barLeft      = (width - barWidth) / 2;
        const viewportX    = barLeft + arrowWidth;
        const stripTop     = visibleTop + 140;
        const stripHeight  = 148;
        const stripCenterY = stripTop + stripHeight / 2;

        this.foodBarBg = this.add.rectangle(width / 2, stripCenterY, barWidth, stripHeight, 0xf7cc85, 0.82)
            .setStrokeStyle(4, 0x5E412F).setDepth(1);

        this.foodContainer = this.add.container(viewportX, visibleTop).setDepth(5);
    }

    private populateFoodBar(foods: FoodItem[]) {
        const { width } = this.scale;
        
        const barWidth    = Math.round(width * 0.82);
        const arrowWidth  = 64;
        const viewportW   = barWidth - arrowWidth * 2;

        const contentSpan = (foods.length - 1) * FOOD_ITEM_SPACING + FOOD_ITEM_SIZE;
        const xPad = Math.max(0, (viewportW - contentSpan) / 2);

        foods.forEach((item, index) => {
            const localX = xPad + FOOD_ITEM_SIZE / 2 + index * FOOD_ITEM_SPACING;
            const localY = 204;

            const sprite = this.add.image(localX, localY, item.id)
                .setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE).setAlpha(0)
                .setInteractive({ useHandCursor: true });
            const tScaleX = sprite.scaleX, tScaleY = sprite.scaleY;
            sprite.setScale(0);

            const texto = this.add.text(localX, localY + FOOD_LABEL_OFFSET, item.nameES, {
                fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
                fontFamily: 'Arial, sans-serif', stroke: '#5E412F', strokeThickness: 4,
            }).setOrigin(0.5).setAlpha(0);

            const categoria = item.category === 'cereal'  ? 'cereal'
                            : item.category === 'legume'  ? 'leguminosa'
                            : 'sebo';

            this.input.setDraggable(sprite);
            sprite.setData('categoria',   categoria);
            sprite.setData('localHomeX',  localX);
            sprite.setData('localHomeY',  localY);
            sprite.setData('lastValidX',  localX);
            sprite.setData('lastValidY',  localY);
            sprite.setData('fromFoodBar', true);
            sprite.setData('texto',       texto);

            this.foodContainer.add([sprite, texto]);

            this.time.delayedCall(index * 160, () => {
                try { this.sound.play('carta-sonido'); } catch { void 0; }
                this.tweens.add({ targets: sprite, scaleX: tScaleX, scaleY: tScaleY, alpha: 1, duration: 260, ease: 'Back.easeOut' });
                this.tweens.add({ targets: texto, alpha: 1, duration: 200, delay: 120, ease: 'Power2' });
            });
        });
    }

    // ─── DRAG & DROP ──────────────────────────────────────────────────────────

    private setupDragDrop() {
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive) return;
            const texto = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (gameObject.getData('fromFoodBar')) {
                this.foodContainer.remove(gameObject, false);
                this.add.existing(gameObject);
                gameObject.x = pointer.worldX; gameObject.y = pointer.worldY;
                gameObject.setAlpha(1).setVisible(true);
                if (texto) {
                    this.foodContainer.remove(texto, false);
                    this.add.existing(texto);
                    texto.x = pointer.worldX; texto.y = pointer.worldY + FOOD_LABEL_OFFSET;
                    texto.setDepth(31).setAlpha(1).setVisible(true);
                }
            }
            this.children.bringToTop(gameObject);
            if (texto) this.children.bringToTop(texto);
            gameObject.setTint(0xdddddd);
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive) return;
            gameObject.x = pointer.worldX; gameObject.y = pointer.worldY;
            const texto = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (texto) { texto.x = pointer.worldX; texto.y = pointer.worldY + FOOD_LABEL_OFFSET; }
        });

        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
            if (this.isTutorialActive) return;
            if (!this.waveInProgress) return;

            const categoriaItem = gameObject.getData('categoria') as string;
            const categoriaZona = dropZone.getData('categoria')   as string;

            if (categoriaItem === categoriaZona) {
                const targetPanel = categoriaZona === 'cereal' ? this.segmentoCereales : this.segmentoLeguminosas;
                const slot = this.findNearestFreeInventorySlot(targetPanel, gameObject.x, gameObject.y, gameObject);
                if (slot) {
                    gameObject.x = slot.x; gameObject.y = slot.y;
                    const t = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
                    if (t) { t.x = slot.x; t.y = slot.y + FOOD_LABEL_OFFSET; }
                } else {
                    gameObject.clearTint(); this.returnToFoodBar(gameObject); return;
                }

                gameObject.clearTint();
                this.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();
                gameObject.setData('placed',   true);
                gameObject.setData('basket',   targetPanel);
                gameObject.setData('slotRelY', gameObject.y - targetPanel.y);
                this.placedFoods.push(gameObject);

                try { this.sound.play('object_win'); } catch { void 0; }
                try { this.mostrarPlaton(true); } catch { void 0; }

                if (categoriaItem === 'cereal' || categoriaItem === 'leguminosa') {
                    this.pulseBasket(targetPanel);
                    this.waveAciertos++;

                    // Check if this specific basket is now full (12 items)
                    const basketFull = this.placedFoods.filter(f => f.getData('basket') === targetPanel).length >= 12;
                    if (basketFull) {
                        this.time.delayedCall(800, () => this.clearBasketFoods(targetPanel));
                    }

                    if (this.waveAciertos >= this.waveCorrectTarget) {
                        this.time.delayedCall(800, () => this.onWaveComplete());
                    }
                }

            } else {
                gameObject.clearTint();
                try { this.sound.play('sonido-error'); } catch { void 0; }
                try { this.mostrarPlaton(false); } catch { void 0; }

                if (categoriaItem === 'cereal' || categoriaItem === 'leguminosa') {
                    this.shakeWrongFood(gameObject);
                    const dropZoneBasket = categoriaZona === 'cereal' ? this.segmentoCereales : this.segmentoLeguminosas;
                    this.shakeWrongBasket(dropZoneBasket);
                    this.flashCorrectBasket(categoriaItem);
                    this.showEducationalFeedback(categoriaItem, categoriaZona);
                    this.returnToFoodBar(gameObject);
                    this.lives--;
                    this.updateLivesDisplay();
                    if (this.lives <= 0) {
                        this.waveInProgress = false;
                        this.stopTimer();
                        this.time.delayedCall(400, () => this.executeGameOver('¡Pusiste el alimento en el lugar equivocado!'));
                    }
                } else {
                    this.shakeWrongFood(gameObject);
                    this.showEducationalFeedback(categoriaItem, categoriaZona);
                    this.returnToFoodBar(gameObject);
                }
            }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
            if (this.isTutorialActive) return;
            if (!dropped) { gameObject.clearTint(); this.returnToFoodBar(gameObject); }
        });
    }



    // ─── RETURN TO BAR ────────────────────────────────────────────────────────

    private returnToFoodBar(gameObject: Phaser.GameObjects.Image) {
        const texto      = gameObject.getData('texto')     as Phaser.GameObjects.Text | undefined;
        const localHomeX = gameObject.getData('localHomeX') as number;
        const localHomeY = gameObject.getData('localHomeY') as number;
        const targetX = this.foodContainer.x + localHomeX;
        const targetY = this.foodContainer.y + localHomeY;

        this.tweens.add({
            targets: gameObject, x: targetX, y: targetY, duration: 300, ease: 'Power2',
            onComplete: () => {
                this.children.remove(gameObject);
                gameObject.x = localHomeX; gameObject.y = localHomeY;
                gameObject.clearTint();
                this.foodContainer.add(gameObject);
            },
        });
        if (!texto) return;
        this.tweens.add({
            targets: texto, x: targetX, y: targetY + FOOD_LABEL_OFFSET, duration: 300, ease: 'Power2',
            onComplete: () => {
                this.children.remove(texto);
                texto.x = localHomeX; texto.y = localHomeY + FOOD_LABEL_OFFSET;
                this.foodContainer.add(texto);
            },
        });
    }

    // ─── INVENTORY SLOTS ──────────────────────────────────────────────────────

    private static readonly SLOT_COL_OFFSETS = [-240, -80, 80, 240];
    private static readonly SLOT_ROW_OFFSETS = [-154,  12, 185];

    private getInventorySlotPositions(panel: Phaser.GameObjects.Image) {
        // Always use cereales scaleX (0.60) — leguminosas uses setDisplaySize so its
        // scaleX differs from 0.60, but both panels have identical display dimensions,
        // so the slot pixel offsets must be the same for both.
        const s = this.segmentoCereales.scaleX;
        const slots: { x: number; y: number }[] = [];
        for (const ry of Nivel2Scene.SLOT_ROW_OFFSETS)
            for (const rx of Nivel2Scene.SLOT_COL_OFFSETS)
                slots.push({ x: panel.x + rx * s, y: panel.y + ry * s });
        return slots;
    }

    private findNearestFreeInventorySlot(
        panel: Phaser.GameObjects.Image,
        nearX: number, nearY: number,
        excluding?: Phaser.GameObjects.Image
    ): { x: number; y: number } | null {
        const slots    = this.getInventorySlotPositions(panel);
        const occupied = this.placedFoods.filter(p => p !== excluding)
            .map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));
        let best: { x: number; y: number } | null = null;
        let bestDist = Infinity;
        for (const slot of slots) {
            if (occupied.some(o => Math.abs(o.x - slot.x) < 12 && Math.abs(o.y - slot.y) < 12)) continue;
            const dist = Math.hypot(nearX - slot.x, nearY - slot.y);
            if (dist < bestDist) { bestDist = dist; best = slot; }
        }
        return best;
    }

    private restoreInventory(saved: { id: string, categoria: string }[]) {
        saved.forEach(item => {
            const targetPanel = item.categoria === 'cereal' ? this.segmentoCereales : this.segmentoLeguminosas;
            
            const sprite = this.add.image(0, 0, item.id)
                .setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE)
                .setAlpha(1);
            
            const nameES = nutritionalInfo.find(n => n.id === item.id)?.nameES || item.id;
            const texto = this.add.text(0, FOOD_LABEL_OFFSET, nameES, {
                fontSize: '15px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial, sans-serif',
                stroke: '#5E412F',
                strokeThickness: 4,
            }).setOrigin(0.5).setAlpha(1);

            sprite.setData("categoria", item.categoria);
            sprite.setData("texto", texto);
            
            const slot = this.findNearestFreeInventorySlot(targetPanel, targetPanel.x, targetPanel.y);
            if (slot) {
                sprite.x = slot.x;
                sprite.y = slot.y;
                texto.x = slot.x;
                texto.y = slot.y + FOOD_LABEL_OFFSET;
                
                sprite.setData("placed", true);
                sprite.setData("basket", targetPanel);
                sprite.setData("slotRelY", sprite.y - targetPanel.y);
                this.placedFoods.push(sprite);
                
                this.children.bringToTop(sprite);
                this.children.bringToTop(texto);
            }
        });
    }



    private showIntroPlaton() {
        this.isTutorialActive = true;
        const { width, height } = this.scale;

        this.platon.setTexture('platon-feliz').setScale(0.8)
            .setPosition(width + 300, height - 250).setAlpha(0).setDepth(10);

        this.tweens.add({
            targets: this.platon, x: 300, alpha: 1, duration: 850, ease: 'Power2.easeOut',
            onComplete: () => {
                const cx = 700, cy = height - 630;

                const txt = this.add.text(cx, cy,
                    'Este es el nivel 2,\nCereales vs Leguminosas.\nEn este nivel desbloquearás\ntus lotes de alimentos del\ntipo cereales y leguminosas.',
                    { fontSize: '27px', color: '#000000', fontFamily: 'Gill Sans MT', align: 'left', wordWrap: { width: 400 } }
                ).setOrigin(0.5).setDepth(12).setAlpha(0);

                const pad = 24;
                const bx = cx - txt.width / 2 - pad, by = cy - txt.height / 2 - pad;
                const bw = txt.width + pad * 2,       bh = txt.height + pad * 2;

                const bubble = this.add.graphics().setDepth(11).setAlpha(0);
                bubble.fillStyle(0xFFFAED, 0.97);
                bubble.fillTriangle(bx + 40, by + bh, bx + 85, by + bh, bx - 20, by + bh + 58);
                bubble.fillRoundedRect(bx, by, bw, bh, 18);
                bubble.lineStyle(4, 0x5E412F, 1);
                bubble.strokeRoundedRect(bx, by, bw, bh, 18);
                bubble.beginPath();
                bubble.moveTo(bx + 40, by + bh); bubble.lineTo(bx - 20, by + bh + 58); bubble.lineTo(bx + 85, by + bh);
                bubble.strokePath();

                this.tweens.add({ targets: [bubble, txt], alpha: 1, duration: 400, delay: 100 });

                this.time.delayedCall(4500, () => {
                    this.tweens.add({
                        targets: [this.platon, txt, bubble], alpha: 0, duration: 500,
                        onComplete: () => {
                            bubble.destroy(); txt.destroy();
                            this.isTutorialActive = false;
                            this.registry.set('introCompleted_Nivel2', true);
                            this.initWavePools();
                        }
                    });
                });
            }
        });
    }

    // ─── EDUCATIONAL FEEDBACK ─────────────────────────────────────────────────

    private clearToast() {
        if (this.toastTimer) { this.toastTimer.destroy(); this.toastTimer = undefined; }
        if (this.toastBg)    { this.tweens.killTweensOf(this.toastBg);    this.toastBg.destroy();    this.toastBg    = undefined; }
        if (this.toastLabel) { this.tweens.killTweensOf(this.toastLabel); this.toastLabel.destroy(); this.toastLabel = undefined; }
        if (this.toastTxt)   { this.tweens.killTweensOf(this.toastTxt);   this.toastTxt.destroy();   this.toastTxt   = undefined; }
    }

    private showEducationalFeedback(itemCat: string, zoneCat: string) {
        this.clearToast();
        const msg = getErrorMessage(itemCat, zoneCat);
        const { width, height } = this.scale;
        const toastY = height - 130, toastW = 860;

        this.toastBg = this.add.rectangle(width / 2, toastY, toastW, 116, 0x1a100a)
            .setStrokeStyle(3, 0xf0a000, 1).setDepth(200).setAlpha(0);
        this.toastLabel = this.add.text(width / 2 - toastW / 2 + 22, toastY - 30, 'Dato nutricional:', {
            fontSize: '17px', color: '#f0a000', fontFamily: 'Gill Sans MT', fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(201).setAlpha(0);
        this.toastTxt = this.add.text(width / 2, toastY + 14, msg, {
            fontSize: '19px', color: '#ffffff', fontFamily: 'Gill Sans MT',
            wordWrap: { width: toastW - 48 }, align: 'center',
        }).setOrigin(0.5, 0.5).setDepth(201).setAlpha(0);

        this.tweens.add({ targets: [this.toastBg, this.toastLabel, this.toastTxt], alpha: 1, duration: 320, ease: 'Power2' });

        this.toastTimer = this.time.delayedCall(6000, () => {
            const bg = this.toastBg, lbl = this.toastLabel, txt = this.toastTxt;
            this.toastBg = undefined; this.toastLabel = undefined; this.toastTxt = undefined; this.toastTimer = undefined;
            this.tweens.add({
                targets: [bg, lbl, txt], alpha: 0, duration: 350,
                onComplete: () => { bg?.destroy(); lbl?.destroy(); txt?.destroy(); }
            });
        });
    }

    private shakeWrongFood(food: Phaser.GameObjects.Image) {
        this.tweens.add({ targets: food, angle: 7, duration: 60, yoyo: true, repeat: 3, ease: 'Linear', onComplete: () => { food.setAngle(0); } });
    }

    private flashCorrectBasket(itemCat: string) {
        const basket = itemCat === 'cereal' ? this.segmentoCereales : this.segmentoLeguminosas;
        basket.setTint(0xffe066);
        this.time.delayedCall(620, () => { basket.clearTint(); });
    }

    // ─── PLATÓN ───────────────────────────────────────────────────────────────

    private startBasketIdleAnim(basket: Phaser.GameObjects.Image, phaseDelay: number) {
        const baseY = basket.y;
        this.time.delayedCall(phaseDelay, () => {
            this.tweens.add({ targets: basket, y: baseY - 9, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });
    }

    private shakeWrongBasket(basket: Phaser.GameObjects.Image) {
        this.tweens.add({
            targets: basket, angle: 8, duration: 55, yoyo: true, repeat: 4, ease: 'Linear',
            onComplete: () => { basket.setAngle(0); },
        });
    }

    private pulseBasket(basket: Phaser.GameObjects.Image) {
        const sx = basket.scaleX, sy = basket.scaleY;
        this.tweens.add({
            targets: basket,
            scaleX: sx * 1.05,
            scaleY: sy * 1.05,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    private mostrarPlaton(esFeliz: boolean) {
        this.platon.setTexture(esFeliz ? 'platon-feliz' : 'platon-triste');
        this.tweens.add({
            targets: this.platon, alpha: 1, y: this.scale.height - 250, duration: 300, ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({ targets: this.platon, alpha: 0, y: this.scale.height - 200, duration: 300 });
                });
            },
        });
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    private repositionUI() {
        const { width, height } = this.scale;
        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleTop = (height - window.innerHeight / screenScale) / 2;
        const visibleLeft = (width - window.innerWidth / screenScale) / 2;
        const visibleWidth = window.innerWidth / screenScale;
        const visibleBottom = visibleTop + window.innerHeight / screenScale;

        if (this.txtInstruccionesShadow) this.txtInstruccionesShadow.setPosition(width / 2 + 4, visibleTop + 80);
        if (this.txtInstrucciones) this.txtInstrucciones.setPosition(width / 2, visibleTop + 75);
        
        if (this.txtTiempo) {
            this.txtTiempo.setPosition(visibleLeft + visibleWidth - 110, visibleTop + 60);
            this.timerText.setPosition(visibleLeft + visibleWidth - 110, visibleTop + 90);
            this.timerWarningText.setPosition(visibleLeft + visibleWidth - 110, visibleTop + 126);
        }

        if (this.txtVidas) {
            this.txtVidas.setPosition(visibleLeft + 220, visibleTop + 60);
            this.livesText.setPosition(visibleLeft + 220, visibleTop + 90);
        }

        if (this.platon && !this.tweens.isTweening(this.platon)) {
            if (this.platon.x < width / 2) {
                this.platon.setX(visibleLeft + 300);
            } else {
                this.platon.setX(visibleLeft + visibleWidth - 200);
            }
        }

        const canastaCentroY = visibleTop + (visibleBottom - visibleTop) * 0.65;
        if (this.segmentoCereales) {
            this.segmentoCereales.setY(canastaCentroY);
            if (this.lblCereales) this.lblCereales.setY(canastaCentroY + this.segmentoCereales.displayHeight / 2 + 40);
        }
        if (this.segmentoLeguminosas) {
            this.segmentoLeguminosas.setY(canastaCentroY);
            if (this.lblLeguminosas) this.lblLeguminosas.setY(canastaCentroY + this.segmentoLeguminosas.displayHeight / 2 + 40);
        }

        if (this.foodBarBg) {
            const stripTop = visibleTop + 140;
            const stripHeight = 148;
            this.foodBarBg.setY(stripTop + stripHeight / 2);
            if (this.foodContainer) {
                this.foodContainer.setY(visibleTop);
            }
        }
    }

    update() {
        if (window.innerWidth !== this.lastWindowWidth || window.innerHeight !== this.lastWindowHeight) {
            this.lastWindowWidth = window.innerWidth;
            this.lastWindowHeight = window.innerHeight;
            this.repositionUI();
        }



        if (this.zonaBordeCereales) {
            this.zonaBordeCereales.y = this.segmentoCereales.y;
            this.zonaCereales.y      = this.segmentoCereales.y + this.zcOffY;
        }
        if (this.zonaBordeLeguminosas) {
            this.zonaBordeLeguminosas.y = this.segmentoLeguminosas.y;
            this.zonaLeguminosas.y      = this.segmentoLeguminosas.y + this.zlOffY;
        }

        for (const food of this.placedFoods) {
            const basket = food.getData('basket') as Phaser.GameObjects.Image | undefined;
            const relY   = food.getData('slotRelY') as number | undefined;
            if (basket === undefined || relY === undefined) continue;
            food.y = basket.y + relY;
            const texto = food.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (texto) texto.y = food.y + FOOD_LABEL_OFFSET;
        }
    }
}
