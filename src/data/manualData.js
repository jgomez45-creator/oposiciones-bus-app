export const manualCategories = [
  {
    id: "introduccion",
    title: "Introducción y Visión General",
    iconName: "Info",
    intro: "Bienvenido/a a tu Preparador Virtual de Oposiciones para Técnico/a Auxiliar de Biblioteca, Archivo y Museo de la Universidad de Sevilla (US). Esta aplicación ha sido diseñada con un entorno inmersivo de alto rendimiento para facilitarte la retención de materias técnicas y legislativas de la convocatoria.",
    sections: [
      {
        title: "Estructura del Entorno de Estudio",
        content: "La interfaz está dividida en un panel lateral de navegación (Sidebar) y un espacio principal de interacción. Puedes acceder rápidamente a las herramientas clave con un solo clic:",
        steps: [
          "Panel de Control (Dashboard): Tu centro de estadísticas personales y temporizador principal.",
          "Temario: Visualizador y reproductor de audio de los temas oficiales.",
          "Cuestionarios (Tests): Módulo para realizar exámenes en distintos formatos.",
          "Test Formadores: Baterías teóricas complementarias provistas por formadores sindicales.",
          "Flashcards: Tarjetas de memorización activa de conceptos y leyes.",
          "Progreso: Análisis detallado de tu evolución y opción de reiniciar datos."
        ]
      },
      {
        title: "Buscador Inteligente del Manual",
        content: "En la parte superior de esta pantalla de ayuda dispones de una barra de búsqueda en tiempo real. Escribe cualquier término (como 'Pomodoro', 'Audio', 'Imprimir' o 'Sesión') y el sistema filtrará automáticamente los temas relevantes resaltando dónde se encuentra la información."
      },
      {
        title: "Diseño Adaptable (Móvil y Escritorio)",
        content: "La plataforma está optimizada para cualquier dispositivo. En tablets y ordenadores dispondrás del menú lateral expandido, mientras que en smartphones el menú se adapta para maximizar el área de lectura y los botones de acción se vuelven táctiles y accesibles."
      }
    ]
  },
  {
    id: "dashboard",
    title: "Panel de Control (Dashboard)",
    iconName: "LayoutDashboard",
    intro: "El Dashboard es tu pantalla de inicio y la brújula de tu preparación diaria. Centraliza tus métricas clave de rendimiento y te ofrece accesos directos dinámicos.",
    sections: [
      {
        title: "Bloques de Estadísticas Principales",
        content: "En la cabecera del panel se muestran tres indicadores fundamentales calculados en tiempo real:",
        steps: [
          "Progreso del Temario: Cantidad de temas completados (marcados como 'Repasado' o 'Memorizado') respecto al total de 20 temas.",
          "Tiempo de Estudio: Suma total de las horas dedicadas al estudio activo del temario registrada por el sistema.",
          "Precisión Media: El porcentaje de aciertos promedio ponderando todos los tests teóricos que has completado."
        ]
      },
      {
        title: "Tabla de Estado del Temario",
        content: "Muestra la lista de los 20 temas de la oposición. Puedes cambiar el estado de lectura de cada tema directamente en el desplegable de la fila. Los estados disponibles son:",
        steps: [
          "Pendiente (Color Rojo): Aún no has iniciado su lectura.",
          "Leyendo (Color Amarillo/Oro): Estás trabajando activamente en el tema.",
          "Resumido (Color Azul): Has extraído los esquemas y conceptos clave.",
          "Memorizado o Repasado (Color Esmeralda/Verde): Has asimilado la materia y la consideras preparada para examen."
        ],
        tip: "Haz clic en el nombre de cualquier tema o en la flecha de la derecha para abrir directamente el visualizador del tema seleccionado."
      },
      {
        title: "Temporizador Pomodoro Integrado",
        content: "El método Pomodoro te ayuda a mantener el foco y evitar la fatiga cognitiva. Consiste en dividir el estudio en intervalos de concentración absoluta seguidos de breves descansos.",
        steps: [
          "Selecciona el tema que vas a estudiar en el selector desplegable.",
          "Haz clic en el botón de Play para iniciar la cuenta atrás de 25 minutos.",
          "Durante la sesión de estudio, el temporizador acumulará automáticamente los segundos estudiados al registro de ese tema específico.",
          "Al finalizar los 25 minutos, sonará una alerta sugiriendo un descanso de 5 minutos, cambiando el temporizador a modo 'Descanso' de forma automática.",
          "Haz clic en el botón de reinicio en cualquier momento para volver a empezar el intervalo."
        ],
        alert: "Para que el temporizador registre el tiempo de estudio de manera correcta, evita cerrar la pestaña del navegador o cambiar a otra aplicación en primer plano de manera prolongada."
      },
      {
        title: "Sugerencia Dinámica de Estudio",
        content: "Basado en tu progreso real, el sistema analiza qué temas tienes sin estudiar o a medio terminar y te recomienda el siguiente tema prioritario con un botón de acceso directo ('Estudiar Ahora')."
      }
    ]
  },
  {
    id: "temario",
    title: "Visualizador de Temas",
    iconName: "BookOpen",
    intro: "El módulo de Temario es una herramienta de lectura avanzada con funciones de accesibilidad, audioguía y asistencia de enfoque.",
    sections: [
      {
        title: "Pestañas Temáticas de Estudio",
        content: "Cada tema se desglosa internamente en tres vistas organizadas mediante pestañas superiores para estructurar tu aprendizaje de manera gradual:",
        steps: [
          "Contenido (Tema): Desarrollo íntegro de la materia del tema con explicaciones legislativas y técnicas detalladas.",
          "Esquema (Resumen): Estructura simplificada e índice jerárquico del tema, ideal para repasar rápidamente antes de un test.",
          "Conceptos (Glosario): Diccionario de términos técnicos propios del tema (acrónimos de biblioteca, legislación universitaria, etc.)."
        ]
      },
      {
        title: "Configuración de Lectura y Temas Visuales",
        content: "Accede al botón de controles de lectura (icono de engranaje/deslizadores) para adaptar la pantalla a tus preferencias visuales:",
        steps: [
          "Tamaño de Fuente: Ajustable entre Pequeño, Mediano, Grande y Extra Grande para evitar la fatiga visual.",
          "Tema Cromático: Elige entre modo por Defecto (fondo oscuro de alto contraste), Lectura Clara (fondo blanco limpio) y Sepia (cálido, idóneo para sesiones nocturnas)."
        ]
      },
      {
        title: "Reproductor de Audio (Audiolibro y TTS)",
        content: "Escucha el tema mientras descansas, viajas o haces otras tareas. El sistema cuenta con dos modos automáticos:",
        steps: [
          "Modo MP3 (Recomendado si está disponible): Reproduce una grabación de audio real del tema con controles de reproducción estándar.",
          "Modo TTS (Text-to-Speech / Sintetizador de voz): Utiliza la tecnología de síntesis de voz nativa del navegador para leer el texto en voz alta línea por línea.",
          "Controles Adicionales: Modifica la velocidad de reproducción de la voz (desde 0.5x hasta 2x) y selecciona entre las diferentes voces en español instaladas en tu sistema."
        ],
        tip: "En el modo de lectura con síntesis de voz (TTS), la barra de progreso de audio te mostrará exactamente qué porcentaje de la sección activa ha sido leída."
      },
      {
        title: "Modo Enfoque (Distraction-Free) y Sesión de Tiempo",
        content: "Al iniciar el cronómetro de la sesión de estudio (botón Play en la barra superior del tema), el sistema oculta los menús laterales y entra automáticamente en Modo Enfoque, difuminando cualquier distracción externa para que te concentres únicamente en la lectura."
      },
      {
        title: "Lectura a Pantalla Completa, Autoscroll y Regla de Lectura",
        content: "Activa los iconos de la barra superior derecha para desbloquear funciones de lectura veloz y concentración:",
        steps: [
          "Pantalla Completa: Ocupa todo el monitor con el contenido del tema. Usa las teclas de Flecha Abajo o Espacio para avanzar páginas suavemente.",
          "Autoscroll (Desplazamiento Automático): El texto desciende solo de forma continua. Puedes regular la velocidad de bajada con el control deslizante en tiempo real.",
          "Regla de Lectura (Ruler): Muestra una franja horizontal translúcida sobre la pantalla que sigue tu cursor. Sirve para guiar tu vista línea por línea y evitar saltar renglones accidentalmente."
        ]
      },
      {
        title: "Compilación y Descarga de Dossier para Impresión",
        content: "Si prefieres estudiar en papel físico, el sistema incorpora un compilador legislativo avanzado en la pestaña lateral derecha ('Compilar e Imprimir'):",
        steps: [
          "Marca las casillas de los temas específicos que deseas imprimir.",
          "Elige si deseas incluir la portada oficial con el título de la convocatoria, la ficha resumen de las bases y el índice de contenidos del volumen compilado.",
          "Opcionalmente, puedes adjuntar un examen tipo test autoevaluativo con N preguntas por tema al final del documento, junto con sus correspondientes soluciones y justificaciones legislativas.",
          "Haz clic en 'Compilar Temas para Impresión'. Una vez cargada la vista previa en blanco y negro de alta calidad, pulsa 'Imprimir' para guardarlo como PDF o mandarlo a tu impresora física."
        ]
      }
    ]
  },
  {
    id: "cuestionarios",
    title: "Cuestionarios de Autoevaluación (Tests)",
    iconName: "GraduationCap",
    intro: "El generador de tests es la herramienta clave para evaluar tus conocimientos y familiarizarte con las reglas oficiales del examen tipo test de la Universidad de Sevilla.",
    sections: [
      {
        title: "Modalidades de Configuración de Examen",
        content: "Puedes adaptar el cuestionario seleccionando uno de los siguientes modos de juego o simulacros predefinidos:",
        steps: [
          "Tema Único: Realiza un test de control rápido enfocado exclusivamente en la materia de un tema específico.",
          "Simulacro Personalizado: Selecciona múltiples temas a la vez y define un límite de preguntas para crear un examen a la carta.",
          "Simulacro Aleatorio (40 Preguntas): Genera una prueba equilibrada seleccionando exactamente 2 preguntas aleatorias de cada uno de los 20 temas de la oposición.",
          "15 Simulacros Predefinidos: Un total de 15 exámenes fijos de 40 preguntas cada uno, diseñados de forma que no repiten ninguna pregunta entre sí. Ideales para medir tu evolución a lo largo del tiempo.",
          "Examen Real 2019 / 2022: Enfréntate a las plantillas oficiales y preguntas reales que se entregaron a los aspirantes en los exámenes de las convocatorias anteriores.",
          "Cuaderno de Tests: Genera un documento en formato libro que agrupa los cuestionarios tema por tema con sus soluciones conjuntas en la última sección."
        ]
      },
      {
        title: "Formatos de Realización del Test",
        content: "Elige cómo deseas completar o interactuar con el examen configurado:",
        steps: [
          "Test Clásico (Interactivo): Responde pregunta por pregunta en pantalla. El sistema te dará feedback inmediato (color verde si aciertas, rojo si fallas) y te mostrará la justificación legal explicativa antes de pasar a la siguiente.",
          "Simulacro en Papel (Interactivo): Muestra todo el examen en una sola página scrollable con una hoja de respuestas fija al lateral. Es interactivo pero no te dará las soluciones hasta que hagas clic en 'Finalizar y Corregir' al final.",
          "Imprimir Examen (PDF): Genera un examen en formato PDF maquetado como las pruebas reales de la US (con cabecera de datos de alumno y cuadro de firmas) y una hoja de respuestas de reserva al final."
        ]
      },
      {
        title: "Cálculo y Penalización de Puntos en Oposiciones",
        content: "En el modo 'Simulacro en Papel' y los 'Exámenes Reales', la corrección se realiza aplicando la fórmula oficial de las bases de la US para una fase de oposición de 65 puntos máximos:",
        steps: [
          "Fórmula de Nota Neta: Puntuación = Aciertos - (Errores * 0.25)",
          "Las preguntas dejadas en blanco no restan puntuación. Es fundamental aprender cuándo arriesgarse y cuándo dejar una pregunta vacía.",
          "Aprobado de Control: Para aprobar la fase de oposición es obligatorio alcanzar una nota neta mínima de 32.5 puntos sobre 65."
        ],
        alert: "¡Cuidado! Un fallo descuenta el equivalente a un cuarto (0.25) de una respuesta correcta en tu puntuación total. El manual te aconseja dejar en blanco aquellas preguntas sobre las que no tengas certeza."
      }
    ]
  },
  {
    id: "formadores",
    title: "Material de Formadores",
    iconName: "ClipboardList",
    intro: "Esta sección contiene las baterías oficiales de preguntas de control proporcionadas por formadores del sindicato (CCOO) para las materias comunes y legislativas de la US.",
    sections: [
      {
        title: "Baterías de Preguntas Disponibles",
        content: "El material está dividido por materias legislativas de gran peso en el examen:",
        steps: [
          "Estatutos US - Bloque 1: Preguntas de los títulos I al III de la normativa propia de la Universidad de Sevilla (Tema 17).",
          "Estatutos US - Bloque 2: Preguntas de los títulos IV en adelante (Tema 17).",
          "IV Convenio Colectivo: Cuestiones de régimen laboral común de las universidades públicas andaluzas (Tema 18).",
          "Ley Orgánica de Igualdad: Preguntas detalladas sobre la Ley Orgánica 3/2007 (Tema 19)."
        ]
      },
      {
        title: "Modos de Práctica",
        content: "Al igual que el módulo general de tests, permite realizar el examen de forma interactiva (pregunta a pregunta con explicaciones), en simulacro en papel (evaluación final conjunta) o exportarlo a formato imprimible para estudio analógico."
      }
    ]
  },
  {
    id: "flashcards",
    title: "Tarjetas de Memorización (Flashcards)",
    iconName: "Layers",
    intro: "Las flashcards o tarjetas de estudio aplican el principio científico del recuerdo activo (Active Recall) y la repetición espaciada para consolidar leyes y datos puros.",
    sections: [
      {
        title: "Funcionamiento del Mazo de Estudio",
        content: "Selecciona el tema que quieres repasar o elige el 'Mazo Combinado' (que reúne 15 tarjetas aleatorias de todo el temario) y pulsa en comenzar:",
        steps: [
          "Anverso (Pregunta): Se te presenta un término, pregunta o concepto (ej. ¿Qué órgano aprueba el presupuesto de la US?).",
          "Giro 3D: Piensa la respuesta mentalmente y haz clic sobre la tarjeta para que realice una animación de giro y te revele el reverso con la respuesta correcta.",
          "Valoración de Dificultad: Selecciona la dificultad de la tarjeta entre Fácil (la recordabas perfectamente), Medio (te ha costado recordar) o Difícil (no la sabías)."
        ],
        tip: "La autoevaluación sincera de dificultad ayuda a identificar qué áreas de legislación requieren una sesión de lectura extra."
      },
      {
        title: "Resumen de Sesión de Estudio",
        content: "Al completar todas las tarjetas del mazo, se te mostrará un panel de rendimiento con el recuento total de tarjetas clasificadas por su nivel de dificultad. Esto te permite evaluar de un vistazo tu nivel de retención de ese tema concreto."
      }
    ]
  },
  {
    id: "progreso",
    title: "Estadísticas y Persistencia de Datos",
    iconName: "BarChart3",
    intro: "El sistema almacena tu progreso de estudio y calificaciones de tests para guiarte en el plan de preparación.",
    sections: [
      {
        title: "Visualización de Gráficos e Historial",
        content: "En la sección de 'Progreso', tendrás acceso a gráficos visuales de barras que reflejan el tiempo acumulado de estudio por cada tema, así como un registro de tus últimas calificaciones en los cuestionarios.",
        tip: "Si consideras necesario purgar tus datos de prueba para iniciar una preparación de simulacro desde cero, encontrarás el botón de 'Reiniciar Progreso' en la base de la pantalla de Estadísticas."
      },
      {
        title: "Niveles de Persistencia (Local y Nube)",
        content: "La sincronización de tu progreso varía según el tipo de acceso con el que hayas iniciado sesión:",
        steps: [
          "Perfil de Invitado (Demo): Los datos se guardan exclusivamente en el almacenamiento local de tu navegador (LocalStorage). Si borras la caché, perderás el progreso.",
          "Perfil de Estudiante Registrado: Los datos se sincronizan automáticamente con la base de datos en la nube (Firebase). Tu progreso persistirá aunque entres desde otro dispositivo."
        ]
      },
      {
        title: "Medidas de Seguridad y Control Concurrente",
        content: "Para proteger la integridad de los datos de progreso y cumplir con las políticas de control comercial del preparador:",
        steps: [
          "Control de Sesión Concurrente: Solo se permite una sesión activa por estudiante. Si inicias sesión en un dispositivo secundario (u otra pestaña del navegador), la sesión del dispositivo anterior se cerrará inmediatamente por seguridad.",
          "Cierre automático por inactividad: Si dejas la aplicación abierta sin interacción durante 30 minutos, el sistema guardará automáticamente tu progreso pendiente en la nube y mostrará una advertencia de 30 segundos antes de forzar el cierre de sesión para ahorrar recursos del servidor."
        ]
      }
    ]
  }
];
