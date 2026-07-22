import os
import glob
import fitz
import re
import json

base_dir = r"C:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
exams_dir = os.path.join(base_dir, "examenes_oficiales_grupo_iv")
output_dir = os.path.join(exams_dir, "preguntas_segun_temario")

os.makedirs(output_dir, exist_ok=True)

TOPICS_INFO = {
    1: {
        "code": "tema_01",
        "title": "Tema 1: Las bibliotecas universitarias y la BUS",
        "desc": "Concepto, estructura, funciones, organigrama y marco normativo (Reglamento, normas de préstamo y uso).",
        "keywords": [r"\bbiblioteca universitaria\b", r"\bbus\b", r"\breglamento de la bus\b", r"\breglamento bus\b", r"\bcbua\b", r"\brebiun\b", r"\bdialnet\b", r"\bexpania\b", r"\bliber\b", r"\boclc\b", r"\bworldcat\b", r"\bplan director\b", r"\bunidad funcional\b", r"\bcomisión de la biblioteca\b", r"\bfondos antiguos y valiosos\b"]
    },
    2: {
        "code": "tema_02",
        "title": "Tema 2: Sistema de gestión de la calidad en la BUS",
        "desc": "Modelo EFQM, propósito, visión, valores y cartas de servicios.",
        "keywords": [r"\befqm\b", r"\bmodelo efqm\b", r"\bcarta de servicios\b", r"\bcartas de servicios\b", r"\bpropósito, visión\b", r"\bcompromisos de calidad\b", r"\bencuestas de satisfacción\b", r"\bmejora continua\b"]
    },
    3: {
        "code": "tema_03",
        "title": "Tema 3: Instalaciones, espacios y equipamiento",
        "desc": "Espacios y equipamiento en las bibliotecas universitarias. Distribución de espacios y áreas de servicio. Condiciones ambientales y conservación de las colecciones.",
        "keywords": [r"\binstalaciones\b", r"\bespacios y mobiliario\b", r"\bmostrador\b", r"\bcondiciones ambientales\b", r"\blux\b", r"\btemperatura y humedad\b", r"\bdepósito bibliográfico\b", r"\bconservación preventiva\b", r"\bsalud ambiental\b"]
    },
    4: {
        "code": "tema_04",
        "title": "Tema 4: La colección impresa y electrónica en la BUS y acceso remoto",
        "desc": "Gestión, tipologías y acceso a los recursos fuera del campus.",
        "keywords": [r"\bcolección impresa\b", r"\bcolección electrónica\b", r"\brecursos electrónicos\b", r"\bacceso remoto\b", r"\bfuera del campus\b", r"\bvpn\b", r"\brevistas electrónicas\b", r"\blibros electrónicos\b", r"\bopen access\b", r"\bacceso abierto\b"]
    },
    5: {
        "code": "tema_05",
        "title": "Tema 5: Gestión de la colección",
        "desc": "Selección, adquisición, tratamiento técnico, inventario, expurgo y preservación.",
        "keywords": [r"\bexpurgo\b", r"\badquisición de fondos\b", r"\badquisiciones\b", r"\btratamiento técnico\b", r"\binventario bibliográfico\b", r"\bpreservación\b", r"\bcanje\b", r"\bdonación de libros\b", r"\bselección de fondos\b", r"\bprograma de gestión de la colección\b"]
    },
    6: {
        "code": "tema_06",
        "title": "Tema 6: Clasificación de fondos: la CDU",
        "desc": "Clasificación Decimal Universal. Organización y control de fondos.",
        "keywords": [r"\bcdu\b", r"\bclasificación decimal universal\b", r"\bnotación\b", r"\bauxiliares comunes\b", r"\bauxiliares especiales\b", r"\bordenación de la cdu\b", r"\btabla principal cdu\b", r"\bsignatura topográfica\b"]
    },
    7: {
        "code": "tema_07",
        "title": "Tema 7: Sistemas de gestión bibliotecaria y plataformas. FAMA",
        "desc": "Plataformas de servicios de biblioteca y el catálogo FAMA de la US.",
        "keywords": [r"\bfama\b", r"\bcatálogo fama\b", r"\bcatálogo de la us\b", r"\bfacetas\b", r"\balma\b", r"\bprimo\b", r"\bplataforma de servicios de biblioteca\b", r"\boculus\b", r"\bcatálogo automatizado\b", r"\bsigb\b"]
    },
    8: {
        "code": "tema_08",
        "title": "Tema 8: Tecnologías aplicadas en bibliotecas",
        "desc": "RFID, autopréstamo y sistemas de seguridad.",
        "keywords": [r"\brfid\b", r"\bradiofrecuencia\b", r"\bautopréstamo\b", r"\barcos de seguridad\b", r"\bbuzón de devolución\b", r"\bdesmagnetización\b", r"\betiquetas rfid\b"]
    },
    9: {
        "code": "tema_09",
        "title": "Tema 9: Servicios a los usuarios I: Préstamo y Objetoteca",
        "desc": "El servicio de préstamo en la BUS y la Objetoteca.",
        "keywords": [r"\bpréstamo a domicilio\b", r"\bobjetoteca\b", r"\bdías de suspensión\b", r"\brenovación de préstamos\b", r"\breserva de documentos\b", r"\bpréstamo de portátiles\b", r"\bmaterial excluido de préstamo\b", r"\bcarnet universitario\b"]
    },
    10: {
        "code": "tema_10",
        "title": "Tema 10: Servicios a los usuarios II: Información y referencia",
        "desc": "Información, atención y referencia.",
        "keywords": [r"\binformación y referencia\b", r"\batención al usuario\b", r"\bservicio de referencia\b", r"\bchat de la bus\b", r"\bchat bus\b", r"\bmostrador de información\b", r"\bformulario de consultas\b"]
    },
    11: {
        "code": "tema_11",
        "title": "Tema 11: Servicios a los usuarios III: Apoyo al aprendizaje",
        "desc": "Apoyo al aprendizaje y formación en competencias informacionales y digitales (ALFIN/CODI).",
        "keywords": [r"\balfin\b", r"\bcodi\b", r"\bcompetencias informacionales\b", r"\bcompetencias digitales\b", r"\bapoyo al aprendizaje\b", r"\bguías bus\b", r"\bformación de usuarios\b"]
    },
    12: {
        "code": "tema_12",
        "title": "Tema 12: Servicios a los usuarios IV: Apoyo a la investigación",
        "desc": "Apoyo a los investigadores, bases de datos y evaluación científica.",
        "keywords": [r"\bpréstamo interbibliotecario\b", r"\bpib\b", r"\bapoyo a la investigación\b", r"\bevaluación científica\b", r"\bsexenios\b", r"\bjcr\b", r"\bscopus\b", r"\bweb of science\b", r"\bidus\b", r"\brepositorio institucional\b"]
    },
    13: {
        "code": "tema_13",
        "title": "Tema 13: Herramientas digitales: Microsoft 365",
        "desc": "Correo electrónico (Outlook) y herramientas de Microsoft 365 (OneDrive, SharePoint, Teams, Word, Excel, etc.).",
        "keywords": [r"\bmicrosoft 365\b", r"\boffice 365\b", r"\boutlook\b", r"\bonedrive\b", r"\bsharepoint\b", r"\bteams\b", r"\bexcel\b", r"\bpowerpoint\b", r"\bword\b", r"\bcorreo electrónico de la us\b", r"\buvus\b"]
    },
    14: {
        "code": "tema_14",
        "title": "Tema 14: Sistema de Gestión de Prevención de Riesgos de la US",
        "desc": "Política preventiva, guía del empleado, actuación ante accidentes y obligaciones.",
        "keywords": [r"\bseprus\b", r"\bprevención de riesgos de la us\b", r"\baccidente de trabajo\b", r"\bguía preventiva para los empleados\b", r"\bguía del empleado\b", r"\bnotificación de accidentes\b", r"\breconocimiento médico\b", r"\bservicio de prevención de la us\b"]
    },
    15: {
        "code": "tema_15",
        "title": "Tema 15: Riesgos generales y específicos del puesto de trabajo",
        "desc": "Riesgos asociados al auxiliar de biblioteca y directrices técnicas del SEPRUS.",
        "keywords": [r"\bpantallas de visualización de datos\b", r"\bpvd\b", r"\bmanipulación manual de cargas\b", r"\bpostura de trabajo\b", r"\bergonomía en oficina\b", r"\bfatiga visual\b", r"\bcaídas al mismo nivel\b"]
    },
    16: {
        "code": "tema_16",
        "title": "Tema 16: Legislación sobre Prevención de Riesgos Laborales",
        "desc": "Marco Normativo Técnico: Art. 29 de la Ley 31/1995 y Reales Decretos sobre Lugares de Trabajo, Señalización, PVD, Cargas y EPIs.",
        "keywords": [r"\bley 31/1995\b", r"\bartículo 29 de la ley 31/1995\b", r"\brd 486/1997\b", r"\brd 488/1997\b", r"\brd 487/1997\b", r"\brd 773/1997\b", r"\bepis\b", r"\bequipos de protección individual\b", r"\bseñalización de seguridad\b", r"\blugares de trabajo\b", r"\bprevención de riesgos laborales\b"]
    },
    17: {
        "code": "tema_17",
        "title": "Tema 17: Estatutos de la Universidad de Sevilla (Decreto 98/2025)",
        "desc": "Título I (Capítulos I y II, Secciones 1ª, 2ª y 3ª) y Título III (Capítulo I, Art. 90).",
        "keywords": [r"\bestatutos de la universidad de sevilla\b", r"\bestatuto de la universidad de sevilla\b", r"\bdecreto 98/2025\b", r"\brector de la universidad de sevilla\b", r"\bjunta de centro\b", r"\bclaustro universitario\b", r"\bconsejo de gobierno de la universidad de sevilla\b", r"\bconsejo social de la us\b", r"\bgerente de la us\b"]
    },
    18: {
        "code": "tema_18",
        "title": "Tema 18: IV Convenio Colectivo del Personal Laboral de las Universidades Públicas de Andalucía",
        "desc": "Normas de organización, clasificación, vacaciones, permisos y régimen disciplinario.",
        "keywords": [r"\biv convenio colectivo\b", r"\bconvenio colectivo del personal laboral\b", r"\bpersonal laboral de las universidades públicas de andalucía\b", r"\brégimen disciplinario\b", r"\bfalta leve\b", r"\bfalta grave\b", r"\bfalta muy grave\b", r"\blicencias y permisos\b", r"\bcomisión paritaria\b"]
    },
    19: {
        "code": "tema_19",
        "title": "Tema 19: Políticas de igualdad y conciliación en la administración pública",
        "desc": "Ley Orgánica 3/2007 para la igualdad efectiva. Principio de igualdad, tutela contra la discriminación, planes de igualdad y conciliación en la US.",
        "keywords": [r"\bley orgánica 3/2007\b", r"\blo 3/2007\b", r"\bigualdad efectiva de mujeres y hombres\b", r"\bdiscriminación directa por razón de sexo\b", r"\bdiscriminación indirecta por razón de sexo\b", r"\bacoso por razón de sexo\b", r"\bplan de igualdad de la us\b", r"\bunidad de igualdad\b"]
    },
    20: {
        "code": "tema_20",
        "title": "Tema 20: Normativa de la US contra violencia, acoso y discriminación",
        "desc": "Normativa para la prevención, evaluación e intervención en situaciones de violencia, discriminación y acoso en la Universidad de Sevilla.",
        "keywords": [r"\bprotocolo para la prevención, evaluación e intervención en situación de acoso\b", r"\bprotocolo de acoso de la us\b", r"\bacoso laboral en la universidad\b", r"\bprevención del acoso en la us\b", r"\bcomisión de seguimiento del protocolo de acoso\b"]
    }
}

