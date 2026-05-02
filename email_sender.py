import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv
load_dotenv()

GMAIL = "gmail"        # ton vrai email Gmail
PASSWORD = "gmail_password"     # mot de passe d'application 16 caractères

def send_newsletter_email(to_email: str, subject: str, html_content: str) -> dict:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = GMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL, PASSWORD)
            server.sendmail(GMAIL, to_email, msg.as_string())

        return {"success": True, "message": f"Email envoyé à {to_email}"}
    except Exception as e:
        return {"success": False, "error": str(e)}