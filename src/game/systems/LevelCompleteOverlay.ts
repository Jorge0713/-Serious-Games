import * as Phaser from 'phaser';

interface LevelCompleteOverlayConfig {
    title: string;
    message: string;
    buttonLabel: string;
    nextScene: string;
    scoreText?: string;
    soundKey?: string;
    clickSoundKey?: string;
}

const COLORS = {
    primary: 0x76A665,
    secondary: 0xD9A066,
    tertiary: 0x5E412F,
    neutral: 0xF9F6EF,
};

const COLOR_HEX = {
    primary: '#76A665',
    secondary: '#D9A066',
    tertiary: '#5E412F',
    neutral: '#F9F6EF',
};

const TITLE_FONT = '"Pixelify Sans", Arial, sans-serif';
const BODY_FONT = '"VT323", "Courier New", monospace';

export const showLevelCompleteOverlay = (
    scene: Phaser.Scene,
    config: LevelCompleteOverlayConfig
) => {
    if (config.soundKey) {
        try { scene.sound.play(config.soundKey); } catch { void 0; }
    }

    const { width, height } = scene.scale;
    scene.input.enabled = false;

    const overlay = scene.add
        .rectangle(width / 2, height / 2, width, height, COLORS.tertiary, 0.72)
        .setDepth(900)
        .setAlpha(0)
        .setInteractive();

    const modal = scene.add
        .container(width / 2, height / 2)
        .setDepth(901)
        .setAlpha(0)
        .setScale(0.92);

    const shadow = scene.add.rectangle(14, 18, 940, 510, COLORS.tertiary, 0.28);
    const panel = scene.add.rectangle(0, 0, 920, 500, COLORS.neutral, 1)
        .setStrokeStyle(6, COLORS.tertiary);
    const header = scene.add.rectangle(0, -190, 860, 86, COLORS.tertiary, 1)
        .setStrokeStyle(4, COLORS.secondary);
    const badge = scene.add.circle(-390, -190, 28, COLORS.primary, 1)
        .setStrokeStyle(4, COLORS.secondary);

    const badgeText = scene.add.text(-390, -193, '*', {
        fontFamily: TITLE_FONT,
        fontSize: '34px',
        color: COLOR_HEX.neutral,
    }).setOrigin(0.5);

    const headerText = scene.add.text(-342, -190, 'Reto completado', {
        fontFamily: BODY_FONT,
        fontSize: '34px',
        color: COLOR_HEX.neutral,
    }).setOrigin(0, 0.5);

    const title = scene.add.text(0, -96, config.title, {
        fontFamily: TITLE_FONT,
        fontSize: '58px',
        color: COLOR_HEX.tertiary,
        align: 'center',
    }).setOrigin(0.5);

    const message = scene.add.text(0, -18, config.message, {
        fontFamily: BODY_FONT,
        fontSize: '34px',
        color: COLOR_HEX.tertiary,
        align: 'center',
        wordWrap: { width: 760 },
        lineSpacing: 6,
    }).setOrigin(0.5);

    const scorePill = scene.add.rectangle(0, 84, 440, 54, COLORS.primary, 1)
        .setStrokeStyle(4, COLORS.tertiary)
        .setVisible(Boolean(config.scoreText));
    const scoreLabel = scene.add.text(0, 84, config.scoreText ?? '', {
        fontFamily: BODY_FONT,
        fontSize: '32px',
        color: COLOR_HEX.neutral,
    }).setOrigin(0.5).setVisible(Boolean(config.scoreText));

    const button = scene.add.rectangle(0, 172, 380, 70, COLORS.primary, 1)
        .setStrokeStyle(5, COLORS.tertiary)
        .setInteractive({ useHandCursor: true });
    const buttonText = scene.add.text(0, 172, config.buttonLabel, {
        fontFamily: TITLE_FONT,
        fontSize: '30px',
        color: COLOR_HEX.neutral,
    }).setOrigin(0.5);

    modal.add([
        shadow,
        panel,
        header,
        badge,
        badgeText,
        headerText,
        title,
        message,
        scorePill,
        scoreLabel,
        button,
        buttonText,
    ]);

    button.on('pointerover', () => {
        button.setFillStyle(COLORS.secondary);
        scene.tweens.add({ targets: [button, buttonText], scale: 1.05, duration: 120, ease: 'Power1' });
    });
    button.on('pointerout', () => {
        button.setFillStyle(COLORS.primary);
        scene.tweens.add({ targets: [button, buttonText], scale: 1, duration: 120, ease: 'Power1' });
    });
    button.on('pointerdown', () => {
        if (config.clickSoundKey) {
            try { scene.sound.play(config.clickSoundKey); } catch { void 0; }
        }
        scene.scene.start(config.nextScene);
    });

    scene.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 260,
        ease: 'Power2',
    });

    scene.tweens.add({
        targets: modal,
        alpha: 1,
        scale: 1,
        duration: 420,
        ease: 'Back.easeOut',
        onComplete: () => {
            scene.input.enabled = true;
        },
    });
};
