# Tema 5: Gestión de la colección
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

## 2. Selección y Adquisición

### A. Selección y Detección de Necesidades
La selección consiste en decidir qué materiales (físicos o digitales) entran a formar parte de la biblioteca. En la BUS es un proceso **corresponsable y mixto**:
1.  **Personal bibliotecario:** Se encarga de adquirir manuales básicos de las asignaturas (bibliografía recomendada de las guías docentes), aplicando un escalonamiento de ejemplares según el número de alumnos (debiendo mantenerse **15 ejemplares** en la biblioteca si la asignatura supera los **800 alumnos** matriculados), así como obras de referencia general y el mantenimiento y equilibrio de colecciones transversales.
2.  **Comunidad académica (PDI):** Los profesores e investigadores solicitan la adquisición de monografías especializadas para su docencia y proyectos de investigación.
3.  **Estudiantes (Desideratas):** Son las peticiones formales de compra que los propios estudiantes pueden realizar a través de un formulario en la web de la BUS o desde su perfil personal en el catálogo **FAMA**. La biblioteca evalúa la pertinencia académica y presupuestaria antes de aprobarlas.

### B. Modos de Adquisición (Vías Principales)
1.  **Compra:** Es el método principal para manuales de estudiantes y recursos electrónicos.
    *   **Compra Directa:** Adquisición de títulos sueltos en papel o digital mediante proveedores u oficinas de compras de la US.
    *   **Suscripción:** Pago periódico (generalmente anual) indispensable para dar acceso a revistas científicas electrónicas (*e-journals*) y bases de datos.
    *   **Grandes Lotes (Big Deals):** Negociaciones unificadas (a menudo consorciadas) que adquieren paquetes completos de libros o revistas de un gran editor científico.
2.  **Donación o Regalo:** Entrega gratuita de documentos por parte de particulares, profesores o instituciones.
    *   *Filtro de la BUS:* La donación no se acepta automáticamente. Solo se ingresan fondos de interés docente o de investigación real, que estén en buen estado físico y que no impliquen costes ocultos de almacenamiento y catalogación desproporcionados para la biblioteca.
3.  **Canje o Intercambio:** Acuerdo de reciprocidad institucional entre la Universidad de Sevilla y otras universidades o centros de investigación. Se intercambian publicaciones propias (por ejemplo, las editadas por la **Editorial Universidad de Sevilla** o tesis doctorales de idUS) para enriquecer mutuamente los fondos.
4.  **Depósito Legal:** Aunque afecta principalmente a bibliotecas públicas provinciales y autonómicas, las bibliotecas universitarias pueden actuar como depositarias de determinados materiales de su entorno de forma residual.

---

## 3. Tratamiento Técnico de los Fondos

Una vez que el documento es adquirido, debe procesarse técnicamente para permitir su almacenamiento sistemático y recuperación rápida por el usuario:

*   **Registro:** Asignación de un número de orden correlativo único a cada ejemplar físico que acredita legalmente su propiedad por la Universidad de Sevilla (número de registro).
*   **Catalogación:** Descripción formal y física del documento bajo normativas internacionales. Actualmente se utiliza el estándar **RDA** y el formato de intercambio de datos **MARC21**.
*   **Clasificación y Asignación de Materias:** Análisis de contenido para clasificarlo temáticamente en los estantes físicos usando la **CDU (Clasificación Decimal Universal)**.
*   **Procesamiento Físico:** Colocación de etiquetas de tejuelo (signatura topográfica), código de barras, etiqueta RFID de seguridad y sellado físico de propiedad.

### A. El Formato de Catalogación MARC21
MARC21 (*MAchine-Readable Cataloging*) es el estándar que estructura los metadatos bibliográficos mediante etiquetas numéricas de tres cifras (campos de la serie `000` a `900`) e indicadores, dividiendo la información interna mediante **subcampos** precedidos por un código delimitador (habitualmente el signo `$`).

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
Las directrices **RDA (Resource Description and Access)** sustituyeron a las Reglas de Catalogación españolas tradicionales. RDA está fundamentado teóricamente en el modelo conceptual **IFLA LRM (Library Reference Model)**. 

