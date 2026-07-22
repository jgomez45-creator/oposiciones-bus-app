import os
import subprocess
import fitz  # PyMuPDF

# Paths
base_dir = r"c:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app"
scratch_dir = os.path.join(base_dir, "scratch")
artifact_dir = r"C:\Users\usuario\.gemini\antigravity\brain\79346660-8b65-4282-8fc3-e0bc02d84edd"

html_path = os.path.join(scratch_dir, "muestra_tipografias.html")
pdf_path = os.path.join(base_dir, "muestra_tipografias_temario.pdf")
png_path = os.path.join(artifact_dir, "muestra_tipografias_temario.png")

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Muestra de Tipografías - Temario Oposiciones BUS</title>
<style>
  @page {
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
  }
  body {
    background: white;
    color: black;
    font-family: Arial, Calibri, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.4;
  }

  .tag {
    display: inline-block;
    background-color: #e11d48;
    color: white;
    font-size: 9pt;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 8px;
    vertical-align: middle;
    font-family: monospace;
  }

  .print-topic-header {
    border-bottom: 3px solid #000000;
    padding-bottom: 10px;
    margin-bottom: 20px;
    text-align: left;
  }

  .print-superheader {
    font-size: 12pt;
    text-transform: uppercase;
    font-weight: normal;
    color: #555555;
    display: block;
    margin-bottom: 6px;
    font-family: Arial, Calibri, Helvetica, sans-serif;
  }

  .print-topic-title {
    font-size: 28pt;
    font-weight: bold;
    line-height: 1.15;
    color: #000000;
    margin: 5px 0 8px 0;
    font-family: Arial, Calibri, Helvetica, sans-serif;
  }

  .print-topic-subtitle {
    font-size: 14.5pt;
    font-style: italic;
    color: #555555;
    margin: 0;
    font-family: Arial, Calibri, Helvetica, sans-serif;
  }

  .markdown-rendered-content {
    color: #000000;
    font-size: 14pt;
    line-height: 1.4;
    font-family: Arial, Calibri, Helvetica, sans-serif;
  }

  .markdown-rendered-content h1 {
    color: #004B93;
    font-size: 22pt;
    font-weight: bold;
    margin-top: 20pt;
    margin-bottom: 10pt;
    border-bottom: 3px solid #004B93;
    padding-bottom: 6px;
  }

  .markdown-rendered-content h2 {
    color: #004B93;
    font-size: 17pt;
    font-weight: bold;
    margin-top: 16pt;
    margin-bottom: 8pt;
    border-bottom: 1px solid #b0c4de;
    padding-bottom: 4px;
  }

  .markdown-rendered-content h3 {
    color: #008080;
    font-size: 14.5pt;
    font-weight: bold;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }

  .markdown-rendered-content p {
    font-size: 13.5pt;
    line-height: 1.4;
    text-align: justify;
    margin-bottom: 10pt;
  }

  .markdown-rendered-content ul, .markdown-rendered-content ol {
    font-size: 13.5pt;
    line-height: 1.4;
    padding-left: 25px;
    margin-bottom: 10pt;
  }

  .markdown-rendered-content li {
    font-size: 13.5pt;
    line-height: 1.4;
    margin-bottom: 5px;
  }

  .markdown-rendered-content blockquote {
    border-left: 4px solid #004B93;
    background-color: #f4f8fc;
    color: #333333;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 4px;
    font-style: normal;
  }

  .markdown-rendered-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
  }

  .markdown-rendered-content th {
    background-color: #004B93;
    color: white;
    font-weight: bold;
    text-align: left;
    padding: 8px 10px;
    font-size: 12pt;
  }

  .markdown-rendered-content td {
    border: 1px solid #ddd;
    padding: 8px 10px;
    font-size: 12pt;
  }
