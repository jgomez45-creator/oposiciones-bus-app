import fitz

doc = fitz.open(r"C:\Users\usuario\Downloads\Opsiciones\Estatuto de la Universidad de Sevilla 2025.pdf")

with open("scratch/statutes_text.txt", "w", encoding="utf-8") as f:
    f.write("=== TÍTULO I (PÁGINAS 14 A 36) ===\n\n")
    for p in range(14, 37):
        f.write(f"--- PAGE {p} ---\n")
        f.write(doc[p].get_text())
        f.write("\n\n")
        
    f.write("=== TÍTULO III CAPÍTULO I (PÁGINA 46) ===\n\n")
    f.write(doc[46].get_text())
    
print("Saved scratch/statutes_text.txt")
