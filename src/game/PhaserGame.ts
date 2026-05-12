import * as Phaser from 'phaser'
import { MainMenu } from './Scenes/MainMenu'
import { TutorialScene } from './scenes/TutorialScene'
import { Nivel1Scene } from './scenes/Nivel1Scene'
import { Nivel2Scene } from './scenes/Nivel2Scene'
import { Nivel3Scene } from './scenes/Nivel3Scene'
import { CrucigramaScene } from './scenes/CrucigramaScene'
import { Crucigrama3Scene } from './scenes/Crucigrama3Scene'

/*
 * Analogía Java: como el main() que instancia tu aplicación
 * y registra todas las "pantallas" disponibles.
 */
export const createGame = (parent: HTMLElement): Phaser.Game => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        backgroundColor: '#000000',
        scene: [MainMenu, TutorialScene, Nivel1Scene, Nivel2Scene, Nivel3Scene, CrucigramaScene, Crucigrama3Scene],
        scale: {
            mode: Phaser.Scale.ENVELOP,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080,
        },

    })
}
