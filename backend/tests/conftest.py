import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.business import Business, BusinessStatus
from app.core.security import get_password_hash, create_access_token

# In-memory SQLite for super-fast, clean isolated tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_admin(db_session: Session) -> User:
    admin = User(
        email="admin@procurex.com",
        hashed_password=get_password_hash("Admin@123456"),
        full_name="ProcureX Administrator",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture
def test_buyer(db_session: Session) -> User:
    buyer = User(
        email="buyer@procurex.com",
        hashed_password=get_password_hash("Buyer@123456"),
        full_name="Regular Buyer",
        role=UserRole.BUYER,
        is_active=True,
    )
    db_session.add(buyer)
    db_session.commit()
    db_session.refresh(buyer)
    return buyer

@pytest.fixture
def admin_token(test_admin: User) -> str:
    return create_access_token(subject=test_admin.id, role=test_admin.role.value)

@pytest.fixture
def buyer_token(test_buyer: User) -> str:
    return create_access_token(subject=test_buyer.id, role=test_buyer.role.value)
