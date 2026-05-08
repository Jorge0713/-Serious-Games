import * as Phaser from 'phaser';

export class Nivel1Scene extends Phaser.Scene {
    private fondo_cocina!: Phaser.GameObjects.Image;
    private platon!: Phaser.GameObjects.Image;
    private aciertos: number = 0;

    // --- LISTA DE ALIMENTOS (8 verduras, 8 frutas, 4 sebos) ---
    private alimentos = [
        // VERDURAS (8)
        { id: "v1", ruta: "/verduras/carrot.png", nombre: "Zanahoria" },
        { id: "v2", ruta: "/verduras/broccoli.png", nombre: "Brócoli" },
        { id: "v3", ruta: "/verduras/cabbage.png", nombre: "Col" },
        { id: "v4", ruta: "/verduras/onion.png", nombre: "Cebolla" },
        { id: "v5", ruta: "/verduras/gourd.png", nombre: "Calabaza" },
        { id: "v6", ruta: "/verduras/lettuce.png", nombre: "Lechuga" },
        { id: "v7", ruta: "/verduras/tomato.png", nombre: "Tomate" },
        { id: "v8", ruta: "/verduras/green-bell-pepper.png", nombre: "Pimiento" },

        // FRUTAS (8)
        { id: "f1", ruta: "/frutas/apple.png", nombre: "Manzana" },
        { id: "f2", ruta: "/frutas/pear.png", nombre: "Pera" },
        { id: "f3", ruta: "/frutas/grapes.png", nombre: "Uvas" },
        { id: "f4", ruta: "/frutas/orange.png", nombre: "Naranja" },
        { id: "f5", ruta: "/frutas/raspberry.png", nombre: "Frambuesa" },
        { id: "f6", ruta: "/frutas/strawberry.png", nombre: "Fresa" },
        { id: "f7", ruta: "/frutas/bananas.png", nombre: "Plátano" },
        { id: "f8", ruta: "/frutas/lime.png", nombre: "Limón" },

        // SEBOS / DISTRACTORES (4)
        { id: "s1", ruta: "/cereales/corn.png", nombre: "Maíz" },
        { id: "s2", ruta: "/cereales/potato.png", nombre: "Papa" },
        { id: "s3", ruta: "/origenAnimal/mojarra.png", nombre: "Pescado" },
        { id: "s4", ruta: "/origenAnimal/carne-cruda.png", nombre: "Carne" }
    ];

    constructor() {
        super('Nivel1Scene');
    }

    preload() {
        // --- FONDO GENERAL ---
        this.load.image("Fondo-cocina", "/assets/Fondo_Cocina.png");

        // --- PON AQUÍ LAS RUTAS DE LAS IMÁGENES DE LOS SEGMENTOS VACÍOS ---
        // Ejemplo: this.load.image("segmento-verduras", "/ruta/a/tu/segmento_verduras.png");
        this.load.image("segmento-verduras", "/assets/verduras_misma_escala.png");
        this.load.image("segmento-frutas", "/assets/frutas_misma_escala.png");

        // --- PON AQUÍ LAS RUTAS DE PLATÓN ---
        this.load.image("platon-feliz", "/assets/platon_feliz.png");
        this.load.image("platon-triste", "/assets/platon_triste.png");

        // --- PON AQUÍ LAS RUTAS DE LOS SONIDOS ---
        this.load.audio("sonido-exito", "/Sound/correcto.mp3");
        this.load.audio("sonido-error", "/Sound/incorrecto.mp3");
        this.load.audio("sonido-click", "/Sound/Click.mp3");

        this.alimentos.forEach(item => {
            this.load.image(item.id, item.ruta);
        });
    }

