# Tema 7: Sistemas de gestión bibliotecaria y plataformas. FAMA
## Plataformas de servicios de biblioteca y el catálogo FAMA de la US

---

## 1. Evolución de los Sistemas de Gestión Bibliotecaria
La automatización de las bibliotecas universitarias ha transitado por dos grandes etapas de desarrollo tecnológico:

### A. Sistemas Integrados de Gestión Bibliotecaria (SIGB) Tradicionales
Eran sistemas surgidos en los años 80 y 90 (ej. Absys, Millennium, Unicornio) diseñados para gestionar la colección física. Estaban estructurados en módulos estancos (Adquisiciones, Catalogación, Circulación/Préstamo, Control de Seriadas y el OPAC o catálogo público). No integraban de forma nativa la gestión de los recursos electrónicos, que requerían sistemas externos.

### B. Plataformas de Servicios de Biblioteca (LSP - Library Services Platforms)
Son sistemas de nueva generación (ej. **Alma**, de Ex Libris; WorldShare) desarrollados bajo arquitectura en la nube (SaaS - Software as a Service). Se diferencian de los SIGB tradicionales en:
*   **Gestión unificada de soportes:** Integran en un único flujo de trabajo los recursos impresos, electrónicos y digitales.
*   **Orientación a metadatos:** Flexibilidad para trabajar con múltiples esquemas (MARC21, Dublin Core, BIBFRAME).
*   **Interoperabilidad:** Basadas fuertemente en APIs abiertas para conectarse con otros sistemas corporativos de la universidad (ej. gestión de estudiantes de la US y RRHH).
*   **Análisis y analítica de datos:** Potentes herramientas de informes (ej. Alma Analytics).

---

## 2. Alma: La Plataforma Interna de Gestión de la BUS
La **Biblioteca de la Universidad de Sevilla (BUS)** utiliza **Alma** (de la empresa *Ex Libris*) como su sistema de gestión interna (back-office), de uso exclusivo del personal de la biblioteca.

### Las Tres Zonas de Datos en la Arquitectura de Alma
*   **Zona Institucional (Institutional Zone - IZ):** Contiene los registros bibliográficos, de autoridades y de inventario locales y exclusivos de la Universidad de Sevilla.
*   **Zona de Red (Network Zone - NZ):** Base de datos compartida por un consorcio de bibliotecas. En el caso de la BUS, está conectada a la Zona de Red del **CBUA (Consorcio de Bibliotecas Universitarias de Andalucía)**. El catálogo colectivo de la CBUA permite recuperar de forma centralizada los fondos de las **bibliotecas universitarias públicas de Andalucía** (los 9 centros miembros) para catalogación cooperativa y préstamo consorciado.
*   **Zona de Comunidad (Community Zone - CZ):** Base de datos global gestionada por *Ex Libris* que contiene registros de autoridad internacionales y carteras electrónicas provistas por las editoriales científicas a nivel mundial.

---

## 3. Primo VE y el Catálogo FAMA: La Interfaz de Descubrimiento
El catálogo **FAMA** de la Universidad de Sevilla utiliza la tecnología **Primo VE** (también de *Ex Libris*) como su front-end o herramienta de descubrimiento orientada al usuario. Primo VE sustituye al antiguo OPAC clásico.

### A. Herramientas de Descubrimiento (Discovery Tools)
*   **Concepto y Función:** Representan un sistema avanzado de recuperación de información de interfaz unificada que permite una **búsqueda integrada en los diferentes recursos de una biblioteca** (tanto fondos físicos como electrónicos contratados, bases de datos y repositorios).
*   **Recuperación de Libros Electrónicos:** FAMA no solo muestra los libros físicos de las estanterías; la **inmensa mayoría de los libros electrónicos suscritos por la BUS están descritos e indexados en FAMA**, lo que permite su recuperación y lectura directa mediante enlaces de texto completo.

### B. Sintaxis de Búsqueda y Operadores Booleanos
FAMA (Primo VE) procesa la sintaxis avanzada de búsqueda mediante reglas específicas de álgebra de Boole:
*   **Operadores Booleanos:** Deben escribirse siempre en **MAYÚSCULAS** inglesas en la caja de búsqueda.
    *   **`AND`** (Y lógico): Recupera solo documentos que contengan todos los términos (ej. `bibliotecas AND calidad`). Es el operador por defecto.
    *   **`OR`** (O lógico): Recupera documentos que contengan alguno de los términos o ambos (ej. `bibliotecas OR archivos`).
    *   **`NOT`** (NO lógico): Excluye documentos que contengan el término posterior (ej. `bibliotecas NOT escolares`).
