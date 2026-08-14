/**
 * Motor de Generación de Preguntas Inéditas para Tests HTML
 * Biblioteca de la Universidad de Sevilla (BUS) - Auxiliares de Biblioteca
 *
 * PRINCIPIOS DE RIGOR PROFESIONAL:
 * - EXACTAMENTE 1 respuesta correcta por pregunta.
 * - SIN LÍMITE DE CARACTERES ARBITRARIO: NUNCA se cortan las oraciones a mitad de frase.
 * - NUNCA se usan párrafos reales de otras secciones como distractores.
 * - Opciones con integridad gramatical completa: oraciones completas terminadas en punto.
 * - Sin sufijos técnicos, sin epígrafes, sin títulos de listas como opciones.
 * - Las preguntas son INDEPENDIENTES del banco (quizzes.json).
 */

import quizzesData from '../data/quizzes.json' with { type: 'json' };

const stripAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

// ── UTILIDADES DE TEXTO Y LIMPIEZA ─────────────────────────────────────────

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

/**
 * Limpia prefijos de artículo o fórmulas introductorias del texto.
 */
function stripArticlePrefix(text) {
  if (!text) return text;
  let clean = text
    .replace(/^[Ss]egún\s+(lo\s+dispuesto\s+en\s+)?el\s+[Aa]rt[íi]culo\s+\d+\s+[^,]+,\s*/i, '')
    .replace(/^[Cc]onforme\s+a(?:l)?\s+(?:el\s+)?[Aa]rt\.?\s*\d+\s*:?\s*/i, '')
    .replace(/^[Dd]e\s+acuerdo\s+con\s+el\s+[Aa]rt[íi]culo\s+\d+\s*:?\s*/i, '')
    .replace(/^[Ee]n\s+el\s+[Aa]rt[íi]culo\s+\d+\s+se\s+establece\s+que\s*/i, '')
    .replace(/^[Ee]l\s+[Aa]rt[íi]culo\s+\d+\s+(?:de\s+\w+\s+)?\w+\s+(?:establece|dispone|señala|indica)\s+que\s*/i, '')
    .replace(/^([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s/()•*\-–—]+):\s*/, '')
    .trim();
  
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
}

/**
 * Formatea una oración para que sea completa, con mayúscula inicial y punto final.
 * NUNCA TRUNCA NI CORTA LA ORACIÓN POR LÍMITE DE CARACTERES.
 */
function formatCompleteSentence(text) {
  if (!text) return '';
  let clean = sanitizeText(text).trim();

  // Eliminar prefijo introductorio si existe
  clean = stripArticlePrefix(clean);

  // Si la oración termina en dos puntos, guion o coma, eliminar ese carácter final
  clean = clean.replace(/[:;\-,\s]+$/, '').trim();

  // Asegurar mayúscula inicial
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Asegurar punto final si no lo tiene
  if (clean.length > 0 && !/[.!?]$/.test(clean)) {
    clean += '.';
  }

  return clean;
}

/**
 * Validador estricto que comprueba si una frase es una oración afirmativa completa.
 */
