import * as Phaser from 'phaser'


import { hoverScale } from "../../componentes/HoverScale";
export class MainMenu extends Phaser.Scene {

    // ─── PROPIEDADES ────────────────────────────────────────────
    // Analogía Java: atributos de instancia privados
    // private titleText!: Phaser.GameObjects.Text  // Descomentar cuando se use
    // private playButton!: Phaser.GameObjects.Text  // Descomentar cuando se use
    private sounds!: Phaser.Sound.BaseSound
    private soundd!: Phaser.Sound.BaseSound

    constructor() {

        super({ key: 'MainMenu' })
    }

    // Rutas absolutas desde public/ (así las resuelve Phaser/Vite)
    preload(): void {
        this.load.image('full', '/assets/Backgrounds/fullscreen.png')
        this.load.image('Logo', '/assets/Backgrounds/LogoApp.png')
        this.load.image('marco', '/assets/Backgrounds/Marco.png')
        this.load.image('Banner', '/assets/Backgrounds/BannerMain.png')

        this.load.image('btn-CrearPlatoInactivo', '/assets/Buttons/BotonCrearPlatoInactivo.png')
        this.load.image('btn-CrearPlatoActivo', '/assets/Buttons/BotonCrearPlatoActivo.png')
        this.load.image('btn-tutorial', '/assets/Buttons/BotonTutorial.png')

        this.load.audio('Click', '/Sound/Click.mp3')
        this.load.audio('Hover', '/Sound/hiverSound.mp3')

    }

    create(): void {
        // Modificar scale mode a ENVELOP en PhaserGame.ts nos permite dejar esto así, pero los Y los acercamos al centro
        const width = 1920;
        const height = 1080;
        this.cameras.main.setBackgroundColor('#000000')

        // fondo = 0,0 a 1920, 1080 -> 1920x1080. cover.
        const fondo = this.add.image(width / 2, height / 2, 'full')
        fondo.setDisplaySize(width, height)
        


        this.scene.launch('MusicManagerScene')

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false })
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false })

        this.input.once('pointerdown', () => this.sounds.play())
        
        // Logo (reducir tamaño)
        const logo = this.add.image(width / 2, 180, 'Logo')
        logo.setDisplaySize(width * 0.25, height * 0.25)

        // Banner (reducir tamaño y bajar)
        const banner = this.add.image(width / 2, 530, 'Banner')
        banner.setDisplaySize(width * 0.4, height * 0.5)

        const btnTutorial = this.add.image(width / 2, 460, 'btn-tutorial')
            .setInteractive()
            .setScale(0.8)

        const btnPlato = this.add.image(width / 2, 600, 'btn-CrearPlatoInactivo')
            .setInteractive()
            .setScale(0.8)

        hoverScale(this, btnTutorial, {
            scaleOver: 0.85,
            duration: 150,
            hoverSound: this.soundd
        })

        hoverScale(this, btnPlato, {
            scaleOver: 0.85,
            duration: 150,
            hoverSound: this.soundd
        })

        btnPlato.on('pointerdown', () => {
            this.sounds.play()
            // this.scene.start('...')  ← la escena que corresponda
        })
        
        btnTutorial.on('pointerdown', () => {
            this.sounds.play()
            this.scene.start('TutorialScene')
        })

        // --- BOTONES TEMPORALES ---
        // Los pondremos más pequeños y debajo del banner
        const debugStartY = 810;
        const debugSpacing = 55;

        const btnNivel1 = this.add.text(width / 2, debugStartY, 'IR AL NIVEL 1', {
            fontSize: '20px',
            color: '#fff',
            backgroundColor: '#00cc00',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        btnNivel1.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('Nivel1Scene');
        });

        const btnCrucigrama = this.add.text(width / 2, debugStartY + debugSpacing, 'Probar crucigrama', {
            fontSize: '20px',
            color: '#fff',
            backgroundColor: '#6a0dad',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        btnCrucigrama.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('CrucigramaSaludableScene');
        });

        const btnNivel3 = this.add.text(width / 2, debugStartY + debugSpacing * 2, 'IR AL NIVEL 3', {
            fontSize: '20px',
            color: '#fff',
            backgroundColor: '#ff6600',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        btnNivel3.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('Nivel3Scene');
        });

        const btnPlatoBalanceado = this.add.text(width / 2, debugStartY + debugSpacing * 3, 'Mi Plato Balanceado', {
            fontSize: '20px',
            color: '#F5FBF2',
            backgroundColor: '#58B15B',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        btnPlatoBalanceado.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('PlatoBalanceadoScene');
        });
    }


    update(): void {

    }
}