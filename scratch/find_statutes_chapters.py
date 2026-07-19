import fitz

doc = fitz.open(r"C:\Users\usuario\Downloads\Opsiciones\Estatuto de la Universidad de Sevilla 2025.pdf")

with open("scratch/statutes_pages.txt", "w", encoding="utf-8") as f:
    f.write(f"Total pages in Estatutos PDF: {len(doc)}\n\n")
    for p in range(len(doc)):
        text = doc[p].get_text()
        if "TÍTULO I" in text or "TÍTULO III" in text or "TITULO I" in text or "TITULO III" in text:
            f.write(f"Page {p} contains mention:\n")
            for line in text.split('\n'):
                if "TÍTULO" in line or "TITULO" in line or "CAPÍTULO" in line or "CAPITULO" in line or "Artículo 90" in line or "Articulo 90" in line:
                    f.write(f"  {line.strip()}\n")
            f.write("\n")

print("Saved scratch/statutes_pages.txt")
