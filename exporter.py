from fpdf import FPDF
import base64, urllib.parse

# ── Fonction 6a : Export PDF ─────────────────────────────────────
def export_to_pdf(title: str, content: str) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.multi_cell(0, 10, title)
    pdf.set_font("Arial", size=11)
    pdf.ln(5)
    pdf.multi_cell(0, 8, content)
    return pdf.output(dest="S").encode("latin-1")

# ── Fonction 6b : Liens de partage ──────────────────────────────
def get_share_links(title: str, url: str = "https://monsite.com") -> dict:
    encoded_title = urllib.parse.quote(title)
    encoded_url   = urllib.parse.quote(url)
    return {
        "linkedin":  f"https://www.linkedin.com/sharing/share-offsite/?url={encoded_url}",
        "facebook":  f"https://www.facebook.com/sharer/sharer.php?u={encoded_url}",
        "twitter":   f"https://twitter.com/intent/tweet?text={encoded_title}&url={encoded_url}",
        "whatsapp":  f"https://wa.me/?text={encoded_title}%20{encoded_url}",
    }
