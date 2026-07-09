const fs = require('fs');
const path = require('path');

const quizzesPath = path.join(__dirname, '../src/data/quizzes.json');
const quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));

// The 7 new questions covering the recent content expansions (Red de Referentes, Normativa 2024/25, and US exam scoring)
const expandedQuestions = [
  {
    "id": 42,
    "question": "¿En qué fecha aprobó el Consejo de Gobierno de la Universidad de Sevilla la vigente 'Normativa para la prevención, evaluación e intervención en situaciones de violencia, discriminación y acoso'?",
    "options": [
      "El 12 de febrero de 2025.",
      "El 18 de diciembre de 2024.",
      "El 15 de marzo de 2018.",
      "El 25 de febrero de 2022."
    ],
    "correctAnswer": 1,
    "explanation": "El Consejo de Gobierno de la US aprobó esta normativa clave el 18 de diciembre de 2024 (Acuerdo 9.1), y se publicó en el BOUS el 12 de febrero de 2025.",
    "usage": "dossier"
  },
  {
    "id": 43,
    "question": "La vigente normativa contra el acoso de la Universidad de Sevilla de finales de 2024 deroga y unifica en un solo texto regulador:",
    "options": [
      "Las directrices de la Ley de Convivencia y el régimen del PTGAS de la BUS de 2007.",
      "Los anteriores protocolos de acoso sexual y por razón de sexo (2013) y de acoso moral y laboral (2018).",
      "El plan de prevención de riesgos psicosociales y las sanciones del IV Convenio Colectivo.",
      "El estatuto del estudiante y las normas de permanencia."
    ],
    "correctAnswer": 1,
    "explanation": "La normativa unifica la regulación frente a todos los tipos de acoso y violencia en la US, derogando los antiguos protocolos independientes de 2013 y 2018.",
    "usage": "dossier"
  },
  {
    "id": 44,
    "question": "¿En qué año fue creada la Red de Referentes para la Convivencia y el Buentrato de la Universidad de Sevilla y por quién está integrada?",
    "options": [
      "En 2013, integrada únicamente por miembros de la Inspección de Servicios y el Rectorado.",
      "En 2018, integrada por voluntarios del PDI y del PTGAS/PAS de los distintos centros y servicios.",
      "En 2021, integrada exclusivamente por psicólogos del SEPRUS y de la Unidad de Igualdad.",
      "En 2025, integrada por estudiantes elegidos democráticamente por sorteo."
    ],
    "correctAnswer": 1,
    "explanation": "La Red de Referentes se constituyó en 2018 con personal voluntario del PDI y PTGAS/PAS (incluyendo la BUS) en cada facultad y centro.",
    "usage": "dossier"
  },
  {
    "id": 45,
    "question": "Las personas voluntarias que forman la Red de Referentes para la Convivencia y el Buentrato de la US reciben una formación especializada de:",
    "options": [
      "10 horas de sensibilización online básica.",
      "Más de 100 horas lectivas en mediación, igualdad, resolución de conflictos y riesgos psicosociales.",
      "Un máster universitario oficial de 60 créditos ECTS.",
      "30 horas organizadas exclusivamente por el SEPRUS."
    ],
    "correctAnswer": 1,
    "explanation": "Los referentes cuentan con una sólida capacitación de más de 100 horas en mediación, género y prevención de conflictos interpersonales.",
    "usage": "dossier"
  },
  {
    "id": 46,
    "question": "¿Con qué galardón oficial fue reconocida en el año 2021 la Red de Referentes para la Convivencia y el Buentrato de la Universidad de Sevilla?",
    "options": [
      "El Premio al Mérito en el Trabajo del Ministerio de Educación.",
      "El Premio a la Mujer Sevillana en su modalidad colectiva, otorgado por el Ayuntamiento de Sevilla.",
      "El Sello de Calidad y Excelencia EFQM 500 de la BUS.",
      "El Premio Nacional de Convivencia Universitaria del Ministerio de Universidades."
    ],
    "correctAnswer": 1,
    "explanation": "El Ayuntamiento de Sevilla galardonó en 2021 a la Red con el Premio a la Mujer Sevillana por su labor en pro de la igualdad y la prevención de riesgos psicosociales.",
    "usage": "dossier"
  },
  {
    "id": 47,
    "question": "Respecto a la tramitación del protocolo de acoso en la US, ¿cuál es una función principal de las personas pertenecientes a la Red de Referentes para la Convivencia y el Buentrato?",
    "options": [
      "Instruir de manera formal el expediente y redactar la propuesta de sanción disciplinaria.",
      "Actuar como punto de contacto de proximidad y confianza para acoger informalmente consultas, sensibilizar y orientar sobre la derivación del caso.",
      "Adoptar las medidas cautelares provisionales de traslado del presunto acosador.",
      "Sustituir el papel instructor del Comité Técnico CPEIA y del SEPRUS en la valoración inicial."
    ],
    "correctAnswer": 1,
    "explanation": "Los referentes actúan como primer contacto de proximidad y confianza, realizando una labor preventiva y de orientación, pero no instruyen ni resuelven expedientes.",
    "usage": "dossier"
  },
  {
    "id": 48,
    "question": "En los exámenes de oposición de la Universidad de Sevilla (PTGAS), ¿cómo se calcula habitualmente la penalización por respuestas erróneas en los cuestionarios tipo test?",
    "options": [
      "Cada error resta el equivalente a media pregunta correcta (1/2), y las preguntas en blanco restan un cuarto (1/4).",
      "Cada 4 errores restan el valor de una pregunta correcta (1/4 de penalización por error), y las preguntas dejadas en blanco no penalizan.",
      "Los errores no penalizan en absoluto, sumándose únicamente las respuestas correctas sobre el total.",
      "Cada error resta una pregunta correcta completa (1 por 1), y las dejadas en blanco penalizan la mitad de una pregunta."
    ],
    "correctAnswer": 1,
    "explanation": "De acuerdo con los criterios estándar de la US, cada error penaliza con la pérdida de 1/4 del valor de una pregunta correcta (fórmula clásica de aciertos menos errores/4), mientras que las respuestas en blanco no penalizan.",
    "usage": "dossier"
  }
];

// Replace the questions at indices 41 to 47 (IDs 42 to 48) of topic "20"
const topic20 = quizzes["20"];
if (topic20 && topic20.length >= 48) {
  for (let i = 0; i < expandedQuestions.length; i++) {
    const targetIdx = 41 + i; // index for IDs 42 to 48
    topic20[targetIdx] = expandedQuestions[i];
  }
  fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2), 'utf8');
  console.log('Successfully inserted the 7 new questions in quizzes.json for Topic 20.');
} else {
  console.error('Error: Topic 20 array length is insufficient.');
}
