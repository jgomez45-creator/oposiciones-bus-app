export const downloadTestAsHTML = (questions, title, studentId = '', projectId = 'oposiciones-bus-app', summaryText = '') => {
  const cssStyles = `
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 20px; display: flex; justify-content: center; }
    .container { max-width: 800px; width: 100%; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    h1 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; font-size: 1.6rem; }
    .summary-box { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 20px; margin-bottom: 30px; }
    .summary-title { font-weight: 700; font-size: 1.1rem; color: #166534; margin-bottom: 12px; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; }
    .summary-body { font-size: 0.95rem; line-height: 1.6; color: #1e293b; }
    .question-card { margin-bottom: 25px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff; }
    .question-text { font-size: 1.05rem; font-weight: 600; margin-bottom: 15px; color: #0f172a; line-height: 1.5; }
    .option { display: block; padding: 12px 16px; margin-bottom: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; line-height: 1.5; }
    .option:hover { background: #f1f5f9; border-color: #94a3b8; }
    .option input { margin-right: 12px; }
    .btn { background: #2563eb; color: white; border: none; padding: 14px 24px; font-size: 1.05rem; font-weight: 700; border-radius: 8px; cursor: pointer; width: 100%; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .result-container { display: none; text-align: center; margin-top: 30px; padding: 20px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; color: #065f46; }
    .result-score { font-size: 2rem; font-weight: bold; margin-bottom: 10px; }
    .correct { background-color: #d1fae5 !important; border-color: #10b981 !important; color: #065f46 !important; font-weight: 600; }
    .incorrect { background-color: #fee2e2 !important; border-color: #ef4444 !important; color: #991b1b !important; }
  `;

  const jsLogic = `
    const TEST_DATA = ${JSON.stringify(questions)};
    const INITIAL_STUDENT_ID = ${JSON.stringify(studentId || '')};
    const PROJECT_ID = ${JSON.stringify(projectId)};
    const TITLE = ${JSON.stringify(title)};
    
    let answers = {};

    function getInvisibleStudentIdent() {
      if (INITIAL_STUDENT_ID && INITIAL_STUDENT_ID.trim() !== '') {
        return INITIAL_STUDENT_ID.trim();
      }
      
      let savedFingerprint = null;
      try { savedFingerprint = localStorage.getItem('bus_invisible_device_id'); } catch (_) {}
      
      if (!savedFingerprint) {
        const ua = navigator.userAgent || '';
        const isMobile = /mobile|android|iphone|ipad/i.test(ua);
        const devType = isMobile ? 'Móvil' : 'PC/Laptop';
        const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
        savedFingerprint = "Alumno (" + devType + " #" + randomHash + ")";
        try { localStorage.setItem('bus_invisible_device_id', savedFingerprint); } catch (_) {}
      }
      return savedFingerprint;
    }

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

        // Caja de Explicación Pedagógica del Concepto Clave
        const explanationText = q.explanation || "Fundamento de la norma aplicable según la regulación oficial de la BUS.";
        const expBox = document.createElement('div');
        expBox.id = 'explanation-' + index;
        expBox.className = 'explanation-box';
        expBox.style.display = 'none';
        expBox.style.marginTop = '14px';
        expBox.style.padding = '12px 16px';
        expBox.style.backgroundColor = '#f0fdf4';
        expBox.style.borderLeft = '4px solid #16a34a';
        expBox.style.borderRadius = '6px';
        expBox.style.color = '#166534';
        expBox.style.fontSize = '0.93rem';
        expBox.style.lineHeight = '1.5';
        expBox.innerHTML = "<strong>Concepto Clave y Justificación Legal:</strong><br/>" + explanationText;
        card.appendChild(expBox);

        form.appendChild(card);
      });
    }

    async function submitQuiz() {
      const btn = document.getElementById('submit-btn');
      const studentIdent = getInvisibleStudentIdent();

      if (btn) {
        btn.disabled = true;
        btn.innerText = "Corregiendo...";
      }

      try {
        let score = 0;
        let answeredCount = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let blankCount = 0;
        let detailedResults = [];

        TEST_DATA.forEach((q, index) => {
          const selected = answers[index];
          const correct = q.correctAnswer;
          
          let isCorrect = false;
          if (selected !== undefined) {
            answeredCount++;
            if (selected === correct) {
              score += 1;
              correctCount++;
              isCorrect = true;
              const l = document.getElementById('label-' + index + '-' + selected);
              if (l) l.classList.add('correct');
            } else {
              score -= 0.33;
              incorrectCount++;
              const lSel = document.getElementById('label-' + index + '-' + selected);
              if (lSel) lSel.classList.add('incorrect');
              const lCorr = document.getElementById('label-' + index + '-' + correct);
              if (lCorr) lCorr.classList.add('correct');
            }
          } else {
            blankCount++;
            const lCorr = document.getElementById('label-' + index + '-' + correct);
            if (lCorr) lCorr.classList.add('correct');
          }

          const expDiv = document.getElementById('explanation-' + index);
          if (expDiv) expDiv.style.display = 'block';

          detailedResults.push({
            questionId: q.id,
            selectedAnswer: selected !== undefined ? selected : null,
            correctAnswer: correct,
            isCorrect: isCorrect
          });

          const inputs = document.getElementsByName('q' + index);
          inputs.forEach(input => input.disabled = true);
        });

        const resContainer = document.getElementById('result-container');
        const resScore = document.getElementById('result-score');
        const resDetails = document.getElementById('result-details');
        
        const finalScore = Math.max(0, score).toFixed(2);
        const maxScore = TEST_DATA.length;
        const percentage = Math.max(0, Math.round((finalScore / maxScore) * 100));

        if (resScore) {
          resScore.innerText = "Nota Final: " + finalScore + " / " + maxScore + " (" + percentage + "%)";
        }
        
        if (resDetails) {
          resDetails.innerHTML = 
            '<div style="margin-bottom: 6px;"><strong>Total de preguntas:</strong> ' + maxScore + '</div>' +
            '<div style="margin-bottom: 6px;"><strong>Contestadas:</strong> ' + answeredCount + '</div>' +
            '<div style="margin-bottom: 6px; color: #166534;"><strong>Aciertos:</strong> ' + correctCount + '</div>' +
            '<div style="margin-bottom: 6px; color: #991b1b;"><strong>Errores (-0.33):</strong> ' + incorrectCount + '</div>' +
            '<div style="margin-bottom: 6px; color: #854d0e;"><strong>No contestadas:</strong> ' + blankCount + '</div>' +
            '<div style="margin-top: 10px; font-weight: bold; border-top: 1px dashed #cbd5e1; padding-top: 6px;"><strong>Porcentaje neto de acierto:</strong> ' + percentage + '%</div>';
        }
        
        if (resContainer) resContainer.style.display = 'block';
        if (btn) btn.style.display = 'none';

        // REGISTRO SILENCIOSO DE TELEMETRÍA E IDENTIDAD (100% INVISIBLE AL ALUMNO)
        const payloadObj = {
          id: 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2,6),
          studentId: studentIdent,
          title: TITLE,
          score: parseFloat(finalScore),
          maxScore: maxScore,
          timestamp: new Date().toISOString(),
          details: detailedResults
        };

        try {
          const mockKey = 'bus_mock_test_results';
          const raw = localStorage.getItem(mockKey) || '[]';
          const list = JSON.parse(raw);
          list.unshift(payloadObj);
          localStorage.setItem(mockKey, JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}

        const firestoreUrl = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/test_results";
        const docData = {
          fields: {
            studentId: { stringValue: studentIdent },
            title: { stringValue: TITLE },
            score: { doubleValue: parseFloat(finalScore) },
            maxScore: { doubleValue: maxScore },
            timestamp: { timestampValue: payloadObj.timestamp },
            details: { stringValue: JSON.stringify(detailedResults) }
          }
        };

        fetch(firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData)
        }).catch(e => console.error("Telemetry silent write notice:", e));

      } catch (err) {
        console.error("Error al corregir test:", err);
        const resContainer = document.getElementById('result-container');
        if (resContainer) resContainer.style.display = 'block';
        if (btn) btn.style.display = 'none';
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
            <div class="summary-title">&#128204; Resumen Ejecutivo y Puntos Clave del Tema</div>
            <div class="summary-body">${summaryText}</div>
        </div>
        ` : ''}
        <div id="quiz-form"></div>
        <button id="submit-btn" class="btn" onclick="submitQuiz()">Corregir y Finalizar Test</button>
        
        <div id="result-container" class="result-container">
            <div style="font-size: 1.3rem; font-weight: 800; color: #065f46; margin-bottom: 10px;">&#128202; Test Completado</div>
            <div id="result-score" class="result-score"></div>
            <div id="result-details" style="text-align: left; background: #ffffff; padding: 18px; border-radius: 8px; border: 1px solid #a7f3d0; margin-top: 15px;"></div>
        </div>
    </div>
    <script>${jsLogic}</script>
</body>
</html>`;

  // Download generic or pre-tagged file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = studentId ? studentId.replace(/[^a-zA-Z0-9]/g, '_') : 'general';
  a.download = `test_${title.replace(/\s+/g, '_').toLowerCase()}_${safeName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
