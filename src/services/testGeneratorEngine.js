/**
 * Motor de Generación y Validación de Preguntas de Examen Inéditas
 * Estándar CCOO / Código 4140 de la Universidad de Sevilla (BUS)
 */

import quizzesData from '../data/quizzes.json';

const stripAccents = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Generador de ID único para nuevas preguntas
export function generateQuestionId(topicId) {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `q_t${topicId}_${timestamp}_${randomStr}`;
}

// Algoritmo de similitud Levenshtein / Jaccard para verificar antiduplicados
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

// Verifica si una pregunta propuesta es duplicada de las existentes
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
    isDuplicated: maxSim >= 0.7, // Umbral del 70% de similitud
    similarityPercentage: Math.round(maxSim * 100),
    matchingExistingQuestion: matchQuestion
  };
}

// Plantillas de generación basadas en patrones normativos del temario
const COMMON_DISTRACTORS = {
  organs: ['el Rector', 'el Consejo de Gobierno', 'el Claustro Universitario', 'la Comisión de Biblioteca', 'la Junta Técnica', 'el Vicerrectorado con competencias en Investigación', 'el Consejo Social'],
  days: ['10 días hábiles', '15 días hábiles', '20 días hábiles', '1 mes', '3 meses', '6 meses'],
  severities: ['falta leve', 'falta grave', 'falta muy grave'],
  deadlines: ['1 año', '2 años', '3 años', '5 años']
};

/**
 * Genera un lote de preguntas inéditas basadas en el markdown del tema
 */
export async function generateNewQuestionsForTopic({ topicId, topicTitle, markdownText, count = 5 }) {
  const generated = [];
  const existingList = quizzesData[topicId] || [];

  // Parse markdown into key paragraphs and headings
  const paragraphs = (markdownText || '')
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 40 && !p.startsWith('#') && !p.includes('app-promo-banner'));

  let currentHeading = `Tema ${topicId} — ${topicTitle}`;

  // Process paragraphs to extract facts
  const facts = [];
  const lines = (markdownText || '').split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      currentHeading = trimmed.replace(/^#+\s*/, '');
    } else if (trimmed.length > 30 && (trimmed.includes(':') || trimmed.includes('•') || trimmed.includes('*') || trimmed.includes('Art') || trimmed.includes('art'))) {
      facts.push({
        text: trimmed.replace(/^[•*\-\d.]+\s*/, ''),
        heading: currentHeading
      });
    }
  });

  const factPool = facts.length > 0 ? facts : paragraphs.map(p => ({ text: p, heading: currentHeading }));

  // Shuffle fact pool
  const shuffledFacts = [...factPool].sort(() => 0.5 - Math.random());

  let idx = 0;
  while (generated.length < count && idx < shuffledFacts.length * 3) {
    const factObj = shuffledFacts[idx % shuffledFacts.length];
    idx++;

    const factText = factObj.text;
    const heading = factObj.heading;

    // Detect patterns in factText
    let newQ = null;

    // Pattern 1: Timelines / Days / Deadlines
    const daysMatch = factText.match(/(\d+)\s+(días|meses|años|mes)/i);
    const organMatch = COMMON_DISTRACTORS.organs.find(o => factText.toLowerCase().includes(o.toLowerCase()));

    if (daysMatch) {
      const num = daysMatch[1];
      const unit = daysMatch[2];
      const mainSentence = factText.split('.')[0];
      
      const qText = `Conforme al ${heading}, en relación con ${mainSentence.substring(0, 70)}..., ¿cuál es el plazo legalmente establecido?`;
      
      const correctOpt = `${num} ${unit}`;
      const wrong1 = `${parseInt(num) * 2} ${unit}`;
      const wrong2 = `${Math.max(1, Math.floor(parseInt(num) / 2))} ${unit}`;
      const wrong3 = `30 días hábiles`;

      const options = [correctOpt, wrong1, wrong2, wrong3];

      newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
    } 
    // Pattern 2: Organs / Competencies
    else if (organMatch) {
      const mainSentence = factText.split('.')[0];
      const qText = `En el marco de la normativa del ${heading}, ¿qué órgano o figura institucional tiene atribuida la competencia respecto a: "${mainSentence.substring(0, 80)}..."?`;
      
      const correctOpt = organMatch;
      const otherOrgans = COMMON_DISTRACTORS.organs.filter(o => o.toLowerCase() !== organMatch.toLowerCase());
      const shuffledOrgans = otherOrgans.sort(() => 0.5 - Math.random()).slice(0, 3);

      const options = [correctOpt, ...shuffledOrgans];

      newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
    }
    // Pattern 3: General Literal Concept Question
    else if (factText.length > 50) {
      const parts = factText.split(/[:–-]/);
      if (parts.length >= 2 && parts[0].trim().length > 10) {
        const concept = parts[0].replace(/[*_]/g, '').trim();
        const definition = parts.slice(1).join(' ').replace(/[*_]/g, '').trim();
        
        if (concept.length < 80 && definition.length > 20) {
          const qText = `Según el ${heading}, respecto a "${concept}", ¿cuál de las siguientes afirmaciones refleja exactamente la regulación oficial?`;
          
          const correctOpt = definition.substring(0, 110);
          const wrong1 = `Corresponde exclusivamente al personal de Grupo I sin requerir informe previo.`;
          const wrong2 = `Queda suspendido temporalmente hasta la aprobación del Reglamento de la BUS.`;
          const wrong3 = `Se aplica únicamente a los estudiantes de Doctorado y PDI de la Universidad de Sevilla.`;

          const options = [correctOpt, wrong1, wrong2, wrong3];

          newQ = createStructuredQuestion(qText, options, 0, factText, heading, topicId);
        }
      }
    }

    if (newQ) {
      // Check anti-duplication against existing questions in quizzesData AND already generated in this batch
      const dupCheck = checkDuplicated(newQ.question, topicId);
      const isAlreadyInBatch = generated.some(g => calculateSimilarity(g.question, newQ.question) > 0.6);

      if (!dupCheck.isDuplicated && !isAlreadyInBatch) {
        generated.push(newQ);
      }
    }
  }

  // Fallback if not enough questions generated algorithmically: create structured template questions
  while (generated.length < count) {
    const fallbackNum = generated.length + 1;
    const qText = `Conforme al contenido oficial del Tema ${topicId} (${topicTitle}), señale la opción correcta referente a las atribuciones normativas y procedimentales (Cuestión inédita #${fallbackNum}):`;
    const correctOpt = `Las actuaciones se rigen de acuerdo con el texto literal regulador del Tema ${topicId}.`;
    const options = [
      correctOpt,
      `Requiere autorización expresa del Consejo Social en un plazo improrrogable de 5 días.`,
      `Incurre en falta grave con sanción directa de expulsión inmediata.`,
      `Se aplica únicamente a usuarios externos sin UVUS activo.`
    ];
    const newQ = createStructuredQuestion(qText, options, 0, `Contenido regulado en la normativa oficial del Tema ${topicId}.`, `Tema ${topicId} — ${topicTitle}`, topicId);
    generated.push(newQ);
  }

  return generated;
}

// Crea un objeto de pregunta estructurado con opciones barajadas
function createStructuredQuestion(rawQText, rawOptions, rawCorrectIdx, rawFact, heading, topicId) {
  const correctOptionText = rawOptions[rawCorrectIdx];
  const shuffledOptions = [...rawOptions].sort(() => 0.5 - Math.random());
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

  // Format options A), B), C), D)
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
