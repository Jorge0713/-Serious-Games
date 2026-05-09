import * as Phaser from 'phaser';

export class Nivel2Scene extends Phaser.Scene {
    private fondo_cocina!: Phaser.GameObjects.Image;
    private platon!: Phaser.GameObjects.Image;
    private aciertos: number = 0;

    // --- LISTA DE ALIMENTOS (8 cereales, 8 leguminosas, 4 sebos) ---
    private alimentos = [
        // CEREALES (8)
        { id: "c1", ruta: "/cereales/rice.png", nombre: "Arroz" },
        { id: "c2", ruta: "/cereales/tortilla.png", nombre: "Tortilla" },
        { id: "c3", ruta: "/cereales/bread.png", nombre: "Pan" },
        { id: "c4", ruta: "/cereales/corn.png", nombre: "Maíz" },
        { id: "c5", ruta: "/cereales/potato.png", nombre: "Papa" },
        { id: "c6", ruta: "/cereales/rebanada-pan.png", nombre: "Rebanada" },
        { id: "c7", ruta: "/cereales/white-chocolote.png", nombre: "Galleta" },
        { id: "c8", ruta: "/cereales/rice.png", nombre: "Avena" },

        // LEGUMINOSAS (8) - Usando imágenes existentes
        { id: "l1", ruta: "/verduras/peas.png", nombre: "Guisantes" },
        { id: "l2", ruta: "/verduras/cabbage.png", nombre: "Lentejas" },
        { id: "l3", ruta: "/verduras/greenbean.png", nombre: "Frijoles" },
        { id: "l4", ruta: "/verduras/daikon.png", nombre: "Garbanzos" },
        { id: "l5", ruta: "/frutas/olive.png", nombre: "Aceituna" },
        { id: "l6", ruta: "/verduras/yam.png", nombre: "Soja" },
        { id: "l7", ruta: "/verduras/greenbean.png", nombre: "Ejotes" },
        { id: "l8", ruta: "/verduras/yam.png", nombre: "Frijol" },

        // SEBOS / DISTRACTORES (4) - De origen animal
        { id: "s1", ruta: "/animal/egg.png", nombre: "Huevo" },
        { id: "s2", ruta: "/animal/chicken.png", nombre: "Pollo" },
        { id: "s3", ruta: "/animal/milk-carton.png", nombre: "Leche" },
        { id: "s4", ruta: "/animal/cheese.png", nombre: "Queso" }
    ];

    constructor() {
        super('Nivel2Scene');
    }

    preload() {
        // --- FONDO GENERAL ---
        this.load.image("Fondo-cocina", "/assets/Fondo_Cocina.png");

        // --- IMÁGENES DE LOS SEGMENTOS ---
        // Cereales y Leguminosas con sprites recoloreados
        this.load.image("segmento-cereales", "/assets/cereales_misma_escala.png");
        this.load.image("segmento-leguminosas", "/assets/legumbres_misma_escala.png");

        // --- PLATÓN ---
        this.load.image("platon-feliz", "/assets/platon_feliz.png");
        this.load.image("platon-triste", "/assets/platon_triste.png");

        // --- SONIDOS ---
        this.load.audio("sonido-exito", "/Sound/correcto.mp3");
        this.load.audio("sonido-error", "/Sound/incorrecto.mp3");
        this.load.audio("sonido-click", "/Sound/Click.mp3");

        this.alimentos.forEach(item => {
            this.load.image(item.id, item.ruta);
        });
    }

