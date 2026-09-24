import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.business import Business, BusinessStatus
from app.models.audit_log import AuditLog

def test_login_success_admin(client: TestClient, test_admin: User):
    """Admin logs in successfully with valid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@procurex.com", "password": "Admin@123456"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@procurex.com"
    assert data["user"]["role"] == "admin"

def test_login_invalid_password(client: TestClient, test_admin: User):
    """Login fails when given invalid password."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@procurex.com", "password": "WrongPassword123"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_nonexistent_user(client: TestClient):
    """Login fails when user does not exist."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@procurex.com", "password": "SomePassword123"}
    )
    assert response.status_code == 401

def test_admin_guard_unauthenticated(client: TestClient):
    """Unauthenticated requests to /admin are rejected with 401."""
    response = client.get("/api/v1/admin/dashboard-stats")
    assert response.status_code == 401

def test_admin_guard_non_admin_forbidden(client: TestClient, buyer_token: str):
    """Non-admin users attempting to access /admin routes receive 403 Forbidden."""
    headers = {"Authorization": f"Bearer {buyer_token}"}
    response = client.get("/api/v1/admin/dashboard-stats", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Admin privileges required"

def test_admin_guard_success(client: TestClient, admin_token: str):
    """Admin user with valid token can access /admin routes."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/v1/admin/dashboard-stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "businesses" in data
    assert "complaints" in data

def test_admin_verify_business_and_creates_audit_log(
    client: TestClient,
    admin_token: str,
    db_session: Session
):
    """
    ProcureX Rules:
    1. Admin route under /admin with require_admin
    2. Every admin write action must create an AuditLog row
    """
    # Create a pending business
    business = Business(
        name="Test Manufacturing Ltd",
        business_type="Manufacturer",
        status=BusinessStatus.PENDING,
        gst_no="27AAACB1234F1Z9",
        address="MIDC Industrial Area, Pune",
    )
    db_session.add(business)
    db_session.commit()
    db_session.refresh(business)

    headers = {"Authorization": f"Bearer {admin_token}"}
    verify_payload = {
        "status": "verified"
    }

    response = client.post(
        f"/api/v1/admin/businesses/{business.id}/verify",
        json=verify_payload,
        headers=headers
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "verified"
    assert res_data["verified_by"] is not None

    # Verify AuditLog was created according to ProcureX rules
    audit_entry = db_session.query(AuditLog).filter(
        AuditLog.target_id == str(business.id),
        AuditLog.action == "BUSINESS_VERIFIED"
    ).first()
    assert audit_entry is not None
    assert audit_entry.target_type == "business"
    assert audit_entry.details["business_name"] == "Test Manufacturing Ltd"
