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
  Globe,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react';
import topicsData from '../data/topics.json';
import quizzesData from '../data/quizzes.json';
import glosarioData from '../data/agente_bus_glosario.json';

// ═══════════════════════════════════════════════════════
// AGENTE BUS — MODO NOTEBOOK GROUNDED v2.0 (STRICT RAG)
// ═══════════════════════════════════════════════════════
// Respuestas ancladas a 3 fuentes verificadas:
//   1. agente_bus_glosario.json   (FUENTE TERCIARIA — glosario verificado)
//   2. Markdown del temario        (FUENTE PRIMARIA  — texto literal)
//   3. quizzes.json                (FUENTE SECUNDARIA — banco de preguntas)
// Si el dato no consta en ninguna fuente → REGLA 0 (fallback honesto)
// ═══════════════════════════════════════════════════════

const SCORE_FULL    = 60;
const SCORE_PARTIAL = 20;

const stopWords = new Set([
  'que','es','la','de','el','un','en','para','por','con','sobre','del','al',
  'mi','tu','su','nos','y','o','si','no','lo','los','las','una','unas','unos',
  'este','esta','estos','estas','como','cual','cuales','quien','quienes','donde',
  'cuando','me','se','te','le','les','os','a','ante','bajo','cabe','contra',
  'desde','hacia','hasta','segun','sin','so','tras','via','durante','mediante',
  'ex','in','pro','dudas','pregunta','saber','conocer','explicar','explicame',
  'unidades','consiste','dime','decir','cuantos','cuantas'
]);

const stripAccents = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

// ── MOTOR A: Glosario verificado ────────────────────────────────────────────
function searchGlossary(qNorm, words) {
  let best = null;
  let highScore = 0;
  for (const entry of glosarioData) {
    let score = 0;
    const termNorm = stripAccents(entry.term);
    if (qNorm === termNorm || qNorm.includes(termNorm)) score += 200;
    for (const alias of (entry.aliases || [])) {
      const aliasNorm = stripAccents(alias);
      if (qNorm === aliasNorm) score += 200;
      else if (qNorm.includes(aliasNorm)) score += 120;
    }
    const answerNorm = stripAccents(entry.answer);
    for (const word of words) {
      if (termNorm.includes(word)) score += 40;
      if (answerNorm.includes(word)) score += 15;
      if (new RegExp(`\\b${word}\\b`).test(answerNorm)) score += 10;
    }
    if (score > highScore) {
      highScore = score;
      best = { text: entry.answer, score, source: entry.source, topicId: entry.topicId };
    }
  }
  return best && highScore > 0 ? best : null;
}

