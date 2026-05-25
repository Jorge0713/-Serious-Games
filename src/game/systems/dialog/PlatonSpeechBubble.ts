import * as Phaser from "phaser";
import { FONT_DISPLAY } from "../../../config/gameFonts";

type PlatonSpeechBubbleOptions = {
    x: number;
    y: number;
    text: string;
    wordWrapWidth?: number;
    heightExtra?: number;
    depth?: number;
    fadeDuration?: number;
    fadeDelay?: number;
};

export class PlatonSpeechBubble {
    private bubble?: Phaser.GameObjects.Graphics;
    private readonly scene: Phaser.Scene;
    private textObject?: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    show(options: PlatonSpeechBubbleOptions): void {
        this.destroy();

        const depth = options.depth ?? 11;
        const wordWrapWidth = options.wordWrapWidth ?? 370;

        this.textObject = this.scene.add.text(options.x, options.y, options.text, {
            fontSize: "26px",
            color: "#000000",
            fontFamily: FONT_DISPLAY,
            align: "left",
            wordWrap: { width: wordWrapWidth },
        }).setOrigin(0.5).setDepth(depth + 1).setAlpha(0);

        const pad = 20;
        const heightExtra = Math.max(0, options.heightExtra ?? 0);
        const bx = options.x - this.textObject.width / 2 - pad;
        const bw = this.textObject.width + pad * 2;
        const bh = this.textObject.height + pad * 2 + heightExtra;
        const by = options.y - bh / 2;

        this.bubble = this.scene.add.graphics().setDepth(depth).setAlpha(0);
        this.bubble.fillStyle(0xFFFAED, 0.97);
        this.bubble.fillTriangle(bx + 40, by + bh, bx + 82, by + bh, bx - 18, by + bh + 52);
        this.bubble.fillRoundedRect(bx, by, bw, bh, 16);
        this.bubble.lineStyle(4, 0x5E412F, 1);
        this.bubble.strokeRoundedRect(bx, by, bw, bh, 16);
        this.bubble.beginPath();
        this.bubble.moveTo(bx + 40, by + bh);
        this.bubble.lineTo(bx - 18, by + bh + 52);
        this.bubble.lineTo(bx + 82, by + bh);
        this.bubble.strokePath();

        this.scene.tweens.add({
            targets: this.getTargets(),
            alpha: 1,
            duration: options.fadeDuration ?? 300,
            delay: options.fadeDelay ?? 0,
        });
    }

    hide(duration = 0): void {
        const targets = this.getTargets();
        if (targets.length === 0) {
            return;
        }

        this.scene.tweens.killTweensOf(targets);

        if (duration <= 0) {
            this.destroy();
            return;
        }

        this.scene.tweens.add({
            targets,
            alpha: 0,
            duration,
            onComplete: () => this.destroy(),
        });
    }

    destroy(): void {
        const targets = this.getTargets();
        if (targets.length > 0) {
            this.scene.tweens.killTweensOf(targets);
        }

        this.bubble?.destroy();
        this.textObject?.destroy();
        this.bubble = undefined;
        this.textObject = undefined;
    }

    private getTargets(): Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Text> {
        const targets: Array<Phaser.GameObjects.Graphics | Phaser.GameObjects.Text> = [];

        if (this.bubble) {
            targets.push(this.bubble);
        }

        if (this.textObject) {
            targets.push(this.textObject);
        }

        return targets;
    }
}
