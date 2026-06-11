def _setup(client, staff_headers):
    cat = client.post("/api/menu/categories", json={"name":"Супы"}, headers=staff_headers).json()
    dish = client.post("/api/menu/dishes", headers=staff_headers, json={"name":"Борщ","price":100.0,"category_id":cat["id"]}).json()
    slot = client.post("/api/orders/slots", headers=staff_headers, json={"date":"2026-12-15","time_start":"12:00","time_end":"12:30","max_orders":10}).json()
    return dish, slot

def test_create_order(client, auth_headers, staff_headers):
    dish, slot = _setup(client, staff_headers)
    r = client.post("/api/orders", headers=auth_headers, json={"slot_id":slot["id"],"items":[{"dish_id":dish["id"],"quantity":2}]})
    assert r.status_code == 201
    assert r.json()["total_price"] == 200.0

def test_cancel_order(client, auth_headers, staff_headers):
    dish, slot = _setup(client, staff_headers)
    order = client.post("/api/orders", headers=auth_headers, json={"slot_id":slot["id"],"items":[{"dish_id":dish["id"],"quantity":1}]}).json()
    r = client.delete(f"/api/orders/{order['id']}", headers=auth_headers)
    assert r.json()["status"] == "cancelled"

def test_slot_full(client, auth_headers, staff_headers):
    cat = client.post("/api/menu/categories", json={"name":"X"}, headers=staff_headers).json()
    dish = client.post("/api/menu/dishes", headers=staff_headers, json={"name":"D","price":50.0,"category_id":cat["id"]}).json()
    slot = client.post("/api/orders/slots", headers=staff_headers, json={"date":"2026-12-16","time_start":"13:00","time_end":"13:30","max_orders":1}).json()
    client.post("/api/orders", headers=auth_headers, json={"slot_id":slot["id"],"items":[{"dish_id":dish["id"],"quantity":1}]})
    r = client.post("/api/orders", headers=auth_headers, json={"slot_id":slot["id"],"items":[{"dish_id":dish["id"],"quantity":1}]})
    assert r.status_code == 400

def test_all_orders_forbidden_for_student(client, auth_headers):
    assert client.get("/api/orders/all", headers=auth_headers).status_code == 403