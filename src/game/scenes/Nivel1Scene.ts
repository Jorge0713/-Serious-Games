import * as Phaser from 'phaser';
import { createDebugSkipButton } from '../systems/DebugSkipButton';
import { showLevelCompleteOverlay } from '../systems/LevelCompleteOverlay';
import { nutritionalInfo } from '../../data/nutritionalInfo';
import type { FoodItem } from '../../data/nutritionalInfo';
import { getErrorMessage } from '../../data/errorMessages';

const FOOD_ITEM_SIZE      = 70;
const FOOD_ITEM_SPACING   = 125;
const FOOD_LABEL_OFFSET   = 48;
const WAVE_SIZE           = 10;
const VERDURAS_PER_WAVE   = 4;
const FRUTAS_PER_WAVE     = 4;
const WAVE_TIME_NORMAL    = 60;
const WAVE_TIME_LAST      = 30;

export class Nivel1Scene extends Phaser.Scene {
    private fondo_cocina!: Phaser.GameObjects.Image;
    private platon!: Phaser.GameObjects.Image;
    private segmentoVerduras!: Phaser.GameObjects.Image;
    private segmentoFrutas!: Phaser.GameObjects.Image;
    private foodContainer!: Phaser.GameObjects.Container;
    private placedFoods: Phaser.GameObjects.Image[] = [];
    private isTutorialActive = false;

    // Wave state
    private waveNumber       = 0;
    private waveCorrectTarget = 0;
    private waveAciertos     = 0;
    private remainingVerduras: FoodItem[] = [];
    private remainingFrutas:   FoodItem[] = [];
    private seboPool:          FoodItem[] = [];
    private waveInProgress   = false;

    // Timer
    private timerSeconds = WAVE_TIME_NORMAL;
    private timerEvent?: Phaser.Time.TimerEvent;
    private timerText!: Phaser.GameObjects.Text;
    private timerWarningText!: Phaser.GameObjects.Text;
    private tickingSound?: Phaser.Sound.BaseSound;
    private urgentMode = false;

    // Lives
    private lives = 2;
    private livesText!: Phaser.GameObjects.Text;

    // Basket drop zones (synced every frame to follow bobbing baskets)
    private zonaBordeVerduras!: Phaser.GameObjects.Zone;
    private zonaVerduras!:      Phaser.GameObjects.Zone;
    private zvOffY = 0;
    private zonaBordeFrutas!:   Phaser.GameObjects.Zone;
    private zonaFrutas!:        Phaser.GameObjects.Zone;
    private zfOffY = 0;

    // Tutorial interactivo
    private tutorialCarrot?:    Phaser.GameObjects.Image;
    private tutorialHand?:      Phaser.GameObjects.Image;
    private tutorialHighlight?: Phaser.GameObjects.Rectangle;
    private tutorialGhostCarrot?: Phaser.GameObjects.Image;
    private tutorialBubble?:    Phaser.GameObjects.Graphics;
    private tutorialBubbleTxt?: Phaser.GameObjects.Text;
    private isTutorialDragging = false;

    // Educational feedback toast (only one at a time)
    private toastBg?:    Phaser.GameObjects.Rectangle;
    private toastLabel?: Phaser.GameObjects.Text;
    private toastTxt?:   Phaser.GameObjects.Text;
    private toastTimer?: Phaser.Time.TimerEvent;

    // UI Elements for resizing
    private txtInstrucciones!: Phaser.GameObjects.Text;
    private txtTiempo!: Phaser.GameObjects.Text;
    private txtVidas!: Phaser.GameObjects.Text;
    private lblVerduras!: Phaser.GameObjects.Text;
    private lblFrutas!: Phaser.GameObjects.Text;
    private foodBarBg!: Phaser.GameObjects.Rectangle;
    private lastWindowWidth = 0;
    private lastWindowHeight = 0;

    constructor() {
        super('Nivel1Scene');
    }

    init() {
        this.isTutorialActive = false;
        this.tutorialCarrot = undefined;
        this.tutorialHand = undefined;
        this.tutorialHighlight = undefined;
        this.tutorialGhostCarrot = undefined;
        this.tutorialBubble = undefined;
        this.tutorialBubbleTxt = undefined;
        this.isTutorialDragging = false;
        this.toastTimer = undefined;
        this.lastWindowWidth = 0;
        this.lastWindowHeight = 0;
    }

    preload() {
        this.load.image("Fondo-cocina", "/assets/Backgrounds/Fondo_Cocina.png");
        this.load.image("canasta1", "/assets/Plato/Canasta1.png");
        this.load.image("inventario_verduras", "/assets/Plato/inventoryVegetables.webp");
        this.load.image("inventario_frutas", "/assets/Plato/inventoryFruits.webp");
        this.load.image("platon-feliz", "/assets/Platon/platon_feliz.png");
        this.load.image("platon-triste","/assets/Platon/platon_triste.png");
        this.load.image("manita",       "/assets/Backgrounds/manita.png");
        this.load.audio("object_win",   "/Sound/ObjectWIN.mp3");
        this.load.audio("sonido-error", "/Sound/incorrecto.mp3");
        this.load.audio("sonido-click", "/Sound/Click.mp3");
        this.load.audio("carta-sonido", "/Sound/CartaSound.mp3");
        this.load.audio("reloj-tic",    "/Sound/Clock.mp3");

        nutritionalInfo.forEach(food => {
            this.load.image(food.id, food.image);
        });
    }

