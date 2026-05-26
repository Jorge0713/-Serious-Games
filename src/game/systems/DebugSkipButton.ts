import type * as Phaser from 'phaser';
import { FONT_DISPLAY } from '../../config/gameFonts';
import { BACK_BUTTON_HEIGHT, BACK_BUTTON_WIDTH } from '../../componentes/PrefabButtons';

interface DebugSkipButtonConfig {
    label: string;
    nextScene: string;
    soundKey?: string;
    x?: number;
    y?: number;
}

export const createDebugSkipButton = (
    scene: Phaser.Scene,
    config: DebugSkipButtonConfig
) => {
    const x = config.x ?? 16;
    const y = config.y ?? 16;

    const button = scene.add.text(x, y, config.label, {
        fontSize: '17px',
        color: '#ffffff',
        fontFamily: FONT_DISPLAY,
        fontStyle: 'bold',
        backgroundColor: '#5E412F',
        align: 'center',
        fixedWidth: BACK_BUTTON_WIDTH,
        fixedHeight: BACK_BUTTON_HEIGHT,
        padding: { x: 0, y: 26 },
    })
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#76A665' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#5E412F' }));
    button.on('pointerdown', () => {
        if (config.soundKey) {
            try { scene.sound.play(config.soundKey); } catch { void 0; }
        }

        scene.scene.start(config.nextScene);
    });

    return button;
};
