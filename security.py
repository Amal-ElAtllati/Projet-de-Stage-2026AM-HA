from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from passlib.context import CryptContext

# ── Clé API attendue ─────────────────────────────────────────────
API_KEY = API_KEY = os.getenv("API_KEY")  # Change cette valeur !

# ── Définir où chercher la clé (dans le header) ──────────────────
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# ── Fonction de vérification ─────────────────────────────────────
def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clé API invalide ou manquante"
        )
    return api_key
