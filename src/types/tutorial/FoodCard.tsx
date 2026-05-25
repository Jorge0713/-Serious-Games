import type { FoodItem, FoodCategory } from '../../../data/nutritionalInfo';
import './FoodGrid.css';

interface FoodCardProps {
    food: FoodItem;
    isActive: boolean;
    index: number;
    category: FoodCategory;
    onSelect: (id:string) => void;
    onImageError: (
        event: React.SyntheticEvent<HTMLImageElement, Event>,
        category: FoodCategory
    ) => void;
}

export default function FoodCard({
    food,
    isActive,
    index,
    category,
    onSelect,
    onImageError,
}: FoodCardProps) {

return (
    <button
        type="button"
        className={`food-card ${isActive ? 'is-active' : ''}`}
        aria-pressed={isActive}
        onClick={() => onSelect(food.id)}
        style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
        >
            <span className="card-number">
                {String(index + 1).padStart(2, '0')}
            </span>


            <span className="food-image-frame">
                <img
                    src={food.image}
                    alt={food.nameES}
                    className="food-image"
                    onError={event => onImageError(event, category)}
                    />
            </span>

            <span className="food-name">
                {food.nameES}
            </span>

            {isActive && (
                <span className="active-badge">
                    Activo
                </span>
            )}

        </button>
);
}