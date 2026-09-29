import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

# In-memory SQLite with StaticPool so all connections share the same memory DB
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_get_account_initial():
    response = client.get("/api/account")
    assert response.status_code == 200
    data = response.json()
    assert data["balance"] == 1000.0
    assert data["total_transactions"] == 0
    assert data["account_number"] == "ACC-1001"


def test_deposit():
    response = client.post("/api/account/deposit", json={"amount": 250.50, "description": "Paycheck"})
    assert response.status_code == 200
    data = response.json()
    assert data["balance"] == 1250.50
    assert data["total_transactions"] == 1

    # Check transactions list
    tx_resp = client.get("/api/account/transactions")
    assert tx_resp.status_code == 200
    tx_data = tx_resp.json()
    assert len(tx_data) == 1
    assert tx_data[0]["transaction_type"] == "DEPOSIT"
    assert tx_data[0]["amount"] == 250.50
    assert tx_data[0]["balance_after"] == 1250.50


def test_withdraw_success():
    client.post("/api/account/deposit", json={"amount": 500.0})
    response = client.post("/api/account/withdraw", json={"amount": 200.0, "description": "ATM cash"})
    assert response.status_code == 200
    data = response.json()
    assert data["balance"] == 1300.0
    assert data["total_transactions"] == 2


def test_withdraw_insufficient_funds():
    response = client.post("/api/account/withdraw", json={"amount": 9999.0})
    assert response.status_code == 400
    assert "Insufficient funds" in response.json()["detail"]


def test_calculate_interest_preview_and_apply():
    # Account start balance 1000.0
    # Preview 5% for 365 days -> 50.0 interest
    preview_resp = client.post(
        "/api/account/calculate-interest",
        json={"annual_rate": 5.0, "period_days": 365, "apply_to_account": False}
    )
    assert preview_resp.status_code == 200
    pdata = preview_resp.json()
    assert pdata["calculated_interest"] == 50.0
    assert pdata["projected_balance"] == 1050.0
    assert pdata["current_balance"] == 1000.0  # Unchanged
    assert pdata["total_transactions"] == 0

    # Apply 5% for 365 days
    apply_resp = client.post(
        "/api/account/calculate-interest",
        json={"annual_rate": 5.0, "period_days": 365, "apply_to_account": True}
    )
    assert apply_resp.status_code == 200
    adata = apply_resp.json()
    assert adata["calculated_interest"] == 50.0
    assert adata["current_balance"] == 1050.0
    assert adata["total_transactions"] == 1
