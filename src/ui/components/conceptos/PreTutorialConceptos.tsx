import React, { useState, useEffect } from 'react';
import './PreTutorialConceptos.css';
import type { NutritionConcept } from './types';
import { ConceptosSidebar } from './ConceptosSidebar';
import { ConceptosMain } from './ConceptosMain';

const CONCEPTS: NutritionConcept[] = [
    {
        id: 'energia',
        title: 'La Energía',
        menuLabel: 'Energía',
        icon: 'ZAP',
        subtitle: 'El combustible de tu cuerpo.',
        body: 'La energía ayuda a correr, jugar, pensar y aprender. Tu cuerpo la obtiene de los alimentos y la usa durante todo el día.',
        callout: 'Una comida variada ayuda a mantener energía estable para tus actividades.',
        examplesTitle: 'Fuentes de energía',
        examples: [
            { label: 'Plátano', note: 'Energía rápida', path: '/iconsFood/frutas/bananas.png' },
            { label: 'Avena', note: 'Energía duradera', path: '/iconsFood/cereales/oat.png' },
            { label: 'Cacahuate', note: 'Energía concentrada', path: '/iconsFood/leguminosas/peanut.png' },
        ],
    },
    {
        id: 'calorias',
        title: 'Calorías',
        menuLabel: 'Calorías',
        icon: 'KCAL',
        subtitle: 'Una forma de medir energía.',
        body: 'Las calorías indican cuánta energía aporta un alimento. No solo importa la cantidad: también importan los nutrientes que acompañan esa energía.',
        callout: 'Elegir alimentos nutritivos ayuda a que la energía venga con vitaminas, fibra o proteínas.',
        examplesTitle: 'Distintas densidades',
        examples: [
            { label: 'Manzana', note: 'Ligera y fresca', path: '/iconsFood/frutas/apple.png' },
            { label: 'Arroz', note: 'Base energética', path: '/iconsFood/cereales/rice.png' },
            { label: 'Aguacate', note: 'Energía y grasas', path: '/iconsFood/frutas/avocado.png' },
        ],
    },
    {
        id: 'carbohidratos',
        title: 'Carbohidratos',
        menuLabel: 'Carbohidratos',
        icon: 'CHO',
        subtitle: 'Energía para moverte.',
        body: 'Los carbohidratos son una fuente principal de energía. Están en cereales, tubérculos, frutas y otros alimentos de origen vegetal.',
        callout: 'Los cereales integrales, frutas y tubérculos aportan energía junto con otros nutrientes.',
        examplesTitle: 'Fuentes comunes',
        examples: [
            { label: 'Arroz', note: 'Cereal', path: '/iconsFood/cereales/rice.png' },
            { label: 'Maíz', note: 'Cereal mexicano', path: '/iconsFood/cereales/corn.png' },
            { label: 'Papa', note: 'Tubérculo', path: '/iconsFood/cereales/potato.png' },
        ],
    },
    {
        id: 'proteinas',
        title: 'Proteínas',
        menuLabel: 'Proteínas',
        icon: 'PRO',
        subtitle: 'Construyen y reparan.',
        body: 'Las proteínas ayudan al crecimiento y a reparar partes del cuerpo como músculos, piel y tejidos. Pueden venir de animales y leguminosas.',
        callout: 'Combinar distintas fuentes de proteína ayuda a construir un plato más completo.',
        examplesTitle: 'Fuentes de proteína',
        examples: [
            { label: 'Huevo', note: 'Origen animal', path: '/iconsFood/animal/egg.png' },
            { label: 'Pollo', note: 'Proteína magra', path: '/iconsFood/animal/chicken.png' },
            { label: 'Frijoles', note: 'Leguminosa', path: '/iconsFood/leguminosas/beans.png' },
        ],
    },
    {
        id: 'hidratacion',
        title: 'Hidratación',
        menuLabel: 'Hidratación',
        icon: 'H2O',
        subtitle: 'Agua para funcionar mejor.',
        body: 'El agua ayuda a transportar nutrientes, regular la temperatura y mantener tu cuerpo listo para aprender, jugar y moverte.',
        callout: 'Tomar agua simple y comer frutas o verduras con agua ayuda a mantenerte hidratado.',
        examplesTitle: 'Apoyos para hidratarte',
        examples: [
            { label: 'Agua', note: 'Bebida diaria', path: '/iconsFood/comidaExtra/water.png' },
            { label: 'Sandía', note: 'Fruta con agua', path: '/iconsFood/frutas/watermelon.png' },
            { label: 'Pepino', note: 'Verdura fresca', path: '/iconsFood/verduras/cucumber.png' },
        ],
    },
];

interface PreTutorialConceptosProps {
    onBackToMenu: () => void;
    onFinish: () => void;
}

export const PreTutorialConceptos: React.FC<PreTutorialConceptosProps> = ({ onBackToMenu, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const concept = CONCEPTS[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === CONCEPTS.length - 1;

    // Sonidos pre-cargados
    useEffect(() => {
        const hoverAudio = new Audio('/Sound/hoverSound.mp3');
        const clickAudio = new Audio('/Sound/Click.mp3');
        hoverAudio.load();
        clickAudio.load();
    }, []);

    const playClick = () => {
        const audio = new Audio('/Sound/Click.mp3');
        audio.volume = 0.22;
        audio.play().catch(() => {});
    };

    const handleNext = () => {
        playClick();
        if (isLast) {
            const finishAudio = new Audio('/Sound/ObjectWIN.mp3');
            finishAudio.volume = 0.28;
            finishAudio.play().catch(() => {});
            onFinish();
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        playClick();
        setCurrentIndex(prev => prev - 1);
    };

    const handleMenuClick = (index: number) => {
        playClick();
        setCurrentIndex(index);
    };

    return (
        <div className="conceptos-container">
            <div className="conceptos-bg" style={{ backgroundImage: 'url(/assets/Backgrounds/Fondo_Cocina.png)' }}></div>
            <div className="conceptos-overlay"></div>

            <button className="conceptos-btn-back" onClick={() => { playClick(); onBackToMenu(); }}>
                {'< Volver'}
            </button>

            <div className="conceptos-header">
                <h1>Puente nutricional</h1>
                <p>Antes del siguiente reto, repasa conceptos clave para construir mejores decisiones.</p>
            </div>

            <div className="conceptos-layout">
                <ConceptosSidebar 
                    concepts={CONCEPTS} 
                    currentIndex={currentIndex} 
                    onSelect={handleMenuClick} 
                />

                <ConceptosMain 
                    concept={concept}
                    isFirst={isFirst}
                    isLast={isLast}
                    currentIndex={currentIndex}
                    totalConcepts={CONCEPTS.length}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            </div>
        </div>
    );
};
