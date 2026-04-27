import json
import pytest
from tests.conftest import TestingSessionLocal
from models import User
from auth import hash_password, create_token


def _make_user_and_token(username: str = "alice") -> tuple[str, str]:
    db = TestingSessionLocal()
    try:
        user = User(username=username, hashed_password=hash_password("password"))
        db.add(user)
        db.commit()
        db.refresh(user)
        return username, create_token(user.id)
    finally:
        db.close()


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


SAMPLE_STATE = json.dumps({"fields": {"governing_law": "California"}, "partyA": None, "partyB": None})


class TestListDocuments:
    def test_requires_auth(self, client):
        res = client.get("/api/documents")
        assert res.status_code == 401

    def test_empty_list_for_new_user(self, client):
        _, token = _make_user_and_token()
        res = client.get("/api/documents", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json() == []

    def test_only_returns_own_documents(self, client):
        _, t1 = _make_user_and_token("user1")
        _, t2 = _make_user_and_token("user2")

        client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "User1 Doc", "state_json": SAMPLE_STATE},
            headers=auth_headers(t1),
        )

        res = client.get("/api/documents", headers=auth_headers(t2))
        assert res.json() == []


class TestCreateDocument:
    def test_creates_document_and_returns_it(self, client):
        _, token = _make_user_and_token()
        res = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "ACME NDA", "state_json": SAMPLE_STATE},
            headers=auth_headers(token),
        )
        assert res.status_code == 201
        data = res.json()
        assert data["id"] > 0
        assert data["doc_type_id"] == "mutual-nda"
        assert data["title"] == "ACME NDA"
        assert data["state_json"] == SAMPLE_STATE
        assert "created_at" in data
        assert "updated_at" in data

    def test_requires_auth(self, client):
        res = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "Test", "state_json": "{}"},
        )
        assert res.status_code == 401

    def test_document_appears_in_list(self, client):
        _, token = _make_user_and_token()
        client.post(
            "/api/documents",
            json={"doc_type_id": "csa", "title": "My CSA", "state_json": "{}"},
            headers=auth_headers(token),
        )
        res = client.get("/api/documents", headers=auth_headers(token))
        docs = res.json()
        assert len(docs) == 1
        assert docs[0]["title"] == "My CSA"


class TestGetDocument:
    def test_returns_document_by_id(self, client):
        _, token = _make_user_and_token()
        created = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "NDA", "state_json": SAMPLE_STATE},
            headers=auth_headers(token),
        ).json()

        res = client.get(f"/api/documents/{created['id']}", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json()["id"] == created["id"]

    def test_returns_404_for_other_users_document(self, client):
        _, t1 = _make_user_and_token("u1")
        _, t2 = _make_user_and_token("u2")

        created = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "NDA", "state_json": "{}"},
            headers=auth_headers(t1),
        ).json()

        res = client.get(f"/api/documents/{created['id']}", headers=auth_headers(t2))
        assert res.status_code == 404

    def test_returns_404_for_missing_document(self, client):
        _, token = _make_user_and_token()
        res = client.get("/api/documents/99999", headers=auth_headers(token))
        assert res.status_code == 404


class TestUpdateDocument:
    def test_updates_title_and_state(self, client):
        _, token = _make_user_and_token()
        created = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "Old Title", "state_json": "{}"},
            headers=auth_headers(token),
        ).json()

        new_state = json.dumps({"fields": {"governing_law": "Delaware"}})
        res = client.put(
            f"/api/documents/{created['id']}",
            json={"title": "New Title", "state_json": new_state},
            headers=auth_headers(token),
        )
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "New Title"
        assert data["state_json"] == new_state

    def test_cannot_update_other_users_document(self, client):
        _, t1 = _make_user_and_token("u1")
        _, t2 = _make_user_and_token("u2")

        created = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "NDA", "state_json": "{}"},
            headers=auth_headers(t1),
        ).json()

        res = client.put(
            f"/api/documents/{created['id']}",
            json={"title": "Hacked", "state_json": "{}"},
            headers=auth_headers(t2),
        )
        assert res.status_code == 404


class TestDeleteDocument:
    def test_deletes_document(self, client):
        _, token = _make_user_and_token()
        created = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "ToDelete", "state_json": "{}"},
            headers=auth_headers(token),
        ).json()

        res = client.delete(f"/api/documents/{created['id']}", headers=auth_headers(token))
        assert res.status_code == 204

        # Confirm it's gone
        res2 = client.get(f"/api/documents/{created['id']}", headers=auth_headers(token))
        assert res2.status_code == 404

    def test_cannot_delete_other_users_document(self, client):
        _, t1 = _make_user_and_token("u1")
        _, t2 = _make_user_and_token("u2")

        created = client.post(
            "/api/documents",
            json={"doc_type_id": "mutual-nda", "title": "NDA", "state_json": "{}"},
            headers=auth_headers(t1),
        ).json()

        res = client.delete(f"/api/documents/{created['id']}", headers=auth_headers(t2))
        assert res.status_code == 404

    def test_returns_404_for_missing(self, client):
        _, token = _make_user_and_token()
        res = client.delete("/api/documents/99999", headers=auth_headers(token))
        assert res.status_code == 404
