import os

base_dir = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
signals_dir = os.path.join(base_dir, "public", "images", "signals")
os.makedirs(signals_dir, exist_ok=True)

svgs = {
    # 1. Prohibición
    "prohibido_apagar_con_agua.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" stroke="#DC2626" stroke-width="8" fill="#FFFFFF"/>
  <!-- Fuego -->
  <path d="M 46 62 Q 50 48 45 42 Q 52 52 55 62 Z" fill="#000000"/>
  <!-- Cubo -->
  <rect x="28" y="32" width="10" height="12" rx="1" fill="#000000" transform="rotate(-30 33 38)"/>
  <!-- Agua salpicando -->
  <path d="M38 38 Q45 42 43 48" stroke="#000000" stroke-width="2.5" fill="none"/>
  <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="#DC2626" stroke-width="8"/>
</svg>""",

    "prohibido_vehiculos_manutencion.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" stroke="#DC2626" stroke-width="8" fill="#FFFFFF"/>
  <!-- Carretilla de manutención -->
  <circle cx="38" cy="62" r="4" fill="#000000"/>
  <circle cx="58" cy="62" r="4" fill="#000000"/>
  <path d="M30 42 h8 v16 h20 v-12 h-6" stroke="#000000" stroke-width="4" fill="none"/>
  <path d="M58 35 v25 L65 50" stroke="#000000" stroke-width="4" fill="none"/>
  <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="#DC2626" stroke-width="8"/>
</svg>""",

    # 2. Obligación
    "uso_obligatorio_mascarilla.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <circle cx="50" cy="46" r="14" fill="#FFFFFF"/>
  <path d="M38 46 Q50 56 62 46 v4 C62 55 50 62 38 50 Z" fill="#E2E8F0" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M38 46 L30 42 M62 46 L70 42" stroke="#FFFFFF" stroke-width="3"/>
</svg>""",

    "uso_obligatorio_arnes.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <!-- Tirantes del arnés -->
  <path d="M35 30 L45 65 H55 L65 30" stroke="#FFFFFF" stroke-width="5" fill="none"/>
  <path d="M30 48 H70 M30 58 H70" stroke="#FFFFFF" stroke-width="5" fill="none"/>
  <circle cx="50" cy="22" r="4.5" fill="#FFFFFF"/>
</svg>""",

    # 3. Advertencia
    "riesgo_tropezar.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <!-- Obstáculo y persona cayendo -->
  <rect x="52" y="70" width="12" height="6" fill="#000000"/>
  <circle cx="42" cy="36" r="4.5" fill="#000000"/>
  <path d="M 40 42 L 54 48 L 62 64 M48 46 L34 56" stroke="#000000" stroke-width="4.5" fill="none" stroke-linecap="round"/>
</svg>""",

    "riesgo_biologico.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <!-- Símbolo biológico simplificado -->
  <circle cx="50" cy="50" r="6" stroke="#000000" stroke-width="3" fill="none"/>
  <circle cx="50" cy="40" r="9" stroke="#000000" stroke-width="3.5" fill="none"/>
  <circle cx="41" cy="55" r="9" stroke="#000000" stroke-width="3.5" fill="none"/>
  <circle cx="59" cy="55" r="9" stroke="#000000" stroke-width="3.5" fill="none"/>
</svg>""",

    # 4. Salvamento
    "camilla.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#15803D"/>
  <line x1="20" y1="50" x2="80" y2="50" stroke="#FFFFFF" stroke-width="5"/>
  <circle cx="34" cy="42" r="5" fill="#FFFFFF"/>
  <path d="M42 46 h25 v4 h-25 z" fill="#FFFFFF"/>
  <rect x="16" y="48" width="68" height="4" fill="#FFFFFF"/>
</svg>""",

    "flecha_salvamento.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#15803D"/>
  <path d="M25 50 h50 M60 35 L75 50 L60 65" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>""",

    # 5. Incendios
    "escalera_incendio.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#DC2626"/>
  <line x1="38" y1="20" x2="38" y2="80" stroke="#FFFFFF" stroke-width="6"/>
  <line x1="62" y1="20" x2="62" y2="80" stroke="#FFFFFF" stroke-width="6"/>
  <line x1="38" y1="32" x2="62" y2="32" stroke="#FFFFFF" stroke-width="5"/>
  <line x1="38" y1="44" x2="62" y2="44" stroke="#FFFFFF" stroke-width="5"/>
  <line x1="38" y1="56" x2="62" y2="56" stroke="#FFFFFF" stroke-width="5"/>
  <line x1="38" y1="68" x2="62" y2="68" stroke="#FFFFFF" stroke-width="5"/>
</svg>""",

    "flecha_incendio.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#DC2626"/>
  <path d="M25 50 h50 M60 35 L75 50 L60 65" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>"""
}

# Write additional SVGs
for filename, content in svgs.items():
    filepath = os.path.join(signals_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated additional {filename} successfully.")

print("All additional signal SVGs generated!")
