import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Award,
  Printer
} from 'lucide-react';
import quizzesData from '../data/quizzes.json';
import examen2019Data from '../data/examen_2019.json';
import examen2022Data from '../data/examen_2022.json';

export default function QuizRunner({ topics, progress, recordQuizScore, activeTopicId }) {
  // Config state
  const [selectedTopicMode, setSelectedTopicMode] = useState('single'); // 'single' | 'custom' | 'simulacro-40' | 'simulacro-oficial' | 'test-book' | 'examen-real-2019' | 'examen-real-2022'
  const [selectedSimulacroNums, setSelectedSimulacroNums] = useState(['1']);
  const [compiledExamsContent, setCompiledExamsContent] = useState([]);
  const [isExamsPrintMode, setIsExamsPrintMode] = useState(false);
  const [singleTopicId, setSingleTopicId] = useState(activeTopicId ? activeTopicId.toString() : '1');
  
  // Available topics for quizzes (topics that actually have questions in quizzes.json)
  const availableTopicIds = Object.keys(quizzesData);

  const [customSelectedTopicIds, setCustomSelectedTopicIds] = useState(
    activeTopicId && availableTopicIds.includes(activeTopicId.toString()) 
      ? [activeTopicId.toString()] 
      : availableTopicIds.length > 0 ? [availableTopicIds[0]] : ['1']
  );
  
  const [questionLimit, setQuestionLimit] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isPrintPreviewMode, setIsPrintPreviewMode] = useState(false);
  const [isTestBookPrintMode, setIsTestBookPrintMode] = useState(false);
  const [testBookContent, setTestBookContent] = useState([]);
  
  // Running quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // index of selected option
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Paper exam mode states
  const [isPaperInteractiveMode, setIsPaperInteractiveMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [paperExamSubmitted, setPaperExamSubmitted] = useState(false);

  const generateSimulacro40Questions = () => {
    let qPool = [];
    availableTopicIds.forEach(topicId => {
      const topicQs = (quizzesData[topicId] || []).filter(q => q.usage !== 'simulacro');
      if (topicQs.length > 0) {
        const selectedQs = [...topicQs]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2)
          .map(q => ({
            ...q,
            topicId: Number(topicId)
          }));
        qPool = [...qPool, ...selectedQs];
      }
    });
    // Shuffle the final 40 questions so they are randomized, but contain exactly 2 from each topic
    qPool.sort(() => 0.5 - Math.random());
    return qPool;
  };

  const generateSimulacroOficialQuestions = (examId) => {
    let qPool = [];
    availableTopicIds.forEach(topicId => {
      const topicQs = quizzesData[topicId] || [];
      const examQs = topicQs.filter(q => q.usage === 'simulacro' && q.simulacroExamId === Number(examId));
      
      // Fallback if metadata is not generated yet (e.g. if db is not fully generated)
      if (examQs.length === 0) {
        const count = topicQs.length;
        if (count > 0) {
          const idx1 = (Number(examId) * 2) % count;
          const idx2 = (Number(examId) * 2 + 1) % count;
          const fallbackQs = [topicQs[idx1], topicQs[idx2]];
          fallbackQs.forEach((q, subIdx) => {
            if (q) {
              qPool.push({
                ...q,
                id: q.id || (subIdx + 1),
                topicId: Number(topicId),
                usage: 'simulacro',
                simulacroExamId: Number(examId)
              });
            }
          });
        }
      } else {
        examQs.forEach(q => {
          qPool.push({
            ...q,
            topicId: Number(topicId)
          });
        });
      }
    });
    // Shuffle the 40 questions of the exam so they are mixed up
    qPool.sort(() => 0.5 - Math.random());
    return qPool;
  };

  const handlePrepareTestBook = () => {
    let compiledQuestions = [];
    const sortedIds = [...customSelectedTopicIds].map(Number).sort((a, b) => a - b);
    
    sortedIds.forEach(topicId => {
      const allTopicQs = (quizzesData[topicId.toString()] || []).filter(q => q.usage !== 'simulacro');
      const selectedQs = [...allTopicQs]
        .sort(() => 0.5 - Math.random())
        .slice(0, questionLimit);
      
      const mappedQs = selectedQs.map(q => ({
        ...q,
        topicId: Number(topicId)
      }));
      
      compiledQuestions.push({
        topicId: Number(topicId),
        topicTitle: topics.find(t => t.id === Number(topicId))?.title || '',
        questions: mappedQs
      });
    });
    
    setTestBookContent(compiledQuestions);
    setIsTestBookPrintMode(true);
    setQuizStarted(true);
  };

  const handlePreparePrintExam = () => {
    let qPool = [];
    
    if (selectedTopicMode === 'examen-real-2019') {
      qPool = examen2019Data;
    } else if (selectedTopicMode === 'examen-real-2022') {
      qPool = examen2022Data;
    } else if (selectedTopicMode === 'simulacro-40') {
      qPool = generateSimulacro40Questions();
    } else if (selectedTopicMode === 'simulacro-oficial') {
      let examsData = [];
      const sortedNums = [...selectedSimulacroNums].map(Number).sort((a, b) => a - b);
      
      sortedNums.forEach(num => {
        const examQs = generateSimulacroOficialQuestions(num);
        examsData.push({
          examNum: num,
          questions: examQs
        });
      });
      
      setCompiledExamsContent(examsData);
      setIsExamsPrintMode(true);
      setQuizStarted(true);
      return;
    } else if (selectedTopicMode === 'single') {
      const topicQs = (quizzesData[singleTopicId] || []).filter(q => q.usage !== 'simulacro');
      qPool = topicQs.map(q => ({
        ...q,
        topicId: Number(singleTopicId)
      })).sort(() => 0.5 - Math.random()).slice(0, questionLimit);
    } else {
      // Gather questions from selected custom topics
      customSelectedTopicIds.forEach(topicId => {
        const topicQs = (quizzesData[topicId] || []).filter(q => q.usage !== 'simulacro');
        const mappedQs = topicQs.map(q => ({
          ...q,
          topicId: Number(topicId)
        }));
        qPool = [...qPool, ...mappedQs];
      });
      qPool.sort(() => 0.5 - Math.random());
      qPool = qPool.slice(0, questionLimit);
    }

    if (qPool.length === 0) {
      alert('Aún no hay preguntas disponibles para los temas seleccionados.');
      return;
    }

    setQuestions(qPool);
    setIsPrintPreviewMode(true);
    setQuizStarted(true);
  };

  // Set default topic id if activeTopicId has questions
  useEffect(() => {
    if (activeTopicId && availableTopicIds.includes(activeTopicId.toString())) {
      setSingleTopicId(activeTopicId.toString());
      setCustomSelectedTopicIds([activeTopicId.toString()]);
      setSelectedTopicMode('single');
    }
  }, [activeTopicId]);

  const handleStartQuiz = (paperMode = false) => {
    let qPool = [];
    
    if (selectedTopicMode === 'examen-real-2019') {
      qPool = examen2019Data;
    } else if (selectedTopicMode === 'examen-real-2022') {
      qPool = examen2022Data;
    } else if (selectedTopicMode === 'simulacro-40') {
      qPool = generateSimulacro40Questions();
    } else if (selectedTopicMode === 'simulacro-oficial') {
      const firstExamNum = selectedSimulacroNums[0] || '1';
      qPool = generateSimulacroOficialQuestions(firstExamNum);
    } else if (selectedTopicMode === 'single') {
      const topicQs = (quizzesData[singleTopicId] || []).filter(q => q.usage !== 'simulacro');
      qPool = topicQs.map(q => ({
        ...q,
        topicId: Number(singleTopicId)
      })).sort(() => 0.5 - Math.random()).slice(0, questionLimit);
    } else {
      // Gather questions from selected custom topics
      customSelectedTopicIds.forEach(topicId => {
        const topicQs = (quizzesData[topicId] || []).filter(q => q.usage !== 'simulacro');
        const mappedQs = topicQs.map(q => ({
          ...q,
          topicId: Number(topicId)
        }));
        qPool = [...qPool, ...mappedQs];
      });
      qPool.sort(() => 0.5 - Math.random());
      qPool = qPool.slice(0, questionLimit);
    }

    if (qPool.length === 0) {
      alert('Aún no hay preguntas disponibles para los temas seleccionados.');
      return;
    }

    setQuestions(qPool);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setQuizFinished(false);
    
    // Set paper mode states
    setIsPaperInteractiveMode(paperMode === true);
    setUserAnswers(Array(qPool.length).fill(null));
    setPaperExamSubmitted(false);
    
    setQuizStarted(true);
  };

  const handleSubmitPaperExam = () => {
    const answeredCount = userAnswers.filter(ans => ans !== null).length;
    if (answeredCount === 0) {
      if (!window.confirm('No has respondido a ninguna pregunta. ¿Estás seguro de que quieres finalizar el examen?')) {
        return;
      }
    } else if (answeredCount < questions.length) {
      if (!window.confirm(`Has respondido ${answeredCount} de ${questions.length} preguntas. ¿Deseas finalizar y corregir el examen ahora?`)) {
        return;
      }
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setPaperExamSubmitted(true);

    const scorePct = Math.round((correctCount / questions.length) * 100);
    if (selectedTopicMode === 'single') {
      recordQuizScore(Number(singleTopicId), scorePct);
    } else if (selectedTopicMode === 'custom' || selectedTopicMode === 'simulacro-40' || selectedTopicMode === 'simulacro-oficial' || selectedTopicMode === 'examen-real-2019' || selectedTopicMode === 'examen-real-2022') {
      const activeIds = (selectedTopicMode === 'simulacro-40' || selectedTopicMode === 'simulacro-oficial' || selectedTopicMode === 'examen-real-2019' || selectedTopicMode === 'examen-real-2022') ? availableTopicIds : customSelectedTopicIds;
      activeIds.forEach(topicId => {
        recordQuizScore(Number(topicId), scorePct);
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerClick = (optionIndex) => {
    if (answered) return; // Prevent clicking again

    setSelectedAnswer(optionIndex);
    setAnswered(true);

    const isCorrect = optionIndex === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setAnswered(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz finished
      setQuizFinished(true);
      
      // Calculate final score percentage
      const scorePct = Math.round((score / questions.length) * 100);
      
      // Record score
      if (selectedTopicMode === 'single') {
        recordQuizScore(Number(singleTopicId), scorePct);
      } else if (selectedTopicMode === 'custom' || selectedTopicMode === 'simulacro-40' || selectedTopicMode === 'simulacro-oficial' || selectedTopicMode === 'examen-real-2019' || selectedTopicMode === 'examen-real-2022') {
        // Record score to all selected custom topics
        const activeIds = (selectedTopicMode === 'simulacro-40' || selectedTopicMode === 'simulacro-oficial' || selectedTopicMode === 'examen-real-2019' || selectedTopicMode === 'examen-real-2022') ? availableTopicIds : customSelectedTopicIds;
        activeIds.forEach(topicId => {
          recordQuizScore(Number(topicId), scorePct);
        });
      }
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setIsPrintPreviewMode(false);
    setIsTestBookPrintMode(false);
    setIsExamsPrintMode(false);
    setIsPaperInteractiveMode(false);
    setUserAnswers([]);
    setPaperExamSubmitted(false);
    setTestBookContent([]);
    setCompiledExamsContent([]);
  };

  // Calculations for paper exam results summary and layout
  const totalQuestions = questions.length;
  const answeredCount = userAnswers.filter(ans => ans !== null).length;
  const blankCount = totalQuestions - answeredCount;
  const correctCount = score;
  const incorrectCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx].correctAnswer).length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const netScore = correctCount - (incorrectCount * 0.25);
  const scoreOver65 = totalQuestions > 0 ? Math.max(0, (netScore / totalQuestions) * 65) : 0;

  return (
    <div className="quiz-view fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="text-gradient">Cuestionarios de Autoevaluación</h1>
          <p className="text-muted">Practica activamente con preguntas reales orientadas al formato de examen de la US.</p>
        </div>
      </header>

      {!quizStarted ? (
        /* Configuration view */
        <div className="quiz-config-card glass-panel" style={{ maxWidth: '750px' }}>
          <div className="config-icon-header">
            <GraduationCap size={48} className="text-gradient-gold" />
            <h3>Configurar Cuestionario</h3>
            <p className="text-muted">Personaliza tu examen seleccionando temas y número de preguntas.</p>
          </div>

          <div className="config-form">
            {/* Mode selector */}
            <div className="quiz-mode-toggles" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('single')}
                className={`mode-btn ${selectedTopicMode === 'single' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                Tema Único
              </button>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('custom')}
                className={`mode-btn ${selectedTopicMode === 'custom' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                Simulacro Personalizado
              </button>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('simulacro-40')}
                className={`mode-btn ${selectedTopicMode === 'simulacro-40' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                Simulacro Aleatorio (40)
              </button>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('simulacro-oficial')}
                className={`mode-btn ${selectedTopicMode === 'simulacro-oficial' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                15 Simulacros Predefinidos
              </button>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('examen-real-2019')}
                className={`mode-btn ${selectedTopicMode === 'examen-real-2019' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                Examen Real 2019
              </button>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('examen-real-2022')}
                className={`mode-btn ${selectedTopicMode === 'examen-real-2022' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                Examen Real 2022
              </button>
              <button 
                type="button"
                onClick={() => setSelectedTopicMode('test-book')}
                className={`mode-btn ${selectedTopicMode === 'test-book' ? 'active' : ''}`}
                style={{ flex: '1 1 120px' }}
              >
                Cuaderno de Tests
              </button>
            </div>

            {selectedTopicMode === 'single' && (
              <div className="form-group">
                <label>Selecciona el tema:</label>
                <select
                  value={singleTopicId}
                  onChange={(e) => setSingleTopicId(e.target.value)}
                  className="config-select"
                >
                  {topics.map(t => {
                    const hasQuestions = availableTopicIds.includes(t.id.toString());
                    return (
                      <option 
                        key={t.id} 
                        value={t.id.toString()} 
                        disabled={!hasQuestions}
                      >
                        Tema {t.id}: {t.title} {!hasQuestions ? '(Sin preguntas)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {(selectedTopicMode === 'custom' || selectedTopicMode === 'test-book') && (
              <div className="form-group">
                <label>
                  {selectedTopicMode === 'test-book' 
                    ? 'Elige los temas para compilar en tu Cuaderno de Tests:' 
                    : 'Elige los temas para el simulacro:'}
                </label>
                
                <div className="topics-bulk-actions">
                  <button 
                    type="button"
                    onClick={() => setCustomSelectedTopicIds(availableTopicIds)}
                    className="bulk-action-link"
                  >
                    Seleccionar todos
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCustomSelectedTopicIds(availableTopicIds.length > 0 ? [availableTopicIds[0]] : [])}
                    className="bulk-action-link"
                  >
                    Deseleccionar todos
                  </button>
                </div>

                <div className="topics-checkbox-grid">
                  {topics.map(t => {
                    const hasQuestions = availableTopicIds.includes(t.id.toString());
                    const isChecked = customSelectedTopicIds.includes(t.id.toString());
                    
                    const handleCheckboxToggle = () => {
                      if (!hasQuestions) return;
                      if (isChecked) {
                        if (customSelectedTopicIds.length > 1) {
                          setCustomSelectedTopicIds(prev => prev.filter(id => id !== t.id.toString()));
                        }
                      } else {
                        setCustomSelectedTopicIds(prev => [...prev, t.id.toString()]);
                      }
                    };

                    return (
                      <div 
                        key={t.id} 
                        onClick={handleCheckboxToggle}
                        className={`topic-checkbox-label ${isChecked ? 'selected' : ''} ${!hasQuestions ? 'disabled' : ''}`}
                        title={!hasQuestions ? 'Tema sin preguntas desarrolladas aún' : t.title}
                      >
                        <span style={{ fontWeight: 'bold' }}>T{t.id.toString().padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTopicMode === 'simulacro-40' && (
              <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid var(--text-primary)', borderRadius: '6px', margin: '20px 0', fontSize: '0.9rem', lineHighlight: '1.5', textAlign: 'left' }}>
                <h5 style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>Simulacro Tipo de Examen (40 Preguntas):</h5>
                Este examen selecciona de forma totalmente aleatoria y de manera equilibrada exactamente **2 preguntas de cada uno de los 20 temas** de la oposición (40 preguntas totales). Las preguntas se barajan para simular las condiciones de un examen real.
              </div>
            )}

            {selectedTopicMode === 'examen-real-2019' && (
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid var(--accent-emerald)', borderRadius: '6px', margin: '20px 0', fontSize: '0.9rem', lineHighlight: '1.5', textAlign: 'left' }}>
                <h5 style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>Examen Oficial 2019 (40 Preguntas):</h5>
                Este cuestionario contiene las **40 preguntas reales de la convocatoria de 2019** para Técnico/a Auxiliar de Biblioteca, Archivo y Museo de la Universidad de Sevilla. Se incluyen las explicaciones y justificaciones de la plantilla oficial de respuestas.
              </div>
            )}

            {selectedTopicMode === 'examen-real-2022' && (
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid var(--accent-emerald)', borderRadius: '6px', margin: '20px 0', fontSize: '0.9rem', lineHighlight: '1.5', textAlign: 'left' }}>
                <h5 style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>Examen Oficial de la Convocatoria 2022 (realizado en 2024):</h5>
                Este cuestionario contiene las **preguntas reales del examen oficial de la convocatoria 2022** (celebrado el 20 de enero de 2024) para Técnico/a Auxiliar de Biblioteca, Archivo y Museo de la Universidad de Sevilla, junto con sus opciones oficiales de respuesta y justificaciones de la plantilla.
              </div>
            )}

            {selectedTopicMode === 'simulacro-oficial' && (
              <div className="form-group">
                <label>Selecciona los Simulacros de Examen predefinidos (40 preguntas):</label>
                
                <div className="topics-bulk-actions">
                  <button 
                    type="button"
                    onClick={() => setSelectedSimulacroNums(Array.from({ length: 15 }, (_, i) => (i + 1).toString()))}
                    className="bulk-action-link"
                  >
                    Seleccionar todos
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedSimulacroNums(['1'])}
                    className="bulk-action-link"
                  >
                    Deseleccionar todos
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(num => {
                    const isChecked = selectedSimulacroNums.includes(num.toString());
                    const handleSimulacroToggle = () => {
                      if (isChecked) {
                        if (selectedSimulacroNums.length > 1) {
                          setSelectedSimulacroNums(prev => prev.filter(id => id !== num.toString()));
                        }
                      } else {
                        setSelectedSimulacroNums(prev => [...prev, num.toString()]);
                      }
                    };
                    
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={handleSimulacroToggle}
                        className={`limit-chip-btn ${isChecked ? 'active' : ''}`}
                        style={{ padding: '10px', fontSize: '0.85rem', fontWeight: '600' }}
                      >
                        Simulacro {num}
                      </button>
                    );
                  })}
                </div>
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid var(--text-secondary)', borderRadius: '6px', margin: '16px 0 0 0', fontSize: '0.8rem', textAlign: 'left' }}>
                  <strong>Examen de 40 preguntas equilibrado</strong>: Cada simulacro predefinido incluye exactamente **2 preguntas de cada uno de los 20 temas** (preguntas 71 a 100 de cada tema). Ninguna pregunta se repite entre los 15 simulacros.
                  {selectedSimulacroNums.length > 1 && (
                    <div style={{ marginTop: '6px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      * Has seleccionado {selectedSimulacroNums.length} simulacros. Si inicias el examen online, se cargará el Simulacro {selectedSimulacroNums[0]}. Para imprimirlos todos en un único PDF con portada, haz clic en "Imprimir Examen".
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTopicMode !== 'simulacro-40' && selectedTopicMode !== 'simulacro-oficial' && selectedTopicMode !== 'examen-real-2019' && selectedTopicMode !== 'examen-real-2022' && (
              <div className="form-group">
                <label>
                  {selectedTopicMode === 'test-book'
                    ? 'Cantidad de preguntas por cada tema seleccionado:'
                    : 'Cantidad de preguntas:'}
                </label>
                <div className="question-limit-selector">
                  {(selectedTopicMode === 'test-book' ? [5, 10, 20, 30, 50, 120] : [5, 10, 15, 20, 30]).map(limit => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setQuestionLimit(limit)}
                      className={`limit-chip-btn ${questionLimit === limit ? 'active' : ''}`}
                    >
                      {limit === 120 ? 'Todas (120)' : `${limit} preguntas`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              {selectedTopicMode === 'test-book' ? (
                <button 
                  onClick={handlePrepareTestBook} 
                  className="glow-btn start-quiz-btn"
                  disabled={customSelectedTopicIds.length === 0}
                  style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Printer size={18} />
                  Preparar Cuaderno de Tests para Impresión (PDF)
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleStartQuiz(false)} 
                    className="glow-btn start-quiz-btn"
                    disabled={selectedTopicMode === 'custom' && customSelectedTopicIds.length === 0}
                    style={{ flex: '1 1 200px' }}
                  >
                    Test Clásico (Pregunta a Pregunta)
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => handleStartQuiz(true)} 
                    className="glow-btn start-quiz-btn"
                    disabled={selectedTopicMode === 'custom' && customSelectedTopicIds.length === 0}
                    style={{ flex: '1 1 200px', background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', borderColor: 'var(--secondary-light)' }}
                  >
                    Simulacro en Papel (Interactivo)
                    <BookOpen size={18} style={{ marginLeft: '8px' }} />
                  </button>
                  <button 
                    type="button"
                    onClick={handlePreparePrintExam} 
                    className="glow-btn-secondary"
                    disabled={selectedTopicMode === 'custom' && customSelectedTopicIds.length === 0}
                    style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Printer size={16} />
                    Imprimir Examen (PDF)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : quizFinished ? (
        /* Quiz finished score view */
        <div className="quiz-result-card glass-panel scale-in">
          <Award size={64} className="text-gradient-gold result-icon" />
          <h2>¡Cuestionario Completado!</h2>
          
          <div className="result-score-circle">
            <span className="result-score-digits">{score} / {questions.length}</span>
            <span className="result-score-pct">{Math.round((score / questions.length) * 100)}%</span>
          </div>

          <p className="result-comment text-muted">
            {score / questions.length >= 0.8 
              ? '¡Excelente puntuación! Vas por muy buen camino.' 
              : score / questions.length >= 0.5 
              ? 'Buen intento. Repasa los conceptos clave para asegurar el aprobado.' 
              : 'Necesitas reforzar esta materia. Vuelve a leer el tema detalladamente.'}
          </p>

          <div className="result-actions">
            <button onClick={() => handleStartQuiz(isPaperInteractiveMode)} className="glow-btn">
              <RotateCcw size={16} />
              Repetir Test
            </button>
            <button onClick={handleRestart} className="glow-btn-secondary">
              Cambiar de Tema
            </button>
          </div>
        </div>
      ) : isPrintPreviewMode ? (
        /* Print Preview Mode for Exams */
        <div className="print-preview-container fade-in" style={{ display: 'flex', flexDirection: 'column', width: '100%', border: 'none', background: 'transparent' }}>
          <div className="print-preview-header">
            <div>
              <h4 style={{ margin: 0 }}>Vista Previa del Examen Imprimible</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Batería de {questions.length} preguntas seleccionadas de los temas: {selectedTopicMode === 'custom' ? customSelectedTopicIds.join(', ') : selectedTopicMode === 'simulacro-40' ? '1 al 20 (Simulacro Tipo)' : selectedTopicMode === 'simulacro-oficial' ? `Simulacro Predefinido Nº ${selectedSimulacroNums[0]}` : selectedTopicMode === 'examen-real-2019' ? 'Examen Oficial Real de 2019' : selectedTopicMode === 'examen-real-2022' ? 'Examen Oficial Real de 2022' : singleTopicId}.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRestart} 
                className="glow-btn-secondary" 
                style={{ padding: '8px 16px' }}
              >
                Volver a Configurar
              </button>
              <button 
                onClick={() => window.print()} 
                className="glow-btn" 
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} />
                Imprimir Examen (PDF)
              </button>
            </div>
          </div>
          
          <div className="print-preview-content">
            <div className="printable-exam-sheet">
              {/* PAGE 1: QUESTIONS (FRONT) */}
              <div className="exam-questions-section">
                <div className="exam-metadata-header">
                  <h2>{selectedTopicMode === 'simulacro-40' ? 'SIMULACRO DE EXAMEN (40 PREGUNTAS)' : selectedTopicMode === 'simulacro-oficial' ? `SIMULACRO PREDEFINIDO Nº ${selectedSimulacroNums[0]} (40 PREGUNTAS)` : selectedTopicMode === 'examen-real-2019' ? 'EXAMEN OFICIAL REAL DE 2019 (40 PREGUNTAS)' : selectedTopicMode === 'examen-real-2022' ? 'EXAMEN OFICIAL REAL DE 2022 (38 PREGUNTAS)' : 'SIMULACRO DE EXAMEN - OPOSICIONES BUS'}</h2>
                  <p style={{ textAlign: 'center', margin: 0, fontSize: '0.9rem', color: '#555' }}>
                    Técnico/a Auxiliar de Biblioteca, Archivo y Museo - Universidad de Sevilla
                  </p>
                  <div className="exam-metadata-grid">
                    <div className="metadata-field"><strong>Nombre y Apellidos:</strong> </div>
                    <div className="metadata-field"><strong>Fecha:</strong> </div>
                    <div className="metadata-field"><strong>Puntuación:</strong> _________</div>
                  </div>
                </div>

                <div className="questions-print-list" style={{ marginTop: '20px' }}>
                  {questions.map((q, index) => (
                    <div key={index} className="printable-question-item">
                      <div className="printable-question-text">
                        {index + 1}. {q.question}
                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                          (Tema {q.topicId})
                        </span>
                      </div>
                      <div className="printable-options-list">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="printable-option-item">
                            <div className="option-checkbox-box"></div>
                            <span><strong>{['A', 'B', 'C', 'D'][idx]})</strong> {opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAGE BREAK FOR DOUBLE-SIDED PRINTING */}
              <div className="print-page-break"></div>

              {/* PAGE 2: ANSWERS & EXPLANATIONS (BACK) */}
              <div className="printable-answers-section" style={{ marginTop: '30px' }}>
                <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'black', fontSize: '1.4rem', fontWeight: 'bold' }}>
                    PLANTILLA DE RESPUESTAS CORRECTAS Y EXPLICACIONES
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>
                    Utilice este solucionario para auto-corregir su examen escrito.
                  </p>
                </div>

                <div className="answers-print-list">
                  {questions.map((q, index) => {
                    const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer];
                    return (
                      <div key={index} className="printable-answer-row">
                        <div className="printable-answer-num">
                          Pregunta {index + 1}: Respuesta Correcta <strong style={{ textDecoration: 'underline', fontSize: '1.1rem' }}>{correctLetter}</strong>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                            (Tema {q.topicId})
                          </span>
                        </div>
                        <div className="printable-answer-explanation">
                          <strong>Justificación:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isExamsPrintMode ? (
        /* Multi Mock Exams Print Preview Mode */
        <div className="print-preview-container fade-in" style={{ display: 'flex', flexDirection: 'column', width: '100%', border: 'none', background: 'transparent' }}>
          <div className="print-preview-header">
            <div>
              <h4 style={{ margin: 0 }}>Vista Previa de Simulacros Predefinidos</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Compilación de {compiledExamsContent.length} simulacros de examen predefinidos (40 preguntas por examen).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRestart} 
                className="glow-btn-secondary" 
                style={{ padding: '8px 16px' }}
              >
                Volver a Configurar
              </button>
              <button 
                onClick={() => window.print()} 
                className="glow-btn" 
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} />
                Imprimir Simulacros (PDF)
              </button>
            </div>
          </div>
          
          <div className="print-preview-content">
            {/* Portada del Dossier de Simulacros */}
            <div className="print-manual-cover printable-exam-sheet" style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '15mm 30px 15mm 30px', border: '4px double #1e3a8a', height: '235mm', textAlign: 'center', fontFamily: "'Inter', sans-serif", margin: '0 auto', maxWidth: '600px', pageBreakAfter: 'always', breakAfter: 'page' }}>
              <div style={{ color: '#1e3a8a', fontWeight: '800', fontSize: '13pt', letterSpacing: '3px', textTransform: 'uppercase' }}>Dossier de Preparación de Oposiciones</div>
              <div style={{ width: '60px', height: '3px', backgroundColor: '#3b82f6', margin: '15px auto 25px auto' }}></div>
              <h1 style={{ fontSize: '22pt', fontWeight: '800', color: '#000', lineHeight: '1.25', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dossier de Simulacros de Examen</h1>
              <h2 style={{ fontSize: '14pt', fontWeight: '700', color: '#2563eb', margin: '0 0 25px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Técnico/a Auxiliar de Biblioteca, Archivo y Museo</h2>
              
              <div style={{ fontSize: '9.5pt', color: '#333', maxWidth: '500px', lineHeight: '1.5', margin: '0 auto 15px auto', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #2563eb', textAlign: 'justify', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <strong>Introducción y Exención de Responsabilidad:</strong> Este dossier recopila una serie de simulacros de examen predefinidos y equilibrados para la preparación de las oposiciones de Técnico/a Auxiliar de Biblioteca, Archivo y Museo de la Universidad de Sevilla. 
                <br/><br/>
                Cada simulacro consta de **40 preguntas de opción múltiple** con una distribución paritaria de **2 preguntas por cada uno de los 20 temas** del programa de la convocatoria. Se incluye al final de cada examen su correspondiente solucionario y hoja de justificaciones basadas en las normativas aplicables.
              </div>

              {/* Índice de Simulacros Incluidos */}
              <div style={{ marginTop: '20px', width: '100%', textAlign: 'left', flexGrow: 1 }}>
                <h3 style={{ fontSize: '11pt', color: '#1e3a8a', borderBottom: '1px solid #1e3a8a', paddingBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Índice de Simulacros Incluidos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
                  {compiledExamsContent.map(examBlock => (
                    <div key={examBlock.examNum} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ccc', padding: '4px 0', fontSize: '9pt' }}>
                      <span style={{ fontWeight: '600', color: '#1e3a8a' }}>Simulacro Predefinido Nº {examBlock.examNum}</span>
                      <span style={{ color: '#666', fontWeight: 'bold' }}>40 preguntas</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '9.5pt', color: '#555', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <span>© 2026 Jgg. Todos los derechos reservados.</span>
              </div>
            </div>
            
            {/* Salto de página tras la portada */}
            <div className="print-page-break"></div>

            {/* Loop through each compiled exam */}
            {compiledExamsContent.map((examBlock, eIdx) => (
              <React.Fragment key={examBlock.examNum}>
                {/* Exam questions section */}
                <div className="printable-exam-sheet" style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: '20px' }}>
                  <div className="exam-metadata-header">
                    <h2>SIMULACRO PREDEFINIDO Nº {examBlock.examNum} (40 PREGUNTAS)</h2>
                    <p style={{ textAlign: 'center', margin: 0, fontSize: '0.9rem', color: '#555' }}>
                      Técnico/a Auxiliar de Biblioteca, Archivo y Museo - Universidad de Sevilla
                    </p>
                    <div className="exam-metadata-grid">
                      <div className="metadata-field"><strong>Nombre y Apellidos:</strong> </div>
                      <div className="metadata-field"><strong>Fecha:</strong> </div>
                      <div className="metadata-field"><strong>Puntuación:</strong> _________</div>
                    </div>
                  </div>

                  <div className="questions-print-list" style={{ marginTop: '20px' }}>
                    {examBlock.questions.map((q, idx) => (
                      <div key={idx} className="printable-question-item">
                        <div className="printable-question-text">
                          {idx + 1}. {q.question}
                          <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                            (Tema {q.topicId})
                          </span>
                        </div>
                        <div className="printable-options-list">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="printable-option-item">
                              <div className="option-checkbox-box"></div>
                              <span><strong>{['A', 'B', 'C', 'D'][oIdx]})</strong> {opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page break to solved section for this exam */}
                <div className="print-page-break"></div>

                {/* Solved section for this exam */}
                <div className="printable-answers-section" style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: '20px' }}>
                  <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'black', fontSize: '1.4rem', fontWeight: 'bold' }}>
                      PLANTILLA DE RESPUESTAS Y EXPLICACIONES: SIMULACRO Nº {examBlock.examNum}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>
                      Utilice este solucionario para auto-corregir su examen escrito.
                    </p>
                  </div>

                  <div className="answers-print-list">
                    {examBlock.questions.map((q, idx) => {
                      const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer];
                      return (
                        <div key={idx} className="printable-answer-row">
                          <div className="printable-answer-num">
                            Pregunta {idx + 1}: Respuesta Correcta <strong style={{ textDecoration: 'underline', fontSize: '1.1rem' }}>{correctLetter}</strong>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                              (Tema {q.topicId})
                            </span>
                          </div>
                          <div className="printable-answer-explanation">
                            <strong>Justificación:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Page break before next exam (only if it's not the last one) */}
                {eIdx < compiledExamsContent.length - 1 && <div className="print-page-break"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : isTestBookPrintMode ? (
        /* Test Book Print Preview Mode */
        <div className="print-preview-container fade-in" style={{ display: 'flex', flexDirection: 'column', width: '100%', border: 'none', background: 'transparent' }}>
          <div className="print-preview-header">
            <div>
              <h4 style={{ margin: 0 }}>Vista Previa del Cuaderno de Tests</h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Compilación de cuestionarios de autoevaluación por temas. Cantidad de preguntas por tema: {questionLimit === 120 ? 'Todas (120)' : questionLimit}.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRestart} 
                className="glow-btn-secondary" 
                style={{ padding: '8px 16px' }}
              >
                Volver a Configurar
              </button>
              <button 
                onClick={() => window.print()} 
                className="glow-btn" 
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} />
                Imprimir Cuaderno (PDF)
              </button>
            </div>
          </div>
          
          <div className="print-preview-content">
            {/* Cover page for the Test Book PDF */}
            <div className="print-manual-cover printable-exam-sheet" style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '15mm 30px 15mm 30px', border: '4px double #1e3a8a', height: '235mm', textAlign: 'center', fontFamily: "'Inter', sans-serif", margin: '0 auto', maxWidth: '600px', pageBreakAfter: 'always', breakAfter: 'page' }}>
              <div style={{ color: '#1e3a8a', fontWeight: '800', fontSize: '13pt', letterSpacing: '3px', textTransform: 'uppercase' }}>Dossier de Preparación de Oposiciones</div>
              <div style={{ width: '60px', height: '3px', backgroundColor: '#3b82f6', margin: '15px auto 25px auto' }}></div>
              <h1 style={{ fontSize: '22pt', fontWeight: '800', color: '#000', lineHeight: '1.25', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cuaderno de Tests y Solucionario</h1>
              <h2 style={{ fontSize: '14pt', fontWeight: '700', color: '#2563eb', margin: '0 0 25px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Técnico/a Auxiliar de Biblioteca, Archivo y Museo</h2>
              
              <div style={{ fontSize: '9.5pt', color: '#333', maxWidth: '500px', lineHeight: '1.5', margin: '0 auto 15px auto', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #2563eb', textAlign: 'justify', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <strong>Introducción y Exención de Responsabilidad:</strong> Este cuaderno de autoevaluación ha sido elaborado de forma independiente como material de apoyo didáctico para la preparación de las oposiciones de Técnico/a Auxiliar de Biblioteca, Archivo y Museo (Grupo IV) de la Universidad de Sevilla. 
                <br/><br/>
                Contiene una selección de cuestionarios tipo test por temas extraídos del pool de preparación, con sus correspondientes plantillas de soluciones y justificaciones redactadas a partir de normativas vigentes (Convenio Colectivo, LOSU, Ley de Prevención de Riesgos Laborales, etc.). El uso de este material es responsabilidad exclusiva del opositor en su proceso de estudio.
              </div>

              {/* Index of included topics */}
              <div style={{ marginTop: '20px', width: '100%', textAlign: 'left', flexGrow: 1 }}>
                <h3 style={{ fontSize: '11pt', color: '#1e3a8a', borderBottom: '1px solid #1e3a8a', paddingBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Índice de Cuestionarios Incluidos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '75mm', overflow: 'hidden' }}>
                  {testBookContent.map(block => (
                    <div key={block.topicId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ccc', padding: '4px 0', fontSize: '9pt' }}>
                      <span style={{ fontWeight: '600', color: '#1e3a8a', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '380px' }}>
                        Tema {block.topicId.toString().padStart(2, '0')}: {block.topicTitle}
                      </span>
                      <span style={{ color: '#666', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{block.questions.length} preguntas</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '9.5pt', color: '#555', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <span>© 2026 Jgg. Todos los derechos reservados.</span>
              </div>
            </div>
            
            {/* Page break before starting the content */}
            <div className="print-page-break"></div>

            {testBookContent.map((block, bIdx) => (
              <React.Fragment key={block.topicId}>
                {/* Topic questionnaire section */}
                <div className="printable-exam-sheet" style={{ pageBreakBefore: bIdx > 0 ? 'always' : 'auto', breakBefore: bIdx > 0 ? 'page' : 'auto', paddingTop: '20px' }}>
                  <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px', textAlign: 'left' }}>
                    <span style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase' }}>Cuestionario de Autoevaluación</span>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 'bold', color: 'black' }}>
                      Tema {block.topicId}: {block.topicTitle}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>
                      Responda a las siguientes {block.questions.length} preguntas de opción múltiple.
                    </p>
                  </div>
                  
                  <div className="questions-print-list" style={{ marginTop: '20px' }}>
                    {block.questions.map((q, idx) => (
                      <div key={idx} className="printable-question-item">
                        <div className="printable-question-text">
                          {idx + 1}. {q.question}
                        </div>
                        <div className="printable-options-list">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="printable-option-item">
                              <div className="option-checkbox-box"></div>
                              <span><strong>{['A', 'B', 'C', 'D'][oIdx]})</strong> {opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Page break to solved section */}
                <div className="print-page-break"></div>
                
                {/* Topic answers and explanations section */}
                <div className="printable-answers-section" style={{ paddingTop: '20px' }}>
                  <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px', textAlign: 'left' }}>
                    <span style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase' }}>Solucionario</span>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 'bold', color: 'black' }}>
                      Respuestas y Explicaciones: Tema {block.topicId}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>
                      Plantilla de respuestas y justificaciones legales para el Tema {block.topicId}.
                    </p>
                  </div>
                  
                  <div className="answers-print-list">
                    {block.questions.map((q, idx) => {
                      const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer];
                      return (
                        <div key={idx} className="printable-answer-row">
                          <div className="printable-answer-num">
                            Pregunta {idx + 1}: Respuesta Correcta <strong style={{ textDecoration: 'underline', fontSize: '1.1rem' }}>{correctLetter}</strong>
                          </div>
                          <div className="printable-answer-explanation">
                            <strong>Justificación:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Page break after each topic block */}
                <div className="print-page-break"></div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : isPaperInteractiveMode ? (
        /* Interactive Paper Exam Mode */
        <div className="paper-exam-container fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
              <div className="print-preview-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Modo Examen en Papel (Interactivo)</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Responde directamente sobre las hojas simuladas del examen. Haz clic sobre cada opción para marcar tu respuesta con una cruz.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={handleRestart} 
                    className="glow-btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Volver a Configurar
                  </button>
                  
                  {!paperExamSubmitted ? (
                    <button 
                      onClick={handleSubmitPaperExam} 
                      className="glow-btn" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>Finalizar Examen y Corregir</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartQuiz(true)} 
                      className="glow-btn" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RotateCcw size={14} />
                      <span>Repetir Examen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Results Summary Box if submitted */}
              {paperExamSubmitted && (
                <div className="results-summary-paper-card glass-panel fade-in" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <Award size={36} className="text-gradient-gold" style={{ flexShrink: 0 }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Examen Corregido</h3>
                      <p className="text-muted" style={{ fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                        Resultados detallados y penalización aplicada (cada error resta 1/4 del valor de una respuesta correcta; las preguntas en blanco no restan puntos).
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                    gap: '12px', 
                    width: '100%' 
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Total Preguntas</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalQuestions}</div>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Contestadas</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{answeredCount}</div>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>En Blanco</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#94a3b8' }}>{blankCount}</div>
                    </div>
                    
                    <div style={{ background: 'rgba(16,185,129,0.06)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Aciertos</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{correctCount}</div>
                    </div>
                    
                    <div style={{ background: 'rgba(239,68,68,0.06)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-rose)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Errores</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-rose)' }}>{incorrectCount}</div>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Porcentaje</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{percentage}%</div>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(245,158,11,0.05) 100%)', 
                      padding: '12px 18px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--secondary)', 
                      textAlign: 'center',
                      gridColumn: 'span 2',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Puntuación Final</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary-light)', margin: '2px 0' }}>
                        {scoreOver65.toFixed(2)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ 65.00</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Fórmula: (Aciertos - Errores / 4) × (65 / {totalQuestions}) <br />
                        [Acierto = +{(65 / totalQuestions).toFixed(2)} ptos | Error = -{(65 / totalQuestions / 4).toFixed(3)} ptos | Blanco = 0 ptos]
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="print-preview-content" style={{ padding: '40px 50px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', width: '100%', maxHeight: 'none', boxSizing: 'border-box' }}>
                <div className="printable-exam-sheet">
                  {/* Header inside paper */}
                  <div className="exam-metadata-header" style={{ borderBottom: '2px solid black', paddingBottom: '16px', marginBottom: '28px' }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: '800', textAlign: 'center', color: 'black' }}>
                      {selectedTopicMode === 'simulacro-40' ? 'SIMULACRO DE EXAMEN (40 PREGUNTAS)' : selectedTopicMode === 'simulacro-oficial' ? `SIMULACRO PREDEFINIDO Nº ${selectedSimulacroNums[0]} (40 PREGUNTAS)` : selectedTopicMode === 'examen-real-2019' ? 'EXAMEN OFICIAL REAL DE 2019 (40 PREGUNTAS)' : selectedTopicMode === 'examen-real-2022' ? 'EXAMEN OFICIAL REAL DE 2022 (38 PREGUNTAS)' : 'SIMULACRO DE EXAMEN - OPOSICIONES BUS'}
                    </h2>
                    <p style={{ textAlign: 'center', margin: 0, fontSize: '0.85rem', color: '#555', fontWeight: '600' }}>
                      Técnico/a Auxiliar de Biblioteca, Archivo y Museo - Universidad de Sevilla
                    </p>
                    <div className="exam-metadata-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', fontSize: '0.85rem', marginTop: '16px' }}>
                      <div className="metadata-field" style={{ borderBottom: '1px solid #666', paddingBottom: '4px' }}>
                        <strong>Nombre y Apellidos:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{progress.name || 'Estudiante'}</span>
                      </div>
                      <div className="metadata-field" style={{ borderBottom: '1px solid #666', paddingBottom: '4px' }}>
                        <strong>Fecha:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{new Date().toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="metadata-field" style={{ borderBottom: '1px solid #666', paddingBottom: '4px' }}>
                        <strong>Puntuación:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 'bold' }}>{paperExamSubmitted ? `${scoreOver65.toFixed(2)}/65.00 (${Math.round((score/questions.length)*100)}%)` : '_________'}</span>
                      </div>
                    </div>
                  </div>

              {/* Questions List */}
              <div className="questions-print-list">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="paper-exam-question" style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px dashed #e2e8f0', pageBreakInside: 'avoid' }}>
                    <div className="printable-question-text" style={{ fontWeight: '700', fontSize: '1.05rem', color: 'black', marginBottom: '12px', lineHeight: '1.4' }}>
                      {qIndex + 1}. {q.question}
                      <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#666', marginLeft: '8px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                        Tema {q.topicId}
                      </span>
                    </div>

                    <div className="printable-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px' }}>
                      {q.options.map((opt, optIndex) => {
                        const isSelected = userAnswers[qIndex] === optIndex;
                        const isCorrect = optIndex === q.correctAnswer;
                        
                        let itemStyle = {
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: paperExamSubmitted ? 'default' : 'pointer',
                          fontSize: '0.92rem',
                          color: '#334155',
                          transition: 'all 0.15s ease',
                          border: '1px solid transparent'
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

                        if (paperExamSubmitted) {
                          if (isCorrect) {
                            itemStyle.backgroundColor = '#dcfce7'; // green bg
                            itemStyle.color = '#14532d';
                            itemStyle.border = '1px solid #bbf7d0';
                            boxStyle.borderColor = '#16a34a';
                            boxStyle.backgroundColor = '#16a34a';
                            boxStyle.color = 'white';
                          } else if (isSelected && !isCorrect) {
                            itemStyle.backgroundColor = '#fee2e2'; // red bg
                            itemStyle.color = '#7f1d1d';
                            itemStyle.border = '1px solid #fecaca';
                            boxStyle.borderColor = '#dc2626';
                            boxStyle.backgroundColor = '#dc2626';
                            boxStyle.color = 'white';
                          }
                        } else {
                          if (isSelected) {
                            itemStyle.backgroundColor = '#eff6ff'; // blue outline
                            itemStyle.border = '1px solid #bfdbfe';
                            boxStyle.borderColor = '#1d4ed8';
                            boxStyle.backgroundColor = '#1d4ed8';
                            boxStyle.color = 'white';
                          }
                        }

                        const handleOptionSelect = () => {
                          if (paperExamSubmitted) return;
                          setUserAnswers(prev => {
                            const next = [...prev];
                            next[qIndex] = optIndex;
                            return next;
                          });
                        };

                        return (
                          <div 
                            key={optIndex} 
                            onClick={handleOptionSelect}
                            className={`paper-option-item-container ${!paperExamSubmitted ? 'hoverable-option' : ''}`}
                            style={itemStyle}
                          >
                            <div style={boxStyle}>
                              {paperExamSubmitted ? (
                                isCorrect ? '✓' : isSelected ? '✗' : ''
                              ) : (
                                isSelected ? 'X' : ''
                              )}
                            </div>
                            <span style={{ lineHeight: '1.4' }}>
                              <strong>{['A', 'B', 'C', 'D'][optIndex]})</strong> {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation if submitted */}
                    {paperExamSubmitted && (
                      <div className="paper-explanation-box fade-in" style={{ marginTop: '16px', marginLeft: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #94a3b8', borderRadius: '4px', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                        <strong>Justificación:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit button at bottom */}
              {!paperExamSubmitted && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid black' }}>
                  <button 
                    onClick={handleSubmitPaperExam} 
                    className="glow-btn"
                    style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '30px' }}
                  >
                    <span>Finalizar Examen y Corregir</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Running quiz view */
        <div className="quiz-running-card glass-panel scale-in">
          <header className="quiz-running-header">
            <div className="quiz-progress-text">
              <span>Pregunta <strong>{currentQuestionIndex + 1}</strong> de {questions.length}</span>
              <span className="divider">|</span>
              <span className="text-primary-light">
                {selectedTopicMode === 'custom' 
                  ? `Tema ${questions[currentQuestionIndex].topicId}` 
                  : `Tema ${singleTopicId}`}
              </span>
            </div>
            <div className="quiz-score-badge">
              Aciertos: {score} / {currentQuestionIndex + (answered ? 1 : 0)}
            </div>
          </header>

          <div className="question-content">
            <div className="question-text-wrapper">
              <HelpCircle className="question-icon" size={24} />
              <h4>{questions[currentQuestionIndex].question}</h4>
            </div>

            <div className="options-list">
              {questions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === questions[currentQuestionIndex].correctAnswer;
                
                let optionClass = '';
                if (answered) {
                  if (isCorrect) {
                    optionClass = 'correct'; // green border/bg
                  } else if (isSelected) {
                    optionClass = 'incorrect'; // red border/bg
                  } else {
                    optionClass = 'disabled'; // gray out other options
                  }
                } else {
                  optionClass = 'interactive';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerClick(idx)}
                    disabled={answered}
                    className={`option-btn ${optionClass}`}
                  >
                    <span className="option-letter">{['A', 'B', 'C', 'D'][idx]}</span>
                    <span className="option-text">{option}</span>
                    {answered && isCorrect && <CheckCircle2 size={16} className="option-status-icon correct" />}
                    {answered && isSelected && !isCorrect && <XCircle size={16} className="option-status-icon incorrect" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="explanation-card fade-in">
                <h5>Retroalimentación y Justificación:</h5>
                <p>{questions[currentQuestionIndex].explanation}</p>
                <button onClick={handleNext} className="glow-btn next-question-btn">
                  {currentQuestionIndex + 1 < questions.length ? 'Siguiente Pregunta' : 'Ver Resultados'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
