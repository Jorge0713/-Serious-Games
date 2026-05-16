import * as Phaser from 'phaser'
import { MainMenu } from './Scenes/MainMenu'
import { TutorialScene } from './Scenes/TutorialScene'
import { Nivel1Scene } from './Scenes/Nivel1Scene'
import { Nivel2Scene } from './Scenes/Nivel2Scene'
import { Nivel3Scene } from './Scenes/Nivel3Scene'

/*
 * Analogía Java: como el main() que instancia tu aplicación
 * y registra todas las "pantallas" disponibles.
 */
export const createGame = (parent: HTMLElement): Phaser.Game => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        backgroundColor: '#000000',
        scene: [MainMenu, TutorialScene, Nivel1Scene, Nivel2Scene, Nivel3Scene],
        scale: {
            mode: Phaser.Scale.ENVELOP,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080,
        },

    })
}
