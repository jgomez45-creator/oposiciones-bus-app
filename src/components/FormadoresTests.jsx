import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Printer, 
  Play, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  FileQuestion,
  ChevronLeft,
  Info
} from 'lucide-react';
import estatutosBloque1 from '../data/baterias/estatutos_bloque1.json';
import estatutosBloque2 from '../data/baterias/estatutos_bloque2.json';
import convenio2026 from '../data/baterias/convenio_2026.json';
import igualdad2007 from '../data/baterias/igualdad_2007.json';

export default function FormadoresTests({ currentUser }) {
  // Available batteries
  const batteries = [
    {
      id: 'estatutos_1',
      title: 'Estatutos US - Bloque 1',
      subtitle: 'Títulos I y III de los Estatutos de la Universidad de Sevilla',
      questionsCount: estatutosBloque1.length,
      data: estatutosBloque1,
      color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo
      theme: 'Tema 17'
    },
    {
      id: 'estatutos_2',
      title: 'Estatutos US - Bloque 2',
      subtitle: 'Títulos I y III de los Estatutos de la Universidad de Sevilla',
      questionsCount: estatutosBloque2.length,
      data: estatutosBloque2,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // Purple
      theme: 'Tema 17'
    },
    {
      id: 'convenio',
      title: 'IV Convenio Colectivo',
      subtitle: 'Convenio del Personal Laboral de las Universidades de Andalucía',
      questionsCount: convenio2026.length,
      data: convenio2026,
      color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', // Pink
      theme: 'Tema 18'
    },
    {
      id: 'igualdad',
      title: 'Ley Orgánica de Igualdad',
      subtitle: 'Ley Orgánica 3/2007 para la igualdad efectiva de mujeres y hombres',
      questionsCount: igualdad2007.length,
      data: igualdad2007,
      color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', // Teal
      theme: 'Tema 19'
    }
  ];

  const [selectedBattery, setSelectedBattery] = useState(batteries[0]);
  const [testMode, setTestMode] = useState('interactive'); // 'interactive' | 'paper' | 'print'
  const [questionLimit, setQuestionLimit] = useState(50); // 10, 20, 50, 100, 'all'
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  
  // Interactive runner state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userSelections, setUserSelections] = useState([]); // tracks choices for summary

  // Paper simulation state
  const [paperAnswers, setPaperAnswers] = useState({}); // { qId: optionIndex }
  const [paperSubmitted, setPaperSubmitted] = useState(false);
  const [paperResults, setPaperResults] = useState({ correct: 0, incorrect: 0, blank: 0 });

  // Handle start test
  const startTest = () => {
    if (!selectedBattery) return;
    
    if (testMode === 'print' && (currentUser?.role === 'guest' || currentUser?.uid === 'guest_profile')) {
      alert('Esta opción no está activa en el modo invitado. Por favor, regístrate para poder descargar o imprimir las baterías de test de formadores en PDF.');
      return;
    }
    
    // Shuffle and slice questions based on limit
    let rawQuestions = [...selectedBattery.data];
    // Shuffle logic (Fisher-Yates)
    for (let i = rawQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawQuestions[i], rawQuestions[j]] = [rawQuestions[j], rawQuestions[i]];
    }

    const limit = questionLimit === 'all' ? rawQuestions.length : Number(questionLimit);
    const chosenQuestions = rawQuestions.slice(0, Math.min(limit, rawQuestions.length));
    
    setQuestions(chosenQuestions);
    setQuizStarted(true);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setUserSelections(new Array(chosenQuestions.length).fill(null));
    setPaperAnswers({});
    setPaperSubmitted(false);

    if (testMode === 'print') {
      // Set timer to trigger print view once rendered
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  // Interactive answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (answered) return;
    setSelectedAnswer(optionIndex);
  };

  // Interactive submit answer
  const submitAnswer = () => {
    if (selectedAnswer === null || answered) return;
    
    const correctIdx = questions[currentIdx].correctAnswer;
    const isCorrect = selectedAnswer === correctIdx;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Save selection
    const nextSelections = [...userSelections];
    nextSelections[currentIdx] = selectedAnswer;
    setUserSelections(nextSelections);
    
    setAnswered(true);
  };

  // Next question
  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  // Paper simulation answer select
  const handlePaperAnswer = (qId, optionIdx) => {
    if (paperSubmitted) return;
    setPaperAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  // Paper simulation submit
  const submitPaperExam = () => {
    let correct = 0;
    let incorrect = 0;
    let blank = 0;

    questions.forEach(q => {
      const userAns = paperAnswers[q.id];
      if (userAns === undefined) {
        blank++;
      } else if (userAns === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    setPaperResults({ correct, incorrect, blank });
    setPaperSubmitted(true);
  };

  // Reset or return to selector
  const resetTest = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setPaperSubmitted(false);
  };

  return (
    <div className="tab-container fade-in">
      {/* Test Setup Header */}
      {!quizStarted && (
        <div className="tab-header" style={{ marginBottom: '12px' }}>
          <div className="header-info">
            <h1 className="text-gradient-gold" style={{ fontSize: '1.5rem', margin: 0 }}>Material de Formadores</h1>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Baterías oficiales de cuestionarios teóricos y simulaciones proporcionadas por el Sindicato (CCOO).</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Split View: Selection & Options Panel */}
      {!quizStarted && (
        <div className="quiz-setup-split-view">
          
          {/* Left Column: Battery Cards Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
              1. Selecciona la batería de test
            </h3>
            
            <div className="battery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {batteries.map((b) => {
                const isSelected = selectedBattery?.id === b.id;
                return (
                  <div 
                    key={b.id}
                    className={`glass-panel card-hover ${isSelected ? 'active-card' : ''}`}
                    onClick={() => setSelectedBattery(b)}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '14px', 
                      borderRadius: '12px', 
                      border: isSelected ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(212,163,89,0.1)' : 'rgba(20,20,25,0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '700', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        background: b.color, 
                        color: '#fff' 
                      }}>
                        {b.theme}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.questionsCount} pregs.
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                      {b.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: 0 }}>
                      {b.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Test Mode & Options Panel */}
          {selectedBattery && (
            <div className="glass-panel fade-in" style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Selected battery banner */}
              <div style={{ background: 'rgba(212,163,89,0.08)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--secondary)', fontWeight: 'bold' }}>Batería Seleccionada</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{selectedBattery.title} ({selectedBattery.questionsCount} preguntas)</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Options Selection */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                    2. Modalidad de Práctica
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button 
                      onClick={() => setTestMode('interactive')}
                      className={`mode-selector-btn ${testMode === 'interactive' ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: testMode === 'interactive' ? 'var(--secondary)' : 'transparent',
                        color: testMode === 'interactive' ? 'var(--bg-dark)' : 'var(--text-main)',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Play size={16} />
                      <div>
                        <div>Práctica Interactiva</div>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '400' }}>Pregunta por pregunta con explicaciones</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setTestMode('paper')}
                      className={`mode-selector-btn ${testMode === 'paper' ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: testMode === 'paper' ? 'var(--secondary)' : 'transparent',
                        color: testMode === 'paper' ? 'var(--bg-dark)' : 'var(--text-main)',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <BookOpen size={16} />
                      <div>
                        <div>Simulacro en Papel</div>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '400' }}>Examen completo y cuadrícula al final</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setTestMode('print')}
                      className={`mode-selector-btn ${testMode === 'print' ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: testMode === 'print' ? 'var(--secondary)' : 'transparent',
                        color: testMode === 'print' ? 'var(--bg-dark)' : 'var(--text-main)',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Printer size={16} />
                      <div>
                        <div>Imprimir Examen (PDF)</div>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '400' }}>Formato impreso con solucionario</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Limit selection */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                    3. Límite de Preguntas
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {[10, 20, 50, 100, 'all'].map((limit) => {
                      const limitLabel = limit === 'all' ? 'Todas' : `${limit}`;
                      const isLimitSelected = questionLimit === limit;
                      return (
                        <button
                          key={limit}
                          onClick={() => setQuestionLimit(limit)}
                          className={`glow-btn-secondary ${isLimitSelected ? 'active' : ''}`}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: isLimitSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.02)',
                            color: isLimitSelected ? 'var(--bg-dark)' : 'var(--text-main)',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {limitLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Start Trigger - Always visible Above the Fold */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto' }}>
                <button
                  onClick={startTest}
                  className="glow-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    borderRadius: '8px'
                  }}
                >
                  <span>Iniciar Examen</span>
                  <ChevronRight size={18} />
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* VIEW: Interactive Runner Mode */}
      {quizStarted && testMode === 'interactive' && !quizFinished && (
        <div className="active-quiz-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Progress */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
            <button onClick={resetTest} className="glow-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronLeft size={14} />
              <span>Volver</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedBattery.title}</span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Pregunta {currentIdx + 1} de {questions.length}</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--secondary)' }}>
              Aciertos: {score} / {currentIdx + (answered ? 1 : 0)}
            </div>
          </div>

          {/* Question Box */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <HelpCircle size={24} className="text-secondary" style={{ flexShrink: 0, marginTop: '2px' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {questions[currentIdx].question}
              </h2>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {questions[currentIdx].options.map((opt, oIdx) => {
                const letter = ['A', 'B', 'C', 'D'][oIdx];
                const isSelected = selectedAnswer === oIdx;
                const isCorrect = questions[currentIdx].correctAnswer === oIdx;
                
                let optionStyle = {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.01)',
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  cursor: answered ? 'default' : 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem'
                };

                if (!answered) {
                  if (isSelected) {
                    optionStyle.border = '1px solid var(--secondary)';
                    optionStyle.background = 'rgba(212,163,89,0.08)';
                  }
                } else {
                  // Show correct and wrong options
                  if (isCorrect) {
                    optionStyle.border = '1px solid #10b981';
                    optionStyle.background = 'rgba(16,185,129,0.1)';
                  } else if (isSelected) {
                    optionStyle.border = '1px solid #ef4444';
                    optionStyle.background = 'rgba(239,68,68,0.1)';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerSelect(oIdx)}
                    style={optionStyle}
                    disabled={answered}
                  >
                    <span style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.05)', 
                      color: isSelected ? 'var(--bg-dark)' : 'var(--text-muted)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {letter}
                    </span>
                    <span>{opt}</span>
                    {answered && isCorrect && <CheckCircle2 size={18} style={{ color: '#10b981', marginLeft: 'auto', flexShrink: 0 }} />}
                    {answered && isSelected && !isCorrect && <XCircle size={18} style={{ color: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {answered && (
              <div className="explanation-box fade-in" style={{ 
                padding: '16px', 
                borderRadius: '10px', 
                background: 'rgba(255,255,255,0.02)', 
                borderLeft: '4px solid var(--secondary)',
                marginBottom: '24px',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Info size={16} className="text-secondary" />
                  <span>Justificación Legal:</span>
                </div>
                <p>{questions[currentIdx].explanation}</p>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              {!answered ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="glow-btn"
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    opacity: selectedAnswer === null ? 0.6 : 1,
                    cursor: selectedAnswer === null ? 'not-allowed' : 'pointer'
                  }}
                >
                  Comprobar Respuesta
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="glow-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    borderRadius: '8px'
                  }}
                >
                  <span>{currentIdx < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Test'}</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIEW: Interactive Runner Results Summary */}
      {quizStarted && testMode === 'interactive' && quizFinished && (
        <div className="results-container fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Score Board */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <Award size={64} className="text-gradient-gold" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Test Finalizado</h2>
            <p className="subtitle" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Has completado el cuestionario de la batería <strong>{selectedBattery.title}</strong>
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>
                  {((score / questions.length) * 100).toFixed(0)}%
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Puntuación</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
              <div>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {score} / {questions.length}
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aciertos</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={startTest} className="glow-btn" style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} />
                <span>Reintentar</span>
              </button>
              <button onClick={resetTest} className="glow-btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                <span>Volver a Cuestionarios</span>
              </button>
            </div>
          </div>

          {/* Question List Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Revisión de Preguntas
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q, idx) => {
                const userChoice = userSelections[idx];
                const isCorrect = userChoice === q.correctAnswer;
                
                return (
                  <div 
                    key={q.id}
                    className="glass-panel" 
                    style={{ 
                      padding: '16px', 
                      borderRadius: '12px', 
                      borderLeft: isCorrect ? '4px solid #10b981' : '4px solid #ef4444',
                      borderTop: '1px solid var(--border-color)',
                      borderRight: '1px solid var(--border-color)',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        Pregunta {idx + 1}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: isCorrect ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.4' }}>
                      {q.question}
                    </p>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>Tu elección: <span style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: '600' }}>{userChoice !== null ? q.options[userChoice] : 'Sin responder'}</span></div>
                      {!isCorrect && (
                        <div>Respuesta correcta: <span style={{ color: '#10b981', fontWeight: '600' }}>{q.options[q.correctAnswer]}</span></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW: Paper Simulation Mode */}
      {quizStarted && testMode === 'paper' && (
        <div className="paper-exam-layout" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Info */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
            <button onClick={resetTest} className="glow-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronLeft size={14} />
              <span>Volver</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{selectedBattery.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulacro en Papel ({questions.length} preguntas)</span>
            </div>
            <div></div>
          </div>

          {/* Results Summary if Submitted */}
          {paperSubmitted && (
            <div className="glass-panel fade-in" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid var(--secondary)', textAlign: 'center' }}>
              <Award size={48} className="text-gradient-gold" style={{ margin: '0 auto 12px auto' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Examen Corregido</h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '20px 0' }}>
                <div>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{paperResults.correct}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aciertos</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                <div>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>{paperResults.incorrect}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Errores</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                <div>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-muted)' }}>{paperResults.blank}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>En blanco</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={startTest} className="glow-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={14} />
                  <span>Nuevo Intento</span>
                </button>
                <button onClick={resetTest} className="glow-btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <span>Volver a Cuestionarios</span>
                </button>
              </div>
            </div>
          )}

          <div className="paper-simulation-workspace" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
            
            {/* Left Column: Questions sheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {questions.map((q, idx) => {
                const answer = paperAnswers[q.id];
                return (
                  <div 
                    key={q.id}
                    className="glass-panel" 
                    id={`paper-q-${idx}`}
                    style={{ 
                      padding: '20px', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border-color)',
                      background: 'rgba(20,20,25,0.4)' 
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '700', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'var(--secondary)',
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.4' }}>
                        {q.question}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '34px' }}>
                      {q.options.map((opt, oIdx) => {
                        const letter = ['a', 'b', 'c', 'd'][oIdx];
                        const isChosen = answer === oIdx;
                        const isCorrect = q.correctAnswer === oIdx;
                        
                        let optStyle = {
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4',
                          border: '1px solid transparent',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: paperSubmitted ? 'default' : 'pointer'
                        };

                        if (!paperSubmitted) {
                          if (isChosen) {
                            optStyle.border = '1px solid var(--secondary)';
                            optStyle.background = 'rgba(212,163,89,0.05)';
                            optStyle.color = 'var(--text-main)';
                          }
                        } else {
                          if (isCorrect) {
                            optStyle.border = '1px solid #10b981';
                            optStyle.background = 'rgba(16,185,129,0.06)';
                            optStyle.color = '#10b981';
                          } else if (isChosen) {
                            optStyle.border = '1px solid #ef4444';
                            optStyle.background = 'rgba(239,68,68,0.06)';
                            optStyle.color = '#ef4444';
                          }
                        }

                        return (
                          <div 
                            key={oIdx} 
                            style={optStyle}
                            onClick={() => handlePaperAnswer(q.id, oIdx)}
                          >
                            <span style={{ fontWeight: 'bold' }}>{letter})</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {paperSubmitted && (
                      <div className="fade-in" style={{ 
                        marginTop: '14px', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        background: 'rgba(255,255,255,0.02)', 
                        borderLeft: '3px solid var(--secondary)',
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        color: 'var(--text-muted)',
                        marginLeft: '34px'
                      }}>
                        <strong>Justificación:</strong> {q.explanation}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Right Column: Floating Answer grid sheet */}
            <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="omr-sheet-container">
                <div className="omr-sheet-header">
                  <h4>Hoja de Respuestas</h4>
                  <span>Marque la opción correcta</span>
                </div>
                
                <div className="omr-sheet-content">
                  {/* Scrollable grid area */}
                  <div className="omr-grid-area">
                    {questions.map((q, idx) => {
                      const userSelection = paperAnswers[q.id];
                      return (
                        <div key={q.id} className="omr-question-row">
                          <span className="omr-question-number">
                            {idx + 1}.
                          </span>
                          
                          <div className="omr-bubble-group">
                            {['A', 'B', 'C', 'D'].map((letter, oIdx) => {
                              const isChosen = userSelection === oIdx;
                              const isCorrect = q.correctAnswer === oIdx;
                              
                              let bubbleClass = "omr-bubble";
                              if (!paperSubmitted) {
                                if (isChosen) {
                                  bubbleClass += " marked";
                                }
                              } else {
                                if (isCorrect) {
                                  bubbleClass += " correct";
                                } else if (isChosen) {
                                  bubbleClass += " incorrect";
                                }
                              }

                              return (
                                <button
                                  key={letter}
                                  onClick={() => handlePaperAnswer(q.id, oIdx)}
                                  className={bubbleClass}
                                  disabled={paperSubmitted}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!paperSubmitted ? (
                    <button
                      onClick={submitPaperExam}
                      className="omr-submit-btn"
                    >
                      Entregar Examen
                    </button>
                  ) : (
                    <button
                      onClick={resetTest}
                      className="omr-review-btn"
                    >
                      Finalizar Revisión
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW: Clean Print View Mode */}
      {quizStarted && testMode === 'print' && (
        <div className="print-only-layout" style={{ background: '#fff', color: '#000', padding: '20px', fontFamily: 'serif' }}>
          
          {/* Header for print */}
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
              Universidad de Sevilla - Técnico Auxiliar de Biblioteca
            </h1>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              Batería Oficial de Cuestionarios: {selectedBattery.title}
            </h2>
            <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              Material de Preparación facilitado por los Formadores - Código de Convocatoria 4140
            </div>
          </div>

          {/* Instructions Block */}
          <div style={{ border: '1px solid #000', padding: '12px', fontSize: '0.85rem', marginBottom: '24px', lineHeight: '1.4' }}>
            <strong>INSTRUCCIONES:</strong> Lea atentamente cada pregunta antes de contestar. El examen consta de {questions.length} preguntas de opción múltiple con 4 opciones alternativas. Sólo una de las respuestas es correcta. Resuelva las preguntas en papel antes de cotejar con la hoja de soluciones y justificaciones legales dispuesta al final de este pliego.
          </div>

          {/* List of questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{ pageBreakInside: 'avoid', marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
                  {idx + 1}. {q.question}
                </div>
                <div style={{ paddingLeft: '16px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {q.options.map((opt, oIdx) => {
                    const letter = ['a', 'b', 'c', 'd'][oIdx];
                    return (
                      <div key={oIdx}>
                        <strong>{letter})</strong> {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Page break and Solutions Block */}
          <div style={{ pageBreakBefore: 'always', marginTop: '40px', borderTop: '2px solid #000', paddingTop: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>
              Hoja de Respuestas y Solucionario
            </h2>

            {/* Clean Grid table of answers */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', background: '#f2f2f2' }}>Pregunta</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', background: '#f2f2f2' }}>Respuesta Correcta</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', background: '#f2f2f2' }}>Pregunta</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', background: '#f2f2f2' }}>Respuesta Correcta</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(questions.length / 2) }).map((_, rIdx) => {
                  const q1 = questions[rIdx];
                  const q2 = questions[rIdx + Math.ceil(questions.length / 2)];
                  return (
                    <tr key={rIdx}>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{rIdx + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                        {['A', 'B', 'C', 'D'][q1.correctAnswer]}
                      </td>
                      {q2 ? (
                        <>
                          <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{rIdx + 1 + Math.ceil(questions.length / 2)}</td>
                          <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                            {['A', 'B', 'C', 'D'][q2.correctAnswer]}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                          <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* List of Explanations */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '14px' }}>
              Justificaciones Legales de las Respuestas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {questions.map((q, idx) => (
                <div key={q.id} style={{ pageBreakInside: 'avoid', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  <strong>Pregunta {idx + 1}:</strong> {q.explanation}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Action Button to close print view in screen */}
          <div className="no-print" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            <button
              onClick={resetTest}
              className="glow-btn"
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: '700',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              Cerrar Vista de Impresión
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
