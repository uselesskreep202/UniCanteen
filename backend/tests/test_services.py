from app.core.security import hash_password, verify_password, create_access_token, decode_token

def test_hash_and_verify():
    h = hash_password("mypassword")
    assert verify_password("mypassword", h) is True
    assert verify_password("wrong", h) is False

def test_token():
    token = create_access_token({"sub": "42"})
    assert decode_token(token)["sub"] == "42"

def test_invalid_token():
    assert decode_token("bad.token") == {}