import fitz
import re

pdf_path = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\examenes_oficiales_grupo_iv\Examen_Grupo_IV_Plaza_4066_Biblioteca,_Archivo_y_Museo.pdf"
doc = fitz.open(pdf_path)

for i in range(len(doc)):
    text = doc[i].get_text()
    print(f"=== Page {i+1} ===")
    print(text[:400])
    # check for a list of answers like "1.- a", "1.- b", or "1. a", or a table
    table_like = re.findall(r'\b\d{1,2}\b\s*[A-Da-d]\b', text)
    if table_like:
        print(f"    Possible answers found on page {i+1}: {table_like[:10]}")

doc.close()
