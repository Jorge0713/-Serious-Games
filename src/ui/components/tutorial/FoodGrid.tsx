import type { FoodItem } from '../../../data/nutritionalInfo';
import { categoryColors } from '../../../config/categoryColors';
import { categoryConfig } from '../../../config/categoryConfig';

interface FoodGridProps {
    foods: FoodItem[];
    onSelectFood: (food: FoodItem) => void;
    onBackToMenu: () => void;
    onNextTutorial: () => void;
    title?: string;
    isFirstTutorial?: boolean;
}

export const FoodGrid: React.FC<FoodGridProps> = ({
    foods,
    onSelectFood,
    onBackToMenu,
    onNextTutorial,
    title = "Grupo 1: Frutas y Verduras",
    isFirstTutorial = false
}) => {
    const groupedFoods = foods.reduce((groups, food) => {
        if (!groups[food.category]) {
            groups[food.category] = [];
        }
        groups[food.category].push(food);
        return groups;
    }, {} as Record<string, FoodItem[]>);

    return (
        <div className="tutorial-container">
            <button className="btn-back" onClick={isFirstTutorial ? onNextTutorial : onBackToMenu}>
                {isFirstTutorial ? "Siguiente plato" : "← Volver al menú"}
            </button>

            <h1 className="tutorial-title">
                {isFirstTutorial ? "¡Excelente trabajo!, vamos a la siguiente tarea" : title}
            </h1>
            <p className="tutorial-subtitle">
                {isFirstTutorial 
                    ? "Has completado el tutorial de frutas y verduras" 
                    : "Aprende sobre los nutrientes de cada alimento"}
            </p>

            {/* Botón temporal para desarrolladores - abajo a la izquierda */}
            <button 
                className="btn-probar-siguiente" 
                onClick={() => (window as any).goToNivel2?.()}
            >
                Probar siguiente
            </button>

            {Object.entries(groupedFoods).map(([category, items]) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const colors = categoryColors[category as keyof typeof categoryColors];

                return (
                    <div key={category} className="food-section">
                        <h2
                            className="section-title"
                            style={{
                                color: colors.border,
                                borderBottom: `3px solid ${colors.border}`
                            }}
                        >
                            {config.emoji} {config.label}
                        </h2>

                        <div
                            className="food-grid"
                            style={{
                                border: `2px solid ${colors.border}`
                            }}
                        >
                            {items.map(food => (
                                <div
                                    key={food.id}
                                    className="food-card"
                                    onClick={() => onSelectFood(food)}
                                    style={{
                                        background: colors.card,
                                        borderColor: colors.border
                                    }}
                                >
                                    <img
                                        src={food.image}
                                        alt={food.nameES}
                                        className="food-image"
                                    />
                                    <span className="food-name">
                                        {food.nameES}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <button className="btn-next" onClick={onNextTutorial}>
                Siguiente tutorial →
            </button>

            <style>{`
                .tutorial-container {
                    width: 100%;
                    height: 100vh;
                    padding: 20px;
                    padding-bottom: 100px;
                    box-sizing: border-box;
                    background: linear-gradient(180deg, #1a3d1a 0%, #2d5a27 50%, #4a7c3a 100%);
                    background-image: url('/assets/Fondo_Cocina.png');
                    background-size: cover;
                    background-position: center;
                    background-blend-mode: overlay;
                    overflow-y: scroll;
                    overflow-x: hidden;
                }

                /* Scrollbar personalizada */
                .tutorial-container::-webkit-scrollbar {
                    width: 14px;
                }
                .tutorial-container::-webkit-scrollbar-track {
                    background: #1a3d1a;
                    border-radius: 7px;
                }
                .tutorial-container::-webkit-scrollbar-thumb {
                    background: #6b8e23;
                    border-radius: 7px;
                    border: 3px solid #1a3d1a;
                }
                .tutorial-container::-webkit-scrollbar-thumb:hover {
                    background: #8fbc8f;
                }

                /* Firefox scrollbar */
                @supports (scrollbar-width: auto) {
                    .tutorial-container {
                        scrollbar-width: auto;
                        scrollbar-color: #6b8e23 #1a3d1a;
                    }
                }

                .btn-back {
                    background: #c0392b;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .btn-back:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 8px rgba(0,0,0,0.4);
                }

                .tutorial-title {
                    text-align: center;
                    color: #fff;
                    font-size: 48px;
                    margin: 60px 0 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    font-family: 'Georgia', serif;
                }

                .tutorial-subtitle {
                    text-align: center;
                    color: #d4e6d4;
                    font-size: 20px;
                    margin-bottom: 40px;
                }

                .food-section {
                    margin-bottom: 40px;
                }

                .section-title {
                    color: #a8d8a8;
                    font-size: 32px;
                    margin-bottom: 20px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    border-bottom: 3px solid #4a7c3a;
                    display: inline-block;
                    padding-bottom: 10px;
                }

                .food-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    background: rgba(139, 69, 19, 0.3);
                    border-radius: 16px;
                    border: 2px solid #8B4513;
                }

                .food-card {
                    background: linear-gradient(145deg, #3d6b3d, #2d5a27);
                    border-radius: 12px;
                    padding: 15px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border: 2px solid #5a8f5a;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }

                .food-card:hover {
                    transform: scale(1.08);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                    border-color: #8fbc8f;
                }

                .food-image {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin-bottom: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                }

                .food-name {
                    color: #d4e6d4;
                    font-size: 14px;
                    font-weight: bold;
                    text-align: center;
                }

                .btn-next {
                    background: linear-gradient(180deg, #4a7c3a, #2d5a27);
                    color: white;
                    border: 3px solid #8fbc8f;
                    padding: 16px 40px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                    display: block;
                    margin: 40px auto;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .btn-next:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 12px rgba(0,0,0,0.4);
                }

                /* Botón temporal para desarrolladores - abajo a la izquierda */
                .btn-probar-siguiente {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: #c0392b;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                    z-index: 1000;
                }

                .btn-probar-siguiente:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 8px rgba(0,0,0,0.4);
                    background: #a93226;
                }
            `}</style>
        </div>
    );
};