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
import { firebaseService } from '../services/firebaseService';

// ═══════════════════════════════════════════════════════
// AGENTE BUS — DICCIONARIO DE SINÓNIMOS Y PESOS DE BÚSQUEDA
// ═══════════════════════════════════════════════════════
const SYNONYMS_MAP = {
  'prestamo': ['prestar', 'prestados', 'devolucion', 'devolver', 'plazo', 'renovacion', 'renovar', 'préstamo', 'temporada'],
  'carne': ['carnet', 'tarjeta', 'identificacion', 'usuario', 'lector', 'carne'],
  'fama': ['catalogo', 'buscador', 'busqueda', 'encontrar', 'fama'],
  'seprus': ['seguridad', 'prevencion', 'salud', 'riesgos', 'seprus'],
  'convenio': ['acuerdo', 'contrato', 'colectivo', 'laboral', 'convenio'],
  'sancion': ['penalidad', 'penalizacion', 'multa', 'suspension', 'castigo', 'sancion']
};

const WORD_WEIGHTS = {
  'fama': 3.0,
  'seprus': 3.0,
  'convenio': 2.5,
  'prestamo': 2.0,
  'sancion': 2.5,
  'crai': 3.0,
  'biblioteca': 1.5
};

const expandKeywords = (words) => {
  const expanded = new Set(words);
  words.forEach(word => {
    const norm = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (SYNONYMS_MAP[norm]) {
      SYNONYMS_MAP[norm].forEach(syn => expanded.add(syn));
    }
    for (const [key, synList] of Object.entries(SYNONYMS_MAP)) {
      if (synList.includes(norm)) {
        expanded.add(key);
        synList.forEach(syn => expanded.add(syn));
      }
    }
  });
  return Array.from(expanded);
};

// ═══════════════════════════════════════════════════════
// AGENTE BUS — MODO NOTEBOOK GROUNDED v3.0 (ENHANCED RAG)
// ═══════════════════════════════════════════════════════
// Respuestas ancladas a 3 fuentes verificadas:
//   1. agente_bus_glosario.json   (FUENTE TERCIARIA — glosario verificado)
//   2. Markdown del temario        (FUENTE PRIMARIA  — texto literal)
//   3. quizzes.json                (FUENTE SECUNDARIA — banco de preguntas)
// Si el dato no consta en ninguna fuente → REGLA 0 (fallback honesto)
// ═══════════════════════════════════════════════════════

const SCORE_FULL = 60;
const SCORE_PARTIAL = 20;

const stopWords = new Set([
  'que', 'es', 'la', 'de', 'el', 'un', 'en', 'para', 'por', 'con', 'sobre', 'del', 'al',
  'mi', 'tu', 'su', 'nos', 'y', 'o', 'si', 'no', 'lo', 'los', 'las', 'una', 'unas', 'unos',
  'este', 'esta', 'estos', 'estas', 'como', 'cual', 'cuales', 'quien', 'quienes', 'donde',
  'cuando', 'me', 'se', 'te', 'le', 'les', 'os', 'a', 'ante', 'bajo', 'cabe', 'contra',
  'desde', 'hacia', 'hasta', 'segun', 'sin', 'so', 'tras', 'via', 'durante', 'mediante',
  'ex', 'in', 'pro', 'dudas', 'pregunta', 'saber', 'conocer', 'explicar', 'explicame',
  'unidades', 'consiste', 'dime', 'decir', 'cuantos', 'cuantas'
]);

