import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
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
        self.setFillColor(colors.HexColor("#7C101A"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 815, "ESTATUTOS DE LA UNIVERSIDAD DE SEVILLA (DECRETO 98/2025)")
            self.drawRightString(559, 815, "TÍTULO I: ÓRGANOS DE GOBIERNO Y REPRESENTACIÓN")
            self.setStrokeColor(colors.HexColor("#7C101A"))
            self.setLineWidth(0.8)
            self.line(36, 807, 559, 807)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#D4A359"))
        self.setLineWidth(0.8)
        self.line(36, 45, 559, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4A5568"))
        self.drawString(36, 32, "Universidad de Sevilla • Compendio Oficial de Competencias y Funciones Organicas")
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
    
    # Custom styles
    primary_color = colors.HexColor("#7C101A")
    secondary_color = colors.HexColor("#9A6F0F")
    dark_text = colors.HexColor("#1A202C")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary_color,
        alignment=1,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
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
    story.append(Paragraph("DECRETO 98/2025, DE 30 DE ABRIL", ParagraphStyle('Banner', fontName='Helvetica-Bold', fontSize=10, textColor=secondary_color, alignment=1, spaceAfter=4)))
    story.append(Paragraph("ESTATUTOS DE LA UNIVERSIDAD DE SEVILLA", title_style))
    story.append(Paragraph("COMPETENCIAS Y FUNCIONES DE ÓRGANOS COLEGIADOS Y PERSONALES<br/><b>Título I (Capítulos I y II, Secciones 1ª, 2ª y 3ª) y Título III (Art. 90)</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=12))

    # Introduction / Overview
    intro_p = Paragraph(
        "<b>Resumen Normativo:</b> El Decreto 98/2025 aprueba el nuevo texto estatutario de la Universidad de Sevilla (US), adaptando su estructura organizativa a la Ley Orgánica 2/2023 del Sistema Universitario (LOSU). El Título I regula el gobierno, representación y participación institucionales, dividiendo los órganos entre <b>colegiados</b> (de deliberación y decisión colectiva) y <b>unipersonales / personales</b> (de dirección y gestión ordinaria).",
        body_style
    )
    story.append(intro_p)
    story.append(Spacer(1, 8))

    # SECTION 1: ÓRAGNOS COLEGIADOS GENERALES
    story.append(Paragraph("1. ÓRGANOS COLEGIADOS GENERALES DE LA UNIVERSIDAD", h1_style))
    
    col_headers = [
        Paragraph("Órgano Colegiado", table_header_style),
        Paragraph("Composición y Sectores", table_header_style),
        Paragraph("Presidencia y Convocatoria", table_header_style),
        Paragraph("Competencias y Funciones Principales", table_header_style)
    ]
    
    col_data = [col_headers]

    # Claustro
    col_data.append([
        Paragraph("<b>Claustro Universitario</b><br/><i>(Arts. 15 y 16)</i>", table_body_bold),
        Paragraph("<b>303 miembros</b>:<br/>• Rector/a, Secretario/a General, Gerente.<br/>• <b>300 claustrales electos</b>:<br/>  - 51% PDI Perm. (153)<br/>  - 8% PDI No Perm. (24)<br/>  - 30% Estudiantes (90)<br/>  - 11% PTGAS (33)", table_body_style),
        Paragraph("Presidido por el/la <b>Rector/a</b>.<br/><br/><b>Ordinaria:</b> al menos 2 veces al año.<br/><br/><b>Extraordinaria:</b> iniciativa del Rector o 1/4 de claustrales.", table_body_style),
        Paragraph("• Máximo órgano de representación de la comunidad universitaria.<br/>• Elaborar, aprobar y reformar los <b>Estatutos de la US</b>.<br/>• Elegir al <b>Defensor/a Universitario/a</b> (mayoría de 3/5).<br/>• Elegir a los representantes del Claustro en el Consejo de Gobierno.<br/>• Convocar elecciones extraordinarias a Rector/a (iniciativa de 1/3, requiere aprobación por mayoría de 2/3).", table_body_style)
    ])

    # Consejo de Gobierno
    col_data.append([
        Paragraph("<b>Consejo de Gobierno</b><br/><i>(Arts. 17 y 18)</i>", table_body_bold),
        Paragraph("<b>56 miembros</b>:<br/>• Rector/a, Sec. General, Gerente.<br/>• <b>15</b> designados por el Rector.<br/>• <b>29</b> elegidos por Claustro (15 PDI Perm, 3 PDI No Perm, 5 PTGAS, 6 Estudiantes).<br/>• 1 del Consejo Social.<br/>• 3 Decanos/as, 4 Dir. Depto., 1 Dir. Instituto.", table_body_style),
        Paragraph("Presidido por el/la <b>Rector/a</b>.<br/><br/><b>Ordinaria:</b> al menos 1 vez cada 2 meses en periodo lectivo.<br/><br/><b>Extraordinaria:</b> convocado por Rector o 1/4 de miembros.", table_body_style),
        Paragraph("• Órgano ejecutivo y de gestión ordinaria de la US.<br/>• Establecer líneas estratégicas y directrices de aplicación.<br/>• Aprobar reglamentos internos, normativa de inspección de servicios e igualdad.<br/>• Aprobar propuesta de creación/supresión de centros, departamentos e institutos.<br/>• Aprobar la oferta de enseñanzas oficiales, títulos propios y la RPT.", table_body_style)
    ])

    # Consejo Social
    col_data.append([
        Paragraph("<b>Consejo Social</b><br/><i>(Arts. 19 y 20)</i>", table_body_bold),
        Paragraph("Composición según Ley Autonómica (representación social y de la US).<br/>Incluye Rector/a, Sec. General, Gerente, y representantes de PDI, PTGAS y estudiantes.", table_body_style),
        Paragraph("Presidido por persona ajena a la universidad nombrada por la Junta de Andalucía.<br/><br/>Sesión conjunta anual con Consejo de Gobierno.", table_body_style),
        Paragraph("• Órgano de participación de la sociedad en la Universidad.<br/>• <b>Aprobar el Presupuesto anual</b> y la programación plurianual de la US.<br/>• Aprobar las cuentas anuales de la US y sus entidades dependientes.<br/>• Aprobar la asignación individualizada de complementos retributivos al profesorado.<br/>• Aprobar la propuesta del Rector para el nombramiento del Gerente.", table_body_style)
    ])

    # CADUS
    col_data.append([
        Paragraph("<b>Consejo de Alumnos (CADUS)</b><br/><i>(Art. 21)</i>", table_body_bold),
        Paragraph("Integrado por los miembros de las Delegaciones de Estudiantes de todos los Centros de la US.", table_body_style),
        Paragraph("Presidido por el/la <b>Delegado/a del CADUS</b> elegido/a entre sus miembros.", table_body_style),
        Paragraph("• Órgano colegiado máximo de representación estudiantil.<br/>• Coordinar e impulsar las iniciativas del estudiantado.<br/>• Elaborar y aprobar su Reglamento Interno y Electoral (ratificado por el Consejo de Gobierno).<br/>• Administrar sus propios recursos presupuestarios asignados.", table_body_style)
    ])

    t_colegiados = Table(col_data, colWidths=[105, 125, 110, 183])
    t_colegiados.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(t_colegiados)
    story.append(Spacer(1, 14))

    # SECTION 2: ÓRGANOS UNIPERSONALES / PERSONALES DE GOBIERNO
    story.append(Paragraph("2. ÓRGANOS UNIPERSONALES (PERSONALES) DE GOBIERNO CENTRAL", h1_style))

    uni_headers = [
        Paragraph("Cargo / Órgano Unipersonal", table_header_style),
        Paragraph("Requisitos y Nombramiento", table_header_style),
        Paragraph("Mandato y Carácter", table_header_style),
        Paragraph("Competencias y Funciones Principales", table_header_style)
    ]

    uni_data = [uni_headers]

    # Rector/a
    uni_data.append([
        Paragraph("<b>Rector o Rectora</b><br/><i>(Arts. 24 a 26)</i>", table_body_bold),
        Paragraph("• Profesor/a Doctor/a permanente a TC de la US.<br/>• Requisitos acreditados:<br/>  - <b>3 sexenios</b> investigación<br/>  - <b>3 quinquenios</b> docencia<br/>  - <b>4 años</b> gestión unipersonal.<br/>• Elección directa por sufragio universal ponderado (PDI Perm 53%, PDI No Perm 7%, Estudiantes 30%, PTGAS 10%).", table_body_style),
        Paragraph("<b>6 años</b>.<br/><b>Improrrogable y no renovable</b> (Mandato único).", table_body_style),
        Paragraph("• Máxima autoridad académica y representante legal de la US.<br/>• Dirigir la acción de gobierno y la gestión ordinaria.<br/>• Convocar y presidir el Claustro y el Consejo de Gobierno.<br/>• Ostentar la potestad reglamentaria y disciplinaria.<br/>• Expedir títulos oficiales en nombre del Rey.<br/>• Nombrar Vicerrectores, Secretario General y proponer al Gerente.", table_body_style)
    ])

    # Vicerrectores
    uni_data.append([
        Paragraph("<b>Vicerrectores / as</b><br/><i>(Art. 27)</i>", table_body_bold),
        Paragraph("Profesorado doctor de la US. Máximo de 15 Vicerrectores/as.<br/><br/>Nombrados y cesados libremente por el/la Rector/a.", table_body_style),
        Paragraph("Vinculado al mandato del Rector/a.", table_body_style),
        Paragraph("• Auxiliar al Rector/a en la dirección de áreas específicas.<br/>• Coordinar y ejecutar las competencias delegadas por el Rectorado.<br/>• Dirigir los Secretariados adscritos a su Vicerrectorado (límite máximo de 50 Directores/as de Secretariado).", table_body_style)
    ])

    # Secretario General
    uni_data.append([
        Paragraph("<b>Secretario/a General</b><br/><i>(Art. 28)</i>", table_body_bold),
        Paragraph("PDI Doctor funcionario o Funcionario/a de carrera del PTGAS titulado/a superior.<br/><br/>Nombrado/a por el/la Rector/a.", table_body_style),
        Paragraph("Vinculado al mandato del Rector/a.", table_body_style),
        Paragraph("• Fedatario/a público/a de los actos y acuerdos de la Universidad.<br/>• Redactar y custodiar las actas del Claustro y del Consejo de Gobierno.<br/>• Custodiar el Sello General, el Libro de Actas y el Archivo Central.<br/>• Dirigir y garatizar la difusión del Boletín Oficial de la US (BOUS).<br/>• Presidir la Junta Electoral General de la US.", table_body_style)
    ])

    # Gerente
    uni_data.append([
        Paragraph("<b>Gerente</b><br/><i>(Art. 29)</i>", table_body_bold),
        Paragraph("Titulado/a superior a dedicación exclusiva. Incompatible con docencia o investigación.<br/><br/>Propuesto/a y nombrado/a por el <b>Rector/a de acuerdo con el Consejo Social</b>.", table_body_style),
        Paragraph("<b>6 años renovables</b> por periodos iguales.", table_body_style),
        Paragraph("• Dirigir la gestión de los servicios económicos y administrativos.<br/>• Asumir la jefatura directa del Personal Técnico, de Gestión y de Administración y Servicios (PTGAS) por delegación.<br/>• Elaborar la propuesta del Presupuesto anual y de la RPT.<br/>• Custodiar el patrimonio y la hacienda universitaria.", table_body_style)
    ])

    t_unipersonales = Table(uni_data, colWidths=[105, 130, 95, 193])
    t_unipersonales.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(t_unipersonales)
    story.append(Spacer(1, 14))

    # SECTION 3: ÓRGANOS EN CENTROS Y DEPARTAMENTOS
    story.append(Paragraph("3. ÓRGANOS DE CENTROS (FACULTADES/ESCUELAS) Y DEPARTAMENTOS", h1_style))

    est_headers = [
        Paragraph("Estructura / Órgano", table_header_style),
        Paragraph("Tipo y Composición Sectorial", table_header_style),
        Paragraph("Mandato", table_header_style),
        Paragraph("Competencias y Funciones Claves", table_header_style)
    ]

    est_data = [est_headers]

    # Junta de Centro
    est_data.append([
        Paragraph("<b>Junta de Facultad o Escuela</b><br/><i>(Arts. 31 y 32)</i>", table_body_bold),
        Paragraph("<b>Colegiado (Máx. 100 miembros)</b>:<br/>• Decano/a, Sec. Centro, Delegado Estudiantes.<br/>• <b>52%</b> PDI Permanente<br/>• <b>11%</b> PDI No Perm. / Inv.<br/>• <b>30%</b> Estudiantes<br/>• <b>7%</b> PTGAS", table_body_style),
        Paragraph("PDI y PTGAS: <b>6 años</b>.<br/>Estudiantes: <b>1 año</b>.", table_body_style),
        Paragraph("• Aprobar el Plan de Organización Docente (POD) del Centro.<br/>• Aprobar el <b>calendario de exámenes</b> y pruebas de evaluación.<br/>• Aprobar la distribución de los fondos asignados al Centro.<br/>• Proponer la revocación del Decano/a (mayoría 2/3 a iniciativa de 1/3).", table_body_style)
    ])

    # Decano/a o Director/a
    est_data.append([
        Paragraph("<b>Decano/a o Director/a de Escuela</b><br/><i>(Arts. 33 y 34)</i>", table_body_bold),
        Paragraph("<b>Unipersonal</b>.<br/>Profesorado permanente del Centro. Nombrado/a por el Rector/a previa elección por sufragio ponderado en el Centro.", table_body_style),
        Paragraph("<b>6 años</b>.<br/>Improrrogable y no renovable.", table_body_style),
        Paragraph("• Representación, dirección y gestión ordinaria del Centro.<br/>• <b>Ordenar y autorizar los gastos</b> del presupuesto del Centro.<br/>• Proponer nombramiento de Vicedecanos/as y Secretario/a de Centro.<br/>• Proponer apertura de expedientes disciplinarios en el Centro.", table_body_style)
    ])

    # Consejo de Departamento
    est_data.append([
        Paragraph("<b>Consejo de Departamento</b><br/><i>(Arts. 41 y 42)</i>", table_body_bold),
        Paragraph("<b>Colegiado</b>:<br/>• Director/a y Sec. Departamento.<br/>• <b>Todo PDI Perm.</b> (mínimo 51%)<br/>• PDI No Perm. (máx. 14%)<br/>• Estudiantes (30%)<br/>• PTGAS (5% si procede)", table_body_style),
        Paragraph("Docentes/PTGAS: <b>3 años</b>.<br/>Estudiantes: <b>1 año</b>.", table_body_style),
        Paragraph("• Aprobar las <b>Guías Docentes</b> de las asignaturas oficiales del área.<br/>• Elegir y revocar al Director/a de Departamento.<br/>• Asignar la docencia al profesorado e informar necesidades de plazas.<br/>• Gestionar la investigación y presupuestos asignados al Departamento.", table_body_style)
    ])

    # Director/a de Departamento
    est_data.append([
        Paragraph("<b>Director/a de Departamento</b><br/><i>(Arts. 43 y 44)</i>", table_body_bold),
        Paragraph("<b>Unipersonal</b>.<br/>Profesor/a Doctor/a permanente del Departamento. Elegido/a por el Consejo de Depto. (mayoría absoluta en 1ª vuelta).", table_body_style),
        Paragraph("<b>6 años</b>.<br/>Improrrogable y no renovable.", table_body_style),
        Paragraph("• Representación y gestión ordinaria del Departamento.<br/>• Ordenar y autorizar los gastos del Departamento.<br/>• Convocar y presidir el Consejo de Departamento.<br/>• Proponer el nombramiento del Secretario/a de Departamento.", table_body_style)
    ])

    t_estructuras = Table(est_data, colWidths=[105, 130, 85, 203])
    t_estructuras.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(t_estructuras)
    story.append(Spacer(1, 14))

    # SECTION 4: OTROS ÓRGANOS Y ESTRUCTURAS DE APOYO (SECCIÓN 3ª)
    story.append(Paragraph("4. OTROS ÓRGANOS Y ESTRUCTURAS DE APOYO (SECCIÓN 3ª)", h1_style))

    otros_headers = [
        Paragraph("Órgano / Institución", table_header_style),
        Paragraph("Naturaleza y Composición", table_header_style),
        Paragraph("Elección / Nombramiento", table_header_style),
        Paragraph("Competencias Claves", table_header_style)
    ]

    otros_data = [otros_headers]

    # Defensor Universitario
    otros_data.append([
        Paragraph("<b>Defensor/a Universitario/a</b><br/><i>(Arts. 80 a 85)</i>", table_body_bold),
        Paragraph("Órgano unipersonal e independiente para velar por los derechos y libertades de la comunidad universitaria.", table_body_style),
        Paragraph("Elegido/a por el <b>Claustro Universitario por mayoría de 3/5</b> de sus miembros.<br/>Mandato: <b>4 años</b> (no reelegible consecutivamente).", table_body_style),
        Paragraph("• Defender los derechos de todos los sectores de la US.<br/>• Atender quejas y reclamaciones de estudiantes, PDI y PTGAS.<br/>• Formular recomendaciones, sugerencias y mediaciones no vinculantes.<br/>• Presentar un informe anual al Claustro Universitario.", table_body_style)
    ])

    # Consejo de Dirección
    otros_data.append([
        Paragraph("<b>Consejo de Dirección</b><br/><i>(Art. 27.4)</i>", table_body_bold),
        Paragraph("Órgano de asesoramiento y coordinación del Rectorado.<br/>Integrado por Rector/a, Vicerrectores/as, Sec. General y Gerente.", table_body_style),
        Paragraph("Vinculado al equipo de gobierno del Rector/a.", table_body_style),
        Paragraph("• Asistir al Rector/a en la definición de la política universitaria.<br/>• Coordinar las actuaciones de los distintos Vicerrectorados, Secretaría General y Gerencia.<br/>• Preparar las propuestas a someter al Consejo de Gobierno.", table_body_style)
    ])

    # EIDUS y EIP
    otros_data.append([
        Paragraph("<b>EIDUS y EIP</b><br/><i>(Arts. 37 y 39)</i>", table_body_bold),
        Paragraph("• <b>EIDUS:</b> Escuela Internacional de Doctorado.<br/>• <b>EIP:</b> Escuela Internacional de Posgrado.", table_body_style),
        Paragraph("Gobernadas por un Comité de Dirección y un/a Director/a nombrado/a por el Rector/a.", table_body_style),
        Paragraph("• <b>EIDUS:</b> Planificar, organizar y supervisar los programas de Doctorado de la US y la expedición de sus tesis.<br/>• <b>EIP:</b> Coordinar la oferta de másteres universitarios oficiales y títulos propios de posgrado.", table_body_style)
    ])

    t_otros = Table(otros_data, colWidths=[105, 125, 110, 183])
    t_otros.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(t_otros)
    story.append(Spacer(1, 14))

    # SECTION 5: TÍTULO III - ARTÍCULO 90 (LA COMUNIDAD UNIVERSITARIA)
    story.append(Paragraph("5. TÍTULO III: LA COMUNIDAD UNIVERSITARIA (ARTÍCULO 90)", h1_style))

    story.append(Paragraph("<b>90.1 Composición de la Comunidad Universitaria:</b> Integrada por cuatro sectores definidos:", body_style))
    story.append(Paragraph("1. Personal docente e investigador (PDI).", bullet_style))
    story.append(Paragraph("2. Personal investigador.", bullet_style))
    story.append(Paragraph("3. Estudiantado.", bullet_style))
    story.append(Paragraph("4. Personal técnico, de gestión y de administración y servicios (PTGAS).", bullet_style))
    
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>90.2 Derechos Fundamentales y Principio de No Discriminación:</b>", body_style))
    story.append(Paragraph("El Artículo 90.2.e consagra la prohibición absoluta de discriminación basándose en una lista cerrada de <b>15 causales protegidas</b>:", body_style))
    
    causales_text = (
        "<b>Las 15 Causales de Prohibición de Discriminación (Art. 90.2.e):</b><br/>"
        "1. Nacimiento • 2. Origen racial o étnico • 3. Sexo • 4. Orientación sexual • 5. Identidad de género • "
        "6. Religión • 7. Convicción u opinión • 8. Edad • 9. Discapacidad • 10. Nacionalidad • "
        "11. Enfermedad • 12. Condición socioeconómica • 13. Lingüística • 14. Afinidad política y sindical • 15. Apariencia."
    )
    
    t_box = Table([[Paragraph(causales_text, ParagraphStyle('BoxText', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=primary_color))]], colWidths=[523])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF8E7")),
        ('BORDER', (0, 0), (-1, -1), 1, primary_color),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_box)
    
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>90.3 Deberes Principales de la Comunidad:</b>", body_style))
    story.append(Paragraph("• Cumplir los Estatutos, reglamentos y acuerdos de los órganos de gobierno.", bullet_style))
    story.append(Paragraph("• Ejercer los cargos de representación para los que fueren elegidos con dedicación y responsabilidad.", bullet_style))
    story.append(Paragraph("• Contribuir a los fines y mejora del servicio público de la Universidad de Sevilla.", bullet_style))
    story.append(Paragraph("• <b>Potenciar el prestigio de la Universidad de Sevilla</b> y su vinculación con la sociedad.", bullet_style))
    story.append(Paragraph("• Mantener un trato respetuoso y no discriminatorio a todos los integrantes de la comunidad.", bullet_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado con éxito en: {filename}")

if __name__ == '__main__':
    out_dir = os.path.join(os.getcwd(), 'public')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'Competencias_Organos_Estatutos_US_Decreto_98_2025.pdf')
    build_pdf(out_path)
