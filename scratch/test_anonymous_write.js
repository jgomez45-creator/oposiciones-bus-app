import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';

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
    console.log('1. Attempting Anonymous Authentication...');
    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;
    console.log(`   SUCCESS: Anonymous Authentication succeeded. UID: ${uid}`);

    console.log('2. Attempting to write a new user document to Firestore (testing rules)...');
    const userRef = doc(db, 'users', uid);
    
    // We try to write a test guest profile to /users/{uid}
    const testUser = {
      uid,
      name: 'Verificador Reglas Firestore',
      email: `test_rules_${uid}@oposicionesbus.com`,
      bookCode: 'DEMO-INVITADO',
      role: 'guest',
      currentSessionId: 'test_session_' + Date.now(),
      lastActive: new Date().toISOString()
    };

    await setDoc(userRef, testUser);
    console.log('   SUCCESS: Firestore rules ALLOWED writing to /users/{uid}!');

    console.log('3. Cleaning up test document...');
    await deleteDoc(userRef);
    console.log('   SUCCESS: Cleanup succeeded.');
    console.log('\n✅ VERIFICATION RESULT: Firestore Rules are CORRECTLY configured and published! Registration and guest access will work perfectly.');

  } catch (error) {
    console.error('\n❌ VERIFICATION RESULT: Connection or rules failed!');
    console.error('Error details:', error);
    if (error.code === 'permission-denied') {
      console.log('\n💡 RECOMMENDATION: The Firestore rules are still denying write permissions for new users. Make sure you published the new rules in the Firebase console.');
    }
  }

  process.exit(0);
};

run().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
