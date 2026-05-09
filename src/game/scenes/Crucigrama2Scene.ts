import * as Phaser from 'phaser';
import { hoverScale } from "../../componentes/HoverScale";

export class Crucigrama2Scene extends Phaser.Scene {
    private sounds!: Phaser.Sound.BaseSound;
    private soundd!: Phaser.Sound.BaseSound;

    constructor() {
        super('Crucigrama2Scene');
    }

    preload(): void {
        this.load.image('Fondo-cocina', '/assets/Fondo_Cocina.png');
        this.load.image('btn-Volver', '/assets/Buttons/BtnVolverCafe.webp');
        this.load.audio('Click', '/Sound/Click.mp3');
        this.load.audio('Hover', '/Sound/hiverSound.mp3');
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#000000');

        this.add.image(width / 2, height / 2, 'Fondo-cocina')
            .setDisplaySize(width, height);

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false });
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false });

        const btnVolver = this.add.image(width * 0.1, height * 0.1, 'btn-Volver')
            .setScale(0.5)
            .setInteractive();

        hoverScale(this, btnVolver, {
            scaleOver: 1.2,
            duration: 150,
            hoverSound: this.soundd
        });

        btnVolver.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('MainMenu');
        });
    }

    update(): void {
    }
}