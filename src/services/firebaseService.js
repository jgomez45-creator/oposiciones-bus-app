import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  getDocs
} from 'firebase/firestore';

// Check if we should run in Mock Simulator Mode
const projectID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const isMock = !projectID || projectID === 'tu_project_id';

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

if (!isMock) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });
    console.log("Firebase initialized in REAL CLOUD MODE with Auto-Detect Long-Polling.");
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

      // 4. Mark book code as used (skip if admin)
      if (!isAdminCode && mockCodes[cleanCode]) {
        mockCodes[cleanCode] = { used: true, usedBy: uid };
        mockCodes[cleanCode].used = true;
        mockCodes[cleanCode].usedBy = uid;
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

      // 4. Mark code as used in Firestore (skip if admin)
      if (!isAdminCode) {
        await withTimeout(
          updateDoc(codeRef, {
            used: true,
            usedBy: uid
          }),
          10000,
          "No se pudo marcar el código del libro como utilizado (tiempo de espera agotado)."
        );
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
      return () => {}; // return empty unsubscribe
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
  subscribeToAllUsers(onUpdate) {
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
      }, (err) => console.error("Error subscribing to users", err));

      const unsubProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
        progressSnapshot = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.topicsProgress) {
            progressSnapshot[doc.id] = data.topicsProgress;
          }
        });
        combineAndEmit();
      }, (err) => console.error("Error subscribing to progress", err));

      return () => {
        unsubUsers();
        unsubProgress();
      };
    }
  },

  /**
   * Listen to all book codes
   */
  subscribeToAllBookCodes(onUpdate) {
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
      }, (err) => console.error("Error subscribing to book codes", err));
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
        mockCodes[code] = { used: false, usedBy: null, createdAt: new Date().toISOString() };
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
          createdAt: new Date()
        });
        newCodes.push(code);
      }
      return newCodes;
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
  }
};
