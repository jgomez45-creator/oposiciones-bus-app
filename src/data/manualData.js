export const studentManualCategories = [
  {
    id: "introduccion",
    title: "Introducción y Visión General",
    iconName: "Info",
    intro: "Bienvenido/a a tu Preparador Virtual de Oposiciones para Técnico/a Auxiliar de Biblioteca, Archivo y Museo de la Universidad de Sevilla (US). Esta aplicación ha sido diseñada con un entorno inmersivo de alto rendimiento para facilitarte la retención de materias técnicas, legislativas y operativas de la convocatoria 2026 (Código 4140).",
    sections: [
      {
        title: "Estructura Organizativa del Menú Lateral (Sidebar)",
        content: "La interfaz cuenta con una barra de navegación lateral optimizada y reorganizada en 4 bloques funcionales principales para simplificar el acceso a todas las herramientas de estudio:",
        steps: [
          "APRENDIZAJE: Acceso al Dashboard principal, al Temario (desarrollos legislativos y audios) y al mazo de Flashcards de recuerdo activo.",
          "EVALUACIÓN: Cuestionarios de autoevaluación general (Tests) y Baterías específicas de Formadores.",
          "SEGUIMIENTO: Cuadro de mando de Estadísticas y analítica de Progreso individual.",
          "HERRAMIENTAS: Asistente Virtual de Inteligencia Artificial (Agente BUS ✨), Sección de Anexos/Fe de erratas y este Manual de Instrucciones interactivo.",
          "ADMINISTRACIÓN: Panel de control exclusivo para perfiles administradores (gestión de usuarios, estadísticas de nube y banco de preguntas)."
        ]
      },
      {
        title: "Buscador Inteligente del Manual",
        content: "En la parte superior de esta pantalla dispones de una barra de búsqueda en tiempo real. Al escribir cualquier término (como 'Pomodoro', 'Audio', 'Sanciones', 'CDU', 'Igualdad' o 'Corrección'), el manual filtrará instantáneamente los capítulos correspondientes y resaltará los términos encontrados en amarillo."
      },
      {
        title: "Diseño Responsivo de Alto Rendimiento (Fit a 100vh)",
        content: "La plataforma ajusta su maquetación según el dispositivo y pantalla activa para evitar barras de desplazamiento externas incómodas:",
        steps: [
          "Escritorio y Laptops Compactos (1025px–1280px): El menú lateral se adapta automáticamente a un ancho ultracompacto (240px) con 3 zonas independientes (Logo superior, Menú central e Información de Perfil abajo), garantizando que tu estado nunca quede oculto.",
          "Monitores Estándar (1281px–1440px): El Dashboard se reorganiza en columna única para aprovechar todo el ancho horizontal sin apretar los widgets.",
          "Dispositivos Móviles y Tablets (≤ 1024px): La barra lateral se transforma en una barra de navegación inferior (Bottom Nav Bar) táctil o en un Hub central de rápido acceso a las secciones."
        ]
      }
    ]
  },
  {
    id: "dashboard",
    title: "Panel de Control (Dashboard)",
    iconName: "LayoutDashboard",
    intro: "El Dashboard es la pantalla principal de tu seguimiento diario. Centraliza tus métricas clave de rendimiento, recomendaciones de estudio prioritarias y el temporizador Pomodoro de estudio dirigido.",
    imagePath: "/images/user_manual_dashboard.png",
    sections: [
      {
        title: "Bloques de Estadísticas Principales",
        content: "En la cabecera del panel se muestran tres indicadores fundamentales calculados en tiempo real sobre tu rendimiento:",
        steps: [
          "Progreso del Temario: Cantidad de temas completados (marcados como 'Resumido', 'Repasado' o 'Memorizado') respecto al total de 20 temas oficiales de la convocatoria.",
          "Tiempo de Estudio: Registro acumulado de horas y minutos dedicados al estudio activo dentro de la plataforma.",
          "Precisión Media: Porcentaje de aciertos promedio calculado sobre todos los tests y simulacros completados."
        ]
      },
      {
        title: "Tabla de Estado del Temario (20 Temas)",
        content: "Muestra la lista de los 20 temas oficiales de la convocatoria. Puedes actualizar el estado de cada tema directamente en el selector de su fila para mantener el registro visual de tu avance. Los estados disponibles son:",
        steps: [
          "Pendiente (Rojo): Tema aún no iniciado.",
          "Leyendo (Amarillo/Oro): Tema en fase de primera lectura.",
          "Resumido (Azul): Esquemas y conceptos principales consolidados.",
          "Memorizado o Repasado (Verde Esmeralda): Tema asimilado y preparado para responder cuestionarios."
        ],
        tip: "Haz clic en el título de cualquier tema para abrir directamente su visualizador de texto y reproductor."
      },
      {
        title: "Temporizador Pomodoro Integrado",
        content: "Diseñado para mantener una concentración máxima en bloques de 25 minutos de trabajo y 5 minutos de descanso guiado:",
        steps: [
          "Selecciona el tema que vas a estudiar en el desplegable del Pomodoro.",
          "Haz clic en el botón de Play para iniciar la cuenta atrás de 25 minutos.",
          "El tiempo invertido se registrará automáticamente en la ficha de ese tema.",
          "Al finalizar la sesión, sonará una señal acústica notificando el inicio del descanso de 5 minutos."
        ],
        alert: "Para evitar desviaciones en la métrica de tiempo, no minimices la pestaña de manera prolongada mientras el temporizador está en marcha."
      },
      {
        title: "Sugerencia Dinámica de Estudio",
        content: "El algoritmo analiza tu historial y resalta automáticamente cuál es el tema de mayor prioridad que debes abordar hoy con un botón de acceso directo ('Estudiar Ahora')."
      }
    ]
  },
  {
    id: "temario",
    title: "Visualizador de Temas y Fuentes",
    iconName: "BookOpen",
    intro: "El módulo de Temario es un entorno inmersivo enriquecido con la normativa oficial de la US, referencias oficiales, audiolibro, lectura por sintetizador (TTS), herramientas de enfoque visual y compilación de PDF para impresión física.",
    sections: [
      {
        title: "Pestañas Temáticas de Aprendizaje",
        content: "Cada uno de los 20 temas se organiza en tres vistas principales accesibles desde la barra superior:",
        steps: [
          "Contenido (Tema): Desarrollo completo del texto oficial con legislación actualizada, plazos, sanciones y procedimientos técnicos.",
          "Esquema (Resumen): Estructura simplificada e índice de contenidos para repasar conceptos clave rápidamente.",
          "Conceptos (Glosario): Términos técnicos, acrónimos bibliotecarios (MARC21, CDU, ALMA, OAI-PMH) y definiciones legales."
        ]
      },
      {
        title: "Contenidos Destacados del Programa Oficial",
        content: "El temario incluye precisiones normativas clave de la US extraídas de documentación oficial y guías técnicas de la Biblioteca Universitaria:",
        steps: [
          "Tema 4 (Servicios a Usuarios y Canales BUS): Plataformas de e-books (PRESTO, Odilo, Ebook Central, eLibro), portales científicos (Dialnet, ProQuest) y canales oficiales de atención al usuario (Expon@us, ExpoBUS, IntraBUS, OCULUS, CONSÚLTENOS).",
          "Tema 5 (Préstamo, Devoluciones y Sanciones): Régimen exacto de sanciones de la US: 2 días naturales de suspensión por cada día de retraso en préstamo general; 5 días naturales por día en préstamo por horas; suspensión durante todo el curso al acumular 6 penalizaciones. Cuentas de usuario en ALMA (Internas/Externas, Activas/Bloqueadas) y condiciones del Préstamo Intercampus.",
          "Tema 6 (Clasificación CDU): Sintaxis avanzada (+, /, :, ::, -1/-9, .01/.09, '0/'9) y Anexo Práctico con 21 ejercicios resueltos de ordenación en estanterías y orden alfabético de autores ('de la Fuente', 'd'Ors').",
          "Tema 19 (Igualdad de Género): Desarrollos de la Ley Orgánica 3/2007 (Art. 6 sobre discriminación u orden de discriminar; Art. 51 sobre brecha salarial y presencia equilibrada en órganos de selección)."
        ]
      },
      {
        title: "Reproductor de Audio (MP3 y Sintetizador TTS)",
        content: "Permite la escucha del tema mediante dos tecnologías alternables:",
        steps: [
          "Modo MP3: Locución profesional pregrabada con controles de pausado y avance.",
          "Modo TTS (Text-to-Speech): Lectura sintética en voz alta directa desde el navegador. Permite ajustar la velocidad de lectura (0.5x a 2.0x) y elegir la voz en español de tu sistema."
        ],
        tip: "La barra de progreso de audio te indica en todo momento la línea y porcentaje del tema que se está reproduciendo."
      },
      {
        title: "Modos de Enfoque, Pantalla Completa, Autoscroll y Regla",
        content: "Herramientas diseñadas para maximizar la velocidad de lectura y reducir la fatiga visual:",
        steps: [
          "Modo Enfoque: Oculta menús y distracciones al pulsar el cronómetro de lectura.",
          "Pantalla Completa: Amplía el texto a todo el monitor. Avance suave con teclado (Flecha Abajo o Espacio).",
          "Autoscroll: Desplazamiento automático vertical con regulador de velocidad en tiempo real.",
          "Regla de Lectura (Ruler): Franja guía horizontal que acompaña al puntero del ratón para seguir el texto línea por línea."
        ]
      },
      {
        title: "Compilación y Descarga de Dossier para Impresión (PDF)",
        content: "Permite exportar temas individuales o volúmenes agrupados listos para imprimir en papel físico:",
        steps: [
          "Selecciona múltiples temas simultáneamente.",
          "Incluye portada oficial con los datos de la convocatoria y ficha de bases.",
          "Genera un cuaderno de test con sus soluciones y justificaciones al final o justo a continuación de cada tema para un estudio cómodo."
        ]
      }
    ]
  },
  {
    id: "cuestionarios",
    title: "Cuestionarios y Corrección",
    iconName: "GraduationCap",
    intro: "El generador de tests reúne más de 2.000 preguntas de examen adaptadas a los estándares de la US, con un panel de corrección ultra-compacto optimizado para la revisión ágil.",
    imagePath: "/images/user_manual_tests.png",
    sections: [
      {
        title: "Modalidades de Examen",
        content: "Puedes configurar la prueba en múltiples formatos según el objetivo de tu sesión:",
        steps: [
          "Tema Único: Test de control directo sobre un tema concreto.",
          "Simulacro Personalizado: Selección de varios temas y número libre de preguntas.",
          "Simulacro Aleatorio (40 Preguntas): 2 preguntas aleatorias extraídas de cada uno de los 20 temas de la oposición.",
          "15 Simulacros Predefinidos: Exámenes fijos de 40 preguntas sin solapamiento entre sí.",
          "Exámenes Reales (2019 / 2022): Plantillas oficiales extraídas de las pruebas reales de la US.",
          "Cuadernos de Test Imprimibles: Formateados por temas para autoevaluación en papel."
        ]
      },
      {
        title: "Formatos de Realización",
        content: "Tres modos de interacción disponibles:",
        steps: [
          "Test Clásico (Interactivo): Pregunta a pregunta con corrección inmediata y explicación legislativa detallada.",
          "Simulacro en Papel (Interactivo): Hoja de examen completa en pantalla única con panel lateral de respuestas (OMR bubble sheet) y corrección final conjunta.",
          "Exportación a PDF: Maquetación oficial idéntica al examen real de la US con hoja de respuestas."
        ]
      },
      {
        title: "Panel de Corrección de Exámenes Ultra-Compacto",
        content: "La pantalla de examen corregido ha sido optimizada para maximizar la visión de las preguntas:",
        steps: [
          "Cabecera en Tira Horizontal: Comprimida en una sola barra horizontal reduciendo un 70% el espacio vertical.",
          "6 KPIs de Rendimiento: Muestra Total, Contestadas, En Blanco, Aciertos, Errores y Porcentaje de Nota en línea.",
          "Puntuación Neta Destacada (0.00 / 65.00): Visualización limpia de la nota de fase de oposición sobre el total de puntos.",
          "Tooltip Informativo (ℹ️): Al pasar el ratón por el icono de información se despliega la fórmula oficial detallada de corrección sin ocupar espacio en pantalla.",
          "Metadatos Unificados: Cada pregunta alinea en una misma fila superior el número, la insignia de estado (ACIERTO, ERROR, NO CONTESTADA) y el distintivo del Tema.",
          "Visualización Múltiple: Permite ver mínimo 2 preguntas completas simultáneamente sin necesidad de scroll."
        ]
      },
      {
        title: "Fórmula de Corrección Oficial y Penalización",
        content: "Se aplica la regla oficial de la Universidad de Sevilla para un examen de 65 puntos:",
        steps: [
          "Fórmula Neta: Nota = Aciertos - (Errores * 0.25)",
          "Las preguntas en blanco no descuentan puntos.",
          "Nota mínima para aprobar la fase de oposición: 32.50 puntos sobre 65.00."
        ],
        alert: "Cada respuesta errónea restará un 25% (0.25 puntos) del valor de un acierto. Ante la duda absoluta, es aconsejable dejar la opción en blanco."
      },
      {
        title: "Criterios Psicométricos de Generación de Preguntas",
        content: "Todas las preguntas del banco de datos cumplen normas strictly auditadas:",
        steps: [
          "4 Opciones Únicas (A-B-C-D) sin opciones comodín del tipo 'Todas son correctas'.",
          "Paridad de Longitud: Opciones de respuesta con extensión y complejidad gramatical homogénea.",
          "Trampas Probabilísticas de Plazos: Distractores diseñados con alternancia de días hábiles vs días naturales para evaluar la precisión.",
          "Identificación explícita de artículos y normas en la cabecera de la pregunta."
        ]
      }
    ]
  },
  {
    id: "formadores",
    title: "Material y Test de Formadores",
    iconName: "ClipboardList",
    intro: "Baterías de preguntas de alta exigencia procedentes de formadores para el refuerzo de los bloques normativos y legislativos clave.",
    sections: [
      {
        title: "Bloques de Preguntas Especializadas",
        content: "Organizadas por convocatorias y normativas de gran peso de los formadores oficiales:",
        steps: [
          "Estatutos US - Bloque 1: Títulos I al III de los Estatutos de la Universidad de Sevilla (Tema 17).",
          "Estatutos US - Bloque 2: Títulos IV en adelante (Tema 17).",
          "IV Convenio Colectivo: Régimen del Personal Laboral de las Universidades Públicas de Andalucía (Tema 18).",
          "Ley Orgánica 3/2007 de Igualdad: Ampliada con 44 preguntas inéditas, alcanzando un total de 158 preguntas dedicadas a esta ley (Tema 19)."
        ]
      },
      {
        title: "Modalidades de Práctica",
        content: "Al igual que el módulo general, permite su resolución en formato interactivo (pregunta a pregunta con retroalimentación), simulacro global o exportación a PDF imprimible."
      }
    ]
  },
  {
    id: "agente_bus",
    title: "Asistente Virtual IA (Agente BUS ✨)",
    iconName: "Sparkles",
    intro: "Tu tutor de Inteligencia Artificial integrado, diseñado exclusivamente para resolver dudas del temario, aclarar conceptos bibliotecarios y ayudarte en la resolución de casos prácticos.",
    imagePath: "/images/user_manual_tutor.png",
    sections: [
      {
        title: "¿Qué es el Agente BUS?",
        content: "El Agente BUS es un asistente conversacional interactivo entrenado en la normativa de la Universidad de Sevilla, la legislación de archivos y  bibliotecas, y las técnicas de clasificación.",
        steps: [
          "Ubicación en el Menú: Se encuentra disponible en el bloque 'HERRAMIENTAS' de la barra lateral (botón destacado con destellos).",
          "Acceso Directo: Puedes invocarlo en cualquier momento sin perder la vista de estudio en la que te encuentres."
        ]
      },
      {
        title: "Casos de Uso Principales",
        content: "Puedes preguntarle directamente en lenguaje natural sobre cualquier aspecto de tu oposición:",
        steps: [
          "Aclaración de artículos de leyes (Estatutos US, Ley de Contratos, Ley de Igualdad, TREBEP).",
          "Resolución de ejercicios prácticos de CDU (auxiliares de tiempo, lugar, forma, signos de relación +, /, :, ::).",
          "Dudas sobre el funcionamiento del software de gestión ALMA, catálogo FAMA y plataformas de e-books.",
          "Consultas sobre plazos de préstamo, categorías de usuarios y régimen de sanciones del BUS."
        ],
        tip: "Utiliza el Agente BUS cuando encuentres una pregunta fallada en un test y desees una explicación conceptual adicional a la cita legal."
      }
    ]
  },
  {
    id: "flashcards",
    title: "Tarjetas de Memorización (Flashcards)",
    iconName: "Layers",
    intro: "Herramienta basada en el principio de recuerdo activo (Active Recall) para consolidar datos puros, fechas, sanciones y plazos en la memoria a largo plazo.",
    sections: [
      {
        title: "Funcionamiento del Mazo de Estudio",
        content: "Selecciona un tema concreto o el 'Mazo Combinado' (tarjetas aleatorias de todo el programa):",
        steps: [
          "Anverso (Pregunta/Concepto): Muestra la cuestión o término técnico a recordar.",
          "Giro 3D: Haz clic sobre la tarjeta para girarla y comprobar la respuesta correcta en el reverso con animación fluida.",
          "Hover de Lectura: Si pasas el ratón por la tarjeta se pausará el tiempo para que puedas leer cómodamente.",
          "Autoevaluación de Dificultad: Clasifica tu recuerdo en Fácil, Medio o Difícil para registrar tu grado de asimilación."
        ]
      },
      {
        title: "Resumen de Rendimiento por Sesión",
        content: "Al finalizar el mazo, el sistema te muestra un desglose de tarjetas clasificadas por su nivel de dificultad para identificar qué áreas requieren un repaso en el temario."
      }
    ]
  },
  {
    id: "progreso",
    title: "Progreso, Ajustes y Temas Visuales",
    iconName: "BarChart3",
    intro: "Analítica de rendimiento del opositor, persistencia de datos en la nube, medidas de seguridad de sesión y diseño visual de la interfaz.",
    sections: [
      {
        title: "Visualización de Gráficos e Historial",
        content: "Accede a gráficos de barras con el tiempo real de estudio por tema y a la gráfica de evolución de notas en cuestionarios.",
        tip: "En la parte inferior dispones del botón 'Reiniciar Progreso' si deseas restablecer tus contadores a cero antes de comenzar una fase intensa de simulacros."
      },
      {
        title: "Persistencia de Datos (Local y Nube Firebase)",
        content: "El almacenamiento de tu evolución depende de tu perfil de acceso:",
        steps: [
          "Perfil de Invitado (Demo): Guardado en el almacenamiento local del navegador (LocalStorage).",
          "Perfil de Estudiante Registrado: Sincronización automática periódica en la nube (Firebase Database) para continuar tu estudio desde cualquier equipo."
        ]
      },
      {
        title: "Medidas de Seguridad y Control Concurrente",
        content: "Garantías de seguridad e inactividad integradas:",
        steps: [
          "Sesión Única Concurrente: Solo se permite un inicio de sesión activo por alumno. Si se accede desde otro dispositivo o pestaña, la sesión previa se cerrará de forma automática.",
          "Auto-Logout por Inactividad (30 Minutos): Tras 30 minutos sin interacción, se guarda el progreso en la nube y se muestra una ventana de aviso de 30 segundos antes del cierre automático de sesión para proteger tu cuenta."
        ]
      },
      {
        title: "Ajustes de Interfaz y Tema Claro / Oscuro",
        content: "A través del panel de Ajustes en la esquina inferior izquierda (botón de engranaje) puedes personalizar:",
        steps: [
          "Tema Visual: Elige entre Tema por Defecto (azul y dorado premium), Oscuro Puro (diseño OLED minimalista con fondo negro) o Claros de Alto Contraste (para lectura diurna sin fatiga).",
          "Tamaño de Letra global: Tres configuraciones de legibilidad ampliada para el temario y opciones de test.",
          "Sonidos: Activa o desactiva alertas y sonidos motivacionales del sistema.",
          "Fórmula de Explicación de Tests: Habilita la corrección y justificación inmediata de test o aplázala al finalizar la prueba completa."
        ]
      },
      {
        title: "Sistema de Jerarquía Visual de Botones UI",
        content: "La interfaz utiliza un sistema consistente de 3 niveles de botones interactivos:",
        steps: [
          "Botones Primarios (glow-btn): Azul degradado para las acciones principales del usuario (ej. 'Iniciar Test', 'Estudiar Ahora').",
          "Botones Secundarios (glow-btn-secondary): Borde sutil y fondo translúcido para acciones complementarias (ej. 'Pausar', 'Siguiente').",
          "Botones Terciarios / Ghost (btn-ghost): Transparentes y discretos para acciones de navegación de baja prioridad (ej. 'Cancelar', 'Volver')."
        ]
      }
    ]
  },
  {
    id: "anexos_avisos",
    title: "Mis Anexos y Noticias de Erratas",
    iconName: "ClipboardList",
    intro: "Módulo especial para consultar anexos personales del alumno y estar al día con modificaciones legislativas y la fe de erratas oficial.",
    sections: [
      {
        title: "Mis Anexos / Anotaciones Propias",
        content: "En la pestaña 'Mis Anexos' puedes agregar comentarios, aclaraciones normativas personales o apuntes propios asociados a cualquiera de los temas del programa. Estas notas son privadas y se asocian de forma permanente a tu perfil de estudiante."
      },
      {
        title: "Fe de Erratas y Avisos a tu Edición Física",
        content: "En la misma vista puedes consultar la fe de erratas registrada por el administrador. Los avisos se filtran dinámicamente según la versión del manual impreso asignada a tu perfil, asegurando que recibas correcciones oportunas con anexo legislativo de apoyo solo si afectan a la edición que posees."
      }
    ]
  }
];

