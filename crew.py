from crewai import Crew, Process
from agents import redacteur, correcteur, formateur
from tasks import create_tasks

def run_newsletter_crew(title, nb_paragraphs, style, language, subject):
    
    # Créer les tâches
    tasks = create_tasks(title, nb_paragraphs, style, language, subject)
    
    # Créer l'équipe d'agents
    crew = Crew(
        agents=[redacteur, correcteur, formateur],
        tasks=tasks,
        process=Process.sequential,  # Les agents travaillent l'un après l'autre
        verbose=True
    )
    
    # Lancer le travail
    result = crew.kickoff()
    return str(result)