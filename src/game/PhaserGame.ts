import * as Phaser from 'phaser'
import { MusicManagerScene } from './scenes/MusicManagerScene'
import { MainMenu } from './scenes/MainMenu'
import { TutorialScene } from './scenes/TutorialScene'
import { Nivel1Scene } from './scenes/Nivel1Scene'
import { Nivel2Scene } from './scenes/Nivel2Scene'
import { Nivel3Scene } from './scenes/Nivel3Scene'
import { PreTutorialConceptosScene } from './scenes/PreTutorialConceptosScene'
<<<<<<< HEAD
import { CrucigramaSaludableScene } from './scenes/CrucigramaSaludableScene'

// Forzar actualización de TypeScript
=======
import { CrucigramaScene } from './scenes/CrucigramaScene'
import { Crucigrama3Scene } from './scenes/Crucigrama3Scene'
import { PlatoBalanceadoScene } from './scenes/PlatoBalanceadoScene'
>>>>>>> 2cce771 (¨¨)

export const createGame = (parent: HTMLElement): Phaser.Game => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        backgroundColor: '#000000',
<<<<<<< HEAD
        scene: [MainMenu, MusicManagerScene, TutorialScene, Nivel1Scene, Nivel2Scene, Nivel3Scene, PreTutorialConceptosScene, CrucigramaSaludableScene],
=======
        scene: [MainMenu, MusicManagerScene, TutorialScene, Nivel1Scene, Nivel2Scene, Nivel3Scene, PreTutorialConceptosScene, CrucigramaScene, Crucigrama3Scene, PlatoBalanceadoScene],
>>>>>>> 2cce771 (¨¨)
        scale: {
            mode: Phaser.Scale.ENVELOP,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080,
        },
    })
}
