# Tema 5: Gestión de la colección

<div class="app-promo-banner header-promo">

> 📱 **ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP**  
> Accede a **oposiciones-bus-app** (https://oposiciones-bus-app.vercel.app) para complementar tu lectura:
> * 🎴 **Flashcards:** Memoriza las fases del tratamiento técnico y los criterios MUSTIE del expurgo en minutos.
> * 📝 **Modo Test:** Pon a prueba este tema con preguntas de exámenes oficiales.

</div>

## Selección, adquisición, tratamiento técnico, inventario, expurgo y preservación

---

## 1. El Concepto de Gestión y Ciclo de la Colección
La **Gestión de la Colección** (también conocida como *Desarrollo de la Colección*) es el proceso dinámico, planificado, sistemático y constante de creación, mantenimiento, evaluación y renovación del fondo documental de la biblioteca para adaptarlo a las necesidades de la comunidad universitaria.

Hoy en día se rige de manera oficial por la **Política de Gestión de la Colección de la BUS**, que establece las directrices para que el crecimiento del fondo sea equilibrado, eficiente y adaptado a los recursos disponibles:
*   **Prioridad Digital:** Se prioriza el formato electrónico cuando da soporte a un mayor número de usuarios simultáneos y reduce el espacio físico.
*   **Control del Papel:** Se evita la compra de duplicidades innecesarias en papel de monografías o revistas de baja consulta.

El ciclo de vida de los documentos consta de fases interrelacionadas representadas de forma circular:
```
[ Detección de Necesidades / Selección ] ➔ [ Adquisición ] ➔ [ Tratamiento Técnico ] ➔ [ Conservación ] ➔ [ Inventario ] ➔ [ Expurgo ]
```

---


<div class="app-promo-banner mid-promo">

> 💡 **REPASO RÁPIDO EN LA APP:**  
> ¿Te cuesta memorizar las fases del tratamiento técnico y los criterios MUSTIE del expurgo? Entra en la app (https://oposiciones-bus-app.vercel.app) y repasa las **Tarjetas de Memorización** específicas de este apartado para afianzar los conceptos sin dudar.

</div>

## 2. Selección y Adquisición

### A. Selección y Detección de Necesidades
La selección consiste en decidir qué materiales (físicos o digitales) entran a formar parte de la biblioteca. En la BUS es un proceso **corresponsable y mixto**:
1.  **Personal bibliotecario:** Se encarga de adquirir manuales básicos de las asignaturas (bibliografía recomendada de las guías docentes). El *Programa de Gestión de la Colección de la BUS* establece que:
    *   Si una asignatura cuenta con **más de 800 alumnos matriculados**, la biblioteca debe garantizar la adquisición y disponibilidad de un número mínimo de **15 ejemplares** del título de la bibliografía básica recomendada.
2.  **Comunidad académica (PDI):** Los profesores e investigadores solicitan la adquisición de monografías especializadas para su docencia y proyectos de investigación.
3.  **Estudiantes (Desideratas):** Son las peticiones formales de compra que los propios estudiantes pueden realizar a través de un formulario en la web de la BUS o desde su perfil personal en el catálogo **FAMA**. La biblioteca evalúa la pertinencia académica y presupuestaria antes de aprobarlas.

### B. Modos de Adquisición (Vías Principales)
1.  **Compra:** Es el método principal para manuales de estudiantes y recursos electrónicos (suscripción, compra a perpetuidad, PDA, EBA, y Acuerdos Transformativos).
2.  **Donación o Regalo:** Entrega gratuita de documentos por parte de particulares, profesores o instituciones. La donación no se acepta automáticamente, solo se ingresan fondos de interés docente o de investigación real en buen estado.
3.  **Canje o Intercambio:** Acuerdo de reciprocidad institucional entre la Universidad de Sevilla (usualmente utilizando las obras de la **Editorial Universidad de Sevilla**) y otras universidades o centros de investigación para enriquecer mutuamente los fondos.

---

## 3. Tratamiento Técnico de los Fondos

### A. Tratamiento Técnico
Una vez recibidos, los materiales pasan por:
*   **Registro e Inventario:** Asignación de un número de orden correlativo único a cada ejemplar físico que acredita legalmente su propiedad por la Universidad de Sevilla.
*   **Catalogación y Clasificación:** Descripción bibliográfica bajo normativas internacionales (RDA y formato MARC21) y asignación de códigos CDU.
*   **Procesamiento Físico:** Colocación del tejuelo (etiqueta de localización en el lomo), inserción de la alarma magnética o tag de RFID y sellado físico.

### B. El Formato de Catalogación MARC21
MARC21 (*MAchine-Readable Cataloging*) es el estándar que estructura los metadatos bibliográficos mediante etiquetas numéricas de tres cifras:

| Campo | Nombre del Campo MARC21 | Subcampos Principales | Ejemplos y Uso |
| :---: | :--- | :--- | :--- |
| **`001`** | **Número de control del registro** | — | Identificador único del registro en la base de datos de la biblioteca. |
| **`008`** | **Información de longitud fija (Datos del libro)** | — | Campo de control de 40 caracteres que codifica datos como: *fecha de publicación, país de publicación, idioma de la obra, tipo de material.* Sin subcampos; se lee por posición de carácter. Ej: posiciones 35-37 = código de idioma (`spa` para español). |
| **`020`** | **ISBN** (International Standard Book Number) | **`$a`** Número de ISBN válido <br> **`$q`** Calificador de soporte <br> **`$z`** ISBN cancelado o incorrecto | **ISBN-13** (13 dígitos, empieza por `978` o `979`): `020 $a 9788437604947 $q rústica` <br> **ISBN-10** (10 dígitos, formato anterior a 2007): `020 $z 8437604940` — Se conserva en `$z` como ISBN cancelado al transcribir al nuevo formato. |
| **`022`** | **ISSN** (International Standard Serial Number) | **`$a`** Número de ISSN | `022  $a 0210-4466` (Revista de Filología) |
| **`040`** | **Fuente de catalogación** | **`$a`** Agencia catalogadora original <br> **`$b`** Idioma de catalogación <br> **`$e`** Convención de descripción aplicada | `040 $a SpMaBN $b spa $e rda` — Indica que catalogó la Biblioteca Nacional de España, en español y según normas RDA. |
| **`080`** | **CDU** (Número de Clasificación Decimal Universal) | **`$a`** Notación de la CDU <br> **`$x`** Auxiliar común | `080  $a 821.134.2-31` (Novela en español) |
| **`100`** | **Asiento Principal - Nombre de Persona** | **`$a`** Nombre personal <br> **`$d`** Fechas asociadas (nacim./muerte) | `100 1# $a Cervantes Saavedra, Miguel de, $d 1547-1616` |
| **`110`** | **Asiento Principal - Nombre de Entidad** | **`$a`** Nombre de la corporación | `110 2# $a Universidad de Sevilla` |
| **`245`** | **Mención de Título** | **`$a`** Título propiamente dicho <br> **`$b`** Resto del título (subtítulo) <br> **`$c`** Mención de responsabilidad | `245 10 $a Don Quijote de la Mancha / $c Miguel de Cervantes ; edición de Francisco Rico.` |
| **`250`** | **Mención de Edición** | **`$a`** Mención de edición | `250  $a 4ª ed. corr. y aum.` |
| **`264`** | **Producción, Publicación, Distribución** *(Actual)* | **`$a`** Lugar <br> **`$b`** Editor/Distribuidor <br> **`$c`** Fecha (segundo indicador `1` para publicación) | `264 #1 $a Sevilla : $b Editorial Universidad de Sevilla, $c 2023.` |
| **`300`** | **Descripción Física** | **`$a`** Extensión (páginas/volúmenes) <br> **`$b`** Otros detalles físicos (il.) <br> **`$c`** Dimensiones (altura en cm) | `300  $a 843 p. : $b il. col. y mapas ; $c 24 cm.` |
| **`490`** | **Mención de Serie** | **`$a`** Título de la serie <br> **`$v`** Número de volumen | `490 1# $a Letras hispánicas ; $v 142` |
| **`500`** | **Nota General** | **`$a`** Texto de la nota | `500  $a Bibliografía: p. 800-830.` |
| **`650`** | **Punto de Acceso de Materia - Término** | **`$a`** Término de materia (materia principal) <br> **`$v`** Subdivisión de forma | `650 #4 $a Novela de caballerías $v Crítica e interpretación` |
| **`700`** | **Asiento Secundario - Nombre de Persona** | **`$a`** Nombre personal <br> **`$e`** Término de relación (tr., ed., il.) | `700 1# $a Rico, Francisco, $e ed. lit.` |

> [!TIP]
> **Claves MARC21 para el examen:** El campo **008** (longitud fija, sin subcampos, se lee por posición) codifica el idioma (posiciones 35-37), país y tipo de recurso. El campo **040** identifica quién catalogó y con qué norma (`$e rda`). En el campo **020**, el **ISBN-13** va en `$a` y el **ISBN-10** antiguo (o ISBNs inválidos) va en `$z`.

### C. El Estándar RDA y el Modelo Conceptual IFLA LRM
Las directrices **RDA (Resource Description and Access)** sustituyeron a las Reglas de Catalogación españolas tradicionales. RDA está fundamentado teóricamente en el modelo conceptual **IFLA LRM (Library Reference Model)**. 

Este modelo describe los recursos bibliográficos a través de cuatro niveles jerárquicos de abstracción de datos, denominados **Entidades de Recursos**:
1.  **Obra (Work):** Es la creación intelectual o artística de carácter abstracto. No tiene soporte físico ni código concreto, representa la idea conceptual y el contenido común (ej. la obra conceptual de *Don Quijote de la Mancha* concebida por Cervantes).
2.  **Expression (Expresión):** Es la realización intelectual o artística específica de una obra en un código determinado (ej. el texto en lengua castellana original, la traducción al inglés por John Ormsby, o un audiolibro narrado).
3.  **Manifestación (Manifestation):** Es la materialización física o soporte de una expresión de una obra. Representa el objeto físico o digital producido comercialmente en serie (ej. la edición impresa en formato rústica de la editorial Cátedra de 2019, o el archivo digital en formato EPUB de la misma edición).
4.  **Ítem (Item):** Es un ejemplar físico o copia digital individual y concreta de una manifestación. Es el objeto tangible que pertenece a una biblioteca específica, se etiqueta, se inventaría y se presta (ej. el ejemplar en papel con código de barras `US-48201` y tejuelo `82 CER qui` ubicado en la Biblioteca de Humanidades de la US).

---

## 4. Control de Colección: Inventario y Expurgo

### A. Inventario
*   Recuento periódico físico de los ejemplares de las estanterías para verificar pérdidas, hoy en día facilitado por la tecnología **RFID**, que permite leer las etiquetas a distancia de manera masiva y sin sacar los libros del estante.

### B. El Expurgo (Weeding)
Es la operación técnica de **retirada selectiva** de documentos de las secciones de libre acceso de la biblioteca. Están **totalmente excluidos del expurgo o descarte los manuscritos, incunables** y cualquier obra de valor histórico, artístico o archivístico singular (Fondo Antiguo). Un documento expurgado puede tener tres destinos en la BUS:
1.  **Traslado al depósito:** El libro físico sale de la sala de libre acceso porque se consulta poco, pero se conserva en un depósito cerrado o almacén secundario porque mantiene valor histórico o de investigación.
2.  **Donación:** Se ofrece gratuitamente a otras instituciones o bibliotecas en desarrollo si mantiene valor de lectura pero no utilidad curricular en la US.
3.  **Destrucción / Reciclaje:** Si el documento está físicamente inservible (roto o con hongos) o su contenido está completamente obsoleto (ej. un manual informático antiguo).

### Criterios Técnicos de Expurgo (El método CREW / MUSTIE)
Para descarte sistemático de libros físicos, se suelen aplicar criterios condensados en las siglas **MUSTIE**:
*   **M** (*Misleading*): Contenido obsoleto, desactualizado o científicamente superado (ej. medicina o derecho antiguo).
*   **U** (*Ugly*): Deteriorado físicamente, roto, subrayado de forma irreversible.
*   **S** (*Superseded*): Ha sido reemplazado por una edición más nueva o un formato electrónico mejor.
*   **T** (*Trivial*): Carece de valor científico o de lectura duradero.
*   **I** (*Irrelevant*): Ya no se imparte esa materia en la universidad y ningún usuario lo solicita.
*   **E** (*Elsewhere*): Se puede conseguir fácilmente mediante Préstamo Interbibliotecario o está en acceso abierto en la red.

---

## 5. Preservación y Conservación
Medidas orientadas a retrasar el deterioro físico y químico del patrimonio documental:

### A. Conservación Preventiva
*   **Parámetros ambientales:** Control de temperatura constante (entre 18-22 °C), humedad relativa (45-55%), y evitación de luz ultravioleta directa.
*   **Almacenamiento de volúmenes pesados:** Según las normas de uso y conservación de fondos valiosos de la BUS, los libros muy pesados o de formatos inusuales **no deben apilarse** en torres y se procurará mantenerlos en **posición horizontal** para evitar que cedan las costuras y encuadernaciones.
*   **Conservación de Folletos de Fondo Antiguo:** Según el Capítulo II de las Normas de la BUS, los folletos históricos deben **guardarse en cajas cerradas de material no ácido** para evitar su deterioro físico y la acidez del papel.

### B. Preservación Digital
*   **Acceso continuo:** Garantizar que los e-books, e-journals y los contenidos del repositorio institucional (**idUS**) sigan siendo accesibles a pesar del rápido cambio de software y hardware mediante copias de seguridad redundantes, migración sistemática a formatos abiertos estándares y duraderos (como PDF/A), y metadatos de preservación.

---

## 6. Principales Bases de Datos de Apoyo

El personal de la BUS utiliza habitualmente las siguientes bases de datos para verificar registros bibliográficos y asistir a investigadores:

### A. Dialnet (Universidad de La Rioja)
*   **Naturaleza:** Plataforma cooperativa hispana de acceso abierto financiada por un consorcio de bibliotecas españolas. La **BUS es biblioteca cooperadora de Dialnet**, contribuyendo activamente a la revisión y creación de registros bibliográficos.
*   **Cobertura:** Indexa artículos de revistas científicas españolas e hispanoamericanas, tesis doctorales, libros y capítulos de libros.
*   **Acceso:** La plataforma básica es **gratuita**. **Dialnet Plus** (texto completo, alertas y estadísticas ampliadas) requiere suscripción institucional.
*   **Alertas bibliográficas:** Permite configurar avisos automáticos para recibir índices de nuevos números de revistas directamente en el correo.

### B. Web of Science (WoS) — Clarivate Analytics
*   **Naturaleza:** Base de datos multidisciplinar de referencia mundial para la literatura científica de mayor impacto. Accesible desde la BUS a través del CBUA.
*   **Sus tres índices principales de citación:**
    *   **SCI-E** *(Science Citation Index Expanded)*: Ciencias exactas, naturales y bioquímica.
    *   **SSCI** *(Social Sciences Citation Index)*: Ciencias sociales, economía y educación.
    *   **AHCI** *(Arts & Humanities Citation Index)*: Humanidades, filosofía, lingüística y artes.
*   **Herramienta clave:** El **JCR (Journal Citation Reports)** proporciona el Factor de Impacto de las revistas científicas.

### C. PubMed / MEDLINE — NLM (EE.UU.)
*   **Naturaleza:** Base de datos bibliográfica especializada en ciencias de la salud y biomedicina de **acceso totalmente gratuito**.
*   **Gestionada por:** La Biblioteca Nacional de Medicina de EE.UU. (NLM) a través de los NIH.
*   **Cobertura:** Más de 34 millones de citas de literatura biomédica internacional. Acceso al texto completo de artículos en abierto a través de **PubMed Central (PMC)**.
*   **Vocabulario Controlado:** Usa el **MeSH** *(Medical Subject Headings)* como tesauro médico estandarizado.

> [!TIP]
> **Regla mnemónica para bases de datos:** *"**W**oS mide el **I**mpacto, **D**ialnet es **H**ispana y **P**ubMed es **M**edical gratuita"*

---

## 7. Esquema de Repaso Rápido
*   **Selección:** Decisión sobre qué materiales añadir a la colección.
*   **Norma Matrícula BUS:** Más de 800 alumnos = Mínimo de **15 ejemplares** en biblioteca.
*   **Expurgo Excluye:** Manuscritos e incunables (nunca se expurgan).
*   **Conservación Formatos Grandes:** Posición **horizontal** y no apilados.
*   **Ingresos:** Compra, Donación y Canje (intercambio institucional).
*   **MARC21 campo 008:** Longitud fija (40 caracteres, sin subcampos). Posiciones 35-37 = código de idioma (`spa`).
*   **MARC21 campo 040:** Fuente de catalogación (`$a` agencia, `$b` idioma, `$e` norma aplicada, ej. `rda`).
*   **MARC21 campo 020:** ISBN-13 en `$a`; ISBN-10 antiguo o inválido en `$z`.
*   **WoS índices:** SCI-E (ciencias exactas), SSCI (ciencias sociales), AHCI (humanidades).
*   **Dialnet:** La BUS es biblioteca **cooperadora** (contribuye a crear registros).
*   **PubMed/MEDLINE:** Base de datos biomédica **gratuita** (NLM/NIH de EE.UU.), usa vocabulario MeSH.
*   **RDA (IFLA LRM):** Relación jerárquica **Obra** → **Expresión** → **Manifestación** → **Ítem**.

---

## 8. Conceptos Clave
*   **MUSTIE:** Método normalizado internacionalmente que condensa en seis siglas los criterios objetivos para la retirada o descarte de libros.
*   **Desiderata:** Solicitud formal de compra de un documento realizada por un usuario a la biblioteca a través de FAMA o formulario web.
*   **MARC21:** Formato de codificación de datos bibliográficos estandarizado internacionalmente para su lectura por ordenador.
*   **Campo 008 MARC21:** Campo de control de longitud fija (40 caracteres) que codifica metadatos básicos: idioma (pos. 35-37), país y tipo de material. Sin subcampos; se lee por posición de carácter.
*   **ISBN-13:** Identificador internacional de libro de 13 dígitos (formato vigente desde 2007, empieza por 978 o 979). El ISBN-10 anterior se registra en el subcampo `$z` del campo 020 de MARC21.
*   **Campo 040 MARC21:** Identifica la agencia catalogadora original (`$a`), el idioma de catalogación (`$b`) y la norma de descripción aplicada (`$e`, ej. `rda`).
*   **RDA (Resource Description and Access):** Estándar de catalogación estructurado para describir recursos en el entorno digital y bases de datos modernas.
*   **Canje:** Intercambio mutuo y cooperativo de publicaciones propias entre universidades u organismos científicos.
*   **Expurgo:** Operación técnica de retirada o descarte de fondos sobrantes u obsoletos para desatascar las salas de libre acceso de la biblioteca.
*   **Incunables:** Libros impresos con caracteres móviles desde la invención de la imprenta (c. 1450) hasta el 31 de diciembre del año 1500 inclusive.
*   **Dialnet:** Portal bibliográfico cooperativo hispano en el que la BUS participa como biblioteca cooperadora, contribuyendo a mantener y enriquecer sus registros.
*   **PubMed/MEDLINE:** Base de datos biomédica de acceso gratuito gestionada por la NLM (NIH, EE.UU.) que indexa más de 34 millones de referencias usando el vocabulario MeSH.
*   **WoS (Web of Science):** Base de datos multidisciplinar de Clarivate Analytics con tres índices: SCI-E (ciencias exactas), SSCI (ciencias sociales) y AHCI (humanidades).

---

## 9. Bibliografía
*   **Directrices para el expurgo de las colecciones de la Biblioteca de la Universidad de Sevilla**.
*   **Formato MARC 21 para datos bibliográficos (Library of Congress)**.
*   **Directrices de catalogación RDA (Resource Description and Access)**.
*   **Reglas de Catalogación españolas (Ministerio de Cultura)**.
*   **Dionisio Millán (2022). Aspectos básicos en Colecciones, Clasificación y Gestión de Bibliotecas de la US**. Presentación de CCOO, Biblioteca ETSA, Universidad de Sevilla.


<div class="app-promo-banner footer-promo">

---
### 🎯 ¡Ponte a prueba antes de pasar al siguiente tema!
Has completado la lectura teórica. Ahora es momento de consolidar lo aprendido:
1. **Repaso de Flashcards:** Revisa las tarjetas de este tema en la sección *Flashcards*.
2. **Simulacro de Examen:** Realiza un test de autoevaluación en la sección *Tests*.

🔗 **Accede ahora a la app:** [Abrir oposiciones-bus-app](https://oposiciones-bus-app.vercel.app)
---

</div>
