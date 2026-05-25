import type { FoodItem } from '../../../data/nutritionalInfo';
import { categoryConfig } from '../../../config/categoryConfig';
import { categoryColors } from '../../../config/categoryColors';

interface FoodDetailProps {
    food: FoodItem;
    onBack: () => void;
}

export const FoodDetail: React.FC<FoodDetailProps> = ({ food, onBack }) => {
    const config = categoryConfig[food.category as keyof typeof categoryConfig];
    const colors = categoryColors[food.category as keyof typeof categoryColors];
    return (
        <div className="food-detail-container">
            <button className="btn-back-detail" onClick={onBack}>
                ← Volver atrás
            </button>

            <div
                className="detail-card"
                style={{
                    background: colors.card,
                    borderColor: colors.border
                }}
            >
                <img
                    src={food.image}
                    alt={food.nameES}
                    className="detail-image"
                />

                <h2 className="detail-name">{food.nameES}</h2>
                <span className="detail-english">{food.name}</span>

                <div
                    className="detail-category"
                    style={{
                        background: colors.border,
                        borderColor: colors.border
                    }}
                >
                    {config.emoji} {config.label}
                </div>

                <p className="detail-description">{food.description}</p>
            </div>

            <style>{`
                .food-detail-container {
                    width: 100%;
                    height: 100vh;
                    padding: 20px;
                    padding-bottom: 60px;
                    box-sizing: border-box;
                    background: linear-gradient(180deg, #1a3d1a 0%, #2d5a27 50%, #4a7c3a 100%);
                    background-image: url('/assets/Backgrounds/Fondo_Cocina.png');
                    background-size: cover;
                    background-position: center;
                    background-blend-mode: overlay;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .food-detail-container::-webkit-scrollbar {
                    width: 14px;
                }
                .food-detail-container::-webkit-scrollbar-track {
                    background: #1a3d1a;
                    border-radius: 7px;
                }
                .food-detail-container::-webkit-scrollbar-thumb {
                    background: #6b8e23;
                    border-radius: 7px;
                    border: 3px solid #1a3d1a;
                }
                .food-detail-container::-webkit-scrollbar-thumb:hover {
                    background: #8fbc8f;
                }

                @supports (scrollbar-width: auto) {
                    .food-detail-container {
                        scrollbar-width: auto;
                        scrollbar-color: #6b8e23 #1a3d1a;
                    }
                }

                .btn-back-detail {
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

                .btn-back-detail:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 8px rgba(0,0,0,0.4);
                }

                .detail-card {
                    background: linear-gradient(145deg, rgba(45, 90, 39, 0.95), rgba(26, 61, 26, 0.98));
                    border: 4px solid #8B4513;
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                .detail-image {
                    width: 70%;
                    max-height: 250px;
                    object-fit: contain;
                    background: rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 2px solid #5a8f5a;
                }

                .detail-name {
                    color: #fff;
                    font-size: 42px;
                    margin: 10px 0 5px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    font-family: 'Georgia', serif;
                }

                .detail-english {
                    color: #a8d8a8;
                    font-size: 18px;
                    font-style: italic;
                    display: block;
                    margin-bottom: 15px;
                }

                .detail-category {
                    display: inline-block;
                    background: #8B4513;
                    color: #d4e6d4;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-size: 16px;
                    margin-bottom: 25px;
                    border: 2px solid #5a8f5a;
                }

                .detail-description {
                    color: #e8f0e8;
                    font-size: 18px;
                    line-height: 1.6;
                    text-align: justify;
                    padding: 20px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    border-left: 4px solid #4a7c3a;
                }
            `}</style>
        </div>
    );
};
