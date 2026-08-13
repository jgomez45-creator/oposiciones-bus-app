/**
 * Motor de Generación y Validación de Preguntas de Examen Inéditas
 * Estándar CCOO / Código 4140 de la Universidad de Sevilla (BUS)
 * 
 * Reglamento Ampliado con Normas CCOO (Reglas 1 a 16):
 * - Rule 16 (Ajustada): Trampas de complemento pareadas (hábiles vs naturales) utilizadas de forma probabilística (50% de las veces en plazos) para dar variedad pedagógica.
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
    lower.includes('<p') || lower.includes('<div') || lower.includes('<ul') || lower.includes('<li') || lower.includes('<a') ||
    lower.includes('class=') || lower.includes('style=') || lower.includes('href=') ||
    lower.includes('app-promo-banner') || lower.includes('header-promo') || lower.includes('mid-promo') ||
    lower.includes('estudia y optimiza') || lower.includes('modo test') || lower.includes('flashcards') ||
    lower.includes('tarjetas de memorización') || lower.includes('repaso rápido') || lower.includes('pon a prueba') ||
    lower.includes('no te quedes solo') || lower.includes('accede a oposiciones-bus-app') || lower.startsWith('http') ||
    lower.includes('complementa tu estudio') || lower.includes('preguntas por tema') || lower.includes('simulacros predefinidos') ||
    lower.includes('exámenes reales') || lower.includes('simulacros infinitos') || lower.includes('repaso de fallos') ||
    lower.includes('oposiciones-bus-app.vercel.app')
  );
}

// Limpia títulos de epígrafes purgando números de artículo y letras iniciales
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

// Denominación multi-fuente dinámica de la norma según la sección y el contenido evaluado
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
      if (/ley 3\/2022|convivencia/i.test(combined)) return 'la Ley 3/2022 de Convivencia Universitaria';
      return 'la normativa contra el acoso y la violencia de la US';
    default:
      const clean = sanitizeText(topicTitle).replace(/^Tema\s+\d+:\s*/i, '');
      return clean ? `la regulación sobre ${clean}` : 'la normativa aplicable';
  }
}

// Purga datos numéricos, adjetivos de plazos y remanentes en el extracto citado
function cleanStemExcerpt(text) {
  if (!text) return '';
  return text
    .replace(/^([A-Z0-9][.)-]\s*)+/i, '')
    .replace(/\(Artículo\s+\d+\)/i, '')
    .replace(/\((plazo|duración|término|artículo|art|máximo|mínimo)?:?\s*\d+[^)]+\)/gi, '')
    .replace(/\b\d+\s*(días|meses|años|horas|minutos)?\s*(hábiles|naturales)?\b/gi, '')
    .replace(/\b(hábiles|naturales)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[:;,-]+\s*$/g, '')
    .trim();
}

// Determina la Subtemática / Subdominio de Sección exacto
function getSectionSubdomain(heading, text) {
  const combined = (heading + ' ' + text).toLowerCase();
  
  if (/sanci\u00f3n|sanciones|suspensi\u00f3n|penalizaci\u00f3n|retraso|infracci\u00f3n|demora/i.test(combined)) {
    return 'sanciones_penalizaciones';
  }
  if (/crai|software|equipamiento|impresi\u00f3n|objetoteca|tecnol\u00f3gico|recurso|soporte inform\u00e1tico|servicios|atenci\u00f3n/i.test(combined)) {
    return 'servicios_recursos';
  }
  if (/consorcio|redes de cooperaci\u00f3n|worldcat|rebiun|cabu|bne/i.test(combined)) {
    return 'cooperacion_consorcios';
  }
  if (/reglamento|marco normativo|dependencia|planificaci\u00f3n|estructura|organigrama|estatuto/i.test(combined)) {
    return 'normativa_organigrama';
  }
  if (/ámbito|subjetivo|aplicación|colectivo|personal|pdi|ptgas|estudiantes|becarios|contratistas|exclusión/i.test(combined)) {
    return 'ambito_aplicacion';
  }
  if (/fase|indagación|plazo|tramitación|procedimiento|medida|cautelar|informe|comité|resolución/i.test(combined)) {
    return 'fases_procedimiento';
  }
  if (/acoso|sexual|mobbing|moral|ciberacoso|conducta|discriminación|hostil/i.test(combined)) {
    return 'tipologia_acoso';
  }
  if (/órgano|vicerrector|director|seprus|igualdad|secretaría|comisión/i.test(combined)) {
    return 'organos_comite';
  }
  return 'general';
}

