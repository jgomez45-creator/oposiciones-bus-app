# Tema 8: Tecnologías aplicadas en bibliotecas

> 📱 **ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP**  
> Accede a **oposiciones-bus-app** (https://oposiciones-bus-app.vercel.app) para complementar tu lectura:
> * 🎴 **Flashcards:** Memoriza las frecuencias de radio, tecnologías RFID y funcionamiento de las estaciones de autopréstamo en minutos.
> * 📝 **Modo Test:** Pon a prueba este tema con preguntas de exámenes oficiales.

## RFID, autopréstamo y sistemas de seguridad

---

## 1. La Tecnología RFID en Bibliotecas
La tecnología **RFID** (Radio Frequency Identification / Identificación por Radiofrecuencia) ha sustituido progresivamente al tradicional código de barras y a las electromagnéticas en la BUS para la gestión física de la colección.


> 💡 **REPASO RÁPIDO EN LA APP:**  
> ¿Te cuesta memorizar las frecuencias de radio, tecnologías RFID y funcionamiento de las estaciones de autopréstamo? Entra en la app (https://oposiciones-bus-app.vercel.app) y repasa las **Tarjetas de Memorización** específicas de este apartado para afianzar los conceptos sin dudar.

### A. ¿Cómo funciona el RFID?
Consiste en la transmisión inalámbrica de datos a través de ondas de radio. El sistema funciona en la banda de **Alta Frecuencia (HF) a 13.56 MHz** (regulada por la norma internacional **ISO 15693** e **ISO 18000-3**). Se compone de tres elementos principales:
1.  **La etiqueta RFID (Tag):** Un adhesivo plano pegado al libro. Contiene:
    *   Un **microchip** de silicio que almacena información grabable (como el número de registro del ejemplar de la US). Las etiquetas RFID bibliotecarias tienen una alta capacidad de almacenamiento, pudiendo guardar hasta **4 millones de caracteres**.
    *   Una **antena** metálica plana de aluminio o cobre en forma de espiral.
2.  **El lector/grabador RFID (Antena):** Emite ondas de radio que alimentan al chip pasivo (que no tiene pila) y leen o escriben datos en su memoria de manera inalámbrica. En los mostradores de préstamo, este elemento adopta la forma de una **alfombrilla lectora de RFID** conectada directamente al terminal de trabajo, identificada a nivel físico como un **dispositivo periférico** del ordenador.
3.  **El Middleware:** Software puente que comunica las lecturas del lector físico con la plataforma integrada de la biblioteca (**Alma**).

### B. Ventajas Operativas para el Personal
*   **Lectura no visual y múltiple:** Permite **prestar y devolver documentos en bloque** (varios libros apilados a la vez) en un solo segundo sin necesidad de abrirlos para buscar el código de barras.
*   **Agilización del Inventario:** Pasando un lector de mano o "varilla lectora" por las estanterías, se pueden leer y cotejar todos los libros de forma masiva sin sacarlos de su sitio, detectando de forma inmediata errores de ordenación física.

---

## 2. Los Sistemas de Autopréstamo y el Protocolo SIP2
El autopréstamo es el servicio de autoservicio que permite a los usuarios retirar y devolver libros por sí mismos de forma autónoma.

### A. Estaciones de Autopréstamo y Buzones Inteligentes
*   Las estaciones de autopréstamo identifican al usuario mediante su tarjeta universitaria y leen simultáneamente los libros apoyados en su superficie RFID.
*   Los buzones de devolución automáticos permiten al usuario retornar libros fuera del horario de atención, gestionando el retorno en tiempo real.

### B. El Protocolo de Comunicación SIP2
Para que una terminal física (como la máquina de autopréstamo o un buzón inteligente de devolución de libros) pueda comunicarse con la base de datos de la biblioteca (**Alma**), se utiliza un protocolo estándar de comunicación:
*   **SIP2 (Standard Interchange Protocol v2):** Desarrollado por la empresa 3M, es el protocolo de red universal que traduce y transmite los mensajes de intercambio de datos entre el terminal y el servidor.
*   *Flujo operativo*: Cuando el usuario coloca su libro en la máquina de autopréstamo:
    1.  La máquina envía un mensaje SIP2 a Alma: *"Lector con código X quiere llevarse el ejemplar Y"*.
    2.  Alma comprueba el estado del usuario y del ejemplar.
    3.  Alma responde con un mensaje SIP2: *"Préstamo autorizado. Modifique el bit de seguridad"*.
    4.  La máquina de autopréstamo graba el cambio de seguridad en el chip del libro y emite el recibo impreso.

---

## 3. Sistemas de Seguridad Antihurto: Bit EAS y Código AFI
Los arcos detectores del sistema antihurto se instalan en la **zona de acceso de la biblioteca** (puertas de entrada y salida) para controlar el paso de personas. Estas antenas detectoras leen los chips de los libros a su paso y, si detectan que un documento no ha sido desactivado previamente, emiten una alarma sonora y visual.

Para gestionar esto, se utilizan dos tecnologías de codificación dentro del microchip del libro:

### A. El Bit EAS (Electronic Article Surveillance / Vigilancia Electrónica de Artículos)
*   Es un simple conmutador o interruptor binario de un solo bit:
    *   **Valor `1`:** El libro está en sala (seguridad activada). Si pasa por los arcos, estos detectan este bit activo y suena la alarma.
    *   **Valor `0`:** El libro ha sido prestado correctamente (seguridad desactivada). El usuario puede salir libremente.

### B. El Código AFI (Application Family Identifier / Identificador de Familia de Aplicación)
Es el sistema más moderno y normalizado según el estándar internacional **ISO 28560-2** (modelo de datos RFID para bibliotecas):
*   Consiste en un código de **1 byte** (valores hexadecimales del `00` al `FF`) que identifica para qué tipo de aplicación o sector sirve el chip.
*   **Estado "En sala" (Seguridad Activada):** El chip tiene grabado el código estándar **`07`** (o el código hexadecimal de biblioteca **`C2`**). Si el usuario intenta cruzar los arcos de salida, las antenas leen este código específico y disparan la alarma.
*   **Estado "Prestado" (Seguridad Desactivada):** Al tramitar el préstamo, Alma reescribe el byte en la etiqueta del libro, cambiándolo a un valor de préstamo, normalmente **`C0`** o **`00`**. Los arcos leen este nuevo valor y permiten el paso sin hacer sonar la alarma.

---

## 4. Conectividad Inalámbrica y Acceso Remoto
*   **Acceso desde casa (Acceso Remoto):** Es la posibilidad de que las personas usuarias autorizadas puedan utilizar, desde el exterior de la red de la Universidad, los recursos electrónicos suscritos por la Biblioteca (como bases de datos, revistas científicas y libros electrónicos). Esta conexión remota se realiza mediante VPN corporativa o a través de pasarelas basadas en Single Sign-On (como Shibboleth o OpenAthens) utilizando el usuario y contraseña UVUS.
*   **Redes inalámbricas en el campus:** Dentro de las instalaciones físicas de las bibliotecas de la US, el acceso a la red inalámbrica de datos se realiza bajo dos perfiles:
    *   **ReInUS (Red Inalámbrica de la Universidad de Sevilla):** Red corporativa para el personal y estudiantes de la US mediante validación con su credencial **UVUS** y contraseña.
    *   **Eduroam (Educational Roaming):** Red wifi de movilidad académica mundial que permite a los usuarios visitantes de instituciones asociadas conectarse utilizando el **usuario y contraseña de su universidad de origen**.

---

## 5. Esquema de Repaso Rápido
*   **Frecuencia RFID:** Alta Frecuencia (HF) a **13.56 MHz** (Norma ISO 15693 e ISO 18000-3).
*   **Dispositivo Periférico:** La alfombrilla de mostrador RFID se identifica técnicamente como tal.
*   **SIP2:** Protocolo estándar de comunicación que conecta el hardware físico de autopréstamo/buzón con la base de datos de Alma en tiempo real.
*   **Bit EAS:** Conmutador binario simple de un bit (1 = seguridad activada en sala / 0 = desactivada).
*   **Código AFI:** Código de 1 byte (ISO 28560-2). En sala es **`07`** (o hexadecimal **`C2`**); al prestarse cambia a **`C0`** o **`00`** para desactivar la alarma de salida.
*   **Redes inalámbricas:** ReInUS (acceso con UVUS/clave de la US) y Eduroam (acceso con credenciales de la institución de origen).

---

## 6. Conceptos Clave
*   **RFID pasivo:** Etiquetas que no tienen batería integrada; obtienen la energía necesaria para emitir sus datos de las propias ondas de radio emitidas por la antena del lector.
*   **EAS (Electronic Article Surveillance):** Tecnología de protección electrónica básica contra el hurto de ejemplares.
*   **AFI (Application Family Identifier):** Mecanismo estandarizado por ISO para clasificar la aplicación del chip y gestionar su estado de alarma en bibliotecas.
*   **SIP2:** Protocolo imprescindible que rige todas las comunicaciones de autopréstamo del mostrador a nivel mundial.
*   **Eduroam:** Red wifi mundial cooperativa para la movilidad de investigadores y estudiantes de educación superior.

---

## 7. Bibliografía
*   **Norma ISO 28560: Tecnologías de identificación por radiofrecuencia (RFID) en bibliotecas**.
*   **Manuales de usuario de las estaciones de autopréstamo de la BUS**.
*   **Guías de la Biblioteca de la Universidad de Sevilla (Guías BUS)**: Disponible en https://guiasbus.us.es/.


---
### 🎯 ¡Ponte a prueba antes de pasar al siguiente tema!
Has completado la lectura teórica. Ahora es momento de consolidar lo aprendido:
1. **Repaso de Flashcards:** Revisa las tarjetas de este tema en la sección *Flashcards*.
2. **Simulacro de Examen:** Realiza un test de autoevaluación en la sección *Tests*.

🔗 **Accede ahora a la app:** [Abrir oposiciones-bus-app](https://oposiciones-bus-app.vercel.app)
---
