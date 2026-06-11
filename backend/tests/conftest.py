import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSession()
    try: yield db
    finally: db.close()

@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c: yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def registered_user(client):
    r = client.post("/api/auth/register", json={"email":"student@uni.ru","full_name":"Test","password":"secret123"})
    return r.json()

@pytest.fixture
def auth_headers(client, registered_user):
    r = client.post("/api/auth/login", data={"username":"student@uni.ru","password":"secret123"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

@pytest.fixture
def staff_headers(client):
    db = next(override_get_db())
    from app.repositories.user_repository import UserRepository
    from app.models.user import UserRole
    UserRepository(db).create("staff@uni.ru","Staff","staffpass",role=UserRole.STAFF)
    db.close()
    r = client.post("/api/auth/login", data={"username":"staff@uni.ru","password":"staffpass"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}