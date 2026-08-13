/**
 * Motor de Generación de Preguntas Inéditas para Tests HTML
 * Biblioteca de la Universidad de Sevilla (BUS) - Auxiliares de Biblioteca
 *
 * PRINCIPIOS DE GENERACIÓN:
 * - Las preguntas generadas son INDEPENDIENTES del banco (quizzes.json). No se comparan con él.
 * - Cada pregunta tiene exactamente 1 opción correcta y 3 opciones falsas TEMÁTICAMENTE COHERENTES.
 * - Los enunciados son frases normativas directas, limpias y profesionales.
 * - Sin sufijos técnicos, sin epígrafes, sin coletillas de desarrollo interno.
 * - Los distractores provienen de la misma sección temática de la pregunta, nunca de dominios ajenos.
 */

import quizzesData from '../data/quizzes.json';

const stripAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

// ── UTILIDADES DE TEXTO ─────────────────────────────────────────────────────

export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/[^\s)]+/gi, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>+\s*/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`#]/g, '')
    .replace(/\s*\((epígrafe|apartado|cuestión|tema)\s*\d+\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMarketingOrHTML(line) {
  if (!line) return true;
  const lower = line.toLowerCase();
  return (
    lower.includes('<p') || lower.includes('<div') || lower.includes('<ul') ||
    lower.includes('<li') || lower.includes('<a') || lower.includes('class=') ||
    lower.includes('style=') || lower.includes('href=') ||
    lower.includes('app-promo-banner') || lower.includes('estudia y optimiza') ||
    lower.includes('modo test') || lower.includes('flashcards') ||
    lower.includes('pon a prueba') || lower.includes('no te quedes solo') ||
    lower.includes('accede a oposiciones-bus-app') || lower.startsWith('http') ||
    lower.includes('complementa tu estudio') || lower.includes('oposiciones-bus-app.vercel.app')
  );
}

export function cleanHeadingTitle(title) {
  if (!title) return '';
  const clean = sanitizeText(title);
  return clean
    .replace(/[📌📱💡🎴📝⚡⚠️📋🟢🟡🔴•*]/g, '')
    .replace(/^([A-Z0-9][.)-]\s*)+/i, '')
    .replace(/\(Artículo\s+\d+\)/i, '')
    .replace(/^(COMPENDIO|GUÍA|RESUMEN|APARTADO|SECCIÓN)\s*/i, '')
    .replace(/\(SÚPER PREGUNTADOS.*\)/i, '')
    .replace(/\(MÁXIMA IMPORTANCIA.*\)/i, '')
    .trim();
}

function safeTruncateText(text, maxLen = 200) {
  if (!text) return '';
  let clean = sanitizeText(text).trim();
  if (clean.length <= maxLen) return clean;
  const periodIndex = clean.substring(0, maxLen).lastIndexOf('.');
  if (periodIndex > 30) return clean.substring(0, periodIndex + 1);
  let sub = clean.substring(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 20) sub = sub.substring(0, lastSpace);
  return sub.replace(/[,;:\-\s]+$/, '').trim() + '.';
}

/**
 * Limpia prefijos de artículo de un párrafo antes de usarlo como opción correcta.
 * Ejemplos que se limpian:
 *   "Según el Artículo 1 de su Reglamento, la BUS es: un centro..."  → "Un centro..."
 *   "Conforme al art. 5: El servicio..."                             → "El servicio..."
 *   "De acuerdo con el Artículo 3:"                                  → (texto siguiente)
 */
function stripArticlePrefix(text) {
  if (!text) return text;
  return text
    .replace(/^[Ss]egún\s+(lo\s+dispuesto\s+en\s+)?el\s+[Aa]rt[íi]culo\s+\d+\s+[^,]+,\s*/i, '')
    .replace(/^[Cc]onforme\s+a(?:l)?\s+(?:el\s+)?[Aa]rt\.?\s*\d+\s*:?\s*/i, '')
    .replace(/^[Dd]e\s+acuerdo\s+con\s+el\s+[Aa]rt[íi]culo\s+\d+\s*:?\s*/i, '')
    .replace(/^[Ee]n\s+el\s+[Aa]rt[íi]culo\s+\d+\s+se\s+establece\s+que\s*/i, '')
    .replace(/^[Ee]l\s+[Aa]rt[íi]culo\s+\d+\s+(?:de\s+\w+\s+)?\w+\s+(?:establece|dispone|señala|indica)\s+que\s*/i, '')
    .trim();
}

// ── PARSEO DE MARKDOWN ──────────────────────────────────────────────────────

// Secciones que no generan preguntas de examen válidas
const NON_EXAM_SECTIONS = /esquema|repaso|conceptos clave|resumen|glosario|introducción|índice/i;

export function parseSectionsFromMarkdown(markdownText) {
  if (!markdownText) return [];
  const lines = markdownText.split('\n');
  const sections = [];
  let currentTitle = '';
  let currentParas = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (isMarketingOrHTML(trimmed)) return;
    if (/^\|.*\|$/.test(trimmed)) return; // Ignorar tablas

    if (/^#{1,3}\s+/.test(trimmed)) {
      const titleText = cleanHeadingTitle(trimmed.replace(/^#+\s*/, ''));
      if (titleText.length > 2) {
        if (currentParas.length > 0 && currentTitle) {
          sections.push({ title: currentTitle, paragraphs: currentParas });
        }
        const lowerTitle = titleText.toLowerCase();
        if (
          lowerTitle.includes('bibliografía') || lowerTitle.includes('bibliografia') ||
          lowerTitle.includes('anexo') || lowerTitle === 'notas'
        ) {
          currentTitle = '';
        } else {
          currentTitle = titleText;
        }
        currentParas = [];
      }
    } else {
      const cleanPara = sanitizeText(trimmed.replace(/^[•*\-\d.]+\s*/, ''));
      if (cleanPara.length > 20 && !isMarketingOrHTML(cleanPara)) {
        currentParas.push(cleanPara);
      }
    }
  });

  if (currentParas.length > 0 && currentTitle) {
    sections.push({ title: currentTitle, paragraphs: currentParas });
  }

  return sections;
}

export function extractTopicHeadings(markdownText) {
  return parseSectionsFromMarkdown(markdownText).map(s => s.title);
}

/**
 * Genera el HTML del resumen.
 * Si se pasan selectedSections, filtra solo esas secciones y añade encabezado informativo.
 * Si selectedSections es 'all' o vacío, genera el resumen completo del tema.
 */
export function extractTopicSummary(markdownText, selectedSections = 'all') {
  const allSections = parseSectionsFromMarkdown(markdownText);
  if (!allSections || allSections.length === 0) return '';

  const isFiltered = selectedSections !== 'all' &&
    Array.isArray(selectedSections) &&
    selectedSections.length > 0;

  // Determinar secciones a incluir en el resumen
  let sectionsToSummarize = allSections;
  if (isFiltered) {
    sectionsToSummarize = allSections.filter(sec => {
      const secNorm = stripAccents(sec.title);
      return selectedSections.some(sel => {
        const selNorm = stripAccents(sel);
        return secNorm.includes(selNorm) || selNorm.includes(secNorm);
      });
    });
    // Si el filtro no encuentra nada exacto, usar todo
    if (sectionsToSummarize.length === 0) sectionsToSummarize = allSections;
  }

  // Construir bloques HTML por sección
  const summaryBlocks = [];
  sectionsToSummarize.forEach(sec => {
    if (!sec.paragraphs || sec.paragraphs.length === 0) return;
    const joinedParagraphs = [];
    let buffer = '';
    sec.paragraphs.forEach(p => {
      const cleanP = p.trim();
      if (!cleanP) return;
      if (buffer) {
        buffer += ' ' + cleanP;
        if (!cleanP.endsWith(':') && !cleanP.endsWith(';')) {
          joinedParagraphs.push(buffer);
          buffer = '';
        }
      } else if (cleanP.endsWith(':') || cleanP.endsWith(';')) {
        buffer = cleanP;
      } else {
        joinedParagraphs.push(cleanP);
      }
    });
    if (buffer) joinedParagraphs.push(buffer);

    if (joinedParagraphs.length > 0) {
      const fullText = joinedParagraphs.slice(0, 3).join(' ');
      summaryBlocks.push(`
        <div style="margin-bottom: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px;">
          <strong style="color: #065f46; font-size: 1.05rem; display: block; margin-bottom: 4px;">📌 ${sec.title}</strong>
          <div style="color: #334155; line-height: 1.6; font-size: 0.95rem;">${fullText}</div>
        </div>
      `);
    }
  });

  // Encabezado informativo cuando hay selección parcial
  let headerHtml = '';
  if (isFiltered && sectionsToSummarize.length > 0) {
    const bullets = sectionsToSummarize
      .map(s => `<li style="margin-bottom:2px;">· ${s.title}</li>`)
      .join('');
    headerHtml = `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
        <strong style="color:#1e40af;font-size:0.95rem;display:block;margin-bottom:6px;">
          📋 Resumen de los puntos seleccionados para este test:
        </strong>
        <ul style="margin:0;padding:0;list-style:none;color:#1e3a8a;font-size:0.88rem;">${bullets}</ul>
      </div>
    `;
  }

  return headerHtml + summaryBlocks.join('');
}

// ── UTILIDADES DE DUPLICADOS (SÓLO PARA INDICADOR VISUAL) ───────────────────

export function calculateSimilarity(text1, text2) {
  const norm1 = stripAccents(text1).replace(/[^a-z0-9\s]/g, '');
  const norm2 = stripAccents(text2).replace(/[^a-z0-9\s]/g, '');
  if (norm1 === norm2) return 1.0;
  const words1 = new Set(norm1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(norm2.split(/\s+/).filter(w => w.length > 3));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  words1.forEach(w => { if (words2.has(w)) intersection++; });
  return intersection / new Set([...words1, ...words2]).size;
}

export function checkDuplicated(proposedQuestionText, topicId) {
  const existingList = quizzesData[topicId] || [];
  let maxSim = 0;
  let matchQuestion = null;
  const cleanStem = (q) => (q || '')
    .replace(/^Según lo (dispuesto|establecido) en [^,]+,\s*/i, '')
    .replace(/^En [^,]+,\s*¿cuál/i, '¿cuál');
  const coreProp = cleanStem(proposedQuestionText);
  for (const item of existingList) {
    if (!item || !item.question) continue;
    const sim = calculateSimilarity(coreProp, cleanStem(item.question));
    if (sim > maxSim) { maxSim = sim; matchQuestion = item.question; }
  }
  return {
    isDuplicated: maxSim >= 0.85,
    similarityPercentage: Math.round(maxSim * 100),
    matchingExistingQuestion: matchQuestion
  };
}

// ── ID ÚNICO ────────────────────────────────────────────────────────────────

export function generateQuestionId(topicId) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `q_t${topicId}_${timestamp}_${randomStr}`;
}

// ── DENOMINACIÓN OFICIAL DE NORMA POR TEMA ──────────────────────────────────

function getOfficialNormName(topicId, topicTitle, heading = '', factText = '') {
  const topNum = parseInt(topicId, 10);
  const combined = (heading + ' ' + factText).toLowerCase();
  switch (topNum) {
    case 1:
      if (/préstamo/i.test(combined)) return 'las Normas de Préstamo de la BUS';
      if (/estatutos/i.test(combined)) return 'los Estatutos de la US';
      return 'el Reglamento de la BUS';
    case 2:
      if (/efqm/i.test(combined)) return 'el Modelo EFQM de Excelencia';
      if (/carta/i.test(combined)) return 'la Carta de Servicios de la BUS';
      return 'el Sistema de Calidad de la BUS';
    case 3: return 'las normas sobre instalaciones y espacios de la BUS';
    case 4:
      if (/sirio|sso|acceso remoto/i.test(combined)) return 'el sistema de acceso remoto a la colección de la BUS';
      return 'la regulación de la colección digital de la BUS';
    case 5: return 'las directrices de gestión de la colección y expurgo de la BUS';
    case 6: return 'la Clasificación Decimal Universal (CDU)';
    case 7:
      if (/alma/i.test(combined)) return 'la plataforma de servicios Alma de la US';
      return 'el catálogo FAMA de la Universidad de Sevilla';
    case 8: return 'las tecnologías RFID y autopréstamo de la BUS';
    case 9:
      if (/objetoteca/i.test(combined)) return 'el Reglamento de la Objetoteca de la BUS';
      return 'el Servicio de Préstamo de la BUS';
    case 10: return 'el Servicio de Información y Referencia de la BUS';
    case 11: return 'las acciones de Apoyo al Aprendizaje (ALFIN/CODI)';
    case 12:
      if (/idus/i.test(combined)) return 'el repositorio institucional idUS';
      return 'los servicios de Apoyo a la Investigación de la BUS';
    case 13:
      if (/excel/i.test(combined)) return 'Microsoft Excel';
      if (/word/i.test(combined)) return 'Microsoft Word';
      if (/teams/i.test(combined)) return 'Microsoft Teams';
      if (/outlook|owa/i.test(combined)) return 'Microsoft Outlook';
      return 'Microsoft 365';
    case 14: return 'el Plan de Prevención de Riesgos Laborales de la US';
    case 15: return 'la prevención de riesgos ergonómicos del puesto de Auxiliar';
    case 16:
      if (/rd 488|pantalla|pvd/i.test(combined)) return 'el Real Decreto 488/1997 sobre Pantallas de Visualización';
      if (/rd 486|lugar.*trabajo/i.test(combined)) return 'el Real Decreto 486/1997 de Lugares de Trabajo';
      if (/rd 773|epi/i.test(combined)) return 'el Real Decreto 773/1997 de Equipos de Protección Individual';
      if (/rd 485|señalización/i.test(combined)) return 'el Real Decreto 485/1997 de Señalización de Seguridad';
      return 'la Ley 31/1995 de Prevención de Riesgos Laborales';
    case 17:
      if (/losu|ley 2\/2023/i.test(combined)) return 'la Ley Orgánica 2/2023 del Sistema Universitario (LOSU)';
      return 'los Estatutos de la Universidad de Sevilla';
    case 18: return 'el IV Convenio Colectivo del Personal Laboral de la US';
    case 19: return 'la Ley Orgánica 3/2007 para la Igualdad Efectiva';
    case 20:
      if (/convenio|disciplinario/i.test(combined)) return 'el Régimen Disciplinario del IV Convenio Colectivo';
      return 'la normativa contra el acoso y la violencia de la US';
    default: {
      const clean = sanitizeText(topicTitle).replace(/^Tema\s+\d+:\s*/i, '');
      return clean ? `la regulación sobre ${clean}` : 'la normativa aplicable';
    }
  }
}

// ── GENERADOR DE ENUNCIADOS ─────────────────────────────────────────────────

const STEM_TEMPLATES = [
  (norm, focus) => `Según lo dispuesto en ${norm}, en relación con ${focus}, señale la afirmación correcta:`,
  (norm, focus) => `De acuerdo con ${norm}, ¿cuál de las siguientes opciones describe correctamente ${focus}?`,
  (norm, focus) => `En relación con ${focus}, conforme a ${norm}, señale la opción verdadera:`,
  (norm, focus) => `Conforme a la regulación establecida en ${norm} respecto a ${focus}, indique la respuesta correcta:`,
  (norm, focus) => `¿Cuál de las siguientes afirmaciones sobre ${focus} es correcta según ${norm}?`,
];

function buildStem(normName, focus, idx) {
  const cleanFocus = safeTruncateText(focus, 70).replace(/[.:;,]+$/, '');
  return STEM_TEMPLATES[idx % STEM_TEMPLATES.length](normName, cleanFocus);
}

// ── GENERADOR DE DISTRACTORES TEMÁTICAMENTE COHERENTES ──────────────────────
/**
 * Estrategia de distractores (por prioridad):
 * 1ª. Otros párrafos de la MISMA sección (coherencia temática garantizada)
 * 2ª. Inversiones semánticas de la opción correcta (falso pero plausible)
 * 3ª. Párrafos de OTRAS secciones del mismo tema (coherencia de dominio)
 * 4ª. Pool de respaldo solo si supera filtro de coherencia temática
 *
 * NUNCA se usará un distractor de dominio ajeno (PTGAS, Ministerio, etc.)
 * si la pregunta es sobre redes de cooperación, préstamo u otra materia diferente.
 */

// Inversiones semánticas universales (concepto → versión falsa plausible)
const CONCEPT_INVERSIONS = [
  [/única e integrada|unidad funcional/gi, 'federación de bibliotecas de centro independientes entre sí'],
  [/única e integrada|unidad funcional/gi, 'unidad descentralizada de gestión autónoma por campus'],
  [/Vicerrectorado de Investigación/gi, 'Decanato de la Facultad donde se ubica la biblioteca de centro'],
  [/Vicerrectorado\b/gi, 'Consejo Social de la Universidad de Sevilla'],
  [/Consejo de Gobierno/gi, 'Junta de Gobierno de cada centro académico implicado'],
  [/REBIUN/gi, 'CBUA (Consorcio de Bibliotecas Universitarias de Andalucía)'],
  [/\bCBUA\b/gi, 'REBIUN (Red de Bibliotecas Universitarias Españolas)'],
  [/DIALNET/gi, 'WorldCat (catálogo colectivo de la OCLC)'],
  [/Universidad de La Rioja/gi, 'Universidad Complutense de Madrid'],
  [/Plan Director/gi, 'Carta de Servicios aprobada por el Ministerio de Universidades'],
  [/Reglamento de la BUS/gi, 'Decreto de la Junta de Andalucía sobre bibliotecas públicas'],
  [/carnet universitario|tarjeta universitaria/gi, 'carnet de préstamo específico emitido por la biblioteca'],
  [/gratuito|gratuita/gi, 'sujeto al pago de una tasa o precio público aprobado'],
  [/obligatorio|obligatoria|preceptivo/gi, 'facultativo y de carácter meramente orientativo'],
  [/antes del cierre del mismo día/gi, 'en un plazo máximo de 48 horas desde el préstamo'],
  [/diario|mismo día/gi, 'en un plazo máximo de tres días hábiles'],
  [/ámbito andaluz|Andalucía/gi, 'todo el territorio nacional español'],
  [/ámbito nacional|España/gi, 'el ámbito exclusivo de la comunidad autónoma de Andalucía'],
  [/fondo antiguo|manuscrito/gi, 'fondos de libre acceso en depósito abierto'],
  [/préstamo a domicilio/gi, 'consulta en sala sin posibilidad de préstamo externo'],
];

function generateDistractors(correctOpt, sectionParas, allOtherParas, idx) {
  const used = new Set([correctOpt.toLowerCase()]);
  const distractors = [];

  // ── Estrategia 1: Párrafos hermanos de la misma sección (máxima coherencia) ──
  const siblingCandidates = [...sectionParas]
    .sort(() => 0.5 - Math.random()) // Rotar para variedad
    .filter(p => p && p.length > 20);

  for (const para of siblingCandidates) {
    if (distractors.length >= 3) break;
    // Usar la primera frase del párrafo hermano como distractor
    const rawSentence = stripArticlePrefix(sanitizeText(para.split('.')[0]).trim());
    if (rawSentence.length < 20) continue;
    const cand = safeTruncateText(rawSentence, 160);
    if (!used.has(cand.toLowerCase()) && cand.toLowerCase() !== correctOpt.toLowerCase()) {
      distractors.push(cand);
      used.add(cand.toLowerCase());
    }
  }

  // ── Estrategia 2: Inversiones semánticas de la opción correcta ──
  for (const [pattern, replacement] of CONCEPT_INVERSIONS) {
    if (distractors.length >= 3) break;
    if (pattern.test(correctOpt)) {
      // Solo sustituir la primera ocurrencia para evitar duplicaciones
      let replaced = false;
      const cand = safeTruncateText(
        correctOpt.replace(pattern, (match) => {
          if (!replaced) { replaced = true; return replacement; }
          return match;
        }),
        200
      );
      if (cand && !used.has(cand.toLowerCase()) && cand.toLowerCase() !== correctOpt.toLowerCase()) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
      }
    }
  }

  // ── Estrategia 3: Párrafos de otras secciones del mismo tema ──
  const otherCandidates = [...allOtherParas]
    .sort(() => 0.5 - Math.random())
    .filter(p => p && p.length > 20);

  for (const para of otherCandidates) {
    if (distractors.length >= 3) break;
    const rawSentence = stripArticlePrefix(sanitizeText(para.split('.')[0]).trim());
    if (rawSentence.length < 20) continue;
    const cand = safeTruncateText(rawSentence, 160);
    if (!used.has(cand.toLowerCase()) && cand.toLowerCase() !== correctOpt.toLowerCase()) {
      distractors.push(cand);
      used.add(cand.toLowerCase());
    }
  }

  // ── Estrategia 4: Alteración de cifras (plazos, números — no años) ──
  if (distractors.length < 3) {
    const numMatch = correctOpt.match(/\b(\d{1,3})\b/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      const hasHabil = /hábiles/i.test(correctOpt);
      const hasNatural = /naturales/i.test(correctOpt);
      for (const v of [n * 2, Math.max(1, Math.floor(n / 2)), n + 5]) {
        if (distractors.length >= 3 || v === n) continue;
        let cand = correctOpt.replace(/\b\d{1,3}\b/, v.toString());
        if (hasHabil) cand = cand.replace(/hábiles/i, 'naturales');
        else if (hasNatural) cand = cand.replace(/naturales/i, 'hábiles');
        if (!used.has(cand.toLowerCase())) {
          distractors.push(cand);
          used.add(cand.toLowerCase());
        }
      }
    }
  }

  // ── Garantía absoluta: modificadores lingüísticos sobre el propio texto ──
  // Solo se activa si las 3 estrategias anteriores no produjeron suficientes.
  if (distractors.length < 3) {
    const SAFE_MODIFIERS = [
      (t) => t.replace(/\b(es|son|constituye|se define como)\b/i, 'no $1'),
      (t) => t.replace(/\b(obligatorio|obligatoria|vinculante)\b/i, 'facultativo y orientativo'),
      (t) => t.replace(/\b(todos|toda|cada)\b/i, 'exclusivamente los de carácter especial'),
      (t) => `A diferencia de lo anterior, ${t.charAt(0).toLowerCase()}${t.slice(1)}`,
    ];
    for (const mod of SAFE_MODIFIERS) {
      if (distractors.length >= 3) break;
      try {
        const cand = safeTruncateText(mod(correctOpt), 200);
        if (cand && !used.has(cand.toLowerCase()) && cand !== correctOpt) {
          distractors.push(cand);
          used.add(cand.toLowerCase());
        }
      } catch (_) { /* ignorar */ }
    }
  }

  return distractors.slice(0, 3);
}

// ── CREACIÓN DE PREGUNTA ESTRUCTURADA ───────────────────────────────────────

function createStructuredQuestion(qText, correctOpt, distractors, factText, heading, topicId) {
  const allOptions = [correctOpt, ...distractors];
  const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
  const newCorrectIndex = shuffled.indexOf(correctOpt);

  const formattedOptions = shuffled.map((optText, i) => {
    const letter = ['A', 'B', 'C', 'D'][i];
    return `${letter}) ${sanitizeText(optText.replace(/^[A-D]\)\s*/, ''))}`;
  });

  const explanationFact = sanitizeText(factText).substring(0, 300);

  return {
    id: generateQuestionId(topicId),
    question: sanitizeText(qText),
    options: formattedOptions,
    correctAnswer: newCorrectIndex,
    explanation: `Fundamento normativo (${cleanHeadingTitle(heading)}): "${explanationFact}"`,
    topicId: topicId.toString(),
    isGenerated: true,
    createdAt: new Date().toISOString()
  };
}

// ── MOTOR PRINCIPAL ─────────────────────────────────────────────────────────

/**
 * Genera preguntas inéditas a partir del contenido del markdown del tema.
 * Las preguntas son INDEPENDIENTES del banco (quizzes.json).
 * Garantiza siempre `count` preguntas con 1 correcta + 3 falsas temáticamente coherentes.
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  try {
    const generated = [];
    const usedStems = new Set();

    // 1. Parsear markdown
    const allSections = parseSectionsFromMarkdown(markdownText);

    // 2. Seleccionar secciones objetivo
    let targetSections = allSections;
    if (selectedSections !== 'all' && Array.isArray(selectedSections) && selectedSections.length > 0) {
      const filtered = allSections.filter(sec => {
        const secNorm = stripAccents(sec.title);
        return selectedSections.some(sel => {
          const selNorm = stripAccents(sel);
          return secNorm.includes(selNorm) || selNorm.includes(secNorm);
        });
      });
      if (filtered.length > 0) targetSections = filtered;
    }

    // 3. Pool de todas las secciones (para distractores de otras secciones)
    const allOtherParas = allSections
      .filter(s => !NON_EXAM_SECTIONS.test(s.title))
      .flatMap(s => s.paragraphs || [])
      .filter(p => p && p.length > 20);

    // 4. Iterar sobre secciones objetivo, una pregunta por sección (máxima variedad)
    const examSections = targetSections.filter(s => !NON_EXAM_SECTIONS.test(s.title));
    const shuffledSections = [...examSections].sort(() => 0.5 - Math.random());

    for (let secIdx = 0; secIdx < shuffledSections.length && generated.length < count; secIdx++) {
      const sec = shuffledSections[secIdx];
      const cleanHeading = cleanHeadingTitle(sec.title);

      // Barajar párrafos dentro de la sección para variedad
      const shuffledParas = [...(sec.paragraphs || [])].sort(() => 0.5 - Math.random());

      for (let pIdx = 0; pIdx < shuffledParas.length && generated.length < count; pIdx++) {
        const rawFact = shuffledParas[pIdx];
        if (!rawFact || rawFact.length < 30) continue;

        // Limpiar prefijo de artículo ANTES de usarlo como opción
        const cleanedFact = stripArticlePrefix(rawFact);
        const firstSentence = sanitizeText(cleanedFact.split('.')[0]).trim();
        if (firstSentence.length < 20) continue;

        const correctOpt = safeTruncateText(firstSentence, 160);
        const normName = getOfficialNormName(topicId, topicTitle, cleanHeading, rawFact);
        const stem = buildStem(normName, cleanHeading, generated.length);

        // Evitar enunciados duplicados en el mismo lote
        const stemKey = stripAccents(stem).substring(0, 60);
        if (usedStems.has(stemKey)) continue;
        usedStems.add(stemKey);

        // Distractores: párrafos hermanos + inversiones + otros párrafos del tema
        const siblingParas = shuffledParas.filter((_, i) => i !== pIdx);
        const otherParas = allOtherParas.filter(p => !siblingParas.includes(p) && p !== rawFact);
        const distractors = generateDistractors(correctOpt, siblingParas, otherParas, generated.length);

        if (distractors.length < 3) continue;

        generated.push(createStructuredQuestion(stem, correctOpt, distractors, rawFact, cleanHeading, topicId));
        break; // Una pregunta por sección en la primera pasada
      }
    }

    // 5. Segunda pasada: si aún faltan preguntas, volver a iterar con más párrafos por sección
    if (generated.length < count) {
      for (let secIdx = 0; secIdx < shuffledSections.length && generated.length < count; secIdx++) {
        const sec = shuffledSections[secIdx];
        const cleanHeading = cleanHeadingTitle(sec.title);
        const shuffledParas = [...(sec.paragraphs || [])].sort(() => 0.5 - Math.random());

        for (let pIdx = 0; pIdx < shuffledParas.length && generated.length < count; pIdx++) {
          const rawFact = shuffledParas[pIdx];
          if (!rawFact || rawFact.length < 30) continue;

          const cleanedFact = stripArticlePrefix(rawFact);
          // Intentar con la segunda frase si la primera es la misma que ya se usó
          const sentences = cleanedFact.split('.').map(s => s.trim()).filter(s => s.length > 20);
          for (const sentence of sentences) {
            const correctOpt = safeTruncateText(sentence, 160);
            const normName = getOfficialNormName(topicId, topicTitle, cleanHeading, rawFact);
            const stem = buildStem(normName, cleanHeading, generated.length);
            const stemKey = stripAccents(stem).substring(0, 60);
            if (usedStems.has(stemKey)) continue;
            usedStems.add(stemKey);

            const siblingParas = shuffledParas.filter((_, i) => i !== pIdx);
            const otherParas = allOtherParas.filter(p => !siblingParas.includes(p) && p !== rawFact);
            const distractors = generateDistractors(correctOpt, siblingParas, otherParas, generated.length);
            if (distractors.length < 3) continue;

            generated.push(createStructuredQuestion(stem, correctOpt, distractors, rawFact, cleanHeading, topicId));
            break;
          }
          if (generated.length >= count) break;
        }
      }
    }

    // 6. Fallback si el markdown era insuficiente
    if (generated.length < count) {
      const fallback = createEmergencyFallbackBatch(topicId, topicTitle, count - generated.length);
      generated.push(...fallback);
    }

    return generated.slice(0, count);

  } catch (err) {
    console.error('Error en generateNewQuestionsForTopic:', err);
    return createEmergencyFallbackBatch(topicId, topicTitle, count);
  }
}

// ── FALLBACK DE EMERGENCIA ─────────────────────────────────────────────────

export function createEmergencyFallbackBatch(topicId, topicTitle, count = 5) {
  const batch = [];
  const safeTitle = topicTitle || `Tema ${topicId}`;

  const templates = [
    {
      q: `Según lo dispuesto en la normativa rectora de la Universidad de Sevilla sobre ${safeTitle}, señale la afirmación correcta:`,
      correct: `Constituye una unidad funcional de obligado cumplimiento en todo el ámbito de la Universidad de Sevilla.`,
      w1: `Posee carácter de mera recomendación facultativa no vinculante para los centros y facultades de la Universidad.`,
      w2: `Es una norma de aplicación exclusiva al personal docente con relación de empleo temporal.`,
      w3: `Requiere autorización previa del Ministerio de Educación para surtir efectos jurídicos.`,
    },
    {
      q: `En relación con el régimen de funcionamiento de ${safeTitle}, ¿cuál de las siguientes afirmaciones es correcta?`,
      correct: `Se rige por el principio de unidad funcional, asegurando directrices técnicas homogéneas en todos los campus.`,
      w1: `Funciona como una confederación de bibliotecas de centro independientes entre sí, sin coordinación técnica.`,
      w2: `Su gestión técnica y presupuestaria corresponde íntegramente a los Decanatos de cada facultad.`,
      w3: `Está exenta de someterse al Plan Director y a las auditorías anuales de calidad de la Universidad.`,
    },
    {
      q: `Respecto a los derechos y deberes regulados en la normativa de la Universidad de Sevilla sobre ${safeTitle}, señale la opción verdadera:`,
      correct: `Garantiza la igualdad de acceso a los recursos y servicios para todos los miembros de la comunidad universitaria.`,
      w1: `Restringe el uso de las instalaciones exclusivamente a los estudiantes de posgrado y doctorado matriculados.`,
      w2: `Establece el pago de tasas obligatorias por la consulta presencial de los fondos bibliográficos impresos.`,
      w3: `Exime al personal técnico de observar las normas de confidencialidad y protección de datos de carácter personal.`,
    },
    {
      q: `De acuerdo con la estructura organizativa y las competencias de los órganos de gobierno sobre ${safeTitle}, señale la respuesta correcta:`,
      correct: `La supervisión y presidencia de los órganos colegiados de biblioteca corresponden al Rector o Vicerrector en quien delegue.`,
      w1: `La presidencia de la Comisión de Biblioteca es ejercida por turno rotatorio entre los delegados de estudiantes.`,
      w2: `Las resoluciones técnicas de la Dirección de la Biblioteca pueden ser revocadas por las Juntas de Facultad.`,
      w3: `Los acuerdos en materia de servicio público no requieren publicidad ni aprobación en Consejo de Gobierno.`,
    },
    {
      q: `En el marco normativo aplicable a ${safeTitle}, señale la opción correcta:`,
      correct: `Toda modificación reglamentaria requiere aprobación previa del Consejo de Gobierno de la Universidad de Sevilla.`,
      w1: `Cualquier unidad organizativa puede modificar unilateralmente sus normas internas sin trámite institucional.`,
      w2: `Las infracciones tipificadas prescriben automáticamente transcurridos cinco años desde su comisión.`,
      w3: `El régimen disciplinario es gestionado por empresas privadas subcontratadas por la Universidad de Sevilla.`,
    },
    {
      q: `Conforme a la regulación establecida sobre ${safeTitle} en la Universidad de Sevilla, indique la respuesta correcta:`,
      correct: `Los ciudadanos sin vinculación formal con la US pueden acceder a sus recursos en los términos que apruebe el Consejo de Gobierno.`,
      w1: `El acceso a los fondos documentales de la BUS queda restringido en todo caso al personal de plantilla de la US.`,
      w2: `Los usuarios externos tienen los mismos derechos y plazos de préstamo que los miembros de la comunidad universitaria.`,
      w3: `La determinación del acceso externo corresponde a cada biblioteca de centro de forma autónoma e independiente.`,
    },
    {
      q: `¿Cuál de las siguientes afirmaciones sobre ${safeTitle} es correcta según el Reglamento de la BUS?`,
      correct: `El Reglamento de la BUS es la norma marco aprobada por el Consejo de Gobierno que regula la organización, los servicios y los derechos de los usuarios.`,
      w1: `El Reglamento de la BUS es aprobado directamente por el Ministerio de Cultura mediante Orden Ministerial.`,
      w2: `La BUS carece de Reglamento propio y se rige únicamente por los Estatutos generales de la Universidad de Sevilla.`,
      w3: `El Reglamento de la BUS es un documento interno sin valor normativo aprobado por la Dirección de la Biblioteca.`,
    },
  ];

  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length];
    batch.push(createStructuredQuestion(t.q, t.correct, [t.w1, t.w2, t.w3], t.correct, safeTitle, topicId));
  }

  return batch;
}
