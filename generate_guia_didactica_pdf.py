import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas

class DidacticNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1E3A8A")) # Deep Navy
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 815, "GUÍA METODOLÓGICA Y TÉCNICAS DE DESCARTE (DECRETO 98/2025)")
            self.drawRightString(559, 815, "ESTATUTOS DE LA UNIVERSIDAD DE SEVILLA")
            self.setStrokeColor(colors.HexColor("#1E3A8A"))
            self.setLineWidth(0.8)
            self.line(36, 807, 559, 807)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#3B82F6"))
        self.setLineWidth(0.8)
        self.line(36, 45, 559, 45)
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#2563EB"))
        self.drawString(36, 32, "Estrategia Anti-Trampas para Exámenes Tipo Test • Oposiciones BUS Sevilla")
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(559, 32, page_text)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=50,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#1E3A8A")   # Navy Blue
    accent_color = colors.HexColor("#D97706")    # Amber / Gold
    emerald_color = colors.HexColor("#059669")   # Green
    dark_text = colors.HexColor("#0F172A")       # Slate 900
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        alignment=1,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=accent_color,
        alignment=1,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=accent_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.2,
        textColor=dark_text,
        spaceAfter=5
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=dark_text
    )

    table_body_bold = ParagraphStyle(
        'TableBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=primary_color
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    story = []

    # Title Banner
    story.append(Paragraph("MÉTODO DE ALTO RENDIMIENTO Y TÉCNICAS DE DESCARTE", ParagraphStyle('Banner', fontName='Helvetica-Bold', fontSize=9.5, textColor=accent_color, alignment=1, spaceAfter=4)))
    story.append(Paragraph("ESTATUTOS DE LA UNIVERSIDAD DE SEVILLA<br/>(DECRETO 98/2025)", title_style))
    story.append(Paragraph("<b>Guía Didáctica de Gobierno, Matriz de Procesos (Elabora/Propone/Aprueba)<br/>y Patrones de Resolución Rápida de Preguntas Tipo Test</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    # Intro box
    intro_box = (
        "<b>OBJETIVO DE ESTA GUÍA:</b> Este documento no es una copia literal de los Estatutos, sino una <b>herramienta de memorización estratégica y descarte de trampas en exámenes tipo test</b>. Organiza las competencias del Título I (Capítulos I y II, Secciones 1ª, 2ª y 3ª) y Título III (Art. 90) mediante un <b>relato funcional</b>, una <b>matriz de competencias (Elabora vs Propone vs Aprueba)</b> y <b>5 reglas de oro indiscutibles para fallar cero preguntas</b>."
    )
    t_intro = Table([[Paragraph(intro_box, ParagraphStyle('IntroText', fontName='Helvetica', fontSize=8.5, leading=12, textColor=primary_color))]], colWidths=[523])
    t_intro.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#93C5FD")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_intro)
    story.append(Spacer(1, 10))

    # PARTE 1: EL RELATO INSTITUCIONAL
    story.append(Paragraph("1. EL RELATO INSTITUCIONAL (¿CÓMO FUNCIONA LA UNIVERSIDAD DE SEVILLA?)", h1_style))
    
    story.append(Paragraph(
        "Imagina la Universidad de Sevilla como un estado autonómico independiente organizado en tres niveles de poder:",
        body_style
    ))

    relato_items = [
        "<b>🏛️ El Claustro Universitario (El Parlamento Representativo - 303 Miembros):</b> Es la voz soberana del pueblo universitario. No se encarga de la gestión del día a día. Sus funciones son solemnes: aprueba la 'Constitución' (Estatutos), elige al Defensor Universitario y puede hacer caer al Rector mediante una moción de censura (1/3 de firmas, aprueban 2/3). Se reúne ordinariamente 2 veces al año.",
        "<b>👑 El Rector o Rectora (El Presidente / Alcalde):</b> Representante legal y máxima autoridad. Su mandato es de <b>6 años ÚNICOS, improrrogables y no renovables</b> para evitar acumulaciones de poder. Su elección es por voto ponderado (53% PDI Perm, 30% Alumnos, 10% PTGAS, 7% PDI No Perm).",
        "<b>⚙️ El Consejo de Gobierno (El Consejo de Ministros Ejecutivo - 56 Miembros):</b> Es el verdadero 'motor' de la universidad. Ejecuta la política diaria, aprueba los reglamentos internos, el Plan de Organización Docente (POD), la RPT y las titulaciones oficiales. Se reúne al menos 1 vez cada 2 meses.",
        "<b>💰 El Consejo Social (El Consejo Fiscalizador Externo):</b> La sociedad civil externa (empresarios, sindicatos, instituciones). Tiene la 'llave del dinero gordo': aprueba en última instancia el Presupuesto anual, las Cuentas anuales y asigna los complementos retributivos individuales al profesorado.",
        "<b>💼 El Gerente (El Director Financiero y Jefe del PTGAS):</b> Propuesto por el Rector pero <b>necesita el acuerdo obligatorio del Consejo Social</b>. Mandato de <b>6 años RENOVABLES</b>. Ostenta la jefatura directa del PTGAS y la hacienda. Tiene <b>incompatibilidad total</b> con dar clases o investigar.",
        "<b>📜 El Secretario General (El Notario Mayor):</b> Fedatario público de acuerdos, custodio del sello, actas y Archivo Central. Preside la Junta Electoral General de la US.",
        "<b>🏫 Los Centros (Facultades y Escuelas):</b> La <b>Junta de Centro</b> (máx. 100 miembros) aprueba el POD del centro y el <b>Calendario de Exámenes</b> (¡trampa típica: los exámenes los aprueba el Centro, no el Departamento!). El <b>Decano/Director</b> ordena el gasto del centro y dura 6 años únicos.",
        "<b>📚 Los Departamentos (Los Gremios de Profesores):</b> El <b>Consejo de Departamento</b> aprueba las <b>Guías Docentes</b> de las asignaturas. El <b>Director de Departamento</b> gestiona y ordena los gastos del departamento (6 años únicos)."
    ]

    for item in relato_items:
        story.append(Paragraph(item, ParagraphStyle('RelatoP', parent=body_style, spaceAfter=4)))

    story.append(Spacer(1, 10))

    # PARTE 2: MATRIZ DE PROCESOS (ELABORA VS PROPONE VS APRUEBA)
    story.append(Paragraph("2. MATRIZ DE COMPETENCIAS (ELABORA vs. PROPONE vs. APRUEBA)", h1_style))
    story.append(Paragraph("En los exámenes tipo test, la mayoría de los fallos ocurren por confundir quién <i>inicia/propone</i> una medida y quién la <i>aprueba con carácter definitivo</i>. Memoriza esta tabla comparativa:", body_style))

    mat_headers = [
        Paragraph("Proceso o Decisión Clave", table_header_style),
        Paragraph("Elabora / Diseña", table_header_style),
        Paragraph("Propone / Inicia", table_header_style),
        Paragraph("Aprueba (Final de Línea)", table_header_style),
        Paragraph("Clave de Descarte en Test", table_header_style)
    ]

    mat_data = [mat_headers]

    matrix_rows = [
        ("<b>Estatutos de la US</b>", "Comisión del Claustro", "Claustro Universitario", "<b>Claustro Universitario</b>", "Reforma exige 2/3 de votos del Claustro."),
        ("<b>Presupuesto Anual US</b>", "El Gerente", "Consejo de Gobierno", "<b>Consejo Social</b>", "¡CUIDADO! El C. Gobierno propone, pero el C. Social aprueba."),
        ("<b>Cuentas Anuales US</b>", "El Gerente", "Rector / C. Gobierno", "<b>Consejo Social</b>", "La rendición de cuentas final la aprueba el C. Social."),
        ("<b>Reglamentos Internos</b>", "Equipo / Comisiones", "Consejo de Gobierno", "<b>Consejo de Gobierno</b>", "Los reglamentos de régimen interno son del C. Gobierno."),
        ("<b>Creación/Supresión Centros</b>", "Universidad de Sevilla", "Consejo de Gobierno US", "<b>Junta de Andalucía</b>", "¡OJO! Se crea por Decreto de la Junta de Andalucía."),
        ("<b>Plan Org. Docente (POD)</b>", "Departamentos (oferta)", "Decanos / Directores", "<b>Junta de Centro</b>", "Cada Junta de Centro aprueba el POD de su centro."),
        ("<b>Calendario de Exámenes</b>", "Delegación / Vicedecano", "Comisión de Docencia", "<b>Junta de Centro</b>", "¡TRAMPA TÍPICA! El calendario es del Centro, no Depto."),
        ("<b>Guías Docentes</b>", "Profesorado adscrito", "Director de Depto.", "<b>Consejo de Departamento</b>", "Las guías de asignaturas las aprueba el Depto."),
        ("<b>RPT (Puestos PTGAS/PDI)</b>", "Gerente (PTGAS) / Equipo", "Consejo de Gobierno", "<b>Consejo de Gobierno</b>", "Aprueba C. Gobierno previo informe del C. Social."),
        ("<b>Complementos Salario PDI</b>", "Comisiones Evaluación", "Rector / C. Gobierno", "<b>Consejo Social</b>", "Asignación individualizada exclusiva del C. Social."),
        ("<b>Nombramiento Gerente</b>", "Rector/a", "Rector/a", "<b>Acuerdo con Consejo Social</b>", "El Rector nombra pero REQUIERE acuerdo del C. Social."),
        ("<b>Defensor Universitario</b>", "Claustro (candidaturas)", "Claustro (3/5 votos)", "<b>Claustro Universitario</b>", "Elección por mayoría de 3/5 del Claustro (4 años).")
    ]

    for row in matrix_rows:
        mat_data.append([
            Paragraph(row[0], table_body_bold),
            Paragraph(row[1], table_body_style),
            Paragraph(row[2], table_body_style),
            Paragraph(f"<b>{row[3]}</b>", table_body_style),
            Paragraph(f"<i>{row[4]}</i>", ParagraphStyle('TipText', parent=table_body_style, textColor=colors.HexColor("#B45309")))
        ])

    t_matrix = Table(mat_data, colWidths=[100, 95, 95, 105, 128])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
    ]))

    story.append(t_matrix)
    story.append(Spacer(1, 10))

    # PARTE 3: CLAVES PARA DESCARTAR EN EXÁMENES TIPO TEST (REGLAS DE ORO)
    story.append(Paragraph("3. SECCIÓN 'CLAVES DE DESCARTE RÁPIDO' EN EXÁMENES TIPO TEST", h1_style))

    golden_rules = [
        ("REGLA 1: MANDATOS DE 6 AÑOS ÚNICOS VS RENOVABLES", [
            "• <b>MANDATO ÚNICO (6 AÑOS IMPRORROGABLES Y NO RENOVABLES):</b> Rector/a, Decanos/as, Directores/as de Escuela, Directores/as de Departamento. <i>(Patrón: todos los cargos ejecutivos de dirección académica duran 6 años y NUNCA se pueden repetir)</i>.",
            "• <b>GERENTE:</b> 6 años <b>RENOVABLES</b> por periodos iguales.",
            "• <b>DEFENSOR UNIVERSITARIO:</b> 4 años <b>NO REELEGIBLE CONSECUTIVAMENTE</b>.",
            "• <b>ESTUDIANTES EN ÓRGANOS:</b> 1 año de duración (salvo en Claustro que son 2 años)."
        ]),
        ("REGLA 2: LAS TRES TRAMPAS DIPLOMÁTICAS MÁS REPETIDAS EN TEST", [
            "• <b>Trampa 1 (Presupuesto):</b> Si la pregunta pide quién aprueba el Presupuesto final, descarta 'Consejo de Gobierno' y 'Claustro'. La respuesta correcta es <b>CONSEJO SOCIAL</b>.",
            "• <b>Trampa 2 (Exámenes vs Guías):</b> El <b>Calendario de Exámenes</b> lo aprueba la <b>JUNTA DE CENTRO</b>. En cambio, las <b>Guías Docentes</b> las aprueba el <b>CONSEJO DE DEPARTAMENTO</b>.",
            "• <b>Trampa 3 (Jefatura del PTGAS):</b> La jefatura directa del PTGAS la ostenta el <b>GERENTE</b> por delegación del Rector, NUNCA el Secretario General ni el Vicerrector."
        ]),
        ("REGLA 3: ASOCIACIÓN PALABRA CLAVE ➔ ÓRGANO RESPONSABLE", [
            "• Si ves <i>'Decreto de la Junta de Andalucía'</i> ➔ Creación/supresión de Universidad o Centros.",
            "• Si ves <i>'Dinero, Cuentas Anuales, Presupuesto, Asignación Individual Complementos'</i> ➔ <b>Consejo Social</b>.",
            "• Si ves <i>'Estatutos, Defensor Universitario, Elecciones Extraordinarias a Rector'</i> ➔ <b>Claustro Universitario</b>.",
            "• Si ves <i>'Reglamentos, RPT, Oferta de Empleo, POD'</i> ➔ <b>Consejo de Gobierno</b>.",
            "• Si ves <i>'Fe pública, Actas, Sello, BOUS, Registro, Junta Electoral'</i> ➔ <b>Secretario/a General</b>.",
            "• Si ves <i>'Patrimonio, Hacienda, Gestión Económica y del PTGAS'</i> ➔ <b>Gerente</b>."
        ]),
        ("REGLA 4: NÚMEROS Y PORCENTAJES MÁGICOS DE LA US", [
            "• <b>Claustro (303 miembros):</b> 51% PDI Perm (153), 30% Estudiantes (90), 11% PTGAS (33), 8% PDI No Perm (24).",
            "• <b>Junta de Centro (Máx 100):</b> 52% PDI Perm, 30% Estudiantes, 11% PDI No Perm, 7% PTGAS.",
            "• <b>Consejo de Departamento:</b> Mínimo 51% PDI Perm, 30% Estudiantes, Máx 14% PDI No Perm, 5% PTGAS.",
            "• <b>Voto Ponderado Rector:</b> 53% PDI Perm, 30% Estudiantes, 10% PTGAS, 7% PDI No Perm."
        ]),
        ("REGLA 5: LAS 15 CAUSALES DE NO DISCRIMINACIÓN (ART. 90.2.e)", [
            "En las preguntas del Artículo 90.2.e, la norma prohíbe la discriminación por exactamente <b>15 causales cerradas</b>:<br/>"
            "<i>1. Nacimiento • 2. Origen racial/étnico • 3. Sexo • 4. Orientación sexual • 5. Identidad de género • "
            "6. Religión • 7. Convicción/opinión • 8. Edad • 9. Discapacidad • 10. Nacionalidad • 11. Enfermedad • "
            "12. Condición socioeconómica • 13. Lingüística • 14. Afinidad política/sindical • 15. Apariencia.</i>"
        ])
    ]

    for title, points in golden_rules:
        story.append(Paragraph(title, h2_style))
        for pt in points:
            story.append(Paragraph(pt, bullet_style))

    doc.build(story, canvasmaker=DidacticNumberedCanvas)
    print(f"Guia Didactica generada con exito en: {filename}")

if __name__ == '__main__':
    out_dir = os.path.join(os.getcwd(), 'public')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'Guia_Didactica_y_Metodologia_Estatutos_US_Decreto_98_2025.pdf')
    build_pdf(out_path)
