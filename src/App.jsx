import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopicViewer from './components/TopicViewer';
import QuizRunner from './components/QuizRunner';
import Flashcards from './components/Flashcards';
import Stats from './components/Stats';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import topicsData from './data/topics.json';
import { firebaseService } from './services/firebaseService';
import { ShieldAlert, RefreshCw, Clock } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeTopicId, setActiveTopicId] = useState(1);
  const [timerActiveGlobally, setTimerActiveGlobally] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [sessionExpelled, setSessionExpelled] = useState(false);

  // Throttled database saving refs
  const lastSaveTimeRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const pendingProgressRef = useRef(null);

  // Inactivity warning states
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(30);

  // Refs for inactivity timers
  const inactivityTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('opos_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Safeguard against malformed/legacy sessions to prevent runtime crashes
        if (parsed && typeof parsed === 'object' && parsed.uid && parsed.code) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing user session', e);
      }
      localStorage.removeItem('opos_current_user');
      sessionStorage.removeItem('opos_local_session_id');
    }
    return null;
  });

  // Local Session ID for checking concurrent logins
  const [localSessionId, setLocalSessionId] = useState(() => {
    return sessionStorage.getItem('opos_local_session_id') || '';
  });

  // Personalized progress state
  const [progress, setProgress] = useState({});

  // Sync user profile progress and monitor concurrent sessions
  useEffect(() => {
    if (!currentUser) {
      setProgress({});
      return;
    }

    setLoadingProgress(true);

    if (currentUser.uid === 'guest_profile') {
      // Guest Demo Access (LocalStorage only)
      const saved = localStorage.getItem('bus_study_progress_guest');
      if (saved) {
        try {
          setProgress(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        const initialProgress = {};
        topicsData.forEach(t => {
          initialProgress[t.id] = { status: 'Pendiente', studyTime: 0, quizScores: [] };
        });
        setProgress(initialProgress);
      }
      setLoadingProgress(false);
      return;
    }

    // REAL OR SIMULATED CLOUD PERSISTENCE
    // Subscribe to cloud progress updates
    const unsubscribeProgress = firebaseService.subscribeToUserProgress(currentUser.uid, (cloudProgress) => {
      setProgress(cloudProgress);
      setLoadingProgress(false);
    });

    // Subscribe to concurrent sessions monitoring
    const unsubscribeSession = firebaseService.subscribeToSession(currentUser.uid, localSessionId, () => {
      // Expel the user immediately
      localStorage.removeItem('opos_current_user');
      sessionStorage.removeItem('opos_local_session_id');
      setCurrentUser(null);
      setLocalSessionId('');
      setSessionExpelled(true);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeSession();
    };
  }, [currentUser, localSessionId]);

  // Save progress dynamically for current user (throttled to avoid exhausting Firebase writes)
  useEffect(() => {
    if (!currentUser || Object.keys(progress).length === 0) return;

    if (currentUser.uid === 'guest_profile') {
      localStorage.setItem('bus_study_progress_guest', JSON.stringify(progress));
      return;
    }

    pendingProgressRef.current = progress;
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    const minSaveInterval = 30000; // 30 seconds

    const performSave = async () => {
      if (!pendingProgressRef.current || !currentUser) return;
      const progressToSave = pendingProgressRef.current;
      pendingProgressRef.current = null;
      lastSaveTimeRef.current = Date.now();
      
      try {
        await firebaseService.saveUserProgress(currentUser.uid, progressToSave);
      } catch (err) {
        console.error("Failed to sync progress to cloud:", err);
      }
    };

    if (timeSinceLastSave >= minSaveInterval) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      performSave();
    } else {
      if (!saveTimeoutRef.current) {
        const delay = minSaveInterval - timeSinceLastSave;
        saveTimeoutRef.current = setTimeout(() => {
          saveTimeoutRef.current = null;
          performSave();
        }, delay);
      }
    }
  }, [progress, currentUser]);

  // Clean up save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update lastActive timestamp in the database periodically
  useEffect(() => {
    if (!currentUser) return;
    
    // Initial immediate call
    firebaseService.updateUserActiveTime(currentUser.uid).catch((err) => {
      console.warn("Could not update last active time:", err);
    });
    
    // Set up interval every 2 minutes
    const interval = setInterval(() => {
      firebaseService.updateUserActiveTime(currentUser.uid).catch((err) => {
        console.warn("Could not update last active time:", err);
      });
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser, currentTab]);

  // Inactivity auto-logout logic (30 minutes of no user interaction)
  useEffect(() => {
    if (!currentUser) {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    const resetInactivityTimer = () => {
      // If warning modal is showing, do not reset the inactivity timer
      if (showInactivityWarning) return;

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      // 30 minutes = 30 * 60 * 1000 ms
      inactivityTimeoutRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
        setInactivityCountdown(30);
      }, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [currentUser, showInactivityWarning]);

  // Countdown timer for inactivity warnings
  useEffect(() => {
    if (showInactivityWarning) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      countdownIntervalRef.current = setInterval(() => {
        setInactivityCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleForceLogoutDueToInactivity();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showInactivityWarning]);

  const handleForceLogoutDueToInactivity = () => {
    // Clear timeouts and intervals
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Save pending progress before forced logout
    if (pendingProgressRef.current && currentUser && currentUser.uid !== 'guest_profile') {
      firebaseService.saveUserProgress(currentUser.uid, pendingProgressRef.current).catch((err) => {
        console.error("Failed to sync progress on auto-logout:", err);
      });
    }

    // Force clear session
    localStorage.removeItem('opos_current_user');
    sessionStorage.removeItem('opos_local_session_id');
    setCurrentUser(null);
    setLocalSessionId('');
    setShowInactivityWarning(false);
    
    alert('Tu sesión ha caducado y se ha cerrado automáticamente por inactividad.');
  };

  const handleContinueSession = () => {
    setShowInactivityWarning(false);
    setInactivityCountdown(30);
    
    // Refresh user activity lease on DB
    if (currentUser) {
      firebaseService.updateUserActiveTime(currentUser.uid).catch((err) => {
        console.warn("Could not update active time on resume:", err);
      });
    }
  };

  const handleLogin = (user, sessionId) => {
    localStorage.setItem('opos_current_user', JSON.stringify(user));
    sessionStorage.setItem('opos_local_session_id', sessionId);
    setSessionExpelled(false);
    setLocalSessionId(sessionId);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // Clear inactivity timers
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowInactivityWarning(false);

    if (currentUser) {
      firebaseService.logoutUser(currentUser.uid).catch((err) => console.error(err));
    }
    localStorage.removeItem('opos_current_user');
    sessionStorage.removeItem('opos_local_session_id');
    setCurrentUser(null);
    setLocalSessionId('');
    setCurrentTab('dashboard');
  };

  // Helper to change status of a topic
  const updateTopicStatus = (topicId, newStatus) => {
    setProgress(prev => {
      const topicProg = prev[topicId] || { status: 'Pendiente', studyTime: 0, quizScores: [] };
      return {
        ...prev,
        [topicId]: {
          ...topicProg,
          status: newStatus
        }
      };
    });
  };

  // Helper to increment study time of a topic
  const incrementTimeForTopic = (topicId, seconds) => {
    setProgress(prev => {
      const topicProg = prev[topicId] || { status: 'Pendiente', studyTime: 0, quizScores: [] };
      return {
        ...prev,
        [topicId]: {
          ...topicProg,
          studyTime: (topicProg.studyTime || 0) + seconds
        }
      };
    });
  };

  // Helper to record a quiz score for a topic
  const recordQuizScore = (topicId, scorePercentage) => {
    setProgress(prev => {
      const topicProg = prev[topicId] || { status: 'Pendiente', studyTime: 0, quizScores: [] };
      const currentScores = topicProg.quizScores || [];
      return {
        ...prev,
        [topicId]: {
          ...topicProg,
          quizScores: [...currentScores, scorePercentage]
        }
      };
    });
  };

  // Helper to reset all data
  const resetAllProgress = () => {
    const initialProgress = {};
    topicsData.forEach(t => {
      initialProgress[t.id] = {
        status: 'Pendiente',
        studyTime: 0,
        quizScores: []
      };
    });
    setProgress(initialProgress);
    setCurrentTab('dashboard');
  };

  // Switch to study view from dashboard
  const selectTopic = (topicId) => {
    setActiveTopicId(topicId);
    setCurrentTab('topics');
  };

  // Render active view
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            topics={topicsData} 
            progress={progress} 
            updateTopicStatus={updateTopicStatus}
            selectTopic={selectTopic}
            setTimerActiveGlobally={setTimerActiveGlobally}
            incrementTimeForTopic={incrementTimeForTopic}
            currentUser={currentUser}
            handleLogout={handleLogout}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'topics':
        return (
          <TopicViewer 
            topics={topicsData}
            activeTopicId={activeTopicId}
            setActiveTopicId={setActiveTopicId}
            progress={progress}
            updateTopicStatus={updateTopicStatus}
            incrementTimeForTopic={incrementTimeForTopic}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'quizzes':
        return (
          <QuizRunner 
            topics={topicsData}
            progress={progress}
            recordQuizScore={recordQuizScore}
            activeTopicId={activeTopicId}
          />
        );
      case 'flashcards':
        return (
          <Flashcards 
            topics={topicsData}
            activeTopicId={activeTopicId}
          />
        );
      case 'stats':
        return (
          <Stats 
            topics={topicsData}
            progress={progress}
            resetAllProgress={resetAllProgress}
          />
        );
      case 'admin':
        if (currentUser?.role === 'admin') {
          return <AdminPanel topics={topicsData} />;
        }
        return <div>Página no encontrada</div>;
      default:
        return <div>Página no encontrada</div>;
    }
  };

  // Expelled screen if logged in on another device
  if (sessionExpelled) {
    return (
      <div className="login-screen-overlay">
        <div className="login-card glass-panel fade-in" style={{ textAlign: 'center' }}>
          <div className="login-logo-section">
            <ShieldAlert className="text-secondary" size={48} style={{ color: 'var(--accent-rose)', filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.2))' }} />
            <h2 style={{ color: 'var(--accent-rose)' }}>Sesión Cerrada</h2>
            <p className="subtitle" style={{ marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Tu cuenta de estudiante ha sido iniciada en otro dispositivo (u otra pestaña del navegador). 
              <br /><br />
              Por motivos de seguridad y control de acceso comercial, se ha cerrado la sesión en este dispositivo.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setSessionExpelled(false)} 
            className="login-submit-btn glow-btn"
            style={{ marginTop: '20px' }}
          >
            <span>Aceptar y Volver</span>
          </button>
        </div>
      </div>
    );
  }

  // Lock screen if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="app-container">
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          currentUser={currentUser}
          handleLogout={handleLogout}
        />
        <main className="main-content">
          {loadingProgress ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
              <RefreshCw className="spinner" size={32} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Actualizando tu progreso...</span>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {showInactivityWarning && (
        <div className="login-screen-overlay" style={{ zIndex: 9999 }}>
          <div className="login-card glass-panel fade-in" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div className="login-logo-section">
              <Clock size={48} style={{ color: 'var(--secondary-light)', filter: 'drop-shadow(0 0 10px rgba(234,179,8,0.2))' }} />
              <h2 style={{ color: 'var(--secondary-light)', marginTop: '16px' }}>¿Sigues ahí?</h2>
              <p className="subtitle" style={{ marginTop: '12px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Tu sesión está a punto de cerrarse debido a **30 minutos de inactividad**.
                <br /><br />
                Se cerrará automáticamente en <strong style={{ fontSize: '1.2rem', color: 'var(--accent-rose)' }}>{inactivityCountdown}</strong> segundos para ahorrar recursos.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <button 
                type="button" 
                onClick={handleContinueSession} 
                className="login-submit-btn glow-btn"
                style={{ width: '100%' }}
              >
                <span>Continuar Estudiando</span>
              </button>
              <button 
                type="button" 
                onClick={handleForceLogoutDueToInactivity} 
                className="glow-btn-secondary"
                style={{ width: '100%', padding: '12px' }}
              >
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom footer for PDF printing */}
      <div className="custom-print-footer">
        <span className="custom-print-footer-left"></span>
        <span className="custom-print-footer-right"></span>
      </div>
    </>
  );
}
