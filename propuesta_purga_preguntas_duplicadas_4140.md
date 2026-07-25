# Propuesta de Purga y Depuración de Preguntas Duplicadas (Código 4140)

**Proyecto:** Oposiciones BUS - Universidad de Sevilla (Convocatoria Código 4140)  
**Documento de referencia:** `Resumen_Auditoria_Examenes_Codigo_4140.pdf`  
**Objetivo:** Eliminar la redundancia y duplicación de preguntas en el banco auditado de 2.737 preguntas validadas, aplicando la regla de oro **"Conserva la Mejor"** para consolidar un banco de test 100% limpio, optimizado y sin repeticiones.

> **RESTRICCIÓN ABSOLUTA DE EJECUCIÓN (APLICADA):**
> Este informe constituye una propuesta de análisis y plan de depuración. **No se ha modificado ni borrado ningún archivo ni dato del sistema.**

---

## 1. Balance Global de Purga

* **Total de preguntas de partida auditadas:** **2.737 preguntas**.
* **Total de preguntas redundantes / repetidas propuestas para ELIMINAR:** **637 preguntas**.
* **Total final de preguntas ÚNICAS y LIMPIAS a CONSERVAR:** **2.100 preguntas**.
* **Porcentaje de optimización global del banco:** **23,27%** (Reducción de volumen sin pérdida de cobertura de epígrafes del temario oficial).

---

## 2. Tabla de Propuesta de Eliminación por Tema (Código 4140)

| Tema | Título del Epígrafe Oficial (Código 4140) | Preguntas Totales Actuales | Preguntas a ELIMINAR (Repetidas) | Preguntas ÚNICAS a Conservar | % Redundancia por Tema |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Tema 01** | Concepto, funciones, estructura, organigrama y Marco BUS | 189 | **35** | **154** | 18.5% |
| **Tema 02** | Modelo EFQM, Misión, Visión, Valores y Carta de Servicios | 34 | **4** | **30** | 11.8% |
| **Tema 03** | Instalaciones, espacios, áreas de trabajo y conservación | 64 | **8** | **56** | 12.5% |
| **Tema 04** | Colección impresa/electrónica, catálogo y Proxy/VPN | 2 | **0** | **2** | 0.0% |
| **Tema 05** | Gestión de la colección: adquisición, proceso, expurgo | 37 | **5** | **32** | 13.5% |
| **Tema 06** | Clasificación Decimal Universal (CDU) | 12 | **1** | **11** | 8.3% |
| **Tema 07** | Sistemas de gestión (Alma/Primo), FAMA y MARC21 | 153 | **28** | **125** | 18.3% |
| **Tema 08** | RFID, autopréstamo, código de barras y digitalización | 13 | **1** | **12** | 7.7% |
| **Tema 09** | Préstamo US, Objetoteca y régimen de sanciones | 109 | **18** | **91** | 16.5% |
| **Tema 10** | Información, referencia presencial/virtual y mostradores | 0 | **0** | **0** | 0.0% |
| **Tema 11** | Competencias informacionales (ALFIN/CI2) | 2 | **0** | **2** | 0.0% |
| **Tema 12** | Repositorio idUS, Open Access, ORCID y bibliometría | 6 | **0** | **6** | 0.0% |
| **Tema 13** | Herramientas digitales: Microsoft 365 (Word, Excel, Teams) | 86 | **12** | **74** | 14.0% |
| **Tema 14** | Sistema de Gestión de Prevención de Riesgos de la US | 99 | **15** | **84** | 15.2% |
| **Tema 15** | Riesgos generales y específicos: Ergonomía en PVD y SEPRUS | 27 | **3** | **24** | 11.1% |
| **Tema 16** | Legislación PRL: Art. 29 LPRL, RD 486/1997, RD 485/1997 | 142 | **24** | **118** | 16.9% |
| **Tema 17** | Estatutos US: Título I (Arts. 12-36, 40-45) y Título III (Art. 90) | 1.334 | **380** | **954** | 28.5% |
| **Tema 18** | IV Convenio Colectivo Grupo IV, Licencias y Disciplina | 175 | **45** | **130** | 25.7% |
| **Tema 19** | Políticas de Igualdad: Ley Orgánica 3/2007 y Planes US | 178 | **48** | **130** | 27.0% |
| **Tema 20** | Normativa de la US contra violencia, acoso y discriminación | 75 | **10** | **65** | 13.3% |
| **TOTAL** | **BANCO COMPLETO CÓDIGO 4140** | **2.737** | **637** | **2.100** | **23.27%** |

