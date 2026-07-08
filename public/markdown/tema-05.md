# Tema 5: Gestión de la colección
## Selección, adquisición, tratamiento técnico, inventario, expurgo y preservación

---

## 1. El Ciclo de Vida de la Colección
La **Gestión de la Colección** es el conjunto de decisiones y acciones técnicas destinadas a dotar a la biblioteca de una colección coherente, equilibrada y útil para sus usuarios, optimizando el espacio físico y el presupuesto. 

El ciclo de la colección consta de seis fases fundamentales interrelacionadas de forma constante.

---

## 2. Selección y Adquisición
### A. Selección
* Proceso de decidir qué materiales deben formar parte de la colección.
* **Agentes:** Es un proceso mixto en el que participan el PDI (que recomienda la bibliografía para sus asignaturas), los bibliotecarios (responsables del equilibrio temático) y los propios estudiantes (a través de sugerencias de compra o desideratas).
* **Criterios:** Relevancia académica, nivel (grado, postgrado, investigación), coste económico, idioma y tipo de soporte.

### B. Adquisición (Vías Principales)
1. **Compra:** Vía principal para manuales recomendados y recursos de información de pago. Se realiza mediante concursos públicos con proveedores autorizados.
2. **Suscripción:** Modelo estándar para revistas y bases de datos electrónicas (pago periódico por acceso).
3. **Donación o Regalo:** Recepción gratuita de fondos procedentes de particulares o instituciones (su aceptación está supeditada a que encaje en el plan de colecciones de la BUS).
4. **Intercambio:** Canje de publicaciones propias de la Universidad de Sevilla con otras instituciones de investigación.

---

## 3. Tratamiento Técnico de los Fondos
Una vez que el documento entra físicamente o digitalmente en la biblioteca, debe ser procesado técnicamente para permitir su almacenamiento sistemático y recuperación por el usuario:

*   **Registro:** Asignación de un número de orden correlativo único a cada ejemplar físico que acredita su propiedad por la Universidad (número de registro).
*   **Catalogación:** Descripción formal y física del documento bajo normativas internacionales. Actualmente se utiliza el estándar **RDA** y el formato de intercambio de datos **MARC21**.
*   **Clasificación y Asignación de Materias:** Análisis conceptual del contenido para clasificarlo temáticamente (mediante el sistema **CDU**).
*   **Procesamiento Físico:** Colocación de etiquetas de tejuelo (código de localización física o signatura), código de barras, etiqueta RFID de seguridad y sellado de propiedad.

### A. El Formato de Catalogación MARC21
MARC21 (MAchine-Readable Cataloging) es el formato que estructura los datos bibliográficos mediante etiquetas numéricas de tres cifras (campos de la serie `000` a `900`) e indicadores, dividiendo la información interna mediante **subcampos** precedidos por un código delimitador (habitualmente el signo `$`).

A continuación se detallan los campos y subcampos esenciales más importantes para la preparación de exámenes técnicos:

| Campo | Nombre del Campo MARC21 | Subcampos Principales | Ejemplos y Uso |
| :---: | :--- | :--- | :--- |
| **`020`** | **ISBN** (International Standard Book Number) | **`$a`** Número de ISBN <br> **`$q`** Calificador de soporte | `020  $a 9788437604947 $q rústica` |
| **`022`** | **ISSN** (International Standard Serial Number) | **`$a`** Número de ISSN | `022  $a 0210-4466` (Revista de Filología) |
| **`080`** | **CDU** (Número de Clasificación Decimal Universal) | **`$a`** Notación de la CDU <br> **`$x`** Auxiliar común | `080  $a 821.134.2-31` (Novela en español) |
| **`100`** | **Asiento Principal - Nombre de Persona** | **`$a`** Nombre personal <br> **`$d`** Fechas asociadas (nacim./muerte) | `100 1# $a Cervantes Saavedra, Miguel de, $d 1547-1616` |
| **`110`** | **Asiento Principal - Nombre de Entidad** | **`$a`** Nombre de la corporación | `110 2# $a Universidad de Sevilla` |
| **`245`** | **Mención de Título** | **`$a`** Título propiamente dicho <br> **`$b`** Resto del título (subtítulo) <br> **`$c`** Mención de responsabilidad | `245 10 $a Don Quijote de la Mancha / $c Miguel de Cervantes ; edición de Francisco Rico.` |
| **`250`** | **Mención de Edición** | **`$a`** Mención de edición | `250  $a 4ª ed. corr. y aum.` |
| **`260`** | **Publicación e Imprenta** *(Histórico)* | **`$a`** Lugar de publicación <br> **`$b`** Nombre del editor <br> **`$c`** Fecha | `260  $a Madrid : $b Cátedra, $c 2019.` |
| **`264`** | **Producción, Publicación, Distribución** *(Actual)* | **`$a`** Lugar <br> **`$b`** Editor/Distribuidor <br> **`$c`** Fecha (segundo indicador `1` para publicación) | `264 #1 $a Sevilla : $b Editorial Universidad de Sevilla, $c 2023.` |
| **`300`** | **Descripción Física** | **`$a`** Extensión (páginas/volúmenes) <br> **`$b`** Otros detalles físicos (il.) <br> **`$c`** Dimensiones (altura en cm) | `300  $a 843 p. : $b il. col. y mapas ; $c 24 cm.` |
| **`490`** | **Mención de Serie** | **`$a`** Título de la serie <br> **`$v`** Número de volumen | `490 1# $a Letras hispánicas ; $v 142` |
| **`500`** | **Nota General** | **`$a`** Texto de la nota | `500  $a Bibliografía: p. 800-830.` |
| **`650`** | **Punto de Acceso de Materia - Término** | **`$a`** Término de materia (materia principal) <br> **`$v`** Subdivisión de forma | `650 #4 $a Novela de caballerías $v Crítica e interpretación` |
| **`700`** | **Asiento Secundario - Nombre de Persona** | **`$a`** Nombre personal <br> **`$e`** Término de relación (tr., ed., il.) | `700 1# $a Rico, Francisco, $e ed. lit.` |

