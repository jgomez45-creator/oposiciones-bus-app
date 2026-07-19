import fitz
import re

def test_full_pdf(path, name):
    doc = fitz.open(path)
    print(f"\n--- TESTING FULL PARSE FOR {name} ---")
    
    # Find answers page
    answers_start_page = -1
    for p in range(len(doc)):
        text = doc[p].get_text()
        if "CUADRO DE RESPUESTAS" in text or "RESPUESTAS CORRECTAS" in text:
            answers_start_page = p
            break
            
    if answers_start_page == -1:
        answers_start_page = len(doc)
        
    # Extract questions text
    full_text = ""
    for p in range(answers_start_page):
        full_text += doc[p].get_text() + "\n"
        
    parts = re.split(r'\n\s*(\d+)\.\s+', "\n" + full_text)
    
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
        
        def clean(s):
            s = s.strip()
            if s.startswith("-"):
                s = s[1:].strip()
            s = re.sub(r'\s+', ' ', s)
            return s
            
        return clean(q_text), [clean(opt_a), clean(opt_b), clean(opt_c), clean(opt_d)]

    q_count = 0
    warnings = 0
    for i in range(1, len(parts), 2):
        q_num = int(parts[i])
        q_content = parts[i+1]
        q_count += 1
        
        q_text, options = split_options(q_content)
        if len(options) != 4:
            print(f"WARNING: Q{q_num} in {name} has {len(options)} options.")
            print("CONTENT SLICE:", q_content[:150])
            warnings += 1
            
    print(f"Parsed {q_count} questions. Warnings: {warnings}")

test_full_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas_Convenio2026.pdf", "Convenio")
test_full_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Test_Ley_Organica_3_2007_Igualdad.pdf", "Igualdad")
test_full_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 1.pdf", "Estatutos Bloque 1")
test_full_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 2.pdf", "Estatutos Bloque 2")
