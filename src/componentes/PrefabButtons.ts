import * as Phaser from 'phaser';
import { GameButton } from './GameButton';
import type { GameButtonConfig } from './GameButton';
import { FONT_DISPLAY } from '../config/gameFonts';

const TEXTURES = {
    primary: 'MainButton',
    secondary: 'SecondaryButton',
    cancel: 'CancelButton',
};

const ASSET_PATHS = {
    [TEXTURES.primary]: '/assets/Buttons/MainButton.png',
    [TEXTURES.secondary]: '/assets/Buttons/SecondaryButton.png',
    [TEXTURES.cancel]: '/assets/Buttons/Cancel.png',
};

const INK_HEX = '#2E3142';

const HOVER_KEY_FALLBACKS = ['menu_hover', 'hoverSound', 'Hover', 'roadmap_hover'];
const CLICK_KEY_FALLBACKS = ['menu_click', 'clickSound', 'Click', 'roadmap_click', 'sonido-click', 'pb_click'];

export type PrefabOptions = Omit<Partial<GameButtonConfig>, 'x' | 'y' | 'texture' | 'onClick'>;

export type IconButtonOptions = {
    text?: string;
    width?: number;
    height?: number;
    fontSize?: string | number;
    fontFamily?: string;
    textColor?: string;
    fill?: number;
    hoverFill?: number;
    strokeColor?: number;
    strokeWidth?: number;
    shadowColor?: number;
    shadowOffset?: number;
    depth?: number;
    hoverScale?: number;
    useHandCursor?: boolean;
    hoverSound?: Phaser.Sound.BaseSound;
    clickSound?: Phaser.Sound.BaseSound;
};

function resolveFontSize(fontSize?: string | number): string {
    if (typeof fontSize === 'number') {
        return `${fontSize}px`;
    }

    return fontSize ?? '18px';
}

function autoSoundKey(scene: Phaser.Scene, fallbacks: string[]): string | undefined {
    for (const key of fallbacks) {
        if (scene.cache.audio.exists(key)) return key;
    }
    return undefined;
}

function buildButton(
    scene: Phaser.Scene,
    defaults: Omit<GameButtonConfig, 'x' | 'y' | 'onClick'>,
    x: number,
    y: number,
    onClick: () => void,
    options?: PrefabOptions
): GameButton {
    const userProvidedHover = options?.hoverSound !== undefined || options?.hoverSoundKey !== undefined;
    const userProvidedClick = options?.clickSound !== undefined || options?.clickSoundKey !== undefined;

    const resolvedHoverKey = userProvidedHover ? undefined : autoSoundKey(scene, HOVER_KEY_FALLBACKS);
    const resolvedClickKey = userProvidedClick ? undefined : autoSoundKey(scene, CLICK_KEY_FALLBACKS);

    return new GameButton(scene, {
        ...defaults,
        hoverSoundKey: resolvedHoverKey,
        clickSoundKey: resolvedClickKey,
        ...options,
        texture: defaults.texture,
        x,
        y,
        onClick,
    });
}

export class PrefabButtons {
    static preload(scene: Phaser.Scene): void {
        Object.entries(ASSET_PATHS).forEach(([key, path]) => {
            if (!scene.textures.exists(key)) {
                scene.load.image(key, path);
            }
        });
    }

    static precargar(scene: Phaser.Scene): void {
        PrefabButtons.preload(scene);
    }

    static icono(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options: IconButtonOptions = {}
    ): Phaser.GameObjects.Container {
        const width = options.width ?? 38;
        const height = options.height ?? 38;
        const fill = options.fill ?? 0xffffff;
        const hoverFill = options.hoverFill ?? fill;
        const strokeColor = options.strokeColor ?? 0x2e3142;
        const shadowColor = options.shadowColor ?? 0x2e3142;
        const shadowOffset = options.shadowOffset ?? 4;
        const hoverScale = options.hoverScale ?? 1.03;

        const button = scene.add.container(x, y);
        const shadow = scene.add.rectangle(shadowOffset, shadowOffset, width, height, shadowColor, 1);
        const bg = scene.add.rectangle(0, 0, width, height, fill, 1)
            .setStrokeStyle(options.strokeWidth ?? 3, strokeColor);
        const text = scene.add.text(0, 0, options.text ?? '', {
            fontFamily: options.fontFamily ?? FONT_DISPLAY,
            fontSize: resolveFontSize(options.fontSize),
            fontStyle: 'bold',
            color: options.textColor ?? INK_HEX,
        }).setOrigin(0.5);

        button.add([shadow, bg, text]);
        button.setSize(width, height);
        button.setInteractive({ useHandCursor: options.useHandCursor ?? true });

        if (typeof options.depth === 'number') {
            button.setDepth(options.depth);
        }

        button.on('pointerover', () => {
            options.hoverSound?.play();
            bg.setFillStyle(hoverFill, 1);
            scene.tweens.add({
                targets: button,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 120,
                ease: 'Sine.easeOut',
            });
        });

        button.on('pointerout', () => {
            bg.setFillStyle(fill, 1);
            scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 120,
                ease: 'Sine.easeOut',
            });
        });

        button.on('pointerdown', () => {
            options.clickSound?.play();
            onClick();
        });

        return button;
    }

    static continuar(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.primary,
            text: 'CONTINUAR',
            width: 190,
            height: 67,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }

    static confirmar(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.primary,
            text: 'CONFIRMAR',
            width: 220,
            height: 67,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }

    static volver(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.secondary,
            text: 'VOLVER',
            width: 144,
            height: 64,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }

    static secundario(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.secondary,
            text: '',
            width: 144,
            height: 64,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }

    static cerrar(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.cancel,
            text: 'CERRAR',
            width: 153,
            height: 67,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }

    static guardar(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.primary,
            text: 'GUARDAR',
            width: 220,
            height: 78,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }

    static salir(
        scene: Phaser.Scene,
        x: number,
        y: number,
        onClick: () => void,
        options?: PrefabOptions
    ): GameButton {
        return buildButton(scene, {
            texture: TEXTURES.secondary,
            text: 'SALIR',
            width: 144,
            height: 64,
            fontSize: '18px',
            textColor: INK_HEX,
            fontFamily: FONT_DISPLAY,
            hoverScale: 1.04,
        }, x, y, onClick, options);
    }
}
