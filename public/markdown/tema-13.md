# Tema 13: Herramientas digitales: Microsoft 365

<div class="app-promo-banner header-promo">

> 📱 **ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP**  
> Accede a **oposiciones-bus-app** (https://oposiciones-bus-app.vercel.app) para complementar tu lectura:
> * 🎴 **Flashcards:** Memoriza las herramientas de Microsoft 365 (Outlook, OneDrive, SharePoint, Teams, Word, Excel) y las tablas de atajos de teclado de examen.
> * 📝 **Modo Test:** Pon a prueba este tema con preguntas tipo test validadas de opción múltiple.

</div>

## Correo electrónico (Outlook) y herramientas de Microsoft 365 (OneDrive, SharePoint, Teams, Word, Excel, etc.)

---

## 1. El Entorno Colaborativo Microsoft 365 en la Universidad de Sevilla
La Universidad de Sevilla ofrece a todo su Personal Técnico, de Gestión y de Administración y Servicios (PTGAS / Laboral) y comunidad universitaria acceso a la suite **Microsoft 365** como plataforma principal de comunicación, ofimática y almacenamiento en la nube, gestionada por el Servicio de Informática y Comunicaciones (SIC).

### Identidad Digital, UVUS y Mecanismos de Acceso
*   **UVUS (Usuario Virtual de la Universidad de Sevilla):** Credencial electrónica personal e intransferible indispensable para acceder a los sistemas informáticos de la US, correo Outlook corporativo, redes inalámbricas y catálogo FAMA.
*   **Gestión del UVUS:** Para cambio de claves o parámetros de seguridad, el usuario debe acceder al portal oficial: **`https://identidad.us.es`**.
*   **Cuentas Corporativas:** Formato `usuario@us.es` para personal (PTGAS/PDI) y `usuario@alum.us.es` para estudiantes.
*   **Portales de Acceso Centralizado:** Portal corporativo US **`https://o365.us.es`** o acceso en la nube **`https://portal.office.com`** mediante Single Sign-On (SSO) y autenticación multifactor (MFA).
*   **Multidispositivo:** Cada cuenta permite activar la suite hasta en 5 dispositivos locales (PC/Mac, tablets, móviles), combinando el uso de aplicaciones web y ejecutable de escritorio.

<div class="app-promo-banner mid-promo">

> 💡 **REPASO RÁPIDO EN LA APP:**  
> ¿Te cuesta memorizar los atajos de examen o los procedimientos de SharePoint? Entra en la app (https://oposiciones-bus-app.vercel.app) y repasa las **Tarjetas de Memorización** de este tema.

</div>

---

## 2. Correo Electrónico y Agenda: Microsoft Outlook 365
*   **Formas de Acceso:** Acceso web directo mediante **`https://outlook.office.com`** o ejecutable local `Outlook.exe`.
*   **Vista Backstage (Pestaña Archivo):** Permite ver el tamaño del buzón y programar las **Respuestas Automáticas (Fuera de Oficina)** para periodos vacacionales, redactando dos mensajes diferenciados: *Dentro de mi organización* y *Fuera de mi organización*.
*   **Encabezados y LOPD:**
    *   `Para`: Destinatarios principales del mensaje.
    *   `CC` (Copia de carbón): Destinatarios en copia de conocimiento pública.
    *   `CCO` (Copia de carbón oculta): **¡Concepto Clave de Examen!** El uso de CCO es obligatorio en envíos masivos a múltiples destinatarios externos para evitar la revelación no autorizada de correos personales conforme a la LOPDGDD 3/2018.
*   **Lista de Direcciones Globales (GAL):** Directorio centralizado gestionado por el SIC que contiene las direcciones de correo actualizadas de todo el personal (PDI, PTGAS) y estudiantes de la US.
*   **Reglas de Bandeja de Entrada:** Filtros automáticos ejecutados en el servidor que procesan correos entrantes según remitente o palabras clave.
*   **Gestión AntiSPAM:** En las cuentas de M365 corporativas de la US, la configuración detallada del filtro antiSPAM del buzón **sólo puede gestionarse desde la OWA** (Outlook Web App, interfaz web).

![Figura 1: Interfaz web de Microsoft Outlook 365 (Bandeja de entrada de correo)](/images/tema13/figura1_outlook_inbox.jpg)

### Reglas y Respuestas Automáticas en Outlook 365: Lógica y Ejemplos de Examen

#### A) ¿Qué son y cómo se estructuran las Reglas de Entrada (*Inbox Rules*)?
Una **Regla de Entrada** es un algoritmo de automatización ejecutable en el servidor del correo corporativo (`@us.es`) que procesa de forma instantánea todos los mensajes entrantes sin intervención manual del usuario. Se componen de tres elementos fundamentales:
1. **Condición (SI...):** El desencadenante del correo (por remitente, palabras en el asunto, presencia de adjuntos o marcas de importancia).
2. **Acción (ENTONCES...):** La tarea automatizada a ejecutar (mover a carpeta, reenviar, marcar con categoría de color, reproducir un sonido o eliminar).
3. **Excepción (EXCEPTO SI...):** La condición que anula la regla (ej. salvo si viene marcado con importancia *Alta*).

##### 📌 Ejemplos Prácticos de Reglas en la Biblioteca de la US:
* **Ejemplo 1 (Clasificación de Préstamo Interbibliotecario):**  
  * *Condición:* `SI` el asunto contiene la palabra *"Préstamo Interbibliotecario"* o *"PIB"*.  
  * *Acción:* `ENTONCES` mover automáticamente el mensaje a la subcarpeta `01_Prestamo_Interbibliotecario` y asignarle la categoría de color Verde.
* **Ejemplo 2 (Desvío de Correo por Cobertura de Turno):**  
  * *Condición:* `SI` el correo es enviado a la cuenta del servicio `crai_ultramar@us.es`.  
  * *Acción:* `ENTONCES` reenviar una copia automática a la cuenta corporativa del auxiliar de biblioteca de guardia en el turno de tarde.
* **Ejemplo 3 (Gestión de Facturas y Adquisiciones):**  
  * *Condición:* `SI` el remitente pertenece al dominio de una editorial proveedora o el asunto contiene *"Factura"*.  
  * *Acción:* `ENTONCES` mover el correo a la carpeta `Adquisiciones_Pendientes` y mostrar un aviso en pantalla.

---

#### B) ¿Cómo funcionan las Respuestas Automáticas (*Fuera de Oficina / Out of Office*)?
Se configuran desde la pestaña **`Archivo -> Información -> Respuestas automáticas (Fuera de oficina)`**. Permiten delimitar una franja horaria exacta de inicio y fin (ej. periodo de vacaciones de verano o permisos por formación del PTGAS).

##### 📌 Distinción de Mensajes (Concepto Clave de Examen):
Outlook permite redactar **dos plantillas de mensaje independientes**:
1. **Pestaña "Dentro de mi organización":** Mensaje enviado exclusivamente a las cuentas corporativas de la US (`@us.es` / `@alum.us.es`).  
   * *Ejemplo:* *"Estaré ausente por vacaciones del 1 al 15 de agosto. Para urgencias de biblioteca o préstamos FAMA, contactad con el turno en crai@us.es."*
2. **Pestaña "Fuera de mi organización":** Mensaje enviado a remitentes externos (proveedores, otras universidades o ciudadanos).  
   * *Ejemplo:* *"La Biblioteca de la Universidad de Sevilla le informa de que su solicitud será atendida a partir del 16 de agosto."*

![Figura 2: Panel de Reglas de entrada y Respuestas automáticas fuera de oficina en Outlook](/images/tema13/figura2_outlook_rules.jpg)

### Gestión de Calendarios, Agenda y Reserva de Recursos
*   **Vistas:** Día, Semana laboral, Semana completa y Mes. Navegador de minicalendario lateral.
*   **Convocatoria de Reuniones:** Programación de eventos con enlace de videollamada a Teams, reserva de salas de trabajo en grupo de la biblioteca/CRAI y verificación de la disponibilidad de asistentes mediante el *Asistente de programación* (Libre/Ocupado).
*   **Delegación de Permisos:** Opciones para otorgar permisos de lectura o edición sobre la agenda a favor de compañeros de turno.

![Figura 3: Vista de Calendario y Agenda de Microsoft Outlook 365 (Programación de eventos y salas)](/images/tema13/figura3_outlook_calendar.jpg)

---

## 3. Almacenamiento y Colaboración: OneDrive para la Empresa y SharePoint Online

### A. OneDrive para la Empresa (Almacenamiento Personal Nube)
*   **Enlaces de Acceso:** **`https://us-my.sharepoint.com`**.
*   **Archivos a Petición (Files On-Demand):** Permite ver todos los archivos en el Explorador sin ocupar espacio local. Iconografía de estado:
    *   ☁️ **Nube azul:** El archivo reside únicamente en la nube. Ocupa 0 bytes en disco y se descarga temporalmente al abrirlo.
    *   🟢 **Tic verde con fondo blanco:** Archivo descargado temporalmente, disponible sin conexión. Puede volver a la nube automáticamente si Windows necesita liberar espacio.
    *   🟢 **Círculo verde relleno con tic blanco:** "Mantener siempre en este dispositivo". Descargado permanentemente en el equipo.
*   **Papelera de Reciclaje:** Dos niveles de recuperación. Papelera de 1.er nivel (disponible **93 días** para el usuario) y Papelera de 2.º nivel (recuperación por el administrador del tenant).

![Figura 4: Biblioteca de documentos de OneDrive y SharePoint 365 con iconos de sincronización](/images/tema13/figura4_onedrive_sharepoint.jpg)

### B. SharePoint Online (Intranet y Repositorio de Unidad)
*   **Enlaces de Acceso:** **`https://us.sharepoint.com`**.
*   **Sitios de Equipo vs. Comunicación:** Los sitios de equipo están orientados al trabajo diario interno de la biblioteca (vinculados a Teams), mientras que los de comunicación difunden información general a la comunidad universitaria.

#### Procedimiento para la Carga/Subida de Archivos y Carpetas
1.  *Botonera Superior "Cargar" (Upload):* Menú con opciones `Archivos` (ficheros sueltos) y `Carpeta` (sube estructuras de directorios completas manteniendo su jerarquía intacta).
2.  *Arrastrar y Soltar (Drag & Drop):* Arrastrar elementos desde el Explorador de Windows al área central web de la biblioteca de documentos.
3.  *Resolución de Duplicados:* Opciones emergentes al coincidir nombre: **Reemplazar** (crea versión mayor manteniendo el historial), **Conservar ambos** (añade sufijo numérico) o **Cancelar**.

![Figura 5: Pantalla de carga de archivos en SharePoint Online (Menú 'Cargar' -> Archivos/Carpeta y Drag & Drop)](/images/tema13/figura5_sharepoint_upload.jpg)

#### Protecciones, Versiones y Permisos
*   **Check-out (Escanear salida):** Bloquea el archivo en la biblioteca de SharePoint para que ningún otro usuario pueda modificarlo o sobrescribirlo de forma simultánea (queda en "solo lectura" para los demás).
*   **Check-in (Proteger):** Libera el archivo guardando los cambios e introduciendo un comentario para el **Historial de Versiones**.
*   **Permisos de Enlace:** Opciones para compartir mediante enlace seguro (*Personas de la US*, *Personas con acceso existente* o *Personas determinadas*).
*   **Consigna US:** Servicio institucional alternativo gestionado por el SIC para la transferencia segura de archivos de gran volumen que superan el límite de peso de adjuntos de correo.

![Figura 6: Permisos de enlace, historial de versiones y estado Check-out en SharePoint Online](/images/tema13/figura6_sharepoint_permissions.jpg)

---

## 4. Microsoft Teams: Hub de Colaboración y Trabajo en Equipo
*   **Enlaces de Acceso:** **`https://teams.microsoft.com`** o ejecutable `MSTeams.exe`.
*   **Roles:** Propietario (administra miembros y configuración), Miembro (colabora) e Invitado (externo).
*   **Tipos de Canales:**
    *   *Canal Estándar:* Visible y accesible para todos los integrantes del equipo.
    *   *Canal Privado:* Restringido a un subgrupo con su propia biblioteca de SharePoint independiente.
    *   *Canal Compartido:* Permite colaborar con miembros de otros departamentos de la US sin añadirlos al equipo completo.
*   **Integración:** La pestaña de *Archivos* dentro de cada canal está vinculada directamente con **SharePoint**.

![Figura 7: Entorno de trabajo de Microsoft Teams en Modo Claro (Canales, chat y pestañas compartidas)](/images/tema13/figura7_teams_workspace.jpg)

---

## 5. Microsoft Word 365: Procesador de Textos Avanzado

### A. Partes Oficiales de la Interfaz
1.  **Barra de herramientas de acceso rápido:** Esquina superior izquierda (Guardar, Deshacer, Rehacer).
2.  **Barra de título y Buscador Microsoft Search:** Nombre del documento activo y caja de búsqueda.
3.  **Cinta de Opciones (Ribbon):** Organizada en **Fichas/Pestañas** (Inicio, Insertar, Disposición, Referencias, Correspondencia, Revisar, Vista).
4.  **Grupos de Comandos:** Bloques temáticos dentro de cada ficha (Portapapeles, Fuente, Párrafo, Estilos, Configurar página).
5.  **Área de trabajo (Lienzo):** Hoja central con márgenes.
6.  **Barra de Estado:** Conteo de páginas, palabras, idioma, vistas y control de Zoom.

![Figura 8: Partes de la interfaz de Microsoft Word 365 (Cinta de opciones, pestañas y grupos)](/images/tema13/figura8_word_interface.jpg)

### B. Maquetación, Disposición y Secciones
*   **Pestaña Disposición (Layout):** Grupo *Configurar Página* (Márgenes: Normal, Estrecho, Moderado; Orientación: Vertical/Horizontal; Tamaño: A4, Carta; Columnas).
*   **Estilos de Título:** Pestaña *Inicio* (*Título 1*, *Título 2*). Requisito técnico indispensable para generar automáticamente la **Tabla de Contenido (Índice)** desde *Referencias -> Tabla de contenido*.
*   **Salto de Página (`Ctrl + Enter`):** Envía el texto a la página siguiente dentro de la misma sección.
*   **Salto de Sección (Pestaña Disposición -> Saltos):** Divide el documento en partes con configuraciones independientes (cambiar a orientación horizontal, márgenes o desvincular encabezados/pies desmarcando **Vincular al anterior**).
*   **Combinación de Correspondencia:** Conecta un documento plantilla de Word con una base de datos externa (Excel/Outlook) para generar cartas o correos masivos personalizados.

![Figura 9: Pestaña de Disposición en Word 365 (Configuración de página, márgenes, saltos y párrafos)](/images/tema13/figura9_word_layout.jpg)

### C. 📌 COMPENDIO MAESTRO DE ATAJOS DE TECLADO EN WORD (SÚPER PREGUNTADOS EN EXAMEN)

| Atajo | Categoría | Función Oficial en Word 365 (Examen) |
| :--- | :--- | :--- |
| `Shift + F3` | Formato | **¡CLÁSICO DE EXAMEN!** Alternar texto entre Mayúsculas, Minúsculas y Tipo Oración. |
| `F7` | Revisión | Iniciar la verificación de Ortografía y Gramática en el documento. |
| `Shift + F7` | Revisión | Abrir el panel del Diccionario de Sinónimos. |
| `F12` | Archivo | Abrir directamente el cuadro de diálogo *Guardar como*. |
| `Ctrl + G` | Archivo | Guardar el documento activo inmediatamente. |
| `Ctrl + E` | Selección | Seleccionar todo el contenido del documento. |
| `Ctrl + Enter` | Edición | **¡CLÁSICO DE EXAMEN!** Insertar un salto de página manual. |
| `Shift + Enter` | Edición | **¡CLÁSICO DE EXAMEN!** Insertar un salto de línea manual (sin cambiar de párrafo). |
| `Ctrl + Shift + D` | Formato | Aplicar o quitar Doble Subrayado al texto. |
| `Ctrl + Shift + W` | Formato | Subrayar solo las palabras (excluyendo espacios en blanco). |
| `Ctrl + Shift + C / V` | Formato | Copiar formato seleccionado / Pegar formato copiado. |
| `Ctrl + Barra Espaciadora` | Formato | Borrar todo el formato manual (restablecer estilo Normal). |
| `Ctrl + T / J / Q / D` | Párrafo | Alinear texto al Centro / Justificado / Izquierda / Derecha. |
| `Ctrl + 1 / 2 / 5` | Párrafo | Interlineado Sencillo (1.0) / Doble (2.0) / 1.5 líneas. |
| `Ctrl + B / L` | Búsqueda | Panel de Navegación (Buscar) / Cuadro Buscar y Reemplazar. |
| `F5` / `Ctrl + I` | Búsqueda | Abrir el cuadro de diálogo *Ir a* (página, sección, marcador). |
| `Ctrl + Inicio / Fin` | Navegación | Mover cursor al principio absoluto / final absoluto del documento. |
| `F8` | Selección | Modo de selección ampliada (2=palabra, 3=frase, 4=párrafo, 5=documento). |

---

## 6. Microsoft Excel 365: Hojas de Cálculo y Tratamiento de Datos

### A. Explicación Conceptual y Funcionamiento
*   **Malla Bidimensional:** Estructura organizada en **Columnas** (letras: A, B, C...) y **Filas** (números: 1, 2, 3...).
*   **Libros, Hojas y Celdas:** Un archivo de Excel es un *Libro de trabajo* (`.xlsx`, o `.xlsm` con macros) con una o varias *Hojas*. La intersección de una columna y una fila forma una **Celda** (ej. `B4`). Un *Rango* es un bloque de celdas contiguas (ej. `A1:C10`).
*   **Principio del Cálculo Dinámico Automático:** Toda fórmula debe comenzar obligatoriamente por el signo `=` o `+` (ej. `=SUMA(A1:A5)`). Si se modifica cualquier dato de origen, **todas las celdas vinculadas se recalculan instantáneamente en tiempo real**.

### B. Partes Oficiales de la Interfaz
1.  **Cuadro de Nombres (Name Box):** Muestra la referencia de la celda activa (ej. `C5`) o nombre de rango.
2.  **Barra de Fórmulas (`fx`):** Muestra o edita el contenido real o fórmula de la celda activa.
3.  **Encabezados de Columnas y Filas:** Guías de letras (A-XFD) y números (1-1.048.576).
4.  **Celda Activa:** Celda seleccionada rodeada por un borde verde grueso con el controlador de relleno.

![Figura 10: Partes de la interfaz de Microsoft Excel 365 en Modo Claro (Cuadro de nombres, barra de fórmulas y rejilla)](/images/tema13/figura10_excel_interface.jpg)

### C. Tablas Dinámicas y Segmentación de Datos
*   **Tablas Dinámicas (PivotTables):** Herramienta para resumir, analizar y explorar grandes volúmenes de datos cruzando filas, columnas y valores sin alterar los datos de origen.
*   **Segmentadores de Datos (Slicers):** Botones flotantes interactivos que aplican filtros visuales instantáneos sobre las tablas dinámicas.

![Figura 11: Panel de Campos de Tabla Dinámica y Segmentadores de datos (Slicers) en Excel 365](/images/tema13/figura11_excel_pivot.jpg)

### D. 📌 COMPENDIO MAESTRO DE ATAJOS DE TECLADO EN EXCEL (SÚPER PREGUNTADOS EN EXAMEN)

| Atajo | Categoría | Función Oficial en Excel 365 (Examen) |
| :--- | :--- | :--- |
| `F4` | Referencias | **¡CLÁSICO DE EXAMEN!** Alternar entre referencias Relativas (`$A$1`), Absolutas y Mixtas. |
| `F2` | Edición | Entrar en modo de edición directa dentro de la celda activa. |
| `Alt + Enter` | Edición | **¡CLÁSICO DE EXAMEN!** Insertar un salto de línea dentro de la misma celda. |
| `Alt + =` | Fórmulas | Insertar automáticamente la función AutoSuma en la celda activa. |
| `Ctrl + Shift + L` | Datos | Activar o desactivar los Filtros Automáticos en la tabla seleccionada. |
| `Shift + Espacio` | Selección | **¡CLÁSICO DE EXAMEN!** Seleccionar la fila completa de la celda activa. |
| `Ctrl + Espacio` | Selección | Seleccionar la columna completa de la celda activa. |
| `Ctrl + 1` | Formato | Abrir el cuadro de diálogo Formato de celdas (Número, Alineación, Bordes). |
| `Ctrl + + / Ctrl + -` | Edición | Abrir cuadro para Insertar / Eliminar celdas, filas o columnas. |
| `Ctrl + Shift + 1 (!)` | Formato | Formato de número con 2 decimales y separador de miles. |
| `Ctrl + Shift + 4 ($)` | Formato | Formato de Moneda (€) con dos decimales. |
| `Ctrl + Inicio` | Navegación | Desplazar el cursor a la celda inicial `A1` de la hoja. |

---

## EPÍGRAFE ADICIONAL: OTRAS HERRAMIENTAS CLAVE DE PRODUCTIVIDAD Y COLABORACIÓN

### 1. Microsoft Forms
*   **Uso principal:** Creación de encuestas, cuestionarios, votaciones y formularios de recogida de datos en línea.
*   **Funciones clave:** Bifurcación lógica de preguntas, análisis automático de respuestas con gráficos en tiempo real y exportación de datos directos a Excel.
*   **Utilidad en la administración/biblioteca:** Recopilación rápida de información sin necesidad de conocimientos de programación y con autenticación de usuarios de la organización.
*   **Ejemplo práctico:** Formulario de evaluación de satisfacción de usuarios de la biblioteca tras la asistencia a una actividad formativa.

### 2. Microsoft OneNote
*   **Uso principal:** Bloc de notas digital estructurado para la captura, organización y consulta de apuntes, actas e información de trabajo.
*   **Funciones clave:** Organización jerárquica (Blocs -> Secciones -> Páginas), integración de etiquetas (tareas pendientes, importante), búsqueda de texto en imágenes/manuscritos e integración con Outlook.
*   **Utilidad en la administración/biblioteca:** Centralización de manuales de procedimiento, actas de reuniones del equipo bibliotecario e ideas de proyectos en un único lugar accesible.
*   **Ejemplo práctico:** Creación de un bloc de notas compartido para el equipo de trabajo de la BUS donde se registran las incidencias diarias y los criterios de catalogación.

### 3. Microsoft To Do
*   **Uso principal:** Gestión individual de tareas diarias, listas de pendientes y recordatorios personales.
*   **Funciones clave:** Planificación diaria inteligente ("Mi día"), asignación de fechas de vencimiento, avisos, pasos/subtareas y sincronización automática con las tareas marcadas de Outlook.
*   **Utilidad en la administración/biblioteca:** Organización del flujo de trabajo diario de cada auxiliar administrativo o bibliotecario para evitar olvidos de tareas con plazo.
*   **Ejemplo práctico:** Lista de comprobación diaria para la apertura del servicio de lectura (encendido de equipos, revisión de devoluciones, ordenación de salas).

### 4. Microsoft Planner
*   **Uso principal:** Planificación y gestión visual de proyectos y tareas en equipo mediante tableros de trabajo.
*   **Funciones clave:** Organización mediante tarjetas y columnas (*método Kanban*), asignación de tareas a miembros del equipo, seguimiento de estados (No iniciada, En curso, Completada) y gráficos visuales de progreso.
*   **Utilidad en la administración/biblioteca:** Coordinación transparente de proyectos departamentales sin necesidad de reuniones continuas de seguimiento.
*   **Ejemplo práctico:** Tablero de planificación para la reorganización del depósito de fondos antiguos, asignando tareas específicas a cada auxiliar bibliotecario con plazos definidos.

---

## 7. Esquema de Repaso Rápido
*   **UVUS:** Credencial electrónica única para acceder a los servicios de la US (`https://identidad.us.es`).
*   **Outlook CCO:** Obligatorio en envíos masivos conforme a la LOPDGDD para evitar revelar correos.
*   **Outlook AntiSPAM:** Su configuración detallada sólo se gestiona desde la OWA.
*   **OneDrive Nube Azul:** Archivo 0 bytes en disco, se descarga temporalmente al abrir.
*   **SharePoint Check-out:** Bloquea el archivo para evitar que otros lo editen simultáneamente.
*   **SharePoint Cargar:** Menú superior con opciones `Archivos` o `Carpeta` completa.
*   **Word Shift + F3:** Alterna entre Mayúsculas, Minúsculas y Tipo Oración.
*   **Word Salto de Sección:** Necesario para aplicar orientaciones o encabezados diferentes.
*   **Excel F4:** Alterna entre referencias relativas, absolutas y mixtas.
*   **Excel Alt + Enter:** Inserta salto de línea dentro de la propia celda.
*   **Forms:** Encuestas y cuestionarios con bifurcación lógica y análisis exportable a Excel.
*   **OneNote:** Bloc de notas jerárquico (Blocs -> Secciones -> Páginas) para actas y manuales.
*   **To Do:** Gestión de tareas individuales con la lista inteligente "Mi día" y sincronización con Outlook.
*   **Planner:** Gestión visual de proyectos en equipo basada en tableros y tarjetas *Kanban*.

---

## 8. Bibliografía y Fuentes Oficiales
*   **Guías de Microsoft 365 en la Universidad de Sevilla (SIC):** https://m365.us.es/es (Sección Guías).
*   **Normativa de uso del correo electrónico de la Universidad de Sevilla (SIC):** https://sic.us.es.
*   **Documentación Oficial de Microsoft 365:** Outlook, OneDrive, SharePoint, Teams, Word, Excel, Forms, OneNote, To Do y Planner.

<div class="app-promo-banner footer-promo" style="background: #ffffff; border: 2px solid #2563eb; border-radius: 10px; padding: 14px 18px; color: #1e293b; margin-top: 24px; margin-bottom: 10px; box-shadow: 0 2px 10px rgba(37, 99, 235, 0.1); text-align: center; page-break-inside: avoid; break-inside: avoid;">

  <div style="font-size: 1.15rem; font-weight: 800; color: #1e40af; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
    🚀 ¡COMPLEMENTA TU ESTUDIO EN LA APP ONLINE! 🚀
  </div>

  <p style="font-size: 0.88rem; line-height: 1.4; color: #475569; margin-bottom: 10px; font-weight: 500;">
    Pon a prueba tus conocimientos de este tema en nuestra plataforma interactiva de test:
  </p>

  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; text-align: left;">
    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; line-height: 1.6; color: #334155;">
      <li style="margin-bottom: 3px;">🎯 <strong>15 Simulacros Predefinidos (600 Preguntas Únicas):</strong> Entrenamientos de 40 preguntas sin repetir.</li>
      <li style="margin-bottom: 3px;">📝 <strong>Batería de +2.000 Preguntas por Tema:</strong> Test específicos de cada tema para medir tu nivel.</li>
      <li style="margin-bottom: 3px;">📜 <strong>Exámenes Reales de Convocatorias Anteriores:</strong> Practica con exámenes oficiales (2019, 2022).</li>
      <li style="margin-bottom: 3px;">🎴 <strong>Tarjetas de Memorización (Flashcards):</strong> Memoriza plazos de leyes, frecuencias y fórmulas en minutos.</li>
      <li style="margin-bottom: 0px;">🖨️ <strong>Generador de Test Impresos:</strong> Compila y descarga tu examen en papel para simular la prueba real.</li>
    </ul>
  </div>

  <div style="margin-top: 10px;">
    <a href="https://oposiciones-bus-app.vercel.app/" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 800; font-size: 0.92rem; padding: 9px 22px; border-radius: 50px; text-decoration: none; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25); text-transform: uppercase;">
      👉 ENTRAR AHORA A OPOSICIONES-BUS-APP 👈
    </a>
  </div>

  <p style="font-size: 0.8rem; color: #64748b; margin-top: 8px; margin-bottom: 0; font-weight: 600;">
    🌐 <strong>https://oposiciones-bus-app.vercel.app/</strong> — Acceso libre desde móvil, tablet u ordenador
  </p>

</div>

  <p style="font-size: 1rem; line-height: 1.6; color: #f3f4f6; margin-bottom: 16px;">
    No te quedes solo en la lectura teórica. Pon a prueba tus conocimientos en tiempo real con la plataforma interactiva de estudio:
  </p>

  <div style="background: rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 18px; margin-bottom: 20px; text-align: left; border-left: 5px solid #10b981;">
    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.92rem; line-height: 1.9; color: #ffffff;">
      <li style="margin-bottom: 6px;">📝 <strong>Batería de Cerca de 2.000 Preguntas Totales:</strong> Organizadas por cada uno de los 20 temas del programa de la escala de Técnico/a Auxiliar de Biblioteca, Archivo y Museo (Grupo IV - US).</li>
      <li style="margin-bottom: 6px;">📜 <strong>Exámenes Reales de Convocatorias Anteriores:</strong> Módulos independientes para realizar en línea los exámenes reales celebrados en pruebas anteriores (como el Examen Real 2019 y Examen Real 2022).</li>
      <li style="margin-bottom: 6px;">🎯 <strong>15 Simulacros Predefinidos (600 Preguntas Únicas):</strong> Exámenes fijos de 40 preguntas (exactamente 2 preguntas por tema) sin repetición entre sí para medir tu evolución a lo largo del tiempo.</li>
      <li style="margin-bottom: 6px;">⚙️ <strong>Simulacros Aleatorios e Infinitos Personalizados:</strong> Configura tu entrenamiento por Tema Único, bloques de temas o simulacros globales de 40 preguntas de forma ilimitada.</li>
      <li style="margin-bottom: 6px;">⚡ <strong>Corrección Instantánea con Sellos de Examen:</strong> Evaluación inmediata con explicaciones detalladas y distintivos visuales (<em>OK / INCORRECTA / NO CONTESTADA</em>).</li>
      <li style="margin-bottom: 6px;">🎴 <strong>Tarjetas de Memorización (Flashcards):</strong> Memoriza en minutos plazos de leyes, frecuencias RFID, luxes, normas ISO y fórmulas EFQM.</li>
      <li style="margin-bottom: 6px;">🖨️ <strong>Generador de Exámenes Impresos en Papel:</strong> Compila e imprime cualquier simulacro o cuaderno de test para entrenar en formato de examen real.</li>
      <li style="margin-bottom: 0px;">📈 <strong>Cuaderno de Repaso de Fallos:</strong> Guarda de forma automática tus errores para reintentarlos hasta conseguir el 100% de aciertos.</li>
    </ul>
  </div>

  <div style="margin-top: 15px;">
    <a href="https://oposiciones-bus-app.vercel.app/" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; font-weight: 800; font-size: 1.05rem; padding: 14px 28px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.5); text-transform: uppercase;">
      👉 ENTRAR AHORA A OPOSICIONES-BUS-APP 👈
    </a>
  </div>
  <p style="font-size: 0.85rem; color: #c7d2fe; margin-top: 12px; margin-bottom: 0;">🌐 Acceso libre y 100% optimizado para ordenador, tablet y móvil en <strong>https://oposiciones-bus-app.vercel.app/</strong></p>

</div>
