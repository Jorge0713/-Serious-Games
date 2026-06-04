import * as Phaser from 'phaser';
import { PrefabButtons } from '../../componentes/PrefabButtons';
import { FlowProgressService } from '../../services/FlowProgressService';

import { type WordConfig, generateDynamicCrossword } from '../../data/crosswordGenerator';

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

export class CrucigramaSaludableScene extends Phaser.Scene {
    private currentWords: WordConfig[] = [];
    private cells: Record<string, Cell> = {};
    private activeCellKey: string | null = null;
    private currentDirection: 'H' | 'V' = 'H';
    private clickSound!: Phaser.Sound.BaseSound;
    private hoverSound!: Phaser.Sound.BaseSound;
    private winSound!: Phaser.Sound.BaseSound;
    private inputActive = false;

    // Elementos de UI
    private uiContainer!: Phaser.GameObjects.Container;
    private centerContainer!: Phaser.GameObjects.Container;
    private maxScrollY: number = 1000;
    private maxCameraScroll: number = 0;
    private visibleScreenHeight: number = 0;

    // Paleta de colores Bosque Cálido
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
        this.currentDirection = 'H';
        this.currentWords = generateDynamicCrossword(7);
    }

    preload() {
        PrefabButtons.preload(this);
        this.load.audio('Click', '/Sound/Click.mp3');
        this.load.audio('Hover', '/Sound/hoverSound.mp3');
        this.load.audio('sonido-exito', '/Sound/acierto.mp3');
    }

    create() {
        try {
            this.cameras.main.setBackgroundColor(this.colorFondo);

            this.clickSound = this.sound.add('Click', { volume: 0.1 });
            this.hoverSound = this.sound.add('Hover', { volume: 0.1 });
            this.winSound = this.sound.add('sonido-exito', { volume: 0.3 });

            this.setupUI();

            this.input.keyboard?.on('keydown', this.handleKeydown, this);
            this.scale.on('resize', () => this.handleResize());
            
            // Priorización visual de la escena activa
            this.scene.bringToTop();
        } catch (e: any) {
            console.error("Error en CrucigramaSaludableScene:", e);
            alert("Error en crucigrama: " + e.message);
        }
    }

    private setupUI() {
        const { width, height } = this.scale;
        
        // Cálculo del área visible real en modo ENVELOP
        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleTop = (height - window.innerHeight / screenScale) / 2;
        
        // Limpieza del contenedor previo
        if (this.uiContainer) this.uiContainer.destroy();
        this.uiContainer = this.add.container(0, 0);

        // Alineación del contenedor central con la parte superior visible
        const scaleFactor = Math.min(window.innerWidth / 1300, 1);
        this.centerContainer = this.add.container(width / 2, visibleTop);
        this.centerContainer.setScale(scaleFactor);
        this.uiContainer.add(this.centerContainer);

        // Posicionamiento del título en coordenadas relativas a visibleTop
        const title = this.add.text(-630, 40, 'Crucigrama Saludable', {
            fontSize: '48px',
            color: this.colorMaderaOscuro,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });

        const subtitle = this.add.text(-630, 100, 'Encuentra las palabras ocultas relacionadas con nutrición.', {
            fontSize: '24px',
            color: this.colorMaderaOscuro,
            fontFamily: 'Arial'
        });

        this.centerContainer.add([title, subtitle]);

        const btnVolver = PrefabButtons.secundario(this, 110, 90, () => {
            this.scene.start('PreTutorialConceptosScene', {
                nextLevel: 'CrucigramaSaludableScene',
            });
        }, {
            text: '< Volver',
            width: 180,
            height: 80,
            fontSize: '30px',
            textOffsetY: -4,
            hoverScale: 1.04,
            hoverSound: this.hoverSound,
            clickSound: this.clickSound,
        });
        btnVolver.setScrollFactor(0); // Fijación del botón en pantalla

        this.uiContainer.add([btnVolver]);

        // Reconstrucción de la cuadrícula de datos cuando está vacía
        if (Object.keys(this.cells).length === 0) {
            this.buildGrid();
        }
        
        // Dibujo con el borde superior fijado debajo del título
        this.drawGrid(-360, 170);
        this.drawHintsPanel(438, 510);
        this.drawActionButtons(440, 80);

        this.setupScrolling(scaleFactor);
    }

    private setupScrolling(scaleFactor: number) {
        const { width, height } = this.scale;
        
        // Cálculo del área visible real en modo ENVELOP
        const screenScale = Math.max(window.innerWidth / width, window.innerHeight / height);
        const visibleHeight = window.innerHeight / screenScale;
        this.visibleScreenHeight = visibleHeight;
        
        const contentHeight = this.maxScrollY * scaleFactor;

        // Inicio del desplazamiento en la parte superior
        this.cameras.main.scrollY = 0;

        // Desactivación del desplazamiento cuando el contenido cabe en pantalla
        if (contentHeight <= visibleHeight) {
            this.maxCameraScroll = 0;
            return;
        }

        // Límites de desplazamiento
        const minScroll = 0; 
        const maxScroll = contentHeight - visibleHeight + 40; // Padding final de 40px
        this.maxCameraScroll = maxScroll;

        let isDragging = false;
        let startY = 0;
        let startScrollY = 0;

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            isDragging = true;
            startY = pointer.y;
            startScrollY = this.cameras.main.scrollY;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (isDragging) {
                const newScroll = startScrollY - (pointer.y - startY);
                this.cameras.main.scrollY = Phaser.Math.Clamp(newScroll, minScroll, maxScroll);
            }
        });

        this.input.on('pointerup', () => { isDragging = false; });
        this.input.on('pointerupoutside', () => { isDragging = false; });

        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
            const newScroll = this.cameras.main.scrollY + deltaY;
            this.cameras.main.scrollY = Phaser.Math.Clamp(newScroll, minScroll, maxScroll);
        });
    }

    private handleResize() {
        this.setupUI();
        if (this.activeCellKey) {
            this.setActiveCell(this.activeCellKey);
        }
    }

    private buildGrid() {
        this.cells = {};
        for (const word of this.currentWords) {
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

                if (word.horizontal) cx++;
                else cy++;
            }
        }
    }

    private drawGrid(centerX: number, topY: number) {
        const cellSize = 50;
        const padding = 5;

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
        const startDrawY = topY;
        
        this.maxScrollY = Math.max(1000, topY + gridHeight + 100);

        for (const key in this.cells) {
            const cell = this.cells[key];
            const px = startDrawX + (cell.x - minX) * (cellSize + padding) + cellSize / 2;
            const py = startDrawY + (cell.y - minY) * (cellSize + padding) + cellSize / 2;

            const rect = this.add.rectangle(px, py, cellSize, cellSize, 0xFFFFFF)
                .setStrokeStyle(2, this.colorMaderaOscuroHex)
                .setInteractive({ useHandCursor: true });

            const text = this.add.text(px, py, cell.value, {
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
            this.centerContainer.add([rect, text]);

            for (const word of this.currentWords) {
                if (word.startX === cell.x && word.startY === cell.y) {
                    const numText = this.add.text(px - cellSize / 2 + 4, py - cellSize / 2 + 2, word.id.replace(/[HV]/g, ''), {
                        fontSize: '14px',
                        color: this.colorMaderaOscuro,
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    });
                    cell.numberText = numText;
                    this.centerContainer.add(numText);
                }
            }
        }
    }

    private drawHintsPanel(centerX: number, centerY: number) {
        const panelWidth = 450;
        const panelHeight = 700;

        const bg = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0xFFFFFF)
            .setStrokeStyle(3, this.colorMaderaClaro, 0.5);
        
        const container = this.add.container(centerX, centerY);
        this.centerContainer.add([bg, container]);

        let currentY = -panelHeight / 2 + 30;

        const addSectionTitle = (title: string) => {
            const t = this.add.text(-panelWidth / 2 + 20, currentY, title, {
                fontSize: '28px',
                color: this.colorMaderaOscuro,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            container.add(t);
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
            container.add(t);
            currentY += t.height + 20;
        };

        addSectionTitle('→ Horizontales');
        this.currentWords.filter(w => w.horizontal).forEach(addHint);
        currentY += 10;
        addSectionTitle('↓ Verticales');
        this.currentWords.filter(w => !w.horizontal).forEach(addHint);
    }

    private drawActionButtons(startX: number, startY: number) {
        const container = this.add.container(startX, startY);
        this.centerContainer.add(container);

        const createBtn = (x: number, y: number, text: string, color: number, textColor: string, callback: () => void, btnWidth = 180) => {
            const w = btnWidth;
            const h = 50;
            const btnCont = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, w, h, color)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, this.colorMaderaOscuroHex, 0.2);
            const txt = this.add.text(0, 0, text, {
                fontSize: '22px',
                color: textColor,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btnCont.add([bg, txt]);

            bg.on('pointerover', () => {
                this.hoverSound.play();
                bg.setAlpha(0.8);
                btnCont.setScale(1.05);
            });
            bg.on('pointerout', () => {
                bg.setAlpha(1);
                btnCont.setScale(1);
            });
            bg.on('pointerdown', () => {
                this.clickSound.play();
                callback();
            });
            container.add(btnCont);
        };

        createBtn(-220, 0, 'C Limpiar', 0xEAE0D5, this.colorMaderaOscuro, () => this.limpiar());
        createBtn(0, 0, '💡 Pista', 0xF4A261, '#FFFFFF', () => this.darPista());
        createBtn(220, 0, '✓ Validar', this.colorVerde, '#FFFFFF', () => this.validar());
        
        createBtn(0, 65, 'Generar Nuevo Crucigrama', 0x457B9D, '#FFFFFF', () => {
            this.scene.restart();
        }, 320);
    }

    private setActiveCell(key: string) {
        if (!this.inputActive) return;

        if (this.activeCellKey === key) {
            const cell = this.cells[key];
            if (cell.words.length > 1) {
                this.currentDirection = this.currentDirection === 'H' ? 'V' : 'H';
            }
        } else {
            const cell = this.cells[key];
            if (cell) {
                const hasH = cell.words.some(id => id.includes('H'));
                const hasV = cell.words.some(id => id.includes('V'));
                if (this.currentDirection === 'H' && !hasH) this.currentDirection = 'V';
                if (this.currentDirection === 'V' && !hasV) this.currentDirection = 'H';
            }
        }

        if (this.activeCellKey && this.cells[this.activeCellKey]) {
            this.cells[this.activeCellKey].rect?.setFillStyle(0xFFFFFF);
        }

        this.activeCellKey = key;

        if (this.activeCellKey && this.cells[this.activeCellKey]) {
            const activeCell = this.cells[this.activeCellKey];
            activeCell.rect?.setFillStyle(0xE8F5E9);
            
            if (activeCell.rect) {
                this.ensureCellVisible(activeCell.rect);
            }
        }
    }

    private ensureCellVisible(rect: Phaser.GameObjects.Rectangle) {
        if (this.maxCameraScroll <= 0) return;

        const worldY = this.centerContainer.y + rect.y * this.centerContainer.scaleY;
        const currentScroll = this.cameras.main.scrollY;
        
        const topPadding = 250;
        const bottomPadding = 150;
        
        let newScroll = currentScroll;
        
        if (worldY < currentScroll + topPadding) {
            newScroll = worldY - topPadding;
        } else if (worldY > currentScroll + this.visibleScreenHeight - bottomPadding) {
            newScroll = worldY - this.visibleScreenHeight + bottomPadding;
        }
        
        if (newScroll !== currentScroll) {
            this.tweens.killTweensOf(this.cameras.main);
            this.tweens.add({
                targets: this.cameras.main,
                scrollY: Phaser.Math.Clamp(newScroll, 0, this.maxCameraScroll),
                duration: 250,
                ease: 'Sine.easeOut'
            });
        }
    }

    private handleKeydown(event: KeyboardEvent) {
        if (!this.inputActive || !this.activeCellKey) return;
        const cell = this.cells[this.activeCellKey];

        if (event.key === 'Backspace') {
            if (cell.value !== '') {
                cell.value = '';
                cell.text?.setText('');
            } else {
                this.moveToPreviousCell(cell);
            }
        } else if (event.key === 'Enter') {
            this.validar();
        } else if (event.key === 'Delete') {
            cell.value = '';
            cell.text?.setText('');
        } else if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
            const char = event.key.toUpperCase();
            cell.value = char;
            cell.text?.setText(char);
            cell.rect?.setStrokeStyle(2, this.colorMaderaOscuroHex);
            cell.text?.setColor(this.colorMaderaOscuro);
            this.moveToNextCell(cell);
        }
    }

    private moveToNextCell(currentCell: Cell) {
        const nextX = this.currentDirection === 'H' ? currentCell.x + 1 : currentCell.x;
        const nextY = this.currentDirection === 'H' ? currentCell.y : currentCell.y + 1;
        const nextKey = `${nextX},${nextY}`;
        if (this.cells[nextKey]) this.setActiveCell(nextKey);
    }

    private moveToPreviousCell(currentCell: Cell) {
        const prevX = this.currentDirection === 'H' ? currentCell.x - 1 : currentCell.x;
        const prevY = this.currentDirection === 'H' ? currentCell.y : currentCell.y - 1;
        const prevKey = `${prevX},${prevY}`;
        if (this.cells[prevKey]) {
            const prevCell = this.cells[prevKey];
            prevCell.value = '';
            prevCell.text?.setText('');
            this.setActiveCell(prevKey);
        }
    }

    private limpiar() {
        const cell = this.activeCellKey ? this.cells[this.activeCellKey] : null;
        if (cell) {
            const wordId = cell.words.find(id => id.includes(this.currentDirection)) || cell.words[0];
            let wordAlreadyEmpty = true;
            for (const key in this.cells) {
                const c = this.cells[key];
                if (c.words.includes(wordId) && c.value !== '') {
                    wordAlreadyEmpty = false;
                    c.value = '';
                    c.text?.setText('');
                    c.rect?.setStrokeStyle(2, this.colorMaderaOscuroHex);
                    c.text?.setColor(this.colorMaderaOscuro);
                }
            }
            if (wordAlreadyEmpty) this.limpiarTodo();
        } else {
            this.limpiarTodo();
        }
        if (this.activeCellKey) this.setActiveCell(this.activeCellKey);
    }

    private limpiarTodo() {
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
    }

    private darPista() {
        if (!this.activeCellKey) {
            const emptyKeys = Object.keys(this.cells).filter(k => this.cells[k].value !== this.cells[k].letter);
            if (emptyKeys.length > 0) {
                this.setActiveCell(emptyKeys[Math.floor(Math.random() * emptyKeys.length)]);
            }
        }
        if (this.activeCellKey) {
            const cell = this.cells[this.activeCellKey];
            cell.value = cell.letter;
            cell.text?.setText(cell.letter);
            cell.text?.setColor('#2E7D32');
            this.moveToNextCell(cell);
        }
    }

    private validar() {
        let allCorrect = true;
        for (const key in this.cells) {
            const cell = this.cells[key];
            if (cell.value === '') { allCorrect = false; continue; }
            if (cell.value === cell.letter) {
                cell.rect?.setStrokeStyle(3, this.colorVerde);
                cell.text?.setColor('#2E7D32');
            } else {
                allCorrect = false;
                cell.rect?.setStrokeStyle(3, this.colorTerracota);
                cell.text?.setColor('#C62828');
                if (cell.rect) this.tweens.add({ targets: [cell.rect, cell.text], x: '+=5', yoyo: true, repeat: 3, duration: 50 });
            }
        }
        if (allCorrect) this.showWinScreen();
    }

    private showWinScreen() {
        this.inputActive = false;
        this.winSound.play();
        const { width, height } = this.scale;
        const scrollY = this.cameras.main.scrollY;

        const overlay = this.add.rectangle(width / 2, height / 2 + scrollY, width, height + 1000, 0x000000, 0.6).setDepth(100).setAlpha(0);
        const card = this.add.rectangle(width / 2, height / 2 + scrollY, 700, 400, 0xFFFFFF).setStrokeStyle(6, this.colorVerde).setDepth(101);
        const t1 = this.add.text(width / 2, height / 2 - 80 + scrollY, '¡Excelente Trabajo!', { fontSize: '56px', color: '#2E7D32', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setDepth(101);
        const t2 = this.add.text(width / 2, height / 2 + 10 + scrollY, 'Has completado el crucigrama saludable.', { fontSize: '28px', color: this.colorMaderaOscuro, fontFamily: 'Arial' }).setOrigin(0.5).setDepth(101);
        const btn = this.add.rectangle(width / 2, height / 2 + 120 + scrollY, 300, 70, this.colorVerde).setInteractive({ useHandCursor: true }).setDepth(101);
        const bt = this.add.text(width / 2, height / 2 + 120 + scrollY, 'Continuar', { fontSize: '32px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setDepth(102);

        btn.on('pointerover', () => { this.hoverSound.play(); btn.setFillStyle(0x4CAF50); });
        btn.on('pointerout', () => { btn.setFillStyle(this.colorVerde); });
        btn.on('pointerdown', () => {
            this.clickSound.play();
            FlowProgressService.markCompleted('crucigramaCompleted');
            this.scene.start('LevelSelectScene');
        });

        this.tweens.add({ targets: overlay, alpha: 1, duration: 500 });
        this.tweens.add({ targets: [card, t1, t2, btn, bt], scaleX: { from: 0, to: 1 }, scaleY: { from: 0, to: 1 }, duration: 500, ease: 'Back.easeOut' });
    }
}
