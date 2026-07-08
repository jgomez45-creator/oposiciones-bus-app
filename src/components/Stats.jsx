import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Trash2,
  Calendar
} from 'lucide-react';

export default function Stats({ topics, progress, resetAllProgress }) {
  // Calculations
  const totalTopics = topics.length;
  const statusCounts = Object.values(progress).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, { Pendiente: 0, Leyendo: 0, Resumido: 0, Memorizado: 0, Repasado: 0 });

  // Make sure we account for uninitialized topics (they are 'Pendiente')
  const initializedCount = Object.keys(progress).length;
  statusCounts.Pendiente += (totalTopics - initializedCount);

  // Total times
  const totalSeconds = Object.values(progress).reduce((acc, curr) => acc + (curr.studyTime || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const totalMins = Math.round((totalSeconds % 3600) / 60);

  // Test accuracy
  const allScores = Object.values(progress).flatMap(p => p.quizScores || []);
  const avgScore = allScores.length > 0 
    ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length) 
    : 0;

  // Find most studied topics
  const studiedTopics = Object.entries(progress)
    .map(([id, data]) => ({
      id: Number(id),
      title: topics.find(t => t.id === Number(id))?.title || `Tema ${id}`,
      time: data.studyTime || 0
    }))
    .filter(t => t.time > 0)
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleResetClick = () => {
    if (window.confirm('¿Estás seguro de que deseas restablecer todo tu progreso? Esto borrará tus tiempos de estudio, estados y puntuaciones de los test permanentemente.')) {
      resetAllProgress();
    }
  };

  return (
    <div className="stats-view fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="text-gradient">Progreso y Estadísticas</h1>
          <p className="text-muted">Analiza tus hábitos de estudio y tu nivel de memorización por tema.</p>
        </div>
      </header>

      {/* Numerical summary cards */}
      <section className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tiempo Total Registrado</span>
            <h3 className="stat-value">{totalHours}h {totalMins}m</h3>
            <p className="stat-subtext">Sumatorio de todas tus sesiones</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper gold">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tests Realizados</span>
            <h3 className="stat-value">{allScores.length} Exámenes</h3>
            <p className="stat-subtext">Precisión media del {avgScore}%</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper emerald">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Temas Memorizados</span>
            <h3 className="stat-value">
              {statusCounts.Memorizado + statusCounts.Repasado} / {totalTopics}
            </h3>
            <p className="stat-subtext">Marcados como listos para el examen</p>
          </div>
        </div>
      </section>

      <div className="dashboard-layout">
        {/* State distribution chart */}
        <section className="dashboard-main glass-panel">
          <div className="section-header">
            <h3>Distribución de Estados</h3>
          </div>

          <div className="progress-dist-container">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / totalTopics) * 100);
              let barColor = 'var(--accent-rose)';
              if (status === 'Repasado' || status === 'Memorizado') barColor = 'var(--accent-emerald)';
              else if (status === 'Resumido') barColor = 'var(--primary-light)';
              else if (status === 'Leyendo') barColor = 'var(--secondary)';
              
              return (
                <div key={status} className="dist-row">
                  <div className="dist-label-wrapper">
                    <strong>{status}</strong>
                    <span className="text-muted">{count} temas ({pct}%)</span>
                  </div>
                  <div className="dist-bar-track">
                    <div 
                      className="dist-bar-fill" 
                      style={{ width: `${pct}%`, backgroundColor: barColor }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset progress */}
          <div className="reset-progress-container">
            <div className="warning-text-container">
              <span className="text-muted">¿Deseas reiniciar tu plan de estudio desde cero?</span>
            </div>
            <button onClick={handleResetClick} className="reset-btn-danger">
              <Trash2 size={16} />
              Restablecer Todos los Datos
            </button>
          </div>
        </section>

        {/* Most Studied Topics list */}
        <section className="dashboard-sidebar glass-panel">
          <div className="section-header">
            <Calendar size={18} className="text-primary-light" />
            <h3>Más Estudiados</h3>
          </div>

          {studiedTopics.length === 0 ? (
            <p className="text-muted p-2 text-center">Aún no has registrado sesiones de estudio con el temporizador.</p>
          ) : (
            <div className="studied-topics-list">
              {studiedTopics.map((topic, i) => (
                <div key={topic.id} className="studied-topic-item">
                  <div className="studied-topic-rank">#{i + 1}</div>
                  <div className="studied-topic-info">
                    <strong>Tema {topic.id}</strong>
                    <span className="topic-title-sub text-muted">{topic.title.substring(0, 30)}...</span>
                  </div>
                  <div className="studied-topic-time badge badge-blue">
                    {formatTime(topic.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
