export const generateAITest = async ({ topicId, topicTitle, markdownText, count, apiKey }) => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const prompt = `
Eres un preparador experto de oposiciones. Tu tarea es generar un test de ${count} preguntas tipo test basado EXCLUSIVAMENTE en el siguiente texto del "${topicTitle}".

Reglas ESTRICTAS:
1. Cada pregunta DEBE tener exactamente 4 opciones (A, B, C, D).
2. SOLO UNA opción puede ser verdadera y correcta de acuerdo al texto.
3. Las otras 3 opciones (distractores) DEBEN ser TOTALMENTE FALSAS en el contexto de la pregunta, pero deben sonar plausibles y usar jerga del texto (por ejemplo, mezclando conceptos de otras secciones para engañar, o alterando rangos numéricos/fechas/órganos).
4. Prohibido usar negaciones vagas o perezosas como "No es cierto que..." o "Es falso que...". Formula afirmaciones directas que sean erróneas.
5. La gramática debe ser absolutamente perfecta. No cortes oraciones a la mitad ni omitas preposiciones importantes.
6. NO inventes información que no esté en el texto suministrado.
7. Devuelve el resultado ÚNICAMENTE en el formato JSON especificado abajo, sin texto adicional (ni markdown \`\`\`json).

Formato JSON requerido:
[
  {
    "q": "Enunciado de la pregunta",
    "options": [
      "A) [Opción 1]",
      "B) [Opción 2]",
      "C) [Opción 3]",
      "D) [Opción 4]"
    ],
    "correctAnswer": 0,
    "explanation": "Breve explicación de por qué es correcta basándose en el texto."
  }
]

Texto del tema:
${markdownText}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Low temperature for high accuracy
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Error al conectar con la API de Google Gemini");
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) {
      throw new Error("Respuesta vacía de la IA");
    }

    let cleanJson = textResult.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedQuestions = JSON.parse(cleanJson);
    
    // Add required metadata
    return parsedQuestions.map(q => ({
      ...q,
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topicId: topicId,
      topicTitle: topicTitle,
      correct: q.options[q.correctAnswer].replace(/^[A-D]\)\s*/, ''),
      question: q.q // Alias for compatibility
    }));
    
  } catch (error) {
    console.error("AI Generation error:", error);
    throw error;
  }
};
