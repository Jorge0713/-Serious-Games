import * as Phaser from 'phaser';

// ─── Tipos ────────────────────────────────────────────────────────────────────
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
    baseScale: number;
    placed: boolean;
}

// ─── Catálogo de alimentos ───────────────────────────────────────────────────
const ANIMAL_FOODS: FoodConfig[] = [
    { key: 'an_egg',       path: '/origenAnimal/egg.png',           category: 'animal', label: 'Huevo' },
    { key: 'an_chicken',   path: '/origenAnimal/chicken.png',       category: 'animal', label: 'Pollo' },
    { key: 'an_fish',      path: '/origenAnimal/fish.png',          category: 'animal', label: 'Pescado' },
    { key: 'an_milk',      path: '/origenAnimal/milk.png',          category: 'animal', label: 'Leche' },
    { key: 'an_cheese',    path: '/origenAnimal/cheese.png',        category: 'animal', label: 'Queso' },
    { key: 'an_salmon',    path: '/origenAnimal/salmon.png',        category: 'animal', label: 'Salmón' },
    { key: 'an_carne',     path: '/origenAnimal/carne.png',         category: 'animal', label: 'Carne' },
    { key: 'an_roast',     path: '/origenAnimal/roast-chicken.png', category: 'animal', label: 'Pollo Asado' },
];

const JUNK_FOODS: FoodConfig[] = [
    { key: 'jk_burger',    path: '/comidaExtra/burger.png',         category: 'junk', label: 'Hamburguesa' },
    { key: 'jk_pizza',     path: '/comidaExtra/pizza.png',          category: 'junk', label: 'Pizza' },
    { key: 'jk_donut',     path: '/comidaExtra/donut.png',          category: 'junk', label: 'Dona' },
    { key: 'jk_fries',     path: '/comidaExtra/french-fries.png',   category: 'junk', label: 'Papas Fritas' },
    { key: 'jk_soda',      path: '/comidaExtra/coca.png',           category: 'junk', label: 'Refresco' },
    { key: 'jk_hotdog',    path: '/comidaExtra/hotdog.png',         category: 'junk', label: 'Hot Dog' },
    { key: 'jk_cake',      path: '/comidaExtra/cake.png',           category: 'junk', label: 'Pastel' },
    { key: 'jk_chocolate', path: '/comidaExtra/chocolate.png',      category: 'junk', label: 'Chocolate' },
    { key: 'jk_icecream',  path: '/comidaExtra/ice-cream.png',      category: 'junk', label: 'Helado' },
    { key: 'jk_cupcake',   path: '/comidaExtra/cupcake.png',        category: 'junk', label: 'Cupcake' },
    { key: 'jk_hotcakes',  path: '/comidaExtra/hotcakes.png',       category: 'junk', label: 'Hotcakes' },
    { key: 'jk_fanta',     path: '/comidaExtra/fanta.png',          category: 'junk', label: 'Fanta' },
    { key: 'jk_pepsi',     path: '/comidaExtra/pepsi.png',          category: 'junk', label: 'Pepsi' },
    { key: 'jk_chococake', path: '/comidaExtra/chocolate-cake.png', category: 'junk', label: 'Pastel Choco' },
    { key: 'jk_taco',      path: '/comidaExtra/taco.png',           category: 'junk', label: 'Taco' },
    { key: 'jk_sandwich',  path: '/comidaExtra/sandwich.png',       category: 'junk', label: 'Sandwich' },
    { key: 'jk_azucar',    path: '/comidaExtra/azucar.png',         category: 'junk', label: 'Azúcar' },
    { key: 'jk_cockie',    path: '/comidaExtra/cockie.png',         category: 'junk', label: 'Galleta' },
];

const ALL_FOODS: FoodConfig[] = [...ANIMAL_FOODS, ...JUNK_FOODS];

// ─── Constantes de layout ────────────────────────────────────────────────────
const ITEM_SIZE   = 90;   // px, cuadrado — más grandes para barra visible
const ITEM_SPACEX = 130;  // separación horizontal
const ITEM_SPACEY = 135;  // separación vertical — barra más alta
const SCROLL_STEP = 650;  // px a desplazar por clic de flecha

// ─── Escena ───────────────────────────────────────────────────────────────────
export class Nivel3Scene extends Phaser.Scene {

    // Scroll
    private foodContainer!: Phaser.GameObjects.Container;
    private minScrollX = 0;
    private maxScrollX = 0;
    private isScrolling = false;
    private viewportX = 0;
    private viewportW = 0;

    // Drop zone
    private sectionX = 0;
    private sectionY = 0;
    private sectionW = 420;
    private sectionH = 340;

