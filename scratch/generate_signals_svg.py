import os

base_dir = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
signals_dir = os.path.join(base_dir, "public", "images", "signals")
os.makedirs(signals_dir, exist_ok=True)

# Define SVG content templates
svgs = {
    # 1. PROHIBICION (Circle with red ring and red diagonal line)
    "prohibido_fumar.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" stroke="#DC2626" stroke-width="8" fill="#FFFFFF"/>
  <rect x="30" y="47" width="34" height="6" rx="1" fill="#000000"/>
  <rect x="58" y="47" width="6" height="6" fill="#EA580C"/>
  <path d="M 68,45 Q 70,41 68,37 T 68,29" stroke="#78716C" stroke-width="2.5" fill="none"/>
  <path d="M 73,47 Q 75,43 73,39 T 73,31" stroke="#78716C" stroke-width="2.5" fill="none"/>
  <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="#DC2626" stroke-width="8"/>
</svg>""",

    "prohibido_pasar.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" stroke="#DC2626" stroke-width="8" fill="#FFFFFF"/>
  <circle cx="50" cy="30" r="5" fill="#000000"/>
  <path d="M47 38h6a2 2 0 0 1 2 2v10h-2v15h-4v-15h-2V40a2 2 0 0 1 2-2z" fill="#000000"/>
  <path d="M42 42l2 8 M58 42l-2 8" stroke="#000000" stroke-width="4" stroke-linecap="round"/>
  <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="#DC2626" stroke-width="8"/>
</svg>""",

    "prohibido_agua_no_potable.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" stroke="#DC2626" stroke-width="8" fill="#FFFFFF"/>
  <path d="M32 35 h14 v-8 h4 v8 h6 v6 h-24 z" fill="#000000"/>
  <path d="M35 55 L38 72 H52 L55 55 Z" fill="none" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="48" cy="47" r="2.5" fill="#000000"/>
  <circle cx="44" cy="52" r="2" fill="#000000"/>
  <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="#DC2626" stroke-width="8"/>
</svg>""",

    "prohibido_entrada.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" stroke="#DC2626" stroke-width="8" fill="#FFFFFF"/>
  <path d="M40 32 v24 c0 6 4 10 10 10 s10-4 10-10 v-24 h-4 v18 h-2 v-22 h-4 v22 h-2 v-18 z" fill="#000000"/>
  <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="#DC2626" stroke-width="8"/>
</svg>""",


    # 2. OBLIGACION (Blue circle, white pictogram)
    "uso_obligatorio_gafas.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <path d="M26 48c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9zm30 0c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z" stroke="#FFFFFF" stroke-width="5" fill="none"/>
  <path d="M44 48 h12 M20 48 h6 M74 48 h6" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
</svg>""",

    "uso_obligatorio_casco.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <path d="M50 25c-15 0-26 11-26 25h52c0-14-11-25-26-25z" fill="#FFFFFF"/>
  <rect x="20" y="50" width="60" height="5" rx="2.5" fill="#FFFFFF"/>
  <path d="M35 55 h30 l-5 12 H40 z" fill="#FFFFFF"/>
</svg>""",

    "uso_obligatorio_botas.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <path d="M30 30 h12 v26 c0 4 3 6 7 6 h13 v10 H30 Z" fill="#FFFFFF"/>
  <path d="M52 30 h12 v26 c0 4 3 6 7 6 h13 v10 H52 Z" fill="#FFFFFF"/>
</svg>""",

    "uso_obligatorio_guantes.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <path d="M33 50c0-6 4-8 7-6v-14c0-2 2-2 2 0v10h2v-12c0-2 2-2 2 0v12h2v-10c0-2 2-2 2 0v10h2v-6c0-2 2-2 2 0v14c0 6-4 10-9 10h-2c-4 0-6-3-6-8z" fill="#FFFFFF"/>
  <path d="M53 50c0-6 4-8 7-6v-14c0-2 2-2 2 0v10h2v-12c0-2 2-2 2 0v12h2v-10c0-2 2-2 2 0v10h2v-6c0-2 2-2 2 0v14c0 6-4 10-9 10h-2c-4 0-6-3-6-8z" fill="#FFFFFF" transform="scale(-1, 1) translate(-100, 0)"/>
</svg>""",

    "uso_obligatorio_proteccion_auditiva.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#004B93"/>
  <path d="M32 52c0-10 8-18 18-18s18 8 18 18" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
  <rect x="22" y="46" width="10" height="15" rx="3" fill="#FFFFFF"/>
  <rect x="68" y="46" width="10" height="15" rx="3" fill="#FFFFFF"/>
</svg>""",


    # 3. ADVERTENCIA (Yellow triangle with black borders and black pictogram)
    "riesgo_electrico.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <path d="M53 26 L35 52 H49 L45 74 L63 44 H49 Z" fill="#000000"/>
</svg>""",

    "riesgo_inflamable.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <path d="M50 25c0 10-8 15-8 25s8 15 8 15s8-5 8-15-8-18-8-25z M50 45c0 5-3 8-3 12s3 6 3 6s3-2 3-6-3-9-3-12z" fill="#000000"/>
</svg>""",

    "peligro_general.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <rect x="46" y="30" width="8" height="28" rx="4" fill="#000000"/>
  <circle cx="50" cy="68" r="5" fill="#000000"/>
</svg>""",

    "carga_suspendida.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <path d="M50 24 v14 A8 8 0 0 1 42 46" stroke="#000000" stroke-width="4" fill="none"/>
  <rect x="35" y="55" width="30" height="15" fill="#000000"/>
  <line x1="38" y1="55" x2="50" y2="46" stroke="#000000" stroke-width="3"/>
  <line x1="62" y1="55" x2="50" y2="46" stroke="#000000" stroke-width="3"/>
</svg>""",

    "materias_toxicas.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,8 94,86 6,86" fill="#FBBF24" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
  <circle cx="50" cy="40" r="11" fill="#000000"/>
  <rect x="44" y="47" width="12" height="8" fill="#000000"/>
  <circle cx="46" cy="40" r="2.5" fill="#FBBF24"/>
  <circle cx="54" cy="40" r="2.5" fill="#FBBF24"/>
  <line x1="32" y1="62" x2="68" y2="28" stroke="#000000" stroke-width="5" stroke-linecap="round"/>
  <line x1="32" y1="28" x2="68" y2="62" stroke="#000000" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="40" r="11" fill="#000000"/>
  <rect x="45" y="47" width="10" height="8" fill="#000000"/>
  <circle cx="47" cy="40" r="2" fill="#FBBF24"/>
  <circle cx="53" cy="40" r="2" fill="#FBBF24"/>
</svg>""",


    # 4. SALVAMENTO (Green square with white pictogram)
    "salida_emergencia.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#15803D"/>
  <rect x="68" y="20" width="16" height="60" fill="none" stroke="#FFFFFF" stroke-width="5"/>
  <path d="M12 50 h32 M38 42 L46 50 L38 58" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="50" cy="30" r="4.5" fill="#FFFFFF"/>
  <path d="M47 37l5 3-2 12h3v10h-4v-8l-3-8-2 6v10h-4v-12l6-11z" fill="#FFFFFF"/>
</svg>""",

    "primeros_auxilios.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#15803D"/>
  <rect x="42" y="20" width="16" height="60" fill="#FFFFFF"/>
  <rect x="20" y="42" width="60" height="16" fill="#FFFFFF"/>
</svg>""",

    "ducha_seguridad.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#15803D"/>
  <path d="M30 75 V25 H60 V35" stroke="#FFFFFF" stroke-width="5" fill="none"/>
  <path d="M50 35 H70 L60 45 Z" fill="#FFFFFF"/>
  <line x1="56" y1="50" x2="56" y2="70" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="3,3"/>
  <line x1="60" y1="50" x2="60" y2="70" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="3,3"/>
  <line x1="64" y1="50" x2="64" y2="70" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="3,3"/>
</svg>""",

    "lavaojos.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#15803D"/>
  <circle cx="50" cy="35" r="10" stroke="#FFFFFF" stroke-width="4" fill="none"/>
  <circle cx="46" cy="33" r="2" fill="#FFFFFF"/>
  <circle cx="54" cy="33" r="2" fill="#FFFFFF"/>
  <path d="M22 65 Q 40 45 46 50 T 78 65" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <path d="M30 75 h40 v5 h-40 z" fill="#FFFFFF"/>
</svg>""",


    # 5. INCENDIOS (Red square with white pictogram)
    "extintor.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#DC2626"/>
  <rect x="40" y="32" width="20" height="46" rx="3" fill="#FFFFFF"/>
  <rect x="45" y="24" width="10" height="8" fill="#FFFFFF"/>
  <path d="M47 24 L42 18 H48 Z" fill="#FFFFFF"/>
  <path d="M55 27 C 64 27 64 42 64 47 V66" stroke="#FFFFFF" stroke-width="4" fill="none"/>
</svg>""",

    "manguera_incendio.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#DC2626"/>
  <circle cx="50" cy="50" r="26" stroke="#FFFFFF" stroke-width="5" fill="none"/>
  <circle cx="50" cy="50" r="12" stroke="#FFFFFF" stroke-width="3" fill="none"/>
  <path d="M27 50 H73 M50 27 V73" stroke="#FFFFFF" stroke-width="3"/>
  <rect x="70" y="45" width="8" height="12" fill="#FFFFFF"/>
</svg>""",

    "pulsador_alarma.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#DC2626"/>
  <rect x="25" y="25" width="50" height="50" stroke="#FFFFFF" stroke-width="5" fill="none"/>
  <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
  <path d="M18 18 L28 10 M82 18 L72 10" stroke="#FFFFFF" stroke-width="4"/>
</svg>""",

    "telefono_emergencia.svg": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="6" fill="#DC2626"/>
  <path d="M30 25 h8 c2 0 3 1 3 3 v12 c0 2-1 3-3 3 h-8 z M62 25 h8 c2 0 3 1 3 3 v12 c0 2-1 3-3 3 h-8 z M38 32 h24 v6 h-24 z" fill="#FFFFFF"/>
</svg>"""
}

# Write each SVG
for filename, content in svgs.items():
    filepath = os.path.join(signals_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {filename} successfully.")

print("All signal SVGs generated!")
