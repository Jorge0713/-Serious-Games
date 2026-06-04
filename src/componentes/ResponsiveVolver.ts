import * as Phaser from 'phaser';
import { BACK_BUTTON_WIDTH } from './PrefabButtons';

export function makeResponsiveVolver(scene: Phaser.Scene, btn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
    const updatePosition = () => {
        // Cálculo de la escala visual real en modo ENVELOP
        const scale = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
        
        // Coordenadas del mundo asociadas a la esquina superior izquierda visible
        const visibleLeft = (1920 - window.innerWidth / scale) / 2;
        const visibleTop = (1080 - window.innerHeight / scale) / 2;

        // Configuración del tamaño físico del botón para igualar la medida usada en React
        const targetScale = BACK_BUTTON_WIDTH / (btn.width * scale);
        btn.setScale(targetScale);

        // Posicionamiento a 20px de la esquina superior izquierda visible
        const gameX = visibleLeft + 20 / scale + btn.displayWidth / 2;
        const gameY = visibleTop + 20 / scale + btn.displayHeight / 2;

        btn.setPosition(gameX, gameY);
    };

    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    scene.events.once('shutdown', () => {
        window.removeEventListener('resize', updatePosition);
    });
}
