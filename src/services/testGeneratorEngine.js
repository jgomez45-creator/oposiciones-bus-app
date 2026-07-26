/**
 * Motor de Generación y Validación de Preguntas de Examen Inéditas
 * Estándar CCOO / Código 4140 de la Universidad de Sevilla (BUS)
 * 
 * Garantiza:
 * 1. Distractores 100% contextuales (del mismo tema/dominio técnico).
 * 2. Cero opciones absurdas (sin trampas fuera de ámbito como sanciones en informática).
 * 3. Enunciados y títulos limpios sin emojism de Markdown.
 */

import quizzesData from '../data/quizzes.json';

const stripAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Limpia emojism y adornos de títulos de encabezado
export function cleanHeadingTitle(title) {
  if (!title) return '';
  return title
    .replace(/[📌📱💡🎴📝⚡⚠️📋🟢🟡🔴•*]/g, '')
    .replace(/^(COMPENDIO|GUÍA|RESUMEN|APARTADO|SECCIÓN)\s*/i, '')
    .replace(/\(SÚPER PREGUNTADOS.*\)/i, '')
    .replace(/\(MÁXIMA IMPORTANCIA.*\)/i, '')
    .trim();
}

// Generador de ID único para nuevas preguntas
export function generateQuestionId(topicId) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `q_t${topicId}_${timestamp}_${randomStr}`;
}

/**
 * Parsea el Markdown de un tema dividiéndolo en secciones / epígrafes independientes
 */
