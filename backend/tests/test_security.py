def test_no_token(client):
    assert client.get("/api/auth/me").status_code == 401

def test_fake_token(client):
    assert client.get("/api/auth/me", headers={"Authorization":"Bearer fake.token"}).status_code == 401

def test_health_public(client):
    assert client.get("/health").json()["status"] == "ok"

def test_student_cannot_delete_dish(client, auth_headers, staff_headers):
    cat = client.post("/api/menu/categories", json={"name":"X"}, headers=staff_headers).json()
    dish = client.post("/api/menu/dishes", headers=staff_headers, json={"name":"D","price":50.0,"category_id":cat["id"]}).json()
    assert client.delete(f"/api/menu/dishes/{dish['id']}", headers=auth_headers).status_code == 403