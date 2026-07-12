# Tema 7: Sistemas de gestión bibliotecaria y FAMA
## Plataformas de servicios de biblioteca y el catálogo FAMA de la US

---

## 1. Evolución de los Sistemas de Gestión Bibliotecaria

### A. SIGB (Sistemas Integrados de Gestión Bibliotecaria) Tradicionales
*   **Origen y diseño:** Surgidos a finales del siglo XX (ejemplos: Millennium, Absys, Unicorn, SirsiDynix Symphony).
*   **Arquitectura modular:** Estructura modular rígida con bases de datos relacionales locales. Cada módulo funciona de forma casi independiente (Adquisiciones, Catalogación, Préstamo/Circulación, Control de Seriadas y el OPAC o catálogo web de cara al público).
*   **Limitación de soportes:** Concebidos exclusivamente para gestionar el procesamiento físico de documentos en papel u otros soportes tangibles. No integraban de forma nativa la gestión de los recursos electrónicos (revistas o libros electrónicos), que requerían sistemas externos adicionales (como gestores de enlaces ERM).

### B. Plataformas de Servicios de Biblioteca (LSP - Library Services Platforms)
*   **Definición y tecnología:** Sistemas de nueva generación basados en arquitectura de **computación en la nube (SaaS - Software as a Service)** (ejemplos: **Alma** de *Ex Libris*, Folio, WorldShare de OCLC).
*   **Gestión unificada:** Integran en una única plataforma el ciclo de vida completo de los recursos impresos, electrónicos y digitales de la biblioteca.
*   **Características operativas:**
    *   Uso intensivo de **APIs** para la interoperabilidad con sistemas externos de la universidad (gestión de estudiantes, contabilidad, portales de investigación).
    *   Herramientas integradas de **Business Intelligence (Analíticas)** para evaluación predictiva del uso de recursos.
    *   Flujos de trabajo colaborativos y metadatos compartidos globalmente.

---

## 2. Alma: La Plataforma Interna de Gestión de la BUS
La **Biblioteca de la Universidad de Sevilla (BUS)** utiliza **Alma** (de la multinacional *Ex Libris*) como su sistema de gestión interna (back-office). Alma no es accesible para el público general; es de uso exclusivo del personal técnico de la biblioteca.

### A. Las Tres Zonas de Datos en la Arquitectura de Alma
Una de las mayores ventajas de Alma es su división de bases de datos para permitir la catalogación colaborativa y el ahorro de espacio en la nube:
1.  **Zona Institucional (Institutional Zone - IZ):** Contiene los registros bibliográficos, de autoridades y de inventario locales y exclusivos de la Universidad de Sevilla. Es visible y editable únicamente por el personal de la US.
2.  **Zona de Red (Network Zone - NZ):** Base de datos compartida por un consorcio de bibliotecas. En el caso de la BUS, está conectada a la Zona de Red del **CBUA (Consorcio de Bibliotecas Universitarias de Andalucía)**. El catálogo colectivo de la CBUA permite recuperar de forma centralizada y unificada los fondos de las **bibliotecas universitarias públicas de Andalucía** (los 9 centros miembros), facilitando la catalogación cooperativa y el préstamo consorciado.
3.  **Zona de Comunidad (Community Zone - CZ):** Base de datos global gestionada por *Ex Libris* que contiene registros de autoridad internacionales (ej. Library of Congress) y, fundamentalmente, carteras electrónicas y colecciones de revistas/libros electrónicos provistas por las editoriales científicas a nivel mundial. Facilita la activación de recursos digitales con un solo clic.

### B. Flujos de Trabajo en el Back-office de Alma
El personal de la BUS trabaja en Alma estructurando sus tareas diarias en tres grandes áreas:
*   **Adquisiciones:** Tramitación de desideratas de usuarios, creación de órdenes de compra (pedidos), recepción física de materiales, control de facturación y activación de suscripciones electrónicas periódicas.
*   **Recursos (Catalogación e Inventario):** Catalogación de documentos bajo normas internacionales, control de autoridades (unificación de firmas de autores), importación de registros mediante protocolo Z39.50, y gestión del inventario físico (creación de códigos de barras y localizaciones).
*   **Servicios al Usuario (Circulación):** Tramitación física de préstamos, devoluciones, reservas de salas, gestión de sanciones por demora y digitalización de documentos bajo demanda.

