from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from models import NewsletterForm, ContentType, Language, Subject, EmailRequest
from generator import generate_newsletter
from templates import suggest_templates, get_template_by_id
from exporter import export_to_pdf, get_share_links
import urllib.parse
from database import get_db, Newsletter
from security import verify_api_key
from email_sender import send_newsletter_email

app = FastAPI(title="Newsletter Generator API")

# ── Endpoints publics (sans clé) ─────────────────────────────────
@app.get("/types")
def detect_type():
    return {"types": [t.value for t in ContentType]}

@app.get("/languages")
def get_languages():
    return {"languages": [l.value for l in Language]}

@app.get("/subjects")
def get_subjects():
    return {"subjects": [s.value for s in Subject]}

@app.get("/templates")
def list_templates():
    return suggest_templates()

# ── Endpoints protégés (avec clé API) ───────────────────────────
@app.post("/generate")
def generate(
    form: NewsletterForm,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    content = generate_newsletter(form)
    newsletter = Newsletter(
        title=form.title,
        subject=form.subject.value,
        language=form.language.value,
        style=form.style,
        content=content
    )
    db.add(newsletter)
    db.commit()
    db.refresh(newsletter)
    return {
        "id": newsletter.id,
        "title": form.title,
        "content": content,
        "language": form.language,
        "created_at": newsletter.created_at
    }

@app.get("/history")
def get_history(
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    newsletters = db.query(Newsletter).order_by(Newsletter.created_at.desc()).all()
    return {"newsletters": [
        {
            "id": n.id,
            "title": n.title,
            "subject": n.subject,
            "language": n.language,
            "created_at": n.created_at
        } for n in newsletters
    ]}

@app.get("/history/{newsletter_id}")
def get_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter non trouvée")
    return newsletter

@app.delete("/history/{newsletter_id}")
def delete_newsletter(
    newsletter_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter non trouvée")
    db.delete(newsletter)
    db.commit()
    return {"message": f"Newsletter {newsletter_id} supprimée"}

@app.post("/export/pdf")
def export_pdf(
    form: NewsletterForm,
    api_key: str = Depends(verify_api_key)
):
    content = generate_newsletter(form)
    pdf_bytes = export_to_pdf(form.title, content)
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename={form.title}.pdf"})

@app.post("/share")
def share_links(
    form: NewsletterForm,
    api_key: str = Depends(verify_api_key)
):
    content = generate_newsletter(form)
    encoded_title = urllib.parse.quote(form.title)
    encoded_content = urllib.parse.quote(content[:200])
    links = {
        "whatsapp": f"https://wa.me/?text={encoded_title}%0A{encoded_content}",
        "twitter": f"https://twitter.com/intent/tweet?text={encoded_title}%0A{encoded_content}",
        "linkedin": f"https://www.linkedin.com/sharing/share-offsite/?url=https://monsite.com",
        "facebook": f"https://www.facebook.com/sharer/sharer.php?u=https://monsite.com",
    }
    return {"title": form.title, "content": content, "share_links": links}

@app.post("/send-email")
def send_email(
    request: EmailRequest,
    api_key: str = Depends(verify_api_key)
):
    # 1. Générer la newsletter
    content = generate_newsletter(request.form)
    
    # 2. Envoyer par email
    result = send_newsletter_email(
        to_email=request.to_email,
        subject=request.form.title,
        html_content=content
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {
        "message": f"Newsletter envoyée à {request.to_email}",
        "title": request.form.title
    }