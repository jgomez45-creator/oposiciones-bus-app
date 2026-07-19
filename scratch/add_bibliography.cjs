const fs = require('fs');
const path = require('path');

const bibliographies = {
  1: [
    "**Reglamento de la Biblioteca de la Universidad de Sevilla** (Aprobado por Acuerdo del Consejo de Gobierno de la Universidad de Sevilla de 4 de marzo de 2011, modificado por Acuerdo de 24 de julio de 2014).",
    "**Normas de Préstamo a Domicilio de la Biblioteca de la Universidad de Sevilla** (Aprobadas por la Comisión de Biblioteca de la US).",
    "**Plan Director de la Biblioteca de la Universidad de Sevilla (2022-2026)**.",
    "**Decreto 98/2025, por el que se aprueban los Estatutos de la Universidad de Sevilla**."
  ],
  2: [
    "**Carta de Servicios de la Biblioteca de la Universidad de Sevilla**.",
    "**Modelo EFQM de Excelencia (European Foundation for Quality Management)**.",
    "**Plan Estratégico de la Universidad de Sevilla**."
  ],
  3: [
    "**Pautas y recomendaciones para los espacios y el mobiliario de las bibliotecas universitarias (REBIUN)**.",
    "**Normas para el uso y conservación de los fondos antiguos y valiosos de la Biblioteca de la Universidad de Sevilla**.",
    "**Reglamento de organización y funcionamiento de los archivos y del patrimonio documental de la Universidad de Sevilla**."
  ],
  4: [
    "**Programa de Gestión de la Colección de la Biblioteca de la Universidad de Sevilla**.",
    "**Guías de recursos y acceso remoto de la BUS (VPN, UVUS, OpenAthens)**.",
    "**Plan Director de la BUS (Estrategias de adquisición de recursos electrónicos)**."
  ],
  5: [
    "**Directrices para el expurgo de las colecciones de la Biblioteca de la Universidad de Sevilla**.",
    "**Formato MARC 21 para datos bibliográficos (Library of Congress)**.",
    "**Directrices de catalogación RDA (Resource Description and Access)**.",
    "**Reglas de Catalogación españolas (Ministerio de Cultura)**."
  ],
  6: [
    "**Clasificación Decimal Universal (CDU): Tablas oficiales (edición abreviada de AENOR)**.",
    "**Manuales y pautas de ordenación física de fondos en salas y depósitos de la BUS**."
  ],
  7: [
    "**Alma: Plataforma de Servicios de Biblioteca (Ex Libris)**.",
    "**Primo VE: Catálogo integrado de la BUS - FAMA (Ex Libris)**."
  ],
  8: [
    "**Norma ISO 28560: Tecnologías de identificación por radiofrecuencia (RFID) en bibliotecas**.",
    "**Manuales de usuario de las estaciones de autopréstamo de la BUS**."
  ],
  9: [
    "**Normas de Préstamo a Domicilio de la Biblioteca de la Universidad de Sevilla**.",
    "**Reglamento y normas de uso del servicio de Objetoteca de la Biblioteca de la Universidad de Sevilla**."
  ],
  10: [
    "**Servicio de Información, Atención y Referencia de la BUS**.",
    "**Catálogo FAMA de la Universidad de Sevilla y bases de datos del Consorcio de Bibliotecas Universitarias de Andalucía (CBUA)**."
  ],
  11: [
    "**Plan ALFIN/CODI (Alfabetización Informacional y Competencia Digital) de la BUS**.",
    "**Marco Europeo de Competencia Digital para los Ciudadanos (DigComp)**."
  ],
  12: [
    "**Directrices del Repositorio Institucional idUS (Depósito de Investigación de la Universidad de Sevilla)**.",
    "**Política de Acceso Abierto de la Universidad de Sevilla**.",
    "**Portal de Producción Científica PRISMA (Universidad de Sevilla)**."
  ],
  13: [
    "**Guías de soporte oficial de Microsoft 365 (Outlook, OneDrive, SharePoint, Teams, Word, Excel)**.",
    "**Normas de uso de recursos informáticos de la Universidad de Sevilla**."
  ],
  14: [
    "**Plan de Prevención de Riesgos Laborales de la Universidad de Sevilla**.",
    "**Manual de Prevención de Riesgos Laborales de la US**.",
    "**Circular de la Gerencia de la Universidad de Sevilla de 24 de mayo de 2018, sobre procedimiento en caso de accidente de trabajo**.",
    "**Ley 31/1995, de 8 de noviembre, de Prevención de Riesgos Laborales**."
  ],
  15: [
    "**Guía Preventiva para los Empleados Públicos de la Universidad de Sevilla (SEPRUS)**.",
    "**Fichas preventivas y recomendaciones posturales del Servicio de Prevención de Riesgos Laborales de la US (SEPRUS)**."
  ],
  16: [
    "**Ley 31/1995, de 8 de noviembre, de Prevención de Riesgos Laborales**.",
    "**Real Decreto 486/1997, de 14 de abril, por el que se establecen las disposiciones mínimas de seguridad y salud en los lugares de trabajo**.",
    "**Real Decreto 488/1997, de 14 de abril, sobre pantallas de visualización de datos**.",
    "**Real Decreto 773/1997, de 30 de mayo, sobre utilización de equipos de protección individual**.",
    "**Real Decreto 485/1997, de 14 de abril, sobre señalización de seguridad y salud en el trabajo**."
  ],
  17: [
    "**Estatutos de la Universidad de Sevilla (Decreto 98/2025)**.",
    "**Ley Orgánica 2/2023, de 22 de marzo, del Sistema Universitario (LOSU)**."
  ],
  18: [
    "**IV Convenio Colectivo del Personal Laboral de las Universidades Públicas de Andalucía (BOJA de 14 de octubre de 2008)**.",
    "**Texto Refundido de la Ley del Estatuto de los Trabajadores (Real Decreto Legislativo 2/2015, de 23 de octubre)**."
  ],
  19: [
    "**Ley Orgánica 3/2007, de 22 de marzo, para la igualdad efectiva de mujeres y hombres**.",
    "**III Plan de Igualdad de la Universidad de Sevilla (2024-2028)**.",
    "**Medidas y planes de conciliación de la vida laboral y familiar para el PTGAS de la Universidad de Sevilla**."
  ],
  20: [
    "**Normativa para la prevención, evaluación e intervención ante la violencia, la discriminación y el acoso en la Universidad de Sevilla** (Aprobada por Acuerdo del Consejo de Gobierno de la Universidad de Sevilla de 17 de diciembre de 2024, publicada en BOUS de 12 de febrero de 2025).",
    "**Ley 3/2022, de 25 de febrero, de Convivencia Universitaria**."
  ]
};

