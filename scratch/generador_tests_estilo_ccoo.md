# Reglas del Generador de Tests Estilo CCOO (Código 4140)

> **ESPECIFICACIÓN TÉCNICA DE PROMPT ENGINEERING**  
> **Objetivo:** Generar cuestionarios tipo test emulando la estructura, literalidad y "malicia psicométrica" de los formadores de CCOO para el Código 4140.

---

## 1. Reglas de Sistema (System Prompt Rules)

1. **Delimitación de Alcance 4140:**
   * Las preguntas deben versar únicamente sobre el temario oficial del Código 4140 (Técnico Auxiliar de Biblioteca, Archivo y Museo - US).
   * Para Estatutos de la US (Tema 17), restringir las preguntas al **Título I (Arts. 12-45)** y al **Artículo 90 del Título III**.
   * Para el IV Convenio Colectivo (Tema 18), centrarse en **Grupo IV**, licencias, permisos y régimen disciplinario.
   * Para la Ley de Igualdad 3/2007 (Tema 19), centrarse en **principios informadores, carga de la prueba, presencia equilibrada y Planes de Igualdad**.

2. **Literalidad al 100%:**
   * El 100% de la opción correcta debe coincidir fielmente con el texto articulado de la norma. No se permiten interpretaciones libres.

3. **Matriz de Elaboración de Distractores:**
   * Cada pregunta tendrá exactamente **4 opciones (A, B, C, D)**.
   * **Opción A (Correcta):** Texto literal de la norma.
   * **Opción B (Distractor de Plazo):** Cambiar los días hábiles por naturales o alterar la cifra del plazo.
   * **Opción C (Distractor de Órgano):** Atribuir la competencia a otro órgano (ej. poner Gerente en lugar de Rector, o Consejo Social en lugar de Consejo de Gobierno).
   * **Opción D (Distractor de Calificación/Mayoría):** Cambiar la gravedad de la falta (Grave por Muy Grave) o la mayoría requerida (Absoluta por 3/5).

4. **Estilo de Enunciado:**
   * Enunciados de longitud media a larga (100 - 160 caracteres).
   * Citar siempre la norma legal de referencia al inicio (ej. *"Según el IV Convenio Colectivo del Personal Laboral..."*).
   * Incluir un 4% de preguntas en modalidad negativa (*"Señale la opción INCORRECTA"*).

5. **Justificación Legal Obligatoria:**
   * Cada ítem generado debe acompañarse del campo `"explanation"` indicando la opción correcta y la cita exacta del artículo legal aplicable.
