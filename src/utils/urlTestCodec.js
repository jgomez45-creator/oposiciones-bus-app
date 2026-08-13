/**
 * Compresión y Decompresión Ultra Compacta para Enlaces Directos Ejecutables de Examen
 * Permite empaquetar un test completo en un token URL 100% autosuficiente que NO depende
 * de bases de datos externas, red ni permisos para abrir al instante en cualquier dispositivo.
 */

export function compressTestToUrlToken(payload) {
  if (!payload || !Array.isArray(payload.questions)) return '';

  const cleanSummary = (payload.summaryText || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const minified = {
    t: payload.title || 'Test de Evaluación de la BUS',
    s: cleanSummary,
    q: payload.questions.map(q => [
      q.question,
      q.options,
      q.correctAnswer,
      q.explanation || ''
    ])
  };

  try {
    const jsonStr = JSON.stringify(minified);
    const base64 = btoa(encodeURIComponent(jsonStr))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (err) {
    console.error("Error compressing test payload:", err);
    return '';
  }
}

export function decompressUrlTokenToTest(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    let base64 = token.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(atob(base64));
    const minified = JSON.parse(jsonStr);

    if (!minified || !Array.isArray(minified.q)) return null;

    return {
      title: minified.t || 'Test de Evaluación de la BUS',
      summaryText: minified.s || '',
      questions: minified.q.map((item, idx) => ({
        id: `q_url_${idx}_${Date.now()}`,
        question: item[0],
        options: item[1],
        correctAnswer: item[2],
        explanation: item[3]
      }))
    };
  } catch (err) {
    console.warn("Could not decompress test token from URL:", err);
    return null;
  }
}
