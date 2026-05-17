import * as Phaser from 'phaser';
import { hoverScale } from "../../componentes/HoverScale";

interface WordConfig {
    id: string;
    answer: string;
    hint: string;
    startX: number;
    startY: number;
    horizontal: boolean;
}

interface Cell {
    x: number;
    y: number;
    letter: string;
    value: string;
    words: string[];
    rect?: Phaser.GameObjects.Rectangle;
    text?: Phaser.GameObjects.Text;
    numberText?: Phaser.GameObjects.Text;
}

const WORDS: WordConfig[] = [
    { id: '1H', answer: 'CARBOHIDRATOS', hint: 'Principal fuente de energía del cuerpo, como el pan o la pasta.', startX: 2, startY: 5, horizontal: true },
    { id: '2H', answer: 'MANZANA', hint: 'Fruta roja, verde o amarilla, muy común y saludable.', startX: 3, startY: 11, horizontal: true },
    { id: '3V', answer: 'PROTEINAS', hint: 'Ayudan a formar músculos; se encuentran en carne, huevo y leguminosas.', startX: 4, startY: 4, horizontal: false },
    { id: '4V', answer: 'CALORIAS', hint: 'Medida de la energía que nos aportan los alimentos.', startX: 6, startY: 2, horizontal: false },
    { id: '5V', answer: 'ENERGIA', hint: 'Lo que nos da la comida para poder jugar, correr y pensar.', startX: 8, startY: 0, horizontal: false },
    { id: '6V', answer: 'HIDRATACION', hint: 'Acción de tomar suficiente agua para mantener el cuerpo sano.', startX: 11, startY: 1, horizontal: false },
    { id: '7V', answer: 'BROCOLI', hint: 'Vegetal verde que parece un arbolito.', startX: 13, startY: 3, horizontal: false }
];

export class CrucigramaSaludableScene extends Phaser.Scene {
    private cells: Record<string, Cell> = {};
    private activeCellKey: string | null = null;
    private clickSound!: Phaser.Sound.BaseSound;
    private hoverSound!: Phaser.Sound.BaseSound;
    private winSound!: Phaser.Sound.BaseSound;
    private inputActive = false;
    
    // UI Elements
    private hintsPanelContainer!: Phaser.GameObjects.Container;
    private hintTexts: Phaser.GameObjects.Text[] = [];

    // Colors (Bosque Cálido)
    private colorVerde = 0x58B15B;
    private colorMaderaOscuro = '#5D4037';
    private colorMaderaOscuroHex = 0x5D4037;
    private colorFondo = 0xF5FBF2;
    private colorMaderaClaro = 0x8D6E63;
    private colorTerracota = 0xD2691E;

    constructor() {
        super('CrucigramaSaludableScene');
    }

    init() {
        this.cells = {};
        this.activeCellKey = null;
        this.inputActive = true;
        this.hintTexts = [];
    }

    preload() {
        this.load.image('btn-Volver', '/assets/Buttons/BtnVolverCafe.webp');
        this.load.audio('Click', '/Sound/Click.mp3');
        this.load.audio('Hover', '/Sound/hiverSound.mp3');
        this.load.audio('sonido-exito', '/Sound/correcto.mp3');
    }

    create() {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor(this.colorFondo);

        this.clickSound = this.sound.add('Click', { volume: 0.1 });
        this.hoverSound = this.sound.add('Hover', { volume: 0.1 });
        this.winSound = this.sound.add('sonido-exito', { volume: 0.3 });

        // Título
        this.add.text(width * 0.1, 40, 'Crucigrama Saludable', {
            fontSize: '48px',
            color: this.colorMaderaOscuro,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });

        this.add.text(width * 0.1, 100, 'Encuentra las palabras ocultas relacionadas con nutrición.', {
            fontSize: '24px',
            color: this.colorMaderaOscuro,
            fontFamily: 'Arial'
        });

        const btnVolver = this.add.image(60, 60, 'btn-Volver')
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        hoverScale(this, btnVolver, {
            scaleOver: 0.45,
            duration: 150,
            hoverSound: this.hoverSound
        });

        btnVolver.on('pointerdown', () => {
            this.clickSound.play();
            this.scene.start('MainMenu');
        });

        this.buildGrid();
        this.drawGrid(width * 0.35, height * 0.55);
        this.drawHintsPanel(width * 0.8, height * 0.55);
        this.drawActionButtons(width * 0.5, 80);

        this.input.keyboard?.on('keydown', this.handleKeydown, this);
    }

    private buildGrid() {
        for (const word of WORDS) {
            let cx = word.startX;
            let cy = word.startY;

            for (let i = 0; i < word.answer.length; i++) {
                const key = `${cx},${cy}`;
                if (!this.cells[key]) {
                    this.cells[key] = {
                        x: cx,
                        y: cy,
                        letter: word.answer[i],
                        value: '',
                        words: [word.id]
                    };
                } else {
                    this.cells[key].words.push(word.id);
                }

                if (word.horizontal) {
                    cx++;
                } else {
                    cy++;
                }
            }
        }
    }

