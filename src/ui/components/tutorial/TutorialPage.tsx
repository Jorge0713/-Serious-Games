import { useState } from 'react';
import { FoodGrid } from './FoodGrid';
import { FoodDetail } from './FoodDetail';
import { nutritionalInfo } from '../../../data/nutritionalInfo';
import type { FoodItem } from '../../../data/nutritionalInfo';

interface TutorialPageProps {
    onBackToMenu: () => void;
    onNextTutorial: () => void;
}

export const TutorialPage: React.FC<TutorialPageProps> = ({
    onBackToMenu,
    onNextTutorial
}) => {
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
    };

    const handleBack = () => {
        setSelectedFood(null);
    };

    if (selectedFood) {
        return <FoodDetail food={selectedFood} onBack={handleBack} />;
    }

    return (
        <FoodGrid
            foods={nutritionalInfo}
            onSelectFood={handleSelectFood}
            onBackToMenu={onBackToMenu}
            onNextTutorial={onNextTutorial}
        />
    );
};