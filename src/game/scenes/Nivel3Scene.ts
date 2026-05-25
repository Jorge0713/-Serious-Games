import * as Phaser from 'phaser';
import { createDebugSkipButton } from '../systems/DebugSkipButton';
import { showLevelCompleteOverlay } from '../systems/LevelCompleteOverlay';
import { PlayerService } from '../../services/PlayerService';
import { ProgressService } from '../../services/ProgressService';

const FOOD_ITEM_SIZE = 70;
const FOOD_ITEM_SPACING = 125;
const FOOD_LABEL_OFFSET = 48;
const FOOD_SCROLL_STEP = 500;

interface FoodConfig {
    key: string;
    path: string;
    category: 'animal' | 'junk';
    label: string;
}

interface DraggableImage extends Phaser.GameObjects.Image {
    foodCategory: 'animal' | 'junk';
    localHomeX: number;   // posición dentro del container
    localHomeY: number;
    lastValidX: number;
    lastValidY: number;
    baseScale: number;
    placed: boolean;
}

const ANIMAL_FOODS: FoodConfig[] = [
    { key: 'an_egg',       path: '/iconsFood/animal/egg.png',           category: 'animal', label: 'Huevo' },
    { key: 'an_chicken',   path: '/iconsFood/animal/chicken.png',       category: 'animal', label: 'Pollo' },
    { key: 'an_fish',      path: '/iconsFood/animal/fish.png',          category: 'animal', label: 'Pescado' },
    { key: 'an_milk',      path: '/iconsFood/animal/milk-carton.png',   category: 'animal', label: 'Leche' },
    { key: 'an_cheese',    path: '/iconsFood/animal/cheese.png',        category: 'animal', label: 'Queso' },
    { key: 'an_salmon',    path: '/iconsFood/animal/salmon.png',        category: 'animal', label: 'Salmón' },
    { key: 'an_carne',     path: '/iconsFood/animal/beef.png',          category: 'animal', label: 'Carne' },
    { key: 'an_roast',     path: '/iconsFood/animal/roast-chicken.png', category: 'animal', label: 'Pollo Asado' },
];

const JUNK_FOODS: FoodConfig[] = [
    { key: 'jk_burger',    path: '/iconsFood/comidaExtra/burger.png',         category: 'junk', label: 'Hamburguesa' },
    { key: 'jk_pizza',     path: '/iconsFood/comidaExtra/pizza.png',          category: 'junk', label: 'Pizza' },
    { key: 'jk_donut',     path: '/iconsFood/comidaExtra/donut.png',          category: 'junk', label: 'Dona' },
    { key: 'jk_fries',     path: '/iconsFood/comidaExtra/french-fries.png',   category: 'junk', label: 'Papas Fritas' },
    { key: 'jk_soda',      path: '/iconsFood/comidaExtra/coca.png',           category: 'junk', label: 'Refresco' },
    { key: 'jk_hotdog',    path: '/iconsFood/comidaExtra/hotdog.png',         category: 'junk', label: 'Hot Dog' },
    { key: 'jk_cake',      path: '/iconsFood/comidaExtra/cake.png',           category: 'junk', label: 'Pastel' },
    { key: 'jk_chocolate', path: '/iconsFood/comidaExtra/chocolate.png',      category: 'junk', label: 'Chocolate' },
    { key: 'jk_icecream',  path: '/iconsFood/comidaExtra/ice-cream.png',      category: 'junk', label: 'Helado' },
    { key: 'jk_cupcake',   path: '/iconsFood/comidaExtra/cupcake.png',        category: 'junk', label: 'Cupcake' },
    { key: 'jk_hotcakes',  path: '/iconsFood/comidaExtra/hotcakes.png',       category: 'junk', label: 'Hotcakes' },
];

const ALL_FOODS: FoodConfig[] = [...ANIMAL_FOODS, ...JUNK_FOODS];

