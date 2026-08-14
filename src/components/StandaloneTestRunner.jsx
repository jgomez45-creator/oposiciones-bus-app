import React, { useState, useEffect } from 'react';
import { CheckCircle2, Award, Sparkles, BookOpen } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function StandaloneTestRunner({ testData, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultDetails, setResultDetails] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado para guardar el email silencioso si llega por URL
  const [studentEmail, setStudentEmail] = useState('');

  // Efecto para buscar si ya está identificado por URL o localStorage (Invisible)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('u') || urlParams.get('e') || urlParams.get('email');
      
      let savedIdent = localStorage.getItem('bus_student_real_email');
      
      if (emailParam) {
        const decoded = decodeURIComponent(emailParam);
        setStudentEmail(decoded);
        localStorage.setItem('bus_student_real_email', decoded);
      } else if (savedIdent && savedIdent.includes('@')) {
        setStudentEmail(savedIdent);
      }
    } catch (_) {}
  }, []);

  if (!testData || !Array.isArray(testData.questions) || testData.questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textTransform: 'none', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '30px', maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#fca5a5', margin: '0 0 10px 0' }}>⚠️ Enlace de Test Inválido o Expirado</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>El enlace utilizado no contiene preguntas válidas. Por favor, solicita de nuevo el enlace al preparador.</p>
        </div>
      </div>
    );
  }

  const { title = 'Test de Evaluación de la BUS', questions = [], summaryText = '' } = testData;

  const handleSelectOption = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (submitted || submitting) return;

    setSubmitting(true);
    let score = 0;
    let answeredCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let blankCount = 0;
    const details = [];

    questions.forEach((q, index) => {
      const selected = answers[index];
      const correct = q.correctAnswer;
      let isCorrect = false;

      if (selected !== undefined) {
        answeredCount++;
        if (selected === correct) {
          score += 1;
          correctCount++;
          isCorrect = true;
        } else {
          score -= 0.33;
          incorrectCount++;
        }
      } else {
        blankCount++;
      }

      details.push({
        questionId: q.id || `q_${index}`,
        selectedAnswer: selected !== undefined ? selected : null,
        correctAnswer: correct,
        isCorrect: isCorrect
      });
    });

    const maxScore = questions.length;
    const finalScore = Math.max(0, score).toFixed(2);
    setResultScore(finalScore);
    setResultDetails(details);
    setSubmitted(true);
    setSubmitting(false);

    // Identificación silenciosa por huella de dispositivo, parámetro de URL o formulario
    let studentIdent = studentEmail; // Usar el email que introdujo en el formulario (o cargado por URL)
    
    if (!studentIdent || !studentIdent.includes('@')) {
      try { studentIdent = localStorage.getItem('bus_student_real_email'); } catch (_) {}
      
      if (!studentIdent) {
        // Fallback en caso extremadamente raro
        const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
        studentIdent = `Alumno (Anónimo #${randomHash})`;
      }
    }

    // Telemetría silenciosa a Cloud Firestore / LocalStorage
    const payloadObj = {
      id: 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      studentId: studentIdent,
      title: title,
      score: parseFloat(finalScore),
      maxScore: maxScore,
      timestamp: new Date().toISOString(),
      details: details
    };

    try {
      const mockKey = 'bus_mock_test_results';
      const raw = localStorage.getItem(mockKey) || '[]';
      const list = JSON.parse(raw);
      list.unshift(payloadObj);
      localStorage.setItem(mockKey, JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    const projectID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'oposiciones-bus-app';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectID}/databases/(default)/documents/test_results`;
    const docData = {
      fields: {
        studentId: { stringValue: studentIdent },
        title: { stringValue: title },
        score: { doubleValue: parseFloat(finalScore) },
        maxScore: { doubleValue: maxScore },
        timestamp: { timestampValue: payloadObj.timestamp },
        details: { stringValue: JSON.stringify(details) }
      }
    };

    fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    }).catch(e => console.error("Telemetry error:", e));
  };

  const percentage = Math.max(0, Math.round((parseFloat(resultScore) / questions.length) * 100));

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif", padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '840px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* HEADER */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} style={{ color: '#f59e0b' }} />
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{title}</h1>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Test Ejecutable de Examen Oficial de la Universidad de Sevilla</span>
        </div>

        {/* RESUMEN DEL TEMA SI EXISTE */}
        {summaryText && (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '20px 24px' }}>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '8px' }}>
              <BookOpen size={18} />
              <span>📌 Resumen Ejecutivo y Puntos Clave del Tema</span>
            </div>
            <div
              style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#cbd5e1' }}
              dangerouslySetInnerHTML={{ __html: summaryText }}
            />
          </div>
        )}

        {/* CUESTIONARIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, qIdx) => {
            const selectedOpt = answers[qIdx];
            const isCorrectAnswer = selectedOpt === q.correctAnswer;

            return (
              <div key={q.id || qIdx} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', lineHeight: '1.45' }}>
                  {qIdx + 1}. {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isRightOption = optIdx === q.correctAnswer;
                    
                    let bg = 'rgba(15, 23, 42, 0.6)';
                    let border = '1px solid rgba(255, 255, 255, 0.12)';
                    let color = '#cbd5e1';

                    if (submitted) {
                      if (isRightOption) {
                        bg = 'rgba(34, 197, 94, 0.25)';
                        border = '1px solid #22c55e';
                        color = '#4ade80';
                      } else if (isSelected && !isRightOption) {
                        bg = 'rgba(239, 68, 68, 0.25)';
                        border = '1px solid #ef4444';
                        color = '#fca5a5';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(59, 130, 246, 0.25)';
                      border = '1px solid #3b82f6';
                      color = '#60a5fa';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          background: bg,
                          border: border,
                          color: color,
                          fontSize: '0.95rem',
                          cursor: submitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="radio"
                          name={`standalone_q_${qIdx}`}
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={submitted}
                          style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* JUSTIFICACIÓN PEDAGÓGICA AL CORREGIR */}
                {submitted && (
                  <div style={{ marginTop: '6px', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.12)', borderLeft: '4px solid #22c55e', borderRadius: '8px', color: '#86efac', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    <strong>Concepto Clave y Justificación Legal:</strong><br />
                    {q.explanation || 'Fundamento de la norma aplicable según la regulación oficial de la BUS.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTÓN SUBMIT O NOTA FINAL */}
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '800',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'Corregiendo test...' : '✅ Corregir y Finalizar Test'}
          </button>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Award size={36} style={{ color: '#34d399', margin: '0 auto' }} />
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#4ade80' }}>
              Nota Final: {resultScore} / {questions.length} ({percentage}%)
            </h2>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>
              {percentage >= 50 ? '🎉 ¡Enhorabuena! Has superado la prueba.' : '💡 Sigue repasando los puntos clave para asegurar la plaza.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
