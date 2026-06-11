def test_categories_empty(client):
    assert client.get("/api/menu/categories").json() == []

def test_create_category(client, staff_headers):
    r = client.post("/api/menu/categories", json={"name":"Супы"}, headers=staff_headers)
    assert r.status_code == 201

def test_student_cannot_create_category(client, auth_headers):
    assert client.post("/api/menu/categories", json={"name":"X"}, headers=auth_headers).status_code == 403

def test_create_and_delete_dish(client, staff_headers):
    cat = client.post("/api/menu/categories", json={"name":"Супы"}, headers=staff_headers).json()
    dish = client.post("/api/menu/dishes", headers=staff_headers, json={"name":"Борщ","price":120.0,"category_id":cat["id"]}).json()
    assert dish["name"] == "Борщ"
    assert client.delete(f"/api/menu/dishes/{dish['id']}", headers=staff_headers).status_code == 204

def test_dish_not_found(client):
    assert client.get("/api/menu/dishes/999").status_code == 404