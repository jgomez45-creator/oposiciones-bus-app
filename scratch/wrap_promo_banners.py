import os
import re

base_dir = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
markdown_dir = os.path.join(base_dir, "public", "markdown")

files = [f for f in os.listdir(markdown_dir) if f.startswith("tema") and f.endswith(".md")]

for filename in files:
    filepath = os.path.join(markdown_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Wrap Header Banner
    header_pattern = r"(> 📱 \*\*ESTUDIA Y OPTIMIZA ESTE TEMA EN LA APP\*\*[\s\S]+?preguntas de exámenes oficiales\.)"
    if re.search(header_pattern, content):
        content = re.sub(
            header_pattern,
            r'<div class="app-promo-banner header-promo">\n\n\1\n\n</div>',
            content
        )
    
    # 2. Wrap Mid-topic Callout
    mid_pattern = r"(> 💡 \*\*REPASO RÁPIDO EN LA APP:\*\*[\s\S]+?afianzar los conceptos sin dudar\.)"
    if re.search(mid_pattern, content):
        content = re.sub(
            mid_pattern,
            r'<div class="app-promo-banner mid-promo">\n\n\1\n\n</div>',
            content
        )
        
    # 3. Wrap Footer CTA
    footer_pattern = r"(---\s+### 🎯 ¡Ponte a prueba antes de pasar al siguiente tema![\s\S]+?\[Abrir oposiciones-bus-app\]\(https://oposiciones-bus-app\.vercel\.app\)\s+---)"
    if re.search(footer_pattern, content):
        content = re.sub(
            footer_pattern,
            r'<div class="app-promo-banner footer-promo">\n\n\1\n\n</div>',
            content
        )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Banners wrapped in {filename} successfully.")

print("All files processed!")
