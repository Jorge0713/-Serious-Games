import * as Phaser from 'phaser';

export class Nivel1Scene extends Phaser.Scene {
    constructor() {
        super('Nivel1Scene');
    }
    
    create() {
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'Nivel 1 (En construcción)', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    }
}