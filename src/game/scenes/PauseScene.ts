import * as Phaser from 'phaser';
import { FONT_DISPLAY } from '../../config/gameFonts';
import { PrefabButtons } from '../../componentes/PrefabButtons';

const PAUSE_UI_DEPTH = 10000;

export class PauseScene extends Phaser.Scene {
    private previousSceneKey: string = '';
    private volumeText!: Phaser.GameObjects.Text;

    constructor() {
        super('PauseScene');
    }

    init(data: { previousScene: string }) {
        this.previousSceneKey = data.previousScene || 'MainMenu';
    }

    create() {
        const { width, height } = this.scale;
        this.scene.bringToTop(this.scene.key);

        // Overlay oscuro translúcido
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72)
            .setDepth(PAUSE_UI_DEPTH);
        overlay.setInteractive(); // Bloqueo de clics hacia escenas inferiores

        // Panel principal
        const panelW = 480;
        const panelH = 420;
        this.add.rectangle(width / 2, height / 2, panelW, panelH, 0xF5FBF2, 1)
            .setStrokeStyle(6, 0x5D4037)
            .setDepth(PAUSE_UI_DEPTH + 1);

        // Título del panel
        this.add.text(width / 2, height / 2 - 140, 'PAUSA', {
            fontFamily: FONT_DISPLAY,
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#5D4037'
        }).setOrigin(0.5).setDepth(PAUSE_UI_DEPTH + 2);

        // Botón de reanudación
        PrefabButtons.continuar(this, width / 2, height / 2 - 40, () => {
            this.scene.resume(this.previousSceneKey);
            this.scene.stop();
        }, {
            text: 'REANUDAR',
            width: 260,
            depth: PAUSE_UI_DEPTH + 3,
        });

        // Controles de volumen
        this.add.text(width / 2, height / 2 + 35, 'Volumen General', {
            fontFamily: FONT_DISPLAY,
            fontSize: '24px',
            color: '#5D4037'
        }).setOrigin(0.5).setDepth(PAUSE_UI_DEPTH + 2);

        this.volumeText = this.add.text(width / 2, height / 2 + 70, `${Math.round(this.sound.volume * 100)}%`, {
            fontFamily: FONT_DISPLAY,
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#2E3142'
        }).setOrigin(0.5).setDepth(PAUSE_UI_DEPTH + 2);

        // Reducción de volumen
        PrefabButtons.secundario(this, width / 2 - 80, height / 2 + 70, () => {
            let v = this.sound.volume - 0.1;
            if (v < 0) v = 0;
            this.setGlobalVolume(v);
        }, { text: '-', width: 50, height: 50, depth: PAUSE_UI_DEPTH + 3 });

        // Aumento de volumen
        PrefabButtons.secundario(this, width / 2 + 80, height / 2 + 70, () => {
            let v = this.sound.volume + 0.1;
            if (v > 1) v = 1;
            this.setGlobalVolume(v);
        }, { text: '+', width: 50, height: 50, depth: PAUSE_UI_DEPTH + 3 });

        if (this.previousSceneKey === 'MainMenu') {
            // Cierre de la ventana desde el menú principal
            PrefabButtons.volver(this, width / 2, height / 2 + 150, () => {
                this.sound.stopAll();
                window.close();
            }, {
                text: 'SALIR DEL JUEGO',
                fontSize: 18,
                textColor: '#D03B2C',
                depth: PAUSE_UI_DEPTH + 3,
            });
        } else {
            // Botón para volver al mapa
            PrefabButtons.volver(this, width / 2, height / 2 + 150, () => {
                this.clearCheckpointForPreviousScene();
                this.scene.stop(this.previousSceneKey);
                // Detención de pretutoriales o audios adicionales en ejecución
                this.scene.stop();
                this.sound.stopAll();

                // Retorno a LevelSelectScene o MainMenu según la escena previa
                if (this.previousSceneKey !== 'LevelSelectScene' && this.previousSceneKey !== 'MainMenu') {
                    this.scene.start('LevelSelectScene');
                } else {
                    this.scene.resume(this.previousSceneKey);
                    this.scene.stop();
                }
            }, {
                text: 'VOLVER AL MAPA',
                fontSize: 18,
                depth: PAUSE_UI_DEPTH + 3,
            });
        }
    }

    private clearCheckpointForPreviousScene(): void {
        const checkpointByScene: Record<string, string> = {
            Nivel1Scene: 'nivel1_checkpoint',
            Nivel3Scene: 'nivel3_checkpoint',
        };
        const checkpointKey = checkpointByScene[this.previousSceneKey];
        if (checkpointKey) {
            this.registry.remove(checkpointKey);
        }
    }

    private setGlobalVolume(v: number) {
        this.sound.volume = v;
        this.volumeText.setText(`${Math.round(v * 100)}%`);
        localStorage.setItem('game_volume', v.toString());
    }
}