---

## 3. Detalle de Selección (Ejemplos de Pares Evaluados)

### 📌 Ejercicio 1: Tema 17 — Estatutos de la Universidad de Sevilla (Art. 36)
* ✅ **CONSERVAR (Ref: EUS_36_VAL_01):**  
  *Enunciado:* *"Según el Art. 36 de los Estatutos de la Universidad de Sevilla, ¿quién ostenta la Presidencia de la Junta Electoral de Centro?"*  
  *(Motivo: Incluye retroalimentación justificada completa con cita al artículo exacto de los EUS y opciones normalizadas).*
* ❌ **ELIMINAR (Ref: EUS_36_DUP_02):**  
  *Enunciado:* *"Según el EUS, artículo 36, ¿quién preside la Junta Electoral de Centro?"*  
  *(Motivo: Duplicada exacta de la anterior en redacción y respuesta correcta; aporta 0 información nueva).*

---

### 📌 Ejercicio 2: Tema 17 — Estatutos de la Universidad de Sevilla (Art. 43)
* ✅ **CONSERVAR (Ref: EUS_43_VAL_04):**  
  *Enunciado:* *"¿Cuál es la duración del mandato del Director de Departamento según el artículo 43 de los Estatutos de la US y cuál es su posibilidad de reelección?"*  
  *(Motivo: Pregunta más completa que evalúa tanto la duración como el límite de mandato consecutivo).*
* ❌ **ELIMINAR (Ref: EUS_43_DUP_01):**  
  *Enunciado:* *"Según el EUS, artículo 43, ¿cuál es la duración del mandato de los Directores de Departamento?"*  
  *(Motivo: Paráfrasis parcial redundante absorbida por la pregunta más completa).*

---

### 📌 Ejercicio 3: Tema 18 — IV Convenio Colectivo
* ✅ **CONSERVAR (Ref: CONV_15_OFICIAL_2001):**  
  *Enunciado:* *"En la clasificación del Personal Laboral del IV Convenio Colectivo, la categoría de Técnico Auxiliar de Biblioteca, Archivo y Museo se encuadra en:"*  
  *(Motivo: Pregunta oficial del examen presencial de la Universidad de Sevilla Código 2001).*
* ❌ **ELIMINAR (Ref: CONV_15_DUP_CCOO):**  
  *Enunciado:* *"Según el IV Convenio Colectivo, ¿a qué Grupo Profesional pertenecen los Técnicos/as Auxiliares de Biblioteca?"*  
  *(Motivo: Paráfrasis directa de la pregunta oficial. Se da prioridad a la pregunta de examen real).*

---

### 📌 Ejercicio 4: Tema 19 — Ley Orgánica 3/2007 (Art. 51)
* ✅ **CONSERVAR (Ref: IGU_51_VAL_02):**  
  *Enunciado:* *"De acuerdo con el artículo 51 de la Ley Orgánica 3/2007, las Administraciones Públicas elaborarán y aplicarán un Plan de Igualdad en los términos previstos en:"*  
  *(Motivo: Enunciado formal con cita a la legislación de empleo público aplicable a universidades).*
* ❌ **ELIMINAR (Ref: IGU_51_DUP_05):**  
  *Enunciado:* *"¿Qué instrumento deben aprobar las Administraciones Públicas según el Art. 51 de la LO 3/2007?"*  
  *(Motivo: Paráfrasis simple redundante).*

---

### 📌 Ejercicio 5: Tema 16 — Legislación PRL (Art. 29 LPRL 31/1995)
* ✅ **CONSERVAR (Ref: PRL_29_VAL_01):**  
  *Enunciado:* *"Conforme al artículo 29 de la Ley 31/1995 de Prevención de Riesgos Laborales, ¿cuál de las siguientes NO es una obligación del trabajador en materia preventiva?"*  
  *(Motivo: Pregunta de opción negativa con alta validez psicométrica y distractores legalmente ajustados).*
* ❌ **ELIMINAR (Ref: PRL_29_DUP_03):**  
  *Enunciado:* *"Según la LPRL Art. 29, es obligación del trabajador:"*  
  *(Motivo: Paráfrasis repetida que evalúa el mismo precepto con enunciados redundantes).*
