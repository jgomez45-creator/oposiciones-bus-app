export const downloadTestAsHTML = (questions, title, studentId, projectId = 'oposiciones-bus-app', summaryText = '') => {
  const cssStyles = `
    body { font-family: 'Inter', system-ui, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 20px; display: flex; justify-content: center; }
    .container { max-width: 800px; width: 100%; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    h1 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
    .summary-box { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 20px; margin-bottom: 30px; }
    .summary-title { font-weight: 700; font-size: 1.1rem; color: #166534; margin-bottom: 12px; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; }
    .summary-body { font-size: 0.95rem; line-height: 1.6; color: #1e293b; }
    .question-card { margin-bottom: 25px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .question-text { font-size: 1.125rem; font-weight: 600; margin-bottom: 15px; }
    .option { display: block; padding: 10px 15px; margin-bottom: 10px; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .option:hover { background: #f3f4f6; border-color: #9ca3af; }
    .option input { margin-right: 10px; }
    .btn { background: #2563eb; color: white; border: none; padding: 12px 24px; font-size: 1rem; font-weight: 600; border-radius: 6px; cursor: pointer; width: 100%; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .result-container { display: none; text-align: center; margin-top: 30px; padding: 20px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; color: #065f46; }
    .result-score { font-size: 2rem; font-weight: bold; margin-bottom: 10px; }
    .correct { background-color: #d1fae5 !important; border-color: #10b981 !important; }
    .incorrect { background-color: #fee2e2 !important; border-color: #ef4444 !important; }
  `;

  const jsLogic = `
    const TEST_DATA = ${JSON.stringify(questions)};
    const STUDENT_ID = "${studentId}";
    const PROJECT_ID = "${projectId}";
    const TITLE = "${title}";
    
    let answers = {};

    function renderQuestions() {
      const form = document.getElementById('quiz-form');
      TEST_DATA.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.id = 'qcard-' + index;
        
        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.innerText = (index + 1) + ". " + q.question;
        card.appendChild(qText);

        q.options.forEach((opt, optIndex) => {
          const label = document.createElement('label');
          label.className = 'option';
          label.id = 'label-' + index + '-' + optIndex;
          
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'q' + index;
          radio.value = optIndex;
          radio.onchange = () => { answers[index] = optIndex; };
          
          label.appendChild(radio);
          label.appendChild(document.createTextNode(opt));
          card.appendChild(label);
        });

        form.appendChild(card);
      });
    }

    async function submitQuiz() {
      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.innerText = "Corrigiendo...";

      let score = 0;
      let detailedResults = [];

      TEST_DATA.forEach((q, index) => {
        const selected = answers[index];
        const correct = q.correctAnswer;
        
        let isCorrect = false;
        if (selected !== undefined) {
          if (selected === correct) {
            score += 1;
            isCorrect = true;
            document.getElementById('label-' + index + '-' + selected).classList.add('correct');
          } else {
            score -= 0.33; // Standard penalty, adjust if needed
            document.getElementById('label-' + index + '-' + selected).classList.add('incorrect');
            document.getElementById('label-' + index + '-' + correct).classList.add('correct');
          }
        } else {
          document.getElementById('label-' + index + '-' + correct).classList.add('correct');
        }

        detailedResults.push({
          questionId: q.id,
          selectedAnswer: selected !== undefined ? selected : null,
          correctAnswer: correct,
          isCorrect: isCorrect
        });

        // Disable inputs
        const inputs = document.getElementsByName('q' + index);
        inputs.forEach(input => input.disabled = true);
      });

      // Show results
      const resContainer = document.getElementById('result-container');
      const resScore = document.getElementById('result-score');
      const finalScore = Math.max(0, score).toFixed(2);
      const maxScore = TEST_DATA.length;
      
      resScore.innerText = \`\${finalScore} / \${maxScore}\`;
      resContainer.style.display = 'block';
      btn.style.display = 'none';

      // Secretly send to Firebase Firestore via REST API
      if (STUDENT_ID) {
        try {
          const firestoreUrl = \`https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/(default)/documents/test_results\`;
          
          // Format data for Firestore REST API
          const docData = {
            fields: {
              studentId: { stringValue: STUDENT_ID },
              title: { stringValue: TITLE },
              score: { doubleValue: parseFloat(finalScore) },
              maxScore: { doubleValue: maxScore },
              timestamp: { timestampValue: new Date().toISOString() },
              details: { stringValue: JSON.stringify(detailedResults) }
            }
          };

          fetch(firestoreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docData)
          }).catch(e => console.error(e));
        } catch (error) {
          console.error(error);
        }
      }
    }

    window.onload = renderQuestions;
  `;

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${cssStyles}</style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        ${summaryText ? `
        <div class="summary-box">
            <div class="summary-title">📌 Resumen Ejecutivo y Puntos Clave del Tema</div>
            <div class="summary-body">${summaryText}</div>
        </div>
        ` : ''}
        <div id="quiz-form"></div>
        <button id="submit-btn" class="btn" onclick="submitQuiz()">Corregir y Finalizar</button>
        
        <div id="result-container" class="result-container">
            <div>Test Completado</div>
            <div id="result-score" class="result-score"></div>
            <div>Tus respuestas han sido registradas.</div>
        </div>
    </div>
    <script>${jsLogic}</script>
</body>
</html>`;

  // Trigger download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test_${title.replace(/\s+/g, '_').toLowerCase()}_${studentId.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
