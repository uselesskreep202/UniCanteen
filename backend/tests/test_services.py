from app.core.security import hash_password, verify_password, create_access_token, decode_token


def test_password_hashing():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed)
    assert not verify_password("wrongpassword", hashed)


def test_token_roundtrip():
    token = create_access_token({"sub": "42"})
    payload = decode_token(token)
    assert payload["sub"] == "42"


def test_invalid_token():
    payload = decode_token("notavalidtoken")
    assert payload == {}
