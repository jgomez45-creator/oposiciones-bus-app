# Tema 8: Tecnologías aplicadas en bibliotecas
## RFID, autopréstamo y sistemas de seguridad para Auxiliares

---

## 1. La Tecnología RFID en Bibliotecas
La tecnología **RFID** (Radio Frequency Identification o Identificación por Radiofrecuencia) ha sustituido al tradicional código de barras y a las electromagnéticas en la BUS para la gestión física de la colección.

![Esquema de Funcionamiento del RFID en Bibliotecas](/images/library_rfid.png)

### A. ¿Cómo funciona el RFID?
Consiste en la transmisión inalámbrica de datos a través de ondas de radio. El sistema funciona en la banda de **Alta Frecuencia (HF) a 13.56 MHz** (regulada por la norma internacional **ISO 15693** e **ISO 18000-3**). Se compone de tres elementos principales:
1.  **La etiqueta RFID (Tag):** Un adhesivo plano pegado al libro. Contiene:
    *   Un **microchip** de silicio que almacena información grabable (como el número de registro del ejemplar de la US).
    *   Una **antena** metálica plana de aluminio o cobre en forma de espiral.
2.  **El lector/grabador RFID (Antena):** Emite ondas de radio que alimentan al chip pasivo (que no tiene pila) y leen o escriben datos en su memoria de manera inalámbrica.
3.  **El Middleware:** Software puente que comunica las lecturas del lector físico con la plataforma integrada de la biblioteca (**Alma**).

### B. Ventajas Operativas para el Auxiliar
*   **Lectura no visual y múltiple:** Permite leer varios libros apilados a la vez (de 4 a 6 ejemplares) en un solo segundo sin necesidad de abrirlos para buscar el código de barras.
*   **Agilización del Inventario:** Pasando un lector de mano o "varilla lectora" por las estanterías, se pueden leer y cotejar todos los libros de forma masiva sin sacarlos de su sitio, detectando de forma inmediata errores de ordenación física.

---

## 2. Los Sistemas de Autopréstamo y el Protocolo SIP2
El autopréstamo es el servicio de autoservicio que permite a los usuarios retirar y devolver libros por sí mismos de forma autónoma.

### A. Estaciones de Autopréstamo y Buzones Inteligentes
*   Las estaciones de autopréstamo identifican al usuario mediante su tarjeta universitaria y leen simultáneamente los libros apoyados en su superficie RFID.
*   Los buzones de devolución automáticos permiten al usuario retornar libros fuera del horario de atención, gestionando el retorno en tiempo real.

### B. El Protocolo de Comunicación SIP2
Para que una terminal física (como la máquina de autopréstamo de la marca 3M o Bibliotheca, o un buzón inteligente de devolución de libros) pueda comunicarse con la base de datos de la biblioteca (**Alma**), se utiliza un protocolo estándar de comunicación:
*   **SIP2 (Standard Interchange Protocol v2):** Desarrollado por la empresa 3M, es el protocolo de red universal que traduce y transmite los mensajes de intercambio de datos.
*   *Flujo operativo*: Cuando el usuario coloca su libro en la máquina de autopréstamo:
    1.  La máquina envía un mensaje SIP2 a Alma: *"Lector con código X quiere llevarse el ejemplar Y"*.
    2.  Alma comprueba el estado del usuario (que no tenga sanciones) y del ejemplar (que no esté reservado por otro).
    3.  Alma responde con un mensaje SIP2: *"Préstamo autorizado. Modifique el bit de seguridad"*.
    4.  La máquina de autopréstamo graba el cambio de seguridad en el chip del libro y emite el recibo impreso.

---

## 3. Sistemas de Seguridad Antihurto: Bit EAS y Código AFI
Los arcos antihurto instalados en las puertas de salida de la biblioteca son antenas detectoras que leen los chips de los libros a su paso. Si detectan que un libro no ha sido prestado en el mostrador o en el autopréstamo, hacen sonar una alarma.

Para gestionar esto en el mostrador, se utilizan dos tecnologías de codificación dentro del microchip del libro:

### A. El Bit EAS (Electronic Article Surveillance / Vigilancia Electrónica de Artículos)
*   Es un simple conmutador o interruptor binario de un solo bit:
    *   **Valor `1`:** El libro está en sala (seguridad activada). Si pasa por los arcos, estos detectan este bit activo y suena la alarma.
    *   **Valor `0`:** El libro ha sido prestado correctamente (seguridad desactivada). El usuario puede salir libremente.
*   *Uso:* Es muy rápido de leer y modificar por el hardware, pero es genérico y no contiene información adicional.

### B. El Código AFI (Application Family Identifier / Identificador de Familia de Aplicación)
Es el sistema más moderno y normalizado según el estándar internacional **ISO 28560-2** (modelo de datos RFID para bibliotecas):
*   Consiste en un código de **1 byte** (valores hexadecimales del `00` al `FF`) que identifica para qué tipo de aplicación o sector sirve el chip.
*   **Estado "En sala" (Seguridad Activada):** El chip tiene grabado el código estándar **`07`** (o el código hexadecimal de biblioteca **`C2`**). Si el usuario intenta cruzar los arcos de salida, las antenas leen este código específico y disparan la alarma.
*   **Estado "Prestado" (Seguridad Desactivada):** Al tramitar el préstamo en el mostrador o autopréstamo, Alma reescribe el byte en la etiqueta del libro, cambiándolo a un valor de préstamo, normalmente **`C0`** o **`00`**. Los arcos leen este nuevo valor y permiten el paso sin hacer sonar la alarma.
*   *Ventaja:* Al ser un byte completo, es mucho más seguro frente a errores de lectura o interferencias que un simple bit EAS.

---

## 4. Esquema de Repaso Rápido para Examen
*   **Frecuencia RFID:** Alta Frecuencia (HF) a **13.56 MHz** (Norma ISO 15693).
*   **SIP2:** Protocolo estándar de comunicación que conecta el hardware físico de autopréstamo/buzón con la base de datos de Alma en tiempo real.
*   **Bit EAS:** Conmutador binario simple de un bit (1 = seguridad activada en sala / 0 = desactivada).
*   **Código AFI:** Código de 1 byte (ISO 28560-2). En sala es **`07`** (o hexadecimal **`C2`**); al prestarse cambia a **`C0`** o **`00`** para desactivar la alarma de salida.
*   **Middleware:** Software integrador entre los sensores RFID y la base de datos de Alma.

---

## 5. Conceptos Clave
*   **RFID pasivo:** Etiquetas que no tienen batería integrada; obtienen la energía necesaria para emitir sus datos de las propias ondas de radio emitidas por la antena del lector.
*   **EAS (Electronic Article Surveillance):** Tecnología de protección electrónica básica contra el hurto de ejemplares.
*   **AFI (Application Family Identifier):** Mecanismo estandarizado por ISO para clasificar la aplicación del chip y gestionar su estado de alarma en bibliotecas.
*   **SIP2:** Protocolo imprescindible que rige todas las comunicaciones de autopréstamo del mostrador a nivel mundial.
