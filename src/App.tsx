import { useState, useEffect } from 'react';
import HomePage from "./ui/pages/HomePage";
import { TutorialPage } from "./ui/components/tutorial";

type Page = 'home' | 'tutorial' | 'cereal' | 'legume';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleBackToMenu = () => setCurrentPage('home');
  const handleNextTutorial = () => setCurrentPage('cereal');
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | string[] | null>(null);

  useEffect(() => {
    (window as any).showTutorial = (categories: string | string[]) => {
      setShowTutorialUI(false);
      setSelectedCategory(categories);
      setShowTutorialUI(true);
    };
  }, []);

  if (showTutorialUI) {
    return (
      <TutorialPage
        selectedCategory={selectedCategory}
        onBackToMenu={() => {
          setShowTutorialUI(false);
          setSelectedCategory(null);
        }}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  if (currentPage === 'tutorial') {
    return (
      <TutorialPage
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  return <HomePage />;
}

export default App;