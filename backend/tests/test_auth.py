def test_register(client):
    resp = client.post("/api/auth/register", json={
        "email": "new@uni.ru",
        "full_name": "New User",
        "password": "pass1234",
    })
    assert resp.status_code == 201
    assert resp.json()["email"] == "new@uni.ru"
    assert resp.json()["role"] == "student"


def test_register_duplicate(client, registered_user):
    resp = client.post("/api/auth/register", json={
        "email": "student@uni.ru",
        "full_name": "Dup",
        "password": "pass",
    })
    assert resp.status_code == 400


def test_login(client, registered_user):
    resp = client.post("/api/auth/login", data={"username": "student@uni.ru", "password": "secret123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client, registered_user):
    resp = client.post("/api/auth/login", data={"username": "student@uni.ru", "password": "wrong"})
    assert resp.status_code == 401


def test_me(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "student@uni.ru"


def test_me_no_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
