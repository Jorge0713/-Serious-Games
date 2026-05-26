import { FoodGrid } from './FoodGrid';
import { nutritionalInfo } from '../../../data/nutritionalInfo';
import type { FoodCategory } from '../../../data/nutritionalInfo';

interface TutorialPageProps {
    categories: FoodCategory[];
    title: string;
    currentSectionIndex: number;
    totalSections: number;
    finishLabel?: string;
    onBackToLevelSelect: () => void;
    onNextSection: () => void;
    onFinishTutorial: () => void;
}

export const TutorialPage: React.FC<TutorialPageProps> = ({
    categories,
    title,
    currentSectionIndex,
    totalSections,
    finishLabel,
    onBackToLevelSelect,
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
            finishLabel={finishLabel}
            onBackToLevelSelect={onBackToLevelSelect}
            onNextSection={onNextSection}
            onFinishTutorial={onFinishTutorial}
        />
    );
};