---

## 3. Primo VE y el Catálogo FAMA: La Interfaz de Descubrimiento
El catálogo **FAMA** de la Universidad de Sevilla utiliza la tecnología **Primo VE** (también de *Ex Libris*) como su front-end o herramienta de descubrimiento orientada al usuario. Primo VE sustituye al antiguo OPAC clásico.

### A. Herramientas de Descubrimiento (Discovery Tools)
*   **Concepto y Función:** Representan un sistema avanzado de recuperación de información de interfaz unificada que permite una **búsqueda integrada en los diferentes recursos de una biblioteca** (tanto fondos físicos como electrónicos contratados, bases de datos y repositorios).

### B. Tipos de Búsqueda en FAMA
*   **Búsqueda Simple:** Caja única que busca palabras clave de forma transversal en todos los campos (título, autor, materia, notas) sobre todo el índice de la biblioteca y recursos electrónicos externos.
*   **Búsqueda Avanzada:** Permite combinar múltiples campos de búsqueda específicos mediante el uso de operadores lógicos y filtros en una misma consulta. Los campos indexados principales son: *Título, Autor, Materia, ISBN/ISSN, Editor, Signatura* y *Código de barras*.

### B. Sintaxis de Búsqueda y Operadores Booleanos
FAMA (Primo VE) procesa la sintaxis avanzada de búsqueda mediante reglas específicas de álgebra de Boole:
*   **Operadores Booleanos:** Deben escribirse siempre en **MAYÚSCULAS** inglesas en la caja de búsqueda.
    *   **`AND`** (Y lógico): Recupera solo documentos que contengan todos los términos (ej. `bibliotecas AND calidad`). Es el operador por defecto si se escriben palabras sueltas.
    *   **`OR`** (O lógico): Recupera documentos que contengan alguno de los términos o ambos (ej. `bibliotecas OR archivos`). Útil para sinónimos.
    *   **`NOT`** (NO lógico): Excluye documentos que contengan el término posterior (ej. `bibliotecas NOT escolares`).
*   **Truncamientos y Comodines:**
    *   **Asterisco (`*`):** Sustituye a cero o más caracteres al final o en medio de una palabra (ej. `bibliotec*` recupera *biblioteca, bibliotecas, bibliotecario, biblioteconomía*).
    *   **Interrogación (`?`):** Sustituye a un único carácter variable (ej. `organi?acion` recupera tanto *organizacion* como *organisation*).
*   **Búsqueda Exacta (Comillas `""`):** Encerrar términos entre comillas dobles obliga al motor a buscar la frase literal exacta con las palabras en ese orden preciso (ej. `"prevención de riesgos laborales"`).

### C. Refinamiento mediante Facetas e Índices
Una vez realizada la búsqueda, Primo VE permite filtrar los resultados mediante el panel lateral de **facetas** dinámicas. La utilidad de las facetas consiste fundamentalmente en **filtrar y acotar los resultados de una búsqueda previa**, facilitando al usuario acotar de forma rápida su consulta sin tener que reformular la cadena de búsqueda. Las facetas principales son:
*   **Disponibilidad:** Filtrar por *Disponible en la biblioteca* (físico), *Acceso en línea* (electrónico/digital), o *Recursos de acceso abierto*.
*   **Tipo de recurso:** Limitar a libros, artículos científicos, revistas, tesis doctorales, material audiovisual o patentes.
*   **Biblioteca de centro:** Filtrar la ubicación a una biblioteca física específica de la US (ej. Biblioteca de Derecho y Ciencias del Trabajo, Biblioteca de Ingeniería, etc.).
*   **Otros filtros:** Fecha de publicación (rangos de años), idioma del documento, autor específico y materia principal.

