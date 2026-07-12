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

  // New verified questions for Tema 13 based on M365 and University of Sevilla settings
  const verifiedQuestions = [
    {
      "id": 1,
      "question": "¿Qué identificador y cuenta corporativa se requiere para acceder a la suite Microsoft 365 de la Universidad de Sevilla?",
      "options": [
        "El número de DNI y contraseña de la biblioteca.",
        "El identificador de usuario UVUS corporativo (con formato usuario@us.es).",
        "Una cuenta de correo electrónico de Outlook.com personal.",
        "El código de barras del carné de la biblioteca."
      ],
      "correctAnswer": 1,
      "explanation": "El acceso a la suite Microsoft 365 de la US se realiza utilizando el identificador corporativo de la US denominado UVUS, con el formato usuario@us.es.",
      "usage": "dossier"
    },
    {
      "id": 2,
      "question": "Dentro de Microsoft Outlook, ¿en qué menú o vista se configuran las Respuestas Automáticas (Fuera de oficina) y las Reglas de Bandeja de Entrada?",
      "options": [
        "En la pestaña Archivo (Vista Backstage).",
        "En la pestaña Inicio.",
        "En la pestaña Vista, sección Configuración de lectura.",
        "En la pestaña Enviar y recibir."
      ],
      "correctAnswer": 0,
      "explanation": "En la pestaña Archivo (Backstage) se encuentra la configuración de Respuestas Automáticas, Reglas y Alertas, así como la información de cuota y tamaño del buzón de correo.",
      "usage": "dossier"
    },
    {
      "id": 3,
      "question": "Al configurar Respuestas Automáticas en Outlook, ¿qué distinción de destinatarios permite realizar la aplicación para programar diferentes mensajes?",
      "options": [
        "Remitentes que envían archivos adjuntos y remitentes que solo envían texto.",
        "Remitentes 'Dentro de mi organización' (de la US) y 'Fuera de mi organización' (correos externos).",
        "Remitentes agregados a contactos y remitentes desconocidos únicamente.",
        "Remitentes nacionales y remitentes internacionales."
      ],
      "correctAnswer": 1,
      "explanation": "Outlook permite redactar dos mensajes diferenciados de ausencia: uno para usuarios dentro de la organización (US) y otro para usuarios de fuera (externos).",
      "usage": "dossier"
    },
    {
      "id": 4,
      "question": "¿Qué es la Lista de Direcciones Globales (GAL) en Microsoft Outlook?",
      "options": [
        "Un directorio centralizado de la US que contiene las direcciones de correo actualizadas de todo el personal (PDI, PTGAS) y estudiantes.",
        "Una carpeta local donde se almacenan las firmas de correo.",
        "Una base de datos externa de la Junta de Andalucía.",
        "Una lista negra de remitentes no deseados o de spam."
      ],
      "correctAnswer": 0,
      "explanation": "La Lista de Direcciones Globales (GAL) es el directorio centralizado institucional que contiene los correos electrónicos del personal docente, de administración y servicios y estudiantes de la US.",
      "usage": "dossier"
    },
    {
      "id": 5,
      "question": "¿Qué combinación de teclas permite enviar de forma instantánea el correo electrónico que se está redactando en la ventana activa de Outlook?",
      "options": [
        "Ctrl + Shift + S",
        "Ctrl + Intro",
        "Ctrl + F12",
        "Alt + E"
      ],
      "correctAnswer": 1,
      "explanation": "Ctrl + Intro es el atajo de teclado clásico y de examen para enviar de forma inmediata el correo que se está editando en Outlook.",
      "usage": "dossier"
    },
    {
      "id": 6,
      "question": "En Outlook, ¿qué atajo de teclado se utiliza para conmutar a la vista de Calendario?",
      "options": [
        "Ctrl + 1",
        "Ctrl + 2",
        "Ctrl + 3",
        "Ctrl + 4"
      ],
      "correctAnswer": 1,
      "explanation": "Los atajos de teclado numéricos permiten cambiar rápidamente de panel: Ctrl + 1 para Correo, Ctrl + 2 para Calendario y Ctrl + 3 para Personas/Contactos.",
      "usage": "dossier"
    },
    {
      "id": 7,
      "question": "En Microsoft Word, ¿por qué es importante el uso de los Estilos de Título (Título 1, Título 2, etc.) de la pestaña Inicio?",
      "options": [
        "Porque impiden que el documento sea modificado por otros usuarios.",
        "Porque estructuran jerárquicamente el documento y permiten generar automáticamente la Tabla de Contenido (Índice).",
        "Porque son necesarios para poder imprimir el archivo a doble cara.",
        "Porque reducen de forma automática el espacio que el archivo ocupa en el disco duro."
      ],
      "correctAnswer": 1,
      "explanation": "Aplicar estilos estructurados permite formatear el documento homogéneamente y es el requisito indispensable para generar la tabla de contenido automática (pestaña Referencias).",
      "usage": "dossier"
    },
    {
      "id": 8,
      "question": "Si deseamos enviar el cursor al inicio de la página siguiente dentro de la misma sección y manteniendo los mismos encabezados y márgenes en Word, debemos realizar:",
      "options": [
        "Un Salto de Página (Ctrl + Intro).",
        "Un Salto de Sección (Página siguiente).",
        "Pulsar Intro repetidamente hasta pasar de página.",
        "Un Salto de Columna."
      ],
      "correctAnswer": 0,
      "explanation": "Un Salto de Página (Ctrl + Intro) envía el texto a la página siguiente dentro de la misma sección, manteniendo todas las cabeceras y configuraciones idénticas.",
      "usage": "dossier"
    },
    {
      "id": 9,
      "question": "¿Qué elemento de organización de página de Word es imprescindible si queremos poner una única página en orientación horizontal dejando las demás en vertical?",
      "options": [
        "Un Salto de Página.",
        "Un Salto de Sección de página siguiente.",
        "Un Salto de Ajuste de texto.",
        "No es posible mezclar orientaciones en un mismo documento."
      ],
      "correctAnswer": 1,
      "explanation": "El Salto de Sección divide el documento en secciones independientes, permitiendo configurar de forma exclusiva la orientación, márgenes o bordes de una sección sin afectar al resto.",
      "usage": "dossier"
    },
    {
      "id": 10,
      "question": "En Microsoft Word, ¿para qué sirve la desvinculación de encabezados mediante el botón 'Vincular al anterior' al usar secciones?",
      "options": [
        "Para guardar el documento como plantilla protegida.",
        "Para poder definir encabezados y pies de página distintos en cada sección independiente.",
        "Para conectar el documento a una hoja de cálculo externa.",
        "Para borrar el encabezado de todo el documento."
      ],
      "correctAnswer": 1,
      "explanation": "Desmarcar 'Vincular al anterior' en los encabezados/pies de página rompe la herencia con la sección anterior, permitiendo escribir un título o número de página diferente.",
      "usage": "dossier"
    },
    {
      "id": 11,
      "question": "¿Qué utilidad de Microsoft Word permite generar masivamente cartas personalizadas o etiquetas conectando una plantilla con una base de datos externa (ej. contactos de Outlook o Excel)?",
      "options": [
        "Combinar Correspondencia.",
        "Control de Cambios.",
        "Insertar Objeto OLE.",
        "Pasos Rápidos."
      ],
      "correctAnswer": 0,
      "explanation": "La combinación de correspondencia (pestaña Correspondencia) inserta campos dinámicos a partir de un origen de datos externo en un documento común para personalizar envíos masivos.",
      "usage": "dossier"
    },
    {
      "id": 12,
      "question": "¿Qué atajo de teclado en Microsoft Word abre directamente el cuadro de diálogo 'Guardar como'?",
      "options": [
        "F5",
        "F12",
        "Ctrl + S",
        "Alt + F4"
      ],
      "correctAnswer": 1,
      "explanation": "La tecla F12 es el método abreviado universal en la suite Office para abrir directamente el menú 'Guardar como' para renombrar o cambiar la ubicación del archivo.",
      "usage": "dossier"
    },
    {
      "id": 13,
      "question": "En SharePoint Online, ¿para qué sirve la función de 'Proteger' (Check-out) de un documento?",
      "options": [
        "Para bloquear temporalmente la edición del archivo a un único usuario, impidiendo que otros realicen cambios simultáneos y sobrescriban el contenido.",
        "Para encriptar el archivo con una contraseña digital de la US.",
        "Para eliminar de forma definitiva las versiones anteriores del archivo.",
        "Para sincronizar el documento localmente con el disco duro."
      ],
      "correctAnswer": 0,
      "explanation": "Proteger (Check-out) extrae el documento de forma exclusiva, impidiendo la edición concurrente de otros compañeros y asegurando la integridad del contenido.",
      "usage": "dossier"
    },
    {
      "id": 14,
      "question": "En una biblioteca de documentos de SharePoint Online, ¿qué acción libera un archivo previamente extraído y permite a los demás editarlo registrando una nueva versión?",
      "options": [
        "Compartir mediante enlace.",
        "Desproteger (Check-in).",
        "Sincronizar mediante OneDrive.",
        "Heredar permisos."
      ],
      "correctAnswer": 1,
      "explanation": "Desproteger (Check-in) devuelve el archivo al repositorio común, permitiendo que sea coeditado y obligando a incluir una anotación de cambios para el control de versiones.",
      "usage": "dossier"
    },
    {
      "id": 15,
      "question": "¿Qué función de SharePoint Online permite registrar el autor del cambio, comparar cambios anteriores e incluso restaurar versiones previas de un archivo?",
      "options": [
        "La lista de direcciones global.",
        "El Historial de Versiones.",
        "La herencia de permisos exclusiva.",
        "El modo solo lectura dinámico."
      ],
      "correctAnswer": 1,
      "explanation": "El Historial de Versiones graba automáticamente los estados y cambios de cada guardado, permitiendo restaurar o comparar copias anteriores de forma selectiva.",
      "usage": "dossier"
    },
    {
      "id": 16,
      "question": "Por defecto, ¿qué sucede con los permisos de acceso de una nueva carpeta creada dentro de un sitio de SharePoint?",
      "options": [
        "Hereda automáticamente los permisos del sitio principal o carpeta contenedora.",
        "Se crea sin permisos y debe configurarse manualmente uno a uno.",
        "Permite el acceso a cualquier usuario de internet de forma pública.",
        "Hereda los permisos personales del creador en OneDrive."
      ],
      "correctAnswer": 0,
      "explanation": "Por defecto, los subsitios, bibliotecas y carpetas heredan los permisos del sitio principal, a menos que el administrador elija romper la herencia de permisos.",
      "usage": "dossier"
    },
    {
      "id": 17,
      "question": "En OneDrive para la Empresa, ¿qué indica el icono de la Nube Azul al lado del nombre de un archivo en el Explorador de Windows?",
      "options": [
        "El archivo tiene un error de sincronización y está bloqueado.",
        "El archivo está guardado únicamente en la nube (no consume almacenamiento físico en el disco duro local) y se descargará al abrirlo.",
        "El archivo está protegido con una contraseña corporativa.",
        "El archivo se encuentra permanentemente descargado en el dispositivo."
      ],
      "correctAnswer": 1,
      "explanation": "El icono de nube azul representa un archivo disponible únicamente en línea, ahorrando espacio en el disco duro local.",
      "usage": "dossier"
    },
    {
      "id": 18,
      "question": "En el sistema de Archivos a Petición de OneDrive, ¿qué indica el icono de un Tic Blanco dentro de un círculo verde relleno permanente?",
      "options": [
        "El archivo es compartido externamente de forma pública.",
        "El archivo está marcado como 'Mantener siempre en este dispositivo' y reside de forma permanente en el PC para uso sin conexión.",
        "El archivo se ha borrado de la nube pero se conserva una copia local.",
        "El archivo se está guardando en el servidor central de la US."
      ],
      "correctAnswer": 1,
      "explanation": "El círculo verde relleno con tic blanco indica que el archivo reside permanentemente en el ordenador local y nunca se liberará al espacio en la nube de forma automática.",
      "usage": "dossier"
    },
    {
      "id": 19,
      "question": "Al compartir un archivo desde OneDrive o SharePoint, ¿cuál de las siguientes es una medida de seguridad avanzada para restringir el acceso?",
      "options": [
        "Establecer una contraseña, fijar una fecha de caducidad o bloquear la descarga.",
        "Desconectar el equipo de la red local de la US.",
        "Guardar el archivo en una carpeta oculta de Windows.",
        "No existen opciones avanzadas de protección en OneDrive."
      ],
      "correctAnswer": 0,
      "explanation": "OneDrive/SharePoint permiten establecer una fecha de caducidad al enlace, añadir una contraseña requerida o deshabilitar la descarga del documento (bloquear descarga).",
      "usage": "dossier"
    },
    {
      "id": 20,
      "question": "En Microsoft Teams, ¿dónde se guardan físicamente los archivos que se suben a la pestaña 'Archivos' de un canal de un equipo?",
      "options": [
        "En la cuenta de correo de Outlook del creador del canal.",
        "En el sitio de SharePoint Online vinculado de forma automática al equipo.",
        "En el disco duro local del servidor de Teams de la US.",
        "En la carpeta personal de OneDrive del Rector de la US."
      ],
      "correctAnswer": 1,
      "explanation": "Cada equipo de Teams tiene un sitio de SharePoint asociado, y la pestaña 'Archivos' de cada canal corresponde a una carpeta dentro de su biblioteca de documentos.",
      "usage": "dossier"
    },
    {
      "id": 21,
      "question": "¿Cuál es el atajo de teclado rápido en una reunión de Microsoft Teams para silenciar o activar el micrófono?",
      "options": [
        "Ctrl + Shift + O",
        "Ctrl + Shift + M",
        "Ctrl + Enter",
        "Alt + F4"
      ],
      "correctAnswer": 1,
      "explanation": "Ctrl + Shift + M es el atajo de teclado rápido en Teams para activar o desactivar rápidamente el audio del micrófono.",
      "usage": "dossier"
    },
    {
      "id": 22,
      "question": "En Microsoft Planner, ¿cuál es la estructura organizativa de tareas basada en la metodología Kanban?",
      "options": [
        "Grupos de correos, bandejas de entrada e hilos.",
        "Tableros (Planes), Depósitos (Buckets) y Tareas (Tarjetas).",
        "Hojas de cálculo, libros y celdas.",
        "Canales de voz, canales de texto e hilos."
      ],
      "correctAnswer": 1,
      "explanation": "Planner organiza los proyectos mediante planes (tableros), los cuales contienen columnas (depósitos/buckets) donde se sitúan las tareas representadas por tarjetas.",
      "usage": "dossier"
    },
    {
      "id": 23,
      "question": "¿Con qué caracteres debe iniciarse obligatoriamente una fórmula o función matemática en Microsoft Excel?",
      "options": [
        "El signo interrogante (?) o asterisco (*).",
        "El signo igual (=) o el signo más (+).",
        "La palabra FORMULA en mayúsculas.",
        "El signo de exclamación (!)."
      ],
      "correctAnswer": 1,
      "explanation": "En Excel, las fórmulas y funciones deben comenzar por el operador '=' o, en su defecto por compatibilidad clásica, el operador '+'.",
      "usage": "dossier"
    },
    {
      "id": 24,
      "question": "En la función =BUSCARV(valor_buscado; matriz_buscar_en; indicador_columnas; ordenado) de Excel, ¿cuál es la finalidad de establecer el parámetro 'ordenado' como FALSO?",
      "options": [
        "Permitir la búsqueda con comodines aproximados.",
        "Exigir una coincidencia exacta de búsqueda del valor buscado.",
        "Ordenar la tabla de origen en orden alfabético.",
        "Indicar que el valor buscado es una condición lógica."
      ],
      "correctAnswer": 1,
      "explanation": "Poner FALSO en el argumento de ordenación obliga a BUSCARV a buscar la coincidencia exacta, evitando errores de aproximación.",
      "usage": "dossier"
    },
    {
      "id": 25,
      "question": "¿Qué sintaxis describe correctamente la función lógica =SI en Microsoft Excel?",
      "options": [
        "=SI(valor_si; valor_no; prueba_lógica)",
        "=SI(prueba_lógica; valor_si_verdadero; valor_si_falso)",
        "=SI(buscar_rango; columna_extraer)",
        "=SI(rango_suma; criterio_comparar)"
      ],
      "correctAnswer": 1,
      "explanation": "La función lógica =SI requiere primero una prueba o condición comparativa, seguida de la acción si se cumple (verdadero) y la acción si no (falso).",
      "usage": "dossier"
    },
    {
      "id": 26,
      "question": "En Microsoft Excel, ¿qué atajo de teclado permite editar la celda seleccionada activa sin borrar su contenido previo?",
      "options": [
        "F5",
        "F2",
        "Ctrl + E",
        "Ctrl + Intro"
      ],
      "correctAnswer": 1,
      "explanation": "Al pulsar F2 en Excel, el cursor se sitúa al final del texto dentro de la celda activa para permitir su edición.",
      "usage": "dossier"
    },
    {
      "id": 27,
      "question": "¿Qué combinación de teclas de Microsoft Excel se utiliza para activar o desactivar rápidamente los filtros automáticos en la fila seleccionada?",
      "options": [
        "Ctrl + Shift + F",
        "Ctrl + Shift + L",
        "Ctrl + +",
        "F12"
      ],
      "correctAnswer": 1,
      "explanation": "Ctrl + Shift + L es el atajo de teclado en Excel para habilitar o inhabilitar de forma instantánea el modo de filtros en el rango activo.",
      "usage": "dossier"
    },
    {
      "id": 28,
      "question": "En Microsoft PowerPoint, ¿cuál es la diferencia conceptual entre Transición y Animación?",
      "options": [
        "No existe diferencia, son términos idénticos en la aplicación.",
        "La transición es el efecto de cambio entre diapositivas; la animación es el efecto aplicado a un objeto individual dentro de la diapositiva.",
        "La animación es para fotos y la transición es para textos en párrafo.",
        "La transición se guarda en PDF y la animación no."
      ],
      "correctAnswer": 1,
      "explanation": "Las transiciones actúan sobre la diapositiva completa al cambiar de una a otra, mientras que las animaciones dan efectos de entrada, salida o énfasis a textos o imágenes individuales de la diapositiva.",
      "usage": "dossier"
    },
    {
      "id": 29,
      "question": "En Microsoft PowerPoint, ¿qué función sugiere diseños visuales automáticos y profesionales basados en el contenido introducido en la diapositiva?",
      "options": [
        "Temas compartidos de SharePoint.",
        "Ideas de Diseño (Diseñador).",
        "Patrón de Diapositivas.",
        "Combinar Correspondencia."
      ],
      "correctAnswer": 1,
      "explanation": "La herramienta inteligente 'Ideas de diseño' de PowerPoint analiza el contenido de la diapositiva (textos, palabras clave) y sugiere composiciones y estilos profesionales.",
      "usage": "dossier"
    },
    {
      "id": 30,
      "question": "En Microsoft 365, ¿qué herramienta de notas digitales permite crear blocs de notas estructurados en secciones y páginas para uso personal o compartido?",
      "options": [
        "Outlook.",
        "OneNote.",
        "Planner.",
        "SharePoint Lists."
      ],
      "correctAnswer": 1,
      "explanation": "OneNote es la libreta digital oficial en Microsoft 365 para la recopilación de notas, capturas y apuntes estructurados de forma asíncrona.",
      "usage": "dossier"
    }
  ];

  // Overwrite key "13"
  quizzes["13"] = verifiedQuestions;

  // Save back to quizzes.json
  fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2), 'utf8');
  console.log(`✔ Se han sobrescrito con éxito las preguntas del Tema 13 en quizzes.json.`);
  console.log(`Ahora contiene exactamente 30 preguntas limpias de M365.`);
};

run().catch(console.error);
