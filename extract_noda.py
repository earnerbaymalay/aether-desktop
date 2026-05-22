import os
from docx import Document

dir_path = "/Users/brookeconnor/Downloads/drive-download-20260518T215206Z-3-001"
output_file = "noda_summary.txt"

with open(output_file, 'w') as f:
    for filename in sorted(os.listdir(dir_path)):
        if filename.endswith(".docx") and not filename.startswith("~"):
            f.write(f"--- {filename} ---\n")
            filepath = os.path.join(dir_path, filename)
            try:
                doc = Document(filepath)
                # print only headings or short snippets to avoid massive text
                for p in doc.paragraphs:
                    text = p.text.strip()
                    if not text: continue
                    # heuristic for headings or short important lines
                    if p.style.name.startswith('Heading') or len(text.split()) < 15:
                        f.write(f"{text}\n")
            except Exception as e:
                f.write(f"Error reading {filename}: {e}\n")
            f.write("\n")
