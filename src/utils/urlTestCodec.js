/**
 * Compresión y Decompresión Ultra Compacta para Enlaces Directos Ejecutables de Examen
 * Utiliza codificación UTF-8 Base64 pura (sin secuencias %20 ni %7B) para producir
 * enlaces extremadamente limpios y cortos de 1 sola línea.
 */

function utf8ToBase64(str) {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error("utf8ToBase64 error", e);
    return '';
  }
}

function base64ToUtf8(str) {
  try {
    let base64 = str.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.warn("base64ToUtf8 decode error", e);
    return null;
  }
}

export function compressTestToUrlToken(payload) {
  if (!payload || !Array.isArray(payload.questions)) return '';

  const cleanSummary = (payload.summaryText || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);

  const minified = {
    t: (payload.title || 'Test BUS').substring(0, 70),
    s: cleanSummary,
    q: payload.questions.map(q => [
      q.question,
      q.options,
      q.correctAnswer,
      (q.explanation || '').substring(0, 120)
    ])
  };

  const jsonStr = JSON.stringify(minified);
  return utf8ToBase64(jsonStr);
}

export function decompressUrlTokenToTest(token) {
  if (!token || typeof token !== 'string') return null;

  // Si el token aún trae secuencias %7B (versión antigua), fallback a decodeURIComponent(atob)
  if (token.includes('%7B') || token.includes('%22')) {
    try {
      const decodedStr = decodeURIComponent(token.trim());
      const parsed = JSON.parse(decodedStr);
      if (parsed && Array.isArray(parsed.q)) {
        return {
          title: parsed.t || 'Test BUS',
          summaryText: parsed.s || '',
          questions: parsed.q.map((item, idx) => ({
            id: `q_url_${idx}_${Date.now()}`,
            question: item[0],
            options: item[1],
            correctAnswer: item[2],
            explanation: item[3]
          }))
        };
      }
    } catch (_) {}
  }

  const jsonStr = base64ToUtf8(token);
  if (!jsonStr) return null;

  try {
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
    console.warn("Could not parse decompressed test JSON", err);
    return null;
  }
}
