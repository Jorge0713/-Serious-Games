import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { FoodCategory, FoodItem } from '../../../data/nutritionalInfo';
import { categoryConfig } from '../../../config/categoryConfig';

interface FoodGridProps {
    foods: FoodItem[];
    title?: string;
    currentSectionIndex: number;
    totalSections: number;
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

const FoodSectionExplorer: React.FC<FoodSectionExplorerProps> = ({ category, items }) => {
    const [activeFoodId, setActiveFoodId] = useState<string | null>(items[0]?.id ?? null);
    const trackRef = useRef<HTMLDivElement>(null);
    const config = categoryConfig[category];
    const activeFood = useMemo(
        () => items.find(food => food.id === activeFoodId) ?? items[0] ?? null,
        [activeFoodId, items]
    );
    const facts = useMemo(() => activeFood ? getFoodFacts(activeFood) : null, [activeFood]);

    const selectFoodById = (foodId: string) => {
        if (!items.some(food => food.id === foodId)) {
            return;
        }

        setActiveFoodId(foodId);
    };

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
                                className="circle-control"
                                onClick={event => {
                                    event.stopPropagation();
                                    scrollFoods(-1);
                                }}
                                aria-label="Ver alimentos anteriores"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className="circle-control"
                                onClick={event => {
                                    event.stopPropagation();
                                    scrollFoods(1);
                                }}
                                aria-label="Ver más alimentos"
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    <div className="food-track" ref={trackRef}>
                        {items.map((food, index) => {
                            const isActive = food.id === activeFood.id;

                            return (
                                <button
                                    type="button"
                                    key={food.id}
                                    data-food-id={food.id}
                                    className={`food-card ${isActive ? 'is-active' : ''}`}
                                    onClick={event => {
                                        event.stopPropagation();
                                        selectFoodById(food.id);
                                    }}
                                    aria-pressed={isActive}
                                    style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
                                >
                                    <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
                                    <span className="food-image-frame">
                                        <img
                                            src={food.image}
                                            alt={food.nameES}
                                            className="food-image"
                                            onError={event => handleImageError(event, food.category)}
                                        />
                                    </span>
                                    <span className="food-name">{food.nameES}</span>
                                    {isActive && <span className="active-badge">Activo</span>}
                                </button>
                            );
                        })}
                    </div>
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
                        <span className="spotlight-kicker">{activeFood.name}</span>
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
                    aria-disabled={isFirstSection}
                >
                    ← Volver
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
                    onClick={isLastSection ? onFinishTutorial : onNextSection}
                >
                    {isLastSection ? 'Ir al Nivel 1' : 'Siguiente sección →'}
                </button>
            </main>

            <style>{`
                .tutorial-container {
                    --green-main: #76A665;
                    --wood: #5E412F;
                    --wood-dark: #5E412F;
                    --cream: #DECDBC;
                    --terracotta: #D9A066;
                    --green-rgb: 118, 166, 101;
                    --wood-rgb: 94, 65, 47;
                    --wood-dark-rgb: 94, 65, 47;
                    --cream-rgb: 249, 246, 239;
                    --terracotta-rgb: 217, 160, 102;
                    --display-font: 'Pixelify Sans', 'Trebuchet MS', system-ui, sans-serif;
                    --text-font: 'VT323', 'Courier New', monospace;
                    width: 100%;
                    height: 100vh;
                    box-sizing: border-box;
                    color: var(--wood-dark);
                    background:
                        linear-gradient(180deg, rgba(var(--cream-rgb), 0.98), rgba(var(--cream-rgb), 0.94)),
                        url('/assets/Backgrounds/Fondo_Cocina.png');
                    background-size: cover;
                    background-position: center;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scroll-behavior: smooth;
                    font-family: var(--text-font);
                }

                .tutorial-container::-webkit-scrollbar,
                .food-track::-webkit-scrollbar {
                    height: 12px;
                    width: 12px;
                }

                .tutorial-container::-webkit-scrollbar-track,
                .food-track::-webkit-scrollbar-track {
                    background: rgba(var(--wood-dark-rgb), 0.14);
                    border-radius: 999px;
                }

                .tutorial-container::-webkit-scrollbar-thumb,
                .food-track::-webkit-scrollbar-thumb {
                    background: var(--terracotta);
                    border: 3px solid var(--cream);
                    border-radius: 999px;
                }

                .tutorial-container::-webkit-scrollbar-thumb:hover,
                .food-track::-webkit-scrollbar-thumb:hover {
                    background: var(--green-main);
                }

                @supports (scrollbar-width: auto) {
                    .tutorial-container,
                    .food-track {
                        scrollbar-width: thin;
                        scrollbar-color: var(--terracotta) rgba(var(--wood-dark-rgb), 0.14);
                    }
                }

                .tutorial-shell {
                    width: min(1480px, calc(100% - 40px));
                    margin: 0 auto;
                    padding: 88px 0 56px;
                }

                .tutorial-hero {
                    text-align: center;
                    animation: viewReveal 520ms ease both;
                }

                .tutorial-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 36px;
                    padding: 7px 18px;
                    color: var(--cream);
                    background: var(--wood-dark);
                    border: 2px solid var(--wood);
                    border-radius: 999px;
                    box-shadow: 0 10px 22px rgba(var(--wood-dark-rgb), 0.18);
                    font-size: 15px;
                    font-weight: 900;
                    font-family: var(--display-font);
                    letter-spacing: 0;
                    text-transform: uppercase;
                }

                .tutorial-title {
                    width: auto;
                    height: auto;
                    max-width: 960px;
                    margin: 20px auto 10px;
                    color: var(--wood-dark);
                    font-size: clamp(34px, 5vw, 62px);
                    line-height: 1.02;
                    font-weight: 1000;
                    font-family: var(--display-font);
                    letter-spacing: 0;
                    text-shadow: 0 4px 0 rgba(var(--wood-rgb), 0.14);
                }

                .tutorial-subtitle {
                    max-width: 660px;
                    margin: 0 auto 34px;
                    color: var(--wood);
                    font-size: clamp(25px, 2.8vw, 34px);
                    font-weight: 400;
                    line-height: 1.35;
                }

                .section-nav {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 20;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-back,
                .btn-next,
                .circle-control {
                    font-family: inherit;
                    font-weight: 400;
                    letter-spacing: 0;
                    cursor: pointer;
                    transition:
                        transform 180ms ease,
                        box-shadow 180ms ease,
                        background 180ms ease,
                        border-color 180ms ease;
                }

                .btn-back {
                    min-height: 46px;
                    padding: 10px 22px;
                    color: var(--cream);
                    background: var(--terracotta);
                    border: 2px solid var(--wood-dark);
                    border-radius: 16px;
                    box-shadow: 0 12px 24px rgba(var(--wood-dark-rgb), 0.28);
                    font-size: 25px;
                }

                .btn-back:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                    transform: none;
                    box-shadow: 0 8px 18px rgba(var(--wood-dark-rgb), 0.16);
                }

                .section-progress {
                    display: inline-flex;
                    align-items: center;
                    min-height: 42px;
                    padding: 8px 16px;
                    color: var(--cream);
                    background: var(--green-main);
                    border: 2px solid var(--wood-dark);
                    border-radius: 999px;
                    box-shadow: 0 10px 22px rgba(var(--wood-dark-rgb), 0.16);
                    font-family: var(--display-font);
                    font-size: 15px;
                    font-weight: 900;
                }

                .btn-back:hover,
                .btn-next:hover,
                .circle-control:hover {
                    transform: translateY(-3px) scale(1.03);
                    box-shadow: 0 16px 30px rgba(var(--wood-dark-rgb), 0.3);
                }

                .btn-back:disabled:hover {
                    transform: none;
                    box-shadow: 0 8px 18px rgba(var(--wood-dark-rgb), 0.16);
                }

                .sections-stack {
                    display: grid;
                    gap: 32px;
                }

                .food-section {
                    animation: viewReveal 640ms ease both;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 14px;
                }

                .section-icon {
                    display: grid;
                    place-items: center;
                    width: 66px;
                    height: 66px;
                    color: var(--cream);
                    background: var(--green-main);
                    border: 4px solid var(--wood);
                    border-radius: 20px;
                    box-shadow: 0 12px 0 rgba(var(--wood-dark-rgb), 0.18);
                    font-size: 34px;
                }

                .section-title {
                    width: auto;
                    height: auto;
                    margin: 0;
                    color: var(--wood-dark);
                    font-size: clamp(28px, 3vw, 42px);
                    line-height: 1;
                    font-weight: 1000;
                    font-family: var(--display-font);
                    letter-spacing: 0;
                }

                .section-copy {
                    margin-top: 6px;
                    color: rgba(var(--wood-dark-rgb), 0.74);
                    font-size: clamp(24px, 2.2vw, 31px);
                    font-weight: 400;
                    line-height: 1.12;
                    max-width: 760px;
                }

                .food-explorer {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(340px, 430px);
                    gap: 20px;
                    padding: 18px;
                    background:
                        linear-gradient(135deg, rgba(var(--terracotta-rgb), 0.16), rgba(var(--cream-rgb), 0.96)),
                        repeating-linear-gradient(45deg, rgba(var(--wood-rgb), 0.055) 0 10px, transparent 10px 20px);
                    border: 3px solid rgba(var(--wood-dark-rgb), 0.72);
                    border-radius: 26px;
                    box-shadow:
                        0 22px 44px rgba(var(--wood-dark-rgb), 0.2),
                        inset 0 0 0 2px rgba(var(--cream-rgb), 0.72);
                }

                .empty-food-state {
                    padding: 24px;
                    color: var(--wood-dark);
                    background: var(--cream);
                    border: 3px solid rgba(var(--wood-dark-rgb), 0.48);
                    border-radius: 22px;
                    box-shadow: 0 14px 28px rgba(var(--wood-dark-rgb), 0.14);
                    font-size: 24px;
                    line-height: 1.2;
                }

                .carousel-zone {
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .carousel-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    padding: 4px 4px 0;
                }

                .carousel-label {
                    color: var(--wood-dark);
                    font-family: var(--display-font);
                    font-size: 20px;
                    font-weight: 900;
                }

                .carousel-actions {
                    display: flex;
                    gap: 10px;
                }

                .circle-control {
                    display: grid;
                    place-items: center;
                    width: 46px;
                    height: 46px;
                    color: var(--cream);
                    background: var(--wood-dark);
                    border: 3px solid var(--wood);
                    border-radius: 50%;
                    box-shadow: 0 10px 0 rgba(var(--wood-dark-rgb), 0.16);
                    font-family: var(--display-font);
                    font-size: 34px;
                    line-height: 1;
                }

                .circle-control:hover {
                    background: var(--green-main);
                    border-color: var(--wood-dark);
                }

                .food-track {
                    display: flex;
                    gap: 18px;
                    min-height: 318px;
                    padding: 18px 10px 24px;
                    overflow-x: auto;
                    overflow-y: visible;
                    scroll-snap-type: x mandatory;
                    scroll-padding: 12px;
                }

                .food-card {
                    position: relative;
                    flex: 0 0 clamp(168px, 16vw, 214px);
                    min-height: 268px;
                    padding: 18px 14px 16px;
                    color: var(--wood-dark);
                    background:
                        linear-gradient(180deg, rgba(var(--terracotta-rgb), 0.12), rgba(var(--cream-rgb), 0.98));
                    border: 3px solid rgba(var(--wood-dark-rgb), 0.5);
                    border-radius: 24px;
                    box-shadow:
                        0 14px 0 rgba(var(--wood-rgb), 0.12),
                        0 18px 30px rgba(var(--wood-dark-rgb), 0.18);
                    scroll-snap-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    transform: translateY(0) scale(1);
                    animation: cardPop 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
                    overflow: hidden;
                }

                .food-card::before {
                    content: '';
                    position: absolute;
                    inset: 8px;
                    border-radius: 18px;
                    background:
                        linear-gradient(90deg, rgba(var(--wood-rgb), 0.055) 1px, transparent 1px),
                        linear-gradient(0deg, rgba(var(--wood-rgb), 0.045) 1px, transparent 1px);
                    background-size: 22px 22px;
                    opacity: 0.55;
                    pointer-events: none;
                }

                .food-card:hover,
                .food-card:focus-visible {
                    transform: translateY(-10px) scale(1.045);
                    border-color: var(--green-main);
                    box-shadow:
                        0 18px 0 rgba(var(--green-rgb), 0.22),
                        0 26px 42px rgba(var(--wood-dark-rgb), 0.26);
                    outline: none;
                }

                .food-card.is-active {
                    flex-basis: clamp(210px, 19vw, 260px);
                    transform: translateY(-8px) scale(1.04);
                    background:
                        linear-gradient(180deg, rgba(var(--green-rgb), 0.12), var(--cream) 45%);
                    border-color: var(--green-main);
                    box-shadow:
                        0 18px 0 rgba(var(--green-rgb), 0.24),
                        0 28px 48px rgba(var(--wood-dark-rgb), 0.28);
                }

                .card-number {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    z-index: 1;
                    color: var(--cream);
                    background: var(--wood-dark);
                    border: 2px solid rgba(var(--wood-dark-rgb), 0.58);
                    border-radius: 999px;
                    padding: 3px 9px;
                    font-size: 12px;
                    font-weight: 1000;
                    font-family: var(--display-font);
                }

                .food-image-frame {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    place-items: center;
                    width: 126px;
                    height: 126px;
                    margin-top: 20px;
                    background:
                        radial-gradient(circle, rgba(var(--green-rgb), 0.2), var(--cream) 66%),
                        linear-gradient(180deg, var(--cream), rgba(var(--wood-rgb), 0.14));
                    border: 3px solid rgba(var(--wood-rgb), 0.38);
                    border-radius: 50%;
                    box-shadow: inset 0 4px 12px rgba(var(--wood-dark-rgb), 0.14);
                }

                .food-image {
                    width: 94px;
                    height: 94px;
                    object-fit: contain;
                    filter: drop-shadow(0 10px 10px rgba(var(--wood-dark-rgb), 0.25));
                    transform: translateY(0) rotate(0);
                    transition: transform 220ms ease, filter 220ms ease;
                }

                .food-card:hover .food-image,
                .food-card.is-active .food-image {
                    transform: translateY(-4px) rotate(-3deg) scale(1.08);
                    filter: drop-shadow(0 14px 14px rgba(var(--wood-dark-rgb), 0.32));
                }

                .food-name {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    color: var(--wood-dark);
                    font-family: var(--display-font);
                    font-size: 21px;
                    line-height: 1.1;
                    font-weight: 900;
                    text-align: center;
                    overflow-wrap: anywhere;
                }

                .active-badge {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    z-index: 2;
                    padding: 4px 9px;
                    color: var(--cream);
                    background: var(--green-main);
                    border: 2px solid var(--wood-dark);
                    border-radius: 999px;
                    font-family: var(--display-font);
                    font-size: 12px;
                    font-weight: 900;
                    box-shadow: 0 6px 12px rgba(var(--green-rgb), 0.24);
                }

                .food-spotlight {
                    position: sticky;
                    top: 88px;
                    align-self: start;
                    min-height: 100%;
                    padding: 18px;
                    background:
                        linear-gradient(180deg, rgba(var(--terracotta-rgb), 0.16), rgba(var(--cream-rgb), 0.98));
                    border: 3px solid var(--wood-dark);
                    border-radius: 24px;
                    box-shadow:
                        0 18px 0 rgba(var(--wood-rgb), 0.18),
                        0 24px 38px rgba(var(--wood-dark-rgb), 0.2);
                    animation: spotlightIn 320ms ease both;
                    overflow: hidden;
                }

                .food-spotlight::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(115deg, transparent 0 52%, rgba(var(--wood-rgb), 0.045) 52% 56%, transparent 56%),
                        repeating-linear-gradient(0deg, rgba(var(--wood-rgb), 0.04) 0 2px, transparent 2px 16px);
                    opacity: 0.55;
                    pointer-events: none;
                }

                .spotlight-topline,
                .spotlight-image-wrap,
                .spotlight-content {
                    position: relative;
                    z-index: 1;
                }

                .spotlight-topline {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    color: var(--cream);
                    background: var(--wood-dark);
                    border: 2px solid var(--wood);
                    border-radius: 16px;
                    padding: 10px 12px;
                    font-family: var(--display-font);
                    font-size: 15px;
                    font-weight: 900;
                }

                .spotlight-image-wrap {
                    display: grid;
                    place-items: center;
                    min-height: 190px;
                    margin: 16px 0;
                    background:
                        radial-gradient(circle, rgba(var(--green-rgb), 0.28), var(--cream) 60%),
                        linear-gradient(180deg, rgba(var(--terracotta-rgb), 0.12), rgba(var(--wood-rgb), 0.12));
                    border: 3px solid rgba(var(--wood-rgb), 0.34);
                    border-radius: 22px;
                }

                .spotlight-image {
                    width: min(220px, 70%);
                    max-height: 172px;
                    object-fit: contain;
                    filter: drop-shadow(0 18px 16px rgba(var(--wood-dark-rgb), 0.3));
                    animation: floatFood 2600ms ease-in-out infinite;
                }

                .spotlight-content {
                    display: grid;
                    gap: 12px;
                }

                .spotlight-kicker {
                    color: var(--terracotta);
                    font-family: var(--display-font);
                    font-size: 16px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0;
                }

                .spotlight-content h3 {
                    width: auto;
                    height: auto;
                    margin: 0;
                    color: var(--wood-dark);
                    font-size: clamp(30px, 3vw, 44px);
                    line-height: 1;
                    font-weight: 1000;
                    font-family: var(--display-font);
                    letter-spacing: 0;
                }

                .info-block {
                    padding: 14px;
                    color: var(--wood-dark);
                    background: linear-gradient(180deg, rgba(var(--cream-rgb), 0.92), rgba(var(--terracotta-rgb), 0.14));
                    border: 2px solid rgba(var(--wood-rgb), 0.38);
                    border-left: 8px solid var(--green-main);
                    border-radius: 18px;
                    box-shadow: inset 0 1px 0 rgba(var(--cream-rgb), 0.88);
                }

                .info-block.compact {
                    border-left-color: var(--terracotta);
                }

                .info-label {
                    display: block;
                    margin-bottom: 5px;
                    color: var(--wood);
                    font-family: var(--display-font);
                    font-size: 14px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0;
                }

                .info-block p {
                    margin: 0;
                    font-size: 24px;
                    line-height: 1.12;
                    font-weight: 400;
                }

                .nutrient-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .nutrient-cloud span {
                    display: inline-flex;
                    align-items: center;
                    min-height: 34px;
                    padding: 6px 12px;
                    color: var(--cream);
                    background: var(--green-main);
                    border: 2px solid var(--wood-dark);
                    border-radius: 999px;
                    box-shadow: 0 8px 0 rgba(var(--wood-dark-rgb), 0.14);
                    font-family: var(--display-font);
                    font-size: 14px;
                    font-weight: 900;
                }

                .nutrient-cloud span.is-secondary {
                    background: var(--terracotta);
                }

                .btn-next {
                    display: block;
                    min-height: 58px;
                    margin: 42px auto 0;
                    padding: 14px 36px;
                    color: var(--cream);
                    background: var(--green-main);
                    border: 3px solid var(--wood-dark);
                    border-radius: 18px;
                    box-shadow: 0 14px 0 rgba(var(--wood-dark-rgb), 0.18);
                    font-size: clamp(25px, 2.8vw, 33px);
                }

                .btn-next.is-final {
                    background: var(--green-main);
                    border-color: var(--wood-dark);
                }

                @keyframes viewReveal {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes cardPop {
                    from {
                        opacity: 0;
                        transform: translateY(24px) scale(0.92);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes spotlightIn {
                    from {
                        opacity: 0;
                        transform: translateX(14px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }

                @keyframes floatFood {
                    0%, 100% {
                        transform: translateY(0) rotate(-2deg);
                    }
                    50% {
                        transform: translateY(-8px) rotate(2deg);
                    }
                }

                @media (max-width: 980px) {
                    .tutorial-shell {
                        width: min(100% - 28px, 760px);
                        padding-top: 86px;
                    }

                    .food-explorer {
                        grid-template-columns: 1fr;
                    }

                    .food-spotlight {
                        position: relative;
                        top: auto;
                    }
                }

                @media (max-width: 640px) {
                    .tutorial-shell {
                        width: min(100% - 20px, 480px);
                        padding-bottom: 90px;
                    }

                    .section-nav {
                        top: 12px;
                        left: 12px;
                        right: 12px;
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .btn-back {
                        max-width: calc(100% - 24px);
                        font-size: 21px;
                    }

                    .tutorial-title {
                        font-size: 33px;
                    }

                    .section-header {
                        align-items: flex-start;
                    }

                    .section-icon {
                        width: 54px;
                        height: 54px;
                        border-radius: 17px;
                        font-size: 28px;
                    }

                    .food-explorer {
                        padding: 12px;
                        border-radius: 22px;
                    }

                    .carousel-toolbar {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .food-track {
                        min-height: 292px;
                        gap: 14px;
                        padding-inline: 4px;
                    }

                    .food-card,
                    .food-card.is-active {
                        flex-basis: 174px;
                        min-height: 250px;
                    }

                    .food-image-frame {
                        width: 110px;
                        height: 110px;
                    }

                    .food-image {
                        width: 82px;
                        height: 82px;
                    }

                    .spotlight-topline {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};
