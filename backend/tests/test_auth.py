import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import SessionLocal, UserModel

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_test_users():
    db = SessionLocal()
    try:
        db.query(UserModel).filter(UserModel.email.like("%test%@landnova.io")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()
    yield
    db = SessionLocal()
    try:
        db.query(UserModel).filter(UserModel.email.like("%test%@landnova.io")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

def test_signup_success():
    res = client.post("/api/auth/signup", json={
        "email": "test_user_1@landnova.io",
        "password": "Password123!",
        "full_name": "Arjun Sharma",
        "role": "buyer",
        "phone": "+91 98765 43210"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test_user_1@landnova.io"
    assert data["user"]["full_name"] == "Arjun Sharma"
    assert data["user"]["role"] == "buyer"

def test_signup_duplicate_email():
    payload = {
        "email": "test_dup@landnova.io",
        "password": "Password123!",
        "full_name": "Priya Verma",
        "role": "developer"
    }
    res1 = client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]

def test_login_success():
    signup_payload = {
        "email": "test_login@landnova.io",
        "password": "SecurePassword999!",
        "full_name": "Vikram Malhotra",
        "role": "developer"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_res = client.post("/api/auth/login", json={
        "email": "test_login@landnova.io",
        "password": "SecurePassword999!"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Vikram Malhotra"
    assert data["user"]["role"] == "developer"

def test_login_invalid_password():
    signup_payload = {
        "email": "test_wrong_pass@landnova.io",
        "password": "CorrectPassword123!",
        "full_name": "Rahul Mehta"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_res = client.post("/api/auth/login", json={
        "email": "test_wrong_pass@landnova.io",
        "password": "WrongPassword!"
    })
    assert login_res.status_code == 401
    assert "Invalid email or password" in login_res.json()["detail"]

def test_me_endpoint():
    signup_payload = {
        "email": "test_me@landnova.io",
        "password": "Password123!",
        "full_name": "Ananya Sen",
        "role": "buyer"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload)
    token = signup_res.json()["access_token"]

    # Valid token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "test_me@landnova.io"
    assert user_data["full_name"] == "Ananya Sen"

    # Missing token
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

def test_logout_endpoint():
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    assert res.json()["message"] == "Logged out successfully"
