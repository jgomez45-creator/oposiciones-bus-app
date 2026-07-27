export const manualCategories = [
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
          "EVALUACIÓN: Cuestionarios de autoevaluación general (Tests) y Baterías específicas de Formadores sindicales (CCOO).",
          "SEGUIMIENTO: Cuadro de mando de Estadísticas y analítica de Progreso individual.",
          "HERRAMIENTAS: Asistente Virtual de Inteligencia Artificial (Agente BUS ✨) y este Manual de Instrucciones interactivo.",
          "ADMINISTRACIÓN: Panel de control exclusivo para perfiles administradores (gestión de usuarios y banco de preguntas)."
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
          "Escritorio y Laptops Compactos (1025px–1280px): El menú lateral se adapta automáticamente a un ancho ultracompacto (240px) con 3 zonas fijas (Logo superior, Menú central con scroll suave independiente, y Perfil/Cerrar sesión fijo abajo), garantizando que los datos de usuario nunca queden ocultos.",
          "Monitores Estándar (1281px–1440px): El Dashboard se reorganiza en columna única para aprovechar todo el ancho horizontal sin apretar los widgets laterales.",
          "Dispositivos Móviles y Tablets (≤ 1024px): La barra lateral se transforma en una barra de navegación inferior (Bottom Nav Bar) fija y táctil de acceso rápido."
        ]
      }
    ]
  },
  {
    id: "dashboard",
    title: "Panel de Control (Dashboard)",
    iconName: "LayoutDashboard",
    intro: "El Dashboard es la pantalla principal de seguimiento diario. Centraliza tus métricas clave de rendimiento, recomendaciones de estudio prioritarias y el temporizador Pomodoro.",
    sections: [
      {
        title: "Bloques de Estadísticas Principales",
        content: "En la cabecera del panel se muestran tres indicadores fundamentales calculados en tiempo real:",
        steps: [
          "Progreso del Temario: Cantidad de temas completados (marcados como 'Resumido', 'Repasado' o 'Memorizado') respecto al total de 20 temas oficiales de la oposición.",
          "Tiempo de Estudio: Registro acumulado de horas y minutos dedicados al estudio activo del temario a través de la plataforma.",
          "Precisión Media: Porcentaje de aciertos promedio calculado sobre todos los tests y simulacros completados."
        ]
      },
      {
        title: "Tabla de Estado del Temario (20 Temas)",
        content: "Muestra la lista de los 20 temas oficiales de la convocatoria. Puedes actualizar el estado de cada tema directamente en el selector de su fila. Los estados disponibles son:",
        steps: [
          "Pendiente (Rojo): Tema aún no iniciado.",
          "Leyendo (Amarillo/Oro): Tema en fase de primera lectura.",
          "Resumido (Azul): Esquemas y conceptos principales consolidados.",
          "Memorizado o Repasado (Verde Esmeralda): Tema asimilado y preparado para responder cuestionarios."
        ],
        tip: "Haz clic en el título de cualquier tema para abrir directamente su visualizador y reproductor."
      },
      {
        title: "Temporizador Pomodoro Integrado",
        content: "Diseñado para mantener una concentración máxima en bloques de 25 minutos de trabajo y 5 minutos de descanso guiado:",
        steps: [
          "Selecciona el tema que vas a estudiar en el desplegable.",
          "Haz clic en el botón de Play para iniciar la cuenta atrás de 25 minutos.",
          "El tiempo invertido se registrará automáticamente en la ficha de ese tema.",
          "Al finalizar la sesión, sonará una señal acústica notificando el inicio del descanso de 5 minutos."
        ],
        alert: "Para evitar desviaciones en la métrica, no minimices la pestaña de manera prolongada mientras el temporizador está en marcha."
      },
      {
        title: "Sugerencia Dinámica de Estudio",
        content: "El algoritmo analiza tu historial y resalta automáticamente cuál es el tema prioritario que debes abordar hoy con un botón de acceso directo ('Estudiar Ahora')."
      }
    ]
  },
  {
    id: "temario",
    title: "Visualizador de Temas y Fuentes",
    iconName: "BookOpen",
    intro: "El módulo de Temario es un entorno inmersivo enriquecido con la normativa oficial de la US, fuentes de CCOO, audiolibro, lectura por sintetizador (TTS), herramientas de enfoque y compilación de PDF para impresión.",
    sections: [
      {
        title: "Pestañas Temáticas de Aprendizaje",
        content: "Cada uno de los 20 temas se organiza en tres vistas principales accesible desde la barra superior:",
        steps: [
          "Contenido (Tema): Desarrollo completo del texto oficial con legislación actualizada, plazos, sanciones y procedimientos técnicos.",
          "Esquema (Resumen): Estructura simplificada e índice de contenidos para repasar conceptos clave rápidamente.",
          "Conceptos (Glosario): Términos técnicos, acrónimos bibliotecarios (MARC21, CDU, ALMA, OAI-PMH) y definiciones legales."
        ]
      },
      {
        title: "Contenidos Destacados e Incorporaciones Recientes",
        content: "El temario incluye precisiones normativas clave de la US extraídas de documentación oficial y guías técnicas:",
        steps: [
          "Tema 4 (Servicios a Usuarios y Canales BUS): Incluye plataformas de e-books (PRESTO, Odilo, Ebook Central, eLibro), portales científicos (Dialnet, ProQuest) y canales oficiales de atención al usuario (Expon@us, ExpoBUS, IntraBUS, OCULUS, CONSÚLTENOS).",
          "Tema 5 (Préstamo, Devoluciones y Sanciones - Código 4140): Incorpora el régimen exacto de sanciones de la US: 2 días naturales de suspensión por cada día de retraso en préstamo general; 5 días naturales por día en préstamo por horas; suspensión durante todo el curso al acumular 6 penalizaciones. Incluye procedimientos por extravío o deterioro, cuentas de usuario en ALMA (Internas/Externas, Activas/Bloqueadas) y condiciones del Préstamo Intercampus.",
          "Tema 6 (Clasificación Decimocriminal Universal - CDU): Sintaxis avanzada (+, /, :, ::, -1/-9, .01/.09, '0/'9) y Anexo Práctico con 21 ejercicios resueltos de ordenación en estanterías y alfabetización de autores ('de la Fuente', 'd'Ors').",
          "Tema 19 (Igualdad de Género): Incorpora los desarrollos de la Ley Orgánica 3/2007 (Art. 6 sobre discriminación u orden de discriminar y justificación objetiva; Art. 51 sobre brecha salarial y presencia equilibrada en órganos de selección)."
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
    title: "Cuestionarios y Corrección Ultra-Compacta",
    iconName: "GraduationCap",
    intro: "El generador de tests reúne más de 2.000 preguntas de examen adaptadas a los estándares psicométricos de la US, con un panel de corrección ultra-compacto optimizado para la revisión ágil.",
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
          "Simulacro en Papel (Interactivo): Hoja de examen completa en pantalla única con panel lateral de respuestas y corrección final conjunta.",
          "Exportación a PDF: Maquetación oficial idéntica al examen real de la US con hoja de respuestas."
        ]
      },
      {
        title: "Panel de Corrección de Exámenes Ultra-Compacto",
        content: "La pantalla de examen corregido ha sido optimizada para maximizar la visión de las preguntas:",
        steps: [
          "Cabecera en Tira Horizontal: Comprimida en una sola barra horizontal reduciendo un 70% el espacio vertical.",
          "6 KPIs de Rendimiento: Muestra Total, Contestadas, En Blanco, Aciertos, Errores y Porcentaje de Nota en línea.",
          "Puntuación Neta Destacada (0.00 / 65.00): Visualización limpia de la nota final sobre el máximo de la oposición de la US.",
          "Tooltip Informativo (ℹ️): Al pasar el ratón por el icono de información se despliega la fórmula oficial detallada de corrección sin ocupar espacio en pantalla.",
          "Metadatos Unificados: Cada pregunta alinea en una misma fila superior el número, la insignia de estado (ACIERTO, ERROR, NO CONTESTADA) y el distintivo del Tema.",
          "Visualización Múltiple: Permite ver mínimo 2 preguntas completas simultáneamente sin necesidad de scroll inicial."
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
        content: "Todas las preguntas del banco cumplen 18 normas strictly auditadas:",
        steps: [
          "4 Opciones Únicas (A-B-C-D) sin opciones comodín del tipo 'Todas son correctas'.",
          "Paridad de Longitud: Opciones de respuesta con extensión y complejidad gramatical homogénea.",
          "Trampas Probabilísticas de Plazos: Distractores diseñados con alternancia de días hábiles vs días naturales para evaluar la precisión del opositor.",
          "Identificación explícita de artículos y normas en la cabecera de la pregunta."
        ]
      }
    ]
  },
  {
    id: "formadores",
    title: "Material de Formadores y Tests CCOO",
    iconName: "ClipboardList",
    intro: "Baterías de preguntas de alta exigencia procedentes de formadores sindicales (CCOO) para el refuerzo de los bloques normativos y legislativos clave.",
    sections: [
      {
        title: "Bloques de Preguntas Especializadas",
        content: "Organizadas por convocatorias y normativas de gran peso:",
        steps: [
          "Estatutos US - Bloque 1: Títulos I al III de los Estatutos de la Universidad de Sevilla (Tema 17).",
          "Estatutos US - Bloque 2: Títulos IV en adelante (Tema 17).",
          "IV Convenio Colectivo: Régimen del Personal Laboral de las Universidades Públicas de Andalucía (Tema 18).",
          "Ley Orgánica 3/2007 de Igualdad: Ampliada con 44 preguntas inéditas extraídas de fuentes de CCOO, alcanzando un total de 158 preguntas dedicadas a esta ley (Tema 19)."
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
    sections: [
      {
        title: "¿Qué es el Agente BUS?",
        content: "El Agente BUS es un asistente conversacional interactivo entrenado en la normativa de la Universidad de Sevilla, la legislación de archivos y bibliotecas, y las técnicas de clasificación.",
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
          "Giro 3D: Haz clic sobre la tarjeta para girarla y comprobar la respuesta correcta en el reverso.",
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
    title: "Estadísticas, Seguridad y Sistema UI",
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
          "Auto-Logout por Inactividad (30 Minutos): Tras 30 minutos sin interacción, se guarda el progreso en la nube y se muestra una ventana de aviso de 30 segundos antes del cierre automático de sesión para proteger tu cuenta y ahorrar recursos."
        ]
      },
      {
        title: "Sistema de Jerarquía Visual de Botones UI",
        content: "La interfaz utiliza un sistema consistente de 3 niveles de botones interactivos:",
        steps: [
          "Botones Primarios (glow-btn): Azul degradado para las acciones principales del usuario (ej. 'Iniciar Test', 'Estudiar Ahora').",
          "Botones Secundarios (glow-btn-secondary): Borde sutil y fondo translúcido para acciones complementarias (ej. 'Pausar', 'Siguiente').",
          "Botones Terciarios / Ghost (btn-ghost): Transparentes y discretos para acciones de navegación de baja prioridad (ej. 'Cancelar', 'Volver', 'Modificar')."
        ]
      }
    ]
  }
];
