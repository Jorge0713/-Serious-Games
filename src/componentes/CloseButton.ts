import * as Phaser from 'phaser';
import { GameButton } from './GameButton';
import type { GameButtonConfig } from './GameButton';

export const CLOSE_BUTTON_TEXTURE = 'CloseButton';
export const CLOSE_BUTTON_PATH = '/assets/Buttons/Close.png';

export type CloseButtonConfig = Omit<GameButtonConfig, 'texture' | 'text' | 'width' | 'height'> & {
    size?: number;
    width?: number;
    height?: number;
};

export class CloseButton extends GameButton {
    static preload(scene: Phaser.Scene): void {
        if (!scene.textures.exists(CLOSE_BUTTON_TEXTURE)) {
            scene.load.image(CLOSE_BUTTON_TEXTURE, CLOSE_BUTTON_PATH);
        }
    }

    constructor(scene: Phaser.Scene, config: CloseButtonConfig) {
        const size = config.size ?? 48;

        super(scene, {
            ...config,
            texture: CLOSE_BUTTON_TEXTURE,
            text: '',
            width: config.width ?? size,
            height: config.height ?? size,
            hoverScale: config.hoverScale ?? 1.08,
            pressedScale: config.pressedScale ?? 0.92,
        });
    }
}
