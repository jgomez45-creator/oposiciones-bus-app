import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

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
  const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  });
  console.log('Firebase initialized.');

  try {
    console.log('1. Attempting Auth sign-in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'jgomez45@us.es', 'Ju-Go-Ga1865');
    const uid = userCredential.user.uid;
    console.log(`   SUCCESS: Signed in. UID: ${uid}`);

    console.log('2. Attempting to get user profile from Firestore...');
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log('   SUCCESS: Read profile data:', userSnap.data());
    } else {
      console.log('   WARNING: User document does not exist.');
    }

    console.log('3. Attempting to write (updateDoc) to user profile in Firestore...');
    const testSessionId = 'session_test_' + Date.now();
    
    // Set a timeout of 10s specifically for this write operation
    const writePromise = updateDoc(userRef, {
      currentSessionId: testSessionId
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Write operation timed out after 10 seconds')), 10000)
    );

    await Promise.race([writePromise, timeoutPromise]);
    console.log('   SUCCESS: Write updated currentSessionId successfully!');

  } catch (error) {
    console.error('❌ ERROR encountered during steps:', error);
  }

  process.exit(0);
};

run().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
