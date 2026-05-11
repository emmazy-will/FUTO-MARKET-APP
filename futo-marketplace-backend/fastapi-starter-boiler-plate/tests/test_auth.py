from unittest.mock import patch, MagicMock

mock_task = MagicMock()
mock_task.delay = MagicMock(return_value=None)


def test_register_success(client):
    with patch("app.api.v1.endpoints.auth.send_verification_email_task", mock_task):
        res = client.post("/api/v1/auth/register", json={
            "email": "newuser@test.com",
            "name": "New User",
            "username": "newuser99",
            "password": "pass1234",
            "role": "buyer"
        })
    assert res.status_code == 201
    assert res.json()["success"] is True
    assert "otp" in res.json()["data"]


def test_register_duplicate_email(client):
    with patch("app.api.v1.endpoints.auth.send_verification_email_task", mock_task):
        res = client.post("/api/v1/auth/register", json={
            "email": "newuser@test.com",
            "name": "Dup",
            "username": "dupuser99",
            "password": "pass1234",
            "role": "buyer"
        })
    assert res.status_code == 400


def test_login_wrong_password(client, register_users):
    res = client.post("/api/v1/auth/login", data={
        "username": "buyer@test.com",
        "password": "wrongpass"
    })
    assert res.status_code == 400


def test_login_success(client, register_users):
    res = client.post("/api/v1/auth/login", data={
        "username": "buyer@test.com",
        "password": "testpass123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.json()


def test_get_me(buyer_client):
    res = buyer_client.get("/api/v1/auth/me")
    assert res.status_code == 200
    assert res.json()["data"]["email"] == "buyer@test.com"


def test_forgot_password(client, register_users):
    with patch("app.api.v1.endpoints.auth.send_password_reset_email",
               return_value=None):
        res = client.post("/api/v1/auth/forgot-password",
                          json={"email": "buyer@test.com"})
    assert res.status_code == 200
    assert res.json()["success"] is True