Este modelo describe los recursos bibliográficos a través de cuatro niveles jerárquicos de abstracción de datos, denominados **Entidades del Grupo 1 (Recursos)**:
1.  **Obra (Work):** Es la creación intelectual o artística de carácter abstracto. No tiene soporte físico ni código concreto, representa la idea conceptual y el contenido común (ej. la obra conceptual de *Don Quijote de la Mancha* concebida por Cervantes).
2.  **Expression (Expresión):** Es la realización intelectual o artística específica de una obra en un código determinado (alfanumérico, sonoro, visual, etc.). Identifica las traducciones, revisiones, anotaciones o adaptaciones (ej. el texto en lengua castellana original, la traducción al inglés por John Ormsby, o un audiolibro narrado).
3.  **Manifestación (Manifestation):** Es la materialización física o soporte de una expresión de una obra. Representa el objeto físico o digital producido comercialmente en serie (ej. la edición impresa en formato rústica de la editorial Cátedra de 2019, o el archivo digital en formato EPUB de la misma edición).
4.  **Ítem (Item):** Es un ejemplar físico o copia digital individual y concreta de una manifestación. Es el objeto tangible que pertenece a una biblioteca específica, se etiqueta, se inventaría y se presta (ej. el ejemplar en papel con código de barras `US-48201` y tejuelo `82 CER qui` ubicado en la Biblioteca de Humanidades de la US).

---

## 4. Control de Colección: Inventario y Expurgo

### A. Inventario
*   Recuento periódico físico de los ejemplares de las estanterías para verificar pérdidas, hurtos, errores de colocación o libros deteriorados.
*   Actualmente facilitado por la tecnología **RFID**, que permite leer las etiquetas a distancia de manera masiva y sin sacar los libros del estante.

### B. El Expurgo (Weeding)
Es la operación técnica de **retirada selectiva** de documentos de las secciones de libre acceso de la biblioteca. Están **totalmente excluidos del expurgo o descarte los manuscritos, incunables** y cualquier obra de valor histórico, artístico o archivístico singular. Un documento expurgado puede tener tres destinos en la BUS:
1.  **Traslado al depósito:** El libro físico sale de la sala de libre acceso porque se consulta poco, pero se conserva en un depósito cerrado o almacén secundario porque mantiene valor histórico o de investigación.
2.  **Donación:** Se ofrece gratuitamente a otras instituciones o bibliotecas en desarrollo si mantiene valor de lectura pero no utilidad curricular en la US.
3.  **Destrucción / Reciclaje:** Si el documento está físicamente inservible (roto o con hongos) o su contenido está completamente obsoleto y carece de interés histórico (ej. un manual informático de MS-DOS de los años 90).

### Criterios Técnicos de Expurgo (El método CREW / MUSTIE)
Para justificar de forma objetiva por qué se retira un libro físico, se suelen aplicar criterios internacionales condensados en las siglas **MUSTIE**:
*   **M** (*Misleading*): Contenido obsoleto, desactualizado o científicamente superado (ej. medicina o derecho antiguo).
*   **U** (*Ugly*): Deteriorado físicamente, roto, subrayado de forma irreversible.
*   **S** (*Superseded*): Ha sido reemplazado por una edición más nueva o un formato electrónico mejor.
*   **T** (*Trivial*): Carece de valor científico o literario duradero.
*   **I** (*Irrelevant*): Ya no se imparte esa materia en la universidad y ningún usuario lo solicita.
*   **E** (*Elsewhere*): Se puede conseguir fácilmente mediante Préstamo Interbibliotecario o está en acceso abierto en la red.

---

## 5. Preservación y Conservación

Es el conjunto de medidas destinadas a asegurar y prolongar la vida útil de los documentos.

