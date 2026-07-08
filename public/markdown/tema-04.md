# Tema 4: La colección impresa y electrónica
## La colección de la biblioteca universitaria. Selección, adquisición y expurgo. La colección de recursos electrónicos. Revistas electrónicas, libros electrónicos y bases de datos. Acceso a los recursos electrónicos

---

## 1. La Colección Híbrida de la Biblioteca Universitaria
La colección de la biblioteca universitaria actual es de carácter **híbrido**, conviviendo en un mismo espacio de gestión el fondo físico (monografías impresas, revistas en papel, mapas, Fondo Antiguo) y los recursos electrónicos (revistas científicas, libros electrónicos, bases de datos referenciales y a texto completo, patentes).

El propósito de la colección en la BUS es dar cobertura a las necesidades de:
1.  **Docencia y Aprendizaje:** Adquisición de manuales y bibliografía recomendada recogida en las guías docentes de los grados y másteres.
2.  **Investigación:** Acceso a bases de datos de citas y revistas científicas internacionales de alto nivel.

---

## 2. Adquisición Cooperativa y Consorciada: El CBUA
En el ámbito de las universidades públicas de Andalucía, la adquisición de grandes paquetes de recursos electrónicos (especialmente las bases de datos multidisciplinares y los paquetes de revistas de grandes editoriales científicas como Elsevier, Springer o Wiley) se realiza de forma centralizada y conjunta para abaratar costes:

*   **El CBUA (Consorcio de Bibliotecas Universitarias de Andalucía):** Creado en el año 2001, agrupa a las 9 universidades públicas andaluzas bajo la coordinación de la Junta de Andalucía.
*   **Adquisición Consorciada:** La negociación unificada del CBUA frente a los proveedores internacionales de información científica permite conseguir economías de escala y licencias compartidas de acceso a recursos electrónicos que individualmente las universidades no podrían financiar de forma aislada.

---

## 3. Modelos de Adquisición de Recursos Electrónicos
A diferencia de los libros impresos (que se compran y pasan a ser propiedad física permanente de la biblioteca), las licencias de uso de recursos electrónicos se adquieren bajo diversos modelos comerciales avanzados:

### A. Suscripción y Licencias "Big Deals"
*   **Definición:** Modelo tradicional para paquetes de revistas científicas. La biblioteca paga una cuota anual para dar acceso a sus usuarios al catálogo completo de revistas de una gran editorial científica (ej. ScienceDirect de Elsevier).
*   **Contratos de Transición:** Actualmente vinculados a acuerdos de tipo "Leer y Publicar" (Read & Publish), donde la cuota anual cubre tanto la lectura del contenido como las tasas de procesamiento de artículos (APC - Article Processing Charges) para que los investigadores de la US publiquen en abierto.

### B. PDA (Patron Driven Acquisition - Adquisición Guiada por el Usuario)
*   **Definición:** Modelo para la compra de libros electrónicos. La biblioteca activa y carga en su catálogo FAMA miles de registros de e-books de un editor sin pagar por ellos inicialmente. Los estudiantes e investigadores pueden abrir y leer los libros.
*   **Funcionamiento:** La compra real del libro se ejecuta de forma automática únicamente cuando se supera un número determinado de accesos, descargas o lecturas (ej. más de 3 lecturas en un mes por diferentes usuarios).

### C. EBA (Evidence Based Acquisition - Adquisición Basada en la Evidencia)
*   **Definición:** La biblioteca realiza un pago inicial fijo a la editorial para dar acceso ilimitado a todo su catálogo de libros electrónicos durante un período establecido (normalmente un año).
*   **Funcionamiento:** Transcurrido el año, la biblioteca analiza las estadísticas reales de uso de los e-books y utiliza el dinero inicialmente depositado para seleccionar y adquirir en propiedad permanente los títulos más consultados.

---

## 4. Derechos de Autor e Igualdad en Acceso Abierto: Licencias Creative Commons (CC)
Para regular los derechos de autor de las obras compartidas en el repositorio institucional **IdUS** en abierto, se emplean las licencias Creative Commons, basadas en la combinación de 4 condiciones de uso:

1.  **Atribución (BY):** Obliga a citar y reconocer la autoría original de la obra.
2.  **No Comercial (NC):** Prohíbe que la obra sea explotada con fines lucrativos o comerciales.
3.  **Sin Obra Derivada (ND):** Prohíbe alterar, transformar o modificar la obra para generar una nueva.
4.  **Compartir Igual (SA):** Si se modifica la obra, la creación resultante debe difundirse bajo la misma licencia que la original.

*Combinaciones comunes:* La licencia más abierta es **CC-BY** (exige solo atribución), y la más restrictiva comercialmente es **CC-BY-NC-ND** (atribución, sin uso comercial y sin obra derivada).

