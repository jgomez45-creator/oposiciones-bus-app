import fitz
import re

def analyze_pdf(path, name):
    doc = fitz.open(path)
    print(f"\n==================== ANALYZING {name} ====================")
    
    # Extract first 5 pages text
    sample_text = ""
    for p in range(min(5, len(doc))):
        sample_text += doc[p].get_text() + "\n"
        
    # Find all question numbers to see the range of questions
    parts = re.split(r'\n\s*(\d+)\.\s+', "\n" + sample_text)
    
    print(f"Sample questions from first pages:")
    q_found = 0
    for i in range(1, len(parts), 2):
        if q_found >= 5:
            break
        q_num = parts[i]
        q_content = parts[i+1].strip().split('\n')[0]
        print(f"  Q{q_num}: {q_content[:100]}...")
        q_found += 1

analyze_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 1.pdf", "Estatutos Bloque 1")
analyze_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 2.pdf", "Estatutos Bloque 2")
analyze_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas_Convenio2026.pdf", "Convenio")
analyze_pdf(r"C:\Users\usuario\Downloads\Opsiciones\Test_Ley_Organica_3_2007_Igualdad.pdf", "Igualdad")