### B. El Estándar RDA y el Modelo Conceptual IFLA LRM
Las directrices **RDA (Resource Description and Access)** sustituyeron a las Reglas de Catalogación españolas tradicionales. RDA está fundamentado teóricamente en el modelo conceptual **IFLA LRM (Library Reference Model)** (que integró y unificó los antiguos modelos FRBR, FRAD y FRSAD).

Este modelo describe los recursos bibliográficos a través de cuatro niveles jerárquicos de abstracción de datos, denominados **Entidades del Grupo 1 (Recursos)**:
1.  **Obra (Work):** Es la creación intelectual o artística de carácter abstracto. No tiene soporte físico ni código concreto, representa la idea conceptual y el contenido común (ej. la obra conceptual de *Don Quijote de la Mancha* concebida por Cervantes).
2.  **Expresión (Expression):** Es la realización intelectual o artística específica de una obra en un código determinado (alfanumérico, sonoro, visual, etc.). Identifica las traducciones, revisiones, anotaciones o adaptaciones (ej. el texto en lengua castellana original, la traducción al inglés por John Ormsby, o un audiolibro narrado de la obra).
3.  **Manifestación (Manifestation):** Es la materialización física o soporte de una expresión de una obra. Representa el objeto físico o digital producido comercialmente en serie (ej. la edición impresa en formato rústica de la editorial Cátedra de 2019, o el archivo digital en formato EPUB de la misma edición).
4.  **Ítem (Item):** Es un ejemplar físico o copia digital individual y concreta de una manifestación. Es el objeto tangible que pertenece a una biblioteca específica, se etiqueta, se inventaría y se presta (ej. el ejemplar en papel con código de barras `US-48201` y tejuelo `82 CER qui` ubicado en la Biblioteca de Humanidades de la Universidad de Sevilla).

---

## 4. Control de Colección: Inventario y Expurgo
### A. Inventario
* Recuento periódico físico de los ejemplares de las estanterías para verificar pérdidas, hurtos, errores de colocación o libros deteriorados.
* Actualmente facilitado por la tecnología **RFID**, que permite leer las etiquetas a distancia sin sacar los libros del estante.

### B. El Expurgo (Descarte)
* Retirada definitiva o almacenamiento secundario de aquellos documentos físicos de las colecciones que han perdido su utilidad o vigencia académica.
* **Criterios de expurgo:** Obsolescencia científica (especialmente en informática, medicina o legislación), desuso prolongado (sin préstamos en años), ejemplares duplicados innecesarios y mal estado de conservación.

---

## 5. Preservación y Conservación
Es el conjunto de medidas destinadas a evitar o retrasar el deterioro físico de los soportes:
* **Preservación Preventiva:** Control ambiental (temperatura 18-22 °C, humedad 45-55%), evitar la exposición directa a la luz solar, control de plagas y manipulación correcta.
* **Conservación Curativa / Restauración:** Encuadernación protectora de libros dañados y restauración experta del Fondo Antiguo y documentos raros o valiosos.
* **Preservación Digital:** Copias de seguridad periódicas de los archivos digitales, migración de formatos obsoletos a formatos abiertos estándar (ej. PDF/A) y mantenimiento de metadatos de preservación.

---

## 6. Esquema de Repaso Rápido
* **Fases del ciclo:** Selección &rarr; Adquisición &rarr; Proceso Técnico &rarr; Inventario &rarr; Expurgo &rarr; Preservación.
* **MARC21:** 245 es título (subcampos `$a` título propiamente dicho, `$b` subtítulo, `$c` mención de responsabilidad). 264 (con indicador `1`) es publicación (subcampos `$a` lugar, `$b` editor, `$c` fecha). 300 es descripción física (`$a` páginas, `$b` ilustraciones, `$c` dimensiones en cm).
* **RDA (IFLA LRM):** Relación jerárquica **Obra** (idea abstracta) &rarr; **Expresión** (código/idioma) &rarr; **Manifestación** (edición/soporte comercial) &rarr; **Ítem** (ejemplar único prestable).
* **Expurgo:** Retirada técnica de documentos obsoletos o inservibles del libre acceso.
* **Conservación preventiva:** Climatización constante (humedad media del 50%) para evitar mohos e insectos.

---

## 7. Conceptos Clave
*   **MARC21:** Formato de codificación de datos bibliográficos estandarizado internacionalmente para su lectura por ordenador.
*   **RDA (Resource Description and Access):** Nuevo estándar internacional para la descripción e identificación de recursos de información en bibliotecas.
*   **IFLA LRM:** Modelo de referencia conceptual desarrollado por la Federación Internacional de Asociaciones de Bibliotecarios y Bibliotecas para estructurar las bases de datos bibliográficas.
*   **Tejuelo:** Etiqueta adhesiva colocada en el lomo de un libro que contiene la signatura, es decir, el código de ordenación para encontrarlo en la sala.
*   **Desiderata:** Solicitud formal de compra de un documento realizada por un usuario a la biblioteca.
