import fitz

doc = fitz.open(r"C:\Users\usuario\Downloads\Opsiciones\Preguntas_Convenio2026.pdf")
print("Searching for Q145 context...")

for p in range(len(doc)):
    text = doc[p].get_text()
    if "145." in text or "144." in text or "146." in text:
        print(f"--- Page {p} ---")
        print(text)
