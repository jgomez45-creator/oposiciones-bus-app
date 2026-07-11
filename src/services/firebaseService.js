import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';

// Check if we should run in Mock Simulator Mode
const isMock = !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
               import.meta.env.VITE_FIREBASE_PROJECT_ID === 'tu_project_id';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth = null;
let db = null;

if (!isMock) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized in REAL CLOUD MODE.");
  } catch (e) {
    console.error("Error initializing Firebase App. Falling back to MOCK MODE.", e);
  }
} else {
  console.log("Firebase running in MOCK SIMULATOR MODE. LocalStorage will simulate cloud sync.");
}

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
        const codeSnap = await getDoc(codeRef);
        
        if (!codeSnap.exists()) {
          throw new Error("El código de activación del libro es inválido.");
        }
        
        const codeData = codeSnap.data();
        if (codeData.used) {
          throw new Error("Este código de libro ya ha sido registrado por otro usuario.");
        }
      }

      // 2. Create Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 3. Create user profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        name,
        email: email.toLowerCase(),
        bookCode: cleanCode,
        currentSessionId: null,
        role: isAdminCode ? 'admin' : 'student'
      });

      // 4. Mark code as used in Firestore (skip if admin)
      if (!isAdminCode) {
        await updateDoc(codeRef, {
          used: true,
          usedBy: uid
        });
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Fetch user profile name
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) {
        throw new Error("No se ha encontrado el perfil del usuario.");
      }

      const userData = userSnap.data();

      // Write session ID to Firestore to force logout other devices
      await updateDoc(doc(db, 'users', uid), {
        currentSessionId: sessionId
      });

      return {
        user: { uid, name: userData.name, email: userData.email, bookCode: userData.bookCode },
        sessionId
      };
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
      });
    }
  }
};
