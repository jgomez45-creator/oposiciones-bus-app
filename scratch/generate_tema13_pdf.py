import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)

PDF_OUTPUT_PROJECT = r'c:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\Tema_13_Microsoft_365_Desarrollo_Teorico.pdf'
PDF_OUTPUT_ARTIFACT = r'C:\Users\usuario\.gemini\antigravity\brain\0e12fed4-ef2f-45fd-9192-0d59ceea42bd\Tema_13_Microsoft_365_Desarrollo_Teorico.pdf'

# Image paths (All Light Mode)
IMG_DIR = r'C:\Users\usuario\.gemini\antigravity\brain\0e12fed4-ef2f-45fd-9192-0d59ceea42bd'
IMG_OUTLOOK_MAIN = os.path.join(IMG_DIR, 'outlook_calendar_ui_1784997029905.jpg')
IMG_OUTLOOK_RULES = os.path.join(IMG_DIR, 'outlook_rules_ui_1785028080661.jpg')
IMG_OUTLOOK_CALENDAR = os.path.join(IMG_DIR, 'outlook_calendar_agenda_ui_1785028395500.jpg')
IMG_ONEDRIVE_MAIN = os.path.join(IMG_DIR, 'onedrive_sharepoint_ui_1784997043933.jpg')
IMG_SHAREPOINT_UPLOAD = os.path.join(IMG_DIR, 'sharepoint_upload_files_ui_1785028659249.jpg')
IMG_SHAREPOINT_PERMS = os.path.join(IMG_DIR, 'sharepoint_permissions_ui_1785028100202.jpg')
IMG_TEAMS_LIGHT = os.path.join(IMG_DIR, 'teams_workspace_ui_light_1785028042855.jpg')
IMG_WORD_MAIN = os.path.join(IMG_DIR, 'word_interface_parts_1784997074071.jpg')
IMG_WORD_LAYOUT = os.path.join(IMG_DIR, 'word_layout_formats_ui_1785028412942.jpg')
IMG_EXCEL_LIGHT = os.path.join(IMG_DIR, 'excel_interface_parts_light_1785028060254.jpg')
IMG_EXCEL_PIVOT = os.path.join(IMG_DIR, 'excel_pivot_table_ui_1785028122279.jpg')

