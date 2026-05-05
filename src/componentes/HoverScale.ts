export function hoverScale(
    scene: Phaser.Scene,
    obj: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image,
    config?: {
        scaleOver?: number;
        duration?: number;
        hoverSound?: Phaser.Sound.BaseSound;
    }
) {
    const escalaOriginal = obj.scale;

    const {
        scaleOver = escalaOriginal + 0.10,
        duration = 150,
        hoverSound
    } = config || {};

    obj.setInteractive({ useHandCursor: true });

    obj.on("pointerover", () => {
        if (hoverSound) hoverSound.play();

        scene.tweens.add({
            targets: obj,
            scale: scaleOver,
            duration,
            ease: "Power1"
        });
    });

    obj.on("pointerout", () => {
        scene.tweens.add({
            targets: obj,
            scale: escalaOriginal,
            duration,
            ease: "Power1"
        });
    });
}