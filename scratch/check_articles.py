import re

with open("scratch/statutes_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Let's write a quick script to find specific articles and write them to a text file
articles_to_find = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 90]

with open("scratch/inspected_articles.txt", "w", encoding="utf-8") as out:
    for art in articles_to_find:
        # Match "Artículo X. " to the next "Artículo"
        pattern = rf"(Artículo\s+{art}\. .*?)(?=Artículo\s+\d+\. |\Z)"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            out.write(f"=== ARTICLE {art} ===\n")
            out.write(match.group(1).strip())
            out.write("\n\n")
        else:
            # Try a looser pattern
            pattern = rf"(Artículo\s+{art}\b.*?)(?=Artículo\s+\d+\b|\Z)"
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                out.write(f"=== ARTICLE {art} ===\n")
                out.write(match.group(1).strip())
                out.write("\n\n")
            else:
                out.write(f"=== ARTICLE {art} NOT FOUND ===\n\n")

print("Saved scratch/inspected_articles.txt")
