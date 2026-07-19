import json
import re

def extract_articles(json_path, name):
    print(f"\nArticles mentioned in {name}:")
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    articles = set()
    for q in questions:
        text = q["question"]
        matches = re.findall(r'art[ií]culo\s+(\d+)', text, re.IGNORECASE)
        for m in matches:
            articles.add(int(m))
            
    print("  Sorted articles:", sorted(list(articles)))
    print("  Count:", len(articles))

extract_articles("src/data/baterias/estatutos_bloque1.json", "Estatutos Bloque 1")
extract_articles("src/data/baterias/estatutos_bloque2.json", "Estatutos Bloque 2")
extract_articles("src/data/baterias/convenio_2026.json", "Convenio 2026")
extract_articles("src/data/baterias/igualdad_2007.json", "Igualdad LO 3/2007")