    // Feedback / puntaje
    private feedbackText!: Phaser.GameObjects.Text;
    private feedbackTimer?: Phaser.Time.TimerEvent;
    private score        = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private totalAnimal  = 0;
    private placedAnimal = 0;

    constructor() { super('Nivel3Scene'); }

    // ── PRELOAD ───────────────────────────────────────────────────────────────
    preload() {
        this.load.image('fondo_cocina3',   '/assets/Fondo_Cocina.png');
        this.load.image('animal_section',  '/assets/Plato/AnlimalSection.png');
        this.load.audio('object_win',      '/Sound/ObjectWIN.mp3');
        this.load.audio('level_win',       '/Sound/win.mp3');
        ALL_FOODS.forEach(f => this.load.image(f.key, f.path));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    create() {
        const { width, height } = this.scale;

        // ── Fondo ──
        this.add.image(width / 2, height / 2, 'fondo_cocina3').setDisplaySize(width, height);
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.48);

        // ── Título ──
        this.add.text(width / 2, 36, '¡Arrastra los alimentos de origen animal!', {
            fontSize: '32px', color: '#f1c40f', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(width / 2, 76, 'Usa las flechas para desplazar los alimentos', {
            fontSize: '17px', color: '#ecf0f1', fontFamily: 'Arial',
            stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5);

        // ── Puntaje ──
        this.scoreText = this.add.text(width - 16, 16, 'Puntos: 0', {
            fontSize: '22px', color: '#2ecc71', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3,
        }).setOrigin(1, 0).setDepth(10);

        // ── Strip de alimentos con scroll ──
        this.buildScrollStrip(width);

        // ── Zona de drop centrada (imagen AnimalSection) ──
        this.sectionX = width / 2;
        this.sectionY = height * 0.73;
        this.sectionW = 620;
        this.sectionH = 480;

        this.add.image(this.sectionX, this.sectionY, 'animal_section')
            .setDisplaySize(this.sectionW, this.sectionH).setDepth(2);

        this.add.graphics().setDepth(3);

        this.add.zone(
            this.sectionX, this.sectionY,
            this.sectionW, this.sectionH
        ).setRectangleDropZone(this.sectionW, this.sectionH).setDepth(4);

        // ── Feedback ──
        this.feedbackText = this.add.text(width / 2, height * 0.525, '', {
            fontSize: '25px', color: '#fff', fontFamily: 'Arial', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4,
            backgroundColor: '#00000099', padding: { x: 16, y: 8 },
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        // ── Eventos de drag globales ──
        this.setupDragEvents();

        // ── Botón Volver ──
        const btnVolver = this.add.text(16, 16, '← Volver', {
            fontSize: '19px', color: '#fff', backgroundColor: '#c0392b',
            padding: { x: 12, y: 7 }, fontFamily: 'Arial',
        }).setInteractive({ useHandCursor: true }).setDepth(10);
        btnVolver.on('pointerover', () => btnVolver.setStyle({ backgroundColor: '#922b21' }));
        btnVolver.on('pointerout',  () => btnVolver.setStyle({ backgroundColor: '#c0392b' }));
        btnVolver.on('pointerdown', () => this.scene.start('MainMenu'));
    }

    // ── Construye el strip scrollable ─────────────────────────────────────────
    private buildScrollStrip(width: number) {
        // Barra centrada al 70% del ancho de pantalla
        const BAR_W      = Math.round(width * 0.70);
        const ARROW_W    = 48;
        const barLeft    = (width - BAR_W) / 2;         // x de inicio de la barra
        const viewportX  = barLeft + ARROW_W;           // x donde empieza el viewport
        const viewportW  = BAR_W - ARROW_W * 2;         // ancho visible sin flechas
        const stripTop   = 108;
        const stripHeight = ITEM_SPACEY * 2 + 40;

        // Fondo semitransparente solo sobre la barra
        this.add.rectangle(
            width / 2, stripTop + stripHeight / 2,
            BAR_W, stripHeight,
            0x000000, 0.38
        ).setDepth(1);

        // Container que desplazamos; parte desde viewportX
        this.foodContainer = this.add.container(viewportX, 0).setDepth(5);

        // Guardamos las variables para el recorte manual en update()
        this.viewportX = viewportX;
        this.viewportW = viewportW;

        // Flechas de scroll (a los lados de la barra, no de la pantalla)
        const midY = stripTop + stripHeight / 2;
        const btnLeft  = this.add.text(barLeft + ARROW_W / 2, midY, '◄', {
            fontSize: '30px', color: '#f1c40f', stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
        const btnRight = this.add.text(barLeft + BAR_W - ARROW_W / 2, midY, '►', {
            fontSize: '30px', color: '#f1c40f', stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        btnLeft.on('pointerover',  () => btnLeft.setColor('#fff'));
        btnLeft.on('pointerout',   () => btnLeft.setColor('#f1c40f'));
        btnLeft.on('pointerdown',  () => this.scrollStrip(+SCROLL_STEP, viewportX, viewportW));
        btnRight.on('pointerover', () => btnRight.setColor('#fff'));
        btnRight.on('pointerout',  () => btnRight.setColor('#f1c40f'));
        btnRight.on('pointerdown', () => this.scrollStrip(-SCROLL_STEP, viewportX, viewportW));

        // Items mezclados en el container
        const shuffled = Phaser.Utils.Array.Shuffle([...ALL_FOODS]) as FoodConfig[];
        this.totalAnimal = ANIMAL_FOODS.length;

        const totalCols = Math.ceil(shuffled.length / 2);
        const totalVW   = totalCols * ITEM_SPACEX;
        this.minScrollX = viewportX;
        this.maxScrollX = viewportX - Math.max(0, totalVW - viewportW);

        const row1Y = stripTop + 20 + ITEM_SIZE / 2;
        const row2Y = stripTop + 20 + ITEM_SIZE / 2 + ITEM_SPACEY;

        shuffled.forEach((cfg, i) => {
            const col   = Math.floor(i / 2);  // 2 filas, apila de a 2 verticalmente
            const rowIdx = i % 2;
            const lx    = col * ITEM_SPACEX + ITEM_SIZE / 2 + 10;
            const ly    = rowIdx === 0 ? row1Y : row2Y;

            if (!this.textures.exists(cfg.key)) return;

            const img = this.add.image(lx, ly, cfg.key) as DraggableImage;
            img.setDisplaySize(ITEM_SIZE, ITEM_SIZE);

            const bScale     = img.scale;
            img.foodCategory = cfg.category;
            img.localHomeX   = lx;
            img.localHomeY   = ly;
            img.baseScale    = bScale;
            img.placed       = false;

            img.setInteractive({ useHandCursor: true });
            this.input.setDraggable(img);
            this.foodContainer.add(img);

            // Etiqueta (también dentro del container)
            const lbl = this.add.text(lx, ly + ITEM_SIZE / 2 + 2, cfg.label, {
                fontSize: '11px', color: '#ecf0f1', fontFamily: 'Arial',
                stroke: '#000', strokeThickness: 2,
            }).setOrigin(0.5, 0);
            this.foodContainer.add(lbl);

            // Hover
            img.on('pointerover', () => {
                if (img.placed) return;
                this.tweens.add({ targets: img, scale: img.baseScale * 1.25, duration: 110, ease: 'Power1' });
            });
            img.on('pointerout', () => {
                if (img.placed) return;
                this.tweens.add({ targets: img, scale: img.baseScale, duration: 110, ease: 'Power1' });
            });
        });

    }

    // ── Desplaza el container animado ─────────────────────────────────────────
    private scrollStrip(delta: number, _vx?: number, _vw?: number) {
        if (this.isScrolling) return;
        const newX = Phaser.Math.Clamp(
            this.foodContainer.x + delta,
            this.maxScrollX,
            this.minScrollX
        );
        if (newX === this.foodContainer.x) return;
        this.isScrolling = true;
        this.tweens.add({
            targets: this.foodContainer,
            x: newX,
            duration: 350,
            ease: 'Cubic.easeOut',
            onComplete: () => { this.isScrolling = false; },
        });
    }

    // ── Eventos globales de drag ───────────────────────────────────────────────
    private setupDragEvents() {
        // Cuando inicia el arrastre: sacar del container para que no sea cortado por la máscara
        this.input.on('dragstart', (_ptr: any, obj: DraggableImage) => {
            if (obj.placed) return;

            // Convertir posición local del container a coordenadas de mundo
            const worldX = this.foodContainer.x + obj.localHomeX;
            const worldY = this.foodContainer.y + obj.localHomeY;

            this.foodContainer.remove(obj, false);
            this.add.existing(obj);               // agrega directo a la escena
            obj.clearMask();
            obj.x = worldX;
            obj.y = worldY;
            obj.setDepth(30);
        });

        // Mientras arrastra (usa las coordenadas directas del puntero para evitar desfases)
        this.input.on('drag', (ptr: Phaser.Input.Pointer, obj: DraggableImage) => {
            if (obj.placed) return;
            obj.x = ptr.x;
            obj.y = ptr.y;
        });

        // Sin highlight: no se muestra ningún contorno al arrastrar sobre la zona

        // Drop sobre zona — posición libre donde el usuario lo soltó
        this.input.on('drop', (ptr: Phaser.Input.Pointer, obj: DraggableImage) => {
            if (obj.placed) return;

            if (obj.foodCategory === 'animal') {
                // ✅ Correcto: queda exactamente donde lo soltó el usuario
                obj.placed = true;
                obj.disableInteractive();
                obj.x = ptr.x;   // posición exacta del cursor al soltar
                obj.y = ptr.y;
                obj.setAlpha(0.92);
                obj.setDepth(6);
                
                // Reproducir sonido de victoria para objeto
                this.sound.play('object_win');

                this.score += 10;
                this.scoreText.setText(`Puntos: ${this.score}`);
                this.placedAnimal++;
                this.showFeedback('✅ ¡Correcto! +10 puntos', '#2ecc71');
                if (this.placedAnimal >= this.totalAnimal) {
                    this.time.delayedCall(900, () => this.showWin());
                }
            } else {
                // ❌ Incorrecto: devolver al container en su posición original
                this.returnToContainer(obj);
                this.showFeedback('❌ El alimento no pertenece a esa sección', '#e74c3c');
            }
        });

        // Drag terminado sin soltar en zona
        this.input.on('dragend', (_ptr: any, obj: DraggableImage, dropped: boolean) => {
            if (obj.placed) return;
            if (!dropped) {
                this.returnToContainer(obj);
            }
        });
    }

    // ── Regresa el item al container en su posición original ─────────────────
    private returnToContainer(obj: DraggableImage) {
        // Animar hacia la posición actual del container (incluyendo scroll)
        const targetWorldX = this.foodContainer.x + obj.localHomeX;
        const targetWorldY = this.foodContainer.y + obj.localHomeY;

        this.tweens.add({
            targets: obj,
            x: targetWorldX,
            y: targetWorldY,
            scale: obj.baseScale,
            duration: 380,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Reinsertar en el container con posición local
                this.children.remove(obj);
                obj.x = obj.localHomeX;
                obj.y = obj.localHomeY;
                this.foodContainer.add(obj);
                obj.setDepth(5);
            },
        });
    }

    // ── Feedback temporal ─────────────────────────────────────────────────────
    private showFeedback(msg: string, color: string) {
        this.feedbackText.setText(msg).setColor(color).setAlpha(1);
        if (this.feedbackTimer) this.feedbackTimer.remove();
        this.feedbackTimer = this.time.delayedCall(2200, () => {
            this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 400 });
        });
    }

    // ── Pantalla de victoria ──────────────────────────────────────────────────
    private showWin() {
        // Reproducir sonido de victoria del nivel
        this.sound.play('level_win');

        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(40);
        this.add.text(width / 2, height / 2 - 70, '🎉 ¡Nivel Completado!', {
            fontSize: '54px', color: '#f1c40f', fontFamily: 'Arial',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(41);
        this.add.text(width / 2, height / 2, `Puntuación final: ${this.score} puntos`, {
            fontSize: '30px', color: '#ecf0f1', fontFamily: 'Arial',
            stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(41);
        const btnMenu = this.add.text(width / 2, height / 2 + 90, 'Ir al Menú Principal', {
            fontSize: '26px', color: '#fff', backgroundColor: '#2980b9',
            padding: { x: 24, y: 12 }, fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(41).setInteractive({ useHandCursor: true });
        btnMenu.on('pointerover', () => btnMenu.setStyle({ backgroundColor: '#1a5276' }));
        btnMenu.on('pointerout',  () => btnMenu.setStyle({ backgroundColor: '#2980b9' }));
        btnMenu.on('pointerdown', () => this.scene.start('MainMenu'));
    }

    // ── Update: Recorte manual (Culling) ──────────────────────────────────────
    update() {
        if (!this.foodContainer) return;
        
        const left = this.viewportX;
        const right = this.viewportX + this.viewportW;
        
        // Ocultar los elementos que están fuera de la barra visualmente
        this.foodContainer.list.forEach((child: any) => {
            const worldX = this.foodContainer.x + child.x;
            
            // Si el elemento está fuera de los límites de la barra por más de 50px, lo ocultamos
            if (worldX < left - 50 || worldX > right + 50) {
                child.setVisible(false);
            } else {
                child.setVisible(true);
                
                // Efecto de difuminado (fade) suave en los bordes
                if (worldX < left + 30) {
                    child.setAlpha(Math.max(0, (worldX - (left - 50)) / 80));
                } else if (worldX > right - 30) {
                    child.setAlpha(Math.max(0, ((right + 50) - worldX) / 80));
                } else {
                    child.setAlpha(1);
                }
            }
        });
    }
}