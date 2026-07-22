import fitz

pdf_path = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\examenes_oficiales_grupo_iv\Examen_Grupo_IV_Plaza_4066_Biblioteca,_Archivo_y_Museo.pdf"
doc = fitz.open(pdf_path)

print(f"Number of pages: {len(doc)}")
for i in range(min(5, len(doc))):
    print(f"--- Page {i+1} ---")
    print(doc[i].get_text()[:600])

# Check if there is an answer sheet or answers block at the end
print("--- Last Page ---")
print(doc[-1].get_text()[-1000:])
doc.close()
