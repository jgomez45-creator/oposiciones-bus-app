# Plan de Integración de Preguntas Oficiales Validadas (Código 4140)

> **Documento de Planificación y Propuesta de Arquitectura de Datos**  
> **Especialidad:** Técnico/a Auxiliar de Biblioteca, Archivo y Museo (US - Código 4140)  
> **Origen del Banco:** Examen Oficial US (Código 2001 - Personal Laboral)  
> **Estado:** ⏳ Pendiente de Revisión y Aprobación por el Usuario (Sin Ejecución Automática)

---

## 1. Resumen de Preguntas Seleccionadas y Validadas

Tras aplicar el protocolo de **Filtrado Estricto por Epígrafe (Código 4140)** y la **Auditoría de Vigencia Normativa**, se han validado **11 preguntas** para su integración directa en el banco de tests de la aplicación:

| ID Propuesto | Pregunta Original | Tema Asignado | Epígrafe Exacto del Temario 4140 | Estado Normativo |
| :--- | :---: | :---: | :--- | :---: |
| `us_2001_q62` | Q62 | **Tema 14** | 14.1 Política de Prevención de Riesgos de la US | 🟢 Vigente |
| `us_2001_q64` | Q64 | **Tema 15** | 15.2 Instrucciones SEPRUS: Notificación de riesgos | 🟢 Vigente |
| `us_2001_q65` | Q65 | **Tema 15** | 15.1 Ergonomía física e higiene postural en PVD | 🟢 Vigente |
| `us_2001_q63` | Q63 | **Tema 16** | 16.1 LPRL 31/1995: Artículo 29 (Obligaciones trabajadores) | 🟢 Vigente |
| `us_2001_q66` | Q66 | **Tema 16** | 16.2 RD 486/1997: Lugares de trabajo | 🟢 Vigente |
| `us_2001_q68` | Q68 | **Tema 16** | 16.3 RD 485/1997: Señalización de seguridad y contraste | 🟢 Vigente |
| `us_2001_q69` | Q69 | **Tema 16** | 16.4 RD 488/1997: Pantallas de Visualización de Datos (PVD) | 🟢 Vigente |
| `us_2001_q78` | Q78 | **Tema 18** | 18.3 IV Convenio: Promoción y puestos de Grupo Superior | 🟢 Vigente |
| `us_2001_q79` | Q79 | **Tema 19** | 19.1 LO 3/2007: Art. 6.1 (Discriminación directa) | 🟢 Vigente |
| `us_2001_q80` | Q80 | **Tema 19** | 19.2 LO 3/2007: Art. 51.e (Discriminación retributiva) | 🟢 Vigente |
| `us_2001_q81` | Q81 | **Tema 19** | 19.2 LO 3/2007: Art. 51.a (Criterios AAPP en empleo público) | 🟢 Vigente |

---

## 2. Ubicación de Archivos y Dataset Progresivo

Para mantener la modularidad y no alterar los datasets existentes sin control, se propone la siguiente estructura de archivos:

### 📂 Nuevo Archivo de Datos JSON:
`src/data/examenes_oficiales/codigo_2001_validadas.json`

---

## 3. Estructura de Campos del Dataset (Esquema JSON)

Cada ítem se registrará con la siguiente estructura estandarizada:

```json
[
  {
    "id": "us_2001_q63",
    "tema": 16,
    "enunciado": "Según la Ley 31/1995, de prevención de Riesgos Laborales, cada trabajador tiene la obligación de:",
    "opciones": [
      "A) Utilizar los equipos de protección de acuerdo a su criterio en cada actividad.",
      "B) Utilizar correctamente los medios y equipos de protección facilitados por el empresario y de acuerdo con las instrucciones recibidas de éste.",
      "C) Poner fuera de funcionamiento y utilizar correctamente los dispositivos de seguridad.",
      "D) Velar por que el empresario cumpla y pueda garantizar unas condiciones seguras."
    ],
    "respuesta_correcta": 1,
    "explicacion_vigente": "Literalidad del Artículo 29.2.2º de la Ley 31/1995 de Prevención de Riesgos Laborales, que atribuye expresamente al trabajador el uso correcto de los equipos de protección individual (EPIs) según las instrucciones del empresario.",
    "etiquetas_4140": [
      "Codigo4140",
      "Tema16",
      "LPRL",
      "Articulo29",
      "ExamenOficial2022"
    ]
  }
]
```

---

## 4. Integración en los Modos de Práctica de la App

Una vez aprobado este plan, las 11 preguntas se vincularán en tres puntos clave de la aplicación sin alterar la lógica de navegación:

1. **Modo Test por Tema (`QuizRunner.jsx`):**
   * Las preguntas se inyectarán automáticamente en los bancos de preguntas de sus respectivos temas (**Tema 14, Tema 15, Tema 16, Tema 18 y Tema 19**).
2. **Modo Banco de Exámenes Oficiales (`FormadoresTests.jsx` / `QuizRunner.jsx`):**
   * Se creará la batería etiquetada como **"Examen Oficial US (Preguntas Validadas Código 4140)"**.
3. **Generador de Simulacros Globales:**
   * Entrarán como preguntas prioritarias en el algoritmo de generación de exámenes de simulación para el Código 4140.

---

> ⚠️ **REGLA DE ORO DE EJECUCIÓN:**  
> Ningún archivo de código de la app ni dataset de `src/data/` será modificado hasta que el usuario dé su **aprobación explícita** a esta propuesta.
