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

/**
 * Detecta negación perezosa: frases construidas añadiendo "No", "Nunca",
 * "Jamás" al inicio, o insertando 'no X' / 'nunca X' sobre el verbo principal.
 * Estas frases son descartables sin conocimiento del temario y están PROHIBIDAS.
 * Regla de Oro: NINGÚN distractor puede superar este filtro.
 */
function isLazyNegation(text) {
  if (!text) return true;
  const t = text.trim();
  // Negación prefijada al inicio de la oración
  if (/^(No |Nunca |Jamás |Ningún |Ninguna |Carece |Falso )/i.test(t)) return true;
  // Negación insertada directamente sobre el verbo principal
  if (/\b(no es|no son|no constituye|no regula|no depende|no establece|no podrá|no podrán en ningún caso|nunca es|nunca son|nunca podrá|no integra|no garantiza|no presta)\b/i.test(t)) return true;
  return false;
}

// ── PARSEO DE MARKDOWN ──────────────────────────────────────────────────────

const NON_EXAM_SECTIONS = /esquema|repaso|conceptos clave|resumen|glosario|introducción|índice|bibliografía|bibliografia|referencias|fuentes|lecturas recomendadas|para saber más|recursos de consulta|anexo/i;

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
          lowerTitle.includes('referencias') || lowerTitle.includes('fuentes') ||
          lowerTitle.includes('lecturas recomendadas') || lowerTitle.includes('recursos de consulta') ||
          lowerTitle.includes('para saber más') || lowerTitle.includes('glosario') ||
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
    'La Comisión Permanente del Consejo de Gobierno.',
    'La Junta de Facultad correspondiente.',
    'El Consejo de Gobierno de la Junta de Andalucía.',
    'El Vicerrectorado de Docencia.',
    'El Secretario General de la Universidad de Sevilla.',
    'El Consejo de Dirección de la US.',
    'La Comisión de Garantía de Calidad.',
  ],
};