pdf_files = sorted(glob.glob(os.path.join(exams_dir, "*.pdf")))

def clean_txt(t):
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def parse_exam_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()
    
    fname = os.path.basename(pdf_path)
    plaza_match = re.search(r'Plaza_(\d+)_?([^\.]+)?', fname)
    plaza_code = plaza_match.group(1) if plaza_match else "OFICIAL"
    plaza_name = plaza_match.group(2).replace('_', ' ') if plaza_match and plaza_match.group(2) else fname
    
    q_blocks = re.split(r'\n\s*(\d{1,3})\s*[\.\-\)]\s*', "\n" + full_text)
    
    parsed_questions = []
    
    for i in range(1, len(q_blocks), 2):
        q_num = q_blocks[i]
        q_body = q_blocks[i+1]
        
        if "CUADRO DE RESPUESTAS" in q_body or "PLANTILLA DE RESPUESTAS" in q_body:
            q_body = q_body.split("CUADRO DE RESPUESTAS")[0].split("PLANTILLA DE RESPUESTAS")[0]
            
        idx_a = q_body.find("a)")
        if idx_a == -1:
            idx_a = q_body.find("a.-")
        if idx_a == -1:
            idx_a = q_body.find("A)")
            
        if idx_a != -1:
            question_text = clean_txt(q_body[:idx_a])
            options_text = q_body[idx_a:]
            
            opts = re.findall(r'([a-dA-D])[\.\)]\s*([^\n]+(?:\n(?![a-dA-D][\.\)]|\d{1,3}[\.\-\)]).*)*)', options_text)
            clean_opts = []
            for letter, opt_content in opts:
                clean_opts.append(f"**{letter.lower()})** {clean_txt(opt_content)}")
                
            if question_text and len(clean_opts) >= 2:
                parsed_questions.append({
                    "q_num": q_num,
                    "question": question_text,
                    "options": clean_opts,
                    "source": f"Plaza {plaza_code} - {plaza_name}",
                    "raw_text": (question_text + " " + " ".join(clean_opts)).lower()
                })

    return parsed_questions

