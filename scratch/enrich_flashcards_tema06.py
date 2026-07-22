import json

filepath = "src/data/flashcards.json"

with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

current_cards = data.get("6", [])
existing_ids = {c["id"] for c in current_cards}

new_cards = [
    {
        "id": 26,
        "front": "¿Cómo diferenciar en CDU los paréntesis de Forma `(0...)`, Lugar `(1/9)`, Raza `(=...)` y Tiempo `(\"...\")`?",
        "back": "`(0...)` inicia en 0 (Forma); `(1/9)` inicia en 1-9 (Lugar); `(=...)` tiene signo igual (Raza); y `(\"...\")` lleva comillas (Tiempo)."
    },
    {
        "id": 27,
        "front": "¿Qué va antes en la estantería según el orden AENOR/BUS: `53(035)` o `53(460)`?",
        "back": "Va antes `53(035)` (Forma del documento antecede a Lugar geográfico)."
    },
    {
        "id": 28,
        "front": "¿Qué va antes en la estantería: el número simple `53` o la relación simple `53:62`?",
        "back": "Va antes el número simple `53`. La relación simple con dos puntos `:` va siempre después del número base."
    },
    {
        "id": 29,
        "front": "¿Qué función cumple el signo `::` (dos puntos dobles) en la CDU?",
        "back": "Establece una relación fija e irreversible entre dos materias que determina de forma estricta el orden de colocación en el tejuelo."
    },
    {
        "id": 30,
        "front": "¿Qué tipo de auxiliar representa el símbolo `(=...)` en la CDU?",
        "back": "Auxiliar común independiente de Raza, Etnia y Nacionalidad (ej. `(=134.2)` para españoles)."
    },
    {
        "id": 31,
        "front": "¿Qué tipo de auxiliar representa el signo `-0...` en la CDU?",
        "back": "Auxiliar común dependiente de Propiedades, Materiales o Personas (ej. `-05` para personas o colectivos específicos)."
    },
    {
        "id": 32,
        "front": "¿Cuáles son los 3 tipos de auxiliares especiales (analíticos) en la CDU?",
        "back": "1. Auxiliares de guion (`-1/-9`). 2. Auxiliares de punto cero (`.01/.09`). 3. Auxiliares de apóstrofo (`'1/'9`)."
    },
    {
        "id": 33,
        "front": "¿Qué signo se utiliza en la CDU para introducir códigos o notaciones ajenas?",
        "back": "El asterisco `*` (ej. `523.4*MARTE` para codificar el planeta Marte)."
    },
    {
        "id": 34,
        "front": "¿A qué materia exacta corresponde la Subclase `74` de la CDU?",
        "back": "A Dibujo, Diseño, Artes aplicadas y oficios (dentro de la Clase 7: Arte)."
    },
    {
        "id": 35,
        "front": "¿Cuál es la densidad/capacidad de llenado recomendada para baldas en libre acceso?",
        "back": "Como máximo del 75% al 80% de su capacidad lineal física (para evitar apiñamiento y permitir novedades sin reordenar)."
    },
    {
        "id": 36,
        "front": "¿Cómo deben conservarse en estantería los volúmenes de gran peso o formato inusual (infolios, atlas)?",
        "back": "Siempre en posición horizontal para evitar que la gravedad deforme la encuadernación y desgarre las hojas."
    },
    {
        "id": 37,
        "front": "¿En qué consiste el recuento topográfico en la BUS?",
        "back": "En la comprobación física de los libros de las estanterías frente al catálogo topográfico/FAMA para detectar pérdidas o desorden."
    },
    {
        "id": 38,
        "front": "¿Qué significan las siglas del modelo MUSTIE para el expurgo bibliotecario?",
        "back": "Misleading (obsoleto), Ugly (deteriorado), Superseded (sustituido), Trivial, Irrelevant y Elsewhere (disponible en otro centro/PI)."
    },
    {
        "id": 39,
        "front": "¿Cómo se alfabetizan los títulos de revistas que comienzan por artículo definidos/indefinidos?",
        "back": "Se ignoran por completo los artículos iniciales (*El, La, Los, The, A, Le*) y se ordena por la primera palabra significativa."
    },
    {
        "id": 40,
        "front": "¿Dónde se colocan los títulos de revistas o libros que comienzan por dígitos numéricos?",
        "back": "Siempre en primer lugar, antecediendo a la letra A en la secuencia alfabética (ej. `365 grados` va antes que `The AAPS Journal`)."
    }
]

for card in new_cards:
    if card["id"] not in existing_ids:
        current_cards.append(card)

data["6"] = current_cards

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Flashcards for Tema 6 successfully updated to {len(current_cards)} cards!")
