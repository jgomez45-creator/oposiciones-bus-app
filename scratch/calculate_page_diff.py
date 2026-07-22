import os
import subprocess
import glob
import fitz

base_dir = r"c:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
scratch_dir = os.path.join(base_dir, "scratch")
md_dir = os.path.join(base_dir, "public", "markdown")

all_md_files = sorted(glob.glob(os.path.join(md_dir, "tema-*.md")))

def build_full_html_body():
    full_html = []
    for filepath in all_md_files:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        lines = content.split('\n')
        full_html.append("<div style='page-break-before: always;'>")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith('# '):
                full_html.append(f"<h1>{line[2:]}</h1>")
            elif line.startswith('## '):
                full_html.append(f"<h2>{line[3:]}</h2>")
            elif line.startswith('### '):
                full_html.append(f"<h3>{line[4:]}</h3>")
            elif line.startswith('* ') or line.startswith('- '):
                full_html.append(f"<ul><li>{line[2:]}</li></ul>")
            elif line.startswith('> '):
                full_html.append(f"<blockquote>{line[2:]}</blockquote>")
            else:
                full_html.append(f"<p>{line}</p>")
        full_html.append("</div>")
    return "\n".join(full_html)

full_body = build_full_html_body()

def generate_html(p_size, table_size, h1_size=22, h2_size=17, h3_size=14.5):
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
  }}
  body {{
    background: white;
    color: black;
    font-family: Arial, Calibri, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.4;
  }}
  .markdown-rendered-content {{
    color: #000000;
    font-size: {p_size}pt;
    line-height: 1.4;
    font-family: Arial, Calibri, Helvetica, sans-serif;
  }}
  .markdown-rendered-content h1 {{
    color: #004B93;
    font-size: {h1_size}pt;
    font-weight: bold;
    margin-top: 20pt;
    margin-bottom: 10pt;
    border-bottom: 3px solid #004B93;
    padding-bottom: 6px;
  }}
  .markdown-rendered-content h2 {{
    color: #004B93;
    font-size: {h2_size}pt;
    font-weight: bold;
    margin-top: 16pt;
    margin-bottom: 8pt;
    border-bottom: 1px solid #b0c4de;
    padding-bottom: 4px;
  }}
  .markdown-rendered-content h3 {{
    color: #008080;
    font-size: {h3_size}pt;
    font-weight: bold;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }}
  .markdown-rendered-content p {{
    font-size: {p_size}pt;
    line-height: 1.4;
    text-align: justify;
    margin-bottom: 10pt;
  }}
  .markdown-rendered-content ul, .markdown-rendered-content ol {{
    font-size: {p_size}pt;
    line-height: 1.4;
    padding-left: 25px;
    margin-bottom: 10pt;
  }}
  .markdown-rendered-content li {{
    font-size: {p_size}pt;
    line-height: 1.4;
    margin-bottom: 5px;
  }}
  .markdown-rendered-content blockquote {{
    border-left: 4px solid #004B93;
    background-color: #f4f8fc;
    color: #333333;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 4px;
    font-style: normal;
    font-size: {p_size}pt;
  }}
  .markdown-rendered-content table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
  }}
  .markdown-rendered-content th {{
    background-color: #004B93;
    color: white;
    font-weight: bold;
    text-align: left;
    padding: 8px 10px;
    font-size: {table_size}pt;
  }}
  .markdown-rendered-content td {{
    border: 1px solid #ddd;
    padding: 8px 10px;
    font-size: {table_size}pt;
  }}
</style>
</head>
<body>
<div class="markdown-rendered-content">
  {full_body}
</div>
</body>
</html>"""

# Current settings: p=13.5, table=12
html_current = generate_html(13.5, 12)
current_html_path = os.path.join(scratch_dir, "test_full_current.html")
current_pdf_path = os.path.join(scratch_dir, "test_full_current.pdf")
with open(current_html_path, "w", encoding="utf-8") as f:
    f.write(html_current)

# Proposed settings: p=14, table=13
html_proposed = generate_html(14.0, 13)
proposed_html_path = os.path.join(scratch_dir, "test_full_proposed.html")
proposed_pdf_path = os.path.join(scratch_dir, "test_full_proposed.pdf")
with open(proposed_html_path, "w", encoding="utf-8") as f:
    f.write(html_proposed)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

subprocess.run([edge_path, "--headless", "--disable-gpu", f"--print-to-pdf={current_pdf_path}", "--no-margins", current_html_path], check=True)
subprocess.run([edge_path, "--headless", "--disable-gpu", f"--print-to-pdf={proposed_pdf_path}", "--no-margins", proposed_html_path], check=True)

doc_curr = fitz.open(current_pdf_path)
pages_curr = len(doc_curr)
doc_curr.close()

doc_prop = fitz.open(proposed_pdf_path)
pages_prop = len(doc_prop)
doc_prop.close()

diff_pages = pages_prop - pages_curr
pct_inc = (diff_pages / pages_curr) * 100

print(f"TEMARIO COMPLETO (20 Temas):")
print(f"Páginas actuales (13.5pt párrafos / 12pt tablas): {pages_curr} páginas")
print(f"Páginas propuestas (14.0pt párrafos / 13pt tablas): {pages_prop} páginas")
print(f"Diferencia: +{diff_pages} páginas ({pct_inc:.2f}% de aumento)")
