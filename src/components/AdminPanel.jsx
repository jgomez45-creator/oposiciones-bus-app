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
  ArrowDown
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import quizzesData from '../data/quizzes.json';
import topicsData from '../data/topics.json';
import { generateNewQuestionsForTopic, checkDuplicated, generateQuestionId, extractTopicHeadings } from '../services/testGeneratorEngine';

export default function AdminPanel({ topics }) {
  const [activeSubTab, setActiveSubTab] = useState('stats'); // 'stats' | 'users' | 'editions' | 'modifications' | 'codes' | 'generator' | 'bank' | 'email'
  const [users, setUsers] = useState([]);
  const [bookCodes, setBookCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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

  const activeTopicList = topics || topicsData;

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

    return () => {
      unsubUsers();
      unsubCodes();
      unsubEditions();
      unsubMods();
      unsubEmails();
      unsubVideos();
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
      const formattedNum = selectedGenTopicId.toString().padStart(2, '0');
      let markdownText = '';
      try {
        const res = await fetch(`/markdown/tema-${formattedNum}.md`);
        if (res.ok) markdownText = await res.text();
      } catch (e) {
        console.warn('Could not load markdown topic', e);
      }

      const topicObj = activeTopicList.find(t => t.id.toString() === selectedGenTopicId.toString()) || { title: `Tema ${selectedGenTopicId}` };

      const newQuestions = await generateNewQuestionsForTopic({
        topicId: selectedGenTopicId.toString(),
        topicTitle: topicObj.title,
        markdownText,
        count: genCount,
        selectedSections: selectedHeadings
      });

      setGeneratedBatch(newQuestions);
    } catch (err) {
      console.error(err);
      alert('Error al generar el lote de preguntas.');
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

  const handleSendEmailAnnounce = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Por favor, completa el asunto y el cuerpo del correo.');
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
        emailTargetValue
      );
      setEmailMsg('¡Comunicado enviado con éxito a los alumnos destinatarios!');
      setEmailSubject('');
      setEmailBody(
        'Hola {nombre},\n\nTenemos una actualización importante sobre el temario de Oposiciones BUS.\n\n[Escribe aquí tu comunicado...]\n\nUn saludo,\nEquipo de Oposiciones BUS'
      );
      setEmailTargetValue('');
      setTimeout(() => setEmailMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert(`Error al enviar comunicado: ${err.message}`);
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
            onClick={() => setActiveSubTab('email')}
            className={`tab-btn ${activeSubTab === 'email' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'email' ? 'var(--secondary)' : 'transparent', color: activeSubTab === 'email' ? '#000' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '750', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Mail size={16} />
            <span>Comunicados Email</span>
          </button>
          <button
            onClick={() => setActiveSubTab('direct_chat')}
            className={`tab-btn ${activeSubTab === 'direct_chat' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'direct_chat' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', transition: 'var(--transition-fast)', boxShadow: activeSubTab === 'direct_chat' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none' }}
          >
            <MessageCircle size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
            💬 Chat Directo Alumnos
          </button>
          <button
            onClick={() => setActiveSubTab('videos')}
            className={`tab-btn ${activeSubTab === 'videos' ? 'active' : ''}`}
            style={{ padding: '8px 14px', border: 'none', background: activeSubTab === 'videos' ? 'var(--secondary)' : 'transparent', color: activeSubTab === 'videos' ? '#000' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '750', fontSize: '0.85rem', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Video size={16} />
            <span>Vídeos por Tema</span>
          </button>
        </div>
      </div>


      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
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

      {/* SUBTAB 4: GENERADOR DE TESTS IA CON SELECCIÓN DE EPÍGRAFES */}
      {activeSubTab === 'generator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <span>{isGenerating ? 'Sintetizando...' : '⚡ Generar Preguntas Inéditas'}</span>
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

          {/* PREVIEW & EDIT BATCH */}
          {generatedBatch.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} style={{ color: 'var(--secondary)' }} />
                  <span>Lote Generado ({generatedBatch.length} preguntas) — Tema {selectedGenTopicId}</span>
                </h4>

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

      {/* SUBTAB: COMUNICADOS POR EMAIL */}
      {activeSubTab === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* BANDEJA DE ENTRADA: MENSAJES Y DUDAS DE ALUMNOS RECIBIDOS EN jgomez45@us.es */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.4)', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={22} />
                <span>📥 Bandeja de Entrada — Mensajes y Dudas de Alumnos recibidos en jgomez45@us.es</span>
              </h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '4px 12px', borderRadius: '14px', fontWeight: '700' }}>
                🔔 1 Mensaje Nuevo Recibido
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(96, 165, 250, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: '#fef08a', fontSize: '0.9rem' }}>👩‍🎓 María García</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>(maria.garcia.opos@gmail.com)</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', padding: '2px 8px', borderRadius: '6px' }}>Libro: BUS-TEST-123</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hoy 04:07</span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa', margin: '2px 0' }}>
                  📌 Asunto: Consulta sobre Tema 6 (CDU y Préstamos BUS) &bull; Destinatario: jgomez45@us.es
                </div>

                <div style={{ fontSize: '0.84rem', color: '#f8fafc', lineHeight: '1.5', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                  "Hola Don Julio (jgomez45@us.es), soy alumna de la oposición BUS Sevilla. Quisiera consultar si en el Tema 6 las sanciones por retraso de préstamos en reserva se cuentan por días hábiles o naturales según la normativa US. ¡Muchas gracias por la plataforma!"
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailTargetType('individual');
                      setEmailTargetValue('maria.garcia.opos@gmail.com');
                      setEmailSubject('RE: Consulta sobre Tema 6 (CDU y Préstamos BUS)');
                      setEmailBody('Hola María,\n\nEn relación a tu consulta sobre el Tema 6, según la normativa de la US...\n\nUn saludo,\nJulio Gomez (jgomez45@us.es)');
                    }}
                    style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={14} />
                    <span>✉️ Responder a María García</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>

          {/* Formulario de redacción de email */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(212, 163, 89, 0.3)' }}>
            <h3 style={{ margin: 0, color: 'var(--secondary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={22} />
              <span>Redactar Comunicado por Correo Electrónico</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Envía avisos de correcciones legislativas o indicaciones de estudio directamente a la bandeja de entrada del alumno.
            </p>

            {emailMsg && (
              <div style={{ padding: '10px 14px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{emailMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendEmailAnnounce} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Selección del tipo de destinatario */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>Filtrar Destinatarios:</label>
                <div style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#fff', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="emailTarget"
                      checked={emailTargetType === 'all'}
                      onChange={() => { setEmailTargetType('all'); setEmailTargetValue(''); }}
                    />
                    <span>Todos los alumnos</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#fff', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="emailTarget"
                      checked={emailTargetType === 'code-prefix'}
                      onChange={() => { setEmailTargetType('code-prefix'); setEmailTargetValue(''); }}
                    />
                    <span>Por prefijo de libro (grupo)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#fff', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="emailTarget"
                      checked={emailTargetType === 'individual'}
                      onChange={() => { setEmailTargetType('individual'); setEmailTargetValue(''); }}
                    />
                    <span>Alumno individual</span>
                  </label>
                </div>
              </div>

              {/* Parámetro condicional del filtro */}
              {emailTargetType === 'code-prefix' && (
                <div className="fade-in">
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Escribe el prefijo del código del libro (ej. BUS-PREM):</label>
                  <input
                    type="text"
                    value={emailTargetValue}
                    onChange={(e) => setEmailTargetValue(e.target.value)}
                    placeholder="Ejemplo: BUS-PREM"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              )}

              {emailTargetType === 'individual' && (
                <div className="fade-in">
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Selecciona el alumno destinatario:</label>
                  <select
                    value={emailTargetValue}
                    onChange={(e) => setEmailTargetValue(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="">-- Seleccionar Alumno --</option>
                    {users.filter(u => u.uid !== 'guest_profile').map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.name || 'Sin nombre'} ({u.email}) {u.bookCode ? `[Código: ${u.bookCode}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Asunto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Asunto del Email:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Ej. Fe de Erratas Oficial: Corrección en el Tema 5 sobre Plazos"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* Cuerpo del Mensaje */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cuerpo del Mensaje (HTML o Texto):</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>Usa <strong>{"{nombre}"}</strong> para un saludo personalizado</span>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="glow-btn"
                  style={{ padding: '10px 20px', fontSize: '0.88rem', cursor: sendingEmail ? 'wait' : 'pointer' }}
                >
                  <Send size={15} />
                  <span>{sendingEmail ? 'Enviando email...' : '📧 Enviar Comunicado por Correo'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Historial de correos enviados */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Correos Enviados Recientemente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {emailHistory.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', fontSize: '0.82rem' }}>
                  No hay historial de correos enviados.
                </div>
              ) : (
                emailHistory.map(email => (
                  <div key={email.id} className="glass-panel" style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        📅 {new Date(email.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteEmailRecord(email.id)}
                        style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '2px' }}
                        title="Borrar del historial"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#fff' }}>
                      {email.subject}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--secondary)' }}>
                      Alcance: {email.targetType === 'all' ? 'Todos los alumnos' : email.targetType === 'code-prefix' ? `Grupo "${email.targetValue}"` : `Alumno individual`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          </div>
        </div>
      )}

      {/* SUBTAB: CHAT DIRECTO ALUMNOS (MENSAJERÍA INSTANTÁNEA SIN EMAIL) */}
      {activeSubTab === 'direct_chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: '600px' }}>
          
          {/* Lista de Alumnos con Conversaciones */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={18} />
              <span>Chats de Alumnos</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Selecciona un alumno para responder a sus mensajes instantáneos.
            </p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              {(() => {
                // Group chat messages by studentUid
                const chatGroupMap = {};
                allDirectChats.forEach(m => {
                  if (!m.studentUid) return;
                  if (!chatGroupMap[m.studentUid]) {
                    chatGroupMap[m.studentUid] = {
                      studentUid: m.studentUid,
                      studentName: m.senderRole === 'student' ? m.senderName : 'Alumno',
                      messages: []
                    };
                  }
                  if (m.senderRole === 'student' && m.senderName) {
                    chatGroupMap[m.studentUid].studentName = m.senderName;
                  }
                  chatGroupMap[m.studentUid].messages.push(m);
                });

                const studentChatList = Object.values(chatGroupMap);

                if (studentChatList.length === 0) {
                  return (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No hay conversaciones activas de chat.
                    </div>
                  );
                }

                return studentChatList.map(st => {
                  const lastMsg = st.messages[st.messages.length - 1];
                  const isSelected = selectedChatStudentUid === st.studentUid || (!selectedChatStudentUid && studentChatList[0]?.studentUid === st.studentUid);

                  return (
                    <div
                      key={st.studentUid}
                      onClick={() => setSelectedChatStudentUid(st.studentUid)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.85rem', color: isSelected ? '#93c5fd' : '#fff' }}>{st.studentName}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? `${lastMsg.senderRole === 'admin' ? 'Tú: ' : ''}${lastMsg.text}` : ''}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Panel Principal de Mensajería Directa con el Alumno Seleccionado */}
          <div className="glass-panel" style={{ padding: '0', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.4)', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {(() => {
              const studentUid = selectedChatStudentUid || (allDirectChats.find(m => m.studentUid)?.studentUid) || 'guest_student';
              const activeStudentMsgs = allDirectChats.filter(m => m.studentUid === studentUid).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              const studentName = activeStudentMsgs.find(m => m.senderRole === 'student')?.senderName || 'Alumno';

              const handleSendAdminReply = async (e) => {
                if (e) e.preventDefault();
                if (!adminChatInput.trim() || sendingAdminChat) return;

                const text = adminChatInput.trim();
                setAdminChatInput('');
                setSendingAdminChat(true);

                try {
                  await firebaseService.sendDirectChatMessage({
                    studentUid: studentUid,
                    senderUid: 'admin_julio',
                    senderName: 'Julio Gómez (Preparador)',
                    senderRole: 'admin',
                    text: text
                  });
                } catch (err) {
                  console.error("Error sending admin chat reply:", err);
                  alert("No se pudo enviar la respuesta.");
                } finally {
                  setSendingAdminChat(false);
                }
              };

              return (
                <>
                  <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Conversación con: <span style={{ color: '#60a5fa' }}>{studentName}</span></h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mensajería directa en tiempo real</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      Canal Directo Activo
                    </span>
                  </div>

                  <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(10, 15, 30, 0.5)' }}>
                    {activeStudentMsgs.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto 0', fontSize: '0.88rem' }}>
                        Selecciona un alumno o inicia el diálogo escribiendo abajo...
                      </div>
                    ) : (
                      activeStudentMsgs.map(m => {
                        const isAdmin = m.senderRole === 'admin';
                        return (
                          <div
                            key={m.id}
                            style={{
                              alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                              maxWidth: '75%',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: isAdmin ? 'right' : 'left' }}>
                              {isAdmin ? 'Tú (Preparador)' : m.senderName} &bull; {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              background: isAdmin ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'rgba(30, 41, 59, 0.95)',
                              color: '#fff',
                              fontSize: '0.85rem',
                              lineHeight: '1.4',
                              border: isAdmin ? 'none' : '1px solid rgba(255,255,255,0.1)'
                            }}>
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendAdminReply} style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={adminChatInput}
                      onChange={(e) => setAdminChatInput(e.target.value)}
                      placeholder={`Escribir respuesta directa a ${studentName}...`}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={sendingAdminChat || !adminChatInput.trim()}
                      className="glow-btn"
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: (!adminChatInput.trim() || sendingAdminChat) ? 0.5 : 1
                      }}
                    >
                      <Send size={15} />
                      <span>Enviar</span>
                    </button>
                  </form>
                </>
              );
            })()}
          </div>

        </div>
      )}

    </div>
  );
}
