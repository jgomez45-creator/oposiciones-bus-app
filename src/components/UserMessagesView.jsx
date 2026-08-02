import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, CheckCircle2, Clock, Inbox, MessageSquare, ShieldCheck, User, MessageCircle, Sparkles } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function UserMessagesView({ currentUser, setCurrentTab }) {
  const [activeTab, setActiveTab] = useState('direct_chat'); // 'direct_chat' | 'received' | 'send' | 'sent_history'

  const isAdminUser = currentUser && (currentUser.role === 'admin' || currentUser.bookCode === 'BUS-ADMIN-2026' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')));

  // Real-Time Direct Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Email & Form State
  const [receivedEmails, setReceivedEmails] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const studentUid = (currentUser?.bookCode || currentUser?.uid || 'guest_student').trim();

  useEffect(() => {
    setLoading(true);

    // 1. Subscribe to Real-Time Direct Chat Messages
    const unsubChat = firebaseService.subscribeToDirectChatMessages(
      currentUser || studentUid,
      (messages) => {
        setChatMessages(messages);
      }
    );

    // 2. Subscribe to emails received by this student
    const unsubReceived = firebaseService.subscribeToStudentReceivedEmails(
      currentUser,
      (list) => {
        setReceivedEmails(list);
        setLoading(false);
      }
    );

    // 3. Subscribe to email messages sent by this student
    const unsubSent = firebaseService.subscribeToStudentSentMessages(
      currentUser?.uid,
      (list) => {
        setSentMessages(list);
      }
    );

    return () => {
      if (unsubChat) unsubChat();
      if (unsubReceived) unsubReceived();
      if (unsubSent) unsubSent();
    };
  }, [currentUser, studentUid]);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (activeTab === 'direct_chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Send Direct Chat Message (Instant, No Email Needed)
  const handleSendDirectMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const text = chatInput.trim();
    setChatInput('');
    setSendingChat(true);

    try {
      await firebaseService.sendDirectChatMessage({
        studentUid: studentUid,
        senderUid: currentUser?.uid || 'guest_student',
        senderName: currentUser?.name || 'Alumno',
        senderRole: 'student',
        text: text
      });
    } catch (err) {
      console.warn("Error sending direct chat message:", err);
    } finally {
      setSendingChat(false);
    }
  };

  // Send Formal Email Message to Admin
  const handleSendMessageToAdmin = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !messageBody.trim()) {
      alert('Por favor, completa el asunto y el mensaje.');
      return;
    }

    setSendingEmail(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await firebaseService.sendStudentMessageToAdmin(currentUser, subject, messageBody);
      setSuccessMsg('¡Consulta enviada con éxito a tu preparador (jgomez45@us.es)! La recibirá en su Bandeja de Entrada.');
      setSubject('');
      setMessageBody('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al enviar la consulta. Inténtalo de nuevo.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="user-messages-container fade-in" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Banner de Ayuda para Administrador */}
      {isAdminUser && (
        <div style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1.5px solid #3b82f6', borderRadius: '14px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>👑</span>
            <div>
              <strong style={{ color: '#fff', fontSize: '0.92rem' }}>Estás en la vista previa del Alumno.</strong>
              <div style={{ color: '#93c5fd', fontSize: '0.8rem', marginTop: '2px' }}>
                Para ver las conversaciones de TODOS tus estudiantes y responderles directamente en tu Consola de Preparador:
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentTab && setCurrentTab('admin')} 
            style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 12px rgba(37, 99, 235, 0.5)' }}
          >
            <span>🛡️ Ir a Consola Admin (Chats)</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(212, 163, 89, 0.4)', background: 'linear-gradient(135deg, rgba(212, 163, 89, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle size={28} style={{ color: 'var(--secondary)' }} />
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#fff' }}>Centro de Comunicación e Mensajería Directa</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '6px 0 0 0' }}>
            Habla directamente en tiempo real con tu Preparador (<strong>Julio Gómez - jgomez45@us.es</strong>) sin necesidad de usar correo electrónico.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('direct_chat')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'direct_chat' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
              color: '#fff',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'direct_chat' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            <MessageCircle size={16} />
            <span>💬 Chat Directo (Instantáneo)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('received')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'received' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Inbox size={16} />
            <span>📢 Comunicados ({receivedEmails.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('send')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'send' ? 'var(--secondary)' : 'transparent',
              color: activeTab === 'send' ? '#000' : '#fff',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Mail size={16} />
            <span>✉️ Consulta por Correo</span>
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMsg && (
        <div style={{ padding: '14px 18px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '12px', color: '#4ade80', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 0: CHAT DIRECTO INSTANTÁNEO CON EL PREPARADOR (SIN NECESIDAD DE EMAIL) */}
      {activeTab === 'direct_chat' && (
        <div className="glass-panel" style={{ padding: '0', borderRadius: '18px', border: '1px solid rgba(59, 130, 246, 0.4)', overflow: 'hidden', background: 'rgba(15, 23, 42, 0.85)', display: 'flex', flexDirection: 'column', height: '540px' }}>
          
          {/* Header del Chat */}
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4a359 0%, #b8860b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '800', fontSize: '1rem', border: '2px solid rgba(255,255,255,0.2)' }}>
                JG
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Julio Gómez</span>
                  <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>Online • Preparador</span>
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tutor Oficial de Oposiciones BUS (jgomez45@us.es)</span>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              ⚡ Chat Directo en Vivo
            </div>
          </div>

          {/* Cuerpo de la Conversación */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(10, 15, 30, 0.5)' }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto 0', fontSize: '0.9rem' }}>
                Inicia la conversación escribiendo tu duda a continuación...
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.senderRole === 'student';
                return (
                  <div 
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: isMe ? 'right' : 'left', padding: '0 4px' }}>
                      {isMe ? 'Tú' : msg.senderName} &bull; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isMe 
                        ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                        : 'rgba(30, 41, 59, 0.95)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Formulario de Entrada de Texto */}
          <form onSubmit={handleSendDirectMessage} style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe aquí tu mensaje directo al preparador..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="glow-btn"
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: (!chatInput.trim() || sendingChat) ? 0.5 : 1
              }}
            >
              <Send size={16} />
              <span>Enviar</span>
            </button>
          </form>

        </div>
      )}

      {/* TAB 1: COMUNICADOS RECIBIDOS POR EL ALUMNO */}
      {activeTab === 'received' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Avisos y Correos Oficiales del Preparador</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Notificaciones enviadas a tu cuenta y grupo de estudio</span>
          </div>

          {loading ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '14px' }}>
              Cargando comunicados...
            </div>
          ) : receivedEmails.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Inbox size={40} style={{ color: 'var(--secondary)', opacity: 0.6 }} />
              <h4 style={{ margin: 0, color: '#fff' }}>Sin comunicados pendientes</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No has recibido comunicados o circulares recientes. Todo tu temario está al día.</p>
            </div>
          ) : (
            receivedEmails.map(mail => (
              <div key={mail.id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', padding: '3px 10px', borderRadius: '10px', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                      📢 Comunicado Oficial
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} /> De: Preparador (jgomez45@us.es)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {new Date(mail.createdAt).toLocaleDateString()} a las {new Date(mail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 style={{ margin: 0, color: 'var(--secondary-light)', fontSize: '1.05rem' }}>{mail.subject}</h4>

                <div 
                  style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: '1.6', background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '10px', borderLeft: '3px solid var(--secondary)' }}
                  dangerouslySetInnerHTML={{ __html: mail.bodyHtml }}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: FORMULARIO PARA ENVIAR CORREO / CONSULTA AL ADMINISTRADOR */}
      {activeTab === 'send' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={22} />
              <span>Enviar Consulta Formal al Preparador (jgomez45@us.es)</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Si prefieres enviar una solicitud o consulta extensa por correo formal, puedes utilizar este formulario.
            </p>
          </div>

          <form onSubmit={handleSendMessageToAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Remitente (Tu Nombre):</label>
                <input
                  type="text"
                  value={`${currentUser?.name || 'Alumno'} (${currentUser?.email || 'Sin correo'})`}
                  disabled
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#94a3b8', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Destinatario:</label>
                <input
                  type="text"
                  value="Julio Gómez — Preparador US (jgomez45@us.es)"
                  disabled
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#60a5fa', fontWeight: '700', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Asunto de tu Consulta *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Duda sobre el Tema 6 - Sanciones y plazos de préstamo"
                required
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Mensaje o Explicación Detallada *</label>
              <textarea
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Escribe aquí tu duda o mensaje de forma clara..."
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={sendingEmail}
                className="glow-btn"
                style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>{sendingEmail ? 'Enviando consulta...' : '🚀 Enviar Consulta a jgomez45@us.es'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
