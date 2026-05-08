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

    create() {
        const { width, height } = this.scale;

        // Fondo de color sólido para distinguirlo
        this.cameras.main.setBackgroundColor('#2c3e50');

        // Título principal
        this.add.text(width / 2, height / 3, '¡Bienvenido al Nivel 1!', {
            fontSize: '48px',
            color: '#f1c40f',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, height / 2, 'Has completado el tutorial con éxito.', {
            fontSize: '24px',
            color: '#ecf0f1',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Botón para volver al menú (creado con texto)
        const btnVolver = this.add.text(width / 2, height * 0.7, 'Volver al Menú', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // Efectos del botón
        btnVolver.on('pointerover', () => btnVolver.setStyle({ backgroundColor: '#c0392b' }));
        btnVolver.on('pointerout', () => btnVolver.setStyle({ backgroundColor: '#e74c3c' }));
        btnVolver.on('pointerdown', () => {
            this.scene.start('MainMenu'); // Asegúrate de que el nombre de la escena del menú principal sea este
        });
    }
}