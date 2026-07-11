# Tema 13: Servicio de Correo Electrónico (Outlook) y Herramientas de Microsoft 365

Este tema desarrolla el entorno oficial de colaboración digital de la Universidad de Sevilla (**Microsoft 365**) basado en el identificador único **UVUS** (`usuario@us.es`), abordando de forma profunda las aplicaciones requeridas en la convocatoria, especialmente **Outlook, Word y SharePoint**.

---

## 1. Microsoft Outlook: Correo y Gestión Diaria

**Microsoft Outlook** es la herramienta corporativa oficial para el envío y recepción de correspondencia, gestión del calendario y tareas en la Universidad de Sevilla. 

### A. La Cinta de Opciones y Menús Principales

![Menú de Configuración y Respuestas Automáticas de Outlook](/outlook_menu.png)

1.  **Pestaña Archivo (Vista Backstage):**
    *   **Información de Cuenta:** Permite visualizar el tamaño del buzón (limite de cuota) y configurar las cuentas.
    *   **Respuestas Automáticas (Fuera de Oficina):** Opción crítica para periodos vacacionales. Permite programar un mensaje de respuesta automática en un intervalo de fechas y horas específico. Se pueden redactar dos mensajes diferentes:
        *   *Dentro de mi organización:* Dirigido únicamente a usuarios con correo corporativo de la US.
        *   *Fuera de mi organización:* Mensajes destinados a usuarios de correos externos (ej. Gmail, Hotmail).
    *   **Reglas y Alertas:** Acceso directo para la creación de reglas automáticas de organización.
2.  **Pestaña Inicio:**
    *   **Nuevo correo electrónico:** `Ctrl + U` (en Outlook web) o `Ctrl + N` (en Outlook de escritorio).
    *   **Pasos Rápidos (Quick Steps):** Acciones predefinidas configurables para ejecutarse en un solo clic (ej. mover un correo a una carpeta y marcarlo como leído simultáneamente).
    *   **Responder (`Ctrl + R`), Responder a todos (`Ctrl + Shift + R`) y Reenviar (`Ctrl + F`).**
3.  **Pestaña Vista:**
    *   Permite activar y cambiar la ubicación del *Panel de lectura* (derecha, inferior o desactivado) y organizar la bandeja por hilos de conversación o fecha.

### B. Características Avanzadas de Gestión
*   **Lista de Direcciones Globales (GAL - Global Address List):** Directorio centralizado gestionado por el servicio de informática de la US que contiene las direcciones de correo actualizadas de todo el personal (PDI, PTGAS) y estudiantes de la universidad.
*   **Reglas de Bandeja de Entrada:** Filtros lógicos ejecutados en el servidor que automatizan el correo basándose en criterios:
    *   *Remitente, Destinatario, Palabras clave en el asunto o cuerpo.*
    *   *Acciones:* Mover a carpeta, marcar como leído, reenviar o eliminar.
*   **Atajos Clave para Examen:**
    *   `Ctrl + Intro`: Enviar el correo electrónico redactado de forma inmediata.
    *   `Ctrl + 1` / `Ctrl + 2` / `Ctrl + 3`: Conmutar entre la vista de *Correo*, *Calendario* y *Personas/Contactos*.

---

## 2. Microsoft Word: Procesador de Textos

**Microsoft Word** es el procesador oficial empleado para la redacción de informes, actas, cartas y documentación administrativa en la BUS.

### A. Gestión de Estilos e Índices Automáticos

![Cinta de Estilos y Saltos de Sección en Word](/word_menu.png)

*   **Estilos de Título:** Situados en la pestaña **Inicio**. Aplicar estilos estructurados (como *Título 1*, *Título 2*, *Subtítulo*) permite formatear el documento homogéneamente y es el requisito técnico indispensable para que Word genere automáticamente la **Tabla de Contenido (Índice)** desde la pestaña **Referencias -> Tabla de contenido**.

### B. Control de Páginas y Secciones
Es uno de los conceptos más evaluados en los exámenes prácticos de ofimática:
*   **Salto de Página (`Ctrl + Intro`):** Corta el flujo del texto y lo envía al inicio de la página siguiente. Todo el documento se mantiene dentro de la misma sección, heredando márgenes, encabezados y orientación de página.
*   **Salto de Sección (Pestaña Disposición -> Saltos):**
    *   Divide el documento en partes con configuraciones independientes.
    *   *Utilidad:* Es imprescindible para rotar una página a horizontal (dejando el resto en vertical), cambiar los márgenes de una zona del documento o configurar encabezados y pies de página distintos (desvinculando la sección actual de la anterior con el botón **Vincular al anterior** desmarcado).

### C. Combinar Correspondencia (Pestaña Correspondencia)
*   Permite crear cartas personalizadas, etiquetas o correos electrónicos masivos.
*   Conecta un documento plantilla de Word con una base de datos externa (normalmente una tabla de Excel o contactos de Outlook) para insertar campos combinados (ej. `<<Nombre>>`, `<<Apellidos>>`).

---

## 3. Microsoft SharePoint Online: Gestión Documental de Equipos

**SharePoint** es la herramienta principal en la US para crear repositorios documentales, intranets de campus y colaboración estructurada a nivel de departamentos de biblioteca.

### A. Operaciones de Control de Documentos (Bibliotecas)

![Opción de Proteger/Desproteger (Check-out) en SharePoint](/sharepoint_menu.png)

