import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

// Helper to generate a single code matching BUS-XXXX-XXXX
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (I, O, 1, 0)
  const randomSegment = (len) => {
    let segment = '';
    for (let i = 0; i < len; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };
  return `BUS-${randomSegment(4)}-${randomSegment(4)}`;
};

const run = async () => {
  const count = 50; // Default number of codes to generate
  console.log(`\n=== Generador de Códigos de Activación para Oposiciones BUS ===`);
  console.log(`Generando ${count} códigos únicos...`);

  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateCode());
  }

  // 1. Save codes locally to a log file
  const logDir = path.resolve(__dirname, '../scratch');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const logPath = path.join(logDir, 'generated_codes_log.txt');
  const timestamp = new Date().toISOString();
  
  let fileContent = `=== Códigos de Activación Generados el ${timestamp} ===\n`;
  codes.forEach((code, index) => {
    fileContent += `${index + 1}. ${code}\n`;
  });
  fileContent += `========================================================\n\n`;

  fs.appendFileSync(logPath, fileContent);
  console.log(`\n✔ Códigos guardados localmente en: ${logPath}`);
  console.log(`\nLista de códigos generados:`);
  console.log(codes.join('\n'));

  // 2. Check if Firestore connection is configured
  const isMock = !env.VITE_FIREBASE_PROJECT_ID || 
                 env.VITE_FIREBASE_PROJECT_ID === 'tu_project_id';

  if (!isMock) {
    console.log(`\nConfiguración real de Firebase detectada. Iniciando subida a Firestore...`);
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

      console.log('Subiendo códigos a Firestore...');
      for (const code of codes) {
        const docRef = doc(db, 'book_codes', code);
        await setDoc(docRef, {
          used: false,
          usedBy: null,
          createdAt: new Date()
        });
      }
      console.log(`✔ ¡Subida completada con éxito! Todos los ${count} códigos están activos en la nube.`);
    } catch (e) {
      console.error('❌ Error al subir los códigos a Firestore:', e);
    }
  } else {
    console.log(`\nℹ La aplicación está en MODO SIMULADOR.`);
    console.log(`  Para usarlos en local, puedes copiar cualquiera de los códigos listados arriba.`);
    console.log(`  Cuando configures Firebase real en tu archivo .env, vuelve a ejecutar este script para subirlos a la nube.`);
  }
};

run().catch(console.error);
