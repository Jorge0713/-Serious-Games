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
        this.load.spritesheet('btn-tutorial', '/buttonTutorial.png', {
            frameWidth: 687,
            frameHeight: 282
        })
        this.load.audio('ambient_track', '/ambient_track.mp3')
        this.load.image('Banner','/Banner.png')

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
        // --- Fondo de color sólido ---
        this.cameras.main.setBackgroundColor('#000000')
        let fondoKey = 'Mainmenu'


        if (ratio > 1.9) fondoKey = 'full'
        // pantallas ultrawide

        this.add.image(width / 2, height / 2, fondoKey)
            .setDisplaySize(width, height)
        this.music = this.sound.add('ambient_track', { volume: 0.3, loop: true })
        this.music.play()
        
        this.add.image(width/2,height * 0.4,'Banner')
            .setDisplaySize(1400,600)

        this.anims.create({
            key: 'btn-hover',       
            frames: this.anims.generateFrameNumbers('btn-tutorial', {
                start: 0, end: 15  
            }),
            frameRate: 60,
            repeat: 0
        })

        this.anims.create({
            key: 'btn-idle',     
            frames: this.anims.generateFrameNumbers('btn-tutorial', {
                start: 15, end: 0  
            }),
            frameRate: 60,
            repeat: 0
        })
        const btn = this.add.sprite(width / 2, height * 0.40, 'btn-tutorial')
            .setDisplaySize(500, 200)
            .setInteractive()

        btn.play('btn-idle')   // arranca con animación idle

        btn.on('pointerover', () => btn.play('btn-hover'))
        btn.on('pointerout', () => btn.play('btn-idle'))
        btn.on('pointerdown', () => this.scene.start('GameScene'))


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