const stripAccents = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── MOTOR A: Glosario verificado ────────────────────────────────────────────
function searchGlossary(qNorm, words) {
  let best = null;
  let highScore = 0;

  for (const entry of glosarioData) {
    let score = 0;
    const termNorm = stripAccents(entry.term);

    // Coincidencia exacta de término completo o como palabra independiente
    if (qNorm === termNorm) {
      score += 200;
    } else if (new RegExp(`\\b${escapeRegex(termNorm)}\\b`).test(qNorm)) {
      score += 150;
    }

    // Coincidencia con alias respetando límites de palabra (\b)
    for (const alias of (entry.aliases || [])) {
      const aliasNorm = stripAccents(alias);
      if (qNorm === aliasNorm) {
        score += 200;
      } else if (aliasNorm.length >= 3 && new RegExp(`\\b${escapeRegex(aliasNorm)}\\b`).test(qNorm)) {
        score += 120;
      }
    }

    // Coincidencia de palabras clave del usuario en el texto explicativo
    const answerNorm = stripAccents(entry.answer);
    for (const word of words) {
      if (word.length >= 3 && new RegExp(`\\b${escapeRegex(word)}\\b`).test(answerNorm)) {
        score += 25;
      }
    }

    if (score > highScore) {
      highScore = score;
      best = { text: entry.answer, score, source: entry.source, topicId: entry.topicId };
    }
  }

  return best && highScore >= SCORE_PARTIAL ? best : null;
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
      if (headingMatch) { currentHeading = headingMatch[1].replace(/[*_`]/g, '').trim(); continue; }
      const pNorm = stripAccents(trimmed);
      let score = 0;
      const matchedIndexes = [];
      const pWords = pNorm.split(/[\s,.\-;:?¿!¡()'\"«»]/).map(w => w.trim()).filter(w => w.length > 0);

      words.forEach(word => {
        const weight = WORD_WEIGHTS[word] || 1.0;
        const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`);
        if (word.length >= 3 && wordRegex.test(pNorm)) {
          score += 25 * weight;
          pWords.forEach((pw, idx) => {
            if (pw === stripAccents(word)) matchedIndexes.push(idx);
          });
        } else if (word.length >= 5 && pNorm.includes(word)) {
          score += 10 * weight;
        }
      });

      // Proximity Bonus: If multiple keywords match, calculate minimum distance between them
      if (matchedIndexes.length > 1) {
        matchedIndexes.sort((a, b) => a - b);
        let minDistance = Infinity;
        for (let i = 0; i < matchedIndexes.length - 1; i++) {
          const dist = matchedIndexes[i + 1] - matchedIndexes[i];
          if (dist < minDistance) minDistance = dist;
        }
        if (minDistance <= 3) {
          score = score * 1.5;
        } else if (minDistance <= 6) {
          score = score * 1.25;
        }
      }

      if (score > 0) {
        const lengthPenalty = Math.floor(trimmed.length / 150);
        score = Math.max(1, score - lengthPenalty);
        const topicObj = topicsData.find(t => t.id.toString() === topicId);
        const sourceLabel = currentHeading
          ? `Tema ${topicId} — ${currentHeading}`
          : `Tema ${topicId} — ${topicObj?.title || 'Temario'}`;
        candidates.push({ text: trimmed.replace(/^#+\s+/g, ''), score, source: sourceLabel, topicId });
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);
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
        if (word.length >= 3 && new RegExp(`\\b${escapeRegex(word)}\\b`).test(questionNorm)) {
          score += 25;
        }
        if (word.length >= 3 && new RegExp(`\\b${escapeRegex(word)}\\b`).test(explanationNorm)) {
          score += 15;
        }
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
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

// ── Formato de respuesta con citación estructurada ──────────────────────────
function formatBotResponse(text, source, coverage = 'full', repreguntaText = '') {
  let formattedText = text;

  // Highlight key terms for study enhancement
  const termsToBold = ['artículo', 'seguridad', 'préstamo', 'plazo', 'sanción', 'FAMA', 'SEPRUS', 'Convenio Colectivo'];
  termsToBold.forEach(term => {
    const escapedTerm = escapeRegex(term);
    const rx = new RegExp(`(?<!\\*\\*)\\b(${escapedTerm}s?)\\b(?!\\*\\*)`, 'gi');
    formattedText = formattedText.replace(rx, '**$1**');
  });

  const sourceBlock = source ? `\n\n📋 **Fuente:** _${source}_` : '';
  const warningBlock = coverage === 'partial'
    ? '\n⚠️ *He localizado esta sección relacionada en el temario. Te sugiero contrastar.*'
    : '';
  const repreguntaBlock = repreguntaText ? `\n\n💡 _${repreguntaText}_` : '';

  return `${formattedText}${sourceBlock}${warningBlock}${repreguntaBlock}`;
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function SiriAssistant({ activeTopicId, isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([{
    id: 1,
    sender: 'bot',
    text: '¡Hola! Soy el **Agente BUS**.\n\nRespondo únicamente con información del temario oficial (Código 4140). Si un dato no consta en las fuentes verificadas, te lo haré saber explícitamente.\n\n¿Qué concepto del temario quieres consultar?',
    timestamp: new Date(),
    feedback: null,
    userQuery: ''
  }]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [allMarkdowns, setAllMarkdowns] = useState({});
  const [markdownsLoaded, setMarkdownsLoaded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Admin Training state
  const [trainedAnswers, setTrainedAnswers] = useState([]);
  const [unresolvedDudas, setUnresolvedDudas] = useState([]);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [selectedDudaToTrain, setSelectedDudaToTrain] = useState(null);
  const [customQueryInput, setCustomQueryInput] = useState('');
  const [customAnswerInput, setCustomAnswerInput] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const repreguntaCounterRef = useRef(0);
  const lastProposalRef = useRef(null);

  const activeTopic = topicsData.find(t => t.id === activeTopicId) || topicsData[0];

  // Subscribe to trained answers and unresolved question logs in real time
  useEffect(() => {
    if (!isOpen) return;
    const unsubTrained = firebaseService.subscribeToTrainedAnswers((list) => {
      // Sort by query length descending to ensure specific match priority
      const sorted = [...list].sort((a, b) => b.queryText.length - a.queryText.length);
      setTrainedAnswers(sorted);
    });

    let unsubUnresolved = () => { };
    if (currentUser?.role === 'admin') {
      unsubUnresolved = firebaseService.subscribeToUnresolvedDudas((list) => {
        // Sort by count descending
        const sorted = [...list].sort((a, b) => (b.count || 1) - (a.count || 1));
        setUnresolvedDudas(sorted);
      });
    }

    return () => {
      unsubTrained();
      unsubUnresolved();
    };
  }, [isOpen, currentUser]);

  // Carga lazy de todos los temas markdown al abrir el agente
  useEffect(() => {
    if (!isOpen || markdownsLoaded) return;
    const loadAll = async () => {
      const loaded = {};
      await Promise.all(topicsData.map(async (topic) => {
        const num = topic.id.toString().padStart(2, '0');
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
    const cleanText = text.replace(/[*_#`•📋⚠️🟢🟡🔴]/g, '').trim();
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

  // Devuelve { text, type } — type: 'quiz' | 'info'
  // Solo cuando type==='quiz' el interceptor de afirmativas lanza el test.
  const getRepregunta = () => {
    repreguntaCounterRef.current += 1;
    const mode = repreguntaCounterRef.current % 4;
    if (mode === 1) return { text: '¿Quieres que hagamos una pregunta tipo test rápida sobre este apartado?', type: 'quiz' };
    if (mode === 2) return { text: '¿Quieres practicar con una pregunta de examen sobre este concepto?', type: 'quiz' };
    if (mode === 3) return { text: '¿Quieres que hagamos un test sobre este punto para afianzarlo?', type: 'quiz' };
    return { text: '¿Quieres profundizar en algún otro concepto del temario o hacer un test?', type: 'quiz' };
  };

  // ── MOTOR PRINCIPAL (Notebook Grounded) ─────────────────────────────────
  const generateAnswer = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // REGLA 5: Fuera de ámbito
    const nonOposKeywords = ['clima', 'tiempo hoy', 'receta', 'futbol', 'pelicula', 'musica', 'juego', 'presidente', 'capital de', 'cocinar', 'restaurante'];
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
        const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
        const correctText = activeQ.options[correctIdx]?.replace(/^[A-D]\)\s*/, '') || '';
        lastProposalRef.current = null;
        if (userChoice === correctLetter) {
          return `¡Correcto! 🎉 La opción **${correctLetter}) ${correctText}** es la respuesta correcta.\n\n💡 **Explicación:** ${activeQ.explanation}\n\n📋 Fuente: Tema ${targetTopId} — Banco de preguntas de examen\n\n¿Quieres otra pregunta o prefieres consultar un concepto teórico?`;
        } else {
          return `Incorrecto. La respuesta correcta era la **opción ${correctLetter}) ${correctText}**.\n\n💡 **Explicación:** ${activeQ.explanation}\n\n📋 Fuente: Tema ${targetTopId} — Banco de preguntas de examen\n\n¿Quieres que probemos otra pregunta para afianzar el concepto?`;
        }
      }
    }

    // Respuestas afirmativas o solicitud explícita de test («sí», «vale», «hacer un test», «test»…)
    const affirmativeWords = ['si', 'sí', 'vale', 'acepto', 'venga', 'de acuerdo', 'ok', 'dale', 'claro', 'adelante', 'perfecto'];
    const isAffirmative = affirmativeWords.some(w => q === w || q === `¡${w}!` || q === `${w}.`);
    const isTestRequest = /(hacer|haz|hazme|pon|ponme|hacemos|quiero|dame|otro|otra)\s+(un\s+)?(test|pregunta|quiz|examen)/i.test(q) || q === 'test' || q === 'un test' || q === 'hacer un test' || q === 'hacer test' || q === 'hacer examen';

    if (isAffirmative || isTestRequest) {
      const targetTopId = lastProposalRef.current?.targetTopicId || activeTopicId.toString();
      const keywords = lastProposalRef.current?.keywords || [];
      const topicQuizzes = (quizzesData[targetTopId] || quizzesData['18'] || quizzesData['1'] || []).filter(item => item?.question);
      let bestQ = null, highestScore = -1;
      topicQuizzes.forEach(item => {
        const fullTextNorm = stripAccents(item.question + ' ' + (item.explanation || '') + ' ' + (item.options?.join(' ') || ''));
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
        const optionsList = selectedQ.options.map((opt, idx) => `${['A', 'B', 'C', 'D'][idx]}) ${opt.replace(/^[A-D]\)\s*/, '')}`).join('\n');
        return `• **[Tema ${targetTopId}] Pregunta de Examen:**\n${selectedQ.question}\n\n${optionsList}\n\n¿Sabrías cuál es la opción correcta?`;
      }
    }

    // Respuestas negativas — «no», «no lo sé», «ni idea»…
    const negativeWords = ['no', 'no lo se', 'no lo sé', 'no se', 'ni idea', 'dimelo tu', 'dímelo tú', 'dímelo', 'dimelo'];
    const isNegative = negativeWords.some(w => q === w || q.includes('no lo se') || q.includes('no lo sé'));
    if (isNegative && lastProposalRef.current?.type === 'quiz_question_active') {
      const activeQ = lastProposalRef.current.qItem;
      const correctIdx = activeQ.correctAnswer !== undefined ? activeQ.correctAnswer : 0;
      const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
      const correctText = activeQ.options[correctIdx]?.replace(/^[A-D]\)\s*/, '') || '';
      const savedTopId = lastProposalRef.current.targetTopicId;
      lastProposalRef.current = null;
      return `La respuesta correcta es la **opción ${correctLetter}) ${correctText}**.\n\n💡 **Explicación:** ${activeQ.explanation}\n\n📋 Fuente: Tema ${savedTopId} — Banco de preguntas\n\n¿Quieres otra pregunta o prefieres consultar la teoría?`;
    }

    // ── Palabras clave para búsqueda en las 3 fuentes ───────────────────────
    const qClean = q.replace(/[¿?¡!]/g, '').trim();
    const qNorm = stripAccents(qClean);
    const words = qNorm.split(/[\s,.\-;:?¿!¡()'\"«»]/).map(w => w.trim()).filter(w => w.length >= 2 && !stopWords.has(w));

    if (words.length === 0) return 'Por favor, haz una pregunta más específica (p.ej.: "préstamo", "FAMA", "Convenio", "SEPRUS").';

    // Motor A0: Respuestas Entrenadas Directas por el Administrador (Firestore / Local)
    let trainedMatch = null;
    let maxMatchWords = 0;
    for (const answer of trainedAnswers) {
      const trainedQueryNorm = stripAccents(answer.queryText.toLowerCase().replace(/[¿?¡!]/g, '').trim());

      // Match exacto
      if (qNorm === trainedQueryNorm) {
        trainedMatch = answer;
        break;
      }

      // Match por superposición de palabras clave
      const trainedWords = trainedQueryNorm.split(/[\s,.\-;:?¿!¡()'\"«»]/).map(w => w.trim()).filter(w => w.length >= 2 && !stopWords.has(w));
      if (trainedWords.length > 0) {
        const matchesAll = trainedWords.every(tw => words.includes(tw));
        if (matchesAll && trainedWords.length > maxMatchWords) {
          maxMatchWords = trainedWords.length;
          trainedMatch = answer;
        }
      }
    }

    if (trainedMatch) {
      return formatBotResponse(trainedMatch.answerText, "Respuesta entrenada por el Administrador");
    }

    // Expandir palabras clave con sinónimos
    const expandedWords = expandKeywords(words);

    // Tabla parentesco (caso especial)
    if ((q.includes('tabla') || q.includes('cuadro')) && (q.includes('parentesco') || q.includes('consanguinidad') || q.includes('afinidad'))) {
      lastProposalRef.current = { type: 'quiz_offer', targetTopicId: '18', keywords: ['parentesco'] };
      return `**TABLA DE GRADOS DE PARENTESCO (IV CONVENIO COLECTIVO US):**\n\n| Grado | Consanguinidad (Sangre/Adopción) | Afinidad (Matrimonio/Pareja de Hecho) |\n| :--- | :--- | :--- |\n| **1er Grado** | Padres e Hijos | Cónyuge, Suegros, Yernos, Nueras |\n| **2º Grado** | Hermanos, Abuelos, Nietos | Cuñados, Abuelos del cónyuge |\n| **3er Grado** | Tíos, Sobrinos, Bisabuelos | — |\n| **4º Grado** | Primos hermanos | — |\n\n📋 Fuente: Tema 18 — IV Convenio Colectivo, Anexo de parentesco\n\n${getRepregunta().text}`;
    }

    // Teoría solicitada explícitamente
    const isTheoryReq = /(revis|ver|explic|dame)\s+(la\s+|el\s+)?(teoria|teoría|explicacion|explicación)/i.test(q) || q === 'teoria' || q === 'teoría';
    if (isTheoryReq) {
      const topId = lastProposalRef.current?.targetTopicId || activeTopicId.toString();
      const topicObj = topicsData.find(t => t.id.toString() === topId) || activeTopic;
      const md = allMarkdowns[topId];
      let theorySummary = `**[Tema ${topId}] Resumen Teórico — ${topicObj.title}**\n\n`;
      if (md) {
        const paras = md.split('\n\n').filter(p => p.trim().length > 30 && !p.includes('app-promo-banner') && !p.includes('https://')).slice(0, 3);
        theorySummary += paras.map(p => p.replace(/^#+\s+/g, '')).join('\n\n');
      } else {
        theorySummary += `Normativa oficial del Tema ${topId}: **${topicObj.title}** (Código 4140).`;
      }
      const repreguntaTeoria = getRepregunta();
      lastProposalRef.current = { type: 'quiz_offer', targetTopicId: topId, keywords: [], repreguntaType: repreguntaTeoria.type };
      return `${theorySummary}\n\n📋 Fuente: Tema ${topId} — ${topicObj.title}\n\n${repreguntaTeoria.text}`;
    }

    // ══ BÚSQUEDA EN LAS 3 FUENTES (Siempre temario completo con palabras expandidas) ══════════════
    const glossaryResult = searchGlossary(qNorm, expandedWords);
    const markdownResult = searchMarkdown(allMarkdowns, expandedWords, activeTopic, 'all');
    const quizResult = searchQuizzes(expandedWords, activeTopic, 'all');

    const allCandidates = [
      glossaryResult && { ...glossaryResult, priority: 1 },
      markdownResult && { ...markdownResult, priority: 2 },
      quizResult && { ...quizResult, priority: 3 },
    ].filter(Boolean).sort((a, b) => b.score !== a.score ? b.score - a.score : a.priority - b.priority);

    const best = allCandidates[0];
    const repregunta = getRepregunta();

    // REGLA 0: SIN COBERTURA
    if (!best || best.score < SCORE_PARTIAL) {
      // Registrar la duda de forma asíncrona en Firebase en segundo plano
      firebaseService.saveUnresolvedDuda(userQuery).catch(err => console.warn(err));
      return `⚠️ Esta información NO CONSTA en el temario cargado de la oposición (Código 4140).\n\nNo puedo confirmar este dato sin fuente verificada.\n\n¿Quieres preguntarme sobre otro concepto del temario?`;
    }

    const coverage = best.score >= SCORE_FULL ? 'full' : 'partial';
    lastProposalRef.current = { type: 'quiz_offer', targetTopicId: best.topicId || activeTopicId.toString(), keywords: expandedWords, repreguntaType: repregunta.type };
    return formatBotResponse(best.text, best.source, coverage, repregunta.text);
  };

  const handleClearChat = () => {
    if (isSpeaking) stopSpeaking();
    lastProposalRef.current = null;
    setMessages([{ id: Date.now(), sender: 'bot', text: '¡Hola! He borrado la conversación. El Agente BUS sigue activo.\n\n¿Qué concepto del temario quieres consultar?', timestamp: new Date() }]);
  };

  const handleFeedback = async (msgId, type, queryText) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: type } : m));
    if (type === 'negative' && queryText) {
      try {
        await firebaseService.saveUnresolvedDuda(queryText);
      } catch (err) {
        console.warn("Error saving unresolved query on feedback:", err);
      }
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;
    const isClearCmd = /(borra|borrar|limpiar|vaciar|reiniciar)\s+(la\s+|el\s+)?(conversacion|conversación|chat|historial)/i.test(query.trim());
    if (isClearCmd) { setInputText(''); handleClearChat(); return; }
    const userMessage = { id: Date.now(), sender: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 1. Obtener la respuesta RAG local del motor (basada en el temario estricto)
    const localAnswer = generateAnswer(query);
    let finalAnswer = localAnswer;

    // 2. Comprobar si existe API Key de Gemini
    const apiKey = localStorage.getItem('gemini_api_key');
    
    // Filtros: No usar Gemini si es una respuesta muy estructurada (tests, tablas, respuestas entrenadas)
    const isStructuredResponse = localAnswer.includes('Pregunta de Examen:') || 
                                 localAnswer.includes('TABLA DE GRADOS DE PARENTESCO') ||
                                 localAnswer.includes('Respuesta entrenada') ||
                                 localAnswer.includes('¿Sabrías cuál es la opción correcta?');

    if (!isStructuredResponse) {
      if (!apiKey) {
        // Fallback clásico con aviso de que falta la clave
        finalAnswer = `⚠️ **Nota de Sistema:** La integración con IA está desactivada porque falta la API Key de Gemini. Debes configurarla en el Panel de Administrador.\n\n` + finalAnswer;
      } else {
        // Mostrar estado de escribiendo
        setMessages(prev => [...prev, { id: 'typing', sender: 'bot', text: 'Escribiendo...', timestamp: new Date() }]);
        
        try {
          const systemPrompt = `Eres el Agente BUS, asistente virtual de opositores de la Biblioteca de la Universidad de Sevilla.
Tu tarea es responder a la pregunta del usuario utilizando ÚNICAMENTE la información proporcionada en el siguiente contexto extraído del temario oficial (Código 4140).
- Redacta de forma natural, clara y conversacional (formato Markdown).
- Si la respuesta no está en el contexto, DEBES decir explícitamente: 'Esa información no consta en las fuentes verificadas del temario oficial'. Tienes estrictamente prohibido usar conocimiento externo.
- Incluye al final de tu respuesta la fuente en formato: "📋 Fuente: [Extraído del contexto]".

Contexto (Respuesta cruda del motor de búsqueda local):
${localAnswer}

Pregunta del usuario:
${query}`;

          const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
          let geminiText = null;
          let lastErrorMsg = '';

          for (const modelName of modelsToTry) {
            try {
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: systemPrompt }] }],
                  generationConfig: { temperature: 0.1 }
                })
              });

              if (response.ok) {
                const data = await response.json();
                geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (geminiText) break;
              } else {
                lastErrorMsg = await response.text();
                console.warn(`Gemini API error in Agente BUS (${modelName}):`, lastErrorMsg);
              }
            } catch (err) {
              lastErrorMsg = err.message;
              console.error(`Gemini request exception (${modelName}):`, err);
            }
          }

          if (geminiText) {
            finalAnswer = `✨ *(Generado por IA)*\n\n` + geminiText;
          } else {
             // Print the exact error so we can debug it
             let shortErr = 'Error desconocido';
             try { shortErr = JSON.parse(lastErrorMsg).error.message; } catch(e) { shortErr = lastErrorMsg.substring(0, 100); }
             finalAnswer = `⚠️ **Error de API Gemini:** ${shortErr}\n\nUsando respuesta clásica:\n\n` + finalAnswer;
          }
        } catch (err) {
          console.error("Gemini request exception:", err);
          finalAnswer = `⚠️ **Error de Red:** No se pudo conectar con Gemini. Usando respuesta clásica:\n\n` + finalAnswer;
        } finally {
          // Quitar estado de escribiendo
          setMessages(prev => prev.filter(m => m.id !== 'typing'));
        }
      }
    }

    const botMessage = {
      id: Date.now() + 1,
      sender: 'bot',
      text: finalAnswer,
      timestamp: new Date(),
      userQuery: query,
      feedback: null
    };
    setMessages(prev => [...prev, botMessage]);
    if (voiceEnabled) speakText(finalAnswer);
  };

  const AdminConsoleView = () => {
    const handleSaveTraining = async (doubtId, query, ans) => {
      if (!ans.trim()) return;
      try {
        await firebaseService.saveTrainedAnswer(doubtId, query, ans);
        setCustomAnswerInput('');
        setCustomQueryInput('');
        setSelectedDudaToTrain(null);
        alert('¡Respuesta entrenada con éxito!');
      } catch (err) {
        alert('Error al guardar: ' + err.message);
      }
    };

    const handleDeleteTrained = async (id) => {
      if (confirm('¿Seguro que quieres borrar esta respuesta entrenada?')) {
        await firebaseService.deleteTrainedAnswer(id);
      }
    };

    const handleDeleteUnresolved = async (id) => {
      if (confirm('¿Seguro que quieres descartar esta duda sin resolver?')) {
        await firebaseService.deleteUnresolvedDuda(id);
      }
    };

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#fff' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary-light)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', fontWeight: 'bold' }}>
          Consola de Entrenamiento del Agente BUS
        </h3>

        {/* Entrenar Respuesta Manual / Personalizada */}
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 'bold' }}>
            {selectedDudaToTrain ? 'Responder Duda del Alumno' : 'Entrenar Nuevo Concepto o Pregunta'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={customQueryInput}
              onChange={e => setCustomQueryInput(e.target.value)}
              placeholder="Pregunta o palabra clave del alumno..."
              disabled={!!selectedDudaToTrain}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
            />
            <textarea
              value={customAnswerInput}
              onChange={e => setCustomAnswerInput(e.target.value)}
              placeholder="Escribe aquí la respuesta oficial en formato texto/markdown..."
              rows={3}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '0.78rem', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {selectedDudaToTrain && (
                <button
                  type="button"
                  onClick={() => { setSelectedDudaToTrain(null); setCustomQueryInput(''); setCustomAnswerInput(''); }}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveTraining(selectedDudaToTrain?.id || null, customQueryInput, customAnswerInput)}
                disabled={!customQueryInput.trim() || !customAnswerInput.trim()}
                style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 'bold', opacity: (customQueryInput.trim() && customAnswerInput.trim()) ? 1 : 0.5 }}
              >
                Guardar Respuesta
              </button>
            </div>
          </div>
        </div>

        {/* Dudas sin Resolver Registradas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 'bold' }}>
            Dudas Pendientes de Alumnos ({unresolvedDudas.length})
          </h4>

          {unresolvedDudas.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}>
              🎉 ¡No hay dudas sin respuesta pendientes! Todos los temas están cubiertos.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {unresolvedDudas.map(d => (
                <div key={d.id} style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#fca5a5' }}>"{d.queryText}"</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Votos/Consultas: {d.count || 1} • {new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDudaToTrain(d);
                        setCustomQueryInput(d.queryText);
                        setCustomAnswerInput('');
                      }}
                      style={{ background: 'rgba(212,163,89,0.15)', border: '1px solid rgba(212,163,89,0.4)', color: 'var(--secondary-light)', borderRadius: '4px', padding: '4px 6px', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Enseñar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnresolved(d.id)}
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: '4px', padding: '4px 6px', fontSize: '0.68rem', cursor: 'pointer' }}
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listado de Respuestas Ya Entrenadas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <h4 style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 'bold' }}>Respuestas Entrenadas Activas ({trainedAnswers.length})</h4>
          {trainedAnswers.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px' }}>
              No hay respuestas entrenadas grabadas aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {trainedAnswers.map(t => (
                <div key={t.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, fontSize: '0.74rem', minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--secondary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pregunta: "{t.queryText}"</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Exp: {t.answerText}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrained(t.id)}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: '4px', padding: '4px 6px', fontSize: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
                  >
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const containerStyle = isMaximized ? {
    position: 'fixed', top: '16px', bottom: '16px', right: '16px', left: 'min(280px, calc(100vw - 32px))',
    zIndex: 99999, display: 'flex', flexDirection: 'column', borderRadius: '20px',
    background: 'rgba(11, 19, 43, 0.98)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
    border: '2px solid rgba(212, 163, 89, 0.5)', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(212,163,89,0.25)',
    overflow: 'hidden', fontFamily: "'Inter', sans-serif", transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
  } : {
    position: 'fixed', bottom: '24px', right: '24px', width: '480px', maxWidth: 'calc(100vw - 32px)',
    height: '620px', maxHeight: 'calc(100vh - 48px)', zIndex: 99999, display: 'flex', flexDirection: 'column',
    borderRadius: '20px', background: 'rgba(11, 19, 43, 0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '2px solid rgba(212, 163, 89, 0.4)', boxShadow: '0 15px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212,163,89,0.2)',
    overflow: 'hidden', fontFamily: "'Inter', sans-serif", transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
  };

  return (
    <div className="siri-assistant-overlay fade-in" style={containerStyle}>
      {/* Header */}
      <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(212,163,89,0.15) 0%, rgba(59,130,246,0.15) 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(212,163,89,0.5)' }}>
            <Sparkles size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Agente BUS</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
              {markdownsLoaded ? '✅ Corpus cargado — Respuestas verificadas del temario' : '⏳ Cargando corpus del temario…'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setShowAdminConsole(!showAdminConsole)}
              style={{
                background: showAdminConsole ? 'var(--secondary)' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                padding: '5px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                boxShadow: showAdminConsole ? '0 0 10px rgba(212,163,89,0.3)' : 'none'
              }}
            >
              <Sparkles size={14} />
              <span>{showAdminConsole ? 'Ver Chat' : 'Entrenar Bot'}</span>
            </button>
          )}

          <button type="button" onClick={handleClearChat} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', cursor: 'pointer', padding: '5px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} title="Borrar conversación">
            <Trash2 size={15} /><span style={{ fontSize: '0.7rem' }}>Borrar</span>
          </button>
          <button type="button" onClick={() => setIsMaximized(!isMaximized)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer', padding: '5px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }} title={isMaximized ? 'Reducir' : 'Ampliar'}>
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span style={{ fontSize: '0.7rem' }}>{isMaximized ? 'Reducir' : 'Ampliar'}</span>
          </button>
          <button type="button" onClick={() => { if (isSpeaking) stopSpeaking(); setVoiceEnabled(!voiceEnabled); }} style={{ background: 'transparent', border: 'none', color: voiceEnabled ? 'var(--secondary-light)' : '#64748b', cursor: 'pointer', padding: '4px' }} title={voiceEnabled ? 'Voz activada' : 'Voz desactivada'}>
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button type="button" onClick={() => { stopSpeaking(); onClose(); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Cerrar">
            <X size={16} />
          </button>
        </div>
      </div>

      {showAdminConsole ? (
        <AdminConsoleView />
      ) : (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', alignSelf: isBot ? 'flex-start' : 'flex-end', maxWidth: '90%' }}>
                  {isBot && (<div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,163,89,0.2)', border: '1px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}><Bot size={16} style={{ color: 'var(--secondary-light)' }} /></div>)}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isBot ? 'flex-start' : 'flex-end' }}>
                    <div style={{ background: isBot ? 'rgba(30,41,59,0.9)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', padding: '10px 14px', borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px', border: isBot ? '1px solid rgba(255,255,255,0.12)' : 'none', fontSize: '0.84rem', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </div>
                    {/* Thumbs Feedback icons for bot responses (except introduction bubble) */}
                    {isBot && msg.id !== 1 && (
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '4px', marginTop: '2px' }}>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'positive', msg.userQuery)}
                          style={{ background: 'transparent', border: 'none', color: msg.feedback === 'positive' ? '#4ade80' : 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem' }}
                          title="Respuesta útil"
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'negative', msg.userQuery)}
                          style={{ background: 'transparent', border: 'none', color: msg.feedback === 'negative' ? '#f87171' : 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem' }}
                          title="Respuesta incorrecta o incompleta"
                        >
                          👎
                        </button>
                      </div>
                    )}
                  </div>

                  {!isBot && (<div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.3)', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}><User size={16} style={{ color: '#fff' }} /></div>)}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.95)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" onClick={toggleListening} style={{ background: isListening ? '#ef4444' : 'rgba(255,255,255,0.08)', border: isListening ? '1px solid #dc2626' : '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease', boxShadow: isListening ? '0 0 12px rgba(239,68,68,0.6)' : 'none' }} title={isListening ? 'Escuchando...' : 'Hablar por micrófono'}>
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isListening ? 'Escuchando tu voz...' : 'Consulta el temario de la oposición...'} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '8px 14px', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
            <button type="button" onClick={() => handleSendMessage()} disabled={!inputText.trim()} style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #d97706 100%)', border: 'none', color: '#fff', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', opacity: inputText.trim() ? 1 : 0.5, flexShrink: 0 }} title="Enviar">
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
