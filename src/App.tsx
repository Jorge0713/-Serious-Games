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
            console.log('Iniciando Nivel3Scene...');
            game.scene.start('Nivel3Scene');
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* El juego de Phaser siempre está montado debajo */}
      <HomePage />

      {/* Overlay de React encima del canvas cuando el tutorial está activo */}
      {showTutorialUI && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 100,
        }}>
          <TutorialPage
            selectedCategory={selectedCategory}
            onBackToMenu={handleBackToMenu}
            onNextTutorial={handleNextTutorial}
          />
        </div>
      )}
    </div>
  );
}

export default App;