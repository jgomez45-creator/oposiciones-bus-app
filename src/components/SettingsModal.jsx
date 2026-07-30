import React, { useState } from 'react';
import { X, Palette, Type, Sliders, Volume2, Shield, Trash2, Database } from 'lucide-react';

export default function SettingsModal({
    isOpen,
    onClose,
    currentUser,
    // Interfaz variables
    appTheme,
    setAppTheme,
    fontSizeClass,
    setFontSizeClass,
    soundsEnabled,
    setSoundsEnabled,
    // Examenes variables
    showExplanations,
    setShowExplanations,
    timerPreference,
    setTimerPreference,
    // System Admin variables (can be simulated or updated in App state)
    inactivityTimeoutMinutes,
    setInactivityTimeoutMinutes,
    isDatabaseMock,
    setIsDatabaseMock,
    onResetProgress
}) {
    const [activeTab, setActiveTab] = useState('interface');

    if (!isOpen) return null;

    const isAdmin = currentUser?.role === 'admin';

    const handleClearCache = () => {
        if (window.confirm('¿Estás seguro de que deseas limpiar la caché local? Esto restablecerá los temas, fuentes y configuraciones locales a su estado inicial.')) {
            localStorage.removeItem('opos_theme');
            localStorage.removeItem('opos_font_size');
            localStorage.removeItem('opos_sounds_enabled');
            localStorage.removeItem('opos_show_explanations');
            localStorage.removeItem('opos_timer_preference');
            window.location.reload();
        }
    };

    const handleResetProgress = () => {
        if (window.confirm('⚠️ ADVERTENCIA: ¿Estás completamente seguro de que deseas restablecer TODO tu progreso de estudio? Esta acción es irreversible.')) {
            onResetProgress();
            alert('Progreso restablecido correctamente.');
        }
    };

    return (
        <div className="login-screen-overlay" style={{ zIndex: 10000 }}>
            <div
                className="login-card glass-panel fade-in"
                style={{
                    maxWidth: '550px',
                    width: '90%',
                    padding: '24px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '85vh',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Configuración</span>
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mobile-top-header-btn-back"
                        style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '50%', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('interface')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                            background: activeTab === 'interface' ? 'var(--primary)' : 'transparent',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        <Palette size={14} />
                        <span>Interfaz</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('exam')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                            background: activeTab === 'exam' ? 'var(--primary)' : 'transparent',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        <Sliders size={14} />
                        <span>Estudio / Tests</span>
                    </button>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('admin')}
                            style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                borderRadius: '6px',
                                background: activeTab === 'admin' ? 'var(--accent-rose)' : 'transparent',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            <Shield size={14} />
                            <span>Sistema</span>
                        </button>
                    )}
                </div>

                {/* Content Container (Scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '260px' }}>

                    {/* INTERFACE TAB */}
                    {activeTab === 'interface' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Tema Selector */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                                    Tema de la Aplicación
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setAppTheme('theme-default')}
                                        className={`glow-btn-secondary ${appTheme === 'theme-default' ? 'active' : ''}`}
                                        style={{
                                            padding: '10px 4px',
                                            fontSize: '0.75rem',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: appTheme === 'theme-default' ? 'var(--bg-card-hover)' : 'transparent',
                                            borderColor: appTheme === 'theme-default' ? 'var(--primary-light)' : 'var(--border-color)',
                                            color: appTheme === 'theme-default' ? 'var(--primary-light)' : 'var(--text-main)'
                                        }}
                                    >
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                                        <span>Azul Sevilla</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAppTheme('theme-dark-pure')}
                                        className={`glow-btn-secondary ${appTheme === 'theme-dark-pure' ? 'active' : ''}`}
                                        style={{
                                            padding: '10px 4px',
                                            fontSize: '0.75rem',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: appTheme === 'theme-dark-pure' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            borderColor: appTheme === 'theme-dark-pure' ? 'var(--primary-light)' : 'var(--border-color)',
                                            color: appTheme === 'theme-dark-pure' ? 'var(--primary-light)' : 'var(--text-main)'
                                        }}
                                    >
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#020617' }}></div>
                                        <span>Oscuro Puro</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAppTheme('theme-light')}
                                        className={`glow-btn-secondary ${appTheme === 'theme-light' ? 'active' : ''}`}
                                        style={{
                                            padding: '10px 4px',
                                            fontSize: '0.75rem',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: appTheme === 'theme-light' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            borderColor: appTheme === 'theme-light' ? 'var(--primary-light)' : 'var(--border-color)',
                                            color: appTheme === 'theme-light' ? 'var(--primary-light)' : 'var(--text-main)'
                                        }}
                                    >
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff', border: '1px solid #cbd5e1' }}></div>
                                        <span>Modo Claro</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tamaño de Fuente */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    <Type size={14} />
                                    <span>Tamaño del Texto (Temas y Tests)</span>
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setFontSizeClass('font-medium')}
                                        className={`glow-btn-secondary ${fontSizeClass === 'font-medium' ? 'active' : ''}`}
                                        style={{
                                            padding: '8px',
                                            fontSize: '0.8rem',
                                            borderColor: fontSizeClass === 'font-medium' ? 'var(--primary-light)' : 'var(--border-color)'
                                        }}
                                    >
                                        Aa (Mediano)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFontSizeClass('font-large')}
                                        className={`glow-btn-secondary ${fontSizeClass === 'font-large' ? 'active' : ''}`}
                                        style={{
                                            padding: '8px',
                                            fontSize: '0.9rem',
                                            borderColor: fontSizeClass === 'font-large' ? 'var(--primary-light)' : 'var(--border-color)'
                                        }}
                                    >
                                        Aa (Grande)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFontSizeClass('font-xlarge')}
                                        className={`glow-btn-secondary ${fontSizeClass === 'font-xlarge' ? 'active' : ''}`}
                                        style={{
                                            padding: '8px',
                                            fontSize: '1.05rem',
                                            borderColor: fontSizeClass === 'font-xlarge' ? 'var(--primary-light)' : 'var(--border-color)'
                                        }}
                                    >
                                        Aa (Muy Grande)
                                    </button>
                                </div>
                            </div>

                            {/* Sonidos y Efectos */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Sonidos de Respuesta</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Retroalimentación sonora en aciertos y fallos</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSoundsEnabled(!soundsEnabled)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: soundsEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Volume2 size={16} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{soundsEnabled ? 'Activado' : 'Silencio'}</span>
                                </button>
                            </div>

                            {/* Reset de Caché Local */}
                            <div style={{ marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={handleClearCache}
                                    className="glow-btn-secondary"
                                    style={{ width: '100%', padding: '10px', fontSize: '0.8rem', justifyContent: 'center', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}
                                >
                                    <Trash2 size={14} />
                                    <span>Restablecer Opciones Locales / Caché</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* EXAMS TAB */}
                    {activeTab === 'exam' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Explicaciones del Test */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                                    Mostrar Retroalimentación de Respuestas
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="explanations"
                                            checked={showExplanations === 'immediate'}
                                            onChange={() => setShowExplanations('immediate')}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Inmediatamente</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Muestra si acertaste y la explicación teórica al pulsar cada opción.</span>
                                        </div>
                                    </label>

                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="explanations"
                                            checked={showExplanations === 'end'}
                                            onChange={() => setShowExplanations('end')}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Al Finalizar el Test</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mantén la intriga y evalúa todo el bloque al consolidar tu plantilla.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Visibilidad del reloj temporizador */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                                    Cronómetro / Temporizador
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setTimerPreference('visible')}
                                        className={`glow-btn-secondary ${timerPreference === 'visible' ? 'active' : ''}`}
                                        style={{
                                            padding: '10px',
                                            fontSize: '0.8rem',
                                            justifyContent: 'center',
                                            borderColor: timerPreference === 'visible' ? 'var(--primary-light)' : 'var(--border-color)'
                                        }}
                                    >
                                        Mostrar Reloj
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimerPreference('hidden')}
                                        className={`glow-btn-secondary ${timerPreference === 'hidden' ? 'active' : ''}`}
                                        style={{
                                            padding: '10px',
                                            fontSize: '0.8rem',
                                            justifyContent: 'center',
                                            borderColor: timerPreference === 'hidden' ? 'var(--primary-light)' : 'var(--border-color)'
                                        }}
                                    >
                                        Ocultar Reloj
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone: Reset Progreso */}
                            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(244, 63, 94, 0.2)', paddingTop: '16px' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-rose)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                                    Zona Peligrosa
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResetProgress}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        border: '1.5px dashed var(--accent-rose)',
                                        color: 'var(--accent-rose)',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        transition: 'var(--transition-fast)'
                                    }}
                                >
                                    Restablecer Progreso Completo
                                </button>
                            </div>

                        </div>
                    )}

                    {/* ADMIN TAB */}
                    {activeTab === 'admin' && isAdmin && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Database Connection Mode */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    <Database size={14} />
                                    <span>Base de Datos del Servidor</span>
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDatabaseMock(false);
                                            // Update Firestore vs Mock behavior
                                            localStorage.setItem('force_real_db', 'true');
                                        }}
                                        className={`glow-btn-secondary ${!isDatabaseMock ? 'active' : ''}`}
                                        style={{
                                            padding: '10px 4px',
                                            fontSize: '0.75rem',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: !isDatabaseMock ? 'var(--primary-glow)' : 'transparent',
                                            borderColor: !isDatabaseMock ? 'var(--primary-light)' : 'var(--border-color)',
                                            color: !isDatabaseMock ? 'var(--primary-light)' : 'var(--text-main)'
                                        }}
                                    >
                                        <span style={{ fontWeight: '700' }}>Modo Nube (Firebase)</span>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Sincronización online activa</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDatabaseMock(true);
                                            localStorage.setItem('force_real_db', 'false');
                                        }}
                                        className={`glow-btn-secondary ${isDatabaseMock ? 'active' : ''}`}
                                        style={{
                                            padding: '10px 4px',
                                            fontSize: '0.75rem',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: isDatabaseMock ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                                            borderColor: isDatabaseMock ? 'var(--secondary)' : 'var(--border-color)',
                                            color: isDatabaseMock ? 'var(--secondary)' : 'var(--text-main)'
                                        }}
                                    >
                                        <span style={{ fontWeight: '700' }}>Modo Simulación (Mock)</span>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>LocalStorage offline</span>
                                    </button>
                                </div>
                            </div>

                            {/* Inactivity Threshold */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                                    Límite de Inactividad Global (Cierre Sesión)
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    {[15, 30, 60].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setInactivityTimeoutMinutes(val)}
                                            className={`glow-btn-secondary ${inactivityTimeoutMinutes === val ? 'active' : ''}`}
                                            style={{
                                                padding: '10px',
                                                fontSize: '0.8rem',
                                                borderColor: inactivityTimeoutMinutes === val ? 'var(--accent-rose)' : 'var(--border-color)',
                                                color: inactivityTimeoutMinutes === val ? 'var(--accent-rose)' : 'var(--text-main)'
                                            }}
                                        >
                                            {val} Minutos
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nota sobre la sincronizacion del admin */}
                            <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.68rem', color: 'var(--accent-rose)', margin: 0, lineHeight: '1.4' }}>
                                    <strong>🔒 Perfil Directivo:</strong> Estos cambios de sistema aplican para coordinar el comportamiento del servidor local y sesión en este terminal. Los códigos de activación se siguen gestionando en el panel de Control principal.
                                </p>
                            </div>

                        </div>
                    )}

                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="glow-btn"
                        style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                    >
                        Aceptar / Guardar
                    </button>
                </div>

            </div>
        </div>
    );
}
