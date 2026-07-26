# Tema 8: Tecnologías aplicadas en bibliotecas

<div class="app-promo-banner header-promo">

> 📱 **ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP**  
> Accede a **oposiciones-bus-app** (https://oposiciones-bus-app.vercel.app) para complementar tu lectura:
> * 🎴 **Flashcards:** Memoriza las frecuencias de radio, tecnologías RFID y funcionamiento de las estaciones de autopréstamo en minutos.
> * 📝 **Modo Test:** Pon a prueba este tema con preguntas de exámenes oficiales.

</div>

## RFID, autopréstamo y sistemas de seguridad

---

## 1. La Tecnología RFID en Bibliotecas
La tecnología **RFID** (Radio Frequency Identification / Identificación por Radiofrecuencia) ha sustituido progresivamente al tradicional código de barras y a las electromagnéticas en la BUS para la gestión física de la colección.

<div class="app-promo-banner mid-promo">

> 💡 **REPASO RÁPIDO EN LA APP:**  
> ¿Te cuesta memorizar las frecuencias de radio, tecnologías RFID y funcionamiento de las estaciones de autopréstamo? Entra en la app (https://oposiciones-bus-app.vercel.app) y repasa las **Tarjetas de Memorización** específicas de este apartado para afianzar los conceptos sin dudar.

</div>

### A. ¿Cómo funciona el RFID en las Bibliotecas?
Consiste en la transmisión inalámbrica de datos a través de ondas de radio. El sistema funciona en la banda de **Alta Frecuencia (HF) a 13.56 MHz** (regulada por las normas internacionales **ISO 15693** e **ISO 18000-3**). Se compone de tres elementos principales:

1.  **La etiqueta RFID (Tag):** Un adhesivo plano pegado al libro. Contiene:
    *   Un **microchip** de silicio que almacena información grabable. Las etiquetas pasivas de bibliotecas obtienen su energía inductiva de la señal emitida por la antena del lector.
    *   Una **antena** metálica plana de aluminio o cobre en forma de espiral.
2.  **El lector/grabador RFID (Antena):** Emite ondas de radio que alimentan al chip pasivo y leen o escriben datos en su memoria de manera inalámbrica. En mostradores, la alfombrilla lectora es un **dispositivo periférico** del ordenador de trabajo.
3.  **El Middleware:** Software puente que traduce la lectura física y comunica el evento con la plataforma **Alma**.

### B. Estructura del Modelo de Datos en la Memoria del Tag (Norma ISO 28560)
El mapa de memoria del microchip en el modelo estándar bibliotecario (**ISO 28560-2**) almacena los siguientes campos:
*   **Identificador Primario de Ítem (Primary Item Identifier):** Código numérico único del ejemplar registrado en la BUS (antiguo código de barras).
*   **Identificador de Institución Propietaria (Owner ISIL):** Código del estándar ISIL que identifica de forma unívoca a la Universidad de Sevilla.
*   **Byte de Seguridad (AFI):** Controla la activación o desactivación de la alarma antihurto.
*   **Tipo de Medio / Soporte:** Define si es libro, material audiovisual o kit tecnológico de la Objetoteca.

---

## 2. Los Sistemas de Autopréstamo y el Protocolo SIP2
El autopréstamo es el servicio de autoservicio que permite a los usuarios retirar y devolver libros por sí mismos de forma autónoma.

### A. Estaciones de Autopréstamo y Buzones Inteligentes
*   Las estaciones de autopréstamo identifican al usuario mediante su tarjeta universitaria o credenciales UVUS y leen simultáneamente los libros apoyados en su superficie RFID.
*   Los buzones de devolución automáticos permiten al usuario retornar libros fuera del horario de atención, gestionando el retorno en Alma en tiempo real.

### B. El Protocolo de Comunicación SIP2 (Standard Interchange Protocol v2)
Para que un terminal físico (máquina de autopréstamo o buzón) pueda comunicarse con la base de datos central de la biblioteca (**Alma**), se utiliza el protocolo estándar **SIP2** (desarrollado originalmente por 3M):

*   *Flujo operativo*: Cuando el usuario coloca un libro en la máquina:
    1.  La máquina envía un mensaje **SIP2 Item Information / Checkout** (Mensaje 11/12) a Alma con el UID del usuario y del libro.
    2.  Alma verifica las políticas de préstamo, sanciones activas y estado del documento.
    3.  Alma devuelve la respuesta **SIP2 Checkout Response**: *"Préstamo autorizado. Modifique el byte AFI de seguridad"*.
    4.  La máquina de autopréstamo graba el cambio de seguridad en el chip del libro e imprime el comprobante de vencimiento.

---

## 3. Sistemas de Seguridad Antihurto: Bit EAS y Código AFI
Los arcos detectores antihurto se instalan en la zona de paso de la entrada/salida de la biblioteca. Leen las etiquetas a su paso y, si un libro no ha sido prestado formalmente, activan la alarma sonora y luminosa.

### A. El Bit EAS (Electronic Article Surveillance)
Es un simple conmutador binario de 1 bit:
*   **Valor `1`:** Libro en sala (seguridad activada). Salta la alarma al pasar por los arcos.
*   **Valor `0`:** Libro prestado (seguridad desactivada). Paso libre.

### B. El Código AFI (Application Family Identifier - ISO 28560-2)
Mecanismo avanzado de **1 byte** (valores del `00` al `FF`):
*   **Estado "En Sala" (Seguridad Activada):** El chip tiene grabado el código estándar **`07`** (o el valor hexadecimal de biblioteca **`C2`**). Si pasa por los arcos, estos leen este código específico y disparan la alarma.
*   **Estado "Prestado" (Seguridad Desactivada):** Al tramitar el préstamo, la alfombrilla lectora o máquina de autopréstamo reescribe el byte en la etiqueta, cambiándolo a un valor autorizado, normalmente **`C0`** o **`00`**. Los arcos leen este nuevo valor y permiten el paso sin hacer sonar la alarma.

---

## 4. Equipamiento Tecnológico de Soporte en el CRAI de la US
En el marco del modelo CRAI, las bibliotecas de la US cuentan con equipamiento tecnológico especializado de apoyo a la docencia e investigación:
*   **Armarios Inteligentes de Préstamo de Portátiles:** Consolas automatizadas donde el usuario escanea su carné universitario para retirar ordenadores portátiles o e-readers en préstamo diario de forma autoservida.
*   **Escáneres Planetarios Aéreos de Libre Uso:** Escáneres de libro de luz superior no destructiva que permiten a los estudiantes digitalizar capítulos o fragmentos de libros conforme a la Ley de Propiedad Intelectual sin dañar la encuadernación.

---

## 5. Conectividad Inalámbrica y Acceso Remoto
*   **Acceso Remoto (VPN y SirUS):** Permite a la comunidad universitaria acceder a las bases de datos y revistas electrónicas desde fuera del campus mediante autenticación con el **UVUS**.
*   **Redes Inalámbricas en el Campus:**
    *   **ReInUS (Red Inalámbrica de la US):** Red corporativa propia para estudiantes y personal de la Universidad de Sevilla.
    *   **Eduroam (Educational Roaming):** Red wifi académica de movilidad mundial que permite a miembros de otras universidades conectarse en la US usando sus claves de origen.

---

## 6. Esquema de Repaso Rápido
*   **Frecuencia RFID:** Alta Frecuencia (HF) a **13.56 MHz** (Norma ISO 15693 e ISO 18000-3).
*   **Mapa de Memoria (ISO 28560-2):** Registra el ID de ítem, el código ISIL del propietario (US), el byte AFI de seguridad y el tipo de medio.
*   **SIP2:** Protocolo estándar que rige la comunicación de datos entre máquinas físicas de autopréstamo y Alma.
*   **Bit EAS:** Conmutador binario simple de 1 bit (1 = activado / 0 = desactivado).
*   **Código AFI:** Byte de seguridad (ISO 28560-2). En sala es **`07`** (o hexadecimal **`C2`**); al prestarse cambia a **`C0`** o **`00`**.
*   **CRAI Equipamiento:** Armarios de portátiles autoservicio y escáneres planetarios aéreos.

---

## 7. Conceptos Clave
*   **ISO 28560:** Estándar internacional que regula el modelo de datos RFID en bibliotecas.
*   **EAS:** Vigilancia Electrónica de Artículos mediante bi-estable binario.
*   **AFI (Application Family Identifier):** Mecanismo de seguridad RFID por byte que identifica el estado del documento frente a los arcos antihurto.
*   **SIP2:** Protocolo cliente-servidor para la automatización de transacciones de circulación.

---

## 8. Bibliografía
*   **Norma ISO 28560**, *Tecnologías de identificación por radiofrecuencia (RFID) en bibliotecas*.
*   **Protocolo 3M SIP2 (Standard Interchange Protocol v2)**.
*   **Guías de la Biblioteca de la Universidad de Sevilla (Guías BUS)**: Disponible en https://guiasbus.us.es/.

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
