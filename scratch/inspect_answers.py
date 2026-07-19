import fitz

def get_answers_text(path, name):
    doc = fitz.open(path)
    print(f"\n--- ANSWERS FOR {name} ---")
    print("Total pages:", len(doc))
    
    # Search for answers block
    answers_start_page = -1
    for p in range(len(doc)):
        text = doc[p].get_text()
        if "CUADRO DE RESPUESTAS" in text or "RESPUESTAS CORRECTAS" in text:
            answers_start_page = p
            break
            
    print("Answers block starts at page:", answers_start_page)
    if answers_start_page != -1:
        for p in range(answers_start_page, len(doc)):
            print(f"--- Page {p} ---")
            print(doc[p].get_text()[:1500])

get_answers_text(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas_Convenio2026.pdf", "Convenio")
get_answers_text(r"C:\Users\usuario\Downloads\Opsiciones\Test_Ley_Organica_3_2007_Igualdad.pdf", "Igualdad")
