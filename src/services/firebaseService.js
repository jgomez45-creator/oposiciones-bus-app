import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

// Check if we should run in Mock Simulator Mode
const projectID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
// If admin forces raw simulation or if there is no setup project ID
const isMock = localStorage.getItem('force_real_db') === 'false' || !projectID || projectID === 'tu_project_id';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAuBS58f2eNqaeGIc10zyQwgjxgm2StgBg';
// Automatically correct the '8g' -> 'Bg' typo if it exists in the environment variable
const apiKey = rawApiKey && rawApiKey.endsWith('8g')
  ? rawApiKey.substring(0, rawApiKey.length - 2) + 'Bg'
  : rawApiKey;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'oposiciones-bus-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'oposiciones-bus-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'oposiciones-bus-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '306671821699',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:306671821699:web:58c7be6781ab25c5230cb6'
};

let auth = null;
let db = null;
let storage = null;

if (!isMock) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });
    try {
      storage = getStorage(app);
    } catch (storageErr) {
      console.warn("Storage warning:", storageErr);
    }
    console.log("Firebase initialized in REAL CLOUD MODE with Auto-Detect Long-Polling and Storage.");
  } catch (e) {
    console.error("Error initializing Firebase App. Falling back to MOCK MODE.", e);
  }
} else {
  console.log("Firebase running in MOCK SIMULATOR MODE. LocalStorage will simulate cloud sync.");
}

// Timeout helper for Firebase queries to prevent indefinite hanging
const withTimeout = (promise, ms, errorMessage = "Tiempo de espera agotado en la red. Comprueba tu conexión.") => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

// --- MOCK PERSISTENCE HELPERS ---
const INITIAL_MOCK_CODES = {
  'BUS-TEST-123': { used: false, usedBy: null },
  'BUS-DEMO-456': { used: false, usedBy: null },
  'BUS-GUEST-789': { used: false, usedBy: null },
  'BUS-ADMIN-2026': { used: false, usedBy: null }
};

const DEFAULT_MOCK_VIDEOS = {
  '1': [
    {
      id: 'v_1_1',
      title: 'Parte 1: Presentación y Marco Normativo de la BUS',
      url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      duration: '14 min',
      description: 'Explicación completa del Reglamento de la Biblioteca de la Universidad de Sevilla, funciones y estructura organizativa.'
    },
    {
      id: 'v_1_2',
      title: 'Parte 2: Normas de Préstamo y Uso de Instalaciones',
      url: 'https://www.youtube.com/watch?v=2vjPBrBU-TM',
      duration: '18 min',
      description: 'Análisis detallado del sistema de préstamo, sanciones, renovación de carnés y acceso a las salas de la BUS.'
    }
  ],
  '2': [
    {
      id: 'v_2_1',
      title: 'Parte 1: Modelo EFQM de Excelencia y Cartas de Servicios',
      url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      duration: '15 min',
      description: 'Conceptos fundamentales de la gestión de la calidad aplicada a las bibliotecas universitarias y sellos EFQM.'
    }
  ]
};

const getMockBookCodes = () => {
  const saved = localStorage.getItem('mock_db_book_codes');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('mock_db_book_codes', JSON.stringify(INITIAL_MOCK_CODES));
  return INITIAL_MOCK_CODES;
};

const saveMockBookCodes = (codes) => {
  localStorage.setItem('mock_db_book_codes', JSON.stringify(codes));
};

const getMockUsers = () => {
  const saved = localStorage.getItem('mock_db_users');
  const users = saved ? JSON.parse(saved) : {};
  // Enforce default mock admin credential
  const adminEmail = 'a@a.com';
  const adminUid = 'mock_admin_default';
  if (!Object.values(users).some(u => u.email.toLowerCase() === adminEmail)) {
    users[adminUid] = {
      uid: adminUid,
      name: 'Creador (Admin)',
      email: adminEmail,
      password: 'a',
      bookCode: 'BUS-ADMIN-2026',
      role: 'admin',
      currentSessionId: null,
      lastActive: new Date().toISOString()
    };
    localStorage.setItem('mock_db_users', JSON.stringify(users));
  }
  return users;
};

const saveMockUsers = (users) => {
  localStorage.setItem('mock_db_users', JSON.stringify(users));
};