// ── MOTOR B: Markdown del temario ───────────────────────────────────────────
function searchMarkdown(allMarkdowns, words, activeTopic, searchScope) {
  const candidates = [];
  const topicIds = searchScope === 'current'
    ? [activeTopic.id.toString()]
    : Object.keys(allMarkdowns);

  for (const topicId of topicIds) {
    const md = allMarkdowns[topicId];
    if (!md) continue;
    const paragraphs = md.split('\n\n');
    let currentHeading = '';
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed.length < 20) continue;
      if (trimmed.includes('app-promo-banner') || trimmed.includes('https://')) continue;
      const headingMatch = trimmed.match(/^#{1,3}\s+(.+)/);
      if (headingMatch) { currentHeading = headingMatch[1].replace(/[*_`]/g,'').trim(); continue; }
      const pNorm = stripAccents(trimmed);
      let score = 0;
      for (const word of words) {
        if (pNorm.includes(word)) { score += 15; if (new RegExp(`\\b${word}\\b`).test(pNorm)) score += 10; }
      }
      if (score > 0) {
        const lengthPenalty = Math.floor(trimmed.length / 150);
        score = Math.max(1, score - lengthPenalty);
        const topicObj = topicsData.find(t => t.id.toString() === topicId);
        const sourceLabel = currentHeading
          ? `Tema ${topicId} — ${currentHeading}`
          : `Tema ${topicId} — ${topicObj?.title || 'Temario'}`;
        candidates.push({ text: trimmed.replace(/^#+\s+/g,''), score, source: sourceLabel, topicId });
      }
    }
  }
  candidates.sort((a,b) => b.score - a.score);
  return candidates[0] || null;
}

// ── MOTOR C: Banco de preguntas ──────────────────────────────────────────────
function searchQuizzes(words, activeTopic, searchScope) {
  const candidates = [];
  const topicIds = searchScope === 'current'
    ? [activeTopic.id.toString()]
    : Object.keys(quizzesData);

  for (const topicId of topicIds) {
    const questions = quizzesData[topicId] || [];
    for (const qItem of questions) {
      const questionNorm = stripAccents(qItem.question);
      const explanationNorm = stripAccents(qItem.explanation || '');
      let score = 0;
      for (const word of words) {
        if (questionNorm.includes(word)) { score += 15; if (new RegExp(`\\b${word}\\b`).test(questionNorm)) score += 10; }
        if (explanationNorm.includes(word)) { score += 10; if (new RegExp(`\\b${word}\\b`).test(explanationNorm)) score += 5; }
      }
      if (score > 0) {
        candidates.push({
          text: qItem.explanation || qItem.question,
          score,
          source: `Tema ${topicId} — Banco de preguntas de examen`,
          topicId,
          qItem
        });
      }
    }
  }
  candidates.sort((a,b) => b.score - a.score);
  return candidates[0] || null;
}

// ── Formato de respuesta con citación ───────────────────────────────────────
function buildResponse(text, source, coverage, repregunta) {
  const sourceBlock = source ? `\n\n📋 Fuente: ${source}` : '';
  const warningBlock = coverage === 'partial'
    ? '\n⚠️ He encontrado información relacionada. Contrasta con el temario completo si necesitas el dato exacto.'
    : '';
  return `${text}${sourceBlock}${warningBlock}\n\n${repregunta}`;
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function SiriAssistant({ activeTopicId, isOpen, onClose }) {
  const [messages, setMessages] = useState([{
    id: 1,
    sender: 'bot',
    text: '¡Hola! Soy el **Agente BUS** (Notebook Grounded v2.0).\n\nRespondo únicamente con información del temario oficial (Código 4140). Si un dato no consta en las fuentes verificadas, te lo haré saber explícitamente.\n\n¿Qué concepto del temario quieres consultar?',
    timestamp: new Date()
  }]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [searchScope, setSearchScope] = useState('current');
  const [allMarkdowns, setAllMarkdowns] = useState({});
  const [markdownsLoaded, setMarkdownsLoaded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const repreguntaCounterRef = useRef(0);
  const lastProposalRef = useRef(null);

  const activeTopic = topicsData.find(t => t.id === activeTopicId) || topicsData[0];

  // Carga lazy de todos los temas markdown al abrir el agente
  useEffect(() => {
    if (!isOpen || markdownsLoaded) return;
    const loadAll = async () => {
      const loaded = {};
      await Promise.all(topicsData.map(async (topic) => {
        const num = topic.id.toString().padStart(2,'0');
        try {
          const res = await fetch(`/markdown/tema-${num}.md`);
          if (res.ok) loaded[topic.id.toString()] = await res.text();
        } catch { /* skip */ }
      }));
      setAllMarkdowns(loaded);
      setMarkdownsLoaded(true);
    };
    loadAll();
  }, [isOpen, markdownsLoaded]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { alert('La entrada por voz no está soportada en este navegador. Prueba Chrome o Edge.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { setInputText(''); recognitionRef.current.start(); setIsListening(true); }
  };

  const speakText = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`•📋⚠️🟢🟡🔴]/g,'').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES'; utterance.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Microsoft'))) || voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => { if (typeof window !== 'undefined' && window.speechSynthesis) { window.speechSynthesis.cancel(); setIsSpeaking(false); } };

  const getRepregunta = () => {
    repreguntaCounterRef.current += 1;
    const mode = repreguntaCounterRef.current % 4;
    if (mode === 1) return '¿Quieres que hagamos una pregunta tipo test rápida sobre este apartado?';
    if (mode === 2) return '¿Te gustaría ver cómo se conecta este concepto con otros artículos del temario?';
    if (mode === 3) return '¿Quieres un ejemplo práctico de cómo suelen preguntar esto en el examen?';
    return '¿Quieres profundizar en algún otro concepto de este tema?';
  };

  // ── MOTOR PRINCIPAL (Notebook Grounded) ─────────────────────────────────
  const generateAnswer = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // REGLA 5: Fuera de ámbito
    const nonOposKeywords = ['clima','tiempo hoy','receta','futbol','pelicula','musica','juego','presidente','capital de','cocinar','restaurante'];
    const isOffTopic = nonOposKeywords.some(kw => q.includes(kw)) && !q.includes('examen') && !q.includes('bus') && !q.includes('opos');
    if (isOffTopic) return 'Esa consulta está fuera del temario oficial de la oposición (Código 4140).\n¿Tienes alguna duda sobre los 20 temas de la convocatoria?';

    // Interceptor: "Tema X"
    const topicMatch = q.match(/^(tema\s*)(\d{1,2})$/i);
    if (topicMatch) {
      const topicNum = topicMatch[2];
      const topicObj = topicsData.find(t => t.id.toString() === topicNum);
      if (topicObj) {
        lastProposalRef.current = { type: 'quiz_offer', targetTopicId: topicNum, keywords: topicObj.title.toLowerCase().split(/\s+/) };
        return `• **[Tema ${topicNum}]** ${topicObj.title}\n\n📋 Fuente: Temario oficial (Código 4140)\n\n¿Quieres revisar la teoría o hacemos una pregunta tipo test?`;
      }
    }

    // Interceptor: listar temas
    const isTopicListReq = /(enumera|lista|cuales|ver|dame)\s+(todos\s+)?(los\s+)?temas/i.test(q) || q === 'temas' || q.includes('temario oficial') || q.includes('lista de temas');
    if (isTopicListReq) {
      lastProposalRef.current = { type: 'quiz_offer', targetTopicId: '1', keywords: ['temas'] };
      let listContent = '**TEMARIO OFICIAL DE LA CONVOCATORIA (20 TEMAS — CÓDIGO 4140):**\n\n';
      topicsData.forEach(t => { listContent += `• **Tema ${t.id}:** ${t.title}\n`; });
      return `${listContent}\n📋 Fuente: Convocatoria oficial de la US\n\n¿De qué tema quieres revisar la teoría o hacer preguntas?`;
    }

    // ── INTERCEPTORES DE CONTEXTO (ANTES del filtro de palabras) ────────────
    // Deben evaluarse primero porque usan respuestas de 1 palabra ("sí", "vale",
    // "A", "B"…) que quedarían filtradas por stopWords si se procesan después.

    // Pregunta de quiz activa — el usuario responde con A/B/C/D
    if (lastProposalRef.current?.type === 'quiz_question_active') {
      const activeQ = lastProposalRef.current.qItem;
      const targetTopId = lastProposalRef.current.targetTopicId || activeTopicId.toString();
      const extractOptionLetter = (str) => {
        const norm = str.toLowerCase().trim();
        if (/^[abcd]$/i.test(norm)) return norm.toUpperCase();
        const m = norm.match(/\b(opcion|opción|respuesta|la|es)\s+([abcd])\b/i) || norm.match(/\b([abcd])\b/i);
        if (m && m[2]) return m[2].toUpperCase();
        if (m && m[1] && /^[abcd]$/i.test(m[1])) return m[1].toUpperCase();
        return null;
      };
      const userChoice = extractOptionLetter(userQuery);
      if (userChoice) {
        const correctIdx = activeQ.correctAnswer !== undefined ? activeQ.correctAnswer : 0;
        const correctLetter = ['A','B','C','D'][correctIdx];
        const correctText = activeQ.options[correctIdx]?.replace(/^[A-D]\)\s*/,'') || '';
        lastProposalRef.current = null;
        if (userChoice === correctLetter) {
          return `¡Correcto! 🎉 La opción **${correctLetter}) ${correctText}** es la respuesta correcta.\n\n💡 **Explicación:** ${activeQ.explanation}\n\n📋 Fuente: Tema ${targetTopId} — Banco de preguntas de examen\n\n¿Quieres otra pregunta o prefieres consultar un concepto teórico?`;
        } else {
          return `Incorrecto. La respuesta correcta era la **opción ${correctLetter}) ${correctText}**.\n\n💡 **Explicación:** ${activeQ.explanation}\n\n📋 Fuente: Tema ${targetTopId} — Banco de preguntas de examen\n\n¿Quieres que probemos otra pregunta para afianzar el concepto?`;
        }
      }
    }

    // Respuestas afirmativas — «sí», «vale», «dale», «ok»…
    const affirmativeWords = ['si','sí','vale','acepto','venga','de acuerdo','ok','dale','claro','adelante','perfecto'];
    const isAffirmative = affirmativeWords.some(w => q === w || q === `¡${w}!` || q === `${w}.`);
    if (isAffirmative) {
      const targetTopId = lastProposalRef.current?.targetTopicId || activeTopicId.toString();
      const keywords = lastProposalRef.current?.keywords || [];
      const topicQuizzes = (quizzesData[targetTopId] || quizzesData['18'] || quizzesData['1'] || []).filter(item => item?.question);
      let bestQ = null, highestScore = -1;
      topicQuizzes.forEach(item => {
        const fullTextNorm = stripAccents(item.question + ' ' + (item.explanation||'') + ' ' + (item.options?.join(' ')||''));
        let score = 0;
        keywords.forEach(kw => {
          const kwNorm = stripAccents(kw);
          if (kwNorm.length >= 3 && fullTextNorm.includes(kwNorm)) { score += 10; if (new RegExp(`\\b${kwNorm}\\b`).test(fullTextNorm)) score += 20; }
        });
        if (score > highestScore) { highestScore = score; bestQ = item; }
      });
      const selectedQ = (highestScore > 0 && bestQ) ? bestQ : topicQuizzes[Math.floor(Math.random() * topicQuizzes.length)];
      if (selectedQ) {
        lastProposalRef.current = { type: 'quiz_question_active', qItem: selectedQ, targetTopicId: targetTopId };
        const optionsList = selectedQ.options.map((opt,idx) => `${['A','B','C','D'][idx]}) ${opt.replace(/^[A-D]\)\s*/,'')}`).join('\n');
        return `• **[Tema ${targetTopId}] Pregunta de Examen:**\n${selectedQ.question}\n\n${optionsList}\n\n¿Sabrías cuál es la opción correcta?`;
      }
    }

    // Respuestas negativas — «no», «no lo sé», «ni idea»…
    const negativeWords = ['no','no lo se','no lo sé','no se','ni idea','dimelo tu','dímelo tú','dímelo','dimelo'];
    const isNegative = negativeWords.some(w => q === w || q.includes('no lo se') || q.includes('no lo sé'));
    if (isNegative && lastProposalRef.current?.type === 'quiz_question_active') {
      const activeQ = lastProposalRef.current.qItem;
      const correctIdx = activeQ.correctAnswer !== undefined ? activeQ.correctAnswer : 0;
      const correctLetter = ['A','B','C','D'][correctIdx];
      const correctText = activeQ.options[correctIdx]?.replace(/^[A-D]\)\s*/,'') || '';
      const savedTopId = lastProposalRef.current.targetTopicId;
      lastProposalRef.current = null;
      return `La respuesta correcta es la **opción ${correctLetter}) ${correctText}**.\n\n💡 **Explicación:** ${activeQ.explanation}\n\n📋 Fuente: Tema ${savedTopId} — Banco de preguntas\n\n¿Quieres otra pregunta o prefieres consultar la teoría?`;
    }

    // ── Palabras clave para búsqueda en las 3 fuentes ───────────────────────
    const qClean = q.replace(/[¿?¡!]/g,'').trim();
    const qNorm = stripAccents(qClean);
    const words = qNorm.split(/[\s,.\-;:?¿!¡()'\"«»]/).map(w => w.trim()).filter(w => w.length >= 2 && !stopWords.has(w));

    if (words.length === 0) return 'Por favor, haz una pregunta más específica (p.ej.: "préstamo", "FAMA", "Convenio", "SEPRUS").';

    // Tabla parentesco (caso especial)
    if ((q.includes('tabla') || q.includes('cuadro')) && (q.includes('parentesco') || q.includes('consanguinidad') || q.includes('afinidad'))) {
      lastProposalRef.current = { type: 'quiz_offer', targetTopicId: '18', keywords: ['parentesco'] };
      return `**TABLA DE GRADOS DE PARENTESCO (IV CONVENIO COLECTIVO US):**\n\n| Grado | Consanguinidad (Sangre/Adopción) | Afinidad (Matrimonio/Pareja de Hecho) |\n| :--- | :--- | :--- |\n| **1er Grado** | Padres e Hijos | Cónyuge, Suegros, Yernos, Nueras |\n| **2º Grado** | Hermanos, Abuelos, Nietos | Cuñados, Abuelos del cónyuge |\n| **3er Grado** | Tíos, Sobrinos, Bisabuelos | — |\n| **4º Grado** | Primos hermanos | — |\n\n📋 Fuente: Tema 18 — IV Convenio Colectivo, Anexo de parentesco\n\n${getRepregunta()}`;
    }

    // Teoría solicitada explícitamente
    const isTheoryReq = /(revis|ver|explic|dame)\s+(la\s+|el\s+)?(teoria|teoría|explicacion|explicación)/i.test(q) || q === 'teoria' || q === 'teoría';
    if (isTheoryReq) {
      const topId = lastProposalRef.current?.targetTopicId || activeTopicId.toString();
      const topicObj = topicsData.find(t => t.id.toString() === topId) || activeTopic;
      const md = allMarkdowns[topId];
      let theorySummary = `**[Tema ${topId}] Resumen Teórico — ${topicObj.title}**\n\n`;
      if (md) {
        const paras = md.split('\n\n').filter(p => p.trim().length > 30 && !p.includes('app-promo-banner') && !p.includes('https://')).slice(0,3);
        theorySummary += paras.map(p => p.replace(/^#+\s+/g,'')).join('\n\n');
      } else {
        theorySummary += `Normativa oficial del Tema ${topId}: **${topicObj.title}** (Código 4140).`;
      }
      return `${theorySummary}\n\n📋 Fuente: Tema ${topId} — ${topicObj.title}\n\n${getRepregunta()}`;
    }

    // ══ BÚSQUEDA EN LAS 3 FUENTES ══════════════════════════════════════════
    const glossaryResult = searchGlossary(qNorm, words);
    const markdownResult = searchMarkdown(allMarkdowns, words, activeTopic, searchScope);
    const quizResult     = searchQuizzes(words, activeTopic, searchScope);

    const allCandidates = [
      glossaryResult  && { ...glossaryResult,  priority: 1 },
      markdownResult  && { ...markdownResult,  priority: 2 },
      quizResult      && { ...quizResult,      priority: 3 },
    ].filter(Boolean).sort((a,b) => b.score !== a.score ? b.score - a.score : a.priority - b.priority);

    const best = allCandidates[0];
    const repregunta = getRepregunta();

    // REGLA 0: SIN COBERTURA
    if (!best || best.score < SCORE_PARTIAL) {
      const scopeHint = searchScope === 'current'
        ? '\n\n💡 Tip: Cambia a "🌐 Todos los Temas" para ampliar la búsqueda a todo el temario.'
        : '';
      return `⚠️ Esta información NO CONSTA en el temario cargado de la oposición (Código 4140).\n\nNo puedo confirmar este dato sin fuente verificada.${scopeHint}\n\n¿Quieres preguntarme sobre otro concepto del temario?`;
    }

    const coverage = best.score >= SCORE_FULL ? 'full' : 'partial';
    lastProposalRef.current = { type: 'quiz_offer', targetTopicId: best.topicId || activeTopicId.toString(), keywords: words };
    return buildResponse(best.text, best.source, coverage, repregunta);
  };

  const handleClearChat = () => {
    if (isSpeaking) stopSpeaking();
    lastProposalRef.current = null;
    setMessages([{ id: Date.now(), sender: 'bot', text: '¡Hola! He borrado la conversación. El Agente BUS (Notebook Grounded v2.0) sigue activo.\n\n¿Qué concepto del temario quieres consultar?', timestamp: new Date() }]);
  };

  const handleSendMessage = (textToSend = null) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;
    const isClearCmd = /(borra|borrar|limpiar|vaciar|reiniciar)\s+(la\s+|el\s+)?(conversacion|conversación|chat|historial)/i.test(query.trim());
    if (isClearCmd) { setInputText(''); handleClearChat(); return; }
    const userMessage = { id: Date.now(), sender: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setTimeout(() => {
      const answer = generateAnswer(query);
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: answer, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      if (voiceEnabled) speakText(answer);
    }, 250);
  };

  if (!isOpen) return null;

  const containerStyle = isMaximized ? {
    position:'fixed', top:'16px', bottom:'16px', right:'16px', left:'min(280px, calc(100vw - 32px))',
    zIndex:99999, display:'flex', flexDirection:'column', borderRadius:'20px',
    background:'rgba(11, 19, 43, 0.98)', backdropFilter:'blur(25px)', WebkitBackdropFilter:'blur(25px)',
    border:'2px solid rgba(212, 163, 89, 0.5)', boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(212,163,89,0.25)',
    overflow:'hidden', fontFamily:"'Inter', sans-serif", transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)'
  } : {
    position:'fixed', bottom:'24px', right:'24px', width:'480px', maxWidth:'calc(100vw - 32px)',
    height:'620px', maxHeight:'calc(100vh - 48px)', zIndex:99999, display:'flex', flexDirection:'column',
    borderRadius:'20px', background:'rgba(11, 19, 43, 0.96)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
    border:'2px solid rgba(212, 163, 89, 0.4)', boxShadow:'0 15px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212,163,89,0.2)',
    overflow:'hidden', fontFamily:"'Inter', sans-serif", transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)'
  };

  return (
    <div className="siri-assistant-overlay fade-in" style={containerStyle}>
      {/* Header */}
      <div style={{ padding:'14px 18px', background:'linear-gradient(135deg, rgba(212,163,89,0.15) 0%, rgba(59,130,246,0.15) 100%)', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(212,163,89,0.5)' }}>
            <Sparkles size={20} style={{ color:'#fff' }} />
          </div>
          <div>
            <div style={{ fontSize:'0.95rem', fontWeight:'bold', color:'#fff', display:'flex', alignItems:'center', gap:'6px' }}>
              <span>Agente BUS</span>
              <span style={{ fontSize:'0.65rem', background:'var(--secondary)', color:'#000', padding:'1px 6px', borderRadius:'10px', fontWeight:'800' }}>NOTEBOOK</span>
            </div>
            <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.7)' }}>
              {markdownsLoaded ? '✅ Corpus cargado — Respuestas verificadas del temario' : '⏳ Cargando corpus del temario…'}
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button type="button" onClick={handleClearChat} style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', cursor:'pointer', padding:'5px 8px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem' }} title="Borrar conversación">
            <Trash2 size={15} /><span style={{ fontSize:'0.7rem' }}>Borrar</span>
          </button>
          <button type="button" onClick={() => setIsMaximized(!isMaximized)} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#e2e8f0', cursor:'pointer', padding:'5px 8px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'4px' }} title={isMaximized ? 'Reducir' : 'Ampliar'}>
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span style={{ fontSize:'0.7rem' }}>{isMaximized ? 'Reducir' : 'Ampliar'}</span>
          </button>
          <button type="button" onClick={() => { if (isSpeaking) stopSpeaking(); setVoiceEnabled(!voiceEnabled); }} style={{ background:'transparent', border:'none', color: voiceEnabled ? 'var(--secondary-light)' : '#64748b', cursor:'pointer', padding:'4px' }} title={voiceEnabled ? 'Voz activada' : 'Voz desactivada'}>
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button type="button" onClick={() => { stopSpeaking(); onClose(); }} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', borderRadius:'50%', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} title="Cerrar">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
        {messages.map(msg => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} style={{ display:'flex', gap:'10px', alignItems:'flex-start', alignSelf: isBot ? 'flex-start' : 'flex-end', maxWidth:'90%' }}>
              {isBot && (<div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(212,163,89,0.2)', border:'1px solid var(--secondary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' }}><Bot size={16} style={{ color:'var(--secondary-light)' }} /></div>)}
              <div style={{ background: isBot ? 'rgba(30,41,59,0.9)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color:'#ffffff', padding:'10px 14px', borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px', border: isBot ? '1px solid rgba(255,255,255,0.12)' : 'none', fontSize:'0.84rem', lineHeight:'1.45', whiteSpace:'pre-line' }}>
                {msg.text}
              </div>
              {!isBot && (<div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(59,130,246,0.3)', border:'1px solid #3b82f6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' }}><User size={16} style={{ color:'#fff' }} /></div>)}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scope Selector */}
      <div style={{ display:'flex', padding:'10px 16px', gap:'12px', background:'rgba(0,0,0,0.45)', borderTop:'1px solid rgba(255,255,255,0.12)', borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
        <button type="button" onClick={() => setSearchScope('current')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'10px 14px', borderRadius:'24px', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', border: searchScope==='current' ? '2px solid var(--secondary)' : '2px solid rgba(255,255,255,0.2)', background: searchScope==='current' ? 'linear-gradient(135deg, rgba(212,163,89,0.3) 0%, rgba(217,119,6,0.3) 100%)' : 'rgba(255,255,255,0.05)', color: searchScope==='current' ? '#ffffff' : 'rgba(255,255,255,0.7)', boxShadow: searchScope==='current' ? '0 0 15px rgba(212,163,89,0.45)' : 'none', transition:'all 0.25s ease' }}>
          <BookOpen size={16} style={{ color: searchScope==='current' ? 'var(--secondary)' : 'rgba(255,255,255,0.5)' }} />
          <span>Tema {activeTopic.id} (Actual)</span>
        </button>
        <button type="button" onClick={() => setSearchScope('all')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'10px 14px', borderRadius:'24px', fontSize:'0.82rem', fontWeight:'800', cursor:'pointer', border: searchScope==='all' ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)', background: searchScope==='all' ? 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(29,78,216,0.3) 100%)' : 'rgba(255,255,255,0.05)', color: searchScope==='all' ? '#ffffff' : 'rgba(255,255,255,0.7)', boxShadow: searchScope==='all' ? '0 0 15px rgba(59,130,246,0.45)' : 'none', transition:'all 0.25s ease' }}>
          <Globe size={16} style={{ color: searchScope==='all' ? '#60a5fa' : 'rgba(255,255,255,0.5)' }} />
          <span>Todos los Temas</span>
        </button>
      </div>

      {/* Input Bar */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.1)', background:'rgba(15,23,42,0.95)', display:'flex', alignItems:'center', gap:'8px' }}>
        <button type="button" onClick={toggleListening} style={{ background: isListening ? '#ef4444' : 'rgba(255,255,255,0.08)', border: isListening ? '1px solid #dc2626' : '1px solid rgba(255,255,255,0.15)', color:'#fff', borderRadius:'50%', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all 0.2s ease', boxShadow: isListening ? '0 0 12px rgba(239,68,68,0.6)' : 'none' }} title={isListening ? 'Escuchando...' : 'Hablar por micrófono'}>
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isListening ? 'Escuchando tu voz...' : `Consulta (${searchScope==='current' ? `Tema ${activeTopic.id}` : 'Todo el Temario'})...`} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'8px 14px', color:'#fff', fontSize:'0.85rem', outline:'none' }} />
        <button type="button" onClick={() => handleSendMessage()} disabled={!inputText.trim()} style={{ background:'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', border:'none', color:'#fff', borderRadius:'50%', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', opacity: inputText.trim() ? 1 : 0.5, flexShrink:0 }} title="Enviar">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
