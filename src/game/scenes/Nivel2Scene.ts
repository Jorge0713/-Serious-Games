import * as Phaser from 'phaser';
import { showLevelCompleteOverlay } from '../systems/LevelCompleteOverlay';

const FOOD_ITEM_SIZE = 70;
const FOOD_ITEM_SPACING = 125;
const FOOD_LABEL_OFFSET = 48;
const FOOD_SCROLL_STEP = 500;

export class Nivel2Scene extends Phaser.Scene {
    private fondo_cocina!: Phaser.GameObjects.Image;
    private platon!: Phaser.GameObjects.Image;
    private aciertos: number = 0;
    private foodContainer!: Phaser.GameObjects.Container;
    private minFoodScrollX = 0;
    private maxFoodScrollX = 0;
    private isFoodScrolling = false;
    private foodViewportX = 0;
    private foodViewportW = 0;
    private placedFoods: Phaser.GameObjects.Image[] = [];

    // --- LISTA DE ALIMENTOS (8 cereales, 8 leguminosas, 4 sebos) ---
    private alimentos = [
        // CEREALES (8)
        { id: "c1", ruta: "/iconsFood/cereales/rice.png", nombre: "Arroz" },
        { id: "c2", ruta: "/iconsFood/cereales/corn.png", nombre: "Tortilla" },
        { id: "c3", ruta: "/iconsFood/cereales/bread.png", nombre: "Pan" },
        { id: "c4", ruta: "/iconsFood/cereales/corn.png", nombre: "Maíz" },
        { id: "c5", ruta: "/iconsFood/cereales/potato.png", nombre: "Papa" },
        { id: "c6", ruta: "/iconsFood/cereales/rebanada-pan.png", nombre: "Rebanada" },
        { id: "c7", ruta: "/iconsFood/comidaExtra/cockie.png", nombre: "Galleta" },
        { id: "c8", ruta: "/iconsFood/cereales/oat.png", nombre: "Avena" },

        // LEGUMINOSAS (8)
        { id: "l1", ruta: "/iconsFood/leguminosas/green_peas.png", nombre: "Guisantes" },
        { id: "l2", ruta: "/iconsFood/leguminosas/lentil.png", nombre: "Lentejas" },
        { id: "l3", ruta: "/iconsFood/leguminosas/beans.png", nombre: "Frijoles" },
        { id: "l4", ruta: "/iconsFood/leguminosas/chickpea.png", nombre: "Garbanzos" },
        { id: "l5", ruta: "/iconsFood/frutas/olive.png", nombre: "Aceituna" },
        { id: "l6", ruta: "/iconsFood/leguminosas/soy.png", nombre: "Soja" },
        { id: "l7", ruta: "/iconsFood/verduras/greenbean.png", nombre: "Ejotes" },
        { id: "l8", ruta: "/iconsFood/leguminosas/kidney_beans.png", nombre: "Frijol" },

        // SEBOS / DISTRACTORES (4) - De origen animal
        { id: "s1", ruta: "/iconsFood/animal/egg.png", nombre: "Huevo" },
        { id: "s2", ruta: "/iconsFood/animal/chicken.png", nombre: "Pollo" },
        { id: "s3", ruta: "/iconsFood/animal/milk-carton.png", nombre: "Leche" },
        { id: "s4", ruta: "/iconsFood/animal/cheese.png", nombre: "Queso" }
    ];

    constructor() {
        super('Nivel2Scene');
    }

    preload() {
        // --- FONDO GENERAL ---
        this.load.image("Fondo-cocina", "/assets/Backgrounds/Fondo_Cocina.png");

        // --- IMÁGENES DE LOS SEGMENTOS ---
        // Cereales y Leguminosas con sprites recoloreados
        this.load.image("segmento-cereales", "/assets/Plato/cereales_misma_escala.png");
        this.load.image("segmento-leguminosas", "/assets/Plato/legumbres_misma_escala.png");

        // --- PLATÓN ---
        this.load.image("platon-feliz", "/assets/Platon/platon_feliz.png");
        this.load.image("platon-triste", "/assets/Platon/platon_triste.png");

        // --- SONIDOS ---
        this.load.audio("object_win", "/Sound/ObjectWIN.mp3");
        this.load.audio("sonido-error", "/Sound/incorrecto.mp3");
        this.load.audio("sonido-click", "/Sound/Click.mp3");

        this.alimentos.forEach(item => {
            this.load.image(item.id, item.ruta);
        });
    }