// Determina el tipo semántico de una opción (date_or_number, short_concept, procedural_text)
function getSemanticType(text) {
  if (!text) return 'procedural_text';
  const clean = text.trim();
  
  if (/^\d+\s*(días|meses|años|horas|de\s+[a-z]+)/i.test(clean) || /^\d{1,2}\s+de\s+[a-z]+/i.test(clean) || (clean.length < 22 && /\d+/.test(clean))) {
    return 'date_or_number';
  }
  if (clean.length < 40 && !clean.includes('.')) {
    return 'short_concept';
  }
  return 'procedural_text';
}

// Generador dinámico de enunciados de examen con fluidez y claridad natural
function buildExamQuestionStem(normName, concept, heading, index) {
  const rawFocus = concept || heading || 'esta materia';
  let cleanFocus = cleanStemExcerpt(rawFocus).replace(/\s+/g, ' ').trim();

  const stemTemplates = [
    `En relación con "${cleanFocus}", ¿cuál de las siguientes opciones expresa lo establecido en ${normName}?`,
    `De acuerdo con la regulación de ${normName} referente a "${cleanFocus}", señale la afirmación correcta:`,
    `Según lo dispuesto en ${normName}, señale la opción correcta respecto a "${cleanFocus}":`,
    `En un supuesto práctico de actuación sobre "${cleanFocus}" en la US, ¿cómo debe procederse conforme a ${normName}?`,
    `Ante una situación en la que se valore "${cleanFocus}", ¿qué opción refleja la regla establecida en ${normName}?`
  ];

  return stemTemplates[index % stemTemplates.length];
}

// Valida si un concepto extraído es sintácticamente completo y válido
function isValidConcept(concept) {
  if (!concept || typeof concept !== 'string') return false;
  const clean = cleanHeadingTitle(concept).trim();
  if (clean.length < 4 || clean.length > 85) return false;
  
  if (/\b(y|o|de|del|en|para|con|por|a|que|su|sus|un|una|el|la|los|las|hábiles|naturales)\s*$/i.test(clean)) {
    return false;
  }
  if (/^[0-9•*\-\.]+\s*$/.test(clean)) return false;

  return true;
}

// Trunca texto respetando oraciones completas y sin límites artificiales rígidos
function safeTruncateText(text, maxLen = 350) {
  if (!text) return '';
  let clean = sanitizeText(text).trim();
  if (clean.length <= maxLen) return clean;

  // Priorizar siempre cortar en un punto seguido / final de oración completa
  const periodIndex = clean.substring(0, maxLen).lastIndexOf('.');
  if (periodIndex > 30) {
    return clean.substring(0, periodIndex + 1);
  }

  let sub = clean.substring(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 20) {
    sub = sub.substring(0, lastSpace);
  }

  sub = sub
    .replace(/[,;:\-\s]+$/, '')
    .replace(/\b(del|de|el|la|los|las|un|una|en|para|con|por|y|o|que|su|sus|al|e|i|ante|tras|conforme)\s*$/i, '')
    .trim();

  return sub + '.';
}

// Valida que el enunciado NO contenga la solución, tautologías ni pistas de la respuesta correcta
function hasAnswerLeak(questionText, correctOptionText) {
  if (!questionText || !correctOptionText) return false;
  
  const qLower = questionText.toLowerCase();
  const cLower = correctOptionText.toLowerCase();

  // Fuga 1: Tautología directa (el foco del enunciado se repite literalmente en la opción correcta)
  const quotedMatch = qLower.match(/"([^"]+)"/);
  if (quotedMatch) {
    const focusWord = quotedMatch[1].toLowerCase().trim();
    if (focusWord.length > 4 && cLower.includes(focusWord)) {
      return true; // Evita preguntas del tipo "¿Qué es La Objetoteca?" -> "Servicio de Objetoteca..."
    }
  }

  // Fuga 2: Coincidencia de cifras
  const digitMatch = cLower.match(/(\d+)\s*(días|meses|años|horas)/);
  if (digitMatch) {
    const numberStr = digitMatch[1];
    if (new RegExp(`\\b${numberStr}\\b`).test(qLower)) {
      return true;
    }
  }

  return false;
}

