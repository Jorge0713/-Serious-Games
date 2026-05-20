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
        const { width, height } = this.scale


        this.cameras.main.setBackgroundColor('#000000')


        this.add.image(width / 2, height / 2, 'full')
            .setDisplaySize(width, height)
        


        this.scene.launch('MusicManagerScene')

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false })
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false })

        this.input.once('pointerdown', () => this.sounds.play())
        this.input.on('pointerover', () => this.soundd.play())
        // Banner (ratio 2400:1349) — 45% del ancho del canvas
        this.add.image(width / 2, height*0.34, 'Banner')
            .setDisplaySize(width*0.5,height*0.7)
        // Logo (ratio 541:461) — 13% del ancho del canvas
        this.add.image(width / 2, height * 0.08, 'Logo')
            .setDisplaySize(width*0.45,height*0.45)

   
      

        const btnTutorial = this.add.image(width / 2, height * 0.33, 'btn-tutorial')
            .setInteractive()

        const btnPlato = this.add.image(width / 2, height * 0.52, 'btn-CrearPlatoInactivo')
            .setInteractive()

        hoverScale(this, btnTutorial, {
            scaleOver: 1.1,
            duration: 150,
            hoverSound: this.soundd
        })

        hoverScale(this, btnPlato, {
            scaleOver: 1.1,
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
            this.scene.start('Nivel1Scene');
        });

        const btnCrucigrama = this.add.text(width / 2, height * 0.87, 'Probar crucigrama', {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#6a0dad',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btnCrucigrama.on('pointerover', () => {
            this.soundd.play();
            btnCrucigrama.setScale(1.1);
        });
        btnCrucigrama.on('pointerout', () => {
            btnCrucigrama.setScale(1);
        });

        btnCrucigrama.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('CrucigramaSaludableScene');
        });

        const btnNivel3 = this.add.text(width / 2, height * 0.20, 'IR AL NIVEL 3', {
            fontSize: '28px',
            color: '#fff',
            backgroundColor: '#ff6600',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btnNivel3.on('pointerover', () => {
            this.soundd.play();
            btnNivel3.setScale(1.1);
        });
        btnNivel3.on('pointerout', () => {
            btnNivel3.setScale(1);
        });

        btnNivel3.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('Nivel3Scene');
        });

        const btnPlatoBalanceado = this.add.text(width / 2, height * 0.95, 'Mi Plato Balanceado', {
            fontSize: '28px',
            color: '#F5FBF2',
            backgroundColor: '#58B15B',
            padding: { x: 20, y: 10 },
            fontStyle: 'bold',
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btnPlatoBalanceado.on('pointerover', () => {
            this.soundd.play();
            btnPlatoBalanceado.setScale(1.08);
        });
        btnPlatoBalanceado.on('pointerout', () => {
            btnPlatoBalanceado.setScale(1);
        });
        btnPlatoBalanceado.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('PlatoBalanceadoScene');
        });
    }


    update(): void {

    }
}