import React from 'react';
import type { NutritionConcept } from './types';

interface ConceptosSidebarProps {
    concepts: NutritionConcept[];
    currentIndex: number;
    onSelect: (index: number) => void;
}

export const ConceptosSidebar: React.FC<ConceptosSidebarProps> = ({ concepts, currentIndex, onSelect }) => {
    return (
        <aside className="conceptos-sidebar">
            <h2>Conceptos</h2>
            <hr />
            <ul className="conceptos-menu">
                {concepts.map((item, index) => {
                    const active = index === currentIndex;
                    return (
                        <li 
                            key={item.id} 
                            className={`conceptos-menu-item ${active ? 'active' : ''}`}
                            onClick={() => onSelect(index)}
                        >
                            <div className="menu-icon">{item.icon}</div>
                            <div className="menu-label">{item.menuLabel}</div>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};
