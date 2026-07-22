import os
import glob

md_dir = r"c:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\public\markdown"
topic_files = sorted(glob.glob(os.path.join(md_dir, "tema-*.md")))

print(f"Found {len(topic_files)} topics:")
for tf in topic_files:
    fname = os.path.basename(tf)
    with open(tf, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f.readlines() if line.strip()]
        title = lines[0] if lines else "No title"
        subtitle = lines[1] if len(lines) > 1 else ""
        print(f"{fname}: {title} | {subtitle}")
