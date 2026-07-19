import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Award, 
  BookOpen, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  LogOut,
  GraduationCap,
  Layers,
  BarChart3
} from 'lucide-react';

export default function Dashboard({ topics, progress, updateTopicStatus, selectTopic, setTimerActiveGlobally, incrementTimeForTopic, currentUser, handleLogout, setCurrentTab }) {
  // Pomodoro state
  const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTimerTopic, setSelectedTimerTopic] = useState(1); // Default to topic 1

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        
        // Track time against selected topic if in work mode
        if (pomodoroMode === 'work') {
          incrementTimeForTopic(selectedTimerTopic, 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play system alert sound or simple beep if possible, else just toggle mode
      if (pomodoroMode === 'work') {
        alert('¡Excelente trabajo! Hora de un descanso.');
        setPomodoroMode('break');
        setTimeLeft(5 * 60); // 5 min break
      } else {
        alert('¡Hora de volver al estudio! Selecciona tu tema.');
        setPomodoroMode('work');
        setTimeLeft(25 * 60); // 25 min work
      }
    }
    
    // Set global timer active state to prevent tab switching problems if needed
    setTimerActiveGlobally(isRunning);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, pomodoroMode, selectedTimerTopic]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(pomodoroMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleModeChange = (mode) => {
    setIsRunning(false);
    setPomodoroMode(mode);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  // Calculations
  const totalTopics = topics.length;
  const completedTopics = Object.values(progress).filter(p => p.status === 'Repasado' || p.status === 'Memorizado').length;
  const inProgressTopics = Object.values(progress).filter(p => p.status !== 'Pendiente').length;
  const progressPercent = Math.round((completedTopics / totalTopics) * 100) || 0;
  
  // Total study time
  const totalSeconds = Object.values(progress).reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // Average test score
  const allScores = Object.values(progress).flatMap(p => p.quizScores || []);
  const avgScore = allScores.length > 0 
    ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length) 
    : 0;

  // Next recommended topic (first 'Leyendo' or first 'Pendiente')
  const nextTopicId = topics.find(t => progress[t.id]?.status === 'Leyendo')?.id 
    || topics.find(t => progress[t.id]?.status === 'Pendiente')?.id 
    || 1;
  const nextTopic = topics.find(t => t.id === nextTopicId);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Repasado': return 'badge-emerald';
      case 'Memorizado': return 'badge-emerald';
      case 'Resumido': return 'badge-blue';
      case 'Leyendo': return 'badge-gold';
      default: return 'badge-rose';
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient">Preparador Virtual de Oposiciones</h1>
          <p className="text-muted">
            Dossier de Apoyo Didáctico &bull; Técnico/a Auxiliar de Biblioteca, Archivo y Museo (US)
            {currentUser && <strong style={{ color: 'var(--secondary-light)', marginLeft: '8px' }}>&bull; Perfil: {currentUser.name}</strong>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {currentUser && (
            <button 
              onClick={handleLogout} 
              className="glow-btn-secondary mobile-logout-btn" 
              style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={12} />
              <span>Cerrar Sesión</span>
            </button>
          )}
          <div className="date-badge glass-panel">
            <Clock size={16} />
            <span>Examen US 2026</span>
          </div>
        </div>
      </header>

      {/* Grid of stats */}
      <section className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Progreso del Temario</span>
            <h3 className="stat-value">{completedTopics} / {totalTopics} Temas</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="progress-text">{progressPercent}% completado</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper gold">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tiempo de Estudio</span>
            <h3 className="stat-value">{totalHours} horas</h3>
            <p className="stat-subtext">Sesiones registradas activamente</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper emerald">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Precisión Media Tests</span>
            <h3 className="stat-value">{avgScore}%</h3>
            <p className="stat-subtext">{allScores.length} exámenes realizados</p>
          </div>
        </div>
      </section>

      <div className="dashboard-layout">
        {/* Main section: Topic Manager */}
        <section className="dashboard-main glass-panel">
          <div className="section-header">
            <h3>Estado del Temario</h3>
            <span className="badge badge-blue">{inProgressTopics} en estudio</span>
          </div>

          <div className="topic-list-scroll">
            <table className="topics-table">
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Bloque</th>
                  <th>Estado</th>
                  <th>Tiempo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => {
                  const topicProgress = progress[topic.id] || { status: 'Pendiente', studyTime: 0 };
                  const timeStudied = Math.round(topicProgress.studyTime / 60); // minutes
                  return (
                    <tr key={topic.id} className="topic-row">
                      <td className="topic-name-cell" onClick={() => selectTopic(topic.id)}>
                        <span className="topic-num">T{topic.id.toString().padStart(2, '0')}</span>
                        <div className="topic-title-wrapper">
                          <strong>{topic.title}</strong>
                          <span className="topic-subtitle-desc">{topic.subtitle}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${topic.block === 'Específico' ? 'badge-blue' : 'badge-gold'}`}>
                          {topic.block}
                        </span>
                      </td>
                      <td>
                        <select
                          value={topicProgress.status}
                          onChange={(e) => updateTopicStatus(topic.id, e.target.value)}
                          className={`status-select badge ${getStatusBadgeClass(topicProgress.status)}`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Leyendo">Leyendo</option>
                          <option value="Resumido">Resumido</option>
                          <option value="Memorizado">Memorizado</option>
                          <option value="Repasado">Repasado</option>
                        </select>
                      </td>
                      <td className="text-muted">{timeStudied}m</td>
                      <td>
                        <button 
                          onClick={() => selectTopic(topic.id)}
                          className="glow-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Estudiar Tema"
                        >
                          <span>Estudiar</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar section: Pomodoro & Next Topic */}
        <section className="dashboard-sidebar">
          {/* Pomodoro widget */}
          <div className="pomodoro-widget glass-panel">
            <h4>Temporizador Pomodoro</h4>
            <div className="pomodoro-modes">
              <button 
                onClick={() => handleModeChange('work')} 
                className={`mode-btn ${pomodoroMode === 'work' ? 'active' : ''}`}
              >
                Estudiar
              </button>
              <button 
                onClick={() => handleModeChange('break')} 
                className={`mode-btn ${pomodoroMode === 'break' ? 'active' : ''}`}
              >
                Descanso
              </button>
            </div>

            <div className="timer-display">
              <h2>{formatTime(timeLeft)}</h2>
              <p className="timer-status">
                {pomodoroMode === 'work' ? 'Concentración' : 'Desconexión'}
              </p>
            </div>

            {pomodoroMode === 'work' && (
              <div className="timer-topic-selector">
                <label>Tema en estudio:</label>
                <select 
                  value={selectedTimerTopic}
                  onChange={(e) => setSelectedTimerTopic(Number(e.target.value))}
                  className="timer-select"
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>
                      T{t.id.toString().padStart(2, '0')} - {t.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="timer-controls">
              <button onClick={handleStartPause} className="timer-control-btn play">
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={handleReset} className="timer-control-btn reset">
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Recommended topic widget */}
          {nextTopic && (
            <div className="recommended-widget glass-panel">
              <div className="widget-header">
                <AlertCircle size={18} className="text-secondary-light" />
                <span>Siguiente Tema Sugerido</span>
              </div>
              <h4>Tema {nextTopic.id}: {nextTopic.title}</h4>
              <p className="text-muted">{nextTopic.subtitle}</p>
              <button 
                onClick={() => selectTopic(nextTopic.id)}
                className="glow-btn study-now-btn"
              >
                Estudiar Ahora
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
