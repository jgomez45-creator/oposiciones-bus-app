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
  HelpCircle,
  Sparkles,
  Edit3
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, currentUser, handleLogout, onOpenSiri, isSiriOpen }) {
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
        { id: 'stats', name: 'Progreso', icon: BarChart3 }
      ]
    },
    {
      label: 'Herramientas',
      items: [
        { id: 'agente_bus', name: 'Agente BUS', icon: Sparkles, onClick: onOpenSiri, isBlueButton: true },
        { id: 'anexos', name: 'Mis Anexos / Fe Erratas', icon: Edit3 },
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
      <div className="sidebar-logo" style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Library className="logo-icon text-gradient-gold" size={32} />
          <div>
            <h2>BUS Sevilla</h2>
            <p>Téc. Auxiliar</p>
          </div>
        </div>
        <span 
          className="sidebar-copyright"
          title="Copyright JGG"
          style={{
            position: 'absolute',
            top: '2px',
            right: '0',
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.5px',
            userSelect: 'none'
          }}
        >
          © JGG
        </span>
      </div>
      
      <nav className="sidebar-menu">
        {menuGroups.map((group) => (
          <div key={group.label} className="menu-group">
            <span className="menu-group-label">{group.label}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isAgenteActive = Boolean(isSiriOpen || currentTab === 'agente_bus');
              const isActive = item.id === 'agente_bus' ? isAgenteActive : (!isSiriOpen && currentTab === item.id);
              
              if (item.isBlueButton) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                    }}
                    className={`menu-item ${isAgenteActive ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      margin: '4px 0',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: isAgenteActive
                        ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      border: isAgenteActive
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid rgba(253, 224, 71, 0.4)',
                      boxShadow: isAgenteActive
                        ? '0 4px 14px rgba(37, 99, 235, 0.45)'
                        : '0 4px 14px rgba(217, 119, 6, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Sparkles size={18} style={{ color: isAgenteActive ? '#ffffff' : '#fef08a' }} />
                    <span>Agente BUS</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      setCurrentTab(item.id);
                    }
                  }}
                  className={`menu-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="menu-icon" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {currentUser && (
        <div className="sidebar-user-profile" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px 14px',
          borderTop: '1px solid var(--border-color)',
          margin: '6px 0 4px 0',
          background: 'rgba(255,255,255,0.01)',
          borderRadius: '12px',
          flexShrink: 0           /* siempre visible, nunca encogido */
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.9rem',
              color: '#070a13',
              boxShadow: '0 2px 8px rgba(234, 179, 8, 0.2)'
            }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name || 'Alumno Registrado'}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ID: {currentUser.bookCode || currentUser.code || (currentUser.role === 'admin' ? 'ADMIN' : 'REGISTRADO')}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="glow-btn-secondary"
            style={{ fontSize: '0.73rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', width: '100%', borderRadius: '8px' }}
          >
            <LogOut size={11} />
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
