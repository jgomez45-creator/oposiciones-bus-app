import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  const flashcardsPath = path.resolve(__dirname, '../src/data/flashcards.json');
  if (!fs.existsSync(flashcardsPath)) {
    console.error(`❌ No se encontró flashcards.json en: ${flashcardsPath}`);
    return;
  }

  // Parse flashcards.json
  const fileContent = fs.readFileSync(flashcardsPath, 'utf8');
  const flashcards = JSON.parse(fileContent);

  // New verified flashcards for Tema 18 based strictly on the PDF
  const verifiedFlashcards = [
    {
      "id": 1,
      "front": "Vacaciones anuales básicas (IV Convenio)",
      "back": "Un mes natural o 22 días hábiles retribuidos al año, con incrementos adicionales por antigüedad acumulada (de 23 a 26 días hábiles a partir de los 15 a 30 años de servicio)."
    },
    {
      "id": 2,
      "front": "Permiso retribuido por matrimonio (IV Convenio)",
      "back": "15 días naturales consecutivos, los cuales pueden acumularse al período vacacional ordinario."
    },
    {
      "id": 3,
      "front": "Días por asuntos particulares (IV Convenio)",
      "back": "Hasta 10 días al año, distribuidos a conveniencia del trabajador y condicionados a necesidades del servicio (tras un año completo de trabajo)."
    },
    {
      "id": 4,
      "front": "Sanciones por faltas muy graves (IV Convenio - Anexo III)",
      "back": "1) Suspensión de sueldo y empleo de 1 a 3 meses. 2) Suspensión del derecho a concurrir a pruebas selectivas o concursos de ascenso por un período de 2 a 3 años."
    },
    {
      "id": 5,
      "front": "Prescripción y cancelación de faltas y sanciones graves (IV Convenio - Anexo III)",
      "back": "Las faltas graves prescriben a los 20 días desde su conocimiento (límite de 6 meses desde comisión); sus sanciones se cancelan del expediente a los 3 años de su cumplimiento."
    }
  ];

  // Overwrite key "18"
  flashcards["18"] = verifiedFlashcards;

  // Save back to flashcards.json
  fs.writeFileSync(flashcardsPath, JSON.stringify(flashcards, null, 2), 'utf8');
  console.log(`✔ Se han sobrescrito con éxito las flashcards del Tema 18 en flashcards.json.`);
};

run().catch(console.error);
