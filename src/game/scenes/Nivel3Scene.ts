import * as Phaser from 'phaser';
import { showLevelCompleteOverlay } from '../systems/LevelCompleteOverlay';
import { nutritionalInfo } from '../../data/nutritionalInfo';
import type { FoodItem } from '../../data/nutritionalInfo';
import { getErrorMessage } from '../../data/errorMessages';
import { FONT_DISPLAY, FONT_MONO } from '../../config/gameFonts';
import { LEVEL_SELECT_COLORS as COLORS, LEVEL_SELECT_HEX as HEX } from '../../config/gameColors';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { PlayerService } from '../../services/PlayerService';
import { FlowProgressService } from '../../services/FlowProgressService';

const FOOD_ITEM_SIZE    = 70;
const FOOD_ITEM_SPACING = 125;
const FOOD_LABEL_OFFSET = 48;
const ANIMAL_PER_WAVE   = 4;
const JUNK_PER_WAVE     = 6;
const WAVE_TIME_NORMAL  = 60;
const WAVE_TIME_LAST    = 30;
const WIDTH = 1920;
const BACKGROUND_OVERLAY_ALPHA = 0.38;

export class Nivel3Scene extends Phaser.Scene {
    private platon!:        Phaser.GameObjects.Image;
    private animalSection!: Phaser.GameObjects.Image;
    private foodContainer!: Phaser.GameObjects.Container;
    private placedFoods: Phaser.GameObjects.Image[] = [];
    private isTutorialActive = false;

    // Wave state
    private waveNumber        = 0;
    private waveCorrectTarget = 0;
    private waveAciertos      = 0;
    private remainingAnimal: FoodItem[] = [];
    private junkPool:        FoodItem[] = [];
    private waveInProgress = false;

