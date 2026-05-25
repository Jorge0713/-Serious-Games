import * as Phaser from 'phaser';

export type GameButtonConfig = {
    x: number;
    y: number;
    texture: string;
    onClick: () => void;

    text?: string;
    width?: number;
    height?: number;

    font?: string;
    fontFamily?: string;
    fontSize?: string | number;
    fontStyle?: string;
    textColor?: string;
    textOffsetX?: number;
    textOffsetY?: number;

    scale?: number;
    hoverScale?: number;
    pressedScale?: number;
    disabledAlpha?: number;

    depth?: number;
    useHandCursor?: boolean;
    enabled?: boolean;

    hoverSound?: Phaser.Sound.BaseSound;
    clickSound?: Phaser.Sound.BaseSound;
    hoverSoundKey?: string;
    clickSoundKey?: string;
};

function resolveFontSize(fontSize?: string | number): string {
    if (typeof fontSize === 'number') {
        return `${fontSize}px`;
    }

    return fontSize ?? '24px';
}

function resolveSound(
    scene: Phaser.Scene,
    instance?: Phaser.Sound.BaseSound,
    key?: string
): Phaser.Sound.BaseSound | undefined {
    if (instance) return instance;
    if (!key) return undefined;
    if (!scene.cache.audio.exists(key)) return undefined;

    return scene.sound.add(key);
}

export class GameButton extends Phaser.GameObjects.Container {
    private readonly background: Phaser.GameObjects.Image;
    private readonly buttonText: Phaser.GameObjects.Text;
    private readonly onClick: () => void;
    private readonly baseScale: number;
    private readonly hoverScaleFactor: number;
    private readonly pressedScaleFactor: number;
    private readonly useHandCursor: boolean;
    private readonly disabledAlpha: number;
    private readonly hoverSound?: Phaser.Sound.BaseSound;
    private readonly clickSound?: Phaser.Sound.BaseSound;
    private scaleTween?: Phaser.Tweens.Tween;
    private enabled = true;
    private pointerIsDown = false;
    private pointerIsOver = false;

    constructor(scene: Phaser.Scene, config: GameButtonConfig) {
        super(scene, config.x, config.y);

        this.onClick = config.onClick;
        this.baseScale = config.scale ?? 1;
        this.hoverScaleFactor = config.hoverScale ?? 1.05;
        this.pressedScaleFactor = config.pressedScale ?? 0.96;
        this.useHandCursor = config.useHandCursor ?? true;
        this.disabledAlpha = config.disabledAlpha ?? 0.5;
        this.hoverSound = resolveSound(scene, config.hoverSound, config.hoverSoundKey);
        this.clickSound = resolveSound(scene, config.clickSound, config.clickSoundKey);

        this.background = scene.add.image(0, 0, config.texture).setOrigin(0.5);

        const buttonWidth = config.width ?? this.background.width;
        const buttonHeight = config.height ?? this.background.height;

        this.background.setDisplaySize(buttonWidth, buttonHeight);

        this.buttonText = scene.add.text(0, 0, config.text ?? '', {
            fontFamily: config.fontFamily ?? config.font ?? 'Arial',
            fontSize: resolveFontSize(config.fontSize),
            fontStyle: config.fontStyle ?? 'bold',
            color: config.textColor ?? '#ffffff',
            align: 'center',
            wordWrap: {
                width: buttonWidth * 0.9,
                useAdvancedWrap: true,
            },
        }).setOrigin(0.5)
            .setPosition(config.textOffsetX ?? 0, config.textOffsetY ?? 0);

        this.add([this.background, this.buttonText]);
        this.setSize(buttonWidth, buttonHeight);
        this.setScale(this.baseScale);

        if (typeof config.depth === 'number') {
            this.setDepth(config.depth);
        }

        scene.add.existing(this);
        this.enableInteraction();
        this.registerEvents();

        if (config.enabled === false) {
            this.setEnabled(false);
        }
    }

    setText(text: string): this {
        this.buttonText.setText(text);
        return this;
    }

    setTextStyle(style: Phaser.Types.GameObjects.Text.TextStyle): this {
        this.buttonText.setStyle(style);
        return this;
    }

    setEnabled(enabled: boolean): this {
        this.enabled = enabled;
        this.pointerIsDown = false;
        this.pointerIsOver = false;
        this.setAlpha(enabled ? 1 : this.disabledAlpha);
        this.animateScale(this.baseScale);

        if (enabled) {
            this.enableInteraction();
        } else {
            this.background.disableInteractive();
        }

        return this;
    }

    setButtonAlpha(alpha: number): this {
        this.setAlpha(alpha);
        return this;
    }

    private enableInteraction(): void {
        this.background.setInteractive({ useHandCursor: this.useHandCursor });
    }

    private registerEvents(): void {
        this.background.on('pointerover', this.handlePointerOver, this);
        this.background.on('pointerout', this.handlePointerOut, this);
        this.background.on('pointerdown', this.handlePointerDown, this);
        this.background.on('pointerup', this.handlePointerUp, this);
        this.background.on('pointerupoutside', this.handlePointerUpOutside, this);
    }

    private handlePointerOver(): void {
        if (!this.enabled) return;

        this.pointerIsOver = true;
        this.hoverSound?.play();
        this.animateScale(this.baseScale * this.hoverScaleFactor);
    }

    private handlePointerOut(): void {
        if (!this.enabled) return;

        this.pointerIsOver = false;
        this.pointerIsDown = false;
        this.animateScale(this.baseScale);
    }

    private handlePointerDown(): void {
        if (!this.enabled) return;

        this.pointerIsDown = true;
        this.clickSound?.play();
        this.animateScale(this.baseScale * this.pressedScaleFactor, 80);
    }

    private handlePointerUp(): void {
        if (!this.enabled || !this.pointerIsDown) return;

        this.pointerIsDown = false;
        this.animateScale(this.baseScale * (this.pointerIsOver ? this.hoverScaleFactor : 1));
        this.onClick();
    }

    private handlePointerUpOutside(): void {
        if (!this.enabled) return;

        this.pointerIsDown = false;
        this.animateScale(this.baseScale);
    }

    private animateScale(scale: number, duration = 120): void {
        this.scaleTween?.stop();
        this.scaleTween = this.scene.tweens.add({
            targets: this,
            scaleX: scale,
            scaleY: scale,
            duration,
            ease: 'Sine.easeOut',
        });
    }
}
