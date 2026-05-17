import * as Phaser from 'phaser';
import { hoverScale } from "../../componentes/HoverScale";
import { DialogueSystem } from "../systems/dialog/DialogueSystem";

export class Crucigrama3Scene extends Phaser.Scene {
    private sounds!: Phaser.Sound.BaseSound;
    private soundd!: Phaser.Sound.BaseSound;
    private dialog!: DialogueSystem;
    private platon!: Phaser.GameObjects.Sprite;
    private mensajeInicialMostrado = false;
    private inputActivo = false;
    private juegoCompletado = false;
    private sonidoExito!: Phaser.Sound.BaseSound;
    private eventosAgregados = false;

    private celdasHorizontal: Phaser.GameObjects.Text[] = [];
    private celdasVertical: Phaser.GameObjects.Text[] = [];
    private indiceHorizontal = 0;
    private indiceVertical = 0;
    private modoActual: 'horizontal' | 'vertical' = 'horizontal';

    constructor() {
        super('Crucigrama3Scene');
    }

    init(): void {
        this.mensajeInicialMostrado = false;
        this.inputActivo = false;
        this.indiceHorizontal = 0;
        this.indiceVertical = 0;
        this.juegoCompletado = false;
        this.eventosAgregados = false;
        this.celdasHorizontal = [];
        this.celdasVertical = [];
        this.modoActual = 'horizontal';
    }

    preload(): void {
        this.load.image('Fondo-cocina', '/assets/Fondo_Cocina.png');
        this.load.image('btn-Volver', '/assets/Buttons/BtnVolverCafe.webp');
        this.load.spritesheet("platon", "/assets/Platon/platon.png", { frameWidth: 291, frameHeight: 256 });
        this.load.image("platon-feliz", "/assets/Platon/platon_feliz.png");
        this.load.audio('Click', '/Sound/Click.mp3');
        this.load.audio('Hover', '/Sound/hiverSound.mp3');
        this.load.audio('sonido-exito', '/Sound/correcto.mp3');
    }

    create(): void {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#000000');
        this.add.image(width / 2, height / 2, 'Fondo-cocina').setDisplaySize(width, height);

        this.sounds = this.sound.add('Click', { volume: 0.1, loop: false });
        this.soundd = this.sound.add('Hover', { volume: 0.1, loop: false });
        this.sonidoExito = this.sound.add('sonido-exito', { volume: 0.3, loop: false });

        this.add.text(width / 2, 60, 'CRUCIGRAMA CRUZADO', {
            fontSize: '36px', color: '#fff', fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.platon = this.add.sprite(width * 0.15, height * 0.65, "platon").setScale(1.3);
        this.anims.create({ key: "wave", frames: this.anims.generateFrameNumbers("platon", { start: 0, end: 15 }), frameRate: 12, repeat: -1 });
        this.platon.play("wave");

        this.crearGrid(width / 2, height / 2 - 80);

        this.dialog = new DialogueSystem({ scene: this, x: 50, y: height - 200, width: width - 850 });
        this.dialog.show("Encuentra las palabras que se cruzan en la letra U", 999999);

        if (!this.eventosAgregados) {
            this.eventosAgregados = true;

            this.input.on('pointerdown', () => {
                if (!this.mensajeInicialMostrado) {
                    this.mensajeInicialMostrado = true;
                    this.dialog.show("Vertical: FRUTA | Horizontal: VERDURA", 999999);
                }
            });

            this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
                if (this.juegoCompletado || !this.inputActivo) return;

                if (event.key.length === 1) {
                    this.escribirLetra(event.key.toUpperCase());
                } else if (event.key === 'Backspace') {
                    this.borrarLetra();
                }
            });
        }

        const btnVolver = this.add.image(width * 0.1, height * 0.1, 'btn-Volver').setScale(0.5).setInteractive();
        hoverScale(this, btnVolver, { scaleOver: 1.2, duration: 150, hoverSound: this.soundd });
        btnVolver.on('pointerdown', () => { this.sounds.play(); this.scene.start('MainMenu'); });
    }

    private crearGrid(centerX: number, startY: number): void {
        const tamañoCelda = 45;
        const inicioX = centerX - (7 * tamañoCelda) / 2;
        const inicioY = startY + (tamañoCelda * 2);

        // Horizontal: VERDURA (7 letras)
        for (let i = 0; i < 7; i++) {
            const x = inicioX + i * tamañoCelda;
            const rect = this.add.rectangle(x, inicioY, 45, 45, 0xffffff, 0.7).setInteractive({ useHandCursor: true });
            const texto = this.add.text(x, inicioY, '', { fontSize: '28px', color: '#000', fontStyle: 'bold' }).setOrigin(0.5);
            this.celdasHorizontal.push(texto);
            rect.on('pointerdown', () => { this.sounds.play(); this.inputActivo = true; this.modoActual = 'horizontal'; this.indiceHorizontal = i; });
        }

        // Vertical: FRUTA (5 letras) - se cruza en la U (posición 4 de VERDURA, posición 2 de FRUTA)
        const xU = inicioX + 4 * tamañoCelda;
        const inicioFRUTA = inicioY - 2 * tamañoCelda;

        for (let i = 0; i < 5; i++) {
            const x = xU;
            const y = inicioFRUTA + i * tamañoCelda;
            
            // Si es la posición 2 (la U), reutilizar la celda de horizontal
            if (i === 2) {
                this.celdasVertical.push(this.celdasHorizontal[4]);
            } else {
                const rect = this.add.rectangle(x, y, 45, 45, 0xffffff, 0.7).setInteractive({ useHandCursor: true });
                const texto = this.add.text(x, y, '', { fontSize: '28px', color: '#000', fontStyle: 'bold' }).setOrigin(0.5);
                this.celdasVertical.push(texto);
                rect.on('pointerdown', () => { this.sounds.play(); this.inputActivo = true; this.modoActual = 'vertical'; this.indiceVertical = i; });
            }
        }
    }