</style>
</head>
<body>

  <!-- CABECERA DEL TEMA -->
  <div class="print-topic-header">
    <span class="print-superheader">
      <span class="tag">SUPERCABECERA: 12pt</span>TEMARIO OFICIAL OPOSICIONES BUS - GRUPO IV
    </span>
    <div class="print-topic-title">
      <span class="tag">TÍTULO TEMA: 28pt</span>Tema 1: Las bibliotecas universitarias y la BUS
    </div>
    <div class="print-topic-subtitle">
      <span class="tag">SUBTÍTULO: 14.5pt Cursiva</span>Concepto, estructura, funciones, organigrama y marco normativo (Reglamento y normas de préstamo)
    </div>
  </div>

  <div class="markdown-rendered-content">
    
    <!-- H1 -->
    <h1>
      <span class="tag">H1 BLOQUE: 22pt</span>1. Concepto y Evolución de las Bibliotecas Universitarias
    </h1>

    <!-- PÁRRAFO -->
    <p>
      <span class="tag">PÁRRAFO: 14pt</span>Las <strong>bibliotecas universitarias</strong> son unidades clave en el engranaje de la educación superior. Tradicionalmente centradas en la conservación física de textos y la consulta presencial, han evolucionado para dar respuesta al entorno digital y las nuevas metodologías docentes del Espacio Europeo de Educación Superior (EEES).
    </p>

    <!-- H2 -->
    <h2>
      <span class="tag">H2 APARTADO: 17pt</span>1.1 El Modelo CRAI y los Servicios de Apoyo
    </h2>

    <!-- PÁRRAFO -->
    <p>
      La transición digital e institucional ha llevado al surgimiento del <strong>CRAI</strong> (Centro de Recursos para el Aprendizaje y la Investigación), el cual integra en un único espacio los servicios de información y docencia.
    </p>

    <!-- H3 -->
    <h3>
      <span class="tag">H3 SUBAPARTADO: 14.5pt</span>Servicios Integrados en el CRAI
    </h3>

    <!-- LISTA -->
    <ul>
      <li><span class="tag">LISTA / VIÑETA: 14pt</span><strong>Recursos de información:</strong> Colecciones impresas, electrónicas y bases de datos.</li>
      <li><strong>Soporte tecnológico e informático:</strong> Acceso a redes, puestos de lectura equipados e impresión.</li>
      <li><strong>Apoyo a la investigación:</strong> Asesoramiento sobre acceso abierto y repositorio institucional.</li>
    </ul>

    <!-- BLOQUE DE CITA -->
    <blockquote>
      <span class="tag">CITA / NOTA: 14pt (Fondo azul claro)</span><strong>Artículo 1 del Reglamento BUS:</strong> "La BUS es un centro de recursos para el aprendizaje, la docencia y la investigación, constituido como unidad funcional única e integrada por todos los fondos bibliográficos de la Universidad."
    </blockquote>

    <!-- TABLA -->
    <h2>
      <span class="tag">H2 APARTADO: 17pt</span>1.2 Normas de Préstamo a Domicilio
    </h2>

    <table>
      <thead>
        <tr>
          <th><span class="tag">CABECERA TABLA: 13pt</span>Tipo de Usuario</th>
          <th>Préstamos Simultáneos</th>
          <th>Plazo Estándar</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="tag">CELDA TABLA: 13pt</span><strong>Estudiantes de Grado</strong></td>
          <td>10 documentos</td>
          <td>15 días</td>
        </tr>
        <tr>
          <td><strong>PDI / Investigadores</strong></td>
          <td>60 documentos</td>
          <td>60 días</td>
        </tr>
      </tbody>
    </table>

  </div>

</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generado en {html_path}")

# Run Edge headless to print to PDF
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path}",
    "--no-margins",
    html_path
]

subprocess.run(cmd, check=True)
print(f"PDF generado en {pdf_path}")

# Render PDF page to PNG using PyMuPDF
doc = fitz.open(pdf_path)
page = doc[0]
pix = page.get_pixmap(dpi=150)
pix.save(png_path)
doc.close()

print(f"Imagen PNG generada en {png_path}")