    create() {
        this.aciertos = 0;
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
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // --- SEGMENTOS (DROP ZONES) ---
        // Izquierda = Cereales, Derecha = Leguminosas
        const escalaCereales = 0.26;
        const escalaLeguminosas = 0.37;

        // Cereales (izquierda)
        const segmentoCereales = this.add.image(width / 2 - 300, height - 483, "segmento-cereales")
            .setScale(escalaCereales)
            .setInteractive({ dropZone: true, pixelPerfect: true });
        segmentoCereales.setData("categoria", "cereal");

        // Leguminosas (derecha)  
        const segmentoLeguminosas = this.add.image(width / 2 + 300, height - 500, "segmento-leguminosas")
            .setScale(escalaLeguminosas)
            .setInteractive({ dropZone: true, pixelPerfect: true });
        segmentoLeguminosas.setData("categoria", "leguminosa");

        // --- PLATÓN ---
        this.platon = this.add.image(width - 200, height - 200, "platon-feliz")
            .setAlpha(0)
            .setScale(0.8);

        // --- RENDERIZAR ALIMENTOS ---
        const startX = width * 0.1;
        const startY = 150;
        const spacingX = (width * 0.8) / 10;
        const spacingY = 100;

        // Fondo de los alimentos
        this.add.rectangle(width / 2, 210, width, 200, 0xf7cc85, 0.7)
            .setOrigin(0.5);

        this.alimentos.forEach((item, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;
            const x = startX + (col * spacingX);
            const y = startY + (row * spacingY);

            // Determinar categoría basada en el ID
            let categoria = "sebo";
            if (item.id.startsWith("c")) categoria = "cereal";
            else if (item.id.startsWith("l")) categoria = "leguminosa";

            const sprite = this.add.image(x, y, item.id)
                .setInteractive({ useHandCursor: true });

            const texto = this.add.text(x, y + 40, item.nombre, {
                fontSize: '14px',
                color: '#000',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            sprite.setDisplaySize(60, 60);
            this.input.setDraggable(sprite);

            sprite.setData("categoria", categoria);
            sprite.setData("originalX", x);
            sprite.setData("originalY", y);
            sprite.setData("texto", texto);
        });

        // --- LÓGICA DE DRAG & DROP ---
        this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            this.children.bringToTop(gameObject);
            const texto = gameObject.getData("texto");
            if (texto) this.children.bringToTop(texto);
            gameObject.setTint(0xdddddd);
        });

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            const texto = gameObject.getData("texto");
            if (texto) {
                texto.x = dragX;
                texto.y = dragY + 40;
            }
        });

        this.input.on('drop', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Image) => {
            const categoriaItem = gameObject.getData("categoria");
            const categoriaZona = dropZone.getData("categoria");
            const texto = gameObject.getData("texto");

            if (categoriaItem === categoriaZona) {
                // ✅ ACIERTO
                gameObject.clearTint();
                this.input.setDraggable(gameObject, false);
                gameObject.disableInteractive();

                try { this.sound.play("sonido-exito"); } catch (e) { }
                try { this.mostrarPlaton(true); } catch (e) { }

                this.aciertos++;
                if (this.aciertos === 16) {
                    this.time.delayedCall(1000, () => {
                        this.mostrarPantallaFinal();
                    });
                }
            } else {
                // ❌ ERROR
                gameObject.clearTint();
                try { this.sound.play("sonido-error"); } catch (e) { }
                try { this.mostrarPlaton(false); } catch (e) { }

                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.getData("originalX"),
                    y: gameObject.getData("originalY"),
                    duration: 300,
                    ease: 'Power2'
                });

                if (texto) {
                    this.tweens.add({
                        targets: texto,
                        x: gameObject.getData("originalX"),
                        y: gameObject.getData("originalY") + 40,
                        duration: 300,
                        ease: 'Power2'
                    });
                }
            }
        });

        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
            if (!dropped) {
                gameObject.clearTint();
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.getData("originalX"),
                    y: gameObject.getData("originalY"),
                    duration: 300,
                    ease: 'Power2'
                });
                const texto = gameObject.getData("texto");
                if (texto) {
                    this.tweens.add({
                        targets: texto,
                        x: gameObject.getData("originalX"),
                        y: gameObject.getData("originalY") + 40,
                        duration: 300,
                        ease: 'Power2'
                    });
                }
            }
        });
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
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        const panel = this.add.rectangle(width / 2, height / 2, 900, 400, 0xffffff, 1)
            .setStrokeStyle(6, 0x4CAF50);

        const titulo = this.add.text(width / 2, height / 2 - 100, '¡FELICIDADES!', {
            fontSize: '56px',
            color: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const mensaje = this.add.text(width / 2, height / 2 + 10, 'Pusiste todos los alimentos en su segmento correcto.\n¡Estás listo en el conocimiento de cereales y leguminosas!', {
            fontSize: '28px',
            color: '#000',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        const btnSalir = this.add.rectangle(width / 2, height / 2 + 130, 250, 60, 0x4CAF50, 1)
            .setInteractive({ useHandCursor: true });
        
        const txtSalir = this.add.text(width / 2, height / 2 + 130, 'Volver al Menú', {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btnSalir.on('pointerover', () => btnSalir.setFillStyle(0x45a049));
        btnSalir.on('pointerout', () => btnSalir.setFillStyle(0x4CAF50));
        btnSalir.on('pointerdown', () => {
            try { this.sound.play("sonido-click"); } catch(e) {}
            this.scene.start('MainMenu');
        });
        
        const elements = [overlay, panel, titulo, mensaje, btnSalir, txtSalir];
        elements.forEach(el => el.setAlpha(0));
        
        this.input.enabled = false; 
        
        this.tweens.add({
            targets: elements,
            alpha: 1,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                this.input.enabled = true;
            }
        });
    }
}