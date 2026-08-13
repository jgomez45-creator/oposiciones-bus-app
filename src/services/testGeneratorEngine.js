/**
 * Motor de Generación de Preguntas Inéditas para Tests HTML
 * Biblioteca de la Universidad de Sevilla (BUS) - Auxiliares de Biblioteca
 *
 * PRINCIPIOS DE GENERACIÓN:
 * - Las preguntas generadas son INDEPENDIENTES del banco (quizzes.json). No se comparan con él.
 * - Cada pregunta tiene exactamente 1 opción correcta y 3 opciones falsas pero plausibles.
 * - Los enunciados son frases normativas directas, limpias y profesionales.
 * - Sin sufijos técnicos, sin epígrafes, sin coletillas de desarrollo interno.
 */

import quizzesData from '../data/quizzes.json';

const stripAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

// ── PARSEO DE MARKDOWN ──────────────────────────────────────────────────────

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

export function extractTopicSummary(markdownText) {
  const sections = parseSectionsFromMarkdown(markdownText);
  if (!sections || sections.length === 0) return '';

  const summaryBlocks = [];
  sections.forEach(sec => {
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

  return summaryBlocks.join('');
}

// ── UTILIDADES DE DUPLICADOS (SÓLO PARA INDICADOR VISUAL, NO PARA FILTRAR GENERACIÓN) ──

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
      if (/estatutos/i.test(combined)) return 'los Estatutos de la US';
      if (/préstamo/i.test(combined)) return 'las Normas de Préstamo de la BUS';
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

// ── GENERADOR DE DISTRACTORES GARANTIZADOS ──────────────────────────────────
// Siempre devuelve exactamente 3 distractores falsos y distintos a la opción correcta.

// Pool de distractores normativos genéricos de alta calidad por si todo lo demás falla.
const GENERIC_DISTRACTOR_POOL = [
  'Procede únicamente por resolución motivada del Vicerrectorado competente, previa audiencia de los interesados.',
  'Corresponde de forma exclusiva a los órganos colegiados de cada Facultad mediante acuerdo adoptado en Junta.',
  'Queda sujeto a autorización previa del Ministerio de Universidades y publicación en el Boletín Oficial del Estado.',
  'Es competencia delegada en exclusiva de la Comisión Permanente de Calidad de la Universidad de Sevilla.',
  'Se aplica únicamente al Personal Técnico, de Gestión y de Administración y Servicios (PTGAS) de la US.',
  'Requiere informe favorable previo de la Unidad de Igualdad y del Servicio Jurídico de la Universidad.',
  'Corresponde a los Decanatos de cada Facultad, con independencia de la dirección técnica de la BUS.',
  'Procede exclusivamente respecto de los fondos adquiridos antes de la entrada en vigor del Reglamento vigente.',
  'Queda excluido del ámbito de aplicación del Plan Director aprobado por el Consejo de Gobierno de la US.',
  'Es una disposición de carácter facultativo y orientativo que no vincula a los órganos unipersonales de gobierno.',
];

function generateDistractors(correctOpt, heading, factText, idx) {
  const used = new Set([correctOpt.toLowerCase()]);
  const distractors = [];

  // --- Estrategia 1: Alteración de cifras (excluye años de 4 dígitos: 1xxx-2xxx) ---
  const numMatch = correctOpt.match(/\b(\d{1,3})\b/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    const hasHabil = /hábiles/i.test(correctOpt);
    const hasNatural = /naturales/i.test(correctOpt);
    const variants = [n * 2, Math.max(1, Math.floor(n / 2)), n + 5].filter(v => v !== n);
    for (const v of variants) {
      if (distractors.length >= 3) break;
      let cand = correctOpt.replace(/\b\d{1,3}\b/, v.toString());
      // Si tiene hábiles/naturales, también intercambiarlos
      if (hasHabil) cand = cand.replace(/hábiles/i, 'naturales');
      else if (hasNatural) cand = cand.replace(/naturales/i, 'hábiles');
      if (!used.has(cand.toLowerCase())) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
      }
    }
  }

  // --- Estrategia 2: Inversión de conceptos clave ---
  const conceptInversions = [
    [/única e integrada|unidad funcional/gi, 'federación de bibliotecas de centro independientes entre sí'],
    [/única e integrada|unidad funcional/gi, 'unidad descentralizada de gestión por cada campus universitario'],
    [/Vicerrectorado de Investigación/gi, 'Decanato de la Facultad donde se ubica la biblioteca de centro'],
    [/Consejo de Gobierno/gi, 'Junta de Gobierno de cada centro académico implicado'],
    [/obligatorio|obligatoria|preceptivo/gi, 'facultativo y de carácter meramente orientativo'],
    [/gratuito|gratuita/gi, 'sujeto al pago de una tasa o precio público aprobado'],
    [/prioritariamente|principalmente/gi, 'de forma exclusiva y excluyente'],
    [/se prohíbe|está prohibido/gi, 'está expresamente permitido con autorización previa'],
    [/carnet universitario|tarjeta universitaria/gi, 'carnet de préstamo específico de biblioteca'],
    [/Rector|Rectorado/gi, 'Consejo Social de la Universidad de Sevilla'],
  ];

  for (const [pattern, replacement] of conceptInversions) {
    if (distractors.length >= 3) break;
    if (pattern.test(correctOpt)) {
      const cand = safeTruncateText(correctOpt.replace(pattern, replacement), 200);
      if (cand && !used.has(cand.toLowerCase()) && cand.toLowerCase() !== correctOpt.toLowerCase()) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
      }
    }
  }

  // --- Estrategia 3: Modificadores falsos sobre el propio texto ---
  if (distractors.length < 3) {
    const modifiers = [
      (t) => t.replace(/\b(es|son|se define como|constituye)\b/i, 'no $1'),
      (t) => t.replace(/\b(todos|toda|cada)\b/i, 'exclusivamente los de carácter especial'),
      (t) => t.replace(/\b(el|la|los|las)\b/i, 'ningún'),
    ];
    for (const mod of modifiers) {
      if (distractors.length >= 3) break;
      const cand = safeTruncateText(mod(correctOpt), 200);
      if (cand && !used.has(cand.toLowerCase()) && cand !== correctOpt) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
      }
    }
  }

  // --- Estrategia 4: Pool normativo genérico de alta calidad (garantía absoluta) ---
  // Se usa un offset basado en idx para rotar los distractores y evitar repetición entre preguntas
  const poolStart = (idx * 3) % GENERIC_DISTRACTOR_POOL.length;
  for (let i = 0; distractors.length < 3; i++) {
    const cand = GENERIC_DISTRACTOR_POOL[(poolStart + i) % GENERIC_DISTRACTOR_POOL.length];
    if (!used.has(cand.toLowerCase())) {
      distractors.push(cand);
      used.add(cand.toLowerCase());
    }
    if (i >= GENERIC_DISTRACTOR_POOL.length) break; // Seguridad: no bucle infinito
  }

  return distractors.slice(0, 3);
}