const markdownDir = path.join(__dirname, '..', 'public', 'markdown');

for (let i = 1; i <= 20; i++) {
  const formattedNum = String(i).padStart(2, '0');
  const filename = `tema-${formattedNum}.md`;
  const filePath = path.join(markdownDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Idempotency: Check and remove existing bibliography section if present
  if (content.includes('##') && (content.includes('Bibliografía') || content.includes('Bibliografia'))) {
    const regex = /\r?\n---\r?\n\r?\n##\s+\d+\.\s+Bibliograf[ií]a[\s\S]*$/;
    if (regex.test(content)) {
      content = content.replace(regex, '');
    } else {
      const regexAlt = /\r?\n##\s+\d+\.\s+Bibliograf[ií]a[\s\S]*$/;
      content = content.replace(regexAlt, '');
    }
  }

  // Find the highest section number to increment for Bibliography
  const sectionHeaderRegex = /^##\s+(\d+)\.\s+/gm;
  let match;
  let maxSectionNum = 0;
  while ((match = sectionHeaderRegex.exec(content)) !== null) {
    const num = parseInt(match[1], 10);
    if (num > maxSectionNum) {
      maxSectionNum = num;
    }
  }

  const nextSectionNum = maxSectionNum + 1;
  const bibList = bibliographies[i] || [];
  const bibText = bibList.map(item => `*   ${item}`).join('\n');

  const newSection = `\n\n---\n\n## ${nextSectionNum}. Bibliografía\n${bibText}\n`;

  const updatedContent = content.trimEnd() + newSection;

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated ${filename} with ${bibList.length} references at section ${nextSectionNum}`);
}

console.log("All files updated successfully!");
