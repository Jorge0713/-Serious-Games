import * as Phaser from 'phaser';

export function makeResponsiveVolver(scene: Phaser.Scene, btn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
    const updatePosition = () => {
        // En modo ENVELOP, la escala visual real de la pantalla
        const scale = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
        
        // Coordenadas en el mundo del juego que corresponden a la esquina superior izquierda de la ventana
        const visibleLeft = (1920 - window.innerWidth / scale) / 2;
        const visibleTop = (1080 - window.innerHeight / scale) / 2;

        // Queremos que el botón mida 140px físicos en la pantalla, igual que en React
        const targetScale = 140 / (btn.width * scale);
        btn.setScale(targetScale);

        // Posicionar a 20px de la esquina superior izquierda, igual que React (top: 20px, left: 20px)
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
