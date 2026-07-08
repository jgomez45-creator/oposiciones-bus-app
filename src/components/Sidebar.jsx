import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  BarChart3,
  Library
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
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

      <div className="sidebar-footer">
        <p>Convocatoria 2026</p>
        <span>Código 4140</span>
      </div>
    </aside>
  );
}
