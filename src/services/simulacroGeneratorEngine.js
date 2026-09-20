/**
 * Motor de Generación y Ensamblado de Exámenes Simulacro Equilibrados
 * Universidad de Sevilla - Técnico/a Auxiliar de Biblioteca (Código 4140)
 * 
 * Estructura Oficial US (17/09/2026):
 * - 45 Preguntas Totales (40 Ordinarias Puntuables + 5 de Reserva).
 * - Reparto Equilibrado entre los 20 temas (~2.25 preguntas por tema).
 * - Exclusión estricta de reactivos/químicos (Píldora 87 descartada).
 * - Instrucciones oficiales limpias de la prueba integradas.
 */

import quizzesData from '../data/quizzes.json';
import topicsData from '../data/topics.json';
import { generateNewQuestionsForTopic, extractTopicSummary } from './testGeneratorEngine';
import { generateAITest } from './aiTestGenerator';

export const OFFICIAL_US_INSTRUCTIONS = {
  title: "INSTRUCCIONES PARA LA CUMPLIMENTACIÓN DE LA HOJA DE EXAMEN",
  rules: [
    "Para realizar el ejercicio ha de utilizarse obligatoriamente bolígrafo, que podrá ser de color azul o negro (no deberá usarse bolígrafo de tinta líquida).",
    "Todas las instrucciones de cumplimentación de la hoja están indicadas al dorso de la misma.",
    "No escriba ningún dato ni firma en la parte derecha del impreso, en la cual sólo deben aparecer las respuestas a las preguntas.",
    "La forma de señalar las opciones preferidas es marcar completamente la casilla de la alternativa elegida, pero sin salirse de la misma, en el recuadro correspondiente a la pregunta.",
    "No se estimará correcta la contestación dada a una pregunta rodeada con un círculo, con una cruz o con cualquiera otra marca que no consista en sombrear el casillero de la opción preferida.",
    "De equivocarse la persona opositora en la opción preferida y querer modificarla, deberá marcar la casilla inmediatamente inferior a la que quiere corregir en la fila «ANULAR», volviendo a marcar en la línea superior la respuesta que considere correcta.",
    "Los teléfonos móviles deben ser desconectados y colocados fuera del alcance de los interesados, en el espacio de separación habilitado al efecto, encontrándose visibles al personal responsable de las aulas."
  ],
  recommendations: [
    "Acudir con antelación suficiente a la hora de llamamiento al aula asignada.",
    "No olvidar el documento de identificación: DNI, Pasaporte, NIE, Carné de Conducir u otro documento oficial que indubitadamente permita acreditar la identidad.",
    "Se recomienda asistir bien hidratado y habiendo realizado previamente una ingesta adecuada."
  ],
  headerLeft: [
    "Primer Apellido, Segundo Apellido, Nombre y Fecha.",
    "Cumplimentar los dígitos del DNI, según modelo del impreso.",
    "Firmar dentro del casillero.",
    "Ejercicio: Código 4140 (Técnico/a Auxiliar de Biblioteca, Archivo y Museo)"
  ],
  signatureTitle: "LA JEFA DE SERVICIO DE SELECCIÓN PTGAS"
};

/**
 * Genera un Examen Simulacro Equilibrado completo de 45 preguntas (40 + 5 reserva)
 * @param {Object} options 
 * @param {'clasico'|'ia'|'banco'|'hibrido'} options.engineMode
 * @param {Array<number>} [options.selectedTopics] - Temas a incluir (por defecto 1 a 20)
 * @param {string} [options.title] - Título personalizado del simulacro
 * @param {string} [options.apiKey] - Clave API de Gemini si se usa IA
 */
export async function generateBalancedSimulacro({ engineMode = 'clasico', selectedTopics = null, title = null, apiKey = null } = {}) {
  const activeTopicIds = selectedTopics || Array.from({ length: 20 }, (_, i) => i + 1);
  const totalQuestionsTarget = 45; // 40 ordinarias + 5 reserva
  
  // Calcular distribución base de preguntas por tema
  const basePerTopic = Math.floor(totalQuestionsTarget / activeTopicIds.length); // e.g. 2 preguntas por tema
  let remainder = totalQuestionsTarget - (basePerTopic * activeTopicIds.length); // 5 preguntas sobrantes asignadas a temas clave

  const topicAllocations = {};
  activeTopicIds.forEach(tId => {
    topicAllocations[tId] = basePerTopic + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  });

  let allQuestions = [];

  for (const topicId of activeTopicIds) {
    const qCountNeeded = topicAllocations[topicId];
    if (qCountNeeded <= 0) continue;

    let topicQuestions = [];

    if (engineMode === 'banco' || engineMode === 'hibrido') {
      // 1. Cargar del banco validado quizzes.json (filtrando Píldora 87 / reactivos químicos)
      const topicStr = topicId.toString();
      const rawBank = quizzesData[topicStr] || [];
      const safeBank = rawBank.filter(q => {
        const text = (q.question + ' ' + (q.options || []).join(' ')).toLowerCase();
        return !text.includes('píldora 87') && !text.includes('pildora 87') && !text.includes('reactivos químicos') && !text.includes('esterilizar');
      });

      if (safeBank.length > 0) {
        const shuffled = [...safeBank].sort(() => 0.5 - Math.random());
        topicQuestions = shuffled.slice(0, qCountNeeded);
      }
    }

    if (topicQuestions.length < qCountNeeded && engineMode !== 'banco') {
      const remainingCount = qCountNeeded - topicQuestions.length;
      const padId = topicId.toString().padStart(2, '0');
      
      try {
        const res = await fetch(`/markdown/tema-${padId}.md`);
        if (res.ok) {
          const markdownText = await res.text();
          const topicObj = topicsData.find(t => t.id === topicId) || { title: `Tema ${topicId}` };

          if (engineMode === 'ia' && apiKey) {
            const aiGenerated = await generateAITest({
              topicId: topicId.toString(),
              topicTitle: topicObj.title,
              markdownText,
              count: remainingCount,
              apiKey
            });
            if (aiGenerated && aiGenerated.length > 0) {
              topicQuestions = [...topicQuestions, ...aiGenerated];
            }
          } else {
            const classicGenerated = await generateNewQuestionsForTopic({
              topicId,
              topicTitle: topicObj.title,
              markdownText,
              count: remainingCount
            });
            if (classicGenerated && classicGenerated.length > 0) {
              topicQuestions = [...topicQuestions, ...classicGenerated];
            }
          }
        }
      } catch (err) {
        console.warn(`Aviso cargando markdown para Tema ${topicId}:`, err);
      }
    }

    topicQuestions.forEach(q => {
      q.topicId = topicId;
      allQuestions.push(q);
    });
  }

  if (allQuestions.length > totalQuestionsTarget) {
    allQuestions = allQuestions.slice(0, totalQuestionsTarget);
  }

  const finalQuestions = allQuestions.map((q, idx) => {
    const qNum = idx + 1;
    const isReserve = qNum > 40;
    return {
      ...q,
      id: qNum,
      isReserve,
      reserveTag: isReserve ? `[PREGUNTA DE RESERVA Nº ${qNum - 40}]` : null
    };
  });

  const simulacroTitle = title || `Simulacro Oficial #1 — Examen Global (45 Preguntas Equilibradas)`;

  return {
    title: simulacroTitle,
    type: 'simulacro',
    questionsCount: finalQuestions.length,
    questions: finalQuestions,
    instructions: OFFICIAL_US_INSTRUCTIONS,
    createdAt: new Date().toISOString()
  };
}