export const adminManualCategories = [
  {
    id: "admin_metricas",
    title: "Métricas y Estado de la Plataforma",
    iconName: "BarChart3",
    intro: "Resumen numérico y control de actividad de los estudiantes y el estado de licencias de acceso en tiempo real.",
    sections: [
      {
        title: "Indicadores Clave de Rendimiento (KPIs)",
        content: "En la cabecera de la sección de Control se muestran estadísticas consolidadas esenciales sobre la salud del curso:",
        steps: [
          "Estudiantes Online: Número de alumnos activos sincrónicamente (movimiento registrado en los últimos 10 minutos).",
          "Estudiantes Registrados: Recuento total de alumnos registrados (excluyendo perfiles de demostración).",
          "Nota Media Global: Promedio total neto acumulado sobre todos los cuestionarios respondidos por los alumnos.",
          "Métricas de Códigos de Libros: Registro unificado del total de claves de acceso impresas distribuidas, identificando cuántas están usadas vs libres en almacén."
        ]
      }
    ]
  },
  {
    id: "admin_estudiantes",
    title: "Gestión de Estudiantes y Control de Sesión",
    iconName: "LayoutDashboard",
    intro: "Herramientas para supervisar el rendimiento individual, cerrar sesiones concurrentes de forma remota y asignar versiones del material físico del temario.",
    imagePath: "/images/admin_manual_users.png",
    sections: [
      {
        title: "Buscador y Monitor de Actividad",
        content: "Dispones de una barra de búsqueda inteligente para filtrar instantáneamente el listado por el nombre del estudiante, su correo de acceso o el código de libro activado.",
        steps: [
          "Listado Reactivo: Muestra el estatus de conexión del alumno (insignia de color según esté online u offline).",
          "Visualización de Estudio: Puedes verificar el tiempo total dedicado al estudio por tema y su tasa de acierto media."
        ]
      },
      {
        title: "Control Concurrente y Botón de Cierre (Kick)",
        content: "Para evitar la compartición no autorizada de cuentas de usuario, el sistema permite un inicio de sesión único concurrente. Si detectas accesos inapropiados del mismo alumno o bloqueos, puedes presionar el botón 'Cerrar Sesión (Kick)'. Esto expulsará el dispositivo del alumno en vivo, forzando la redirección a una pantalla de bloqueo con aviso.",
        alert: "Eliminar permanentemente a un estudiante borrará también todo su progreso, estadísticas y registros vinculados en Firestore. Úsalo con extrema precaución."
      },
      {
        title: "Asignación de Versión de Materiales",
        content: "Para cada estudiante del listado, puedes desplegar el selector de Edición y asociar qué versión física posee del Temario, Test o Simulacros. Esta vinculación condiciona los archivos PDF a los que tendrá acceso y qué notificaciones de erratas le serán notificadas."
      }
    ]
  },
  {
    id: "admin_ediciones",
    title: "Ediciones Impresas del Manual",
    iconName: "Info",
    intro: "Control de versiones de los manuales físicos del temario, test y simulacros distribuidos comercialmente a los estudiantes.",
    sections: [
      {
        title: "Alta de Ediciones Impresas",
        content: "Crea identificadores de versión del material físico (ej: 'V1.0 - Oficial Convocatoria 2026'). Puedes añadir anotaciones internas que indiquen qué cambios, plazos o bases de convocatoria abarca dicha tirada imprenta."
      },
      {
        title: "Carga de Dossiers PDF Oficiales",
        content: "A través del subformulario puedes subir y vincular el archivo PDF maquetado a la edición correspondiente. Al asignarle esta edición a un alumno, este podrá descargar el documento PDF completo de manera segura desde su visualizador."
      }
    ]
  },
  {
    id: "admin_erratas",
    title: "Notificación de Erratas y Avisos",
    iconName: "Info",
    intro: "Gestor para publicar fe de erratas oficiales y avisos de cambios legislativos urgentes, vinculándolos a las versiones impresas correspondientes.",
    sections: [
      {
        title: "Creación de Noticia o Errata",
        content: "Ante una modificación del temario o errata detectada, completa el formulario indicando:",
        steps: [
          "Tipo de material (Temario / Test / Simulacro).",
          "Tema del programa afectado (1 al 20).",
          "Sección del tema y Título corto explicativo.",
          "Resumen aclaratorio detallado de la modificación legal.",
          "Opcional: Adjuntar un PDF específico con el desarrollo normativo sustitutivo.",
          "Selección de Edición Afectada: Marca los casilleros de todas las ediciones físicas en las que existía ese error."
        ]
      },
      {
        title: "Notificación Dinámica en Tiempo Real",
        content: "Al guardar el aviso, Firebase propaga la actualización a la nube. Todos los alumnos que tengan asignadas esas ediciones afectadas recibirán una alerta destacada en su menú de 'Mis Anexos', mostrándoles el detalle del cambio legal para que puedan corregir su manual físico."
      }
    ]
  },
  {
    id: "admin_codigos",
    title: "Generador de Códigos de Activación",
    iconName: "Info",
    intro: "Gestión del inventario de claves alfanuméricas de acceso asociadas a los libros físicos de las oposiciones.",
    sections: [
      {
        title: "Generación de Lotes Seguros",
        content: "Permite la creación rápida de lotes de hasta 200 códigos únicos alfanuméricos mediante cifrado seguro. Diseñados para ser impresos en etiquetas al final de los libros físicos."
      },
      {
        title: "Exportación y Trazabilidad",
        content: "Dispones de botones para copiar el lote en texto plano para su traspaso a Excel o imprenta. El listado inferior te permite buscar códigos concretos e identificar si están libres, o qué alumno los canjeó (mostrando su perfil y dirección de correo asociada)."
      }
    ]
  },
  {
    id: "admin_banco",
    title: "Gestor del Banco de Preguntas",
    iconName: "BookOpen",
    intro: "Revisión permanente, auditoría de distractores y saneamento de las preguntas de examen cargadas por defecto en la plataforma.",
    sections: [
      {
        title: "Búsqueda y Auditoría de Cuestiones",
        content: "Selecciona el número de tema a auditar. Podrás inspeccionar todas las preguntas registradas, realizar búsquedas de texto dinámicas sobre los enunciados, las justificaciones legislativas o las opciones de respuestas incorrectas."
      },
      {
        title: "Eliminación Directa del Banco",
        content: "Si detectas que una pregunta ha quedado desactualizada por un cambio normativo, presiona 'Eliminar'. La pregunta se removerá al instante de la base en memoria y se reajustará el recuento del banco de todos los usuarios de forma reactiva."
      }
    ]
  },
  {
    id: "admin_generador",
    title: "Generador de Cuestionarios por IA",
    iconName: "Sparkles",
    intro: "Creación asistida por Inteligencia Artificial de nuevas preguntas de examen basándose estrictamente en los epígrafes del temario oficial.",
    imagePath: "/images/admin_manual_generator.png",
    sections: [
      {
        title: "Carga de Títulos Markdown",
        content: "El sistema lee los documentos Markdown del temario oficial localizados en `src/data/markdown/`. Extrae y despliega todos los encabezados (H2 y H3) del tema seleccionado para que puedas elegir qué subapartados precisos examinar.",
        tip: "Perfecto para balancear el cuestionario y evitar que todas las preguntas cubran únicamente el inicio del tema."
      },
      {
        title: "Criterios Psicométricos y Generación",
        content: "Establece el número de preguntas deseadas. El generador las elaborará respetando los estándares de examen (cuatro respuestas uniformes, lenguaje aséptico de distracción de plazos, y obligatoriedad de referenciar el artículo legislativo de soporte)."
      },
      {
        title: "Edición Directa e Inserción Manual",
        content: "Una vez generadas, se muestran en una tabla editable interactiva. Puedes ajustar su redacción, cambiar distractores erróneos, definir otra respuesta clave, descartar preguntas no deseadas o insertar preguntas de redacción propia sobre la marcha."
      },
      {
        title: "Guardado en Caliente",
        content: "Al confirmar el lote de preguntas revisado, se guardan en la colección oficial del tema. Los alumnos dispondrán de estas nuevas combinaciones de preguntas inéditas inmediatamente en su siguiente test interactivo o simulacro en papel."
      }
    ]
  },
  {
    id: "admin_comunicaciones",
    title: "Comunicaciones Masivas por Email",
    iconName: "Info",
    intro: "Gestión de boletines y comunicados por email externos a la app para mantener informados a los alumnos de las incidencias del curso.",
    sections: [
      {
        title: "Editor de Plantilla con Variables",
        content: "Escribe el asunto y cuerpo del comunicado. Se admite el uso del comodín `{nombre}` en el cuerpo; el motor lo reemplazará por el nombre real del estudiante en el momento del envío."
      },
      {
        title: "Filtros de Destinatarios",
        content: "Permite seleccionar el alcance del envío:",
        steps: [
          "Envío Global: A todos los estudiantes activos registrados.",
          "Filtrar por Prefijo de Código: Dirigido solo a destinatarios vinculados a una tirada particular de libros físicos (ej. el grupo inicial de alumnos que canjearon un código V1).",
          "Envío Individual: Indicando el correo específico a contactar."
        ]
      },
      {
        title: "Cola en la Nube (Trigger Email)",
        content: "Al confirmar, los mensajes se meten en la base de datos de Firebase. La extensión automatizada de correo gestiona el envío de forma asíncrona, registrando el historial y el estado de entrega en la consola del administrador."
      }
    ]
  },
  {
    id: "admin_videos",
    title: "Videoclases Explicativas por Tema",
    iconName: "Info",
    intro: "Mesa de control para asociar listas de reproducción de vídeos tutoriales externos a cada tema de estudio.",
    sections: [
      {
        title: "Añadir Vídeos y URLs",
        content: "Selecciona el tema que quieres editar. Completa el formulario de vídeo indicando el nombre, URL (YouTube, Vimeo o URL de streaming directa), duración del vídeo y notas del contenido explicativo."
      },
      {
        title: "Reordenación Dinámica y Arrastre",
        content: "El listado muestra la playlist actual. Con los botones de flecha (Subir / Bajar) puedes mover los elementos para establecer el orden didáctico lógico de las videoclases."
      },
      {
        title: "Sincronización Inmediata en Dispositivos",
        content: "Presiona el botón de 'Sincronizar Móvil / Enviar a la Nube'. La lista de reproducción remota se actualizará en Firebase Firestore, haciendo que los vídeos aparezcan y sean reproducibles de manera inmediata en la versión de Android/iOS y web de todos los alumnos de ese tema."
      }
    ]
  }
];
