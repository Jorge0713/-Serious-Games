import * as Phaser from 'phaser'

/*
 * ANALOGÍA JAVA:
 * public class MainMenu extends Phaser.Scene { ... }
 * Cada escena es una "pantalla" del juego con su propio ciclo de vida.
 */
export class MainMenu extends Phaser.Scene {

    // ─── PROPIEDADES ────────────────────────────────────────────
    // Analogía Java: atributos de instancia privados
    private titleText!: Phaser.GameObjects.Text
    private playButton!: Phaser.GameObjects.Text
    private music!: Phaser.Sound.BaseSound
    private sounds!: Phaser.Sound.BaseSound
    private soundd!:Phaser.Sound.BaseSound

    // ─── CONSTRUCTOR ────────────────────────────────────────────
    constructor() {
        // super() le da un ID único a esta escena
        // Analogía Java: super("MainMenu") en una clase abstracta
        super({ key: 'MainMenu' })
    }

    // ─── PRELOAD ────────────────────────────────────────────────
    /*
     * Se ejecuta UNA vez antes de create().
     * Úsalo para cargar imágenes, audio, fuentes.
     * Analogía Java: como un bloque static {} que carga recursos
     * antes de que el constructor termine.
     */
    preload(): void {
        this.load.image('Mainmenu', '/Main.png')
        this.load.image('full', '/fullscreen.png')
        this.load.image('Logo', '/LogoApp.png')
        this.load.spritesheet('btn-tutorial', '/buttonTutorial.png', {
            frameWidth: 687,
            frameHeight: 282
        })
        this.load.spritesheet('Platon', '/PlatonSaluda.png', {
            frameWidth: 187,
            frameHeight: 196
        })
        this.load.audio('ambient_track', '/Sound/ambient_track.mp3')
        this.load.audio('Click', '/Sound/Click.mp3')
        this.load.audio('Hover', '/Sound/hiverSound.mp3')
        this.load.image('Banner', '/BannerMain.png')

    }

    // ─── CREATE ─────────────────────────────────────────────────
    /*
     * Se ejecuta UNA vez después de preload().
     * Aquí construyes la escena: textos, botones, imágenes.
     * Analogía Java: el cuerpo del constructor donde inicializas
     * todos tus objetos con new.
     */
    create(): void {
        const { width, height } = this.scale
        const ratio = width / height

        this.cameras.main.setBackgroundColor('#000000')


        this.add.image(width / 2, height / 2, 'full')
            .setDisplaySize(width, height)



        this.music = this.sound.add('ambient_track', { volume: 0.1, loop: true })
        this.music.play()

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false })
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false })
    
        this.input.once('pointerdown', () => this.sounds.play())
        this.input.on('pointerover', () => this.soundd.play())

        this.add.image(700, height * 0.4, 'Banner')
            .setDisplaySize(541 * 2, 461 * 2)
        this.add.image(700, height * 0.2, 'Logo')
            .setDisplaySize(541 * 1.5, 461 * 1.5)
        this.anims.create({
            key: 'btn-hover',
            frames: this.anims.generateFrameNumbers('btn-tutorial', { start: 0, end: 15 }),
            frameRate: 70,
            repeat: 0
        })

        this.anims.create({
            key: 'btn-idle',
            frames: this.anims.generateFrameNumbers('btn-tutorial', { start: 15, end: 0 }),
            frameRate: 60,
            repeat: 0
        })
        this.anims.create({
            key: 'PltnSl',
            frames: this.anims.generateFrameNames('Platon', { start: 0, end: 15 }),
            frameRate: 15
            , repeat: -1
        })

        const btn = this.add.sprite(690, height * 0.5, 'btn-tutorial')
            .setDisplaySize(500 * 1.5, 200 * 1.5)
            .setInteractive()

        const platon = this.add.sprite(1640, height * 0.84, 'Platon')
            .setDisplaySize(300 * 1.5, 200 * 1.5)

        platon.play('PltnSl')
        btn.play('btn-idle')

        
        btn.on('pointerover', () => btn.play('btn-hover'))
        btn.on('pointerout', () => btn.play('btn-idle'))

        btn.on('pointerdown', () => {
            this.sounds.play()
            this.scene.start('GameScene')
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

    // ─── UPDATE ─────────────────────────────────────────────────
    /*
     * Se ejecuta 60 veces por segundo MIENTRAS la escena está activa.
     * Analogía Java: como un while(running) { repintar(); } en un game loop.
     * En el menú principal casi no se usa.
     * Lo usarás en escenas con movimiento, física, colisiones.
     */
    update(): void {
        // Por ahora vacío — el menú no necesita lógica por frame
    }
}