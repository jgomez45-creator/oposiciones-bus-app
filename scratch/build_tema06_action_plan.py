import json

plan_content = """# Plan de Acción y Propuesta de Mejora: Tema 6 (Clasificación Decimal Universal y Control de Fondos)

> **DOCUMENTO DE PLANIFICACIÓN Y DISEÑO DIDÁCTICO**  
> **Área:** Biblioteconomía y Procesos Técnicos  
> **Convocatoria:** Código 4140 (Técnico/a Auxiliar de Biblioteca, Archivo y Museo - Universidad de Sevilla)  
> **Tema:** Tema 6 - *Clasificación de los fondos bibliográficos. La Clasificación Decimal Universal (CDU). Organización, ordenación y control de fondos.*  
> **Estado:** Propuesta de Mejora (Pendiente de Aprobación por el usuario antes de editar código o temario)

---

## 1. Diagnóstico del Tema 6 Actual

Tras examinar el archivo actual `public/markdown/tema-06.md` y contrastarlo con la bibliografía oficial (*Edición abreviada de la CDU de AENOR 2016*, *Manuales de Dionisio Millán - ETSA US* y los exámenes oficiales del Código 4140), se han detectado las siguientes **lagunas y áreas de mejora prioritaria**:

### ⚠️ Deficiencias Detectadas
1. **Brevedad en la Explicación de Auxiliares:** Los auxiliares se enumeran en una tabla simple, pero no se profundiza en la distinción crucial entre **Auxiliares Comunes Independientes** (pueden ir solos o encabezar notaciones) y **Dependientes** (`-0...`), ni en los **Auxiliares Especiales** (`-1/-9`, `.01/.09`, `'1/'9`).
2. **Ausencia de Ejemplos de Construcción Sintáctica Paso a Paso:** El estudiante ve el símbolo pero no aprende cómo se ensambla la notación completa de un libro real a partir de sus facetas (Materia principal + Forma + Lugar + Tiempo + Idioma).
3. **Escasa Ilustración del Orden de Precedencia (Orden de Tejuelos):** El ordenamiento en estantería se presenta en una lista, pero carece de esquemas visuales comparativos y ejercicios resueltos con notaciones complejas reales que son las que pregunta el tribunal.
4. **Falta de Trampas Típicas de Examen ("Ojo Examen CDU"):** No se destacan los errores frecuentes cometidos en oposiciones (confusión entre `(0...)` Forma y `(1/9)` Lugar, diferencia entre paréntesis simples y paréntesis con comillas `("...")`, o la inversión de competencias entre `:` y `::`).
5. **Sección de Control de Fondos Incompleta:** Los apartados sobre recuento topográfico, libre acceso vs. depósito, expurgo y densidad de estanterías (75-80%) están excesivamente resumidos.

---

## 2. Esquema Propuesto para la Reestructuración del Tema 6

La versión mejorada del **Tema 6** se articulará en **6 bloques pedagógicos** de alta densidad normativa y visual:

### 🟢 Bloque I: Clasificaciones Bibliográficas y Fundamentos de la CDU
* Concepto de clasificación sistemática vs. clasificación alfabética.
* Historia de la CDU: Paul Otlet, Henri La Fontaine y la adaptación del Sistema Dewey.
* El Consorcio de la CDU (UDCC) y la edición abreviada de AENOR (2016).

### 🟢 Bloque II: Las Tablas Principales (Clases 0 a 9)
* Análisis de las 10 clases principales.
* **Énfasis de Examen:** El hueco de la **Clase 4 (Vacía desde 1961)** y la ubicación del Dibujo y Diseño en la **Subclase 74**.
* Jerarquía decimal y la regla del punto cada tres dígitos (ej. `621.396`).

### 🔵 Bloque III: Auxiliares Comunes (Independientes vs. Dependientes)
* **Auxiliares Comunes Independientes:**
  * Idioma (`=...`) | Raza y Nacionalidad (`(=...)`) | Tiempo (`"..."`) | Lugar (`(1/9)`, destacando `(460)` España) | Forma (`(0...)`).
* **Auxiliares Comunes Dependientes:**
  * Propiedades, Materiales y Personas (`-0...`, destacando `-05` Personas y Colectivos).

### 🔴 Bloque IV: Auxiliares Especiales y Signos de Relación
* **Auxiliares Especiales (Analíticos):**
  * Guion (`-1/-9`) | Punto Cero (`.01/.09`) | Apóstrofo (`'1/'9`).
* **Signos de Relación:**
  * Adición (`+`) | Extensión (`/`) | Relación simple (`:`) | Relación fija (`::`) | Corchetes (`[]`) | Asterisco (`*`).

### 🟡 Bloque V: Secuencia de Ordenación en Estantería (Orden de Tejuelos)
* La regla de oro AENOR/BUS: **De los signos al número simple, y del número simple a los auxiliares**.
* Esquema oficial de precedencia paso a paso.
* Casos prácticos resueltos de ordenación de tejuelos.

### 🟣 Bloque VI: Organización, Ordenación y Control de Fondos
* Sistemas de ordenación: CDU vs. Número *Currens* vs. Colecciones Especiales.
* Libre Acceso (capacidad del 75-80%) vs. Depósito Cerrado.
* Proceso de Recuento Topográfico y Protocolo de Expurgo de la BUS.

---

## 3. Propuesta de Ejemplos Prácticos y Casos de Tejuelo

Para fijar el aprendizaje práctico, se incluirán desgloses sintácticos y ejercicios reales de tejuelos:

### A. Desglose Sintáctico Paso a Paso
* **Obra:** *"Diccionario histórico del arte abstracto en España durante el siglo XX (escrito en español)"*
* **Construcción de Notación:**
  * 🟢 **Materia Principal:** `7` (Arte) + `75` (Pintura/Arte abstracto)
  * 🔵 **Auxiliar de Forma:** `(038)` (Diccionario)
  * 🔵 **Auxiliar de Lugar:** `(460)` (España)
  * 🔵 **Auxiliar de Tiempo:** `"19"` (Siglo XX)
  * 🔵 **Auxiliar de Idioma:** `=134.2` (Español)
* **Notación Final Reenlazada:** `75(460)"19"(038)=134.2`

### B. Secuencia Oficial de Ordenación de Tejuelos (Ejemplo de Examen)
Orden de colocación correlativa en estantería para la materia base `53` (Física):

```
 ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───────┐   ┌───────┐   ┌──────┐   ┌──────┐   ┌─────┐
 │ 1 │ > │ 2 │ > │ 3 │ > │ 4 │ > │ 5 │ > │   6   │ > │   7   │ > │  8   │ > │  9   │ > │ 10  │
 └───┘   └───┘   └───┘   └───┘   └───┘   └───────┘   └───────┘   └──────┘   └──────┘   └─────┘
 53+54   53/55    53     53:62  53::62   53=134.2     53(035)    53(460)    53"19"    53-05
```

---

## 4. Diseño de Tests y Flashcards sobre CDU

El plan contempla enriquecer el banco interactivo de la aplicación con preguntas y tarjetas dedicadas exclusivamente a la mecánica de la CDU.

### 📝 Propuesta de Preguntas de Test (Ejemplos)

1. **Test de Ordenación de Tejuelos:**
   * *Pregunta:* ¿Cuál es el orden correcto de colocación en estantería de los siguientes tejuelos?
     * a) `32(460)` → `32` → `32:37` → `32/34`
     * b) `32/34` → `32` → `32:37` → `32(460)` **(CORRECTA)**
     * c) `32` → `32/34` → `32(460)` → `32:37`
     * d) `32:37` → `32/34` → `32` → `32(460)`

2. **Test de Identificación de Símbolos:**
   * *Pregunta:* ¿Qué tipo de auxiliar representa la notación `(038)` dentro de la Clasificación Decimal Universal?
     * a) Auxiliar común de Lugar.
     * b) Auxiliar común de Raza y Nacionalidad.
     * c) Auxiliar común de Forma. **(CORRECTA)**
     * d) Auxiliar especial de punto cero.

3. **Test de Sintaxis y Relación Fija:**
   * *Pregunta:* ¿Qué función cumple el signo `::` (dos puntos dobles) en una notación de la CDU?
     * a) Conectar dos números principales de forma no consecutiva.
     * b) Establecer una relación fija e irreversible que condiciona el orden del tejuelo. **(CORRECTA)**
     * c) Introducir un código ajeno a las tablas de la CDU.
     * d) Indicar una extensión consecutiva de materias.

### 🎴 Propuesta de Flashcards Específicas de CDU

| ID Flashcard | Anverso (Pregunta / Notación) | Reverso (Respuesta / Explicación) |
| :--- | :--- | :--- |
| `cdu_fc_01` | **Símbolo `(=...)` vs. `(0...)`** | `(=...)` = Auxiliar de Raza y Nacionalidad.<br>`(0...)` = Auxiliar de Forma del documento. |
| `cdu_fc_02` | **¿Qué clase de la CDU permanece vacía desde 1961?** | La **Clase 4** (reservada para futuras divisiones del conocimiento). |
| `cdu_fc_03` | **¿Qué va antes en la estantería: `53(035)` o `53"19"`?** | Va antes **`53(035)`** (Forma precede a Lugar, Tiempo y Personas). |
| `cdu_fc_04` | **¿A qué subclase corresponde Dibujo y Diseño en la CDU?** | A la **Subclase 74** (dentro de la Clase 7: Arte). |
| `cdu_fc_05` | **¿Qué indica el signo de adición `+`?** | Une dos o más materias no consecutivas (ej. `51+53` Matemáticas y Física). |

---

## 5. Sistema de Diseño Visual mediante Código de Colores

Para evitar la fatiga cognitiva y facilitar la memorización visual de las notaciones complejas, se aplicará el siguiente sistema cromático y de alertas en la maquetación Markdown:

```
 🟢 VERDE     ───> Tablas Principales / Notación Base (ej. 33, 51, 74, 82)
 🔵 AZUL      ───> Auxiliares Comunes (Lugar, Tiempo, Forma, Lengua, Raza)
 🔴 ROJO      ───> Signos de Relación y Auxiliares Especiales (+, /, :, ::, -1/-9, .01)
 ⚠️ ALERTA    ───> Cajas de Alerta "Ojo Examen CDU" (Trampas del tribunal)
```

### Ejemplo de Maquetación de Callout ("Ojo Examen CDU")

> [!WARNING]
> ⚠️ **OJO EXAMEN CDU: LA TRAMPA DE LOS PARÉNTESIS**
> * **` (460) ` con número entre 1 y 9:** Es un **Auxiliar de Lugar** (España).
> * **` (038) ` con número iniciado en 0:** Es un **Auxiliar de Forma** (Diccionario).
> * **` (=134.2) ` con signo igual interno:** Es un **Auxiliar de Raza/Nacionalidad** (Españoles).
> * **` ("19") ` con comillas internas:** Es un **Auxiliar de Tiempo** (Siglo XX).
> 
> *¡El tribunal suele intercambiar el orden de colocación entre Forma y Lugar! Recuerda que Forma `(0...)` siempre precede a Lugar `(1/9)`.*

---

## 6. Estado de la Tarea y Siguientes Pasos

> **ESTADO ACTUAL:** Documento de Planificación generado en `plan_mejora_tema_06_cdu.md`.  
> **PRÓXIMO PASO:** Esperar la aprobación explícita del usuario para iniciar la redacción del temario enriquecido en `public/markdown/tema-06.md` y la actualización del banco de tests y flashcards.
"""

with open("plan_mejora_tema_06_cdu.md", "w", encoding="utf-8") as f:
    f.write(plan_content)

print("Document plan_mejora_tema_06_cdu.md written successfully!")
