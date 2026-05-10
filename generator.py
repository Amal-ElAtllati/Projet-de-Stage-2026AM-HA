from groq import Groq
from models import NewsletterForm

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_newsletter(form: NewsletterForm) -> str:

    # ── Agent 1 : Rédacteur ─────────────────────────────────────
    print("🖊️  Agent Rédacteur en cours...")
    redaction = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"""
            Rédige une newsletter professionnelle.
            Titre: {form.title}
            Sujet: {form.subject.value}
            Paragraphes: {form.nb_paragraphs}
            Style: {form.style}
            Langue: {form.language.value}
        """}],
        max_tokens=2000
    ).choices[0].message.content
    print("✅ Agent Rédacteur terminé !")

    # ── Agent 2 : Correcteur ────────────────────────────────────
    print("🔍 Agent Correcteur en cours...")
    correction = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"""
            Corrige et améliore cette newsletter (grammaire, style, cohérence).
            Retourne uniquement le texte corrigé:
            {redaction}
        """}],
        max_tokens=2000
    ).choices[0].message.content
    print("✅ Agent Correcteur terminé !")
    # ── Agent 3 : Formateur HTML ────────────────────────────────
    print("🎨 Agent Formateur HTML en cours...")
    html = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"""
            Transforme cette newsletter en HTML professionnel avec CSS inline.
            Inclure: header coloré, paragraphes stylés, bouton call-to-action, footer.
            Retourne UNIQUEMENT le code HTML, rien d'autre:
            {correction}
        """}],
        max_tokens=3000
    ).choices[0].message.content
    
    return html
