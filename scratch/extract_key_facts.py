import json

def extract_facts(json_path, txt_path, name):
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"=== KEY FACTS FOR {name} ===\n\n")
        for q in questions:
            correct_idx = q["correctAnswer"]
            correct_opt = q["options"][correct_idx]
            f.write(f"Q{q['id']}. {q['question']}\n")
            f.write(f"  FACT: {correct_opt}\n\n")
            
    print(f"Extracted key facts to {txt_path}")

extract_facts("src/data/baterias/estatutos_bloque1.json", "scratch/estatutos_bloque1_facts.txt", "Estatutos Bloque 1")
extract_facts("src/data/baterias/estatutos_bloque2.json", "scratch/estatutos_bloque2_facts.txt", "Estatutos Bloque 2")
extract_facts("src/data/baterias/convenio_2026.json", "scratch/convenio_facts.txt", "Convenio 2026")
extract_facts("src/data/baterias/igualdad_2007.json", "scratch/igualdad_facts.txt", "Igualdad LO 3/2007")
