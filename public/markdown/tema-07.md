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

### A. Las Tres Zonas de Datos en la Arquitectura de Alma
*   **Zona Institucional (Institutional Zone - IZ):** Contiene los registros bibliográficos, de autoridades y de inventario locales y exclusivos de la Universidad de Sevilla.
*   **Zona de Red (Network Zone - NZ):** Base de datos compartida por un consorcio de bibliotecas. En el caso de la BUS, está conectada a la Zona de Red del **CBUA (Consorcio de Bibliotecas Universitarias de Andalucía)**. El catálogo colectivo de la CBUA permite recuperar de forma centralizada los fondos de las **bibliotecas universitarias públicas de Andalucía** (los 9 centros miembros) para catalogación cooperativa y préstamo consorciado.
*   **Zona de Comunidad (Community Zone - CZ):** Base de datos global gestionada por *Ex Libris* que contiene registros de autoridad internacionales y carteras electrónicas provistas por las editoriales científicas a nivel mundial.

### B. Módulos Operativos Principales de Alma
1.  **Módulo de Recursos (Catalogación e Inventario):** Creación y edición de registros bibliográficos en MARC21/RDA, gestión del árbol de inventario (Registros de fondos y ejemplares/ítems) e importación de registros.
2.  **Módulo de Adquisiciones:** Gestión de líneas de pedido (POL - Purchase Order Lines), proveedores, facturas, presupuestos e interconexión con el sistema de contabilidad de la US.
3.  **Módulo de Servicios al Usuario (Circulación):** Mostrador de préstamo, devoluciones, reservas, aplicación de sanciones/suspensiones y configuración de políticas de circulación.
4.  **Módulo Alma Analytics:** Herramienta de inteligencia de negocio basada en *Oracle BI* para la generación de informes estadísticos cualitativos y cuantitativos requeridos por la BUS y REBIUN.

### C. Protocolos Técnicos de Interoperabilidad Bibliotecaria
Alma interactúa con plataformas externas mediante protocolos estandarizados:
*   **OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting):** Protocolo para la recolección masiva de metadatos XML, fundamental para la exportación de registros al repositorio idUS.
*   **SIP2 / NCIP:** Protocolos de intercambio de datos de usuarios y transacciones de préstamo para la integración de estaciones de autopréstamo y arcos antihurto RFID.
*   **SRU / SRW (Search/Retrieve via URL/Web):** Protocolos basados en XML y HTTP para la recuperación web de registros bibliográficos mediante consultas Z39.50 evolucionadas.

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
*   **Alma:** Back-office (SaaS en la nube para personal técnico).
*   **Primo VE:** Front-end (herramienta de descubrimiento del catálogo FAMA).
*   **Las 3 Zonas de Alma:** **Institucional** (US), **de Red** (CBUA) y **de Comunidad** (Global).
*   **Módulos de Alma:** Recursos, Adquisiciones (líneas POL), Servicios al Usuario y Analytics.
*   **Protocolos Técnicos:** OAI-PMH (recolección de metadatos XML), SIP2/NCIP (autoestaciones), SRU/SRW.
*   **Operadores Booleanos:** En mayúsculas obligatorias (`AND`, `OR`, `NOT`).
*   **Comodines de búsqueda:** `*` (múltiples caracteres), `?` (carácter único), `""` (frase exacta).

---

## 5. Reglas Mnemotécnicas para el Examen
*   **Las Tres Zonas de Alma: "I-N-C" (De local a global):**
    *   **I**nstitucional (IZ): Local (US).
    *   **N**etwork / Red (NZ): Regional (CBUA).
    *   **C**omunidad (CZ): Global (Ex Libris/Editoriales).
*   **Los Protocolos Técnicos: "O-S-N" (OAI, SIP2, NCIP):**
    *   **OAI**-PMH: Recolección para Repositorios (idUS).
    *   **SIP2** / **NCIP**: Conexión de Máquinas y Autoestaciones con Alma.

---

## 6. Conceptos Clave
*   **LSP (Library Services Platform):** Plataforma de servicios bibliotecarios en la nube que gestiona de manera unificada flujos de trabajo físicos y electrónicos (ej. Alma).
*   **POL (Purchase Order Line):** Línea de orden de compra en el módulo de Adquisiciones de Alma que vincula un registro bibliográfico con la partida presupuestaria.
*   **OAI-PMH:** Protocolo estandarizado para la recolección e intercambio distribuido de metadatos bibliográficos basados en XML.
*   **Faceta:** Elemento del menú lateral del catálogo que clasifica y filtra los resultados de búsqueda activos.

---

## 7. Bibliografía
*   **Alma: Plataforma de Servicios de Biblioteca (Ex Libris / Clarivate)**.
*   **Primo VE: Catálogo integrado de la BUS - FAMA (Ex Libris)**.
*   **Especificaciones del Protocolo OAI-PMH v2.0 (Open Archives Initiative)**.
*   **Guías de la Biblioteca de la Universidad de Sevilla (Guías BUS)**: Disponible en https://guiasbus.us.es/.


<div class="app-promo-banner footer-promo" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1.5px solid #3b82f6; border-radius: 10px; padding: 14px 18px; margin-top: 24px; margin-bottom: 10px; text-align: center; font-family: Arial, sans-serif; box-shadow: 0 2px 10px rgba(37, 99, 235, 0.08); page-break-inside: avoid; break-inside: avoid;">

  <div style="font-size: 1.05rem; font-weight: 800; color: #1e3a8a; margin-bottom: 6px; letter-spacing: 0.5px;">
    🚀 ¡COMPLEMENTA TU ESTUDIO CON LA APP INTERACTIVA ONLINE! 🚀
  </div>

  <p style="font-size: 0.85rem; color: #475569; margin: 0 0 10px 0; font-weight: 500;">
    Pon a prueba tus conocimientos en tiempo real y entrena en condiciones reales de examen:
  </p>

  <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; text-align: left;">
    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.84rem; line-height: 1.6; color: #334155; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;">
      <li>📝 <strong>+2.000 Preguntas por Tema:</strong> Tests específicos de los 20 temas.</li>
      <li>🎯 <strong>15 Simulacros Predefinidos:</strong> 600 preguntas únicas sin repetición.</li>
      <li>📜 <strong>Exámenes Reales (2019, 2022):</strong> Practica con pruebas oficiales anteriores.</li>
      <li>⚙️ <strong>Simulacros Infinitos:</strong> Configuración a medida por tema o globales.</li>
      <li>🎴 <strong>Flashcards de Memorización:</strong> Plazos, fórmulas, normas ISO y leyes.</li>
      <li>📈 <strong>Repaso de Fallos & Sellos:</strong> Corrección instantánea y registro de errores.</li>
    </ul>
  </div>

  <div style="margin-top: 10px;">
    <a href="https://oposiciones-bus-app.vercel.app/" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 800; font-size: 0.88rem; padding: 9px 22px; border-radius: 50px; text-decoration: none; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25); text-transform: uppercase;">
      👉 ENTRAR AHORA A OPOSICIONES-BUS-APP 👈
    </a>
  </div>

  <p style="font-size: 0.78rem; color: #64748b; margin: 8px 0 0 0; font-weight: 600;">
    🌐 <strong>https://oposiciones-bus-app.vercel.app/</strong> — Acceso libre desde móvil, tablet u ordenador
  </p>

</div>
