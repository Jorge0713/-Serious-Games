import * as Phaser from 'phaser';

export class PreTutorialConceptosScene extends Phaser.Scene {
    constructor() {
        super('PreTutorialConceptosScene');
    }

    create() {
        if (window.showPreTutorialConceptos) {
            // Muestra la UI en React
            window.showPreTutorialConceptos();
        } else {
            console.warn('window.showPreTutorialConceptos no está definido. Asegúrate de estar en el entorno React.');
            // Fallback en caso de estar fuera de React (ej. pruebas aisladas)
            this.scene.start('CrucigramaSaludableScene');
        }
    }
}
