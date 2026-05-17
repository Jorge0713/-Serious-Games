import { useState, useEffect } from 'react';
import HomePage from "./ui/pages/HomePage";
import { TutorialPage } from "./ui/components/tutorial";

function App() {
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | string[] | null>(null);

  useEffect(() => {
    // Función que TutorialScene llama para abrir el overlay de React
    (window as any).showTutorial = (categories: string | string[]) => {
      setSelectedCategory(categories);
      setShowTutorialUI(true);
    };

    // Función que App usa para lanzar Nivel1Scene desde Phaser
    (window as any).startLevel1 = () => {
      const game: Phaser.Game | undefined = (window as any).__phaserGame;
      if (game) {
        game.scene.start('Nivel3Scene');
      } else {
        console.error('El juego de Phaser no está disponible.');
      }
    };
  }, []);

  const handleBackToMenu = () => {
    setShowTutorialUI(false);
    setSelectedCategory(null);
  };

  const handleNextTutorial = () => {
    const sequence: any[] = [
      ['vegetable', 'fruit'],
      ['fruit', 'vegetable'],
      'cereal',
      'legume',
      'animal',
    ];

    const currentIndex = sequence.findIndex(item =>
      JSON.stringify(item) === JSON.stringify(selectedCategory) || item === selectedCategory
    );

    if (currentIndex >= 0) {
      if (currentIndex === 0 || currentIndex === 1) {
        // frutas/verduras → cereal
        setSelectedCategory('cereal');
      } else if (currentIndex < sequence.length - 1) {
        // avanzar al siguiente
        setSelectedCategory(sequence[currentIndex + 1]);
      } else {
        // Última sección: "animal" → cerrar overlay e ir al Nivel 1
        setShowTutorialUI(false);
        setSelectedCategory(null);
        setTimeout(() => {
          const game: any = (window as any).__phaserGame;
          if (game) {
            console.log('Iniciando Nivel1Scene...');
            game.scene.start('Nivel1Scene');
          } else {
            console.error('Phaser no disponible.');
          }
        }, 100);
      }
    } else {
      setShowTutorialUI(false);
      setSelectedCategory(null);
    }
  };

  useEffect(() => {
    (window as any).showTutorial = (categories: string | string[]) => {
      setShowTutorialUI(false);
      if (Array.isArray(categories)) {
        setSelectedCategory(categories);
        if (categories.includes('vegetable') && categories.includes('fruit')) {
          setCurrentPage('tutorial');
        } else if (categories.includes('cereal')) {
          setCurrentPage('cereal');
        } else if (categories.includes('legume')) {
          setCurrentPage('legume');
        } else if (categories.includes('animal')) {
          setCurrentPage('animal');
        }
      } else if (categories === 'fruit' || categories === 'vegetable') {
        setSelectedCategory(['vegetable', 'fruit']);
        setCurrentPage('tutorial');
      } else {
        setSelectedCategory(categories);
        if (categories === 'cereal') setCurrentPage('cereal');
        else if (categories === 'legume') setCurrentPage('legume');
        else if (categories === 'animal') setCurrentPage('animal');
      }
      setShowTutorialUI(true);
    };

    (window as any).goToNivel2 = () => {
      setShowTutorialUI(false);
      setSelectedCategory(null);
      setCurrentPage('home');
    };
  }, []);

  const currentTitle = tutorialTitles[currentPage];

  if (showTutorialUI) {
    return (
      <TutorialPage
        selectedCategory={selectedCategory}
        title={currentTitle}
        isFirstTutorial={currentPage === 'tutorial'}
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  if (currentPage === 'tutorial') {
    return (
      <TutorialPage
        title={currentTitle}
        isFirstTutorial={true}
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  return <HomePage />;
}

export default App;