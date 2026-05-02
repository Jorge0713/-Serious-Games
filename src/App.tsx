import { useState } from 'react';
import HomePage from "./ui/pages/HomePage";
import { TutorialPage } from "./ui/components/tutorial";

type Page = 'home' | 'tutorial' | 'legumes';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleBackToMenu = () => setCurrentPage('home');
  const handleNextTutorial = () => setCurrentPage('legumes');

  if (currentPage === 'tutorial') {
    return (
      <TutorialPage
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  if (currentPage === 'legumes') {
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

  return <HomePage onShowTutorial={() => setCurrentPage('tutorial')} />;
}

export default App;