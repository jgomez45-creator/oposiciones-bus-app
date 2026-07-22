import fitz

pdf_path = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\examenes_oficiales_grupo_iv\Examen_Grupo_IV_Plaza_4066_Biblioteca,_Archivo_y_Museo.pdf"
doc = fitz.open(pdf_path)

print("=== Page 1 full text details ===")
p1 = doc[0]
print(repr(p1.get_text()))

print("\n=== Page 1 annotations ===")
for annot in p1.annots():
    print(annot.type, annot.rect)

print("\n=== Page 1 drawings ===")
drawings = p1.get_drawings()
print(f"Number of drawings on page 1: {len(drawings)}")
for d in drawings[:10]:
    print(d["type"], d["rect"])

doc.close()
