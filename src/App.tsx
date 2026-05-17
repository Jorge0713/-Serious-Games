import { useState, useEffect } from 'react';
import HomePage from "./ui/pages/HomePage";
import { TutorialPage } from "./ui/components/tutorial";

function App() {
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | string[] | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');

  const tutorialTitles: Record<string, string> = {
    tutorial: "Grupo 1: Frutas y Verduras",
    cereal: "Grupo 2: Cereales y Tubérculos",
    legume: "Grupo 3: Leguminosas",
    animal: "Grupo 4: Origen Animal",
    home: ""
  };

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
    setCurrentPage('home');
    
    // Si queremos que el plato se restaure en el juego de Phaser:
    const game: any = (window as any).__phaserGame;
    if (game) {
      const scene = game.scene.getScene('TutorialScene');
      if (scene && typeof scene.restorePlate === 'function') {
        scene.restorePlate();
      }
    }
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
        setCurrentPage('cereal');
      } else if (currentIndex < sequence.length - 1) {
        // avanzar al siguiente
        const nextCat = sequence[currentIndex + 1];
        setSelectedCategory(nextCat);
        setCurrentPage(Array.isArray(nextCat) ? 'tutorial' : nextCat);
      } else {
        // Última sección: "animal" → cerrar overlay e ir al Nivel 1
        setShowTutorialUI(false);
        setSelectedCategory(null);
        setCurrentPage('home');
        
        const game: any = (window as any).__phaserGame;
        if (game) {
          const scene = game.scene.getScene('TutorialScene');
          if (scene && typeof scene.restorePlate === 'function') {
            scene.restorePlate();
          }
          console.log('Iniciando Nivel1Scene...');
          game.scene.start('Nivel1Scene');
        }
      }
    } else {
      setShowTutorialUI(false);
      setSelectedCategory(null);
      setCurrentPage('home');
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Phaser game runs in the background */}
      <HomePage />

      {/* React UI overlay renders on top when needed */}
      {showTutorialUI && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}>
          <TutorialPage
            selectedCategory={selectedCategory}
            title={currentTitle}
            onBackToMenu={handleBackToMenu}
            onNextTutorial={handleNextTutorial}
          />
        </div>
      )}
    </div>
  );
}

export default App;