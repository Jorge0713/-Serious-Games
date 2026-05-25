import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { FoodCategory, FoodItem } from '../../../data/nutritionalInfo';
import { categoryConfig } from '../../../config/categoryConfig';
import FoodCard from './FoodCard';
import './FoodGrid.css';

interface FoodGridProps {
    foods: FoodItem[];
    title?: string;
    currentSectionIndex: number;
    totalSections: number;
    finishLabel?: string;
    onPreviousSection: () => void;
    onNextSection: () => void;
    onFinishTutorial: () => void;
}

interface FoodSectionExplorerProps {
    category: FoodItem['category'];
    items: FoodItem[];
}

const nutrientMatches = [
    { match: 'fibra', label: 'Fibra' },
    { match: 'vitamina a', label: 'Vitamina A' },
    { match: 'vitamina c', label: 'Vitamina C' },
    { match: 'vitamina d', label: 'Vitamina D' },
    { match: 'vitamina k', label: 'Vitamina K' },
    { match: 'proteína', label: 'Proteína' },
    { match: 'proteínas', label: 'Proteína' },
    { match: 'potasio', label: 'Potasio' },
    { match: 'calcio', label: 'Calcio' },
    { match: 'hierro', label: 'Hierro' },
    { match: 'magnesio', label: 'Magnesio' },
    { match: 'antioxidantes', label: 'Antioxidantes' },
    { match: 'omega-3', label: 'Omega-3' },
    { match: 'folato', label: 'Folato' },
    { match: 'zinc', label: 'Zinc' },
    { match: 'carbohidratos', label: 'Carbohidratos' },
    { match: 'grasas saludables', label: 'Grasas saludables' }
];

const fallbackImages: Record<FoodCategory, string> = {
    fruit: '/iconsFood/frutas/apple.png',
    vegetable: '/iconsFood/verduras/carrot.png',
    legume: '/iconsFood/leguminosas/beans.png',
    cereal: '/iconsFood/cereales/rice.png',
    animal: '/iconsFood/animal/chicken.png'
};

const categoryDescriptions: Record<FoodCategory, string> = {
    vegetable: 'En esta sección se encuentran las verduras: alimentos llenos de fibra, color y defensas naturales para cuidar tu cuerpo.',
    fruit: 'En esta sección se encuentran las frutas: opciones dulces y frescas que aportan vitaminas, agua y energía saludable.',
    cereal: 'En esta sección se encuentran los cereales y tubérculos: alimentos que dan energía para jugar, pensar y aprender.',
    legume: 'En esta sección se encuentran las leguminosas: alimentos con proteína vegetal, fibra y mucha fuerza nutritiva.',
    animal: 'En esta sección se encuentran los alimentos de origen animal: fuentes de proteína, calcio y nutrientes para crecer fuerte.'
};

const handleImageError = (
    event: SyntheticEvent<HTMLImageElement>,
    category: FoodCategory
) => {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied === 'true') {
        return;
    }

    image.dataset.fallbackApplied = 'true';
    image.src = fallbackImages[category];
};

const getFoodFacts = (food: FoodItem) => {
    const sentences = food.description
        .split('.')
        .map(sentence => sentence.trim())
        .filter(Boolean);
    const lowerDescription = food.description.toLowerCase();
    const nutrients = nutrientMatches
        .filter(({ match }) => lowerDescription.includes(match))
        .map(({ label }) => label)
        .filter((label, index, labels) => labels.indexOf(label) === index)
        .slice(0, 5);

    return {
        benefit: sentences[0] ? `${sentences[0]}.` : food.description,
        extra: sentences[1]
            ? `${sentences[1]}.`
            : 'Aporta variedad y ayuda a construir un plato equilibrado.',
        nutrients: nutrients.length > 0 ? nutrients : ['Energía', 'Balance', 'Nutrientes']
    };
};

const formatNutritionValue = (value: number | undefined | null, unit: string): string => {
    if (value === undefined || value === null) {
        return 'N/D';
    }

    return `${value} ${unit}`;
};

const getRecommendedPortion = (food: FoodItem): string => (
    food.recommendedPortion ??
    (food.portionGrams !== undefined && food.portionGrams !== null
        ? `${food.portionGrams} g`
        : 'N/D')
);

