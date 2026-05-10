from crewai import Agent, LLM

# ── LLM natif CrewAI ────────────────────────────────────────────
llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7
)

# ── Agent 1 : Rédacteur ─────────────────────────────────────────
redacteur = Agent(
    role="Rédacteur Professionnel",
    goal="Rédiger une newsletter complète, engageante et bien structurée",
    backstory="Tu es un rédacteur expert avec 10 ans d'expérience dans la création de contenu éditorial de qualité professionnelle.",
    llm=llm,
    verbose=True
)

# ── Agent 2 : Correcteur ────────────────────────────────────────
correcteur = Agent(
    role="Correcteur Éditorial",
    goal="Vérifier la qualité, la cohérence et corriger les erreurs du contenu",
    backstory="Tu es un correcteur rigoureux qui vérifie la grammaire, le style et la cohérence de tout contenu.",
    llm=llm,
    verbose=True
)

# ── Agent 3 : Formateur HTML ────────────────────────────────────
formateur = Agent(
    role="Formateur HTML",
    goal="Mettre en forme le contenu en HTML professionnel et beau",
    backstory="Tu es un expert en design email et HTML. Tu transformes du texte brut en newsletters HTML visuellement attractives.",
    llm=llm,
    verbose=True
)