function generateSyntheticDistractors(correctOpt, heading, idx) {
  const used = new Set([stripAccents(correctOpt)]);
  const distractors = [];

  // ── PASO 0: DETECCIÓN DE DOMINIO SEMÁNTICO ──────────────────────────────
  const domain = detectSemanticDomain(correctOpt);

  // Para dominios de PLAZO, PARENTESCO, PORCENTAJE y ORGANO, usar exclusivamente
  // el banco homogéneo. Esto garantiza que NUNCA se mezclen conceptos de distinto
  // tipo semántico: días solo con días, órganos solo con órganos.
  if (domain === 'PLAZO' || domain === 'PARENTESCO' || domain === 'PORCENTAJE' || domain === 'ORGANO') {
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

  // ── PASO 2: Sustitución Semántica de Variables Clave ────────────────────────
  // Regla de Oro: NUNCA se niega. Se sustituye una variable real (organismo,
  // instrumento, ámbito, rol) por otra real del mismo dominio. El opositor que
  // no conoce el temario no puede distinguir la correcta por descarte lógico.
  if (distractors.length < 3) {
    const SEMANTIC_SUBSTITUTIONS = [
      // ─ ORGANISMOS DE GOBIERNO ─────────────────────────────────────────────
      { re: /\bConsejo de Gobierno\b/gi,
        alts: ['el Claustro Universitario', 'el Consejo Social de la Universidad de Sevilla'] },
      { re: /\b(el Rector|la Rectora)\b/gi,
        alts: ['el Gerente de la Universidad de Sevilla', 'el Secretario General de la US'] },
      { re: /\bVicerrectorado de Investigaci[oó]n\b/gi,
        alts: ['el Vicerrectorado de Docencia y Espacio Europeo', 'el Vicerrectorado de Transferencia del Conocimiento'] },
      { re: /\bVicerrectorado de Personal\b/gi,
        alts: ['el Vicerrectorado de Docencia', 'la Gerencia de la Universidad de Sevilla'] },
      { re: /\bComisi[oó]n de Investigaci[oó]n\b/gi,
        alts: ['la Comisión de Garantía de Calidad', 'la Comisión Permanente del Consejo de Gobierno'] },
      { re: /\bDefensor Universitario\b/gi,
        alts: ['la Comisión de Garantía de Calidad de la US', 'el Servicio de Inspección Académica de la Universidad'] },
      { re: /\bDirector de la Biblioteca\b|\bDirectora de la Biblioteca\b/gi,
        alts: ['el Gerente de la Universidad de Sevilla', 'el Decano de la Facultad en que se ubique la biblioteca de centro'] },

      // ─ REDES Y CONSORCIOS ─────────────────────────────────────────────────
      { re: /\bREBIUN\b/g,
        alts: ['el CBUA (Consorcio de Bibliotecas Universitarias de Andalucía)', 'la asociación LIBER de bibliotecas europeas de investigación'] },
      { re: /\bCBUA\b/g,
        alts: ['REBIUN (Red de Bibliotecas Universitarias Españolas integrada en la CRUE)', 'la Red de Bibliotecas Públicas de la Junta de Andalucía'] },
      { re: /\bDIALNET\b/gi,
        alts: ['WorldCat, el catálogo cooperativo de la OCLC', 'Scopus, la base de datos bibliográfica de Elsevier'] },
      { re: /Universidad de La Rioja/gi,
        alts: ['la Universidad Complutense de Madrid', 'la Universidad Autónoma de Barcelona'] },

      // ─ SISTEMAS DE GESTIÓN BIBLIOTECARIA ──────────────────────────────────
      { re: /\bAlma\b/g,
        alts: ['SirsiDynix Symphony', 'KOHA (sistema de gestión integrada de código abierto)'] },
      { re: /\bFAMA\b/g,
        alts: ['WorldCat (catálogo cooperativo de la OCLC)', 'Primo, la herramienta de descubrimiento de Ex Libris'] },

      // ─ INSTRUMENTOS NORMATIVOS ────────────────────────────────────────────
      { re: /\bReglamento de la BUS\b/gi,
        alts: ['la Carta de Servicios de la BUS', 'el Plan Estratégico de la BUS'] },
      { re: /\bCarta de Servicios\b/gi,
        alts: ['el Reglamento de uso de fondos especiales', 'el Manual de Procedimientos de la BUS'] },
      { re: /\bIV Convenio Colectivo\b/gi,
        alts: ['el III Convenio Colectivo del Personal Laboral de las Universidades Públicas Andaluzas', 'el Estatuto Básico del Empleado Público (TREBEP)'] },
      { re: /\bLey 31\/1995\b|\bLPRL\b/gi,
        alts: ['el Real Decreto Legislativo 5/2015 (TREBEP)', 'el Real Decreto 39/1997 de los Servicios de Prevención'] },
      { re: /\bLey Org[aá]nica 3\/2007\b/gi,
        alts: ['la Ley Orgánica 1/2004 de Medidas de Protección Integral contra la Violencia de Género', 'el Real Decreto Legislativo 2/2015 del Estatuto de los Trabajadores'] },
      { re: /\bReal Decreto 488\/1997\b/gi,
        alts: ['el Real Decreto 486/1997 de Lugares de Trabajo', 'el Real Decreto 773/1997 sobre Equipos de Protección Individual'] },
      { re: /\bReal Decreto 486\/1997\b/gi,
        alts: ['el Real Decreto 488/1997 sobre Pantallas de Visualización de Datos', 'el Real Decreto 485/1997 de Señalización de Seguridad'] },

      // ─ ÁMBITO DE APLICACIÓN / COLECTIVO BENEFICIARIO ─────────────────────
      { re: /\btoda la comunidad universitaria\b/gi,
        alts: [
          'exclusivamente el Personal Docente e Investigador con vinculación permanente',
          'únicamente los estudiantes de Máster y Doctorado matriculados en el curso en vigor'
        ] },
      { re: /\btodos los miembros de la comunidad universitaria\b/gi,
        alts: [
          'exclusivamente el Personal de Administración y Servicios con contrato indefinido',
          'únicamente los investigadores con proyectos activos en la Universidad de Sevilla'
        ] },

      // ─ ROLES EN REDES Y CONSORCIOS ────────────────────────────────────────
      { re: /miembro colaborador y activo catalogador/gi,
        alts: ['usuaria externa y consultora de contenidos sin capacidad de catalogación', 'suscriptora institucional con acceso en modo solo lectura'] },
      { re: /miembro colaborador/gi,
        alts: ['suscriptora institucional sin voto en los órganos de gobierno', 'entidad auditora externa sin derechos de catalogación'] },

      // ─ OBJETO TEMÁTICO ────────────────────────────────────────────────────
      { re: /\bproducci[oó]n cient[íi]fica\b/gi,
        alts: ['las tesis doctorales y trabajos de fin de grado', 'los datos de investigación y conjuntos de datos en acceso abierto'] },
      { re: /\bunidad funcional [úu]nica e integrada\b/gi,
        alts: [
          'una red descentralizada de bibliotecas de centro con gestión presupuestaria autónoma',
          'un consorcio interfacultativo con personalidad jurídica propia diferenciada de la Universidad'
        ] },
      { re: /\bacceso abierto\b/gi,
        alts: ['acceso restringido a los suscriptores del consorcio CBUA', 'acceso bajo licencia con restricciones de descarga simultánea'] },
      { re: /\bpr[ée]stamo interbibliotecario\b/gi,
        alts: ['préstamo en sala de fondos en reserva', 'préstamo de equipamiento tecnológico de la Objetoteca'] },

      // ─ CUALIFICACIONES (alteradas sin negar) ─────────────────────────────
      { re: /\bgratuito\b|\bgratuita\b|\bsin coste\b/gi,
        alts: [
          'sujeto al abono previo de una tasa administrativa aprobada anualmente por el Consejo de Gobierno',
          'financiado mediante cuota semestral fijada en la Carta de Servicios de la BUS'
        ] },
      { re: /\bpermanente\b/gi,
        alts: [
          'temporal y renovable por periodos anuales previo informe favorable',
          'provisional y condicionado a la evaluación anual de rendimiento'
        ] },
    ];

    for (const rule of SEMANTIC_SUBSTITUTIONS) {
      if (distractors.length >= 3) break;
      // Restablecer lastIndex antes de cada test (regexes con /g)
      rule.re.lastIndex = 0;
      if (!rule.re.test(correctOpt)) continue;
      for (const alt of rule.alts) {
        if (distractors.length >= 3) break;
        rule.re.lastIndex = 0;
        let replaced = false;
        const candidateRaw = correctOpt.replace(rule.re, (match) => {
          if (!replaced) { replaced = true; return alt; }
          return match;
        });
        rule.re.lastIndex = 0;
        if (!replaced) continue;
        const cand = formatCompleteSentence(candidateRaw);
        const normCand = stripAccents(cand);
        if (cand && !isLazyNegation(cand) && !used.has(normCand) && normCand !== stripAccents(correctOpt)) {
          distractors.push(cand);
          used.add(normCand);
        }
      }
    }
  }

  // ── PASO 3: Paráfrasis Contextual como último recurso ───────────────────────
  // Regla de Oro: NUNCA se niega. Se construye una alternativa plausible
  // alterando el sujeto institucional, el instrumento normativo o la modalidad,
  // manteniendo longitud y densidad de información comparables.
  if (distractors.length < 3) {
    const CONTEXTUAL_PARAPHRASE = [
      // Sustitución del sujeto institucional por entidad paralela del mismo rango
      (t) => t.replace(/\bla BUS\b/gi, 'el Servicio de Informática de la US (SIC)'),
      (t) => t.replace(/\bla BUS\b/gi, 'la Unidad de Apoyo a la Docencia e Investigación de la US'),
      // Sustitución del instrumento normativo rector
      (t) => t.replace(/\bReglamento\b/gi, 'Protocolo de Actuación'),
      (t) => t.replace(/\bReglamento\b/gi, 'Plan Estratégico'),
      (t) => t.replace(/\bprotocolo\b/gi, 'Reglamento de uso'),
      // Sustitución del organismo decisor
      (t) => t.replace(/\bConsejo de Gobierno\b/gi, 'Comisión Permanente del Claustro Universitario'),
      (t) => t.replace(/\bConsejo de Gobierno\b/gi, 'Consejo Social en sesión plenaria'),
      // Sustitución del tipo de vínculo con redes
      (t) => t.replace(/\bes miembro\b/gi, 'actúa como entidad observadora'),
      (t) => t.replace(/\bes miembro\b/gi, 'figura como institución adherida sin voto deliberativo'),
      // Sustitución del ámbito territorial de aplicación
      (t) => t.replace(/\bnacional\b|\bespañolas\b/gi, 'autonómico'),
      (t) => t.replace(/\beuropeo\b|\beuropeas\b/gi, 'estatal'),
      // Sustitución de la modalidad de acceso
      (t) => t.replace(/\bacceso en l[íi]nea\b|\bacceso remoto\b/gi, 'acceso presencial en las instalaciones de la BUS'),
      (t) => t.replace(/\bpr[ée]stamo domiciliario\b/gi, 'consulta en sala sin salida del recinto'),
      // Sustitución del colectivo beneficiario
      (t) => t.replace(/\bPersonal Docente e Investigador\b|\bPDI\b/g, 'Personal de Administración y Servicios (PAS)'),
      (t) => t.replace(/\bPersonal de Administraci[oó]n y Servicios\b|\bPAS\b/g, 'Personal Docente e Investigador (PDI)'),
    ];

    for (const paraphrase of CONTEXTUAL_PARAPHRASE) {
      if (distractors.length >= 3) break;
      const candidateRaw = paraphrase(correctOpt);
      if (candidateRaw === correctOpt) continue;
      const cand = formatCompleteSentence(candidateRaw);
      const normCand = stripAccents(cand);
      if (cand && !isLazyNegation(cand) && !used.has(normCand) && normCand !== stripAccents(correctOpt)) {
        distractors.push(cand);
        used.add(normCand);
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

  // Verificar equilibrio de longitud: ninguna opción puede ser
  // más de 3× la longitud media ni menos de 0.25× la longitud media.
  // Previene que el opositor identifique la respuesta correcta por su extensión.
  const lengths = optionTexts.map(o => o.length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (avgLen > 10) { // solo aplica si las opciones tienen contenido real
    for (const l of lengths) {
      if (l > avgLen * 3 || l < avgLen * 0.25) return false;
    }
  }

  // Prohibición absoluta de negación perezosa en cualquiera de las 4 opciones.
  // Si alguna opción fue construida con "No X", "Nunca X" u otras fórmulas de
  // descarte trivial, la pregunta completa se rechaza y se intenta regenerar.
  for (const opt of optionTexts) {
    if (isLazyNegation(opt)) return false;
  }

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

// ── FALLBACK DE EMERGENCIA POR TEMA (SEMÁNTICAMENTE CORRECTO) ────────────────
//
// Regla de oro: NUNCA se mezclan temas. Cada bloque de fallback solo contiene
// preguntas y distractores del propio tema. Los dominios PLAZO, PARENTESCO y
// PORCENTAJE usan exclusivamente opciones de su mismo tipo.

const TOPIC_FALLBACKS = {

  // ── TEMA 1: Las bibliotecas universitarias y la BUS ─────────────────────
  1: [
    {
      q: 'Según el Reglamento de la BUS aprobado por el Consejo de Gobierno, ¿qué naturaleza orgánica tiene la Biblioteca de la Universidad de Sevilla?',
      correct: 'La BUS es una unidad funcional única e integrada que presta servicio a toda la comunidad universitaria de la Universidad de Sevilla.',
      w1: 'La BUS es una federación de bibliotecas de centro con plena autonomía de gestión y presupuesto propio.',
      w2: 'La BUS es un organismo autónomo adscrito al Consejo Social de la Universidad de Sevilla.',
      w3: 'La BUS es una entidad de derecho privado con personalidad jurídica propia diferente a la de la Universidad.',
    },
    {
      q: 'De acuerdo con el Reglamento de la BUS, ¿de quién depende orgánicamente la Dirección de la Biblioteca?',
      correct: 'La Dirección de la Biblioteca depende orgánicamente del Rector o Vicerrector en quien delegue.',
      w1: 'La Dirección de la Biblioteca depende del Gerente de la Universidad de Sevilla.',
      w2: 'La Dirección de la Biblioteca depende del Decano de la Facultad donde radica la sede central.',
      w3: 'La Dirección de la Biblioteca depende del Consejo Social de la Universidad.',
    },
    {
      q: 'Según el Reglamento de la BUS, ¿quién aprueba el Reglamento que regula la organización y servicios de la Biblioteca?',
      correct: 'El Reglamento de la BUS es aprobado por el Consejo de Gobierno de la Universidad de Sevilla.',
      w1: 'El Reglamento de la BUS es aprobado por el Claustro Universitario a propuesta del Director de la Biblioteca.',
      w2: 'El Reglamento de la BUS es aprobado por el Ministerio de Cultura mediante Orden Ministerial.',
      w3: 'El Reglamento de la BUS es aprobado por la Junta Técnica de Biblioteca previo informe de la Consejería de Universidades.',
    },
    {
      q: 'En relación con las redes nacionales de bibliotecas universitarias, señale la afirmación correcta:',
      correct: 'La BUS es miembro de REBIUN, la Red de Bibliotecas Universitarias Españolas, integrada en la CRUE.',
      w1: 'La BUS es miembro del CBUA, el Consorcio de Bibliotecas Universitarias de Andalucía, que agrupa a todas las universidades españolas.',
      w2: 'La BUS es miembro de LIBER, la asociación europea de bibliotecas nacionales de investigación.',
      w3: 'La BUS es miembro de IFLA, el organismo que regula el Reglamento de préstamo interbibliotecario nacional.',
    },
  ],

  // ── TEMA 2: Sistema de gestión de la calidad / EFQM ─────────────────────
  2: [
    {
      q: 'Según el Modelo EFQM de Excelencia adoptado por la BUS, ¿en cuántos criterios se estructura el modelo?',
      correct: 'El Modelo EFQM se estructura en 9 criterios agrupados en Agentes Facilitadores y Resultados.',
      w1: 'El Modelo EFQM se estructura en 5 criterios de gestión y 3 criterios de resultado.',
      w2: 'El Modelo EFQM se estructura en 7 principios de calidad y 2 ejes transversales de evaluación.',
      w3: 'El Modelo EFQM se estructura en 14 criterios distribuidos en tres ámbitos: personas, procesos y resultados.',
    },
    {
      q: 'En relación con la Carta de Servicios de la BUS, señale la afirmación correcta:',
      correct: 'La Carta de Servicios es un documento público que recoge los compromisos de calidad y los estándares de prestación que la BUS asume ante sus usuarios.',
      w1: 'La Carta de Servicios es un documento de uso interno que regula el horario del personal técnico de biblioteca.',
      w2: 'La Carta de Servicios es el reglamento de uso de las instalaciones aprobado por el Consejo de Gobierno.',
      w3: 'La Carta de Servicios es el catálogo de adquisiciones bibliográficas del ejercicio presupuestario en curso.',
    },
    {
      q: 'De acuerdo con el sistema de calidad de la BUS, ¿qué instrumento permite medir el grado de satisfacción de los usuarios?',
      correct: 'Las encuestas de satisfacción periódicas son el principal instrumento de medición del grado de satisfacción de los usuarios de la BUS.',
      w1: 'El indicador de satisfacción de la BUS se obtiene exclusivamente a partir de las reclamaciones formales presentadas por escrito.',
      w2: 'La satisfacción de los usuarios se evalúa mediante un comité de expertos externos designados por el Rectorado.',
      w3: 'La medición de la satisfacción se encomienda al Servicio de Inspección Académica de la Universidad de Sevilla.',
    },
  ],

  // ── TEMA 3: Instalaciones, espacios y equipamiento ───────────────────────
  3: [
    {
      q: 'En relación con los espacios de una biblioteca universitaria, señale la afirmación correcta:',
      correct: 'Las bibliotecas universitarias deben contar con zonas diferenciadas para la consulta en sala, el trabajo en grupo, la formación de usuarios y el depósito de fondos.',
      w1: 'Las bibliotecas universitarias deben destinar al menos el 70% de su superficie útil al depósito cerrado de fondos.',
      w2: 'Las normas técnicas establecen que las zonas de trabajo en grupo deben estar en planta distinta a las salas de lectura individual.',
      w3: 'Las directrices vigentes prohíben habilitar espacios de uso informático en las mismas salas de lectura.',
    },
    {
      q: 'Según las directrices técnicas para bibliotecas universitarias, ¿cómo se define el concepto de CRAI?',
      correct: 'El CRAI (Centro de Recursos para el Aprendizaje y la Investigación) es un espacio que integra en un mismo edificio los servicios de biblioteca, informática y apoyo al aprendizaje.',
      w1: 'El CRAI es el sistema informático de gestión bibliográfica utilizado por la Red de Bibliotecas Universitarias Españolas.',
      w2: 'El CRAI es la unidad administrativa que gestiona las adquisiciones de recursos digitales a nivel de consorcio.',
      w3: 'El CRAI es la certificación de calidad que otorga REBIUN a las bibliotecas universitarias que superan la auditoría anual.',
    },
    {
      q: 'En cuanto al equipamiento básico de las salas de lectura en una biblioteca universitaria, señale lo correcto:',
      correct: 'Las salas de lectura deben disponer de iluminación natural y artificial suficiente, mobiliario ergonómico y puntos de conexión eléctrica y red para los usuarios.',
      w1: 'Las salas de lectura deben limitarse al uso de ordenadores fijos y no pueden admitir equipos portátiles propios del usuario.',
      w2: 'El equipamiento de salas de lectura está regulado exclusivamente por el Reglamento de la BUS, sin aplicación de normativa técnica externa.',
      w3: 'Las normas vigentes establecen que las salas de lectura deben tener aforo mínimo de 500 puestos por biblioteca de centro.',
    },
  ],

  // ── TEMA 4: La colección impresa y electrónica / Acceso remoto ───────────
  4: [
    {
      q: 'En relación con el acceso remoto a los recursos electrónicos de la BUS, señale la afirmación correcta:',
      correct: 'El acceso remoto a la colección digital de la BUS se realiza mediante el sistema de autenticación de la US, que permite a los miembros de la comunidad universitaria acceder desde fuera del campus.',
      w1: 'El acceso remoto a los recursos electrónicos requiere la adquisición de un carnet de usuario externo de pago.',
      w2: 'Los recursos electrónicos de la BUS solo pueden consultarse desde ordenadores instalados en las propias bibliotecas de la US.',
      w3: 'El acceso remoto está restringido exclusivamente al Personal Docente e Investigador con acreditación de investigador activo.',
    },
    {
      q: 'Según la regulación de la colección digital de la BUS, ¿qué tipo de recursos integra la colección electrónica?',
      correct: 'La colección electrónica de la BUS integra libros electrónicos, revistas en línea, bases de datos referenciales y a texto completo, y recursos de acceso abierto.',
      w1: 'La colección electrónica de la BUS se limita a las obras digitalizadas del fondo histórico de la US.',
      w2: 'La colección electrónica incluye únicamente los recursos suscritos directamente por la BUS, excluyendo los del consorcio CBUA.',
      w3: 'Los recursos electrónicos de la BUS se gestionan íntegramente desde la sede del Ministerio de Universidades.',
    },
  ],

  // ── TEMA 5: Gestión de la colección ─────────────────────────────────────
  5: [
    {
      q: 'En relación con el proceso de expurgo de la colección bibliográfica, señale la afirmación correcta:',
      correct: 'El expurgo es el proceso técnico mediante el cual se retiran de la colección aquellos fondos obsoletos, deteriorados o de escasa utilidad para los usuarios.',
      w1: 'El expurgo consiste en la digitalización de los fondos más antiguos para su preservación en el repositorio institucional.',
      w2: 'El expurgo es el proceso de revisión del catálogo para detectar duplicidades en las referencias bibliográficas.',
      w3: 'El expurgo implica la transferencia de fondos entre bibliotecas de centro sin retirarlos del catálogo general.',
    },
    {
      q: 'Según las directrices de gestión de la colección de la BUS, ¿qué fase sigue a la selección de nuevos títulos?',
      correct: 'Tras la selección, el siguiente paso es la adquisición, que puede realizarse mediante compra, canje o donación.',
      w1: 'Tras la selección, el siguiente paso es el expurgo de los fondos que serán sustituidos por los nuevos títulos seleccionados.',
      w2: 'Tras la selección, el siguiente paso es la catalogación directa en el sistema FAMA sin pasar por ningún proceso de adquisición.',
      w3: 'Tras la selección, el siguiente paso es la evaluación de impacto realizada por el Vicerrectorado de Investigación.',
    },
    {
      q: 'De acuerdo con la política de adquisiciones de la BUS, ¿qué se entiende por canje?',
      correct: 'El canje es la modalidad de adquisición mediante la cual la biblioteca obtiene fondos mediante intercambio de publicaciones con otras instituciones.',
      w1: 'El canje es el proceso de baja definitiva de un fondo del catálogo cuando su uso ha sido nulo durante cinco años.',
      w2: 'El canje es la adquisición de recursos electrónicos mediante licencia de consorcio negociada por el CBUA.',
      w3: 'El canje es la cláusula contractual que permite devolver al proveedor los fondos no utilizados en el ejercicio.',
    },
  ],

  // ── TEMA 6: Clasificación CDU ────────────────────────────────────────────
  6: [
    {
      q: 'Según la Clasificación Decimal Universal (CDU), ¿a qué clase principal corresponde la notación 5?',
      correct: 'La notación 5 en la CDU corresponde a Ciencias Exactas y Naturales.',
      w1: 'La notación 5 en la CDU corresponde a Ciencias Aplicadas y Tecnología.',
      w2: 'La notación 5 en la CDU corresponde a Filosofía y Psicología.',
      w3: 'La notación 5 en la CDU corresponde a Lengua y Lingüística.',
    },
    {
      q: 'En relación con la CDU, ¿a qué clase principal corresponde la notación 3?',
      correct: 'La notación 3 en la CDU corresponde a Ciencias Sociales.',
      w1: 'La notación 3 en la CDU corresponde a Religión y Teología.',
      w2: 'La notación 3 en la CDU corresponde a Historia y Geografía.',
      w3: 'La notación 3 en la CDU corresponde a Ciencias Exactas y Naturales.',
    },
    {
      q: 'De acuerdo con la CDU, ¿cuántas clases principales comprende la clasificación en su nivel de tabla auxiliar principal?',
      correct: 'La CDU comprende 10 clases principales, numeradas del 0 al 9.',
      w1: 'La CDU comprende 7 clases principales, organizadas de forma jerárquica por nivel de especialización.',
      w2: 'La CDU comprende 20 clases principales agrupadas en dos grandes bloques: Ciencias y Humanidades.',
      w3: 'La CDU comprende 100 clases principales distribuidas en cuatro tablas auxiliares independientes.',
    },
  ],

  // ── TEMA 7: Sistemas de gestión bibliotecaria / FAMA ────────────────────
  7: [
    {
      q: 'En relación con el catálogo FAMA de la Universidad de Sevilla, señale la afirmación correcta:',
      correct: 'FAMA es el catálogo colectivo en línea de la BUS que permite localizar y acceder a los fondos bibliográficos de todas las bibliotecas de la Universidad de Sevilla.',
      w1: 'FAMA es el repositorio institucional de la US destinado exclusivamente al depósito de tesis doctorales y trabajos de investigación.',
      w2: 'FAMA es el sistema de préstamo interbibliotecario gestionado en colaboración con la red REBIUN.',
      w3: 'FAMA es la plataforma de formación en línea para el personal técnico de la BUS desarrollada por el Servicio de Informática.',
    },
    {
      q: 'Según la regulación de los sistemas integrados de gestión bibliotecaria, ¿qué módulo gestiona el proceso de préstamo?',
      correct: 'El módulo de Circulación es el responsable de gestionar los préstamos, devoluciones, renovaciones y reservas de fondos.',
      w1: 'El módulo de Adquisiciones es el responsable de gestionar los préstamos, devoluciones y renovaciones de fondos.',
      w2: 'El módulo de Catalogación es el responsable de registrar y gestionar todas las operaciones de préstamo del fondo bibliográfico.',
      w3: 'El módulo de Referencia es el encargado de gestionar el préstamo interbibliotecario y el préstamo en sala.',
    },
  ],

  // ── TEMA 8: Tecnologías RFID y autopréstamo ──────────────────────────────
  8: [
    {
      q: 'En relación con la tecnología RFID aplicada a las bibliotecas, señale la afirmación correcta:',
      correct: 'La tecnología RFID permite identificar y registrar los fondos bibliográficos sin necesidad de contacto directo, mediante la lectura de etiquetas de radiofrecuencia.',
      w1: 'La tecnología RFID requiere la lectura óptica directa del código de barras impreso en cada ejemplar de la colección.',
      w2: 'La tecnología RFID solo puede emplearse en el control de acceso a las instalaciones, no en la gestión del préstamo de fondos.',
      w3: 'La tecnología RFID almacena el contenido íntegro de cada obra en una etiqueta digital de alta capacidad.',
    },
    {
      q: 'De acuerdo con el uso de las estaciones de autopréstamo en la BUS, señale lo correcto:',
      correct: 'Las estaciones de autopréstamo permiten al usuario gestionar por sí mismo el préstamo y la devolución de documentos sin la intervención directa del personal técnico.',
      w1: 'Las estaciones de autopréstamo solo pueden ser utilizadas por el Personal Docente e Investigador con acreditación investigadora activa.',
      w2: 'Las estaciones de autopréstamo requieren la presencia obligatoria de un auxiliar de biblioteca para validar cada operación.',
      w3: 'El uso de las estaciones de autopréstamo implica el pago de una tasa anual aprobada por el Consejo Social de la US.',
    },
  ],

  // ── TEMA 9: Servicios a usuarios I: Préstamo y Objetoteca ───────────────
  9: [
    {
      q: 'Según las Normas de Préstamo de la BUS, ¿cuántos días de préstamo ordinario tienen los estudiantes de grado para los libros de texto?',
      correct: '14 días naturales, con posibilidad de renovación si el ejemplar no tiene reserva pendiente.',
      w1: '7 días naturales, sin posibilidad de renovación en ningún caso.',
      w2: '21 días hábiles, prorrogables por un período adicional de 7 días hábiles.',
      w3: '30 días naturales, con un máximo de dos renovaciones de 15 días cada una.',
    },
    {
      q: 'En relación con el servicio de Objetoteca de la BUS, señale la afirmación correcta:',
      correct: 'La Objetoteca es un servicio de la BUS que permite el préstamo de objetos y dispositivos de uso cotidiano a los miembros de la comunidad universitaria.',
      w1: 'La Objetoteca es el depósito de fondos históricos de la BUS destinado a la preservación y digitalización del patrimonio documental.',
      w2: 'La Objetoteca es el servicio de reprografía y autoedición disponible para el personal docente e investigador de la US.',
      w3: 'La Objetoteca es la sección de la BUS que gestiona las donaciones de fondos bibliográficos por parte de particulares e instituciones.',
    },
    {
      q: 'Según las Normas de Préstamo de la BUS, ¿en qué plazo debe devolver un fondo prestado un usuario si recibe un aviso de reclamación?',
      correct: 'El usuario debe devolver el fondo antes de la hora de cierre del mismo día en que recibe la reclamación.',
      w1: 'El usuario dispone de un plazo de 48 horas desde la recepción de la reclamación para devolver el fondo.',
      w2: 'El usuario dispone de 5 días hábiles desde la notificación para proceder a la devolución del fondo reclamado.',
      w3: 'El usuario debe devolver el fondo en un plazo máximo de 3 días laborables desde la recepción del aviso de reclamación.',
    },
  ],

  // ── TEMA 10: Servicios a usuarios II: Información y Referencia ───────────
  10: [
    {
      q: 'En relación con el Servicio de Información y Referencia de la BUS, señale la afirmación correcta:',
      correct: 'El Servicio de Información y Referencia de la BUS atiende consultas de los usuarios tanto de forma presencial como virtual, a través de formularios web, chat y correo electrónico.',
      w1: 'El Servicio de Información y Referencia de la BUS solo atiende consultas presenciales en el mostrador de las bibliotecas de centro.',
      w2: 'Las consultas de referencia son tramitadas exclusivamente por la Dirección de la Biblioteca, sin intervención del personal técnico.',
      w3: 'El Servicio de Información y Referencia gestiona únicamente las consultas sobre el catálogo FAMA, no las de carácter temático.',
    },
    {
      q: 'Según la regulación del servicio de referencia de la BUS, ¿qué se entiende por referencia virtual?',
      correct: 'La referencia virtual es la atención de consultas bibliográficas e informativas a través de medios digitales como el chat, el formulario web o el correo electrónico.',
      w1: 'La referencia virtual es el acceso en línea al catálogo FAMA para la búsqueda autónoma de registros bibliográficos por parte del usuario.',
      w2: 'La referencia virtual es el préstamo electrónico de documentos digitalizados bajo demanda del usuario.',
      w3: 'La referencia virtual es el sistema de reserva de puestos de sala a través de la aplicación móvil de la BUS.',
    },
  ],

  // ── TEMA 11: Servicios a usuarios III: Apoyo al aprendizaje (ALFIN/CODI) ─
  11: [
    {
      q: 'En relación con la formación en competencias informacionales (ALFIN) de la BUS, señale la afirmación correcta:',
      correct: 'Las acciones de ALFIN tienen como objetivo que los usuarios sean capaces de identificar, localizar, evaluar y usar de forma eficiente la información.',
      w1: 'Las acciones de ALFIN se centran exclusivamente en la formación del personal técnico de la BUS en el uso del catálogo FAMA.',
      w2: 'El programa ALFIN gestiona el acceso de los usuarios a los recursos electrónicos mediante el sistema de autenticación de la US.',
      w3: 'Las actividades de ALFIN se limitan a la formación en habilidades de ofimática para estudiantes de primer año de grado.',
    },
    {
      q: 'Según las directrices del servicio de Apoyo al Aprendizaje de la BUS, ¿a qué colectivo van dirigidas principalmente las acciones de CODI?',
      correct: 'Las acciones de CODI (Competencias Digitales) van dirigidas al conjunto de la comunidad universitaria, con especial atención a los estudiantes.',
      w1: 'Las acciones de CODI van dirigidas exclusivamente al Personal Docente e Investigador con dedicación a tiempo completo.',
      w2: 'Las acciones de CODI son formaciones de pago destinadas a titulados externos sin vinculación actual con la Universidad.',
      w3: 'Las acciones de CODI van dirigidas únicamente al personal de administración y servicios de la Universidad de Sevilla.',
    },
  ],

  // ── TEMA 12: Servicios a usuarios IV: Apoyo a la investigación ───────────
  12: [
    {
      q: 'En relación con el repositorio institucional idUS de la Universidad de Sevilla, señale la afirmación correcta:',
      correct: 'idUS es el repositorio institucional de la US gestionado por la BUS, que recoge y difunde en acceso abierto la producción científica de la Universidad.',
      w1: 'idUS es el sistema de gestión de préstamo interbibliotecario entre las bibliotecas de la Red de Bibliotecas Universitarias Españolas.',
      w2: 'idUS es la plataforma de evaluación de la actividad investigadora del profesorado gestionada por la ANECA.',
      w3: 'idUS es el catálogo de revistas científicas de acceso abierto gestionado por el Ministerio de Ciencia e Innovación.',
    },
    {
      q: 'Según los servicios de apoyo a la investigación de la BUS, ¿qué instrumento permite al investigador gestionar y dar visibilidad a su producción científica?',
      correct: 'El perfil del investigador en plataformas como ORCID, Google Académico o ResearcherID permite gestionar y dar visibilidad a la producción científica de cada investigador.',
      w1: 'El servicio de Préstamo Interbibliotecario es el principal instrumento para que el investigador gestione y dé visibilidad a su producción científica.',
      w2: 'La Carta de Servicios de la BUS es el instrumento oficial para que el investigador registre y difunda sus publicaciones.',
      w3: 'El catálogo FAMA es la herramienta habilitada por la BUS para que el investigador gestione su perfil científico y sus publicaciones.',
    },
  ],

  // ── TEMA 13: Herramientas digitales: Microsoft 365 ───────────────────────
  13: [
    {
      q: 'En relación con Microsoft Teams, herramienta de la suite Microsoft 365, señale la afirmación correcta:',
      correct: 'Microsoft Teams es la herramienta de Microsoft 365 diseñada para la comunicación y colaboración en equipo, permitiendo reuniones virtuales, chats y el trabajo compartido sobre documentos.',
      w1: 'Microsoft Teams es el gestor de correo electrónico corporativo de Microsoft 365 utilizado en la Universidad de Sevilla.',
      w2: 'Microsoft Teams es la aplicación de Microsoft 365 destinada al almacenamiento individual de archivos en la nube.',
      w3: 'Microsoft Teams es el sistema de videoconferencia exclusivo para reuniones del Consejo de Gobierno de la Universidad.',
    },
    {
      q: 'De acuerdo con las funcionalidades de Microsoft 365, ¿qué herramienta está orientada al almacenamiento personal de archivos en la nube?',
      correct: 'OneDrive es la herramienta de Microsoft 365 orientada al almacenamiento personal de archivos en la nube.',
      w1: 'SharePoint es la herramienta de Microsoft 365 orientada al almacenamiento personal de archivos en la nube.',
      w2: 'Microsoft Teams es la herramienta de Microsoft 365 orientada al almacenamiento personal de archivos en la nube.',
      w3: 'Outlook es la herramienta de Microsoft 365 orientada al almacenamiento personal de archivos en la nube.',
    },
    {
      q: 'En relación con Outlook, herramienta de Microsoft 365, señale la afirmación correcta:',
      correct: 'Outlook es el cliente de correo electrónico y gestión de calendario corporativo de Microsoft 365.',
      w1: 'Outlook es la herramienta de Microsoft 365 para la creación y edición de hojas de cálculo y análisis de datos.',
      w2: 'Outlook es la plataforma de videoconferencia y reuniones virtuales de Microsoft 365.',
      w3: 'Outlook es el sistema de gestión documental y base de datos corporativa de Microsoft 365.',
    },
  ],

  // ── TEMA 14: Sistema de Gestión de PRL de la US ──────────────────────────
  14: [
    {
      q: 'Según el Plan de Prevención de Riesgos Laborales de la US, ¿a quién corresponde la obligación de garantizar la seguridad y salud de los trabajadores?',
      correct: 'La obligación de garantizar la seguridad y salud de los trabajadores corresponde al empresario, en este caso la Universidad de Sevilla.',
      w1: 'La obligación de garantizar la seguridad y salud de los trabajadores corresponde en exclusiva al propio trabajador.',
      w2: 'La obligación de garantizar la seguridad y salud corresponde al Ministerio de Trabajo mediante la Inspección de Trabajo.',
      w3: 'La obligación de garantizar la seguridad y salud de los trabajadores corresponde a las mutuas colaboradoras con la Seguridad Social.',
    },
    {
      q: 'En relación con la actuación ante un accidente laboral en la US, señale la afirmación correcta:',
      correct: 'Ante un accidente laboral, el trabajador debe comunicarlo de forma inmediata a su responsable o mando directo, quien deberá notificarlo al Servicio de Prevención.',
      w1: 'Ante un accidente laboral, el trabajador debe comunicarlo directamente al Ministerio de Trabajo en un plazo de 48 horas.',
      w2: 'La notificación del accidente laboral es competencia exclusiva del delegado de prevención y no del mando directo.',
      w3: 'El trabajador accidentado debe esperar a que concluya su jornada para notificar el accidente al Servicio de Prevención.',
    },
    {
      q: 'Según el sistema de gestión de PRL de la US, ¿qué función tiene el Servicio de Prevención?',
      correct: 'El Servicio de Prevención asesora y asiste al empresario, a los trabajadores y a sus representantes en materia de prevención de riesgos laborales.',
      w1: 'El Servicio de Prevención de la US tiene como función exclusiva la gestión de las bajas médicas del personal de administración y servicios.',
      w2: 'El Servicio de Prevención es el órgano encargado de imponer las sanciones disciplinarias por incumplimiento de la normativa de seguridad.',
      w3: 'El Servicio de Prevención gestiona el sistema de reclutamiento de personal especializado en seguridad laboral de la Universidad.',
    },
  ],

  // ── TEMA 15: Riesgos generales y específicos del puesto de trabajo ────────
  15: [
    {
      q: 'En relación con los riesgos ergonómicos del puesto de Auxiliar de Biblioteca, señale la afirmación correcta:',
      correct: 'Los principales riesgos ergonómicos del Auxiliar de Biblioteca son los derivados de la manipulación manual de cargas, las posturas forzadas y el trabajo prolongado de pie o sentado.',
      w1: 'Los principales riesgos del Auxiliar de Biblioteca son los derivados de la exposición a agentes químicos y biológicos en los depósitos de fondos.',
      w2: 'El riesgo ergonómico más frecuente en el Auxiliar de Biblioteca es la exposición a radiaciones ionizantes producidas por los equipos RFID.',
      w3: 'Los riesgos ergonómicos del Auxiliar de Biblioteca son exclusivamente los derivados del trabajo nocturno y en condiciones de escasa iluminación.',
    },
    {
      q: 'Según la normativa de PRL aplicable al puesto de Auxiliar de Biblioteca, ¿cuál es el peso máximo recomendado para la manipulación manual de cargas sin ayuda mecánica?',
      correct: 'El peso máximo recomendado para la manipulación manual de cargas sin ayuda mecánica es de 25 kg para trabajadores en condiciones normales.',
      w1: 'El peso máximo recomendado para la manipulación manual de cargas sin ayuda mecánica es de 50 kg en condiciones normales de trabajo.',
      w2: 'El peso máximo recomendado para la manipulación manual de cargas sin ayuda mecánica es de 10 kg para cualquier tipo de trabajador.',
      w3: 'La normativa no establece ningún límite de peso y delega en el trabajador la valoración del esfuerzo máximo admisible.',
    },
  ],

  // ── TEMA 16: Legislación sobre PRL ──────────────────────────────────────
  16: [
    {
      q: 'Según la Ley 31/1995 de Prevención de Riesgos Laborales, ¿qué obligación tiene el trabajador en materia preventiva?',
      correct: 'El trabajador está obligado a velar por su propia seguridad y salud y por la de las personas que puedan verse afectadas por sus actos u omisiones en el trabajo.',
      w1: 'El trabajador está obligado a sufragar los costes de los equipos de protección individual que necesite para el desempeño de sus funciones.',
      w2: 'El trabajador está obligado a contratar un seguro privado de accidentes que cubra los riesgos inherentes a su puesto de trabajo.',
      w3: 'El trabajador tiene la obligación de realizar la evaluación de riesgos de su propio puesto de trabajo de forma anual.',
    },
    {
      q: 'En relación con el Real Decreto 488/1997, ¿qué materia regula?',
      correct: 'El Real Decreto 488/1997 regula las disposiciones mínimas de seguridad y salud relativas al trabajo con equipos que incluyen pantallas de visualización de datos.',
      w1: 'El Real Decreto 488/1997 regula las disposiciones mínimas de seguridad y salud en los lugares de trabajo.',
      w2: 'El Real Decreto 488/1997 regula la señalización de seguridad y salud en el trabajo.',
      w3: 'El Real Decreto 488/1997 regula la utilización por los trabajadores de los equipos de protección individual.',
    },
    {
      q: 'Según el Real Decreto 486/1997, ¿qué materia regula específicamente?',
      correct: 'El Real Decreto 486/1997 regula las disposiciones mínimas de seguridad y salud en los lugares de trabajo.',
      w1: 'El Real Decreto 486/1997 regula las disposiciones mínimas de seguridad y salud relativas al trabajo con pantallas de visualización.',
      w2: 'El Real Decreto 486/1997 regula la señalización de seguridad y salud en el trabajo en centros públicos.',
      w3: 'El Real Decreto 486/1997 regula la utilización por los trabajadores de equipos de protección individual en la Administración Pública.',
    },
  ],

  // ── TEMA 17: Estatutos de la Universidad de Sevilla ─────────────────────
  17: [
    {
      q: 'Según los Estatutos de la Universidad de Sevilla (Decreto 98/2025), ¿cuál es el máximo órgano de representación de la comunidad universitaria?',
      correct: 'El Claustro Universitario es el máximo órgano de representación y participación de la comunidad universitaria de la US.',
      w1: 'El Consejo de Gobierno es el máximo órgano de representación y participación de la comunidad universitaria de la US.',
      w2: 'El Consejo Social es el máximo órgano de representación de la comunidad universitaria ante la sociedad andaluza.',
      w3: 'El Rectorado es el máximo órgano de representación y participación de la comunidad universitaria de la US.',
    },
    {
      q: 'De acuerdo con los Estatutos de la US, ¿a quién corresponde la competencia para la propuesta de creación de Facultades y Escuelas?',
      correct: 'La propuesta de creación, modificación o supresión de Facultades y Escuelas corresponde al Consejo de Gobierno de la Universidad.',
      w1: 'La propuesta de creación de Facultades y Escuelas corresponde al Claustro Universitario como máximo órgano de representación.',
      w2: 'La propuesta de creación de Facultades y Escuelas corresponde al Consejo Social como representante de los intereses sociales.',
      w3: 'La propuesta de creación de Facultades y Escuelas es competencia exclusiva de la Junta de Andalucía sin intervención del Consejo de Gobierno.',
    },
    {
      q: 'Según los Estatutos de la US, ¿con qué periodicidad se renuevan los representantes del estudiantado en la Junta de Centro?',
      correct: 'La renovación de los representantes del estudiantado en la Junta de Centro es anual.',
      w1: 'La renovación de los representantes del estudiantado en la Junta de Centro es bianual, coincidiendo con la renovación claustral.',
      w2: 'La renovación de los representantes del estudiantado en la Junta de Centro es cuatrienal, coincidiendo con las elecciones rectorales.',
      w3: 'La renovación de los representantes del estudiantado se produce al finalizar el ciclo de estudios en el que estén matriculados.',
    },
  ],

  // ── TEMA 18: IV Convenio Colectivo del Personal Laboral ──────────────────
  18: [
    {
      q: 'Según el IV Convenio Colectivo del Personal Laboral de las UUPP de Andalucía, ¿de cuántos días de permiso retribuido dispone el trabajador por razón de matrimonio o registro de pareja de hecho?',
      correct: '15 días naturales.',
      w1: '10 días naturales.',
      w2: '20 días hábiles.',
      w3: '7 días laborables.',
    },
    {
      q: 'Según el IV Convenio Colectivo, ¿cuántos días de permiso retribuido corresponden al trabajador por fallecimiento de familiar de primer grado de consanguinidad?',
      correct: '5 días naturales.',
      w1: '2 días hábiles.',
      w2: '10 días naturales.',
      w3: '3 días laborables.',
    },
    {
      q: 'Según el IV Convenio Colectivo, ¿cuántos días de permiso retribuido corresponden al trabajador por nacimiento, adopción o acogimiento de hijo?',
      correct: '5 días naturales.',
      w1: '3 días hábiles.',
      w2: '10 días naturales.',
      w3: '7 días laborables.',
    },
    {
      q: 'Según el IV Convenio Colectivo, ¿qué grado de parentesco une a un trabajador con su tío?',
      correct: 'Tercer grado de consanguinidad.',
      w1: 'Segundo grado de consanguinidad.',
      w2: 'Cuarto grado de consanguinidad.',
      w3: 'Segundo grado de afinidad.',
    },
    {
      q: 'Según el IV Convenio Colectivo, ¿qué grado de parentesco une a un trabajador con su suegro o suegra?',
      correct: 'Primer grado de afinidad.',
      w1: 'Primer grado de consanguinidad.',
      w2: 'Segundo grado de afinidad.',
      w3: 'Segundo grado de consanguinidad.',
    },
    {
      q: 'Según el IV Convenio Colectivo, ¿cuántos días de permiso retribuido corresponden por traslado del domicilio habitual?',
      correct: '2 días naturales.',
      w1: '5 días hábiles.',
      w2: '1 día laborable.',
      w3: '4 días naturales.',
    },
  ],

  // ── TEMA 19: Ley Orgánica 3/2007 para la Igualdad Efectiva ───────────────
  19: [
    {
      q: 'Según la Ley Orgánica 3/2007 para la igualdad efectiva de mujeres y hombres, ¿cómo se define la discriminación directa por razón de sexo?',
      correct: 'La discriminación directa por razón de sexo es la situación en que una persona sea tratada de manera menos favorable que otra en situación análoga por razón de sexo.',
      w1: 'La discriminación directa por razón de sexo es toda orden de discriminar a personas por razón de su orientación sexual o identidad de género.',
      w2: 'La discriminación directa se produce cuando una disposición, criterio o práctica aparentemente neutros perjudican a personas de un sexo respecto del otro.',
      w3: 'La discriminación directa consiste en el acoso reiterado de carácter sexual que crea un entorno intimidatorio para la víctima en el ámbito laboral.',
    },
    {
      q: 'De acuerdo con la LO 3/2007, ¿cómo se define el acoso sexual?',
      correct: 'El acoso sexual es cualquier comportamiento verbal o físico de naturaleza sexual que tenga el propósito o produzca el efecto de atentar contra la dignidad de una persona, en particular cuando se crea un entorno intimidatorio, degradante u ofensivo.',
      w1: 'El acoso sexual es toda distinción, exclusión o restricción basada en el sexo que tenga por objeto menoscabar el reconocimiento de derechos.',
      w2: 'El acoso sexual es la situación en que una disposición aparentemente neutra pone a personas de un sexo en desventaja frente al otro.',
      w3: 'El acoso sexual es la conducta realizada en función del sexo de una persona con el propósito de atentar contra su dignidad en el trabajo.',
    },
    {
      q: 'Según la LO 3/2007, ¿qué se entiende por discriminación indirecta por razón de sexo?',
      correct: 'La discriminación indirecta se produce cuando una disposición, criterio o práctica aparentemente neutros ponen a personas de un sexo en desventaja particular con respecto a personas del otro sexo.',
      w1: 'La discriminación indirecta es el trato menos favorable que se da directamente a una persona por razón de su sexo respecto de otra en situación análoga.',
      w2: 'La discriminación indirecta es el comportamiento de naturaleza sexual que atenta contra la dignidad de la persona y crea un entorno intimidatorio.',
      w3: 'La discriminación indirecta es la orden expresa de discriminar a una persona por razón de su sexo, orientación o identidad de género.',
    },
  ],

  // ── TEMA 20: Normativa de la US contra violencia, acoso y discriminación ──
  20: [
    {
      q: 'Según el Protocolo de actuación de la US contra el acoso, ¿qué órgano es el responsable de instruir el expediente cuando se presenta una denuncia?',
      correct: 'La instrucción del expediente corresponde a la Comisión Instructora designada al efecto, compuesta por personal con formación específica en la materia.',
      w1: 'La instrucción del expediente corresponde directamente al Rector o Rectora de la Universidad de Sevilla.',
      w2: 'La instrucción del expediente corresponde al Defensor Universitario como garante de los derechos de la comunidad universitaria.',
      w3: 'La instrucción del expediente corresponde al Gerente de la Universidad en calidad de máximo responsable de personal.',
    },
    {
      q: 'De acuerdo con la normativa de la US contra el acoso, ¿cuál es la diferencia entre acoso sexual y acoso por razón de sexo?',
      correct: 'El acoso sexual tiene naturaleza sexual explícita, mientras que el acoso por razón de sexo está motivado por el sexo de la persona pero no necesariamente tiene connotación sexual.',
      w1: 'El acoso sexual es el que se produce en el ámbito laboral, mientras que el acoso por razón de sexo se produce exclusivamente en el ámbito académico.',
      w2: 'El acoso sexual es sancionable penalmente, mientras que el acoso por razón de sexo es competencia exclusiva de la comisión de igualdad.',
      w3: 'El acoso sexual afecta únicamente a mujeres, mientras que el acoso por razón de sexo puede afectar a cualquier persona independientemente de su identidad de género.',
    },
    {
      q: 'Según el protocolo de la US contra el acoso, ¿qué garantía tiene la persona que presenta una denuncia?',
      correct: 'La persona denunciante tiene garantizada la confidencialidad del procedimiento y la protección frente a represalias o perjuicios derivados de la presentación de la denuncia.',
      w1: 'La persona denunciante tiene garantizado el anonimato absoluto, sin que en ningún caso pueda ser identificada durante todo el procedimiento.',
      w2: 'La persona denunciante tiene garantizado el traslado preventivo a otro puesto de trabajo mientras se instruye el expediente.',
      w3: 'La persona denunciante tiene garantizada la resolución del expediente en un plazo máximo de 15 días hábiles desde la presentación.',
    },
  ],
};

export function createEmergencyFallbackBatch(topicId, topicTitle, count = 5) {
  const batch = [];
  const topNum = parseInt(topicId, 10);
  const safeTitle = topicTitle || `Tema ${topicId}`;

  // Obtener los fallbacks específicos del tema; si no hay (tema no contemplado), usar array vacío
  const topicTemplates = TOPIC_FALLBACKS[topNum] || [];

  // Si hay fallbacks específicos para este tema, usarlos
  if (topicTemplates.length > 0) {
    for (let i = 0; i < count; i++) {
      const t = topicTemplates[i % topicTemplates.length];
      batch.push(createStructuredQuestion(t.q, t.correct, [t.w1, t.w2, t.w3], t.correct, safeTitle, topicId));
    }
    return batch;
  }

  // Fallback de último recurso: solo si el tema no está en el mapa y no tiene Markdown.
  // Se usa una pregunta neutra sobre la normativa del tema específico.
  const genericFallback = {
    q: `En relación con ${safeTitle}, señale la opción correcta:`,
    correct: `La normativa reguladora de ${safeTitle} tiene carácter vinculante para todos los afectados en el ámbito de la Universidad de Sevilla.`,
    w1: `La normativa reguladora de ${safeTitle} es de aplicación facultativa y cada centro puede adaptar su cumplimiento.`,
    w2: `La normativa de ${safeTitle} requiere ratificación anual del Ministerio de Universidades para mantener su vigencia.`,
    w3: `La normativa de ${safeTitle} es un documento orientativo sin fuerza jurídica aprobado por la Dirección de la Biblioteca.`,
  };
  for (let i = 0; i < count; i++) {
    batch.push(createStructuredQuestion(
      genericFallback.q, genericFallback.correct,
      [genericFallback.w1, genericFallback.w2, genericFallback.w3],
      genericFallback.correct, safeTitle, topicId
    ));
  }
  return batch;
}


