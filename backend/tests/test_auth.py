def test_register(client):
    r = client.post("/api/auth/register", json={"email":"new@uni.ru","full_name":"New","password":"pass1234"})
    assert r.status_code == 201
    assert r.json()["role"] == "student"

def test_register_duplicate(client, registered_user):
    r = client.post("/api/auth/register", json={"email":"student@uni.ru","full_name":"Dup","password":"pass"})
    assert r.status_code == 400

def test_login(client, registered_user):
    r = client.post("/api/auth/login", data={"username":"student@uni.ru","password":"secret123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_login_wrong_password(client, registered_user):
    assert client.post("/api/auth/login", data={"username":"student@uni.ru","password":"WRONG"}).status_code == 401

def test_me(client, auth_headers):
    r = client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "student@uni.ru"

def test_me_no_token(client):
    assert client.get("/api/auth/me").status_code == 401