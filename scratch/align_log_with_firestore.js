import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  console.log(`\n=== Alineando Log Local con Firestore ===`);
  
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

    console.log(`Conectando a Firebase para obtener los códigos reales...`);
    const querySnapshot = await getDocs(collection(db, 'book_codes'));
    
    const dbCodes = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      dbCodes.push({
        code: docSnap.id,
        used: data.used || false,
        usedBy: data.usedBy || null,
        createdAt: data.createdAt ? (data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(data.createdAt)) : new Date()
      });
    });

    if (dbCodes.length === 0) {
      console.log('⚠️ No se encontraron códigos en la colección `book_codes` de Firestore.');
      return;
    }

    // Sort codes by creation date (oldest first), if same, sort alphabetically
    dbCodes.sort((a, b) => {
      const timeDiff = a.createdAt - b.createdAt;
      if (timeDiff !== 0) return timeDiff;
      return a.code.localeCompare(b.code);
    });

    console.log(`Se obtuvieron ${dbCodes.length} códigos de Firestore.`);

    // Rewrite generated_codes_log.txt
    const logPath = path.resolve(__dirname, 'generated_codes_log.txt');
    
    const timestamp = new Date().toISOString();
    let fileContent = `=== Códigos de Activación Reales en Firestore (Sincronizado el ${timestamp}) ===\n`;
    
    dbCodes.forEach((item, index) => {
      const statusText = item.used ? `[ADJUDICADO a: ${item.usedBy}]` : `[LIBRE]`;
      fileContent += `${index + 1}. ${item.code} ${statusText}\n`;
    });
    
    fileContent += `========================================================================\n`;

    fs.writeFileSync(logPath, fileContent, 'utf8');
    console.log(`\n✔ Archivo local reescrito con éxito en: ${logPath}`);
    console.log(`El archivo ahora contiene exactamente los ${dbCodes.length} códigos reales de la base de datos.`);

  } catch (e) {
    console.error('❌ Error al obtener los códigos de Firestore:', e.message);
    if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Sugerencia: Si tu regla de seguridad no permite listar la colección completa, puedes restaurar el archivo log manualmente');
      console.log('dejando únicamente la última tanda de 50 códigos (del lote BUS-QA2C-3NGU al BUS-Y7MW-NZPJ).');
    }
  }
};

run().catch(console.error);
