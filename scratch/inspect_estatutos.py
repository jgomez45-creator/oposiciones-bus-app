import fitz
import re

def inspect_pdf(path, name):
    doc = fitz.open(path)
    print(f"\n--- INSPECTING {name} ---")
    print("Total pages:", len(doc))
    
    # Find where the answers block starts
    answers_start_page = -1
    for p in range(len(doc)):
        text = doc[p].get_text()
        if "CUADRO DE RESPUESTAS" in text or "RESPUESTAS CORRECTAS" in text:
            answers_start_page = p
            break
            
    print("Answers block starts at page:", answers_start_page)
    if answers_start_page != -1:
        print("Answers page sample text:")
        print(doc[answers_start_page].get_text()[:400])
    
    # Let's print some sample questions from page 0
    print("Page 0 sample text (first 500 chars):")
    print(doc[0].get_text()[:500])

inspect_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 1.pdf", "Estatutos Bloque 1")
inspect_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 2.pdf", "Estatutos Bloque 2")
