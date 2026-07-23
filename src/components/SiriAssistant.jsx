import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Bot, 
  User, 
  BookOpen, 
  Globe
} from 'lucide-react';
import topicsData from '../data/topics.json';
import quizzesData from '../data/quizzes.json';
import flashcardsData from '../data/flashcards.json';

// Predefined high-quality dictionary of concrete answers
const QUICK_DICTIONARY = {
  "bus": "La Biblioteca de la Universidad de Sevilla (BUS) es un centro de recursos para el aprendizaje, la docencia, la investigación y la formación continua. Funciona como una unidad funcional única e integrada por todos los fondos bibliográficos de la US.",
  "biblioteca de la universidad de sevilla": "La Biblioteca de la Universidad de Sevilla (BUS) es un centro de recursos para el aprendizaje, la docencia, la investigación y la formación continua. Funciona como una unidad funcional única e integrada por todos los fondos bibliográficos de la US.",
  "crai": "CRAI (Centro de Recursos para el Aprendizaje y la Investigación) es un modelo integrador de biblioteca que reúne en un único espacio físico y virtual: recursos de información, soporte tecnológico, soporte a docencia, aprendizaje e investigación.",
  "fama": "FAMA es el catálogo automatizado y buscador integrado de recursos impresos y electrónicos de la Universidad de Sevilla (BUS).",
  "rebiun": "REBIUN (Red de Bibliotecas Universitarias Españolas) es una comisión sectorial de la CRUE (Conferencia de Rectores) que coordina las políticas de las bibliotecas universitarias estatales en España.",
  "cbua": "CBUA (Consorcio de Bibliotecas Universitarias de Andalucía) asocia a las universidades públicas andaluzas para la compra conjunta de recursos electrónicos y el préstamo intercampus (PICA).",
  "dialnet": "DIALNET es el mayor portal de difusión de producción científica en español, liderado por la Universidad de La Rioja. La BUS es miembro catalogador activo.",
  "seprus": "SEPRUS es el Servicio de Prevención de Riesgos Laborales de la Universidad de Sevilla, encargado de la seguridad, evacuación y ergonomía en la BUS.",
  "pica": "PICA (Préstamo Intercampus) es el servicio del consorcio CBUA que permite a los usuarios solicitar y recibir en préstamo libros pertenecientes a otras universidades públicas andaluzas.",
  "objetoteca": "La Objetoteca es el servicio de préstamo diario de equipamiento de apoyo (portátiles, cargadores, auriculares, calculadoras). Deben devolverse el mismo día antes del cierre. Retraso sanciona con 5 días de suspensión por día.",
  "sancion": "• Retraso en monografías ordinarias: 1 día de suspensión por cada día de retraso y documento.\n• Retraso en portátiles/Objetoteca: 5 días de suspensión por cada día o fracción de retraso.",
  "sanciones": "• Retraso en monografías ordinarias: 1 día de suspensión por cada día de retraso y documento.\n• Retraso en portátiles/Objetoteca: 5 días de suspensión por cada día o fracción de retraso.",
  "plazos": "• Grado y PTGAS: 10 libros por 15 días.\n• Máster y Postgrado: 15 libros por 30 días.\n• Doctorandos: 30 libros por 60 días.\n• PDI: 60 libros por 60 días.\n• Renovaciones: Máximo 3 veces consecutivas si no hay reservas.",
  "prestamo": "• Grado y PTGAS: 10 libros por 15 días.\n• Máster y Postgrado: 15 libros por 30 días.\n• Doctorandos: 30 libros por 60 días.\n• PDI: 60 libros por 60 días.\n• Renovaciones: Máximo 3 veces consecutivas si no hay reservas.",
  "rector": "El Rector es la máxima autoridad académica y de representación de la Universidad de Sevilla. Preside la Comisión de la Biblioteca Universitaria.",
  "comision de biblioteca": "Es el órgano colegiado superior, consultivo y deliberante de la BUS. Integrado por Rector/Vicerrector, representantes del PDI, estudiantes, PTGAS y la Dirección de la BUS.",
  "junta tecnica": "Es el órgano colegiado asesor de la Dirección de la BUS. Lo forman los responsables de Servicios Centrales y de Bibliotecas de Área.",
  "consejo social": "Órgano de participación de la sociedad en la Universidad de Sevilla. Supervisa las actividades de carácter económico y aprueba el presupuesto.",
  "claustro": "Órgano colegiado máximo de representación de la comunidad universitaria en la US. Elabora los Estatutos y aprueba las líneas generales de la universidad.",
  "consejo de gobierno": "Órgano colegiado de gobierno de la US. Establece las líneas estratégicas y aprueba normativas como el Reglamento de la BUS.",
  "examen": "Examen oficial de la US:\n• 40 preguntas tipo test (4 opciones).\n• Acierto: +1 punto.\n• Fallo: -0.25 (1/4 de pregunta).\n• En blanco: 0.\n• Aprobado: 50% de la nota total (32.50 puntos sobre 65).",
  "puntuacion": "Examen oficial de la US:\n• Acierto: +1 punto.\n• Fallo: -0.25 (1/4 de pregunta).\n• En blanco: 0.\n• Aprobado: 50% de la nota total (32.50 puntos sobre 65).",
  "formula": "Fórmula de corrección: [Aciertos - (Fallos / 4)]. Las preguntas en blanco no restan.",
  "losu": "La LOSU (Ley Orgánica 2/2023 del Sistema Universitario) es la ley estatal orgánica que regula el marco general de las universidades españolas, sus funciones, órganos y personal.",
  "convenio": "El IV Convenio Colectivo del Personal Laboral de las Universidades Públicas de Andalucía regula el régimen de trabajo, categorías del Grupo I al V, licencias y código disciplinario (Tema 18).",
  "lprl": "La Ley 31/1995 de Prevención de Riesgos Laborales obliga a garantizar la seguridad y salud de los trabajadores en la US (Tema 20).",
  "igualdad": "La Ley Orgánica 3/2007 de Igualdad Efectiva regula la presencia equilibrada en tribunales de selección y prevención del acoso (Tema 19).",
  "sabius": "SABIUS es la base de datos curricular de la producción científica de los investigadores y docentes de la Universidad de Sevilla.",
  "uvus": "El UVUS (Usuario Virtual de la Universidad de Sevilla) es la credencial electrónica necesaria para identificarse en los servicios informáticos y ordenadores del campus de la US y de la biblioteca.",
  "pdi": "PDI (Personal Docente e Investigador) de la US. Tienen derecho a retirar hasta 60 documentos por un plazo de 60 días.",
  "ptgas": "El PTGAS (Personal Técnico, de Gestión y de Administración y Servicios, antes PAS) de la US tiene derecho a préstamo de 10 documentos por 15 días.",
  "doctorandos": "Los estudiantes de doctorado de la US tienen derecho a retirar hasta 30 documentos por un plazo de 60 días.",
  "egresados": "Egresados y antiguos alumnos de la US pueden acceder a servicios de biblioteca bajo las condiciones específicas aprobadas por el Consejo de Gobierno.",
  "visitantes": "Los usuarios externos no vinculados a la US pueden acceder a la BUS en los términos aprobados por el Consejo de Gobierno.",
  "alfin": "ALFIN (Alfabetización Informacional) es el plan de formación técnica que imparte la BUS para dotar de habilidades informacionales a estudiantes e investigadores.",
  "pib": "El PIB (Préstamo Interbibliotecario) es el servicio que localiza y obtiene libros o documentos que no están en el catálogo de la BUS de otras bibliotecas.",
  "ill": "ILL (Inter-Library Loan) es el término técnico internacional para referirse al Préstamo Interbibliotecario.",
  "renovaciones": "Se permiten hasta 3 renovaciones consecutivas a través de FAMA antes del vencimiento del préstamo actual, si el documento no tiene reservas.",
  "reservas": "Permite reservar un libro prestado en FAMA. Tras recibir aviso de disponibilidad, el usuario dispone de 2 días para recogerlo.",
  "fondo antiguo": "El Fondo Antiguo de la BUS comprende todos los documentos impresos y manuscritos anteriores al año 1801, así como obras singulares y valiosas hasta 1958.",
  "servicios centrales": "Servicios Centrales de la BUS: Adquisiciones y Proceso Técnico, Recursos Electrónicos, Tecnologías, Apoyo a la Investigación (SAI) y Acceso al Documento.",
  "bibliotecas de area": "Bibliotecas físicas de campus de la BUS (ej. Humanidades, Ingeniería, Ciencias de la Salud, Ciencias Económicas y Jurídicas).",
  "parentesco": "El parentesco en el IV Convenio Colectivo se divide en Consanguinidad (vínculo de sangre/adopción) y Afinidad (matrimonio/pareja de hecho). Determina la concesión y duración de permisos.",
  "consanguinidad": "Consanguinidad: vínculo de sangre o adopción.\n• 1º grado: Padres, hijos.\n• 2º grado: Hermanos, abuelos, nietos.\n• 3º grado: Tíos, sobrinos, bisabuelos.\n• 4º grado: Primos hermanos.",
  "afinidad": "Afinidad: vínculo político por matrimonio o pareja de hecho con familiares consanguíneos del cónyuge.\n• 1º grado: Suegros, cónyuge, yernos, nueras.\n• 2º grado: Cuñados, abuelos del cónyuge."
};