    create() {
        this.aciertos = 0; // Reiniciar contador de aciertos
        const { width, height } = this.scale;

        // 1. DIBUJAR FONDO
        this.fondo_cocina = this.add.image(width / 2, height / 2, "Fondo-cocina")
            .setScale(0.5)
            .setDisplaySize(width, height);

        // 2. TEXTO DE INSTRUCCIÓN
        this.add.text(width / 2, 75, 'Arrastra las frutas y verduras a su lugar en el plato', {
            fontSize: '32px',
            color: '#000',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // --- PASO 2: CREAR SEGMENTOS (DROP ZONES) ---
        // Si una imagen es más grande que otra (por tener más espacio transparente), 
        // puedes darles escalas independientes aquí:
        const escalaVerduras = 0.26;
        const escalaFrutas = 0.37;

        // Añadimos pixelPerfect: true para que las transparencias no bloqueen el clic
        const segmentoVerduras = this.add.image(width / 2 - 300, height - 483, "segmento-verduras")
            .setScale(escalaVerduras)
            .setInteractive({ dropZone: true, pixelPerfect: true });
        segmentoVerduras.setData("categoria", "verdura");

        const segmentoFrutas = this.add.image(width / 2 + 300, height - 500, "segmento-frutas")
            .setScale(escalaFrutas)
            .setInteractive({ dropZone: true, pixelPerfect: true });
        segmentoFrutas.setData("categoria", "fruta");

        // --- PASO 2: PREPARAR A PLATÓN ---
        // Lo ponemos en una esquina (ej. abajo a la derecha) y oculto al inicio
        this.platon = this.add.image(width - 200, height - 200, "platon-feliz")
            .setAlpha(0)
            .setScale(0.8);

        // --- PASO 3: RENDERIZAR LISTA DE ALIMENTOS ARRIBA ---
        // Los pondremos en 2 filas de 10 elementos en la parte superior
        const startX = width * 0.1;
        const startY = 150;
        const spacingX = (width * 0.8) / 10;
        const spacingY = 100;

        // --- FONDO DE LOS ALIMENTOS ---
        // Rectángulo que abarca todo el ancho, de color #f7cc85 (0xf7cc85)
        this.add.rectangle(width / 2, 210, width, 200, 0xf7cc85, 0.7)
            .setOrigin(0.5);

        this.alimentos.forEach((item, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;
            const x = startX + (col * spacingX);
            const y = startY + (row * spacingY);

            // Determinar categoría basada en el ID (v = verdura, f = fruta, s = sebo)
            let categoria = "sebo";
            if (item.id.startsWith("v")) categoria = "verdura";
            else if (item.id.startsWith("f")) categoria = "fruta";

            const sprite = this.add.image(x, y, item.id)
                .setInteractive({ useHandCursor: true });

            // Crear el texto del nombre abajito del alimento
            const texto = this.add.text(x, y + 40, item.nombre, {
                fontSize: '14px',
                color: '#000',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Limitar el tamaño de las imágenes por si son muy grandes
            sprite.setDisplaySize(60, 60);

            // Hacerlo arrastrable
            this.input.setDraggable(sprite);

            // Guardar información en el sprite para usarla al soltar
            sprite.setData("categoria", categoria);
            sprite.setData("originalX", x);
            sprite.setData("originalY", y);
            sprite.setData("texto", texto); // Guardamos la referencia al texto
        });

        // --- PASO 4: LÓGICA DE DRAG & DROP ---

        // Al empezar a arrastrar
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            this.children.bringToTop(gameObject);

            // También traemos el texto al frente
            const texto = gameObject.getData("texto");
            if (texto) this.children.bringToTop(texto);

            gameObject.setTint(0xdddddd); // Oscurecer un poco al agarrarlo
        });

        // Mientras se mueve el mouse
        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;

            // Que el texto siga a la imagen
            const texto = gameObject.getData("texto");
            if (texto) {
                texto.x = dragX;
                texto.y = dragY + 40;
            }
        });

        // Cuando el alimento se suelta DENTRO de un Drop Zone
        this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Image) => {
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
                    // Esperar 1 segundo antes de mostrar la pantalla final para que se vea la animación
                    this.time.delayedCall(1000, () => {
                        this.mostrarPantallaFinal();
                    });
                }
            } else {
                // ❌ ERROR (Cayó en el dropzone equivocado)
                gameObject.clearTint();
                try { this.sound.play("sonido-error"); } catch (e) { }
                try { this.mostrarPlaton(false); } catch (e) { }

                // Regresar a la cinta arriba con animación
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

        // Cuando el alimento se suelta (se lanza siempre)
        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
            if (!dropped) {
                // 😶 SILENCIO (Lo soltó en la nada, afuera del plato)
                // Se regresa a la lista sin marcar error ni enojar a Platón
                gameObject.clearTint();

                // Regresar a la cinta
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

    /**
     * Función para mostrar a Platón dando feedback
     */
    private mostrarPlaton(esFeliz: boolean) {
        // Cambiar la textura según el resultado
        this.platon.setTexture(esFeliz ? "platon-feliz" : "platon-triste");

        // Aparecer con una animación rápida
        this.tweens.add({
            targets: this.platon,
            alpha: 1,
            y: this.scale.height - 250, // Subir un poquito para dar efecto de "asomarse"
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Ocultarlo después de 2 segundos
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: this.platon,
                        alpha: 0,
                        y: this.scale.height - 200, // Regresar abajo
                        duration: 300
                    });
                });
            }
        });
    }

    /**
     * Muestra la pantalla de victoria al acomodar todas las frutas y verduras
     */
    private mostrarPantallaFinal() {
        const { width, height } = this.scale;

        // Fondo oscuro semitransparente
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        // Contenedor del mensaje
        const panel = this.add.rectangle(width / 2, height / 2, 900, 400, 0xffffff, 1)
            .setStrokeStyle(6, 0x4CAF50);

        // Título
        const titulo = this.add.text(width / 2, height / 2 - 100, '¡FELICIDADES!', {
            fontSize: '56px',
            color: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Mensaje
        const mensaje = this.add.text(width / 2, height / 2 + 10, 'Pusiste todos los alimentos en su segmento correcto.\n¡Estás listo en el conocimiento de frutas y verduras!', {
            fontSize: '28px',
            color: '#000',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        // Botón para salir
        const btnSalir = this.add.rectangle(width / 2, height / 2 + 130, 250, 60, 0x4CAF50, 1)
            .setInteractive({ useHandCursor: true });
        
        const txtSalir = this.add.text(width / 2, height / 2 + 130, 'Volver al Menú', {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Efectos del botón
        btnSalir.on('pointerover', () => btnSalir.setFillStyle(0x45a049));
        btnSalir.on('pointerout', () => btnSalir.setFillStyle(0x4CAF50));
        btnSalir.on('pointerdown', () => {
            try { this.sound.play("sonido-click"); } catch(e) {}
            this.scene.start('MainMenu');
        });
        
        // Animación de entrada de todos los elementos
        const elements = [overlay, panel, titulo, mensaje, btnSalir, txtSalir];
        elements.forEach(el => el.setAlpha(0));
        
        // Desactivamos el arrastre de los "sebos" restantes
        this.input.enabled = false; 
        
        this.tweens.add({
            targets: elements,
            alpha: 1,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                this.input.enabled = true; // Reactivamos para poder dar clic al botón
            }
        });
    }
}