import json

filepath = "src/data/quizzes.json"

with open(filepath, "r", encoding="utf-8-sig") as f:
    data = json.load(f)

current_qs = data.get("6", [])
print(f"Total existing questions in quizzes.json for Tema 6: {len(current_qs)}")

# Let's add 5 high-quality questions specialized in CDU notation order, symbols, and fund control
new_questions = [
    {
        "id": "cdu_q_new_1",
        "question": "¿Cuál de las siguientes secuencias representa el orden correcto de colocación correlativa en estantería para notaciones con la misma materia base (ej. 32)?",
        "options": [
          "32(460) → 32 → 32:37 → 32/34",
          "32/34 → 32 → 32:37 → 32(091) → 32(460) → 32\"19\"",
          "32 → 32/34 → 32(460) → 32:37",
          "32:37 → 32/34 → 32 → 32(460)"
        ],
        "correctAnswer": 1,
        "explanation": "La respuesta correcta es la opción B: 32/34 → 32 → 32:37 → 32(091) → 32(460) → 32\"19\". Según las pautas oficiales de AENOR y de la BUS, el signo de extensión (/) precede al número simple, el número simple precede a la relación simple (:), y los auxiliares de Forma (0...) anteceden a los de Lugar (1/9) y Tiempo (\"...\")."
    },
    {
        "id": "cdu_q_new_2",
        "question": "¿Qué función cumple el signo de dos puntos dobles `::` en la Clasificación Decimal Universal?",
        "options": [
          "Indica una extensión consecutiva de materias",
          "Establece una relación fija e irreversible que condiciona el orden de ordenación en el tejuelo",
          "Une dos materias independientes de forma reversible",
          "Introduce una notación ajena a las tablas de la CDU"
        ],
        "correctAnswer": 1,
        "explanation": "La respuesta correcta es la opción B. El signo :: establece una relación fija e irreversible entre dos notaciones principales, fijando la prioridad del tejuelo para evitar la inversión de la entrada."
    },
    {
        "id": "cdu_q_new_3",
        "question": "¿A qué subclase de la CDU corresponde la materia de Dibujo, Diseño y Artes Aplicadas?",
        "options": [
          "Subclase 73",
          "Subclase 74",
          "Subclase 75",
          "Subclase 77"
        ],
        "correctAnswer": 1,
        "explanation": "La respuesta correcta es la opción B: Subclase 74. En la Clase 7 (Arte), la subclase 73 es Escultura, la 74 es Dibujo y Diseño, la 75 es Pintura y la 77 es Fotografía."
    },
    {
        "id": "cdu_q_new_4",
        "question": "¿Cuál es la capacidad máxima de llenado recomendable para las baldas en las salas de libre acceso de la BUS?",
        "options": [
          "100% para aprovechar al máximo el espacio físico",
          "50% dejando la mitad vacía obligatoriamente",
          "75% - 80% de su capacidad lineal física",
          "90% - 95% para evitar la caída de libros"
        ],
        "correctAnswer": 2,
        "explanation": "La respuesta correcta es la opción C: 75% - 80%. Dejar entre un 20% y 25% de margen libre en cada balda previene el apiñamiento, evita el deterioro de los libros al extraerlos y permite intercalar adquisiciones sin reordenar."
    },
    {
        "id": "cdu_q_new_5",
        "question": "¿Cómo se alfabetizan los títulos de publicaciones periódicas que comienzan por artículos iniciales (ej. 'The AAPS Journal' o 'El espacio')?",
        "options": [
          "Se ordenan obligatoriamente por la primera letra del artículo (T o E)",
          "Los artículos iniciales en cualquier idioma se ignoran y se alfabetiza por la primera palabra significativa",
          "Se trasladan al final del título entre paréntesis",
          "Se ordenan siempre después de todos los títulos que no llevan artículo"
        ],
        "correctAnswer": 1,
        "explanation": "La respuesta correcta es la opción B. Al alfabetizar títulos de revistas se ignoran completamente los artículos definidos e indefinidos iniciales en cualquier idioma (El, La, The, A, Le)."
    }
]

existing_ids = {q.get("id") for q in current_qs}
added_count = 0
for q in new_questions:
    if q["id"] not in existing_ids:
        current_qs.append(q)
        added_count += 1

data["6"] = current_qs

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {added_count} new specialized CDU questions to Tema 6. Total questions now: {len(current_qs)}")