### A. Conservación Preventiva
*   **Parámetros ambientales:** Control de temperatura constante (entre 18-22 °C), humedad relativa (45-55%), y evitación de luz ultravioleta directa (solar o tubos fluorescentes).
*   **Almacenamiento de volúmenes pesados:** Según las normas de uso y conservación de fondos valiosos de la BUS, los libros muy pesados o de formatos inusuales (como gran folio) **no deben apilarse** en torres y se procurará mantenerlos en **posición horizontal** para evitar que cedan las costuras y encuadernaciones.
*   **Conservación de Folletos de Fondo Antiguo:** Según el Capítulo II de las Normas para uso y conservación del Fondo Antiguo y Archivo Histórico de la BUS, los folletos históricos deben **guardarse en cajas cerradas de material no ácido** para evitar su deterioro físico y la acidez.
*   **Higiene:** Limpieza sistemática para evitar plagas de insectos bibliófagos y mohos.
*   **Encuadernación y restauración:** Encuadernación protectora de libros dañados y restauración experta del Fondo Antiguo y documentos raros o valiosos.

### B. Preservación Digital
*   **Acceso continuo:** Garantizar que los e-books, e-journals y los contenidos del repositorio institucional (**idUS**) sigan siendo accesibles a pesar del rápido cambio de software y hardware.
*   **Mecanismos:** Copias de seguridad periódicas redundantes, migración sistemática de formatos propietarios a formatos abiertos estándares y duraderos (como PDF/A), y mantenimiento de metadatos de preservación.

---

## 6. Esquema de Repaso Rápido

*   **Política de Gestión de la BUS:** Equilibrio, evitar duplicidad física y priorizar recursos digitales.
*   **Fases del ciclo:** Selección &rarr; Adquisición &rarr; Proceso Técnico &rarr; Conservación &rarr; Inventario &rarr; Expurgo.
*   **Vías de Selección:** Bibliotecarios (bibliografía básica), PDI (investigación/docencia), Alumnos (**Desideratas** vía FAMA/web).
*   **Vías de Adquisición:** Compra (directa, suscripción, big deals), Donación (revisión rigurosa), Canje (intercambio mutuo, Editorial US) y Depósito Legal (residual).
*   **MARC21:** 245 es título (subcampos `$a` título propiamente dicho, `$b` subtítulo, `$c` mención de responsabilidad). 264 es publicación (subcampos `$a` lugar, `$b` editor, `$c` fecha). 300 es descripción física (`$a` páginas, `$b` ilustraciones, `$c` dimensiones en cm).
*   **RDA (IFLA LRM):** Relación jerárquica **Obra** (idea abstracta) &rarr; **Expresión** (idioma/código) &rarr; **Manifestación** (edición comercial/soporte) &rarr; **Ítem** (ejemplar único con signatura y código de barras).
*   **Expurgo:** Retirada técnica justificada del libre acceso. Destinos: depósito, donación o destrucción.
*   **MUSTIE:** **M**isleading (obsoleto), **U**gly (deteriorado), **S**uperseded (sustituido), **T**rivial (sin valor), **I**rrelevant (sin uso), **E**lsewhere (disponible en otro sitio/PI).
*   **Conservación preventiva:** Climatización constante (humedad media del 50%) para evitar mohos e insectos.

---

## 7. Conceptos Clave

*   **MUSTIE:** Método normalizado internacionalmente que condensa en seis siglas los criterios objetivos para la retirada o descarte de libros.
*   **Desiderata:** Solicitud formal de compra de un documento realizada por un usuario a la biblioteca a través de FAMA o formulario web.
*   **MARC21:** Formato de codificación de datos bibliográficos estandarizado internacionalmente para su lectura por ordenador.
*   **RDA (Resource Description and Access):** Estándar de catalogación estructurado para describir recursos en el entorno digital y bases de datos modernas.
*   **Canje:** Intercambio mutuo y cooperativo de publicaciones propias entre universidades u organismos científicos.
*   **Expurgo:** Operación técnica de retirada o descarte de fondos sobrantes u obsoletos para desatascar las salas de libre acceso de la biblioteca.
