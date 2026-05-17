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

const TITLE_FONT = '"Pixelify Sans", Arial, sans-serif';
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
    private currentIndex = 0;
    private menuItems: MenuItem[] = [];
    private contentLayer?: Phaser.GameObjects.Container;
    private navLayer?: Phaser.GameObjects.Container;
    private clickSound?: Phaser.Sound.BaseSound;
    private completeSound?: Phaser.Sound.BaseSound;

    constructor() {
        super('PreTutorialConceptosScene');
    }

    preload() {
        this.load.image('concept_bg_kitchen', '/assets/Backgrounds/Fondo_Cocina.png');
        this.load.audio('concept_click', '/Sound/Click.mp3');
        this.load.audio('concept_complete', '/Sound/ObjectWIN.mp3');

        CONCEPTS.flatMap(concept => concept.examples).forEach(example => {
            this.load.image(example.texture, example.path);
        });
    }

    create() {
        this.currentIndex = 0;
        this.menuItems = [];

        const { width, height } = this.scale;

        this.clickSound = this.sound.add('concept_click', { volume: 0.22 });
        this.completeSound = this.sound.add('concept_complete', { volume: 0.28 });

        this.add.image(width / 2, height / 2, 'concept_bg_kitchen').setDisplaySize(width, height);
        this.add.rectangle(width / 2, height / 2, width, height, COLORS.cream, 0.92);

        this.add.text(width / 2, 34, 'Puente nutricional', {
            fontFamily: TITLE_FONT,
            fontSize: '42px',
            color: COLOR_HEX.darkBrown,
        }).setOrigin(0.5, 0);

        this.add.text(width / 2, 84, 'Antes del siguiente reto, repasa conceptos clave para construir mejores decisiones.', {
            fontFamily: BODY_FONT,
            fontSize: '31px',
            color: COLOR_HEX.brown,
        }).setOrigin(0.5, 0);

        this.createSideMenu();
        this.renderConcept();
    }

    private createSideMenu() {
        const { height } = this.scale;
        const panelX = 70;
        const panelY = 138;
        const panelW = 430;
        const panelH = height - 210;

        const shadow = this.add.rectangle(panelX + 10, panelY + 12, panelW, panelH, COLORS.darkBrown, 0.18)
            .setOrigin(0);
        const panel = this.add.rectangle(panelX, panelY, panelW, panelH, COLORS.cream, 0.98)
            .setOrigin(0)
            .setStrokeStyle(4, COLORS.darkBrown);
        void shadow;
        void panel;

        this.add.text(panelX + 42, panelY + 38, 'Conceptos', {
            fontFamily: TITLE_FONT,
            fontSize: '34px',
            color: COLOR_HEX.darkBrown,
        }).setOrigin(0, 0);

        this.add.rectangle(panelX + 42, panelY + 92, panelW - 84, 3, COLORS.brown, 0.28)
            .setOrigin(0, 0.7);

        CONCEPTS.forEach((concept, index) => {
            const y = panelY + 135 + index * 104;
            const item = this.createMenuItem(panelX + 38, y, panelW - 76, 76, concept, index);
            this.menuItems.push(item);
        });
    }

    private createMenuItem(
        x: number,
        y: number,
        width: number,
        height: number,
        concept: NutritionConcept,
        index: number
    ): MenuItem {
        const bg = this.add.rectangle(x, y, width, height, COLORS.cream, 0.96)
            .setOrigin(0)
            .setStrokeStyle(3, COLORS.brown)
            .setInteractive({ useHandCursor: true });
        const iconBg = this.add.circle(x + 42, y + height / 2, 24, COLORS.brown, 0.16)
            .setStrokeStyle(2, COLORS.brown);
        const icon = this.add.text(x + 42, y + height / 2, concept.icon, {
            fontFamily: TITLE_FONT,
            fontSize: concept.icon.length > 3 ? '13px' : '15px',
            color: COLOR_HEX.darkBrown,
        }).setOrigin(0.5);
        const label = this.add.text(x + 82, y + height / 2, concept.menuLabel, {
            fontFamily: BODY_FONT,
            fontSize: '33px',
            color: COLOR_HEX.darkBrown,
        }).setOrigin(0, 0.5);

        bg.on('pointerover', () => {
            if (index === this.currentIndex) return;
            bg.setFillStyle(COLORS.cream, 1).setStrokeStyle(3, COLORS.green);
            iconBg.setFillStyle(COLORS.green, 0.2);
        });
        bg.on('pointerout', () => this.updateMenuState());
        bg.on('pointerdown', () => this.setConcept(index));

        return { bg, iconBg, icon, label };
    }

    private renderConcept() {
        this.contentLayer?.destroy(true);
        this.navLayer?.destroy(true);
        this.updateMenuState();

        const concept = CONCEPTS[this.currentIndex];
        const { width, height } = this.scale;
        const mainX = 550;
        const mainY = 138;
        const mainW = width - mainX - 70;
        const mainH = height - 210;

        this.contentLayer = this.add.container(0, 0).setAlpha(0);

        const shadow = this.add.rectangle(mainX + 12, mainY + 14, mainW, mainH, COLORS.darkBrown, 0.18)
            .setOrigin(0);
        const panel = this.add.rectangle(mainX, mainY, mainW, mainH, COLORS.cream, 0.98)
            .setOrigin(0)
            .setStrokeStyle(4, COLORS.darkBrown);

        const iconCircle = this.add.circle(mainX + 96, mainY + 100, 58, COLORS.green, 0.95)
            .setStrokeStyle(5, COLORS.brown);
        const iconText = this.add.text(mainX + 96, mainY + 100, concept.icon, {
            fontFamily: TITLE_FONT,
            fontSize: concept.icon.length > 3 ? '22px' : '26px',
            color: COLOR_HEX.darkBrown,
        }).setOrigin(0.5);

        const title = this.add.text(mainX + 185, mainY + 58, concept.title, {
            fontFamily: TITLE_FONT,
            fontSize: '52px',
            color: COLOR_HEX.darkBrown,
        }).setOrigin(0, 0);

        const subtitle = this.add.text(mainX + 188, mainY + 120, concept.subtitle, {
            fontFamily: BODY_FONT,
            fontSize: '35px',
            color: COLOR_HEX.brown,
            fontStyle: 'italic',
        }).setOrigin(0, 0);

        const infoX = mainX + 70;
        const infoY = mainY + 210;
        const infoW = mainW - 140;
        const infoH = 180;

        const infoPanel = this.add.rectangle(infoX, infoY, infoW, infoH, COLORS.white, 0.42)
            .setOrigin(0)
            .setStrokeStyle(3, COLORS.brown, 0.28);
        const accentLine = this.add.rectangle(infoX, infoY, 7, infoH, COLORS.green, 1)
            .setOrigin(0);
        const infoTitle = this.add.text(infoX + 34, infoY + 24, '\u00bfQU\u00c9 ES?', {
            fontFamily: TITLE_FONT,
            fontSize: '20px',
            color: COLOR_HEX.green,
        }).setOrigin(0, 0);
        const infoText = this.add.text(infoX + 34, infoY + 58, concept.body, {
            fontFamily: BODY_FONT,
            fontSize: '31px',
            color: COLOR_HEX.darkBrown,
            wordWrap: { width: infoW - 82 },
            lineSpacing: 4,
        }).setOrigin(0, 0);

        const callout = this.add.text(infoX + 34, infoY + 128, concept.callout, {
            fontFamily: BODY_FONT,
            fontSize: '28px',
            color: COLOR_HEX.brown,
            wordWrap: { width: infoW - 82 },
            lineSpacing: 2,
        }).setOrigin(0, 0);

        const examplesTitle = this.add.text(infoX, infoY + infoH + 46, concept.examplesTitle.toUpperCase(), {
            fontFamily: TITLE_FONT,
            fontSize: '22px',
            color: COLOR_HEX.brown,
        }).setOrigin(0, 0);

        this.contentLayer.add([
            shadow,
            panel,
            iconCircle,
            iconText,
            title,
            subtitle,
            infoPanel,
            accentLine,
            infoTitle,
            infoText,
            callout,
            examplesTitle,
        ]);

        this.createExampleCards(concept, infoX, infoY + infoH + 105, infoW);
        this.createNavigation(mainX, mainY, mainW, mainH);

        this.tweens.add({
            targets: this.contentLayer,
            alpha: 1,
            duration: 220,
            ease: 'Power2',
        });
    }

    private createExampleCards(concept: NutritionConcept, x: number, y: number, availableW: number) {
        if (!this.contentLayer) return;

        const gap = 24;
        const cardW = Math.min(250, (availableW - gap * 2) / 3);
        const cardH = 190;

        concept.examples.forEach((example, index) => {
            const cardX = x + cardW / 2 + index * (cardW + gap);
            const card = this.add.container(cardX, y + cardH / 2);

            const bg = this.add.rectangle(0, 0, cardW, cardH, COLORS.terracotta, 0.16)
                .setStrokeStyle(3, COLORS.brown, 0.44);
            const imageFrame = this.add.circle(0, -38, 45, COLORS.cream, 1)
                .setStrokeStyle(3, COLORS.brown, 0.46);
            const image = this.textures.exists(example.texture)
                ? this.add.image(0, -38, example.texture).setDisplaySize(68, 68)
                : this.add.text(0, -38, '?', {
                    fontFamily: TITLE_FONT,
                    fontSize: '32px',
                    color: COLOR_HEX.darkBrown,
                }).setOrigin(0.5);
            const label = this.add.text(0, 38, example.label, {
                fontFamily: TITLE_FONT,
                fontSize: '21px',
                color: COLOR_HEX.darkBrown,
                align: 'center',
                fixedWidth: cardW - 30,
            }).setOrigin(0.5, 0);
            const note = this.add.text(0, 68, example.note, {
                fontFamily: BODY_FONT,
                fontSize: '23px',
                color: COLOR_HEX.brown,
                align: 'center',
                fixedWidth: cardW - 30,
                wordWrap: { width: cardW - 34 },
            }).setOrigin(0.5, 0);

            card.add([bg, imageFrame, image, label, note]);
            card.setSize(cardW, cardH);
            card.setInteractive(
                new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH),
                Phaser.Geom.Rectangle.Contains
            );
            card.on('pointerover', () => {
                bg.setStrokeStyle(3, COLORS.green);
                this.tweens.add({ targets: card, y: y + cardH / 2 - 8, scale: 1.04, duration: 140, ease: 'Power1' });
            });
            card.on('pointerout', () => {
                bg.setStrokeStyle(3, COLORS.brown, 0.44);
                this.tweens.add({ targets: card, y: y + cardH / 2, scale: 1, duration: 140, ease: 'Power1' });
            });

            this.contentLayer?.add(card);
        });
    }

    private createNavigation(mainX: number, mainY: number, mainW: number, mainH: number) {
        this.navLayer = this.add.container(0, 0);

        const bottomY = mainY + mainH - 82;
        const divider = this.add.rectangle(mainX + 70, bottomY - 52, mainW - 140, 3, COLORS.brown, 0.18)
            .setOrigin(0, 0.5);
        this.navLayer.add(divider);

        const isFirst = this.currentIndex === 0;
        const isLast = this.currentIndex === CONCEPTS.length - 1;

        const prevButton = this.createNavButton(
            mainX,
            bottomY,
            250,
            72,
            '< Anterior',
            false,
            isFirst,
            () => this.goToPreviousConcept()
        );
        const nextButton = this.createNavButton(
            mainX + mainW - 190,
            bottomY,
            isLast ? 310 : 260,
            72,
            isLast ? 'Ir al crucigrama >' : 'Siguiente >',
            true,
            false,
            () => {
                if (isLast) {
                    this.finishTutorial();
                    return;
                }
                this.goToNextConcept();
            }
        );

        this.navLayer.add([prevButton, nextButton]);

        const dotStart = mainX + mainW / 2 - ((CONCEPTS.length - 1) * 24) / 2;
        CONCEPTS.forEach((_, index) => {
            const dot = this.add.circle(
                dotStart + index * 24,
                bottomY,
                index === this.currentIndex ? 9 : 8,
                index === this.currentIndex ? COLORS.green : COLORS.brown,
                index === this.currentIndex ? 1 : 0.18
            );
            this.navLayer?.add(dot);
        });
    }

    private createNavButton(
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        primary: boolean,
        disabled: boolean,
        onClick: () => void
    ) {
        const button = this.add.container(x, y);
        const fill = primary ? COLORS.green : COLORS.terracotta;
        const bg = this.add.rectangle(0, 0, width, height, disabled ? COLORS.cream : fill, disabled ? 0.62 : 1)
            .setStrokeStyle(4, COLORS.darkBrown, disabled ? 0.38 : 1);
        const text = this.add.text(0, 0, label, {
            fontFamily: TITLE_FONT,
            fontSize: '24px',
            color: disabled ? COLOR_HEX.brown : COLOR_HEX.cream,
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setAlpha(disabled ? 0.58 : 1);

        if (!disabled) {
            button.setSize(width, height);
            button.setInteractive(
                new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
                Phaser.Geom.Rectangle.Contains,
            );
            button.on('pointerover', () => {
                bg.setFillStyle(primary ? COLORS.darkBrown : COLORS.brown);
                this.tweens.add({ targets: button, scale: 1.04, duration: 120, ease: 'Power1' });
            });
            button.on('pointerout', () => {
                bg.setFillStyle(fill);
                this.tweens.add({ targets: button, scale: 1, duration: 120, ease: 'Power1' });
            });
            button.on('pointerdown', () => {
                onClick();
            });
        }

        return button;
    }

    private goToPreviousConcept() {
        if (this.currentIndex <= 0) return;
        this.setConcept(this.currentIndex - 1);
    }

    private goToNextConcept() {
        if (this.currentIndex >= CONCEPTS.length - 1) return;
        this.setConcept(this.currentIndex + 1);
    }

    private setConcept(index: number) {
        const nextIndex = Phaser.Math.Clamp(index, 0, CONCEPTS.length - 1);
        if (nextIndex === this.currentIndex) return;

        this.playClick();
        this.currentIndex = nextIndex;
        this.renderConcept();
    }

    private updateMenuState() {
        this.menuItems.forEach((item, index) => {
            const active = index === this.currentIndex;
            item.bg.setFillStyle(active ? COLORS.green : COLORS.cream, active ? 1 : 0.96);
            item.bg.setStrokeStyle(3, active ? COLORS.darkBrown : COLORS.brown, active ? 1 : 0.62);
            item.iconBg.setFillStyle(active ? COLORS.cream : COLORS.brown, active ? 1 : 0.16);
            item.iconBg.setStrokeStyle(2, active ? COLORS.darkBrown : COLORS.brown);
            item.icon.setColor(active ? COLOR_HEX.green : COLOR_HEX.darkBrown);
            item.label.setColor(active ? COLOR_HEX.cream : COLOR_HEX.darkBrown);
        });
    }

    private finishTutorial() {
        try { this.completeSound?.play(); } catch { void 0; }
        this.scene.start(NEXT_SCENE);
    }

    private playClick() {
        try { this.clickSound?.play(); } catch { void 0; }
    }
}
