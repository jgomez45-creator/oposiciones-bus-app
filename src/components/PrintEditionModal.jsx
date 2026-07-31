import React, { useState, useEffect } from 'react';
import { Printer, ShieldCheck, FileCheck, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function PrintEditionModal({
  isOpen,
  onClose,
  materialType = 'temario', // 'temario' | 'test' | 'simulacro'
  defaultTitle = '',
  topicCount = 20,
  currentUser,
  onConfirmPrint // callback: (option, editionData) => void
}) {
  const isAdmin = !currentUser || currentUser?.role === 'admin' || currentUser?.email === 'admin@admin.com';
  const [option, setOption] = useState('test'); // 'test' | 'new' | 'overwrite'
  const [versionTag, setVersionTag] = useState('V1.0');
  const [title, setTitle] = useState(defaultTitle);
  const [notes, setNotes] = useState('');
  const [selectedOverwriteId, setSelectedOverwriteId] = useState('');
  const [existingEditions, setExistingEditions] = useState([]);
  const [loadingEditions, setLoadingEditions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setLoadingEditions(true);
      const unsub = firebaseService.subscribeToMaterialEditions((editions) => {
        const filtered = editions.filter(e => e.type === materialType);
        setExistingEditions(filtered);
        if (filtered.length > 0) {
          setSelectedOverwriteId(filtered[0].id);
          // Suggest next version number if new
          const lastTag = filtered[filtered.length - 1].versionTag;
          const match = lastTag.match(/V(\d+)\.(\d+)/i);
          if (match) {
            const major = parseInt(match[1], 10);
            const minor = parseInt(match[2], 10) + 1;
            setVersionTag(`V${major}.${minor}`);
          }
        }
        setLoadingEditions(false);
      });
      return () => unsub();
    }
  }, [isOpen, materialType, defaultTitle]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    if (option === 'test') {
      onConfirmPrint('test', null);
      return;
    }

    if (option === 'new') {
      if (!versionTag.trim()) {
        alert('Por favor, especifica la etiqueta de versión (ej. V1.0).');
        return;
      }
      const editionData = {
        type: materialType,
        versionTag: versionTag.trim(),
        title: title || `Edición ${versionTag} (${materialType.toUpperCase()})`,
        notes: notes.trim(),
        topicCount
      };
      onConfirmPrint('new', editionData);
      return;
    }

    if (option === 'overwrite') {
      if (!selectedOverwriteId) {
        alert('Por favor, selecciona la edición existente que deseas sobrescribir.');
        return;
      }
      const existing = existingEditions.find(e => e.id === selectedOverwriteId);
      const editionData = {
        ...existing,
        notes: notes.trim() ? `${existing.notes ? existing.notes + '\n' : ''}[Actualizado]: ${notes.trim()}` : existing.notes,
        topicCount
      };
      onConfirmPrint('overwrite', editionData);
      return;
    }
  };

  return (
    <div className="login-screen-overlay no-print" style={{ zIndex: 10000, background: 'rgba(5, 8, 20, 0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="login-card glass-panel fade-in" style={{ maxWidth: '580px', width: '90%', padding: '24px', position: 'relative' }}>

        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-light)' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              {isAdmin ? 'Opciones de Impresión y Control Editorial' : 'Confirmar Impresión'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tipo de material: <strong style={{ color: 'var(--secondary-light)', textTransform: 'uppercase' }}>{materialType}</strong> ({topicCount} temas)
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
          {isAdmin
            ? 'Como administrador, puedes descargar este documento para revisión sin guardar, registrar una versión oficial nueva o machacar una versión previa para imprenta.'
            : 'Esta opción generará y descargará el documento PDF para tu estudio y revisión personal.'}
        </p>

        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>

            {/* Opción 1: Prueba */}
            <label style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '14px',
              borderRadius: '10px',
              border: option === 'test' ? '1.5px solid var(--primary-light)' : '1px solid var(--border-color)',
              background: option === 'test' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="print_option"
                checked={option === 'test'}
                onChange={() => setOption('test')}
                style={{ marginTop: '3px' }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>1. Impresión de Prueba (Sin Registrar)</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Genera y descarga el PDF para revisión personal sin alterar ninguna edición oficial en el sistema.</span>
              </div>
            </label>

            {/* Opción 2: Nueva Edición */}
            <label style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '14px',
              borderRadius: '10px',
              border: option === 'new' ? '1.5px solid var(--secondary-light)' : '1px solid var(--border-color)',
              background: option === 'new' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="print_option"
                checked={option === 'new'}
                onChange={() => setOption('new')}
                style={{ marginTop: '3px' }}
              />
              <div style={{ width: '100%' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>2. Registrar Nueva Edición Oficial (Snapshot)</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crea una versión oficial numerada para control de entrega a estudiantes.</span>

                {option === 'new' && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Versión (ej. V1.0)"
                        value={versionTag}
                        onChange={(e) => setVersionTag(e.target.value)}
                        style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Título descriptivo de la edición"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <textarea
                      placeholder="Notas internas / Historial de cambios para imprenta..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#fff', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>
            </label>

            {/* Opción 3: Sobrescribir */}
            <label style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '14px',
              borderRadius: '10px',
              border: option === 'overwrite' ? '1.5px solid var(--accent-rose)' : '1px solid var(--border-color)',
              background: option === 'overwrite' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="print_option"
                checked={option === 'overwrite'}
                onChange={() => setOption('overwrite')}
                style={{ marginTop: '3px' }}
              />
              <div style={{ width: '100%' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>3. Sobrescribir / Reemplazar Edición Existente</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Actualiza el documento de una versión ya registrada (ej. corregir erratas justo antes de imprenta) conservando los alumnos asignados.</span>

                {option === 'overwrite' && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {existingEditions.length > 0 ? (
                      <>
                        <select
                          value={selectedOverwriteId}
                          onChange={(e) => setSelectedOverwriteId(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#fff', fontSize: '0.85rem' }}
                        >
                          {existingEditions.map(ed => (
                            <option key={ed.id} value={ed.id}>
                              {ed.versionTag} - {ed.title} (Creada: {new Date(ed.createdAt).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Motivo de la sobrescritura / Correcciones aplicadas..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: '#fff', fontSize: '0.8rem', resize: 'vertical' }}
                        />
                      </>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} />
                        <span>No hay ninguna edición previa registrada de tipo {materialType.toUpperCase()} para sobrescribir. Usa la Opción 2.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="glow-btn"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Printer size={16} />
            <span>Confirmar e Imprimir</span>
          </button>
        </div>

      </div>
    </div>
  );
}
