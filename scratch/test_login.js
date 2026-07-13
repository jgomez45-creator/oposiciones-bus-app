import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAuBS58f2eNqaeGIc10zyQwgjxgm2StgBg',
  authDomain: 'oposiciones-bus-app.firebaseapp.com',
  projectId: 'oposiciones-bus-app',
  storageBucket: 'oposiciones-bus-app.firebasestorage.app',
  messagingSenderId: '306671821699',
  appId: '1:306671821699:web:58c7be6781ab25c5230cb6'
};

const run = async () => {
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  console.log('Firebase initialized. Attempting login for jgomez45@us.es...');

  // Set a timeout of 10 seconds to make sure it doesn't hang forever
  const timeout = setTimeout(() => {
    console.error('TIMED OUT: The login attempt took more than 10 seconds.');
    process.exit(1);
  }, 10000);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'jgomez45@us.es', 'any_password_here_to_test');
    console.log('Login succeeded! User UID:', userCredential.user.uid);
  } catch (error) {
    console.log('Login failed as expected (or unexpected error):', error.code, error.message);
  }

  clearTimeout(timeout);
  process.exit(0);
};

run().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