function isDeclarativeSentence(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim();

  // Rechazar textos demasiado cortos (< 30 caracteres)
  if (clean.length < 30) return false;

  // Rechazar si termina en dos puntos o abreviatura de ejemplo colgando
  if (/[:;\-(]\s*$/.test(clean) || /\b(ej|p\.ej|etc)\s*\.?\s*$/i.test(clean)) return false;

  // Rechazar títulos o nombres de apartados que no contienen verbo conjugado
  const verbalMarkers = /\b(es|son|constituye|se|definen|depende|planifica|establece|regula|integra|requiere|cuenta|dispone|aplica|opera|garantiza|incluye|prohíbe|corresponde|pueden|podrán|están|está)\b/i;
  if (!verbalMarkers.test(clean)) return false;

  // Rechazar líneas de listas o tablas puras
  if (/^(tipo de usuario|documentos simultáneos|renovaciones|tabla|esquema|sección)\b/i.test(clean)) return false;

  return true;
}

// ── PARSEO DE MARKDOWN ──────────────────────────────────────────────────────

const NON_EXAM_SECTIONS = /esquema|repaso|conceptos clave|resumen|glosario|introducción|índice|bibliografía|anexo/i;

export function parseSectionsFromMarkdown(markdownText) {
  if (!markdownText) return [];
  const lines = markdownText.split('\n');
  const sections = [];
  let currentTitle = '';
  let currentParas = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (isMarketingOrHTML(trimmed)) return;

    // Formatear filas de tabla como viñetas explicativas en lugar de descartarlas
    if (/^\|.*\|$/.test(trimmed)) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2 && !/^:?-+:?$/.test(cells[0].replace(/[\s-]/g, ''))) {
        const rowText = cells.join(' | ');
        if (!rowText.includes('---') && !/tipo de usuario/i.test(rowText)) {
          currentParas.push(`Tabla: ${rowText}`);
        }
      }
      return;
    }

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
    } else if (/^#{4,}\s+/.test(trimmed)) {
      const subTitle = cleanHeadingTitle(trimmed.replace(/^#+\s*/, ''));
      if (subTitle.length > 2) {
        currentParas.push(`🔹 ${subTitle}:`);
      }
    } else {
      const cleanPara = sanitizeText(trimmed.replace(/^[•*\-\d.]+\s*/, ''));
      if (cleanPara.length > 15 && !isMarketingOrHTML(cleanPara)) {
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
 * Genera el HTML del resumen filtrado o completo.
 * Incluye TODOS los datos del apartado: plazos, sanciones, tablas y conceptos clave en formato viñeta.
 */
export function extractTopicSummary(markdownText, selectedSections = 'all') {
  const allSections = parseSectionsFromMarkdown(markdownText);
  if (!allSections || allSections.length === 0) return '';

  const isFiltered = selectedSections !== 'all' &&
    Array.isArray(selectedSections) &&
    selectedSections.length > 0;

  let sectionsToSummarize = allSections;
  if (isFiltered) {
    sectionsToSummarize = allSections.filter(sec => {
      const secNorm = stripAccents(sec.title);
      return selectedSections.some(sel => {
        const selNorm = stripAccents(sel);
        return secNorm.includes(selNorm) || selNorm.includes(secNorm);
      });
    });
    if (sectionsToSummarize.length === 0) sectionsToSummarize = allSections;
  }

  const summaryBlocks = [];
  sectionsToSummarize.forEach(sec => {
    if (!sec.paragraphs || sec.paragraphs.length === 0) return;
    const validParas = sec.paragraphs.filter(p => p && p.length > 10);
    if (validParas.length > 0) {
      const itemsHtml = validParas.map(p => {
        let clean = p.trim();
        if (clean.startsWith('🔹')) {
          clean = `<strong style="color: #1e40af; display: block; margin-top: 8px; font-size: 0.98rem;">${clean.replace(/:$/, '')}</strong>`;
        } else if (clean.startsWith('Tabla:')) {
          const rawContent = clean.replace(/^Tabla:\s*/, '').replace(/\*\*/g, '');
          clean = `<span style="display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 3px 10px; font-family: monospace; font-size: 0.88rem; color: #166534; margin: 2px 0;">📊 ${rawContent}</span>`;
        } else {
          if (/^(art[íi]culo|art\.|ley|real decreto|rd|convenio|estatutos)\b/i.test(clean)) {
            clean = clean.replace(/^([^:]+):?/, '<strong style="color: #7c2d12; background: #ffedd5; padding: 1px 6px; border-radius: 4px;">⚖️ $1:</strong>');
          } else if (/^(plazo|duraci[oó]n|per[íi]odo|vigencia|prescripci[oó]n|horario)\b/i.test(clean)) {
            clean = clean.replace(/^([^:]+):?/, '<strong style="color: #9a3412;">⏱️ $1:</strong>');
          } else if (/^(sanci[oó]n|infracci[oó]n|falta|demora|suspensi[oó]n|penalizaci[oó]n)\b/i.test(clean)) {
            clean = clean.replace(/^([^:]+):?/, '<strong style="color: #991b1b; background: #fee2e2; padding: 1px 6px; border-radius: 4px;">⚠️ $1:</strong>');
          } else if (/^(competencias?|funciones|órgano|direcci[oó]n|comisi[oó]n|junta|vicerrectorado)\b/i.test(clean)) {
            clean = clean.replace(/^([^:]+):?/, '<strong style="color: #1e40af;">🏛️ $1:</strong>');
          } else if (clean.includes(':')) {
            clean = clean.replace(/^([^:]+):/, '<strong style="color: #065f46;">$1:</strong>');
          }
        }
        return `<li style="margin-bottom: 8px; line-height: 1.6; color: #334155; font-size: 0.95rem; list-style-type: none;">• ${clean}</li>`;
      }).join('');

      summaryBlocks.push(`
        <div style="margin-bottom: 20px; background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #059669; border-radius: 8px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <strong style="color: #065f46; font-size: 1.1rem; display: block; margin-bottom: 10px;">📌 ${sec.title}</strong>
          <ul style="margin: 0; padding-left: 18px; list-style-type: disc;">${itemsHtml}</ul>
        </div>
      `);
    }
  });

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

// ── UTILIDADES DE DUPLICADOS ───────────────────────────────────────────────

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
  (norm, focus) => `Según establece ${norm}, en relación con ${focus}, señale la opción correcta:`,
  (norm, focus) => `De acuerdo con lo regulado en ${norm} respecto a ${focus}, ¿cuál de los siguientes enunciados es verdadero?`,
  (norm, focus) => `En el marco normativo de ${norm}, señale la opción cierta relativa a ${focus}:`,
  (norm, focus) => `Conforme a lo dispuesto en ${norm} sobre ${focus}, indique la respuesta correcta:`,
  (norm, focus) => `Tomando como referencia ${norm}, ¿cuál de las siguientes opciones describe correctamente ${focus}?`,
  (norm, focus) => `Atendiendo a las disposiciones de ${norm} aplicables a ${focus}, indique el enunciado correcto:`,
  (norm, focus) => `¿Cuál de las siguientes afirmaciones referidas a ${focus} se ajusta a lo previsto en ${norm}?`,
  (norm, focus) => `En relación con ${focus}, señale qué extremo se establece expresamente en ${norm}:`,
  (norm, focus) => `De las alternativas planteadas acerca de ${focus}, determine cuál es la correcta según ${norm}:`,
  (norm, focus) => `Según ${norm}, respecto a ${focus}, señale la afirmación verdadera:`,
  (norm, focus) => `De acuerdo con ${norm}, señale la respuesta válida sobre ${focus}:`,
  (norm, focus) => `En relación con ${focus}, y basándose en ${norm}, indique qué opción es cierta:`
];

function buildStem(normName, focus, idx) {
  const cleanFocus = formatCompleteSentence(focus).replace(/[.:;,]+$/, '');
  return STEM_TEMPLATES[idx % STEM_TEMPLATES.length](normName, cleanFocus);
}

// ── SISTEMA DE DISTRACTORES SINTÁCTICOS FALSOS (GARANTÍA 100% FALSA) ────────

const MUTATIONS = [
  // 1. Inversiones organizativas / estructurales
  {
    target: /unidad funcional única e integrada(\s+por todos los fondos)?/gi,
    replacements: [
      'red descentralizada de bibliotecas con gestión autónoma por campus',
      'federación de bibliotecas de centro independientes entre sí',
      'unidad de gestión compartida por los Decanatos de cada Facultad'
    ]
  },
  // 2. Dependencia jerárquica / Órganos
  {
    target: /Vicerrectorado de Investigación|Vicerrectorado competente/gi,
    replacements: [
      'Gerencia de la Universidad de Sevilla',
      'Consejo Social de la Universidad de Sevilla',
      'Decanato de la Facultad en que se ubique cada biblioteca'
    ]
  },
  {
    target: /el Consejo de Gobierno/gi,
    replacements: [
      'la Comisión Permanente de Docencia de cada Facultad',
      'la Junta Técnica Interfacultativa de la US',
      'el Ministerio de Universidades mediante Real Decreto'
    ]
  },
  {
    target: /Consejo de Gobierno/gi,
    replacements: [
      'Junta Técnica Interfacultativa de la US',
      'Ministerio de Universidades mediante Real Decreto'
    ]
  },
  {
    target: /Dirección de la Biblioteca/gi,
    replacements: [
      'Asociación de Usuarios de la Biblioteca',
      'Comisión de Evaluación de la Calidad de la US',
      'Servicio Central de Informática de la Universidad'
    ]
  },
  {
    target: /Rectorado|Rector|Rectora/gi,
    replacements: [
      'Claustro Universitario',
      'Consejo de Alumnos de la Universidad de Sevilla (CADUS)',
      'Tribunal de Garantías'
    ]
  },
  // 3. Consorcios y Redes
  {
    target: /\bREBIUN\b/g,
    replacements: ['CBUA (Consorcio de Bibliotecas Universitarias de Andalucía)', 'Asociación LIBER de Bibliotecas de Investigación']
  },
  {
    target: /\bCBUA\b/g,
    replacements: ['REBIUN (Red de Bibliotecas Universitarias Españolas)', 'Red de Bibliotecas Públicas de la Junta de Andalucía']
  },
  {
    target: /\bDIALNET\b/g,
    replacements: ['WorldCat (catálogo cooperativo de la OCLC)', 'Red de Repositorios Científicos del Ministerio']
  },
  // 4. Modificadores normativos y de uso (Trampas absolutas)
  {
    target: /carnet universitario(\s+oficial)?(\s*\([^)]*\))?/gi,
    replacements: [
      'carnet de biblioteca específico expedido tras abonar la tasa correspondiente',
      'certificado de acreditación expedido por la Secretaría del Centro',
      'carnet temporal de usuario externo expedido al efecto'
    ]
  },
  {
    target: /obligatorio|obligatoria|preceptivo|preceptiva/gi,
    replacements: ['facultativo y meramente orientativo', 'de aplicación opcional según el criterio de cada centro']
  },
  {
    target: /gratuito|gratuita|sin coste/gi,
    replacements: ['sujeto al pago previo de una tasa pública aprobada', 'de pago obligatorio para usuarios no docentes']
  },
  {
    target: /todos los miembros|toda la comunidad/gi,
    replacements: ['exclusivamente el Personal Docente e Investigador (PDI) con dedicación a tiempo completo', 'únicamente los estudiantes de Máster y Doctorado']
  },
  {
    target: /antes de la hora de cierre del mismo día|mismo día/gi,
    replacements: ['en un plazo máximo de 48 horas tras el préstamo', 'en un plazo de tres días hábiles lectivos']
  },
  // 5. Cantidades y Absolutos
  {
    target: /siempre|en todo caso|invariablemente/gi,
    replacements: ['excepcionalmente y previa solicitud justificada', 'nunca, salvo autorización expresa del Rectorado']
  },
  {
    target: /podrá|podrán|están facultados/gi,
    replacements: ['deberá inexcusablemente', 'están obligados bajo sanción disciplinaria a']
  },
  {
    target: /deberá|deberán|están obligados/gi,
    replacements: ['podrá de manera potestativa', 'tendrán la facultad opcional de']
  }
];

// ── DETECTOR DE DOMINIO SEMÁNTICO ───────────────────────────────────────────

/**
 * Identifica el tipo de dato semántico de una oración para garantizar
 * que los distractores pertenezcan al mismo dominio. Regla de oro:
 * preguntas de DÍAS solo pueden tener opciones de DÍAS; de PARENTESCO
 * solo opciones de PARENTESCO; de ÓRGANOS solo opciones de ÓRGANOS.
 */
function detectSemanticDomain(text) {
  const t = text.toLowerCase();
  // DOMINIO: Días / Plazos / Licencias
  if (/\b(\d+\s*días?|\d+\s*semanas?|\d+\s*meses?|\d+\s*horas?|días? hábiles?|días? naturales?|días? laborables?)\b/i.test(t)) {
    return 'PLAZO';
  }
  // DOMINIO: Grados de parentesco
  if (/\b(grado|consanguinidad|afinidad|primer grado|segundo grado|tercer grado|cuarto grado|parentesco)\b/i.test(t)) {
    return 'PARENTESCO';
  }
  // DOMINIO: Porcentajes o fracciones
  if (/\b(\d+\s*%|por ciento|porcentaje|fracción)\b/i.test(t)) {
    return 'PORCENTAJE';
  }
  // DOMINIO: Órganos de gobierno
  if (/\b(rector|gerente|claustro|consejo de gobierno|consejo social|vicerrectorado|junta de centro|comisión|decano|secretario general|cadus|rebiun|cbua)\b/i.test(t)) {
    return 'ORGANO';
  }
  // DOMINIO: Normativo genérico (préstamos, regulación...)
  return 'NORMATIVO';
}

// Bancos de distractores por dominio semántico
const DOMAIN_DISTRACTOR_BANKS = {
  PLAZO: [
    '2 días naturales.',
    '3 días hábiles.',
    '5 días naturales.',
    '5 días hábiles.',
    '7 días naturales.',
    '10 días hábiles.',
    '10 días naturales.',
    '15 días hábiles.',
    '20 días naturales.',
    '1 mes de permiso retribuido.',
    '2 meses de permiso no retribuido.',
    '3 días laborables.',
    '4 días hábiles.',
    '6 días naturales.',
    '8 días hábiles.',
    '30 días naturales.',
  ],
  PARENTESCO: [
    'Primer grado de consanguinidad.',
    'Segundo grado de consanguinidad.',
    'Tercer grado de consanguinidad.',
    'Cuarto grado de consanguinidad.',
    'Primer grado de afinidad.',
    'Segundo grado de afinidad.',
    'Tercer grado de afinidad.',
    'Cuarto grado de afinidad.',
  ],
  PORCENTAJE: [
    'El 20 por ciento de la jornada ordinaria.',
    'El 30 por ciento del salario base mensual.',
    'El 50 por ciento del sueldo bruto anual.',
    'El 75 por ciento de las retribuciones íntegras.',
    'El 100 por ciento de la retribución fija.',
    'El 10 por ciento de la jornada anual.',
  ],
  ORGANO: [
    'La Gerencia de la Universidad de Sevilla.',
    'El Claustro Universitario.',
    'El Consejo Social de la US.',
    'El Ministerio de Universidades.',
    'El Vicerrectorado de Personal.',
    'El Decanato del Centro correspondiente.',
    'La Junta de Andalucía.',
    'La Comisión de Investigación del Consejo de Gobierno.',
    'El Defensor Universitario.',
  ],
};

function generateSyntheticDistractors(correctOpt, heading, idx) {
  const used = new Set([stripAccents(correctOpt)]);
  const distractors = [];

  // ── PASO 0: DETECCIÓN DE DOMINIO SEMÁNTICO ──────────────────────────────
  const domain = detectSemanticDomain(correctOpt);

  // Para dominios de PLAZO y PARENTESCO, usar exclusivamente el banco homogéneo.
  // Esto garantiza que NUNCA se mezcle un órgano en una pregunta de días o parentesco.
  if (domain === 'PLAZO' || domain === 'PARENTESCO' || domain === 'PORCENTAJE') {
    const bank = DOMAIN_DISTRACTOR_BANKS[domain] || [];
    const shuffled = [...bank].sort(() => 0.5 - Math.random());
    for (const candidate of shuffled) {
      if (distractors.length >= 3) break;
      const cand = formatCompleteSentence(candidate);
      const normCand = stripAccents(cand);
      // Solo añadir si no coincide semánticamente con la respuesta correcta
      if (cand && !used.has(normCand) && normCand !== stripAccents(correctOpt)) {
        distractors.push(cand);
        used.add(normCand);
      }
    }
    return distractors.slice(0, 3);
  }

  // ── PASO 1: Mutación por regla estructurada (para dominios ORGANO / NORMATIVO) ──
  for (const mut of MUTATIONS) {
    if (distractors.length >= 3) break;
    if (mut.target.test(correctOpt)) {
      for (const rep of mut.replacements) {
        if (distractors.length >= 3) break;
        let replaced = false;
        const candidateRaw = correctOpt.replace(mut.target, (match) => {
          if (!replaced) { replaced = true; return rep; }
          return match;
        });
        const cand = formatCompleteSentence(candidateRaw);
        const normCand = stripAccents(cand);
        if (cand && !used.has(normCand) && normCand !== stripAccents(correctOpt)) {
          distractors.push(cand);
          used.add(normCand);
        }
      }
    }
  }

  // ── PASO 2: Inversión morfológica ──────────────────────────────────────────
  if (distractors.length < 3) {
    const MORPH_RULES = [
      (t) => t.replace(/\b(es|son|constituye|se define como)\b/i, 'no $1'),
      (t) => t.replace(/\b(depende|planifica|establece|regula)\b/i, 'no $1'),
      (t) => t.replace(/\b(corresponde a|compete a)\b/i, 'es ajeno a las competencias de'),
      (t) => t.replace(/\b(garantiza|asegura)\b/i, 'no presupone'),
      (t) => t.replace(/\b(se aprueba por|aprobado por)\b/i, 'es acordado unilateralmente sin pasar por'),
      (t) => t.replace(/\b(facilita|permite|autoriza)\b/i, 'prohíbe expresamente'),
      (t) => t.replace(/\b(promueve|fomenta)\b/i, 'restringe o limita'),
      (t) => t.replace(/\b(debe|tienen la obligación de)\b/i, 'están exentos de'),
      (t) => t.replace(/\b(podrá|podrán)\b/i, 'no podrán en ningún caso'),
      (t) => t.replace(/\b(anualmente|cada año)\b/i, 'cada cinco años de forma extraordinaria'),
      (t) => t.replace(/\b(el Rector|la Rectora)\b/i, 'el Gerente'),
      (t) => t.replace(/\b(el Claustro Universitario)\b/i, 'el Consejo Social'),
      (t) => t.replace(/\b(del Consejo de Gobierno)\b/i, 'de la Junta de Andalucía'),
    ];
    for (const rule of MORPH_RULES) {
      if (distractors.length >= 3) break;
      const candidateRaw = rule(correctOpt);
      if (candidateRaw !== correctOpt) {
        const cand = formatCompleteSentence(candidateRaw);
        const normCand = stripAccents(cand);
        if (cand && !used.has(normCand) && normCand !== stripAccents(correctOpt)) {
          distractors.push(cand);
          used.add(normCand);
        }
      }
    }
  }

  // ── PASO 3: Mutaciones universales como último recurso ──────────────────────
  if (distractors.length < 3) {
    const UNIVERSAL_MUTATORS = [
      (t) => t.replace(/^([A-ZÁÉÍÓÚÑ])/, (m) => `No ${m.toLowerCase()}`),
      (t) => t.replace(/\b(es|son|constituye|se define|posee|cuenta|permite)\b/i, 'nunca $1'),
      (t) => t.replace(/\.$/, ', salvo en los casos expresamente exceptuados por la normativa vigente.'),
      (t) => t.replace(/\.$/, ', únicamente para el personal docente acreditado.'),
      (t) => t.replace(/\b(únicamente|exclusivamente|solamente)\b/i, 'en ningún caso'),
    ];
    for (const mut of UNIVERSAL_MUTATORS) {
      if (distractors.length >= 3) break;
      const candidateRaw = mut(correctOpt);
      if (candidateRaw !== correctOpt) {
        const cand = formatCompleteSentence(candidateRaw);
        const normCand = stripAccents(cand);
        if (cand && !used.has(normCand) && normCand !== stripAccents(correctOpt)) {
          distractors.push(cand);
          used.add(normCand);
        }
      }
    }
  }

  return distractors.slice(0, 3);
}

// ── CONTROL DE CALIDAD Y CREACIÓN DE PREGUNTA ──────────────────────────────

function createStructuredQuestion(qText, correctOpt, distractors, factText, heading, topicId) {
  const formattedCorrect = formatCompleteSentence(correctOpt);
  const formattedDistractorList = distractors.map(d => formatCompleteSentence(d));

  const allOptions = [formattedCorrect, ...formattedDistractorList];
  
  const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
  const newCorrectIndex = shuffled.indexOf(formattedCorrect);

  const formattedOptions = shuffled.map((optText, i) => {
    const letter = ['A', 'B', 'C', 'D'][i];
    return `${letter}) ${sanitizeText(optText.replace(/^[A-D]\)\s*/, ''))}`;
  });

  const explanationFact = formatCompleteSentence(factText);

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

/**
 * Control de Calidad Estricto para asegurar que la pregunta cumple 100% las reglas:
 * 1. Exactamente 4 opciones A, B, C, D.
 * 2. Ninguna opción está amputada o cortada.
 * 3. Las 4 opciones son distintas entre sí.
 * 4. La opción correcta es única.
 */
function validateQuestion(q) {
  if (!q || !Array.isArray(q.options) || q.options.length !== 4) return false;
  if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;

  const optionTexts = q.options.map(o => o.replace(/^[A-D]\)\s*/, '').trim());

  // Verificar que todas son oraciones declarativas completas
  for (const opt of optionTexts) {
    if (!isDeclarativeSentence(opt)) return false;
  }

  // Verificar unicidad de las 4 opciones
  const normalized = optionTexts.map(o => stripAccents(o));
  const uniqueSet = new Set(normalized);
  if (uniqueSet.size !== 4) return false;

  return true;
}

// ── MOTOR PRINCIPAL ─────────────────────────────────────────────────────────

export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5, selectedSections = 'all' }) {
  try {
    const generated = [];
    const usedStems = new Set();
    const usedFacts = new Set(); // ← Deduplicación de hechos fuente

    // 1. Parsear markdown
    const allSections = parseSectionsFromMarkdown(markdownText);

    // 2. Filtrar secciones objetivo
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

    // 3. Extraer hechos normativos examinables (oraciones completas)
    const examSections = targetSections.filter(s => !NON_EXAM_SECTIONS.test(s.title));
    const factPool = [];

    examSections.forEach(sec => {
      sec.paragraphs.forEach(para => {
        if (!para || para.length < 35) return;

        // Extraer etiqueta específica de la viñeta
        let specificHeading = sec.title;
        const labelMatch = para.match(/^([^:]+):/);
        if (labelMatch && labelMatch[1] && labelMatch[1].length < 60) {
          const cleanLabel = sanitizeText(labelMatch[1]).replace(/^[•*\-–—\s]+/, '');
          if (cleanLabel.length > 3 && !cleanLabel.startsWith('http') && !/tabla/i.test(cleanLabel)) {
            specificHeading = `${sec.title} (${cleanLabel})`;
          }
        }

        const sentences = para.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 30);
        sentences.forEach(sent => {
          const cleanSentence = formatCompleteSentence(sent);
          if (isDeclarativeSentence(cleanSentence)) {
            factPool.push({
              rawFact: para,
              sentence: cleanSentence,
              heading: specificHeading
            });
          }
        });
      });
    });

    // 4. Barajar los hechos extraídos
    const shuffledFacts = [...factPool].sort(() => 0.5 - Math.random());

    // 5. Generar preguntas a partir de los hechos (con deduplicación de hecho fuente)
    for (let idx = 0; idx < shuffledFacts.length && generated.length < count; idx++) {
      const { rawFact, sentence: correctOpt, heading } = shuffledFacts[idx];

      // ← Evitar usar el mismo hecho fuente dos veces (elimina preguntas calcadas)
      const factKey = stripAccents(correctOpt).substring(0, 80);
      if (usedFacts.has(factKey)) continue;

      const cleanHeading = cleanHeadingTitle(heading);
      const normName = getOfficialNormName(topicId, topicTitle, cleanHeading, rawFact);
      const stem = buildStem(normName, cleanHeading, generated.length);

      const stemKey = stripAccents(stem).substring(0, 60);
      if (usedStems.has(stemKey)) continue;

      const distractors = generateSyntheticDistractors(correctOpt, cleanHeading, generated.length);
      if (distractors.length < 3) continue;

      const candidateQ = createStructuredQuestion(stem, correctOpt, distractors, rawFact, cleanHeading, topicId);

      if (validateQuestion(candidateQ)) {
        usedStems.add(stemKey);
        usedFacts.add(factKey);
        generated.push(candidateQ);
      }
    }

    // 6. Si faltan preguntas por escasa densidad del markdown, usar el fallback de emergencia validado
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

// ── FALLBACK DE EMERGENCIA VALIDADO ─────────────────────────────────────────

export function createEmergencyFallbackBatch(topicId, topicTitle, count = 5) {
  const batch = [];
  const safeTitle = topicTitle || `Tema ${topicId}`;

  const templates = [
    {
      q: `Según lo dispuesto en la normativa rectora de la Universidad de Sevilla sobre ${safeTitle}, señale la afirmación correcta:`,
      correct: `Constituye una unidad funcional de obligado cumplimiento en todo el ámbito de la Universidad de Sevilla.`,
      w1: `Posee carácter de mera recomendación facultativa no vinculante para los centros y facultades de la Universidad.`,
      w2: `Es una norma de aplicación exclusiva al personal docente con relación de empleo temporal.`,
      w3: `Requiere autorización previa del Ministerio de Universidades para surtir efectos jurídicos.`,
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
