# Plan de Integración de Preguntas de Exámenes Recopilados (Código 4140)

> **Archivos Analizados:** 402 PDFs  
> **Total Preguntas Evaluadas:** 9465  
> **Total Preguntas Validadas (Código 4140):** 2737  

## 1. Desglose por Temas (Código 4140)

| Tema | Título del Tema | Preguntas Validadas |
| :--- | :--- | :---: |
| Tema 01 | Tema 1 | **189** |
| Tema 02 | Tema 2 | **34** |
| Tema 03 | Tema 3 | **64** |
| Tema 04 | Tema 4 | **2** |
| Tema 05 | Tema 5 | **37** |
| Tema 06 | Tema 6 | **12** |
| Tema 07 | Tema 7 | **153** |
| Tema 08 | Tema 8 | **13** |
| Tema 09 | Tema 9 | **109** |
| Tema 10 | Tema 10 | **0** |
| Tema 11 | Tema 11 | **2** |
| Tema 12 | Tema 12 | **6** |
| Tema 13 | Tema 13 | **86** |
| Tema 14 | Tema 14 | **99** |
| Tema 15 | Tema 15 | **27** |
| Tema 16 | Tema 16 | **142** |
| Tema 17 | Tema 17 | **1334** |
| Tema 18 | Tema 18 | **175** |
| Tema 19 | Tema 19 | **178** |
| Tema 20 | Tema 20 | **75** |
| **TOTAL** | **Banco Completo** | **2737** |


---

## 2. Propuesta de Arquitectura de Datos JSON

Se propone estructurar las 2.737 preguntas oficiales validadas en el siguiente dataset modular:
`src/data/examenes_oficiales/banco_recopilado_4140.json`

```json
[
  {
    "id": "us_recopilado_t16_01",
    "tema": 16,
    "origen_pdf": "2022_Auxiliar_Biblioteca_Cuestionario_Examen.pdf",
    "enunciado": "Según el RD 488/1997 sobre PVD...",
    "opciones": ["A) Opción A", "B) Opción B", "C) Opción C", "D) Opción D"],
    "respuesta_correcta": 2,
    "explicacion_vigente": "Real Decreto 488/1997, Anexo (Teclado). Espacio suficiente para apoyo de brazos.",
    "estado_normativo": "🟢 VIGENTE",
    "etiquetas_4140": ["Codigo4140", "Tema16", "PVD", "ExamenOficialUS"]
  }
]
```

---

## 3. Módulos de Integración en la App

1. **Modo Banco Oficial de Exámenes (`FormadoresTests.jsx`):**
   * Se añadirá el selector de batería **'Banco Recopilado de Exámenes Oficiales US (Código 4140)'**.
2. **Modo Test por Temas (`QuizRunner.jsx`):**
   * Inyección dinámica de las preguntas validadas en los 20 temas de la app.
3. **Generador de Simulacros Reales:**
   * Integración en el motor de simulacros de examen de 40 preguntas del Código 4140.

---

> ⚠️ **REGLA DE ORO DE EJECUCIÓN:**  
> Ningún archivo de código de la app ni dataset de `src/data/` será modificado hasta que el usuario dé su **aprobación explícita** a esta propuesta.
