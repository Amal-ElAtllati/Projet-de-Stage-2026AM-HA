from pydantic import BaseModel
from enum import Enum
from typing import Optional

class ContentType(str, Enum):
    article = "article"
    newsletter = "newsletter"
    blog = "blog"

class Language(str, Enum):
    french = "fr"
    english = "en"
    arabic = "ar"

class Subject(str, Enum):
    sport = "sport"
    education = "education"
    actualite = "actualite"

class NewsletterForm(BaseModel):
    title: str
    nb_paragraphs: int = 3
    style: str = "professionnel"
    date: Optional[str] = None
    contact: Optional[str] = None
    author_name: Optional[str] = None
    content_type: ContentType = ContentType.newsletter
    language: Language = Language.french
    subject: Subject = Subject.actualite
    template_id: Optional[int] = None

class EmailRequest(BaseModel):
    to_email: str
    form: NewsletterForm