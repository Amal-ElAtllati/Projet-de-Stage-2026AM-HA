from crewai import Task
from agents import redacteur, correcteur, formateur

def create_tasks(title, nb_paragraphs, style, language, subject):

    # ── Tâche 1 : Rédaction ─────────────────────────────────────
    tache_redaction = Task(
        description=f"""
        Rédige une newsletter complète sur le sujet : {subject}
        - Titre : {title}
        - Nombre de paragraphes : {nb_paragraphs}
        - Style : {style}
        - Langue : {language}
        
        Structure :
        1. Accroche forte
        2. {nb_paragraphs} paragraphes développés
        3. Appel à l'action
        4. Pied de page
        """,
        agent=redacteur,
        expected_output="Newsletter complète en texte brut"
    )

    # ── Tâche 2 : Correction ────────────────────────────────────
    tache_correction = Task(
        description="""
        Prends la newsletter rédigée et :
        1. Corrige toutes les fautes de grammaire et orthographe
        2. Améliore le style si nécessaire
        3. Vérifie la cohérence du contenu
        4. Assure-toi que le ton est professionnel
        Retourne le texte corrigé et amélioré.
        """,
        agent=correcteur,
        expected_output="Newsletter corrigée et améliorée"
    )

    # ── Tâche 3 : Mise en forme HTML ────────────────────────────
    tache_formatage = Task(
        description=f"""
        Transforme la newsletter corrigée en HTML professionnel :
        - Header avec titre : {title}
        - Couleurs adaptées au sujet : {subject}
        - Boutons call-to-action stylés
        - Footer avec liens de réseaux sociaux
        - Design responsive (mobile-friendly)
        - Style inline CSS (compatible email)
        Retourne uniquement le code HTML complet.
        """,
        agent=formateur,
        expected_output="Code HTML complet de la newsletter"
    )

    return [tache_redaction, tache_correction, tache_formatage]