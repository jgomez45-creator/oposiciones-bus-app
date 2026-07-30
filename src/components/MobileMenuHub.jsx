import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Layers,
  Edit3,
  HelpCircle,
  Sparkles,
  LogOut,
  Library,
  BarChart3,
  Shield,
  Settings
} from 'lucide-react';

export default function MobileMenuHub({
  setCurrentTab,
  currentUser,
  handleLogout,
  onOpenSiri,
  onOpenSettings
}) {
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      desc: 'Resumen de estudio y estadísticas',
      icon: LayoutDashboard,
      color: '#3b82f6'
    },
    {
      id: 'topics',
      title: 'Temario',
      desc: 'Lectura de temas y audiolibro',
      icon: BookOpen,
      color: '#10b981'
    },
    {
      id: 'quizzes',
      title: 'Tests de Examen',
      desc: 'Simulacros y de autoevaluación',
      icon: GraduationCap,
      color: '#6366f1'
    },
    {
      id: 'formadores',
      title: 'Test Formadores',
      desc: 'Cuestionarios de batería de formadores',
      icon: ClipboardList,
      color: '#ec4899'
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      desc: 'Memorización rápida de conceptos',
      icon: Layers,
      color: '#f59e0b'
    },
    {
      id: 'stats',
      title: 'Mi Progreso',
      desc: 'Análisis detallado de tu avance',
      icon: BarChart3,
      color: '#8b5cf6'
    },
    {
      id: 'anexos',
      title: 'Mis Anexos',
      desc: 'Fe de erratas y apuntes',
      icon: Edit3,
      color: '#14b8a6'
    },
    {
      id: 'manual',
      title: 'Ayuda',
      desc: 'Manual de uso y guía de usuario',
      icon: HelpCircle,
      color: '#64748b'
    }
  ];

  // Add Admin Panel card if currentUser is admin
  if (currentUser?.role === 'admin') {
    menuItems.push({
      id: 'admin',
      title: 'Control',
      desc: 'Panel de administración',
      icon: Shield,
      color: '#ef4444'
    });
  }

  return (
    <div className="mobile-menu-hub">
      <header className="mobile-menu-header">
        <div className="mobile-menu-header-logo">
          <Library className="text-gradient-gold" size={28} />
          <h1>BUS Sevilla</h1>
        </div>
        <p>Téc. Auxiliar - Convocatoria 2026</p>
      </header>

      {currentUser && (
        <section className="mobile-menu-profile-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'stretch' }}>
          <div className="mobile-menu-profile-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="mobile-menu-profile-avatar">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="mobile-menu-profile-details">
              <span className="mobile-menu-profile-name">
                {currentUser.name || 'Alumno Registrado'}
              </span>
              <span className="mobile-menu-profile-id">
                ID: {currentUser.bookCode || currentUser.code || (currentUser.role === 'admin' ? 'ADMIN' : 'REGISTRADO')}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              type="button"
              onClick={onOpenSettings}
              className="mobile-menu-logout-btn"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-color)', color: 'var(--text-main)', justifyContent: 'center', gap: '6px' }}
            >
              <Settings size={14} />
              <span>Ajustes</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="mobile-menu-logout-btn"
              style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
            >
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          </div>
        </section>
      )}

      <main className="mobile-menu-grid">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentTab(item.id)}
              className="mobile-menu-card"
            >
              <div className="mobile-menu-card-icon-wrapper" style={{ color: item.color }}>
                <Icon size={20} />
              </div>
              <div className="mobile-menu-card-info">
                <span className="mobile-menu-card-title">{item.title}</span>
                <span className="mobile-menu-card-desc">{item.desc}</span>
              </div>
            </button>
          );
        })}

        {/* Special card for Agente BUS */}
        <button
          type="button"
          onClick={onOpenSiri}
          className="mobile-menu-card special"
        >
          <span className="mobile-menu-card-badge">IA</span>
          <div className="mobile-menu-card-icon-wrapper">
            <Sparkles size={20} />
          </div>
          <div className="mobile-menu-card-info">
            <span className="mobile-menu-card-title">Agente BUS</span>
            <span className="mobile-menu-card-desc">Asistente virtual inteligente</span>
          </div>
        </button>
      </main>

      <footer className="mobile-menu-footer">
        <p>Código 4140 - Universidad de Sevilla</p>
      </footer>
    </div>
  );
}
