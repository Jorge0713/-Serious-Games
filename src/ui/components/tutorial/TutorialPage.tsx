import { useState } from 'react';
import { FoodGrid } from './FoodGrid';
import { FoodDetail } from './FoodDetail';
import { nutritionalInfo } from '../../../data/nutritionalInfo';
import type { FoodItem } from '../../../data/nutritionalInfo';

interface TutorialPageProps {
    onBackToMenu: () => void;
    onNextTutorial: () => void;
    selectedCategory?: string | string[] | null;
}

const getTitleFromCategory = (category: string | string[] | null): string => {
    if (!category) return "Grupo 1: Frutas y Verduras";
    if (Array.isArray(category)) {
        if (category.includes('vegetable') && category.includes('fruit')) {
            return "Grupo 1: Frutas y Verduras";
        }
        return "Grupo 1: Frutas y Verduras";
    }
    switch (category) {
        case 'cereal':
            return "Grupo 2: Cereales";
        case 'legume':
            return "Grupo 3: Leguminosas";
        case 'animal':
            return "Grupo 4: Alimentos de Origen Animal";
        default:
            return "Grupo 1: Frutas y Verduras";
    }
};

const isFruitAndVegetableCategory = (category: string | string[] | null): boolean => {
    if (!category) return true;
    if (Array.isArray(category)) {
        return category.includes('vegetable') && category.includes('fruit');
    }
    return false;
};

export const TutorialPage: React.FC<TutorialPageProps> = ({
    onBackToMenu,
    onNextTutorial,
    selectedCategory = null
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

    const title = getTitleFromCategory(selectedCategory);
    const isFV = isFruitAndVegetableCategory(selectedCategory);
    const gridCategory = isFV ? null : selectedCategory;

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
            selectedCategory={gridCategory}
        />
    );
};