import React, { useState } from 'react';
import { Lock, User, LogIn, ShieldAlert, Library, Mail, BookOpen, UserCheck } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

// Detect if we are running in Mock Mode to show helper tips
const isMock = !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
               import.meta.env.VITE_FIREBASE_PROJECT_ID === 'tu_project_id';

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bookCode, setBookCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (activeTab === 'forgot') {
        // FORGOT PASSWORD FLOW
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          throw new Error("Por favor, introduce tu correo electrónico.");
        }
        await firebaseService.sendPasswordReset(trimmedEmail);
        setSuccessMessage("Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada (si no lo recibes en unos minutos, comprueba tu carpeta de correo no deseado o spam).");
        setLoading(false);
      } else if (activeTab === 'login') {
        // LOGIN FLOW
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
          throw new Error("Por favor, introduce tu correo y contraseña.");
        }

        const result = await firebaseService.loginUser(trimmedEmail, trimmedPassword);
        onLogin(result.user, result.sessionId);
      } else {
        // REGISTRATION FLOW
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedCode = bookCode.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedCode) {
          throw new Error("Todos los campos de registro son obligatorios.");
        }

        if (trimmedPassword.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }

        const registeredUser = await firebaseService.registerUser(
          trimmedName, 
          trimmedEmail, 
          trimmedPassword, 
          trimmedCode
        );

        // Immediately log in after registration
        const loginResult = await firebaseService.loginUser(trimmedEmail, trimmedPassword);
        onLogin(loginResult.user, loginResult.sessionId);
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // Guest bypass profile (uses a static guest code, local localStorage progress)
    const guestUser = {
      uid: 'guest_profile',
      code: 'DEMO',
      name: 'Usuario Invitado (Demo)',
      email: 'invitado@oposicionesbus.com',
      bookCode: 'DEMO-INVITADO'
    };
    const guestSessionId = 'session_guest_' + Date.now();
    onLogin(guestUser, guestSessionId);
  };

  return (
    <div className="login-screen-overlay">
      <div className="login-card glass-panel fade-in">
        <div className="login-logo-section">
          <Library className="login-logo-icon text-gradient-gold" size={44} />
          <h2>BUS Sevilla</h2>
          <p className="subtitle">Plataforma Didáctica Virtual &bull; Oposiciones US 2026</p>
        </div>

        {/* Tab Selector / Back to Login */}
        {activeTab === 'forgot' ? (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <button 
              type="button" 
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMessage(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--secondary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: '500', padding: 0 }}
            >
              &larr; Volver a Iniciar Sesión
            </button>
          </div>
        ) : (
          <div className="login-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMessage(''); }}
              className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'login' ? '2px solid var(--secondary)' : '2px solid transparent', color: activeTab === 'login' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'var(--transition-fast)' }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setSuccessMessage(''); }}
              className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'register' ? '2px solid var(--secondary)' : '2px solid transparent', color: activeTab === 'register' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'var(--transition-fast)' }}
            >
              Registrar Libro
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="login-form">
          {activeTab === 'register' && (
            <div className="input-group">
              <label htmlFor="student-name">Nombre Completo</label>
              <div className="input-field-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="student-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Gómez"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="student-email">Correo Electrónico</label>
            <div className="input-field-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="off"
                disabled={loading}
              />
            </div>
          </div>

          {activeTab !== 'forgot' && (
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="student-password">Contraseña</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setError(''); setSuccessMessage(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--secondary-light)', cursor: 'pointer', fontSize: '0.75rem', padding: '0 0 5px 0' }}
                  >
                    ¿La has olvidado?
                  </button>
                )}
              </div>
              <div className="input-field-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="student-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'register' ? "Min. 6 caracteres" : "Introduce tu contraseña"}
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="input-group">
              <label htmlFor="book-activation-code">Código de Libro Físico</label>
              <div className="input-field-wrapper">
                <BookOpen size={16} className="input-icon" />
                <input
                  id="book-activation-code"
                  type="text"
                  value={bookCode}
                  onChange={(e) => setBookCode(e.target.value)}
                  placeholder="Ej. BUS-XXX-XXX"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {successMessage && (
            <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '10px 14px', borderRadius: '12px', color: '#4ade80', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="login-error-alert fade-in">
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-submit-btn glow-btn" disabled={loading}>
            {loading ? (
              <div className="spinner" style={{ width: '16px', height: '16px', margin: 0 }} />
            ) : (
              <LogIn size={16} />
            )}
            <span>
              {loading 
                ? "Conectando..." 
                : activeTab === 'login' 
                  ? "Iniciar Sesión" 
                  : activeTab === 'register'
                    ? "Crear Cuenta y Activar"
                    : "Restablecer Contraseña"}
            </span>
          </button>
        </form>

        {/* Demo Bypass Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>¿Solo quieres ver una demostración?</span>
          <button 
            type="button" 
            onClick={handleGuestAccess} 
            className="glow-btn-secondary"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '0.85rem' }}
            disabled={loading}
          >
            <UserCheck size={16} />
            <span>Acceso Demo (Invitado)</span>
          </button>
        </div>

        {/* Mock Mode Helper Notification */}
        {isMock && (
          <div style={{ background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '10px 14px', borderRadius: '12px', color: 'var(--secondary-light)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', lineHeight: '1.4' }}>
            <span style={{ fontWeight: '700' }}>ℹ️ Modo Simulador Activo</span>
            <span>Para registrar un libro ficticio, puedes usar cualquiera de estos códigos:</span>
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', width: 'fit-content', fontFamily: 'monospace' }}>BUS-TEST-123</code>
            <span>No requiere registrarse en Firebase de momento.</span>
          </div>
        )}

        <div className="login-footer">
          <p>Convocatoria 2026 &bull; Auxiliares de Biblioteca</p>
          <span>Acceso limitado a compradores autorizados del temario físico.</span>
        </div>
      </div>
    </div>
  );
}
