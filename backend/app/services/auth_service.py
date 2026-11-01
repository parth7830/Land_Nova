import hashlib
import hmac
import os
import uuid
import json
import base64
import time
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import UserModel
from app.schemas.auth import UserSignupRequest, UserLoginRequest
from app.core.config import settings

# Secret key for HMAC token signing
AUTH_SECRET = getattr(settings, "SECRET_KEY", "landnova-auth-secret-key-production-2026")
TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7  # 7 days

def hash_password(password: str) -> str:
    """
    Cryptographically secure password hashing using PBKDF2-HMAC-SHA256 with random salt.
    """
    salt = os.urandom(16)
    iterations = 260000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${derived.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against stored PBKDF2 hash using constant-time comparison.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        expected_hash = parts[3]

        derived = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(derived.hex(), expected_hash)
    except Exception:
        return False

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    """
    Generate an HMAC-SHA256 signed access token.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS,
        "iat": int(time.time()),
    }

    header_b64 = _b64encode(json.dumps(header).encode("utf-8"))
    payload_b64 = _b64encode(json.dumps(payload).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

    signature = hmac.new(AUTH_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify HMAC-SHA256 signed token and return payload if valid and not expired.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(AUTH_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()

        if not hmac.compare_digest(_b64encode(expected_sig), sig_b64):
            return None

        payload = json.loads(_b64decode(payload_b64).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None

def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email.strip().lower()).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def create_user(db: Session, req: UserSignupRequest) -> UserModel:
    normalized_email = req.email.strip().lower()
    user = UserModel(
        id=str(uuid.uuid4()),
        email=normalized_email,
        full_name=req.full_name.strip(),
        password_hash=hash_password(req.password),
        role=req.role.strip().lower() if req.role else "buyer",
        organization=req.organization.strip() if req.organization else None,
        phone=req.phone.strip() if req.phone else None,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, req: UserLoginRequest) -> Optional[UserModel]:
    normalized_email = req.email.strip().lower()
    user = get_user_by_email(db, normalized_email)
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(req.password, user.password_hash):
        return None
    return user
