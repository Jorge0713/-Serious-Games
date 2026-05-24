import * as Phaser from 'phaser';

interface ConceptExample {
    label: string;
    note: string;
    texture: string;
    path: string;
}

interface NutritionConcept {
    id: string;
    title: string;
    menuLabel: string;
    icon: string;
    subtitle: string;
    body: string;
    callout: string;
    examplesTitle: string;
    examples: ConceptExample[];
}

interface MenuItem {
    bg: Phaser.GameObjects.Rectangle;
    iconBg: Phaser.GameObjects.Arc;
    icon: Phaser.GameObjects.Text;
    label: Phaser.GameObjects.Text;
}

const COLORS = {
    green: 0x58B15B,
    brown: 0x8D6E63,
    darkBrown: 0x5D4037,
    cream: 0xF5FBF2,
    terracotta: 0xD2691E,
    white: 0xffffff,
};

const COLOR_HEX = {
    green: '#58B15B',
    brown: '#8D6E63',
    darkBrown: '#5D4037',
    cream: '#F5FBF2',
    terracotta: '#D2691E',
};

const SCENE_FONT = '"Pixelify Sans", Arial, sans-serif';
const BODY_FONT = '"VT323", "Courier New", monospace';
const NEXT_SCENE = 'CrucigramaSaludableScene';

const CONCEPTS: NutritionConcept[] = [
    {
        id: 'energia',
        title: 'La Energ\u00eda',
        menuLabel: 'Energ\u00eda',
        icon: 'ZAP',
        subtitle: 'El combustible de tu cuerpo.',
        body: 'La energ\u00eda ayuda a correr, jugar, pensar y aprender. Tu cuerpo la obtiene de los alimentos y la usa durante todo el d\u00eda.',
        callout: 'Una comida variada ayuda a mantener energ\u00eda estable para tus actividades.',
        examplesTitle: 'Fuentes de energ\u00eda',
        examples: [
            { label: 'Pl\u00e1tano', note: 'Energ\u00eda r\u00e1pida', texture: 'concept_banana', path: '/iconsFood/frutas/bananas.png' },
            { label: 'Avena', note: 'Energ\u00eda duradera', texture: 'concept_oat', path: '/iconsFood/cereales/oat.png' },
            { label: 'Cacahuate', note: 'Energ\u00eda concentrada', texture: 'concept_peanut', path: '/iconsFood/leguminosas/peanut.png' },
        ],
    },
    {
        id: 'calorias',
        title: 'Calor\u00edas',
        menuLabel: 'Calor\u00edas',
        icon: 'KCAL',
        subtitle: 'Una forma de medir energ\u00eda.',
        body: 'Las calor\u00edas indican cu\u00e1nta energ\u00eda aporta un alimento. No solo importa la cantidad: tambi\u00e9n importan los nutrientes que acompa\u00f1an esa energ\u00eda.',
        callout: 'Elegir alimentos nutritivos ayuda a que la energ\u00eda venga con vitaminas, fibra o prote\u00ednas.',
        examplesTitle: 'Distintas densidades',
        examples: [
            { label: 'Manzana', note: 'Ligera y fresca', texture: 'concept_apple', path: '/iconsFood/frutas/apple.png' },
            { label: 'Arroz', note: 'Base energ\u00e9tica', texture: 'concept_rice', path: '/iconsFood/cereales/rice.png' },
            { label: 'Aguacate', note: 'Energ\u00eda y grasas', texture: 'concept_avocado', path: '/iconsFood/frutas/avocado.png' },
        ],
    },
    {
        id: 'carbohidratos',
        title: 'Carbohidratos',
        menuLabel: 'Carbohidratos',
        icon: 'CHO',
        subtitle: 'Energ\u00eda para moverte.',
        body: 'Los carbohidratos son una fuente principal de energ\u00eda. Est\u00e1n en cereales, tub\u00e9rculos, frutas y otros alimentos de origen vegetal.',
        callout: 'Los cereales integrales, frutas y tub\u00e9rculos aportan energ\u00eda junto con otros nutrientes.',
        examplesTitle: 'Fuentes comunes',
        examples: [
            { label: 'Arroz', note: 'Cereal', texture: 'concept_carb_rice', path: '/iconsFood/cereales/rice.png' },
            { label: 'Ma\u00edz', note: 'Cereal mexicano', texture: 'concept_corn', path: '/iconsFood/cereales/corn.png' },
            { label: 'Papa', note: 'Tub\u00e9rculo', texture: 'concept_potato', path: '/iconsFood/cereales/potato.png' },
        ],
    },
    {
        id: 'proteinas',
        title: 'Prote\u00ednas',
        menuLabel: 'Prote\u00ednas',
        icon: 'PRO',
        subtitle: 'Construyen y reparan.',
        body: 'Las prote\u00ednas ayudan al crecimiento y a reparar partes del cuerpo como m\u00fasculos, piel y tejidos. Pueden venir de animales y leguminosas.',
        callout: 'Combinar distintas fuentes de prote\u00edna ayuda a construir un plato m\u00e1s completo.',
        examplesTitle: 'Fuentes de prote\u00edna',
        examples: [
            { label: 'Huevo', note: 'Origen animal', texture: 'concept_egg', path: '/iconsFood/animal/egg.png' },
            { label: 'Pollo', note: 'Prote\u00edna magra', texture: 'concept_chicken', path: '/iconsFood/animal/chicken.png' },
            { label: 'Frijoles', note: 'Leguminosa', texture: 'concept_beans', path: '/iconsFood/leguminosas/beans.png' },
        ],
    },
    {
        id: 'hidratacion',
        title: 'Hidrataci\u00f3n',
        menuLabel: 'Hidrataci\u00f3n',
        icon: 'H2O',
        subtitle: 'Agua para funcionar mejor.',
        body: 'El agua ayuda a transportar nutrientes, regular la temperatura y mantener tu cuerpo listo para aprender, jugar y moverte.',
        callout: 'Tomar agua simple y comer frutas o verduras con agua ayuda a mantenerte hidratado.',
        examplesTitle: 'Apoyos para hidratarte',
        examples: [
            { label: 'Agua', note: 'Bebida diaria', texture: 'concept_water', path: '/iconsFood/comidaExtra/water.png' },
            { label: 'Sand\u00eda', note: 'Fruta con agua', texture: 'concept_watermelon', path: '/iconsFood/frutas/watermelon.png' },
            { label: 'Pepino', note: 'Verdura fresca', texture: 'concept_cucumber', path: '/iconsFood/verduras/cucumber.png' },
        ],
    },
];

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
