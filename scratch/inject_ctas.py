import os
import re

base_dir = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
markdown_dir = os.path.join(base_dir, "public", "markdown")
app_url = "https://oposiciones-bus-app.vercel.app"

# Tailored mid-topic callouts based on each topic's contents
mid_topic_topics = {
    "01": "las competencias de los órganos de la BUS, reglamentos y plazos de préstamo",
    "02": "los principios del modelo EFQM y los compromisos de las Cartas de Servicios",
    "03": "los valores recomendados de iluminación, temperatura y humedad en salas y depósitos",
    "04": "las vías de acceso abierto (verde/dorada/híbrida) y tecnologías de acceso remoto",
    "05": "las fases del tratamiento técnico y los criterios MUSTIE del expurgo",
    "06": "las clases principales de la CDU y el significado de los signos de relación",
    "07": "las diferencias entre Alma (LSP) y Primo (descubrimiento) junto con las facetas de búsqueda",
    "08": "las frecuencias de radio, tecnologías RFID y funcionamiento de las estaciones de autopréstamo",
    "09": "los plazos y límites de préstamo por tipo de usuario y las de sanciones por demora",
    "10": "los niveles de referencia de la BUS y las diferencias entre obras primarias y secundarias",
    "11": "las directrices del plagio académico, estilos de cita (APA/Vancouver) y Mendeley",
    "12": "los identificadores de investigador (ORCID), agencias evaluadoras (ANECA) y factor de impacto",
    "13": "las herramientas de Microsoft 365 (Teams, OneDrive, SharePoint) y atajos de teclado esenciales",
    "14": "los plazos de notificación de accidentes (SEPRUS) y la composición del Comité de Seguridad y Salud",
    "15": "las distancias de pantalla PVD, pausas obligatorias, pesos máximos y riesgos biológicos",
    "16": "las obligaciones del trabajador (Art. 29) y los porcentajes de color de las señales de seguridad",
    "17": "los requisitos del Rector, sectores del Claustro y competencias del Consejo Social",
    "18": "los días de vacaciones por antigüedad, licencias matrimoniales y plazos de prescripción de faltas",
    "19": "los conceptos de discriminación directa/indirecta y los porcentajes de representación equilibrada",
    "20": "el ámbito de aplicación de las denuncias de acoso, medidas cautelares y plazos de resolución"
}

files = [f for f in os.listdir(markdown_dir) if f.startswith("tema") and f.endswith(".md")]

for filename in files:
    filepath = os.path.join(markdown_dir, filename)
    
    # Try to extract topic ID (e.g. from tema-01.md -> 01, from tema_17_estructurado_v2.md -> 17)
    match = re.search(r"tema[-_](\d+)", filename)
    topic_id = match.group(1) if match else "17"
    
    # Get tailored term for mid-topic CTA
    tailored_term = mid_topic_topics.get(topic_id, "las competencias y regulaciones de este apartado")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Let's check if the CTAs are already injected to avoid duplicating them
    if "ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP" in content:
        print(f"Skipping {filename}: already has CTAs.")
        continue

    lines = content.split("\n")
    
    # 1. Header Banner Insertion
    # Insert right after the first heading (# Title) or at line index 1 if it starts with #
    header_index = 0
    for idx, line in enumerate(lines):
        if line.startswith("# "):
            header_index = idx + 1
            break
            
    header_cta = f"""
> 📱 **ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP**  
> Accede a **oposiciones-bus-app** ({app_url}) para complementar tu lectura:
> * 🎴 **Flashcards:** Memoriza {tailored_term} en minutos.
> * 📝 **Modo Test:** Pon a prueba este tema con preguntas de exámenes oficiales.
"""
    lines.insert(header_index, header_cta)
    
    # 2. Mid-topic Callout Insertion
    # Find all ## headers in the modified lines
    h2_indices = [idx for idx, line in enumerate(lines) if line.startswith("## ") or line.startswith("### ")]
    
    mid_index = len(lines) // 2
    if len(h2_indices) >= 3:
        mid_index = h2_indices[2]  # Insert right before the 3rd subheader
    elif len(h2_indices) >= 2:
        mid_index = h2_indices[1]  # Insert right before the 2nd subheader
        
    mid_cta = f"""
> 💡 **REPASO RÁPIDO EN LA APP:**  
> ¿Te cuesta memorizar {tailored_term}? Entra en la app ({app_url}) y repasa las **Tarjetas de Memorización** específicas de este apartado para afianzar los conceptos sin dudar.
"""
    lines.insert(mid_index, mid_cta)
    
    # 3. Footer CTA Block Insertion
    footer_cta = f"""
---
### 🎯 ¡Ponte a prueba antes de pasar al siguiente tema!
Has completado la lectura teórica. Ahora es momento de consolidar lo aprendido:
1. **Repaso de Flashcards:** Revisa las tarjetas de este tema en la sección *Flashcards*.
2. **Simulacro de Examen:** Realiza un test de autoevaluación en la sección *Tests*.

🔗 **Accede ahora a la app:** [Abrir oposiciones-bus-app]({app_url})
---
"""
    # Append to the end
    lines.append(footer_cta)
    
    # Write back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
        
    print(f"Processed and updated {filename} successfully.")

print("All files processed!")
