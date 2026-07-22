import re

filepath = "public/markdown/tema-19.md"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Additive enrichment blocks for Tema 19

enrichment_blocks = """
---

## 📌 Enfoques Clave de Test y Matices de la Ley Orgánica de Igualdad 3/2007 (CCOO)

### 1. Principios Informadores del Ordenamiento Jurídico
> 💡 **ENFOQUE TEST CCOO:** El principio de igualdad de trato y de oportunidades entre mujeres y hombres es un **principio informador del ordenamiento jurídico** (Art. 4). Como tal, se integrará en la interpretación y aplicación de todas las normas jurídicas españolas y en la actuación de la Universidad de Sevilla.

---

### 2. Inversión de la Carga de la Prueba
> 💡 **ENFOQUE TEST CCOO (Art. 13):** En los procesos judiciales sobre discriminación por razón de sexo, opera la **inversión de la carga de la prueba**: cuando la parte actora alegue indicios fundamentados de discriminación, corresponderá a la **parte demandada** probar la ausencia de discriminación y la justificación objetiva y neutral de la medida.

---

### 3. Presencia Equilibrada en Órganos Colegiados
> 💡 **ENFOQUE TEST CCOO (Art. 14):** Se entiende por **composición equilibrada** la presencia de mujeres y hombres en órganos colegiados y comisiones de selección de forma que las personas de cada sexo **no superen el 60% ni sean inferiores al 40%** en el total de miembros.

---

### 4. Planes de Igualdad en la Universidad de Sevilla
> 💡 **ENFOQUE TEST CCOO (Art. 45-48):** La Universidad de Sevilla está obligada a elaborar, implantar y evaluar periódicamente su **Plan de Igualdad**, el cual debe ser negociado con la representación sindical (CCOO, UGT, etc.) y coordinado técnicamente por la **Unidad de Igualdad de la US**.
"""

if "> 💡 **ENFOQUE TEST CCOO (Art. 13):**" not in content:
    content = content + "\n\n" + enrichment_blocks

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Enrichment of tema-19.md completed successfully!")
