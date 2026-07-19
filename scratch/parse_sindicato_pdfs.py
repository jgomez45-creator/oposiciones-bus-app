import fitz
import re
import json
import os

def clean_text(s):
    s = s.strip()
    if s.startswith("-"):
        s = s[1:].strip()
    s = re.sub(r'\s+', ' ', s)
    return s

def parse_answers_block(doc, start_page):
    full_text = ""
    for p in range(start_page, len(doc)):
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
                
    return answers

def split_options(q_content):
    idx_a = q_content.find("a)")
    if idx_a == -1:
        return q_content, []
    idx_b = q_content.find("b)", idx_a)
    if idx_b == -1:
        return q_content, []
    idx_c = q_content.find("c)", idx_b)
    if idx_c == -1:
        return q_content, []
    idx_d = q_content.find("d)", idx_c)
    if idx_d == -1:
        return q_content, []
        
    q_text = q_content[:idx_a].strip()
    opt_a = q_content[idx_a+2 : idx_b].strip()
    opt_b = q_content[idx_b+2 : idx_c].strip()
    opt_c = q_content[idx_c+2 : idx_d].strip()
    opt_d = q_content[idx_d+2 :].strip()
    
    return clean_text(q_text), [clean_text(opt_a), clean_text(opt_b), clean_text(opt_c), clean_text(opt_d)]

def generate_explanation(q_num, question, correct_opt_text, correct_letter, doc_type):
    if doc_type == "estatutos":
        # Check if the question refers to an article
        match = re.search(r'art[ií]culo\s+(\d+)', question, re.IGNORECASE)
        art_num = f"Artículo {match.group(1)}" if match else "los Estatutos de la US"
        return f"La respuesta correcta es la opción {correct_letter}: \"{correct_opt_text}\". Esto se establece de forma expresa en el {art_num} de los Estatutos de la Universidad de Sevilla (Decreto 98/2025)."
    elif doc_type == "convenio":
        match = re.search(r'art[ií]culo\s+(\d+)', question, re.IGNORECASE)
        art_num = f"Artículo {match.group(1)}" if match else "el IV Convenio Colectivo"
        return f"La respuesta correcta es la opción {correct_letter}: \"{correct_opt_text}\". Esto se encuentra regulado en el {art_num} del IV Convenio Colectivo del Personal Laboral de las Universidades Públicas de Andalucía."
    elif doc_type == "igualdad":
        match = re.search(r'art[ií]culo\s+(\d+)', question, re.IGNORECASE)
        art_num = f"Artículo {match.group(1)}" if match else "la Ley Orgánica 3/2007"
        return f"La respuesta correcta es la opción {correct_letter}: \"{correct_opt_text}\". Esto viene dispuesto en el {art_num} de la Ley Orgánica 3/2007, de 22 de marzo, para la igualdad efectiva de mujeres y hombres."
    return f"La respuesta correcta es la opción {correct_letter}: \"{correct_opt_text}\"."

def process_pdf(pdf_path, output_json_path, doc_type, name):
    print(f"\nProcessing {name} ({pdf_path})...")
    doc = fitz.open(pdf_path)
    
    # 1. Find answers block
    answers_start_page = -1
    for p in range(len(doc)):
        text = doc[p].get_text()
        if "CUADRO DE RESPUESTAS" in text or "RESPUESTAS CORRECTAS" in text:
            answers_start_page = p
            break
            
    if answers_start_page == -1:
        print(f"Error: No se encontró el cuadro de respuestas en {name}.")
        return False
        
    print(f"  Answers start page: {answers_start_page}")
    answers_map = parse_answers_block(doc, answers_start_page)
    print(f"  Parsed {len(answers_map)} answers.")
    
    # 2. Extract questions text
    full_text = ""
    for p in range(answers_start_page):
        full_text += doc[p].get_text() + "\n"
        
    num_pattern = "|".join(str(x) for x in sorted(answers_map.keys()))
    parts = re.split(rf'\n\s*({num_pattern})\.\s+', "\n" + full_text)
    
    questions_list = []
    q_count = 0
    warnings = 0
    
    # Map letter options to indices
    letter_to_index = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
    
    for i in range(1, len(parts), 2):
        q_num = int(parts[i])
        q_content = parts[i+1]
        q_count += 1
        
        q_text, options = split_options(q_content)
        
        if len(options) != 4:
            print(f"  Warning: Q{q_num} has {len(options)} options.")
            warnings += 1
            continue
            
        correct_letter = answers_map.get(q_num)
        if not correct_letter:
            print(f"  Warning: No answer found for Q{q_num}.")
            warnings += 1
            continue
            
        correct_idx = letter_to_index.get(correct_letter)
        correct_opt_text = options[correct_idx]
        
        explanation = generate_explanation(q_num, q_text, correct_opt_text, correct_letter, doc_type)
        
        questions_list.append({
            "id": q_num,
            "question": q_text,
            "options": options,
            "correctAnswer": correct_idx,
            "explanation": explanation
        })
        
    print(f"  Parsed {len(questions_list)} valid questions (Warnings/Errors: {warnings}).")
    
    # Save to JSON
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(questions_list, f, indent=2, ensure_ascii=False)
        
    print(f"  Saved to {output_json_path}")
    return True

# Run for all 4 PDFs
base_dir = r"C:\Users\usuario\Downloads\Opsiciones"
output_dir = r"c:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\src\data\baterias"

pdf_configs = [
    {
        "path": os.path.join(base_dir, "Preguntas Test de los Estatutos de la US bloque 1.pdf"),
        "json": os.path.join(output_dir, "estatutos_bloque1.json"),
        "type": "estatutos",
        "name": "Estatutos Bloque 1"
    },
    {
        "path": os.path.join(base_dir, "Preguntas Test de los Estatutos de la US bloque 2.pdf"),
        "json": os.path.join(output_dir, "estatutos_bloque2.json"),
        "type": "estatutos",
        "name": "Estatutos Bloque 2"
    },
    {
        "path": os.path.join(base_dir, "Preguntas_Convenio2026.pdf"),
        "json": os.path.join(output_dir, "convenio_2026.json"),
        "type": "convenio",
        "name": "Convenio 2026"
    },
    {
        "path": os.path.join(base_dir, "Test_Ley_Organica_3_2007_Igualdad.pdf"),
        "json": os.path.join(output_dir, "igualdad_2007.json"),
        "type": "igualdad",
        "name": "Igualdad LO 3/2007"
    }
]

for config in pdf_configs:
    process_pdf(config["path"], config["json"], config["type"], config["name"])
