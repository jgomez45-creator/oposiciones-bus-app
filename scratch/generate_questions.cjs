const fs = require('fs');
const path = require('path');

const quizzesPath = path.join(__dirname, '../src/data/quizzes.json');
const topicsPath = path.join(__dirname, '../src/data/topics.json');
const markdownDir = path.join(__dirname, '../public/markdown');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: Por favor, define la variable de entorno GEMINI_API_KEY.');
  console.error('Ejemplo en PowerShell: $env:GEMINI_API_KEY="tu_clave_aquí"; node scratch/generate_questions.cjs');
  process.exit(1);
}

// Helper to delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateForTopic(topicId, needed, topicTitle, topicSubtitle, markdownText) {
  if (needed <= 0) return [];

  const prompt = `
Eres un preparador experto de oposiciones para la categoría de Técnico/a Auxiliar de Biblioteca, Archivo y Museo de la Universidad de Sevilla.
Debes generar exactamente ${needed} preguntas tipo test de opción múltiple con 4 opciones (A, B, C, D), la respuesta correcta (índice 0 para A, 1 para B, 2 para C, 3 para D) y una explicación/justificación detallada que mencione las leyes o normativas correspondientes.

Debes basarte estrictamente en el siguiente contenido oficial del tema (que es un extracto del temario):
Tema: ${topicTitle}
Detalles del temario: ${topicSubtitle}

Contenido oficial del tema en Markdown:
"""
${markdownText}
"""

Requisitos de las preguntas:
1. Deben ser rigurosas, de nivel intermedio-alto (adecuado para oposiciones de la US).
2. Deben cubrir de forma uniforme todos los conceptos y apartados presentes en el texto del tema.
3. No dupliques conceptos de forma idéntica; haz preguntas variadas (ej. plazos, definiciones, competencias de órganos, clasificaciones).
4. El formato de salida DEBE ser un array JSON que contenga los objetos correspondientes a las preguntas generadas.

Esquema del JSON esperado:
\`\`\`json
[
  {
    "question": "¿Cuál es...?",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctAnswer": 0,
    "explanation": "La justificación detallada..."
  }
]
\`\`\`
Genera el JSON directamente. No incluyas explicaciones antes o después del bloque JSON.
  `;

  // We call the Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Generando tanda de ${needed} preguntas para el Tema ${topicId}... (Intento ${attempts + 1}/${maxAttempts})`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.candidates[0].content.parts[0].text;
        
        // Parse JSON
        let questions = JSON.parse(text.trim());
        if (!Array.isArray(questions)) {
          throw new Error("El resultado devuelto por la API no es un array de preguntas.");
        }
        return questions;
      }

      const statusCode = response.status;
      const errorText = await response.text();

      if (statusCode === 429 || statusCode === 503) {
        attempts++;
        let waitSeconds = 45;
        try {
          const errorJson = JSON.parse(errorText);
          const retryInfo = errorJson.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
          if (retryInfo && retryInfo.retryDelay) {
            const secondsMatch = retryInfo.retryDelay.match(/(\d+)/);
            if (secondsMatch) {
              waitSeconds = parseInt(secondsMatch[1], 10) + 2;
            }
          }
        } catch (e) {
          // ignore parsing error
        }
        console.warn(`Límite o sobrecarga detectada (${statusCode}). Esperando ${waitSeconds} segundos antes del reintento...`);
        await sleep(waitSeconds * 1000);
      } else {
        throw new Error(`API error (${statusCode}): ${errorText}`);
      }
    } catch (err) {
      if (err.message.includes('API error') || err.message.includes('JSON')) {
        throw err;
      }
      attempts++;
      console.warn(`Error de conexión o timeout. Esperando 15 segundos antes de reintentar: ${err.message}`);
      await sleep(15000);
    }
  }
  throw new Error(`Excedido el número máximo de intentos tras error de cuota.`);
}

async function main() {
  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  let quizzes = {};
  if (fs.existsSync(quizzesPath)) {
    quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
  }

  for (const topic of topics) {
    const idStr = topic.id.toString();
    const formattedId = idStr.padStart(2, '0');
    const mdPath = path.join(markdownDir, `tema-${formattedId}.md`);
    let markdownText = "";
    if (fs.existsSync(mdPath)) {
      markdownText = fs.readFileSync(mdPath, 'utf8');
    } else {
      console.warn(`Advertencia: No se encontró el archivo tema-${formattedId}.md`);
    }

    const currentQuestions = quizzes[idStr] || [];
    
    if (currentQuestions.length >= 100) {
      console.log(`Tema ${idStr} ya tiene ${currentQuestions.length} preguntas. Saltando.`);
      
      // Asegurar que las preguntas existentes tienen la estructura correcta de metadatos (usage y simulacroExamId)
      // por si acaso fueron añadidas sin ellas.
      let needsRestructure = currentQuestions.some(q => !q.usage);
      if (needsRestructure) {
        console.log(`Estructurando metadatos existentes para el Tema ${idStr}...`);
        const structuredQuestions = currentQuestions.map((q, index) => {
          const id = index + 1;
          const usage = id <= 70 ? 'dossier' : 'simulacro';
          const result = {
            id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            usage
          };
          if (usage === 'simulacro') {
            result.simulacroExamId = Math.floor((id - 71) / 2) + 1;
          }
          return result;
        });
        quizzes[idStr] = structuredQuestions;
        fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2), 'utf8');
      }
      continue;
    }

    try {
      let allNewQuestions = [];
      let currentPoolSize = currentQuestions.length;
      
      while (currentPoolSize < 100) {
        const neededInThisBatch = Math.min(25, 100 - currentPoolSize);
        // Generate batch
        const batch = await generateForTopic(topic.id, neededInThisBatch, topic.title, topic.subtitle, markdownText);
        allNewQuestions.push(...batch);
        currentPoolSize += batch.length;
        
        console.log(`Llevamos ${currentPoolSize}/100 preguntas para el Tema ${idStr}.`);
        await sleep(2500); // cooldown between batches
      }

      // Combine original with new questions
      const combined = [
        ...currentQuestions.map(q => ({ question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation })),
        ...allNewQuestions.map(q => ({ question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation }))
      ];

      // Limit to exactly 100
      const finalQuestions = combined.slice(0, 100);

      // Structure and add metadata
      const structuredQuestions = finalQuestions.map((q, index) => {
        const id = index + 1;
        const usage = id <= 70 ? 'dossier' : 'simulacro';
        const result = {
          id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          usage
        };
        if (usage === 'simulacro') {
          result.simulacroExamId = Math.floor((id - 71) / 2) + 1;
        }
        return result;
      });

      quizzes[idStr] = structuredQuestions;
      
      // Save progress incrementally
      fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2), 'utf8');
      console.log(`¡Tema ${idStr} guardado con éxito!`);
      
      await sleep(3000); // delay between topics
    } catch (err) {
      console.error(`Error procesando Tema ${idStr}:`, err.message);
      console.log('Se detiene el script. Puedes volver a ejecutarlo y continuará donde lo dejó.');
      process.exit(1);
    }
  }

  console.log('--- PROCESO COMPLETADO CON ÉXITO ---');
  console.log('Todas las preguntas se han estructurado en quizzes.json');
}

main();
