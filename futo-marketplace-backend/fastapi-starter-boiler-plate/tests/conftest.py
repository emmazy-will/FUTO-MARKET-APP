import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.core.config import settings
from app.core.dependencies import get_current_user, get_current_verified_user
from app.models.orm_models import User

TEST_DB_URL = settings.DATABASE_URL.replace("/futo_marketplace", "/futo_marketplace_test")
engine = create_engine(TEST_DB_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

mock_celery_task = MagicMock()
mock_celery_task.delay = MagicMock(return_value=None)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_test_buyer():
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "buyer@test.com").first()
    db.close()
    return user


def get_test_seller():
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "seller@test.com").first()
    db.close()
    return user


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client(setup_test_env):
    with patch("app.core.cache.cache_get", return_value=None), \
         patch("app.core.cache.cache_set", return_value=None), \
         patch("app.core.cache.cache_delete_pattern", return_value=None), \
         patch("app.core.cache.redis_client"):
        with TestClient(app) as c:
            yield c


@pytest.fixture(scope="session")
def register_users(client):
    with patch("app.api.v1.endpoints.auth.send_verification_email_task", mock_celery_task):
        res = client.post("/api/v1/auth/register", json={
            "email": "buyer@test.com",
            "name": "Test Buyer",
            "username": "testbuyer",
            "password": "testpass123",
            "role": "buyer"
        })
    assert res.status_code == 201, f"Buyer register failed: {res.text}"
    client.post("/api/v1/auth/verify-email", json={
        "email": "buyer@test.com",
        "otp": res.json()["data"]["otp"]
    })

    with patch("app.api.v1.endpoints.auth.send_verification_email_task", mock_celery_task):
        res = client.post("/api/v1/auth/register", json={
            "email": "seller@test.com",
            "name": "Test Seller",
            "username": "testseller",
            "password": "testpass123",
            "role": "seller"
        })
    assert res.status_code == 201, f"Seller register failed: {res.text}"
    client.post("/api/v1/auth/verify-email", json={
        "email": "seller@test.com",
        "otp": res.json()["data"]["otp"]
    })


@pytest.fixture(scope="module")
def buyer_client(client, register_users):
    app.dependency_overrides[get_current_user] = get_test_buyer
    app.dependency_overrides[get_current_verified_user] = get_test_buyer
    yield client
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_current_verified_user, None)


@pytest.fixture(scope="module")
def seller_client(client, register_users):
    app.dependency_overrides[get_current_user] = get_test_seller
    app.dependency_overrides[get_current_verified_user] = get_test_seller
    yield client
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_current_verified_user, None)