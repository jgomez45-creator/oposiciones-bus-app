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
  onSnapshot 
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
  return saved ? JSON.parse(saved) : {};
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
        currentSessionId: null
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

      return { uid, name, email: newUser.email, bookCode: cleanCode };
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
          role: isAdminCode ? 'admin' : 'student'
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

      return { uid, name, email: email.toLowerCase(), bookCode: cleanCode };
    }
  },

  /**
   * Log in an existing user with Email and Password
   */
  async loginUser(email, password) {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);

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
      mockUsers[matchedUser.uid] = matchedUser;
      saveMockUsers(mockUsers);

      // Trigger local storage event for mock active session listener
      localStorage.setItem(`mock_session_changed_${matchedUser.uid}`, sessionId);

      return {
        user: { uid: matchedUser.uid, name: matchedUser.name, email: matchedUser.email, bookCode: matchedUser.bookCode },
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
      const userSnap = await withTimeout(
        getDoc(doc(db, 'users', uid)),
        10000,
        "No se pudo obtener la información de tu perfil de usuario (tiempo de espera agotado)."
      );
      if (!userSnap.exists()) {
        throw new Error("No se ha encontrado el perfil del usuario.");
      }

      const userData = userSnap.data();

      // Write session ID to Firestore to force logout other devices
      await withTimeout(
        updateDoc(doc(db, 'users', uid), {
          currentSessionId: sessionId
        }),
        10000,
        "No se pudo iniciar sesión de forma exclusiva en el servidor (tiempo de espera agotado)."
      );

      return {
        user: { uid, name: userData.name, email: userData.email, bookCode: userData.bookCode },
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
    if (isMock) {
      localStorage.setItem(`mock_progress_${uid}`, JSON.stringify(progressData));
      return;
    } else {
      // Save to Firestore
      const progressRef = doc(db, 'progress', uid);
      await setDoc(progressRef, {
        topicsProgress: progressData,
        lastUpdated: new Date()
      }, { merge: true });
    }
  },

  /**
   * Listen to or fetch user's study progress
   */
  subscribeToUserProgress(uid, onProgressUpdate) {
    if (isMock) {
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
      const progressRef = doc(db, 'progress', uid);
      return onSnapshot(progressRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.topicsProgress) {
            onProgressUpdate(data.topicsProgress);
          } else {
            onProgressUpdate({});
          }
        } else {
          onProgressUpdate({});
        }
      }, (error) => {
        console.error("Error al obtener progreso de la nube:", error);
        onProgressUpdate({}); // Desbloquea la UI cargando aunque falle la red
      });
    }
  }
};
