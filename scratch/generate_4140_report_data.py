import json
import re

files = [
    ("estatutos_bloque1", "src/data/baterias/estatutos_bloque1.json", "Tema 17", "Estatutos US - Bloque 1"),
    ("estatutos_bloque2", "src/data/baterias/estatutos_bloque2.json", "Tema 17", "Estatutos US - Bloque 2"),
    ("convenio_2026", "src/data/baterias/convenio_2026.json", "Tema 18", "IV Convenio Colectivo"),
    ("igualdad_2007", "src/data/baterias/igualdad_2007.json", "Tema 19", "Ley Orgánica de Igualdad 3/2007")
]

summary = {}
mapping_matrix = []

for key, path, tema, title in files:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        q_count = len(data)
        negatives = 0
        wildcards = 0
        total_len = 0
        literal_art_count = 0
        
        for q in data:
            qtext = q.get('question', '')
            total_len += len(qtext)
            options = q.get('options', [])
            explanation = q.get('explanation', '')
            
            # Negatives
            if re.search(r'\b(no|incorrecta|falsa|excepto|salvo)\b', qtext, re.IGNORECASE):
                negatives += 1
                
            # Wildcards
            if any(re.search(r'\b(todas|ninguna|a y b|b y c|ambas)\b', opt, re.IGNORECASE) for opt in options):
                wildcards += 1
                
            # Article references
            if re.search(r'\bart(ículo|\.)\s*\d+', qtext + " " + explanation, re.IGNORECASE):
                literal_art_count += 1
                
            # Extract concept for matrix mapping
            # Get article or key concept
            art_match = re.search(r'art[íículoo\.]*\s*\d+(\.\d+)?', explanation, re.IGNORECASE)
            art_str = art_match.group(0) if art_match else "Concepto Clave"
            
            # Add representative entries to matrix
            mapping_matrix.append({
                "tema": tema,
                "bateria": title,
                "articulo": art_str,
                "pregunta": qtext[:90] + "..." if len(qtext) > 90 else qtext,
                "propuesta": f"Desarrollo explícito del {art_str} y matiz legal de {qtext[:50]}..."
            })

        summary[title] = {
            "tema": tema,
            "total": q_count,
            "negatives": negatives,
            "negatives_pct": round((negatives / q_count) * 100, 1),
            "wildcards": wildcards,
            "wildcards_pct": round((wildcards / q_count) * 100, 1),
            "avg_length": round(total_len / q_count, 1),
            "literal_articles": literal_art_count,
            "literal_pct": round((literal_art_count / q_count) * 100, 1)
        }

print("=== PSYCHOMETRIC SUMMARY ===")
print(json.dumps(summary, indent=2, ensure_ascii=False))
print(f"\nTotal Mapping Entries: {len(mapping_matrix)}")