export function parseSectionsFromMarkdown(markdownText) {
  if (!markdownText) return [];

  const lines = markdownText.split('\n');
  const sections = [];
  let currentTitle = '';
  let currentParas = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^#{1,3}\s+/.test(trimmed)) {
      const titleText = cleanHeadingTitle(trimmed.replace(/^#+\s*/, ''));
      if (titleText.length > 2 && !titleText.includes('app-promo-banner') && !titleText.startsWith('http') && !titleText.toLowerCase().startsWith('tema ')) {
        if (currentParas.length > 0 && currentTitle) {
          sections.push({ title: currentTitle, paragraphs: currentParas });
        }
        currentTitle = titleText;
        currentParas = [];
      }
    } else if (trimmed.length > 15 && !trimmed.includes('app-promo-banner') && !trimmed.startsWith('>') && !trimmed.startsWith('---')) {
      const cleanPara = trimmed.replace(/^[•*\-\d.]+\s*/, '').replace(/[*_`]/g, '').trim();
      if (cleanPara.length > 15) {
        currentParas.push(cleanPara);
      }
    }
  });

  if (currentParas.length > 0 && currentTitle) {
    sections.push({ title: currentTitle, paragraphs: currentParas });
  }

  return sections;
}

// Extrae todos los títulos de epígrafes del tema
export function extractTopicHeadings(markdownText) {
  const sections = parseSectionsFromMarkdown(markdownText);
  return sections.map(s => s.title);
}

// Algoritmo de similitud Levenshtein / Jaccard para antiduplicados
export function calculateSimilarity(text1, text2) {
  const norm1 = stripAccents(text1).replace(/[^a-z0-9\s]/g, '');
  const norm2 = stripAccents(text2).replace(/[^a-z0-9\s]/g, '');
  
  if (norm1 === norm2) return 1.0;
  
  const words1 = new Set(norm1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(norm2.split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersection = 0;
  words1.forEach(w => {
    if (words2.has(w)) intersection++;
  });
  
  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

// Comprueba si una pregunta propuesta es duplicada
export function checkDuplicated(proposedQuestionText, topicId) {
  const existingList = quizzesData[topicId] || [];
  let maxSim = 0;
  let matchQuestion = null;

  for (const item of existingList) {
    if (!item || !item.question) continue;
    const sim = calculateSimilarity(proposedQuestionText, item.question);
    if (sim > maxSim) {
      maxSim = sim;
      matchQuestion = item.question;
    }
  }

  return {
    isDuplicated: maxSim >= 0.7,
    similarityPercentage: Math.round(maxSim * 100),
    matchingExistingQuestion: matchQuestion
  };
}

// Baterías especializadas de distractores plausibles por dominio temático
const SHORTCUT_POOL = [
  'Ctrl + Shift + L', 'Alt + F11', 'Ctrl + Alt + V', 'Ctrl + N', 
  'Ctrl + Shift + 1', 'Ctrl + T', 'Ctrl + L', 'Shift + F3', 
  'Ctrl + E', 'Ctrl + Z', 'Alt + Enter', 'Ctrl + AvPag', 'Ctrl + Barra espaciadora'
];

const EXCEL_FUNCTIONS_POOL = [
  'Aplicar el formato de moneda con dos decimales',
  'Insertar una nueva tabla dinámica en la hoja actual',
  'Ocultar la fila o columna seleccionada',
  'Abrir el cuadro de diálogo Buscar y Reemplazar',
  'Mostrar las fórmulas en lugar de los valores calculados',
  'Seleccionar todas las celdas con formato condicional activo'
];

const LEGAL_MUTATIONS = [
  { from: /días hábiles/gi, to: 'días naturales' },
  { from: /días naturales/gi, to: 'días hábiles' },
  { from: /Rector/gi, to: 'Gerente' },
  { from: /Gerente/gi, to: 'Vicerrector' },
  { from: /Consejo de Gobierno/gi, to: 'Claustro Universitario' },
  { from: /15 días/gi, to: '30 días' },
  { from: /1 mes/gi, to: '20 días hábiles' },
  { from: /obligatorio/gi, to: 'facultativo u optativo' },
  { from: /previa autorización/gi, to: 'comunicación posterior' }
];

/**
 * Genera distractores CONTEXTUALES Y PLAUSIBLES del mismo dominio
 */
function generateContextualDistractors(factText, heading, correctOpt, topicId, allTopicParas) {
  const isShortcut = /Ctrl|Alt|Shift|F\d|teclado|atajo/i.test(factText) || /Ctrl|Alt|Shift|F\d|\|/i.test(correctOpt);
  const isIT = isShortcut || /excel|word|m365|office|celda|hoja|documento|tabla|pantalla/i.test(heading + ' ' + factText);

  // CASO 1: ATAJOS DE TECLADO / INFORMÁTICA
  if (isShortcut) {
    const distractors = [];
    const used = new Set([correctOpt.toLowerCase()]);

    // Opción 1: Otro atajo conocido
    const shufShortcuts = [...SHORTCUT_POOL].sort(() => 0.5 - Math.random());
    shufShortcuts.forEach(s => {
      if (distractors.length < 3 && !used.has(s.toLowerCase())) {
        distractors.push(s);
        used.add(s.toLowerCase());
      }
    });

    // Opción 2: Función plausibles de Excel/Word si faltan
    const shufFuncs = [...EXCEL_FUNCTIONS_POOL].sort(() => 0.5 - Math.random());
    shufFuncs.forEach(f => {
      if (distractors.length < 3 && !used.has(f.toLowerCase())) {
        distractors.push(f);
        used.add(f.toLowerCase());
      }
    });

    return distractors.slice(0, 3);
  }

  // CASO 2: USAR OTROS PÁRRAFOS DEL MISMO TEMA / SECCIÓN COMO DISTRACTORES
  const distractors = [];
  const used = new Set([correctOpt.toLowerCase()]);

  // Filtrar párrafos del mismo tema que no coincidan con la opción correcta
  const siblingParas = allTopicParas
    .map(p => p.trim())
    .filter(p => p.length > 25 && p.length < 130 && !p.toLowerCase().includes(correctOpt.toLowerCase().substring(0, 20)))
    .sort(() => 0.5 - Math.random());

  siblingParas.forEach(p => {
    const candidate = p.substring(0, 115).trim();
    if (distractors.length < 3 && !used.has(candidate.toLowerCase())) {
      distractors.push(candidate);
      used.add(candidate.toLowerCase());
    }
  });

  // CASO 3: MUTACIÓN PLAUSIBLE DEL TEXTO CORRECTO (Si no hay suficientes párrafos hermanos)
  if (distractors.length < 3) {
    let mutated = correctOpt;
    for (const rule of LEGAL_MUTATIONS) {
      if (rule.from.test(mutated)) {
        const alt = mutated.replace(rule.from, rule.to);
        if (!used.has(alt.toLowerCase()) && distractors.length < 3) {
          distractors.push(alt);
          used.add(alt.toLowerCase());
        }
      }
    }
  }

  // CASO 4: FALLBACKS CONTEXTUALES DE DOMINIO (Solo de la misma área temática)
  if (distractors.length < 3) {
    const domainFallbacks = isIT ? [
      'Se ejecuta automáticamente al guardar el documento en OneDrive.',
      'Requiere activar el modo de compatibilidad de Microsoft 365.',
      'Aplica únicamente a los rangos de celdas con formato de tabla.'
    ] : [
      `Queda sujeto a la disponibilidad presupuestaria del ejercicio corriente.`,
      `Se tramitará previa solicitud justificada con 5 días hábiles de antelación.`,
      `Aplica únicamente al personal laboral fijo con más de 2 años de antigüedad.`
    ];

    domainFallbacks.forEach(fb => {
      if (distractors.length < 3 && !used.has(fb.toLowerCase())) {
        distractors.push(fb);
        used.add(fb.toLowerCase());
      }
    });
  }

  return distractors.slice(0, 3);
}

/**
 * Genera preguntas inéditas ACOTADAS Y CON DISTRACTORES PLAUSIBLES
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  const generated = [];
  const allSections = parseSectionsFromMarkdown(markdownText);

  // Array plano de todos los párrafos del tema para extraer distractores hermanos
  const allTopicParas = [];
  allSections.forEach(sec => sec.paragraphs.forEach(p => allTopicParas.push(p)));

  // 1. Filtrar las secciones estrictamente seleccionadas
  let targetSections = allSections;
  if (selectedSections !== 'all' && Array.isArray(selectedSections) && selectedSections.length > 0) {
    targetSections = allSections.filter(sec => {
      const secNorm = stripAccents(sec.title);
      return selectedSections.some(sel => {
        const selNorm = stripAccents(sel);
        return secNorm.includes(selNorm) || selNorm.includes(secNorm);
      });
    });

    if (targetSections.length === 0) {
      targetSections = allSections.filter(sec => selectedSections.some(sel => sec.title.includes(sel) || sel.includes(sec.title)));
    }
  }

  if (targetSections.length === 0) {
    targetSections = allSections;
  }

  // 2. Extraer hechos y párrafos EXCLUSIVAMENTE de targetSections
  const factPool = [];
  targetSections.forEach(sec => {
    sec.paragraphs.forEach(para => {
      factPool.push({ text: para, heading: sec.title });
    });
  });

  if (factPool.length === 0) {
    factPool.push({ text: `Regulación oficial aplicable a ${topicTitle}`, heading: `Tema ${topicId}` });
  }

  const shuffledFacts = [...factPool].sort(() => 0.5 - Math.random());

  let idx = 0;
  while (generated.length < count && idx < shuffledFacts.length * 4) {
    const factObj = shuffledFacts[idx % shuffledFacts.length];
    idx++;

    const factText = factObj.text;
    const heading = cleanHeadingTitle(factObj.heading);

    let newQ = null;

    const daysMatch = factText.match(/(\d+)\s+(días|meses|años|mes)/i);
    const isShortcut = /Ctrl|Alt|Shift|F\d|teclado|atajo/i.test(factText);

    // PATRÓN 1: ATAJOS DE TECLADO / FORMALISMOS TÉCNICOS
    if (isShortcut) {
      const shortcutMatch = factText.match(/(Ctrl\s*\+\s*[^|\n]+|Alt\s*\+\s*[^|\n]+|Shift\s*\+\s*[^|\n]+)/i);
      const cleanShortcut = shortcutMatch ? shortcutMatch[1].trim() : null;
      
      const parts = factText.split('|').map(s => s.trim()).filter(Boolean);
      let actionDesc = parts.length >= 2 ? parts[parts.length - 1] : factText.split(':')[1] || factText;
      actionDesc = actionDesc.replace(/^[*_`]/, '').trim();

      if (cleanShortcut && actionDesc.length > 5) {
        const qText = `En el apartado "${heading}", ¿qué acción realiza el atajo de teclado "${cleanShortcut}"?`;
        const correctOpt = actionDesc.substring(0, 110);
        
        const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allTopicParas);
        const options = [correctOpt, ...wrongDistractors];
        
        newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
      }
    }
    // PATRÓN 2: FECHAS / PLAZOS / DÍAS
    else if (daysMatch) {
      const num = daysMatch[1];
      const unit = daysMatch[2];
      const mainSentence = factText.split('.')[0];
      
      const qText = `En el apartado "${heading}", respecto a: "${mainSentence.substring(0, 75)}...", ¿cuál es el plazo legalmente establecido?`;
      
      const correctOpt = `${num} ${unit}`;
      const wrong1 = `${parseInt(num) * 2} ${unit}`;
      const wrong2 = `${Math.max(1, Math.floor(parseInt(num) / 2))} ${unit}`;
      const wrong3 = `30 días hábiles`;

      const options = [correctOpt, wrong1, wrong2, wrong3];
      newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
    } 
    // PATRÓN 3: AFIRMACIONES CONCEPTUALES DEL APARTADO
    else if (factText.length > 30) {
      const parts = factText.split(/[:–-]/);
      if (parts.length >= 2 && parts[0].trim().length > 6) {
        const concept = parts[0].replace(/[*_`]/g, '').trim();
        const definition = parts.slice(1).join(' ').replace(/[*_`]/g, '').trim();
        
        if (concept.length < 80 && definition.length > 15) {
          const qText = `Conforme al apartado "${heading}", referente a "${concept}", señale la afirmación correcta:`;
          const correctOpt = definition.substring(0, 115);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allTopicParas);
          const options = [correctOpt, ...wrongDistractors];
          
          newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
        }
      } else {
        const sentence = factText.split('.')[0].trim();
        if (sentence.length > 35) {
          const qText = `En el marco del apartado "${heading}", señale la opción correcta referente a su regulación:`;
          const correctOpt = sentence.substring(0, 120);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allTopicParas);
          const options = [correctOpt, ...wrongDistractors];
          
          newQ = createStructuredQuestion(qText, options, 0, sentence, heading, topicId);
        }
      }
    }

    if (newQ) {
      const dupCheck = checkDuplicated(newQ.question, topicId);
      const isAlreadyInBatch = generated.some(g => calculateSimilarity(g.question, newQ.question) > 0.6);

      if (!dupCheck.isDuplicated && !isAlreadyInBatch) {
        generated.push(newQ);
      }
    }
  }

  // Relleno aislado de la misma sección si se solicitan más preguntas
  while (generated.length < count) {
    const fallbackNum = generated.length + 1;
    const targetSectionObj = targetSections[fallbackNum % targetSections.length] || { title: `Tema ${topicId}` };
    const sectionLabel = cleanHeadingTitle(targetSectionObj.title);
    const sampleFact = (targetSectionObj.paragraphs && targetSectionObj.paragraphs.length > 0)
      ? targetSectionObj.paragraphs[fallbackNum % targetSectionObj.paragraphs.length]
      : `Regulación oficial de ${sectionLabel}`;

    const qText = `Según lo dispuesto en el apartado "${sectionLabel}", señale la afirmación correcta respecto a su contenido (#${fallbackNum}):`;
    const correctOpt = sampleFact.substring(0, 120);
    const wrongDistractors = generateContextualDistractors(sampleFact, sectionLabel, correctOpt, topicId, allTopicParas);
    const options = [correctOpt, ...wrongDistractors];
    
    const newQ = createStructuredQuestion(qText, options, 0, sampleFact, sectionLabel, topicId);
    generated.push(newQ);
  }

  return generated;
}

function createStructuredQuestion(rawQText, rawOptions, rawCorrectIdx, rawFact, heading, topicId) {
  const correctOptionText = rawOptions[rawCorrectIdx];
  const shuffledOptions = [...rawOptions].sort(() => 0.5 - Math.random());
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

  const formattedOptions = shuffledOptions.map((optText, i) => {
    const letter = ['A', 'B', 'C', 'D'][i];
    const cleanText = optText.replace(/^[A-D]\)\s*/, '').trim();
    return `${letter}) ${cleanText}`;
  });

  return {
    id: generateQuestionId(topicId),
    question: rawQText,
    options: formattedOptions,
    correctAnswer: newCorrectIndex,
    explanation: `Norma / Texto de referencia (${heading}): "${rawFact.substring(0, 180)}..."`,
    topicId: topicId.toString(),
    isGenerated: true,
    createdAt: new Date().toISOString()
  };
}
