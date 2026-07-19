import fitz
import re

doc = fitz.open(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas_Convenio2026.pdf")
full_text = ""
for p in range(31):
    full_text += doc[p].get_text() + "\n"
    
parts = re.split(r'\n\s*(\d+)\.\s+', "\n" + full_text)

for idx in range(286, 295):
    if idx < len(parts):
        print(f"Index {idx}: {repr(parts[idx][:150])}")
