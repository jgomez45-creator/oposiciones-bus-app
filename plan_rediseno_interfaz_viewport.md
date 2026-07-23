# Plan de Rediseño de Interfaz y Usabilidad (Viewport 100vh / Above the Fold)

**Proyecto:** Oposiciones BUS - Universidad de Sevilla  
**Objetivo:** Eliminar el desbordamiento y scroll vertical innecesario en los paneles de configuración y navegación de la aplicación, garantizando que todas las acciones clave (como el botón **"Iniciar Examen"**) permanezcan visibles a primera vista (*Above the Fold*) sin requerir desplazamiento.

---

## 1. Diagnóstico Detallado por Pantalla

### 🔴 1.1 Pantalla Prioritaria: Test Formadores (`FormadoresTests.jsx`)
* **Estado actual:** Estructura de 1 sola columna vertical con `tab-header` prominente, 4 tarjetas de baterías desplegadas verticalmente (`280px` min-width) y un panel de opciones ("Modalidad de Práctica", "Límite de Preguntas" y botón de acción) apilado debajo.
* **Problema:** En cualquier resolución estándar (1080p, 768p o portátiles), el usuario se ve obligado a hacer scroll hacia abajo para encontrar y pulsar el botón **"Iniciar Examen"**.
* **Impacto UI/UX:** Alta fricción al iniciar un test; el botón de acción principal queda oculto fuera del campo de visión inicial.

---

### 🟠 1.2 Simulacros de Examen y Test Generales (`QuizRunner.jsx`)
* **Estado actual:** Encabezado con título y descripción amplia, seguido de 7 botones de selección de modo, seguidos a su vez del selector de temas (grid de 20 checkboxes cuando se activa modo personalizado o cuaderno) o selectores de simulacros predefinidos, seguidos de las fichas de límite de preguntas y los 3 botones de inicio ("Test Clásico", "Simulacro en Papel", "Imprimir PDF").
* **Problema:** El contenido vertical supera los 900px-1100px. Al seleccionar modalidades personalizadas o simulacros, la rejilla de temas desplaza los botones de inicio muy abajo.
* **Impacto UI/UX:** El usuario pierde de vista los botones para ejecutar la prueba mientras selecciona opciones en la parte superior.

---

### 🟡 1.3 Lector de Temario (`TopicViewer.jsx`)
* **Estado actual:** La cabecera del visor incluye controles de lectura, audiolibro TTS/MP3, temporizador, selector de tipografía y temas de lectura, ocupando un bloque vertical considerable antes del contenido real del tema.
* **Problema:** En pantallas pequeñas o portátiles, el primer párrafo del tema apenas es visible sin desplazarse debido a la altura de la barra superior y los paneles de configuración de lectura.
* **Impacto UI/UX:** Reduce el área útil de lectura y requiere scroll continuo desde el inicio.

---

### 🟡 1.4 Dashboard / Inicio (`Dashboard.jsx`)
* **Estado actual:** Encabezado con título y perfil de usuario, fila de 3 tarjetas de estadísticas (Progreso, Tiempo, Precisión), seguido de un grid de 2 columnas con la tabla completa de 20 temas (scrollable) en la izquierda y el widget Pomodoro + Tema Sugerido a la derecha.
* **Problema:** Aunque la tabla de temas cuenta con scroll interno (`topic-list-scroll`), las tarjetas superiores y el header ocupan cerca del 45% de la altura de la pantalla, dejando poco espacio útil para interactuar con la lista de temas y el temporizador.
* **Impacto UI/UX:** Espacio útil restringido en pantallas < 900px de altura.

---

### 🟢 1.5 Tarjetas de Memorización / Flashcards (`Flashcards.jsx`)
* **Estado actual:** Panel central `quiz-config-card` con icono grande (`48px`), título, descripción, selector dropdown y botón de inicio. En modo de estudio activo, la tarjeta 3D y los controles de valoración ocupan un bloque bien centrado.
* **Problema:** En el panel de configuración inicial, la tarjeta central tiene padding excesivo y márgenes superiores/inferiores holgados.
* **Impacto UI/UX:** Menor que en los tests, pero susceptible de optimización para un ajuste vertical perfecto.

---

### 🟢 1.6 Estadísticas y Progreso (`Stats.jsx`)
* **Estado actual:** Fila superior de 3 métricas numéricas, seguida de distribución de estados y panel de temas más estudiados.
* **Problema:** La vista completa requiere scroll para ver el botón de reinicio y los temas más estudiados en portátiles.
* **Impacto UI/UX:** Aceptable para informes de análisis, aunque optimizable.

---

## 2. Propuestas de Maquetación y Layout