*   **Proteger (Check-out):** Bloquea el archivo en la biblioteca de SharePoint para que ningún otro usuario pueda realizar cambios en él de forma simultánea. El archivo queda en estado de "solo lectura" para el resto de compañeros del equipo.
*   **Desproteger (Check-in):** Libera el archivo para que otros puedan editarlo. Obliga a introducir un comentario describiendo los cambios realizados, lo que alimenta el **Historial de Versiones**.
*   **Historial de Versiones:** SharePoint registra de forma automática cada cambio en un documento, permitiendo visualizar qué usuario modificó el archivo, comparar versiones previas y restaurar una versión anterior en caso de error.

### B. Estructura de Sitios y Permisos
*   SharePoint funciona mediante Sitios y Subsitios.
*   **Herencia de Permisos:** Por defecto, cualquier biblioteca o carpeta dentro de un sitio hereda los permisos de acceso del sitio principal.
*   **Permisos Exclusivos:** Se puede romper la herencia de permisos para dar acceso de edición o visualización a un grupo específico de personas en un documento o carpeta confidencial.

---

## 4. Microsoft OneDrive para la Empresa: Almacenamiento Personal

Espacio personal de almacenamiento en la nube asignado a cada usuario de la US (PTGAS) para sus documentos de trabajo individuales.

### A. Estados de Sincronización (Files On-Demand)
OneDrive utiliza la tecnología de "Archivos a petición" en Windows para no saturar el almacenamiento físico del ordenador:
*   ☁️ **Nube azul:** El archivo reside únicamente en la nube. Ocupa 0 bytes en el disco duro local y se descarga temporalmente en el PC solo cuando el usuario hace doble clic para abrirlo.
*   🟢 **Tic verde con fondo blanco:** Archivo que ha sido abierto y descargado temporalmente. Se puede acceder a él sin conexión a internet. Puede volver a la nube automáticamente si Windows necesita liberar espacio en el disco.
*   🟢 **Círculo verde relleno con tic blanco:** El usuario ha elegido "Mantener siempre en este dispositivo". El archivo se descarga permanentemente, está disponible sin conexión y nunca se borrará del PC de manera automática.

### B. Configuración de Seguridad al Compartir Enlaces
Al generar un enlace para compartir un archivo, se pueden definir límites estrictos:
*   *Cualquier persona con el enlace* / *Solo personas de la Universidad de Sevilla*.
*   *Permitir la edición* (habilitado/deshabilitado).
*   *Establecer fecha de caducidad* (el enlace se inactiva automáticamente).
*   *Establecer contraseña* (obliga al receptor a introducir una contraseña).
*   *Bloquear descarga* (el destinatario solo puede ver el documento en el navegador web, sin poder guardarlo).

---

## 5. Microsoft Teams: Hub de Colaboración

Herramienta unificada de comunicación, reuniones virtuales y trabajo en equipo.
*   **Equipos:** Grupos cerrados de usuarios (ej. "Biblioteca de Derecho").
*   **Canales:** Subdivisiones dentro de un equipo organizadas por temas de trabajo (ej. canal "Adquisiciones", canal "Préstamo").
*   **Pestaña Archivos en Canales:** Integrada directamente con **SharePoint**. Todos los archivos subidos a un equipo de Teams se almacenan físicamente en el sitio de SharePoint correspondiente.
*   **Atajos básicos:**
    *   `Ctrl + Shift + M`: Activar o silenciar el micrófono en una reunión.
    *   `Ctrl + Shift + O`: Encender o apagar la cámara web.

---

## 6. Otras Herramientas de Microsoft 365

### A. Microsoft Planner: Gestión de Tareas
*   Herramienta de gestión de proyectos basada en la metodología ágil **Kanban**.
*   **Estructura:**
    *   **Tablero (Plan):** El proyecto general.
    *   **Depósitos (Buckets):** Columnas para categorizar tareas (ej. "Pendiente", "En curso", "Terminado").
    *   **Tareas:** Tarjetas individuales que contienen descripciones, listas de comprobación, archivos adjuntos, etiquetas de colores y personas asignadas.

### B. Microsoft Excel: Hojas de Cálculo
*   **Fórmulas:** Siempre comienzan por el signo `=` o `+`.
*   **Función `=BUSCARV` (Búsqueda Vertical):** Busca un valor en la primera columna de una tabla y devuelve el valor de otra columna de la misma fila.
    *   *Sintaxis:* `=BUSCARV(valor_buscado; matriz_buscar_en; indicador_columnas; ordenado)`
    *   *Rigor:* Se suele poner `FALSO` como último argumento para exigir una **coincidencia exacta** en la búsqueda.
*   **Función `=SI` (Condición Lógica):** Devuelve un valor si una condición es verdadera y otro si es falsa.
    *   *Sintaxis:* `=SI(prueba_lógica; valor_si_verdadero; valor_si_falso)`
*   **Atajos:**
    *   `F2`: Entra en modo edición de la celda activa.
    *   `Ctrl + Shift + L`: Activar/desactivar filtros de cabecera.

### C. Microsoft PowerPoint: Presentaciones
*   Herramienta de diapositivas para ponencias, formación de usuarios (ALFIN) e informes de gerencia.
*   **Ideas de Diseño (Diseñador):** Servicio inteligente que sugiere plantillas visuales basadas en el contenido de la diapositiva.
*   **Transición vs. Animación:** La *transición* es el efecto de movimiento al cambiar de una diapositiva a otra; la *animación* es el efecto aplicado a un objeto individual (texto, imagen) dentro de la misma diapositiva.
