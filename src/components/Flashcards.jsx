import React, { useState, useEffect, useRef } from 'react';
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

  // New feedback and modal states
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);
  const [feedbackCountdown, setFeedbackCountdown] = useState(10);
  const [feedbackMaxDuration, setFeedbackMaxDuration] = useState(10);
  const [isFeedbackPaused, setIsFeedbackPaused] = useState(false);
  const [activeTopicInfo, setActiveTopicInfo] = useState(null);

  // Refs for timers
  const feedbackIntervalRef = useRef(null);
  const isFeedbackPausedRef = useRef(false);

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

    // Clear feedback states
    setIsFeedbackActive(false);
    setIsInteractionDisabled(false);
    setFeedbackCountdown(10);
    setFeedbackMaxDuration(10);
    setIsFeedbackPaused(false);
    isFeedbackPausedRef.current = false;
    clearFeedbackTimers();
  };

  const clearFeedbackTimers = () => {
    if (feedbackIntervalRef.current) {
      clearInterval(feedbackIntervalRef.current);
      feedbackIntervalRef.current = null;
    }
  };

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      clearFeedbackTimers();
    };
  }, []);

  const getTopicInfo = (topicId) => {
    if (!topics) return null;
    return topics.find(t => t.id === Number(topicId)) || null;
  };

  const handleShowTopicInfo = (topicId) => {
    const info = getTopicInfo(topicId || cards[currentIndex]?.topicId);
    if (info) {
      setActiveTopicInfo(info);
    }
  };

  const handleFlip = () => {
    if (isInteractionDisabled) return;
    setIsFlipped(!isFlipped);
  };

  const calculateDynamicTime = (frontText, backText, topicId) => {
    const topicInfo = getTopicInfo(topicId);
    const topicText = topicInfo
      ? `${topicInfo.title} ${topicInfo.subtitle} ${topicInfo.description}`
      : '';
    const fullText = `${frontText} ${backText} ${topicText}`;
    const words = fullText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    // Average 3 words per second (200 wpm)
    const calculatedSeconds = Math.ceil(wordCount / 3);
    // Minimum 10 seconds
    return Math.max(10, calculatedSeconds);
  };

  const handleRateCard = (difficulty) => {
    if (isInteractionDisabled) return;

    setRatings(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1
    }));

    setSessionReviewed(prev => prev + 1);

    // Slide to next card after a brief moment
    setIsFlipped(false);
    setIsInteractionDisabled(true);

    setTimeout(() => {
      setIsInteractionDisabled(false);
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setDeckFinished(true);
      }
    }, 200);
  };

  const finishFeedbackAndAdvance = () => {
    clearFeedbackTimers();
    setIsFeedbackActive(false);
    setIsInteractionDisabled(false);
    setIsFlipped(false);
    setIsFeedbackPaused(false);
    isFeedbackPausedRef.current = false;

    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setDeckFinished(true);
      }
    }, 200);
  };

  const handleCorrectRate = () => {
    if (isInteractionDisabled) return;

    setRatings(prev => ({
      ...prev,
      easy: prev.easy + 1
    }));
    setSessionReviewed(prev => prev + 1);

    const currentCard = cards[currentIndex];
    const duration = calculateDynamicTime(
      currentCard?.front || '',
      currentCard?.back || '',
      currentCard?.topicId
    );

    setFeedbackMaxDuration(duration);
    setFeedbackCountdown(duration);
    setIsFeedbackActive(true);
    setIsInteractionDisabled(true);
    setIsFeedbackPaused(false);
    isFeedbackPausedRef.current = false;

    clearFeedbackTimers();

    feedbackIntervalRef.current = setInterval(() => {
      if (isFeedbackPausedRef.current) return;

      setFeedbackCountdown(prev => {
        if (prev <= 1) {
          finishFeedbackAndAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSkipFeedback = (e) => {
    if (e) e.stopPropagation();
    if (!isFeedbackActive) return;
    finishFeedbackAndAdvance();
  };

  const handleMouseEnterFeedback = () => {
    if (!isFeedbackActive) return;
    setIsFeedbackPaused(true);
    isFeedbackPausedRef.current = true;
  };

  const handleMouseLeaveFeedback = () => {
    if (!isFeedbackActive) return;
    setIsFeedbackPaused(false);
    isFeedbackPausedRef.current = false;
  };

  const handleRestart = () => {
    setDeckStarted(false);
    setDeckFinished(false);
    clearFeedbackTimers();
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

          {/* Flip card box / Feedback card */}
          <div
            className={`flashcard-3d ${isFeedbackActive ? 'feedback-active' : isFlipped ? 'flipped' : ''}`}
            onClick={() => {
              if (isFeedbackActive) {
                handleSkipFeedback();
              } else {
                handleFlip();
              }
            }}
            style={{
              cursor: 'pointer',
              pointerEvents: isInteractionDisabled && !isFeedbackActive ? 'none' : 'auto'
            }}
          >
            <div className={`card-inner ${isFeedbackActive ? 'no-transform' : ''}`} style={isFeedbackActive ? { transform: 'none' } : {}}>

              {isFeedbackActive ? (
                /* Explanation Feedback view */
                <div
                  className="card-face card-feedback"
                  onMouseEnter={handleMouseEnterFeedback}
                  onMouseLeave={handleMouseLeaveFeedback}
                  style={{
                    transform: 'none',
                    backfaceVisibility: 'visible',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <div className="card-header-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Retroalimentación</span>
                    <span className="badge badge-emerald">Correcto</span>
                  </div>

                  <div
                    className="card-body-text feedback-scrollable"
                    style={{
                      flexGrow: 1,
                      overflowY: 'auto',
                      margin: '12px 0',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '100%',
                      paddingRight: '4px'
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--text-dark)', textTransform: 'uppercase', margin: '0 0 2px 0', fontWeight: '800' }}>Pregunta / Concepto:</h4>
                      <p style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: 'var(--text-main)', lineHeight: '1.3' }}>{cards[currentIndex]?.front}</p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', margin: '0 0 2px 0', fontWeight: '800' }}>Respuesta Correcta:</h4>
                      <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-main)', background: 'rgba(16, 185, 129, 0.04)', padding: '6px 10px', borderRadius: '8px', borderLeft: '3px solid var(--accent-emerald)', lineHeight: '1.3' }}>{cards[currentIndex]?.back}</p>
                    </div>

                    {getTopicInfo(cards[currentIndex]?.topicId) && (
                      <div className="explanation-box" style={{ background: 'rgba(59, 130, 246, 0.04)', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid var(--primary-light)' }}>
                        <h4 style={{ fontSize: '0.7rem', color: 'var(--primary-light)', textTransform: 'uppercase', margin: '0 0 4px 0', fontWeight: '800' }}>Detalles del Tema:</h4>
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px', lineHeight: '1.2' }}>
                          Tema {cards[currentIndex]?.topicId}: {getTopicInfo(cards[currentIndex]?.topicId).title}
                        </strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '4px', lineHeight: '1.2' }}>
                          {getTopicInfo(cards[currentIndex]?.topicId).subtitle}
                        </span>
                        <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)', lineHeight: '1.35' }}>
                          {getTopicInfo(cards[currentIndex]?.topicId).description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="card-footer-timer" style={{ marginTop: 'auto', width: '100%', flexShrink: 0 }}>
                    <div className="timer-progress-track" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div
                        className="timer-progress-fill"
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                          width: `${(feedbackCountdown / feedbackMaxDuration) * 100}%`,
                          transition: isFeedbackPaused ? 'none' : 'width 1s linear'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      {isFeedbackPaused ? (
                        <span style={{ color: 'var(--secondary-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '750' }}>
                          <span className="paused-pulse-dot" style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--secondary)', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                          <span>Lectura pausada ({feedbackCountdown}s)</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Siguiente tarjeta en <strong>{feedbackCountdown}</strong>s...</span>
                      )}
                      <span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>Toca aquí para omitir ⚡</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Front side */}
                  <div className="card-face card-front">
                    <div className="card-header-label">
                      <span>PREGUNTA / CONCEPTO</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleShowTopicInfo(cards[currentIndex].topicId); }}
                        className="badge badge-blue"
                        title="Ver detalles del tema"
                        style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-light)', fontWeight: 'bold' }}
                      >
                        Tema {cards[currentIndex].topicId} ℹ️
                      </button>
                    </div>
                    <div className="card-body-text">
                      <h3>{cards[currentIndex].front}</h3>
                    </div>
                    <div className="card-footer-tip">
                      <RefreshCw size={16} />
                      <span>Haz clic para ver la respuesta</span>
                    </div>
                  </div>

                  {/* Back side */}
                  <div className="card-face card-back">
                    <div className="card-header-label">
                      <span>RESPUESTA / DEFINICIÓN</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleShowTopicInfo(cards[currentIndex].topicId); }}
                        className="badge id-badge"
                        style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                      >
                        Tema {cards[currentIndex].topicId}
                      </button>
                    </div>
                    <div className="card-body-text">
                      <p>{cards[currentIndex].back}</p>
                    </div>
                    <div className="card-footer-tip">
                      <RefreshCw size={16} />
                      <span>Haz clic para volver a la pregunta</span>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Rating controls (only available when flipped and feedback is inactive) */}
          <div className={`card-rating-controls ${isFlipped && !isFeedbackActive ? 'visible' : ''}`}>
            <p className="text-muted">¿Qué tal recordabas este concepto?</p>
            <div className="rating-buttons" style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                disabled={isInteractionDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowTopicInfo(cards[currentIndex].topicId);
                }}
                className="rate-btn"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                Tema
              </button>
              <button
                type="button"
                disabled={isInteractionDisabled}
                onClick={(e) => { e.stopPropagation(); handleRateCard('hard'); }}
                className="rate-btn rate-hard"
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                Incorrecto
              </button>
              <button
                type="button"
                disabled={isInteractionDisabled}
                onClick={(e) => { e.stopPropagation(); handleCorrectRate(); }}
                className="rate-btn rate-easy"
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                Correcto
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* Topic Information Modal Dialog */}
      {
        activeTopicInfo && (
          <div className="login-screen-overlay" style={{ zIndex: 9999 }} onClick={() => setActiveTopicInfo(null)}>
            <div className="login-card glass-panel fade-in" style={{ textAlign: 'left', maxWidth: '480px', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
              <div className="login-logo-section" style={{ alignItems: 'flex-start', textAlign: 'left', gap: '6px' }}>
                <span className="badge badge-blue">Módulo {activeTopicInfo.block}</span>
                <h2 style={{ fontSize: '1.4rem', WebkitTextFillColor: 'initial', color: 'var(--text-main)', marginTop: '6px', lineHeight: '1.25', fontWeight: '800', background: 'none' }}>
                  Tema {activeTopicInfo.id}: {activeTopicInfo.title}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '4px 0 12px 0' }}>
                  {activeTopicInfo.subtitle}
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-light)', marginBottom: '4px', fontWeight: '800' }}>Área de Estudio / Descripción</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
                    {activeTopicInfo.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTopicInfo(null)}
                className="login-submit-btn glow-btn"
                style={{ marginTop: '16px', width: '100%' }}
              >
                <span>Volver al Repaso</span>
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}
