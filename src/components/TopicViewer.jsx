import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { 
  BookOpen, 
  List, 
  Tag, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  Printer,
  Eye,
  Volume2,
  Square,
  Maximize2,
  Minimize2,
  Sliders,
  Settings
} from 'lucide-react';
import quizzesData from '../data/quizzes.json';

// Utility to extract clean spoken text from HTML content (stripping HTML tags)
const getCleanTextForSpeech = (htmlString) => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  let text = tempDiv.textContent || tempDiv.innerText || '';
  return text.replace(/\s+/g, ' ').trim();
};


export default function TopicViewer({ 
  topics, 
  activeTopicId, 
  setActiveTopicId, 
  progress, 
  updateTopicStatus, 
  incrementTimeForTopic,
  setCurrentTab,
  currentUser
}) {
  const handlePrintClick = () => {
    if (currentUser?.role === 'guest' || currentUser?.uid === 'guest_profile') {
      alert('Esta opción no está activa en el modo invitado. Por favor, regístrate para poder descargar o imprimir el temario en PDF.');
      return;
    }
    if (viewMode === 'single') {
      setSelectedPrintTopicIds([activeTopicId.toString()]);
      setIsManualFormat(true);
      setViewMode('multi-print');
      setTriggerAutocompile(true);
    } else {
      window.print();
    }
  };

  const [activeSubTab, setActiveSubTab] = useState('content'); // 'content' | 'outline' | 'concepts'
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showReadingControls, setShowReadingControls] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [fontSize, setFontSize] = useState('medium'); // 'small' | 'medium' | 'large' | 'extra-large'
  const [readingTheme, setReadingTheme] = useState('light-reading'); // 'default' | 'light-reading' | 'sepia'
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // Autoscroll & Reading Ruler State
  const [isAutoscrolling, setIsAutoscrolling] = useState(false);
  const [autoscrollSpeed, setAutoscrollSpeed] = useState(3);
  const [showReadingRuler, setShowReadingRuler] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false); // Full-screen reading overlay
  
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'multi-print'
  const [selectedPrintTopicIds, setSelectedPrintTopicIds] = useState([]);
  const [isCompilingPrint, setIsCompilingPrint] = useState(false);
  const [compiledPrintContent, setCompiledPrintContent] = useState('');
  const [includeQuestionsInPrint, setIncludeQuestionsInPrint] = useState(false);
  const [printQuestionsCount, setPrintQuestionsCount] = useState(10);
  const [isManualFormat, setIsManualFormat] = useState(false);
  const [triggerAutocompile, setTriggerAutocompile] = useState(false);

  const handleCompilePrint = async () => {
    if (selectedPrintTopicIds.length === 0) return;
    
    setIsCompilingPrint(true);
    setCompiledPrintContent('');
    
    // Sort topic IDs numerically to maintain correct program order
    const sortedIds = [...selectedPrintTopicIds].map(Number).sort((a, b) => a - b);
    
    try {
      const promises = sortedIds.map(id => {
        const formattedNum = id.toString().padStart(2, '0');
        return fetch(`/markdown/tema-${formattedNum}.md`)
          .then(res => {
            if (!res.ok) throw new Error(`Tema ${id} no encontrado`);
            return res.text();
          })
          .then(text => {
            // Parse using marked
            const parsedHtml = marked.parse(text);
            const topicMeta = topics.find(t => t.id === id);
            
            let questionsHtml = '';
            let answersHtml = '';
            
            if (includeQuestionsInPrint) {
              const allTopicQs = (quizzesData[id.toString()] || []).filter(q => q.usage !== 'simulacro');
              // Shuffle and select N questions
              const topicQuestions = [...allTopicQs]
                .sort(() => 0.5 - Math.random())
                .slice(0, printQuestionsCount);
                
              if (topicQuestions.length > 0) {
                const qListHtml = topicQuestions.map((q, idx) => {
                  const optionsList = q.options.map((opt, oIdx) => `
                    <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 13pt; line-height: 1.4;">
                      <div class="option-checkbox-box" style="width: 14px; height: 14px; border: 1px solid black; border-radius: 2px; margin-top: 3px; flex-shrink: 0; display: inline-block; box-sizing: border-box;">&#8203;</div>
                      <span><strong>${['A', 'B', 'C', 'D'][oIdx]})</strong> ${opt}</span>
                    </div>
                  `).join('');
                  return `
                    <div style="margin-bottom: 18px; page-break-inside: avoid; break-inside: avoid;">
                      <div style="font-weight: bold; margin-bottom: 8px; font-size: 13pt; line-height: 1.4;">${idx + 1}. ${q.question}</div>
                      <div style="padding-left: 10px;">${optionsList}</div>
                    </div>
                  `;
                }).join('');

                const aListHtml = topicQuestions.map((q, idx) => {
                  const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer];
                  return `
                    <div style="margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; font-size: 13pt; line-height: 1.4;">
                      <div style="font-weight: bold;">Pregunta ${idx + 1}: Respuesta Correcta <span style="text-decoration: underline; font-size: 13pt;">${correctLetter}</span></div>
                      <div style="font-size: 13pt; color: #333333; margin-top: 4px; padding-left: 10px; border-left: 2px solid #004B93; line-height: 1.4;">
                        <strong>Explicación:</strong> ${q.explanation}
                      </div>
                    </div>
                  `;
                }).join('');

                questionsHtml = `
                  <div class="print-page-break"></div>
                  <div class="printable-exam-sheet" style="padding-top: 20px;">
                    <div style="border-bottom: 3px solid #000000; padding-bottom: 8px; margin-bottom: 16px; text-align: left;">
                      <span style="font-size: 12pt; font-weight: normal; color: #555555; text-transform: uppercase;">Autoevaluación de Control</span>
                      <h2 style="margin: 4px 0 0 0; font-size: 22pt; font-weight: bold; color: #000000;">Cuestionario Escrito: Tema ${id}</h2>
                      <p style="margin: 2px 0 0 0; font-size: 13pt; color: #555555; line-height: 1.4;">Responde a las siguientes ${topicQuestions.length} preguntas de opción múltiple.</p>
                    </div>
                    <div style="margin-top: 15px;">
                      ${qListHtml}
                    </div>
                  </div>
                `;

                answersHtml = `
                  <div class="print-page-break"></div>
                  <div class="printable-answers-section" style="padding-top: 20px;">
                    <div style="border-bottom: 3px solid #000000; padding-bottom: 8px; margin-bottom: 16px; text-align: left;">
                      <span style="font-size: 12pt; font-weight: normal; color: #555555; text-transform: uppercase;">Solucionario de Autoevaluación</span>
                      <h2 style="margin: 4px 0 0 0; font-size: 22pt; font-weight: bold; color: #000000;">Respuestas y Explicaciones: Tema ${id}</h2>
                      <p style="margin: 2px 0 0 0; font-size: 13pt; color: #555555; line-height: 1.4;">Hoja de corrección y fundamentos legislativos.</p>
                    </div>
                    <div style="margin-top: 15px;">
                      ${aListHtml}
                    </div>
                  </div>
                `;
              }
            }

            const qSection = questionsHtml ? `<div data-topic-questions="${id}">${questionsHtml}</div>` : '';
            const aSection = answersHtml ? `<div data-topic-answers="${id}">${answersHtml}</div>` : '';

            return `
              <section class="print-topic-block" data-topic-id="${id}">
                <div class="print-topic-header">
                  <span class="print-superheader">Dossier de Apoyo Didáctico &bull; Tema ${id}</span>
                  <h1 class="print-topic-title">${topicMeta.title}</h1>
                  <p class="print-topic-subtitle">${topicMeta.subtitle}</p>
                </div>
                <div class="markdown-rendered-content">
                  ${parsedHtml}
                </div>
              </section>
              ${qSection}
              ${aSection}
            `;
          });
      });
      
      const results = await Promise.all(promises);
      
      let manualHeaderHtml = '';
      if (isManualFormat) {
        const indexItemsHtml = sortedIds.map(id => {
          const tMeta = topics.find(t => t.id === id);
          return `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #b0c4de; padding: 6px 0; font-size: 13pt; line-height: 1.4;">
              <span style="font-weight: bold; color: #004B93;">Tema ${id.toString().padStart(2, '0')}: ${tMeta.title}</span>
              <span class="index-topic-page-num" data-topic-id="${id}" style="color: #004B93; font-weight: bold;">Página --</span>
            </div>
          `;
        }).join('');

        manualHeaderHtml = `
          <!-- Portada -->
          <div class="print-manual-cover" style="box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20mm 40px 20mm 40px; border: 4px double #004B93; height: 250mm; text-align: center; font-family: Arial, Calibri, Helvetica, sans-serif; margin: 0 auto; max-width: 820px;">
            <div style="color: #004B93; font-weight: normal; font-size: 14pt; letter-spacing: 3px; text-transform: uppercase;">Dossier de Preparación de Oposiciones</div>
            <div style="width: 80px; height: 3px; background-color: #004B93; margin: 20px auto 30px auto;"></div>
            <h1 style="font-size: 32pt; font-weight: bold; color: #000000; line-height: 1.15; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Dossier de Apoyo Didáctico</h1>
            <h2 style="font-size: 16pt; font-weight: bold; color: #004B93; margin: 0 0 30px 0; text-transform: uppercase; letter-spacing: 0.5px;">Técnico/a Auxiliar de Biblioteca, Archivo y Museo</h2>
            <div style="font-size: 15.5pt; color: #333333; max-width: 720px; line-height: 1.45; margin: 0 auto 20px auto; padding: 24px; background-color: #f4f8fc; border-radius: 8px; border-left: 5px solid #004B93; text-align: justify; box-shadow: none;">
              <strong>Introducción y Exención de Responsabilidad:</strong> Este dossier de apoyo didáctico ha sido elaborado de forma independiente tomando como referencia los epígrafes y puntos de materias indicados en las bases del programa de la convocatoria para la categoría de Técnico/a Auxiliar de Biblioteca, Archivo y Museo (Grupo IV - Personal Laboral) de la Universidad de Sevilla (Resolución de 18 de junio de 2026).
              <br/><br/>
              Se hace hincapié en que <strong>no se trata de un temario ni de un manual de carácter oficial</strong> (el cual no existe, constando la convocatoria únicamente de la lista de temas y puntos a tratar). El presente manual ha sido confeccionado según dichas bases, intentando abordar todos los aspectos a una profundidad suficiente para el estudio, siendo en todo caso susceptible de ampliación por parte del opositor si así lo desea.
              <br/><br/>
              Las materias técnicas y legislativas se desarrollan a partir de fuentes de referencia directa, tales como el IV Convenio Colectivo, la Ley Orgánica del Sistema Universitario (LOSU), la Ley de Prevención de Riesgos Laborales (LPRL), las directrices del SEPRUS y las normativas de préstamo vigentes de la BUS. El autor no se hace responsable de las posibles discrepancias o diferencias de interpretación con respecto a otros puntos de vista, si bien se considera que quedan recogidos los aspectos más importantes y un porcentaje muy elevado de la materia exigida.
            </div>
            <div style="font-size: 14pt; color: #555555; font-weight: normal; display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
              <span>© 2026 Jgg. Todos los derechos reservados.</span>
            </div>
          </div>
          <div class="print-page-break"></div>
          
          <!-- Ficha de la Convocatoria Oficial -->
          <div class="print-manual-convocatoria" style="padding: 20px 0; font-family: Arial, Calibri, Helvetica, sans-serif;">
            <div style="border-bottom: 3px solid #000000; padding-bottom: 10px; margin-bottom: 20px; text-align: left;">
              <h1 style="margin: 0; color: #000000; font-size: 22pt; font-weight: bold; text-transform: uppercase;">Ficha Resumen de la Convocatoria</h1>
              <p style="margin: 4px 0 0 0; color: #555555; font-size: 12pt;">Resolución de 18 de junio de 2026 (BOJA nº 125, de 1 de julio de 2026)</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 13pt; line-height: 1.4; color: #000000; text-align: justify;">
              <div><strong>Categoría Profesional:</strong> Técnico/a Auxiliar de Biblioteca, Archivo y Museo (Grupo IV del IV Convenio Colectivo de Personal Laboral de las Universidades Públicas de Andalucía) de la Universidad de Sevilla (US). Acceso libre mediante concurso-oposición.</div>
              <div><strong>Plazas Convocadas:</strong> Un total de <strong>19 plazas</strong> (16 por turno libre general y 3 reservadas para el turno general de discapacidad), junto con la constitución de una Bolsa de Trabajo temporal.</div>
              <div><strong>Requisitos Académicos:</strong> Título de Graduado en Educación Secundaria Obligatoria (ESO), Graduado Escolar, Bachillerato Elemental, Formación Profesional de Primer Grado (FP1) o equivalente. De manera alternativa, se puede acreditar una experiencia laboral equivalente de al menos 6 meses en la misma categoría o área profesional.</div>
              <div><strong>Plazo de Inscripción:</strong> 10 días hábiles a contar desde el día siguiente al de la publicación de la convocatoria en el Boletín Oficial del Estado (BOE).</div>
              <div><strong>Fase de Oposición (65% de la nota final):</strong> Cuestionario tipo test teórico-práctico de 4 opciones alternativas (los fallos restan 1/4 del valor de una correcta). Contiene además 5 preguntas de reserva. Es necesario obtener una puntuación mínima de <strong>32,5 puntos</strong> sobre 65 para aprobar el examen. La fecha de examen no será antes del 1 de septiembre de 2026.</div>
              <div><strong>Fase de Concurso (35% de la nota final):</strong> Suma de méritos exclusiva para los aspirantes que hayan aprobado la fase de oposición. Se valorará la experiencia profesional previa (principalmente en la Universidad de Sevilla) y cursos de formación homologados. El plazo de presentación de méritos (autobaremo) es de 10 días hábiles desde la publicación de notas definitivas de examen.</div>
            </div>
          </div>
          <div class="print-page-break"></div>

          <!-- Índice de Contenidos -->
          <div class="print-manual-index" style="padding: 20px 0; font-family: Arial, Calibri, Helvetica, sans-serif;">
            <div style="border-bottom: 3px solid #000000; padding-bottom: 10px; margin-bottom: 20px; text-align: left;">
              <h1 style="margin: 0; color: #000000; font-size: 22pt; font-weight: bold; text-transform: uppercase;">Índice de Contenidos</h1>
              <p style="margin: 4px 0 0 0; color: #555555; font-size: 12pt;">Dossier completo de preparación para Auxiliar de Biblioteca - US</p>
            </div>
            
            <h3 style="color: #004B93; font-size: 14pt; border-bottom: 1px solid #b0c4de; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase; font-weight: bold;">Temas Seleccionados en este Volumen</h3>
            <div style="margin-bottom: 30px;">
              ${indexItemsHtml}
            </div>
          </div>
          <div class="print-page-break"></div>
        `;
      }
      
      let combinedHtml = manualHeaderHtml + results.join('\n');
      
      if (isManualFormat && currentUser?.role === 'admin') {
        combinedHtml += `
          <div class="print-page-break"></div>
          <div class="print-manual-admin-info" style="box-sizing: border-box; padding: 20mm 40px; font-family: Arial, Calibri, Helvetica, sans-serif; max-width: 820px; margin: 0 auto; line-height: 1.5; color: #000000; text-align: justify; font-size: 13pt; page-break-before: always; break-before: page;">
            <div style="border-bottom: 3px solid #004B93; padding-bottom: 10px; margin-bottom: 24px; text-align: center;">
              <h1 style="margin: 0; color: #004B93; font-size: 22pt; font-weight: bold; text-transform: uppercase;">Acceso y Registro en la Aplicación Web</h1>
              <p style="margin: 6px 0 0 0; color: #555555; font-size: 12pt; font-style: italic;">Instrucciones para el Alumno - Activación de Licencia</p>
            </div>
            
            <h3 style="color: #004B93; font-size: 14pt; border-bottom: 1px solid #b0c4de; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase; font-weight: bold;">1. Utilidades y Funciones de la Plataforma</h3>
            <p>Junto con este manual impreso, dispones de acceso completo a la <strong>Plataforma Web interactiva de Oposiciones BUS</strong>, diseñada específicamente para maximizar la eficiencia en tu preparación:</p>
            <ul style="margin-top: 8px; margin-bottom: 16px; padding-left: 20px; line-height: 1.6;">
              <li><strong>Temario Digital Interactivo:</strong> Lectura cómoda adaptada a cualquier pantalla (ordenador, tablet o móvil), con modo lectura nocturno y audiolibro integrado.</li>
              <li><strong>Audiotemas (TTS & MP3):</strong> Escucha la explicación de cada tema mediante síntesis de voz inteligente o con los archivos de audio oficiales para optimizar tus tiempos de estudio.</li>
              <li><strong>Batería de Tests Completa:</strong> Realiza cuestionarios específicos por tema o simulacros combinados con justificaciones legislativas extraídas de la plantilla de soluciones.</li>
              <li><strong>Modo Simulacro e Interactivo en Papel:</strong> Simula las condiciones de un examen real de 40 preguntas equilibradas, con corrección instantánea y cálculo de penalización.</li>
              <li><strong>Estadísticas Avanzadas:</strong> Controla tu progreso de estudio, tiempo acumulado y media de aciertos para enfocar tus repasos donde más lo necesitas.</li>
              <li><strong>Tarjetas de Repaso (Flashcards):</strong> Memoriza plazos, números y conceptos clave con el método de repetición espaciada.</li>
            </ul>

            <h3 style="color: #004B93; font-size: 14pt; border-bottom: 1px solid #b0c4de; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase; font-weight: bold;">2. Cómo Acceder y Registrarse</h3>
            <p>Sigue estos sencillos pasos para crear tu cuenta y activar tu temario digital:</p>
            <ol style="margin-top: 8px; margin-bottom: 24px; padding-left: 20px; line-height: 1.6;">
              <li>Entra en el portal de acceso a través del navegador web utilizando la siguiente dirección:
                <div style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 8px; border-radius: 6px; text-align: center; margin: 8px 0; border: 1px solid #cbd5e1; font-size: 12pt;">
                  https://oposiciones-bus-app.web.app
                </div>
              </li>
              <li>En la pantalla de acceso, haz clic en el botón <strong>"Registrarse"</strong> (o introduce directamente los datos en la sección de registro).</li>
              <li>Rellena el formulario con tu nombre completo, correo electrónico y contraseña.</li>
              <li>Introduce tu <strong>código de acceso personal e intransferible</strong> que encontrarás pegado en la etiqueta inferior. Este código validará tu licencia y activará todo el contenido Premium.</li>
              <li>Haz clic en <strong>"Crear cuenta"</strong>. ¡Ya puedes empezar a estudiar y hacer tests!</li>
            </ol>

            <div style="margin-top: 40px; border: 2px dashed #004B93; border-radius: 12px; padding: 20px; background-color: #fafbfc; text-align: center; page-break-inside: avoid; break-inside: avoid;">
              <h4 style="margin: 0 0 10px 0; color: #000000; font-size: 12pt; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">CÓDIGO DE ACTIVACIÓN DE LICENCIA PERSONAL</h4>
              <p style="margin: 0 0 15px 0; font-size: 10pt; color: #666666;">Espacio reservado para la etiqueta del código del temario impreso</p>
              
              <!-- Recuadro para etiqueta de 3.5cm x 8cm -->
              <div style="width: 80mm; height: 35mm; border: 2px dashed #004B93; border-radius: 6px; background-color: #ffffff; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11pt; color: #999999; font-weight: bold;">
                <span>Pegar etiqueta aquí</span>
                <span style="font-size: 9pt; font-weight: normal; margin-top: 4px; color: #bbb;">(3.5 cm x 8 cm)</span>
              </div>
              
              <p style="margin: 15px 0 0 0; font-size: 9.5pt; color: #ef4444; font-weight: bold; line-height: 1.3;">
                ⚠️ Este código es de un solo uso y quedará vinculado a tu correo electrónico al registrarte. No lo compartas con nadie.
              </p>
            </div>
          </div>
        `;
      }
      
      setCompiledPrintContent(combinedHtml);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al compilar los temas para impresión.');
    } finally {
      setIsCompilingPrint(false);
    }
  };

  // Auto-compile when triggered from the single-topic print button
  useEffect(() => {
    if (triggerAutocompile && viewMode === 'multi-print' && selectedPrintTopicIds.length === 1 && selectedPrintTopicIds[0] === activeTopicId.toString()) {
      setTriggerAutocompile(false);
      handleCompilePrint();
    }
  }, [triggerAutocompile, viewMode, selectedPrintTopicIds, activeTopicId]);

  // Calculate dynamic start pages for the table of contents in the printed manual
  useEffect(() => {
    if (!compiledPrintContent || !isManualFormat || selectedPrintTopicIds.length === 0) return;

    const calculateIndexPages = () => {
      const pageHeightHelper = document.createElement('div');
      pageHeightHelper.style.height = '257mm';
      pageHeightHelper.style.position = 'absolute';
      pageHeightHelper.style.visibility = 'hidden';
      document.body.appendChild(pageHeightHelper);
      const pagePx = pageHeightHelper.offsetHeight || 970;
      document.body.removeChild(pageHeightHelper);

      const sortedIds = [...selectedPrintTopicIds].map(Number).sort((a, b) => a - b);
      let currentPage = 4; // Page 1 = Cover, Page 2 = Convocatoria Ficha, Page 3 = Index

      sortedIds.forEach(id => {
        const pageSpan = document.querySelector(`.index-topic-page-num[data-topic-id="${id}"]`);
        if (pageSpan) {
          pageSpan.textContent = `Página ${currentPage}`;
        }

        const topicEl = document.querySelector(`.print-topic-block[data-topic-id="${id}"]`);
        let topicPages = 1;
        if (topicEl) {
          const h = topicEl.offsetHeight;
          topicPages = Math.max(1, Math.ceil(h / pagePx));
        }

        const qEl = document.querySelector(`[data-topic-questions="${id}"]`);
        let qPages = 0;
        if (qEl) {
          qPages = Math.max(1, Math.ceil(qEl.offsetHeight / pagePx));
        }

        const aEl = document.querySelector(`[data-topic-answers="${id}"]`);
        let aPages = 0;
        if (aEl) {
          aPages = Math.max(1, Math.ceil(aEl.offsetHeight / pagePx));
        }

        currentPage += topicPages + qPages + aPages;
      });
    };

    const t1 = setTimeout(calculateIndexPages, 50);
    const t2 = setTimeout(calculateIndexPages, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [compiledPrintContent, isManualFormat, selectedPrintTopicIds]);
  
  // Local session study timer
  const [sessionTime, setSessionTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Audiobook Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1.0);
  const [audioVoices, setAudioVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [hasLocalMp3, setHasLocalMp3] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0 to 100
  const [audioDuration, setAudioDuration] = useState(0); // for MP3 mode
  const [audioCurrentTime, setAudioCurrentTime] = useState(0); // for MP3 mode
  const [audioMode, setAudioMode] = useState('tts'); // 'tts' | 'mp3'
  
  // Refs
  const audioElRef = React.useRef(null); // native HTML5 audio for MP3 mode
  const speechUtteranceRef = React.useRef(null); // SpeechSynthesisUtterance object
  const speechCharIndexRef = React.useRef(0); // current character index read
  const fullSpeechTextRef = React.useRef(''); // full text being read
  const activeUtterancesRef = React.useRef([]); // protect utterances from garbage collection

  // Load voices for SpeechSynthesis
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voicesList = window.speechSynthesis.getVoices();
        const esVoices = voicesList.filter(v => v.lang.startsWith('es-') || v.lang.startsWith('es_'));
        setAudioVoices(esVoices);
        if (esVoices.length > 0 && !selectedVoiceName) {
          const defaultVoice = esVoices.find(v => v.name.includes('Helena') || v.name.includes('Google') || v.name.includes('Microsoft')) || esVoices[0];
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Check if MP3 file exists & reset audio state on topic change
  useEffect(() => {
    stopAudio();
    
    const formattedNum = topic.id.toString().padStart(2, '0');
    const audioUrl = `/audio/tema-${formattedNum}.mp3`;
    
    fetch(audioUrl, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          setHasLocalMp3(true);
          setAudioMode('mp3');
        } else {
          setHasLocalMp3(false);
          setAudioMode('tts');
        }
      })
      .catch(() => {
        setHasLocalMp3(false);
        setAudioMode('tts');
      });
  }, [activeTopicId]);

  // Adjust playback speed on audio element if audioMode is 'mp3'
  useEffect(() => {
    const audioEl = audioElRef.current;
    if (audioEl && audioMode === 'mp3') {
      audioEl.playbackRate = audioPlaybackRate;
    }
  }, [audioMode, audioPlaybackRate]);

  // MP3 event handlers
  const handleMp3TimeUpdate = () => {
    const audioEl = audioElRef.current;
    if (!audioEl) return;
    setAudioCurrentTime(audioEl.currentTime);
    if (audioEl.duration) {
      setAudioProgress((audioEl.currentTime / audioEl.duration) * 100);
    }
  };

  const handleMp3LoadedMetadata = () => {
    const audioEl = audioElRef.current;
    if (!audioEl) return;
    setAudioDuration(audioEl.duration);
  };

  const handleMp3Ended = () => {
    setIsPlayingAudio(false);
    setAudioProgress(100);
  };

  const playTts = (textToRead, startCharIndex = 0) => {
    if (!window.speechSynthesis) return;

    // Clear previous utterances and cancel current speech
    activeUtterancesRef.current = [];
    window.speechSynthesis.cancel();

    const cleanText = getCleanTextForSpeech(textToRead);
    fullSpeechTextRef.current = cleanText;

    const textSegment = cleanText.substring(startCharIndex);
    if (!textSegment.trim()) return;

    // Helper to chunk text by sentences (under 200 chars) to prevent WebKit buffer limits
    const chunkText = (text) => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const result = [];
      let currentChunk = '';
      
      sentences.forEach(sentence => {
        if ((currentChunk + sentence).length < 200) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          if (currentChunk.trim()) result.push(currentChunk.trim());
          currentChunk = sentence;
        }
      });
      if (currentChunk.trim()) result.push(currentChunk.trim());
      return result;
    };

    const chunks = chunkText(textSegment);
    if (chunks.length === 0) return;

    setIsPlayingAudio(true);
    setIsPausedAudio(false);

    let accumulatedLength = startCharIndex;

    chunks.forEach((chunkText, index) => {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = 'es-ES';
      utterance.rate = audioPlaybackRate;

      if (selectedVoiceName) {
        const voice = audioVoices.find(v => v.name === selectedVoiceName);
        if (voice) utterance.voice = voice;
      }

      const chunkOffset = accumulatedLength;
      accumulatedLength += chunkText.length + 1; // +1 for the space

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const absoluteIndex = chunkOffset + event.charIndex;
          speechCharIndexRef.current = absoluteIndex;
          const percent = (absoluteIndex / cleanText.length) * 100;
          setAudioProgress(percent);
        }
      };

      utterance.onend = () => {
        if (index === chunks.length - 1) {
          setIsPlayingAudio(false);
          setIsPausedAudio(false);
          setAudioProgress(100);
          activeUtterancesRef.current = [];
        }
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis chunk error:', e);
        if (index === chunks.length - 1) {
          setIsPlayingAudio(false);
          setIsPausedAudio(false);
          activeUtterancesRef.current = [];
        }
      };

      // Keep reference to prevent garbage collection on iOS
      activeUtterancesRef.current.push(utterance);

      // Queue the chunk synchronously
      window.speechSynthesis.speak(utterance);
    });
  };
 
  const handlePlayPause = () => {
    // Wake up iOS/mobile audio system context on user click gesture
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioCtx.resume();
      }
    } catch (e) {
      console.error("Error waking up AudioContext:", e);
    }

    if (audioMode === 'mp3') {
      const audioEl = audioElRef.current;
      if (!audioEl) return;
      if (isPlayingAudio) {
        audioEl.pause();
        setIsPlayingAudio(false);
      } else {
        audioEl.play().catch(err => console.error(err));
        setIsPlayingAudio(true);
      }
    } else {
      if (isPlayingAudio) {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel(); // Stop playing but we preserve speechCharIndexRef
          setIsPausedAudio(true);
          setIsPlayingAudio(false);
        }
      } else if (isPausedAudio) {
        let activeText = '';
        if (activeSubTab === 'content') activeText = parsedSections.content;
        else if (activeSubTab === 'outline') activeText = parsedSections.outline;
        else activeText = parsedSections.concepts;

        // Resume by playing from the last saved index
        playTts(activeText, speechCharIndexRef.current);
      } else {
        let activeText = '';
        if (activeSubTab === 'content') activeText = parsedSections.content;
        else if (activeSubTab === 'outline') activeText = parsedSections.outline;
        else activeText = parsedSections.concepts;

        playTts(activeText, 0);
      }
    }
  };

  const stopAudio = () => {
    if (audioMode === 'mp3') {
      const audioEl = audioElRef.current;
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      speechCharIndexRef.current = 0;
      activeUtterancesRef.current = []; // Clear references
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setAudioProgress(0);
  };

  const handleRateChange = (newRate) => {
    setAudioPlaybackRate(newRate);
    if (audioMode === 'tts' && (isPlayingAudio || isPausedAudio)) {
      const currentIdx = speechCharIndexRef.current;
      let activeText = '';
      if (activeSubTab === 'content') activeText = parsedSections.content;
      else if (activeSubTab === 'outline') activeText = parsedSections.outline;
      else activeText = parsedSections.concepts;

      playTts(activeText, currentIdx);
    } else if (audioMode === 'mp3') {
      const audioEl = audioElRef.current;
      if (audioEl) {
        audioEl.playbackRate = newRate;
      }
    }
  };

  const handleVoiceChange = (voiceName) => {
    setSelectedVoiceName(voiceName);
    if (audioMode === 'tts' && (isPlayingAudio || isPausedAudio)) {
      const currentIdx = speechCharIndexRef.current;
      let activeText = '';
      if (activeSubTab === 'content') activeText = parsedSections.content;
      else if (activeSubTab === 'outline') activeText = parsedSections.outline;
      else activeText = parsedSections.concepts;

      setTimeout(() => {
        playTts(activeText, currentIdx);
      }, 50);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const topic = topics.find(t => t.id === activeTopicId) || topics[0];
  const topicProgress = progress[topic.id] || { status: 'Pendiente', studyTime: 0 };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        incrementTimeForTopic(topic.id, 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, topic.id]);

  // Focus mode effect (hides sidebars for distraction-free study)
  useEffect(() => {
    if (timerRunning || isFocusMode) {
      document.body.classList.add('study-focus-mode');
    } else {
      document.body.classList.remove('study-focus-mode');
    }
    return () => {
      document.body.classList.remove('study-focus-mode');
    };
  }, [timerRunning, isFocusMode]);

  // Activate/deactivate reading mode body class
  useEffect(() => {
    if (isReadingMode) {
      document.body.classList.add('reading-fullscreen-mode');
    } else {
      document.body.classList.remove('reading-fullscreen-mode');
    }
    return () => {
      document.body.classList.remove('reading-fullscreen-mode');
    };
  }, [isReadingMode]);

  // Auto-enter reading mode when autoscroll or ruler is toggled on
  useEffect(() => {
    if (isAutoscrolling || showReadingRuler) {
      setIsReadingMode(true);
    }
  }, [isAutoscrolling, showReadingRuler]);

  const handleScrollPage = (direction) => {
    const container = document.querySelector('.reading-fullscreen-content');
    if (!container) return;
    const scrollAmount = container.clientHeight * 0.75;
    if (direction === 'down') {
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for full-screen reading mode
  useEffect(() => {
    if (!isReadingMode) return;

    const handleKeyDown = (e) => {
      // If user is typing in inputs or text areas, ignore
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'SELECT' ||
        document.activeElement.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setIsReadingMode(false);
        setIsAutoscrolling(false);
        setShowReadingRuler(false);
      } else if (e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleScrollPage('down');
      } else if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleScrollPage('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode]);


  useEffect(() => {
    if (!isAutoscrolling) return;

    // In reading mode, scroll the fullscreen content div; otherwise the normal markdown container
    const container = isReadingMode
      ? document.querySelector('.reading-fullscreen-content')
      : document.querySelector('.markdown-body-container');
    if (!container) return;

    let lastTime = performance.now();
    let animationFrameId;

    const scroll = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      // Speed 1 = 20px/s, Speed 10 = 200px/s
      const pixelsPerSecond = autoscrollSpeed * 20;
      const step = (pixelsPerSecond * delta) / 1000;

      container.scrollTop += step;

      // Stop when we reach the bottom
      const reachedBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
      if (reachedBottom) {
        setIsAutoscrolling(false);
        return;
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoscrolling, autoscrollSpeed, isReadingMode]);


  // Reset session timer on topic change
  useEffect(() => {
    setSessionTime(0);
    setTimerRunning(false);
    setIsAutoscrolling(false);
    setShowReadingRuler(false);
    setIsReadingMode(false);
    
    // Load Markdown content
    setLoading(true);
    setError(false);
    setMarkdownContent('');
    
    const formattedNum = topic.id.toString().padStart(2, '0');
    fetch(`/markdown/tema-${formattedNum}.md`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Not found');
        }
        return res.text();
      })
      .then(text => {
        setMarkdownContent(text);
        setLoading(false);
      })
      .catch(() => {
        // If file not found, we show placeholder structure
        setMarkdownContent('');
        setLoading(false);
        setError(true);
      });
  }, [activeTopicId]);

  // Format time helper (HH:MM:SS or MM:SS)
  const formatSessionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper to split Markdown content into sub-tabs dynamically
  const getSubTabContent = () => {
    if (!markdownContent) return { content: '', outline: '', concepts: '' };

        // Find Outline (usually starts with ## X. Esquema)
    const outlineIndex = markdownContent.search(/##\s+\d+\.\s+Esquema/i);
    // Find Concepts (usually starts with ## Y. Conceptos)
    const conceptsIndex = markdownContent.search(/##\s+\d+\.\s+Conceptos/i);

    let contentPart = markdownContent;
    let outlinePart = '';
    let conceptsPart = '';

    if (outlineIndex !== -1) {
      contentPart = markdownContent.substring(0, outlineIndex);
      if (conceptsIndex !== -1) {
        outlinePart = markdownContent.substring(outlineIndex, conceptsIndex);
        conceptsPart = markdownContent.substring(conceptsIndex);
      } else {
        outlinePart = markdownContent.substring(outlineIndex);
      }
    }

    return {
      content: marked.parse(contentPart),
      outline: outlinePart ? marked.parse(outlinePart) : '<em>Esquema en desarrollo para este tema.</em>',
      concepts: conceptsPart ? marked.parse(conceptsPart) : '<em>Glosario en desarrollo para este tema.</em>'
    };
  };

  const parsedSections = getSubTabContent();

  const getStatusClass = (status) => {
    switch (status) {
      case 'Repasado': return 'status-badge-emerald';
      case 'Memorizado': return 'status-badge-emerald';
      case 'Resumido': return 'status-badge-blue';
      case 'Leyendo': return 'status-badge-gold';
      default: return 'status-badge-rose';
    }
  };

  return (
    <div className="topic-viewer-layout fade-in">
      {/* ======================================================= */}
      {/* FULL-SCREEN READING MODE OVERLAY                        */}
      {/* Shown when autoscroll or reading ruler is active        */}
      {/* ======================================================= */}
      {isReadingMode && (
        <div className={`reading-fullscreen-overlay theme-${readingTheme}`}>
          {/* Floating control bar at the top */}
          <div className="reading-fullscreen-bar">
            <div className="reading-bar-left">
              <span className="reading-bar-topic-label">
                T{topic.id.toString().padStart(2, '0')} · {topic.title}
              </span>
            </div>
            <div className="reading-bar-center">
              <button
                type="button"
                onClick={() => setIsAutoscrolling(!isAutoscrolling)}
                className={`reading-bar-btn ${isAutoscrolling ? 'reading-bar-btn--active' : ''}`}
                title={isAutoscrolling ? 'Detener Autoscroll' : 'Iniciar Autoscroll'}
              >
                {isAutoscrolling ? <Pause size={14} /> : <Play size={14} />}
                <span>{isAutoscrolling ? 'Detener' : 'Play'}</span>
              </button>

              <div className="reading-bar-speed">
                <span className="reading-bar-label">Velocidad:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={autoscrollSpeed}
                  onChange={(e) => setAutoscrollSpeed(Number(e.target.value))}
                  style={{ accentColor: 'rgba(234,179,8,0.9)', width: '90px', cursor: 'pointer' }}
                />
                <span className="reading-bar-speed-val">{autoscrollSpeed}x</span>
              </div>

              <button
                type="button"
                onClick={() => setShowReadingRuler(!showReadingRuler)}
                className={`reading-bar-btn ${showReadingRuler ? 'reading-bar-btn--active' : ''}`}
                title="Guía de Lectura (línea)"
              >
                <span>👉 Guía</span>
              </button>
            </div>
            <div className="reading-bar-right">
              <button
                type="button"
                onClick={() => { setIsAutoscrolling(false); setShowReadingRuler(false); setIsReadingMode(false); }}
                className="reading-bar-exit-btn"
                title="Salir de lectura a pantalla completa"
              >
                <Minimize2 size={14} />
                <span>Salir</span>
              </button>
            </div>
          </div>

          {/* The full-screen reading content */}
          <div className="reading-fullscreen-content">
            <div
              className={`markdown-rendered-content font-${fontSize} theme-${readingTheme}`}
              dangerouslySetInnerHTML={{
                __html: activeSubTab === 'content'
                  ? parsedSections.content
                  : activeSubTab === 'outline'
                  ? parsedSections.outline
                  : parsedSections.concepts
              }}
            />
          </div>

          {/* Floating manual page navigation buttons */}
          <div className="reading-fullscreen-controls-floating">
            <button
              type="button"
              onClick={() => handleScrollPage('up')}
              className="reading-float-btn"
              title="Página Anterior (Flecha Arriba)"
            >
              ▲
            </button>
            <span className="reading-float-divider" />
            <button
              type="button"
              onClick={() => handleScrollPage('down')}
              className="reading-float-btn"
              title="Página Siguiente (Espacio / Flecha Abajo)"
            >
              ▼
            </button>
          </div>

          {/* Reading ruler in full-screen mode */}
          {showReadingRuler && <div className="reading-ruler-fixed" />}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="mobile-sidebar-overlay active"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}


      {/* Sidebar: Topics list */}
      <aside className={`topics-sidebar glass-panel ${showMobileSidebar ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <BookOpen size={18} />
          <h3>Temas del Programa</h3>
          <button 
            className="mobile-sidebar-close-btn" 
            onClick={() => setShowMobileSidebar(false)}
            title="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="sidebar-topics-list">
          {topics.map(t => {
            const isSelected = t.id === topic.id;
            const tProg = progress[t.id] || { status: 'Pendiente' };
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTopicId(t.id);
                  setShowMobileSidebar(false);
                }}
                className={`topic-sidebar-item ${isSelected ? 'active' : ''}`}
              >
                <span className="topic-sidebar-num">T{t.id.toString().padStart(2, '0')}</span>
                <div className="topic-sidebar-info">
                  <span className="topic-sidebar-title">{t.title}</span>
                  <span className="topic-sidebar-status">{tProg.status}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="sidebar-footer" style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setViewMode(viewMode === 'multi-print' ? 'single' : 'multi-print')}
            className="glow-btn-secondary"
            style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
          >
            {viewMode === 'multi-print' ? 'Volver a Lectura' : 'Impresión Múltiple'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`topic-viewer-main glass-panel theme-${readingTheme}`}>
        {viewMode === 'multi-print' ? (
          <div className="multi-print-view-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="topic-viewer-nav">
              <button onClick={() => setViewMode('single')} className="back-to-dashboard-btn">
                <ChevronLeft size={16} />
                <span>Volver a Lectura</span>
              </button>
            </div>
            
            {isCompilingPrint ? (
              <div className="viewer-message loading" style={{ flex: 1 }}>
                <div className="spinner" />
                <p>Compilando temas seleccionados en un único PDF...</p>
              </div>
            ) : compiledPrintContent ? (
              /* Print Preview */
              <div className="print-preview-container fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', border: 'none', background: 'transparent' }}>
                <div className="print-preview-header">
                  <div>
                    <h4 style={{ margin: 0 }}>Vista Previa de Impresión</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                      Se han compilado {selectedPrintTopicIds.length} temas. Listo para imprimir.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setCompiledPrintContent('')} className="glow-btn-secondary" style={{ padding: '8px 16px' }}>
                      Modificar Selección
                    </button>
                    <button onClick={handlePrintClick} className="glow-btn" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Printer size={16} />
                      Imprimir Temario (PDF)
                    </button>
                  </div>
                </div>
                
                <div className="print-preview-content" style={{ flex: 1 }}>
                  <div dangerouslySetInnerHTML={{ __html: compiledPrintContent }} />
                </div>
              </div>
            ) : (
              /* Topic Selection Screen */
              <div className="print-config-panel fade-in" style={{ padding: '10px 0', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 className="text-gradient">Preparar Impresión de Varios Temas</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  Elige los temas que deseas agrupar en el documento de impresión. Cada tema comenzará de manera automática en una página nueva.
                </p>
                
                <div className="topics-bulk-actions" style={{ marginBottom: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedPrintTopicIds(topics.map(t => t.id.toString()))}
                    className="bulk-action-link"
                  >
                    Seleccionar todos los temas
                  </button>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>|</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedPrintTopicIds([])}
                    className="bulk-action-link"
                  >
                    Limpiar selección
                  </button>
                </div>
                
                <div className="print-topics-selection-grid" style={{ flex: 1 }}>
                  {topics.map(t => {
                    const isSelected = selectedPrintTopicIds.includes(t.id.toString());
                    return (
                      <label 
                        key={t.id} 
                        className={`print-topic-select-label ${isSelected ? 'selected' : ''}`}
                      >
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPrintTopicIds(prev => [...prev, t.id.toString()]);
                            } else {
                              setSelectedPrintTopicIds(prev => prev.filter(id => id !== t.id.toString()));
                            }
                          }}
                        />
                        <div className="print-topic-select-info">
                          <span className="print-topic-select-num">Tema {t.id.toString().padStart(2, '0')} ({t.block})</span>
                          <span className="print-topic-select-title">{t.title}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {/* Print parameters form */}
                <div className="print-options-card" style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700' }}>Opciones adicionales del dossier:</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox"
                        checked={isManualFormat}
                        onChange={(e) => setIsManualFormat(e.target.checked)}
                      />
                      <strong>Formato Manual Encuadernable (incluye Portada, Índice y Glosario al principio)</strong>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox"
                        checked={includeQuestionsInPrint}
                        onChange={(e) => setIncludeQuestionsInPrint(e.target.checked)}
                      />
                      <strong>Incluir cuestionario de preguntas y respuestas al final de cada tema</strong>
                    </label>
                    
                    {includeQuestionsInPrint && (
                      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cantidad de preguntas por tema:</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[5, 10, 20, 30, 50, 120].map(count => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setPrintQuestionsCount(count)}
                              className={`limit-chip-btn ${printQuestionsCount === count ? 'active' : ''}`}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleCompilePrint}
                    disabled={selectedPrintTopicIds.length === 0}
                    className="glow-btn"
                    style={{ padding: '12px 24px' }}
                  >
                    Preparar Documento para Impresión ({selectedPrintTopicIds.length} seleccionados)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Normal Single Topic View */
          <>
            {/* Navigation header */}
            <div className="topic-viewer-nav">
              <div className="nav-buttons-left">
                <button onClick={() => setCurrentTab('dashboard')} className="back-to-dashboard-btn">
                  <ChevronLeft size={16} />
                  <span className="nav-btn-text">Volver al Dashboard</span>
                </button>
                <button 
                  onClick={() => setShowMobileSidebar(true)} 
                  className="mobile-topics-toggle-btn"
                  title="Mostrar Temas"
                >
                  <List size={16} />
                  <span className="nav-btn-text">Temas</span>
                </button>
                <button 
                  onClick={() => setIsFocusMode(!isFocusMode)} 
                  className={`focus-toggle-btn glow-btn-secondary ${isFocusMode ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '20px' }}
                  title={isFocusMode ? "Mostrar lista de temas" : "Ocultar menú para enfocarse en la lectura"}
                >
                  {isFocusMode ? <List size={14} /> : <Maximize2 size={14} />}
                  <span className="nav-btn-text">{isFocusMode ? "Ver Menú Temas" : "Enfoque de Lectura"}</span>
                </button>
                {isFocusMode && (
                  <button 
                    onClick={() => setShowReadingControls(!showReadingControls)} 
                    className={`focus-toggle-btn glow-btn-secondary ${showReadingControls ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '20px' }}
                    title={showReadingControls ? "Ocultar ajustes" : "Ajustes de lectura"}
                  >
                    <Sliders size={14} />
                    <span className="nav-btn-text">{showReadingControls ? "Ocultar" : "Ajustes"}</span>
                  </button>
                )}
              </div>
              
              <div className="topic-header-status-controls">
                {timerRunning && (
                  <span className="badge badge-blue focus-mode-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--primary-light)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '12px' }}>
                    <span className="pulse-dot"></span> Sesión de Estudio Activa
                  </span>
                )}
                <span className="text-muted">Estado del tema:</span>
                <select
                  value={topicProgress.status}
                  onChange={(e) => updateTopicStatus(topic.id, e.target.value)}
                  className={`status-select-inline ${getStatusClass(topicProgress.status)}`}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Leyendo">Leyendo</option>
                  <option value="Resumido">Resumido</option>
                  <option value="Memorizado">Memorizado</option>
                  <option value="Repasado">Repasado</option>
                </select>
                <button onClick={handlePrintClick} className="print-btn" title="Imprimir o Descargar PDF">
                  <Printer size={14} />
                  <span>Imprimir / PDF</span>
                </button>
                
                <button 
                  onClick={() => setShowSettingsPanel(!showSettingsPanel)} 
                  className={`reading-settings-toggle-btn ${showSettingsPanel ? 'active' : ''}`}
                  title="Ajustes de Lectura (Letra, Fondo, Autoscroll, etc.)"
                >
                  <Settings size={14} className={showSettingsPanel ? 'spin-icon' : ''} />
                  <span>Ajustes de Lectura</span>
                </button>
              </div>
            </div>

            {/* Topic Title & Subtitle */}
            <header className="topic-viewer-header">
              <span className={`badge ${topic.block === 'Específico' ? 'badge-blue' : 'badge-gold'}`}>
                Tema {topic.id} &bull; Bloque {topic.block}
              </span>
              <h2>{topic.title}</h2>
              <p className="topic-subtitle-desc">{topic.subtitle}</p>
            </header>

            {/* Study Timer Bar */}
            {(!isFocusMode || showReadingControls) && (
              <div className="focus-controls-collapsible-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div className="study-timer-bar">
              <div className="timer-info">
                <Clock size={16} className="text-primary-light" />
                <span>Sesión actual: <strong className="timer-digits">{formatSessionTime(sessionTime)}</strong></span>
                <span className="divider">|</span>
                <span>Tiempo acumulado: <strong>{formatTotalTime(topicProgress.studyTime)}</strong></span>
              </div>
              <button 
                onClick={() => setTimerRunning(!timerRunning)} 
                className={`timer-toggle-btn ${timerRunning ? 'running' : ''}`}
              >
                {timerRunning ? (
                  <>
                    <Pause size={14} /> Pausar Estudio
                  </>
                ) : (
                  <>
                    <Play size={14} /> Iniciar Estudio
                  </>
                )}
              </button>
            </div>

            {/* Audiobook Player Widget */}
            <div className="audiobook-player-card glass-panel fade-in" style={{ padding: '10px 16px', borderRadius: '12px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="audiobook-player-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} className="text-gradient-gold" style={{ color: 'var(--secondary)' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '0.5px' }}>AUDIOLIBRO / LECTOR DE VOZ</h4>
                </div>
                
                {/* Mode Selector Toggle (if local MP3 is found) */}
                {hasLocalMp3 && (
                  <div className="audiobook-mode-toggle" style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '2px', borderRadius: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => { stopAudio(); setAudioMode('tts'); }} 
                      className={`mode-btn ${audioMode === 'tts' ? 'active' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
                    >
                      Lector Dinámico (TTS)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { stopAudio(); setAudioMode('mp3'); }} 
                      className={`mode-btn ${audioMode === 'mp3' ? 'active' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
                    >
                      Audio Grabado (MP3)
                    </button>
                  </div>
                )}
              </div>

              {/* Progress and controls section */}
              <div className="audiobook-main-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div className="audio-control-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    onClick={handlePlayPause} 
                    className="glow-btn"
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      padding: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: isPlayingAudio ? 'var(--accent-rose)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                      boxShadow: isPlayingAudio ? '0 4px 12px rgba(244, 63, 94, 0.3)' : '0 4px 12px rgba(29, 78, 216, 0.3)'
                    }}
                    title={isPlayingAudio ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                  </button>
                  <button 
                    type="button" 
                    onClick={stopAudio} 
                    className="glow-btn-secondary"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Detener"
                    disabled={!isPlayingAudio && !isPausedAudio && audioProgress === 0}
                  >
                    <Square size={14} style={{ fill: (!isPlayingAudio && !isPausedAudio && audioProgress === 0) ? 'none' : 'currentColor' }} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="audio-progress-wrapper" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '200px' }}>
                  <div 
                    className="audio-progress-bar-container" 
                    onClick={(e) => {
                      if (audioMode === 'mp3' && audioDuration) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percent = clickX / rect.width;
                        const audioEl = audioElRef.current;
                        if (audioEl) {
                          audioEl.currentTime = percent * audioDuration;
                        }
                      }
                    }}
                    style={{ 
                      height: '6px', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '3px', 
                      overflow: 'hidden', 
                      cursor: audioMode === 'mp3' ? 'pointer' : 'default',
                      position: 'relative'
                    }}
                  >
                    <div 
                      className="audio-progress-bar-fill" 
                      style={{ 
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--secondary) 0%, var(--secondary-light) 100%)',
                        borderRadius: '3px',
                        width: `${audioProgress}%`,
                        transition: audioMode === 'tts' ? 'width 0.2s linear' : 'none'
                      }}
                    ></div>
                  </div>
                  <div className="audio-time-indicators" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>
                      {audioMode === 'mp3' 
                        ? formatTime(audioCurrentTime) 
                        : isPlayingAudio || isPausedAudio 
                          ? `Leído: ${Math.round(audioProgress)}%` 
                          : 'Listo para reproducción'}
                    </span>
                    {audioMode === 'mp3' && <span>{formatTime(audioDuration)}</span>}
                  </div>
                </div>

                {/* Playing Visual Soundwave Animation */}
                {isPlayingAudio && (
                  <div className="soundwave-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px', padding: '0 8px' }}>
                    <span className="soundwave-bar bar-1"></span>
                    <span className="soundwave-bar bar-2"></span>
                    <span className="soundwave-bar bar-3"></span>
                    <span className="soundwave-bar bar-4"></span>
                  </div>
                )}
              </div>

              {/* Bottom Config Section (Speed & Voices Selection) */}
              <div className="audiobook-config-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.8rem' }}>
                <div className="audiobook-speed-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="config-label" style={{ color: 'var(--text-muted)' }}>Velocidad:</span>
                  <div className="speed-chips" style={{ display: 'flex', gap: '4px' }}>
                    {[0.8, 1.0, 1.2, 1.5].map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleRateChange(rate)}
                        className={`speed-chip ${audioPlaybackRate === rate ? 'active' : ''}`}
                        style={{
                          background: audioPlaybackRate === rate ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${audioPlaybackRate === rate ? 'var(--secondary)' : 'var(--border-color)'}`,
                          color: audioPlaybackRate === rate ? 'var(--secondary-light)' : 'var(--text-muted)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {audioMode === 'tts' && audioVoices.length > 0 && (
                  <div className="audiobook-voice-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="config-label" style={{ color: 'var(--text-muted)' }}>Voz:</span>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      className="voice-select"
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        outline: 'none',
                        maxWidth: '220px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {audioVoices.map(v => (
                        <option key={v.name} value={v.name}>
                          {v.name.replace('Microsoft', '').replace('Google', '').trim()} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Hidden HTML5 Audio Element for MP3 mode */}
              {audioMode === 'mp3' && (
                <audio
                  ref={audioElRef}
                  src={`/audio/tema-${topic.id.toString().padStart(2, '0')}.mp3`}
                  onTimeUpdate={handleMp3TimeUpdate}
                  onLoadedMetadata={handleMp3LoadedMetadata}
                  onEnded={handleMp3Ended}
                  style={{ display: 'none' }}
                />
              )}
            </div>
          </div>
        )}

        {/* Tabs navigation */}
            <div className="viewer-tabs">
              <button 
                onClick={() => setActiveSubTab('content')} 
                className={`viewer-tab-btn ${activeSubTab === 'content' ? 'active' : ''}`}
              >
                <FileText size={16} />
                <span>Contenido Completo</span>
              </button>
              <button 
                onClick={() => setActiveSubTab('outline')} 
                className={`viewer-tab-btn ${activeSubTab === 'outline' ? 'active' : ''}`}
              >
                <List size={16} />
                <span>Esquema / Resumen</span>
              </button>
              <button 
                onClick={() => setActiveSubTab('concepts')} 
                className={`viewer-tab-btn ${activeSubTab === 'concepts' ? 'active' : ''}`}
              >
                <Tag size={16} />
                <span>Conceptos Clave</span>
              </button>
            </div>

            {/* Reading settings bar - shown only when settings panel is open */}
            {showSettingsPanel && (
              <div className="reading-settings-dropdown glass-panel fade-in">
                {/* Upper block: MODO DE LECTURA and VELOCIDAD SCROLL */}
                <div className="reading-settings-row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <div className="settings-group" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <span className="settings-label">Modo de Lectura:</span>
                    <button 
                      type="button"
                      onClick={() => setIsReadingMode(!isReadingMode)} 
                      className={`font-btn reading-mode-btn ${isReadingMode && !isAutoscrolling && !showReadingRuler ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                      title="Lectura a pantalla completa"
                    >
                      <span>📖 Lectura Manual (Pantalla Completa)</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setIsAutoscrolling(!isAutoscrolling)} 
                      className={`font-btn reading-mode-btn ${isAutoscrolling ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                    >
                      {isAutoscrolling ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isAutoscrolling ? 'Detener Scroll' : 'Autoscroll'}</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setShowReadingRuler(!showReadingRuler)} 
                      className={`font-btn reading-mode-btn ${showReadingRuler ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                    >
                      <span>👉 Guía de Lectura</span>
                    </button>
                  </div>
                  
                  <div className="settings-group" style={{ flexGrow: 1, justifyContent: 'flex-end', minWidth: '180px' }}>
                    <span className="settings-label">Velocidad scroll:</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={autoscrollSpeed} 
                      onChange={(e) => setAutoscrollSpeed(Number(e.target.value))}
                      style={{ 
                        accentColor: 'var(--secondary)', 
                        width: '100px', 
                        height: '4px',
                        cursor: 'pointer' 
                      }} 
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isAutoscrolling ? 'var(--secondary-light)' : 'var(--text-muted)', width: '25px', textAlign: 'right' }}>
                      {autoscrollSpeed}x
                    </span>
                  </div>
                </div>

                {/* Lower block: LETRA and FONDO */}
                <div className="reading-settings-row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                  <div className="settings-group">
                    <span className="settings-label">Letra:</span>
                    <button onClick={() => setFontSize('small')} className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}>A-</button>
                    <button onClick={() => setFontSize('medium')} className={`font-btn ${fontSize === 'medium' ? 'active' : ''}`}>A</button>
                    <button onClick={() => setFontSize('large')} className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}>A+</button>
                    <button onClick={() => setFontSize('extra-large')} className={`font-btn ${fontSize === 'extra-large' ? 'active' : ''}`}>A++</button>
                  </div>
                  <div className="settings-group">
                    <span className="settings-label">Fondo:</span>
                    <button onClick={() => setReadingTheme('light-reading')} className={`theme-pill-btn light-reading ${readingTheme === 'light-reading' ? 'active' : ''}`} title="Tema Claro">Claro</button>
                    <button onClick={() => setReadingTheme('default')} className={`theme-pill-btn default ${readingTheme === 'default' ? 'active' : ''}`} title="Tema Oscuro">Oscuro</button>
                    <button onClick={() => setReadingTheme('sepia')} className={`theme-pill-btn sepia ${readingTheme === 'sepia' ? 'active' : ''}`} title="Tema Sepia">Sepia</button>
                  </div>
                </div>
              </div>
            )}

            {/* Markdown Renderer Area */}
            <div className="markdown-body-wrapper" style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="markdown-body-container">
                {loading ? (
                  <div className="viewer-message loading">
                    <div className="spinner" />
                    <p>Cargando contenidos del tema...</p>
                  </div>
                ) : error ? (
                  <div className="viewer-message error-placeholder">
                    <AlertCircle size={48} className="text-secondary" />
                    <h3>Contenido en Desarrollo</h3>
                    <p>
                      Actualmente estamos trabajando en la investigación y redacción completa del **Tema {topic.id}**.
                      Sin embargo, ya puedes ver su descripción oficial y cambiar su estado de estudio o realizar tests.
                    </p>
                    
                    <div className="placeholder-structure">
                      <h5>Estructura del tema que se generará:</h5>
                      <ul>
                        {topic.subtitle.split(',').map((part, i) => (
                          <li key={i}>{part.trim()}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="info-actions">
                      <button 
                        onClick={() => setCurrentTab('quizzes')} 
                        className="glow-btn-secondary"
                      >
                        <HelpCircle size={16} />
                        Probar Test de este Tema
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`markdown-rendered-content font-${fontSize} theme-${readingTheme}`}
                    dangerouslySetInnerHTML={{ 
                      __html: activeSubTab === 'content' 
                        ? parsedSections.content 
                        : activeSubTab === 'outline' 
                        ? parsedSections.outline 
                        : parsedSections.concepts 
                    }} 
                  />
                )}
              </div>
            </div>
            {/* Reading Ruler - rendered OUTSIDE the overflow:hidden wrapper so it stays visible */}
            {showReadingRuler && <div className="reading-ruler-fixed" />}
          </>
        )}
      </div>
    </div>
  );
}
