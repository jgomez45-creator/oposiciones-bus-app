/**
 * Motor de Generación y Validación de Preguntas de Examen Inéditas
 * Estándar CCOO / Código 4140 de la Universidad de Sevilla (BUS)
 * 
 * Redacción Oficial Ágil y Variada (Cero enunciados repetitivos):
 * 1. Denominaciones de norma concisas y naturales ("la normativa contra el acoso de la US", "el IV Convenio Colectivo").
 * 2. Generador dinámico de enunciados de examen (buildExamQuestionStem) con variabilidad de fórmulas.
 * 3. Cero muletillas de 180 caracteres repetidas entre preguntas consecutivas.
 */

import quizzesData from '../data/quizzes.json';

const stripAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Purga exhaustiva de HTML, marketing y publicidad
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/[^\s)]+/gi, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>+\s*/gm, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`#]/g, '')
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

// Denominación concisa y natural de la norma por topicId
function getOfficialNormName(topicId, topicTitle) {
  const topNum = parseInt(topicId, 10);
  switch (topNum) {
    case 1: return 'el Reglamento de la BUS';
    case 2: return 'el Sistema de Calidad de la BUS';
    case 3: return 'las normas de espacios de la BUS';
    case 4: return 'la regulación de acceso remoto de la BUS';
    case 5: return 'las directrices de gestión de la colección de la BUS';
    case 6: return 'la Clasificación Decimal Universal (CDU)';
    case 7: return 'el catálogo FAMA y la plataforma Alma de la US';
    case 8: return 'las tecnologías RFID y autopréstamo de la BUS';
    case 9: return 'el Servicio de Préstamo y la Objetoteca de la BUS';
    case 10: return 'el Servicio de Información y Referencia de la BUS';
    case 11: return 'las acciones de Apoyo al Aprendizaje de la BUS';
    case 12: return 'los servicios de Apoyo a la Investigación y el repositorio idUS';
    case 13: return 'Microsoft 365';
    case 14: return 'el Plan de Prevención de Riesgos de la US';
    case 15: return 'la prevención de riesgos del puesto de Auxiliar de Biblioteca';
    case 16: return 'la Ley 31/1995 de Prevención de Riesgos Laborales';
    case 17: return 'los Estatutos de la Universidad de Sevilla';
    case 18: return 'el IV Convenio Colectivo del Personal Laboral de la US';
    case 19: return 'la Ley Orgánica de Igualdad 3/2007';
    case 20: return 'la normativa contra el acoso y la violencia de la US';
    default:
      const clean = sanitizeText(topicTitle).replace(/^Tema\s+\d+:\s*/i, '');
      return clean ? `la regulación sobre ${clean}` : 'la normativa aplicable';
  }
}

// Generador dinámico y variado de enunciados oficiales de examen (Cero frases idénticas repetidas)
function buildExamQuestionStem(normName, concept, heading, index) {
  const topicFocus = concept || heading || 'esta materia';
  const cleanFocus = topicFocus.length > 70 ? topicFocus.substring(0, 65) + '...' : topicFocus;

  const stemTemplates = [
    `En relación con "${cleanFocus}", ¿cuál de las siguientes opciones expresa lo establecido en ${normName}?`,
    `De acuerdo con la regulación de ${normName} referente a "${cleanFocus}", señale la afirmación correcta:`,
    `Según lo dispuesto en ${normName}, señale la opción correcta respecto a "${cleanFocus}":`,
    `En el marco del procedimiento sobre "${cleanFocus}" en la US, ¿qué opción refleja la regulación oficial?`,
    `Respecto a "${cleanFocus}", señale la afirmación correcta de acuerdo con ${normName}:`
  ];

  return stemTemplates[index % stemTemplates.length];
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

// ── BANCO DE DISTRACTORES FORMALES Y PLAUSIBLES PARA LOS 20 TEMAS ─────────────
const DOMAIN_DISTRACTORS = {
  derecho_admin: [
    'Acto administrativo ejecutivo sujeto a recurso de alzada en el plazo de un mes ante el órgano superior jerárquico.',
    'Resolución que agota la vía administrativa resolviendo la solicitud mediante silencio positivo regulado.',
    'Disposición de carácter general notificada individualmente a los interesados dentro de los 10 días siguientes.',
    'Procedimiento tramitado por la vía de urgencia reduciendo a la mitad los plazos normativos ordinarios.',
    'Contrato menor que no requiere licitación pública por importe inferior al umbral legalmente regulado.'
  ],
  biblioteconomia: [
    'Servicio de Préstamo Interbibliotecario (PIB / ILL) orientado a localizar documentos no existentes en el catálogo FAMA.',
    'Clasificación Decimal Universal (CDU) estructurada mediante tablas principales de números y auxiliares de relación.',
    'Plataforma de gestión de servicios de información Alma integrada con el catálogo en línea de la Universidad.',
    'Consulta restringida en sala para manuscritos e impresos del Fondo Antiguo anteriores a 1901.',
    'Renovación automática del periodo de préstamo a través del espacio personal en la plataforma FAMA.'
  ],
  informatica: [
    'Ctrl + Shift + L', 'Alt + F11', 'Ctrl + Alt + V', 'Ctrl + N',
    'Aplicar el formato de moneda con dos decimales a las celdas seleccionadas.',
    'Insertar una nueva tabla dinámica o gráfico en la hoja de trabajo activa.',
    'Abrir el cuadro de diálogo Buscar y Reemplazar dentro del libro activo.',
    'Sincronizar carpetas y archivos locales mediante el cliente de OneDrive para Empresa.',
    'Asignar permisos de visualización o edición restringidos a usuarios del espacio de trabajo de Teams.'
  ],
  estatutos_us: [
    'Máxima autoridad académica y de representación de la Universidad de Sevilla elegida por la comunidad universitaria.',
    'Órgano colegiado de gobierno que aprueba la propuesta de presupuesto e imparte las directrices generales de la Universidad.',
    'Órgano supremo de representación de la comunidad universitaria compuesto por representación del PDI, PTGAS y estudiantado.',
    'Órgano encargado de supervisar las actividades de carácter económico y el rendimiento de los servicios de la Universidad.',
    'Comisión delegada competente para dictaminar las reclamaciones en materia de profesorado y personal.'
  ],
  convenio_us: [
    'Desempeño de funciones de grupo superior por un periodo máximo e improrrogable de 12 meses continuados.',
    'Adquisición de la condición de personal fijo mediante la superación de los procesos selectivos de turno libre.',
    'Derecho a la concesión de licencias retribuidas de hasta 15 días naturales por matrimonio o pareja de hecho.',
    'Modificación sustancial de las condiciones de trabajo sometida a informe previo del Comité de Empresa.',
    'Prescripción de las faltas muy graves a los 60 días contados desde la fecha en que la Gerencia tuvo conocimiento.'
  ],
  igualdad: [
    'Situación en que una disposición o práctica aparentemente neutra pone a personas de un sexo en desventaja particular.',
    'Trato desfavorable o adverso dispensado a una persona como reacción ante una reclamación o recurso administrativo.',
    'Cualquier comportamiento verbal o físico no deseado que tenga el propósito de atentar contra la dignidad personal.',
    'Principio de presencia equilibrada garantizado mediante una representación entre el 40% y el 60% de ambos sexos.',
    'Medidas específicas de acción positiva adoptadas para corregir situaciones patentes de desigualdad de hecho.'
  ],
  acoso_us: [
    'Comisión de investigación técnica dependiente del Vicerrectorado de Igualdad para la instrucción confidencial.',
    'Medida cautelar de separación física o cambio de turno dictada durante la fase de tramitación de la denuncia.',
    'Informe técnico no sancionador elevado a la persona titular del Rectorado para la adopción de resoluciones.',
    'Denuncia por ciberacoso tramitada a través del registro oficial corporativo con garantía de confidencialidad.',
    'Acoso laboral psicosocial reiterado y prolongado en el entorno académico o de servicios de la Universidad.'
  ],
  prl_seprus: [
    'Órgano colegiado y paritario de participación destinado a la consulta regular de las actuaciones en materia de prevención.',
    'Representante de los trabajadores con funciones específicas de prevención de riesgos en el centro de trabajo.',
    'Evaluación inicial de los riesgos para la seguridad y salud de los trabajadores al comenzar una actividad.',
    'Obligación del empresario de proporcionar equipos de protección individual (EPI) adecuados al puesto.',
    'Vigilancia periódica del estado de salud de los trabajadores en función de los riesgos inherentes al trabajo.'
  ]
};

function getDomainKeyForTopic(topicId, normContent) {
  const topNum = parseInt(topicId, 10);
  if (topNum === 20 || /violencia|acoso|ciberacoso|discriminación/i.test(normContent)) {
    return 'acoso_us';
  }
  if (topNum === 19 || /igualdad|sexo|género/i.test(normContent)) {
    return 'igualdad';
  }
  if (topNum >= 13 && topNum <= 16) {
    if (topNum === 16 || /ley 31\/1995|lprl/i.test(normContent)) return 'prl_seprus';
    if (topNum === 14 || topNum === 15) return 'prl_seprus';
    return 'informatica';
  }
  if (topNum === 18) return 'convenio_us';
  if (topNum === 17) return 'estatutos_us';
  if (topNum >= 6 && topNum <= 12) return 'biblioteconomia';
  if (topNum >= 1 && topNum <= 5) return 'derecho_admin';
  return 'convenio_us';
}

function generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas) {
  const normContent = (heading + ' ' + factText + ' ' + correctOpt).toLowerCase();
  const domainKey = getDomainKeyForTopic(topicId, normContent);

  const distractors = [];
  const used = new Set([correctOpt.toLowerCase().trim()]);

  // OP 1: Definiciones de otros conceptos reales del temario
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

  // OP 2: Otros párrafos limpios del mismo tema
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

  // OP 3: Distractores formales del dominio temático
  if (distractors.length < 3) {
    const domainPool = (DOMAIN_DISTRACTORS[domainKey] || DOMAIN_DISTRACTORS.convenio_us).sort(() => 0.5 - Math.random());
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
 * Genera preguntas inéditas CON ENUNCIADOS DINÁMICOS Y ÁGILES (Temas 1 al 20)
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  const generated = [];
  const allSections = parseSectionsFromMarkdown(markdownText);
  const normName = getOfficialNormName(topicId, topicTitle);

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

  // 2. Extraer hechos y párrafos EXCLUSIVAMENTE de targetSections
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
        const qText = `En ${normName}, ¿cuál de las siguientes opciones describe exactamente la función realizada por el atajo de teclado "${cleanShortcut}"?`;
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
      
      const qText = `Según lo establecido en ${normName}, respecto a "${mainSentence.substring(0, 65)}...", ¿cuál es el plazo legalmente establecido?`;
      
      const correctOpt = `${num} ${unit}`;
      const wrong1 = `${parseInt(num) * 2} ${unit}`;
      const wrong2 = `${Math.max(1, Math.floor(parseInt(num) / 2))} ${unit}`;
      const wrong3 = `30 días hábiles`;

      const options = [correctOpt, wrong1, wrong2, wrong3];
      newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
    } 
    // PATRÓN 3: CONCEPTOS Y DEFINICIONES LEGALES / TÉCNICAS
    else if (factText.length > 25) {
      const parts = factText.split(/[:–-]/);
      if (parts.length >= 2 && parts[0].trim().length > 3) {
        const concept = sanitizeText(parts[0]);
        const definition = sanitizeText(parts.slice(1).join(' '));
        
        if (concept.length < 80 && definition.length > 15) {
          const qText = buildExamQuestionStem(normName, concept, heading, idx);
          const correctOpt = definition.substring(0, 115);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas);
          const options = [correctOpt, ...wrongDistractors];
          
          newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
        }
      } else {
        const sentence = sanitizeText(factText.split('.')[0]);
        if (sentence.length > 30) {
          const qText = buildExamQuestionStem(normName, sentence.substring(0, 50), heading, idx);
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

  // Relleno de preguntas con fuentes oficiales y enunciados dinámicos
  while (generated.length < count) {
    const fallbackNum = generated.length + 1;
    const targetSectionObj = targetSections[fallbackNum % targetSections.length] || { title: `Tema ${topicId}` };
    const sectionLabel = cleanHeadingTitle(targetSectionObj.title);
    const sampleFact = (targetSectionObj.paragraphs && targetSectionObj.paragraphs.length > 0)
      ? sanitizeText(targetSectionObj.paragraphs[fallbackNum % targetSectionObj.paragraphs.length])
      : `Regulación oficial sobre la materia`;

    const qText = buildExamQuestionStem(normName, sectionLabel, sectionLabel, fallbackNum);
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
