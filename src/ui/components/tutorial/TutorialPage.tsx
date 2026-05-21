import { FoodGrid } from './FoodGrid';
import { nutritionalInfo } from '../../../data/nutritionalInfo';
import type { FoodCategory } from '../../../data/nutritionalInfo';

interface TutorialPageProps {
    categories: FoodCategory[];
    title: string;
    currentSectionIndex: number;
    totalSections: number;
    onPreviousSection: () => void;
    onNextSection: () => void;
    onFinishTutorial: () => void;
}

export const TutorialPage: React.FC<TutorialPageProps> = ({
    categories,
    title,
    currentSectionIndex,
    totalSections,
    onPreviousSection,
    onNextSection,
    onFinishTutorial
}) => {
    const categoryOrder = new Map(categories.map((category, index) => [category, index]));
    const filteredFoods = nutritionalInfo
        .filter(food => categories.includes(food.category))
        .sort((a, b) => (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0));

    return (
        <FoodGrid
            foods={filteredFoods}
            title={title}
            currentSectionIndex={currentSectionIndex}
            totalSections={totalSections}
            onPreviousSection={onPreviousSection}
            onNextSection={onNextSection}
            onFinishTutorial={onFinishTutorial}
        />
    );
};
