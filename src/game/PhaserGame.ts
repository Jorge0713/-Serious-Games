import * as Phaser from 'phaser'
import { MainMenu } from './scenes/MainMenu'
import { TutorialScene } from './scenes/TutorialScene'
import { Nivel1Scene } from './scenes/Nivel1Scene'

/*
 * Analogía Java: como el main() que instancia tu aplicación
 * y registra todas las "pantallas" disponibles.
 */
export const createGame = (parent: HTMLElement): Phaser.Game => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        backgroundColor: '#000000',
        scene: [MainMenu, TutorialScene, Nivel1Scene],
        scale: {
            mode: Phaser.Scale.ENVELOP,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080,
        },

    })
}
