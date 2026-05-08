import { useState, useEffect } from 'react';
import HomePage from "./ui/pages/HomePage";
import { TutorialPage } from "./ui/components/tutorial";

type Page = 'home' | 'tutorial' | 'cereal' | 'legume' | 'animal';

const tutorialOrder: Page[] = ['tutorial', 'cereal', 'legume', 'animal'];

const tutorialTitles: Record<Page, string> = {
  'home': 'Menú Principal',
  'tutorial': 'Grupo 1: Frutas y Verduras',
  'cereal': 'Grupo 2: Cereales',
  'legume': 'Grupo 3: Leguminosas',
  'animal': 'Grupo 4: Origen Animal'
};

const categoryFromPage: Record<Page, string | string[] | null> = {
  'home': null,
  'tutorial': ['vegetable', 'fruit'],
  'cereal': 'cereal',
  'legume': 'legume',
  'animal': 'animal'
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showTutorialUI, setShowTutorialUI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | string[] | null>(null);

  const handleBackToMenu = () => {
    setShowTutorialUI(false);
    setSelectedCategory(null);
    setCurrentPage('home');
  };

  const getNextPage = (current: Page): Page => {
    const idx = tutorialOrder.indexOf(current);
    if (idx === -1) return 'tutorial';
    return tutorialOrder[(idx + 1) % tutorialOrder.length];
  };

  const handleNextTutorial = () => {
    const nextPage = getNextPage(currentPage);
    setCurrentPage(nextPage);
    setSelectedCategory(categoryFromPage[nextPage]);
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
  }, []);

  const currentTitle = tutorialTitles[currentPage];

  if (showTutorialUI) {
    return (
      <TutorialPage
        selectedCategory={selectedCategory}
        title={currentTitle}
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  if (currentPage === 'tutorial') {
    return (
      <TutorialPage
        title={currentTitle}
        onBackToMenu={handleBackToMenu}
        onNextTutorial={handleNextTutorial}
      />
    );
  }

  return <HomePage />;
}

export default App;