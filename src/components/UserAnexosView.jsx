import React, { useState, useEffect } from 'react';
import { Edit3, CheckCircle2, FileText, Download, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function UserAnexosView({ currentUser, topics }) {
  const [editions, setEditions] = useState([]);
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubEditions = firebaseService.subscribeToMaterialEditions((list) => {
      setEditions(list);
      setLoading(false);
    });

    const unsubMods = firebaseService.subscribeToMaterialModifications((list) => {
      setModifications(list);
    });

    return () => {
      unsubEditions();
      unsubMods();
    };
  }, []);

  const assignedEditions = currentUser?.assignedEditions || {};
  const temarioEditionId = assignedEditions.temario;
  const testEditionId = assignedEditions.test;

  const userTemarioEdition = editions.find(e => e.id === temarioEditionId);
  const userTestEdition = editions.find(e => e.id === testEditionId);

  // Filter modifications that apply to the user's assigned editions or general
  const userModifications = modifications.filter(mod => {
    if (!mod.affectedEditionIds || mod.affectedEditionIds.length === 0) return true;
    const userEdId = assignedEditions[mod.materialType];
    if (!userEdId) return true; // Show all if user has no assigned edition
    return mod.affectedEditionIds.includes(userEdId);
  });

  return (
    <div className="user-anexos-container fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={32} style={{ color: 'var(--primary-light)' }} />
            <span>Mis Actualizaciones y Fe de Erratas</span>
          </h1>
          <p className="text-muted">
            Consulta las hojas de modificación, anexos normativos y fe de erratas oficiales aplicables al temario y cuadernos de test.
          </p>
        </div>
      </div>

      {/* DESTACADO: FE DE ERRATAS Y PREGUNTAS SUSTITUTAS IMPRESAS */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', border: '1.5px solid #f59e0b', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', background: '#f59e0b', color: '#000', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📄 Documento Oficial Publicado
            </span>
            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700' }}>
              Actualización Código 4140
            </span>
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#fff' }}>
            Comunicado Oficial: Fe de Erratas y Preguntas Sustitutas (Edición Impresa)
          </h3>
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.55' }}>
            Descarga el informe oficial con las correcciones normativas (Art. 2 Normativa US 2024, Parejas de Hecho, Altura de Techos PRL y Matriz REDER EFQM) y las <strong>preguntas sustitutas con hoja de respuestas separada en la página 4</strong> para no interferir en la autoevaluación.
          </p>
        </div>

        <a
          href="/Comunicado_Fe_de_Erratas_y_Preguntas_Sustitutas.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="glow-btn"
          style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: '800', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', border: 'none', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)' }}
        >
          <Download size={20} />
          <span>Descargar PDF Fe de Erratas</span>
        </a>
      </div>

      {/* Card de Material Asignado al Alumno */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} style={{ color: 'var(--secondary)' }} />
          <span>Tus Ediciones Físicas Registradas:</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Edición de Temario Impreso</span>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: userTemarioEdition ? '#60a5fa' : 'var(--text-dark)', marginTop: '4px' }}>
              {userTemarioEdition ? `${userTemarioEdition.versionTag} — ${userTemarioEdition.title}` : 'Sin edición asignada'}
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Edición de Cuaderno de Tests</span>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: userTestEdition ? '#fde047' : 'var(--text-dark)', marginTop: '4px' }}>
              {userTestEdition ? `${userTestEdition.versionTag} — ${userTestEdition.title}` : 'Sin edición asignada'}
            </div>
          </div>
        </div>
      </div>

      {/* Listado de Anexos y Modificaciones */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>
          Hojas de Modificación y Correcciones Registradas ({userModifications.length})
        </h3>

        {userModifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px' }}>
            <CheckCircle2 size={48} style={{ color: '#34d399', margin: '0 auto 12px auto' }} />
            <h4 style={{ color: '#34d399', margin: 0, fontSize: '1.1rem' }}>¡Tu material está al día!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px', maxWidth: '500px', margin: '6px auto 0 auto' }}>
              Puedes descargar el documento oficial de Fe de Erratas en el panel superior.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userModifications.map(mod => {
              const topicObj = topics?.find(t => t.id.toString() === mod.topicId.toString());
              return (
                <div key={mod.id} className="glass-panel" style={{ padding: '18px 22px', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(15, 23, 42, 0.7)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(234, 179, 8, 0.18)', color: '#fde047', padding: '3px 10px', borderRadius: '8px' }}>
                          Tema {mod.topicId} {topicObj ? `- ${topicObj.title}` : ''}
                        </span>
                        {mod.sectionTitle && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            📍 {mod.sectionTitle}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dark)' }}>
                          {new Date(mod.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 style={{ margin: '6px 0 8px 0', fontSize: '1.05rem', color: '#fff' }}>{mod.title}</h4>
                      <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {mod.summaryText}
                      </p>
                    </div>

                    {mod.pdfAttachmentUrl && (
                      <a
                        href={mod.pdfAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glow-btn"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        <Download size={15} />
                        <span>Descargar PDF Anexo</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
