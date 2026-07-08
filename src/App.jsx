import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopicViewer from './components/TopicViewer';
import QuizRunner from './components/QuizRunner';
import Flashcards from './components/Flashcards';
import Stats from './components/Stats';
import topicsData from './data/topics.json';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeTopicId, setActiveTopicId] = useState(1);
  const [timerActiveGlobally, setTimerActiveGlobally] = useState(false);
  
  // Progress structure in localStorage:
  // {
  //   [topicId]: {
  //     status: 'Pendiente' | 'Leyendo' | 'Resumido' | 'Memorizado' | 'Repasado',
  //     studyTime: number (seconds),
  //     quizScores: number[] (percentages),
  //   }
  // }
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('bus_study_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing progress data', e);
      }
    }
    
    // Initialize default progress for all 20 topics
    const initialProgress = {};
    topicsData.forEach(t => {
      initialProgress[t.id] = {
        status: 'Pendiente',
        studyTime: 0,
        quizScores: []
      };
    });
    return initialProgress;
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem('bus_study_progress', JSON.stringify(progress));
  }, [progress]);

  // Helper to change status of a topic
  const updateTopicStatus = (topicId, newStatus) => {
    setProgress(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        status: newStatus
      }
    }));
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

  return (
    <>
      <div className="app-container">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
      
      {/* Custom footer for PDF printing - Direct child of body (via React fragment) */}
      <div className="custom-print-footer">
        <span className="custom-print-footer-left"></span>
        <span className="custom-print-footer-right"></span>
      </div>
    </>
  );
}
