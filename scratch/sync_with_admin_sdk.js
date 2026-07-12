import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  console.log(`\n=== Sincronizador de Códigos (Firebase Admin SDK) ===`);
  
  const logPath = path.resolve(__dirname, 'generated_codes_log.txt');
  if (!fs.existsSync(logPath)) {
    console.error(`❌ No se encontró el archivo de log en: ${logPath}`);
    return;
  }

  // 1. Check if service account key exists
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Archivo no encontrado: ${serviceAccountPath}`);
    console.error(`\nPara usar este script, debes:`);
    console.error(`1. Ir a la consola de Firebase -> Configuración del Proyecto -> Cuentas de servicio.`);
    console.error(`2. Hacer clic en "Generar nueva clave privada".`);
    console.error(`3. Guardar el archivo JSON descargado en la carpeta 'scratch/' con el nombre 'serviceAccountKey.json'.`);
    return;
  }

  // 2. Read and parse codes from log file
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const codeRegex = /BUS-[A-Z0-9]{4}-[A-Z0-9]{4}/g;
  const matches = fileContent.match(codeRegex) || [];
  const uniqueCodes = [...new Set(matches)];
  console.log(`Encontrados ${uniqueCodes.length} códigos únicos en el archivo local.`);

  try {
    // 3. Initialize Firebase Admin
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    console.log(`✔ Conectado con éxito a Firebase usando la cuenta de servicio.`);
    console.log('Verificando y sincronizando códigos en Firestore...');

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const code of uniqueCodes) {
      try {
        const docRef = db.collection('book_codes').doc(code);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          skippedCount++;
        } else {
          // Upload as unused
          await docRef.set({
            used: false,
            usedBy: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          uploadedCount++;
          console.log(`  [+] Sincronizado en la nube: ${code}`);
        }
      } catch (err) {
        console.error(`  [❌] Error procesando ${code}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n=== Resumen de Sincronización (Admin) ===`);
    console.log(`✔ Nuevos códigos subidos: ${uploadedCount}`);
    console.log(`ℹ Códigos ya existentes (omitidos): ${skippedCount}`);
    if (errorCount > 0) {
      console.log(`❌ Errores encontrados: ${errorCount}`);
    }
    console.log(`==========================================`);

  } catch (e) {
    console.error('❌ Error general durante la sincronización:', e);
  }
};

run().catch(console.error);
