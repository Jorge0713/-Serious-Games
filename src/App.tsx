import { useState, useEffect } from 'react';
import HomePage from "./ui/pages/HomePage";
import { TutorialPage } from "./ui/components/tutorial";

type Page = 'home' | 'tutorial' | 'cereal' | 'legume' | 'animal';

const tutorialOrder: Page[] = ['tutorial', 'cereal', 'legume', 'animal'];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | string[] | null>(null);
  const [showSpecialMenu, setShowSpecialMenu] = useState(false);

  const handleBackToMenu = () => {
    setShowTutorialUI(false);
    setSelectedCategory(null);
    setCurrentPage('home');
    setShowSpecialMenu(false);
  };

  const getNextPage = (current: Page): Page => {
    const idx = tutorialOrder.indexOf(current);
    if (idx === -1) return 'tutorial';
    return tutorialOrder[(idx + 1) % tutorialOrder.length];
  };

  const handleNextTutorial = () => {
    const nextPage = getNextPage(currentPage);
    setCurrentPage(nextPage);
    
    if (nextPage === 'cereal') {
      setSelectedCategory('cereal');
      setShowTutorialUI(true);
    } else if (nextPage === 'legume') {
      setSelectedCategory('legume');
      setShowTutorialUI(true);
    } else if (nextPage === 'animal') {
      setSelectedCategory('animal');
      setShowTutorialUI(true);
    } else {
      setSelectedCategory(['vegetable', 'fruit']);
      setShowTutorialUI(true);
    }
  };

  useEffect(() => {
    (window as any).showTutorial = (categories: string | string[]) => {
      setShowTutorialUI(false);
      if (Array.isArray(categories)) {
        setSelectedCategory(categories);
      } else if (categories === 'fruit' || categories === 'vegetable') {
        setSelectedCategory(['vegetable', 'fruit']);
      } else {
        setSelectedCategory(categories);
      }
      setShowTutorialUI(true);
    };

    const checkSpecialMenu = setInterval(() => {
      if ((window as any).showSpecialMenu) {
        setShowSpecialMenu(true);
        (window as any).showSpecialMenu = false;
      }
    }, 100);

    return () => clearInterval(checkSpecialMenu);
  }, []);

  if (showSpecialMenu) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/assets/Fondo_Cocina.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <img 
          src="/white_plate.png" 
          alt="White Plate" 
          style={{
            width: '50%',
            height: 'auto',
            maxHeight: '50vh',
            objectFit: 'contain'
          }}
        />
        <button
          onClick={handleBackToMenu}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '15px 30px',
            fontSize: '18px',
            background: '#c0392b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Volver al menú
        </button>
      </div>
    );
  }

  if (showTutorialUI) {
    return (
      <TutorialPage
        selectedCategory={selectedCategory}
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  if (currentPage === 'legume') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #1a3d1a 0%, #2d5a27 100%)',
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1>Próximo: Tutorial de Leguminosas</h1>
        <p>Esta sección está en desarrollo...</p>
        <button
          onClick={handleBackToMenu}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: '#c0392b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Volver al menú
        </button>
      </div>
    );
  }

  return <HomePage />;
}

export default App;