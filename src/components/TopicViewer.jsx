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
  Square
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
  setCurrentTab 
}) {
  const [activeSubTab, setActiveSubTab] = useState('content'); // 'content' | 'outline' | 'concepts'
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'multi-print'
  const [selectedPrintTopicIds, setSelectedPrintTopicIds] = useState([]);
  const [isCompilingPrint, setIsCompilingPrint] = useState(false);
  const [compiledPrintContent, setCompiledPrintContent] = useState('');
  const [includeQuestionsInPrint, setIncludeQuestionsInPrint] = useState(false);
  const [printQuestionsCount, setPrintQuestionsCount] = useState(10);
  const [isManualFormat, setIsManualFormat] = useState(false);

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
                    <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 9pt;">
                      <div style="width: 12px; height: 12px; border: 1px solid black; border-radius: 2px; margin-top: 3px; flex-shrink: 0;"></div>
                      <span><strong>${['A', 'B', 'C', 'D'][oIdx]})</strong> ${opt}</span>
                    </div>
                  `).join('');
                  return `
                    <div style="margin-bottom: 18px; page-break-inside: avoid;">
                      <div style="font-weight: 600; margin-bottom: 6px; font-size: 10pt;">${idx + 1}. ${q.question}</div>
                      <div style="padding-left: 10px;">${optionsList}</div>
                    </div>
                  `;
                }).join('');

                const aListHtml = topicQuestions.map((q, idx) => {
                  const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer];
                  return `
                    <div style="margin-bottom: 12px; page-break-inside: avoid; font-size: 9.5pt;">
                      <div style="font-weight: 700;">Pregunta ${idx + 1}: Respuesta Correcta <span style="text-decoration: underline; font-size: 10pt;">${correctLetter}</span></div>
                      <div style="font-size: 8.5pt; color: #444; margin-top: 3px; padding-left: 10px; border-left: 2px solid #aaa;">
                        <strong>Explicación:</strong> ${q.explanation}
                      </div>
                    </div>
                  `;
                }).join('');

                questionsHtml = `
                  <div class="print-page-break"></div>
                  <div class="printable-exam-sheet" style="padding-top: 20px;">
                    <div style="border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 16px; text-align: left;">
                      <span style="font-size: 9pt; font-weight: bold; color: #555; text-transform: uppercase;">Autoevaluación de Control</span>
                      <h2 style="margin: 4px 0 0 0; font-size: 15pt; font-weight: 700; color: black;">Cuestionario Escrito: Tema ${id}</h2>
                      <p style="margin: 2px 0 0 0; font-size: 9pt; color: #666;">Responde a las siguientes ${topicQuestions.length} preguntas de opción múltiple.</p>
                    </div>
                    <div style="margin-top: 15px;">
                      ${qListHtml}
                    </div>
                  </div>
                `;

                answersHtml = `
                  <div class="print-page-break"></div>
                  <div class="printable-answers-section" style="padding-top: 20px;">
                    <div style="border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 16px; text-align: left;">
                      <span style="font-size: 9pt; font-weight: bold; color: #555; text-transform: uppercase;">Solucionario de Autoevaluación</span>
                      <h2 style="margin: 4px 0 0 0; font-size: 15pt; font-weight: 700; color: black;">Respuestas y Explicaciones: Tema ${id}</h2>
                      <p style="margin: 2px 0 0 0; font-size: 9pt; color: #666;">Hoja de corrección y fundamentos legislativos.</p>
                    </div>
                    <div style="margin-top: 15px;">
                      ${aListHtml}
                    </div>
                  </div>
                `;
              }
            }

            return `
              <section class="print-topic-block">
                <div style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; text-align: left;">
                  <span style="font-size: 10pt; text-transform: uppercase; font-weight: bold; color: #555;">Dossier de Apoyo Didáctico &bull; Tema ${id}</span>
                  <h1 style="margin: 5px 0 0 0; color: black; font-size: 20pt; font-weight: 700;">${topicMeta.title}</h1>
                  <p style="margin: 5px 0 0 0; color: #444; font-size: 11pt; font-style: italic;">${topicMeta.subtitle}</p>
                </div>
                <div class="markdown-rendered-content">
                  ${parsedHtml}
                </div>
              </section>
              ${questionsHtml}
              ${answersHtml}
            `;
          });
      });
      
      const results = await Promise.all(promises);
      
      let manualHeaderHtml = '';
      if (isManualFormat) {
        const indexItemsHtml = sortedIds.map(id => {
          const tMeta = topics.find(t => t.id === id);
          return `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 6px 0; font-size: 10pt;">
              <span style="font-weight: 600; color: #1e3a8a;">Tema ${id.toString().padStart(2, '0')}: ${tMeta.title}</span>
              <span style="color: #666; font-weight: bold;">Tema ${id}</span>
            </div>
          `;
        }).join('');

        manualHeaderHtml = `
          <!-- Portada -->
          <div class="print-manual-cover" style="box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 15mm 30px 15mm 30px; border: 4px double #1e3a8a; height: 235mm; text-align: center; font-family: 'Inter', sans-serif; margin: 0 auto; max-width: 600px;">
            <div style="color: #1e3a8a; font-weight: 800; font-size: 13pt; letter-spacing: 3px; text-transform: uppercase;">Dossier de Preparación de Oposiciones</div>
            <div style="width: 60px; height: 3px; background-color: #3b82f6; margin: 15px auto 25px auto;"></div>
            <h1 style="font-size: 24pt; font-weight: 800; color: #000; line-height: 1.25; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Dossier de Apoyo Didáctico</h1>
            <h2 style="font-size: 15pt; font-weight: 700; color: #2563eb; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 0.5px;">Técnico/a Auxiliar de Biblioteca, Archivo y Museo</h2>
            <div style="font-size: 9.5pt; color: #333; max-width: 500px; line-height: 1.5; margin: 0 auto 15px auto; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb; text-align: justify; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <strong>Introducción y Exención de Responsabilidad:</strong> Este dossier de apoyo didáctico ha sido elaborado de forma independiente tomando como referencia los epígrafes y puntos de materias indicados en las bases del programa de la convocatoria para la categoría de Técnico/a Auxiliar de Biblioteca, Archivo y Museo (Grupo IV - Personal Laboral) de la Universidad de Sevilla (Resolución de 18 de junio de 2026).
              <br/><br/>
              Se hace hincapié en que <strong>no se trata de un temario ni de un manual de carácter oficial</strong> (el cual no existe, constando la convocatoria únicamente de la lista de temas y puntos a tratar). El presente manual ha sido confeccionado según dichas bases, intentando abordar todos los aspectos a una profundidad suficiente para el estudio, siendo en todo caso susceptible de ampliación por parte del opositor si así lo desea.
              <br/><br/>
              Las materias técnicas y legislativas se desarrollan a partir de fuentes de referencia directa, tales como el IV Convenio Colectivo, la Ley Orgánica del Sistema Universitario (LOSU), la Ley de Prevención de Riesgos Laborales (LPRL), las directrices del SEPRUS y las normativas de préstamo vigentes de la BUS. El autor no se hace responsable de las posibles discrepancias o diferencias de interpretación con respecto a otros puntos de vista, si bien se considera que quedan recogidos los aspectos más importantes y un porcentaje muy elevado de la materia exigida.
            </div>
            <div style="font-size: 10pt; color: #555; font-weight: bold; display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
              <span>© 2026 Jgg. Todos los derechos reservados.</span>
            </div>
          </div>
          <div class="print-page-break"></div>
          
          <!-- Ficha de la Convocatoria Oficial -->
          <div class="print-manual-convocatoria" style="padding: 20px 0; font-family: 'Inter', sans-serif;">
            <div style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; text-align: left;">
              <h1 style="margin: 0; color: black; font-size: 18pt; font-weight: 700; text-transform: uppercase;">Ficha Resumen de la Convocatoria</h1>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 10pt;">Resolución de 18 de junio de 2026 (BOJA nº 125, de 1 de julio de 2026)</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 10pt; line-height: 1.6; color: #111; text-align: justify;">
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
          <div class="print-manual-index" style="padding: 20px 0; font-family: 'Inter', sans-serif;">
            <div style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; text-align: left;">
              <h1 style="margin: 0; color: black; font-size: 18pt; font-weight: 700; text-transform: uppercase;">Índice de Contenidos</h1>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 10pt;">Dossier completo de preparación para Auxiliar de Biblioteca - US</p>
            </div>
            
            <h3 style="color: #1e3a8a; font-size: 12pt; border-bottom: 1px solid #1e3a8a; padding-bottom: 4px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase;">Temas Seleccionados en este Volumen</h3>
            <div style="margin-bottom: 30px;">
              ${indexItemsHtml}
            </div>
          </div>
          <div class="print-page-break"></div>
        `;
      }
      
      const combinedHtml = manualHeaderHtml + results.join('\n');
      setCompiledPrintContent(combinedHtml);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al compilar los temas para impresión.');
    } finally {
      setIsCompilingPrint(false);
    }
  };
  
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

    window.speechSynthesis.cancel();

    const cleanText = getCleanTextForSpeech(textToRead);
    fullSpeechTextRef.current = cleanText;

    const textSegment = cleanText.substring(startCharIndex);
    if (!textSegment.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textSegment);
    speechUtteranceRef.current = utterance;

    // Set language explicitly to Spanish to ensure correct voice loading
    utterance.lang = 'es-ES';

    if (selectedVoiceName) {
      const voice = audioVoices.find(v => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }

    utterance.rate = audioPlaybackRate;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const absoluteIndex = startCharIndex + event.charIndex;
        speechCharIndexRef.current = absoluteIndex;
        const percent = (absoluteIndex / cleanText.length) * 100;
        setAudioProgress(percent);
      }
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setAudioProgress(100);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    
    // Prime the engine to bridge the user-gesture context on iOS Safari
    const prime = new SpeechSynthesisUtterance('');
    prime.lang = 'es-ES';
    window.speechSynthesis.speak(prime);

    // Speak actual utterance synchronously (no setTimeout)
    window.speechSynthesis.speak(utterance);
  };
 
  const handlePlayPause = () => {
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
    if (timerRunning) {
      document.body.classList.add('study-focus-mode');
    } else {
      document.body.classList.remove('study-focus-mode');
    }
    return () => {
      document.body.classList.remove('study-focus-mode');
    };
  }, [timerRunning]);

  // Reset session timer on topic change
  useEffect(() => {
    setSessionTime(0);
    setTimerRunning(false);
    
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
      <div className="topic-viewer-main glass-panel">
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
                    <button onClick={() => window.print()} className="glow-btn" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left' }}>
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
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => setShowMobileSidebar(true)} 
                  className="mobile-topics-toggle-btn"
                  title="Mostrar Temas"
                >
                  <List size={16} />
                  <span>Temas</span>
                </button>
              </div>
              
              <div className="topic-header-status-controls">
                {timerRunning && (
                  <span className="badge badge-blue focus-mode-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--primary-light)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '12px' }}>
                    <span className="pulse-dot"></span> Modo Enfoque Activo
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
                
                <button onClick={() => window.print()} className="print-btn" title="Descargar PDF">
                  <Printer size={14} />
                  <span>Descargar PDF</span>
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
            <div className="audiobook-player-card glass-panel fade-in" style={{ padding: '16px 20px', borderRadius: '14px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justify: 'center' }}
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

            {/* Markdown Renderer Area */}
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
                  className="markdown-rendered-content"
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
          </>
        )}
      </div>
    </div>
  );
}
