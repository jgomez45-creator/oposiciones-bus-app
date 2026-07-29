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
import codigo2001Validadas from '../data/examenes_oficiales/codigo_2001_validadas.json';

import PrintEditionModal from './PrintEditionModal';
import { firebaseService } from '../services/firebaseService';

export default function FormadoresTests({ currentUser }) {
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    },
    {
      id: 'oficial_2001_4140',
      title: 'Examen Oficial US (Código 2001)',
      subtitle: 'Preguntas oficiales validadas y auditadas 100% para el Código 4140',
      questionsCount: codigo2001Validadas.length,
      data: codigo2001Validadas,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber/Gold
      theme: 'Oficial US'
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

  // Mobile adaptive states
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showMobileOmr, setShowMobileOmr] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle start test
  const startTest = () => {
    if (!selectedBattery) return;

    if (testMode === 'print' && (currentUser?.role === 'guest' || currentUser?.uid === 'guest_profile')) {
      alert('Esta opción no está activa en el modo invitado. Por favor, regístrate para poder descargar o imprimir las baterías de test de formadores en PDF.');
      return;
    }

    // Normalize and filter raw questions defensively
    let rawQuestions = (selectedBattery.data || []).map(q => ({
      ...q,
      question: q.question || q.enunciado || '',
      options: q.options || q.opciones || [],
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.respuesta_correcta !== undefined ? q.respuesta_correcta : 0),
      explanation: q.explanation || q.explicacion_vigente || ''
    })).filter(q => q.question && Array.isArray(q.options) && q.options.length > 0);

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
      setTimeout(() => {
        if (currentUser?.role === 'admin') {
          setShowPrintModal(true);
        } else {
          window.print();
        }
      }, 300);
    }
  };

  const handleConfirmPrintEdition = async (opt, editionData) => {
    setShowPrintModal(false);
    if (editionData) {
      try {
        await firebaseService.saveMaterialEdition(editionData);
      } catch (err) {
        console.error("Error saving material edition", err);
      }
    }
    setTimeout(() => {
      window.print();
    }, 150);
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
    setShowMobileOmr(false);
  };

  const omrSheet = (
    <div className="omr-sheet-container" style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <div className="omr-sheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4 style={{ margin: 0, color: 'white' }}>Hoja de Respuestas</h4>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.85)' }}>Marque la opción correcta</span>
        </div>
        {isMobile && (
          <button
            onClick={() => setShowMobileOmr(false)}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="omr-sheet-content">
        {paperSubmitted && (
          <div style={{
            display: 'flex',
            justify: 'space-around',
            alignItems: 'center',
            padding: '6px 8px',
            background: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #fee2e2',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: '#475569'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold' }}>✓</span> Acierto
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold' }}>✕</span> Error
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#f59e0b', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold' }}>—</span> No contestada
            </span>
          </div>
        )}

        <div className="omr-grid-area" style={{ maxHeight: isMobile ? '60vh' : '420px' }}>
          {questions.map((q, idx) => {
            const userSelection = paperAnswers[q.id];
            return (
              <div key={q.id} className="omr-question-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                  <span className="omr-question-number" style={{ width: 'auto', minWidth: '22px' }}>
                    {idx + 1}.
                  </span>
                  {paperSubmitted && (
                    <span
                      title={
                        userSelection === undefined
                          ? 'No contestada'
                          : userSelection === q.correctAnswer
                            ? 'Acierto'
                            : 'Error'
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor:
                          userSelection === undefined
                            ? '#f59e0b'
                            : userSelection === q.correctAnswer
                              ? '#10b981'
                              : '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        lineHeight: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        flexShrink: 0
                      }}
                    >
                      {userSelection === undefined ? (
                        '—'
                      ) : userSelection === q.correctAnswer ? (
                        '✓'
                      ) : (
                        '✕'
                      )}
                    </span>
                  )}
                </div>

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
            onClick={() => {
              submitPaperExam();
              setShowMobileOmr(false);
            }}
            className="omr-submit-btn"
          >
            Entregar Examen
          </button>
        ) : (
          <button
            onClick={() => {
              resetTest();
              setShowMobileOmr(false);
            }}
            className="omr-review-btn"
          >
            Finalizar Revisión
          </button>
        )}
      </div>
    </div>
  );

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

          {/* Results Summary if Submitted - Ultra Compact Strip */}
          {paperSubmitted && (
            <div className="glass-panel fade-in" style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={22} className="text-gradient-gold" style={{ flexShrink: 0 }} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Examen Corregido</h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{paperResults.correct}</span>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aciertos</div>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>{paperResults.incorrect}</span>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Errores</div>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-muted)' }}>{paperResults.blank}</span>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>En blanco</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={startTest} className="glow-btn" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RotateCcw size={12} />
                  <span>Nuevo Intento</span>
                </button>
                <button onClick={resetTest} className="glow-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                  <span>Volver</span>
                </button>
              </div>
            </div>
          )}

          <div className="paper-simulation-workspace" style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : 'row', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '20px', alignItems: 'start' }}>

            {/* Mobile OMR button: Position C - Centered, aligned to the top border of the sheet */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '-10px', zIndex: 10 }}>
                <button
                  onClick={() => setShowMobileOmr(!showMobileOmr)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #c8102e 0%, #b91c1c 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    boxShadow: '0 3px 10px rgba(200, 16, 46, 0.3)',
                    border: '1.5px solid #fee2e2',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BookOpen size={14} />
                  <span>Hoja de Respuestas</span>
                </button>
              </div>
            )}

            {/* Left Column: Questions sheet */}
            <div className="print-preview-content printable-exam-sheet" style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '20px 16px' : '40px 50px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid #cbd5e1', boxSizing: 'border-box', width: '100%' }}>
              {questions.map((q, idx) => {
                const answer = paperAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    id={`paper-q-${idx}`}
                    style={{
                      marginBottom: '14px',
                      paddingBottom: '12px',
                      borderBottom: '1px dashed #e2e8f0',
                      pageBreakInside: 'avoid'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <span style={{
                        fontSize: '0.98rem',
                        fontWeight: '800',
                        color: 'black',
                        flexShrink: 0
                      }}>
                        {idx + 1}.
                      </span>
                      {paperSubmitted && (
                        answer === undefined ? (
                          <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>
                            NO CONTESTADA
                          </span>
                        ) : answer === q.correctAnswer ? (
                          <span style={{ backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>
                            ACIERTO
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#ef4444', color: '#ffffff', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>
                            ERROR
                          </span>
                        )
                      )}
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'black', lineHeight: '1.35', margin: 0 }}>
                        {q.question}
                      </h4>
                    </div>

                    <div className="printable-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isChosen = answer === oIdx;
                        const isCorrect = q.correctAnswer === oIdx;

                        let optStyle = {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          cursor: paperSubmitted ? 'default' : 'pointer',
                          fontSize: '0.92rem',
                          color: '#334155',
                          transition: 'all 0.15s ease',
                          border: '1px solid transparent',
                          textAlign: 'left',
                          background: 'transparent'
                        };

                        let boxStyle = {
                          width: '18px',
                          height: '18px',
                          border: '2px solid #475569',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px',
                          flexShrink: 0,
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          color: '#1e3a8a',
                          transition: 'all 0.15s ease'
                        };

                        if (paperSubmitted) {
                          if (isCorrect) {
                            optStyle.backgroundColor = answer === undefined ? '#fefce8' : '#dcfce7';
                            optStyle.color = answer === undefined ? '#854d0e' : '#14532d';
                            optStyle.border = answer === undefined ? '1.5px dashed #ca8a04' : '1px solid #bbf7d0';
                            boxStyle.borderColor = answer === undefined ? '#ca8a04' : '#16a34a';
                            boxStyle.backgroundColor = answer === undefined ? '#fef08a' : '#16a34a';
                            boxStyle.color = answer === undefined ? '#854d0e' : 'white';
                          } else if (isChosen && !isCorrect) {
                            optStyle.backgroundColor = '#fee2e2';
                            optStyle.color = '#7f1d1d';
                            optStyle.border = '1px solid #fecaca';
                            boxStyle.borderColor = '#dc2626';
                            boxStyle.backgroundColor = '#dc2626';
                            boxStyle.color = 'white';
                          }
                        } else {
                          if (isChosen) {
                            optStyle.backgroundColor = '#eff6ff';
                            optStyle.border = '1px solid #bfdbfe';
                            boxStyle.borderColor = '#1d4ed8';
                            boxStyle.backgroundColor = '#1d4ed8';
                            boxStyle.color = 'white';
                          }
                        }

                        return (
                          <div
                            key={oIdx}
                            onClick={() => handlePaperAnswer(q.id, oIdx)}
                            className={`paper-option-item-container ${!paperSubmitted ? 'hoverable-option' : ''}`}
                            style={optStyle}
                          >
                            <div style={boxStyle}>
                              {paperSubmitted ? (
                                isCorrect ? (answer !== undefined ? '✓' : '!') : isChosen ? '✗' : ''
                              ) : (
                                isChosen ? 'X' : ''
                              )}
                            </div>
                            <span style={{ lineHeight: '1.4' }}>
                              <strong>{['A', 'B', 'C', 'D'][oIdx]})</strong> {opt.replace(/^[a-dA-D]\)\s*/, '')}
                            </span>
                            {paperSubmitted && answer === undefined && isCorrect && (
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 'bold', color: '#854d0e', backgroundColor: '#fef9c3', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: '12px' }}>
                                Respuesta Correcta (Sin contestar)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {paperSubmitted && (
                      <div className="paper-explanation-box fade-in" style={{
                        marginTop: '8px',
                        marginLeft: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        borderLeft: '3px solid #94a3b8',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: '#475569',
                        lineHeight: '1.4'
                      }}>
                        <strong>Justificación:</strong> {q.explanation}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Right Column: Floating Answer grid sheet (Desktop only) */}
            {!isMobile && (
              <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '16px', width: '340px', flexShrink: 0 }}>
                {omrSheet}
              </div>
            )}

            {/* Mobile OMR Overlay */}
            {isMobile && showMobileOmr && (
              <div
                className="omr-mobile-overlay"
                onClick={() => setShowMobileOmr(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 99999,
                  background: 'rgba(7, 10, 19, 0.75)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '100%', maxWidth: '340px' }}
                >
                  {omrSheet}
                </div>
              </div>
            )}

            {/* Fixed/floating button removed to render inline at the top of the worksheet, Option C centered */}

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

      <PrintEditionModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        materialType="test"
        topicCount={questions?.length || 20}
        defaultTitle={`Batería Formadores CCOO (${selectedBattery?.title || 'General'})`}
        onConfirmPrint={handleConfirmPrintEdition}
      />
    </div>
  );
}
