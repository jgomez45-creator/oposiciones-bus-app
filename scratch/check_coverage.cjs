const fs = require('fs');
const path = require('path');

const examen = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'examen_2022.json'), 'utf8'));
const markdownDir = path.join(__dirname, '..', 'public', 'markdown');

let report = "# Análisis de Cobertura del Examen Oficial 2022 con el Temario Local\n\n";

let correctAnswersPossible = 0;
let totalQuestions = examen.length;
let partialQuestions = 0;
let uncoveredQuestions = 0;

examen.forEach(q => {
  const formattedNum = String(q.topicId).padStart(2, '0');
  const filename = `tema-${formattedNum}.md`;
  const filePath = path.join(markdownDir, filename);

  report += `### Pregunta ${q.id} (Tema ${q.topicId})\n`;
  report += `**Pregunta:** ${q.question}\n`;
  
  const correctText = q.options[q.correctAnswer];
  report += `**Respuesta Correcta:** ${correctText}\n`;

  if (!fs.existsSync(filePath)) {
    report += `❌ Archivo no encontrado: ${filename}\n\n`;
    uncoveredQuestions++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

  // Create keywords to search in the markdown content
  let found = false;
  let matches = [];

  let searchTerms = [];
  if (q.id === 1) searchTerms = ["2022-2026", "plan director"];
  else if (q.id === 2) searchTerms = ["comisión de la biblioteca", "junta técnica", "bibliotecas de área"];
  else if (q.id === 3) searchTerms = ["crai", "recursos para el aprendizaje"];
  else if (q.id === 4) searchTerms = ["faulkner-brown", "decálogo" || "decalogo" || "cualidades"];
  else if (q.id === 10) searchTerms = ["33", "economía" || "economia"];
  else if (q.id === 11) searchTerms = ["(0...)", "forma"];
  else if (q.id === 12) searchTerms = ["dewey", "cdu"];
  else if (q.id === 13) searchTerms = ["descubrimiento" || "fama"];
  else if (q.id === 14) searchTerms = ["acceso desde casa", "exterior" || "red", "recursos electrónicos" || "recursos electronicos"];
  else if (q.id === 15) searchTerms = ["comunidad universitaria", "préstamo interbibliotecario" || "prestamo interbibliotecario"];
  else if (q.id === 16) searchTerms = ["60", "profesorado" || "pdi"];
  else if (q.id === 17) searchTerms = ["intercampus", "propio campus" || "disponible"];
  else if (q.id === 18) searchTerms = [".xlsx", "macros"];
  else if (q.id === 19) searchTerms = ["owa", "antispam" || "correo no deseado"];
  else if (q.id === 20) searchTerms = ["rfid", "radiofrecuencia"];
  else if (q.id === 21) searchTerms = ["antihurto" || "detectores", "salida" || "acceso"];
  else if (q.id === 22) searchTerms = ["etiquetas", "caracteres" || "4 millones"];
  else if (q.id === 23) searchTerms = ["intercampus", "4 días laborables" || "4 dias laborables"];
  else if (q.id === 24) searchTerms = ["efqm 600" || "sello", "excelencia", "2022"];
  else if (q.id === 25) searchTerms = ["3 días laborables" || "3 dias laborables", "adquirido" || "compra" || "recepción"];
  else if (q.id === 26) searchTerms = ["vicerrectorado de investigación" || "investigacion", "depende"];
  else if (q.id === 27) searchTerms = ["seprus", "formulario", "notificación" || "riesgo"];
  else if (q.id === 28) searchTerms = ["pulsadores" || "alarma", "conserjería" || "control", "emergencia"];
  else if (q.id === 29) searchTerms = ["cooperar", "artículo 29" || "29", "obligación" || "obligaciones"];
  else if (q.id === 30) searchTerms = ["pinza", "libros", "agarres"];
  else if (q.id === 31) searchTerms = ["tft", "pantallas" || "pantalla"];
  else if (q.id === 35) searchTerms = ["consejo social", "recursos" || "financiación"];
  else if (q.id === 36) searchTerms = ["gerente" || "universidad", "comité de empresa" || "comite de empresa", "inferior"];
  else if (q.id === 37) searchTerms = ["concurso" || "traslado", "una vez al año" || "anualmente"];
  else if (q.id === 38) searchTerms = ["fijo" || "plantilla", "selectivos" || "oposición"];
  else if (q.id === 39) searchTerms = ["objeto", "igualdad", "circunstancias o condición" || "circunstancias"];
  else if (q.id === 40) searchTerms = ["aplicación" || "aplicacion", "empresas colaboradoras" || "externas"];
  else if (q.id === 41) searchTerms = ["cdu", "ordenación" || "ordenar"];
  else if (q.id === 42) searchTerms = ["folletos", "cajas cerradas" || "cajas", "ácido" || "acido"];
  else if (q.id === 43) searchTerms = ["delegado", "otra persona" || "tercero", "recogida" || "retire"];
  else if (q.id === 44) searchTerms = ["100 cm", "mesa"];
  else if (q.id === 45) searchTerms = ["referentes", "buentrato" || "buen trato", "atender" || "acogida"];

  searchTerms.forEach(term => {
    if (content.includes(term.toLowerCase())) {
      matches.push(term);
    }
  });

  if (matches.length === searchTerms.length) {
    found = true;
    correctAnswersPossible++;
    report += `✅ **CUBIERTO** (Coincidencia con todos los términos clave: ${matches.join(', ')})\n`;
  } else if (matches.length > 0) {
    partialQuestions++;
    report += `⚠️ **PARCIAL** (Términos clave encontrados: ${matches.join(', ')} / Faltan: ${searchTerms.filter(x => !matches.includes(x)).join(', ')})\n`;
  } else {
    uncoveredQuestions++;
    report += `❌ **NO CUBIERTO** (No se encontraron términos clave: ${searchTerms.join(', ')})\n`;
  }
  report += `\n`;
});

report += `## Resumen final\n`;
report += `* Total preguntas: ${totalQuestions}\n`;
report += `* Cubiertas al 100%: ${correctAnswersPossible}\n`;
report += `* Cubiertas parcialmente: ${partialQuestions}\n`;
report += `* No cubiertas o dudosas: ${uncoveredQuestions}\n`;

fs.writeFileSync(path.join(__dirname, 'coverage_report.md'), report, 'utf8');
console.log("Report generated successfully!");