*   **Truncamientos y Comodines:**
    *   **Asterisco (`*`):** Sustituye a cero o más caracteres al final o en medio de una palabra (ej. `bibliotec*` recupera *biblioteca, bibliotecas, bibliotecario, biblioteconomía*).
    *   **Interrogación (`?`):** Sustituye a un único carácter variable (ej. `organi?acion`).
*   **Búsqueda Exacta (Comillas `""`):** Encerrar términos entre comillas dobles obliga al motor a buscar la frase literal exacta con las palabras en ese orden preciso (ej. `"prevención de riesgos laborales"`).

### C. Refinamiento mediante Facetas e Índices
Una vez realizada la búsqueda, Primo VE permite filtrar los resultados mediante el panel lateral de **facetas** dinámicas.
*   La utilidad de las facetas consiste fundamentalmente en **filtrar y acotar los resultados de una búsqueda previa**, facilitando al usuario acotar de forma rápida su consulta sin tener que reformular la cadena de búsqueda. Las facetas principales son: Disponibilidad (Acceso en línea / Disponible en biblioteca), Tipo de recurso (Libros, artículos), y Biblioteca de centro.

### D. Funcionalidades transaccionales de "Mi Cuenta"
Al iniciar sesión con las credenciales del **UVUS**, FAMA ofrece un portal personal desde el cual el usuario puede interactuar de forma autónoma:
*   **Renovar préstamos:** Ampliar la fecha de vencimiento de las monografías físicas en su poder (siempre que el documento no esté reservado por otro usuario).
*   **Reservar ejemplares:** Solicitar el envío de un libro (límite de **5 reservas** simultáneas para Doctorandos, Máster, Investigadores y PAS/PTGAS).
*   **Crear desideratas:** Rellenar un formulario formal proponiendo a la BUS la compra de libros que no se encuentren en su colección.
*   **Exportación de referencias:** Generar la cita del documento y exportarla directamente a gestores bibliográficos (ej. Mendeley).

---

## 4. Esquema de Repaso Rápido
*   **Alma:** Back-office (trabajo del personal de la biblioteca, en la nube).
*   **Primo VE:** Front-end (interfaz web del catálogo FAMA para los usuarios).
*   **Las 3 Zonas de Alma:** **Institucional** (local US), **de Red** (consorcio CBUA) y **de Comunidad** (catálogos y recursos e- globales).
*   **Operadores Booleanos:** En mayúsculas obligatorias (`AND`, `OR`, `NOT`).
*   **Comodines de búsqueda:** `*` para caracteres múltiples; `?` para carácter único. Frase exacta entre comillas `""`.
*   **Mi Cuenta en FAMA:** Permite reservas, desideratas y renovaciones iniciando sesión con el **UVUS**.

---

## 5. Reglas Mnemotécnicas para el Examen
*   **Las Tres Zonas de Alma: "I-N-C" (De local a global):**
    *   **I**nstitucional (IZ): Local (US).
    *   **N**etwork / Red (NZ): Regional (CBUA).
    *   **C**omunidad (CZ): Global (Ex Libris/Editoriales).
    *   *Mnemónico:* *"**I**glesia **N**acional **C**atólica: **I**nstitucional, **N**etwork (Red), **C**omunidad".*
*   **Mayúsculas en Booleanos: "El Booleano Grita" (AND, OR, NOT):**
    *   En FAMA, los operadores lógicos deben ir obligatoriamente en MAYÚSCULAS.
    *   *Mnemónico:* *"A Boole le gusta gritar: ¡AND! ¡OR! ¡NOT! Si lo escribes en minúsculas susurrando, FAMA lo ignorará".*

---

## 6. Conceptos Clave
*   **LSP (Library Services Platform):** Plataforma de servicios bibliotecarios en la nube que gestiona de manera unificada flujos de trabajo físicos y electrónicos (ej. Alma).
*   **Herramienta de Descubrimiento:** Motor de búsqueda web (como Primo VE) que indexa y recupera de forma simultánea registros locales y colecciones de bases de datos globales.
*   **Zona de Red (Network Zone):** Arquitectura compartida de Alma que permite al Consorcio CBUA compartir registros bibliográficos en tiempo real para optimizar tareas técnicas.
*   **Faceta:** Elemento del menú lateral del catálogo que clasifica y filtra los resultados de búsqueda activos según metadatos específicos (idioma, biblioteca, soporte).

---

## 7. Bibliografía
*   **Alma: Plataforma de Servicios de Biblioteca (Ex Libris)**.
*   **Primo VE: Catálogo integrado de la BUS - FAMA (Ex Libris)**.
