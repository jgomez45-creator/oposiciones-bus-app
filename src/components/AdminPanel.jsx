import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Award,
  BookOpen,
  ShieldAlert,
  Key,
  RefreshCw,
  Search,
  Copy,
  Plus,
  Activity,
  Wifi,
  Check,
  ShieldCheck,
  X,
  Trash2,
  Library,
  Sparkles,
  Save,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ListFilter,
  CheckSquare,
  Square,
  FileText,
  Printer,
  Send,
  Upload,
  Download,
  Mail,
  Video,
  Play,
  ArrowUp,
  ArrowDown,
  MessageCircle
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import quizzesData from '../data/quizzes.json';
import topicsData from '../data/topics.json';
import { generateNewQuestionsForTopic, checkDuplicated, generateQuestionId, extractTopicHeadings, extractTopicSummary, createEmergencyFallbackBatch } from '../services/testGeneratorEngine';
import { downloadTestAsHTML } from '../utils/htmlTestExporter';
import { compressTestToUrlToken } from '../utils/urlTestCodec';

export default function AdminPanel({ topics }) {
  const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats' | 'users' | 'editions' | 'modifications' | 'codes' | 'generator' | 'bank' | 'email' | 'activity'
  const [users, setUsers] = useState([]);
  const [bookCodes, setBookCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Activity Tracking & Pedagogical Diagnostic State (Admin Only)
  const [activityData, setActivityData] = useState({});
  const [selectedStudentForDiagnostic, setSelectedStudentForDiagnostic] = useState(null);
  const [copiedAdvisorMsg, setCopiedAdvisorMsg] = useState(false);

  // Email Communication State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState(
    'Hola {nombre},\n\nTenemos una actualización importante sobre el temario de Oposiciones BUS.\n\n[Escribe aquí tu comunicado...]\n\nUn saludo,\nEquipo de Oposiciones BUS'
  );
  const [emailTargetType, setEmailTargetType] = useState('all'); // 'all' | 'code-prefix' | 'individual'
  const [emailTargetValue, setEmailTargetValue] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailHistory, setEmailHistory] = useState([]);
  const [studentInboxMessages, setStudentInboxMessages] = useState([]);

  // Admin Direct Chat State
  const [allDirectChats, setAllDirectChats] = useState([]);
  const [selectedChatStudentUid, setSelectedChatStudentUid] = useState(null);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [sendingAdminChat, setSendingAdminChat] = useState(false);

  useEffect(() => {
    const unsub = firebaseService.subscribeToAllDirectChats((messages) => {
      setAllDirectChats(messages);
    });
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    const unsub = firebaseService.subscribeToAllStudentMessages((msgs) => {
      setStudentInboxMessages(msgs);
    });
    return () => { if (unsub) unsub(); };
  }, []);

  const handleExportToHTML = async (item) => {
    const emailsInput = window.prompt(`Exportando batería: "${item.title}"\n\nIntroduce los identificadores o emails de los alumnos (separados por comas):`);
    if (!emailsInput) return;
    
    const emails = emailsInput.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) return;
    
    let questionsToExport = item.questions;
    if (typeof questionsToExport === 'string') {
      try { questionsToExport = JSON.parse(questionsToExport); } catch(e){}
    }
    
    if (!Array.isArray(questionsToExport) || questionsToExport.length === 0) {
      alert("Esta batería no tiene preguntas guardadas o el formato es incorrecto.");
      return;
    }

    let summaryText = '';
    const topicNumMatch = item.title.match(/Tema\s+(\d+)/i) || (item.topicId ? [null, item.topicId] : null);
    if (topicNumMatch && topicNumMatch[1]) {
      const formattedNum = topicNumMatch[1].toString().padStart(2, '0');
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) {
          const mdText = await res.text();
          summaryText = extractTopicSummary(mdText); // Batería completa del banco: resumen completo del tema
        }
      } catch (e) {
        console.warn("Could not fetch topic summary for export", e);
      }
    }

    emails.forEach(email => {
      downloadTestAsHTML(questionsToExport, item.title, email, 'oposiciones-bus-app', summaryText);
    });
    alert(`Se han generado y descargado ${emails.length} archivos HTML personalizados con el resumen del tema.`);
  };

  // Editions & Modifications State
  const [editions, setEditions] = useState([]);
  const [modifications, setModifications] = useState([]);
  const [editionFilter, setEditionFilter] = useState('all'); // 'all' | 'temario' | 'test' | 'simulacro'
  const [editingEditionId, setEditingEditionId] = useState(null);
  const [editNotesText, setEditNotesText] = useState('');

  // Modification Form State
  const [modForm, setModForm] = useState({
    materialType: 'temario',
    topicId: '1',
    sectionTitle: '',
    title: '',
    summaryText: '',
    pdfAttachmentUrl: '',
    affectedEditionIds: []
  });
  const [savingMod, setSavingMod] = useState(false);
  const [modMsg, setModMsg] = useState('');

  // Search and filters
  const [userSearch, setUserSearch] = useState('');
  const [codeFilter, setCodeFilter] = useState('all'); // 'all' | 'used' | 'unused'
  const [codeSearch, setCodeSearch] = useState('');

  // Code generation state
  const [codesCount, setCodesCount] = useState(50);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Generator state
  const [selectedGenTopicId, setSelectedGenTopicId] = useState('1');
  const [availableHeadings, setAvailableHeadings] = useState([]);
  const [selectedHeadings, setSelectedHeadings] = useState('all'); // 'all' | Array<string>
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState([]);
  const [savingBatch, setSavingBatch] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [studentTestResults, setStudentTestResults] = useState([]);

  // Bank Manager state
  const [bankTopicId, setBankTopicId] = useState('1');
  const [bankSearch, setBankSearch] = useState('');
  const [bankActionMsg, setBankActionMsg] = useState('');

  // Topic Videos state
  const [allTopicVideos, setAllTopicVideos] = useState({});
  const [selectedVideoTopicId, setSelectedVideoTopicId] = useState('1');
  const [videoForm, setVideoForm] = useState({ title: '', url: '', duration: '', description: '' });
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoMsg, setVideoMsg] = useState('');
  // Special Tests Creator state
  const [specialTestsList, setSpecialTestsList] = useState([]);
  const [specialForm, setSpecialForm] = useState({
    title: '',
    topicId: '1',
    scopeType: 'todo',
    specificPoints: '',
    description: '',
    questionsJson: ''
  });
  const [editingSpecialId, setEditingSpecialId] = useState(null);
  const [savingSpecial, setSavingSpecial] = useState(false);
  const [specialMsg, setSpecialMsg] = useState('');

  useEffect(() => {
    const unsubSpecial = firebaseService.subscribeToSpecialTests((list) => {
      setSpecialTestsList(list);
    });
    return () => { if (unsubSpecial) unsubSpecial(); };
  }, []);

  const handleSaveSpecialTest = async (e) => {
    e.preventDefault();
    if (!specialForm.title.trim()) {
      alert('Introduce el título del Bloque Especial.');
      return;
    }

    let parsedQuestions = [];
    if (specialForm.questionsJson.trim()) {
      try {
        parsedQuestions = JSON.parse(specialForm.questionsJson);
        if (!Array.isArray(parsedQuestions)) {
          alert('El JSON debe ser un array de preguntas [...].');
          return;
        }
      } catch (err) {
        alert('Error sintáctico en el JSON de preguntas: ' + err.message);
        return;
      }
    }

    setSavingSpecial(true);
    setSpecialMsg('');
    try {
      const testId = editingSpecialId || ('esp_' + specialForm.topicId + '_' + Date.now());
      const payload = {
        id: testId,
        title: specialForm.title.trim(),
        topicId: specialForm.topicId.toString(),
        scopeType: specialForm.scopeType,
        specificPoints: specialForm.scopeType === 'puntos' ? specialForm.specificPoints.trim() : '',
        description: specialForm.description.trim(),
        questions: parsedQuestions,
        questionsCount: parsedQuestions.length
      };

      await firebaseService.saveSpecialTest(payload);
      setSpecialMsg(editingSpecialId ? '¡Bloque Especial actualizado con éxito!' : '¡Nuevo Bloque Especial creado con éxito!');
      setSpecialForm({ title: '', topicId: '1', scopeType: 'todo', specificPoints: '', description: '', questionsJson: '' });
      setEditingSpecialId(null);
      setTimeout(() => setSpecialMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el Bloque Especial.');
    } finally {
      setSavingSpecial(false);
    }
  };

  const handleEditSpecialTest = (item) => {
    setEditingSpecialId(item.id);
    setSpecialForm({
      title: item.title || '',
      topicId: item.topicId ? item.topicId.toString() : '1',
      scopeType: item.scopeType || 'todo',
      specificPoints: item.specificPoints || '',
      description: item.description || '',
      questionsJson: item.questions ? JSON.stringify(item.questions, null, 2) : ''
    });
  };

  const handleDeleteSpecialTest = async (testId, title) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el Bloque Especial "${title}"?`)) {
      try {
        await firebaseService.deleteSpecialTest(testId);
        setSpecialMsg(`Bloque "${title}" eliminado con éxito.`);
        setTimeout(() => setSpecialMsg(''), 4000);
      } catch (err) {
        console.error(err);
        alert('Error al eliminar el bloque.');
      }
    }
  };

  const activeTopicList = topics || topicsData;

  const handleCopyExecutableUrl = async (questions, title, topicId) => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      alert("No hay preguntas disponibles para generar el enlace.");
      return;
    }

    let summaryText = '';
    if (topicId) {
      const formattedNum = topicId.toString().padStart(2, '0');
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) {
          const mdText = await res.text();
          const safeSelHeadings = Array.isArray(selectedHeadings) ? selectedHeadings : 'all';
          summaryText = extractTopicSummary(mdText, safeSelHeadings);
        }
      } catch (e) {
        console.warn("Could not fetch summary for executable URL generator", e);
      }
    }

    const payload = {
      title: title,
      questions: questions,
      summaryText: summaryText
    };

    const token = compressTestToUrlToken(payload);
    const finalUrl = `${window.location.origin}/?t=${token}`;

    try {
      await navigator.clipboard.writeText(finalUrl);
      alert(`¡ENLACE DE TEST EJECUTABLE COPIADO AL PORTAPAPELES!\n\nPégalo directamente en tu correo de Outlook o Gmail (ej: 'Haz clic aquí para realizar el test').\n\nAl pulsar en Outlook, el test SE EJECUTARÁ DIRECTAMENTE en el navegador del alumno sin descargar archivos.`);
    } catch (e) {
      console.error(e);
      alert("Error al copiar enlace.");
    }
  };

  // Subscribe to real-time administrative data
  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    const unsubUsers = firebaseService.subscribeToAllUsers(
      (userList) => {
        setUsers(userList);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setErrorMsg('Error de permisos al acceder a los datos de la nube.');
        setLoading(false);
      }
    );

    const unsubCodes = firebaseService.subscribeToAllBookCodes(
      (codesList) => {
        setBookCodes(codesList);
      },
      (err) => {
        console.error(err);
      }
    );

    const unsubEditions = firebaseService.subscribeToMaterialEditions((list) => {
      setEditions(list);
    });

    const unsubMods = firebaseService.subscribeToMaterialModifications((list) => {
      setModifications(list);
    });

    const unsubEmails = firebaseService.subscribeToSentEmails((list) => {
      setEmailHistory(list);
    });

    const unsubVideos = firebaseService.subscribeToAllTopicVideos((map) => {
      setAllTopicVideos(map || {});
    });

    const unsubTestResults = firebaseService.subscribeToTestResults((results) => {
      setStudentTestResults(results || []);
    });

    return () => {
      unsubUsers();
      unsubCodes();
      unsubEditions();
      unsubMods();
      unsubEmails();
      unsubVideos();
      if (unsubTestResults) unsubTestResults();
    };
  }, []);


  // Fetch topic markdown headings whenever selectedGenTopicId changes
  useEffect(() => {
    const loadHeadings = async () => {
      const formattedNum = selectedGenTopicId.toString().padStart(2, '0');
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) {
          const text = await res.text();
          const headings = extractTopicHeadings(text);
          setAvailableHeadings(headings);
          setSelectedHeadings('all'); // reset to all by default
        }
      } catch (e) {
        console.warn('Could not load headings for topic', selectedGenTopicId, e);
        setAvailableHeadings([]);
        setSelectedHeadings('all');
      }
    };

    loadHeadings();
  }, [selectedGenTopicId]);

  // Auto-scroll suave garantizado hacia el lote de preguntas al terminar la generación
  useEffect(() => {
    if (generatedBatch.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById('batch-preview');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [generatedBatch]);

  const toggleSectionHeading = (headingText) => {
    if (selectedHeadings === 'all') {
      setSelectedHeadings([headingText]);
    } else {
      const isAlready = selectedHeadings.includes(headingText);
      if (isAlready) {
        const updated = selectedHeadings.filter(h => h !== headingText);
        setSelectedHeadings(updated.length === 0 ? 'all' : updated);
      } else {
        setSelectedHeadings([...selectedHeadings, headingText]);
      }
    }
  };

  const formatStudyTime = (totalSeconds) => {
    if (!totalSeconds) return '0m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isUserOnline = (user) => {
    if (!user.currentSessionId) return false;
    if (!user.lastActive) return true;
    const lastActiveTime = new Date(user.lastActive).getTime();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return lastActiveTime > tenMinutesAgo;
  };

  const handleKickUser = async (uid, name) => {
    if (window.confirm(`¿Estás seguro de que deseas cerrar la sesión activa de ${name}?`)) {
      try {
        await firebaseService.kickUserSession(uid);
        alert(`Sesión de ${name} cerrada correctamente.`);
      } catch (err) {
        console.error(err);
        alert('No se pudo cerrar la sesión.');
      }
    }
  };

  const handleDeleteUser = async (uid, name) => {
    if (window.confirm(`¿Estás seguro de que deseas ELIMINAR permanentemente a ${name}?`)) {
      try {
        await firebaseService.deleteUser(uid);
        alert(`Usuario ${name} eliminado correctamente.`);
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el usuario.');
      }
    }
  };

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (codesCount <= 0 || codesCount > 200) {
      alert('Introduce un número de códigos válido (entre 1 y 200).');
      return;
    }
    setGenerating(true);
    try {
      const newCodes = await firebaseService.generateNewBookCodes(codesCount);
      setGeneratedCodes(newCodes);
      setCopiedCodes(false);
    } catch (err) {
      console.error(err);
      alert('Error al generar los códigos.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyGeneratedCodes = () => {
    if (generatedCodes.length === 0) return;
    navigator.clipboard.writeText(generatedCodes.join('\n'))
      .then(() => setCopiedCodes(true))
      .catch(err => console.error('Error copiando:', err));
  };

  // ── GESTIÓN DE EDICIONES Y ASIGNACIONES ─────────────────────────────
  const handleDeleteEdition = async (editionId, versionTag) => {
    const assignedUsers = users.filter(u => {
      const ae = u.assignedEditions || {};
      return Object.values(ae).includes(editionId);
    });

    let warningMsg = `¿Estás seguro de que deseas ELIMINAR la Edición ${versionTag}?`;
    if (assignedUsers.length > 0) {
      warningMsg = `⚠️ ATENCIÓN: Esta Edición (${versionTag}) está actualmente ASIGNADA a ${assignedUsers.length} estudiante(s) (${assignedUsers.slice(0, 3).map(u => u.name || u.email).join(', ')}${assignedUsers.length > 3 ? '...' : ''}).\n\nSi continúas, la edición se eliminará y dichos alumnos quedarán sin versión vinculada.\n\n¿Deseas proceder con la eliminación?`;
    }

    if (window.confirm(warningMsg)) {
      try {
        await firebaseService.deleteMaterialEdition(editionId);
        alert(`Edición ${versionTag} eliminada correctamente.`);
      } catch (err) {
        console.error(err);
        alert('Error al eliminar la edición.');
      }
    }
  };

  const handleUpdateEditionNotes = async (edition) => {
    try {
      await firebaseService.saveMaterialEdition({
        ...edition,
        notes: editNotesText
      });
      setEditingEditionId(null);
      setEditNotesText('');
    } catch (err) {
      console.error(err);
      alert('Error al guardar las notas de la edición.');
    }
  };

  const [uploadingPdfId, setUploadingPdfId] = useState(null);

  const handleUploadEditionPdf = async (edition, file) => {
    if (!file) return;
    setUploadingPdfId(edition.id);
    try {
      await firebaseService.uploadEditionPdfFile(edition, file);
      alert(`¡PDF "${file.name}" adjuntado con éxito a la Edición ${edition.versionTag}!`);
    } catch (err) {
      console.error("Error uploading PDF:", err);
      alert(`❌ ${err?.message || 'Error al adjuntar el PDF a la edición.'}`);
    } finally {
      setUploadingPdfId(null);
    }
  };

  const handleAssignUserMaterial = async (userId, materialType, editionId) => {
    try {
      await firebaseService.assignUserMaterialEdition(userId, materialType, editionId);
    } catch (err) {
      console.error(err);
      alert('Error al asignar el material al estudiante.');
    }
  };

  // ── GESTIÓN DE MODIFICACIONES Y FE DE ERRATAS ─────────────────────────
  const toggleAffectedEdition = (edId) => {
    setModForm(prev => {
      const current = prev.affectedEditionIds || [];
      const updated = current.includes(edId)
        ? current.filter(id => id !== edId)
        : [...current, edId];
      return { ...prev, affectedEditionIds: updated };
    });
  };

  const handleSaveModification = async (e) => {
    e.preventDefault();
    if (!modForm.title.trim() || !modForm.summaryText.trim()) {
      alert('Por favor, completa el título y el resumen explicativo de la modificación.');
      return;
    }
    if (modForm.affectedEditionIds.length === 0) {
      alert('Debes seleccionar al menos una Edición Impresa afectada por esta modificación.');
      return;
    }

    setSavingMod(true);
    setModMsg('');
    try {
      await firebaseService.saveMaterialModification(modForm);

      const notifiedUsers = users.filter(u => {
        const ae = u.assignedEditions || {};
        return modForm.affectedEditionIds.includes(ae[modForm.materialType]);
      });

      setModMsg(`¡Éxito! Modificación registrada. Se ha notificado a ${notifiedUsers.length} alumno(s) que poseen las ediciones afectadas.`);
      setModForm({
        materialType: 'temario',
        topicId: '1',
        sectionTitle: '',
        title: '',
        summaryText: '',
        pdfAttachmentUrl: '',
        affectedEditionIds: []
      });
      setTimeout(() => setModMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la modificación.');
    } finally {
      setSavingMod(false);
    }
  };

  const handleDeleteModification = async (modId, title) => {
    if (window.confirm(`¿Deseas eliminar la modificación "${title}"?`)) {
      try {
        await firebaseService.deleteMaterialModification(modId);
      } catch (err) {
        console.error(err);
        alert('Error al eliminar la modificación.');
      }
    }
  };

  // ── ELIMINAR PREGUNTA DEL BANCO OFICIAL ─────────────────────────────
  const handleDeleteQuestionFromBank = (topicId, questionId, questionText) => {
    if (window.confirm(`¿Estás seguro de que deseas ELIMINAR del banco esta pregunta?\n\n"${questionText.substring(0, 80)}..."`)) {
      const currentList = quizzesData[topicId] || [];
      const updatedList = currentList.filter(q => q && q.id !== questionId);

      quizzesData[topicId] = updatedList;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quizzes-updated', {
          detail: { topicId, deletedId: questionId }
        }));
      }

      setBankActionMsg(`Pregunta eliminada con éxito del banco del Tema ${topicId}. Quedan ${updatedList.length} preguntas.`);
      setTimeout(() => setBankActionMsg(''), 4000);
    }
  };

  // ── GENERADOR DE TESTS IA ───────────────────────────────────────────
  const handleGenerateNewBatch = async () => {
    setIsGenerating(true);
    setSaveSuccessMsg('');
    try {
      const topicIdStr = (selectedGenTopicId || '1').toString();
      const formattedNum = topicIdStr.padStart(2, '0');
      let markdownText = '';
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) markdownText = await res.text();
      } catch (e) {
        console.warn('Could not load markdown topic', e);
      }

      const topicList = Array.isArray(activeTopicList) ? activeTopicList : [];
      const topicObj = topicList.find(t => t && t.id && t.id.toString() === topicIdStr) || { title: `Tema ${topicIdStr}` };
      const safeHeadings = Array.isArray(selectedHeadings) ? selectedHeadings : 'all';

      const newQuestions = await generateNewQuestionsForTopic({
        topicId: topicIdStr,
        topicTitle: topicObj.title || `Tema ${topicIdStr}`,
        markdownText: markdownText || '',
        count: genCount || 5,
        selectedSections: safeHeadings
      });

      const batch = Array.isArray(newQuestions) && newQuestions.length > 0
        ? newQuestions
        : createEmergencyFallbackBatch(topicIdStr, topicObj.title || `Tema ${topicIdStr}`, genCount || 5);
      setGeneratedBatch(batch);
    } catch (err) {
      console.error('Handled error in handleGenerateNewBatch, loading emergency batch:', err);
      const fallbackQuestions = createEmergencyFallbackBatch((selectedGenTopicId || '1').toString(), 'Tema de examen BUS', genCount || 5);
      setGeneratedBatch(fallbackQuestions);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateBatchQuestion = (index, field, value) => {
    setGeneratedBatch(prev => {
      const updated = [...prev];
      const q = { ...updated[index] };
      if (field.startsWith('option_')) {
        const optIdx = parseInt(field.split('_')[1], 10);
        const letter = ['A', 'B', 'C', 'D'][optIdx];
        const newOptions = [...q.options];
        newOptions[optIdx] = `${letter}) ${value.replace(/^[A-D]\)\s*/, '')}`;
        q.options = newOptions;
      } else {
        q[field] = value;
      }
      updated[index] = q;
      return updated;
    });
  };

  const handleDeleteBatchQuestion = (index) => {
    setGeneratedBatch(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddManualQuestion = () => {
    const topicObj = activeTopicList.find(t => t.id.toString() === selectedGenTopicId.toString()) || { title: `Tema ${selectedGenTopicId}` };
    const newQ = {
      id: generateQuestionId(selectedGenTopicId),
      question: `Nueva cuestión sobre ${topicObj.title}...`,
      options: [
        'A) Opción A correcta',
        'B) Opción B alternativa',
        'C) Opción C alternativa',
        'D) Opción D alternativa'
      ],
      correctAnswer: 0,
      explanation: `Norma de aplicación del Tema ${selectedGenTopicId}.`,
      topicId: selectedGenTopicId.toString(),
      isGenerated: false,
      createdAt: new Date().toISOString()
    };
    setGeneratedBatch(prev => [newQ, ...prev]);
  };

  const handleSaveBatchToBank = async () => {
    if (generatedBatch.length === 0) return;
    setSavingBatch(true);
    setSaveSuccessMsg('');

    try {
      const currentList = quizzesData[selectedGenTopicId] || [];
      const updatedList = [...currentList, ...generatedBatch];

      // Update memory reference
      quizzesData[selectedGenTopicId] = updatedList;

      // Dispatch event to refresh app views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quizzes-updated', {
          detail: { topicId: selectedGenTopicId, count: generatedBatch.length }
        }));
      }

      setSaveSuccessMsg(`¡Éxito! Se han añadido ${generatedBatch.length} preguntas inéditas al banco del Tema ${selectedGenTopicId}. Ahora la batería tiene ${updatedList.length} preguntas.`);
      setGeneratedBatch([]);
    } catch (err) {
      console.error(err);
      alert('Error al guardar en el banco de preguntas.');
    } finally {
      setSavingBatch(false);
    }
  };

  const [sendAlsoEmail, setSendAlsoEmail] = useState(false);

  const handleSendEmailAnnounce = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Por favor, completa el asunto y el cuerpo del comunicado.');
      return;
    }
    if (emailTargetType !== 'all' && !emailTargetValue.trim()) {
      alert('Por favor, introduce el filtro o selecciona el alumno de destino.');
      return;
    }

    setSendingEmail(true);
    setEmailMsg('');
    try {
      await firebaseService.sendAdminEmailAnnounce(
        emailSubject,
        emailBody.replace(/\n/g, '<br/>'),
        emailTargetType,
        emailTargetValue,
        sendAlsoEmail
      );
      setEmailMsg(sendAlsoEmail ? '¡Comunicado publicado en la App y enviado por correo a los alumnos!' : '¡Comunicado publicado con éxito en la App! (Aparece como aviso pendiente en sus pantallas)');
      setEmailSubject('');
      setEmailBody(
        'Hola {nombre},\n\nTenemos un aviso importante sobre el temario / curso de Oposiciones BUS.\n\n[Escribe aquí tu comunicado o ampliación...]\n\nUn saludo,\nJulio Gómez (Preparador BUS)'
      );
      setEmailTargetValue('');
      setTimeout(() => setEmailMsg(''), 6000);
    } catch (err) {
      console.error(err);
      alert(`Error al publicar comunicado: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDeleteEmailRecord = async (id) => {
    if (window.confirm('¿Deseas eliminar este registro de correo enviado del historial? (Esto no borrarra los emails ya delegados o recibidos por los alumnos).')) {
      try {
        await firebaseService.deleteSentEmailRecord(id);
      } catch (err) {
        console.error(err);
        alert('Error al borrar el registro.');
      }
    }
  };

  // ── GESTIÓN DE VÍDEOS EXPLICATIVOS POR TEMA ─────────────────────────────
  const currentTopicVideos = allTopicVideos[selectedVideoTopicId.toString()] || [];

  const handleSaveTopicVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.url.trim()) {
      alert('Por favor, introduce al menos el título y el enlace (URL) del vídeo.');
      return;
    }

    setSavingVideo(true);
    setVideoMsg('');
    try {
      let updatedList = [...currentTopicVideos];
      if (editingVideoId) {
        updatedList = updatedList.map(v => v.id === editingVideoId ? { ...v, ...videoForm } : v);
      } else {
        const newVideo = {
          id: 'v_' + selectedVideoTopicId + '_' + Date.now(),
          ...videoForm,
          createdAt: new Date().toISOString()
        };
        updatedList.push(newVideo);
      }

      await firebaseService.saveTopicVideos(selectedVideoTopicId, updatedList);
      setVideoMsg(editingVideoId ? '¡Vídeo actualizado con éxito!' : '¡Nuevo vídeo añadido al Tema!');
      setVideoForm({ title: '', url: '', duration: '', description: '' });
      setEditingVideoId(null);
      setTimeout(() => setVideoMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el vídeo.');
    } finally {
      setSavingVideo(false);
    }
  };

  const handleEditTopicVideo = (video) => {
    setEditingVideoId(video.id);
    setVideoForm({
      title: video.title || '',
      url: video.url || '',
      duration: video.duration || '',
      description: video.description || ''
    });
  };

  const handleDeleteTopicVideo = async (videoId, title) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el vídeo "${title}" del Tema ${selectedVideoTopicId}?`)) {
      try {
        const updatedList = currentTopicVideos.filter(v => v.id !== videoId);
        await firebaseService.saveTopicVideos(selectedVideoTopicId, updatedList);
        setVideoMsg(`Vídeo "${title}" eliminado con éxito.`);
        setTimeout(() => setVideoMsg(''), 4000);
      } catch (err) {
        console.error(err);
        alert('Error al eliminar el vídeo.');
      }
    }
  };

  const handleMoveTopicVideo = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentTopicVideos.length) return;
    const updatedList = [...currentTopicVideos];
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;
    try {
      await firebaseService.saveTopicVideos(selectedVideoTopicId, updatedList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleForceSyncCloudVideos = async () => {
    try {
      setSavingVideo(true);
      await firebaseService.saveTopicVideos(selectedVideoTopicId, currentTopicVideos);
      setVideoMsg(`¡Playlist del Tema ${selectedVideoTopicId} enviada a la Nube de Firebase! Se actualizará en todos los dispositivos.`);
      setTimeout(() => setVideoMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert('Error al sincronizar con la nube.');
    } finally {
      setSavingVideo(false);
    }
  };

  // Metrics
  const registeredUsersCount = users.filter(u => u.uid !== 'guest_profile').length;
  const onlineUsersCount = users.filter(u => isUserOnline(u) && u.uid !== 'guest_profile').length;

  let studentsWithScores = 0;
  let scoresSum = 0;
  users.forEach(u => {
    if (u.uid !== 'guest_profile' && u.progress && u.progress.quizzes) {
      const quizKeys = Object.keys(u.progress.quizzes);
      if (quizKeys.length > 0) {
        studentsWithScores++;
        let userSum = 0;
        quizKeys.forEach(k => { userSum += (u.progress.quizzes[k].score || 0); });
        scoresSum += (userSum / quizKeys.length);
      }
    }
  });
  const averageGlobalScore = studentsWithScores > 0 ? (scoresSum / studentsWithScores).toFixed(1) : 'N/A';

  const totalCodesCount = bookCodes.length;
  const usedCodesCount = bookCodes.filter(c => c.used).length;
  const unusedCodesCount = totalCodesCount - usedCodesCount;

  const filteredUsers = users.filter(u => {
    if (u.uid === 'guest_profile') return false;
    const searchLower = userSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.bookCode || '').toLowerCase().includes(searchLower);
  });

  const filteredCodes = bookCodes.filter(c => {
    if (codeFilter === 'used' && !c.used) return false;
    if (codeFilter === 'unused' && c.used) return false;
    if (codeSearch) {
      const searchLower = codeSearch.toLowerCase();
      const codeMatch = c.code.toLowerCase().includes(searchLower);
      let userMatch = false;
      if (c.used && c.usedBy) {
        const user = users.find(u => u.uid === c.usedBy);
        if (user) {
          userMatch = (user.name || '').toLowerCase().includes(searchLower) ||
            (user.email || '').toLowerCase().includes(searchLower);
        }
      }
      return codeMatch || userMatch;
    }
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aOnline = isUserOnline(a);
    const bOnline = isUserOnline(b);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    const aAdmin = a.role === 'admin';
    const bAdmin = b.role === 'admin';
    if (aAdmin && !bAdmin) return -1;
    if (!aAdmin && bAdmin) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Bank questions list
  const currentBankList = quizzesData[bankTopicId] || [];
  const filteredBankList = currentBankList.filter(q => {
    if (!q || !q.question) return false;
    if (!bankSearch) return true;
    const searchLower = bankSearch.toLowerCase();
    return (
      q.question.toLowerCase().includes(searchLower) ||
      (q.explanation || '').toLowerCase().includes(searchLower) ||
      q.options.some(opt => opt.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="admin-dashboard-container fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--secondary)' }} />
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>Panel de Control del Creador</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Supervisión global de estudiantes, códigos físicos, gestor del banco y generador de preguntas.
          </p>
        </div>

        {/* Sub-tabs Selector */}
        <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: '12px', background: 'rgba(15,20,36,0.5)', flexWrap: 'wrap', gap: '4px' }}>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`tab-btn ${activeSubTab === 'stats' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'stats' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'users' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Estudiantes ({registeredUsersCount})
          </button>
          <button
            onClick={() => setActiveSubTab('editions')}
            className={`tab-btn ${activeSubTab === 'editions' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'editions' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            <span>Ediciones Impresas ({editions.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('modifications')}
            className={`tab-btn ${activeSubTab === 'modifications' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'modifications' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={16} />
            <span>Fe de Erratas / Anexos ({modifications.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('codes')}
            className={`tab-btn ${activeSubTab === 'codes' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'codes' ? 'var(--primary)' : 'transparent', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'var(--transition-fast)' }}
          >
            Códigos
          </button>
          <button
            onClick={() => setActiveSubTab('bank')}
            className={`tab-btn ${activeSubTab === 'bank' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'bank' ? 'var(--secondary)' : 'transparent', color: activeSubTab === 'bank' ? '#000' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Library size={16} />
            <span>Banco</span>
          </button>
          <button
            onClick={() => setActiveSubTab('generator')}
            className={`tab-btn ${activeSubTab === 'generator' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'generator' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={16} />
            <span>Generar Tests</span>
          </button>
          <button
            onClick={() => setActiveSubTab('special')}
            className={`tab-btn ${activeSubTab === 'special' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'special' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(245, 158, 11, 0.15)', color: activeSubTab === 'special' ? '#fff' : '#fbbf24', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Award size={16} />
            <span>Bloques Especiales ({specialTestsList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('videos')}
            className={`tab-btn ${activeSubTab === 'videos' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'videos' ? 'var(--secondary)' : 'transparent', color: activeSubTab === 'videos' ? '#000' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '750', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Video size={16} />
            <span>Vídeos por Tema</span>
          </button>
          <button
            onClick={() => setActiveSubTab('results')}
            className={`tab-btn ${activeSubTab === 'results' ? 'active' : ''}`}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: activeSubTab === 'results' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(16, 185, 129, 0.18)',
              color: activeSubTab === 'results' ? '#fff' : '#34d399',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.85rem',
              transition: 'var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}
          >
            <CheckCircle size={16} />
            <span>📊 Notas Alumnos HTML ({studentTestResults.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('activity');
              firebaseService.getAllActivityData().then(data => setActivityData(data || {}));
            }}
            className={`tab-btn ${activeSubTab === 'activity' ? 'active' : ''}`}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: activeSubTab === 'activity' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(59, 130, 246, 0.12)',
              color: activeSubTab === 'activity' ? '#fff' : '#60a5fa',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.85rem',
              transition: 'var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <Clock size={16} />
            <span>📊 Tiempo y Consejos (Admin)</span>
          </button>
        </div>
      </div>


      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUBTAB: BLOQUES ESPECIALES / TESTS DE PROFUNDIZACIÓN */}
      {activeSubTab === 'special' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#f59e0b', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={24} />
              <span>Creador de Bloques Especiales / Tests de Profundización</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Crea baterías temáticas avanzadas para cualquier Tema de la oposición, especificando si abarcan <strong>Todo el Tema</strong> o <strong>Aspectos / Puntos Concretos</strong>.
            </p>

            {specialMsg && (
              <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.88rem', fontWeight: '600' }}>
                {specialMsg}
              </div>
            )}

            <form onSubmit={handleSaveSpecialTest} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                    Título del Bloque Especial: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 🎯 Competencias de Órganos Colegiados (60 Preguntas)"
                    value={specialForm.title}
                    onChange={(e) => setSpecialForm({ ...specialForm, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                    Tema Asociado: *
                  </label>
                  <select
                    value={specialForm.topicId}
                    onChange={(e) => setSpecialForm({ ...specialForm, topicId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {activeTopicList.map(t => (
                      <option key={t.id} value={t.id.toString()}>
                        Tema {t.id}: {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                    Cobertura / Ámbito del Test: *
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setSpecialForm({ ...specialForm, scopeType: 'todo' })}
                      className={`tab-btn ${specialForm.scopeType === 'todo' ? 'active' : ''}`}
                      style={{ flex: 1, padding: '8px', fontSize: '0.82rem', background: specialForm.scopeType === 'todo' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      🌐 Todo el Tema
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecialForm({ ...specialForm, scopeType: 'puntos' })}
                      className={`tab-btn ${specialForm.scopeType === 'puntos' ? 'active' : ''}`}
                      style={{ flex: 1, padding: '8px', fontSize: '0.82rem', background: specialForm.scopeType === 'puntos' ? '#f59e0b' : 'rgba(255,255,255,0.05)', color: specialForm.scopeType === 'puntos' ? '#000' : '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold' }}
                    >
                      🎯 Aspectos Concretos
                    </button>
                  </div>
                </div>
              </div>

              {specialForm.scopeType === 'puntos' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#f59e0b', marginBottom: '4px', fontWeight: '700' }}>
                    Aspectos / Puntos Concretos del Tema Tratados: *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Órganos Colegiados y Unipersonales (Decreto 98/2025)"
                    value={specialForm.specificPoints}
                    onChange={(e) => setSpecialForm({ ...specialForm, specificPoints: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid #f59e0b', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                  Descripción Pedagógica para los Alumnos:
                </label>
                <textarea
                  rows={2}
                  placeholder="Explicación detallada de la batería de preguntas, enfoque legal o métrica de opciones..."
                  value={specialForm.description}
                  onChange={(e) => setSpecialForm({ ...specialForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    Banco de Preguntas del Bloque (Código JSON):
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {'Pega un array JSON [ { "id": "...", "question": "...", "options": [...], "correctAnswer": 0, "explanation": "..." } ]'}
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder='[ &#10;  { &#10;    "id": "esp_01", &#10;    "question": "¿Enunciado de la pregunta?", &#10;    "options": ["Opción A", "Opción B", "Opción C", "Opción D"], &#10;    "correctAnswer": 0, &#10;    "explanation": "Explicación legal..." &#10;  } &#10;]'
                  value={specialForm.questionsJson}
                  onChange={(e) => setSpecialForm({ ...specialForm, questionsJson: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={savingSpecial}
                  style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  {savingSpecial ? 'Guardando...' : editingSpecialId ? '💾 Guardar Cambios en el Bloque' : '✨ Crear Bloque Especial'}
                </button>
                {editingSpecialId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSpecialId(null);
                      setSpecialForm({ title: '', topicId: '1', scopeType: 'todo', specificPoints: '', description: '', questionsJson: '' });
                    }}
                    style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LIST OF ACTIVE SPECIAL BLOCKS */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Bloques Especiales Activos ({specialTestsList.length})
            </h3>

            {specialTestsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay bloques especiales creados. Utiliza el formulario superior para añadir el primero.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {specialTestsList.map(item => {
                  const qCount = (item.questions && Array.isArray(item.questions)) ? item.questions.length : (item.questionsCount || 0);
                  return (
                    <div
                      key={item.id}
                      style={{ padding: '16px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
                    >
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: '800' }}>
                            Tema {item.topicId}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', background: item.scopeType === 'puntos' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: item.scopeType === 'puntos' ? '#f59e0b' : '#34d399', fontSize: '0.75rem', fontWeight: '700' }}>
                            {item.scopeType === 'puntos' ? `🎯 Aspectos Concretos: ${item.specificPoints || 'Puntos específicos'}` : '🌐 Todo el Tema'}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
                            {qCount} preguntas
                          </span>
                        </div>
                        <h4 style={{ margin: '4px 0', fontSize: '1rem', color: '#fff' }}>{item.title}</h4>
                        {item.description && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>{item.description}</p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditSpecialTest(item)}
                          style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyExecutableUrl(item.questions, item.title, item.topicId)}
                          style={{ padding: '6px 12px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                          title="Copiar enlace directo ejecutable para Outlook/Gmail (sin descargar archivos)"
                        >
                          🔗 Copiar Enlace Ejecutable (Sin descarga)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportToHTML(item)}
                          style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                          title="Descargar HTML offline para enviar a alumnos"
                        >
                          📧 Descargar HTML
                        </button>
                        {!item.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSpecialTest(item.id, item.title)}
                            style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: GESTIÓN DE VÍDEOS EXPLICATIVOS POR TEMA */}
      {activeSubTab === 'videos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={24} />
                  <span>Gestor de Vídeos Explicativos por Tema</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Asigna y organiza listas de reproducción (Playlists) con múltiples vídeos por tema (YouTube, Vimeo o enlaces directos).
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>
                  Seleccionar Tema a Gestionar:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={selectedVideoTopicId}
                    onChange={(e) => {
                      setSelectedVideoTopicId(e.target.value);
                      setVideoForm({ title: '', url: '', duration: '', description: '' });
                      setEditingVideoId(null);
                    }}
                    style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px 14px', borderRadius: '8px', outline: 'none', fontWeight: '700', fontSize: '0.9rem' }}
                  >
                    {activeTopicList.map(t => (
                      <option key={t.id} value={t.id}>
                        Tema {t.id}: {t.title} ({(allTopicVideos[t.id.toString()] || []).length} vídeos)
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleForceSyncCloudVideos}
                    disabled={savingVideo}
                    style={{
                      padding: '10px 14px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                    title="Enviar cambios a la Nube de Firebase para actualizar en todos los móviles"
                  >
                    <RefreshCw size={14} className={savingVideo ? 'spin' : ''} />
                    <span>☁️ Enviar a la Nube / Sincronizar Móvil</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {videoMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '10px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{videoMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Formulario Añadir / Editar Vídeo */}
            <form onSubmit={handleSaveTopicVideo} className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--secondary)' }} />
                <span>{editingVideoId ? 'Editar Vídeo' : 'Añadir Nuevo Vídeo al Tema ' + selectedVideoTopicId}</span>
              </h4>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Título del Vídeo *</label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="Ej: Parte 1: Concepto y Marco Normativo de la BUS"
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Enlace / URL del Vídeo (YouTube, Vimeo, MP4) *</label>
                <input
                  type="url"
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  placeholder="Ej: https://www.youtube.com/watch?v=... o https://youtu.be/..."
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  💡 Soporta URLs estándar de YouTube, YouTube Shorts, Vimeo o enlaces directos .mp4.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Duración Estimada</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    placeholder="Ej: 15 min"
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Descripción o Notas del Vídeo (Opcional)</label>
                <textarea
                  rows={3}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Ej: Aspectos clave del Reglamento de la BUS para examen..."
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={savingVideo}
                  style={{ flex: 1, padding: '10px 16px', background: 'var(--secondary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Save size={16} />
                  <span>{savingVideo ? 'Guardando...' : (editingVideoId ? 'Actualizar Vídeo' : 'Guardar Vídeo')}</span>
                </button>
                {editingVideoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideoId(null);
                      setVideoForm({ title: '', url: '', duration: '', description: '' });
                    }}
                    style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Lista de Vídeos Actuales del Tema */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Playlist actual del Tema {selectedVideoTopicId}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '700' }}>
                  {currentTopicVideos.length} vídeo(s)
                </span>
              </h4>

              {currentTopicVideos.length === 0 ? (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px' }}>
                  No hay vídeos añadidos aún a este tema. Completa el formulario a la izquierda para publicar la primera videoclase.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentTopicVideos.map((vid, index) => (
                    <div
                      key={vid.id || index}
                      style={{
                        padding: '12px 14px',
                        background: editingVideoId === vid.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                        border: editingVideoId === vid.id ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(212, 163, 89, 0.2)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', flexShrink: 0 }}>
                          {index + 1}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {vid.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '2px', alignItems: 'center' }}>
                            {vid.duration && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {vid.duration}
                              </span>
                            )}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', fontFamily: 'monospace' }}>
                              {vid.url}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveTopicVideo(index, -1)}
                          disabled={index === 0}
                          style={{ padding: '4px 6px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', color: index === 0 ? '#555' : '#fff', cursor: index === 0 ? 'default' : 'pointer' }}
                          title="Subir posición"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTopicVideo(index, 1)}
                          disabled={index === currentTopicVideos.length - 1}
                          style={{ padding: '4px 6px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', color: index === currentTopicVideos.length - 1 ? '#555' : '#fff', cursor: index === currentTopicVideos.length - 1 ? 'default' : 'pointer' }}
                          title="Bajar posición"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTopicVideo(vid)}
                          style={{ padding: '6px 8px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', color: '#fef08a', cursor: 'pointer' }}
                          title="Editar este vídeo"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTopicVideo(vid.id, vid.title)}
                          style={{ padding: '6px 8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}
                          title="Eliminar vídeo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: GESTOR DEL BANCO DE PREGUNTAS (ELIMINAR / REVISAR) */}
      {activeSubTab === 'bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 163, 89, 0.3)', background: 'linear-gradient(135deg, rgba(212, 163, 89, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Library size={22} />
                  <span>Gestor del Banco de Preguntas</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Examina todas las preguntas existentes por tema, busca cuestiones específicas y elimina preguntas obsoletas o duplicadas.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Seleccionar Tema:</label>
                  <select
                    value={bankTopicId}
                    onChange={(e) => setBankTopicId(e.target.value)}
                    style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    {activeTopicList.map(t => (
                      <option key={t.id} value={t.id}>
                        Tema {t.id}: {t.title.length > 35 ? t.title.substring(0, 35) + '...' : t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ position: 'relative', marginTop: '18px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Buscar en la batería de preguntas..."
                    style={{ padding: '8px 12px 8px 36px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '240px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>
                📚 Banco oficial del Tema {bankTopicId}: <span style={{ color: 'var(--secondary)' }}>{currentBankList.length} preguntas en total</span>
              </span>
              {bankSearch && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mostrando {filteredBankList.length} coincidencias con "{bankSearch}"
                </span>
              )}
            </div>
          </div>

          {bankActionMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '10px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{bankActionMsg}</span>
            </div>
          )}

          {/* QUESTION CARDS LIST WITH DELETE BUTTON */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredBankList.length === 0 ? (
              <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px' }}>
                No se encontraron preguntas en el banco para este criterio de búsqueda.
              </div>
            ) : (
              filteredBankList.map((q, idx) => (
                <div key={q.id || idx} className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', background: 'rgba(212, 163, 89, 0.15)', padding: '2px 10px', borderRadius: '10px' }}>
                        Pregunta #{idx + 1}
                      </span>
                      {q.isGenerated && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: '600' }}>
                          ⚡ Inédita / Generada
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ID: {q.id}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestionFromBank(bankTopicId, q.id, q.question)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Eliminar permanentemente del banco"
                    >
                      <Trash2 size={14} />
                      <span>Eliminar del Banco</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', lineHeight: '1.4' }}>
                    {q.question}
                  </div>

                  {/* Options Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    {q.options && q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            background: isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
                            color: isCorrect ? '#4ade80' : 'rgba(255,255,255,0.7)',
                            fontWeight: isCorrect ? '700' : '400'
                          }}
                        >
                          {opt} {isCorrect && '✓'}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', marginTop: '2px' }}>
                      <strong style={{ color: 'var(--secondary)' }}>Fuente:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: GENERATOR */}
      {activeSubTab === 'generator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BANNER NOTIFICACIÓN DE LOTE GENERADO DISPONIBLE */}
          {generatedBatch.length > 0 && (
            <div
              onClick={() => document.getElementById('batch-preview')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                cursor: 'pointer',
                padding: '14px 20px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '14px',
                color: '#4ade80',
                fontSize: '0.95rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
                animation: 'pulse 2s infinite'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={22} style={{ color: '#22c55e' }} />
                <span>¡LOTE DE {generatedBatch.length} PREGUNTAS SINTETIZADO CON ÉXITO! (Tema {selectedGenTopicId})</span>
              </span>
              <span style={{ fontSize: '0.85rem', background: '#22c55e', color: '#000', padding: '4px 12px', borderRadius: '10px', fontWeight: '800' }}>
                👇 Haz clic aquí para ver o exportar
              </span>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Row 1: Title and Main Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fef08a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={22} style={{ color: '#f59e0b' }} />
                    <span>Generador e Incorporador de Tests Inéditos</span>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Sintetiza preguntas inéditas por tema y enfoca la generación seleccionando epígrafes o apartados específicos.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tema de destino:</label>
                    <select
                      value={selectedGenTopicId}
                      onChange={(e) => setSelectedGenTopicId(e.target.value)}
                      style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      {activeTopicList.map(t => (
                        <option key={t.id} value={t.id}>
                          Tema {t.id}: {t.title.length > 35 ? t.title.substring(0, 35) + '...' : t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Preguntas a generar:</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                      style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      <option value={5}>5 preguntas inéditas</option>
                      <option value={10}>10 preguntas inéditas</option>
                      <option value={15}>15 preguntas inéditas</option>
                      <option value={20}>20 preguntas inéditas</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateNewBatch}
                    disabled={isGenerating}
                    style={{
                      marginTop: '18px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      fontWeight: '800',
                      border: 'none',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{isGenerating ? 'Sintetizando...' : '⚡ Generar (Ver en Pantalla)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsGenerating(true);
                      setSaveSuccessMsg('');
                      try {
                        const topicIdStr = (selectedGenTopicId || '1').toString();
                        const formattedNum = topicIdStr.padStart(2, '0');
                        let markdownText = '';
                        try {
                          const res = await fetch(`/markdown/tema-${formattedNum}.md`);
                          if (res.ok) markdownText = await res.text();
                        } catch (e) {
                          console.warn('Could not load markdown topic', e);
                        }

                        const topicList = Array.isArray(activeTopicList) ? activeTopicList : [];
                        const topicObj = topicList.find(t => t && t.id && t.id.toString() === topicIdStr) || { title: `Tema ${topicIdStr}` };
                        const safeHeadings = Array.isArray(selectedHeadings) ? selectedHeadings : 'all';

                        const newQuestions = await generateNewQuestionsForTopic({
                          topicId: topicIdStr,
                          topicTitle: topicObj.title || `Tema ${topicIdStr}`,
                          markdownText: markdownText || '',
                          count: genCount || 5,
                          selectedSections: safeHeadings
                        });

                        const batch = Array.isArray(newQuestions) ? newQuestions : [];
                        setGeneratedBatch(batch);

                        if (batch.length > 0) {
                          let summaryText = '';
                          if (markdownText) {
                            const safeSelHeadings = Array.isArray(selectedHeadings) ? selectedHeadings : 'all';
                            summaryText = extractTopicSummary(markdownText, safeSelHeadings);
                          }
                          downloadTestAsHTML(batch, topicObj.title, '', 'oposiciones-bus-app', summaryText);
                          alert(`¡Éxito! Se ha descargado el archivo HTML interactivo con Resumen (${batch.length} preguntas).\n\nPuedes adjuntar este único archivo por correo a 1 o varios alumnos. Al abrirlo, cada alumno escribirá su nombre o email para registrar su nota en tu panel.`);
                        }
                      } catch (err) {
                        console.error('Error in direct export:', err);
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={isGenerating}
                    style={{
                      marginTop: '18px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(96, 165, 250, 0.4)',
                      color: '#60a5fa',
                      fontWeight: '800',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem'
                    }}
                    title="Sintetizar preguntas inéditas y descargar directamente los archivos HTML interactivos para enviar a los alumnos"
                  >
                    <Mail size={18} />
                    <span>📧 Exportar HTML con Resumen (Para Email)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddManualQuestion}
                    style={{
                      marginTop: '18px',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Plus size={16} />
                    <span>Añadir Manual</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Section / Headings Selector */}
              {availableHeadings.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListFilter size={16} style={{ color: 'var(--secondary)' }} />
                      <span>Enfoque por Puntos / Epígrafes del Tema {selectedGenTopicId}:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedHeadings('all')}
                      style={{
                        background: selectedHeadings === 'all' ? 'var(--secondary)' : 'rgba(255,255,255,0.08)',
                        color: selectedHeadings === 'all' ? '#000' : 'rgba(255,255,255,0.7)',
                        border: 'none',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      🌐 Todos los puntos (Por defecto)
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                    {availableHeadings.map((heading, hIdx) => {
                      const isSelected = selectedHeadings === 'all' || (Array.isArray(selectedHeadings) && selectedHeadings.includes(heading));
                      return (
                        <button
                          key={hIdx}
                          type="button"
                          onClick={() => toggleSectionHeading(heading)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                            border: isSelected ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                            color: isSelected ? '#fef08a' : 'rgba(255,255,255,0.6)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? <CheckSquare size={13} style={{ color: '#f59e0b' }} /> : <Square size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                          <span>{heading}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {saveSuccessMsg && (
            <div style={{ padding: '14px 18px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '12px', color: '#4ade80', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* GENERATING PROGRESS STATE CARD */}
          {isGenerating && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)', display: 'flex', alignItems: 'center', gap: '16px', color: '#fef08a' }}>
              <div className="spinning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={28} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#f59e0b' }}>Sintetizando preguntas inéditas de examen...</span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Analizando normativa oficial de la US y Reglamento de la BUS para el Tema {selectedGenTopicId}...</span>
              </div>
            </div>
          )}

          {/* PREVIEW & EDIT BATCH */}
          {generatedBatch.length > 0 && (
            <div id="batch-preview" style={{ display: 'flex', flexDirection: 'column', gap: '16px', scrollMarginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} style={{ color: 'var(--secondary)' }} />
                  <span>Lote Generado ({generatedBatch.length} preguntas) — Tema {selectedGenTopicId}</span>
                </h4>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const topicObj = activeTopicList.find(t => t.id.toString() === selectedGenTopicId.toString()) || { title: `Tema ${selectedGenTopicId}` };
                      handleCopyExecutableUrl(generatedBatch, topicObj.title, selectedGenTopicId);
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}
                    title="Copiar enlace ejecutable directo para enviar por correo sin descarga de archivos"
                  >
                    <span>🔗 Copiar Enlace Ejecutable (para Outlook sin descarga)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (generatedBatch.length === 0) return;

                      const topicObj = activeTopicList.find(t => t.id.toString() === selectedGenTopicId.toString()) || { title: `Tema ${selectedGenTopicId}` };
                      let summaryText = '';
                      const formattedNum = selectedGenTopicId.toString().padStart(2, '0');
                      try {
                        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
                        if (res.ok) {
                          const mdText = await res.text();
                          const safeSelHeadings = Array.isArray(selectedHeadings) ? selectedHeadings : 'all';
                          summaryText = extractTopicSummary(mdText, safeSelHeadings);
                        }
                      } catch (e) {
                        console.warn("Could not fetch summary", e);
                      }

                      downloadTestAsHTML(generatedBatch, topicObj.title, '', 'oposiciones-bus-app', summaryText);
                      alert(`¡Archivo HTML interactivo descargado!\n\nLa recogida de datos es 100% invisible para el alumno (sin formularios ni preguntas en pantalla). Al realizar el test, su resultado se registrará silenciosamente en tu panel.`);
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontWeight: '700',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.88rem'
                    }}
                    title="Descargar paquete HTML interactivo con Resumen del Tema para enviar por email"
                  >
                    <span>📧 Exportar HTML (con Resumen)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBatchToBank}
                    disabled={savingBatch}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      fontWeight: '800',
                      border: 'none',
                      cursor: savingBatch ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <Save size={18} />
                    <span>{savingBatch ? 'Guardando...' : `💾 Guardar e Incorporar al Banco (${generatedBatch.length} preguntas)`}</span>
                  </button>
                </div>
              </div>

              {generatedBatch.map((q, idx) => {
                const dupCheck = checkDuplicated(q.question, selectedGenTopicId);
                return (
                  <div key={q.id || idx} className="glass-panel" style={{ padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', background: 'rgba(212, 163, 89, 0.15)', padding: '2px 10px', borderRadius: '12px' }}>
                        Pregunta #{idx + 1}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {!dupCheck.isDuplicated ? (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: '700' }}>
                            🟢 100% Inédita (0% coincidencia)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '700' }}>
                            ⚠️ Similitud {dupCheck.similarityPercentage}% con pregunta existente
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteBatchQuestion(idx)}
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
                          title="Eliminar pregunta del lote"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Question text input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Enunciado de la pregunta:</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleUpdateBatchQuestion(idx, 'question', e.target.value)}
                        rows={2}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical', outline: 'none' }}
                      />
                    </div>

                    {/* Options inputs A, B, C, D */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                        const optValue = q.options[optIdx] ? q.options[optIdx].replace(/^[A-D]\)\s*/, '') : '';
                        const isCorrect = q.correctAnswer === optIdx;
                        return (
                          <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', border: isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent' }}>
                            <input
                              type="radio"
                              name={`correct_${idx}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateBatchQuestion(idx, 'correctAnswer', optIdx)}
                              title="Marcar como respuesta correcta"
                            />
                            <span style={{ fontWeight: '800', color: isCorrect ? '#4ade80' : 'var(--text-muted)', fontSize: '0.85rem' }}>{letter})</span>
                            <input
                              type="text"
                              value={optValue}
                              onChange={(e) => handleUpdateBatchQuestion(idx, `option_${optIdx}`, e.target.value)}
                              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Explicación / Justificación de norma:</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateBatchQuestion(idx, 'explanation', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STUDENT HTML TEST RESULTS PANEL */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(15, 23, 42, 0.8)', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={22} style={{ color: '#10b981' }} />
                <span>📊 Registro de Calificaciones de Alumnos (Tests HTML Entregados)</span>
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                {studentTestResults.length} Entregas Registradas
              </span>
            </div>

            {studentTestResults.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: '10px 0', fontSize: '0.88rem' }}>
                No se han recibido entregas de alumnos aún. Cuando un alumno abra el archivo HTML exportado, responda las preguntas y pulse "Enviar y Corregir Test", su nota, porcentaje de acierto y respuestas aparecerán aquí en tiempo real.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {studentTestResults.map((item, idx) => {
                  const percent = Math.round((item.score / item.maxScore) * 100);
                  const isPass = percent >= 50;
                  return (
                    <div key={item.id || idx} style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', color: '#60a5fa', fontSize: '0.95rem' }}>📧 Alumno: {item.studentId}</span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>📌 {item.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕒 Fecha de entrega: {new Date(item.timestamp).toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: isPass ? '#4ade80' : '#fca5a5' }}>
                            Nota: {item.score} / {item.maxScore}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: isPass ? '#86efac' : '#fca5a5' }}>
                            {percent}% de aciertos netos ({isPass ? 'APROBADO' : 'SUSPENSO'})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: REGISTRO DE NOTAS DE ALUMNOS (TESTS HTML) */}
      {activeSubTab === 'results' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
              <span>📊 Registro de Calificaciones de Alumnos (Tests HTML Entregados)</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              {studentTestResults.length} Entregas Registradas
            </span>
          </div>

          {studentTestResults.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: '15px 0', fontSize: '0.92rem' }}>
              No se han recibido entregas de alumnos aún. Cuando un alumno abra el archivo HTML exportado, responda las preguntas y pulse "Enviar y Corregir Test", su nota, porcentaje de acierto y respuestas aparecerán aquí en tiempo real de forma 100% invisible para él.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
              {studentTestResults.map((item, idx) => {
                const percent = Math.round((item.score / item.maxScore) * 100);
                const isPass = percent >= 50;
                return (
                  <div key={item.id || idx} style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontWeight: '700', color: '#60a5fa', fontSize: '1rem' }}>📧 Alumno / Dispositivo: {item.studentId}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>📌 {item.title}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🕒 Fecha de entrega: {new Date(item.timestamp).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: isPass ? '#4ade80' : '#fca5a5' }}>
                          Nota: {item.score} / {item.maxScore}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: isPass ? '#86efac' : '#fca5a5' }}>
                          {percent}% de aciertos netos ({isPass ? 'APROBADO' : 'SUSPENSO'})
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* METRICS & USERS & CODES TABS */}
      {activeSubTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Estudiantes Registrados</span>
              <Users size={20} style={{ color: 'var(--secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>{registeredUsersCount}</div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Alumnos Activos Ahora</span>
              <Wifi size={20} style={{ color: '#4ade80' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4ade80', marginTop: '8px' }}>{onlineUsersCount}</div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Promedio Global Tests</span>
              <Award size={20} style={{ color: '#60a5fa' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>{averageGlobalScore}</div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Códigos Activados</span>
              <Key size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' }}>{usedCodesCount} / {totalCodesCount}</div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Listado de Estudiantes y Material Entregado</h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar por nombre, email o código..."
                style={{ padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Estudiante</th>
                  <th style={{ padding: '10px' }}>Código Libro</th>
                  <th style={{ padding: '10px' }}>Material Entregado (Versión Física)</th>
                  <th style={{ padding: '10px' }}>Estado</th>
                  <th style={{ padding: '10px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(u => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '700' }}>{u.name || 'Sin nombre'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{u.bookCode || u.code || '—'}</td>

                    {/* Columna de Asignación de Material Entregado */}
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '55px' }}>Temario:</span>
                          <select
                            value={u.assignedEditions?.temario || ''}
                            onChange={(e) => handleAssignUserMaterial(u.uid, 'temario', e.target.value)}
                            style={{ flex: 1, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.73rem', outline: 'none' }}
                          >
                            <option value="">Sin Asignar</option>
                            {editions.filter(ed => ed.type === 'temario').map(ed => (
                              <option key={ed.id} value={ed.id}>{ed.versionTag} - {ed.title.substring(0, 18)}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '55px' }}>Tests:</span>
                          <select
                            value={u.assignedEditions?.test || ''}
                            onChange={(e) => handleAssignUserMaterial(u.uid, 'test', e.target.value)}
                            style={{ flex: 1, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.73rem', outline: 'none' }}
                          >
                            <option value="">Sin Asignar</option>
                            {editions.filter(ed => ed.type === 'test').map(ed => (
                              <option key={ed.id} value={ed.id}>{ed.versionTag} - {ed.title.substring(0, 18)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '10px' }}>
                      {isUserOnline(u) ? (
                        <span style={{ color: '#4ade80', fontWeight: '700' }}>● En línea</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Desconectado</span>
                      )}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isUserOnline(u) && (
                          <button onClick={() => handleKickUser(u.uid, u.name)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Cerrar Sesión
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(u.uid, u.name)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: EDICIONES IMPRESAS */}
      {activeSubTab === 'editions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={20} style={{ color: 'var(--secondary)' }} />
                  <span>Control de Ediciones y Versiones Registradas</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Gestión de PDFs oficiales registrados al imprimir. Puedes editar notas, machacar/sobrescribir contenidos o borrar ediciones.
                </p>
              </div>

              {/* Filtro por tipo */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'temario', 'test', 'simulacro'].map(t => (
                  <button
                    key={t}
                    onClick={() => setEditionFilter(t)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: editionFilter === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: editionFilter === t ? '#fff' : 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t === 'all' ? 'Todas' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Ediciones */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {editions.filter(e => editionFilter === 'all' || e.type === editionFilter).length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  No se han registrado ediciones todavía. Al imprimir un Temario, Test o Simulacro como Admin, usa la opción "Registrar Nueva Edición".
                </div>
              ) : (
                editions.filter(e => editionFilter === 'all' || e.type === editionFilter).map(ed => {
                  const assignedCount = users.filter(u => Object.values(u.assignedEditions || {}).includes(ed.id)).length;
                  return (
                    <div key={ed.id} className="glass-panel" style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '6px', background: ed.type === 'temario' ? 'rgba(59,130,246,0.2)' : ed.type === 'test' ? 'rgba(234,179,8,0.2)' : 'rgba(16,185,129,0.2)', color: ed.type === 'temario' ? '#60a5fa' : ed.type === 'test' ? '#fde047' : '#34d399' }}>
                            {ed.type}
                          </span>
                          <h4 style={{ margin: '6px 0 2px 0', fontSize: '1rem', color: '#fff' }}>{ed.versionTag} — {ed.title}</h4>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Creada: {new Date(ed.createdAt).toLocaleDateString()} ({ed.topicCount} temas)</span>
                        </div>

                        <button
                          onClick={() => handleDeleteEdition(ed.id, ed.versionTag)}
                          style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', padding: '5px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Eliminar edición"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#4ade80', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: '6px', width: 'fit-content', fontWeight: '700' }}>
                        👥 Asignada a {assignedCount} alumno(s)
                      </div>

                      {editingEditionId === ed.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                          <textarea
                            value={editNotesText}
                            onChange={(e) => setEditNotesText(e.target.value)}
                            placeholder="Notas internas / cambios..."
                            rows={2}
                            style={{ padding: '6px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.8rem' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingEditionId(null)} className="btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Cancelar</button>
                            <button onClick={() => handleUpdateEditionNotes(ed)} className="glow-btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Guardar</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', position: 'relative' }}>
                          <strong>Notas de imprenta:</strong> {ed.notes || 'Sin notas.'}
                          <button
                            onClick={() => { setEditingEditionId(ed.id); setEditNotesText(ed.notes || ''); }}
                            style={{ position: 'absolute', right: '6px', top: '6px', background: 'transparent', border: 'none', color: 'var(--primary-light)', cursor: 'pointer' }}
                            title="Editar notas"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      )}

                      {/* Gestor de PDF Adjunto para Imprenta */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                        {ed.pdfUrl ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <a
                              href={ed.pdfUrl}
                              download={
                                (ed.pdfFileName || `${ed.title || 'Edicion'}_${ed.versionTag}`).toLowerCase().endsWith('.pdf')
                                  ? (ed.pdfFileName || `${ed.title || 'Edicion'}_${ed.versionTag}`)
                                  : `${ed.pdfFileName || ed.title || `Edicion_${ed.versionTag}_${ed.type.toUpperCase()}`}.pdf`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glow-btn"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                            >
                              <Download size={14} />
                              <span>📥 Descargar PDF ({ed.pdfFileName ? (ed.pdfFileName.length > 16 ? ed.pdfFileName.substring(0, 16) + '...' : ed.pdfFileName) : ed.versionTag})</span>
                            </a>

                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} className="btn-ghost" title="Reemplazar archivo PDF">
                              <input
                                type="file"
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={(e) => handleUploadEditionPdf(ed, e.target.files[0])}
                              />
                              <Upload size={13} style={{ color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reemplazar</span>
                            </label>
                          </div>
                        ) : (
                          <label style={{ cursor: uploadingPdfId === ed.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: uploadingPdfId === ed.id ? 'rgba(234,179,8,0.15)' : 'rgba(59,130,246,0.12)', border: uploadingPdfId === ed.id ? '1px dashed #eab308' : '1px dashed #3b82f6', padding: '6px 12px', borderRadius: '8px', color: uploadingPdfId === ed.id ? '#fde047' : '#60a5fa', fontSize: '0.78rem', fontWeight: '600', width: 'fit-content' }}>
                            <Upload size={14} className={uploadingPdfId === ed.id ? 'spin-icon' : ''} />
                            <span>{uploadingPdfId === ed.id ? '⏳ Subiendo PDF...' : '📎 Adjuntar Archivo PDF para Imprenta'}</span>
                            <input
                              type="file"
                              accept=".pdf"
                              disabled={uploadingPdfId === ed.id}
                              style={{ display: 'none' }}
                              onChange={(e) => handleUploadEditionPdf(ed, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: FE DE ERRATAS / GESTIÓN DE MODIFICACIONES */}
      {activeSubTab === 'modifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Formulario de creación */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={20} style={{ color: 'var(--primary-light)' }} />
              <span>Registrar Hoja de Modificación / Fe de Erratas (Anexo)</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Redacta una corrección o actualización de un tema y selecciona qué Ediciones Impresas están afectadas para notificar automáticamente a los alumnos.
            </p>

            {modMsg && (
              <div style={{ padding: '10px 14px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{modMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveModification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tipo de Material:</label>
                  <select
                    value={modForm.materialType}
                    onChange={(e) => setModForm({ ...modForm, materialType: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="temario">Temario</option>
                    <option value="test">Cuaderno de Tests</option>
                    <option value="simulacro">Simulacros</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tema Afectado:</label>
                  <select
                    value={modForm.topicId}
                    onChange={(e) => setModForm({ ...modForm, topicId: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    {activeTopicList.map(t => (
                      <option key={t.id} value={t.id}>Tema {t.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Epígrafe / Punto Concreto:</label>
                  <input
                    type="text"
                    placeholder="Ej. Art. 14 Sanciones por retraso"
                    value={modForm.sectionTitle}
                    onChange={(e) => setModForm({ ...modForm, sectionTitle: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Título del Cambio / Modificación:</label>
                <input
                  type="text"
                  placeholder="Ej. Corrección en los plazos del Préstamo Intercampus"
                  value={modForm.title}
                  onChange={(e) => setModForm({ ...modForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Resumen Explicativo del Cambio Normativo:</label>
                <textarea
                  placeholder="Explica qué ha cambiado o qué errata se subsana..."
                  value={modForm.summaryText}
                  onChange={(e) => setModForm({ ...modForm, summaryText: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Enlace / URL a PDF Anexo (Opcional):</label>
                <input
                  type="text"
                  placeholder="https://... o ruta al archivo anexo"
                  value={modForm.pdfAttachmentUrl}
                  onChange={(e) => setModForm({ ...modForm, pdfAttachmentUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              {/* Selección de Ediciones Impresas Afectadas */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--secondary-light)', marginBottom: '6px' }}>
                  Marcar Ediciones Impresas Afectadas (Solo los alumnos con estas ediciones recibirán la notificación):
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {editions.filter(e => e.type === modForm.materialType).length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No hay ediciones de tipo {modForm.materialType.toUpperCase()} registradas para seleccionar.</span>
                  ) : (
                    editions.filter(e => e.type === modForm.materialType).map(ed => {
                      const isChecked = modForm.affectedEditionIds.includes(ed.id);
                      return (
                        <label key={ed.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isChecked ? 'rgba(59,130,246,0.2)' : 'transparent', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', border: isChecked ? '1px solid #3b82f6' : '1px solid transparent' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAffectedEdition(ed.id)}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>{ed.versionTag} — {ed.title}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={savingMod}
                  className="glow-btn"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  <Send size={16} />
                  <span>{savingMod ? 'Registrando...' : '📢 Guardar y Notificar a Alumnos Afectados'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Listado de Modificaciones Registradas */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', fontSize: '1rem' }}>Historial de Fe de Erratas y Anexos Registrados</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '0.85rem' }}>
                  No se ha registrado ninguna hoja de modificación ni fe de erratas.
                </div>
              ) : (
                modifications.map(m => (
                  <div key={m.id} className="glass-panel" style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'rgba(234,179,8,0.2)', color: '#fde047', padding: '2px 8px', borderRadius: '6px' }}>
                          Tema {m.topicId} ({m.materialType.toUpperCase()})
                        </span>
                        {m.sectionTitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {m.sectionTitle}</span>}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 style={{ margin: '4px 0', color: '#fff', fontSize: '0.95rem' }}>{m.title}</h4>
                      <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.4' }}>{m.summaryText}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteModification(m.id, m.title)}
                      style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Eliminar modificación"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}


      {activeSubTab === 'codes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* Listado de códigos */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setCodeFilter('all')}
                  className={`tab-btn ${codeFilter === 'all' ? 'active' : ''}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    background: codeFilter === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: 'var(--text-main)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Todos ({totalCodesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCodeFilter('unused')}
                  className={`tab-btn ${codeFilter === 'unused' ? 'active' : ''}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    background: codeFilter === 'unused' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: 'var(--text-main)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Disponibles ({unusedCodesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCodeFilter('used')}
                  className={`tab-btn ${codeFilter === 'used' ? 'active' : ''}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    background: codeFilter === 'used' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: 'var(--text-main)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Activados ({usedCodesCount})
                </button>
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar código o usuario..."
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '500px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', background: 'rgba(0,0,0,0.1)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'center', width: '95px' }}>Asignado</th>
                    <th style={{ padding: '10px 16px', width: '180px' }}>Entregado a</th>
                    <th style={{ padding: '10px 16px' }}>Código de Activación</th>
                    <th style={{ padding: '10px 16px' }}>Estado</th>
                    <th style={{ padding: '10px 16px' }}>Activado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Ningún código coincide con el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((c) => {
                      const userWhoActivated = c.used ? users.find(u => u.uid === c.usedBy) : null;
                      return (
                        <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!c.assigned || !!c.used}
                              disabled={!!c.used}
                              onChange={async (e) => {
                                const isAssigned = e.target.checked;
                                try {
                                  await firebaseService.updateBookCodeAssignedStatus(c.code, isAssigned);
                                } catch (err) {
                                  console.error(err);
                                  alert("No se pudo actualizar el estado de asignación.");
                                }
                              }}
                              style={{
                                width: '16px',
                                height: '16px',
                                cursor: c.used ? 'not-allowed' : 'pointer',
                                accentColor: 'var(--secondary)'
                              }}
                              title={c.used ? "Este código ya ha sido registrado por un alumno" : "Marcar como entregado con el manual impreso"}
                            />
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <input
                              type="text"
                              placeholder="Ej. Julio Gomez"
                              defaultValue={c.assignedTo || ''}
                              disabled={!!c.used}
                              onBlur={async (e) => {
                                const assignedToVal = e.target.value.trim();
                                if (assignedToVal !== (c.assignedTo || '')) {
                                  try {
                                    await firebaseService.updateBookCodeAssignedTo(c.code, assignedToVal);
                                  } catch (err) {
                                    console.error(err);
                                    alert("No se pudo actualizar el destinatario.");
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.target.blur();
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: c.used ? 'transparent' : 'rgba(0,0,0,0.3)',
                                border: c.used ? 'none' : '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                fontSize: '0.8rem',
                                cursor: c.used ? 'not-allowed' : 'text',
                                outline: 'none'
                              }}
                              title={c.used ? "Este código ya está en uso" : "Introduce el nombre o seudónimo del destinatario"}
                            />
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {c.code}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            {c.used ? (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Activado</span>
                            ) : c.assigned || c.assignedTo ? (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Asignado</span>
                            ) : (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Disponible</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 16px', color: c.used ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {c.used ? (
                              userWhoActivated ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '700' }}>{userWhoActivated.name}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userWhoActivated.email}</span>
                                </div>
                              ) : (
                                <span>ID: {c.usedBy.substring(0, 10)}...</span>
                              )
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generador Panel */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Generador de Códigos</h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, lineHeight: '1.4' }}>
              Genera nuevos códigos de activación (lotes de 1 a 200) para los manuales impresos.
            </p>

            <form onSubmit={handleGenerateCodes} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={codesCount}
                onChange={(e) => setCodesCount(parseInt(e.target.value, 10))}
                min={1}
                max={200}
                style={{ width: '80px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
              />
              <button type="submit" disabled={generating} style={{ padding: '6px 14px', background: 'var(--secondary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                {generating ? 'Generando...' : 'Generar Lote'}
              </button>
            </form>

            {generatedCodes.length > 0 && (
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: '#fef08a', fontSize: '0.8rem' }}>¡Lote generado!</span>
                  <button type="button" onClick={handleCopyGeneratedCodes} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}>
                    {copiedCodes ? '¡Copiados!' : 'Copiar'}
                  </button>
                </div>
                <div style={{ maxHeight: '100px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#fff', whiteSpace: 'pre-wrap' }}>
                  {generatedCodes.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: MONITOR DE TIEMPO, DIAGNÓSTICO Y CONSEJOS (EXCLUSIVO ADMIN) */}
      {activeSubTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Box */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', color: '#34d399', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} />
                  <span>📊 Monitor de Tiempo & Diagnóstico Pedagógico por Alumno</span>
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '750px', lineHeight: '1.4' }}>
                  Control de dedicación acumulada en lectura de temario y realización de cuestionarios en segundo plano. Úsalo para detectar puntos débiles y enviar recomendaciones personalizadas de estudio. <strong>(Herramienta 100% invisible para los estudiantes)</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => firebaseService.getAllActivityData().then(data => setActivityData(data || {}))}
                style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} />
                <span>Actualizar Tiempos</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          {(() => {
            let totalStudySec = 0;
            let totalQuizSec = 0;
            let activeCount = 0;
            let topStudent = null;
            let maxTotalSec = -1;

            users.forEach(u => {
              const act = activityData[u.uid] || {};
              const sSec = act.studySeconds || (u.totalStudyTime ? u.totalStudyTime * 60 : 0);
              const qSec = act.quizSeconds || 0;
              const totSec = sSec + qSec;

              totalStudySec += sSec;
              totalQuizSec += qSec;
              if (totSec > 0) activeCount++;
              if (totSec > maxTotalSec && u.role !== 'admin') {
                maxTotalSec = totSec;
                topStudent = u.name || u.email;
              }
            });

            const formatHoursMins = (totalSec) => {
              const hrs = Math.floor(totalSec / 3600);
              const mins = Math.floor((totalSec % 3600) / 60);
              if (hrs === 0 && mins === 0) return '0m';
              if (hrs === 0) return `${mins}m`;
              return `${hrs}h ${mins}m`;
            };

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>📚 Tiempo Lectura Temario</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#60a5fa', marginTop: '4px' }}>{formatHoursMins(totalStudySec)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>Total acumulado academia</div>
                </div>

                <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>📝 Tiempo en Tests</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fba518', marginTop: '4px' }}>{formatHoursMins(totalQuizSec)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>Total ejercitación práctica</div>
                </div>

                <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>⏱️ Media / Alumno Activo</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
                    {formatHoursMins(activeCount > 0 ? Math.round((totalStudySec + totalQuizSec) / activeCount) : 0)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>En {activeCount} alumnos activos</div>
                </div>

                <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #ec4899' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>🏆 Mayor Dedicación</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f472b6', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topStudent || 'Sin actividad'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)', marginTop: '2px' }}>
                    {maxTotalSec > 0 ? formatHoursMins(maxTotalSec) : '—'}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Student Activity Table */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Detalle de Dedicación y Diagnóstico por Alumno</h3>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  style={{ padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Alumno</th>
                    <th style={{ padding: '10px' }}>Código Libro</th>
                    <th style={{ padding: '10px' }}>⏱️ Temario</th>
                    <th style={{ padding: '10px' }}>📝 Tests</th>
                    <th style={{ padding: '10px' }}>🎯 Cuestionarios & Media</th>
                    <th style={{ padding: '10px' }}>📅 Última Actividad</th>
                    <th style={{ padding: '10px' }}>🚦 Diagnóstico</th>
                    <th style={{ padding: '10px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map(u => {
                    const act = activityData[u.uid] || {};
                    const studySec = act.studySeconds || (u.totalStudyTime ? u.totalStudyTime * 60 : 0);
                    const quizSec = act.quizSeconds || 0;
                    const lastActive = act.lastActiveAt ? new Date(act.lastActiveAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Sin registros';

                    const formatSec = (sec) => {
                      const h = Math.floor(sec / 3600);
                      const m = Math.floor((sec % 3600) / 60);
                      if (h === 0 && m === 0) return '0m';
                      if (h === 0) return `${m}m`;
                      return `${h}h ${m}m`;
                    };

                    const testsCount = u.quizzesTaken || u.completedCount || 0;
                    const avgPct = Math.round(u.averageQuizScore || 0);

                    // Compute quick status diagnosis
                    let statusLabel = '🟢 Buen ritmo';
                    let statusBg = 'rgba(16, 185, 129, 0.15)';
                    let statusColor = '#34d399';

                    if (studySec < 600 && testsCount === 0) {
                      statusLabel = '⚪ Sin inicio';
                      statusBg = 'rgba(148, 163, 184, 0.15)';
                      statusColor = '#94a3b8';
                    } else if (studySec > 3600 && testsCount === 0) {
                      statusLabel = '🟡 Requiere tests';
                      statusBg = 'rgba(245, 158, 11, 0.15)';
                      statusColor = '#fbbf24';
                    } else if (avgPct > 0 && avgPct < 60) {
                      statusLabel = '🔴 Reforzar conceptos';
                      statusBg = 'rgba(239, 68, 68, 0.15)';
                      statusColor = '#fca5a5';
                    }

                    return (
                      <tr key={u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: '700' }}>{u.name || 'Sin nombre'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{u.bookCode || u.code || '—'}</td>
                        <td style={{ padding: '10px', fontWeight: '700', color: '#60a5fa' }}>{formatSec(studySec)}</td>
                        <td style={{ padding: '10px', fontWeight: '700', color: '#fba518' }}>{formatSec(quizSec)}</td>
                        <td style={{ padding: '10px' }}>
                          <div><strong>{testsCount}</strong> tests completados</div>
                          <div style={{ fontSize: '0.75rem', color: avgPct >= 70 ? '#34d399' : avgPct >= 50 ? '#fbbf24' : '#fca5a5' }}>
                            Media: {avgPct}% aciertos
                          </div>
                        </td>
                        <td style={{ padding: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lastActive}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: statusBg, color: statusColor }}>
                            {statusLabel}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDiagnostic(u)}
                            style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Sparkles size={13} />
                            <span>Analizar & Aconsejar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drawer / Modal de Diagnóstico Pedagógico del Alumno Seleccionado */}
          {selectedStudentForDiagnostic && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <div className="glass-panel" style={{ background: '#0f172a', border: '1.5px solid #10b981', borderRadius: '16px', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#34d399', fontWeight: '800', letterSpacing: '1px' }}>Ficha de Diagnóstico Pedagógico del Preparador</span>
                    <h3 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '1.3rem' }}>{selectedStudentForDiagnostic.name || selectedStudentForDiagnostic.email}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Código Libro: {selectedStudentForDiagnostic.bookCode || 'Sin asignación'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForDiagnostic(null);
                      setCopiedAdvisorMsg(false);
                    }}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {(() => {
                  const student = selectedStudentForDiagnostic;
                  const act = activityData[student.uid] || {};
                  const sSec = act.studySeconds || (student.totalStudyTime ? student.totalStudyTime * 60 : 0);
                  const qSec = act.quizSeconds || 0;
                  const topicScores = act.topicScores || {};

                  const formatHoursMins = (sec) => {
                    const h = Math.floor(sec / 3600);
                    const m = Math.floor((sec % 3600) / 60);
                    if (h === 0) return `${m} min`;
                    return `${h}h ${m}m`;
                  };

                  // Find weak topics (<60% avg)
                  const weakTopicIds = [];
                  topics.forEach(t => {
                    const tScoreData = topicScores[t.id.toString()];
                    if (tScoreData && tScoreData.scores && tScoreData.scores.length > 0) {
                      const avg = tScoreData.scores.reduce((a, b) => a + b, 0) / tScoreData.scores.length;
                      if (avg < 60) weakTopicIds.push(t.id);
                    }
                  });

                  // Generate personalized advice letter
                  const studentFirstName = (student.name || 'opositor/a').split(' ')[0];
                  let adviceText = `Hola ${studentFirstName},\n\n`;
                  adviceText += `Revisando tu seguimiento en la plataforma de la academia:\n`;
                  adviceText += `• Dedicación en lectura de temario: ${formatHoursMins(sSec)}\n`;
                  adviceText += `• Dedicación en ejercitación de tests: ${formatHoursMins(qSec)}\n`;

                  if (weakTopicIds.length > 0) {
                    adviceText += `• Puntos que debemos reforzar prioritariamente: Tema(s) ${weakTopicIds.join(', ')}.\n\n`;
                    adviceText += `Pauta recomendada: Te aconsejo repasar los conceptos clave de estos temas y realizar 2 simulacros cortos de 20 preguntas antes del próximo bloque. ¡Mucho ánimo y a por la plaza!`;
                  } else if (qSec < 900) {
                    adviceText += `\nVeo que estás avanzando muy bien con la lectura de la norma, pero es esencial incrementar la práctica con cuestionarios tipo test para entrenar la velocidad y la técnica de descarte.\n\n`;
                    adviceText += `Pauta recomendada: Realiza al menos 1 simulacro aleatorio de 40 preguntas cada dos días para consolidar el temario. ¡Sigue así!`;
                  } else {
                    adviceText += `\n¡Excelente nivel de constancia y equilibrio entre teoría y tests! Mantienes un ritmo idóneo para la convocatoria.\n\n`;
                    adviceText += `Pauta recomendada: Continúa con los simulacros semanales de 40 preguntas para afianzar la memoria a largo plazo. ¡A por todas!`;
                  }

                  const handleCopyAdvice = () => {
                    navigator.clipboard.writeText(adviceText);
                    setCopiedAdvisorMsg(true);
                    setTimeout(() => setCopiedAdvisorMsg(false), 3000);
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Metric Summary Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Tiempo Temario</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#60a5fa' }}>{formatHoursMins(sSec)}</span>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Tiempo Tests</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fba518' }}>{formatHoursMins(qSec)}</span>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Nota Media Tests</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399' }}>{Math.round(student.averageQuizScore || 0)}%</span>
                        </div>
                      </div>

                      {/* Topic Scores Breakdown */}
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '0.95rem', margin: '0 0 10px 0' }}>📊 Rendimiento y Práctica por Tema (Temas 1 al 20)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {topics.map(t => {
                            const tScoreData = topicScores[t.id.toString()];
                            const count = tScoreData ? tScoreData.count : 0;
                            const scores = tScoreData ? tScoreData.scores : [];
                            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

                            let bg = 'rgba(255,255,255,0.03)';
                            let border = 'rgba(255,255,255,0.08)';
                            let badgeColor = 'var(--text-muted)';

                            if (avg !== null) {
                              if (avg >= 75) {
                                bg = 'rgba(16, 185, 129, 0.12)';
                                border = 'rgba(16, 185, 129, 0.3)';
                                badgeColor = '#34d399';
                              } else if (avg >= 60) {
                                bg = 'rgba(245, 158, 11, 0.12)';
                                border = 'rgba(245, 158, 11, 0.3)';
                                badgeColor = '#fbbf24';
                              } else {
                                bg = 'rgba(239, 68, 68, 0.15)';
                                border = 'rgba(239, 68, 68, 0.4)';
                                badgeColor = '#fca5a5';
                              }
                            }

                            return (
                              <div key={t.id} style={{ background: bg, border: `1px solid ${border}`, padding: '8px 10px', borderRadius: '8px', fontSize: '0.78rem' }}>
                                <div style={{ fontWeight: '700', color: '#fff' }}>Tema {t.id}</div>
                                <div style={{ fontSize: '0.72rem', color: badgeColor, marginTop: '2px' }}>
                                  {avg !== null ? `${avg}% (${count} tests)` : 'Sin intentos'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Automated Personalized Advice Generator */}
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Send size={15} />
                            <span>Pauta de Recomendación Sugerida para el Alumno</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyAdvice}
                            style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Copy size={13} />
                            <span>{copiedAdvisorMsg ? '¡Pauta Copiada!' : 'Copiar Pauta'}</span>
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={adviceText}
                          style={{ width: '100%', height: '140px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0', padding: '10px', fontSize: '0.82rem', fontFamily: 'inherit', lineHeight: '1.4', outline: 'none', resize: 'none' }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}





    </div>
  );
}
