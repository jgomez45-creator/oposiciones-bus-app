import React, { useState, useEffect } from 'react';
import { 
  Info, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  ClipboardList, 
  BarChart3, 
  Search, 
  ChevronDown, 
  AlertCircle, 
  HelpCircle, 
  X,
  Sparkles
} from 'lucide-react';
import { manualCategories } from '../data/manualData';
import './UserManual.css';

// Helper to map icon name strings to Lucide components
const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'Info': return <Info size={20} />;
    case 'LayoutDashboard': return <LayoutDashboard size={20} />;
    case 'BookOpen': return <BookOpen size={20} />;
    case 'GraduationCap': return <GraduationCap size={20} />;
    case 'Layers': return <Layers size={20} />;
    case 'ClipboardList': return <ClipboardList size={20} />;
    case 'BarChart3': return <BarChart3 size={20} />;
    default: return <HelpCircle size={20} />;
  }
};

export default function UserManual() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('introduccion');
  const [expandedSections, setExpandedSections] = useState({});

  // Helper to check if text contains search query (case-insensitive)
  const textMatches = (text, query) => {
    if (!text || !query) return false;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  // Check if any element of a category matches the search query
  const categoryHasMatches = (category, query) => {
    if (!query) return true;
    
    if (textMatches(category.title, query) || textMatches(category.intro, query)) {
      return true;
    }

    return category.sections.some(section => 
      textMatches(section.title, query) || 
      textMatches(section.content, query) ||
      (section.steps && section.steps.some(step => textMatches(step, query))) ||
      textMatches(section.alert, query) ||
      textMatches(section.tip, query)
    );
  };

  // Filtered categories based on search query
  const filteredCategories = manualCategories.filter(cat => 
    categoryHasMatches(cat, searchQuery)
  );

  // Toggle accordion collapse/expand state
  const toggleSection = (categoryId, sectionIndex) => {
    const key = `${categoryId}-${sectionIndex}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to highlight matches of search term in text
  const highlightText = (text, query) => {
    if (!text) return '';
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase()
            ? <span key={index} className="manual-highlight">{part}</span>
            : part
        )}
      </span>
    );
  };

  // Effect to automatically expand all matching sections when a search query is entered
  useEffect(() => {
    if (!searchQuery) {
      // Clear expansions except maybe default first one if reset
      return;
    }

    const newExpanded = {};
    manualCategories.forEach(category => {
      category.sections.forEach((section, idx) => {
        const matchesSection = 
          textMatches(section.title, searchQuery) || 
          textMatches(section.content, searchQuery) ||
          (section.steps && section.steps.some(step => textMatches(step, searchQuery))) ||
          textMatches(section.alert, searchQuery) ||
          textMatches(section.tip, searchQuery);
          
        if (matchesSection) {
          newExpanded[`${category.id}-${idx}`] = true;
        }
      });
    });
    setExpandedSections(newExpanded);
  }, [searchQuery]);

  // Handle clearing search input
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="manual-view fade-in">
      {/* Header section with Title */}
      <header className="dashboard-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 className="text-gradient">Manual de Instrucciones</h1>
          <p className="text-muted">Guía práctica sobre el uso de las funciones de estudio, tests, pomodoro e impresión.</p>
        </div>
      </header>

      {/* Search Bar Widget */}
      <div className="manual-header-search">
        <Search size={18} className="text-muted" />
        <input 
          type="text"
          className="manual-search-input"
          placeholder="¿Qué estás buscando? Ej. 'Pomodoro', 'TTS', 'Audio', 'Penalización'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={clearSearch} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Borrar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Manual Layout Grid */}
      <div className="manual-grid">
        
        {/* Left Column Navigation List (Only visible when not searching or if search returns results) */}
        {!searchQuery && (
          <div className="manual-nav-list">
            {manualCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`manual-nav-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right Column: Dynamic Panel content */}
        <div className="manual-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {searchQuery ? (
            /* Search results view */
            filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <div key={category.id} className="manual-content-panel glass-panel">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', color: 'var(--secondary-light)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    {getCategoryIcon(category.iconName)}
                    {highlightText(category.title, searchQuery)}
                  </h2>
                  <p className="manual-content-intro">{highlightText(category.intro, searchQuery)}</p>
                  
                  {category.sections.map((section, idx) => {
                    const isExpanded = !!expandedSections[`${category.id}-${idx}`];
                    return (
                      <div 
                        key={idx} 
                        className={`manual-accordion ${isExpanded ? 'expanded' : ''}`}
                      >
                        <div 
                          className="manual-accordion-trigger"
                          onClick={() => toggleSection(category.id, idx)}
                        >
                          <h3>
                            <HelpCircle size={16} style={{ color: isExpanded ? 'var(--primary-light)' : 'var(--text-dark)', flexShrink: 0 }} />
                            <span>{highlightText(section.title, searchQuery)}</span>
                          </h3>
                          <ChevronDown size={18} className="manual-accordion-icon" />
                        </div>

                        {isExpanded && (
                          <div className="manual-accordion-content">
                            <p className="manual-accordion-content-text">
                              {highlightText(section.content, searchQuery)}
                            </p>

                            {section.steps && (
                              <div className="manual-steps-list">
                                {section.steps.map((step, sIdx) => (
                                  <div key={sIdx} className="manual-step-item">
                                    <div className="manual-step-number">{sIdx + 1}</div>
                                    <div className="manual-step-text">
                                      {highlightText(step, searchQuery)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {section.alert && (
                              <div className="manual-box manual-box-alert">
                                <AlertCircle size={18} className="manual-box-icon" />
                                <div>
                                  <strong>Nota de control:</strong> {highlightText(section.alert, searchQuery)}
                                </div>
                              </div>
                            )}

                            {section.tip && (
                              <div className="manual-box manual-box-tip">
                                <Sparkles size={18} className="manual-box-icon" />
                                <div>
                                  <strong>Consejo de estudio:</strong> {highlightText(section.tip, searchQuery)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="glass-panel manual-no-results">
                <AlertCircle size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 12px auto' }} />
                <h3>No se encontraron coincidencias</h3>
                <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>Intenta buscar con otros términos como 'Pomodoro', 'TTS', 'Impresión' o 'Convenio'.</p>
              </div>
            )
          ) : (
            /* Normal single category view */
            (() => {
              const category = manualCategories.find(cat => cat.id === activeCategoryId) || manualCategories[0];
              return (
                <div className="manual-content-panel glass-panel">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: 'var(--secondary-light)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0 }}>
                    {getCategoryIcon(category.iconName)}
                    {category.title}
                  </h2>
                  <p className="manual-content-intro">{category.intro}</p>
                  
                  {category.sections.map((section, idx) => {
                    const isExpanded = !!expandedSections[`${category.id}-${idx}`];
                    return (
                      <div 
                        key={idx} 
                        className={`manual-accordion ${isExpanded ? 'expanded' : ''}`}
                      >
                        <div 
                          className="manual-accordion-trigger"
                          onClick={() => toggleSection(category.id, idx)}
                        >
                          <h3>
                            <HelpCircle size={16} style={{ color: isExpanded ? 'var(--primary-light)' : 'var(--text-dark)', flexShrink: 0 }} />
                            <span>{section.title}</span>
                          </h3>
                          <ChevronDown size={18} className="manual-accordion-icon" />
                        </div>

                        {isExpanded && (
                          <div className="manual-accordion-content">
                            <p className="manual-accordion-content-text">{section.content}</p>

                            {section.steps && (
                              <div className="manual-steps-list">
                                {section.steps.map((step, sIdx) => (
                                  <div key={sIdx} className="manual-step-item">
                                    <div className="manual-step-number">{sIdx + 1}</div>
                                    <div className="manual-step-text">{step}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {section.alert && (
                              <div className="manual-box manual-box-alert">
                                <AlertCircle size={18} className="manual-box-icon" />
                                <div>
                                  <strong>Nota de control:</strong> {section.alert}
                                </div>
                              </div>
                            )}

                            {section.tip && (
                              <div className="manual-box manual-box-tip">
                                <Sparkles size={18} className="manual-box-icon" />
                                <div>
                                  <strong>Consejo de estudio:</strong> {section.tip}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

      </div>
    </div>
  );
}
