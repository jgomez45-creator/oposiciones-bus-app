import json

files = [
    ("Estatutos Bloque 1", "src/data/baterias/estatutos_bloque1.json", "Tema 17"),
    ("Estatutos Bloque 2", "src/data/baterias/estatutos_bloque2.json", "Tema 17"),
    ("IV Convenio Colectivo", "src/data/baterias/convenio_2026.json", "Tema 18"),
    ("Ley de Igualdad 3/2007", "src/data/baterias/igualdad_2007.json", "Tema 19")
]

audit_results = []
out_of_scope_items = []
valid_items = []

for name, filepath, tema in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        for i, q in enumerate(questions):
            q_id = q.get('id', f"{name}_{i+1}")
            text = q.get('question', '')
            options = q.get('options', [])
            correct = q.get('correctAnswer', 0)
            explanation = q.get('explanation', '')
            
            # Scope rules for 4140:
            # 1. Estatutos: Tema 17 syllabus covers: Estructura de la US, Órganos de Gobierno (Claustro, Consejo de Gobierno, Rector, Vicerrectores, Secretario General, Gerente, Decanos/Directores), Comunidad Universitaria (PDI, PAS, Estudiantes), Defensor Universitario, Consejo Social.
            # Questions on specific department research grants or specific non-PAS elections might be secondary, but let's check.
            # 2. Convenio: Tema 18 covers: Ámbito de aplicación, Selección y contratación, Clasificación profesional (especialmente Grupo IV), Retribuciones, Jornada, Permisos y Licencias, Régimen Disciplinario, Salud Laboral.
            # Questions about specific Grupo I (Titulados Superiores) or Grupo II specific exclusive functions or specific non-applicable categories (e.g. personal docente e investigador laboral no sujeto a este convenio) might be out of scope.
            # 3. Igualdad: Tema 19 covers: LO 3/2007, Objeto, Principios informadores, Carga de la prueba, Presencia equilibrada, Planes de Igualdad en AAGG y Universidades, Unidades de Igualdad.

            # Let's check specific keywords that indicate out-of-scope for 4140:
            out_reason = None
            
            # Checks for Convenio:
            if name == "IV Convenio Colectivo":
                if "grupo i" in text.lower() and "titulado superior" in text.lower() and not "grupo iv" in text.lower():
                    # Check if question is exclusively about Grupo I administrative procedures not affecting Grupo IV
                    pass
                if "profesor contratado doctor" in text.lower() or "profesor ayudante doctor" in text.lower():
                    out_reason = "Afecta a Personal Docente e Investigador (PDI), no al PAS Laboral Grupo IV (Código 4140)"
            
            if out_reason:
                out_of_scope_items.append({
                    "battery": name,
                    "id": q_id,
                    "question": text,
                    "reason": out_reason,
                    "tema": tema
                })
            else:
                valid_items.append({
                    "battery": name,
                    "id": q_id,
                    "question": text,
                    "explanation": explanation,
                    "tema": tema
                })

print(f"Total Valid Questions for Código 4140: {len(valid_items)}")
print(f"Total Out of Scope Questions: {len(out_of_scope_items)}")

for item in out_of_scope_items:
    print(f"OUT: [{item['battery']}] Q: {item['question']} -> Reason: {item['reason']}")
