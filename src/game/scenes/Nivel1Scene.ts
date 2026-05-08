import * as Phaser from 'phaser';

export class Nivel1Scene extends Phaser.Scene {
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