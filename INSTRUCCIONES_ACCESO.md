# Guía de Acceso a la Plataforma BUS Sevilla

Esta guía explica los pasos para acceder y registrarse en la plataforma didáctica virtual para la preparación de oposiciones de **Técnico/a Auxiliar de Biblioteca, Archivo y Museo (US)**.

---

## 🔑 Opciones de Acceso

### 1. Acceso Demo (Invitado)
Si solo deseas ver una demostración rápida de la aplicación sin registrarte:
* En la pantalla de acceso, ve a la sección inferior.
* Haz clic en el botón **Acceso Demo (Invitado)**.
* Se iniciará sesión con un perfil de prueba y el progreso de estudio se guardará localmente en tu navegador.

---

### 2. Registrar un Nuevo Libro Físico
Si has adquirido el temario físico y deseas activar tu cuenta personal con sincronización en la nube (o simulada):
1. En la pantalla de inicio, selecciona la pestaña **Registrar Libro** en la parte superior del formulario.
2. Rellena los campos obligatorios:
   * **Nombre Completo:** Tu nombre y apellidos.
   * **Correo Electrónico:** Dirección de correo que usarás para acceder.
   * **Contraseña:** Mínimo 6 caracteres.
   * **Código de Libro Físico:** Introduce el código de activación (ver apartado de códigos más abajo).
3. Haz clic en **Crear Cuenta y Activar**.

---

### 3. Iniciar Sesión (Usuarios Registrados)
Una vez que hayas completado el registro del libro:
1. Asegúrate de estar en la pestaña **Iniciar Sesión**.
2. Introduce tu **Correo Electrónico** y **Contraseña**.
3. Haz clic en **Iniciar Sesión**.

---

## 🎫 Códigos de Activación Disponibles

### A. Modo Simulador (Por defecto en Local)
Mientras la aplicación no esté conectada a un servidor real de Firebase en la nube (valores por defecto en el archivo `.env`), puedes utilizar los siguientes códigos de prueba para registrarte:
* `BUS-TEST-123`
* `BUS-DEMO-456`
* `BUS-GUEST-789`

### B. Código Especial de Administrador
Hemos configurado un código de administrador permanente que permite crear múltiples cuentas de prueba ilimitadas veces (el código no se consume):
* **Código Admin:** `BUS-ADMIN-2026`
*(Úsalo en la pestaña "Registrar Libro" con cualquier correo electrónico para crear tus cuentas de control).*

### C. Modo Real (Producción en la Nube)
Cuando configures tus credenciales reales de Firebase en el archivo `.env`:
* Deberás dar de alta los códigos en tu base de datos de Firestore dentro de la colección `book_codes`.
* Para generarlos de manera automática, puedes ejecutar el script de utilidades con el comando:
  ```bash
  node scratch/generate_codes.js
  ```
  Esto generará 50 nuevos códigos, los guardará en el archivo de registro `scratch/generated_codes_log.txt` y los subirá directamente a la nube.

---

## 🚫 Control de Sesión Única (Concurrencia)
Por motivos de seguridad y para proteger la propiedad del temario:
* **Solo se permite una sesión activa por usuario.**
* Si inicias sesión con tu cuenta en otro dispositivo o en otra pestaña del navegador, la sesión anterior se cerrará automáticamente y serás redirigido a la pantalla de bloqueo.