    private drawGrid(centerX: number, centerY: number) {
        const cellSize = 50;
        const padding = 5;

        // Calcular tamaño total para centrar
        let minX = 999, maxX = -999, minY = 999, maxY = -999;
        for (const key in this.cells) {
            const cell = this.cells[key];
            if (cell.x < minX) minX = cell.x;
            if (cell.x > maxX) maxX = cell.x;
            if (cell.y < minY) minY = cell.y;
            if (cell.y > maxY) maxY = cell.y;
        }

        const gridWidth = (maxX - minX + 1) * (cellSize + padding);
        const gridHeight = (maxY - minY + 1) * (cellSize + padding);
        
        const startDrawX = centerX - gridWidth / 2;
        const startDrawY = centerY - gridHeight / 2;

        // Dibujar celdas
        for (const key in this.cells) {
            const cell = this.cells[key];
            const px = startDrawX + (cell.x - minX) * (cellSize + padding) + cellSize / 2;
            const py = startDrawY + (cell.y - minY) * (cellSize + padding) + cellSize / 2;

            const rect = this.add.rectangle(px, py, cellSize, cellSize, 0xFFFFFF)
                .setStrokeStyle(2, this.colorMaderaOscuroHex)
                .setInteractive({ useHandCursor: true });

            const text = this.add.text(px, py, '', {
                fontSize: '28px',
                color: this.colorMaderaOscuro,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            rect.on('pointerdown', () => {
                this.clickSound.play();
                this.setActiveCell(key);
            });

            cell.rect = rect;
            cell.text = text;

            // Dibujar número si es el inicio de una palabra
            for (const word of WORDS) {
                if (word.startX === cell.x && word.startY === cell.y) {
                    const numText = this.add.text(px - cellSize / 2 + 4, py - cellSize / 2 + 2, word.id.replace(/[HV]/g, ''), {
                        fontSize: '14px',
                        color: this.colorMaderaOscuro,
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    });
                    cell.numberText = numText;
                }
            }
        }
    }

    private drawHintsPanel(centerX: number, centerY: number) {
        const panelWidth = 450;
        const panelHeight = 700;

        const bg = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0xFFFFFF)
            .setStrokeStyle(3, this.colorMaderaClaro, 0.5)
            .setOrigin(0.5);
        void bg;
            
        this.hintsPanelContainer = this.add.container(centerX, centerY);

        let currentY = -panelHeight / 2 + 30;

        const addSectionTitle = (title: string) => {
            const t = this.add.text(-panelWidth / 2 + 20, currentY, title, {
                fontSize: '28px',
                color: this.colorMaderaOscuro,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            this.hintsPanelContainer.add(t);
            currentY += 40;
        };

        const addHint = (word: WordConfig) => {
            const hintText = `${word.id.replace(/[HV]/g, '')}. ${word.hint} (${word.answer.length})`;
            const t = this.add.text(-panelWidth / 2 + 20, currentY, hintText, {
                fontSize: '18px',
                color: this.colorMaderaOscuro,
                fontFamily: 'Arial',
                wordWrap: { width: panelWidth - 40 }
            });
            this.hintTexts.push(t);
            this.hintsPanelContainer.add(t);
            currentY += t.height + 20;
        };

        addSectionTitle('→ Horizontales');
        WORDS.filter(w => w.horizontal).forEach(addHint);

        currentY += 10;
        addSectionTitle('↓ Verticales');
        WORDS.filter(w => !w.horizontal).forEach(addHint);
    }

    private drawActionButtons(startX: number, startY: number) {
        const createBtn = (x: number, y: number, text: string, color: number, textColor: string, callback: () => void) => {
            const w = 180;
            const h = 50;
            const container = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, w, h, color)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, this.colorMaderaOscuroHex, 0.2);
            const txt = this.add.text(0, 0, text, {
                fontSize: '22px',
                color: textColor,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            container.add([bg, txt]);

            bg.on('pointerover', () => {
                this.hoverSound.play();
                bg.setAlpha(0.8);
                container.setScale(1.05);
            });
            bg.on('pointerout', () => {
                bg.setAlpha(1);
                container.setScale(1);
            });
            bg.on('pointerdown', () => {
                this.clickSound.play();
                callback();
            });
        };

        createBtn(startX, startY, 'C Limpiar', 0xEAE0D5, this.colorMaderaOscuro, () => this.limpiar());
        createBtn(startX + 200, startY, '💡 Pista', 0xF4A261, '#FFFFFF', () => this.darPista());
        createBtn(startX + 400, startY, '✓ Validar', this.colorVerde, '#FFFFFF', () => this.validar());
    }

    private setActiveCell(key: string) {
        if (!this.inputActive) return;
        
        // Reset old highlight
        if (this.activeCellKey && this.cells[this.activeCellKey]) {
            this.cells[this.activeCellKey].rect?.setFillStyle(0xFFFFFF);
        }

        this.activeCellKey = key;

        // Highlight new
        if (this.activeCellKey && this.cells[this.activeCellKey]) {
            this.cells[this.activeCellKey].rect?.setFillStyle(0xE8F5E9); // Light green
        }
    }

    private handleKeydown(event: KeyboardEvent) {
        if (!this.inputActive || !this.activeCellKey) return;

        const cell = this.cells[this.activeCellKey];

        if (event.key === 'Backspace') {
            cell.value = '';
            cell.text?.setText('');
            // Optional: Move back to previous cell
        } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
            const char = event.key.toUpperCase();
            cell.value = char;
            cell.text?.setText(char);
            
            // Highlight reset color if it was red before
            cell.rect?.setStrokeStyle(2, this.colorMaderaOscuroHex);
            cell.text?.setColor(this.colorMaderaOscuro);

            // Move to next cell logic
            this.moveToNextCell(cell);
        }
    }

    private moveToNextCell(currentCell: Cell) {
        // Try to infer direction from the words this cell belongs to
        // If it belongs to one word, move in that direction
        if (currentCell.words.length > 0) {
            const wordId = currentCell.words[0]; // Simplification
            const word = WORDS.find(w => w.id === wordId);
            if (word) {
                const nextX = word.horizontal ? currentCell.x + 1 : currentCell.x;
                const nextY = word.horizontal ? currentCell.y : currentCell.y + 1;
                const nextKey = `${nextX},${nextY}`;
                if (this.cells[nextKey]) {
                    this.setActiveCell(nextKey);
                }
            }
        }
    }

    private limpiar() {
        for (const key in this.cells) {
            const cell = this.cells[key];
            cell.value = '';
            cell.text?.setText('');
            cell.rect?.setStrokeStyle(2, this.colorMaderaOscuroHex);
            cell.text?.setColor(this.colorMaderaOscuro);
            if (cell.rect?.fillColor !== 0xFFFFFF && key !== this.activeCellKey) {
                 cell.rect?.setFillStyle(0xFFFFFF);
            }
        }
        if (this.activeCellKey) this.setActiveCell(this.activeCellKey);
    }

    private darPista() {
        if (!this.activeCellKey) {
            // Pick random empty cell
            const emptyKeys = Object.keys(this.cells).filter(k => this.cells[k].value !== this.cells[k].letter);
            if (emptyKeys.length > 0) {
                const randomKey = emptyKeys[Math.floor(Math.random() * emptyKeys.length)];
                this.setActiveCell(randomKey);
            }
        }

        if (this.activeCellKey) {
            const cell = this.cells[this.activeCellKey];
            cell.value = cell.letter;
            cell.text?.setText(cell.letter);
            cell.text?.setColor('#2E7D32'); // Dark green to show it's a hint
            
            // Move next
            this.moveToNextCell(cell);
        }
    }

    private validar() {
        let allCorrect = true;

        for (const key in this.cells) {
            const cell = this.cells[key];
            if (cell.value === '') {
                allCorrect = false;
                continue;
            }

            if (cell.value === cell.letter) {
                cell.rect?.setStrokeStyle(3, this.colorVerde);
                cell.text?.setColor('#2E7D32');
            } else {
                allCorrect = false;
                cell.rect?.setStrokeStyle(3, this.colorTerracota);
                cell.text?.setColor('#C62828');
                
                // Shake animation
                if (cell.rect) {
                    this.tweens.add({
                        targets: [cell.rect, cell.text],
                        x: '+=5',
                        yoyo: true,
                        repeat: 3,
                        duration: 50
                    });
                }
            }
        }

        if (allCorrect) {
            this.showWinScreen();
        }
    }

    private showWinScreen() {
        this.inputActive = false;
        this.winSound.play();

        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(10);
        
        const card = this.add.rectangle(width / 2, height / 2, 700, 400, 0xFFFFFF)
            .setStrokeStyle(6, this.colorVerde)
            .setDepth(11);

        this.add.text(width / 2, height / 2 - 80, '¡Excelente Trabajo!', {
            fontSize: '56px',
            color: '#2E7D32',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        this.add.text(width / 2, height / 2 + 10, 'Has completado el crucigrama saludable.', {
            fontSize: '28px',
            color: this.colorMaderaOscuro,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11);

        const btnContinuar = this.add.rectangle(width / 2, height / 2 + 120, 300, 70, this.colorVerde)
            .setInteractive({ useHandCursor: true })
            .setDepth(11);

        this.add.text(width / 2, height / 2 + 120, 'Continuar', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(12);

        btnContinuar.on('pointerover', () => {
            this.hoverSound.play();
            btnContinuar.setFillStyle(0x4CAF50);
        });
        btnContinuar.on('pointerout', () => {
            btnContinuar.setFillStyle(this.colorVerde);
        });
        btnContinuar.on('pointerdown', () => {
            this.clickSound.play();
            this.scene.start('MainMenu'); // Temporary, till PreTutorialConceptosScene is there
        });

        // Intro animation
        this.tweens.add({
            targets: [card],
            scaleX: { from: 0, to: 1 },
            scaleY: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
    }
}
