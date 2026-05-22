import React from 'react';
import type { NutritionConcept } from './types';

interface ConceptosMainProps {
    concept: NutritionConcept;
    isFirst: boolean;
    isLast: boolean;
    currentIndex: number;
    totalConcepts: number;
    onPrev: () => void;
    onNext: () => void;
}

export const ConceptosMain: React.FC<ConceptosMainProps> = ({ 
    concept, 
    isFirst, 
    isLast, 
    currentIndex, 
    totalConcepts, 
    onPrev, 
    onNext 
}) => {
    return (
        <main className="conceptos-main">
            <div className="main-header">
                <div className="main-icon-circle">{concept.icon}</div>
                <div className="main-titles">
                    <h2>{concept.title}</h2>
                    <h3>{concept.subtitle}</h3>
                </div>
            </div>

            <div className="main-info-box">
                <div className="info-accent"></div>
                <div className="info-content">
                    <h4>¿QUÉ ES?</h4>
                    <p>{concept.body}</p>
                    <p className="callout">{concept.callout}</p>
                </div>
            </div>

            <h4 className="examples-title">{concept.examplesTitle.toUpperCase()}</h4>
            <div className="examples-grid">
                {concept.examples.map((ex, idx) => (
                    <div key={idx} className="example-card">
                        <div className="example-img-wrapper">
                            <img src={ex.path} alt={ex.label} />
                        </div>
                        <div className="example-label">{ex.label}</div>
                        <div className="example-note">{ex.note}</div>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="conceptos-nav">
                <button 
                    className="nav-btn prev" 
                    disabled={isFirst} 
                    onClick={onPrev}
                >
                    {'< Anterior'}
                </button>
                
                <div className="nav-dots">
                    {Array.from({ length: totalConcepts }).map((_, idx) => (
                        <div key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} />
                    ))}
                </div>

                <button className="nav-btn next" onClick={onNext}>
                    {isLast ? 'Ir al crucigrama >' : 'Siguiente >'}
                </button>
            </div>
        </main>
    );
};
