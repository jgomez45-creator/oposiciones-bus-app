import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  BarChart3,
  Library,
  LogOut,
  Shield,
  ClipboardList,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, currentUser, handleLogout }) {
  const menuGroups = [
    {
      label: 'Aprendizaje',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'topics', name: 'Temario', icon: BookOpen },
        { id: 'flashcards', name: 'Flashcards', icon: Layers }
      ]
    },
    {
      label: 'Evaluación',
      items: [
        { id: 'quizzes', name: 'Tests', icon: GraduationCap },
        { id: 'formadores', name: 'Test formadores', icon: ClipboardList }
      ]
    },
    {
      label: 'Seguimiento',
      items: [
        { id: 'stats', name: 'Progreso', icon: BarChart3 },
        { id: 'manual', name: 'Manual de Uso', icon: HelpCircle }
      ]
    }
  ];

  if (currentUser && currentUser.role === 'admin') {
    menuGroups.push({
      label: 'Administración',
      items: [{ id: 'admin', name: 'Control', icon: Shield }]
    });
  }

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
        {menuGroups.map((group) => (
          <div key={group.label} className="menu-group">
            <span className="menu-group-label">{group.label}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`menu-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="menu-icon" />
                  <span>{item.name}</span>
                  {isActive && <span className="active-indicator" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {currentUser && (
        <div className="sidebar-user-profile" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 16px', borderTop: '1px solid var(--border-color)', margin: '10px 0 5px 0', background: 'rgba(255,255,255,0.01)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#070a13', boxShadow: '0 2px 8px rgba(234, 179, 8, 0.2)' }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
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
