def setup_menu(client, staff_headers):
    cat = client.post("/api/menu/categories", json={"name": "Супы"}, headers=staff_headers).json()
    dish = client.post("/api/menu/dishes", headers=staff_headers, json={
        "name": "Щи", "price": 100.0, "category_id": cat["id"]
    }).json()
    slot = client.post("/api/orders/slots", headers=staff_headers, json={
        "date": "2026-06-15", "time_start": "12:00", "time_end": "12:30", "max_orders": 10
    }).json()
    return dish, slot


def test_create_order(client, auth_headers, staff_headers):
    dish, slot = setup_menu(client, staff_headers)
    resp = client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"],
        "items": [{"dish_id": dish["id"], "quantity": 2}],
        "notes": "без соли",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["total_price"] == 200.0
    assert data["status"] == "pending"


def test_my_orders(client, auth_headers, staff_headers):
    dish, slot = setup_menu(client, staff_headers)
    client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    })
    resp = client.get("/api/orders/my", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_order_slot_full(client, auth_headers, staff_headers):
    cat = client.post("/api/menu/categories", json={"name": "X"}, headers=staff_headers).json()
    dish = client.post("/api/menu/dishes", headers=staff_headers, json={
        "name": "D", "price": 50.0, "category_id": cat["id"]
    }).json()
    slot = client.post("/api/orders/slots", headers=staff_headers, json={
        "date": "2026-06-15", "time_start": "13:00", "time_end": "13:30", "max_orders": 1
    }).json()
    client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    })
    resp = client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    })
    assert resp.status_code == 400


def test_update_order_status(client, auth_headers, staff_headers):
    dish, slot = setup_menu(client, staff_headers)
    order = client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    }).json()
    resp = client.put(f"/api/orders/{order['id']}/status", headers=staff_headers, json={"status": "confirmed"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "confirmed"


def test_cancel_own_order(client, auth_headers, staff_headers):
    dish, slot = setup_menu(client, staff_headers)
    order = client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    }).json()
    resp = client.delete(f"/api/orders/{order['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


def test_cancel_confirmed_order_forbidden(client, auth_headers, staff_headers):
    dish, slot = setup_menu(client, staff_headers)
    order = client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    }).json()
    # Сотрудник подтверждает заказ
    client.put(f"/api/orders/{order['id']}/status", headers=staff_headers, json={"status": "confirmed"})
    # Студент пытается отменить — должна быть ошибка
    resp = client.delete(f"/api/orders/{order['id']}", headers=auth_headers)
    assert resp.status_code == 400


def test_cancel_someone_elses_order_forbidden(client, auth_headers, staff_headers):
    dish, slot = setup_menu(client, staff_headers)
    order = client.post("/api/orders", headers=auth_headers, json={
        "slot_id": slot["id"], "items": [{"dish_id": dish["id"], "quantity": 1}]
    }).json()
    # Другой пользователь пытается отменить чужой заказ
    other = client.post("/api/auth/register", json={
        "email": "other@uni.ru", "full_name": "Other", "password": "pass123"
    })
    other_token = client.post("/api/auth/login", data={"username": "other@uni.ru", "password": "pass123"}).json()["access_token"]
    resp = client.delete(f"/api/orders/{order['id']}", headers={"Authorization": f"Bearer {other_token}"})
    assert resp.status_code == 403


def test_get_slots(client, staff_headers):
    client.post("/api/orders/slots", headers=staff_headers, json={
        "date": "2026-06-15", "time_start": "11:00", "time_end": "11:30", "max_orders": 5
    })
    resp = client.get("/api/orders/slots")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1
