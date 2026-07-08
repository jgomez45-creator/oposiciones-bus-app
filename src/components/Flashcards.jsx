import React, { useState, useEffect } from 'react';
import { Layers, HelpCircle, ArrowRight, RotateCcw, Check, RefreshCw } from 'lucide-react';
import flashcardsData from '../data/flashcards.json';

export default function Flashcards({ topics, activeTopicId }) {
  const [selectedTopicId, setSelectedTopicId] = useState(activeTopicId || 'all');
  const [deckStarted, setDeckStarted] = useState(false);
  const [cards, setCards] = useState([]);
  
  // Card states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [ratings, setRatings] = useState({ easy: 0, medium: 0, hard: 0 });
  const [deckFinished, setDeckFinished] = useState(false);

  const availableTopicIds = Object.keys(flashcardsData);

  useEffect(() => {
    if (activeTopicId && availableTopicIds.includes(activeTopicId.toString())) {
      setSelectedTopicId(activeTopicId.toString());
    } else {
      setSelectedTopicId('all');
    }
  }, [activeTopicId]);

  const handleStartDeck = () => {
    let cardPool = [];
    
    if (selectedTopicId === 'all') {
      availableTopicIds.forEach(topicId => {
        const topicCards = flashcardsData[topicId].map(c => ({
          ...c,
          topicId: Number(topicId)
        }));
        cardPool = [...cardPool, ...topicCards];
      });
      // Shuffle
      cardPool.sort(() => 0.5 - Math.random());
      cardPool = cardPool.slice(0, 15); // Limit general deck to 15 cards
    } else {
      const topicCards = flashcardsData[selectedTopicId] || [];
      cardPool = topicCards.map(c => ({
        ...c,
        topicId: Number(selectedTopicId)
      }));
      // Shuffle
      cardPool = [...cardPool].sort(() => 0.5 - Math.random());
    }

    if (cardPool.length === 0) {
      alert('Aún no hay tarjetas de memoria disponibles para este tema.');
      return;
    }

    setCards(cardPool);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionReviewed(0);
    setRatings({ easy: 0, medium: 0, hard: 0 });
    setDeckFinished(false);
    setDeckStarted(true);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = (difficulty) => {
    setRatings(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1
    }));
    
    setSessionReviewed(prev => prev + 1);

    // Slide to next card after a brief moment
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setDeckFinished(true);
      }
    }, 200);
  };

  const handleRestart = () => {
    setDeckStarted(false);
    setDeckFinished(false);
  };

  return (
    <div className="flashcards-view fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="text-gradient">Tarjetas de Memorización</h1>
          <p className="text-muted">Utiliza la técnica de repaso activo para retener las leyes y normativas de la BUS.</p>
        </div>
      </header>

      {!deckStarted ? (
        /* Configuration Panel */
        <div className="quiz-config-card glass-panel">
          <div className="config-icon-header">
            <Layers size={48} className="text-gradient-gold" />
            <h3>Repasar con Flashcards</h3>
            <p className="text-muted">Elige un mazo de estudio específico o repasa tarjetas combinadas.</p>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>Selecciona el mazo:</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="config-select"
              >
                <option value="all">Mazo Combinado (15 tarjetas aleatorias)</option>
                {topics.map(t => {
                  const hasCards = availableTopicIds.includes(t.id.toString());
                  return (
                    <option 
                      key={t.id} 
                      value={t.id.toString()} 
                      disabled={!hasCards}
                    >
                      Tema {t.id}: {t.title} {!hasCards ? '(Sin tarjetas)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <button onClick={handleStartDeck} className="glow-btn start-quiz-btn">
              Comenzar Repaso
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : deckFinished ? (
        /* Summary statistics of review session */
        <div className="quiz-result-card glass-panel scale-in">
          <Layers size={64} className="text-gradient-gold result-icon" />
          <h2>Sesión Finalizada</h2>
          <p className="text-muted">Has repasado {cards.length} conceptos clave en esta sesión.</p>
          
          <div className="flashcards-summary-stats">
            <div className="card-rating-stat easy">
              <span className="stat-num">{ratings.easy}</span>
              <span className="stat-lbl">Fáciles</span>
            </div>
            <div className="card-rating-stat medium">
              <span className="stat-num">{ratings.medium}</span>
              <span className="stat-lbl">Medios</span>
            </div>
            <div className="card-rating-stat hard">
              <span className="stat-num">{ratings.hard}</span>
              <span className="stat-lbl">Difíciles</span>
            </div>
          </div>

          <div className="result-actions">
            <button onClick={handleStartDeck} className="glow-btn">
              <RotateCcw size={16} />
              Volver a Repasar
            </button>
            <button onClick={handleRestart} className="glow-btn-secondary">
              Cambiar de Mazo
            </button>
          </div>
        </div>
      ) : (
        /* Active Deck view */
        <div className="flashcard-deck-container scale-in">
          <header className="deck-progress-bar">
            <span>Tarjeta <strong>{currentIndex + 1}</strong> de {cards.length}</span>
            <div className="deck-progress-track">
              <div 
                className="deck-progress-fill" 
                style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
              />
            </div>
          </header>

          {/* Flip card box */}
          <div className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <div className="card-inner">
              
              {/* Front side */}
              <div className="card-face card-front">
                <div className="card-header-label">
                  <span>PREGUNTA / CONCEPTO</span>
                  <span className="badge badge-blue">Tema {cards[currentIndex].topicId}</span>
                </div>
                <div className="card-body-text">
                  <h3>{cards[currentIndex].front}</h3>
                </div>
                <div className="card-footer-tip">
                  <RefreshCw size={14} /> Haz clic para ver la respuesta
                </div>
              </div>

              {/* Back side */}
              <div className="card-face card-back">
                <div className="card-header-label">
                  <span>RESPUESTA / DEFINICIÓN</span>
                  <span className="badge badge-emerald">Correcto</span>
                </div>
                <div className="card-body-text">
                  <p>{cards[currentIndex].back}</p>
                </div>
                <div className="card-footer-tip">
                  Haz clic para volver a la pregunta
                </div>
              </div>

            </div>
          </div>

          {/* Rating controls (only available when flipped) */}
          <div className={`card-rating-controls ${isFlipped ? 'visible' : ''}`}>
            <p className="text-muted">¿Qué tal recordabas este concepto?</p>
            <div className="rating-buttons">
              <button 
                onClick={(e) => { e.stopPropagation(); handleRateCard('hard'); }} 
                className="rate-btn rate-hard"
              >
                Mal (Difícil)
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRateCard('medium'); }} 
                className="rate-btn rate-medium"
              >
                Regular (Medio)
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRateCard('easy'); }} 
                className="rate-btn rate-easy"
              >
                Bien (Fácil)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
