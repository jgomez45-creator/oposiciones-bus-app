import json

def compile_questions(json_path, txt_path, name):
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"=== QUESTIONS FOR {name} ===\n\n")
        for q in questions:
            correct_letter = ['A', 'B', 'C', 'D'][q["correctAnswer"]]
            f.write(f"Q{q['id']}. {q['question']}\n")
            for idx, opt in enumerate(q["options"]):
                letter = ['a', 'b', 'c', 'd'][idx]
                f.write(f"  {letter}) {opt}\n")
            f.write(f"Correct: {correct_letter}\n")
            f.write(f"Explanation: {q['explanation']}\n\n")
            
    print(f"Compiled {len(questions)} questions to {txt_path}")

compile_questions("src/data/baterias/estatutos_bloque1.json", "scratch/estatutos_bloque1_qs.txt", "Estatutos Bloque 1")
compile_questions("src/data/baterias/estatutos_bloque2.json", "scratch/estatutos_bloque2_qs.txt", "Estatutos Bloque 2")
compile_questions("src/data/baterias/convenio_2026.json", "scratch/convenio_qs.txt", "Convenio 2026")
compile_questions("src/data/baterias/igualdad_2007.json", "scratch/igualdad_qs.txt", "Igualdad LO 3/2007")
