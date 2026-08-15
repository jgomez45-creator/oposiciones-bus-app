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

  // Reducimos longitud mínima de 30 a 15 para admitir epígrafes cortos
  if (clean.length < 15) return false;
  
  // Admitimos oraciones que terminen en punto, dos puntos, o sin puntuación (común en listas)
  if (/^[A-Z\s]+$/.test(clean)) return false; // Todo mayúsculas, suele ser un título descartable

  if (/^(tipo de usuario|documentos simultáneos|renovaciones|tabla|esquema|sección)\b/i.test(clean)) return false;

  // RECHAZAR oraciones que terminan en palabras "colgantes" típicas de introducciones a listas
  // (antes del punto final que le haya puesto formatCompleteSentence)
  if (/\b(para|como|son|es|siguientes|los|las|el|la|y|o|u|a|de|que|en|por|con|sin)\.?$/i.test(clean)) {
    return false;
  }

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
  },
  // 6. Enriquecimiento Semántico Abstracto (Gestión, Calidad y Procesos)
  {
    target: /\b(herramienta|instrumento)\b(?!\s*de\s*evaluación)/gi,
    replacements: ['limitación procedimental', 'barrera administrativa']
  },
  {
    target: /\b(optimizar|optimización)\s*(de\s*la\s*|de\s*los\s*|del\s*|de\s*)?/gi,
    replacements: ['supervisar con carácter sancionador ', 'reducir drásticamente ', 'limitar el alcance de ']
  },
  {
    target: /\b(mejora continua|mejorar)\b/gi,
    replacements: ['fiscalizar', 'limitar', 'reducir']
  },
  {
    target: /\b(estratégic[oa]s?|estrategia)\b/gi,
    replacements: ['secundario y opcional', 'puramente burocrático']
  },
  {
    target: /\b(participación|implicación)\b/gi,
    replacements: ['exclusión deliberada', 'delegación pasiva']
  },
  {
    target: /\b(transparencia|rendición de cuentas)\b/gi,
    replacements: ['opacidad administrativa', 'reserva de la información departamental']
  },
  {
    target: /\b(evaluación continua|evaluación permanente)\b/gi,
    replacements: ['inspección puntual y esporádica', 'auditoría externa quinquenal']
  },
  {
    target: /\b(eficiencia|eficacia)\b/gi,
    replacements: ['fiscalización estricta', 'burocratización progresiva']
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
  const substitutedKeywords = [];

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
    return { distractors: distractors.slice(0, 3), substitutedKeywords };
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

    // Expansión previa de contracciones para aislar los artículos
    let expandedCorrectOpt = correctOpt
      .replace(/\bdel\b/g, 'de el').replace(/\bal\b/g, 'a el')
      .replace(/\bDel\b/g, 'De el').replace(/\bAl\b/g, 'A el');

    for (const rule of SEMANTIC_SUBSTITUTIONS) {
      if (distractors.length >= 3) break;
      
      // Creamos una nueva expresión regular que absorba los artículos opcionales
      // Esto evita los dobles artículos (ej. "La el Reglamento")
      let source = rule.re.source;
      if (source.startsWith('\\b')) {
        source = source.substring(2);
      }
      const articlePrefix = '(?:el |la |los |las |un |una |unos |unas |El |La |Los |Las |Un |Una |Unos |Unas )?';
      const flexRe = new RegExp('\\b' + articlePrefix + source, 'gi');

      if (!flexRe.test(expandedCorrectOpt)) continue;
      
      for (const alt of rule.alts) {
        if (distractors.length >= 3) break;
        flexRe.lastIndex = 0;
        let replaced = false;
        let candidateRaw = expandedCorrectOpt.replace(flexRe, (match) => {
          if (!replaced) { 
            replaced = true; 
            // Save the exact replaced word (stripped of optional articles) for sanitization later
            const coreMatch = match.replace(/^(el|la|los|las|un|una|unos|unas|El|La|Los|Las|Un|Una|Unos|Unas)\s+/i, '').trim();
            if (coreMatch) substitutedKeywords.push(coreMatch.toLowerCase());
            
            // Si la frase empezaba con mayúscula, aseguramos que el reemplazo también
            if (/^[A-Z]/.test(match)) {
              return alt.charAt(0).toUpperCase() + alt.slice(1);
            }
            return alt; 
          }
          return match;
        });
        
        if (!replaced) continue;
        
        // Contracción final (post-procesamiento)
        candidateRaw = candidateRaw
          .replace(/\bde el\b/gi, 'del').replace(/\ba el\b/gi, 'al')
          .replace(/\bDe el\b/g, 'Del').replace(/\bA el\b/g, 'Al');

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
      // Cruce de conceptos abstracto (trampas conceptuales)
      (t) => t.replace(/\bgesti[oó]n de( la)? calidad\b/gi, 'evaluación punitiva del rendimiento'),
      (t) => t.replace(/\b(criterios?|bloques?)\b/gi, 'recomendaciones opcionales'),
      (t) => t.replace(/\b(indicadores?)\b/gi, 'estimaciones orientativas'),
      (t) => t.replace(/\b(evaluaci[oó]n|diagn[oó]stico)\b/gi, 'sanción disciplinaria'),
      (t) => t.replace(/\b(modelo EFQM)\b/gi, 'sistema ISO estandarizado antiguo'),
      (t) => t.replace(/\b(puntuaci[oó]n)\b/gi, 'tasa de penalización'),
      (t) => t.replace(/\b(cartas? de servicios?)\b/gi, 'catálogo de tarifas públicas'),
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

  return { distractors: distractors.slice(0, 3), substitutedKeywords };
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

    // 4. Agrupar los hechos por apartado (heading) para selección homogénea (Round-Robin)
    const factsByHeading = {};
    factPool.forEach(fact => {
      const h = fact.heading || 'General';
      if (!factsByHeading[h]) factsByHeading[h] = [];
      factsByHeading[h].push(fact);
    });

    // Barajar los hechos dentro de cada apartado para dar variedad
    Object.keys(factsByHeading).forEach(h => {
      factsByHeading[h].sort(() => 0.5 - Math.random());
    });

    const headings = Object.keys(factsByHeading);
    headings.sort(() => 0.5 - Math.random());

    // 5. Generar preguntas a partir de los hechos (Round-Robin)
    let madeProgress = true;
    const headingIndices = {};
    headings.forEach(h => headingIndices[h] = 0);

    while (generated.length < count && madeProgress && headings.length > 0) {
      madeProgress = false;
      for (const currentHeading of headings) {
        if (generated.length >= count) break;
        const pool = factsByHeading[currentHeading];
        let idx = headingIndices[currentHeading];

        let foundValidFact = false;
        while (idx < pool.length && !foundValidFact) {
          const { rawFact, sentence: correctOpt, heading: factHeading } = pool[idx];
          idx++;
          headingIndices[currentHeading] = idx;

          // ← Evitar usar el mismo hecho fuente dos veces (elimina preguntas calcadas)
          const factKey = stripAccents(correctOpt).substring(0, 80);
          if (usedFacts.has(factKey)) continue;

          const cleanHeading = cleanHeadingTitle(factHeading);
          const normName = getOfficialNormName(topicId, topicTitle, cleanHeading, rawFact);
          let stem = buildStem(normName, cleanHeading, generated.length);

          const genResult = generateSyntheticDistractors(correctOpt, cleanHeading, generated.length);
          const distractors = genResult.distractors;
          if (distractors.length < 3) continue;

          // Sanitizar el enunciado si desvela el sujeto evaluado en las opciones
          if (genResult.substitutedKeywords && genResult.substitutedKeywords.length > 0) {
            const stemLower = stem.toLowerCase();
            for (const kw of genResult.substitutedKeywords) {
              if (stemLower.includes(kw)) {
                const GENERIC_STEMS = [
                  `De acuerdo con la normativa aplicable, señale la afirmación verdadera:`,
                  `Según lo establecido en la normativa, ¿cuál de los siguientes enunciados es correcto?`,
                  `En relación con ${normName}, indique la respuesta correcta:`
                ];
                stem = GENERIC_STEMS[generated.length % GENERIC_STEMS.length];
                break;
              }
            }
          }

          const stemKey = stripAccents(stem).substring(0, 60);
          if (usedStems.has(stemKey)) continue;

          const candidateQ = createStructuredQuestion(stem, correctOpt, distractors, rawFact, cleanHeading, topicId);

          if (validateQuestion(candidateQ)) {
            usedStems.add(stemKey);
            usedFacts.add(factKey);
            generated.push(candidateQ);
            foundValidFact = true;
            madeProgress = true;
          }
        }
      }
    }

    // 6. Si faltan preguntas por escasa densidad del markdown, RECICLAJE CON PARÁFRASIS PROFUNDA
    if (generated.length < count && generated.length > 0) {
      let cycle = 1;
      let recycledCount = 0;
      const targetCount = count - generated.length;
      const originalLength = generated.length;
      
      while (recycledCount < targetCount) {
        // Obtenemos la base de una pregunta generada de forma exitosa
        const baseQuestion = generated[recycledCount % originalLength];
        
        // 1. Variación Sintáctica Profunda del Enunciado
        const stemPrefixes = [
          'De acuerdo con la normativa vigente, ',
          'En el marco del temario oficial, ',
          'Considerando las disposiciones aplicables, ',
          'Atendiendo a la regulación establecida, ',
          'Conforme a lo regulado en la materia, '
        ];
        const prefix = stemPrefixes[(cycle + recycledCount) % stemPrefixes.length];
        const newStem = prefix + "señale la afirmación correcta:";

        // 2. Variación de la Opción Correcta (Sinónimos lógicos)
        let newCorrect = baseQuestion.options[baseQuestion.correctAnswer].replace(/^[A-D]\)\s*/, '');
        if (cycle % 2 !== 0) {
          newCorrect = newCorrect
            .replace(/\bes\b/g, 'constituye')
            .replace(/\bson\b/g, 'representan')
            .replace(/\bse establece\b/g, 'queda determinado')
            .replace(/\bdeberá\b/g, 'tendrá la obligación de')
            .replace(/\bpodrá\b/g, 'tendrá la potestad de');
        }

        // 3. Escudo de Variedad en Distractores: Generamos nuevos distractores
        const newDistractors = [];
        const used = new Set([stripAccents(newCorrect)]);
        
        // Aplicamos mutadores sintácticos directamente (Garantía 100% falsa)
        for (const mutator of MUTATIONS) {
           if (newDistractors.length >= 3) break;
           mutator.target.lastIndex = 0;
           if (!mutator.target.test(newCorrect)) continue;
           mutator.target.lastIndex = 0;
           
           for (const rep of mutator.replacements) {
             if (newDistractors.length >= 3) break;
             let replaced = false;
             mutator.target.lastIndex = 0;
             const candRaw = newCorrect.replace(mutator.target, (match) => {
               if (!replaced) { replaced = true; return rep; }
               return match;
             });
             
             if (candRaw !== newCorrect) {
               const cand = formatCompleteSentence(candRaw);
               const normCand = stripAccents(cand);
               if (cand && !isLazyNegation(cand) && !used.has(normCand)) {
                 newDistractors.push(cand);
                 used.add(normCand);
               }
             }
           }
        }
        
        // Si no logramos 3 distractores sintácticos, rellenamos con sustituciones semánticas
        if (newDistractors.length < 3) {
          const genResult = generateSyntheticDistractors(newCorrect, baseQuestion.explanation || '', 0);
          for (const d of genResult.distractors) {
            if (newDistractors.length >= 3) break;
            const normD = stripAccents(d);
            if (!used.has(normD)) {
              newDistractors.push(d);
              used.add(normD);
            }
          }
        }

        const finalDistractors = newDistractors.length >= 3 
          ? newDistractors.slice(0, 3) 
          : baseQuestion.options.filter((o, i) => i !== baseQuestion.correctAnswer).map(o => o.replace(/^[A-D]\)\s*/, ''));

        const candidateQ = createStructuredQuestion(
          newStem, 
          newCorrect, 
          finalDistractors, 
          baseQuestion.explanation, 
          "Repaso y Variación", 
          topicId
        );

        generated.push(candidateQ);
        recycledCount++;
        if (recycledCount % originalLength === 0) cycle++;
      }
    }

    return generated.slice(0, count);

  } catch (err) {
    console.error('Error en generateNewQuestionsForTopic:', err);
    return []; // Ya no usamos fallback
  }
}