---

## 5. Protocolos y Sistemas de Autenticación de Acceso Remoto
Dado que los recursos electrónicos están restringidos y licenciados para la comunidad universitaria de la US, el acceso desde fuera de los campus universitarios requiere sistemas de validación técnica de identidad:

### A. VPN (Virtual Private Network)
*   **Funcionamiento:** Conexión segura punto a punto que encapsula el tráfico. Requiere instalar un software cliente en el ordenador del usuario que simula que este se encuentra conectado directamente a la red física local de la universidad.

### B. EZproxy
*   **Funcionamiento:** Servidor proxy web mantenido por la biblioteca. Cuando un usuario intenta acceder a un recurso electrónico restringido desde su hogar a través del catálogo FAMA, el enlace lo redirige a EZproxy, donde se identifica con su **UVUS**. El servidor proxy realiza la descarga de la información en su nombre utilizando su dirección IP autorizada institucional y se la muestra al usuario en el navegador web de forma transparente.

### C. Autenticación Federada Shibboleth / OpenAthens (Protocolo SAML)
*   **Funcionamiento:** Estándar moderno de autenticación basado en el protocolo seguro **SAML 2.0**. No requiere simular IPs autorizadas.
*   **Mecanismo:** La biblioteca forma parte de una federación de identidades (como **SIR** - Servicio de Identidad de RedIRIS en España). Cuando el usuario accede a la web del editor científico, selecciona "Identificarse a través de su Institución", introduce sus credenciales UVUS en el portal de su universidad, y esta envía una confirmación segura digital al editor autorizando el acceso.

---

## 6. Esquema de Repaso Rápido
*   **CBUA:** Consorcio creado en 2001 para la compra unificada andaluza de revistas y bases de datos.
*   **PDA:** Compra de e-books activada automáticamente por el uso en tiempo real del lector.
*   **EBA:** Compra permanente al final de año basada en las estadísticas de uso de los e-books tras un prepago.
*   **Licencias CC:** Combinación de BY (Atribución), NC (No Comercial), ND (Sin Derivada), SA (Compartir Igual).
*   **Autenticación remota:** VPN (túnel IP), EZproxy (servidor proxy web de la BUS), Shibboleth (autenticación federada).

---

## 7. Reglas Mnemotécnicas para el Examen
Para memorizar los modelos y protocolos de este tema, utiliza estas asociaciones:

*   **Diferencia entre PDA y EBA: "El Momento del Pago"**
    *   **P**DA (**P**rimero el uso, luego la compra): Pagas cada libro individual en el instante en que el usuario lo usa (**P**atrón -> **P**ago en caliente).
    *   **E**BA (**E**videncia acumulada al final): Haces un depósito previo y compras de forma definitiva al final tras ver la (**E**videncia -> **E**stadísticas).
    *   *Mnemónico:* *"En el **P**DA el pago es **P**ronto (al instante). En el **E**BA la compra es tras la **E**videncia (al final)".*
*   **Las Condiciones Creative Commons: "B-N-N-S"**
    *   **B**Y (atribución -> *By* en inglés, "por").
    *   **N**C (no comercial).
    *   **N**D (no derivar -> *No Derivatives*).
    *   **S**A (compartir igual -> *Share Alike*).
    *   *Mnemónico:* *"**B**uenos **N**egocios **N**o **S**oportan plagios: BY - NC - ND - SA".*
*   **Sistemas de Acceso Remoto: "El Mensajero Proxy" (EZproxy)**
    *   EZproxy actúa como un mensajero: tú le pides la página desde casa, él va a la universidad a buscarla con su credencial IP y vuelve a tu casa a enseñártela.
    *   *Mnemónico:* *"EZproxy es el cartero: viaja en tu nombre de forma **Fácil (EZ)** a la universidad".*

---

## 8. Conceptos Clave
*   **CBUA (Consorcio de Bibliotecas Universitarias de Andalucía):** Entidad cooperativa que gestiona los servicios informáticos y adquisiciones consorciadas de las universidades públicas andaluzas.
*   **PDA (Patron Driven Acquisition):** Modelo comercial de adquisición de libros electrónicos donde el uso activo de los usuarios desencadena la compra real de la monografía.
*   **Shibboleth:** Sistema informático de código abierto basado en SAML para proporcionar inicio de sesión único y acceso federado seguro a recursos restringidos.
*   **Licencia Creative Commons:** Instrumento legal que permite a los autores otorgar permisos de uso sobre sus trabajos bajo determinadas condiciones, manteniendo sus derechos.
*   **Acuerdo Transformativo:** Contrato de suscripción a revistas científicas que reorienta el gasto de las bibliotecas desde el modelo clásico de pago por lectura hacia el pago por publicación en abierto.
