import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  BookOpen, 
  ShieldAlert, 
  Key, 
  RefreshCw, 
  Search, 
  Copy, 
  Plus, 
  Activity, 
  Wifi, 
  Check, 
  ShieldCheck, 
  X,
  Trash2,
  Library,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ListFilter,
  CheckSquare,
  Square,
  FileText
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import quizzesData from '../data/quizzes.json';
import topicsData from '../data/topics.json';
import { generateNewQuestionsForTopic, checkDuplicated, generateQuestionId, extractTopicHeadings } from '../services/testGeneratorEngine';

export default function AdminPanel({ topics }) {
  const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats' | 'users' | 'codes' | 'generator' | 'bank'
  const [users, setUsers] = useState([]);
  const [bookCodes, setBookCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search and filters
  const [userSearch, setUserSearch] = useState('');
  const [codeFilter, setCodeFilter] = useState('all'); // 'all' | 'used' | 'unused'
  const [codeSearch, setCodeSearch] = useState('');
  
  // Code generation state
  const [codesCount, setCodesCount] = useState(50);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Generator state
  const [selectedGenTopicId, setSelectedGenTopicId] = useState('1');
  const [availableHeadings, setAvailableHeadings] = useState([]);
  const [selectedHeadings, setSelectedHeadings] = useState('all'); // 'all' | Array<string>
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState([]);
  const [savingBatch, setSavingBatch] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Bank Manager state
  const [bankTopicId, setBankTopicId] = useState('1');
  const [bankSearch, setBankSearch] = useState('');
  const [bankActionMsg, setBankActionMsg] = useState('');

  const activeTopicList = topics || topicsData;

  // Subscribe to real-time administrative data
  useEffect(() => {
    setLoading(true);
    setErrorMsg('');
    
    const unsubUsers = firebaseService.subscribeToAllUsers(
      (userList) => {
        setUsers(userList);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setErrorMsg('Error de permisos al acceder a los datos de la nube.');
        setLoading(false);
      }
    );

    const unsubCodes = firebaseService.subscribeToAllBookCodes(
      (codesList) => {
        setBookCodes(codesList);
      },
      (err) => {
        console.error(err);
      }
    );

    return () => {
      unsubUsers();
      unsubCodes();
    };
  }, []);

  // Fetch topic markdown headings whenever selectedGenTopicId changes
  useEffect(() => {
    const loadHeadings = async () => {
      const formattedNum = selectedGenTopicId.toString().padStart(2, '0');
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) {
          const text = await res.text();
          const headings = extractTopicHeadings(text);
          setAvailableHeadings(headings);
          setSelectedHeadings('all'); // reset to all by default
        }
      } catch (e) {
        console.warn('Could not load headings for topic', selectedGenTopicId, e);
        setAvailableHeadings([]);
        setSelectedHeadings('all');
      }
    };

    loadHeadings();
  }, [selectedGenTopicId]);

  const toggleSectionHeading = (headingText) => {
    if (selectedHeadings === 'all') {
      setSelectedHeadings([headingText]);
    } else {
      const isAlready = selectedHeadings.includes(headingText);
      if (isAlready) {
        const updated = selectedHeadings.filter(h => h !== headingText);
        setSelectedHeadings(updated.length === 0 ? 'all' : updated);
      } else {
        setSelectedHeadings([...selectedHeadings, headingText]);
      }
    }
  };

  const formatStudyTime = (totalSeconds) => {
    if (!totalSeconds) return '0m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isUserOnline = (user) => {
    if (!user.currentSessionId) return false;
    if (!user.lastActive) return true;
    const lastActiveTime = new Date(user.lastActive).getTime();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return lastActiveTime > tenMinutesAgo;
  };

  const handleKickUser = async (uid, name) => {
    if (window.confirm(`¿Estás seguro de que deseas cerrar la sesión activa de ${name}?`)) {
      try {
        await firebaseService.kickUserSession(uid);
        alert(`Sesión de ${name} cerrada correctamente.`);
      } catch (err) {
        console.error(err);
        alert('No se pudo cerrar la sesión.');
      }
    }
  };

  const handleDeleteUser = async (uid, name) => {
    if (window.confirm(`¿Estás seguro de que deseas ELIMINAR permanentemente a ${name}?`)) {
      try {
        await firebaseService.deleteUser(uid);
        alert(`Usuario ${name} eliminado correctamente.`);
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el usuario.');
      }
    }
  };

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (codesCount <= 0 || codesCount > 200) {
      alert('Introduce un número de códigos válido (entre 1 y 200).');
      return;
    }
    setGenerating(true);
    try {
      const newCodes = await firebaseService.generateNewBookCodes(codesCount);
      setGeneratedCodes(newCodes);
      setCopiedCodes(false);
    } catch (err) {
      console.error(err);
      alert('Error al generar los códigos.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyGeneratedCodes = () => {
    if (generatedCodes.length === 0) return;
    navigator.clipboard.writeText(generatedCodes.join('\n'))
      .then(() => setCopiedCodes(true))
      .catch(err => console.error('Error copiando:', err));
  };

  // ── ELIMINAR PREGUNTA DEL BANCO OFICIAL ─────────────────────────────
  const handleDeleteQuestionFromBank = (topicId, questionId, questionText) => {
    if (window.confirm(`¿Estás seguro de que deseas ELIMINAR del banco esta pregunta?\n\n"${questionText.substring(0, 80)}..."`)) {
      const currentList = quizzesData[topicId] || [];
      const updatedList = currentList.filter(q => q && q.id !== questionId);
      
      quizzesData[topicId] = updatedList;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quizzes-updated', { 
          detail: { topicId, deletedId: questionId } 
        }));
      }

      setBankActionMsg(`Pregunta eliminada con éxito del banco del Tema ${topicId}. Quedan ${updatedList.length} preguntas.`);
      setTimeout(() => setBankActionMsg(''), 4000);
    }
  };

  // ── GENERADOR DE TESTS IA ───────────────────────────────────────────
  const handleGenerateNewBatch = async () => {
    setIsGenerating(true);
    setSaveSuccessMsg('');
    try {
      const formattedNum = selectedGenTopicId.toString().padStart(2, '0');
      let markdownText = '';
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) markdownText = await res.text();
      } catch (e) {
        console.warn('Could not load markdown topic', e);
      }

      const topicObj = activeTopicList.find(t => t.id.toString() === selectedGenTopicId.toString()) || { title: `Tema ${selectedGenTopicId}` };
      
      const newQuestions = await generateNewQuestionsForTopic({
        topicId: selectedGenTopicId.toString(),
        topicTitle: topicObj.title,
        markdownText,
        count: genCount,
        selectedSections: selectedHeadings
      });

      setGeneratedBatch(newQuestions);
    } catch (err) {
      console.error(err);
      alert('Error al generar el lote de preguntas.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateBatchQuestion = (index, field, value) => {
    setGeneratedBatch(prev => {
      const updated = [...prev];
      const q = { ...updated[index] };
      if (field.startsWith('option_')) {
        const optIdx = parseInt(field.split('_')[1], 10);
        const letter = ['A', 'B', 'C', 'D'][optIdx];
        const newOptions = [...q.options];
        newOptions[optIdx] = `${letter}) ${value.replace(/^[A-D]\)\s*/, '')}`;
        q.options = newOptions;
      } else {
        q[field] = value;
      }
      updated[index] = q;
      return updated;
    });
  };

  const handleDeleteBatchQuestion = (index) => {
    setGeneratedBatch(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddManualQuestion = () => {
    const topicObj = activeTopicList.find(t => t.id.toString() === selectedGenTopicId.toString()) || { title: `Tema ${selectedGenTopicId}` };
    const newQ = {
      id: generateQuestionId(selectedGenTopicId),
      question: `Nueva cuestión sobre ${topicObj.title}...`,
      options: [
        'A) Opción A correcta',
        'B) Opción B alternativa',
        'C) Opción C alternativa',
        'D) Opción D alternativa'
      ],
      correctAnswer: 0,
      explanation: `Norma de aplicación del Tema ${selectedGenTopicId}.`,
      topicId: selectedGenTopicId.toString(),
      isGenerated: false,
      createdAt: new Date().toISOString()
    };
    setGeneratedBatch(prev => [newQ, ...prev]);
  };

  const handleSaveBatchToBank = async () => {
    if (generatedBatch.length === 0) return;
    setSavingBatch(true);
    setSaveSuccessMsg('');

    try {
      const currentList = quizzesData[selectedGenTopicId] || [];
      const updatedList = [...currentList, ...generatedBatch];
      
      // Update memory reference
      quizzesData[selectedGenTopicId] = updatedList;

      // Dispatch event to refresh app views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quizzes-updated', { 
          detail: { topicId: selectedGenTopicId, count: generatedBatch.length } 
        }));
      }

      setSaveSuccessMsg(`¡Éxito! Se han añadido ${generatedBatch.length} preguntas inéditas al banco del Tema ${selectedGenTopicId}. Ahora la batería tiene ${updatedList.length} preguntas.`);
      setGeneratedBatch([]);
    } catch (err) {
      console.error(err);
      alert('Error al guardar en el banco de preguntas.');
    } finally {
      setSavingBatch(false);
    }
  };

  // Metrics
  const registeredUsersCount = users.filter(u => u.uid !== 'guest_profile').length;
  const onlineUsersCount = users.filter(u => isUserOnline(u) && u.uid !== 'guest_profile').length;
  
  let studentsWithScores = 0;
  let scoresSum = 0;
  users.forEach(u => {
    if (u.uid !== 'guest_profile' && u.progress && u.progress.quizzes) {
      const quizKeys = Object.keys(u.progress.quizzes);
      if (quizKeys.length > 0) {
        studentsWithScores++;
        let userSum = 0;
        quizKeys.forEach(k => { userSum += (u.progress.quizzes[k].score || 0); });
        scoresSum += (userSum / quizKeys.length);
      }
    }
  });
  const averageGlobalScore = studentsWithScores > 0 ? (scoresSum / studentsWithScores).toFixed(1) : 'N/A';
  
  const totalCodesCount = bookCodes.length;
  const usedCodesCount = bookCodes.filter(c => c.used).length;
  const unusedCodesCount = totalCodesCount - usedCodesCount;

  const filteredUsers = users.filter(u => {
    if (u.uid === 'guest_profile') return false;
    const searchLower = userSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(searchLower) || 
           (u.email || '').toLowerCase().includes(searchLower) ||
           (u.bookCode || '').toLowerCase().includes(searchLower);
  });

  const filteredCodes = bookCodes.filter(c => {
    if (codeFilter === 'used' && !c.used) return false;
    if (codeFilter === 'unused' && c.used) return false;
    if (codeSearch) {
      const searchLower = codeSearch.toLowerCase();
      const codeMatch = c.code.toLowerCase().includes(searchLower);
      let userMatch = false;
      if (c.used && c.usedBy) {
        const user = users.find(u => u.uid === c.usedBy);
        if (user) {
          userMatch = (user.name || '').toLowerCase().includes(searchLower) || 
                      (user.email || '').toLowerCase().includes(searchLower);
        }
      }
      return codeMatch || userMatch;
    }
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aOnline = isUserOnline(a);
    const bOnline = isUserOnline(b);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    const aAdmin = a.role === 'admin';
    const bAdmin = b.role === 'admin';
    if (aAdmin && !bAdmin) return -1;
    if (!aAdmin && bAdmin) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Bank questions list
  const currentBankList = quizzesData[bankTopicId] || [];
  const filteredBankList = currentBankList.filter(q => {
    if (!q || !q.question) return false;
    if (!bankSearch) return true;
    const searchLower = bankSearch.toLowerCase();
    return (
      q.question.toLowerCase().includes(searchLower) ||
      (q.explanation || '').toLowerCase().includes(searchLower) ||
      q.options.some(opt => opt.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="admin-dashboard-container fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--secondary)' }} />
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>Panel de Control del Creador</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Supervisión global de estudiantes, códigos físicos, gestor del banco y generador de preguntas.
          </p>
        </div>
        
        {/* Sub-tabs Selector */}
        <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '12px', background: 'rgba(15,20,36,0.5)', flexWrap: 'wrap', gap: '4px' }}>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`tab-btn ${activeSubTab === 'stats' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'stats' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'users' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Estudiantes ({registeredUsersCount})
          </button>
          <button
            onClick={() => setActiveSubTab('codes')}
            className={`tab-btn ${activeSubTab === 'codes' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'codes' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Códigos
          </button>
          <button
            onClick={() => setActiveSubTab('bank')}
            className={`tab-btn ${activeSubTab === 'bank' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'bank' ? 'var(--secondary)' : 'transparent', color: activeSubTab === 'bank' ? '#000' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Library size={16} />
            <span>Banco de Preguntas</span>
          </button>
          <button
            onClick={() => setActiveSubTab('generator')}
            className={`tab-btn ${activeSubTab === 'generator' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'generator' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={16} />
            <span>Generar Tests</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUBTAB 5: GESTOR DEL BANCO DE PREGUNTAS (ELIMINAR / REVISAR) */}
      {activeSubTab === 'bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 163, 89, 0.3)', background: 'linear-gradient(135deg, rgba(212, 163, 89, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Library size={22} />
                  <span>Gestor del Banco de Preguntas</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Examina todas las preguntas existentes por tema, busca cuestiones específicas y elimina preguntas obsoletas o duplicadas.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Seleccionar Tema:</label>
                  <select
                    value={bankTopicId}
                    onChange={(e) => setBankTopicId(e.target.value)}
                    style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    {activeTopicList.map(t => (
                      <option key={t.id} value={t.id}>
                        Tema {t.id}: {t.title.length > 35 ? t.title.substring(0, 35) + '...' : t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ position: 'relative', marginTop: '18px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Buscar en la batería de preguntas..."
                    style={{ padding: '8px 12px 8px 36px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '240px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>
                📚 Banco oficial del Tema {bankTopicId}: <span style={{ color: 'var(--secondary)' }}>{currentBankList.length} preguntas en total</span>
              </span>
              {bankSearch && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mostrando {filteredBankList.length} coincidencias con "{bankSearch}"
                </span>
              )}
            </div>
          </div>

          {bankActionMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '10px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{bankActionMsg}</span>
            </div>
          )}

          {/* QUESTION CARDS LIST WITH DELETE BUTTON */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredBankList.length === 0 ? (
              <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px' }}>
                No se encontraron preguntas en el banco para este criterio de búsqueda.
              </div>
            ) : (
              filteredBankList.map((q, idx) => (
                <div key={q.id || idx} className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', background: 'rgba(212, 163, 89, 0.15)', padding: '2px 10px', borderRadius: '10px' }}>
                        Pregunta #{idx + 1}
                      </span>
                      {q.isGenerated && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: '600' }}>
                          ⚡ Inédita / Generada
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ID: {q.id}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestionFromBank(bankTopicId, q.id, q.question)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Eliminar permanentemente del banco"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar del Banco</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', lineHeight: '1.4' }}>
                    {q.question}
                  </div>

                  {/* Options Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    {q.options && q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            background: isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
                            color: isCorrect ? '#4ade80' : 'rgba(255,255,255,0.7)',
                            fontWeight: isCorrect ? '700' : '400'
                          }}
                        >
                          {opt} {isCorrect && '✓'}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', marginTop: '2px' }}>
                      <strong style={{ color: 'var(--secondary)' }}>Fuente:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: GENERADOR DE TESTS IA CON SELECCIÓN DE EPÍGRAFES */}
      {activeSubTab === 'generator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Row 1: Title and Main Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fef08a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={22} style={{ color: '#f59e0b' }} />
                    <span>Generador e Incorporador de Tests Inéditos</span>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Sintetiza preguntas inéditas por tema y enfoca la generación seleccionando epígrafes o apartados específicos.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tema de destino:</label>
                    <select
                      value={selectedGenTopicId}
                      onChange={(e) => setSelectedGenTopicId(e.target.value)}
                      style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      {activeTopicList.map(t => (
                        <option key={t.id} value={t.id}>
                          Tema {t.id}: {t.title.length > 35 ? t.title.substring(0, 35) + '...' : t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Preguntas a generar:</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                      style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      <option value={5}>5 preguntas inéditas</option>
                      <option value={10}>10 preguntas inéditas</option>
                      <option value={15}>15 preguntas inéditas</option>
                      <option value={20}>20 preguntas inéditas</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateNewBatch}
                    disabled={isGenerating}
                    style={{
                      marginTop: '18px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      fontWeight: '800',
                      border: 'none',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{isGenerating ? 'Sintetizando...' : '⚡ Generar Preguntas Inéditas'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddManualQuestion}
                    style={{
                      marginTop: '18px',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Plus size={16} />
                    <span>Añadir Manual</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Section / Headings Selector */}
              {availableHeadings.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListFilter size={16} style={{ color: 'var(--secondary)' }} />
                      <span>Enfoque por Puntos / Epígrafes del Tema {selectedGenTopicId}:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedHeadings('all')}
                      style={{
                        background: selectedHeadings === 'all' ? 'var(--secondary)' : 'rgba(255,255,255,0.08)',
                        color: selectedHeadings === 'all' ? '#000' : 'rgba(255,255,255,0.7)',
                        border: 'none',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      🌐 Todos los puntos (Por defecto)
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                    {availableHeadings.map((heading, hIdx) => {
                      const isSelected = selectedHeadings === 'all' || (Array.isArray(selectedHeadings) && selectedHeadings.includes(heading));
                      return (
                        <button
                          key={hIdx}
                          type="button"
                          onClick={() => toggleSectionHeading(heading)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                            color: isSelected ? '#fef08a' : 'rgba(255,255,255,0.6)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? <CheckSquare size={13} style={{ color: '#f59e0b' }} /> : <Square size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                          <span>{heading}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {saveSuccessMsg && (
            <div style={{ padding: '14px 18px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '12px', color: '#4ade80', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* PREVIEW & EDIT BATCH */}
          {generatedBatch.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} style={{ color: 'var(--secondary)' }} />
                  <span>Lote Generado ({generatedBatch.length} preguntas) — Tema {selectedGenTopicId}</span>
                </h4>

                <button
                  type="button"
                  onClick={handleSaveBatchToBank}
                  disabled={savingBatch}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: '800',
                    border: 'none',
                    cursor: savingBatch ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Save size={18} />
                  <span>{savingBatch ? 'Guardando...' : `💾 Guardar e Incorporar al Banco (${generatedBatch.length} preguntas)`}</span>
                </button>
              </div>

              {generatedBatch.map((q, idx) => {
                const dupCheck = checkDuplicated(q.question, selectedGenTopicId);
                return (
                  <div key={q.id || idx} className="glass-panel" style={{ padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', background: 'rgba(212, 163, 89, 0.15)', padding: '2px 10px', borderRadius: '12px' }}>
                        Pregunta #{idx + 1}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {!dupCheck.isDuplicated ? (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: '700' }}>
                            🟢 100% Inédita (0% coincidencia)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '700' }}>
                            ⚠️ Similitud {dupCheck.similarityPercentage}% con pregunta existente
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteBatchQuestion(idx)}
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
                          title="Eliminar pregunta del lote"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Question text input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Enunciado de la pregunta:</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleUpdateBatchQuestion(idx, 'question', e.target.value)}
                        rows={2}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
                      />
                    </div>

                    {/* Options inputs A, B, C, D */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                        const optValue = q.options[optIdx] ? q.options[optIdx].replace(/^[A-D]\)\s*/, '') : '';
                        const isCorrect = q.correctAnswer === optIdx;
                        return (
                          <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', border: isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent' }}>
                            <input
                              type="radio"
                              name={`correct_${idx}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateBatchQuestion(idx, 'correctAnswer', optIdx)}
                              title="Marcar como respuesta correcta"
                            />
                            <span style={{ fontWeight: '800', color: isCorrect ? '#4ade80' : 'var(--text-muted)', fontSize: '0.85rem' }}>{letter})</span>
                            <input
                              type="text"
                              value={optValue}
                              onChange={(e) => handleUpdateBatchQuestion(idx, `option_${optIdx}`, e.target.value)}
                              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Explicación / Justificación de norma:</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateBatchQuestion(idx, 'explanation', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* METRICS & USERS & CODES TABS */}
      {activeSubTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Estudiantes Registrados</span>
              <Users size={20} style={{ color: 'var(--secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>{registeredUsersCount}</div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Alumnos Activos Ahora</span>
              <Wifi size={20} style={{ color: '#4ade80' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4ade80', marginTop: '8px' }}>{onlineUsersCount}</div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Promedio Global Tests</span>
              <Award size={20} style={{ color: '#60a5fa' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>{averageGlobalScore}</div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Códigos Activados</span>
              <Key size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>{usedCodesCount} / {totalCodesCount}</div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Listado de Estudiantes</h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar por nombre, email o código..."
                style={{ padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Estudiante</th>
                  <th style={{ padding: '10px' }}>Código Libro</th>
                  <th style={{ padding: '10px' }}>Estado</th>
                  <th style={{ padding: '10px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(u => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '700' }}>{u.name || 'Sin nombre'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{u.bookCode || u.code || '—'}</td>
                    <td style={{ padding: '10px' }}>
                      {isUserOnline(u) ? (
                        <span style={{ color: '#4ade80', fontWeight: '700' }}>● En línea</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Desconectado</span>
                      )}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isUserOnline(u) && (
                          <button onClick={() => handleKickUser(u.uid, u.name)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Cerrar Sesión
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(u.uid, u.name)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'codes' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Generador y Gestión de Códigos de Libro</h3>
            <form onSubmit={handleGenerateCodes} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={codesCount}
                onChange={(e) => setCodesCount(parseInt(e.target.value, 10))}
                min={1}
                max={200}
                style={{ width: '80px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
              />
              <button type="submit" disabled={generating} style={{ padding: '6px 14px', background: 'var(--secondary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                {generating ? 'Generando...' : 'Generar Lote'}
              </button>
            </form>
          </div>

          {generatedCodes.length > 0 && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: '#fef08a' }}>¡Lote de {generatedCodes.length} códigos generado!</span>
                <button onClick={handleCopyGeneratedCodes} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}>
                  {copiedCodes ? '¡Copiados al portapapeles!' : 'Copiar Todos'}
                </button>
              </div>
              <div style={{ maxHeight: '100px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#fff', whiteSpace: 'pre-wrap' }}>
                {generatedCodes.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
