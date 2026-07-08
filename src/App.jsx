import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopicViewer from './components/TopicViewer';
import QuizRunner from './components/QuizRunner';
import Flashcards from './components/Flashcards';
import Stats from './components/Stats';
import Login from './components/Login';
import topicsData from './data/topics.json';
import { firebaseService } from './services/firebaseService';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeTopicId, setActiveTopicId] = useState(1);
  const [timerActiveGlobally, setTimerActiveGlobally] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [sessionExpelled, setSessionExpelled] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('opos_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing user session', e);
      }
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

  // Save progress dynamically for current user
  useEffect(() => {
    if (!currentUser || Object.keys(progress).length === 0) return;

    if (currentUser.uid === 'guest_profile') {
      localStorage.setItem('bus_study_progress_guest', JSON.stringify(progress));
    } else {
      firebaseService.saveUserProgress(currentUser.uid, progress).catch((err) => {
        console.error("Failed to sync progress to cloud:", err);
      });
    }
  }, [progress, currentUser]);

  const handleLogin = (user, sessionId) => {
    localStorage.setItem('opos_current_user', JSON.stringify(user));
    sessionStorage.setItem('opos_local_session_id', sessionId);
    setSessionExpelled(false);
    setLocalSessionId(sessionId);
    setCurrentUser(user);
  };

  const handleLogout = () => {
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

  // Cloud loading indicator screen
  if (loadingProgress) {
    return (
      <div className="login-screen-overlay" style={{ background: 'var(--bg-dark)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw className="spinner" size={32} style={{ color: 'var(--secondary)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cargando tu progreso desde la nube...</span>
        </div>
      </div>
    );
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
          {renderContent()}
        </main>
      </div>
      
      {/* Custom footer for PDF printing */}
      <div className="custom-print-footer">
        <span className="custom-print-footer-left"></span>
        <span className="custom-print-footer-right"></span>
      </div>
    </>
  );
}