const stopWords = new Set([
  'que', 'es', 'la', 'de', 'el', 'un', 'en', 'para', 'por', 'con', 'sobre', 'del', 'al', 
  'mi', 'tu', 'su', 'nos', 'y', 'o', 'si', 'no', 'lo', 'los', 'las', 'una', 'unas', 'unos', 
  'este', 'esta', 'estos', 'estas', 'como', 'cual', 'cuales', 'quien', 'quienes', 'donde', 
  'cuando', 'me', 'se', 'te', 'le', 'les', 'nos', 'os', 'a', 'ante', 'bajo', 'cabe', 'contra',
  'desde', 'hacia', 'hasta', 'para', 'segun', 'sin', 'so', 'sobre', 'tras', 'via', 'durante', 
  'mediante', 'versos', 'versus', 'ex', 'in', 'pro', 'dudas', 'pregunta', 'saber', 'conocer',
  'explicar', 'explicame', 'unidades', 'consiste'
]);

const stripAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function SiriAssistant({ activeTopicId, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy el **Agente BUS**. Respondo consultas concretas por escrito sobre el temario de la oposición, normativas o el examen.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Por escrito por defecto
  const [searchScope, setSearchScope] = useState('current'); // 'current' | 'all'
  const [currentTopicMarkdown, setCurrentTopicMarkdown] = useState('');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Active topic object
  const activeTopic = topicsData.find(t => t.id === activeTopicId) || topicsData[0];

  // Fetch current topic markdown for contextual Q&A
  useEffect(() => {
    if (!activeTopicId) return;
    const formattedNum = activeTopicId.toString().padStart(2, '0');
    fetch(`/markdown/tema-${formattedNum}.md`)
      .then(res => res.ok ? res.text() : '')
      .then(text => setCurrentTopicMarkdown(text))
      .catch(() => setCurrentTopicMarkdown(''));
  }, [activeTopicId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('La entrada por voz no está soportada en este navegador. Prueba con Google Chrome o Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => (v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Microsoft')))) || voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Ultra-Concise Knowledge Base Search Engine
  const generateAnswer = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Off-topic check
    const nonOposKeywords = ['clima', 'tiempo hoy', 'receta', 'futbol', 'pelicula', 'musica', 'juego', 'presidente', 'capital de'];
    const isOffTopic = nonOposKeywords.some(kw => q.includes(kw)) && !q.includes('examen') && !q.includes('bus');
    if (isOffTopic) {
      return `Soy el Agente BUS especializado exclusivamente en las Oposiciones de la US. Respondo dudas concretas sobre el temario, normativas y el examen.`;
    }

    // Clean query from symbols
    const qClean = q.replace(/[¿?¡!]/g, "").trim();
    const qNorm = stripAccents(qClean);

    // Extract search keywords
    const words = qNorm.split(/[\s,.\-;:?¿!¡()'"«»]/)
      .map(w => w.trim())
      .filter(w => w.length >= 2 && !stopWords.has(w));

    // If no words after filtering, return default prompt guidance
    if (words.length === 0) {
      return `Por favor, haz una pregunta más específica. Puedes preguntar por términos del temario como 'préstamo', 'sanción', 'FAMA', 'LOSU' o 'Convenio'.`;
    }

    const candidates = [];

    // --- PHASE A: Predefined Dictionary Scanning ---
    Object.entries(QUICK_DICTIONARY).forEach(([key, value]) => {
      let score = 0;
      const keyClean = stripAccents(key);
      const valClean = stripAccents(value);
      
      // Strict exact match bonus
      if (qNorm === keyClean) {
        score += 100;
      } else if (qNorm.includes(keyClean)) {
        score += 50;
      }
      
      // Keyword matching
      words.forEach(word => {
        if (keyClean.includes(word)) score += 20;
        if (valClean.includes(word)) score += 10;
      });
      
      if (score > 0) {
        // High quality predefined dictionary bonus
        score += 40;
        candidates.push({ text: value, score, source: 'dictionary' });
      }
    });

    // --- PHASE B: Markdown Paragraph Scanning ---
    if (currentTopicMarkdown) {
      const paragraphs = currentTopicMarkdown.split('\n\n');
      paragraphs.forEach(p => {
        const pClean = p.trim();
        if (pClean.length < 20 || pClean.includes('app-promo-banner') || pClean.includes('https://')) return;
        
        const pNorm = stripAccents(pClean);
        let score = 0;
        
        words.forEach(word => {
          if (pNorm.includes(word)) {
            score += 15;
            // Exact word boundary bonus
            if (new RegExp(`\\b${word}\\b`).test(pNorm)) {
              score += 10;
            }
          }
        });
        
        if (score > 0) {
          // Length penalty to prefer highly focused/short paragraphs
          const lengthPenalty = Math.floor(pClean.length / 100);
          score = Math.max(1, score - lengthPenalty);
          
          candidates.push({ 
            text: `• **[Tema ${activeTopic.id}]** ${pClean.replace(/^#+\s+/g, '')}`, 
            score, 
            source: 'markdown' 
          });
        }
      });
    }

    // --- PHASE C: Quiz Database Scanning ---
    const targetTopicIds = searchScope === 'current' 
      ? [activeTopicId.toString()] 
      : Object.keys(quizzesData);
      
    targetTopicIds.forEach(topId => {
      const questions = quizzesData[topId] || [];
      questions.forEach(qItem => {
        const questionNorm = stripAccents(qItem.question);
        const explanationNorm = stripAccents(qItem.explanation);
        let score = 0;
        
        words.forEach(word => {
          if (questionNorm.includes(word)) {
            score += 15;
            if (new RegExp(`\\b${word}\\b`).test(questionNorm)) {
              score += 10;
            }
          }
          if (explanationNorm.includes(word)) {
            score += 10;
            if (new RegExp(`\\b${word}\\b`).test(explanationNorm)) {
              score += 5;
            }
          }
        });
        
        if (score > 0) {
          score += 10; // general quiz source weight
          const answerText = `• **[Tema ${topId}] Pregunta:** ${qItem.question}\n• **Respuesta / Norma:** ${qItem.explanation}`;
          candidates.push({ text: answerText, score, source: 'quiz' });
        }
      });
    });

    // --- PHASE D: Sort and Select best candidate ---
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length > 0 && candidates[0].score >= 20) {
      return candidates[0].text;
    }

    // Fallback if no matching items
    if (searchScope === 'current') {
      return `• **[Tema ${activeTopic.id}]** No encuentro una respuesta específica a tu consulta dentro de la información de este tema.\n\n💡 *Tip: Cambia el selector superior a \"Todo el Temario\" para buscar en todos los temas e informaciones de la oposición.*`;
    } else {
      return `• No he localizado una respuesta lo suficientemente precisa sobre "${qClean}".\n\n💡 *Prueba a preguntar usando palabras clave como: 'préstamo', 'sanciones', 'LOSU', 'CBUA', 'Fondo Antiguo', 'Rector', 'Comisión' o 'examen'.*`;
    }
  };

  const handleSendMessage = (textToSend = null) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const answer = generateAnswer(query);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      if (voiceEnabled) speakText(answer);
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="siri-assistant-overlay fade-in" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      height: '570px',
      maxHeight: 'calc(100vh - 48px)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '20px',
      background: 'rgba(11, 19, 43, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '2px solid rgba(212, 163, 89, 0.4)',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 163, 89, 0.2)',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(212,163,89,0.15) 0%, rgba(59,130,246,0.15) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(212,163,89,0.5)'
          }}>
            <Sparkles size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Agente BUS</span>
              <span style={{ fontSize: '0.65rem', background: 'var(--secondary)', color: '#000', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>IA DIDÁCTICA</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
              Respuestas escritas y concretas del temario
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            style={{ background: 'transparent', border: 'none', color: voiceEnabled ? 'var(--secondary-light)' : '#64748b', cursor: 'pointer', padding: '4px' }}
            title={voiceEnabled ? "Lectura por voz activada" : "Lectura por voz desactivada (por defecto)"}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button 
            type="button"
            onClick={() => { stopSpeaking(); onClose(); }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Cerrar Agente BUS"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(msg => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '90%'
              }}
            >
              {isBot && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,163,89,0.2)', border: '1px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Bot size={16} style={{ color: 'var(--secondary-light)' }} />
                </div>
              )}
              <div style={{
                background: isBot ? 'rgba(30, 41, 59, 0.9)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                border: isBot ? '1px solid rgba(255,255,255,0.12)' : 'none',
                fontSize: '0.84rem',
                lineHeight: '1.45',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>
              {!isBot && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.3)', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <User size={16} style={{ color: '#fff' }} />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scope Selector Bar (Tema Actual vs Todos) - Highlighted at the bottom */}
      <div style={{
        display: 'flex',
        padding: '10px 16px',
        gap: '12px',
        background: 'rgba(0, 0, 0, 0.45)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
      }}>
        <button
          type="button"
          onClick={() => setSearchScope('current')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '24px',
            fontSize: '0.82rem',
            fontWeight: '800',
            cursor: 'pointer',
            border: searchScope === 'current' ? '2px solid var(--secondary)' : '2px solid rgba(255,255,255,0.2)',
            background: searchScope === 'current' ? 'linear-gradient(135deg, rgba(212,163,89,0.3) 0%, rgba(217,119,6,0.3) 100%)' : 'rgba(255,255,255,0.05)',
            color: searchScope === 'current' ? '#ffffff' : 'rgba(255,255,255,0.7)',
            boxShadow: searchScope === 'current' ? '0 0 15px rgba(212,163,89,0.45)' : 'none',
            transition: 'all 0.25s ease',
            letterSpacing: '0.03em'
          }}
        >
          <BookOpen size={16} style={{ color: searchScope === 'current' ? 'var(--secondary)' : 'rgba(255,255,255,0.5)' }} />
          <span>Tema {activeTopic.id} (Actual)</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchScope('all')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '24px',
            fontSize: '0.82rem',
            fontWeight: '800',
            cursor: 'pointer',
            border: searchScope === 'all' ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)',
            background: searchScope === 'all' ? 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(29,78,216,0.3) 100%)' : 'rgba(255,255,255,0.05)',
            color: searchScope === 'all' ? '#ffffff' : 'rgba(255,255,255,0.7)',
            boxShadow: searchScope === 'all' ? '0 0 15px rgba(59, 130, 246, 0.45)' : 'none',
            transition: 'all 0.25s ease',
            letterSpacing: '0.03em'
          }}
        >
          <Globe size={16} style={{ color: searchScope === 'all' ? '#60a5fa' : 'rgba(255,255,255,0.5)' }} />
          <span>Todos los Temas</span>
        </button>
      </div>

      {/* Input Bar */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={toggleListening}
          style={{
            background: isListening ? '#ef4444' : 'rgba(255,255,255,0.08)',
            border: isListening ? '1px solid #dc2626' : '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none'
          }}
          title={isListening ? 'Escuchando... Haz clic para cancelar' : 'Hablar por micrófono'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isListening ? 'Escuchando tu voz...' : `Consulta (${searchScope === 'current' ? `Tema ${activeTopic.id}` : 'Todo el Temario'})...`}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '8px 14px',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            opacity: inputText.trim() ? 1 : 0.5,
            flexShrink: 0
          }}
          title="Enviar consulta"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