// Valida que las 4 opciones sean semánticamente coherentes, únicas y sin comodines
function hasCoherentOptions(options) {
  if (!options || options.length !== 4) return false;
  const cleanOpts = options.map(o => o.replace(/^[A-D]\)\s*/, '').trim());
  if (cleanOpts.some(o => o.length < 2)) return false;
  if (cleanOpts.some(o => /todas son correctas|ninguna es correcta|todas las anteriores|a y b son/i.test(o))) return false;
  const uniqueOpts = new Set(cleanOpts.map(o => o.toLowerCase()));
  if (uniqueOpts.size !== 4) return false;
  return true;
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
    
    // Ignorar tablas Markdown porque no forman frases con sentido completo
    if (/^\|.*\|$/.test(trimmed)) return;

    if (/^#{1,3}\s+/.test(trimmed)) {
      const titleText = cleanHeadingTitle(trimmed.replace(/^#+\s*/, ''));
      if (titleText.length > 2 && !titleText.toLowerCase().startsWith('tema ')) {
        if (currentParas.length > 0 && currentTitle) {
          sections.push({ title: currentTitle, paragraphs: currentParas });
        }
        
        const lowerTitle = titleText.toLowerCase();
        if (lowerTitle.includes('bibliografía') || lowerTitle.includes('bibliografia') || lowerTitle.includes('anexo') || lowerTitle === 'notas') {
          currentTitle = ''; // Ignorar esta sección
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
  const sections = parseSectionsFromMarkdown(markdownText);
  return sections.map(s => s.title);
}

export function extractTopicSummary(markdownText) {
  const sections = parseSectionsFromMarkdown(markdownText);
  if (!sections || sections.length === 0) return '';
  
  const summaryBlocks = [];

  sections.forEach(sec => {
    if (!sec.paragraphs || sec.paragraphs.length === 0) return;
    
    // Unir párrafos de la sección resolviendo frases que terminan en ':' o ';'
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

    if (buffer) {
      joinedParagraphs.push(buffer);
    }

    if (joinedParagraphs.length > 0) {
      // Tomar hasta 2 explicaciones clave completas por sección
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

// ── BANCO DE DISTRACTORES POR SUBDOMINIO (CERO MEZCLAS INCONGRUENTES) ─────────────
const DOMAIN_DISTRACTORS = {
  ambito_aplicacion: [
    'Personal Docente e Investigador (PDI) con vinculación permanente o temporal en la Universidad de Sevilla.',
    'Personal Técnico de Gestión y de Administración y Servicios (PTGAS) en cualquier situación administrativa.',
    'Estudiantes matriculados en títulos oficiales o propios impartidos por la Universidad de Sevilla.',
    'Quedan fuera del ámbito subjetivo directo el personal de empresas contratistas externas de servicios de la US.'
  ],
  fases_procedimiento: [
    'Indagación Avanzada tramitada por el Comité Técnico en un plazo máximo e improrrogable de 20 días hábiles.',
    'Adopción de medidas cautelares provisionales de separación física o cambio temporal de turno de trabajo.',
    'Elaboración del Informe Técnico Final con propuesta de archivo o de incoación de expediente disciplinario.',
    'Tramitación a través del Buzón Único Electrónico para la convivencia gestionado por la Secretaría General.'
  ],
  tipologia_acoso: [
    'Conducta hostil, reiterada y prolongada en el tiempo que atenta contra la dignidad o integridad moral en el trabajo.',
    'Comportamiento no deseado de naturaleza sexual realizado con el propósito de crear un entorno intimidatorio.',
    'Cualquier trato adverso dispensado a una persona en función de su orientación sexual o identidad de género.',
    'Acoso realizado a través de medios tecnológicos, redes sociales o plataformas virtuales corporativas de la US.'
  ],
  organos_comite: [
    'El o la Vicerrector/a con competencias en materia de igualdad, quien ostenta la Presidencia del Comité Técnico.',
    'El o la Director/a del Servicio de Prevención de Riesgos Laborales (SEPRUS) como miembro técnico nato.',
    'El o la Director/a de la Unidad para la Igualdad de la Universidad de Sevilla.',
    'Representación técnica legal de los trabajadores elegida por la Mesa General de Negociación.'
  ]
};

// Genera distractores pertenecientes strictly al MISMO SUBDOMINIO Y TIPO SEMÁNTICO
function generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas, globalBatchUsed = new Set()) {
  const targetSubdomain = getSectionSubdomain(heading, factText);
  const targetSemanticType = getSemanticType(correctOpt);
  const targetLength = correctOpt.length;

  const isSanctionTarget = targetSubdomain === 'sanciones_penalizaciones' || /sanción|suspensión|penalización|retraso/i.test(correctOpt);

  // Filtro de coherencia estricta para evitar opciones de fácil descarte y comodines recurrentes
  const isCoherent = (text) => {
    if (!text) return false;

    // BLOQUEO ABSOLUTO DE COMODINES RECURRENTES (carnet universitario) SALVO QUE LA PREGUNTA SEA DE ESE TEMA
    const isAskingAboutCarnet = /carnet/i.test(heading) || /carnet/i.test(factText);
    if (!isAskingAboutCarnet && /carnet universitario/i.test(text)) {
      return false;
    }

    const isSanctionText = /sanción|suspensión|penalización|retraso|infracción/i.test(text);
    if (!isSanctionTarget && isSanctionText) return false; // Bloquea sanciones en preguntas de servicios
    if (isSanctionTarget && !isSanctionText) return false; // Bloquea no-sanciones en preguntas de sanciones
    return true;
  };

  const distractors = [];
  const used = new Set([
    correctOpt.toLowerCase().trim(),
    ...Array.from(globalBatchUsed).map(s => s.toLowerCase().trim())
  ]);

  // OP 1: TÉCNICA DEL DISTRACTOR FINO / MUTACIONES SINTÁCTICAS Y SEMÁNTICAS DEL PROPIO HECHO (MÁXIMO RIGOR)
  const mutations = [];
  const text = correctOpt;

  // Mutación de cifras y plazos dentro de la misma frase
  const numMatch = text.match(/\b(\d+)\b/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (n > 0 && n < 100) {
      mutations.push(text.replace(/\b\d+\b/, (n * 2).toString()));
      mutations.push(text.replace(/\b\d+\b/, (Math.max(1, Math.floor(n / 2))).toString()));
      mutations.push(text.replace(/\b\d+\b/, (n + 2).toString()));
      mutations.push(text.replace(/\b\d+\b/, (n + 5).toString()));
    }
  }

  // Mutaciones de canales, modalidades o permisos
  if (/fama|catálogo|online|electrónico|telemático/i.test(text)) {
    mutations.push(text.replace(/fama|catálogo|online|electrónico|telemático/gi, 'únicamente de forma presencial en el mostrador de la biblioteca'));
  }
  if (/presencial|mostrador/i.test(text)) {
    mutations.push(text.replace(/presencial|mostrador/gi, 'exclusivamente a través del catálogo automatizado FAMA'));
  }
  if (/rector/i.test(text)) {
    mutations.push(text.replace(/rector/gi, 'Consejo de Gobierno'));
    mutations.push(text.replace(/rector/gi, 'Gerente'));
  }
  if (/consejo de gobierno/i.test(text)) {
    mutations.push(text.replace(/consejo de gobierno/gi, 'Rector/a'));
    mutations.push(text.replace(/consejo de gobierno/gi, 'Consejo Social'));
  }
  if (/gerente/i.test(text)) {
    mutations.push(text.replace(/gerente/gi, 'Vicerrector/a competente'));
  }
  if (/gratuito/i.test(text)) {
    mutations.push(text.replace(/gratuito/gi, 'sujeto a precio público'));
  }
  if (/se pueden|se podrá|permite/i.test(text)) {
    mutations.push(text.replace(/se pueden|se podrá|permite/gi, 'no se autorizan ni se permiten'));
  }
  if (/docencia|investigación|aprendizaje/i.test(text)) {
    mutations.push(text.replace(/docencia/gi, 'gestión de recursos').replace(/investigación/gi, 'transferencia tecnológica'));
    mutations.push(text.replace(/docencia y al aprendizaje/gi, 'extensión universitaria y servicios culturales'));
  }
  if (/principio organizativo|unidad funcional|patrimonio/i.test(text)) {
    mutations.push(text.replace(/principio organizativo|unidad funcional/gi, 'modelo descentralizado por facultades independientes'));
    mutations.push(text.replace(/dicta que todo|pertenece a/gi, 'establece que cada centro gestiona de forma autónoma'));
  }

  mutations.forEach(m => {
    const cand = safeTruncateText(m, 250);
    if (distractors.length < 3 && !used.has(cand.toLowerCase()) && isCoherent(cand) && cand.toLowerCase() !== correctOpt.toLowerCase()) {
      distractors.push(cand);
      used.add(cand.toLowerCase());
      globalBatchUsed.add(cand.toLowerCase());
    }
  });

  // Mutaciones estructurales universales como respaldo de rigor si faltan distractores
  if (distractors.length < 3) {
    const fallbackMutations = [
      text.replace(/\b(el|la|los|las|un|una)\b/i, 'ningún').replace(/\b(es|son|corresponde)\b/i, 'no es'),
      text.replace(/\b(todas|todos|cada|cualquier)\b/i, 'únicamente las'),
      text.replace(/\b(única|integrada|oficial)\b/i, 'autónoma y descentralizada')
    ];
    fallbackMutations.forEach(fm => {
      const cand = safeTruncateText(fm, 250);
      if (distractors.length < 3 && !used.has(cand.toLowerCase()) && isCoherent(cand) && cand.toLowerCase() !== correctOpt.toLowerCase()) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
        globalBatchUsed.add(cand.toLowerCase());
      }
    });
  }

  // OP 2: Definiciones del MISMO subdominio exacto con paridad de longitud
  if (distractors.length < 3) {
    const sameSubdomainPairs = allConceptPairs
      .filter(cp => {
        const cpSub = getSectionSubdomain(cp.heading, cp.definition);
        const cpSem = getSemanticType(cp.definition);
        const def = cp.definition.toLowerCase().trim();
        const lenDiff = Math.abs(cp.definition.length - targetLength);
        return !used.has(def) && isCoherent(cp.definition) && cpSub === targetSubdomain && cpSem === targetSemanticType && (targetLength < 30 || lenDiff < targetLength * 0.4);
      })
      .sort(() => 0.5 - Math.random());

    sameSubdomainPairs.forEach(cp => {
      const cand = safeTruncateText(cp.definition, 220);
      if (distractors.length < 3 && !used.has(cand.toLowerCase()) && isCoherent(cand)) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
        globalBatchUsed.add(cand.toLowerCase());
      }
    });
  }

  // OP 3: Párrafos limpios de la MISMA sección exacta
  if (distractors.length < 3) {
    const sameSubdomainParas = allCleanParas
      .filter(p => {
        const pSub = getSectionSubdomain('', p);
        const pSem = getSemanticType(p);
        const pClean = p.trim();
        const lenDiff = Math.abs(pClean.length - targetLength);
        return pClean.length > 20 && !isMarketingOrHTML(pClean) && isCoherent(pClean) && pSub === targetSubdomain && pSem === targetSemanticType && (targetLength < 30 || lenDiff < targetLength * 0.4);
      })
      .sort(() => 0.5 - Math.random());

    sameSubdomainParas.forEach(p => {
      const cand = safeTruncateText(p, 220);
      if (distractors.length < 3 && !used.has(cand.toLowerCase()) && isCoherent(cand)) {
        distractors.push(cand);
        used.add(cand.toLowerCase());
        globalBatchUsed.add(cand.toLowerCase());
      }
    });
  }

  return distractors.slice(0, 3);
}

/**
 * Genera preguntas inéditas CON TRAMPAS DE COMPLEMENTO PROBABILÍSTICAS (50% DE VECES EN PLAZOS)
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  const generated = [];
  const globalBatchUsed = new Set();
  const allSections = parseSectionsFromMarkdown(markdownText);

  // Extraer todos los párrafos limpios del tema
  const allCleanParas = [];
  const allConceptPairs = [];

  allSections.forEach(sec => {
    sec.paragraphs.forEach(para => {
      if (!isMarketingOrHTML(para)) {
        allCleanParas.push(para);
        const parts = para.split(/[:–-]/);
        if (parts.length >= 2) {
          const rawConcept = parts[0].trim();
          if (isValidConcept(rawConcept)) {
            allConceptPairs.push({
              concept: cleanHeadingTitle(rawConcept),
              definition: parts.slice(1).join(' ').trim(),
              heading: cleanHeadingTitle(sec.title)
            });
          }
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
    const normName = getOfficialNormName(topicId, topicTitle, heading, factText);

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
    // PATRÓN 2: FECHAS Y PLAZOS (Literalidad estricta)
    else if (daysMatch) {
      const num = daysMatch[1];
      const numVal = parseInt(num, 10);
      const cleanSentence = cleanStemExcerpt(factText.split('.')[0]);
      
      const hasNatural = /natural/i.test(factText);
      const hasHabil = /hábiles|habil/i.test(factText);
      
      let baseWord = numVal === 1 ? 'día' : 'días';
      let correctUnit = baseWord;
      
      if (hasNatural) {
        correctUnit = `${baseWord} naturales`;
      } else if (hasHabil) {
        correctUnit = `${baseWord} hábiles`;
      }

      const qText = `Según lo establecido en ${normName}, respecto a "${cleanSentence.substring(0, 45)}", ¿cuál es el plazo legalmente establecido?`;
      const correctOpt = `${num} ${correctUnit}`;
      
      let wrong1, wrong2, wrong3;
      
      if (hasNatural || hasHabil) {
        const oppositeUnit = hasNatural ? `${baseWord} hábiles` : `${baseWord} naturales`;
        wrong1 = `${num} ${oppositeUnit}`; // Trampa de complemento
        wrong2 = `${numVal * 2} ${correctUnit}`;
        wrong3 = `${numVal * 2} ${oppositeUnit}`;
      } else {
        wrong1 = `${numVal * 2} ${correctUnit}`;
        wrong2 = `${Math.max(1, Math.floor(numVal / 2))} ${correctUnit}`;
        wrong3 = `${numVal + 5} ${correctUnit}`;
      }

      const options = [correctOpt, wrong1, wrong2, wrong3];
      newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
    } 
    // PATRÓN 3: CONCEPTOS Y DEFINICIONES LEGALES / TÉCNICAS
    else if (factText.length > 25) {
      const parts = factText.split(/[:–-]/);
      if (parts.length >= 2 && isValidConcept(parts[0])) {
        const concept = cleanHeadingTitle(parts[0]);
        const definition = sanitizeText(parts.slice(1).join(' '));
        
        if (definition.length > 15 && !definition.toLowerCase().startsWith(concept.toLowerCase().substring(0, 15))) {
          const qText = buildExamQuestionStem(normName, concept, heading, idx);
          const correctOpt = safeTruncateText(definition, 115);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas, globalBatchUsed);
          const options = [correctOpt, ...wrongDistractors];
          
          newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
        }
      } else {
        const sentence = sanitizeText(factText.split('.')[0]);
        if (sentence.length > 30) {
          const qText = buildExamQuestionStem(normName, heading, heading, idx);
          const correctOpt = safeTruncateText(sentence, 120);
          
          const wrongDistractors = generateContextualDistractors(factText, heading, correctOpt, topicId, allConceptPairs, allCleanParas, globalBatchUsed);
          const options = [correctOpt, ...wrongDistractors];
          
          newQ = createStructuredQuestion(qText, options, 0, sentence, heading, topicId);
        }
      }
    }

    if (newQ) {
      const correctOptClean = newQ.options[newQ.correctAnswer].replace(/^[A-D]\)\s*/, '');
      const isLeakingAnswer = hasAnswerLeak(newQ.question, correctOptClean);
      const dupCheck = checkDuplicated(newQ.question, topicId);
      const isAlreadyInBatch = generated.some(g => calculateSimilarity(g.question, newQ.question) > 0.6);
      const isValidBatchQ = hasCoherentOptions(newQ.options);

      if (!isLeakingAnswer && !dupCheck.isDuplicated && !isAlreadyInBatch && isValidBatchQ) {
        generated.push(newQ);
      }
    }
  }

  // Relleno de preguntas con fuentes oficiales y subdominios coherentes
  while (generated.length < count) {
    const fallbackNum = generated.length + 1;
    const targetSectionObj = targetSections[fallbackNum % targetSections.length] || { title: `Tema ${topicId}` };
    const sectionLabel = cleanHeadingTitle(targetSectionObj.title);
    const sampleFact = (targetSectionObj.paragraphs && targetSectionObj.paragraphs.length > 0)
      ? sanitizeText(targetSectionObj.paragraphs[fallbackNum % targetSectionObj.paragraphs.length])
      : `Regulación oficial sobre la materia`;

    const normName = getOfficialNormName(topicId, topicTitle, sectionLabel, sampleFact);
    const qText = buildExamQuestionStem(normName, cleanStemExcerpt(sectionLabel), sectionLabel, fallbackNum);
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
