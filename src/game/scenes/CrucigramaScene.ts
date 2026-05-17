import * as Phaser from 'phaser';
import { hoverScale } from "../../componentes/HoverScale";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";

export class CrucigramaScene extends Phaser.Scene {
    private sounds!: Phaser.Sound.BaseSound;
    private soundd!: Phaser.Sound.BaseSound;
    private textosLetras: Phaser.GameObjects.Text[] = [];
    private indiceActual = 0;
    private inputActivo = false;
    private dialog!: DialogueSystem;
    private platon!: Phaser.GameObjects.Sprite;
    private platonFeliz!: Phaser.GameObjects.Image;
    private mensajeInicialMostrado = false;
    private juegoCompletado = false;
    private sonidoExito!: Phaser.Sound.BaseSound;
    private eventosAgregados = false;

    constructor() {
        super('CrucigramaScene');
    }

    init(): void {
        this.mensajeInicialMostrado = false;
        this.inputActivo = false;
        this.indiceActual = 0;
        this.juegoCompletado = false;
        this.textosLetras = [];
        this.eventosAgregados = false;
    }

    preload(): void {
        this.load.image('Fondo-cocina', '/assets/Fondo_Cocina.png');
        this.load.image('btn-Volver', '/assets/Buttons/BtnVolverCafe.webp');
        this.load.spritesheet("platon", "/assets/platon.png", {
            frameWidth: 291,
            frameHeight: 256
        });
        this.load.image("platon-feliz", "/assets/platon_feliz.png");
        this.load.audio('Click', '/Sound/Click.mp3');
        this.load.audio('Hover', '/Sound/hiverSound.mp3');
        this.load.audio('sonido-exito', '/Sound/correcto.mp3');
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#000000');

        this.add.image(width / 2, height / 2, 'Fondo-cocina')
            .setDisplaySize(width, height);

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false });
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false });
        this.sonidoExito = this.sound.add('sonido-exito', { volume: 0.3, loop: false });

        this.add.text(width / 2, 60, 'CRUCIGRAMA', {
            fontSize: '48px',
            color: '#fff',
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.platon = this.add.sprite(
            width * 0.15,
            height * 0.65,
            "platon"
        ).setScale(1.3);

        this.anims.create({
            key: "wave",
            frames: this.anims.generateFrameNumbers("platon", { start: 0, end: 15 }),
            frameRate: 12,
            repeat: -1
        });
        this.platon.play("wave");

        this.crearCuadrosLetras(width / 2, height / 2 - 120);

        this.dialog = new DialogueSystem({
            scene: this,
            x: 50,
            y: height - 200,
            width: width - 850
        });

        this.dialog.show("Haz click en cualquier celda y podrás comenzar a escribir", 999999);

        if (!this.eventosAgregados) {
            this.eventosAgregados = true;
            
            this.input.on('pointerdown', () => {
                if (!this.mensajeInicialMostrado) {
                    this.mensajeInicialMostrado = true;
                    this.dialog.show("La primera palabra de nuestro crucigrama es también el primer grupo del plato. Empieza con 'V'", 999999);
                }
            });

            this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
                if (this.juegoCompletado) return;
                
                if (this.inputActivo && this.indiceActual < 8) {
                    if (event.key.length === 1) {
                        this.textosLetras[this.indiceActual].setText(event.key.toUpperCase());
                        this.sounds.play();
                        this.indiceActual++;
                        this.verificarRespuesta();
                    } else if (event.key === 'Backspace' && this.indiceActual > 0) {
                        this.indiceActual--;
                        this.textosLetras[this.indiceActual].setText('');
                        this.sounds.play();
                    }
                }
            });
        }

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

    private crearCuadrosLetras(x: number, y: number): void {
        const tamañoCuadro = 45;

        for (let i = 0; i < 8; i++) {
            const posicionY = y + (i * (tamañoCuadro + 5));

            const cuadrado = this.add.rectangle(
                x,
                posicionY,
                tamañoCuadro,
                tamañoCuadro,
                0xffffff,
                0.7
            ).setInteractive({ useHandCursor: true });

            const letraTexto = this.add.text(x, posicionY, '', {
                fontSize: '32px',
                color: '#000',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.textosLetras.push(letraTexto);

            cuadrado.on('pointerdown', () => {
                this.sounds.play();
                this.inputActivo = true;
                this.indiceActual = 0;
            });
        }
    }

    private verificarRespuesta(): void {
        const palabra = this.textosLetras.map(t => t.text).join('');
        if (palabra === 'VERDURAS') {
            this.juegoCompletado = true;
            this.dialog.destroy();
            this.platon.setVisible(false);
            
            const { width, height } = this.scale;
            this.platonFeliz = this.add.image(width * 0.15, height * 0.65, 'platon-feliz')
                .setScale(1.3);
            void this.platonFeliz;
            
            this.sonidoExito.play();
            
            this.mostrarPantallaFinal();
        }
    }

    private mostrarPantallaFinal(): void {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.add.rectangle(width / 2, height / 2, 900, 400, 0xffffff, 1).setStrokeStyle(6, 0x4CAF50);

        this.add.text(width / 2, height / 2 - 100, '¡EXCELENTE APRENDIZAJE!', {
            fontSize: '48px',
            color: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 30, '¡Vamos a algo más difícil!', {
            fontSize: '28px',
            color: '#000',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        const btnSiguiente = this.add.rectangle(width / 2, height / 2 + 80, 350, 70, 0x4CAF50, 1)
            .setInteractive({ useHandCursor: true });
        
        this.add.text(width / 2, height / 2 + 80, 'Siguiente crucigrama', {
            fontSize: '28px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btnSiguiente.on('pointerover', () => btnSiguiente.setFillStyle(0x45a049));
        btnSiguiente.on('pointerout', () => btnSiguiente.setFillStyle(0x4CAF50));
        btnSiguiente.on('pointerdown', () => {
            this.sounds.play();
            this.scene.start('Crucigrama3Scene');
        });
    }

    update(): void {
    }
}