all_extracted_questions = []

for pdf in pdf_files:
    q_list = parse_exam_pdf(pdf)
    all_extracted_questions.extend(q_list)

print(f"Total questions extracted from {len(pdf_files)} PDFs: {len(all_extracted_questions)}")

topic_classified = {t_id: [] for t_id in TOPICS_INFO.keys()}

for q in all_extracted_questions:
    text_to_check = q["raw_text"]
    best_topic = None
    best_score = 0
    
    for t_id, t_info in TOPICS_INFO.items():
        score = 0
        for kw_pattern in t_info["keywords"]:
            if re.search(kw_pattern, text_to_check, re.IGNORECASE):
                score += 10
        if score > best_score:
            best_score = score
            best_topic = t_id
            
    if best_topic and best_score >= 10:
        topic_classified[best_topic].append(q)

summary_data = []

for t_id, t_info in TOPICS_INFO.items():
    questions = topic_classified[t_id]
    code = t_info["code"]
    title = t_info["title"]
    desc = t_info["desc"]
    
    file_path = os.path.join(output_dir, f"{code}_preguntas.md")
    
    md_lines = []
    md_lines.append(f"# Preguntas Oficiales de Exámenes - {title}")
    md_lines.append("")
    md_lines.append(f"> **Descripción del Tema:** {desc}")
    md_lines.append(f"> **Total de Preguntas Clasificadas:** {len(questions)}")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")
    
    if not questions:
        md_lines.append("*No se han encontrado preguntas específicas de este tema en las convocatorias oficiales del Grupo IV procesadas.*")
    else:
        for idx, q in enumerate(questions, 1):
            md_lines.append(f"### Pregunta {idx}")
            md_lines.append(f"**Origen:** {q['source']} (Pregunta Original N.º {q['q_num']})")
            md_lines.append("")
            md_lines.append(f"**Enunciado:**")
            md_lines.append(f"{q['question']}")
            md_lines.append("")
            md_lines.append("**Opciones:**")
            for opt in q['options']:
                md_lines.append(f"- {opt}")
            md_lines.append("")
            md_lines.append("---")
            md_lines.append("")
            
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
        
    summary_data.append({
        "topic_id": t_id,
        "title": title,
        "file": f"{code}_preguntas.md",
        "count": len(questions)
    })
    print(f"Generated {code}_preguntas.md with {len(questions)} questions.")

