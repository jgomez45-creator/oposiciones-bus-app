import re

filepath = "public/markdown/tema-18.md"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Additive enrichment blocks for Tema 18

enrichment_blocks = """
---

## 📌 Enfoques Clave de Test y Matices del IV Convenio Colectivo (CCOO)

### 1. Clasificación Profesional: Grupo IV (Técnico Auxiliar)
> 💡 **ENFOQUE TEST CCOO:** El Grupo Profesional IV (donde se adscribe la plaza de *Técnico Auxiliar de Biblioteca, Archivo y Museo - Código 4140*) exige como titulación mínima el **Título de Graduado en Educación Secundaria Obligatoria (ESO)**, FP I, Titulación de Técnico o equivalente. Desempeña tareas de ejecución, apoyo técnico y atención a los usuarios en las bibliotecas de la US.

---

### 2. Jornada Laboral, Horarios y Pausas
> 💡 **ENFOQUE TEST CCOO:** La jornada ordinaria de trabajo es de **35 horas semanales de promedio en cómputo anual**. En las jornadas continuadas superiores a 6 horas diarias, el personal tiene derecho a un descanso de **20 minutos** durante la jornada, el cual se computa como **tiempo de trabajo efectivo**.

---

### 3. Licencias y Permisos Retribuidos
> 💡 **ENFOQUE TEST CCOO (PLAZOS DE PERMISOS):**
> * **Matrimonio o parejamiento de hecho:** **15 días naturales consecutivos**.
> * **Intervención quirúrgica o hospitalización de hijo/cónyuge:** **4 días hábiles**.
> * **Traslado de domicilio habitual:** **1 día hábil** (o **2 días hábiles** si implica cambio de localidad).
> * **Exámenes finales u oficiales:** El día entero de la celebración de la prueba.

---

### 4. Régimen Disciplinario: Faltas, Prescripción y Cancelación

> 💡 **ENFOQUE TEST CCOO (TIPIFICACIÓN DE FALTAS):**
> * **Falta Leve:** La falta de asistencia injustificada de **1 día** en un mes, o la puntualidad no justificada en 3 ocasiones al mes.
> * **Falta Grave:** La falta de asistencia injustificada de **2 a 4 días** en un mes.
> * **Falta Muy Grave:** La falta de asistencia injustificada de **más de 4 días** en un mes, o el acoso laboral/sexual.

> 💡 **ENFOQUE TEST CCOO (PRESCRIPCIÓN DE FALTAS vs. CANCELACIÓN DE SANCIONES):**
> Es la trampa más recurrente en los exámenes de CCOO. No debes confundir ambos conceptos:
>
> 1. **Prescripción de las Faltas (Tiempo para expedientar desde que se comete o conoce):**
>    * **Leves:** Prescriben a los **10 días**.
>    * **Graves:** Prescriben a los **20 días**.
>    * **Muy Graves:** Prescriben a los **60 días**.
>
> 2. **Cancelación de Sanciones en la Hoja de Servicios (Limpieza del expediente tras cumplir la sanción):**
>    * **Leves:** Se cancelan de oficio a los **6 meses**.
>    * **Graves:** Se cancelan de oficio al **1 año**.
>    * **Muy Graves:** Se cancelan de oficio a los **2 años**.
"""

if "> 💡 **ENFOQUE TEST CCOO (PRESCRIPCIÓN DE FALTAS vs. CANCELACIÓN DE SANCIONES):**" not in content:
    content = content + "\n\n" + enrichment_blocks

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Enrichment of tema-18.md completed successfully!")
