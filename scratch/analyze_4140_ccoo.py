import json
import glob
import os

files = {
    "Estatutos Bloque 1": "src/data/baterias/estatutos_bloque1.json",
    "Estatutos Bloque 2": "src/data/baterias/estatutos_bloque2.json",
    "IV Convenio Colectivo": "src/data/baterias/convenio_2026.json",
    "Ley de Igualdad 3/2007": "src/data/baterias/igualdad_2007.json"
}

total_q = 0
results = {}

for name, filepath in files.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            count = len(data)
            total_q += count
            
            # Analyze negative questions
            negatives = 0
            literal_law = 0
            distractors_all_correct = 0
            
            valid_4140 = 0
            out_of_scope_4140 = 0
            out_reasons = []

            for q in data:
                qtext = q.get('question', '').lower()
                explanation = q.get('explanation', '').lower()
                options = [o.lower() for o in q.get('options', [])]
                
                # Check negative phrasing
                if any(w in qtext for w in ['no ', 'incorrecta', 'falsa', 'excepto', 'salvo']):
                    negatives += 1
                
                # Check wildcard options ("todas son correctas", etc)
                if any(any(w in opt for w in ['todas las', 'todas son', 'ninguna de', 'a y b', 'b y c']) for opt in options):
                    distractors_all_correct += 1

                # Scope checking for 4140:
                # Tema 17 (Estatutos): Syllabus specifies Title I (De la Universidad) and Title III (De la Comunidad Universitaria: Estudiantes, PDI, PAS).
                # Questions on Title II (Docencia e Investigación), Title IV (Estructura de la US - Departamentos/Institutos), Title V (Régimen Económico/Patrimonial) might be outside if strictly restricted to Title I & III.
                # Tema 18 (Convenio): Syllabus specifies Grupo IV (Técnico Auxiliar) & general provisions (Derechos, Faltas, Licencias, Salarios). Questions specific to Grupo I/II/III specific technical qualifications or non-applicable categories are Out of Scope.
                # Tema 19 (Igualdad): LO 3/2007 Preliminar, Title I, Title IV, Title V, Equality Plans. 
                
                is_valid = True
                reason = ""

                if name.startswith("Estatutos"):
                    # Check if question is outside Title I and Title III
                    if "título ii" in explanation or "título iv" in explanation or "título v" in explanation or "título vi" in explanation:
                        # Check if prompt/syllabus strictly covers Título I and Título III
                        # Notice: Theme 17 syllabus title: "Estatutos de la Universidad de Sevilla (I): Estructura general, órganos de gobierno. (II) Comunidad Universitaria".
                        pass

                if is_valid:
                    valid_4140 += 1
                else:
                    out_of_scope_4140 += 1

            results[name] = {
                "total": count,
                "negatives": negatives,
                "wildcards": distractors_all_correct,
                "valid_4140": valid_4140,
                "out_of_scope": out_of_scope_4140
            }

print(f"Total Questions Analyzed: {total_q}")
print(json.dumps(results, indent=2, ensure_ascii=False))
