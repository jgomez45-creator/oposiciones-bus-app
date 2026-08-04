import json
import os

questions = [
    # 1 - 10: Claustro Universitario vs Consejo de Gobierno vs Consejo Social
    {
        "id": 1,
        "question": "¿A qué órgano de la Universidad de Sevilla le corresponde con carácter exclusivo la aprobación y reforma de sus Estatutos?",
        "options": [
            "Al Consejo de Gobierno, a propuesta del Rector y previo informe del Consejo Social.",
            "Al Claustro Universitario, mediante el procedimiento y mayorías legalmente establecidas.",
            "Al Consejo Social, oído el parecer de la Junta de Andalucía y del Rector de la Universidad.",
            "A la Comisión Estatutaria del Consejo de Gobierno, ratificada posteriormente por el Claustro."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 16.1.a) del Decreto 98/2025 (Estatutos de la US), corresponde al Claustro Universitario la elaboración, aprobación y reforma de los Estatutos de la Universidad de Sevilla.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 2,
        "question": "¿Qué órgano es competente para aprobar de forma definitiva el Presupuesto anual y la programación plurianual de la Universidad de Sevilla?",
        "options": [
            "El Claustro Universitario, tras la tramitación de enmiendas por la Comisión de Economía.",
            "El Consejo de Gobierno de la Universidad, a propuesta motivada formulada por el Gerente.",
            "El Consejo Social, a propuesta del Consejo de Gobierno de la Universidad de Sevilla.",
            "El Ministerio competente en materia de Universidades, previo informe favorable de la US."
        ],
        "correctAnswer": 2,
        "explanation": "Según el Art. 20.1.a) del Decreto 98/2025, corresponde al Consejo Social aprobar el presupuesto anual y la programación plurianual de la Universidad a propuesta del Consejo de Gobierno.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 3,
        "question": "¿A cuál de los siguientes órganos le corresponde la aprobación de la Relación de Puestos de Trabajo (RPT) del personal de la Universidad de Sevilla?",
        "options": [
            "Al Consejo Social de la Universidad, previo informe preceptivo emitido por el Claustro.",
            "Al Consejo de Gobierno, a propuesta del Gerente en el caso del PTGAS o del Rectorado.",
            "Al Rector de la Universidad de Sevilla, mediante resolución motivada publicada en el BOUS.",
            "A la Junta de Personal de la Universidad de Sevilla en negociación directa con la Gerencia."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 18.1.k) del Decreto 98/2025, el Consejo de Gobierno es el órgano competente para aprobar la Relación de Puestos de Trabajo del Personal Técnico, de Gestión y de Administración y Servicios y del PDI.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 4,
        "question": "¿Quién tiene la atribución estatutaria de elegir al Defensor o Defensora Universitario/a de la Universidad de Sevilla?",
        "options": [
            "El Consejo de Gobierno, por mayoría absoluta de sus integrantes en primera votación.",
            "El Consejo Social, a propuesta conjunta formulada por el Rector y las representaciones sindicales.",
            "El Claustro Universitario, por mayoría de tres quintos de sus miembros reglamentarios.",
            "El Rector de la Universidad de Sevilla, previa consulta a las delegaciones de estudiantes."
        ],
        "correctAnswer": 2,
        "explanation": "Según los Arts. 16.1.c) y 81 del Decreto 98/2025, el Defensor Universitario es elegido por el Claustro Universitario por mayoría de tres quintos de sus miembros.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 5,
        "question": "¿A qué órgano corresponde aprobar las normativas de desarrollo estatutario y los reglamentos generales de régimen interno de la US?",
        "options": [
            "Al Claustro Universitario en sesión plenaria convocada con carácter extraordinario.",
            "Al Consejo de Gobierno, en el ejercicio de sus funciones normativas y ejecutivas.",
            "Al Consejo Social, mediante el ejercicio de la potestad reglamentaria universitaria.",
            "Al Equipo de Dirección encabezado por la Secretaría General y la Asesoría Jurídica."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 18.1.b) del Decreto 98/2025, corresponde al Consejo de Gobierno elaborar y aprobar las normativas de desarrollo estatutario y los reglamentos generales de la Universidad.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 6,
        "question": "¿Quién ostenta la competencia exclusiva para la asignación individualizada de complementos retributivos adicionales al PDI?",
        "options": [
            "El Consejo de Gobierno, atendiendo a la evaluación docente realizada por el Rectorado.",
            "El Gerente de la Universidad, dentro de la distribución de créditos de la nómina del PDI.",
            "El Consejo Social, en función de los méritos docentes, investigadores y de gestión acreditados.",
            "El Consejo de Departamento al que se halle adscrito el profesorado correspondiente."
        ],
        "correctAnswer": 2,
        "explanation": "Según el Art. 20.1.c) del Decreto 98/2025, corresponde al Consejo Social la asignación individual de conceptos retributivos adicionales al PDI, a propuesta del Consejo de Gobierno.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 7,
        "question": "¿Cuál es el órgano responsable de proponer la creación, modificación o supresión de Facultades, Escuelas e Institutos Universitarios?",
        "options": [
            "El Claustro Universitario, requiriendo acuerdo de las tres cuartas partes de sus miembros.",
            "El Consejo de Gobierno de la US, para su posterior aprobación por la Junta de Andalucía.",
            "El Consejo Social de la Universidad, previo informe emitido por las Juntas de Centro afectadas.",
            "El Rector de la Universidad de Sevilla, mediante expediente motivado ante la Conferencia de Rectores."
        ],
        "correctAnswer": 1,
        "explanation": "Según los Arts. 18.1.e) y 30 del Decreto 98/2025, el Consejo de Gobierno propone a la Comunidad Autónoma la creación, modificación o supresión de Centros e Institutos Universitarios.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 8,
        "question": "¿A qué órgano compete aprobar las cuentas anuales de la Universidad de Sevilla y de las entidades dependientes de la misma?",
        "options": [
            "Al Claustro Universitario, en la sesión ordinaria de liquidación del ejercicio económico.",
            "Al Gerente de la Universidad, tras la auditoría efectuada por la Intervención General.",
            "Al Consejo Social, como órgano de fiscalización económica y transparencia pública.",
            "Al Consejo de Gobierno, tras su dictamen por la Comisión Financiera y de Patrimonio."
        ],
        "correctAnswer": 2,
        "explanation": "Según el Art. 20.1.b) del Decreto 98/2025, corresponde al Consejo Social aprobar las cuentas anuales de la Universidad y de las entidades que de ella dependan.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 9,
        "question": "¿Qué órgano tiene encomendada la función de fijar las líneas estratégicas y programáticas de la Universidad de Sevilla?",
        "options": [
            "El Claustro Universitario, en su condición de máximo órgano deliberante de la institución.",
            "El Consejo de Gobierno, en su condición de órgano de gobierno y gestión estratégica.",
            "El Consejo Social, al supervisar el cumplimiento de los objetivos sociales universitarios.",
            "El Consejo de Dirección integrado por el Rector, Vicerrectores, Secretario General y Gerente."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 17 y 18.1.a) del Decreto 98/2025, el Consejo de Gobierno es el órgano que establece las líneas estratégicas y directrices de aplicación en la Universidad de Sevilla.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 10,
        "question": "¿Quién tiene la atribución de acordar la disolución del Claustro e iniciar el proceso de elecciones extraordinarias a Rector/a?",
        "options": [
            "El propio Claustro Universitario, al aprobar una moción de censura por mayoría de dos tercios.",
            "El Consejo Social, cuando compruebe el rechazo continuado del Presupuesto por la Universidad.",
            "El Consejo de Gobierno, por acuerdo unánime motivado en la paralización de la gestión.",
            "La Junta Electoral General de la Universidad de Sevilla, al caducar el mandato estatutario."
        ],
        "correctAnswer": 0,
        "explanation": "Según el Art. 16.2 del Decreto 98/2025, la aprobación de la iniciativa de disolución del Claustro por mayoría de dos tercios supone la disolución de éste y el cese del Rector.",
        "topicId": 17,
        "usage": "especial_competencias"
    },

    # 11 - 20: Rector/a, Vicerrectores, Secretario General, Gerente
    {
        "id": 11,
        "question": "¿A quién corresponde la máxima representación legal e institucional de la Universidad de Sevilla?",
        "options": [
            "Al Presidente del Consejo Social, por ostentar la máxima representación de la sociedad.",
            "Al Rector o Rectora, como máxima autoridad académica y de representación de la US.",
            "Al Secretario General, como fedatario público y custodio de la representación jurídica.",
            "Al Claustro Universitario en su conjunto, mediante su Mesa de Presidencia Plenaria."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 24 del Decreto 98/2025, el Rector o Rectora es la máxima autoridad académica de la Universidad y ostenta la representación de la misma.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 12,
        "question": "¿A cuál de los siguientes órganos o cargos unipersonales le corresponde la expedición de los títulos oficiales en nombre del Rey?",
        "options": [
            "Al Secretario General de la Universidad de Sevilla, previa comprobación de actas.",
            "Al Rector o Rectora de la Universidad de Sevilla, como máxima autoridad institucional.",
            "Al Decano o Director del Centro correspondiente en el que se hayan concluido los estudios.",
            "Al Gerente de la Universidad, previo pago de los derechos y tasas de expedición."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 26.1.g) del Decreto 98/2025, corresponde al Rector expedir en nombre del Rey los títulos universitarios de carácter oficial y validez en todo el territorio nacional.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 13,
        "question": "¿Quién tiene la atribución estatutaria de formular la propuesta para el nombramiento del Gerente de la Universidad de Sevilla?",
        "options": [
            "El Consejo Social, tras la correspondiente convocatoria pública de méritos y capacidad.",
            "El Rector o Rectora de la Universidad de Sevilla, de acuerdo con el Consejo Social.",
            "El Consejo de Gobierno de la Universidad, a propuesta de la representación del PTGAS.",
            "El Director General de Universidades de la Junta de Andalucía previa fiscalización."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 29.1 del Decreto 98/2025, el Gerente es propuesto y nombrado por el Rector de acuerdo con el Consejo Social.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 14,
        "question": "¿A quién encomiendan los Estatutos de la US la jefatura directa del Personal Técnico, de Gestión y de Administración y Servicios (PTGAS)?",
        "options": [
            "Al Secretario General de la Universidad, como responsable máximo de los expedientes.",
            "Al Gerente de la Universidad de Sevilla, por delegación expresa del Rectorado.",
            "Al Vicerrector competente en materia de Recursos Humanos e Infraestructuras.",
            "Al Consejo de Gobierno de la Universidad, mediante sus comisiones delegadas de personal."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 29.2.c) del Decreto 98/2025, corresponde al Gerente la dirección y jefatura del Personal Técnico, de Gestión y de Administración y Servicios por delegación del Rector.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 15,
        "question": "¿A cuál de los siguientes cargos unipersonales le corresponde la fe pública de los actos y acuerdos de los órganos colegiados de gobierno de la US?",
        "options": [
            "Al Gerente de la Universidad de Sevilla, en cuanto a sus repercusiones económicas.",
            "Al Secretario General de la Universidad de Sevilla, como custodio de actas y sello.",
            "Al Rector de la Universidad, mediante la firma y sanción de las resoluciones publicadas.",
            "Al Defensor Universitario, como garante del cumplimiento normativo instituido."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 28.1 del Decreto 98/2025, el Secretario General es el fedatario de los actos y acuerdos de los órganos generales de gobierno de la Universidad.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 16,
        "question": "¿Quién es el responsable estatutario de dirigir y garantizar la edición del Boletín Oficial de la Universidad de Sevilla (BOUS)?",
        "options": [
            "El Vicerrector con delegación en materia de Comunicación y Tecnologías de la Información.",
            "El Secretario General de la Universidad de Sevilla, dentro de sus funciones de difusión.",
            "El Gerente de la Universidad, como responsable de las publicaciones oficiales ordinarias.",
            "El Director de la Editorial Universidad de Sevilla, por delegación del Consejo de Gobierno."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 28.2.e) del Decreto 98/2025, corresponde al Secretario General dirigir el Boletín Oficial de la Universidad de Sevilla (BOUS) y garantizar su publicación.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 17,
        "question": "¿Quién ejerce la presidencia de la Junta Electoral General de la Universidad de Sevilla?",
        "options": [
            "El Rector o Rectora de la Universidad de Sevilla, salvo cuando sea candidato en activo.",
            "El Secretario General de la Universidad de Sevilla, conforme a las prescripciones de la norma.",
            "El Defensor Universitario, para garantizar la neutralidad e imparcialidad del proceso.",
            "Un Catedrático de Derecho Constitucional designado por el Consejo de Gobierno de la US."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 28.2.f) del Decreto 98/2025, corresponde al Secretario General presidir la Junta Electoral General de la Universidad de Sevilla.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 18,
        "question": "¿A qué cargo corresponde la elaboración de la propuesta del Presupuesto anual de la Universidad de Sevilla?",
        "options": [
            "Al Vicerrector con competencias asignadas en materia de Economía y Planificación.",
            "Al Gerente de la Universidad de Sevilla, encargándose de su posterior elevación.",
            "Al Presidente del Consejo Social, asistido por la Comisión de Asuntos Económicos.",
            "Al Decano o Director designado por el turno rotatorio del Consejo de Gobierno."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 29.2.a) del Decreto 98/2025, corresponde al Gerente elaborar la propuesta de presupuesto y de la programación económica plurianual.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 19,
        "question": "¿A quién le corresponde ejercer la potestad disciplinaria sobre todos los miembros de la comunidad universitaria?",
        "options": [
            "Al Consejo de Gobierno de la US, mediante la instrucción de expedientes de sanción.",
            "Al Rector o Rectora de la Universidad de Sevilla, como máxima autoridad institucional.",
            "Al Gerente en el caso exclusivo del PTGAS y al Secretario General en el del profesorado.",
            "Al Defensor Universitario, tras la investigación de las quejas o denuncias formuladas."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 26.1.e) del Decreto 98/2025, corresponde al Rector ejercer la potestad disciplinaria respecto de todos los miembros de la comunidad universitaria.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 20,
        "question": "¿Qué órgano unipersonal ostenta la competencia para nombrar y cesar libremente a los Vicerrectores de la US?",
        "options": [
            "El Consejo de Gobierno de la US, a propuesta motivada presentada por el Rector.",
            "El Rector o Rectora de la Universidad de Sevilla, ejerciendo su facultad de dirección.",
            "El Claustro Universitario, tras la comunicación formal efectuada en sesión plenaria.",
            "El Consejo Social, previa comprobación de los requisitos de titulación del candidato."
        ],
        "correctAnswer": 1,
        "explanation": "Según los Arts. 26.1.c) y 27.1 del Decreto 98/2025, corresponde al Rector nombrar y cesar a los Vicerrectores de entre el profesorado doctor de la Universidad de Sevilla.",
        "topicId": 17,
        "usage": "especial_competencias"
    },

    # 21 - 30: Centros (Junta de Centro, Decano/a, Secretario/a de Centro)
    {
        "id": 21,
        "question": "¿A qué órgano compete la aprobación del Plan de Organización Docente (POD) en el ámbito de una Facultad o Escuela?",
        "options": [
            "Al Consejo de Departamento, al articular la adscripción de grupos de asignaturas.",
            "A la Junta de Centro de la Facultad o Escuela correspondiente de la Universidad.",
            "Al Vicerrectorado de Ordenación Académica, de forma unificada para toda la US.",
            "Al Decano o Director de Escuela, tras oír a las comisiones docentes de titulación."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 32.1.a) del Decreto 98/2025, corresponde a la Junta de Centro aprobar el Plan de Organización Docente (POD) del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 22,
        "question": "¿Quién tiene la competencia estatutaria para aprobar el calendario de exámenes en una Facultad o Escuela de la US?",
        "options": [
            "Los Consejos de los Departamentos que imparten docencia obligatoria en la titulación.",
            "La Junta de Centro de la Facultad o Escuela, en coordinación con la representación estudiantil.",
            "El Vicerrector con delegación en materia de Estudiantes y Ordenación Académica.",
            "El Rector de la Universidad de Sevilla, fijándolo mediante resolución anual de curso."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 32.1.b) del Decreto 98/2025, corresponde a la Junta de Centro aprobar el calendario de exámenes y las pruebas de evaluación del rendimiento académico.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 23,
        "question": "¿A quién le corresponde autorizar y ordenar los gastos propios del presupuesto asignado a un Centro?",
        "options": [
            "Al Gerente de la Universidad de Sevilla, como ordenador único de pagos institucional.",
            "Al Decano o Decana o Director o Directora del Centro de la Facultad o Escuela.",
            "Al Secretario o Secretaria de Centro, dentro de sus funciones de administración interna.",
            "A la Comisión Económica de la Junta de Centro, en ejecución del plan trimestral."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 34.1.c) del Decreto 98/2025, corresponde al Decano o Director de Escuela autorizar y ordenar los gastos del presupuesto del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 24,
        "question": "¿Quién preside estatutariamente la Junta Electoral de un Centro de la Universidad de Sevilla?",
        "options": [
            "El Decano o Director del Centro, como máxima autoridad unipersonal instituida.",
            "El Secretario o Secretaria del Centro, asumiendo las funciones de gestión electoral.",
            "El Delegado de Estudiantes del Centro, para asegurar la imparcialidad del escrutinio.",
            "El miembro de mayor antigüedad en el escalafón del PDI Permanente de dicho Centro."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 36.2.c) del Decreto 98/2025, corresponde al Secretario o Secretaria del Centro presidir la Junta Electoral del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 25,
        "question": "¿Qué órgano tiene la competencia de proponer al Consejo de Gobierno los planes de estudios oficiales de las titulaciones asignadas a un Centro?",
        "options": [
            "El Decano o Director del Centro, tras la reunión de la comisión de elaboración.",
            "La Junta de Centro de la correspondiente Facultad o Escuela universitaria.",
            "Los Consejos de Departamentos agrupados por áreas afines de conocimiento.",
            "La Comisión de Postgrado y Doctorado de la Universidad de Sevilla."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 32.1.c) del Decreto 98/2025, corresponde a la Junta de Centro elaborar y proponer al Consejo de Gobierno los planes de estudios del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 26,
        "question": "¿Quién custodia las actas oficiales de calificación de las asignaturas cursadas por los estudiantes en un Centro?",
        "options": [
            "El Director del Departamento al que pertenece la asignatura calificada.",
            "El Secretario o Secretaria del Centro, custodiando las actas archivadas del Centro.",
            "El Administrador del Edificio o Gestor de Servicios del Centro en su archivo físico.",
            "El Secretario General de la US de forma centralizada en el Archivo Universitario."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 36.2.a) del Decreto 98/2025, corresponde al Secretario del Centro la custodia de las actas de calificación de los estudiantes del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 27,
        "question": "¿A qué órgano compete aprobar la distribución de los fondos presupuestarios asignados a una Facultad o Escuela?",
        "options": [
            "Al Decano o Director del Centro, de forma discrecional atendiendo a las necesidades.",
            "A la Junta de Centro, al estructurar el presupuesto propio asignado a la Facultad.",
            "Al Gerente de la US, como supervisor financiero de los centros de gasto.",
            "Al Consejo Social, dentro del control económico general de las facultades."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 32.1.d) del Decreto 98/2025, corresponde a la Junta de Centro aprobar la distribución de los fondos asignados al Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 28,
        "question": "¿Quién tiene la facultad de proponer al Rector el nombramiento de los Vicedecanos o Subdirectores de un Centro?",
        "options": [
            "La Junta de Centro, tras la votación realizada al efecto entre sus miembros electos.",
            "El Decano o Decana o Director o Directora del Centro, previa consulta oída la Junta.",
            "El Secretario General de la Universidad, tras constatar la habilitación estatutaria.",
            "El Consejo de Gobierno de la Universidad de Sevilla, a solicitud del propio Rector."
        ],
        "correctAnswer": 1,
        "explanation": "Según los Arts. 34.1.b) y 35.1 del Decreto 98/2025, corresponde al Decano o Director proponer al Rector el nombramiento de los Vicedecanos o Subdirectores de entre el profesorado del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 29,
        "question": "¿Quién es el órgano competente para proponer al Rector el inicio de expedientes disciplinarios a miembros del Centro?",
        "options": [
            "La Junta de Centro, aprobándolo por mayoría absoluta de los asistentes en pleno.",
            "El Decano o Decana o Director o Directora del Centro, en el ejercicio de su función.",
            "El Secretario del Centro, en su condición de encargado de la fe de los hechos observados.",
            "El Administrador del Centro, cuando las faltas afecten al personal de administración."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 34.1.f) del Decreto 98/2025, corresponde al Decano o Director de Centro proponer al Rector el inicio de expedientes disciplinarios respecto de los miembros del Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 30,
        "question": "¿Qué órgano de un Centro puede tramitar la moción de censura o revocación del Decano o Director del Centro?",
        "options": [
            "El Claustro Universitario, si la moción de censura la apoya un tercio de sus miembros.",
            "La Junta de Centro, requiriendo mayoría de dos tercios acordada a iniciativa de un tercio.",
            "El Consejo de Gobierno, previa audiencia formal acordada por la Secretaría General.",
            "El Rector de la Universidad, a solicitud de la mitad más uno del profesorado permanente."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 32.2 del Decreto 98/2025, la Junta de Centro puede revocar al Decano o Director por mayoría de dos tercios de sus miembros a propuesta de al menos un tercio de ellos.",
        "topicId": 17,
        "usage": "especial_competencias"
    },

    # 31 - 40: Departamentos (Consejo de Departamento, Director/a, Secretario/a)
    {
        "id": 31,
        "question": "¿A qué órgano corresponde aprobar las Guías Docentes de las asignaturas adscritas a un área de conocimiento?",
        "options": [
            "A la Junta de Centro de la Facultad donde se imparte mayoritariamente la asignatura.",
            "Al Consejo de Departamento al que se halle adscrita la docencia de dicha asignatura.",
            "Al Vicerrectorado de Ordenación Académica, tras la revisión efectuada por la Comisión.",
            "Al Director de Departamento, mediante resolución dictada antes del inicio del curso."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 42.1.a) del Decreto 98/2025, corresponde al Consejo de Departamento aprobar las Guías Docentes de las asignaturas a su cargo.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 32,
        "question": "¿Quién tiene la competencia estatutaria de asignar la docencia a los profesores e investigadores del Departamento?",
        "options": [
            "El Decano de la Facultad en la que se ubican los aularios de impartición de clases.",
            "El Consejo de Departamento, atendiendo a las necesidades de encargo docente.",
            "El Director de Departamento, previo acuerdo vinculante adoptado por la Gerencia.",
            "El Vicerrector de Profesorado, previa negociación con las centrales sindicales."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 42.1.b) del Decreto 98/2025, corresponde al Consejo de Departamento asignar la docencia a su profesorado e investigadores de acuerdo con el POD.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 33,
        "question": "¿Quién es el órgano responsable de autorizar y ordenar los gastos del presupuesto del Departamento?",
        "options": [
            "El Gerente de la Universidad de Sevilla, como ordenador centralizado del presupuesto.",
            "El Director o Directora de Departamento, dentro del crédito asignado en el ejercicio.",
            "El Secretario de Departamento, en calidad de custodio económico e inventariador.",
            "La Comisión Económica del Consejo de Departamento, por delegación estatutaria."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 44.1.c) del Decreto 98/2025, corresponde al Director de Departamento autorizar y ordenar los gastos del presupuesto del Departamento.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 34,
        "question": "¿A quién compete formular las necesidades de plazas de PDI y PTGAS adscritas a un Departamento?",
        "options": [
            "Al Director de Departamento por iniciativa propia enviada a la Gerencia de la US.",
            "Al Consejo de Departamento, proponiendo la dotación o modificación de las plazas.",
            "Al Consejo de Gobierno de la US, tras recabar las peticiones de los Decanatos de Centro.",
            "Al Rector de la Universidad, previa negociación en la Mesa General del Profesorado."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 42.1.c) del Decreto 98/2025, corresponde al Consejo de Departamento proponer las necesidades de plazas de PDI y del PTGAS asignado.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 35,
        "question": "¿Quién elige estatutariamente al Director o Directora de Departamento?",
        "options": [
            "La Junta de Centro de la Facultad de adscripción principal del Departamento.",
            "El Consejo de Departamento, por mayoría absoluta de sus miembros en primera votación.",
            "El Rector de la Universidad de Sevilla, de forma directa entre los catedráticos del área.",
            "El Claustro Universitario, tras la acreditación de méritos por la Comisión de Docencia."
        ],
        "correctAnswer": 1,
        "explanation": "Según los Arts. 42.1.e) y 43.2 del Decreto 98/2025, el Director de Departamento es elegido por el Consejo de Departamento por mayoría absoluta de sus miembros en primera votación.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 36,
        "question": "¿Quién ostenta la facultad de proponer al Rector el nombramiento del Secretario de un Departamento?",
        "options": [
            "El Consejo de Departamento, mediante votación en la primera sesión tras las elecciones.",
            "El Director o Directora de Departamento, de entre el profesorado adscrito al mismo.",
            "El Secretario General de la Universidad, tras comprobar la titulación del interesado.",
            "La representación del PTGAS adscrito a la Secretaría administrativa del Departamento."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 44.1.b) del Decreto 98/2025, corresponde al Director de Departamento proponer al Rector el nombramiento del Secretario de Departamento.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 37,
        "question": "¿A qué cargo corresponde la elaboración y custodia de las actas de las sesiones del Consejo de Departamento?",
        "options": [
            "Al Director de Departamento, que certifica con su firma la veracidad del contenido.",
            "Al Secretario o Secretaria de Departamento, en el ejercicio de su función fedataria.",
            "Al Secretario General de la US, como custodio superior de todas las actas docentes.",
            "Al Gerente de la Universidad, si las sesiones contienen acuerdos de alcance financiero."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 44.2 del Decreto 98/2025, el Secretario de Departamento auxilia al Director, redacta y custodia las actas de las reuniones y expide las certificaciones.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 38,
        "question": "¿Qué mayoría se exige en el Consejo de Departamento para revocar mediante moción de censura a su Director/a?",
        "options": [
            "Mayoría simple de los votos emitidos en la sesión plenaria convocada al efecto.",
            "Mayoría absoluta de los miembros del Consejo de Departamento.",
            "Mayoría de dos tercios de los asistentes a la sesión extraordinaria convocada.",
            "Mayoría de tres quintos del profesorado permanente perteneciente al Departamento."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 43.4 del Decreto 98/2025, el Consejo de Departamento puede revocar a su Director por mayoría absoluta de sus miembros.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 39,
        "question": "¿Quién tiene la potestad de fijar el orden del día de las reuniones ordinarias del Consejo de Departamento?",
        "options": [
            "El Vicerrector de Profesorado y Ordenación Académica de la Universidad.",
            "El Director o Directora de Departamento, debiendo incluir propuestas solicitadas.",
            "El Secretario de Departamento, de forma coordinada con la plantilla del PTGAS.",
            "El profesorado permanente Doctor en reunión previa preparatoria de la sesión."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 44.1.a) del Decreto 98/2025, corresponde al Director de Departamento convocar el Consejo de Departamento y fijar el orden del día.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 40,
        "question": "¿A quién corresponde la aprobación de la memoria anual de actividades docentes e investigadoras de un Departamento?",
        "options": [
            "A la Junta de Centro de la Facultad con mayor carga lectiva en dicho Departamento.",
            "Al Consejo de Departamento, tras su presentación por el equipo de dirección.",
            "Al Vicerrectorado de Investigación y Transferencia de la Universidad de Sevilla.",
            "Al Consejo Social, dentro del informe anual de rendimiento de las estructuras."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 42.1.d) del Decreto 98/2025, corresponde al Consejo de Departamento aprobar la memoria anual de docencia e investigación del Departamento.",
        "topicId": 17,
        "usage": "especial_competencias"
    },

    # 41 - 50: Institutos, Defensor Universitario, CADUS y Consejos Especiales
    {
        "id": 41,
        "question": "¿Quién preside el Consejo de Dirección de la Universidad de Sevilla?",
        "options": [
            "El Gerente de la Universidad, al coordinar los recursos financieros institucionales.",
            "El Rector o Rectora de la Universidad de Sevilla, como responsable del equipo de gobierno.",
            "El Presidente del Consejo Social, garantizando el enlace con la sociedad exterior.",
            "El Secretario General, en su función de coordinador administrativo del gabinete."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 27.4 del Decreto 98/2025, el Consejo de Dirección es presidido por el Rector y está integrado por los Vicerrectores, el Secretario General y el Gerente.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 42,
        "question": "¿A qué órgano compete de forma exclusiva velar por el respeto de los derechos de toda la comunidad universitaria?",
        "options": [
            "A la Comisión de Inspección de Servicios de la Universidad de Sevilla.",
            "Al Defensor o Defensora Universitario/a, como órgano comisionado independiente.",
            "Al Consejo Social, en el ámbito de sus relaciones con la sociedad civil.",
            "A la Junta Electoral General de la US, mediante la fiscalización del proceso."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 80.1 del Decreto 98/2025, el Defensor Universitario tiene como función velar por el respeto a los derechos y libertades de todos los miembros de la comunidad universitaria.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 43,
        "question": "¿A quién debe presentar el Defensor Universitario su informe anual de actividades y recomendaciones?",
        "options": [
            "Al Consejo Social de la Universidad de Sevilla para su evaluación contable.",
            "Al Claustro Universitario, en sesión ordinaria convocada formalmente.",
            "Al Rector de la Universidad de Sevilla para su traslado al Consejo de Gobierno.",
            "Al Consejero de Universidad e Investigación de la Junta de Andalucía."
        ],
        "correctAnswer": 1,
        "explanation": "Según los Arts. 16.1.c) y 85 del Decreto 98/2025, el Defensor Universitario presenta un informe anual ante el Claustro Universitario.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 44,
        "question": "¿A qué órgano corresponde la aprobación final del Reglamento del Consejo de Alumnos de la Universidad de Sevilla (CADUS)?",
        "options": [
            "Al propio CADUS en votación plenaria, sin requerir trámite ulterior de ratificación.",
            "Al Consejo de Gobierno de la Universidad de Sevilla, para su ratificación y eficacia.",
            "Al Claustro Universitario, como norma suprema de representación estudiantil.",
            "Al Vicerrector con delegación en materia de Estudiantes y Vida Universitaria."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 21.2 del Decreto 98/2025, el Reglamento del CADUS es elaborado por éste y debe ser ratificado por el Consejo de Gobierno.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 45,
        "question": "¿Quién asume la representación y gestión ordinaria de la Escuela Internacional de Doctorado (EIDUS)?",
        "options": [
            "El Vicerrector de Investigación y Transferencia de forma originaria e indelegable.",
            "El Director o Directora de la EIDUS, nombrado/a por el Rector.",
            "El Decano de la Facultad de Geografía e Historia en calidad de centro sede.",
            "El Comité de Dirección del Posgrado, integrado por los coordinadores del Máster."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 37 del Decreto 98/2025, la EIDUS está dirigida por un Director o Directora nombrado por el Rector de entre investigadores de reconocido prestigio.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 46,
        "question": "¿Quién expide las certificaciones oficiales relativas a los estudios de Doctorado tramitados en la EIDUS?",
        "options": [
            "El Secretario General de la Universidad de Sevilla de forma centralizada.",
            "El Titular de la Secretaría de la EIDUS, custodio de las actas correspondientes.",
            "El Gerente de la Universidad, tras el abono de los precios públicos aplicables.",
            "El Coordinador del Programa de Doctorado en el que esté inscrito el doctorando."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 37.3 del Decreto 98/2025, corresponde al titular de la Secretaría de la EIDUS la custodia de actas y expedición de certificaciones de su ámbito.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 47,
        "question": "¿A qué estructura corresponde la coordinación de las enseñanzas de másteres universitarios y títulos propios de la US?",
        "options": [
            "A la Comisión Docente de las Facultades implicadas en cada especialidad.",
            "A la Escuela Internacional de Posgrado (EIP) de la Universidad de Sevilla.",
            "Al Consejo de Departamento al que pertenezca la materia principal del máster.",
            "Al Consejo Social, en ejercicio de la fiscalización de las enseñanzas impartidas."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 39 del Decreto 98/2025, la Escuela Internacional de Posgrado (EIP) coordina e impulsa los másteres oficiales y títulos propios de la US.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 48,
        "question": "¿A qué órgano compete aprobar la creación de la Comisión de Inspección de Servicios de la US y su reglamento?",
        "options": [
            "Al Claustro Universitario, al tratarse de un órgano de control institucional.",
            "Al Consejo de Gobierno de la Universidad de Sevilla.",
            "Al Rector de la Universidad, de forma directa por orden de servicio publicada.",
            "Al Defensor Universitario, como instrumento para la tramitación de quejas."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 18.1.n) del Decreto 98/2025, corresponde al Consejo de Gobierno aprobar la creación y reglamento de la Inspección de Servicios.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 49,
        "question": "¿Quién tiene encomendada la función de presidir las comisiones delegadas del Consejo de Gobierno salvo delegación?",
        "options": [
            "El Secretario General de la Universidad de Sevilla.",
            "El Rector o Rectora de la Universidad de Sevilla.",
            "El Gerente de la Universidad en las comisiones de índole económica.",
            "El Decano con mayor antigüedad que pertenezca a la comisión delegada."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 18.3 del Decreto 98/2025, el Rector preside las comisiones delegadas del Consejo de Gobierno salvo delegación expresa.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 50,
        "question": "¿Qué órgano tiene atribución para autorizar las operaciones financieras de crédito que concierte la Universidad?",
        "options": [
            "El Consejo de Gobierno de la US a propuesta del Equipo Rectoral.",
            "El Consejo Social, dentro de sus potestades de fiscalización presupuestaria.",
            "El Gerente de la Universidad, dentro del límite legal establecido por Hacienda.",
            "El Ministerio de Economía y Hacienda previo informe del Rectorado."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 20.1.e) del Decreto 98/2025, corresponde al Consejo Social autorizar las operaciones de crédito y endeudamiento de la Universidad.",
        "topicId": 17,
        "usage": "especial_competencias"
    },

    # 51 - 60: Mandatos, Ponderaciones y Título III (Art. 90)
    {
        "id": 51,
        "question": "¿Cuál es la duración del mandato estatutario del Rector o Rectora de la Universidad de Sevilla?",
        "options": [
            "Cuatro años, pudiendo ser reelegido/a consecutivamente por una sola vez.",
            "Seis años, de carácter improrrogable y no renovable (mandato único).",
            "Cinco años renovables por un periodo de igual duración previo acuerdo.",
            "Cuatro años prorrogables automáticamente hasta la convocatoria de elecciones."
        ],
        "correctAnswer": 1,
        "explanation": "Según los Arts. 24.2 y 25.1 del Decreto 98/2025, el mandato del Rector es de seis años improrrogables y no renovables.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 52,
        "question": "¿Cuál es la duración del mandato del Gerente de la Universidad de Sevilla según sus Estatutos?",
        "options": [
            "Cuatro años no renovables, coincidente con la legislatura de los decanatos.",
            "Seis años, pudiendo ser renovado por periodos de igual duración.",
            "Indefinida, cesando únicamente por renuncia expresa o revocación motivada.",
            "Seis años de carácter improrrogable y sin posibilidad de reelección."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 29.1 del Decreto 98/2025, el Gerente tiene un mandato de seis años renovables por periodos iguales.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 53,
        "question": "¿Por qué periodo de tiempo es elegido el Defensor Universitario y cuál es su régimen de reelección?",
        "options": [
            "Por seis años improrrogables sin posibilidad de reelección posterior.",
            "Por cuatro años, no siendo reelegible consecutivamente.",
            "Por cinco años, pudiendo renovar por un segundo periodo consecutivo.",
            "Por tres años renovables de forma ilimitada por acuerdo del Claustro."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 81.2 del Decreto 98/2025, el Defensor Universitario es elegido por un periodo de cuatro años y no puede ser reelegido consecutivamente.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 54,
        "question": "¿Cuál es el porcentaje de ponderación atribuido al profesorado permanente doctor (Sector A) en las elecciones a Rector?",
        "options": [
            "El 51 por ciento del total del voto ponderado de la comunidad.",
            "El 53 por ciento del total del voto ponderado de la comunidad.",
            "El 55 por ciento del total del voto ponderado de la comunidad.",
            "El 60 por ciento del total del voto ponderado de la comunidad."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 25.3.a) del Decreto 98/2025, el voto del profesorado permanente doctor del Sector A pondera el 53% del total.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 55,
        "question": "¿Cuál es el porcentaje de ponderación atribuido al estudiantado en las elecciones al Rectorado de la US?",
        "options": [
            "El 25 por ciento del total de votos ponderados.",
            "El 30 por ciento del total de votos ponderados.",
            "El 33 por ciento del total de votos ponderados.",
            "El 35 por ciento del total de votos ponderados."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 25.3.c) del Decreto 98/2025, el voto de los estudiantes pondera el 30% del total en las elecciones a Rector.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 56,
        "question": "¿Cuál es el porcentaje de representación asignado al PTGAS en la composición del Claustro Universitario?",
        "options": [
            "El 10 por ciento del total de claustrales electos.",
            "El 11 por ciento del total de claustrales electos (33 miembros).",
            "El 12 por ciento del total de claustrales electos.",
            "El 15 por ciento del total de claustrales electos."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 15.2.d) del Decreto 98/2025, al PTGAS le corresponde el 11% de los claustrales electos (33 representantes).",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 57,
        "question": "¿Cuál es el porcentaje mínimo obligatorio reservado al PDI Permanente en la Junta de Centro de una Facultad o Escuela?",
        "options": [
            "El 51 por ciento de la composición total de la Junta.",
            "El 52 por ciento de la composición total de la Junta.",
            "El 53 por ciento de la composición total de la Junta.",
            "El 55 por ciento de la composición total de la Junta."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 31.2.a) del Decreto 98/2025, a la representación del PDI con vinculación permanente le corresponde el 52% de los miembros de la Junta de Centro.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 58,
        "question": "¿Cuál de los siguientes sectores NO forma parte explícita de la comunidad universitaria según el Artículo 90.1 del Decreto 98/2025?",
        "options": [
            "El personal investigador adscrito a proyectos o programas.",
            "El personal técnico, de gestión y de administración y servicios (PTGAS).",
            "Los miembros del Consejo Social representantes de la sociedad civil.",
            "El estudiantado matriculado en cualquiera de los ciclos oficiales."
        ],
        "correctAnswer": 2,
        "explanation": "Según el Art. 90.1 del Decreto 98/2025, la comunidad universitaria está integrada por PDI, personal investigador, estudiantado y PTGAS. Los vocales del Consejo Social externos no son miembros de la comunidad universitaria estatutaria.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 59,
        "question": "¿Cuántas causales específicas de prohibición de discriminación establece taxativamente el Artículo 90.2.e de los Estatutos de la US?",
        "options": [
            "Diez causales genéricas orientadas a la igualdad salarial y de trato.",
            "Quince causales tasadas expresamente en la redacción del texto estatutario.",
            "Doce causales concordantes con la Ley Orgánica del Sistema Universitario.",
            "Ocho causales vinculadas exclusivamente a la condición biológica o de género."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 90.2.e) del Decreto 98/2025, se prohíbe taxativamente la discriminación basándose en una lista tasada de exactamente 15 causales.",
        "topicId": 17,
        "usage": "especial_competencias"
    },
    {
        "id": 60,
        "question": "De acuerdo con el Artículo 90.3.d) de los Estatutos, ¿cuál de los siguientes es un deber fundamental de los miembros de la comunidad de la US?",
        "options": [
            "Financiar las actividades culturales organizadas por las delegaciones de estudiantes.",
            "Potenciar el prestigio de la Universidad de Sevilla y su vinculación con la sociedad.",
            "Participar con carácter obligatorio en las comisiones electorales de los departamentos.",
            "Superar la evaluación continua anual como requisito de adscripción al Centro."
        ],
        "correctAnswer": 1,
        "explanation": "Según el Art. 90.3.d) del Decreto 98/2025, es deber fundamental de los miembros de la comunidad universitaria potenciar el prestigio de la Universidad de Sevilla y su vinculación con la sociedad.",
        "topicId": 17,
        "usage": "especial_competencias"
    }
]

out_dir = os.path.join('src', 'data', 'baterias')
os.makedirs(out_dir, exist_ok=True)
json_path = os.path.join(out_dir, 'competencias_organos_60.json')

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Bateria de 60 preguntas generada con exito en {json_path}")

# Integrar tambien en quizzes.json bajo el tema 17
quizzes_path = os.path.join('src', 'data', 'quizzes.json')
if os.path.exists(quizzes_path):
    with open(quizzes_path, 'r', encoding='utf-8') as f:
        quizzes = json.load(f)
    
    existing_t17 = quizzes.get("17", [])
    # Filter out any existing especial_competencias
    clean_t17 = [q for q in existing_t17 if q.get("usage") != "especial_competencias"]
    clean_t17.extend(questions)
    quizzes["17"] = clean_t17

    with open(quizzes_path, 'w', encoding='utf-8') as f:
        json.dump(quizzes, f, ensure_ascii=False, indent=2)
    print("60 preguntas integradas en quizzes.json bajo el Tema 17")
