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
  Trash2
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function AdminPanel({ topics }) {
  const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats' | 'users' | 'codes'
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

  // Subscribe to real-time administrative data
  useEffect(() => {
    setLoading(true);
    setErrorMsg('');
    
    // Subscribe to users and progress
    const unsubUsers = firebaseService.subscribeToAllUsers(
      (userList) => {
        setUsers(userList);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setErrorMsg('Error de permisos al acceder a los datos de la nube. Por favor, configura las Reglas de Seguridad en tu consola de Firebase para autorizar la lectura de usuarios y progreso.');
        setLoading(false);
      }
    );

    // Subscribe to book activation codes
    const unsubCodes = firebaseService.subscribeToAllBookCodes(
      (codesList) => {
        setBookCodes(codesList);
      },
      (err) => {
        console.error(err);
        setErrorMsg('Error de permisos al acceder a los datos de la nube. Por favor, configura las Reglas de Seguridad en tu consola de Firebase para autorizar la lectura de códigos de activación.');
      }
    );

    return () => {
      unsubUsers();
      unsubCodes();
    };
  }, []);

  // Format study time from seconds to a human-readable format
  const formatStudyTime = (totalSeconds) => {
    if (!totalSeconds) return '0m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Check if a user is considered online
  const isUserOnline = (user) => {
    if (!user.currentSessionId) return false;
    // Consider online if active in the last 10 minutes
    if (!user.lastActive) return true; // fallback if no lastActive timestamp
    const lastActiveTime = new Date(user.lastActive).getTime();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return lastActiveTime > tenMinutesAgo;
  };

  // Handle kicking a user session
  const handleKickUser = async (uid, name) => {
    if (window.confirm(`¿Estás seguro de que deseas cerrar la sesión activa de ${name}?`)) {
      try {
        await firebaseService.kickUserSession(uid);
        alert(`Sesión de ${name} cerrada correctamente.`);
      } catch (err) {
        console.error(err);
        alert("No se pudo cerrar la sesión.");
      }
    }
  };

  // Handle generating new activation codes
  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (codesCount <= 0 || codesCount > 200) {
      alert("Introduce un número de códigos válido (entre 1 y 200).");
      return;
    }

    setGenerating(true);
    try {
      const newCodes = await firebaseService.generateNewBookCodes(codesCount);
      setGeneratedCodes(newCodes);
      setCopiedCodes(false);
    } catch (err) {
      console.error(err);
      alert("Error al generar los códigos.");
    } finally {
      setGenerating(false);
    }
  };

  // Copy newly generated codes to clipboard
  const handleCopyGeneratedCodes = () => {
    if (generatedCodes.length === 0) return;
    const textToCopy = generatedCodes.join('\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 3000);
      })
      .catch(err => {
        console.error(err);
        alert("No se pudo copiar.");
      });
  };

  // Calculate Global Metrics
  const totalStudents = users.filter(u => u.role !== 'admin' && u.uid !== 'guest_profile').length;
  const onlineStudents = users.filter(u => u.role !== 'admin' && isUserOnline(u)).length;
  
  let totalSecondsStudied = 0;
  let totalQuizzesTaken = 0;
  let scoresSum = 0;
  let studentsWithScores = 0;

  users.forEach(u => {
    if (u.role !== 'admin' && u.uid !== 'guest_profile') {
      totalSecondsStudied += u.totalStudyTime || 0;
      totalQuizzesTaken += u.quizzesTaken || 0;
      if (u.quizzesTaken > 0) {
        scoresSum += u.averageQuizScore || 0;
        studentsWithScores++;
      }
    }
  });

  const averageGlobalScore = studentsWithScores > 0 ? (scoresSum / studentsWithScores).toFixed(1) : 'N/A';
  
  const totalCodesCount = bookCodes.length;
  const usedCodesCount = bookCodes.filter(c => c.used).length;
  const unusedCodesCount = totalCodesCount - usedCodesCount;
  const activationRate = totalCodesCount > 0 ? ((usedCodesCount / totalCodesCount) * 100).toFixed(0) : 0;

  // Filtered lists
  const filteredUsers = users.filter(u => {
    if (u.uid === 'guest_profile') return false; // exclude guest from main listing
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
      
      // If code was used, we also search by the user who activated it
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

  // Sort users so that online ones appear first, then admins, then alphabetically
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

  return (
    <div className="admin-dashboard-container fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--secondary)' }} />
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>Panel de Control del Creador</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Supervisión global de estudiantes, códigos físicos y métricas en tiempo real.
          </p>
        </div>
        
        {/* Sub-tabs Selector */}
        <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '12px', background: 'rgba(15,20,36,0.5)' }}>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`tab-btn ${activeSubTab === 'stats' ? 'active' : ''}`}
            style={{ padding: '8px 16px', border: 'none', background: activeSubTab === 'stats' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Métricas de Uso
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
            style={{ padding: '8px 16px', border: 'none', background: activeSubTab === 'users' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Usuarios y Sesiones {onlineStudents > 0 && <span style={{ background: 'var(--accent-emerald)', color: '#000', padding: '2px 6px', borderRadius: '50%', fontSize: '0.7rem', fontWeight: '800', marginLeft: '6px' }}>{onlineStudents}</span>}
          </button>
          <button
            onClick={() => setActiveSubTab('codes')}
            className={`tab-btn ${activeSubTab === 'codes' ? 'active' : ''}`}
            style={{ padding: '8px 16px', border: 'none', background: activeSubTab === 'codes' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Códigos de Activación
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-rose)', background: 'rgba(244, 63, 94, 0.03)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 'bold' }}>
            <ShieldAlert size={18} />
            <span>Reglas de Seguridad Requeridas en Firestore</span>
          </div>
          <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
            {errorMsg}
          </p>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary-light)' }}>Solución:</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '8px', lineHeight: '1.4' }}>
              Copia y pega la siguiente configuración en la pestaña <strong>Rules</strong> (Reglas) de tu base de datos Firestore en Firebase:
            </p>
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto', color: 'var(--text-muted)', border: '1px solid var(--border-color)', margin: 0 }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
        get(/databases/\$(database)/documents/users/\$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow list: if isAdmin();
    }
    
    match /book_codes/{code} {
      allow read: if true;
      allow write, list: if isAdmin();
    }
    
    match /progress/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow list: if isAdmin();
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '16px' }}>
          <RefreshCw className="spinner" size={32} style={{ color: 'var(--secondary)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cargando datos del servidor...</span>
        </div>
      ) : (
        <>
          {/* STATS VIEW */}
          {activeSubTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* KPI Cards Grid */}
              <div className="stats-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alumnos Registrados</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{totalStudents}</h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alumnos En Línea</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {onlineStudents}
                      {onlineStudents > 0 && <span className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />}
                    </h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudio Acumulado</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{formatStudyTime(totalSecondsStudied)}</h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nota Media de Tests</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{averageGlobalScore}%</h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
                    <Key size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activación de Temarios</span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '4px' }}>{activationRate}% <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({usedCodesCount}/{totalCodesCount})</span></h3>
                  </div>
                </div>

              </div>

              {/* Grid of study metrics by topics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BookOpen size={18} style={{ color: 'var(--secondary)' }} />
                    Análisis de Avance por Temas
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topics.map((t) => {
                      // Calculate how many users completed this topic
                      let completedCount = 0;
                      let studyTimeTotal = 0;
                      
                      users.forEach(u => {
                        if (u.role !== 'admin' && u.uid !== 'guest_profile') {
                          const progressKey = `local_backup_progress_${u.uid}`;
                          const rawProg = localStorage.getItem(progressKey);
                          if (rawProg) {
                            try {
                              const prog = JSON.parse(rawProg);
                              if (prog[t.id]) {
                                if (prog[t.id].status === 'Completado' || prog[t.id].status === 'Estudiado') completedCount++;
                                if (prog[t.id].studyTime) studyTimeTotal += prog[t.id].studyTime;
                              }
                            } catch (e) {}
                          }
                        }
                      });

                      const totalActiveStudents = totalStudents || 1;
                      const percentage = ((completedCount / totalActiveStudents) * 100).toFixed(0);

                      return (
                        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Tema {t.id}: {t.title}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              Estudio: <strong style={{ color: 'var(--secondary)' }}>{formatStudyTime(studyTimeTotal)}</strong> &bull; Completado por: <strong style={{ color: 'var(--accent-emerald)' }}>{completedCount}</strong> ({percentage}%)
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                                borderRadius: '3px',
                                transition: 'width 0.5s ease-out'
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* USERS & SESSIONS LIST VIEW */}
          {activeSubTab === 'users' && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar alumno por nombre, email o código..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mostrando <strong>{sortedUsers.length}</strong> de <strong>{users.length}</strong> usuarios
                </div>
              </div>

              {/* Table / List */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 16px' }}>Alumno / Correo</th>
                      <th style={{ padding: '12px 16px' }}>Rol / Código</th>
                      <th style={{ padding: '12px 16px' }}>Estado</th>
                      <th style={{ padding: '12px 16px' }}>Estudio</th>
                      <th style={{ padding: '12px 16px' }}>Nota Tests</th>
                      <th style={{ padding: '12px 16px' }}>Última Actividad</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '40px 16px', textAlignment: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Ningún alumno coincide con los filtros de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      sortedUsers.map((u) => {
                        const online = isUserOnline(u);
                        const isAdmin = u.role === 'admin';
                        const lastActiveStr = u.lastActive 
                          ? new Date(u.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : 'Nunca';

                        return (
                          <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', background: online ? 'rgba(16, 185, 129, 0.02)' : 'transparent', transition: 'var(--transition-fast)' }}>
                            
                            {/* User details */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAdmin ? 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: isAdmin ? 'var(--bg-dark)' : 'white' }}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                                </div>
                              </div>
                            </td>

                            {/* Role / Code */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-blue'}`} style={{ width: 'fit-content', padding: '2px 6px', fontSize: '0.65rem' }}>
                                  {isAdmin ? 'Creador' : 'Alumno'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.bookCode}</span>
                              </div>
                            </td>

                            {/* Connection Status */}
                            <td style={{ padding: '14px 16px' }}>
                              {online ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '0.75rem' }}>
                                  <span className="pulse-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                                  En Línea
                                </div>
                              ) : (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)', fontSize: '0.75rem' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-dark)' }} />
                                  Desconectado
                                </div>
                              )}
                            </td>

                            {/* Study progress */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '600' }}>{formatStudyTime(u.totalStudyTime)}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.completedCount || 0} temas listos</span>
                              </div>
                            </td>

                            {/* Average Quiz Score */}
                            <td style={{ padding: '14px 16px' }}>
                              {u.quizzesTaken > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '600', color: u.averageQuizScore >= 50 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                    {u.averageQuizScore.toFixed(0)}%
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.quizzesTaken} tests</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-dark)' }}>Ninguno</span>
                              )}
                            </td>

                            {/* Last active time */}
                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                              {lastActiveStr}
                            </td>

                            {/* Kicking Action */}
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              {online && !isAdmin ? (
                                <button
                                  onClick={() => handleKickUser(u.uid, u.name)}
                                  className="glow-btn-secondary"
                                  style={{ padding: '6px 12px', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Cerrar sesión activa de este usuario"
                                >
                                  <ShieldAlert size={12} />
                                  <span>Expulsar</span>
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-dark)', fontSize: '0.75rem' }}>-</span>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* BOOK ACTIVATION CODES VIEW */}
          {activeSubTab === 'codes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
              
              {/* Codes list */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCodeFilter('all')}
                      className={`glow-btn-secondary ${codeFilter === 'all' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', background: codeFilter === 'all' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)' }}
                    >
                      Todos ({totalCodesCount})
                    </button>
                    <button
                      onClick={() => setCodeFilter('unused')}
                      className={`glow-btn-secondary ${codeFilter === 'unused' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', background: codeFilter === 'unused' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                    >
                      Disponibles ({unusedCodesCount})
                    </button>
                    <button
                      onClick={() => setCodeFilter('used')}
                      className={`glow-btn-secondary ${codeFilter === 'used' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', background: codeFilter === 'used' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    >
                      Activados ({usedCodesCount})
                    </button>
                  </div>

                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Buscar código o usuario..."
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '500px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(0,0,0,0.1)' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'center', width: '95px' }}>Asignado</th>
                        <th style={{ padding: '10px 16px' }}>Código de Activación</th>
                        <th style={{ padding: '10px 16px' }}>Estado</th>
                        <th style={{ padding: '10px 16px' }}>Activado Por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCodes.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Ningún código coincide con el filtro seleccionado.
                          </td>
                        </tr>
                      ) : (
                        filteredCodes.map((c) => {
                          const userWhoActivated = c.used ? users.find(u => u.uid === c.usedBy) : null;
                          return (
                            <tr key={c.code} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                              <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={!!c.assigned || !!c.used}
                                  disabled={!!c.used}
                                  onChange={async (e) => {
                                    const isAssigned = e.target.checked;
                                    try {
                                      await firebaseService.updateBookCodeAssignedStatus(c.code, isAssigned);
                                    } catch (err) {
                                      console.error(err);
                                      alert("No se pudo actualizar el estado de asignación.");
                                    }
                                  }}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: c.used ? 'not-allowed' : 'pointer',
                                    accentColor: 'var(--secondary)'
                                  }}
                                  title={c.used ? "Este código ya ha sido registrado por un alumno" : "Marcar como entregado con el manual impreso"}
                                />
                              </td>
                              <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                                {c.code}
                              </td>
                              <td style={{ padding: '10px 16px' }}>
                                {c.used ? (
                                  <span className="badge badge-rose" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>Activado</span>
                                ) : (
                                  <span className="badge badge-emerald" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>Disponible</span>
                                )}
                              </td>
                              <td style={{ padding: '10px 16px', color: c.used ? 'var(--text-main)' : 'var(--text-dark)' }}>
                                {c.used ? (
                                  userWhoActivated ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontWeight: '600' }}>{userWhoActivated.name}</span>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{userWhoActivated.email}</span>
                                    </div>
                                  ) : (
                                    <span>Usuario ID: {c.usedBy.substring(0, 10)}...</span>
                                  )
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Generator Panel */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Plus size={18} style={{ color: 'var(--secondary)' }} />
                  Generar Nuevos Códigos
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                  Crea códigos de validación BUS-XXXX-XXXX que los compradores podrán usar para activar sus cuentas.
                </p>

                <form onSubmit={handleGenerateCodes} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cantidad de Códigos (1-200)</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={codesCount}
                      onChange={(e) => setCodesCount(parseInt(e.target.value) || 0)}
                      style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="glow-btn"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', justifyContent: 'center' }}
                    disabled={generating}
                  >
                    {generating ? (
                      <div className="spinner" style={{ width: '14px', height: '14px', margin: 0 }} />
                    ) : (
                      <Key size={14} />
                    )}
                    <span>Generar Códigos</span>
                  </button>
                </form>

                {/* Newly generated codes list */}
                {generatedCodes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-light)' }}>
                        ¡Códigos Generados! ({generatedCodes.length})
                      </span>
                      <button
                        onClick={() => setGeneratedCodes([])}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Limpiar"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {generatedCodes.map((c, i) => (
                        <div key={i}>{c}</div>
                      ))}
                    </div>

                    <button
                      onClick={handleCopyGeneratedCodes}
                      className="glow-btn-secondary"
                      style={{ padding: '8px', borderRadius: '8px', justifyContent: 'center', fontSize: '0.75rem' }}
                    >
                      {copiedCodes ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                      <span>{copiedCodes ? "Copiados al portapapeles" : "Copiar todos"}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}
