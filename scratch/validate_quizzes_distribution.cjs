const fs = require('fs');
const path = require('path');

const quizzesPath = path.join(__dirname, '../src/data/quizzes.json');

if (!fs.existsSync(quizzesPath)) {
  console.error('ERROR: No se encuentra el archivo quizzes.json');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
} catch (e) {
  console.error('ERROR: No se pudo parsear quizzes.json:', e);
  process.exit(1);
}

console.log('--- INICIANDO VALIDACIÓN DE LA BASE DE DATOS DE TESTS ---');

let errors = [];

// 1. Check each topic
for (let t = 1; t <= 20; t++) {
  const topicId = t.toString();
  const list = data[topicId];
  
  if (!list) {
    errors.push(`Tema ${topicId}: No existe en el archivo JSON.`);
    continue;
  }
  
  if (list.length !== 100) {
    errors.push(`Tema ${topicId}: Tiene ${list.length} preguntas en lugar de 100.`);
  }
  
  let dossierCount = 0;
  let simulacroCount = 0;
  
  list.forEach((q, index) => {
    const expectedId = index + 1;
    if (q.id !== expectedId) {
      errors.push(`Tema ${topicId}, Pregunta ${index}: Tiene ID ${q.id} en lugar de ${expectedId}.`);
    }
    
    if (q.usage === 'dossier') {
      dossierCount++;
      if (expectedId > 70) {
        errors.push(`Tema ${topicId}, Pregunta ${expectedId}: Marcada como 'dossier' pero está fuera del rango (1-70).`);
      }
    } else if (q.usage === 'simulacro') {
      simulacroCount++;
      if (expectedId <= 70) {
        errors.push(`Tema ${topicId}, Pregunta ${expectedId}: Marcada como 'simulacro' pero está dentro del rango (1-70).`);
      }
      
      const expectedExamId = Math.floor((expectedId - 71) / 2) + 1;
      if (q.simulacroExamId !== expectedExamId) {
        errors.push(`Tema ${topicId}, Pregunta ${expectedId}: Tiene simulacroExamId ${q.simulacroExamId} en lugar del esperado ${expectedExamId}.`);
      }
    } else {
      errors.push(`Tema ${topicId}, Pregunta ${expectedId}: Tiene un 'usage' inválido: '${q.usage}'.`);
    }
  });
  
  if (dossierCount !== 70) {
    errors.push(`Tema ${topicId}: Tiene ${dossierCount} preguntas de dossier en lugar de 70.`);
  }
  if (simulacroCount !== 30) {
    errors.push(`Tema ${topicId}: Tiene ${simulacroCount} preguntas de simulacro en lugar de 30.`);
  }
}

// 2. Check each of the 15 mock exams
for (let examId = 1; examId <= 15; examId++) {
  let examQuestions = [];
  let topicCounts = {};
  
  for (let t = 1; t <= 20; t++) {
    const topicId = t.toString();
    const list = data[topicId] || [];
    
    const questionsForExam = list.filter(q => q.usage === 'simulacro' && q.simulacroExamId === examId);
    
    topicCounts[topicId] = questionsForExam.length;
    examQuestions.push(...questionsForExam);
  }
  
  if (examQuestions.length !== 40) {
    errors.push(`Simulacro ${examId}: Tiene ${examQuestions.length} preguntas en total en lugar de 40.`);
  }
  
  Object.entries(topicCounts).forEach(([topicId, count]) => {
    if (count !== 2) {
      errors.push(`Simulacro ${examId}, Tema ${topicId}: Contiene ${count} preguntas en lugar de 2.`);
    }
  });
}

if (errors.length > 0) {
  console.error('\n❌ SE ENCONTRARON ERRORES DE VALIDACIÓN:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log('\n✅ VALIDACIÓN EXITOSA: La base de datos cumple perfectamente con la proporción 70/30 en todos los temas.');
  console.log('  - Total temas: 20');
  console.log('  - Total preguntas: 2000 (100 por tema)');
  console.log('  - Dossier: 1400 preguntas (70 por tema)');
  console.log('  - Simulacro: 600 preguntas (30 por tema)');
  console.log('  - 15 Exámenes de 40 preguntas sin duplicados válidos.');
  process.exit(0);
}
