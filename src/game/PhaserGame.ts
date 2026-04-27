import * as Phaser from 'phaser'
import { MainMenu } from './Scenes/MainMenu'

/*
 * Analogía Java: como el main() que instancia tu aplicación
 * y registra todas las "pantallas" disponibles.
 */
export const createGame = (parent: HTMLElement): Phaser.Game => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        backgroundColor: '#000000',
        scene: [MainMenu],
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: window.innerWidth,
            height: window.innerHeight,
        },
        
    })
}