### 📌 2.1 Rediseño de "Test Formadores" (`FormadoresTests.jsx`)
1. **Layout en 2 Columnas de Altura Fija (`100vh` / `calc(100vh - header)`):**
   * **Columna Izquierda (60% ancho):** Lista compacta de baterías en formato fila/tarjeta horizontal con radio button o selección activa destacada (`max-height: calc(100vh - 160px)`, `overflow-y: auto`).
   * **Columna Derecha (40% ancho):** Panel fijo de configuración ("Modalidad", "Preguntas") rematado por el botón **"Iniciar Examen"** siempre visible sin scroll.
2. **Barra / Panel Flotante de Reserva (`Sticky Bottom Action Bar`):**
   * Para dispositivos móviles o pantallas táctiles pequeñas (`< 768px`), implementar una barra inferior fija (`position: sticky`, `bottom: 0`, `z-index: 50`) con el botón **"Iniciar Examen"** prominente.

---

### 📌 2.2 Rediseño de "Simulacros y Tests" (`QuizRunner.jsx`)
1. **Distribución en Grid Split View:**
   * **Header compacto:** Reducir subtítulos explicativos extensos a tooltips o bloques colapsables.
   * **Panel Superior de Modos:** Agrupar las 7 modalidades en una barra horizontal de pestañas tipo pill (`compact mode bar`).
   * **Sección Principal Dividida:**
     * *Izquierda:* Selector de temas / simulacros con scroll independiente (`overflow-y: auto`).
     * *Derecha:* Resumen de selección + Botones de inicio en bloque `sticky` a la derecha.

---

### 📌 2.3 Rediseño del Lector de Temario (`TopicViewer.jsx`)
1. **Barra de Herramientas Compacta (Single-Line Toolbar):**
   * Integrar controles de audio TTS/MP3, tiempo de estudio y opciones de lectura en una sola línea horizontal de `42px` de altura.
2. **Área de Lectura Flex Expandida:**
   * Aplicar `flex-1` con `overflow-y: auto` al contenedor del documento markdown para maximizar el espacio de lectura continuo.

---

### 📌 2.4 Rediseño del Dashboard (`Dashboard.jsx`)
1. **Header y Stats en Rejilla Ultra-Compacta:**
   * Reducir padding interno de las 3 tarjetas de estadísticas de `24px` a `12px-16px`.
   * Fijar la altura del contenedor principal a `calc(100vh - navbar)` permitiendo scroll interno únicamente en la tabla de temas.

---

## 3. Estrategia Técnica de CSS y Arquitectura de Viewport

### 3.1 Contenedor Raíz de Vista (`Viewport Layout Engine`)
Garantizar que los contenedores principales de pestaña utilicen el modelo flexbox de altura ajustada al viewport:

```css
/* Ajuste global de vistas al espacio visible disponible */
.tab-container,
.dashboard-view,
.stats-view,
.flashcards-view {
  height: calc(100vh - var(--header-height, 70px));
  max-height: calc(100vh - var(--header-height, 70px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* Scroll inteligente únicamente donde hay listas o contenido largo */
.scrollable-content-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}
```

### 3.2 Grid Específico de 2 Columnas para Configuración de Tests
```css
.quiz-setup-split-view {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

@media (max-width: 900px) {
  .quiz-setup-split-view {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}
```

### 3.3 Barra Acción Fija / Sticky Action Footer
```css
.sticky-action-footer {
  position: sticky;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  z-index: 40;
  display: flex;
  justify-content: flex-end;
}
```

---

## 4. Priorización de Implementación

Una vez revisado y aprobado este documento por el usuario, el orden cronológico de desarrollo será el siguiente:

| Fase | Componente | Descripción de la Intervención |
| :--- | :--- | :--- |
| **Fase 1** | `FormadoresTests.jsx` | Reorganización del selector de baterías a 2 columnas + fijación de panel de inicio a la derecha (*Above the fold*). |
| **Fase 2** | `QuizRunner.jsx` | Rediseño de configuración de tests/simulacros con panel lateral de inicio de test y lista scrollable de temas. |
| **Fase 3** | `App.css` / `index.css` | Aplicación de reglas globales de Viewport CSS (`calc(100vh - navbar)`, utilidades de scroll conttenido). |
| **Fase 4** | `TopicViewer.jsx` | Compactación de la barra de lectura y audio TTS para maximizar área de visualización del temario. |
| **Fase 5** | `Dashboard.jsx` & `Flashcards.jsx` | Ajuste final de micro-paddings en tarjetas de resumen y widgets Pomodoro. |
| **Fase 6** | Verificación Responsive | Pruebas visuales en distintas resoluciones (1920x1080, 1366x768, tablet y móvil). |

---
*Documento generado únicamente como propuesta de arquitectura UI/UX para revisión previa.*