    create() {
        this.aciertos = 0;
        this.placedFoods = [];
        const { width, height } = this.scale;

        // 1. DIBUJAR FONDO
        this.fondo_cocina = this.add.image(width / 2, height / 2, "Fondo-cocina")
            .setScale(0.5)
            .setDisplaySize(width, height);
        void this.fondo_cocina;

        // 2. TEXTO DE INSTRUCCIÓN
        this.add.text(width / 2, 75, 'Arrastra los cereales y leguminosas a su lugar en el plato', {
            fontSize: '32px',
            color: '#000',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // --- SEGMENTOS (DROP ZONES) ---
        // Izquierda = Cereales, Derecha = Leguminosas
        const escalaCereales = 0.26;
        const escalaLeguminosas = 0.37;

        // Cereales (izquierda)
        const segmentoCereales = this.add.image(width / 2 - 300, height - 483, "segmento-cereales")
            .setScale(escalaCereales);

        const zonaCereales = this.add.zone(
            segmentoCereales.x,
            segmentoCereales.y,
            segmentoCereales.displayWidth * 0.86,
            segmentoCereales.displayHeight * 0.86
        ).setRectangleDropZone(segmentoCereales.displayWidth * 0.86, segmentoCereales.displayHeight * 0.86);
        zonaCereales.setData("categoria", "cereal");

        // Leguminosas (derecha)  
        const segmentoLeguminosas = this.add.image(width / 2 + 300, height - 500, "segmento-leguminosas")
            .setScale(escalaLeguminosas);

        const zonaLeguminosas = this.add.zone(
            segmentoLeguminosas.x,
            segmentoLeguminosas.y,
            segmentoLeguminosas.displayWidth * 0.86,
            segmentoLeguminosas.displayHeight * 0.86
        ).setRectangleDropZone(segmentoLeguminosas.displayWidth * 0.86, segmentoLeguminosas.displayHeight * 0.86);
        zonaLeguminosas.setData("categoria", "leguminosa");

        // --- PLATÓN ---
        this.platon = this.add.image(width - 200, height - 200, "platon-feliz")
            .setAlpha(0)
            .setScale(0.8);

        this.buildFoodBar(width);

        // --- LÓGICA DE DRAG & DROP ---
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
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
            gameObject.x = pointer.worldX;
            gameObject.y = pointer.worldY;
            const texto = gameObject.getData("texto");
            if (texto) {
                texto.x = pointer.worldX;
                texto.y = pointer.worldY + FOOD_LABEL_OFFSET;
            }
        });

        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
            const categoriaItem = gameObject.getData("categoria");
            const categoriaZona = dropZone.getData("categoria");
            if (categoriaItem === categoriaZona) {
                if (this.hasPlacedFoodOverlap(gameObject)) {
                    gameObject.clearTint();
                    try { this.sound.play("sonido-error"); } catch { void 0; }
                    this.returnToFoodBar(gameObject);
                    return;
                }

                // ✅ ACIERTO
                gameObject.clearTint();
                this.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();
                gameObject.setData("placed", true);
                gameObject.setData("lastValidX", gameObject.x);
                gameObject.setData("lastValidY", gameObject.y);
                this.placedFoods.push(gameObject);

                try { this.sound.play("object_win"); } catch { void 0; }
                try { this.mostrarPlaton(true); } catch { void 0; }

                this.aciertos++;
                if (this.aciertos === 16) {
                    this.time.delayedCall(1000, () => {
                        this.mostrarPantallaFinal();
                    });
                }
            } else {
                // ❌ ERROR
                gameObject.clearTint();
                try { this.sound.play("sonido-error"); } catch { void 0; }
                try { this.mostrarPlaton(false); } catch { void 0; }

                this.returnToFoodBar(gameObject);
            }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
            if (!dropped) {
                gameObject.clearTint();
                this.returnToFoodBar(gameObject);
            }
        });
    }

    private buildFoodBar(width: number) {
        const barWidth = Math.round(width * 0.82);
        const arrowWidth = 64;
        const barLeft = (width - barWidth) / 2;
        const viewportX = barLeft + arrowWidth;
        const viewportW = barWidth - arrowWidth * 2;
        const stripTop = 128;
        const stripHeight = 148;
        const stripCenterY = stripTop + stripHeight / 2;

        this.add.rectangle(width / 2, stripCenterY, barWidth, stripHeight, 0xf7cc85, 0.82)
            .setStrokeStyle(4, 0x5E412F)
            .setDepth(1);

        this.foodContainer = this.add.container(viewportX, 0).setDepth(5);
        this.foodViewportX = viewportX;
        this.foodViewportW = viewportW;

        const totalContentWidth = this.alimentos.length * FOOD_ITEM_SPACING + 24;
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

        this.alimentos.forEach((item, index) => {
            const localX = index * FOOD_ITEM_SPACING + FOOD_ITEM_SIZE / 2 + 16;
            const localY = stripCenterY - 16;

            let categoria = "sebo";
            if (item.id.startsWith("c")) categoria = "cereal";
            else if (item.id.startsWith("l")) categoria = "leguminosa";

            const sprite = this.add.image(localX, localY, item.id)
                .setDisplaySize(FOOD_ITEM_SIZE, FOOD_ITEM_SIZE)
                .setInteractive({ useHandCursor: true });

            const texto = this.add.text(localX, localY + FOOD_LABEL_OFFSET, item.nombre, {
                fontSize: '15px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial, sans-serif',
                stroke: '#5E412F',
                strokeThickness: 4
            }).setOrigin(0.5);

            this.input.setDraggable(sprite);

            sprite.setData("categoria", categoria);
            sprite.setData("localHomeX", localX);
            sprite.setData("localHomeY", localY);
            sprite.setData("originalX", localX);
            sprite.setData("originalY", localY);
            sprite.setData("lastValidX", localX);
            sprite.setData("lastValidY", localY);
            sprite.setData("fromFoodBar", true);
            sprite.setData("texto", texto);

            this.foodContainer.add([sprite, texto]);
        });

        this.updateFoodBarVisibility();
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
            onUpdate: () => this.updateFoodBarVisibility(),
            onComplete: () => {
                this.isFoodScrolling = false;
                this.updateFoodBarVisibility();
            }
        });
    }

    private returnToFoodBar(gameObject: Phaser.GameObjects.Image) {
        const texto = gameObject.getData("texto") as Phaser.GameObjects.Text | undefined;
        const localHomeX = gameObject.getData("localHomeX") as number;
        const localHomeY = gameObject.getData("localHomeY") as number;
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
                this.updateFoodBarVisibility();
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
                this.updateFoodBarVisibility();
            }
        });
    }

    private hasPlacedFoodOverlap(gameObject: Phaser.GameObjects.Image) {
        const bounds = gameObject.getBounds();

        return this.placedFoods.some(placedFood => (
            placedFood !== gameObject &&
            Phaser.Geom.Intersects.RectangleToRectangle(bounds, placedFood.getBounds())
        ));
    }

    private updateFoodBarVisibility() {
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

    update() {
        this.updateFoodBarVisibility();
    }

    private mostrarPlaton(esFeliz: boolean) {
        this.platon.setTexture(esFeliz ? "platon-feliz" : "platon-triste");
        this.tweens.add({
            targets: this.platon,
            alpha: 1,
            y: this.scale.height - 250,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: this.platon,
                        alpha: 0,
                        y: this.scale.height - 200,
                        duration: 300
                    });
                });
            }
        });
    }

    private mostrarPantallaFinal() {
        showLevelCompleteOverlay(this, {
            title: '\u00A1FELICIDADES!',
            message: 'Completaste cereales y leguminosas. Ya puedes pasar al reto de origen animal.',
            buttonLabel: 'Ir al Nivel 3',
            nextScene: 'Nivel3Scene',
            soundKey: 'object_win',
            clickSoundKey: 'sonido-click',
        });
    }
}
