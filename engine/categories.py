"""Agronomic categories for farmer-friendly previous harvest selection."""

from typing import Any

CROP_CATEGORIES: dict[str, dict[str, Any]] = {
    "hortalizas": {
        "category_id": "hortalizas",
        "name_es": "Hortalizas",
        "name_qu": "Yuyukuna",
        "examples_es": "Cebolla, Zanahoria, Lechuga, Tomate",
        "description_es": "Hortalizas de hoja, bulbo y fruto. Consumo equilibrado y susceptibilidad a patógenos de suelo.",
        "botanical_families": ["Alliaceae", "Brassicaceae", "Apiaceae", "Solanaceae"],
        "fallback_crop_id": "haba",
    },
    "tuberculos": {
        "category_id": "tuberculos",
        "name_es": "Tubérculos",
        "name_qu": "Allpa p'ukukuna",
        "examples_es": "Papa, Oca, Papalisa, Camote",
        "description_es": "Tubérculos andinos y de valle. Extracción alta de potasio y fósforo, suelo pulverizado al cosechar.",
        "botanical_families": ["Solanaceae", "Oxalidaceae", "Basellaceae"],
        "fallback_crop_id": "papa_huaycha",
    },
    "cereales": {
        "category_id": "cereales",
        "name_es": "Cereales y Granos",
        "name_qu": "Sara, Siwara, Trigo",
        "examples_es": "Maíz, Cebada, Trigo, Avena, Quinua",
        "description_es": "Gramíneas y pseudocereales de valle y puna. Demanda intensiva de nitrógeno y rastrojo fibroso.",
        "botanical_families": ["Poaceae", "Amaranthaceae"],
        "fallback_crop_id": "maiz_valle",
    },
    "frutales": {
        "category_id": "frutales",
        "name_es": "Frutales",
        "name_qu": "Rurukuna",
        "examples_es": "Durazno, Manzana, Frutilla, Vid",
        "description_es": "Frutales de valle y huertos familiares. Exigen rotación con coberturas vivas o leguminosas de descanso.",
        "botanical_families": ["Rosaceae", "Vitaceae"],
        "fallback_crop_id": "alfalfa",
    },
}


def get_crop_categories_list() -> list[dict[str, Any]]:
    """Return the 4 canonical agronomic categories."""
    return list(CROP_CATEGORIES.values())


def get_category_botanical_families(
    category_or_crop_id: str, crops_map: dict[str, Any] | None = None
) -> set[str]:
    """Resolve botanical families for either a category or an individual crop ID."""
    cat = CROP_CATEGORIES.get(category_or_crop_id)
    if cat:
        return set(cat.get("botanical_families", []))
    if crops_map and category_or_crop_id in crops_map:
        fam = crops_map[category_or_crop_id].get("botanical_family")
        return {fam} if fam else set()
    return set()
