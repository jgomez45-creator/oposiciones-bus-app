import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  BarChart3,
  Library,
  LogOut
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, currentUser, handleLogout }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'topics', name: 'Temario', icon: BookOpen },
    { id: 'quizzes', name: 'Tests', icon: GraduationCap },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
    { id: 'stats', name: 'Progreso', icon: BarChart3 }
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <Library className="logo-icon text-gradient-gold" size={32} />
        <div>
          <h2>BUS Sevilla</h2>
          <p>Téc. Auxiliar</p>
        </div>
      </div>
      
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="menu-icon" />
              <span>{item.name}</span>
              {isActive && <span className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {currentUser && (
        <div className="sidebar-user-profile" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--border-color)', margin: '10px 0 5px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--bg-dark)' }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {currentUser.code ? currentUser.code.split('_')[0] : 'DEMO'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="glow-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', width: '100%', borderRadius: '8px' }}
          >
            <LogOut size={12} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

      <div className="sidebar-footer">
        <p>Convocatoria 2026</p>
        <span>Código 4140</span>
      </div>
    </aside>
  );
}
