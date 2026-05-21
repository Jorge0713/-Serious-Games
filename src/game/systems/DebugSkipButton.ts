import type * as Phaser from 'phaser';

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
        fontFamily: '"Pixelify Sans", Arial, sans-serif',
        fontStyle: 'bold',
        backgroundColor: '#5E412F',
        padding: { x: 14, y: 10 },
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
