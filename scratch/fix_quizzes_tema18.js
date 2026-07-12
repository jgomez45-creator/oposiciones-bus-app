import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  const quizzesPath = path.resolve(__dirname, '../src/data/quizzes.json');
  if (!fs.existsSync(quizzesPath)) {
    console.error(`❌ No se encontró quizzes.json en: ${quizzesPath}`);
    return;
  }

  // Parse quizzes.json
  const fileContent = fs.readFileSync(quizzesPath, 'utf8');
  const quizzes = JSON.parse(fileContent);

  // New verified questions for Tema 18 based strictly on the PDF
  const verifiedQuestions = [
    {
      "id": 1,
      "question": "¿A qué personal se aplica el IV Convenio Colectivo del Personal Laboral de las Universidades Públicas de Andalucía, según su Artículo 3?",
      "options": [
        "Únicamente al personal directivo y de libre designación.",
        "A todo el Personal de Administración y Servicios (PAS) laboral cuyas retribuciones se abonen con cargo al Capítulo I de los Presupuestos.",
        "Al personal funcionario docente y laboral de investigación exclusivamente.",
        "A todo el personal subcontratado y de empresas externas de servicios."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 3 establece la aplicación a todo el personal de Administración y Servicios vinculado mediante relación jurídico-laboral formalizada por el Rector o Gerente y cuyas retribuciones se abonen con cargo al Capítulo I de los Presupuestos.",
      "usage": "dossier"
    },
    {
      "id": 2,
      "question": "Según el Artículo 6 del IV Convenio Colectivo, ¿cuál es el ámbito temporal y su efecto retroactivo?",
      "options": [
        "Vigencia hasta el 31 de diciembre de 2010 y retroactividad al 1 de enero de 2005.",
        "Vigencia hasta el 31 de diciembre de 1990 y retroactividad al 1 de enero de 1989.",
        "Vigencia hasta el 31 de diciembre de 2006 y retroactividad al 1 de enero de 2003.",
        "Vigencia indefinida sin efectos retroactivos."
      ],
      "correctAnswer": 2,
      "explanation": "El Artículo 6 establece que su duración será hasta el 31 de Diciembre de 2.006, sin perjuicio de la retroactividad que se acuerda a 1 de enero de 2003.",
      "usage": "dossier"
    },
    {
      "id": 3,
      "question": "De acuerdo con el Artículo 8, ¿con qué antelación mínima debe notificarse la denuncia por escrito para pedir la revisión del convenio?",
      "options": [
        "Al menos un mes de antelación.",
        "Al menos dos meses de antelación.",
        "Al menos tres meses de antelación.",
        "Al menos quince días de antelación."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 8.1 dictamina que la denuncia solicitando la revisión del convenio deberá notificarse con una antelación mínima de dos meses a su vencimiento.",
      "usage": "dossier"
    },
    {
      "id": 4,
      "question": "Según el Artículo 13 de la Organización del Trabajo, ¿a quién corresponde en exclusiva la facultad y responsabilidad de organizar el trabajo?",
      "options": [
        "A los Comités de Empresa de forma unilateral.",
        "A las Gerencias de las Universidades.",
        "A la CIVEA.",
        "A la Junta de Andalucía."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 13.1 indica que la organización del trabajo es facultad y responsabilidad de las Gerencias de las Universidades, dentro de los límites legales.",
      "usage": "dossier"
    },
    {
      "id": 5,
      "question": "De acuerdo con el Artículo 15 de Clasificación Profesional, ¿qué titulación se requiere para integrarse en el Grupo III?",
      "options": [
        "Título de Licenciado, Arquitecto o Ingeniero.",
        "Título de Diplomado Universitario o Ingeniero Técnico.",
        "Título de B.U.P., Bachiller Superior, Formación Profesional de Segundo Grado (FP II) o equivalente.",
        "Certificado de Escolaridad únicamente."
      ],
      "correctAnswer": 2,
      "explanation": "El Grupo III requiere la posesión del título de B.U.P., Bachiller Superior, FP II, experiencia equivalente o haber superado las pruebas de acceso a la universidad para mayores de 25 años.",
      "usage": "dossier"
    },
    {
      "id": 6,
      "question": "Según el Artículo 15.3, ¿cuál es la duración mínima de experiencia laboral requerida para la equiparación con las titulaciones exigidas en el Grupo III y Grupo IV respectivamente?",
      "options": [
        "2 años para el Grupo III y 1 año para el Grupo IV.",
        "1 año para plazas integradas en el Grupo III y 6 meses para las del Grupo IV.",
        "6 meses para el Grupo III y 3 meses para el Grupo IV.",
        "No se contempla la equiparación por experiencia laboral."
      ],
      "correctAnswer": 1,
      "explanation": "Se considera equivalente la experiencia de 1 año para plazas del Grupo III y 6 meses para las integradas en el Grupo IV.",
      "usage": "dossier"
    },
    {
      "id": 7,
      "question": "De acuerdo con el Artículo 17.2, ¿cuál es el plazo máximo por el que un puesto de trabajo puede estar cubierto por desempeño de funciones de categoría de grupo superior?",
      "options": [
        "Máximo 6 meses.",
        "Máximo 12 meses.",
        "Máximo 18 meses.",
        "Máximo 2 años."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 17.2 indica que ningún puesto de trabajo podrá estar cubierto por tiempo superior a 12 meses en régimen de desempeño de funciones de categoría de grupo superior sin proceder a la convocatoria del proceso selectivo.",
      "usage": "dossier"
    },
    {
      "id": 8,
      "question": "Según el Artículo 27, la jornada reducida durante los periodos de vacaciones que determine el Calendario laboral correspondiente consistirá en una reducción diaria de:",
      "options": [
        "Una hora.",
        "Dos horas.",
        "Treinta minutos.",
        "Tres horas."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 27.b prescribe que durante los periodos de vacaciones correspondientes se verificará una reducción de la jornada de dos horas.",
      "usage": "dossier"
    },
    {
      "id": 9,
      "question": "¿De qué descanso mínimo semanal ininterrumpido dispone el trabajador de acuerdo con el Artículo 27 del IV Convenio?",
      "options": [
        "36 horas ininterrumpidas.",
        "48 horas ininterrumpidas.",
        "24 horas ininterrumpidas.",
        "48 horas pero fraccionables en dos periodos."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 27 establece de forma expresa que el descanso semanal será de 48 horas ininterrumpidas.",
      "usage": "dossier"
    },
    {
      "id": 10,
      "question": "Según el Artículo 27 (Horarios), entre jornada y jornada ordinaria de trabajo deberá observarse un descanso consecutivo de al menos:",
      "options": [
        "10 horas.",
        "12 horas.",
        "14 horas.",
        "8 horas."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 27 establece de forma explícita que entre jornada y jornada deberá observarse un descanso consecutivo de al menos 12 horas.",
      "usage": "dossier"
    },
    {
      "id": 11,
      "question": "De acuerdo con el Artículo 32, ¿cuántos días hábiles de vacaciones retribuidas anuales corresponden por cada año completo de servicio activo?",
      "options": [
        "20 días hábiles.",
        "22 días hábiles (o un mes natural).",
        "25 días hábiles.",
        "22 días naturales."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 32.1 reconoce el derecho a disfrutar de vacaciones retribuidas de un mes natural, o veintidós días hábiles anuales.",
      "usage": "dossier"
    },
    {
      "id": 12,
      "question": "Según el Artículo 32.2, si un trabajador tiene 25 años de servicio en la Administración, ¿a cuántos días hábiles de vacaciones anuales tiene derecho?",
      "options": [
        "23 días hábiles.",
        "24 días hábiles.",
        "25 días hábiles.",
        "26 días hábiles."
      ],
      "correctAnswer": 2,
      "explanation": "La escala de vacaciones por antigüedad del Art. 32.2 otorga: 23 días por 15 años, 24 días por 20 años, 25 días por 25 años y 26 días por 30 o más años de servicio.",
      "usage": "dossier"
    },
    {
      "id": 13,
      "question": "De acuerdo con el Artículo 32, ¿cuál es la compensación de días si se acuerda un período de vacaciones fuera de los meses de julio, agosto y septiembre por necesidades del servicio?",
      "options": [
        "Se incrementa el período vacacional en 3 días hábiles.",
        "Se incrementa el período vacacional en 5 días naturales.",
        "Se incrementa el período vacacional en 7 días naturales.",
        "No se concede ningún incremento ni compensación."
      ],
      "correctAnswer": 1,
      "explanation": "La regla general 3 del Art. 32 dispone que si se arbitra un periodo vacacional fuera de julio-septiembre, este será incrementado en 5 días naturales.",
      "usage": "dossier"
    },
    {
      "id": 14,
      "question": "Según el Artículo 33, ¿cuántos días hábiles de permiso retribuido corresponden durante las festividades de Navidad?",
      "options": [
        "3 días hábiles.",
        "5 días hábiles.",
        "7 días hábiles.",
        "4 días hábiles."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 33.1 señala que el trabajador tendrá derecho a permisos retribuidos de cinco días hábiles durante las festividades de Navidad.",
      "usage": "dossier"
    },
    {
      "id": 15,
      "question": "Según el Artículo 33, ¿cuántos días hábiles de permiso retribuido corresponden durante la Semana Santa o Feria?",
      "options": [
        "3 días hábiles.",
        "4 días hábiles.",
        "5 días hábiles.",
        "6 días hábiles."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 33.1 establece que el trabajador tendrá derecho a cuatro días hábiles durante la Semana Santa, Feria o festividades equivalentes.",
      "usage": "dossier"
    },
    {
      "id": 16,
      "question": "De acuerdo con el Artículo 33.2.a, ¿cuál es la duración del permiso retribuido por matrimonio?",
      "options": [
        "10 días naturales.",
        "15 días naturales.",
        "12 días hábiles.",
        "15 días hábiles."
      ],
      "correctAnswer": 1,
      "explanation": "El permiso por matrimonio es de 15 días naturales y puede ejercerse antes o después del hecho causante.",
      "usage": "dossier"
    },
    {
      "id": 17,
      "question": "Según el Artículo 33.2.b, ¿cuántos días de permiso retribuido corresponden por el nacimiento, adopción o acogida de un hijo?",
      "options": [
        "2 días naturales.",
        "4 días naturales.",
        "3 días hábiles.",
        "5 días naturales."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 33.2.b especifica un permiso retribuido de 4 días naturales por nacimiento, adopción o acogida.",
      "usage": "dossier"
    },
    {
      "id": 18,
      "question": "De acuerdo con el Artículo 33.2.c, ¿cuántos días hábiles de permiso corresponden por enfermedad o accidente graves, hospitalización o intervención quirúrgica del padre, cónyuge o hijo?",
      "options": [
        "2 días hábiles.",
        "4 días hábiles.",
        "3 días hábiles.",
        "5 días naturales."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 33.2.c otorga 4 días hábiles por enfermedad o accidente graves, hospitalización o intervención del padre, cónyuge o hijo.",
      "usage": "dossier"
    },
    {
      "id": 19,
      "question": "Según el Artículo 33.2.d, ¿cuántos días hábiles de permiso corresponden por enfermedad grave u hospitalización de familiares de primer grado por afinidad o hermanos?",
      "options": [
        "2 días hábiles.",
        "3 días hábiles.",
        "4 días hábiles.",
        "4 días naturales."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 33.2.d otorga 3 días hábiles por enfermedad o accidente graves u hospitalización de familiares de primer grado por afinidad o hermanos.",
      "usage": "dossier"
    },
    {
      "id": 20,
      "question": "De acuerdo con el Artículo 33.2.f, en caso de enfermedad terminal de cónyuge o hijo, ¿cuál es el plazo máximo de permiso y sus condiciones retributivas?",
      "options": [
        "Máximo 15 días con retribución al 100%.",
        "Hasta un máximo de 15 días, ampliables a 30, pero en el segundo periodo de ampliación no se devengará retribución.",
        "Máximo 30 días naturales no retribuidos.",
        "Hasta un máximo de 10 días hábiles totalmente retribuidos."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 33.2.f especifica que el permiso es de hasta un máximo de 15 días, ampliables a 30, si bien en el segundo periodo no se devengará retribución.",
      "usage": "dossier"
    },
    {
      "id": 21,
      "question": "Según el Artículo 33.2.g, ¿cuántos días naturales corresponden por fallecimiento del padre, cónyuge o hijo del trabajador?",
      "options": [
        "3 días naturales.",
        "5 días naturales.",
        "4 días hábiles.",
        "5 días hábiles."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 33.2.g otorga 5 días naturales por fallecimiento del padre, cónyuge o hijo del trabajador.",
      "usage": "dossier"
    },
    {
      "id": 22,
      "question": "De acuerdo con el Artículo 33.2.i, ¿cuál es el permiso básico por traslado de domicilio y sus ampliaciones por traslado de puesto de trabajo o a otra Universidad?",
      "options": [
        "1 día ampliable a 2 y 4 días respectivamente.",
        "2 días naturales, ampliables a 4 por traslado dentro de la provincia, y a 7 por traslado a otra Universidad.",
        "2 días hábiles no ampliables.",
        "3 días naturales ampliables a 5."
      ],
      "correctAnswer": 1,
      "explanation": "Por traslado de domicilio habitual corresponden 2 días naturales, ampliables a 4 por traslado de puesto dentro de la provincia, y a 7 si se deriva del traslado a otra Universidad.",
      "usage": "dossier"
    },
    {
      "id": 23,
      "question": "Según el Artículo 33.2.i, ¿cuántos días de asuntos particulares al año se conceden al trabajador tras cumplir un año de servicio?",
      "options": [
        "Hasta 6 días hábiles.",
        "Hasta 10 días al año.",
        "Hasta 9 días naturales.",
        "Hasta 5 días al año."
      ],
      "correctAnswer": 1,
      "explanation": "El Convenio establece en su Artículo 33.2.i (penúltimo punto) la concesión de hasta diez días al año por asuntos particulares, distribuidos a conveniencia del trabajador y condicionados a necesidades del servicio.",
      "usage": "dossier"
    },
    {
      "id": 24,
      "question": "De acuerdo con el Artículo 34, ¿cuál es la duración mínima y máxima de las licencias no retribuidas?",
      "options": [
        "Mínimo 7 días y máximo 1 mes.",
        "Mínimo 15 días y máximo de tres meses.",
        "Mínimo 1 mes y máximo 6 meses.",
        "Mínimo 15 días y máximo de dos meses."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 34 establece que la licencia no retribuida para personal con al menos un año de antigüedad tendrá una duración mínima de 15 días y máxima de tres meses.",
      "usage": "dossier"
    },
    {
      "id": 25,
      "question": "Según el Anexo III (Régimen Disciplinario), la falta de asistencia al trabajo sin causa justificada de 1 o 2 días en un mes se califica como:",
      "options": [
        "Falta leve.",
        "Falta grave.",
        "Falta muy grave.",
        "Infracción no sancionable."
      ],
      "correctAnswer": 0,
      "explanation": "El Anexo III.a.4 tipifica como falta leve la falta de asistencia al trabajo sin causa justificada de uno o dos días en el plazo de un mes natural.",
      "usage": "dossier"
    },
    {
      "id": 26,
      "question": "De acuerdo con el Anexo III, ¿cuál es el plazo de prescripción para las faltas muy graves contado desde que la Universidad tiene conocimiento de su comisión?",
      "options": [
        "A los 30 días.",
        "A los 60 días (sesenta días).",
        "A los 90 días.",
        "A los 20 días."
      ],
      "correctAnswer": 1,
      "explanation": "El Anexo III.2 establece que las faltas graves prescriben a los veinte días y las muy graves a los sesenta días desde que la administración tuvo conocimiento de ellas.",
      "usage": "dossier"
    },
    {
      "id": 27,
      "question": "Según el Anexo III, ¿cuál es el límite absoluto de tiempo desde que ocurrió el hecho para que prescriba cualquier tipo de falta?",
      "options": [
        "A los 3 meses.",
        "A los 6 meses.",
        "Al año de cometerse.",
        "No prescribe nunca de forma absoluta."
      ],
      "correctAnswer": 1,
      "explanation": "El Anexo III determina que todas las faltas prescribirán, en todo caso, a los seis meses después de haberse cometido.",
      "usage": "dossier"
    },
    {
      "id": 28,
      "question": "De acuerdo con el Anexo III, ¿cuál es el plazo para la cancelación de oficio o a petición de una sanción grave en el expediente personal desde su cumplimiento?",
      "options": [
        "1 año.",
        "3 años.",
        "5 años.",
        "2 años."
      ],
      "correctAnswer": 1,
      "explanation": "El Anexo III prescribe que la cancelación de las anotaciones se realizará al año para faltas leves, tres años para graves y cinco años para muy graves, a petición del interesado.",
      "usage": "dossier"
    },
    {
      "id": 29,
      "question": "Según el Artículo 43 (Prevención de Riesgos), ¿con qué frecuencia ordinaria debe reunirse el Comité de Seguridad y Salud (CSS) de cada Universidad?",
      "options": [
        "Al menos mensualmente.",
        "Al menos trimestralmente.",
        "Al menos una vez al semestre.",
        "Al menos una vez al año."
      ],
      "correctAnswer": 1,
      "explanation": "El Artículo 43.3 dispone que el Comité de Seguridad y Salud se reunirá al menos trimestralmente (cada 3 meses).",
      "usage": "dossier"
    },
    {
      "id": 30,
      "question": "De acuerdo con el Artículo 46.3, los reconocimientos médicos preventivos para el personal laboral se practicarán ordinariamente con una periodicidad de:",
      "options": [
        "Una vez cada dos años.",
        "Una vez al año para todo el personal.",
        "Solo al personal de nuevo ingreso.",
        "Solo después de bajas superiores a seis meses."
      ],
      "correctAnswer": 1,
      "explanation": "El Art. 46.3.a indica de forma explícita que los reconocimientos médicos se practicarán una vez al año para todo el personal.",
      "usage": "dossier"
    }
  ];

  // Overwrite key "18"
  quizzes["18"] = verifiedQuestions;

  // Save back to quizzes.json
  fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2), 'utf8');
  console.log(`✔ Se han sobrescrito con éxito las preguntas del Tema 18 en quizzes.json.`);
  console.log(`Ahora contiene exactamente 30 preguntas rigurosas extraídas del PDF.`);
};

run().catch(console.error);
