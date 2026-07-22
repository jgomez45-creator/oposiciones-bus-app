import re

filepath = "public/markdown/tema-17.md"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Additive enrichment blocks for Tema 17

# 1. Enriquecimiento en el Claustro Universitario
claustro_enrichment = """
> 💡 **ENFOQUE TEST CCOO:** El Claustro Universitario consta de **303 miembros** (Rector/a, Secretario/a General, Gerente y 300 claustrales electos). La distribución sectorial es: **51% PDI Permanente (153)**, **8% PDI No Permanente (24)**, **30% Estudiantes (90)** y **11% PTGAS (33)**. La convocatoria extraordinaria para elecciones a Rector debe ser solicitada por al menos **1/3 de los claustrales** (incluyendo el 30% del Sector A) y ser aprobada por **mayoría de 2/3 del Claustro**.
"""

if "> 💡 **ENFOQUE TEST CCOO:** El Claustro Universitario consta" not in content:
    content = content.replace(
        "• Elaborar y aprobar los Estatutos y su reforma.",
        "• Elaborar y aprobar los Estatutos y su reforma.\n" + claustro_enrichment
    )

# 2. Nota de alcance para Defensor Universitario (Arts. 80-85)
defensor_note = """
> 📌 **NOTA DE ALCANCE CÓDIGO 4140 (Arts. 80-85 - Defensor Universitario):** El Defensor Universitario es elegido por el Claustro Universitario por **mayoría de 3/5** de sus miembros para un mandato de 4 años no reelegible consecutivamente. Aunque aparece en preguntas de CCOO, recordamos que el programa oficial del Código 4140 restringe el Tema 17 al Título I y al Art. 90 del Título III, por lo que la regulación detallada de los Arts. 80-85 no es materia de examen directo.
"""

if "> 📌 **NOTA DE ALCANCE CÓDIGO 4140 (Arts. 80-85" not in content:
    content = content.replace(
        "• Elegir al Defensor/a Universitario.",
        "• Elegir al Defensor/a Universitario.\n" + defensor_note
    )

# 3. Enriquecimiento del Consejo de Gobierno
cg_enrichment = """
> 💡 **ENFOQUE TEST CCOO:** El Consejo de Gobierno está formado por **56 miembros**. El Rector designa directamente a **15 miembros**, mientras que **29 miembros** son elegidos por el Claustro entre los distintos sectores de la comunidad universitaria. Se reúne con carácter ordinario al menos **una vez cada dos meses** durante el periodo lectivo.
"""

if "> 💡 **ENFOQUE TEST CCOO:** El Consejo de Gobierno está formado" not in content:
    content = content.replace(
        "• Aprobar normativas de Inspección de Servicios e Igualdad.",
        "• Aprobar normativas de Inspección de Servicios e Igualdad.\n" + cg_enrichment
    )

# 4. Enriquecimiento del Gerente
gerente_enrichment = """
> 💡 **ENFOQUE TEST CCOO:** El Gerente es propuesto y nombrado por el **Rector/a de acuerdo con el Consejo Social**. Su mandato es de **6 años renovables** y tiene **incompatibilidad total** con el ejercicio de funciones docentes o investigadoras. Ostenta la jefatura directa de los servicios económicos, administrativos y del PTGAS por delegación rectoral.
"""

if "> 💡 **ENFOQUE TEST CCOO:** El Gerente es propuesto y nombrado" not in content:
    content = content.replace(
        "• Dirección y gestión de recursos humanos y PTGAS.",
        "• Dirección y gestión de recursos humanos y PTGAS.\n" + gerente_enrichment
    )

# 5. Enriquecimiento de la Junta de Centro y Exámenes (Art. 26/32)
junta_enrichment = """
> 💡 **ENFOQUE TEST CCOO:** La aprobación del **calendario de exámenes** y de las pruebas de evaluación del rendimiento académico es competencia propia de los **Centros** (Facultades y Escuelas, según el Art. 26 y 32 de los Estatutos), no de los Departamentos ni del Rectorado. La Junta de Centro está compuesta por un máximo de **100 miembros** (52% PDI Perm, 11% PDI No-perm, 30% Estudiantes, 7% PTGAS).
"""

if "> 💡 **ENFOQUE TEST CCOO:** La aprobación del **calendario de exámenes**" not in content:
    content = content.replace(
        "• Aprobar anualmente el Plan de Organización Docente (POD).",
        "• Aprobar anualmente el Plan de Organización Docente (POD).\n" + junta_enrichment
    )

# 6. Enriquecimiento del Artículo 90 (Comunidad Universitaria)
art90_enrichment = """
> 💡 **ENFOQUE TEST CCOO (Art. 90.2.e):** El Estatuto prohíbe explícitamente cualquier tipo de discriminación basándose en una lista de **15 causales**: *nacimiento, origen racial o étnico, sexo, orientación sexual, identidad de género, religión, convicción u opinión, edad, discapacidad, nacionalidad, enfermedad, condición socioeconómica, lingüística, afinidad política y sindical, y apariencia*.
"""

if "> 💡 **ENFOQUE TEST CCOO (Art. 90.2.e):**" not in content:
    content = content.replace(
        "15. Apariencia.",
        "15. Apariencia.\n" + art90_enrichment
    )

# 7. Nota de alcance para Título III Arts. 95-105
pas_note = """
> 📌 **NOTA DE ALCANCE CÓDIGO 4140 (Arts. 95-105 - Título III):** La regulación específica del PAS/PTGAS contenida en los artículos 95 a 105 del Título III se incluye en las preguntas de CCOO a título ilustrativo. Sin embargo, en la convocatoria oficial del Código 4140 el Título III se encuentra acotado exclusivamente a la Disposición General del **Artículo 90** (Sectores, Derechos y Deberes).
"""

if "> 📌 **NOTA DE ALCANCE CÓDIGO 4140 (Arts. 95-105" not in content:
    content = content + "\n\n" + pas_note

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Enrichment of tema-17.md completed successfully!")
