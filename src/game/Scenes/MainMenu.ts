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
        this.load.image('CrearPlatoInactivo', '/assets/CrearPlatoInactivo.png')
        this.load.image('CrearPlatoActivo', '/assets/CrearPlatoActivo.png')
        this.load.image('btn-tutorial', '/assets/BottonInicio.png')

        this.load.spritesheet('Platon', '/assets/PlatonSaluda.png', {
            frameWidth: 187,
            frameHeight: 196
        })
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



        this.music = this.sound.add('ambient_track', { volume: 0.3, loop: true })
        this.music.play()

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false })
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false })

        this.input.once('pointerdown', () => this.sounds.play())
        this.input.on('pointerover', () => this.soundd.play())
        //banner
        this.add.image(700, height * 0.4, 'Banner')
            .setDisplaySize(541 * 2, 461 * 2)
        //logo
        this.add.image(700, height * 0.20, 'Logo')
            .setDisplaySize(541 * 1.5, 461 * 1.5)

        this.anims.create({
            key: 'PltnSl',
            frames: this.anims.generateFrameNames('Platon', { start: 0, end: 15 }),
            frameRate: 15
            , repeat: -1
        })

        const btnTutorial = this.add.image(690, height * 0.42, 'btn-tutorial')
            .setDisplaySize(500 * 1.5, 250)
            .setScale(0.9)
            .setInteractive()


        hoverScale(this, btnTutorial, {
            scaleOver: 1.1,
            duration: 150,
            hoverSound: this.soundd
        })

        const btnPlato = this.add.image(690, height * 0.63, 'CrearPlatoInactivo')
            .setDisplaySize(500 * 1.5, 300)
            .setInteractive()

        hoverScale(this, btnPlato, {
            scaleOver: 1,
            duration: 150,
            hoverSound: this.soundd
        })


        const platon = this.add.sprite(1700, height * 0.82, 'Platon')
            .setDisplaySize(250 * 1.5, 200 * 1.5)

        platon.play('PltnSl')

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


        // --- Título ---
        /*this.titleText = this.add.text(
            width / 2,          // posición X (centro)
            height * 0.3,       // posición Y (30% desde arriba)
            'Nutrición App',    // texto
            {
                fontSize: '48px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5)        // setOrigin(0.5) = centrar el texto en su propio eje

        // --- Subtítulo ---
        this.add.text(
            width / 2,
            height * 0.45,
            'Aprende sobre nutrición jugando',
            {
                fontSize: '20px',
                color: '#a0a0c0'
            }
        ).setOrigin(0.5)

        // --- Botón "Jugar" ---
        this.playButton = this.add.text(
            width / 2,
            height * 0.65,
            ' JUGAR ',
            {
                fontFamily: 'Gill Sants',
                backgroundColor: 'white',
                fontSize: '32px',
                color: '#00ff88',
                fontStyle: 'bold'

            },

        )
            .setOrigin(0.5)
            .setInteractive()       // lo hace clickeable (como agregar un MouseListener en Java)

        // --- Eventos del botón ---
        /*
         * Analogía Java:
         * playButton.addActionListener(e -> cambiarPantalla());
         *
         * En Phaser:
         * objeto.on('evento', callback)
         *//*
this.playButton.on('pointerover', () => {
// Mouse encima → cambiar color (hover)
this.playButton.setColor('#ffffff')
})

this.playButton.on('pointerout', () => {
// Mouse sale → restaurar color
this.playButton.setColor('#00ff88')
})

this.playButton.on('pointerdown', () => {
// Click → cambiar de escena
// Analogía Java: cardLayout.show(panel, "GameScene")
this.scene.start('GameScene')
})*/
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const { width, height } = gameSize
            this.cameras.main.setSize(width, height)
        })
    }


    update(): void {

    }
}