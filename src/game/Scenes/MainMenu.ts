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

        // Botón para tutorial de Frutas y Verduras
        const btnTutorialFV = this.add.text(
            690,
            height * 0.7,
            '🍎 Frutas y Verduras',
            {
                fontFamily: 'Georgia',
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#2d5a27',
                padding: { x: 20, y: 12 },
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setStroke('#4a7c3a', 2)

        btnTutorialFV.on('pointerover', () => {
            btnTutorialFV.setStyle({ backgroundColor: '#4a7c3a' })
            this.soundd.play()
        })

        btnTutorialFV.on('pointerout', () => {
            btnTutorialFV.setStyle({ backgroundColor: '#2d5a27' })
        })

        btnTutorialFV.on('pointerdown', () => {
            this.sounds.play()
            // Llamar al callback global para mostrar el tutorial de React
            const showTutorial = (window as any).showTutorial
            if (showTutorial) {
                showTutorial()
            } else {
                // Si no está disponible, ir a la escena de tutorial existente
                this.scene.start('TutorialScene')
            }
        })


        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const { width, height } = gameSize
            this.cameras.main.setSize(width, height)
        })
    }


    update(): void {

    }
}