import { useCallback, useEffect, useState } from 'react';
import type * as Phaser from 'phaser';
import HomePage from './ui/pages/HomePage';
import { TutorialPage } from './ui/components/tutorial';
import type { FoodCategory } from './data/nutritionalInfo';

interface TutorialSection {
  id: string;
  title: string;
  categories: FoodCategory[];
}

declare global {
  interface Window {
    __phaserGame?: Phaser.Game;
    showTutorial?: (categories: FoodCategory | FoodCategory[]) => void;
    goToNivel1?: () => void;
    goToNivel2?: () => void;
    goToNivel3?: () => void;
  }
}

const tutorialSections: TutorialSection[] = [
  {
    id: 'frutasVerduras',
    title: 'Frutas y verduras',
    categories: ['vegetable', 'fruit']
  },
  {
    id: 'cereales',
    title: 'Cereales',
    categories: ['cereal']
  },
  {
    id: 'origenAnimalLeguminosas',
    title: 'Origen animal y leguminosas',
    categories: ['animal', 'legume']
  }
];

const getSectionIndexFromCategories = (categories: FoodCategory | FoodCategory[]) => {
  const selectedCategories = Array.isArray(categories) ? categories : [categories];

  if (selectedCategories.some(category => category === 'animal' || category === 'legume')) {
    return 2;
  }

  if (selectedCategories.includes('cereal')) {
    return 1;
  }

  return 0;
};

type PhaserSceneKey = 'Nivel1Scene' | 'Nivel2Scene' | 'Nivel3Scene';

function App() {
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const currentSection = tutorialSections[currentSectionIndex];

  const startPhaserScene = useCallback((sceneKey: PhaserSceneKey) => {
    setShowTutorialUI(false);

    const game = window.__phaserGame;
    if (!game) return;

    game.input.enabled = true;
    game.scene.stop('TutorialScene');
    game.scene.start(sceneKey);
  }, []);

  const startNivel1 = useCallback(() => {
    startPhaserScene('Nivel1Scene');
  }, [startPhaserScene]);

  const startNivel2 = useCallback(() => {
    startPhaserScene('Nivel2Scene');
  }, [startPhaserScene]);

  const startNivel3 = useCallback(() => {
    startPhaserScene('Nivel3Scene');
  }, [startPhaserScene]);

  const handlePreviousSection = () => {
    setCurrentSectionIndex(index => Math.max(0, index - 1));
  };

  const handleNextSection = () => {
    setCurrentSectionIndex(index => Math.min(tutorialSections.length - 1, index + 1));
  };

  useEffect(() => {
    window.showTutorial = (categories: FoodCategory | FoodCategory[]) => {
      console.log("ShowTutorial llamado con categorías:", categories);
      const index = getSectionIndexFromCategories(categories); 
      console.log('section index: ',index )
      setCurrentSectionIndex(index);
      setShowTutorialUI(true);
    };

    window.goToNivel1 = startNivel1;
    window.goToNivel2 = startNivel2;
    window.goToNivel3 = startNivel3;
  }, [startNivel1, startNivel2, startNivel3]);

  useEffect(() => {
    const game = window.__phaserGame;
    if (!game) return;

    game.input.enabled = !showTutorialUI;
  }, [showTutorialUI]);

  return (
    <>
      <HomePage />
      {showTutorialUI && (
        <div
          className="tutorial-overlay"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onPointerMove={event => event.stopPropagation()}
          onPointerUp={event => event.stopPropagation()}
        >
          <TutorialPage
            categories={currentSection.categories}
            title={currentSection.title}
            currentSectionIndex={currentSectionIndex}
            totalSections={tutorialSections.length}
            onPreviousSection={handlePreviousSection}
            onNextSection={handleNextSection}
            onFinishTutorial={startNivel1}
          />
        </div>
      )}

      <style>{`
        .tutorial-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          pointer-events: auto;
        }
      `}</style>
    </>
  );
}

export default App;
