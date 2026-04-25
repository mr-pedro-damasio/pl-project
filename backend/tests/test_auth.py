from tests.conftest import TestingSessionLocal


class TestSignup:
    def test_signup_creates_user_and_returns_token(self, client):
        res = client.post("/api/auth/signup", json={"username": "alice", "password": "secret123"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_signup_duplicate_username_returns_400(self, client):
        client.post("/api/auth/signup", json={"username": "bob", "password": "pass1234"})
        res = client.post("/api/auth/signup", json={"username": "bob", "password": "pass5678"})
        assert res.status_code == 400
        assert "already taken" in res.json()["detail"]

    def test_signup_short_password_returns_422(self, client):
        res = client.post("/api/auth/signup", json={"username": "carol", "password": "abc"})
        assert res.status_code == 422


class TestSignin:
    def test_signin_valid_credentials_returns_token(self, client):
        client.post("/api/auth/signup", json={"username": "carol", "password": "mypass1"})
        res = client.post("/api/auth/signin", json={"username": "carol", "password": "mypass1"})
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_signin_wrong_password_returns_401(self, client):
        client.post("/api/auth/signup", json={"username": "dave", "password": "correct1"})
        res = client.post("/api/auth/signin", json={"username": "dave", "password": "wrong123"})
        assert res.status_code == 401

    def test_signin_unknown_user_returns_401(self, client):
        res = client.post("/api/auth/signin", json={"username": "ghost", "password": "anypass1"})
        assert res.status_code == 401


class TestDefaultUser:
    def test_default_user_can_sign_in_after_seeding(self, client):
        from models import User
        from auth import hash_password

        db = TestingSessionLocal()
        try:
            db.add(User(username="user", hashed_password=hash_password("password")))
            db.commit()
        finally:
            db.close()

        res = client.post("/api/auth/signin", json={"username": "user", "password": "password"})
        assert res.status_code == 200