export class Nivel3Scene extends Phaser.Scene {
    private fondo_cocina!: Phaser.GameObjects.Image;
    private platon!: Phaser.GameObjects.Image;
    private foodContainer!: Phaser.GameObjects.Container;
    private minFoodScrollX = 0;
    private maxFoodScrollX = 0;
    private isFoodScrolling = false;
    private foodViewportX = 0;
    private foodViewportW = 0;

    private score = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private totalAnimal  = 0;
    private placedAnimal = 0;
    private placedFoods: DraggableImage[] = [];

    constructor() { super('Nivel3Scene'); }

    // ── PRELOAD ───────────────────────────────────────────────────────────────
    preload() {
        this.load.image('Fondo-cocina',    '/assets/Backgrounds/Fondo_Cocina.png');
        this.load.image('animal_section',  '/assets/Plato/AnlimalSection.png');
        this.load.image("platon-feliz",    "/assets/Platon/platon_feliz.png");
        this.load.image("platon-triste",   "/assets/Platon/platon_triste.png");
        this.load.audio('object_win',      '/Sound/ObjectWIN.mp3');
        this.load.audio("sonido-error",    "/Sound/incorrecto.mp3");
        this.load.audio("sonido-click",    "/Sound/Click.mp3");
        this.load.audio('level_win',       '/Sound/win.mp3');
        ALL_FOODS.forEach(f => this.load.image(f.key, f.path));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    create() {
        this.score = 0;
        this.placedAnimal = 0;
        this.placedFoods = [];
        const { width, height } = this.scale;

        // 1. DIBUJAR FONDO
        this.fondo_cocina = this.add.image(width / 2, height / 2, "Fondo-cocina")
            .setScale(0.5)
            .setDisplaySize(width, height);
        void this.fondo_cocina;

        // 2. TEXTO DE INSTRUCCIÓN
        this.add.text(width / 2, 130, 'Por último, acomoda los alimentos de origen animal', {
            fontSize: '32px',
            color: '#000',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Contador de puntos
        this.scoreText = this.add.text(width - 100, 100, `Puntos: ${this.score}`, {
            fontSize: '32px',
            color: '#2ecc71',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(1, 0).setDepth(20);

        createDebugSkipButton(this, {
            label: 'Saltar al roadmap',
            nextScene: 'LevelSelectScene',
            soundKey: 'sonido-click',
        });

        // --- SECCIÓN DEL PLATO ---
        const escalaAnimal = 1.5; 
        const segmentoAnimal = this.add.image(width / 2, height - 380, 'animal_section')
            .setScale(escalaAnimal).setDepth(2);

        const zonaAnimal = this.add.zone(
            segmentoAnimal.x,
            segmentoAnimal.y,
            segmentoAnimal.displayWidth * 0.8,
            segmentoAnimal.displayHeight * 0.8
        ).setRectangleDropZone(segmentoAnimal.displayWidth * 0.8, segmentoAnimal.displayHeight * 0.8).setDepth(4);
        zonaAnimal.setData("categoria", "animal");

        // --- PLATÓN ---
        this.platon = this.add.image(width - 200, height - 260, "platon-feliz")
            .setAlpha(0)
            .setScale(0.8).setDepth(10);

        this.buildFoodBar(width);
        this.setupDragEvents();
    }

    private buildFoodBar(width: number) {
        const barWidth = Math.round(width * 0.82);
        const arrowWidth = 64;
        const barLeft = (width - barWidth) / 2;
        const viewportX = barLeft + arrowWidth;
        const viewportW = barWidth - arrowWidth * 2;
        const stripTop = 180;
        const stripHeight = 148;
        const stripCenterY = stripTop + stripHeight / 2;

        this.add.rectangle(width / 2, stripCenterY, barWidth, stripHeight, 0xf7cc85, 0.82)
            .setStrokeStyle(4, 0x5E412F)
            .setDepth(1);

        // Container que desplazamos; parte desde viewportX
        this.foodContainer = this.add.container(viewportX, 0).setDepth(5);
        this.foodViewportX = viewportX;
        this.foodViewportW = viewportW;

        // Items mezclados en el container
        const shuffled = Phaser.Utils.Array.Shuffle([...ALL_FOODS]) as FoodConfig[];
        this.totalAnimal = ANIMAL_FOODS.length;

        const totalContentWidth = shuffled.length * FOOD_ITEM_SPACING + 24;
        this.minFoodScrollX = viewportX;
        this.maxFoodScrollX = viewportX - Math.max(0, totalContentWidth - viewportW);

        const btnLeft = this.add.text(barLeft + arrowWidth / 2, stripCenterY, '<', {
            fontSize: '42px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#5E412F',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        const btnRight = this.add.text(barLeft + barWidth - arrowWidth / 2, stripCenterY, '>', {
            fontSize: '42px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#5E412F',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        btnLeft.on('pointerover', () => btnLeft.setStyle({ backgroundColor: '#76A665' }));
        btnLeft.on('pointerout', () => btnLeft.setStyle({ backgroundColor: '#5E412F' }));
        btnLeft.on('pointerdown', () => this.scrollFoodBar(FOOD_SCROLL_STEP));
        btnRight.on('pointerover', () => btnRight.setStyle({ backgroundColor: '#76A665' }));
        btnRight.on('pointerout', () => btnRight.setStyle({ backgroundColor: '#5E412F' }));
        btnRight.on('pointerdown', () => this.scrollFoodBar(-FOOD_SCROLL_STEP));

        shuffled.forEach((item, index) => {
            const localX = index * FOOD_ITEM_SPACING + FOOD_ITEM_SIZE / 2 + 16;
            const localY = stripCenterY - 16;

            const sprite = this.add.image(localX, localY, item.key) as DraggableImage;
            sprite.setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE);

            const texto = this.add.text(localX, localY + FOOD_LABEL_OFFSET, item.label, {
                fontSize: '15px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial, sans-serif',
                stroke: '#5E412F',
                strokeThickness: 4
            }).setOrigin(0.5);

            sprite.setInteractive({ useHandCursor: true });
            this.input.setDraggable(sprite);

            sprite.foodCategory = item.category;
            sprite.localHomeX = localX;
            sprite.localHomeY = localY;
            sprite.lastValidX = localX;
            sprite.lastValidY = localY;
            sprite.baseScale = sprite.scale;
            sprite.placed = false;
            sprite.setData("texto", texto);
            sprite.setData("fromFoodBar", true);

            this.foodContainer.add([sprite, texto]);
        });

    }

    private scrollFoodBar(delta: number) {
        if (!this.foodContainer || this.isFoodScrolling) return;

        const newX = Phaser.Math.Clamp(
            this.foodContainer.x + delta,
            this.maxFoodScrollX,
            this.minFoodScrollX
        );

        if (newX === this.foodContainer.x) return;

        this.isFoodScrolling = true;
        this.tweens.add({
            targets: this.foodContainer,
            x: newX,
            duration: 320,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.isFoodScrolling = false;
            }
        });
    }

    // ── Eventos globales de drag ───────────────────────────────────────────────
    private setupDragEvents() {
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: DraggableImage) => {
            if (gameObject.placed) return;
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
            if (texto) {
                this.children.bringToTop(texto);
                texto.setDepth(51);
            }
            gameObject.setDepth(50);
            gameObject.setTint(0xdddddd);
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: DraggableImage) => {
            if (gameObject.placed) return;
            gameObject.x = pointer.worldX;
            gameObject.y = pointer.worldY;
            const texto = gameObject.getData("texto");
            if (texto) {
                texto.x = pointer.worldX;
                texto.y = pointer.worldY + FOOD_LABEL_OFFSET;
            }
        });

        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: DraggableImage) => {
            if (gameObject.placed) return;

            if (gameObject.foodCategory === 'animal') {
                if (this.hasPlacedFoodOverlap(gameObject)) {
                    gameObject.clearTint();
                    this.sound.play("sonido-error");
                    this.returnToFoodBar(gameObject);
                    return;
                }

                gameObject.clearTint();
                this.input.setDraggable(gameObject, false);
                gameObject.placed = true;
                gameObject.disableInteractive();
                gameObject.lastValidX = gameObject.x;
                gameObject.lastValidY = gameObject.y;
                gameObject.setDepth(10); 
                this.placedFoods.push(gameObject);
                this.sound.play('object_win');
                this.mostrarPlaton(true);

                this.score += 10;
                this.scoreText.setText(`Puntos: ${this.score}`);
                this.placedAnimal++;

                if (this.placedAnimal >= this.totalAnimal) {
                    this.time.delayedCall(1000, () => this.showWin());
                }
            } else {
                gameObject.clearTint();
                this.sound.play("sonido-error");
                this.mostrarPlaton(false);
                this.returnToFoodBar(gameObject);
            }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: DraggableImage, dropped: boolean) => {
            if (gameObject.placed) return;
            if (!dropped) {
                gameObject.clearTint();
                this.returnToFoodBar(gameObject);
            }
        });
    }

    private returnToFoodBar(gameObject: DraggableImage) {
        const texto = gameObject.getData("texto") as Phaser.GameObjects.Text | undefined;
        const localHomeX = gameObject.localHomeX;
        const localHomeY = gameObject.localHomeY;
        const targetWorldX = this.foodContainer.x + localHomeX;
        const targetWorldY = this.foodContainer.y + localHomeY;

        this.tweens.add({
            targets: gameObject,
            x: targetWorldX,
            y: targetWorldY,
            duration: 300,
            ease: 'Power2',
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
            x: targetWorldX,
            y: targetWorldY + FOOD_LABEL_OFFSET,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.children.remove(texto);
                texto.x = localHomeX;
                texto.y = localHomeY + FOOD_LABEL_OFFSET;
                this.foodContainer.add(texto);
            }
        });
    }

    private hasPlacedFoodOverlap(obj: DraggableImage) {
        const bounds = obj.getBounds();
        return this.placedFoods.some(placedFood => (
            placedFood !== obj &&
            Phaser.Geom.Intersects.RectangleToRectangle(bounds, placedFood.getBounds())
        ));
    }

    private mostrarPlaton(esFeliz: boolean) {
        this.platon.setTexture(esFeliz ? "platon-feliz" : "platon-triste");
        this.tweens.add({
            targets: this.platon,
            alpha: 1,
            y: this.scale.height - 310,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: this.platon,
                        alpha: 0,
                        y: this.scale.height - 260,
                        duration: 300
                    });
                });
            }
        });
    }

    // ── Pantalla de victoria ──────────────────────────────────────────────────
    private showWin() {
        this.guardarProgreso();

        showLevelCompleteOverlay(this, {
            title: '\u00A1NIVEL COMPLETADO!',
            message: 'Identificaste los alimentos de origen animal. Vuelve al recorrido para revisar tu avance.',
            scoreText: `Puntos: ${this.score}`,
            buttonLabel: 'Volver al recorrido',
            nextScene: 'LevelSelectScene',
            soundKey: 'level_win',
        });
    }

    private guardarProgreso(): void {
        const jugador = PlayerService.obtenerJugadorActivo();
        if (!jugador) return;

        const progreso = ProgressService.completarNivel(jugador.progreso, 3, this.score);
        PlayerService.actualizarProgreso(jugador.id, progreso);
    }

    // ── Update: Recorte manual (Culling) ──────────────────────────────────────
    update() {
        if (!this.foodContainer) return;
        
        const left = this.foodViewportX;
        const right = this.foodViewportX + this.foodViewportW;
        
        this.foodContainer.list.forEach((child) => {
            const item = child as Phaser.GameObjects.Image | Phaser.GameObjects.Text;
            const worldX = this.foodContainer.x + item.x;
            const visible = worldX >= left - 50 && worldX <= right + 50;

            item.setVisible(visible);
            if (!visible) {
                item.setAlpha(0);
                return;
            }

            if (worldX < left + 36) {
                item.setAlpha(Math.max(0.2, (worldX - (left - 50)) / 86));
            } else if (worldX > right - 36) {
                item.setAlpha(Math.max(0.2, ((right + 50) - worldX) / 86));
            } else {
                item.setAlpha(1);
            }
        });
    }
}