    create() {
        this.placedFoods    = [];
        this.waveNumber     = 0;
        this.waveAciertos   = 0;
        this.waveInProgress = false;
        this.lives          = 2;

        const { width, height } = this.scale;
        
        // Calcular área visible real (modo ENVELOP)
        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleTop = (height - window.innerHeight / screenScale) / 2;
        const visibleLeft = (width - window.innerWidth / screenScale) / 2;
        const visibleWidth = window.innerWidth / screenScale;
        const visibleBottom = visibleTop + window.innerHeight / screenScale;

        // FONDO
        this.fondo_cocina = this.add.image(width / 2, height / 2, "Fondo-cocina")
            .setScale(0.5)
            .setDisplaySize(width, height);
        void this.fondo_cocina;

        // INSTRUCCIÓN (posicionado relativo al top visible, dejando espacio para el botón Volver de React)
        this.txtInstrucciones = this.add.text(width / 2, visibleTop + 75, 'Arrastra las frutas y verduras a su canasta', {
            fontSize: '32px',
            color: '#000',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        createDebugSkipButton(this, {
            label: 'Saltar a Nivel 2',
            nextScene: 'Nivel2Scene',
            soundKey: 'sonido-click',
        });

        // CANASTAS + ZONAS
        const escalaCanasta = 0.60;
        const canastaCentroY = visibleTop + (visibleBottom - visibleTop) * 0.65;

        const segmentoVerduras = this.segmentoVerduras = this.add.image(width / 2 - 300, canastaCentroY, "inventario_verduras")
            .setScale(escalaCanasta);

        const zvBordW = segmentoVerduras.displayWidth  * 1;
        const zvBordH = segmentoVerduras.displayHeight * 1;
        this.zonaBordeVerduras = this.add.zone(
            segmentoVerduras.x, segmentoVerduras.y, zvBordW, zvBordH
        ).setRectangleDropZone(zvBordW, zvBordH);
        this.zonaBordeVerduras.setData("categoria", "verdura");

        const zvW = segmentoVerduras.displayWidth  * 0.75;
        const zvH = segmentoVerduras.displayHeight * 0.75;
        this.zvOffY = segmentoVerduras.displayHeight * 0.03;
        this.zonaVerduras = this.add.zone(
            segmentoVerduras.x, segmentoVerduras.y + this.zvOffY, zvW, zvH
        ).setRectangleDropZone(zvW, zvH);
        this.zonaVerduras.setData("categoria", "verdura");
        this.zonaBordeVerduras.setData("snapToZone", this.zonaVerduras);

        const segmentoFrutas = this.segmentoFrutas = this.add.image(width / 2 + 300, canastaCentroY, "inventario_frutas")
            .setScale(escalaCanasta);

        const zfBordW = segmentoFrutas.displayWidth  * 1;
        const zfBordH = segmentoFrutas.displayHeight * 1;
        this.zonaBordeFrutas = this.add.zone(
            segmentoFrutas.x, segmentoFrutas.y, zfBordW, zfBordH
        ).setRectangleDropZone(zfBordW, zfBordH);
        this.zonaBordeFrutas.setData("categoria", "fruta");

        const zfW = segmentoFrutas.displayWidth  * 0.75;
        const zfH = segmentoFrutas.displayHeight * 0.75;
        this.zfOffY = segmentoFrutas.displayHeight * 0.03;
        this.zonaFrutas = this.add.zone(
            segmentoFrutas.x, segmentoFrutas.y + this.zfOffY, zfW, zfH
        ).setRectangleDropZone(zfW, zfH);
        this.zonaFrutas.setData("categoria", "fruta");
        this.zonaBordeFrutas.setData("snapToZone", this.zonaFrutas);

        // LABELS canastas
        const tipStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '22px', color: '#ffffff', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#5E412F', strokeThickness: 5,
        };
        this.lblVerduras = this.add.text(
            segmentoVerduras.x,
            segmentoVerduras.y + segmentoVerduras.displayHeight / 2 + 12,
            'TU CANASTA DE VERDURAS', tipStyle
        ).setOrigin(0.5).setDepth(3);
        this.lblFrutas = this.add.text(
            segmentoFrutas.x,
            segmentoFrutas.y + segmentoFrutas.displayHeight / 2 + 12,
            'TU CANASTA DE FRUTAS', tipStyle
        ).setOrigin(0.5).setDepth(3);

        // CANASTA IDLE ANIMATIONS
        this.startBasketIdleAnim(this.segmentoVerduras, 0);
        this.startBasketIdleAnim(this.segmentoFrutas, 450);

        // TIMER
        this.txtTiempo = this.add.text(visibleLeft + visibleWidth - 110, visibleTop + 60, 'TIEMPO', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(20);

        this.timerText = this.add.text(visibleLeft + visibleWidth - 110, visibleTop + 90, '60', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#5E412F', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(20);

        this.timerWarningText = this.add.text(visibleLeft + visibleWidth - 110, visibleTop + 126, '¡Faltan 20 segundos!', {
            fontSize: '13px', color: '#ffaa00', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // VIDAS (Empujado a la derecha para no chocar con Volver)
        this.txtVidas = this.add.text(visibleLeft + 220, visibleTop + 60, 'VIDAS', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(20);

        this.livesText = this.add.text(visibleLeft + 220, visibleTop + 90, '♥ ♥', {
            fontSize: '30px', color: '#ff4444', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0, 0.5).setDepth(20);

        // PLATÓN
        this.platon = this.add.image(width - 200, visibleBottom - 100, "platon-feliz")
            .setAlpha(0).setScale(0.8);

        // FOOD BAR (shell: background + buttons + container)
        this.buildFoodBarShell(width, visibleTop);

        // DRAG & DROP
        this.setupDragDrop();

        this.events.once('shutdown', () => this.stopTimer());

        // INTRO PLATÓN → luego oleadas → luego tutorial mano
        if (this.registry.get('tutorialCompleted_Nivel1')) {
            this.time.delayedCall(400, () => this.initWavePools());
        } else {
            this.time.delayedCall(400, () => this.showIntroPlaton());
        }
    }

    // ─── WAVE SYSTEM ──────────────────────────────────────────────────────────

    private initWavePools() {
        const allVerduras = nutritionalInfo.filter(f => f.category === 'vegetable');
        const allFrutas   = nutritionalInfo.filter(f => f.category === 'fruit');
        const allSebos    = nutritionalInfo.filter(f => f.category !== 'vegetable' && f.category !== 'fruit');

        this.remainingVerduras = Phaser.Utils.Array.Shuffle([...allVerduras]) as FoodItem[];
        this.remainingFrutas   = Phaser.Utils.Array.Shuffle([...allFrutas])   as FoodItem[];
        this.seboPool          = Phaser.Utils.Array.Shuffle([...allSebos])    as FoodItem[];

        // Zanahoria primero en oleada 1 para el tutorial
        const carrotIdx = this.remainingVerduras.findIndex(f => f.id === 'carrot');
        if (carrotIdx > 0) {
            const [carrot] = this.remainingVerduras.splice(carrotIdx, 1);
            this.remainingVerduras.unshift(carrot);
        }

        this.startNextWave();
    }

    private startNextWave() {
        this.waveNumber++;
        this.waveAciertos   = 0;
        this.waveInProgress = false;

        this.clearPlacedFoods(() => {
            const { foods, correctCount } = this.pickWaveFoods();
            this.waveCorrectTarget = correctCount;

            const isLastWave = this.remainingVerduras.length === 0 && this.remainingFrutas.length === 0;

            this.clearFoodBar();
            this.populateFoodBar(foods);
            this.startTimer(isLastWave ? WAVE_TIME_LAST : WAVE_TIME_NORMAL);

            this.waveInProgress = true;
        });
    }

    private pickWaveFoods(): { foods: FoodItem[], correctCount: number } {
        const numVerduras = Math.min(VERDURAS_PER_WAVE, this.remainingVerduras.length);
        const numFrutas   = Math.min(FRUTAS_PER_WAVE,   this.remainingFrutas.length);

        const waveVerduras = this.remainingVerduras.splice(0, numVerduras);
        const waveFrutas   = this.remainingFrutas.splice(0, numFrutas);
        const correctCount = numVerduras + numFrutas;

        const sebosNeeded  = WAVE_SIZE - correctCount;
        const waveSebos    = (Phaser.Utils.Array.Shuffle([...this.seboPool]) as FoodItem[]).slice(0, sebosNeeded);

        const mixed = [...waveVerduras, ...waveFrutas, ...waveSebos];

        // Oleada 1: zanahoria en índice 0 para el tutorial
        if (this.waveNumber === 1) {
            const ci = mixed.findIndex(f => f.id === 'carrot');
            if (ci > 0) {
                const [c] = mixed.splice(ci, 1);
                mixed.unshift(c);
            }
            return { foods: mixed, correctCount };
        }

        return { foods: Phaser.Utils.Array.Shuffle(mixed) as FoodItem[], correctCount };
    }

    private clearPlacedFoods(onDone: () => void) {
        if (this.placedFoods.length === 0) { onDone(); return; }

        // Stop per-frame Y sync before tweening so there's no conflict
        this.placedFoods.forEach(s => { s.setData('basket', undefined); s.setData('slotRelY', undefined); });

        const targets: Phaser.GameObjects.GameObject[] = [];
        this.placedFoods.forEach(sprite => {
            const texto = sprite.getData("texto") as Phaser.GameObjects.Text | undefined;
            if (texto) targets.push(texto);
            targets.push(sprite);
        });

        this.tweens.add({
            targets,
            alpha: 0,
            y: '-=40',
            duration: 350,
            ease: 'Power2',
            onComplete: () => {
                targets.forEach(obj => obj.destroy());
                this.placedFoods = [];
                onDone();
            }
        });
    }

    private clearFoodBar() {
        if (!this.foodContainer) return;
        [...this.foodContainer.list].forEach(child => {
            (child as Phaser.GameObjects.GameObject).destroy();
        });
        this.foodContainer.removeAll(false);
    }

    private populateFoodBar(foods: FoodItem[]) {
        const { width } = this.scale;
        
        const barWidth   = Math.round(width * 0.82);
        const arrowWidth = 64;
        const viewportW  = barWidth - arrowWidth * 2;

        // Ancho real del contenido (de borde a borde del primer y último alimento)
        const contentSpan = (foods.length - 1) * FOOD_ITEM_SPACING + FOOD_ITEM_SIZE;
        // Padding izquierdo para centrar cuando el contenido es más angosto que el viewport
        const xPad = Math.max(0, (viewportW - contentSpan) / 2);

        foods.forEach((item, index) => {
            const localX = xPad + FOOD_ITEM_SIZE / 2 + index * FOOD_ITEM_SPACING;
            const localY = 204;

            const categoria = item.category === 'vegetable' ? 'verdura'
                            : item.category === 'fruit'     ? 'fruta'
                            : 'sebo';

            // Sprite en su posición final; animación pop desde escala 0
            const sprite = this.add.image(localX, localY, item.id)
                .setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE)
                .setAlpha(0)
                .setInteractive({ useHandCursor: true });

            // Guardar escala destino antes de poner a 0
            const tScaleX = sprite.scaleX;
            const tScaleY = sprite.scaleY;
            sprite.setScale(0);

            const texto = this.add.text(localX, localY + FOOD_LABEL_OFFSET, item.nameES, {
                fontSize: '15px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial, sans-serif',
                stroke: '#5E412F',
                strokeThickness: 4,
            }).setOrigin(0.5).setAlpha(0);

            this.input.setDraggable(sprite);

            sprite.setData("categoria",   categoria);
            sprite.setData("localHomeX",  localX);
            sprite.setData("localHomeY",  localY);
            sprite.setData("originalX",   localX);
            sprite.setData("originalY",   localY);
            sprite.setData("lastValidX",  localX);
            sprite.setData("lastValidY",  localY);
            sprite.setData("fromFoodBar", true);
            sprite.setData("texto",       texto);

            this.foodContainer.add([sprite, texto]);

            // Animación carta: aparece de la nada (pop) con delay escalonado
            this.time.delayedCall(index * 160, () => {
                try { this.sound.play("carta-sonido"); } catch { void 0; }
                this.tweens.add({
                    targets: sprite,
                    scaleX: tScaleX, scaleY: tScaleY, alpha: 1,
                    duration: 260, ease: 'Back.easeOut',
                });
                this.tweens.add({
                    targets: texto,
                    alpha: 1,
                    duration: 200, delay: 120, ease: 'Power2',
                });
            });
        });
    }

    // ─── TIMER ────────────────────────────────────────────────────────────────

    private startTimer(seconds: number) {
        this.timerSeconds = seconds;
        this.updateTimerDisplay();
        if (this.timerEvent) this.timerEvent.destroy();

        // Ticking clock sound
        this.urgentMode = false;
        if (this.tickingSound) { try { this.tickingSound.stop(); } catch { void 0; } }
        try {
            this.tickingSound = this.sound.add("reloj-tic", { loop: true, volume: 0.45 });
            this.tickingSound.play();
        } catch { void 0; }
        if (this.timerWarningText) this.timerWarningText.setVisible(false);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: seconds - 1,
            callback: () => {
                this.timerSeconds = Math.max(0, this.timerSeconds - 1);
                this.updateTimerDisplay();
                if (this.timerSeconds <= 0) this.onTimerExpire();
            }
        });
    }

    private stopTimer() {
        if (this.timerEvent) { this.timerEvent.destroy(); this.timerEvent = undefined; }
        if (this.tickingSound) {
            try { this.tickingSound.stop(); } catch { void 0; }
            this.tickingSound = undefined;
        }
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
                this.tweens.add({
                    targets: this.timerWarningText,
                    alpha: 0,
                    duration: 380,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        }
    }

    private onTimerExpire() {
        if (!this.waveInProgress) return;
        this.waveInProgress = false;
        this.stopTimer();
        this.executeGameOver('¡Se acabó el tiempo!');
    }

    // Muestra la pantalla de game over y reinicia — sin depender de waveInProgress
    private executeGameOver(reason: string) {
        this.isTutorialActive = false;
        try { this.sound.play("sonido-error"); } catch { void 0; }
        this.mostrarPlaton(false);

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
            this.tweens.add({
                targets: restartTxt, alpha: { from: 1, to: 0.25 },
                duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 400,
            });

            this.input.once('pointerdown', () => this.scene.restart());
        });
    }

    // ─── LIVES ────────────────────────────────────────────────────────────────

    private updateLivesDisplay() {
        if (!this.livesText) return;
        const hearts = Array(Math.max(0, this.lives)).fill('♥').join(' ');
        this.livesText.setText(hearts || '—');
        this.livesText.setColor(this.lives === 1 ? '#ff8800' : '#ff4444');
    }

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
        const toastY = height - 130;
        const toastW = 860;

        this.toastBg = this.add.rectangle(width / 2, toastY, toastW, 116, 0x1a100a)
            .setStrokeStyle(3, 0xf0a000, 1).setDepth(200).setAlpha(0);
        this.toastLabel = this.add.text(
            width / 2 - toastW / 2 + 22, toastY - 30,
            'Dato nutricional:',
            { fontSize: '17px', color: '#f0a000', fontFamily: 'Gill Sans MT', fontStyle: 'bold' }
        ).setOrigin(0, 0.5).setDepth(201).setAlpha(0);
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
        this.tweens.add({
            targets: food, angle: 7,
            duration: 60, yoyo: true, repeat: 3, ease: 'Linear',
            onComplete: () => { food.setAngle(0); },
        });
    }

    private flashCorrectBasket(itemCat: string) {
        const basket = itemCat === 'verdura' ? this.segmentoVerduras : this.segmentoFrutas;
        basket.setTint(0xffe066);
        this.time.delayedCall(620, () => { basket.clearTint(); });
    }

    // ─── WAVE COMPLETE ────────────────────────────────────────────────────────

    private onWaveComplete() {
        if (!this.waveInProgress) return;
        this.waveInProgress = false;
        this.stopTimer();

        const hasMoreWaves = this.remainingVerduras.length > 0 || this.remainingFrutas.length > 0;

        if (!hasMoreWaves) {
            this.time.delayedCall(1000, () => this.mostrarPantallaFinal());
            return;
        }

        this.showWaveCompleteOverlay(() => this.startNextWave());
    }

    private showWaveCompleteOverlay(onDone: () => void) {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        // Fondo oscuro
        const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.72)
            .setDepth(100).setAlpha(0);

        // Platón a la derecha
        const platonBig = this.add.image(width * 0.78, cy + 30, "platon-feliz")
            .setScale(0).setDepth(101);

        // Caja de texto centrada a la izquierda
        const titleTxt = this.add.text(cx - 60, cy - 90, '¡OLEADA\nCOMPLETADA!', {
            fontSize: '52px', color: '#FFD700', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 7, align: 'center',
        }).setOrigin(0.5).setDepth(103).setAlpha(0);

        const msgTxt = this.add.text(
            cx - 60, cy + 40,
            '¡Ganaste un nuevo conjunto de\nalimentos para armar tu gran plato!',
            {
                fontSize: '24px', color: '#ffffff', fontFamily: 'Arial',
                fontStyle: 'bold', stroke: '#000000', strokeThickness: 5, align: 'center',
            }
        ).setOrigin(0.5).setDepth(103).setAlpha(0);

        try { this.sound.play("object_win"); } catch { void 0; }

        this.tweens.add({ targets: overlay, alpha: 1, duration: 300 });
        this.tweens.add({ targets: [titleTxt, msgTxt], alpha: 1, duration: 400, delay: 200 });
        this.tweens.add({
            targets: platonBig, scaleX: 0.75, scaleY: 0.75,
            duration: 500, ease: 'Back.easeOut', delay: 150,
        });

        this.time.delayedCall(3200, () => {
            this.tweens.add({
                targets: [overlay, titleTxt, msgTxt, platonBig],
                alpha: 0, duration: 400,
                onComplete: () => {
                    overlay.destroy(); titleTxt.destroy(); msgTxt.destroy(); platonBig.destroy();
                    onDone();
                }
            });
        });
    }

    // ─── FOOD BAR SHELL ───────────────────────────────────────────────────────

    private buildFoodBarShell(width: number, visibleTop: number = 0) {
        const barWidth     = Math.round(width * 0.82);
        const arrowWidth   = 64;
        const barLeft      = (width - barWidth) / 2;
        const viewportX    = barLeft + arrowWidth;
        const stripTop     = visibleTop + 140; // Relativo al área visible
        const stripHeight  = 148;
        const stripCenterY = stripTop + stripHeight / 2;

        this.foodBarBg = this.add.rectangle(width / 2, stripCenterY, barWidth, stripHeight, 0xf7cc85, 0.82)
            .setStrokeStyle(4, 0x5E412F).setDepth(1);

        this.foodContainer = this.add.container(viewportX, visibleTop).setDepth(5);
    }

    // ─── DRAG & DROP ──────────────────────────────────────────────────────────

    private setupDragDrop() {
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive && gameObject !== this.tutorialCarrot) return;
            // Hide hand while user is actively dragging
            if (this.isTutorialActive && this.tutorialHand) {
                this.tweens.killTweensOf(this.tutorialHand);
                this.tutorialHand.setAlpha(0);
            }
            const texto = gameObject.getData("texto") as Phaser.GameObjects.Text | undefined;

            if (gameObject.getData("fromFoodBar")) {
                this.foodContainer.remove(gameObject, false);
                this.add.existing(gameObject);
                gameObject.x = pointer.worldX;
                gameObject.y = pointer.worldY;
                gameObject.setAlpha(1).setVisible(true);

                if (texto) {
                    this.foodContainer.remove(texto, false);
                    this.add.existing(texto);
                    texto.x = pointer.worldX;
                    texto.y = pointer.worldY + FOOD_LABEL_OFFSET;
                    texto.setDepth(31).setAlpha(1).setVisible(true);
                }
            }

            this.children.bringToTop(gameObject);
            if (texto) this.children.bringToTop(texto);
            gameObject.setTint(0xdddddd);
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (this.isTutorialActive && gameObject !== this.tutorialCarrot) return;
            gameObject.x = pointer.worldX;
            gameObject.y = pointer.worldY;
            const texto = gameObject.getData("texto");
            if (texto) { texto.x = pointer.worldX; texto.y = pointer.worldY + FOOD_LABEL_OFFSET; }
        });

        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
            if (this.isTutorialActive) {
                if (gameObject === this.tutorialCarrot) this.handleTutorialDrop(gameObject, dropZone);
                return;
            }
            if (!this.waveInProgress) return;

            const categoriaItem = gameObject.getData("categoria") as string;
            const categoriaZona = dropZone.getData("categoria")   as string;

            if (categoriaItem === categoriaZona) {
                // Siempre snapeamos al slot de inventario libre más cercano
                const targetPanel = categoriaZona === 'verdura' ? this.segmentoVerduras : this.segmentoFrutas;
                const slot = this.findNearestFreeInventorySlot(targetPanel, gameObject.x, gameObject.y, gameObject);
                if (slot) {
                    gameObject.x = slot.x;
                    gameObject.y = slot.y;
                    const textoSlot = gameObject.getData("texto") as Phaser.GameObjects.Text | undefined;
                    if (textoSlot) { textoSlot.x = slot.x; textoSlot.y = slot.y + FOOD_LABEL_OFFSET; }
                } else {
                    gameObject.clearTint();
                    this.returnToFoodBar(gameObject);
                    return;
                }

                // ACIERTO
                gameObject.clearTint();
                this.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();
                gameObject.setData("placed",      true);
                gameObject.setData("lastValidX",  gameObject.x);
                gameObject.setData("lastValidY",  gameObject.y);
                gameObject.setData("basket",      targetPanel);
                gameObject.setData("slotRelY",    gameObject.y - targetPanel.y);
                this.placedFoods.push(gameObject);

                try { this.sound.play("object_win"); } catch { void 0; }
                try { this.mostrarPlaton(true); } catch { void 0; }

                if (categoriaItem === 'verdura' || categoriaItem === 'fruta') {
                    this.pulseBasket(categoriaZona === 'verdura' ? this.segmentoVerduras : this.segmentoFrutas);
                    this.waveAciertos++;
                    if (this.waveAciertos >= this.waveCorrectTarget) {
                        this.time.delayedCall(800, () => this.onWaveComplete());
                    }
                }

            } else {
                // ERROR
                gameObject.clearTint();
                try { this.sound.play("sonido-error"); } catch { void 0; }
                try { this.mostrarPlaton(false); } catch { void 0; }

                if (categoriaItem === 'verdura' || categoriaItem === 'fruta') {
                    // Fruta/verdura en zona incorrecta → sacudir la canasta equivocada, mostrar pista, perder vida
                    this.shakeWrongFood(gameObject);
                    const dropZoneBasket = categoriaZona === 'verdura' ? this.segmentoVerduras : this.segmentoFrutas;
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
                    // Sebo → sacudir, mostrar pista, regresa a la barra
                    this.shakeWrongFood(gameObject);
                    this.showEducationalFeedback(categoriaItem, categoriaZona);
                    this.returnToFoodBar(gameObject);
                }
            }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
            if (this.isTutorialActive) {
                if (gameObject === this.tutorialCarrot && !dropped) {
                    gameObject.clearTint();
                    this.returnToFoodBar(gameObject);
                    this.showTutWrongHint();
                }
                return;
            }
            if (!dropped) {
                gameObject.clearTint();
                this.returnToFoodBar(gameObject);
            }
        });
    }

    // ─── RETURN TO BAR ────────────────────────────────────────────────────────

    private returnToFoodBar(gameObject: Phaser.GameObjects.Image) {
        const texto      = gameObject.getData("texto")      as Phaser.GameObjects.Text | undefined;
        const localHomeX = gameObject.getData("localHomeX") as number;
        const localHomeY = gameObject.getData("localHomeY") as number;
        const targetWorldX = this.foodContainer.x + localHomeX;
        const targetWorldY = this.foodContainer.y + localHomeY;

        this.tweens.add({
            targets: gameObject,
            x: targetWorldX, y: targetWorldY,
            duration: 300, ease: 'Power2',
            onComplete: () => {
                this.children.remove(gameObject);
                gameObject.x = localHomeX;
                gameObject.y = localHomeY;
                gameObject.clearTint();
                this.foodContainer.add(gameObject);
            }
        });

        if (!texto) return;
        this.tweens.add({
            targets: texto,
            x: targetWorldX, y: targetWorldY + FOOD_LABEL_OFFSET,
            duration: 300, ease: 'Power2',
            onComplete: () => {
                this.children.remove(texto);
                texto.x = localHomeX;
                texto.y = localHomeY + FOOD_LABEL_OFFSET;
                this.foodContainer.add(texto);
            }
        });
    }

    // ─── INVENTORY SLOTS ─────────────────────────────────────────────────────
    // Imagen 784×680 px, centro en (392, 340).
    // 4 columnas × 3 filas. Offsets en píxeles nativos desde el centro.
    private static readonly SLOT_COL_OFFSETS = [-240, -80, 80, 240];
    private static readonly SLOT_ROW_OFFSETS = [-154,  12,  185];

    private getInventorySlotPositions(panel: Phaser.GameObjects.Image): { x: number; y: number }[] {
        const s = panel.scaleX;
        const slots: { x: number; y: number }[] = [];
        for (const ry of Nivel1Scene.SLOT_ROW_OFFSETS) {
            for (const rx of Nivel1Scene.SLOT_COL_OFFSETS) {
                slots.push({ x: panel.x + rx * s, y: panel.y + ry * s });
            }
        }
        return slots;
    }

    private findNearestFreeInventorySlot(
        panel: Phaser.GameObjects.Image,
        nearX: number, nearY: number,
        excluding?: Phaser.GameObjects.Image
    ): { x: number; y: number } | null {
        const slots    = this.getInventorySlotPositions(panel);
        const occupied = this.placedFoods
            .filter(p => p !== excluding)
            .map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));

        let best: { x: number; y: number } | null = null;
        let bestDist = Infinity;

        for (const slot of slots) {
            const taken = occupied.some(
                o => Math.abs(o.x - slot.x) < 12 && Math.abs(o.y - slot.y) < 12
            );
            if (taken) continue;
            const dist = Math.hypot(nearX - slot.x, nearY - slot.y);
            if (dist < bestDist) { bestDist = dist; best = slot; }
        }
        return best;
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    private repositionUI() {
        const { width, height } = this.scale;
        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleTop = (height - window.innerHeight / screenScale) / 2;
        const visibleLeft = (width - window.innerWidth / screenScale) / 2;
        const visibleWidth = window.innerWidth / screenScale;
        const visibleBottom = visibleTop + window.innerHeight / screenScale;

        if (this.txtInstrucciones) this.txtInstrucciones.setY(visibleTop + 75);
        
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
        if (this.segmentoVerduras) {
            this.segmentoVerduras.setY(canastaCentroY);
            if (this.lblVerduras) this.lblVerduras.setY(canastaCentroY + this.segmentoVerduras.displayHeight / 2 + 40);
        }
        if (this.segmentoFrutas) {
            this.segmentoFrutas.setY(canastaCentroY);
            if (this.lblFrutas) this.lblFrutas.setY(canastaCentroY + this.segmentoFrutas.displayHeight / 2 + 40);
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




    private showIntroPlaton() {
        this.isTutorialActive = true;
        const { width, height } = this.scale;

        // Platón inicia fuera de pantalla por la derecha, invisible
        this.platon
            .setTexture('platon-feliz')
            .setScale(0.8)
            .setPosition(width + 300, height - 250)
            .setAlpha(0)
            .setDepth(10);

        // Se arrastra hacia la izquierda hasta el lado izquierdo del plato
        this.tweens.add({
            targets: this.platon,
            x: 300,
            alpha: 1,
            duration: 850,
            ease: 'Power2.easeOut',
            onComplete: () => {
                const cx  = 700;
                const cy  = height - 630;

                const txt = this.add.text(cx, cy,
                    'Este es el nivel 1,\nVerduras vs Frutas.\nEn este nivel desbloquearás\ntus lotes de alimentos del\ntipo verduras y frutas.',
                    {
                        fontSize: '27px',
                        color: '#000000',
                        fontFamily: 'Gill Sans MT',
                        align: 'left',
                        wordWrap: { width: 400 },
                    }
                ).setOrigin(0.5).setDepth(12).setAlpha(0);

                const pad = 24;
                const bx  = cx - txt.width  / 2 - pad;
                const by  = cy - txt.height / 2 - pad;
                const bw  = txt.width  + pad * 2;
                const bh  = txt.height + pad * 2;

                const bubble = this.add.graphics().setDepth(11).setAlpha(0);
                // Cola del globo (se dibuja primero para que el rect tape el borde superior)
                bubble.fillStyle(0xFFFAED, 0.97);
                bubble.fillTriangle(bx + 40, by + bh, bx + 85, by + bh, bx - 20, by + bh + 58);
                // Cuerpo del globo
                bubble.fillRoundedRect(bx, by, bw, bh, 18);
                bubble.lineStyle(4, 0x5E412F, 1);
                bubble.strokeRoundedRect(bx, by, bw, bh, 18);
                // Bordes expuestos de la cola
                bubble.beginPath();
                bubble.moveTo(bx + 40, by + bh);
                bubble.lineTo(bx - 20, by + bh + 58);
                bubble.lineTo(bx + 85, by + bh);
                bubble.strokePath();

                this.tweens.add({ targets: [bubble, txt], alpha: 1, duration: 400, delay: 100 });

                this.time.delayedCall(4500, () => {
                    this.tweens.add({
                        targets: [this.platon, txt, bubble],
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            bubble.destroy();
                            txt.destroy();
                            // Poblar barra; el timer arranca DESPUÉS del tutorial
                            this.initWavePools();
                            if (!this.registry.get('tutorialCompleted_Nivel1')) {
                                this.stopTimer();
                                this.waveInProgress = false;
                                this.time.delayedCall(700, () => this.startTutorial());
                            }
                        }
                    });
                });
            }
        });
    }

    // ─── TUTORIAL INTERACTIVO (3 pasos) ──────────────────────────────────────

    private startTutorial() {
        this.isTutorialActive = true;

        const carrot = this.foodContainer.list[0] as Phaser.GameObjects.Image;
        if (!carrot) { this.isTutorialActive = false; this.waveInProgress = true; this.startTimer(WAVE_TIME_NORMAL); return; }
        this.tutorialCarrot = carrot;

        // Solo la zanahoria es interactiva; habilitar arrastre desde el paso 1
        this.foodContainer.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Image) child.disableInteractive();
        });
        carrot.setInteractive({ useHandCursor: true });
        this.input.setDraggable(carrot, true);

        // Platón aparece en el lado izquierdo (ya está en x=220, alpha=0 tras el intro)
        this.platon.setTexture('platon-feliz').setDepth(10);
        this.tweens.add({ targets: this.platon, alpha: 1, duration: 600, ease: 'Power2.easeOut' });

        // Burbuja paso 1
        this.showTutBubble('Arrastra la zanahoria\na su canasta manteniendo\npresionado el click.');

        // Manita apuntando a la zanahoria
        const wx = this.foodContainer.x + carrot.x;
        const wy = this.foodContainer.y + carrot.y;
        this.tutorialHand = this.add.image(wx + 15, wy + 20, 'manita')
            .setDepth(50).setAlpha(0).setScale(1.1);

        // Resaltar el slot objetivo desde el inicio
        const slot = this.getInventorySlotPositions(this.segmentoVerduras)[0];
        this.tutorialHighlight = this.add.rectangle(slot.x, slot.y, 84, 84, 0x76ff76, 0.28)
            .setDepth(45).setStrokeStyle(3, 0x44cc44, 1);
        this.tweens.add({ targets: this.tutorialHighlight, alpha: { from: 0.28, to: 0.68 }, duration: 440, yoyo: true, repeat: -1 });

        // Activar animación de arrastre inmediatamente
        this.loopTutHand(slot.x, slot.y);

        // Paso 1 → avanza al empezar a arrastrar la zanahoria
        carrot.once('dragstart', () => this.onTutorialStep2());
    }

    private onTutorialStep2() {
        if (!this.tutorialCarrot) return;

        this.isTutorialDragging = true;

        // Actualizar burbuja
        this.showTutBubble('¡Muy bien! Llévala\nhasta la zona resaltada.');

        // Ocultar la manita y fantasma mientras el usuario ya lo tiene agarrado
        if (this.tutorialHand) {
            this.tweens.killTweensOf(this.tutorialHand);
            this.tutorialHand.setAlpha(0);
        }
        if (this.tutorialGhostCarrot) {
            this.tweens.killTweensOf(this.tutorialGhostCarrot);
            this.tutorialGhostCarrot.setAlpha(0);
        }
    }

    private loopTutHand(slotX: number, slotY: number) {
        if (!this.tutorialHand || !this.tutorialCarrot || !this.isTutorialActive || this.isTutorialDragging) return;
        
        const carrotStartX = this.foodContainer.x + this.tutorialCarrot.x;
        const carrotStartY = this.foodContainer.y + this.tutorialCarrot.y;
        const startX = carrotStartX + 15;
        const startY = carrotStartY + 20;
        
        const hand = this.tutorialHand;
        hand.setPosition(startX, startY).setAlpha(0).setScale(1.1);

        // Crear/Reiniciar el fantasma
        if (!this.tutorialGhostCarrot) {
            this.tutorialGhostCarrot = this.add.image(carrotStartX, carrotStartY, this.tutorialCarrot.texture.key)
                .setDepth(48).setAlpha(0).setScale(this.tutorialCarrot.scaleX);
        } else {
            this.tutorialGhostCarrot.setPosition(carrotStartX, carrotStartY).setAlpha(0);
        }

        const ghost = this.tutorialGhostCarrot;

        // Fase 1: Aparecer la mano
        this.tweens.add({
            targets: hand, alpha: 1, duration: 300,
            onComplete: () => {
                if (!this.isTutorialActive || !this.tutorialHand || this.isTutorialDragging) return;
                
                // Pequeña pausa antes de hacer clic
                this.time.delayedCall(200, () => {
                    if (!this.isTutorialActive || !this.tutorialHand || this.isTutorialDragging) return;

                    // Fase 2: Simular click (bajar escala, NO yoyo)
                    this.tweens.add({
                        targets: hand, scaleX: 0.9, scaleY: 0.9, duration: 350, ease: 'Sine.easeOut',
                        onComplete: () => {
                            if (!this.isTutorialActive || !this.tutorialHand || this.isTutorialDragging) return;
                            
                            // Fase 3: Aparecer el fantasma de zanahoria como si la agarrara
                            ghost.setAlpha(0.6);

                            // Pausa breve con el click apretado antes de arrastrar
                            this.time.delayedCall(200, () => {
                                if (!this.isTutorialActive || !this.tutorialHand || this.isTutorialDragging) return;

                                // Fase 4: Mover mano y fantasma hacia el objetivo (más lento)
                                this.tweens.add({
                                    targets: [hand], x: slotX + 15, y: slotY - 8, duration: 1300, ease: 'Power2.easeInOut'
                                });
                                this.tweens.add({
                                    targets: [ghost], x: slotX, y: slotY, duration: 1300, ease: 'Power2.easeInOut',
                                    onComplete: () => {
                                        if (!this.isTutorialActive || !this.tutorialHand || this.isTutorialDragging) return;
                                        
                                        // Fase 4.5: Soltar click (restaurar escala)
                                        this.tweens.add({
                                            targets: hand, scaleX: 1.1, scaleY: 1.1, duration: 250
                                        });

                                        // Fase 5: Desaparecer
                                        this.tweens.add({
                                            targets: [hand, ghost], alpha: 0, duration: 400, delay: 300,
                                            onComplete: () => {
                                                this.time.delayedCall(400, () => this.loopTutHand(slotX, slotY));
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    }

    private handleTutorialDrop(gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) {
        const catItem = gameObject.getData('categoria') as string;
        const catZone = dropZone.getData('categoria')   as string;

        if (catItem !== catZone) {
            gameObject.clearTint();
            this.returnToFoodBar(gameObject);
            this.showTutWrongHint();
            return;
        }

        const slot = this.findNearestFreeInventorySlot(this.segmentoVerduras, gameObject.x, gameObject.y, gameObject);
        if (!slot) {
            gameObject.clearTint();
            this.returnToFoodBar(gameObject);
            this.showTutWrongHint();
            return;
        }

        // Colocar en slot
        gameObject.x = slot.x;
        gameObject.y = slot.y;
        const textoSlot = gameObject.getData('texto') as Phaser.GameObjects.Text | undefined;
        if (textoSlot) { textoSlot.x = slot.x; textoSlot.y = slot.y + FOOD_LABEL_OFFSET; }
        gameObject.clearTint();
        this.input.setDraggable(gameObject, false);
        gameObject.disableInteractive();
        gameObject.setData('placed',     true);
        gameObject.setData('lastValidX', gameObject.x);
        gameObject.setData('lastValidY', gameObject.y);
        gameObject.setData('basket',     this.segmentoVerduras);
        gameObject.setData('slotRelY',   gameObject.y - this.segmentoVerduras.y);
        this.placedFoods.push(gameObject);
        this.waveAciertos++;

        // Pop de celebración
        const sx = gameObject.scaleX, sy = gameObject.scaleY;
        this.tweens.add({ targets: gameObject, scaleX: { from: 1.5, to: sx }, scaleY: { from: 1.5, to: sy }, duration: 380, ease: 'Back.easeOut' });
        try { this.sound.play('object_win'); } catch { void 0; }

        // Detener manita, fantasma y resaltado
        this.isTutorialActive = false;
        if (this.tutorialHand)      this.tweens.killTweensOf(this.tutorialHand);
        if (this.tutorialHighlight) this.tweens.killTweensOf(this.tutorialHighlight);
        if (this.tutorialGhostCarrot) { this.tweens.killTweensOf(this.tutorialGhostCarrot); this.tutorialGhostCarrot.setAlpha(0); }

        // Burbuja paso 3
        this.showTutBubble('¡Excelente! Has guardado\nun nuevo alimento en\ntu inventario.');

        this.time.delayedCall(2800, () => this.endTutorial());
    }

    private showTutWrongHint() {
        this.isTutorialDragging = false;
        this.tweens.add({ targets: this.segmentoVerduras, alpha: { from: 1, to: 0.4 }, duration: 160, yoyo: true, repeat: 2 });
        // Reiniciar loop de manita tras el regreso del alimento a la barra
        this.time.delayedCall(380, () => {
            if (this.isTutorialActive && this.tutorialHand && this.tutorialCarrot) {
                const slot = this.getInventorySlotPositions(this.segmentoVerduras)[0];
                this.loopTutHand(slot.x, slot.y);
            }
        });
    }

    private endTutorial() {
        if (this.tutorialHand)      { this.tweens.killTweensOf(this.tutorialHand);      this.tutorialHand.destroy();      this.tutorialHand      = undefined; }
        if (this.tutorialHighlight) { this.tweens.killTweensOf(this.tutorialHighlight); this.tutorialHighlight.destroy(); this.tutorialHighlight = undefined; }
        if (this.tutorialGhostCarrot) { this.tweens.killTweensOf(this.tutorialGhostCarrot); this.tutorialGhostCarrot.destroy(); this.tutorialGhostCarrot = undefined; }
        this.destroyTutBubble();

        // Platón se va
        this.tweens.add({ targets: this.platon, x: this.scale.width + 300, alpha: 0, duration: 700, ease: 'Power2.easeIn' });

        // Rehabilitar todos los alimentos restantes en la barra
        this.foodContainer.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Image) {
                child.setInteractive({ useHandCursor: true });
                this.input.setDraggable(child, true);
            }
        });

        this.tutorialCarrot   = undefined;
        this.isTutorialActive = false;
        this.isTutorialDragging = false;
        this.registry.set('tutorialCompleted_Nivel1', true);
        this.waveInProgress   = true;
        this.startTimer(WAVE_TIME_NORMAL);   // contador arranca en 60 s
    }

    private showTutBubble(text: string) {
        this.destroyTutBubble();

        const { height } = this.scale;
        const cx = 640;
        const cy = height - 335;

        this.tutorialBubbleTxt = this.add.text(cx, cy, text, {
            fontSize: '26px', color: '#000000',
            fontFamily: 'Gill Sans MT', align: 'left',
            wordWrap: { width: 370 },
        }).setOrigin(0.5).setDepth(12).setAlpha(0);

        const pad = 20;
        const bx  = cx - this.tutorialBubbleTxt.width  / 2 - pad;
        const by  = cy - this.tutorialBubbleTxt.height / 2 - pad;
        const bw  = this.tutorialBubbleTxt.width  + pad * 2;
        const bh  = this.tutorialBubbleTxt.height + pad * 2;

        this.tutorialBubble = this.add.graphics().setDepth(11).setAlpha(0);
        this.tutorialBubble.fillStyle(0xFFFAED, 0.97);
        this.tutorialBubble.fillTriangle(bx + 40, by + bh, bx + 82, by + bh, bx - 18, by + bh + 52);
        this.tutorialBubble.fillRoundedRect(bx, by, bw, bh, 16);
        this.tutorialBubble.lineStyle(4, 0x5E412F, 1);
        this.tutorialBubble.strokeRoundedRect(bx, by, bw, bh, 16);
        this.tutorialBubble.beginPath();
        this.tutorialBubble.moveTo(bx + 40, by + bh);
        this.tutorialBubble.lineTo(bx - 18, by + bh + 52);
        this.tutorialBubble.lineTo(bx + 82, by + bh);
        this.tutorialBubble.strokePath();

        this.tweens.add({ targets: [this.tutorialBubble, this.tutorialBubbleTxt], alpha: 1, duration: 300 });
    }

    private destroyTutBubble() {
        if (this.tutorialBubble)    { this.tweens.killTweensOf(this.tutorialBubble);    this.tutorialBubble.destroy();    this.tutorialBubble    = undefined; }
        if (this.tutorialBubbleTxt) { this.tweens.killTweensOf(this.tutorialBubbleTxt); this.tutorialBubbleTxt.destroy(); this.tutorialBubbleTxt = undefined; }
    }

    update() {
        if (window.innerWidth !== this.lastWindowWidth || window.innerHeight !== this.lastWindowHeight) {
            this.lastWindowWidth = window.innerWidth;
            this.lastWindowHeight = window.innerHeight;
            this.repositionUI();
        }

        // Keep drop zones aligned with bobbing basket images
        if (this.zonaBordeVerduras) {
            this.zonaBordeVerduras.y = this.segmentoVerduras.y;
            this.zonaVerduras.y      = this.segmentoVerduras.y + this.zvOffY;
        }
        if (this.zonaBordeFrutas) {
            this.zonaBordeFrutas.y = this.segmentoFrutas.y;
            this.zonaFrutas.y      = this.segmentoFrutas.y + this.zfOffY;
        }

        // Keep tutorial highlight on the target slot as basket bobs
        if (this.tutorialHighlight) {
            const slot = this.getInventorySlotPositions(this.segmentoVerduras)[0];
            this.tutorialHighlight.x = slot.x;
            this.tutorialHighlight.y = slot.y;
        }

        // Keep placed foods glued to their basket's current Y
        for (const food of this.placedFoods) {
            const basket = food.getData('basket') as Phaser.GameObjects.Image | undefined;
            const relY   = food.getData('slotRelY') as number | undefined;
            if (basket === undefined || relY === undefined) continue;
            food.y = basket.y + relY;
            const texto = food.getData('texto') as Phaser.GameObjects.Text | undefined;
            if (texto) texto.y = food.y + FOOD_LABEL_OFFSET;
        }
    }

    // ─── PLATÓN ───────────────────────────────────────────────────────────────

    private startBasketIdleAnim(basket: Phaser.GameObjects.Image, phaseDelay: number) {
        const baseY = basket.y;
        this.time.delayedCall(phaseDelay, () => {
            this.tweens.add({
                targets: basket,
                y: baseY - 9,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        });
    }

    private shakeWrongBasket(basket: Phaser.GameObjects.Image) {
        this.tweens.add({
            targets: basket,
            angle: 8,
            duration: 55,
            yoyo: true,
            repeat: 4,
            ease: 'Linear',
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
        const { width, height } = this.scale;
        this.tweens.killTweensOf(this.platon);
        this.platon.setTexture(esFeliz ? "platon-feliz" : "platon-triste");
        // Always snap x back to the gameplay position (after tutorial it ends off-screen right)
        this.platon.setPosition(width - 300, height - 200);
        this.tweens.add({
            targets: this.platon,
            alpha: 1,
            y: height - 250,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: this.platon,
                        alpha: 0,
                        y: height - 300,
                        duration: 300
                    });
                });
            }
        });
    }

    // ─── LEVEL COMPLETE ───────────────────────────────────────────────────────

    private mostrarPantallaFinal() {
        showLevelCompleteOverlay(this, {
            title: '¡EXCELENTE TRABAJO!',
            message: 'Ordenaste todas las frutas y verduras correctamente. ¡Ahora vamos con cereales y leguminosas!',
            buttonLabel: 'Ir al Nivel 2',
            nextScene: 'Nivel2Scene',
            soundKey: 'object_win',
            clickSoundKey: 'sonido-click',
        });
    }
}