### D. Funcionalidades transaccionales de "Mi Cuenta"
Al iniciar sesión con las credenciales del **UVUS** (Usuario Virtual de la Universidad de Sevilla), FAMA ofrece un portal personal desde el cual el usuario puede interactuar con el sistema de la BUS de forma autónoma:
*   **Renovar préstamos:** Ampliar la fecha de vencimiento de las monografías físicas en su poder (siempre que el documento no esté reservado por otro usuario).
*   **Reservar ejemplares:** Solicitar el envío de un libro prestado o de otra sucursal de la US hacia su mostrador de recogida preferido.
*   **Historial de actividad:** Visualización de préstamos activos, solicitudes históricas y control de sanciones/multas por días de demora acumulados.
*   **Gestión de favoritos:** Guardar búsquedas complejas para recibir alertas por correo electrónico cuando entren nuevos documentos afines, y organizar un listado de referencias favoritas.
*   **Crear desideratas:** Rellenar un formulario formal proponiendo a la BUS la compra de libros que no se encuentren en su colección.
*   **Exportación de referencias:** Generar la cita del documento y exportarla directamente a gestores bibliográficos soportados (ej. Mendeley).

---

## 4. Esquema de Repaso Rápido
*   **Alma:** Back-office (trabajo del personal de la biblioteca, en la nube).
*   **Primo VE:** Front-end (interfaz web del catálogo FAMA para los usuarios).
*   **Las 3 Zonas de Alma:** **Institucional** (local US), **de Red** (consorcio CBUA) y **de Comunidad** (catálogos y recursos e- globales).
*   **Operadores Booleanos:** En mayúsculas obligatorias (`AND`, `OR`, `NOT`).
*   **Comodines de búsqueda:** `*` para caracteres múltiples; `?` para carácter único. Frase exacta entre comillas `""`.
*   **Mi Cuenta en FAMA:** Permite reservas, desideratas, renovaciones y ver penalizaciones iniciando sesión con el **UVUS**.

---

## 5. Reglas Mnemotécnicas para el Examen
Para memorizar fácilmente los detalles de Alma y Primo VE, utiliza estas reglas:

*   **Las Tres Zonas de Alma: "I-N-C" (De local a global):**
    *   **I**nstitucional (IZ): Local (US).
    *   **N**etwork / Red (NZ): Regional (CBUA).
    *   **C**omunidad (CZ): Global (Ex Libris/Editoriales).
    *   *Mnemónico:* *"**I**glesia **N**acional **C**atólica: **I**nstitucional, **N**etwork (Red), **C**omunidad".*
*   **Mayúsculas en Booleanos: "El Booleano Grita" (AND, OR, NOT):**
    *   En FAMA, los operadores lógicos deben ir obligatoriamente en MAYÚSCULAS.
    *   *Mnemónico:* *"A Boole le gusta gritar: ¡AND! ¡OR! ¡NOT! Si lo escribes en minúsculas susurrando, FAMA lo ignorará".*
*   **Comodines de Truncamiento: "Una Estrella (Asterisco) brilla mucho y una Pregunta duda de una cosa":**
    *   El asterisco (`*`) brilla y sustituye a **muchos** caracteres (truncamiento múltiple).
    *   La interrogación (`?`) duda de **un** único carácter variable.
    *   *Mnemónico:* *"La estrella (`*`) es grande (múltiples caracteres), la pregunta (`?`) es un solo punto (un carácter)".*

---

## 6. Conceptos Clave
*   **LSP (Library Services Platform):** Plataforma de servicios bibliotecarios en la nube que gestiona de manera unificada flujos de trabajo físicos y electrónicos (ej. Alma).
*   **Herramienta de Descubrimiento:** Motor de búsqueda web (como Primo VE) que indexa y recupera de forma simultánea registros locales y colecciones de bases de datos globales.
*   **Zona de Red (Network Zone):** Arquitectura compartida de Alma que permite al Consorcio CBUA compartir registros bibliográficos en tiempo real para optimizar tareas técnicas.
*   **Faceta:** Elemento del menú lateral del catálogo que clasifica y filtra los resultados de búsqueda activos según metadatos específicos (idioma, biblioteca, soporte).