const NutritionSummaryPanel: React.FC<{ food: FoodItem }> = ({ food }) => {
    const nutrientCards = [
        { label: 'Calorías', value: formatNutritionValue(food.calories, 'kcal') },
        { label: 'Carbohidratos', value: formatNutritionValue(food.carbs, 'g') },
        { label: 'Proteínas', value: formatNutritionValue(food.protein, 'g') },
        { label: 'Grasas', value: formatNutritionValue(food.fat, 'g') },
        { label: 'Fibra', value: formatNutritionValue(food.fiber, 'g') }
    ];

    return (
        <section className="nutrition-summary-panel" aria-label="Resumen nutricional">
            <div className="nutrition-summary-header">
                <h3>RESUMEN NUTRICIONAL</h3>
                <p>Porción recomendada: {getRecommendedPortion(food)}</p>
            </div>

            <div className="nutrition-card-grid">
                {nutrientCards.map(card => (
                    <div className="nutrition-card" key={card.label}>
                        <span className="nutrition-card-label">{card.label}</span>
                        <strong className="nutrition-card-value">{card.value}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
};

const FoodSectionExplorer: React.FC<FoodSectionExplorerProps> = ({ category, items }) => {
    const [activeFoodId, setActiveFoodId] = useState<string | null>(items[0]?.id ?? null);
    const trackRef = useRef<HTMLDivElement>(null);
    const config = categoryConfig[category];
    const activeFood = useMemo(
        () => items.find(food => food.id === activeFoodId) ?? items[0] ?? null,
        [activeFoodId, items]
    );
    const facts = useMemo(() => activeFood ? getFoodFacts(activeFood) : null, [activeFood]);

    const scrollFoods = (direction: -1 | 1) => {
        trackRef.current?.scrollBy({
            left: direction * 340,
            behavior: 'smooth'
        });
    };

    return (
        <section className="food-section" aria-label={config.label}>
            <div className="section-header">
                <span className="section-icon" aria-hidden="true">{config.emoji}</span>
                <div>
                    <h2 className="section-title">{config.label}</h2>
                    <p className="section-copy">{categoryDescriptions[category]}</p>
                </div>
            </div>

            {activeFood && facts ? (
                <div className="food-explorer">
                <div className="carousel-zone">
                    <div className="carousel-toolbar">
                        <span className="carousel-label">Colección nutritiva</span>
                        <div className="carousel-actions" aria-label="Controles del carrusel">
                            <button
                                type="button"
                                className="circle-control btn-left-control"
                                onClick={() => scrollFoods(-1)}
                                aria-label="Ver alimentos anteriores"
                            >
                                <span className="btn-left-sprite"></span>
                            </button>

                            <button
                                type="button"
                                className="circle-control btn-right-control"
                                onClick={() => scrollFoods(1)}
                                aria-label="Ver más alimentos"
                            >
                                <span className="btn-right-sprite"></span>
                            </button>
                        </div>
                    </div>

                    <div className="food-track" ref={trackRef}>
                        {items.map((food, index) => {
                            const isActive = food.id === activeFood.id;

                            return (
                                <FoodCard
                                    key={food.id}
                                    food={food}
                                    isActive={isActive}
                                    index={index}
                                    category={category}
                                    onSelect={setActiveFoodId}
                                    onImageError={handleImageError}
                                />
                            );
                        })}
                    </div>

                    <NutritionSummaryPanel food={activeFood} />
                </div>

                <aside className="food-spotlight" key={activeFood.id}>
                    <div className="spotlight-topline">
                        <span>{config.emoji} {config.label}</span>
                        <strong>Ficha nutritiva</strong>
                    </div>

                    <div className="spotlight-image-wrap">
                        <img
                            src={activeFood.image}
                            alt={activeFood.nameES}
                            className="spotlight-image"
                            onError={event => handleImageError(event, activeFood.category)}
                        />
                    </div>

                    <div className="spotlight-content">
                        <h3>{activeFood.nameES}</h3>

                        <div className="info-block">
                            <span className="info-label">Beneficio</span>
                            <p>{facts.benefit}</p>
                        </div>

                        <div className="nutrient-cloud" aria-label="Información nutricional">
                            {facts.nutrients.map((nutrient, index) => (
                                <span
                                    key={nutrient}
                                    className={index < 3 ? 'is-primary' : 'is-secondary'}
                                >
                                    {nutrient}
                                </span>
                            ))}
                        </div>

                        <div className="info-block compact">
                            <span className="info-label">Dato saludable</span>
                            <p>{facts.extra}</p>
                        </div>
                    </div>
                </aside>
                </div>
            ) : (
                <div className="empty-food-state">
                    No hay alimentos disponibles para esta seccion.
                </div>
            )}
        </section>
    );
};

export const FoodGrid: React.FC<FoodGridProps> = ({
    foods,
    title = 'Frutas y verduras',
    currentSectionIndex,
    totalSections,
    finishLabel = 'Ir al Nivel 1',
    onPreviousSection,
    onNextSection,
    onFinishTutorial
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isFirstSection = currentSectionIndex === 0;
    const isLastSection = currentSectionIndex === totalSections - 1;
    const groupedFoods = foods.reduce((groups, food) => {
        if (!groups[food.category]) {
            groups[food.category] = [];
        }
        groups[food.category].push(food);
        return groups;
    }, {} as Record<FoodItem['category'], FoodItem[]>);

    useEffect(() => {
        containerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [currentSectionIndex]);

    return (
        <div className="tutorial-container" ref={containerRef}>
            <nav className="section-nav" aria-label="Navegación del tutorial">
                <button
                    type="button"
                    className="btn-back"
                    onClick={onPreviousSection}
                    disabled={isFirstSection}
                    aria-label="Volver"
                >
                    <img
                        src="/assets/Buttons/BtnBack.png"
                        alt=""
                        className="btn-back-img"
                    />
                </button>

                <span className="section-progress">
                    Sección {currentSectionIndex + 1} / {totalSections}
                </span>
            </nav>

            <main className="tutorial-shell">
                <header className="tutorial-hero">
                    <span className="tutorial-badge">Explorador de alimentos</span>
                    <h1 className="tutorial-title">{title}</h1>
                    <p className="tutorial-subtitle">
                        Selecciona las tarjetas, observa sus nutrientes y avanza cuando termines de explorar esta sección.
                    </p>
                </header>

                <div className="sections-stack">
                    {Object.entries(groupedFoods).map(([category, items]) => (
                        <FoodSectionExplorer
                            key={category}
                            category={category as FoodItem['category']}
                            items={items}
                        />
                    ))}
                </div>

                <button
                    className={`btn-next ${isLastSection ? 'is-final' : ''}`}
                    data-label={isLastSection ? finishLabel : undefined}
                    aria-label={isLastSection ? finishLabel : 'Siguiente seccion'}
                    onClick={isLastSection ? onFinishTutorial : onNextSection}
                >
                    {isLastSection ? 'Ir al Nivel 1' : 'Siguiente sección →'}
                </button>
            </main>
        </div>
    );
};