    private escribirLetra(letra: string): void {
        // Verificar si VERTICAL (FRUTA) ya está completa para bloquear celda compartida
        const verticalCompleta = this.celdasVertical.map(t => t.text).join('') === 'FRUTA';
        // Verificar si HORIZONTAL (VERDURA) ya está completa para bloquear celda compartida
        const horizontalCompleta = this.celdasHorizontal.map(t => t.text).join('') === 'VERDURA';
        
        if (this.modoActual === 'horizontal') {
            // Si estamos en la celda compartida (índice 4) y FRUTA ya está completa, saltar esa celda
            if (this.indiceHorizontal === 4 && verticalCompleta) {
                this.indiceHorizontal++;
                if (this.indiceHorizontal >= 7) {
                    this.indiceHorizontal = 0;
                }
            }
            
            this.celdasHorizontal[this.indiceHorizontal].setText(letra);
            this.sounds.play();
            
            // Verificar si se completó la palabra
            const palabraActual = this.celdasHorizontal.map(t => t.text).join('');
            if (palabraActual === 'VERDURA' && !verticalCompleta) {
                // Cambiar automáticamente a la otra palabra
                this.modoActual = 'vertical';
                this.indiceVertical = 0;
            } else {
                this.indiceHorizontal++;
                if (this.indiceHorizontal >= 7) {
                    this.indiceHorizontal = 0;
                }
            }
        } else {
            // Si estamos en la celda compartida (índice 2) y VERDURA ya está completa, saltar esa celda
            if (this.indiceVertical === 2 && horizontalCompleta) {
                this.indiceVertical++;
                if (this.indiceVertical >= 5) {
                    this.indiceVertical = 0;
                }
            }
            
            this.celdasVertical[this.indiceVertical].setText(letra);
            this.sounds.play();
            
            // Verificar si se completó la palabra
            const palabraActual = this.celdasVertical.map(t => t.text).join('');
            if (palabraActual === 'FRUTA' && !horizontalCompleta) {
                // Cambiar automáticamente a la otra palabra
                this.modoActual = 'horizontal';
                this.indiceHorizontal = 0;
            } else {
                this.indiceVertical++;
                if (this.indiceVertical >= 5) {
                    this.indiceVertical = 0;
                }
            }
        }
        
        this.verificarVictoria();
    }

    private borrarLetra(): void {
        if (this.modoActual === 'horizontal') {
            this.indiceHorizontal--;
            if (this.indiceHorizontal < 0) this.indiceHorizontal = 6;
            this.celdasHorizontal[this.indiceHorizontal].setText('');
        } else {
            this.indiceVertical--;
            if (this.indiceVertical < 0) this.indiceVertical = 4;
            this.celdasVertical[this.indiceVertical].setText('');
        }
        this.sounds.play();
    }

    private verificarVictoria(): void {
        const palabraH = this.celdasHorizontal.map(t => t.text).join('');
        const palabraV = this.celdasVertical.map(t => t.text).join('');

        if (palabraH === 'VERDURA' && palabraV === 'FRUTA') {
            this.juegoCompletado = true;
            this.dialog.destroy();
            this.platon.setVisible(false);
            const { width, height } = this.scale;
            this.add.image(width * 0.15, height * 0.65, 'platon-feliz').setScale(1.3);
            this.sonidoExito.play();
            this.mostrarPantallaFinal();
        }
    }

    private mostrarPantallaFinal(): void {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.add.rectangle(width / 2, height / 2, 900, 400, 0xffffff, 1).setStrokeStyle(6, 0x4CAF50);
        this.add.text(width / 2, height / 2 - 100, '¡EXCELENTE APRENDIZAJE!', { fontSize: '48px', color: '#4CAF50', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 - 30, '¡Vamos a algo más difícil!', { fontSize: '28px', color: '#000' }).setOrigin(0.5);

        const btnSiguiente = this.add.rectangle(width / 2, height / 2 + 80, 350, 70, 0x4CAF50, 1).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, height / 2 + 80, 'Siguiente crucigrama', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        btnSiguiente.on('pointerover', () => btnSiguiente.setFillStyle(0x45a049));
        btnSiguiente.on('pointerout', () => btnSiguiente.setFillStyle(0x4CAF50));
        btnSiguiente.on('pointerdown', () => { this.sounds.play(); this.scene.start('MainMenu'); });
    }

    update(): void {}
}