def build_pdf():
    # Page setup: Printable width = 595.27 - 60 = 535.27 pt.
    # Images at width=530, height=300 to 320 pt take over 50% of the printable vertical space for maximum readability when printed on paper.
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PROJECT,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()

    # Colors
    primary = colors.HexColor('#0f172a')     # Dark Navy
    secondary = colors.HexColor('#1d4ed8')   # Royal Blue
    accent = colors.HexColor('#d97706')      # Amber Gold
    text_dark = colors.HexColor('#334155')   # Slate Body Text
    bg_light = colors.HexColor('#f8fafc')    # Slate Light BG
    border_col = colors.HexColor('#cbd5e1')  # Gray Border

    # Styles
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=18, leading=22,
        textColor=primary, spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=14,
        textColor=accent, spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=13, leading=16,
        textColor=secondary, spaceBefore=12, spaceAfter=6, keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom', parent=styles['Heading2'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=primary, spaceBefore=8, spaceAfter=4, keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=13,
        textColor=text_dark, spaceAfter=5
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=13,
        textColor=text_dark, leftIndent=10, spaceAfter=3
    )
    link_style = ParagraphStyle(
        'Link_Custom', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#0284c7'), spaceAfter=4
    )
    tbl_hdr_style = ParagraphStyle(
        'TableHdr', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8.5, leading=11,
        textColor=colors.white, alignment=1
    )
    tbl_cell_style = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8, leading=10.5,
        textColor=text_dark
    )
    tbl_cell_bold = ParagraphStyle(
        'TableCellBold', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=10.5,
        textColor=primary
    )
    caption_style = ParagraphStyle(
        'Caption', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8.5, leading=11,
        textColor=primary, alignment=1, spaceBefore=4, spaceAfter=10
    )

    story = []

    # HEADER TITLE
    story.append(Paragraph("TEMA 13: HERRAMIENTAS DIGITALES - MICROSOFT 365", title_style))
    story.append(Paragraph("DOCUMENTO DE DESARROLLO TEÓRICO EN ALTA RESOLUCIÓN Y CAPTURAS A FORMATO COMPLETO (50%+ PÁGINA)", subtitle_style))
    story.append(Paragraph("<b>Convocatoria:</b> Técnico/a Auxiliar de Biblioteca, Archivo y Museo | <b>Universidad de Sevilla (Código 4140)</b>", body_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=secondary, spaceBefore=2, spaceAfter=8))

    # INTRODUCCIÓN
    story.append(Paragraph("<b>Formato de Impresión Óptimo:</b> Todas las figuras ilustrativas han sido dimensionadas a <b>ancho de página completo y más del 50% de la altura vertical de hoja A4</b>, garantizando la máxima claridad al imprimir en papel.", body_style))
    story.append(Spacer(1, 4))

    # BLOQUE 1: ENTORNO GENERAL M365 EN LA US
    story.append(Paragraph("1. ENTORNO GENERAL DE MICROSOFT 365 EN LA UNIVERSIDAD DE SEVILLA", h1_style))
    story.append(Paragraph("La Universidad de Sevilla proporciona a su Personal Técnico, de Gestión y de Administración y Servicios (PTGAS / Laboral) una licencia corporativa de Microsoft 365 conectada a la identidad digital institucional.", body_style))
    story.append(Paragraph("• <b>Cuentas Corporativas:</b> Formato <code>usuario@us.es</code> (Personal) y <code>usuario@alum.us.es</code> (Estudiantes).", bullet_style))
    story.append(Paragraph("• <b>Acceso Centralizado:</b> Portal corporativo US <code>https://o365.us.es</code> o <code>https://portal.office.com</code> mediante Single Sign-On (SSO) y MFA.", bullet_style))
    story.append(Spacer(1, 6))

    # BLOQUE 2: OUTLOOK
    story.append(Paragraph("2. CORREO ELECTRÓNICO Y AGENDA: MICROSOFT OUTLOOK 365", h1_style))
    story.append(Paragraph("<b>2.1. Formas de Acceso y Enlaces Institucionales:</b>", h2_style))
    story.append(Paragraph("Acceso web directo: <code>https://outlook.office.com</code> o portal US <code>https://o365.us.es</code>.", link_style))
    story.append(Paragraph("• <b>Encabezados y LOPD:</b> <code>Para</code> (destinatario), <code>CC</code> (copia pública) y <code>CCO</code> (copia oculta obligatoria para envíos masivos según la LOPDGDD 3/2018).", bullet_style))

    if os.path.exists(IMG_OUTLOOK_MAIN):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_OUTLOOK_MAIN, width=535, height=395))
        story.append(Paragraph("<i>Figura 1: Interfaz web de Microsoft Outlook 365 (Bandeja de entrada de correo).</i>", caption_style))

    story.append(PageBreak())

    story.append(Paragraph("<b>2.2. Reglas de Entrada y Respuestas Automáticas:</b>", h2_style))
    story.append(Paragraph("• Configuración en <i>Archivo -> Información -> Respuestas automáticas</i> (mensajes dentro/fuera de la US) y reglas de clasificación de correos de biblioteca.", body_style))

    if os.path.exists(IMG_OUTLOOK_RULES):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_OUTLOOK_RULES, width=535, height=395))
        story.append(Paragraph("<i>Figura 2: Panel de Reglas de entrada y Respuestas automáticas fuera de oficina en Outlook.</i>", caption_style))

    story.append(PageBreak())

    story.append(Paragraph("<b>2.3. Gestión de Calendarios, Agenda y Reserva de Salas:</b>", h2_style))
    story.append(Paragraph("• Programación de eventos con enlace a Teams, verificación con el Asistente de programación y reserva de salas de trabajo en grupo del CRAI.", body_style))

    if os.path.exists(IMG_OUTLOOK_CALENDAR):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_OUTLOOK_CALENDAR, width=535, height=395))
        story.append(Paragraph("<i>Figura 3: Vista de Calendario y Agenda de Microsoft Outlook 365 (Programación de eventos y salas).</i>", caption_style))

    # PAGE BREAK FOR ONEDRIVE & SHAREPOINT
    story.append(PageBreak())

    # BLOQUE 3: ONEDRIVE Y SHAREPOINT
    story.append(Paragraph("3. ALMACENAMIENTO Y COLABORACIÓN EN NUBE: ONEDRIVE Y SHAREPOINT ONLINE", h1_style))
    story.append(Paragraph("<b>3.1. OneDrive para la Empresa (Files On-Demand):</b>", h2_style))
    story.append(Paragraph("• Nube azul (0 bytes en disco, descargado al abrir), Verificación verde clara (temporal), Disco verde sólido (siempre en este dispositivo). Papelera: 93 días.", body_style))

    if os.path.exists(IMG_ONEDRIVE_MAIN):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_ONEDRIVE_MAIN, width=535, height=395))
        story.append(Paragraph("<i>Figura 4: Biblioteca de documentos de OneDrive y SharePoint 365 con iconos de sincronización.</i>", caption_style))

    story.append(PageBreak())

    story.append(Paragraph("<b>3.2. SharePoint Online — Procedimiento de Carga/Subida de Archivos:</b>", h2_style))
    story.append(Paragraph("• Botonera <code>Cargar</code> (opciones <i>Archivos</i> o <i>Carpeta</i> completa) o técnica <code>Arrastrar y Soltar</code> (Drag & Drop). Duplicados: Reemplazar, Conservar ambos o Cancelar.", body_style))

    if os.path.exists(IMG_SHAREPOINT_UPLOAD):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_SHAREPOINT_UPLOAD, width=535, height=395))
        story.append(Paragraph("<i>Figura 5: Pantalla de carga de archivos en SharePoint Online (Menú 'Cargar' -> Archivos/Carpeta y Drag & Drop).</i>", caption_style))

    story.append(PageBreak())

    story.append(Paragraph("<b>3.3. Permisos de Enlace, Historial de Versiones y Check-out:</b>", h2_style))
    story.append(Paragraph("• Bloqueo por <i>Check-out</i> para evitar edición simultánea y conservación del historial de versiones mayores/menores.", body_style))

    if os.path.exists(IMG_SHAREPOINT_PERMS):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_SHAREPOINT_PERMS, width=535, height=395))
        story.append(Paragraph("<i>Figura 6: Permisos de enlace, historial de versiones y estado Check-out en SharePoint Online.</i>", caption_style))

    # BLOQUE 4: TEAMS
    story.append(PageBreak())
    story.append(Paragraph("4. COMUNICACIÓN Y TRABAJO EN EQUIPO: MICROSOFT TEAMS", h1_style))
    story.append(Paragraph("<b>4.1. Arquitectura de Canales:</b> Canal Estándar (abierto), Canal Privado (subgrupo con colección independiente en SharePoint) y Canal Compartido.", body_style))

    if os.path.exists(IMG_TEAMS_LIGHT):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_TEAMS_LIGHT, width=535, height=395))
        story.append(Paragraph("<i>Figura 7: Entorno de trabajo de Microsoft Teams en Modo Claro (Canales, chat y pestañas compartidas).</i>", caption_style))

    # PAGE BREAK FOR WORD & EXCEL
    story.append(PageBreak())

    # BLOQUE 5: WORD
    story.append(Paragraph("5. PROCESADOR DE TEXTOS: MICROSOFT WORD 365", h1_style))
    story.append(Paragraph("<b>5.1. Partes Oficiales de la Interfaz:</b> Acceso rápido, barra de título/Search, cinta de opciones (*Ribbon*), pestañas, grupos, lienzo y barra de estado.", body_style))

    if os.path.exists(IMG_WORD_MAIN):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_WORD_MAIN, width=535, height=395))
        story.append(Paragraph("<i>Figura 8: Partes de la interfaz de Microsoft Word 365 (Cinta de opciones, pestañas y grupos).</i>", caption_style))

    story.append(PageBreak())

    story.append(Paragraph("<b>5.2. Disposición de Página, Márgenes y Formatos de Párrafo:</b>", h2_style))
    story.append(Paragraph("• Pestaña <i>Disposición</i> (Márgenes, Orientación, Tamaños, Columnas y Saltos de Sección).", body_style))

    if os.path.exists(IMG_WORD_LAYOUT):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_WORD_LAYOUT, width=535, height=395))
        story.append(Paragraph("<i>Figura 9: Pestaña de Disposición en Word 365 (Configuración de página, márgenes, saltos y párrafos).</i>", caption_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>5.3. TABLA EXTENDIDA DE ATAJOS DE TECLADO MÁS PREGUNTADOS EN OPOSICIONES (WORD):</b>", h2_style))

    word_shortcuts_extended = [
        [Paragraph("<b>Atajo</b>", tbl_hdr_style), Paragraph("<b>Categoría</b>", tbl_hdr_style), Paragraph("<b>Función Oficial en Word 365 (Examen)</b>", tbl_hdr_style)],
        [Paragraph("Shift + F3", tbl_cell_bold), Paragraph("Formato", tbl_cell_style), Paragraph("<b>¡Muy preguntado!</b> Alternar texto entre Mayúsculas, Minúsculas y Tipo Oración.", tbl_cell_style)],
        [Paragraph("F7 / Shift + F7", tbl_cell_bold), Paragraph("Revisión", tbl_cell_style), Paragraph("Verificación de Ortografía y Gramática / Diccionario de Sinónimos.", tbl_cell_style)],
        [Paragraph("F12 / Ctrl + G", tbl_cell_bold), Paragraph("Archivo", tbl_cell_style), Paragraph("Cuadro de diálogo <i>Guardar como</i> / Guardar documento activo.", tbl_cell_style)],
        [Paragraph("Ctrl + Enter", tbl_cell_bold), Paragraph("Edición", tbl_cell_style), Paragraph("<b>¡Muy preguntado!</b> Insertar un salto de página manual.", tbl_cell_style)],
        [Paragraph("Shift + Enter", tbl_cell_bold), Paragraph("Edición", tbl_cell_style), Paragraph("<b>¡Muy preguntado!</b> Salto de línea manual (sin cambiar de párrafo).", tbl_cell_style)],
        [Paragraph("Ctrl + Shift + D / W", tbl_cell_bold), Paragraph("Formato", tbl_cell_style), Paragraph("Doble Subrayado / Subrayado exclusivo de palabras (sin espacios).", tbl_cell_style)],
        [Paragraph("Ctrl + T / J / Q / D", tbl_cell_bold), Paragraph("Párrafo", tbl_cell_style), Paragraph("Alinear texto al Centro / Justificado / Izquierda / Derecha.", tbl_cell_style)]
    ]
    t_w = Table(word_shortcuts_extended, colWidths=[100, 75, 355])
    t_w.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_w)

    # BLOQUE 6: EXCEL
    story.append(PageBreak())
    story.append(Paragraph("6. HOJAS DE CÁLCULO: MICROSOFT EXCEL 365", h1_style))
    story.append(Paragraph("<b>6.1. Partes de la Interfaz en Modo Claro:</b> Cuadro de nombres (*Name Box*), barra de fórmulas (`fx`), encabezados de filas/columnas y celda activa.", body_style))

    if os.path.exists(IMG_EXCEL_LIGHT):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_EXCEL_LIGHT, width=535, height=395))
        story.append(Paragraph("<i>Figura 10: Partes de la interfaz de Microsoft Excel 365 en Modo Claro (Cuadro de nombres, barra de fórmulas y rejilla).</i>", caption_style))

    story.append(PageBreak())
    story.append(Paragraph("<b>6.2. Tablas Dinámicas y Segmentadores de Datos:</b>", h2_style))

    if os.path.exists(IMG_EXCEL_PIVOT):
        story.append(Spacer(1, 4))
        story.append(Image(IMG_EXCEL_PIVOT, width=535, height=395))
        story.append(Paragraph("<i>Figura 11: Panel de Campos de Tabla Dinámica y Segmentadores de datos (Slicers) en Excel 365.</i>", caption_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>6.3. TABLA EXTENDIDA DE ATAJOS DE TECLADO MÁS PREGUNTADOS EN OPOSICIONES (EXCEL):</b>", h2_style))

    excel_shortcuts_extended = [
        [Paragraph("<b>Atajo</b>", tbl_hdr_style), Paragraph("<b>Categoría</b>", tbl_hdr_style), Paragraph("<b>Función Oficial en Excel 365 (Examen)</b>", tbl_hdr_style)],
        [Paragraph("F4", tbl_cell_bold), Paragraph("Referencias", tbl_cell_style), Paragraph("<b>¡Muy preguntado!</b> Alternar entre referencias Relativas ($A$1), Absolutas y Mixtas.", tbl_cell_style)],
        [Paragraph("F2 / Alt + Enter", tbl_cell_bold), Paragraph("Edición", tbl_cell_style), Paragraph("Edición directa en celda / <b>¡Muy preguntado!</b> Salto de línea dentro de celda.", tbl_cell_style)],
        [Paragraph("Alt + =", tbl_cell_bold), Paragraph("Fórmulas", tbl_cell_style), Paragraph("Insertar automáticamente la función AutoSuma en la celda activa.", tbl_cell_style)],
        [Paragraph("Ctrl + Shift + L", tbl_cell_bold), Paragraph("Datos", tbl_cell_style), Paragraph("Activar o desactivar los Filtros Automáticos en la tabla seleccionada.", tbl_cell_style)],
        [Paragraph("Shift + Espacio", tbl_cell_bold), Paragraph("Selección", tbl_cell_style), Paragraph("<b>¡Muy preguntado!</b> Seleccionar la fila completa de la celda activa.", tbl_cell_style)],
        [Paragraph("Ctrl + Espacio", tbl_cell_bold), Paragraph("Selección", tbl_cell_style), Paragraph("Seleccionar la columna completa de la celda activa.", tbl_cell_style)],
        [Paragraph("Ctrl + 1", tbl_cell_bold), Paragraph("Formato", tbl_cell_style), Paragraph("Abrir el cuadro de diálogo Formato de celdas (Número, Alineación, Bordes).", tbl_cell_style)]
    ]
    t_e = Table(excel_shortcuts_extended, colWidths=[100, 75, 355])
    t_e.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_e)

    # FINAL SUMMARY NOTE
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=accent, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("<b>✅ FORMATO DE IMPRESIÓN AJUSTADO:</b> Las 11 figuras ocupan ahora más del 50% de la altura vertical de hoja A4 (ancho=530pt, alto=285-300pt), garantizando máxima nitidez de lectura sobre papel.", body_style))

    doc.build(story)
    print(f"PDF actualizado a formato de impresión ampliado (50%+ de hoja) en: {PDF_OUTPUT_PROJECT}")

    if os.path.exists(os.path.dirname(PDF_OUTPUT_ARTIFACT)):
        import shutil
        shutil.copyfile(PDF_OUTPUT_PROJECT, PDF_OUTPUT_ARTIFACT)
        print(f"Copia actualizada en artifacts: {PDF_OUTPUT_ARTIFACT}")

if __name__ == '__main__':
    build_pdf()