// --- EXPORTED SERVICE INTERFACE ---
export const firebaseService = {
  /**
   * Register a new user with Email, Password and Book Activation Code
   */
  async registerUser(name, email, password, bookCode) {
    const cleanCode = bookCode.trim().toUpperCase();
    const isAdminCode = cleanCode === 'BUS-ADMIN-2026';

    if (isMock) {
      // 1. Validate book code in mock database
      const mockCodes = getMockBookCodes();
      if (!mockCodes[cleanCode] && !isAdminCode) {
        throw new Error("El código de activación del libro es inválido.");
      }
      if (!isAdminCode && mockCodes[cleanCode] && mockCodes[cleanCode].used) {
        throw new Error("Este código de libro ya ha sido registrado por otro usuario.");
      }

      // 2. Validate email availability
      const mockUsers = getMockUsers();
      const emailExists = Object.values(mockUsers).some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        throw new Error("Este correo electrónico ya está registrado.");
      }

      // 3. Create simulated user
      const uid = 'mock_uid_' + Math.random().toString(36).substring(2, 9);
      const newUser = {
        uid,
        name,
        email: email.toLowerCase(),
        password, // Simulating, never store plaintext passwords in real production
        bookCode: cleanCode,
        currentSessionId: null,
        role: isAdminCode ? 'admin' : 'student',
        lastActive: new Date().toISOString()
      };

      mockUsers[uid] = newUser;
      saveMockUsers(mockUsers);

      // 4. Mark book code as used and assigned (skip if admin)
      if (!isAdminCode && mockCodes[cleanCode]) {
        mockCodes[cleanCode] = {
          ...mockCodes[cleanCode],
          used: true,
          usedBy: uid,
          assigned: true
        };
        saveMockBookCodes(mockCodes);
      }

      return { uid, name, email: newUser.email, bookCode: cleanCode, role: newUser.role };
    } else {
      // REAL FIREBASE LOGIC
      // 1. Verify book code in Firestore (skip if admin)
      const codeRef = doc(db, 'book_codes', cleanCode);

      if (!isAdminCode) {
        const codeSnap = await withTimeout(
          getDoc(codeRef),
          10000,
          "No se pudo verificar el código del libro en la base de datos (tiempo de espera agotado)."
        );

        if (!codeSnap.exists()) {
          throw new Error("El código de activación del libro es inválido.");
        }

        const codeData = codeSnap.data();
        if (codeData.used) {
          throw new Error("Este código de libro ya ha sido registrado por otro usuario.");
        }
      }

      // 2. Create Auth user
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, email, password),
        12000,
        "No se pudo crear la cuenta de usuario en Firebase (tiempo de espera agotado)."
      );
      const uid = userCredential.user.uid;

      // 3. Create user profile in Firestore
      await withTimeout(
        setDoc(doc(db, 'users', uid), {
          name,
          email: email.toLowerCase(),
          bookCode: cleanCode,
          currentSessionId: null,
          role: isAdminCode ? 'admin' : 'student',
          lastActive: new Date().toISOString()
        }),
        10000,
        "No se pudo crear tu perfil de usuario en la base de datos (tiempo de espera agotado)."
      );

      // 4. Mark code as used and assigned in Firestore (skip if admin)
      if (!isAdminCode) {
        try {
          await withTimeout(
            updateDoc(codeRef, {
              used: true,
              usedBy: uid,
              assigned: true
            }),
            10000,
            "No se pudo marcar el código del libro como utilizado (tiempo de espera agotado)."
          );
        } catch (codeErr) {
          console.warn("Aviso: El usuario se creó correctamente, pero no se pudo actualizar el estado del código en la colección 'book_codes' (comprobar reglas de Firestore):", codeErr);
        }
      }

      return { uid, name, email: email.toLowerCase(), bookCode: cleanCode, role: isAdminCode ? 'admin' : 'student' };
    }
  },

  /**
   * Log in an existing user with Email and Password
   */
  async loginUser(email, password) {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);

    // Special bypass for quick developer admin access (works in both mock and real mode)
    if (email.toLowerCase() === 'a@a.com' && password === 'a') {
      return {
        user: {
          uid: 'mock_admin_default',
          name: 'Creador (Admin)',
          email: 'a@a.com',
          bookCode: 'BUS-ADMIN-2026',
          role: 'admin'
        },
        sessionId
      };
    }

    if (isMock) {
      const mockUsers = getMockUsers();
      const matchedUser = Object.values(mockUsers).find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!matchedUser) {
        throw new Error("Correo electrónico o contraseña incorrectos.");
      }

      // Set session ID to enforce single login
      matchedUser.currentSessionId = sessionId;
      matchedUser.lastActive = new Date().toISOString();
      mockUsers[matchedUser.uid] = matchedUser;
      saveMockUsers(mockUsers);

      // Trigger local storage event for mock active session listener
      localStorage.setItem(`mock_session_changed_${matchedUser.uid}`, sessionId);

      return {
        user: {
          uid: matchedUser.uid,
          name: matchedUser.name,
          email: matchedUser.email,
          bookCode: matchedUser.bookCode,
          role: matchedUser.role || (matchedUser.bookCode === 'BUS-ADMIN-2026' ? 'admin' : 'student')
        },
        sessionId
      };
    } else {
      // REAL FIREBASE LOGIC
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, email, password),
        12000,
        "No se pudo autenticar en el servidor de Firebase (tiempo de espera agotado)."
      );
      const uid = userCredential.user.uid;

      // Fetch user profile name
      let userData = { name: email.split('@')[0], email: email.toLowerCase(), bookCode: 'UNKNOWN', role: 'student' };
      try {
        const userSnap = await withTimeout(
          getDoc(doc(db, 'users', uid)),
          5000,
          "No se pudo obtener la información de tu perfil de usuario (tiempo de espera agotado)."
        );
        if (userSnap.exists()) {
          userData = userSnap.data();
        }
      } catch (err) {
        console.warn("Could not read user profile from Firestore, using cached/default details:", err.message);
        const cachedUser = localStorage.getItem('opos_current_user');
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            if (parsed.uid === uid) {
              userData = parsed;
            }
          } catch (e) {
            console.error("Error reading cached user data:", e);
          }
        }
      }

      // Write session ID and update last active to Firestore to force logout other devices
      try {
        await withTimeout(
          updateDoc(doc(db, 'users', uid), {
            currentSessionId: sessionId,
            lastActive: new Date().toISOString()
          }),
          4000,
          "Time out"
        );
      } catch (err) {
        console.warn("Bypassing concurrent session restriction due to write lock/quota exceeded:", err.message);
      }

      return {
        user: {
          uid,
          name: userData.name,
          email: userData.email || email.toLowerCase(),
          bookCode: userData.bookCode || 'BUS-ACTIVATED',
          role: userData.role || 'student'
        },
        sessionId
      };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email) {
    if (isMock) {
      const mockUsers = getMockUsers();
      const matchedUser = Object.values(mockUsers).find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!matchedUser) {
        throw new Error("No existe ningún usuario registrado con este correo.");
      }
      console.log(`[Mock Mode] Correo de recuperación de contraseña enviado a: ${email}`);
      return;
    } else {
      await sendPasswordResetEmail(auth, email);
    }
  },

  /**
   * Log out current user
   */
  async logoutUser(uid) {
    if (isMock) {
      if (uid) {
        const mockUsers = getMockUsers();
        if (mockUsers[uid]) {
          mockUsers[uid].currentSessionId = null;
          saveMockUsers(mockUsers);
        }
      }
      return;
    } else {
      if (auth.currentUser) {
        // Clear session ID in Firestore
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          currentSessionId: null
        });
        await signOut(auth);
      }
    }
  },

  /**
   * Listen to active session changes in database. 
   * If sessionId changes on another device, calls onConcurrentSession
   */
  subscribeToSession(uid, localSessionId, onConcurrentSession) {
    if (isMock) {
      const handleStorageChange = (e) => {
        if (e.key === `mock_session_changed_${uid}`) {
          const newSessionId = e.newValue;
          if (newSessionId && newSessionId !== localSessionId) {
            onConcurrentSession();
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      // Also set a backup polling check in case it's in the same tab
      const interval = setInterval(() => {
        const mockUsers = getMockUsers();
        const user = mockUsers[uid];
        if (user && user.currentSessionId && user.currentSessionId !== localSessionId) {
          onConcurrentSession();
        }
      }, 3000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    } else {
      // REAL FIREBASE SNAPSHOT LISTENER
      const userRef = doc(db, 'users', uid);
      return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.currentSessionId && data.currentSessionId !== localSessionId) {
            onConcurrentSession();
          }
        }
      }, (error) => {
        console.error("Error en la suscripción de sesión en la nube:", error);
      });
    }
  },

  /**
   * Save user's study progress
   */
  async saveUserProgress(uid, progressData) {
    // Always save to local storage as a robust offline backup
    localStorage.setItem(`local_backup_progress_${uid}`, JSON.stringify(progressData));

    if (isMock || uid === 'mock_admin_default') {
      localStorage.setItem(`mock_progress_${uid}`, JSON.stringify(progressData));
      return;
    } else {
      // Save to Firestore (attempt it but catch and suppress errors/timeouts to prevent blocking)
      try {
        const progressRef = doc(db, 'progress', uid);
        await withTimeout(
          setDoc(progressRef, {
            topicsProgress: progressData,
            lastUpdated: new Date()
          }, { merge: true }),
          4000,
          "Write timeout"
        );
      } catch (err) {
        console.warn("Could not sync progress to Firestore (quota exceeded or offline). Progress saved locally.", err.message);
      }
    }
  },

  /**
   * Listen to or fetch user's study progress
   */
  subscribeToUserProgress(uid, onProgressUpdate) {
    if (isMock || uid === 'mock_admin_default') {
      const saved = localStorage.getItem(`mock_progress_${uid}`);
      if (saved) {
        try {
          onProgressUpdate(JSON.parse(saved));
        } catch (e) {
          console.error(e);
          onProgressUpdate({});
        }
      } else {
        onProgressUpdate({});
      }
      return () => { }; // return empty unsubscribe
    } else {
      // REAL FIREBASE SNAPSHOT
      // First, immediately load the local backup if it exists, so the UI is populated instantly
      const localBackup = localStorage.getItem(`local_backup_progress_${uid}`);
      if (localBackup) {
        try {
          onProgressUpdate(JSON.parse(localBackup));
        } catch (e) {
          console.error("Error parsing local backup progress:", e);
        }
      }

      const progressRef = doc(db, 'progress', uid);
      return onSnapshot(progressRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.topicsProgress) {
            onProgressUpdate(data.topicsProgress);
            // Sync local backup with the latest from cloud
            localStorage.setItem(`local_backup_progress_${uid}`, JSON.stringify(data.topicsProgress));
          } else {
            if (!localBackup) onProgressUpdate({});
          }
        } else {
          if (!localBackup) onProgressUpdate({});
        }
      }, (error) => {
        console.error("Error al obtener progreso de la nube:", error);
        if (!localBackup) {
          onProgressUpdate({});
        }
      });
    }
  },

  /**
   * Listen to all users and their aggregated progress/activity
   */
  subscribeToAllUsers(onUpdate, onError) {
    const getProgressForUser = (userId) => {
      const key = isMock ? `mock_progress_${userId}` : `local_backup_progress_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      return {};
    };

    if (isMock) {
      const updateFunc = () => {
        const mockUsers = getMockUsers();
        const userList = Object.values(mockUsers).map(u => {
          const userProg = getProgressForUser(u.uid);
          let totalStudyTime = 0;
          let allScores = [];
          let completedCount = 0;

          Object.values(userProg).forEach(tp => {
            if (tp.studyTime) totalStudyTime += tp.studyTime;
            if (tp.status === 'Completado' || tp.status === 'Estudiado') completedCount++;
            if (tp.quizScores && Array.isArray(tp.quizScores)) {
              allScores.push(...tp.quizScores);
            }
          });

          const avgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

          return {
            ...u,
            totalStudyTime,
            averageQuizScore: avgScore,
            completedCount,
            quizzesTaken: allScores.length
          };
        });
        onUpdate(userList);
      };

      updateFunc();
      const interval = setInterval(updateFunc, 3000);
      window.addEventListener('storage', updateFunc);
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', updateFunc);
      };
    } else {
      // REAL FIREBASE LOGIC
      let usersSnapshot = [];
      let progressSnapshot = {};

      const combineAndEmit = () => {
        const combined = usersSnapshot.map(u => {
          const userProg = progressSnapshot[u.uid] || {};
          let totalStudyTime = 0;
          let allScores = [];
          let completedCount = 0;

          Object.values(userProg).forEach(tp => {
            if (tp.studyTime) totalStudyTime += tp.studyTime;
            if (tp.status === 'Completado' || tp.status === 'Estudiado') completedCount++;
            if (tp.quizScores && Array.isArray(tp.quizScores)) {
              allScores.push(...tp.quizScores);
            }
          });

          const avgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

          return {
            ...u,
            totalStudyTime,
            averageQuizScore: avgScore,
            completedCount,
            quizzesTaken: allScores.length
          };
        });
        onUpdate(combined);
      };

      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        usersSnapshot = [];
        snapshot.forEach(doc => {
          usersSnapshot.push({ uid: doc.id, ...doc.data() });
        });
        combineAndEmit();
      }, (err) => {
        console.error("Error subscribing to users", err);
        if (onError) onError(err);
      });

      const unsubProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
        progressSnapshot = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.topicsProgress) {
            progressSnapshot[doc.id] = data.topicsProgress;
          }
        });
        combineAndEmit();
      }, (err) => {
        console.error("Error subscribing to progress", err);
        if (onError) onError(err);
      });

      return () => {
        unsubUsers();
        unsubProgress();
      };
    }
  },

  /**
   * Listen to all book codes
   */
  subscribeToAllBookCodes(onUpdate, onError) {
    if (isMock) {
      const updateFunc = () => {
        const mockCodes = getMockBookCodes();
        const codesList = Object.entries(mockCodes).map(([code, data]) => ({
          code,
          ...data
        }));
        onUpdate(codesList);
      };
      updateFunc();
      const interval = setInterval(updateFunc, 3000);
      window.addEventListener('storage', updateFunc);
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', updateFunc);
      };
    } else {
      return onSnapshot(collection(db, 'book_codes'), (snapshot) => {
        const codesList = [];
        snapshot.forEach(doc => {
          codesList.push({ code: doc.id, ...doc.data() });
        });
        onUpdate(codesList);
      }, (err) => {
        console.error("Error subscribing to book codes", err);
        if (onError) onError(err);
      });
    }
  },

  /**
   * Kick out user session (resets currentSessionId to null)
   */
  async kickUserSession(uid) {
    if (isMock) {
      const mockUsers = getMockUsers();
      if (mockUsers[uid]) {
        mockUsers[uid].currentSessionId = null;
        saveMockUsers(mockUsers);
        localStorage.setItem(`mock_session_changed_${uid}`, 'kicked_' + Date.now());
      }
    } else {
      await updateDoc(doc(db, 'users', uid), {
        currentSessionId: null
      });
    }
  },

  /**
   * Delete user profile (from Firestore or Mock storage)
   */
  async deleteUser(uid) {
    if (isMock) {
      const mockUsers = getMockUsers();
      if (mockUsers[uid]) {
        delete mockUsers[uid];
        saveMockUsers(mockUsers);
      }
      localStorage.removeItem(`local_backup_progress_${uid}`);
    } else {
      await deleteDoc(doc(db, 'users', uid));
      try {
        await deleteDoc(doc(db, 'progress', uid));
      } catch (e) {
        console.warn('Progress document not found or could not be deleted:', e);
      }
    }
  },

  /**
   * Actualiza la preferencia de notificaciones por email de un alumno
   */
  async updateUserEmailNotifications(uid, active) {
    if (isMock || uid === 'mock_admin_default') {
      const mockUsers = getMockUsers();
      if (mockUsers[uid]) {
        mockUsers[uid].emailNotificationsActive = active;
        saveMockUsers(mockUsers);
      }
      // Also update stored current user session if it's the current user
      const currentUserSaved = localStorage.getItem('opos_current_user');
      if (currentUserSaved) {
        try {
          const parsed = JSON.parse(currentUserSaved);
          if (parsed.uid === uid) {
            parsed.emailNotificationsActive = active;
            localStorage.setItem('opos_current_user', JSON.stringify(parsed));
          }
        } catch (e) {
          console.error(e);
        }
      }
      return;
    } else {
      try {
        const userRef = doc(db, 'users', uid);
        await withTimeout(
          updateDoc(userRef, {
            emailNotificationsActive: active
          }),
          4000,
          "Update timeout"
        );
      } catch (err) {
        console.warn("Could not sync email preference to Firestore.", err.message);
      }
    }
  },

  /**
   * Generate new book activation codes
   */
  async generateNewBookCodes(count) {
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const randomSegment = (len) => {
        let segment = '';
        for (let i = 0; i < len; i++) {
          segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return segment;
      };
      return `BUS-${randomSegment(4)}-${randomSegment(4)}`;
    };

    if (isMock) {
      const mockCodes = getMockBookCodes();
      const newCodes = [];
      for (let i = 0; i < count; i++) {
        const code = generateCode();
        mockCodes[code] = { used: false, usedBy: null, assigned: false, assignedTo: "", createdAt: new Date().toISOString() };
        newCodes.push(code);
      }
      saveMockBookCodes(mockCodes);
      return newCodes;
    } else {
      const newCodes = [];
      for (let i = 0; i < count; i++) {
        const code = generateCode();
        await setDoc(doc(db, 'book_codes', code), {
          used: false,
          usedBy: null,
          assigned: false,
          assignedTo: "",
          createdAt: new Date()
        });
        newCodes.push(code);
      }
      return newCodes;
    }
  },

  /**
   * Update assigned status of a book code
   */
  async updateBookCodeAssignedStatus(code, assigned) {
    if (isMock) {
      const mockCodes = getMockBookCodes();
      if (mockCodes[code]) {
        mockCodes[code].assigned = assigned;
        saveMockBookCodes(mockCodes);
      }
    } else {
      await updateDoc(doc(db, 'book_codes', code), {
        assigned: assigned
      });
    }
  },

  /**
   * Update the person the book code was assigned to
   */
  async updateBookCodeAssignedTo(code, assignedTo) {
    if (isMock) {
      const mockCodes = getMockBookCodes();
      if (mockCodes[code]) {
        mockCodes[code].assignedTo = assignedTo;
        saveMockBookCodes(mockCodes);
      }
    } else {
      await updateDoc(doc(db, 'book_codes', code), {
        assignedTo: assignedTo
      });
    }
  },

  /**
   * Create a new temporary demo session (online guest profile)
   */
  async createDemoSession() {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    const guestNum = Math.floor(1000 + Math.random() * 9000);

    if (isMock) {
      const uid = 'demo_uid_' + Math.random().toString(36).substring(2, 9);
      const newUser = {
        uid,
        name: `Invitado #${guestNum}`,
        email: `demo_${guestNum}@oposicionesbus.com`,
        bookCode: 'DEMO-INVITADO',
        role: 'guest',
        currentSessionId: sessionId,
        lastActive: new Date().toISOString()
      };
      const mockUsers = getMockUsers();
      mockUsers[uid] = newUser;
      saveMockUsers(mockUsers);
      return { user: newUser, sessionId };
    } else {
      // 1. Sign in anonymously first to get a valid Auth credentials and UID (with 15s timeout to prevent infinite hanging)
      const userCredential = await withTimeout(
        signInAnonymously(auth),
        15000,
        "No se pudo iniciar sesión anónima en Firebase (tiempo de espera agotado)."
      );
      const uid = userCredential.user.uid;

      const newUser = {
        uid,
        name: `Invitado #${guestNum}`,
        email: `demo_${guestNum}@oposicionesbus.com`,
        bookCode: 'DEMO-INVITADO',
        role: 'guest',
        currentSessionId: sessionId,
        lastActive: new Date().toISOString()
      };

      // 2. Write the user profile to Firestore (with 15s timeout)
      await withTimeout(
        setDoc(doc(db, 'users', uid), newUser),
        15000,
        "No se pudo crear el perfil demo en el servidor (tiempo de espera agotado)."
      );
      return { user: newUser, sessionId };
    }
  },

  /**
   * Update last active time for user
   */
  async updateUserActiveTime(uid) {
    if (isMock) {
      const mockUsers = getMockUsers();
      if (mockUsers[uid]) {
        mockUsers[uid].lastActive = new Date().toISOString();
        saveMockUsers(mockUsers);
      }
    } else {
      try {
        await updateDoc(doc(db, 'users', uid), {
          lastActive: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Failed to update last active time", e.message);
      }
    }
  },

  /* ==========================================================================
     SISTEMA DE CONTROL DE EDICIONES Y GESTIÓN DE MODIFICACIONES (ANEXOS)
     ========================================================================== */

  /**
   * Obtiene o suscribe las ediciones de materiales (Temarios, Tests, Simulacros)
   */
  subscribeToMaterialEditions(callback) {
    if (isMock) {
      const getEditionsList = () => {
        const saved = localStorage.getItem('mock_db_material_editions');
        return saved ? Object.values(JSON.parse(saved)) : [];
      };
      callback(getEditionsList());
      const handleStorage = (e) => {
        if (e.key === 'mock_db_material_editions') {
          callback(getEditionsList());
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } else {
      return onSnapshot(collection(db, 'material_editions'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      }, (err) => {
        console.error("Error subscribing to material_editions", err);
      });
    }
  },

  /**
   * Guarda o sobrescribe una edición de material
   */
  async saveMaterialEdition(edition) {
    const now = new Date().toISOString();
    const id = edition.id || (`ed_${edition.type}_${edition.versionTag.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`);
    const record = {
      id,
      type: edition.type, // 'temario' | 'test' | 'simulacro'
      versionTag: edition.versionTag, // ej. 'V1.0', 'V1.1'
      title: edition.title || `Edición ${edition.versionTag}`,
      notes: edition.notes || '',
      pdfUrl: edition.pdfUrl || '',
      pdfFileName: edition.pdfFileName || '',
      topicCount: edition.topicCount || 20,
      createdAt: edition.createdAt || now,
      updatedAt: now
    };

    if (isMock) {
      const saved = localStorage.getItem('mock_db_material_editions');
      const map = saved ? JSON.parse(saved) : {};
      map[id] = record;
      localStorage.setItem('mock_db_material_editions', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
      return record;
    } else {
      await setDoc(doc(db, 'material_editions', id), record, { merge: true });
      return record;
    }
  },

  /**
   * Sube un archivo PDF de edición (Intenta Firebase Storage primero, o fallback a Base64 si es pequeño)
   */
  async uploadEditionPdfFile(edition, file) {
    if (!file) throw new Error("No se ha seleccionado ningún archivo.");

    let downloadUrl = '';

    // Intentar subir a Firebase Storage si está disponible
    if (!isMock && storage) {
      try {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const storageRef = ref(storage, `editions_pdfs/${edition.id}_${Date.now()}_${cleanFileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        downloadUrl = await getDownloadURL(snapshot.ref);
      } catch (storageErr) {
        console.warn("No se pudo subir a Firebase Storage, intentando fallback Base64...", storageErr);
      }
    }

    // Fallback: Si no hay URL de Storage y el archivo es menor a 850 KB, usar Base64 Data URL
    if (!downloadUrl) {
      if (file.size > 850 * 1024) {
        throw new Error(
          `El archivo pesa ${(file.size / (1024 * 1024)).toFixed(2)} MB, lo que supera el límite de 1 MB de la base de datos Firestore.\n\n` +
          `Para subir archivos PDF grandes, activa las reglas de escritura en Firebase Storage en tu consola de Firebase.`
        );
      }

      downloadUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    }

    // Guardar el registro en la edición
    return await this.saveMaterialEdition({
      ...edition,
      pdfUrl: downloadUrl,
      pdfFileName: file.name
    });
  },

  /**
   * Elimina una edición de material
   */
  async deleteMaterialEdition(editionId) {
    if (isMock) {
      const saved = localStorage.getItem('mock_db_material_editions');
      const map = saved ? JSON.parse(saved) : {};
      delete map[editionId];
      localStorage.setItem('mock_db_material_editions', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
    } else {
      await deleteDoc(doc(db, 'material_editions', editionId));
    }
  },

  /**
   * Asigna una edición física de material a la ficha de un usuario
   */
  async assignUserMaterialEdition(userId, materialType, editionId) {
    if (isMock) {
      const saved = localStorage.getItem('mock_db_users');
      const users = saved ? JSON.parse(saved) : {};
      if (users[userId]) {
        if (!users[userId].assignedEditions) {
          users[userId].assignedEditions = {};
        }
        users[userId].assignedEditions[materialType] = editionId;
        localStorage.setItem('mock_db_users', JSON.stringify(users));
      }
    } else {
      await updateDoc(doc(db, 'users', userId), {
        [`assignedEditions.${materialType}`]: editionId
      });
    }
  },

  /**
   * Obtiene o suscribe a las modificaciones y anexos (Fe de Erratas)
   */
  subscribeToMaterialModifications(callback) {
    if (isMock) {
      const getModsList = () => {
        const saved = localStorage.getItem('mock_db_material_modifications');
        return saved ? Object.values(JSON.parse(saved)) : [];
      };
      callback(getModsList());
      const handleStorage = (e) => {
        if (e.key === 'mock_db_material_modifications') {
          callback(getModsList());
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } else {
      return onSnapshot(collection(db, 'material_modifications'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      }, (err) => {
        console.error("Error subscribing to material_modifications", err);
      });
    }
  },

  /**
   * Registra una modificación / hoja de fe de erratas
   */
  async saveMaterialModification(modData) {
    const now = new Date().toISOString();
    const id = modData.id || (`mod_${Date.now()}`);
    const record = {
      id,
      materialType: modData.materialType || 'temario', // 'temario' | 'test' | 'simulacro'
      topicId: Number(modData.topicId || 1),
      sectionTitle: modData.sectionTitle || '',
      title: modData.title || 'Modificación / Anexo',
      summaryText: modData.summaryText || '',
      pdfAttachmentUrl: modData.pdfAttachmentUrl || '',
      affectedEditionIds: modData.affectedEditionIds || [],
      createdAt: modData.createdAt || now
    };

    if (isMock) {
      const saved = localStorage.getItem('mock_db_material_modifications');
      const map = saved ? JSON.parse(saved) : {};
      map[id] = record;
      localStorage.setItem('mock_db_material_modifications', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
      return record;
    } else {
      await setDoc(doc(db, 'material_modifications', id), record, { merge: true });
      return record;
    }
  },

  /**
   * Elimina una modificación
   */
  async deleteMaterialModification(modId) {
    if (isMock) {
      const saved = localStorage.getItem('mock_db_material_modifications');
      const map = saved ? JSON.parse(saved) : {};
      delete map[modId];
      localStorage.setItem('mock_db_material_modifications', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
    } else {
      await deleteDoc(doc(db, 'material_modifications', modId));
    }
  },

  /* ==========================================================================
     SISTEMA DE ENTRENAMIENTO Y APRENDIZAJE DEL AGENTE BUS
     ========================================================================== */

  /**
   * Registra una pregunta sin cobertura o votada negativamente
   */
  async saveUnresolvedDuda(queryText) {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;
    const id = `unres_${cleanQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').substring(0, 50)}_${Date.now()}`;
    const record = {
      id,
      queryText: cleanQuery,
      createdAt: new Date().toISOString(),
      count: 1
    };

    if (isMock) {
      const saved = localStorage.getItem('mock_db_bus_unresolved');
      const map = saved ? JSON.parse(saved) : {};
      const existing = Object.values(map).find(item => item.queryText.toLowerCase() === cleanQuery.toLowerCase());
      if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.lastRequestedAt = new Date().toISOString();
      } else {
        map[id] = { ...record, lastRequestedAt: record.createdAt };
      }
      localStorage.setItem('mock_db_bus_unresolved', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
    } else {
      try {
        const docRef = doc(db, 'agente_bus_unresolved', id);
        await setDoc(docRef, record, { merge: true });
      } catch (err) {
        console.warn("Failed to save unresolved query in Firestore:", err.message);
      }
    }
  },

  /**
   * Escucha la colección de preguntas no resueltas (para el AdminPanel de entrenamiento)
   */
  subscribeToUnresolvedDudas(callback) {
    if (isMock) {
      const getList = () => {
        const saved = localStorage.getItem('mock_db_bus_unresolved');
        if (!saved) {
          const sample = {
            'unres_test_maria': {
              id: 'unres_test_maria',
              queryText: 'Duda Alumna (María García -> jgomez45@us.es): ¿Las sanciones por retraso de préstamos en reserva se cuentan por días hábiles o naturales según la normativa US?',
              createdAt: new Date().toISOString(),
              count: 1,
              lastRequestedAt: new Date().toISOString()
            }
          };
          localStorage.setItem('mock_db_bus_unresolved', JSON.stringify(sample));
          return Object.values(sample);
        }
        return Object.values(JSON.parse(saved));
      };
      callback(getList());
      const handleStorage = (e) => {
        if (e.key === 'mock_db_bus_unresolved') {
          callback(getList());
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } else {
      return onSnapshot(collection(db, 'agente_bus_unresolved'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      }, (err) => {
        console.error("Error subscribing to agente_bus_unresolved:", err);
      });
    }
  },

  /**
   * Guarda una respuesta entrenada y remueve la duda sin resolver
   */
  async saveTrainedAnswer(dudaId, queryText, answerText) {
    const cleanQuery = queryText.trim();
    const cleanAnswer = answerText.trim();
    const id = `trained_${cleanQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').substring(0, 50)}`;
    const record = {
      id,
      queryText: cleanQuery,
      answerText: cleanAnswer,
      updatedAt: new Date().toISOString()
    };

    if (isMock) {
      const savedTrained = localStorage.getItem('mock_db_bus_trained');
      const trainedMap = savedTrained ? JSON.parse(savedTrained) : {};
      trainedMap[id] = record;
      localStorage.setItem('mock_db_bus_trained', JSON.stringify(trainedMap));

      if (dudaId) {
        const savedUnresolved = localStorage.getItem('mock_db_bus_unresolved');
        if (savedUnresolved) {
          const unresolvedMap = JSON.parse(savedUnresolved);
          delete unresolvedMap[dudaId];
          localStorage.setItem('mock_db_bus_unresolved', JSON.stringify(unresolvedMap));
        }
      }
      window.dispatchEvent(new Event('storage'));
    } else {
      await setDoc(doc(db, 'agente_bus_trained_answers', id), record, { merge: true });
      if (dudaId) {
        try {
          await deleteDoc(doc(db, 'agente_bus_unresolved', dudaId));
        } catch (err) {
          console.warn("Failed to delete unresolved doubt:", err.message);
        }
      }
    }
  },

  /**
   * Escucha la lista de respuestas entrenadas
   */
  subscribeToTrainedAnswers(callback) {
    if (isMock) {
      const getList = () => {
        const saved = localStorage.getItem('mock_db_bus_trained');
        return saved ? Object.values(JSON.parse(saved)) : [];
      };
      callback(getList());
      const handleStorage = (e) => {
        if (e.key === 'mock_db_bus_trained') {
          callback(getList());
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } else {
      return onSnapshot(collection(db, 'agente_bus_trained_answers'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      }, (err) => {
        console.error("Error subscribing to agente_bus_trained_answers:", err);
      });
    }
  },

  /**
   * Elimina una respuesta entrenada
   */
  async deleteTrainedAnswer(trainedId) {
    if (isMock) {
      const saved = localStorage.getItem('mock_db_bus_trained');
      const map = saved ? JSON.parse(saved) : {};
      delete map[trainedId];
      localStorage.setItem('mock_db_bus_trained', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
    } else {
      await deleteDoc(doc(db, 'agente_bus_trained_answers', trainedId));
    }
  },

  /**
   * Elimina una pregunta no resuelta sin contestar (descarta)
   */
  async deleteUnresolvedDuda(dudaId) {
    if (isMock) {
      const saved = localStorage.getItem('mock_db_bus_unresolved');
      const map = saved ? JSON.parse(saved) : {};
      delete map[dudaId];
      localStorage.setItem('mock_db_bus_unresolved', JSON.stringify(map));
      window.dispatchEvent(new Event('storage'));
    } else {
      await deleteDoc(doc(db, 'agente_bus_unresolved', dudaId));
    }
  },

  /**
   * Envía un comunicado por email agregando registros a Firestore (mail trigger) o Local Mock
   */
  async sendAdminEmailAnnounce(subject, bodyHtml, targetType, targetValue = '') {
    const now = new Date().toISOString();
    const id = `email_${Date.now()}`;
    const announcementRecord = {
      id,
      subject,
      bodyHtml,
      targetType, // 'all' | 'code-prefix' | 'individual'
      targetValue,
      createdAt: now
    };

    // 1. Obtener la lista de usuarios y filtrar los que tienen desactivadas las notificaciones de correo
    let targetUsers = [];
    if (isMock) {
      const mockUsers = getMockUsers();
      targetUsers = Object.values(mockUsers);
    } else {
      const snapshot = await getDocs(collection(db, 'users'));
      snapshot.forEach(docSnap => {
        targetUsers.push({ uid: docSnap.id, ...docSnap.data() });
      });
    }

    // Filtrar los usuarios que tengan explícitamente emailNotificationsActive === false
    targetUsers = targetUsers.filter(u => u.emailNotificationsActive !== false);

    // Filtrar según el tipo de destinatario
    if (targetType === 'code-prefix') {
      const prefix = targetValue.toUpperCase();
      targetUsers = targetUsers.filter(u => u.bookCode && u.bookCode.toUpperCase().startsWith(prefix));
    } else if (targetType === 'individual') {
      targetUsers = targetUsers.filter(u => u.uid === targetValue || u.email === targetValue);
    }

    // Si no hay usuarios válidos, lanzar error
    if (targetUsers.length === 0) {
      throw new Error("No hay usuarios destinatarios que cumplan con los filtros de búsqueda o que tengan activado el boletín de correo.");
    }

    // 2. Procesar el histórico del comunicado
    if (isMock) {
      const savedAnnouncements = localStorage.getItem('mock_db_email_announcements') || '{}';
      const announcementsMap = JSON.parse(savedAnnouncements);
      announcementsMap[id] = announcementRecord;
      localStorage.setItem('mock_db_email_announcements', JSON.stringify(announcementsMap));

      // Simular envíos escribiendo a localStorage 'mock_sent_emails'
      const savedEmails = localStorage.getItem('mock_sent_emails') || '[]';
      const emailsList = JSON.parse(savedEmails);

      targetUsers.forEach(u => {
        const personalizedHtml = bodyHtml.replace(/{nombre}/g, u.name || 'Alumno');
        emailsList.push({
          id: `mail_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
          to: u.email,
          subject,
          html: personalizedHtml,
          sentAt: now,
          status: 'simulado'
        });
      });
      localStorage.setItem('mock_sent_emails', JSON.stringify(emailsList));
      window.dispatchEvent(new Event('storage'));
    } else {
      // Registrar el comunicado general en base de datos
      await setDoc(doc(db, 'email_announcements', id), announcementRecord);

      // Escribir a la colección 'mail' que activa el Trigger Email de Firebase
      for (const u of targetUsers) {
        const personalizedHtml = bodyHtml.replace(/{nombre}/g, u.name || 'Alumno');
        const mailId = `mail_${u.uid}_${id}`;
        await setDoc(doc(db, 'mail', mailId), {
          to: u.email,
          message: {
            subject: subject,
            html: personalizedHtml
          },
          createdAt: new Date()
        });
      }
    }

    return announcementRecord;
  },

  /**
   * Suscribe en tiempo real a los comunicados enviados
   */
  subscribeToSentEmails(callback) {
    if (isMock) {
      const getList = () => {
        const saved = localStorage.getItem('mock_db_email_announcements');
        if (!saved) {
          const sampleRecord = {
            id: 'email_test_101',
            subject: 'Consulta de Alumna sobre Tema 6 (CDU y Préstamos BUS)',
            bodyHtml: 'Mensaje recibido de María García (maria.garcia.opos@gmail.com) para jgomez45@us.es:<br/><br/>Hola Don Julio (jgomez45@us.es),<br/><br/>Soy alumna de la oposición BUS Sevilla. Quisiera consultar si en el Tema 6 las sanciones por retraso de préstamos en reserva se cuentan por días hábiles o naturales.<br/><br/>¡Muchas gracias por la plataforma!',
            targetType: 'individual',
            targetValue: 'jgomez45@us.es',
            createdAt: new Date().toISOString()
          };
          const map = { 'email_test_101': sampleRecord };
          localStorage.setItem('mock_db_email_announcements', JSON.stringify(map));
          return [sampleRecord];
        }
        return Object.values(JSON.parse(saved)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      };
      callback(getList());
      const handleStorage = (e) => {
        if (e.key === 'mock_db_email_announcements') {
          callback(getList());
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } else {
      return onSnapshot(collection(db, 'email_announcements'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(list);
      }, (err) => {
        console.error("Error subscribing to email_announcements:", err);
      });
    }
  },

  /**
   * Elimina un comunicado del historial del panel
   */
  async deleteSentEmailRecord(id) {
    if (isMock) {
      const saved = localStorage.getItem('mock_db_email_announcements');
      if (saved) {
        const map = JSON.parse(saved);
        delete map[id];
        localStorage.setItem('mock_db_email_announcements', JSON.stringify(map));
        window.dispatchEvent(new Event('storage'));
      }
    } else {
      await deleteDoc(doc(db, 'email_announcements', id));
    }
  },

  // --- TOPIC VIDEOS SERVICES ---

  // Internal listeners for topic video updates
  _topicVideoListeners: [],
  _notifyTopicVideoListeners() {
    const data = this._getLocalTopicVideos();
    this._topicVideoListeners.forEach(cb => {
      try { cb(data); } catch (e) {}
    });
  },

  /**
   * Helper para obtener la copia local de vídeos por tema
   */
  _getLocalTopicVideos(topicId) {
    const saved = localStorage.getItem('mock_db_topic_videos');
    const allVideos = saved ? JSON.parse(saved) : DEFAULT_MOCK_VIDEOS;
    if (topicId) {
      return allVideos[topicId.toString()] || [];
    }
    return allVideos;
  },

  /**
   * Obtiene la lista de vídeos de un tema
   */
  async getTopicVideos(topicId) {
    const local = this._getLocalTopicVideos(topicId);
    return local;
  },

  /**
   * Suscripción en tiempo real a los vídeos de un tema
   */
  subscribeToTopicVideos(topicId, callback) {
    const topicKey = topicId.toString();
    const handler = (allVids) => {
      callback(allVids[topicKey] || []);
    };
    handler(this._getLocalTopicVideos());
    this._topicVideoListeners.push(handler);

    const handleStorage = (e) => {
      if (e.key === 'mock_db_topic_videos') {
        handler(this._getLocalTopicVideos());
      }
    };
    window.addEventListener('storage', handleStorage);

    if (isMock) {
      return () => {
        this._topicVideoListeners = this._topicVideoListeners.filter(l => l !== handler);
        window.removeEventListener('storage', handleStorage);
      };
    } else {
      const docRef = doc(db, 'topic_videos', topicKey);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudVids = docSnap.data().videos || [];
          const allVids = this._getLocalTopicVideos();
          allVids[topicKey] = cloudVids;
          localStorage.setItem('mock_db_topic_videos', JSON.stringify(allVids));
          callback(cloudVids);
        }
      }, (err) => {
        console.warn(`Firestore subscription notice for topic videos (${topicKey}):`, err.message);
      });

      return () => {
        this._topicVideoListeners = this._topicVideoListeners.filter(l => l !== handler);
        window.removeEventListener('storage', handleStorage);
        unsub();
      };
    }
  },

  /**
   * Suscripción en tiempo real a todos los vídeos por tema (para Admin)
   */
  subscribeToAllTopicVideos(callback) {
    callback(this._getLocalTopicVideos());
    this._topicVideoListeners.push(callback);

    const handleStorage = (e) => {
      if (e.key === 'mock_db_topic_videos') {
        callback(this._getLocalTopicVideos());
      }
    };
    window.addEventListener('storage', handleStorage);

    if (isMock) {
      return () => {
        this._topicVideoListeners = this._topicVideoListeners.filter(l => l !== callback);
        window.removeEventListener('storage', handleStorage);
      };
    } else {
      const unsub = onSnapshot(collection(db, 'topic_videos'), (snapshot) => {
        const cloudResult = { ...this._getLocalTopicVideos() };
        snapshot.docs.forEach(d => {
          cloudResult[d.id] = d.data().videos || [];
        });
        localStorage.setItem('mock_db_topic_videos', JSON.stringify(cloudResult));
        callback(cloudResult);
      }, (err) => {
        console.warn("Firestore subscription notice for all topic videos:", err.message);
      });

      return () => {
        this._topicVideoListeners = this._topicVideoListeners.filter(l => l !== callback);
        window.removeEventListener('storage', handleStorage);
        unsub();
      };
    }
  },

  /**
   * Guarda o actualiza la lista de vídeos de un tema (eliminar, añadir, reordenar)
   */
  async saveTopicVideos(topicId, videosList) {
    const keyStr = topicId.toString();

    // 1. Update local storage permanently
    const allVideos = this._getLocalTopicVideos();
    allVideos[keyStr] = videosList;
    localStorage.setItem('mock_db_topic_videos', JSON.stringify(allVideos));

    // 2. Notify all active subscribers in current app tab immediately
    this._notifyTopicVideoListeners();

    // 3. Sync to Cloud Firestore in cloud so all devices (mobiles/tablets) get updated
    if (!isMock) {
      try {
        const docRef = doc(db, 'topic_videos', keyStr);
        await withTimeout(
          setDoc(docRef, {
            topicId: keyStr,
            videos: videosList,
            updatedAt: new Date().toISOString()
          }),
          4000,
          "Write timeout"
        );
      } catch (err) {
        console.warn("Aviso al guardar en Firestore:", err.message);
      }
    }
  }
};

