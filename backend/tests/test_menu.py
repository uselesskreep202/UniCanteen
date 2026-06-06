def _create_category(client, staff_headers, name="Первые блюда"):
    resp = client.post("/api/menu/categories", json={"name": name}, headers=staff_headers)
    assert resp.status_code == 201
    return resp.json()


def _create_dish(client, staff_headers, category_id):
    resp = client.post("/api/menu/dishes", headers=staff_headers, json={
        "name": "Борщ",
        "description": "Украинский борщ",
        "price": 120.0,
        "category_id": category_id,
    })
    assert resp.status_code == 201
    return resp.json()


def test_get_categories_empty(client):
    resp = client.get("/api/menu/categories")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_category(client, staff_headers):
    cat = _create_category(client, staff_headers)
    assert cat["name"] == "Первые блюда"


def test_create_category_forbidden(client, auth_headers):
    resp = client.post("/api/menu/categories", json={"name": "X"}, headers=auth_headers)
    assert resp.status_code == 403


def test_create_and_get_dish(client, staff_headers):
    cat = _create_category(client, staff_headers)
    dish = _create_dish(client, staff_headers, cat["id"])
    assert dish["name"] == "Борщ"
    assert dish["price"] == 120.0

    resp = client.get("/api/menu/dishes")
    assert len(resp.json()) == 1


def test_update_dish(client, staff_headers):
    cat = _create_category(client, staff_headers)
    dish = _create_dish(client, staff_headers, cat["id"])
    resp = client.put(f"/api/menu/dishes/{dish['id']}", json={"price": 150.0}, headers=staff_headers)
    assert resp.status_code == 200
    assert resp.json()["price"] == 150.0


def test_delete_dish(client, staff_headers):
    cat = _create_category(client, staff_headers)
    dish = _create_dish(client, staff_headers, cat["id"])
    resp = client.delete(f"/api/menu/dishes/{dish['id']}", headers=staff_headers)
    assert resp.status_code == 204
    assert client.get("/api/menu/dishes").json() == []


def test_get_dish_not_found(client):
    resp = client.get("/api/menu/dishes/999")
    assert resp.status_code == 404
