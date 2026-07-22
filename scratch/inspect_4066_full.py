import fitz

pdf_path = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\examenes_oficiales_grupo_iv\Examen_Grupo_IV_Plaza_4066_Biblioteca,_Archivo_y_Museo.pdf"
doc = fitz.open(pdf_path)

for i, page in enumerate(doc):
    text = page.get_text()
    if "1.-" in text or "Plantilla" in text or "RESPUESTAS" in text or "1." in text:
        print(f"=== PAGE {i+1} ===")
        print(text)
doc.close()
