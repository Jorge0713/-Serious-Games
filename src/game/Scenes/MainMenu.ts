import * as Phaser from 'phaser'
import { hoverScale } from "../../componentes/HoverScale";

export class MainMenu extends Phaser.Scene {
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
        
        this.add.image(width / 2, height * 0.4, 'Banner')
            .setDisplaySize(541 * 2, 461 * 2)
        
        this.add.image(width / 2, height * 0.15, 'Logo')
            .setDisplaySize(541 * 1.5, 461 * 1.5)

        const btnTutorial = this.add.image(width / 2, height * 0.42, 'btn-tutorial')
            .setInteractive()

        hoverScale(this, btnTutorial, {
            scaleOver: 1.2,
            duration: 150,
            hoverSound: this.soundd
        })

        const btnPlato = this.add.image(width / 2, height * 0.6, 'btn-CrearPlatoActivo')
            .setInteractive()

        hoverScale(this, btnPlato, {
            scaleOver: 1.2,
            duration: 150,
            hoverSound: this.soundd
        })

        btnPlato.on('pointerdown', () => {
            this.sounds.play();
            (window as any).showSpecialMenu = true;
            this.scene.restart();
        })

        btnTutorial.on('pointerdown', () => {
            this.sounds.play()
            this.scene.start('TutorialScene')
        })
    }

    update(): void {
    }
}