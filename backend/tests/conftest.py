import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def registered_user(client):
    resp = client.post("/api/auth/register", json={
        "email": "student@uni.ru",
        "full_name": "Test Student",
        "password": "secret123",
    })
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def auth_headers(client, registered_user):
    resp = client.post("/api/auth/login", data={"username": "student@uni.ru", "password": "secret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def staff_headers(client):
    from app.core.database import get_db as orig_get_db
    db = next(override_get_db())
    from app.repositories.user_repository import UserRepository
    from app.models.user import UserRole
    UserRepository(db).create("staff@uni.ru", "Staff User", "staffpass", role=UserRole.STAFF)
    db.close()
    resp = client.post("/api/auth/login", data={"username": "staff@uni.ru", "password": "staffpass"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
