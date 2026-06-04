import * as Phaser from 'phaser';

export class PreTutorialConceptosScene extends Phaser.Scene {
    constructor() {
        super('PreTutorialConceptosScene');
    }

    create(data?: Record<string, unknown>) {
        if (window.showPreTutorialConceptos) {
            // Renderizado de la UI administrada por React
            window.showPreTutorialConceptos(data);
        } else {
            console.warn('window.showPreTutorialConceptos no está definido. Asegúrate de estar en el entorno React.');
            // Fallback para ejecuciones fuera del entorno React
            this.scene.start('CrucigramaSaludableScene');
        }
    }
}
