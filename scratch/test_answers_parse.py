import fitz

def parse_answers(path, name):
    doc = fitz.open(path)
    # Search for answers block
    answers_start_page = -1
    for p in range(len(doc)):
        text = doc[p].get_text()
        if "CUADRO DE RESPUESTAS" in text or "RESPUESTAS CORRECTAS" in text:
            answers_start_page = p
            break
            
    if answers_start_page == -1:
        print(f"{name}: No answers block found")
        return {}
        
    full_text = ""
    for p in range(answers_start_page, len(doc)):
        full_text += doc[p].get_text() + "\n"
        
    tokens = full_text.split()
    answers = {}
    
    for i in range(len(tokens) - 1):
        tok = tokens[i]
        next_tok = tokens[i+1]
        
        if tok.isdigit():
            q_num = int(tok)
            if next_tok.upper() in ['A', 'B', 'C', 'D']:
                answers[q_num] = next_tok.upper()
                
    print(f"{name}: Parsed {len(answers)} answers. Min key: {min(answers.keys()) if answers else None}, Max key: {max(answers.keys()) if answers else None}")
    # Print first few and last few as sample
    sorted_keys = sorted(answers.keys())
    if len(sorted_keys) >= 5:
        print("Sample:", {k: answers[k] for k in sorted_keys[:5]}, "...", {k: answers[k] for k in sorted_keys[-5:]})
    return answers

parse_answers(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas_Convenio2026.pdf", "Convenio")
parse_answers(r"C:\Users\usuario\Downloads\Opsiciones\Test_Ley_Organica_3_2007_Igualdad.pdf", "Igualdad")
parse_answers(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 1.pdf", "Estatutos Bloque 1")
parse_answers(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 2.pdf", "Estatutos Bloque 2")
