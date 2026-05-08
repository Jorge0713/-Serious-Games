import { useState } from 'react';
import { FoodGrid } from './FoodGrid';
import { FoodDetail } from './FoodDetail';
import { nutritionalInfo } from '../../../data/nutritionalInfo';
import type { FoodItem } from '../../../data/nutritionalInfo';

interface TutorialPageProps {
    onBackToMenu: () => void;
    onNextTutorial: () => void;
    selectedCategory?: string | string[] | null;
    title?: string;
}

export const TutorialPage: React.FC<TutorialPageProps> = ({
    onBackToMenu,
    onNextTutorial,
    selectedCategory = null,
    title = "Grupo 1: Frutas y Verduras"
}) => {
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
    };

    const filteredFoods = selectedCategory
    ? Array.isArray(selectedCategory)
        ? nutritionalInfo.filter(f => selectedCategory.includes(f.category))
        : nutritionalInfo.filter(f => f.category === selectedCategory)
    : nutritionalInfo;

    const handleBack = () => {
        setSelectedFood(null);
    };

    if (selectedFood) {
        return <FoodDetail food={selectedFood} onBack={handleBack} />;
    }

    return (
        <FoodGrid
            foods={filteredFoods}
            onSelectFood={handleSelectFood}
            onBackToMenu={onBackToMenu}
            onNextTutorial={onNextTutorial}
            title={title}
        />
    );
};