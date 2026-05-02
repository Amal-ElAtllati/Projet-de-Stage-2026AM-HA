from typing import List, Dict

TEMPLATES: List[Dict] = [
    {"id": 1, "name": "Minimaliste",  "description": "Design épuré, texte centré, couleurs neutres"},
    {"id": 2, "name": "Corporate",   "description": "Style professionnel avec header coloré et logo"},
    {"id": 3, "name": "Magazine",    "description": "Multi-colonnes, images larges, typographie bold"},
    {"id": 4, "name": "Breaking News","description": "Style journal, titre en gros, colonnes étroites"},
]

# ── Fonction 5 : Proposer templates ─────────────────────────────
def suggest_templates(subject: str = None) -> List[Dict]:
    """Retourne tous les templates ou filtrés par sujet"""
    return TEMPLATES

def get_template_by_id(template_id: int) -> Dict:
    for t in TEMPLATES:
        if t["id"] == template_id:
            return t
    raise ValueError(f"Template {template_id} introuvable")