readme_lines = []
readme_lines.append("# 📁 Banco de Preguntas Oficiales por Temario (Grupo IV US)")
readme_lines.append("")
readme_lines.append("Recopilación y clasificación de preguntas reales de exámenes oficiales del **Grupo IV de la Universidad de Sevilla** organizadas según la estructura temática oficial de la oposición (Temas 1 al 20).")
readme_lines.append("")
readme_lines.append("## 📊 Resumen de Preguntas Clasificadas por Tema")
readme_lines.append("")
readme_lines.append("| Tema | Título | Archivo Markdown | Cantidad de Preguntas |")
readme_lines.append("| :---: | :--- | :--- | :---: |")

total_q_count = 0
for item in summary_data:
    readme_lines.append(f"| Tema {item['topic_id']:02d} | {item['title']} | [{item['file']}](./{item['file']}) | **{item['count']}** |")
    total_q_count += item['count']

readme_lines.append("")
readme_lines.append(f"**Total General de Preguntas Mapeadas al Temario:** **{total_q_count} preguntas**")

readme_path = os.path.join(output_dir, "README.md")
with open(readme_path, "w", encoding="utf-8") as f:
    f.write("\n".join(readme_lines))

print(f"\nSummary generated in {readme_path} with {total_q_count} total classified questions.")
