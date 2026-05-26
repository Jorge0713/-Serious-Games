import { useCallback, useEffect, useState } from 'react';
import type * as Phaser from 'phaser';
import HomePage from './ui/pages/HomePage';
import { TutorialPage } from './ui/components/tutorial';
import { PreTutorialConceptos } from './ui/components/conceptos/PreTutorialConceptos';
import type { FoodCategory } from './data/nutritionalInfo';
import { FlowProgressService } from './services/FlowProgressService';

interface TutorialSection {
  id: string;
  title: string;
  categories: FoodCategory[];
}

interface TutorialRouteOptions {
  title?: string;
  nextScene?: string;
  finishLabel?: string;
}

declare global {
  interface Window {
    __phaserGame?: Phaser.Game;
    showTutorial?: (
      categories?: FoodCategory | FoodCategory[],
      options?: TutorialRouteOptions
    ) => void;
    goToNivel1?: () => void;
    goToNivel2?: () => void;
    goToNivel3?: () => void;
    showPreTutorialConceptos?: (data?: any) => void;
  }
}

const defaultTutorialSections: TutorialSection[] = [
  {
    id: 'frutasVerduras',
    title: 'Frutas y verduras',
    categories: ['vegetable', 'fruit'],
  },
  {
    id: 'cereales',
    title: 'Cereales',
    categories: ['cereal'],
  },
  {
    id: 'origenAnimalLeguminosas',
    title: 'Origen animal y leguminosas',
    categories: ['animal', 'legume'],
  },
];

const normalizeCategories = (
  categories: FoodCategory | FoodCategory[] = ['vegetable', 'fruit']
): FoodCategory[] => (Array.isArray(categories) ? categories : [categories]);

const getDefaultTitle = (categories: FoodCategory[]): string => {
  if (categories.includes('vegetable') && categories.includes('fruit')) {
    return 'Verduras y frutas';
  }

  if (categories.includes('legume') && categories.includes('cereal')) {
    return 'Leguminosas y cereales';
  }

  if (categories.includes('animal') && categories.includes('legume')) {
    return 'Origen animal y leguminosas';
  }

  if (categories.includes('animal')) {
    return 'Origen animal';
  }

  if (categories.includes('cereal')) {
    return 'Cereales';
  }

  if (categories.includes('legume')) {
    return 'Leguminosas';
  }

  return 'Frutas y verduras';
};

const getDefaultNextScene = (categories: FoodCategory[]): string => {
  if (categories.includes('animal')) {
    return 'Nivel3Scene';
  }

  if (categories.includes('legume') || categories.includes('cereal')) {
    return 'Nivel2Scene';
  }

  return 'Nivel1Scene';
};

const getDefaultFinishLabel = (sceneKey: string): string => {
  if (sceneKey === 'Nivel2Scene') return 'Ir al Nivel 2';
  if (sceneKey === 'Nivel3Scene') return 'Ir al Nivel 3';

  return 'Ir al Nivel 1';
};

function App() {
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [showConceptosUI, setShowConceptosUI] = useState(false);
  const [conceptosNextScene, setConceptosNextScene] = useState('CrucigramaSaludableScene');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeTutorialSections, setActiveTutorialSections] = useState<TutorialSection[]>(defaultTutorialSections);
  const [tutorialNextScene, setTutorialNextScene] = useState('Nivel1Scene');
  const [tutorialFinishLabel, setTutorialFinishLabel] = useState(getDefaultFinishLabel('Nivel1Scene'));

  const currentSection = activeTutorialSections[currentSectionIndex] ?? activeTutorialSections[0] ?? defaultTutorialSections[0];

  const startPhaserScene = useCallback((sceneKey: string) => {
    setShowTutorialUI(false);
    setShowConceptosUI(false);

    const game = window.__phaserGame;
    if (!game) {
      console.warn('No phaser game instance found.');
      return;
    }

    game.input.enabled = true;
    game.scene.stop('TutorialScene');
    game.scene.stop('LevelSelectScene');
    game.scene.stop('PreTutorialConceptosScene');
    
    setTimeout(() => {
      game.scene.start(sceneKey);
      game.scene.bringToTop(sceneKey);
      game.scene.resume(sceneKey);
    }, 50);
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

  const finishTutorial = useCallback(() => {
    startPhaserScene(tutorialNextScene);
  }, [startPhaserScene, tutorialNextScene]);

  const handleNextSection = () => {
    setCurrentSectionIndex(index => Math.min(activeTutorialSections.length - 1, index + 1));
  };

  const handleBackToLevelSelect = useCallback(() => {
    startPhaserScene('LevelSelectScene');
  }, [startPhaserScene]);

  useEffect(() => {
    window.showTutorial = (
      categories: FoodCategory | FoodCategory[] = ['vegetable', 'fruit'],
      options: TutorialRouteOptions = {}
    ) => {
      const selectedCategories = normalizeCategories(categories);
      const nextScene = options.nextScene ?? getDefaultNextScene(selectedCategories);
      const section: TutorialSection = {
        id: selectedCategories.join('_'),
        title: options.title ?? getDefaultTitle(selectedCategories),
        categories: selectedCategories,
      };

      setActiveTutorialSections([section]);
      setCurrentSectionIndex(0);
      setTutorialNextScene(nextScene);
      setTutorialFinishLabel(options.finishLabel ?? getDefaultFinishLabel(nextScene));
      setShowTutorialUI(true);
    };

    window.goToNivel1 = startNivel1;
    window.goToNivel2 = startNivel2;
    window.goToNivel3 = startNivel3;
    window.showPreTutorialConceptos = (data?: any) => {
      if (data && data.nextLevel) {
        setConceptosNextScene(data.nextLevel);
      } else {
        setConceptosNextScene('CrucigramaSaludableScene');
      }
      setShowConceptosUI(true);
    };
  }, [startNivel1, startNivel2, startNivel3]);

  useEffect(() => {
    const game = window.__phaserGame;
    if (!game) return;

    game.input.enabled = !showTutorialUI && !showConceptosUI;
  }, [showTutorialUI, showConceptosUI]);

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
            totalSections={activeTutorialSections.length}
            finishLabel={tutorialFinishLabel}
            onBackToLevelSelect={handleBackToLevelSelect}
            onNextSection={handleNextSection}
            onFinishTutorial={finishTutorial}
          />
        </div>
      )}

      {showConceptosUI && (
        <div
          className="tutorial-overlay"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onPointerMove={event => event.stopPropagation()}
          onPointerUp={event => event.stopPropagation()}
        >
          <PreTutorialConceptos
            onBackToMenu={() => startPhaserScene('MainMenu')}
            onFinish={() => {
              FlowProgressService.markCompleted('preTutorialConceptosCompleted');
              startPhaserScene(conceptosNextScene);
            }}
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
