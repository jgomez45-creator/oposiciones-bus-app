import fitz
doc = fitz.open(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas Test de los Estatutos de la US bloque 1.pdf")
text = doc[0].get_text()

with open("scratch/test_out.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Saved scratch/test_out.txt")
