import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually parse the .env file
const loadEnv = () => {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    }
  });
  return env;
};

const env = loadEnv();

const run = async () => {
  console.log(`\n=== Sincronizador de Códigos de Activación ===`);
  
  const logPath = path.resolve(__dirname, 'generated_codes_log.txt');
  if (!fs.existsSync(logPath)) {
    console.error(`❌ No se encontró el archivo de log en: ${logPath}`);
    return;
  }

  // 1. Read and parse codes from log file
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const codeRegex = /BUS-[A-Z0-9]{4}-[A-Z0-9]{4}/g;
  const matches = fileContent.match(codeRegex) || [];
  
  // Remove duplicates from the array
  const uniqueCodes = [...new Set(matches)];
  console.log(`Encontrados ${uniqueCodes.length} códigos únicos en el archivo local.`);

  // 2. Check if Firestore connection is configured
  const isMock = !env.VITE_FIREBASE_PROJECT_ID || 
                 env.VITE_FIREBASE_PROJECT_ID === 'tu_project_id';

  if (isMock) {
    console.error('❌ Error: El archivo .env está en modo simulador o no tiene configurado un project ID real de Firebase.');
    return;
  }

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(`Conectado a Firebase: ${env.VITE_FIREBASE_PROJECT_ID}`);
    console.log('Verificando y sincronizando códigos en Firestore (sin sobrescribir los ya usados)...');

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const code of uniqueCodes) {
      try {
        const docRef = doc(db, 'book_codes', code);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Code already in Firestore, skip it to prevent overwriting
          skippedCount++;
        } else {
          // Code not in Firestore, upload it as unused
          await setDoc(docRef, {
            used: false,
            usedBy: null,
            createdAt: new Date()
          });
          uploadedCount++;
          console.log(`  [+] Subido con éxito: ${code}`);
        }
      } catch (err) {
        console.error(`  [❌] Error procesando ${code}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n=== Resumen de Sincronización ===`);
    console.log(`✔ Nuevos códigos subidos: ${uploadedCount}`);
    console.log(`ℹ Códigos ya existentes (omitidos): ${skippedCount}`);
    if (errorCount > 0) {
      console.log(`❌ Errores encontrados: ${errorCount}`);
    }
    console.log(`=================================`);

  } catch (e) {
    console.error('❌ Error general durante la sincronización:', e);
  }
};

run().catch(console.error);
