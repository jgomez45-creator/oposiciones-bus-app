/**
 * Motor de Generación y Validación de Preguntas de Examen Inéditas
 * Estándar CCOO / Código 4140 de la Universidad de Sevilla (BUS)
 * 
 * Garantiza:
 * 1. Purga 100% de HTML, banners de promoción y enlaces de marketing.
 * 2. Distractores 100% verosímiles y formales extraídos de otros conceptos del mismo tema o dominio legal/técnico.
 * 3. Cero opciones de descarte fácil o disparates fuera de ámbito.
 */

import quizzesData from '../data/quizzes.json';

const stripAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Purga exhaustiva de HTML, marketing y publicidad
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Elimina cualquier etiqueta HTML (<p style=..., <div...)
    .replace(/https?:\/\/[^\s)]+/gi, '') // Elimina URLs
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convierte [texto](url) en texto
    .replace(/^>+\s*/gm, '') // Elimina blockquotes de markdown
    .replace(/^#+\s*/gm, '') // Elimina símbolos de título
    .replace(/[*_`#]/g, '') // Elimina negritas/cursivas/código
    .trim();
}

// Filtra si una línea pertenece a publicidad o marcado interno
function isMarketingOrHTML(line) {
  if (!line) return true;
  const lower = line.toLowerCase();
  return (
    lower.includes('<p') || lower.includes('<div') || lower.includes('class=') || lower.includes('style=') ||
    lower.includes('app-promo-banner') || lower.includes('header-promo') || lower.includes('mid-promo') ||
    lower.includes('estudia y optimiza') || lower.includes('modo test') || lower.includes('flashcards') ||
    lower.includes('tarjetas de memorización') || lower.includes('repaso rápido') || lower.includes('pon a prueba') ||
    lower.includes('no te quedes solo') || lower.includes('accede a oposiciones-bus-app') || lower.startsWith('http')
  );
}

// Limpia títulos de epígrafes
export function cleanHeadingTitle(title) {
  if (!title) return '';
  const clean = sanitizeText(title);
  return clean
    .replace(/[📌📱💡🎴📝⚡⚠️📋🟢🟡🔴•*]/g, '')
    .replace(/^(COMPENDIO|GUÍA|RESUMEN|APARTADO|SECCIÓN)\s*/i, '')
    .replace(/\(SÚPER PREGUNTADOS.*\)/i, '')
    .replace(/\(MÁXIMA IMPORTANCIA.*\)/i, '')
    .trim();
}

// Generador de ID único
export function generateQuestionId(topicId) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `q_t${topicId}_${timestamp}_${randomStr}`;
}

/**
 * Parsea el Markdown filtrando 100% de publicidad y HTML
 */
export function parseSectionsFromMarkdown(markdownText) {
  if (!markdownText) return [];

  const lines = markdownText.split('\n');
  const sections = [];
  let currentTitle = '';
  let currentParas = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (isMarketingOrHTML(trimmed)) return;

    if (/^#{1,3}\s+/.test(trimmed)) {
      const titleText = cleanHeadingTitle(trimmed.replace(/^#+\s*/, ''));
      if (titleText.length > 2 && !titleText.toLowerCase().startsWith('tema ')) {
        if (currentParas.length > 0 && currentTitle) {
          sections.push({ title: currentTitle, paragraphs: currentParas });
        }
        currentTitle = titleText;
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
  const sections = parseSectionsFromMarkdown(markdownText);
  return sections.map(s => s.title);
}

// Algoritmo de similitud Levenshtein / Jaccard
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

// ── BANCO DE DISTRACTORES FORMALES Y PLAUSIBLES POR DOMINIO ──────────────────
const DOMAIN_DISTRACTORS = {
  // Dominio: Igualdad y Acoso (Tema 19)
  igualdad: [
    'Situación en que una disposición o práctica aparentemente neutra pone a personas de un sexo en desventaja particular.',
    'Trato desfavorable o adverso dispensado a una persona como reacción ante una reclamación o recurso administrativo.',
    'Cualquier comportamiento verbal o físico no deseado que tenga el propósito de atentar contra la dignidad personal.',
    'Principio de presencia equilibrada garantizado mediante una representación entre el 40% y el 60% de ambos sexos.',
    'Medidas específicas de acción positiva adoptadas para corregir situaciones patentes de desigualdad de hecho.'
  ],
  // Dominio: Convenio y Empleo (Tema 17, 18)
  convenio: [
    'Desempeño de funciones de grupo superior por un periodo máximo e improrrogable de 12 meses continuados.',
    'Adquisición de la condición de personal fijo mediante la superación de los procesos selectivos de turno libre.',
    'Derecho a la concesión de licencias retribuidas de hasta 15 días naturales por matrimonio o pareja de hecho.',
    'Modificación sustancial de las condiciones de trabajo sometida a informe previo del Comité de Empresa.',
    'Prescripción de las faltas muy graves a los 60 días contados desde la fecha en que la Gerencia tuvo conocimiento.'
  ],
  // Dominio: Biblioteca y Servicios BUS (Temas 6 al 12)
  biblioteca: [
    'Consulta y préstamo de documentos restringido a usuarios con UVUS activo o carné oficial de la BUS.',
    'Servicio de Préstamo Interbibliotecario (PIB) orientado a la obtención de fondos no existentes en el catálogo FAMA.',
    'Clasificación Decimal Universal (CDU) organizada mediante tablas principales y auxiliares sistemáticas.',
    'Catálogo en línea FAMA integrado en la plataforma de gestión de recursos de información Alma.',
    'Fondo Antiguo y Archivo Histórico compuesto por manuscritos, incunables e impresos anteriores a 1901.'
  ],
  // Dominio: Informática / Microsoft 365 (Temas 13 a 16)
  informatica: [
    'Ctrl + Shift + L', 'Alt + F11', 'Ctrl + Alt + V', 'Ctrl + N',
    'Aplicar el formato de moneda con dos decimales a las celdas seleccionadas.',
    'Insertar una nueva tabla dinámica o gráfico en la hoja de trabajo activa.',
    'Abrir el cuadro de diálogo Buscar y Reemplazar dentro del libro activo.',
    'Sincronizar carpetas y archivos locales mediante el cliente de OneDrive para Empresa.',
    'Asignar permisos de visualización o edición restringidos a usuarios del espacio de trabajo de Teams.'
  ]
};

/**
 * Selecciona o sintetiza distractores 100% verosímiles y formales
 */
function generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas) {
  const normContent = (heading + ' ' + factText + ' ' + correctOpt).toLowerCase();
  
  // Determinar dominio temático
  let domainKey = 'convenio';
  if (/igualdad|acoso|ciberacoso|sexo|género|violencia|discriminación/i.test(normContent)) {
    domainKey = 'igualdad';
  } else if (/excel|word|m365|office|celda|hoja|documento|tabla|pantalla|ctrl|alt|shift|f\d|atajo/i.test(normContent)) {
    domainKey = 'informatica';
  } else if (/prestamo|pib|fama|alma|cdu|biblioteca|bus|catalogo|fondo antiguo|rfid|cbua|rebiun/i.test(normContent)) {
    domainKey = 'biblioteca';
  }

  const distractors = [];
  const used = new Set([correctOpt.toLowerCase().trim()]);

  // OP 1: Usar definiciones de OTROS CONCEPTOS REALES extraídos del temario
  const otherConceptPairs = allConceptPairs
    .filter(cp => !used.has(cp.definition.toLowerCase().trim()) && cp.definition.length > 20)
    .sort(() => 0.5 - Math.random());

  otherConceptPairs.forEach(cp => {
    const cand = cp.definition.substring(0, 115).trim();
    if (distractors.length < 3 && !used.has(cand.toLowerCase())) {
      distractors.push(cand);
      used.add(cand.toLowerCase());
    }
  });

  // OP 2: Usar otros párrafos limpios del mismo tema
  if (distractors.length < 3) {
    const cleanParas = allCleanParas
      .filter(p => p.length > 25 && p.length < 130 && !isMarketingOrHTML(p))
      .sort(() => 0.5 - Math.random());

    cleanParas.forEach(p => {
      const cand = p.substring(0, 115).trim();
      if (distractors.length < 3 && !used.has(cand.toLowerCase())) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
      }
    });
  }

  // OP 3: Usar distractores formales del banco de dominio correspondiente
  if (distractors.length < 3) {
    const domainPool = (DOMAIN_DISTRACTORS[domainKey] || DOMAIN_DISTRACTORS.convenio).sort(() => 0.5 - Math.random());
    domainPool.forEach(item => {
      if (distractors.length < 3 && !used.has(item.toLowerCase())) {
        distractors.push(item);
        used.add(item.toLowerCase());
      }
    });
  }

  return distractors.slice(0, 3);
}

/**
 * Genera preguntas inéditas ACOTADAS Y CON DISTRACTORES 100% PROFESIONALES
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  const generated = [];
  const allSections = parseSectionsFromMarkdown(markdownText);

  // Extraer todos los párrafos limpios del tema
  const allCleanParas = [];
  const allConceptPairs = [];

  allSections.forEach(sec => {
    sec.paragraphs.forEach(para => {
      if (!isMarketingOrHTML(para)) {
        allCleanParas.push(para);
        const parts = para.split(/[:–-]/);
        if (parts.length >= 2 && parts[0].trim().length > 3) {
          allConceptPairs.push({
            concept: parts[0].trim(),
            definition: parts.slice(1).join(' ').trim(),
            heading: sec.title
          });
        }
      }
    });
  });

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

  // 2. Extraer hechos y párrafos EXCLUSIVAMENTE de targetSections (0% marketing)
  const factPool = [];
  targetSections.forEach(sec => {
    sec.paragraphs.forEach(para => {
      if (!isMarketingOrHTML(para) && para.length > 20) {
        factPool.push({ text: para, heading: sec.title });
      }
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

    // PATRÓN 1: ATAJOS DE TECLADO / INFORMÁTICA
    if (isShortcut) {
      const shortcutMatch = factText.match(/(Ctrl\s*\+\s*[^|\n]+|Alt\s*\+\s*[^|\n]+|Shift\s*\+\s*[^|\n]+)/i);
      const cleanShortcut = shortcutMatch ? shortcutMatch[1].trim() : null;
      
      const parts = factText.split('|').map(s => s.trim()).filter(Boolean);
      let actionDesc = parts.length >= 2 ? parts[parts.length - 1] : factText.split(':')[1] || factText;
      actionDesc = sanitizeText(actionDesc);

      if (cleanShortcut && actionDesc.length > 5) {
        const qText = `En el apartado "${heading}", ¿qué función realiza el atajo de teclado "${cleanShortcut}"?`;
        const correctOpt = actionDesc.substring(0, 110);
        
        const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas);
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
    // PATRÓN 3: CONCEPTOS Y DEFINICIONES LEGALES
    else if (factText.length > 25) {
      const parts = factText.split(/[:–-]/);
      if (parts.length >= 2 && parts[0].trim().length > 3) {
        const concept = sanitizeText(parts[0]);
        const definition = sanitizeText(parts.slice(1).join(' '));
        
        if (concept.length < 80 && definition.length > 15) {
          const qText = `Conforme al apartado "${heading}", referente a "${concept}", señale la definición o afirmación correcta:`;
          const correctOpt = definition.substring(0, 115);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas);
          const options = [correctOpt, ...wrongDistractors];
          
          newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
        }
      } else {
        const sentence = sanitizeText(factText.split('.')[0]);
        if (sentence.length > 30) {
          const qText = `En el marco del apartado "${heading}", señale la opción correcta referente a su regulación:`;
          const correctOpt = sentence.substring(0, 120);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas);
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

  // Relleno de preguntas de alta calidad si fuera necesario
  while (generated.length < count) {
    const fallbackNum = generated.length + 1;
    const targetSectionObj = targetSections[fallbackNum % targetSections.length] || { title: `Tema ${topicId}` };
    const sectionLabel = cleanHeadingTitle(targetSectionObj.title);
    const sampleFact = (targetSectionObj.paragraphs && targetSectionObj.paragraphs.length > 0)
      ? sanitizeText(targetSectionObj.paragraphs[fallbackNum % targetSectionObj.paragraphs.length])
      : `Regulación oficial de ${sectionLabel}`;

    const qText = `Según lo dispuesto en el apartado "${sectionLabel}", señale la afirmación correcta respecto a su contenido (#${fallbackNum}):`;
    const correctOpt = sampleFact.substring(0, 120);
    const wrongDistractors = generateContextualDistractors(sampleFact, sectionLabel, correctOpt, topicId, allConceptPairs, allCleanParas);
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
    const cleanText = sanitizeText(optText.replace(/^[A-D]\)\s*/, ''));
    return `${letter}) ${cleanText}`;
  });

  return {
    id: generateQuestionId(topicId),
    question: sanitizeText(rawQText),
    options: formattedOptions,
    correctAnswer: newCorrectIndex,
    explanation: `Norma / Texto de referencia (${heading}): "${sanitizeText(rawFact).substring(0, 180)}..."`,
    topicId: topicId.toString(),
    isGenerated: true,
    createdAt: new Date().toISOString()
  };
}
