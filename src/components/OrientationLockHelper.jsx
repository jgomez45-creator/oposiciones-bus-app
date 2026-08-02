import React, { useState, useEffect } from 'react';
import { RotateCw, Maximize, Minimize } from 'lucide-react';

export default function OrientationLockHelper() {
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOrientationCheck = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      setIsFullscreen(!!document.fullscreenElement);
      // Show banner if mobile portrait
      if (portrait && window.innerWidth < 900) {
        setShowBanner(true);
      } else {
        setShowBanner(false);
      }
    };

    window.addEventListener('resize', handleOrientationCheck);
    window.addEventListener('orientationchange', handleOrientationCheck);
    handleOrientationCheck();

    return () => {
      window.removeEventListener('resize', handleOrientationCheck);
      window.removeEventListener('orientationchange', handleOrientationCheck);
    };
  }, []);

  const handleForceLandscape = async () => {
    try {
      // 1. Enter Fullscreen if not already
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
      }

      // 2. Lock Screen Orientation to Landscape
      if (window.screen.orientation && window.screen.orientation.lock) {
        await window.screen.orientation.lock('landscape');
      } else if (window.screen.lockOrientation) {
        window.screen.lockOrientation('landscape');
      }
      setShowBanner(false);
    } catch (err) {
      console.log('Automated landscape lock notice:', err);
      // Fallback instruction if browser prevents API lock without native PWA permission
      alert('Tu navegador requiere que giréis el móvil físicamente en horizontal. ¡El modo pantalla completa ya está activado!');
    }
  };

  const handleExitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    } catch (err) {
      console.log('Exit fullscreen error:', err);
    }
  };

  if (!showBanner && !isFullscreen) return null;

  return (
    <>
      {showBanner && !isFullscreen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--secondary)',
          borderRadius: '30px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <RotateCw size={16} className="spinner-slow" style={{ color: 'var(--secondary)' }} />
          <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: '500' }}>
            Mejor vista en Horizontal
          </span>
          <button
            type="button"
            onClick={handleForceLandscape}
            style={{
              background: 'var(--secondary)',
              color: '#0f172a',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Maximize size={14} />
            <span>Girar a Horizontal</span>
          </button>
        </div>
      )}
    </>
  );
}