// ── CREACIÓN DE PREGUNTA ESTRUCTURADA ───────────────────────────────────────

function createStructuredQuestion(qText, correctOpt, distractors, factText, heading, topicId) {
  const allOptions = [correctOpt, ...distractors];
  // Barajar para que la correcta no esté siempre en posición A
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
 * Garantiza siempre `count` preguntas con 1 correcta + 3 falsas.
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  try {
    const generated = [];
    const usedStems = new Set(); // Evitar enunciados duplicados EN EL MISMO LOTE

    // 1. Parsear el markdown en secciones
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

    // 3. Construir pool de hechos normativos (párrafo + sección de procedencia)
    // Excluir secciones de repaso/esquema/conceptos que no son de nivel normativo examinable
    const NON_EXAM_SECTIONS = /esquema|repaso|conceptos clave|resumen|glosario|introducción|índice/i;
    const factPool = [];
    targetSections.forEach(sec => {
      if (NON_EXAM_SECTIONS.test(sec.title)) return; // Saltar secciones no normativas
      sec.paragraphs.forEach(para => {
        if (para && para.length > 30) {
          factPool.push({ text: para, heading: sec.title });
        }
      });
    });

    // 4. Barajar el pool para variedad
    const shuffledFacts = [...factPool].sort(() => 0.5 - Math.random());

    // 5. Generar preguntas del markdown
    for (let idx = 0; idx < shuffledFacts.length && generated.length < count; idx++) {
      const { text: factText, heading } = shuffledFacts[idx];
      const cleanHeading = cleanHeadingTitle(heading);
      const normName = getOfficialNormName(topicId, topicTitle, cleanHeading, factText);

      // Determinar opción correcta: primera oración completa del párrafo (máx 160 chars)
      const firstSentence = sanitizeText(factText.split('.')[0]).trim();
      if (firstSentence.length < 20) continue; // Demasiado corto para ser una opción válida

      const correctOpt = safeTruncateText(firstSentence, 160);

      // Enunciado: referencia al contexto de la sección, no a la opción correcta
      const stem = buildStem(normName, cleanHeading, idx);

      // Comprobar que el enunciado no está ya en el lote
      const stemKey = stripAccents(stem).substring(0, 60);
      if (usedStems.has(stemKey)) continue;
      usedStems.add(stemKey);

      // Generar 3 distractores garantizados
      const distractors = generateDistractors(correctOpt, cleanHeading, factText, idx);
      if (distractors.length < 3) continue; // Seguridad extra (en la práctica nunca ocurre)

      generated.push(createStructuredQuestion(stem, correctOpt, distractors, factText, cleanHeading, topicId));
    }

    // 6. Si el markdown era insuficiente o estaba vacío, rellenar con fallback de calidad
    if (generated.length < count) {
      const fallback = createEmergencyFallbackBatch(topicId, topicTitle, count - generated.length);
      generated.push(...fallback);
    }

    return generated.slice(0, count);

  } catch (err) {
    console.error('Error en generateNewQuestionsForTopic, usando fallback de emergencia:', err);
    return createEmergencyFallbackBatch(topicId, topicTitle, count);
  }
}

// ── FALLBACK DE EMERGENCIA ─────────────────────────────────────────────────
// Solo se activa si el markdown está vacío o es ilegible.

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
    const distractors = [t.w1, t.w2, t.w3];
    batch.push(createStructuredQuestion(t.q, t.correct, distractors, t.correct, safeTitle, topicId));
  }

  return batch;
}