    // Wave checkpoint for game-over restart
    private waveCheckpoint: {
        waveNumber: number;
        remainingAnimal: FoodItem[];
        junkPool: FoodItem[];
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
    private lives = 3;
    private livesText!: Phaser.GameObjects.Text;

    // Drop zone (synced every frame to follow bobbing section)
    private dropZone!: Phaser.GameObjects.Zone;
    private dzOffY    = 0;

    // Educational feedback toast
    private toastBg?:    Phaser.GameObjects.Rectangle;
    private toastLabel?: Phaser.GameObjects.Text;
    private toastTxt?:   Phaser.GameObjects.Text;
    private toastTimer?: Phaser.Time.TimerEvent;

    // UI Elements for resizing
    private lblAnimal!: Phaser.GameObjects.Text;
    private foodBarShadow!: Phaser.GameObjects.Rectangle;
    private foodBarBg!: Phaser.GameObjects.Rectangle;
    private foodBarAccent!: Phaser.GameObjects.Rectangle;
    private lastWindowWidth = 0;
    private lastWindowHeight = 0;

    constructor() { super('Nivel3Scene'); }

    init() {
        this.toastTimer = undefined;
        this.lastWindowWidth = 0;
        this.lastWindowHeight = 0;
    }

    // ── PRELOAD ───────────────────────────────────────────────────────────────
    preload() {
        this.load.image('fondo_cocina3',    '/assets/Backgrounds/Fondo_Cocina.png');
        this.load.image('inventario-animal', '/assets/Plato/inventoryAnimal.webp');
        this.load.image('platon-feliz',     '/assets/Platon/platon_feliz.png');
        this.load.image('platon-triste',    '/assets/Platon/platon_triste.png');
        this.load.image('manita',           '/assets/Backgrounds/manita.png');
        this.load.audio('object_win',   '/Sound/ObjectWIN.mp3');
        this.load.audio('level_win',    '/Sound/win.mp3');
        this.load.audio('sonido-error', '/Sound/incorrecto.mp3');
        this.load.audio('sonido-click', '/Sound/Click.mp3');
        this.load.audio('carta-sonido', '/Sound/CartaSound.mp3');
        this.load.audio('reloj-tic',    '/Sound/Clock.mp3');
        PrefabButtons.preload(this);
        nutritionalInfo.forEach(food => this.load.image(food.id, food.image));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    create() {
        const { width, height } = this.scale;
        
        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleTop = (height - window.innerHeight / screenScale) / 2;
        const visibleBottom = visibleTop + window.innerHeight / screenScale;

        this.placedFoods    = [];
        this.waveNumber     = 0;
        this.waveAciertos   = 0;
        this.waveInProgress = false;
        this.lives          = 3;

        this.add.image(width / 2, height / 2, 'fondo_cocina3')
            .setDisplaySize(width, height)
            .setDepth(-2);

        this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg, BACKGROUND_OVERLAY_ALPHA)
            .setDepth(-1);

        this.add.text(WIDTH / 2 + 4, 92 + 5, 'Arrastra los alimentos a su seccion', {
            fontFamily: FONT_DISPLAY,
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#77D39D',
            stroke: HEX.ink,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(18);

        this.add.text(WIDTH / 2, 92, 'Arrastra los alimentos a su seccion', {
            fontFamily: FONT_DISPLAY,
            fontSize: '56px',
            fontStyle: 'bold',
            color: HEX.white,
            stroke: HEX.ink,
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(19);

        this.createBackButton();

        // SECCIÓN ANIMAL
        const escalaCanasta  = 0.60;
        const canastaCentroY = visibleTop + (visibleBottom - visibleTop) * 0.65;

        this.animalSection = this.add.image(width / 2, canastaCentroY, 'inventario-animal')
            .setScale(escalaCanasta).setDepth(2);

        this.lblAnimal = this.add.text(width / 2, canastaCentroY + this.animalSection.displayHeight / 2 + 40,
            'Origen Animal', {
                fontFamily: FONT_DISPLAY,
                fontSize: '56px',
                fontStyle: 'bold',
                color: HEX.white,
                stroke: HEX.ink,
                strokeThickness: 4,
            }
        ).setOrigin(0.5).setDepth(18);

        const dzW = this.animalSection.displayWidth;
        const dzH = this.animalSection.displayHeight;
        this.dropZone = this.add.zone(width / 2, canastaCentroY, dzW, dzH)
            .setRectangleDropZone(dzW, dzH).setDepth(4);
        this.dropZone.setData('categoria', 'animal');

        this.startSectionIdleAnim(this.animalSection);

        // BOTÓN PAUSA
        
        PrefabButtons.icono(this, 1800, 90, () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { previousScene: this.scene.key });
        }, {
            width:60,
            height:60,
            text: 'II',
            fontSize: '28px'
        }).setDepth(20);
        // TIMER
        const timerX = 1700;
        const timerY = height / 2;
        const timerPanelWidth = 250;
        const timerPanelHeight = 148;
        const timerPanelCenterY = timerY + 34;

        this.add.rectangle(timerX + 8, timerPanelCenterY + 8, timerPanelWidth, timerPanelHeight, COLORS.ink, 0.9)
            .setDepth(18);
        this.add.rectangle(timerX, timerPanelCenterY, timerPanelWidth, timerPanelHeight, COLORS.paper, 0.96)
            .setStrokeStyle(4, COLORS.ink)
            .setDepth(19);
        this.add.rectangle(timerX, timerPanelCenterY - timerPanelHeight / 2 + 14, timerPanelWidth - 18, 12, COLORS.green, 1)
            .setDepth(19);

        this.add.text(timerX, timerY + 10, 'TIEMPO', {
            fontSize: '34px', color: '#ffffff', fontFamily: FONT_DISPLAY, fontStyle: 'bold',
            stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20);

        this.timerText = this.add.text(timerX, timerY + 53, '60', {
            fontSize: '50px', color: '#ffffff', fontFamily: FONT_MONO,
            fontStyle: 'bold', stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20);

        this.timerWarningText = this.add.text(timerX, timerY + 94, '¡Faltan 20 segundos!', {
            fontSize: '22px', color: '#ffffff', fontFamily: FONT_MONO,
            fontStyle: 'bold', stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // VIDAS
        const livesX = timerX;
        const livesPanelWidth = 250;
        const livesPanelHeight = 112;
        const livesPanelCenterY = timerPanelCenterY + timerPanelHeight + 100;
        const livesY = livesPanelCenterY - 22;

        this.add.rectangle(livesX + 8, livesPanelCenterY + 8, livesPanelWidth, livesPanelHeight, COLORS.ink, 0.9)
            .setDepth(18);
        this.add.rectangle(livesX, livesPanelCenterY, livesPanelWidth, livesPanelHeight, COLORS.paper, 0.96)
            .setStrokeStyle(4, COLORS.ink)
            .setDepth(19);
        this.add.rectangle(livesX, livesPanelCenterY - livesPanelHeight / 2 + 14, livesPanelWidth - 18, 12, COLORS.animal, 1)
            .setDepth(19);

        this.add.text(livesX, livesY+10, 'VIDAS', {
            fontSize: '34px', color: '#ffffff', fontFamily: FONT_DISPLAY, fontStyle: 'bold',
            stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20);
        this.livesText = this.add.text(livesX, livesY + 44, '♥ ♥ ♥', {
            fontSize: '36px', color: '#ff4444', fontFamily: FONT_MONO,
            fontStyle: 'bold', stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20);

        this.platon = this.add.image(width - 200, visibleBottom - 100, 'platon-feliz').setAlpha(0).setScale(0.8);

        this.buildFoodBarShell(width, visibleTop);
        this.setupDragDrop();

        this.events.once('shutdown', () => this.stopTimer());

        // Check for wave checkpoint (game-over in wave 2+)
        const checkpoint = this.registry.get('nivel3_checkpoint') as {
            waveNumber: number;
            remainingAnimal: FoodItem[];
            junkPool: FoodItem[];
            savedInventory?: { id: string, categoria: string }[];
        } | undefined;

        if (checkpoint) {
            this.registry.remove('nivel3_checkpoint');
            this.remainingAnimal = [...checkpoint.remainingAnimal];
            this.junkPool        = [...checkpoint.junkPool];
            // startNextWave increments waveNumber, so set to one before the saved wave
            this.waveNumber = checkpoint.waveNumber - 1;
            
            if (checkpoint.savedInventory) {
                this.restoreInventory(checkpoint.savedInventory);
            }
            
            this.time.delayedCall(400, () => this.startNextWave());
        } else if (this.registry.get('introCompleted_Nivel3')) {
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
            fontSize: 30,
            clickSoundKey: 'sonido-click',
            depth: 20,
        });
    }

    private returnToFoodGrid(): void {
        this.stopTimer();

        if (window.showTutorial) {
            this.scene.pause();
            window.showTutorial(['animal'], {
                title: 'Origen Animal',
                nextScene: 'Nivel3Scene',
                finishLabel: 'Volver al Nivel 3',
            });
            return;
        }

        this.scene.start('LevelSelectScene');
    }



    private initWavePools() {
        const allAnimal = nutritionalInfo.filter(f => f.category === 'animal');
        const allJunk   = nutritionalInfo.filter(f => f.category !== 'animal');

        this.remainingAnimal = Phaser.Utils.Array.Shuffle([...allAnimal]) as FoodItem[];
        this.junkPool        = Phaser.Utils.Array.Shuffle([...allJunk])   as FoodItem[];

        // Huevo primero en oleada 1
        const eggIdx = this.remainingAnimal.findIndex(f => f.id === 'egg');
        if (eggIdx > 0) {
            const [egg] = this.remainingAnimal.splice(eggIdx, 1);
            this.remainingAnimal.unshift(egg);
        }
        this.startNextWave();
    }

    private startNextWave() {
        this.waveNumber++;
        this.waveAciertos   = 0;
        this.waveInProgress = false;

        // Save checkpoint BEFORE splicing the pools
        this.waveCheckpoint = {
            waveNumber:     this.waveNumber,
            remainingAnimal: [...this.remainingAnimal],
            junkPool:        [...this.junkPool],
            savedInventory:  this.placedFoods.map(f => ({ id: f.texture.key, categoria: f.getData("categoria") as string }))
        };

        // Reset foodContainer scroll position
        if (this.foodContainer) this.foodContainer.x = this.buildFoodBarViewportX();

        const proceed = () => {
            const aCount = Math.min(ANIMAL_PER_WAVE, this.remainingAnimal.length);
            this.waveCorrectTarget = aCount;

            const waveAnimal = this.remainingAnimal.splice(0, aCount);
            const waveJunk   = (Phaser.Utils.Array.Shuffle([...this.junkPool]) as FoodItem[]).slice(0, JUNK_PER_WAVE);

            let foods = Phaser.Utils.Array.Shuffle([...waveAnimal, ...waveJunk]) as FoodItem[];

            if (this.waveNumber === 1) {
                const ei = foods.findIndex(f => f.id === 'egg');
                if (ei > 0) { const [e] = foods.splice(ei, 1); foods = [e, ...foods]; }
            }

            const isLastWave = this.remainingAnimal.length === 0;

            this.clearFoodBar();
            this.populateFoodBar(foods);
            this.startTimer(isLastWave ? WAVE_TIME_LAST : WAVE_TIME_NORMAL);
            this.waveInProgress = true;
        };

        // Clear the basket if full (12 items), then proceed
        const animalFull = this.placedFoods.filter(f => f.getData('basket') === this.animalSection).length >= 12;
        if (animalFull) {
            this.clearBasketFoods(this.animalSection, proceed);
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

        if (this.remainingAnimal.length === 0) {
            this.registry.set('nivel3Completado', true);
            FlowProgressService.markCompleted('tutorialAnimalCompleted');
            
            const jugador = PlayerService.obtenerJugadorActivo();
            if (jugador) {
                const nuevosNiveles = new Set([...jugador.progreso.nivelesCompletados, 3]);
                PlayerService.actualizarProgreso(jugador.id, {
                    ...jugador.progreso,
                    nivelesCompletados: Array.from(nuevosNiveles)
                });
            }

            this.time.delayedCall(1000, () => showLevelCompleteOverlay(this, {
                title: '¡NIVEL COMPLETADO!',
                message: 'Completaste los 3 niveles. Vuelve al mapa para continuar.',
                buttonLabel: 'Volver al mapa',
                nextScene: 'LevelSelectScene',
                soundKey: 'level_win',
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
            fontSize: '52px', color: '#FFD700', fontFamily: FONT_DISPLAY,
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 7, align: 'center',
        }).setOrigin(0.5).setDepth(103).setAlpha(0);
        const msgTxt = this.add.text(cx - 60, cy + 40,
            '¡Identificaste los alimentos\nde origen animal de esta ronda!', {
                fontSize: '24px', color: '#ffffff', fontFamily: FONT_MONO,
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
            this.registry.set('nivel3_checkpoint', {
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
            fontSize: '64px', color: '#ff4444', fontFamily: FONT_DISPLAY,
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setDepth(101);
        this.add.text(width / 2, height / 2 + 5, reason, {
            fontSize: '28px', color: '#ffffff', fontFamily: FONT_MONO,
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(101);

        this.time.delayedCall(1000, () => {
            const restartTxt = this.add.text(width / 2, height / 2 + 72,
                'Toca aquí para intentarlo de nuevo', {
                    fontSize: '26px', color: '#ffdd88', fontFamily: FONT_DISPLAY,
                    fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
                }
            ).setOrigin(0.5).setDepth(101).setAlpha(0);
            this.tweens.add({ targets: restartTxt, alpha: 1, duration: 350 });
            this.tweens.add({ targets: restartTxt, alpha: { from: 1, to: 0.25 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 400 });
            this.input.once('pointerdown', () => this.scene.restart());
        });
    }

    private buildFoodBarShell(width: number, visibleTop: number = 0) {
        const barWidth     = Math.round(width * 0.82);
        const arrowWidth   = 64;
        const barLeft      = (width - barWidth) / 2;
        const viewportX    = barLeft + arrowWidth;
        const stripTop     = visibleTop + 140;
        const stripHeight  = 148;
        const stripCenterY = stripTop + stripHeight / 2;

        this.foodBarShadow = this.add.rectangle(width / 2 + 8, stripCenterY + 8, barWidth, stripHeight, COLORS.ink, 0.9)
            .setDepth(1);
        this.foodBarBg = this.add.rectangle(width / 2, stripCenterY, barWidth, stripHeight, COLORS.paper, 0.96)
            .setStrokeStyle(4, COLORS.ink)
            .setDepth(2);
        this.foodBarAccent = this.add.rectangle(width / 2, stripCenterY - stripHeight / 2 + 14, barWidth - 18, 12, COLORS.animal, 1)
            .setDepth(2);

        this.foodContainer = this.add.container(viewportX, visibleTop).setDepth(5);
    }

    private populateFoodBar(foods: FoodItem[]) {
        const { width } = this.scale;
        
        const barWidth    = Math.round(width * 0.82);
        const arrowWidth  = 64;
        const viewportW   = barWidth - arrowWidth * 2;

        const contentSpan = (foods.length - 1) * FOOD_ITEM_SPACING + FOOD_ITEM_SIZE;
        const xPad = Math.max(0, (viewportW - contentSpan) / 2);

        foods.forEach((cfg, index) => {
            const localX = xPad + FOOD_ITEM_SIZE / 2 + index * FOOD_ITEM_SPACING;
            const localY = 204;

            const categoria = cfg.category === 'animal' ? 'animal' : 'chatarra';

            const sprite = this.add.image(localX, localY, cfg.id)
                .setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE).setAlpha(0)
                .setInteractive({ useHandCursor: true });
            const tScaleX = sprite.scaleX, tScaleY = sprite.scaleY;
            sprite.setScale(0);

            const texto = this.add.text(localX, localY + FOOD_LABEL_OFFSET, cfg.nameES, {
                fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
                fontFamily: FONT_DISPLAY, stroke: '#5E412F', strokeThickness: 4,
            }).setOrigin(0.5).setAlpha(0);

            this.input.setDraggable(sprite);
            sprite.setData('categoria',   categoria);
            sprite.setData('localHomeX',  localX);
            sprite.setData('localHomeY',  localY);
            sprite.setData('lastValidX',  localX);
            sprite.setData('lastValidY',  localY);
            sprite.setData('fromFoodBar', true);
            sprite.setData('placed',      false);
            sprite.setData('texto',       texto);

            this.foodContainer.add([sprite, texto]);

            this.time.delayedCall(index * 160, () => {
                try { this.sound.play('carta-sonido'); } catch { void 0; }
                this.tweens.add({ targets: sprite, scaleX: tScaleX, scaleY: tScaleY, alpha: 1, duration: 260, ease: 'Back.easeOut' });
                this.tweens.add({ targets: texto, alpha: 1, duration: 200, delay: 120, ease: 'Power2' });
            });
        });
    }

    // ─── DRAG & DROP ─────────────────────────────────────────────────────────

    private setupDragDrop() {
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive) return;
            if (gameObject.getData('placed')) return;
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
            gameObject.setDepth(30);
            if (texto) texto.setDepth(31);
            this.children.bringToTop(gameObject);
            if (texto) this.children.bringToTop(texto);
            gameObject.setTint(0xdddddd);
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive) return;
            if (gameObject.getData('placed')) return;
            gameObject.x = pointer.worldX; gameObject.y = pointer.worldY;
            const texto = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (texto) { texto.x = pointer.worldX; texto.y = pointer.worldY + FOOD_LABEL_OFFSET; }
        });

        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive) return;
            if (!this.waveInProgress) return;
            if (gameObject.getData('placed')) return;

            const categoria = gameObject.getData('categoria') as string;

            if (categoria === 'animal') {
                const slot = this.findNearestFreeInventorySlot(this.animalSection, gameObject.x, gameObject.y, gameObject);
                if (slot) {
                    gameObject.x = slot.x; gameObject.y = slot.y;
                    const t = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
                    if (t) { t.x = slot.x; t.y = slot.y + FOOD_LABEL_OFFSET; }
                } else {
                    gameObject.clearTint(); this.returnToFoodBar(gameObject); return;
                }

                gameObject.clearTint();
                gameObject.setDepth(3);
                const placedTexto = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
                if (placedTexto) placedTexto.setDepth(3);
                this.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();
                gameObject.setData('placed',   true);
                gameObject.setData('basket',   this.animalSection);
                gameObject.setData('slotRelY', gameObject.y - this.animalSection.y);
                this.placedFoods.push(gameObject);

                try { this.sound.play('object_win'); } catch { void 0; }
                try { this.mostrarPlaton(true); } catch { void 0; }
                this.pulseSection();

                this.waveAciertos++;

                // Check if the basket is now full (12 items)
                const basketFull = this.placedFoods.filter(f => f.getData('basket') === this.animalSection).length >= 12;
                if (basketFull) {
                    this.time.delayedCall(800, () => this.clearBasketFoods(this.animalSection));
                }

                if (this.waveAciertos >= this.waveCorrectTarget) {
                    this.time.delayedCall(800, () => this.onWaveComplete());
                }
            } else {
                // Chatarra en zona animal → error
                gameObject.clearTint();
                try { this.sound.play('sonido-error'); } catch { void 0; }
                try { this.mostrarPlaton(false); } catch { void 0; }
                this.shakeWrongFood(gameObject);
                this.shakeWrongSection();
                this.showEducationalFeedback(categoria, 'animal');
                this.returnToFoodBar(gameObject);
                this.lives--;
                this.updateLivesDisplay();
                if (this.lives <= 0) {
                    this.waveInProgress = false;
                    this.stopTimer();
                    this.time.delayedCall(400, () => this.executeGameOver('¡Pusiste un alimento incorrecto!'));
                }
            }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
            if (this.isTutorialActive) return;
            if (gameObject.getData('placed')) return;
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
        const s = panel.scaleX;
        const slots: { x: number; y: number }[] = [];
        for (const ry of Nivel3Scene.SLOT_ROW_OFFSETS)
            for (const rx of Nivel3Scene.SLOT_COL_OFFSETS)
                slots.push({ x: panel.x + rx * s, y: panel.y + ry * s });
        return slots;
    }

    private findNearestFreeInventorySlot(
        panel: Phaser.GameObjects.Image, nearX: number, nearY: number,
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
            const targetPanel = this.animalSection;
            
            const sprite = this.add.image(0, 0, item.id)
                .setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE)
                .setAlpha(1);
            
            const nameES = nutritionalInfo.find(n => n.id === item.id)?.nameES || item.id;
            const texto = this.add.text(0, FOOD_LABEL_OFFSET, nameES, {
                fontSize: '15px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: FONT_DISPLAY,
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
                
                sprite.setDepth(3);
                texto.setDepth(3);
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
                    'Este es el nivel 3,\nAlimentos de Origen Animal.\nEn este nivel clasificarás\nlos alimentos de\norigen animal.',
                    { fontSize: '27px', color: '#000000', fontFamily: FONT_MONO, align: 'left', wordWrap: { width: 400 } }
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
                            this.registry.set('introCompleted_Nivel3', true);
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
            fontSize: '17px', color: '#f0a000', fontFamily: FONT_DISPLAY, fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(201).setAlpha(0);
        this.toastTxt = this.add.text(width / 2, toastY + 14, msg, {
            fontSize: '19px', color: '#ffffff', fontFamily: FONT_MONO,
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

    // ─── ANIMATIONS ───────────────────────────────────────────────────────────

    private startSectionIdleAnim(section: Phaser.GameObjects.Image) {
        const baseY = section.y;
        this.tweens.add({ targets: section, y: baseY - 9, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    private shakeWrongSection() {
        this.tweens.add({
            targets: this.animalSection,
            angle: 8,
            duration: 55,
            yoyo: true,
            repeat: 4,
            ease: 'Linear',
            onComplete: () => { this.animalSection.setAngle(0); },
        });
    }

    private pulseSection() {
        const sx = this.animalSection.scaleX, sy = this.animalSection.scaleY;
        this.tweens.add({
            targets: this.animalSection,
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

        if (this.platon && !this.tweens.isTweening(this.platon)) {
            if (this.platon.x < width / 2) {
                this.platon.setX(visibleLeft + 300);
            } else {
                this.platon.setX(visibleLeft + visibleWidth - 200);
            }
        }

        const canastaCentroY = visibleTop + (visibleBottom - visibleTop) * 0.65;
        if (this.animalSection) {
            this.animalSection.setY(canastaCentroY);
            if (this.lblAnimal) this.lblAnimal.setY(canastaCentroY + this.animalSection.displayHeight / 2 + 40);
        }

        if (this.foodBarBg) {
            const stripTop = visibleTop + 140;
            const stripHeight = 148;
            const stripCenterY = stripTop + stripHeight / 2;
            this.foodBarShadow.setY(stripCenterY + 8);
            this.foodBarBg.setY(stripCenterY);
            this.foodBarAccent.setY(stripCenterY - stripHeight / 2 + 14);
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



        if (this.dropZone) {
            this.dropZone.y = this.animalSection.y + this.dzOffY;
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
