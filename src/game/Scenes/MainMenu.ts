import * as Phaser from 'phaser'


import { hoverScale } from "../../componentes/HoverScale";
export class MainMenu extends Phaser.Scene {

    // ─── PROPIEDADES ────────────────────────────────────────────
    // Analogía Java: atributos de instancia privados
    // private titleText!: Phaser.GameObjects.Text  // Descomentar cuando se use
    // private playButton!: Phaser.GameObjects.Text  // Descomentar cuando se use
    private music!: Phaser.Sound.BaseSound
    private sounds!: Phaser.Sound.BaseSound
    private soundd!: Phaser.Sound.BaseSound

    constructor() {

        super({ key: 'MainMenu' })
    }


    preload(): void {
        this.load.image('Mainmenu', '/assets/Main.png')
        this.load.image('full', '/assets/fullscreen.png')
        this.load.image('Logo', '/assets/LogoApp.png')
        this.load.image('btn-CrearPlatoInactivo', '/assets/Buttons/BotonCrearPlatoInactivo.png')
        this.load.image('btn-CrearPlatoActivo', '/assets/Buttons/BotonCrearPlatoActivo.png')
        this.load.image('btn-tutorial', '/assets/Buttons/BotonTutorial.png')
        this.load.image('marco', '/assets/Marco.png')
        this.load.audio('ambient_track', '/Sound/ambient_track.mp3')
        this.load.audio('Click', '/Sound/Click.mp3')
        this.load.audio('Hover', '/Sound/hiverSound.mp3')
        this.load.image('Banner', '/assets/BannerMain.png')

    }

    create(): void {
        const { width, height } = this.scale
        // const ratio = width / height  // Descomentar cuando se use

        this.cameras.main.setBackgroundColor('#000000')


        this.add.image(width / 2, height / 2, 'full')
            .setDisplaySize(width * 1.0, height * 1.0)
        this.add.image(width / 2, height / 2, 'marco')
            .setDisplaySize(width * 1, height * 1)


        this.music = this.sound.add('ambient_track', { volume: 0.3, loop: true })
        this.music.play()

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false })
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false })

        this.input.once('pointerdown', () => this.sounds.play())
        this.input.on('pointerover', () => this.soundd.play())
        //banner
        this.add.image(width / 2, height * 0.4, 'Banner')
            .setDisplaySize(541 * 2, 461 * 2)
        //logo
        this.add.image(width / 2, height * 0.15, 'Logo')
            .setDisplaySize(541 * 1.5, 461 * 1.5)
        /*
                this.anims.create({
                    key: 'PltnSl',
                    frames: this.anims.generateFrameNames('Platon', { start: 0, end: 15 }),
                    frameRate: 15
                    , repeat: -1
                })
        */
        const btnTutorial = this.add.image(width / 2, height * 0.42, 'btn-tutorial')
            .setInteractive()

        hoverScale(this, btnTutorial, {
            scaleOver: 1.2,
            duration: 150,
            hoverSound: this.soundd
        })

        const btnPlato = this.add.image(width / 2, height * 0.6, 'btn-CrearPlatoInactivo')
            .setInteractive()

        hoverScale(this, btnPlato, {
            scaleOver: 1.2,
            duration: 150,
            hoverSound: this.soundd
        })

        btnTutorial.on('pointerdown', () => {
            this.sounds.play()
            this.scene.start('TutorialScene')
        })

        // --- BOTÓN TEMPORAL PARA IR AL NIVEL 1 ---
        const btnNivel1 = this.add.text(width / 2, height * 0.75, 'IR AL NIVEL 1', {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#00cc00',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        btnNivel1.on('pointerover', () => {
            this.soundd.play();
            btnNivel1.setScale(1.1);
        });
        btnNivel1.on('pointerout', () => {
            btnNivel1.setScale(1);
        });

        btnNivel1.on('pointerdown', () => {
            this.sounds.play();
            // Detener la música del menú al cambiar de escena (opcional)
            this.music.stop(); 
            this.scene.start('Nivel1Scene');
        });

        // --- BOTÓN TEMPORAL PARA IR AL NIVEL 2 ---
        const btnNivel2 = this.add.text(width / 2, height * 0.87, '🎮 IR AL NIVEL 2 (Cereales y Leguminosas)', {
            fontSize: '28px',
            color: '#fff',
            backgroundColor: '#ff6600',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        btnNivel2.on('pointerover', () => {
            this.soundd.play();
            btnNivel2.setScale(1.1);
        });
        btnNivel2.on('pointerout', () => {
            btnNivel2.setScale(1);
        });

        btnNivel2.on('pointerdown', () => {
            this.sounds.play();
            this.music.stop();
            this.scene.start('Nivel2Scene');
        });
    }


    update(): void {

    }
}