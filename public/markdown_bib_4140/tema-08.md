# Tema 8: Tecnologías aplicadas en bibliotecas
## RFID, autopréstamo y sistemas de seguridad

---

## 1. Tecnología RFID en Bibliotecas
La tecnología **RFID** (Radio Frequency Identification / Identificación por Radiofrecuencia) ha sustituido progresivamente a los códigos de barras tradicionales en las bibliotecas universitarias para optimizar el control de inventario y la gestión del préstamo.

### ¿Qué es la RFID?
Es un sistema de almacenamiento y recuperación de datos remoto que utiliza ondas de radio para transmitir la identidad de un objeto de forma inalámbrica y sin necesidad de contacto directo o visión directa entre el emisor y el receptor.

### Ventajas de la RFID frente al Código de Barras
*   **Lectura y Devolución en Bloque:** La principal ventaja del RFID es que permite **prestar y devolver documentos en bloque** (varios libros apilados a la vez), reduciendo drásticamente los tiempos de espera y el trabajo administrativo repetitivo.
*   **Lectura a Distancia:** No requiere contacto visual ni orientación física del lector óptico hacia el código de barras del libro.
*   **Capacidad de Almacenamiento:** Las etiquetas RFID (tags) contienen un microchip donde se almacena el identificador del documento y un código de seguridad modificable en tiempo real.
*   **Facilidad de Inventariado:** Permite hacer inventarios rápidos pasando un lector portátil de mano por las estanterías sin necesidad de retirar los libros físicos uno por uno.

---

## 2. Componentes de un Sistema RFID en Bibliotecas
Para que funcione el flujo de control y préstamo por radiofrecuencia se requieren diversos elementos hardware e integraciones de software:

1.  **Etiquetas RFID (Tags):** Microchips adhesivos planos provistos de una pequeña antena de cobre que se pegan en las páginas finales de los libros o en los soportes multimedia.
2.  **Estaciones de Personal y Alfombrillas Lectoras:**
    *   Ubicadas en los mostradores de atención presencial de la BUS.
    *   La **alfombrilla lectora de RFID** se clasifica desde el punto de vista informático y de hardware como un **dispositivo periférico** de entrada/salida conectado al ordenador de gestión.
3.  **Terminales de Autopréstamo:** Pantallas interactivas táctiles integradas con una superficie lectora RFID que permiten al usuario identificarse (con su carnet universitario) y tramitar el préstamo de sus libros de manera autónoma sin intervención del personal bibliotecario.
4.  **Estaciones de Devolución Automática (Buzones Inteligentes):** Permiten al usuario depositar los libros en un buzón las 24 horas del día. El sistema RFID detecta los libros al caer, realiza la devolución automática en el catálogo Alma y desactiva la alarma.
5.  **Arcos de Seguridad (Barreras EAS):** Antenas verticales situadas en las puertas de salida de la biblioteca que detectan si un libro pasa a través de ellas con el bit de alarma activado, emitiendo una alerta sonora y visual.

---

## 3. Integración con el Sistema de Seguridad y el Catálogo
La seguridad de los libros se gestiona mediante el bit **EAS** (Electronic Article Surveillance / Vigilancia Electrónica de Artículos) integrado en el chip de la etiqueta RFID:
*   *Fase de Préstamo:* Cuando se formaliza el préstamo (ya sea en el mostrador o en el autopréstamo), el sistema lee el chip del libro, lo asigna a la cuenta del usuario en Alma y **desactiva el bit de alarma (EAS = 0)**. El usuario puede pasar por los arcos sin que suene la alarma.
*   *Fase de Devolución:* Al registrarse la devolución del documento, el sistema vuelve a **activar el bit de alarma (EAS = 1)** para proteger el libro mientras esté depositado en la estantería de libre acceso.

---

## 4. Esquema de Repaso Rápido
*   **RFID:** Identificación por radiofrecuencia (tecnología inalámbrica).
*   **Permite:** Prestar y devolver documentos en bloque (varios libros simultáneamente).
*   **Alfombrilla Lectora:** Clasificada como un **dispositivo periférico**.
*   **Autopréstamo:** Fomenta la autonomía del usuario y reduce colas en mostradores.
*   **Bit EAS:** Estado de la alarma (1 = Protegido/Suena; 0 = Prestado/Pasa libre).
*   **Inventariado Inalámbrico:** Lectura directa en estantería sin retirar los volúmenes.

---

## 5. Conceptos Clave
*   **EAS (Electronic Article Surveillance):** Tecnología de seguridad que utiliza etiquetas electromagnéticas o de radiofrecuencia para detectar la sustracción no autorizada de artículos en las salidas del establecimiento.
*   **Buzón Inteligente de Devolución:** Dispositivo equipado con lector RFID y conexión de red que permite la devolución de materiales en tiempo real y la actualización inmediata de la cuenta del usuario en el SIGB.
*   **Tag RFID:** Dispositivo miniaturizado compuesto por una antena y un chip de memoria que almacena información del documento para su transmisión por radiofrecuencia.
